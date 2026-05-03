---
title: "认识SMMU以及理理SMMU与TrustZone的联系？"
source: "https://zhuanlan.zhihu.com/p/650483261"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！ 一、SMMU？最近看了两篇文章很精彩，这里来一起学习一下，链接放在了文末，感谢前辈的…"
tags:
  - "clippings"
---
12 人赞同了该文章

---

大家好！我是不知名的安全工程师Hkcoco！

欢迎大家关注我的微信公众号： [TrustZone](https://zhida.zhihu.com/search?content_id=232681481&content_type=Article&match_order=1&q=TrustZone&zhida_source=entity) | CSDN：Hkcoco

获取更多精彩内容哦！！！

---

## 一、SMMU？

最近看了两篇文章很精彩，这里来一起学习一下，链接放在了文末，感谢前辈的优秀文章。

## 1-什么是SMMU？

**SMMU（system mmu),是I/O device与总线之间的地址转换桥。**

它在系统的位置如下图：

![](https://picx.zhimg.com/v2-587f25f547f84aa5861e14b436f205d9_1440w.jpg)

在这里插入图片描述

它与mmu的功能类似，可以实现地址转换，内存属性转换，权限检查等功能。

## 2-为什么需要SMMU？

了解SMMU出现的背景，需要知道系统中的两个概念： [DMA](https://zhida.zhihu.com/search?content_id=232681481&content_type=Article&match_order=1&q=DMA&zhida_source=entity) 和 [虚拟化](https://zhida.zhihu.com/search?content_id=232681481&content_type=Article&match_order=1&q=%E8%99%9A%E6%8B%9F%E5%8C%96&zhida_source=entity) 。

**DMA** ：（(Direct Memory Access），直接内存存取, 是一种外部设备不通过CPU而直接与系统内存交换数据的接口技术 。外设可以通过DMA，将数据批量传输到内存，然后再发送一个中断通知CPU取，其传输过程并不经过CPU， 减轻了CPU的负担。但由于DMA不能像CPU一样通过MMU操作虚拟地址，所以DMA需要连续的物理地址。

CDge"> **虚拟** 化：在虚拟化场景， 所有的VM都运行在中间层hypervisor上，每一个VM独立运行自己的OS（guest OS）,Hypervisor完成硬件资源的共享, 隔离和切换。

![](https://picx.zhimg.com/v2-360e0d12efdea2240d3de332de85f77d_1440w.jpg)

在这里插入图片描述

但对于Hypervisor + GuestOS的虚拟化系统来说, guest VM使用的物理地址是GPA, 看到的内存并非实际的物理地址(也就是HPA)，因此Guest OS无法正常的将连续的物理地址分给硬件。

**因此，为了支持I/O透传机制中的DMA设备传输，而引入了 [IOMMU](https://zhida.zhihu.com/search?content_id=232681481&content_type=Article&match_order=1&q=IOMMU&zhida_source=entity) 技术（ARM称作SMMU）。**

总而言之，SMMU可以为ARM架构下实现虚拟化扩展提供支持。它可以和MMU一样，提供stage1转换（VA->PA）, 或者stage2转换（IPA->PA）,或者stage1 + stage2转换（VA->IPA->PA）的灵活配置。

\[VA：虚拟地址；IPA: 中间物理地址；PA：物理地址\]

![](https://pic2.zhimg.com/v2-274c642878e8ae46d22dfd26f28d130b_1440w.jpg)

在这里插入图片描述

## 3-SMMU常用概念

- [StreamID](https://zhida.zhihu.com/search?content_id=232681481&content_type=Article&match_order=1&q=StreamID&zhida_source=entity) 一个平台上可以有多个SMMU设备，每个SMMU设备下面可能连接着多个Endpoint， 多个设备互相之间可能不会复用同一个页表，需要加以区分，SMMU用StreamID来做这个区分( SubstreamID的概念和PCIe PASID是等效的)
- [STE](https://zhida.zhihu.com/search?content_id=232681481&content_type=Article&match_order=1&q=STE&zhida_source=entity) Stream Table Entry, STE里面包含一个指向stage2地址翻译表的指针，并且同时还包含一个指向CD（Context Descriptor）的指针.
- CD Context Descriptor, 是一个特定格式的数据结构，包含了指向stage1地址翻译表的基地址指针

## 4-SMMU数据结构查找

SMMU翻译过程需要使用多种数据结构，如STE, CD， [PTW](https://zhida.zhihu.com/search?content_id=232681481&content_type=Article&match_order=1&q=PTW&zhida_source=entity) 等。

### 4.1 SID查找STE

Stream Table是存放在内存中的一张表，在SMMU驱动初始化时由驱动程序创建好。

Stream table有两种格式，一种是Linear Stream Table, 一种是2-level Stream Table.

- 1. Linear Stream Table![](https://pica.zhimg.com/v2-649ab3e04b1a106c5983cd88488db22c_1440w.jpg)
		在这里插入图片描述

Linear Stream Table是将整个stream table在内存中线性展开成一个数组， 用Stream Id作为索引进行查找.

Linear Stream Table 实现简单，只需要一次索引，速度快；但是平台上外设较少时，浪费连续的内存空间。

- 1. 2-level Stream Table
![](https://pic3.zhimg.com/v2-90da764d1d86c325fc31d1e6921cc08c_1440w.jpg)

在这里插入图片描述

2-level Stream Table， 顾名思义，就是包含2级table, 第一级table， 即STD，包含了指向二级STE的基地址STD。第二级STE是Linear stream Table. 2-level Stream Table的优点是更加节省内存。

SMMU根据寄存器配置的STRTAB\_BASE地址找到STE， STRTAB\_BASE定义了STE的基地值， Stream id定义了STE的偏移。如果使用linear 查找， 通过STRTAB\_BASE + sid \* 64（一个STE的大小为64B）找到STE；若使用2-level查找， 则先通过sid的高位找到L1\_STD（STRTAB\_BASE + sid\[9:8\] \* 8, 一个L1\_STD的大小为8B）, L1\_STD定义了下一级查找的基地址，然后通过sid 找到具体的STE（l2ptr + sid\[7:0\] \* 64）.

最终找到的STE如下所示，表中的信息包含属性相关信息， 翻译模式信息（是否 stream bypass, 若否，选择stage1, stage2或者stage1 + stage2翻译模式）。

![](https://pic3.zhimg.com/v2-d0b43a03db75a15ba0275379dea031b2_1440w.jpg)

在这里插入图片描述

找到STE后可以进一步开始S1翻译或S2翻译.

### 4.2 SSID查找CD

CD包含了指向stage1地址翻译表的基地址指针.

如下图所示， STE指明了CD数据结构在DDR中的基地址S1ContextPTR, SSID(substream id)指明了CD数据结构的偏移，如果SMMU选择进行linear, 则使用S1ContextPTR + 64 \* ssid 找到CD。如果SMMU选择2-level, 则使用ssid进行二级查找获得CD（与上节STE的方式一致）。

![](https://pic3.zhimg.com/v2-59882e503582171adfe50a92ac254b00_1440w.jpg)

在这里插入图片描述

最终找到的CD如下所示：

![](https://pic2.zhimg.com/v2-b2cfb3a657a06248538f7eb9c46890cb_1440w.jpg)

在这里插入图片描述

表中信息包含memory属性，翻译控制信息，异常控制信息以及Page table walk(PTW)的起始地址TTB0, TTB1， 找到TTBx后，就可以PTW了。

## 5\. SMMU地址转换

### 5.1 单stage的地址转换：

![](https://picx.zhimg.com/v2-ee0b33f7b7133c94f583124b9d5f44b7_1440w.jpg)

在这里插入图片描述

- TTB 和 VA\[47:39\]组成获取Level0页表的地址PA；
- Level0页表中的next-level table address 和 VA\[38:30\]组成获取Level1的页表地址PA；
- Level1页表中的next-level table address 和 VA\[29:21\]组成获取Level2的页表地址PA；
- Level2页表中的next-level table address 和 VA\[20:12\]组成获取Leve3的页表地址PA；
- level3页表中的output address和va\[12:0\]组成获取组后的钻换地址

在stage1地址翻译阶段：硬件先通过StreamID索引到STE，然后用SubstreamID索引到CD， CD里面包含了stage1地址翻译（把进程的GVA/IOVA翻译成IPA）过程中需要的页表基地址信息、per-stream的配置信息以及ASID。

在stage1翻译的过程中，多个CD对应着多个stage1的地址翻译，通过Substream去确定对应的stage1地址翻译页表。所以，Stage1地址翻译其实是一个（RequestID, PASID） => GPA的映射查找过程。

在使能SMMU两阶段地址翻译的情况下，stage1负责将设备DMA请求发出的VA翻译为IPA并作为stage2的输入， stage2则利用stage1输出的IPA再次进行翻译得到PA，从而DMA请求正确地访问到Guest的要操作的地址空间上。

在stage2地址翻译阶段：STE里面包含了stage2地址翻译的页表基地址（IPA->HPA）和VMID信息。如果多个设备被直通给同一个虚拟机，那么意味着他们共享同一个stage2地址翻译页表。

在两阶段地址翻译场景下， 地址转换流程步骤：

Guest驱动发起DMA请求，这个DMA请求包含VA + SID前缀

DMA请求到达SMMU，SMMU提取DMA请求中的SID就知道这个请求是哪个设备发来的，然后去StreamTable索引对应的STE

从对应的STE表中查找到对应的CD，然后用ssid到CD中进行索引找到对应的S1 Page Table

IOMMU进行S1 Page Table Walk，将VA翻译成IPA并作为S2的输入

IOMMU执行S2 Page Table Walk，将IPA翻译成PA，地址转化结束。

## 6\. SMMU command queue 与 event queue

系统软件通过 [Command Queue](https://zhida.zhihu.com/search?content_id=232681481&content_type=Article&match_order=1&q=Command+Queue&zhida_source=entity) 和 [Event Queue](https://zhida.zhihu.com/search?content_id=232681481&content_type=Article&match_order=1&q=Event+Queue&zhida_source=entity) 来和SMMU打交道，这2个Queue都是循环队列。

Command queue用于软件与SMMU的硬件交互，软件写命令到command queue, SMMU从command queue中 地区命令处理。

Event Queue用于SMMU发生软件配置错误的状态信息记录，SMMU将配置错误信息写到Event queue中，软件通过读取Event queue获得配置错误信息并进行配置错误处理。

![](https://picx.zhimg.com/v2-336d3605a65fd106d466de5466a52991_1440w.jpg)

在这里插入图片描述

### 5.2 stage1+stage2的地址转换：

![](https://pic2.zhimg.com/v2-c8d80edaade0f187a153384afd8aace3_1440w.jpg)

在这里插入图片描述

## 二、SMMU软硬件模型

SMMU的全称是System Memory Management Units， 它属于Arm的System IP， 主要给其他Master来使用，其连页表格式和Core MMU是一样的， **理论上可以让Core的MMU和SMMU使用同一套页表.**

那么SMMU都是用在哪些地方呢？\*以下展示了一个usecase，来自arm官方博客（February 17, 2014），也是比较早期的一个Sample case

![](https://pica.zhimg.com/v2-f33ab002c5b676eee86d4f536698fbea_1440w.jpg)

在这里插入图片描述

## 1-SMMU的使用模型

SMMU全称System Memory Management Unit，其实SMMU和MMU具有同样的作用，区别是供给Master使用，同样提供页表转换工作，Master可通过页表转换访问物理地址，达到Master一样使用虚拟地址

![](https://picx.zhimg.com/v2-21e7bd18dc692ebbae145bafe416f023_1440w.jpg)

在这里插入图片描述

![](https://pic1.zhimg.com/v2-f0c748649b7b7ddff387620c88dc8f58_1440w.jpg)

在这里插入图片描述

![](https://pic2.zhimg.com/v2-4cd910818370389a0045d4eb791a8cb5_1440w.jpg)

在这里插入图片描述

## 2-SMMU的硬件原理图

学过MMU的人都知道，MMU是由 TLB+AddressTranslation, 那么对于SMMU呢？它是由TBU + TCU组成， **其中TBU中含有TLB** ， **TCU缓存地址翻译** 。 **DTI则是SMMU内部的连接总线的协议。**

![](https://pic2.zhimg.com/v2-f947d421c914d965f2c15d989fcded93_1440w.jpg)

在这里插入图片描述

而一个SMMU中可以放置多个 ACE-LiteTBU模块，也可以放置 LTI TBU![](https://picx.zhimg.com/v2-48c40b5ac47d092588cb614db78ccca7_1440w.jpg)

在这里插入图片描述

## 3-TBU原理图

![](https://pic3.zhimg.com/v2-d7a2484a92d7fb6d1121ce888bdadb3a_1440w.jpg)

在这里插入图片描述

**LTI TBU的原理图**![](https://pic1.zhimg.com/v2-2d4c960c23589acc33adc499015c16da_1440w.jpg)

在这里插入图片描述

## 4-TCU的原理图

![](https://pic3.zhimg.com/v2-725d0f5279efda496c6e885520457b3c_1440w.jpg)

在这里插入图片描述

## 5-小结

- （1）MMU 只能给 一个core用。而SMMU想给多个master用，多个master又对应不同的表。所以就搞了个STE。每一个STE entry里，都可以指向多个context descriptor （我觉得一般也就只用一个吧），然后每一个context descriptor 就相当于 MMU的TTBRx + TCR寄存器。context Descriptor之后，就和普通的MMU一样
- （2）\*\*SMMU里有两套寄存器，一套是给安全master用的，一套是给非安全master用的。\*\*从软件视角来看，其实就相当于有两个SMMU了。但这不是banked，他们的寄存器名字不一样，一类带了S，一类不带S。而且寄存器memory-map的地址还不一样。
- （3） **SMMU又有 [Secure STE](https://zhida.zhihu.com/search?content_id=232681481&content_type=Article&match_order=1&q=Secure+STE&zhida_source=entity) 和 [Non-secure STE](https://zhida.zhihu.com/search?content_id=232681481&content_type=Article&match_order=1&q=Non-secure+STE&zhida_source=entity) 的概念， Secure STE 后面的页表/地址转换，可以转secure memory，也可以转non-secure memory** 。Non-Secure STE 后面的页表/地址转换，只可以转non-secure memory。这和MMU里的Descriptor里的NS比特也是一样的。

这几句总结的太Nice了，看了这个部分，刚刚好来看看下面的这个PART。

## 三、SMMU跟TrustZone啥关系？

## 一、前言

在实际的项目中有些Master也是要访问Secure Memory的，例如 [DPU](https://zhida.zhihu.com/search?content_id=232681481&content_type=Article&match_order=1&q=DPU&zhida_source=entity),DMA等。

```
英伟达首席执行官黄仁勋曾在演讲中表示：“ DPU 将成为未来计算的三大支柱之一，未来的数据中心标配是‘ CPU + DPU + GPU ’。CPU 用于通用计算， GPU 用于加速计算， DPU 则进行数据处理。”
```
![](https://pica.zhimg.com/v2-aee211b0821511bbbf0229d27909d210_1440w.jpg)

在这里插入图片描述

## 二、为什么需要SMMU

TrustZone的基本原理是将系统资源划分成安全和非安全两部分，CPU本身支持TrustZone，可以发出安全访问和非安全访问。

但是SoC的其他Master也需要访问memory，在有些场景下也需要访问安全memory和非安全memory，那该怎么去实现呢？

![](https://pic4.zhimg.com/v2-18fc763b4fbf88f0a64da69c11bae80d_1440w.jpg)

在这里插入图片描述

可以由几种不同的实现方式，有些Master本身就支持TrustZone，可以发出安全访问和非安全访问，例如Arm的DMA直接就可以发出安全访问或者非安全访问。

但是第三方的Master可能不支持TrustZone， **可以在IP前面加安全控制器来实现** ，例如这个控制器是Secure only的，可以通过TEE对安全控制器进行编程， **Master发出的访问不Care安全或者非安全，通过控制器来扩展TrustZone功能** ，但是这种方式很大局限性； **另外一种方法就是我们可以今天介绍的SMMU来实现。**

![](https://pic1.zhimg.com/v2-ce829847a4938e2e31ae670e12398aba_1440w.jpg)

在这里插入图片描述

## 三、SMMU的原理机制

SMMU是Arm的System IP，几乎是跟CPU演进结合最紧密的一个IP。

我们知道CPU内部有个MMU，SMMU就是跟MMU非常相似，是System MMU， **主要给其他Master来使用，连页表格式也是一样的** ，只是编程方式不同，理论上可以让CPU的MMU和SMMU可以使用同一套页表。

增加SMMU后，其他Master也相当于有了MMU的功能，MMU是CPU的重要部分，主要是由两部分组成，一部分是TLB用来Cache VA<->PA的转换关系，一部分是Table Walk Unit，如果TLB里没有找到VA<->PA的转换关系，该Table Walk Unit就从页表里查询VA和PA的转换关系。

### 对于TrustZone系统

对于TrustZone系统来说，MMU也是非常重要的，例如在Armv7-A的架构中很多MMU的寄存器都是banked，可以简单认为Secure world和Normal World都有一个MMU， **在Armv8-A里是通过软件保存上下文来实现的** ，还有CPU在安全状态时发出的都是安全访问，当MMU enable后， **可以通过页表里的NSbit来控制发出的是安全访问** ，还是非安全访问，同时也会把安全信息也会存储在TLB里。

![](https://pic3.zhimg.com/v2-e562fa4b6f7685d7734b769506195750_1440w.jpg)

在这里插入图片描述

### SMMU的架构

CPU架构在不断的演进，增加了很多feature， **这些feature的使能或者控制位都是存储在页表** ，如果其他Master也想使用这些feature，那么SMMU的架构也需要跟随者演进，例如SMMUv1主要是支持Armv7-A的页表格式，SMMUv2主要是支持Armv8.1-A的页表格式，SMMUv3相对SMMUv2更新很大，除了支持最新Armv8.x-A的特性，同时支持更多的context，支持PCIe，也支持Message based interrupt配合GICv3等。

那其他Master通过SMMU可以支持下面的功能：

![](https://pic1.zhimg.com/v2-4654feb35705923e7186846a55854fd2_1440w.jpg)

在这里插入图片描述

地址转换：SMMU跟MMU一样，支持两级转换Stage 1 Translation和Stage2 Translation，例如VA<->IPA<->PA，但是在现实使用中，也可以直接bypass，stage 1 only，stage2 only，或者Stage 1+Stage 2

![](https://pic2.zhimg.com/v2-cb70026bc20ffcf640f01a226fc3fccd_1440w.jpg)

在这里插入图片描述

**内存保护** ： **（S）MMU除了支持地址转换外，内存属性也是重要的部分，例如可以在页表内配置读写权限，执行权限，访问权限等**![](https://picx.zhimg.com/v2-5e0171ddaec54f13f229d0b29aef999b_1440w.jpg)

在这里插入图片描述

**隔离** ：SMMU同时可以给多个Master使用，例如SMMUv2支持128个contexts，SMMUv3支持更多的Contexts，因为在SMMUv2中contexts的信息是保存在寄存器，在SMMUv3中context的信息是存储在内存里面，通过StreamID来查询，Stream ID是32位的。CPU可以和其他Master使用同一套页表，或者CPU可以SMMU单独建立页表，或者可以为每个Master建立一套或者多套页表，来控制不同的访问区域。![](https://pic2.zhimg.com/v2-9b891619bb77ed65e977e0fbeac05647_1440w.jpg)

在这里插入图片描述

TrustZone： **如果Master不支持TrustZone，可以通过SMMU来支持** ，例如在该Master发出访问时通过对应页表的属性来配置，尤其是到Armv8.4 Secure world virtulization，SMMU的作用会更大。![](https://pic2.zhimg.com/v2-957c621a63cd05f843f7647fc7fa9369_1440w.jpg)

在这里插入图片描述

前面提到的都是支持的功能，我们也可以通过一些例子来解释哪些场景下需要SMMU，例如
- 访问非连续的地址：现在系统中很少再预留连续的memory，如果Master需要很多memory，可以通过SMMU把一些非连续的PA映射到连续的VA，例如给DMA，VPU，DPU使用。
- 32位转换成64位：现在很多系统是64位的，但是有些Master还是32位的，只能访问低4GB空间，如果访问更大的地址空间需要软硬件参与交换memory，实现起来比较复杂，也可以通过SMMU来解决，Master发出来的32位的地址，通过SMMU转换成64位，就很容易访问高地址空间。
- 限制Master的访问空间：Master理论上可以访问所有的地址空间，可以通过SMMU来对Master的访问进行过滤，只让Master访问受限的区域，那这个区域也可以通过CPU对SMMU建立页表时动态控制。
- 用户态驱动：现在我们也看到很多系统把设备驱动做在用户态，调用驱动时不需要在切换到内核态，但是存在一些安全隐患，就是用户态直接控制驱动，有可能访问到内核空间，这种情况下也可以用SMMU来实现限制设备的访问空间
- 设备虚拟化: 例如设备虚拟化有多种方式，Emulate，Para-virtualized，以及Pass-through，用SMMU可以实现Pass though，这样无论是性能，还是软件的改动都是比较小的。...... SMMUv2和SMMUv3架构，编程方式，以及硬件实现差异都非常大，但是要实现的功能和基本原理都是相似，如果理解了SMMU的功能以及要解决的问题，再看Linux SMMU driver和SMMU Architecture Spec都会简单很多。

## 参考资料

- [zhuanlan.zhihu.com/p/53](https://zhuanlan.zhihu.com/p/534550409)
- [mp.weixin.qq.com/s/IsNU](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s/IsNUsalsE2sZOd2AJlXtjQ)
- [zhuanlan.zhihu.com/p/55](https://zhuanlan.zhihu.com/p/552686677)

> 本文使用 [Zhihu On VSCode](https://zhuanlan.zhihu.com/p/106057556) 创作并发布

编辑于 2023-08-16 21:30・四川[PMP 是什么意思？](https://www.zhihu.com/question/27370884/answer/3356134697)

[

本文主要内容：一、PMP是什么？ 二、为什么越来越多的人考PMP？ 三、哪些人适合报考PMP？ 四、我考下PMP之...

](https://www.zhihu.com/question/27370884/answer/3356134697)