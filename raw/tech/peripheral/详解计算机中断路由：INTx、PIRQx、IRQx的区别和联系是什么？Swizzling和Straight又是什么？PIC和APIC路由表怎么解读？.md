---
title: "详解计算机中断路由：INTx、PIRQx、IRQx的区别和联系是什么？Swizzling和Straight又是什么？PIC和APIC路由表怎么解读？"
source: "https://zhuanlan.zhihu.com/p/648010145"
author:
  - "[[老狼​新知答主]]"
published:
created: 2026-05-02
description: "中断体系和PCI/PCIe是现代计算机系统构成要件中最重要的两大部分。二者的交集：PCI/PCIe设备的中断，它的使能和正确配置，尤其是中断路由的正确汇报，是设备能够正常工作甚至是主板能够启动的前提条件。这个过程中…"
tags:
  - "clippings"
---
[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog)

130 人赞同了该文章

目录

中断体系和PCI/PCIe是现代计算机系统构成要件中最重要的两大部分。二者的交集：PCI/PCIe设备的中断，它的使能和正确配置，尤其是中断路由的正确汇报，是设备能够正常工作甚至是主板能够启动的前提条件。这个过程中会涉及大量概念，如 [INTx](https://zhida.zhihu.com/search?content_id=232132391&content_type=Article&match_order=1&q=INTx&zhida_source=entity) 、 [PIRQx](https://zhida.zhihu.com/search?content_id=232132391&content_type=Article&match_order=1&q=PIRQx&zhida_source=entity) 、IRQx和 [Vector](https://zhida.zhihu.com/search?content_id=232132391&content_type=Article&match_order=1&q=Vector&zhida_source=entity) 等中断相关术语，它们既不同又紧密相关；基于传统 [8259](https://zhida.zhihu.com/search?content_id=232132391&content_type=Article&match_order=1&q=8259&zhida_source=entity) 的PIC模式和新的 [APIC模式](https://zhida.zhihu.com/search?content_id=232132391&content_type=Article&match_order=1&q=APIC%E6%A8%A1%E5%BC%8F&zhida_source=entity) 处理有所不同；桥片内部设备和桥片外部设备的处理有所不同；甚至PCI Slot和PCIe Slot的处理都有区别。厘清它们的区别和了解工作原理，是BIOS从业者的基本功之一。正确设置它，可以让主板顺利启动，各个设备正常工作；更进一步，优化的配置更能摊平中断的压力，让计算机系统性能更好。对于操作系统底层驱动程序员和计算机硬件工程师来讲，相关知识也非常重要。

遗憾的是，相关详细资料非常匮乏，尤其是中文资料几乎找不到，让很多人不得其门而入，成为了很多初级BIOS程序员的拦路虎。我曾在四五年前写过一篇文章： [老狼：计算机中断体系三：中断路由](https://zhuanlan.zhihu.com/p/26647697) ，很多读者表示不过瘾，好像都讲了，又似乎什么都没说清楚，有隔靴挠痒之感，不能实操。俗话说有图有真相，这次我们就从网上一篇Intel的ppt <sup><a href="#ref_1">[1]</a></sup> 中的两张图入手，来详细梳理相关概念和设置，并在最后结合代码进行一下分析：

![](https://picx.zhimg.com/v2-52f59fce9bfed95857a27ad545fdbc8f_1440w.jpg)

来源：参考资料1

![](https://pica.zhimg.com/v2-c84da4483147a401442450da4b8f6a8a_1440w.jpg)

来源：参考资料1

需要说明的是，资料比较陈旧，发布于2008年，当时的南桥甚至是ICH9，十几年过去了，尽管南桥从ICH变成了 [PCH](https://zhida.zhihu.com/search?content_id=232132391&content_type=Article&match_order=1&q=PCH&zhida_source=entity) ，还有些SOC甚至没有南桥，但 **相关基本概念却几乎完全没有改变，还能适用于今天的系统** 。如果能接触到Intel的最新PCH手册，可以自行查看BIOS Spec相关部分，也有类似图片。在我们开始今天的旅行之前，我希望读者能阅读过前面几篇介绍PCI/PCIe和中断的文章，以便能有个共同的讨论基础。如果你还没有看过，下面是传输门：

## INTx、PIRQx和IRQx

PCI spec为每个PCI设备定义了四个中断请求信号线，分别是 **INTA#，INTB#，INTC#和INTD#** ，如图：

![](https://pica.zhimg.com/v2-edbea7080b486a9dccf2791b787ae922_1440w.jpg)

如果PCI设备为单功能设备，则必须使用INTA#，对于多功能设备，各设备功能可任意接至PCI 总线的四条中断申请线INTA# 到INTD# 。PCI设备借助这些中断请求信号，通过电平触发方式向CPU发出中断请求。一个PCI设备可以有多个func，一个PCI Bus下可以有31个设备，一个PCI树下可有256个PCI Bus，才四条中断请求线，不可避免要进行中断共享。电平触发的方式让中断共享十分方便，INTx采取低电平触发方式，某个设备发生中断后，驱动某个INTx为低，触发中断，中断处理完毕后不再驱动该请求线。因为INTx信号线为开漏线路，只要上面所有的设备都不驱动它的时候，上拉电阻会自动将其置高。理论上来讲， **INTx的共享是采取线与的方式** ，有一个为低，即为低，会触发中断。

**计算机系统中的设备很多，它们各自用了哪些INTx？各个设备的INTx是如何线与的？这些线与后的结果是如何连接CPU的中断请求引脚？有没有设备直接将INTx连接CPU中断引脚？这些变量信息PCI Spec并未规定，各个平台和主板需要根据实际情况进行设计，而操作系统需要准确知道这些信息才能正确处理中断。这些变量信息就是中断路由表，它由主板硬件抽象层：BIOS，来提供** 。

古老的计算机主板上有两颗级联的8259芯片，级联后通过CPU的INTR引脚告诉CPU发生了中断。每个8259提供8个IRQ引脚，两个有15个IRQ引脚（级联用了一个，16-1=15），它们就是 **IRQx** 。级联的8259逻辑后来被整合进入南桥的 [LPC](https://zhida.zhihu.com/search?content_id=232132391&content_type=Article&match_order=1&q=LPC&zhida_source=entity) 中，IRQx引脚不再引出，与之对应的是，南桥（ICH/PCH）提供 **8个** PIRQ（PCI IRQ）引脚，它们就是 **PIRQx** （PIRQA#到PIRQH# **）** ，负责连接外部PCI中断请求。与传统的PIC模式的IRQx对应，APIC模式的 [IO APIC](https://zhida.zhihu.com/search?content_id=232132391&content_type=Article&match_order=1&q=IO+APIC&zhida_source=entity) 也有数量不等的中断入口 **INTINx** ，每个IO APIC常见的中断入口是24个，通常CPU和桥片上都有各自的IO APIC。INTINx并不是物理引脚或者硬件连线，而是通过message的软方式存在。

从PCI设备的INTx，到南桥的PIRQx引脚，再到LPC中的IRQx逻辑（或者IO APIC的INTINx），一个中断从源头到最后落地， **经历了三级两层映射：INTx -> PIRQx -> IRQx** 。这个映射关系是中断路由的精髓，那么它们是硬连线的，还是可以自由配置的呢？这要分芯片内部设备和外部设备两种情况来讲。

## 极大灵活度的内部设备中断路由

Intel为桥片中或者CPU中的设备，提供了最大程度的灵活度，方便整机厂商根据实际情况来平衡中断请求。三级两层映射关系都可以自由调节。我们一层层剥开来看，先看前端：INTx -> PIRQx的映射。

![](https://pic3.zhimg.com/v2-2e956ba808d32a86d5b77d6e67b697c4_1440w.jpg)

来源：参考资料1

注意红框部分，南桥内部设备（都在Bus 0上），几乎每个设备的每个Func，都通过两组寄存器（IP和IR寄存器），来灵活配置，几乎做任何映射。如LPC设备（Device 31，Func 0），可以通过D31IP寄存器，控制其中的每个Func使用INTx中的任何一个（当然只有一个Func的话，必须用INTA#）,之后可以通过D31IR，来控制31号设备的四个INTx虚拟连接到八个PIRQx中的任意四个。可谓是提供了最大的灵活性。

后端PIRQx -> IRQx的连接可以通过LPCBR来自由调节：

![](https://pic4.zhimg.com/v2-b41cf92a37fbdb6372b6d56f628570d5_1440w.jpg)

来源：参考资料1

图中黄色的部分，就是PIRQx可以配置的IRQx，注意IRQx的范围有限制，不能被配置到Legacy保留的IRQx上。PIRQx和IO APIC的INTINx关系则是固定的一一对应（想想为什么从16开始？），不能配置。

桥片中设备通过三级两层映射，三组寄存器，来提供了极大的灵活性。那么主板上的其他外部设备呢？

## 外部设备和Swizzling

PCI和PCIe的外部设备，包括固定连线和Slot扩展槽，在PCI和PCIe的Spec中有推荐中断路由，也在图中有所表示：

![](https://pica.zhimg.com/v2-3a10b2f0f3e91843b916da1093987b3e_1440w.jpg)

来源：参考资料1

这里PCI设备和PCIe的情况有所不同，我们分成两部分来讲。

### 外部PCI设备

对主板上的PCI扩展插槽，用户插入什么设备，插在哪个槽内都不能在出厂时确定。我们这里要尽量考虑平衡原则和效率原则。我们将所有插槽的INTA#~INTD#分成四组串联起来如何？这样离得最近的Slot 1高兴了，每个都是我优先！万一有个用户把重要的网卡插在slot 4，效率会严重下降。在充分考虑到PCI设备绝大多数都是单功能设备（仅使用INTA#信号，很少使用INTB#和INTC#信号，而INTD#信号更是极少使用），PCI SIG推荐PCI to PCI bridge后slot连接关系应该组成如下图：

![](https://picx.zhimg.com/v2-759042714916e298fe96820dced860c9_1440w.jpg)

即Slot1 INTA#->Slot2 INT B#->Slot3 INTC#->Slot4 INTD#。这种 **交错叫做Swizzling** ，也就是上上图中的黄框部分。Swizzling交错之后的INTx，再经过 [Straight](https://zhida.zhihu.com/search?content_id=232132391&content_type=Article&match_order=1&q=Straight&zhida_source=entity) 映射，即红框部分的直接映射方法变成PIRQx。

### 外部PCIe设备

PCIe的设备有一个PCI设备没有的问题，每个PCIe链路下只有一个EP（End Point）设备，这个设备的中断请求信号（当然是虚拟的）一般是INTA#，如果RC下面的所有链路都采用Straight方式，即INTA#都连接PIRQA，则PIRQA的负担过重。于是PCIe采取一种类似PCI Slot插槽Swizzling的方式，不过是经过 [PCIe Root Port](https://zhida.zhihu.com/search?content_id=232132391&content_type=Article&match_order=1&q=PCIe+Root+Port&zhida_source=entity) 的软转换的方式，也就是上上图中的INTx Mapping Swizzling:

结合

![](https://pic2.zhimg.com/v2-4fc310eef1077729443403d11757ea33_1440w.jpg)

经过这层Swizzling交错，再通过Straight方式映射到PIRQx，即可。

转成PIRQx之后，PIRQx和IRQx或者INTINx的映射关系，和内部设备相同。

## A Case Study

我们来实际看看一些代码，Intel Purley服务器的代码已经开源：

[github.com/tianocore/ed](https://link.zhihu.com/?target=https%3A//github.com/tianocore/edk2-platforms/blob/master/Platform/Intel/PurleyOpenBoardPkg)

我们可以在代码里面寻找对PCH内部设备的INTx -> PIRQx的映射关系的Program，如寻找D31IP和D31IR。完毕后对照ACPI table：

[github.com/tianocore/ed](https://link.zhihu.com/?target=https%3A//github.com/tianocore/edk2-platforms/blob/master/Platform/Intel/PurleyOpenBoardPkg/Acpi/BoardAcpiDxe/Dsdt/PlatformPciTree_WFP.asi)

来交叉验证。因为篇幅的关系，这里不再累述，我们来看一下一个片段， **PCIe Root Port下面设备的Swizzling** ：

![](https://pic4.zhimg.com/v2-5a69ce60144bb85757e0b2437850bda5_1440w.jpg)

![](https://pic2.zhimg.com/v2-c5bb4743b21c589107f7f877a8fc637f_1440w.jpg)

![](https://pic1.zhimg.com/v2-82d88a4f1510b31c8a21f79337d79836_1440w.jpg)

![](https://pic3.zhimg.com/v2-fa5f316ce5a75fd97ea2b5f6802679fa_1440w.jpg)

结合PCIe的Swizzling规则：

![](https://pic2.zhimg.com/v2-4fc310eef1077729443403d11757ea33_1440w.jpg)

先映射INTx，之后通过Straight规则映射到PIRQx

![](https://pic4.zhimg.com/v2-78a656a855d1f0f92879a83c5dfb87f7_1440w.jpg)

之后到IOAPIC的INTINx一一映射（从16开始）：

![](https://pic2.zhimg.com/v2-f46817fa59f3f43ac8d8a04cf99ea961_1440w.jpg)

因为这是第一个IOAPIC，所以GSI（详见ACPI Spec）和INTINx数字是一致的。

我想通过这些讲解，PCH内部和外部的PCIe设备的中断路由应该很清楚了。 **最后给大家留个思考题：大家知道，尽管少了一些，但CPU里面也有一些PCIe设备（和有些Root Port），它们INTx、PIRQx和IRQx的映射关系是如何呢？如我们的Purley平台支持多路CPU，在路由文件PlatformPciTree\_WFP.asi中能不能找到对应的关系呢？同样的文件中，问什么GSI有大于24的，甚至上百的数字呢？ARxx和AHxx的区别是什么呢？**

![](https://pic1.zhimg.com/v2-4b69b28c88315be0d28887811fe1a610_1440w.jpg)

知道的同学可以在评论区留言，相互探讨一下。

欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。关注公众号，留言“资料”，有一些公开芯片资料供下载。

![](https://pic1.zhimg.com/v2-91d380fba0955ebce85e5bf264d63cf6_1440w.jpg)

## 参考

1. interrupt-in-sandy-bridge-and-x86-platform [https://www.slideserve.com/abra/interrupt-in-sandy-bridge-and-x86-platform-taeweon-suh](https://www.slideserve.com/abra/interrupt-in-sandy-bridge-and-x86-platform-taeweon-suh)

还没有人送礼物，鼓励一下作者吧

编辑于 2023-08-05 13:16・上海