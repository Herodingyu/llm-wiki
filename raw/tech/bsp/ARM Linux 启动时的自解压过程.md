---
title: "ARM Linux 启动时的自解压过程"
source: "https://zhuanlan.zhihu.com/p/400519149"
author:
  - "[[老吴嵌入式]]"
published:
created: 2026-05-02
description: "大家好，我是工具人老吴。 最近业余时间都在学习 Linux 内核和英语，或者是陪家人玩耍，没有投入太多的时间在文章。 今天起得比较早，就给大家翻译一篇 linus 的文章吧，大家可以感受一下大神的写作能力。 水平有…"
tags:
  - "clippings"
---
[收录于 · Linux内核品读](https://www.zhihu.com/column/c_1287649322201272320)

30 人赞同了该文章

大家好，我是工具人老吴。

最近业余时间都在学习 Linux 内核和英语，或者是陪家人玩耍，没有投入太多的时间在文章。

今天起得比较早，就给大家翻译一篇 linus 的文章吧，大家可以感受一下大神的写作能力。

水平有限，建议搭配原文阅读。

另外，由于最近英语提升了不少，以后争取多翻译一些干货给大家。

**OK，Let's go.**

---

[ARM Linux](https://zhida.zhihu.com/search?content_id=177134406&content_type=Article&match_order=1&q=ARM+Linux&zhida_source=entity) 一般都使用压缩的内核，例如 zImage。

**这样做有两个主要原因：**

**1、节省存放内核的闪存或其他存储介质的空间。**

例如，在我工作的平台上， [vmlinux](https://zhida.zhihu.com/search?content_id=177134406&content_type=Article&match_order=1&q=vmlinux&zhida_source=entity) 未压缩的内核是 11.8 MB，而压缩后的 zImage 只有4.8MB，节省了 50% 以上的空间。

**2、加载速度更快。**

通常情况下，解压消耗的时间比从存储介质传输未压缩镜像的时间要短。

例如从 NAND Flash 加载内核，就是一种很典型的情况。

本文将对 ARM Linux 的自解压过程进行一个简单介绍。arch/arm/\* 下的大多数机器都会使用压缩的内核，其自解压过程是一样的。

## Bootloader

Bootloader，无论是 [RedBoot](https://zhida.zhihu.com/search?content_id=177134406&content_type=Article&match_order=1&q=RedBoot&zhida_source=entity) 、 [U-Boot](https://zhida.zhihu.com/search?content_id=177134406&content_type=Article&match_order=1&q=U-Boot&zhida_source=entity) 还是 [EFI](https://zhida.zhihu.com/search?content_id=177134406&content_type=Article&match_order=1&q=EFI&zhida_source=entity) ，都将内核映像放置在物理内存中的某个位置，并通过寄存器传递一些参数来执行它。

2002 年，Russell King 就在 Booting ARM Linux 文档中定义了 Booloader 引导 Linux 内核的 ABI。

Bootloader 将 0 放入寄存器 r0，将 Machine ID 放入寄存器 r1，并将指向 ATAG 的指针放入寄存器 r2。

ATAG 包含物理内存的位置和大小，内核被放置在该内存中的某个位置。只要确保有足够解压内核的空间，它就能从任何地址执行。

然后 Bootloader 会在管理模式下跳转到内核，此时，所有中断、MMU 和缓存都是 disabled。

在现代 [设备树](https://zhida.zhihu.com/search?content_id=177134406&content_type=Article&match_order=1&q=%E8%AE%BE%E5%A4%87%E6%A0%91&zhida_source=entity) 内核中，r2 被重新用作指向物理内存中设备树 ([DTB](https://zhida.zhihu.com/search?content_id=177134406&content_type=Article&match_order=1&q=DTB&zhida_source=entity)) 的指针。在这种情况下，r1 被忽略。DTB 也可以附加到内核映像后，并且可以选择使用来自 r2 的 ATAG 进行修改。

## zImage 的解压

如果使用的是 [压缩内核](https://zhida.zhihu.com/search?content_id=177134406&content_type=Article&match_order=1&q=%E5%8E%8B%E7%BC%A9%E5%86%85%E6%A0%B8&zhida_source=entity) ，则执行开始于 arch/arm/boot/compressed/head.S 中的 start 符号。出于遗留原因，它以 8 或 7 个 NOP 指令开头。它跳过一些幻数并保存指向 ATAG 的 指针 (r2)。现在，内核 [解压代码](https://zhida.zhihu.com/search?content_id=177134406&content_type=Article&match_order=1&q=%E8%A7%A3%E5%8E%8B%E4%BB%A3%E7%A0%81&zhida_source=entity) (The decompression code) 将从它被加载的物理内存的物理地址开始执行。

```
arch/arm/boot/compressed/head.S

start:
  [...]
  .word _magic_sig @ Magic numbers to help the loader
  .word _magic_start @ absolute load/run zImage address
  .word _magic_end @ zImage end address
  .word 0x04030201 @ endianness flag

  __EFI_HEADER
  [...]
  mov r7, r1   @ save architecture ID
  mov r8, r2   @ save atags pointer
```

解压代码首先会确定物理内存的起始位置。在大多数现代平台上，这是通过 Kconfig 选择 AUTO\_ZRELADDR 完成的，使能这个配置后，内核会通过将 PC 寄存器进行 128MB 的对齐的方式来获得物理内存的起始地址，内核总是假设它是在物理内存的第一块的第一部分加载和执行。

```
arch/arm/boot/compressed/head.S

#ifdef CONFIG_AUTO_ZRELADDR
  /*
   * Find the start of physical memory.  As we are executing
   * without the MMU on, we are in the physical address space.
   * We just need to get rid of any offset by aligning the
   * address.
   *
   * This alignment is a balance between the requirements of
   * different platforms - we have chosen 128MB to allow
   * platforms which align the start of their physical memory
   * to 128MB to use this feature, while allowing the zImage
   * to be placed within the first 128MB of memory on other
   * platforms.  Increasing the alignment means we place
   * stricter alignment requirements on the start of physical
   * memory, but relaxing it means that we break people who
   * are already placing their zImage in (eg) the top 64MB
   * of this range.
   */
  mov r4, pc
  and r4, r4, #0xf8000000
  /* Determine final kernel image address. */
  add r4, r4, #TEXT_OFFSET
#else
  ldr r4, =zreladdr
#endif
```

然后会计算物理内存起始地址 + TEXT\_OFFSET 。

TEXT\_OFFSET，顾名思义，这是内核.text 段应位于的位置。.text 段包含可执行代码，因此这就是解压缩后内核的实际起始地址。TEXT\_OFFSET 通常为 0x8000，因此解压后的内核将位于物理内存起始地址 + TEXT\_OFFSET 。TEXT\_OFFSET 在 arch/arm/Makefile 中定义。

0x8000 (32KB) 偏移量是一个惯例，因为通常有一些固定的架构相关的数据放置在 0x00000000 处，例如中断向量，许多旧系统将 ATAG 放置在 0x00000100 处。另外还需要额外的空间，是因为当内核最终启动时，它将从该地址中减去 0x4000（或 LPAE 的 0x5000），并将初始内核页表 (initial kernel page table) 存储在那里。

对于某些特定平台，TEXT\_OFFSET 将在内存中向后扩展，特别是一些高通平台会将其扩展到 0x00208000，因为物理内存的第一个 0x00200000 (2 MB) 用于与 modern CPU 的共享内存通信。

接下来，如果能映射解压前的内核和解压后的内核所在的区域的话，解压代码会设置一个页表，。这个页表不是为了使用虚拟内存，而是为了解压前能使能 cache，从而获得更快的解压速度。

接下来，内核设置一个局部的栈指针和 malloc() 区域，以便我们可以处理子例程调用和进行小内存分配，简单地说，就是可以执行 C 代码了。

![](https://pic1.zhimg.com/v2-e7f892004c3cd2c558d43a19b9d05a54_1440w.jpg)

appended dtb 的内核

接下来，我们检查由 ARM\_APPENDED\_DTB 符号启用的附加 DTB 。这是在编译期间添加到 zImage 的 DTB，其实就是 cat foo.dtb >> zImage。DTB 使用幻数 0xD00DFEED 进行标识。

如果找到附加的 DTB，并设置了 CONFIG\_ARM\_ATAG\_DTB\_COMPAT，我们首先将 DTB 扩展 50% 并调用 atagstofdt，它将使用来自 ATAG 的信息（例如内存块和内存大小）来扩充 DTB。

然后，DTB 指针（开始时由 r2 传入的）被指向附加 DTB 的指针覆盖，DTB 的大小也会被保存，并且更新内核映像的末端地址为 kernel image end + dtb size，以便附加 DTB（可选） 使用 ATAG 修改）包含在压缩内核的总大小中。同时，还会上调栈和 malloc() 的位置，以避免 DTB 被破坏。

注意：如果在 r2 中传入了设备树指针，并且还提供了附加的 DTB，则系统使用附加的 DTB。偶尔会使用这个技巧来覆盖 Bootloader 传递的默认 DTB。

注意：如果在 r2 中传入 ATAG，则肯定没有通过该寄存器传入的 DTB。如果你不想替换掉老版本的 bootloader，你几乎总是需要 CONFIG\_ARM\_ATAG\_DTB\_COMPAT 符号，因为 ATAG 正确定义了旧平台上的内存。另外，确实可以可以在设备树中定义内存，但通常情况下，人们都不会这么做，而是并依靠 bootloader 来提供内存信息：一种方式是 bootloader 修改 DTB，另一种方式是 ATAG 和 DTB 在启动时一起协同工作。

![](https://pic4.zhimg.com/v2-abd1fa970694171dfbbe244e20d11cf1_1440w.jpg)

解压后的内核可能与压缩的内核重叠

接下来，我们检查解压后的内核是否会覆盖压缩内核。如果发生这种情况，则需要先确定解压后的内核将在内存中的哪个位置结束，然后内核会将自己（压缩内核）复制到该位置。

然后代码会巧妙地跳回到一个叫做 restart 的标签的重定位地址：这是设置栈指针和 malloc() 区域的代码的起始位置，但现在在新的物理地址处执行。

这意味着将再次设置栈和 malloc() 区域并查找附加的 DTB，一切看起来就像内核第一次加载到此位置一样开始。（但有一个区别：我们已经用 ATAG 扩充了 DTB，因此不会再重复次步骤了。），但是这次解压出来的内核将不会覆盖压缩内核。

![](https://picx.zhimg.com/v2-5ad122fe0ce0eec0d248b92bb4661823_1440w.jpg)

move the compressed kernel down so the decompressed kernel can fit.

这些操作不会检查内存是否用完，即我们是否会碰巧将内核复制到物理内存的末尾。如果发生这种情况，结果是不可预测的。如果内存为 8MB 或更少，就会发生这种情况，在这些情况下: 不要使用压缩内核。

![](https://pic2.zhimg.com/v2-94a39509675b652bb817f3c1ef9b99e3_1440w.jpg)

The compressed kernel is moved below the decompressed kernel.

现在我们知道内核可以解压缩到压缩镜像下方的内存中，并且它们在解压缩过程中不会发生重叠，现在可以开始执行wont\_overwrite 处的代码了。

```
arch/arm/boot/compressed/head.S

wont_overwrite:
/*
 * If delta is zero, we are running at the address we were linked at.
 *   r0  = delta
 *   r2  = BSS start
 *   r3  = BSS end
 *   r4  = kernel execution address (possibly with LSB set)
 *   r5  = appended dtb size (0 if not present)
 *   r7  = architecture ID
 *   r8  = atags pointer
 *   r11 = GOT start
 *   r12 = GOT end
 *   sp  = stack pointer
 */
 # 省略
 [...]

 /*
 * The C runtime environment should now be setup sufficiently.
 * Set up some pointers, and start decompressing.
 *   r4  = kernel execution address
 *   r7  = architecture ID
 *   r8  = atags pointer
 */
 mov r0, r4
 mov r1, sp   @ malloc space above stack
 add r2, sp, #0x10000 @ 64k max
 mov r3, r7
 bl decompress_kernel
```

接着，我们检查解压器是否有被链接，并可能更改一些指针表,为执行解压缩器准备好 C 运行时环境。

确保 cache 已打开。

清除 BSS 区域（因此所有未初始化的变量都将为 0），也是在准备 C 运行时环境。

接下来调用 boot/compressed/misc.c 中的 decompress\_kernel() ，它依次调用 do\_decompress() ，后者调用 \_\_decompress() ，并执行实际的解压缩。

```
arch/arm/boot/compressed/decompress.c

#ifdef CONFIG_KERNEL_GZIP
#include "../../../../lib/decompress_inflate.c"
#endif

#ifdef CONFIG_KERNEL_LZO
#include "../../../../lib/decompress_unlzo.c"
#endif

#ifdef CONFIG_KERNEL_LZMA
#include "../../../../lib/decompress_unlzma.c"
#endif

#ifdef CONFIG_KERNEL_XZ
#define memmove memmove
#define memcpy memcpy
#include "../../../../lib/decompress_unxz.c"
#endif

#ifdef CONFIG_KERNEL_LZ4
#include "../../../../lib/decompress_unlz4.c"
#endif

int do_decompress(u8 *input, int len, u8 *output, void (*error)(char *x))
{
 return __decompress(input, len, NULL, NULL, output, 0, NULL, error);
}
```

这是在 C 中实现的，解压类型因 Kconfig 选项而异：与编译内核时选择的解压器将链接到映像并从物理内存执行。

所有架构共享同一个解压库。调用的 \_ *decompress() 函数将取决于链接到图像的 lib/decompress* \*.c 中的哪个解压缩器。解压器的选择发生在 arch/arm/boot/compressed/decompress.c 中，只需将整个解压器包含到文件中即可。

在调用解压器之前，解压器需要的所有关于压缩内核位置变量都设置在寄存器中了。

![](https://pic3.zhimg.com/v2-b054a94b7fcc2e4d56c7011aed9ca4a8_1440w.jpg)

解压后的内核位于 TEXT\_OFFSET 处， 而 appended DTB (如果有的话) 则仍然位于 compressed kernel 的末端

解压后，我们调用 get\_inflated\_image\_size() 来获取最终解压后内核的大小。然后我们再次刷新并关闭 cache。

然后我们跳转到符号 \_\_enter\_kernel，它重新初始化好 r0、r1 和 r2，如果有附加的设备树 blob，则 r2 现在指向该 DTB，即恢复到 bootloader 刚跳转到内核时的状态。然后我们将 pc 设置为内核的起始端，即物理内存的起始地址 + TEXT\_OFFSET，在传统的系统上通常为 0x00008000，在某些高通系统上可能为 0x20008000。

```
__enter_kernel:
  mov r0, #0   @ must be 0
  mov r1, r7   @ restore architecture number
  mov r2, r8   @ restore atags pointer
```

现在，就好像我们在 TEXT\_OFFSET 处加载了一个未压缩的内核镜像（即 vmlinux 文件），在 r2 中传递一个设备树，如果使用了设备树的话。

## 运行 vmlinux

解压后的内核在符号 stext() 处开始执行，即文本段的开头。这段代码可以在 arch/arm/kernel/head.S 中找到。

这是另一个讨论的主题。但是请注意，此处的代码不会查找附加的设备树！如果要使用附加设备树，则必须使用压缩内核。使用 ATAG 扩充任何设备树也是如此，也必须使用压缩内核映像，因为执行此操作的代码是引导压缩内核的程序集的一部分。

## 具体平台的内核解压

让我们仔细看看高通 APQ8060 的内核解压过程。

首先，你需要启用 CONFIG\_DEBUG\_LL，它使你能够在 UART 控制台上敲出字符，而无需任何高级打印机制的干预。它所做的只是为 UART 和其他代码提供物理地址以轮询以输出字符。需要设置 DEBUG\_UART\_PHYS，以便内核知道 UART I/O 物理地址位于何处。请确保这些定义是正确的。

首先启用名为 CONFIG\_DEBUG\_UNCOMPRESS 的 Kconfig 选项。这是为了在解压内核之前打印“Uncompressing Linux...”的短消息，在解压后打印“done, booting the kernel”。这是一个很好的烟雾测试，表明 CONFIG\_DEBUG\_LL 已设置且 DEBUG\_UART\_PHYS 正确且解压工作正常，但仅此而已，不提供任何底层调试。

通过在 arch/arm/boot/compressed/head.S 中启用 DEBUG 定义来调试和检查实际的内核解压，这是最简单的方法，具体地是将 -DDEBUG 标记到 arch 中 head.S 的 AFLAGS（汇编器标志） /arm/boot/compressed/Makefile 像这样：

```
AFLAGS_head.o += -DTEXT_OFFSET=$(TEXT_OFFSET) -DDEBUG
```

然后我们在启动时收到此消息：

```
C:0x403080C0-0x40DF0CC0->0x41801D00-0x422EA900
```

这意味着在我们启动时，将内核加载到 0x40300000，这会与解压后的内核发生冲突。因此，内核被复制到 0x41801D00，这是解压后内核将结束的地方。通过添加更多的调试打印信息，我们可以看到附加的 DTB 首先在 0x40DEBA68 处被找到，在将内核向下移动后，它在 0x422E56A8 处被找到，这是引导内核时它会位于的位置。

到此，ARM Linux 的自解压过程就介绍完毕了，感谢阅读，下篇文章见。

**—— The End ——**

**推荐阅读：**

[专辑 | Linux 系统编程](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/mp/appmsgalbum%3F__biz%3DMzU3NDY4NTk3Mg%3D%3D%26action%3Dgetalbum%26album_id%3D1378333579549491203%23wechat_redirect)

[专辑 | Linux 驱动开发](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/mp/appmsgalbum%3F__biz%3DMzU3NDY4NTk3Mg%3D%3D%26action%3Dgetalbum%26album_id%3D1378331497144664066%23wechat_redirect)

[专辑 | Linux 内核品读](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/mp/appmsgalbum%3F__biz%3DMzU3NDY4NTk3Mg%3D%3D%26action%3Dgetalbum%26album_id%3D1378335865025740805%23wechat_redirect)

[专辑 | 每天一点 C](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/mp/appmsgalbum%3F__biz%3DMzU3NDY4NTk3Mg%3D%3D%26action%3Dgetalbum%26album_id%3D1437817804165890049%23wechat_redirect)

[专辑 | 开源软件](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/mp/appmsgalbum%3F__biz%3DMzU3NDY4NTk3Mg%3D%3D%26action%3Dgetalbum%26album_id%3D1378339777707393025%23wechat_redirect)

[专辑 | Qt 入门](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/mp/appmsgalbum%3F__biz%3DMzU3NDY4NTk3Mg%3D%3D%26action%3Dgetalbum%26album_id%3D1820872276280426502%23wechat_redirect)

发布于 2021-08-17 08:33[从dft成功转到数字IC前端设计，目标成为全栈IC工程师](https://zhuanlan.zhihu.com/p/1170594983)

[

毕业之后意外从事DFT工程师工作我2019年毕业于西安工业大学，专业是计算机科学与技术。 和很多同学一样，毕业的时候非常迷茫，不知道做些什么。同班同学大多都从事了对口的软件开发...

](https://zhuanlan.zhihu.com/p/1170594983)