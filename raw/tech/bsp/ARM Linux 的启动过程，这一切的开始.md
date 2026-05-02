---
title: "ARM Linux 的启动过程，这一切的开始"
source: "https://zhuanlan.zhihu.com/p/400519353"
author:
  - "[[老吴嵌入式]]"
published:
created: 2026-05-02
description: "大家好，我是老吴。 今天继续跟大家分享 linus 的文章， 文章有点长，都是 linus 的锅。 我的翻译策略是这样： 不会一字一句翻译，会改变表达方式， 会简化代码分析，必要的地方会使用英文术语。 水平有限，建议搭…"
tags:
  - "clippings"
---
[收录于 · Linux内核品读](https://www.zhihu.com/column/c_1287649322201272320)

6 人赞同了该文章

大家好，我是老吴。

今天继续跟大家分享 [linus](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=linus&zhida_source=entity) 的文章，

文章有点长，都是 linus 的锅。

我的翻译策略是这样：

不会一字一句翻译，会改变表达方式，

会简化代码分析，必要的地方会使用英文术语。

水平有限，建议搭配原文阅读。

---

本文将讨论 ARM Linux 内核在自解压后，如何在物理内存中执行自引导，直到能够在虚拟内存中执行用 C 编写的通用内核代码。这里默认你是了解一点 ARM [汇编语言](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E6%B1%87%E7%BC%96%E8%AF%AD%E8%A8%80&zhida_source=entity) 和 Linux 内核基础知识的。

## 这一切的开始

ARM Linux 内核在自解压并处理完设备树的更新后，会将程序计数器 pc 设置为 stext() 的 [物理地址](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E7%89%A9%E7%90%86%E5%9C%B0%E5%9D%80&zhida_source=entity) ，这里是内核的代码段。这段代码可以在 arch/arm/kernel/head.S 中找到。

```
arch/arm/kernel/head.S

/*
 * Kernel startup entry point.
 * ---------------------------
 *
 * This is normally called from the decompressor code.  The requirements
 * are: MMU = off, D-cache = off, I-cache = dont care, r0 = 0,
 * r1 = machine nr, r2 = atags or dtb pointer.
 *
    [...]
    __HEAD
ENTRY(stext)
    [...]
```

\_\_HEAD 是定义在链接脚本里的一个宏：section:".head.text"。

通过查看 ARM [体系结构](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E4%BD%93%E7%B3%BB%E7%BB%93%E6%9E%84&zhida_source=entity) 的链接脚本 arch/arm/kernel/vmlinux.lds.S，可以知道这个宏会将 [目标代码](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E7%9B%AE%E6%A0%87%E4%BB%A3%E7%A0%81&zhida_source=entity) 放置在内核最开始的位置。

这个位置对应的物理地址为：16MB 的倍数 + TEXT\_OFFSET (32KB)。例如，你可能会在 0x10008000 之类的地址处找到 stext()，后面的示例会基于这个假设的地址进行分析。

head.S 包含了一些针对不同的旧 ARM 平台的特殊处理代码，这使得我们很难从抓住程序的主干。ATAG 和 [设备树](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=2&q=%E8%AE%BE%E5%A4%87%E6%A0%91&zhida_source=entity) 的标准是后来才出现的，所以这些特殊代码多年来变得越来越复杂。

要理解后续的内容，你需要对分页虚拟内存 (paged virtual memory) 有基本的了解。如果维基百科过于简洁，请参阅 Hennesy & Patterson 的书：Computer Architecture: A Quantitative Approach。这里默认你是了解一点 ARM 汇编语言和 Linux 内核基础知识的。

## 虚拟内存的划分

首先，让我们先弄清楚内核是在虚拟内存中哪个地址开始执行的。内核的虚拟内存基地址 (kernel RAM base) 由 PAGE\_OFFSET 决定，你可以对其进行配置。从名字上理解 PAGE\_OFFSET：first page of kernel RAM 在 [虚拟内存](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=6&q=%E8%99%9A%E6%8B%9F%E5%86%85%E5%AD%98&zhida_source=entity) 中的偏移位置。

你可以从 4 种内存划分方案中选择其中 1 个，这让我想起了快餐店的餐牌。目前在 arch/arm/Kconfig 中是这样定义的：

```
config PAGE_OFFSET
    hex
    default PHYS_OFFSET if !MMU
    default 0x40000000 if VMSPLIT_1G
    default 0x80000000 if VMSPLIT_2G
    default 0xB0000000 if VMSPLIT_3G_OPT
    default 0xC0000000
```

注意，如果芯片没有 MMU (例如在 ARM Cortex-R 类设备或旧的 ARM7 芯片上运行时)，内核将在物理和虚拟内存之间创建 1:1 映射。然后页表将仅用于填充缓存并且地址不会被重写。这种情况下，PAGE\_OFFSET 的典型值就是 0x00000000。没有使用虚拟内存的 Linux 内核被称为“uClinux”，在合并在 [主线内核](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E4%B8%BB%E7%BA%BF%E5%86%85%E6%A0%B8&zhida_source=entity) 之前，多年来它都是 Linux 内核的一个分支。

在使用 Linux 或任何 POSIX 类型的系统时，不使用虚拟内存被认为是一种怪异的行为。因此，从现在开始，我们只考虑使用虚拟内存的情况。

**PAGE\_OFFSET，即 virtual memory split symbol，在其上方的地址处创建一个虚拟内存空间，供内核驻留** 。内核将其所有代码、状态和 [数据结构](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84&zhida_source=entity) (包括虚拟到物理内存转换表，即 page table) 都保存在这一区域的虚拟内存中：

```
0x40000000-0xFFFFFFFF

0x80000000-0xFFFFFFFF

0xB0000000-0xFFFFFFFF

0xC0000000-0xFFFFFFFF
```

这 4 种不同大小的内核空间里，0xC0000000-0xFFFFFFFF 是迄今为止最常见的。这种方式下，内核有 1GB 的 [地址空间](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E5%9C%B0%E5%9D%80%E7%A9%BA%E9%97%B4&zhida_source=entity) 可供使用。

**内核下方的 [虚拟内存空间](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=2&q=%E8%99%9A%E6%8B%9F%E5%86%85%E5%AD%98%E7%A9%BA%E9%97%B4&zhida_source=entity) ，从 0x00000000-PAGE\_OFFSET-1，即通常地址 0x00000000-0xBFFFFFFF (3 GB) 用于用户空间代码** 。这意味着您可以乐观地为程序提供比可用物理内存更多的虚拟内存空间，这种做法被称为 overcommit。每次启动一个新的用户空间进程时，它都认为它有 3 GB 的内存可以使用！ [overcommit](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=2&q=overcommit&zhida_source=entity) 一直是 Unix 系统自 1970 年代诞生以来的一个特征。

**为什么有四种不同的划分方式？**

答案很明显：ARM 大量用于 [嵌入式系统](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E5%B5%8C%E5%85%A5%E5%BC%8F%E7%B3%BB%E7%BB%9F&zhida_source=entity) ，这些系统可以是用户空间密集型 (例如普通平板电脑或手机，甚至台式计算机) 或内核空间密集型 (例如路由器)。大多数系统都是用户空间密集型，或物理内存太小以至于拆分并不重要，因此最常见方式是 PAGE\_OFFSET = 0xC0000000。

![](https://pic2.zhimg.com/v2-81a4feccfd44004c4645aaccc51abd33_1440w.jpg)

**关于这些插图的注意事项** ：当我说内存“高于”某物时，我的意思是图片中的较低位置，沿着箭头，朝向更高的地址。我知道有些人认为这是不合逻辑的，并将数字倒置，顶部为 0xFFFFFFFF，但这是我个人的偏好，也是大多数硬件手册中使用的约定。

当你有足够大的内存和并且应用场景是内核密集型，例如大容量的内存 (例如 4GB 内存) 路由器或 NAS 的话，如果你希望内核能够将其中一些内存用于 page cache 和 network cache 以提升系统的性能，可以选择更大的内核空间，例如在极端情况下：PAGE\_OFFSET = 0x40000000。

**内核空间的映射会一直存在，即便是内核正在执行用户空间代码时也是如此** 。这个想法是这样的，通过保持内核空间永久映射，从用户空间到内核空间的 [上下文切换](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E4%B8%8A%E4%B8%8B%E6%96%87%E5%88%87%E6%8D%A2&zhida_source=entity) 会变得非常快：当用户空间进程想要向内核询问某些东西时，不需要替换任何页表。只需发出一个软中断 (software trap) 来切换到 [特权模式](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E7%89%B9%E6%9D%83%E6%A8%A1%E5%BC%8F&zhida_source=entity) (supervisor mode) 并执行内核代码，无需改动虚拟内存相关的设置。

**不同用户空间的进程之间的上下文切换也变得更快** ：你只需要替换页表的较低部分。内核空间的映射通常很简单，它映射的是预先确定的物理内存块并且是 [线性映射](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E7%BA%BF%E6%80%A7%E6%98%A0%E5%B0%84&zhida_source=entity) ，甚至存储在一个特殊的地方：translation lookaside buffer，从而能更快地进入内核空间。 [内核空间](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=9&q=%E5%86%85%E6%A0%B8%E7%A9%BA%E9%97%B4&zhida_source=entity) 的地址总是存在的，并且总是线性映射，永远不会产生 page fault。

## 目前我们是在哪里运行？

我们继续查看 arch/arm/ [kernel](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=6&q=kernel&zhida_source=entity) /head.S 里的 stext()。

下一步是处理我们目前正在内存的某个未知位置运行的事实。内核可以被加载到任何地址（只要它是一个合理的偶数地址）并直接执行，所以现在我们需要处理它。由于内核代码不是位置无关的，它在编译后被 [链接器](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E9%93%BE%E6%8E%A5%E5%99%A8&zhida_source=entity) 链接到某个地址处执行，而我们还不知道是哪个地址。

内核首先检查一些特殊功能，如虚拟化扩展和 LPAE（大型 [物理地址扩展](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E7%89%A9%E7%90%86%E5%9C%B0%E5%9D%80%E6%89%A9%E5%B1%95&zhida_source=entity) ），然后做了下面这件事：

```
arch/arm/kernel/head.S

    adr        r3, 2f
    ldmia      r3, {r4, r8}
    sub        r4, r3, r4            @ (PHYS_OFFSET - PAGE_OFFSET)
    add        r8, r8, r4            @ PHYS_OFFSET
    [...]

2:  .long        .
    .long      PAGE_OFFSET
```

.long. 是在链接的时候就分配给 lable 2 的地址，也就是说我们可以通过 label 2 获得其链接地址，这个地址属于内核空间，一般在 0xC0000000 之上的某个位置。

之后是常量 PAGE\_OFFSET，它大概率是 0xC0000000。

其余的几行汇编代码是在通过 lable 2 的运行地址和链接地址相减的方式来推算出物理内存的起始偏移(PHYS\_OFFSET)，将其保存在 r8 中，假设其值为0x10000000。

旧的 ARM 内核有一个名为 PLAT\_PHYS\_OFFSET 的符号，它包含这个偏移量，这是在编译时时指定的。我们现在不再这样做了，正如我们前面看到的那样，动态地计算出来。如果您使用的 [操作系统](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F&zhida_source=entity) 不如 Linux 那么成熟，您会发现开发人员通常就会在编译时指定，使事情变得简单些：物理内存的起始偏移量是一个常数。Linux 发展成现在这样，是因为我们需要在各种内存布局上处理单个 [内核映像](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E5%86%85%E6%A0%B8%E6%98%A0%E5%83%8F&zhida_source=entity) 的启动。

![](https://pic1.zhimg.com/v2-2bcbee050004077c6f2e3a220e461bba_1440w.jpg)

物理内存到虚拟内存映射。

**一些关于 PHYS\_OFFSET 的规定：** 它需要遵守一些基本的对齐要求。当我们要确定第一个 [物理内存](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=9&q=%E7%89%A9%E7%90%86%E5%86%85%E5%AD%98&zhida_source=entity) 块的位置时，是通过执行 PHYS = pc & 0xF8000000 来确定的，这意味着物理内存必须是 128 MB 对齐。例如，如果它从 0x00000000 开始，那就太好了。

当内核是以 XIP “execute in place” 的方式执行时，就需要有有一些特殊的考虑，但我们把这种情况放在一边，这是另一个奇怪的地方，甚至比不使用虚拟内存更不常见。

请注意另一件事：你可能尝试加载未压缩的内核并启动它，然后发现内核对放置它的位置特别挑剔。此时，你最好将其加载到 0x00008000 或 0x10008000 之类的物理地址（假设你的 TEXT\_OFFSET 是 0x8000 ）。如果你使用 [压缩内核](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E5%8E%8B%E7%BC%A9%E5%86%85%E6%A0%B8&zhida_source=entity) ，则可以避免此问题，因为 [解压缩器](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E8%A7%A3%E5%8E%8B%E7%BC%A9%E5%99%A8&zhida_source=entity) 会将内核解压缩到合适的位置（通常为 0x00008000）并为你解决此问题。这正是人们觉得压缩内核正常工作是一种常态的另一个原因。

## 给 P2V 打补丁 (Patching Physical to Virtual)

现在我们有了运行时应处于的虚拟 [内存地址](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E5%9C%B0%E5%9D%80&zhida_source=entity) 和实际执行时的物理内存地址之间的偏移量 (PHYS\_OFFSET - PAGE\_OFFSET)，接下来我们第一个要处理的东西就是 CONFIG\_ARM\_PATCH\_PHYS\_VIRT。

创建此符号是因为内核开发者想实现这样的功能：无需重新编译，也能让同一个内核在不同内存配置的系统上启动。内核被编译成在某个 [虚拟地址](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E8%99%9A%E6%8B%9F%E5%9C%B0%E5%9D%80&zhida_source=entity) 处执行，例如 0xC0000000，但是仍然可以被加载到物理内存 0x10000000 处，或者在 0x40000000 处，或其他某个地址处去执行。

内核中的大多数符号是不需要我们额外关心的：它们运行时的地址就是其链接时的虚拟地址上，即 0xC0000000 之后的那些地址。但是现在我们不是在编写用户空间的程序，事情没那么容易。我们必须知道我们正在执行的物理内存，因为我们是内核，这意味着我们需要在页表中设置物理到虚拟的 [映射](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=9&q=%E6%98%A0%E5%B0%84&zhida_source=entity) ，并定期更新这些页表。

内核不知道自己将在物理内存中的哪个位置运行，而我们也不能依赖任何廉价的技巧，例如 [编译时常量](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E7%BC%96%E8%AF%91%E6%97%B6%E5%B8%B8%E9%87%8F&zhida_source=entity) ，这是作弊，那会创建难以维护的充满 [幻数](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E5%B9%BB%E6%95%B0&zhida_source=entity) 的代码。

**为了在物理地址和虚拟地址之间转换，内核有两个函数：\_\_virt\_to\_phys() 和 \_\_phys\_to\_virt() 用于互相转换内核地址** (不会用于非内核地址)。

这种转换在内存空间中是线性的，可以通过简单的加法或减法来实现。这就是我们正要做的事情，我们给它起了个名字叫 “P2V runtime patching”。该方案由 Nicolas Pitre、Eric Miao 和 Russell King 在 2011 年发明，2013 年 Santosh Shilimkar 将该方案扩展到适用于 LPAE 系统，特别是 TI Keystone SoC。

```
PHY = VIRT + (PHYS_OFFSET – PAGE_OFFSET)
VIRT = PHY – (PHYS_OFFSET – PAGE_OFFSET)
```

具体地实现类似于：

```
static inline unsigned long __virt_to_phys(unsigned long x)
{
    unsigned long t;
    __pv_stub(x, t, "add");
    return t;
}

static inline unsigned long __phys_to_virt(unsigned long x)
{
    unsigned long t;
    __pv_stub(x, t, "sub");
    return t;
}
```

\_\_pv\_stub() 是用汇编实现加减操作的宏。LPAE 对超过 32 位地址的支持使此代码变得更加复杂，但总体思路是相同的。

每当在内核中调用 \_\_virt\_to\_phys() 或 \_\_phys\_to\_virt() 时，它都会被替换为来自 arch/arm/include/asm/memory.h 的一段 [内联汇编](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E5%86%85%E8%81%94%E6%B1%87%E7%BC%96&zhida_source=entity) 代码，然后链接器会换到名为.pv\_table 的 section，然后向该 section 里添加一个条目，条目的内容是一个指针，它指向前面提到的 [汇编代码](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=3&q=%E6%B1%87%E7%BC%96%E4%BB%A3%E7%A0%81&zhida_source=entity) 。这意味着.pv\_table section 其实就是一个表，里面的每一个条目都是一个指针，每个指针都指向内核调用了 \_\_virt\_to\_phys() 或 \_\_ [phys\_to\_virt](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=4&q=phys_to_virt&zhida_source=entity) () 处的汇编代码。

在启动过程中，我们将遍历这个表，取出每个指针，检查它指向的每条指令，然后用 (PHYS\_OFFSET - PAGE\_OFFSET) 去给这些指令打补丁。

![](https://pica.zhimg.com/v2-b5e7943d97a999645d884ab0d7f86ad6_1440w.jpg)

在早期启动过程中，每个调用了执行物理内存到虚拟内存的转换汇编宏的地方都需要打补丁

相关的代码：

```
__fixup_pv_table:
    adr    r0, 1f
    ldmia    r0, {r3-r7}
    mvn    ip, #0
    subs    r3, r0, r3    @ PHYS_OFFSET - PAGE_OFFSET
    add    r4, r4, r3    @ adjust table start address
    add    r5, r5, r3    @ adjust table end address
    add    r6, r6, r3    @ adjust __pv_phys_pfn_offset address
    add    r7, r7, r3    @ adjust __pv_offset address
    mov    r0, r8, lsr #PAGE_SHIFT    @ convert to PFN
    str    r0, [r6]    @ save computed PHYS_OFFSET to __pv_phys_pfn_offset
    (...)
    b    __fixup_a_pv_table

1:    .long    .
    .long    __pv_table_begin
    .long    __pv_table_end
2:    .long    __pv_phys_pfn_offset
    .long    __pv_offset
```

核心内容就是，先计算出 pv\_table 的起始地址和结束地址，然后遍历该表，对每一个条目都调用 \_\_fixup\_a\_pv\_table，给该条目所指向的汇编代码打补丁。

**为什么我们进行这么复杂的操作，而不仅仅是将 [偏移量](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=4&q=%E5%81%8F%E7%A7%BB%E9%87%8F&zhida_source=entity) 存储在变量中？**

这是出于效率原因：它位于内核的热数据路径上。更新页表和 [交叉引用](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E4%BA%A4%E5%8F%89%E5%BC%95%E7%94%A8&zhida_source=entity) 物理到虚拟内核内存的操作对性能的要求是及其苛刻的，所有使用内核虚拟内存的场景，无论是 block layer 或　network layer 的操作，还是用户到内核空间的转换，原则上任何通过内核的数据会在某个时间点调用这些函数。所以，他们必须很快。

![](https://pic2.zhimg.com/v2-b5bbfcb370fd54a5122878c2d746aedf_1440w.jpg)

上面的做法不能称为简单的解决方案，事实上，它是一个非常复杂的解决方案。但是它能正常工作，并且非常高效！

好啦，今天就分享这么多吧。

感谢阅读，下篇文章见。

**—— The End ——**

**推荐阅读：**

[专辑 | Linux 系统编程](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/mp/appmsgalbum%3F__biz%3DMzU3NDY4NTk3Mg%3D%3D%26action%3Dgetalbum%26album_id%3D1378333579549491203%23wechat_redirect)

[专辑 | Linux 驱动开发](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/mp/appmsgalbum%3F__biz%3DMzU3NDY4NTk3Mg%3D%3D%26action%3Dgetalbum%26album_id%3D1378331497144664066%23wechat_redirect)

[专辑 | Linux 内核品读](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/mp/appmsgalbum%3F__biz%3DMzU3NDY4NTk3Mg%3D%3D%26action%3Dgetalbum%26album_id%3D1378335865025740805%23wechat_redirect)

[专辑 | 每天一点 C](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/mp/appmsgalbum%3F__biz%3DMzU3NDY4NTk3Mg%3D%3D%26action%3Dgetalbum%26album_id%3D1437817804165890049%23wechat_redirect)

[专辑 | 开源软件](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/mp/appmsgalbum%3F__biz%3DMzU3NDY4NTk3Mg%3D%3D%26action%3Dgetalbum%26album_id%3D1378339777707393025%23wechat_redirect)

[专辑 | Qt 入门](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/mp/appmsgalbum%3F__biz%3DMzU3NDY4NTk3Mg%3D%3D%26action%3Dgetalbum%26album_id%3D1820872276280426502%23wechat_redirect)

发布于 2021-08-17 08:34