---
title: "ARM的安全启动—ATF/TF-A以及它与UEFI的互动"
source: "https://zhuanlan.zhihu.com/p/391101179"
author:
  - "[[老狼​新知答主]]"
published:
created: 2026-05-02
description: "ARM架构的CPU不断地在各个方向对x86体系发动一波又一波的攻击，甚至在传统x86的强势领域——服务器端，性能差距也在不断接近。作为行业风向标的云服务（CSP）厂商，它们的ARM服务器装机量持续攀升。如亚马逊自研的…"
tags:
  - "clippings"
---
[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog)

196 人赞同了该文章

ARM架构的CPU不断地在各个方向对x86体系发动一波又一波的攻击，甚至在传统x86的强势领域——服务器端，性能差距也在不断接近。作为行业风向标的云服务（CSP）厂商，它们的ARM服务器装机量持续攀升。如亚马逊自研的基于 [ARM Neoverse](https://zhida.zhihu.com/search?content_id=175041893&content_type=Article&match_order=1&q=ARM+Neoverse&zhida_source=entity) 的Gravition2 CPU，在AWS EC2的装机量已经几乎和x86持平：

![](https://picx.zhimg.com/v2-ea2d747c649a8d52cc197e927bd07883_1440w.jpg)

来源：ARM官网

国际CSP全面拥抱ARM服务器的主要原因是技术和成本可控，而性能差距可以接受。出于同样的原因，国内以 [鲲鹏](https://zhida.zhihu.com/search?content_id=175041893&content_type=Article&match_order=1&q=%E9%B2%B2%E9%B9%8F&zhida_source=entity) 和 [飞腾](https://zhida.zhihu.com/search?content_id=175041893&content_type=Article&match_order=1&q=%E9%A3%9E%E8%85%BE&zhida_source=entity) 为代表的ARM国产化势力也在持续发力，未来从技术上看希望很大（姑且不论生产卡脖子的问题）。在消费客户端，ARM的成熟度更高。

ARM如此被看好， [百敖BIOS](https://zhida.zhihu.com/search?content_id=175041893&content_type=Article&match_order=1&q=%E7%99%BE%E6%95%96BIOS&zhida_source=entity) 自然会全面支持。目前为止，我们在ARM端除了支持国内的鲲鹏和飞腾，也支持国外的NXP。在项目运行中，我发现ARM体系中一些基本概念普及度很低，如ATF/TF-A、Power State Coordination Interface (PSCI)、SMC、Server\_Base\_Boot\_Requirements（SBBR）、Server\_Base\_System\_Architecture（SBSA）、Management Mode（MM）、OPTEE等；还有很多混淆，如ATF和TZ（ [TrustZone](https://zhida.zhihu.com/search?content_id=175041893&content_type=Article&match_order=1&q=TrustZone&zhida_source=entity) ）。我计划写一些文字，分别介绍一下它们，尤其是和固件相关的技术。于此同时，我觉得学习最好能融会贯通，我们将会把这些ARM的概念和x86相应的技术进行对比，希望这样更能够强化大家的理解和记忆。今天就带来第一篇：ATF（ARM Trusted Firmware）。

## ATF的由来

TF(Trusted Firmware)是ARM在Armv8引入的安全解决方案，为安全提供了整体解决方案。它包括启动和运行过程中的特权级划分，对Armv7中的TrustZone（TZ）进行了提高，补充了启动过程信任链的传导，细化了运行过程的特权级区间。TF实际有两种Profile，对ARM Profile A的CPU应用TF-A，对ARM Profile M的CPU应用TF-M。我们一般接触的都是TF-A，又因为这个概念是ARM提出的，有时候也缩写做ATF（ARM Trusted Firmware），所以本文对ATF和TF-A不再做特殊说明，ATF也是TF-A，对TF-M感兴趣的读者可以自行查询官网 [^1] 。

有些同学混淆了ATF和TZ的区别。实际上，TZ更多的是和Intel的 [SGX](https://zhida.zhihu.com/search?content_id=175041893&content_type=Article&match_order=1&q=SGX&zhida_source=entity) 概念对应，是在CPU和内存中区隔出两个空间：Secure空间和Non-Secure空间。而ATF中有个Firmware概念，它实际上是Intel的Boot Guard、特权级和提高版的TZ的混合体。它在保有TZ的Secure空间和Non-Secure空间的同时，划分了EL0（Exception level 0）到EL3四个特权级：

![](https://pic4.zhimg.com/v2-f683e1704e9fd3143cf708d1a1bb1453_1440w.jpg)

其中EL0和EL1是ATF必须实现的，EL2和EL3是可选的。实际上，没有EL2和EL3，整个模型就基本退化成了ARMv7的TZ版本。从高EL转低EL通过ERET指令，从低EL转高EL通过exception，从而严格区分不同的特权级。其中EL0、EL1、EL2可以分成NS-ELx(None Secure ELx)和S-ELx（Secure ELx）两种，而EL3只有安全模式一种。

ATF带来最大的变化是信任链的建立（Trust Chain），整个启动过程包括从EL3到EL0的信任关系的打通，过程比较抽象。NXP的相关文档 [^2] 比较充分和公开，它的源代码也是开源的 [^3] 。我们结合它的文档和源代码来理解一下。

## ATF启动流程

ARM开源了ATF的基本功能模块，大家可以在这里下载：

```
git clone  https://github.com/ARM-software/arm-trusted-firmware.git
```

里面已经包含了不少平台，但这些平台的基础代码有些是缺失的，尤其是和芯片部分和与UEFI联动部分。这里我推荐它的一个分支：NXP的2160A芯片的实现。

ARM推出了System Ready计划，效果相当不错，关于它我们今后再单独讲。2020年底，ARM在OSFC推出新的一批System Ready机型 [^4] ，NXP 2160A名列其中：

![](https://pic1.zhimg.com/v2-d1d5220dedc60910f7ac0e14dff7f698_1440w.jpg)

来源：参考资料4

ATF代码下载可以用：

```
git clone https://source.codeaurora.org/external/qoriq/qoriq-components/atf -b LX2160_UEFI_ACPI_EAR3
```

UEFI代码下载可以用图片上的地址。我们可以把参考资料2和这些代码对照来看，加深理解。  
支持ATF的ARM机器，启动过程如下

![](https://pic1.zhimg.com/v2-6d9940fe5dfe58589e1357d2514c2328_1440w.jpg)

来源：参考资料2

注意蓝色箭头上的数字，它是启动顺序。一切起源于在EL3的BL1。

**BL1：Trusted Boot ROM**

启动最早的ROM，它可以类比Boot Guard的ACM，

不过它是在CPU的ROM里而不是和BIOS在一起，是一切的信任根。它的代码在这里：

![](https://pic2.zhimg.com/v2-17396d3fb2c7fcdc24f227cad3682d77_1440w.jpg)

代码很简单（略去不重要内容）：

```
func bl1_entrypoint
        ....
    bl    bl1_early_platform_setup
    bl    bl1_plat_arch_setup
        ....
    bl    bl1_main
        ....
    b    el3_exit
endfunc bl1_entrypoint
```

bl1\_main()开始就是c程序了，那c运行依靠的堆和栈空间在哪里呢？在CPU内部的SRAM里。SRAM一启动就已经可以访问了，bl1\_plat\_arch\_setup（）简单地在其中划分出来一块作为Trusted SRAM给c程序用，而不用像x86在cache里面扣一块出来，简单了很多。

BL1主要目的是建立Trusted SRAM、exception vector、初始化串口console等等。然后找到并验证BL2（验签CSF头），然后跳过去。

**BL2：Trusted Boot Firmware**

同样运行在EL3上的BL2和BL1一个显著的不同是它在Flash上，作为外置的一个Firmware，它的可信建立在BL1对它的验证上。它也有完整的源代码：

![](https://pic1.zhimg.com/v2-9d76b572cc020ead68a8b2043779f564_1440w.jpg)

它也会初始化一些关键安全硬件和软件框架。更主要的是，也是我希望大家下载NXP 2160A的分支的重要原因，BL2会初始化很多硬件，而这些硬件初始化在x86中是BIOS完成的（无论是在PEI中还是包在FSP/AGESA中），而在ARM的ATF体系中，很多种CPU是在BL2中完成的。2160A在Plat目录下提供了很多开源的硬件初始化代码，供ATF BL2框架代码调用。比较重要的是bl2\_main()

```
void bl2_main(void)
{
        ...
    bl2_arch_setup();
        ...
    /* initialize boot source */
    bl2_plat_preload_setup();
    /* Load the subsequent bootloader images. */
    next_bl_ep_info = bl2_load_images();
        ...
    bl2_run_next_image(next_bl_ep_info);
}
```

最重要的两步都在这个函数中完成：初始化硬件和找到BL31。

bl2\_plat\_preload\_setup()中会初始化一堆硬件，包括读取RCW初始化Serdes等，对内存初始化感兴趣的人（比如我）也可以在里面找到初始化DDR4的代码：dram\_init（），它在Plat\\nxp\\drivers\\ddr\\nxp-ddr下。比较遗憾的是DDR4 PHY的代码是个Binary，不含源码，这里对DDR4的初始化仅仅聚焦设置timing寄存器和功能寄存器，而没有内存的Training过程。

Anyway，x86带内初始化硬件的很多代码ARM ATF体系都包括在BL2中，而不在UEFI代码中，这是和x86 UEFI代码的一个显著区别。部分原因这些代码都要求是Secure的。更加糟糕的是，很多ARM平台，BL1和BL2，甚至后面的BL31都是以二进制的形式提供，让定制显得很困难。BL2能否提供足够的信息和定制化选择给固件厂商和提供足够信息给UEFI代码，考验BL2的具体设计实现。NXP在两个方面都做的不错，不但提供RCW等配置接口，还开源了大部分代码，十分方便。

BL2在初始化硬件后，开始寻找BL3的几个小兄弟：BL31，BL32和BL33。它先找到BL31，并验签它，最后转入BL31。

**BL31：EL3 Runtime Firmware**

BL31作为EL3最后的安全堡垒，它不像BL1和BL2是一次性运行的。如它的runtime名字暗示的那样，它通过SMC为Non-Secure持续提供设计安全的服务。关于SMC的调用calling convention我们今后再详细介绍，这里只需要知道它的服务主要是通过BL32。它负责找到BL32，验签，并运行BL32。

**BL32：OPTee OS + 安全app**

BL32实际上是著名的Open Portable Trusted Execution Enveiroment [^5] OS，它是由Linaro创立的。它是个很大的话题，我们今后再细聊。现在仅需要知道OPTee OS运行在 S-EL1，而其上的安全APP运行在S-EL0。OPTee OS运行完毕后，返回EL3的BL31，BL31找到BL33，验签它并运行。

**BL33： Non-Trusted Firmware**

BL33实际上就是UEFI firmware或者uboot，也有实现在这里直接放上Linux Kernel。2160A的实现是UEFI和uboot都支持。我们仅仅来看UEFI的路径。

第一次看到UEFI居然是Non-Trusted，我是有点伤心的。UEFI运行在NS\_EL2，程序的入口点在ARM package

```
edk2/ArmPlatformPkg/PrePi/AArch64/ModuleEntryPoint.S
```

做了一些简单初始化，就跳到C语言的入口点CEntryPoint( )。其中ArmPlatformInitialize（）做了一些硬件初始化，调用了

edk2-platforms/Silicon/NXP/

的代码。重要的是PrimaryMain（）。

PrimaryMain（）有两个实例，2160A NXP选择的是PrePI的版本（edk2/ArmPlatformPkg/PrePi/MainUniCore.c），说明它跳过了SEC的部分，直接进入了PEI的后期阶段，在BL2已经干好了大部分硬件初始化的情况下，这个也是正常选择。PrePI的实例直接调用PrePiMain（）（仅保留重要部分）

```
VOID
PrePiMain (
  IN  UINTN                     UefiMemoryBase,
  IN  UINTN                     StacksBase,
  IN  UINT64                    StartTimeStamp
  )
{
  ....
  ArchInitialize ();
  SerialPortInitialize ();
  InitializeDebugAgent (DEBUG_AGENT_INIT_POSTMEM_SEC, NULL, NULL);
  // Initialize MMU and Memory HOBs (Resource Descriptor HOBs)
  Status = MemoryPeim (UefiMemoryBase, FixedPcdGet32 (PcdSystemMemoryUefiRegionSize));
  BuildCpuHob (ArmGetPhysicalAddressBits (), PcdGet8 (PcdPrePiCpuIoSize));
  BuildGuidDataHob (&gEfiFirmwarePerformanceGuid, &Performance, sizeof (Performance));
  SetBootMode (ArmPlatformGetBootMode ());
  // Initialize Platform HOBs (CpuHob and FvHob)
  Status = PlatformPeim ();
  ....
  Status = DecompressFirstFv ();
  Status = LoadDxeCoreFromFv (NULL, 0);
}
```

从中我们可以看到，这里几乎就是UEFI PEI阶段DXEIPL的阶段了，后面就是直接DXE阶段。

好了，我们来梳理一下，ATF整个信任链条是逐步建立的：

![](https://pica.zhimg.com/v2-8a039e5a3714383b0ee98376a40e94e8_1440w.jpg)

来源：参考资料2

从作为信任根的BL1开始，一步一步验签CSF头中的签名，最后来到BL33，后面就是OS了。那BL33后面怎么就断了呢？其实后面的验签就是 [UEFI Secure Boot](https://zhida.zhihu.com/search?content_id=175041893&content_type=Article&match_order=1&q=UEFI+Secure+Boot&zhida_source=entity) 了

## 结语

ATF的官网一张图包含了更多的信息：

![](https://pic3.zhimg.com/v2-9501cfb265ec465ad2f8acf977fa47c2_1440w.jpg)

如果你仅仅对ATF的UEFI启动路径感兴趣，下面这张图可能更加简单明了：

![](https://pic2.zhimg.com/v2-fac683117333c274fd22832772342d81_1440w.jpg)

NXP 2160A的开源和良好的文档，让我们可以在一个具体的平台上切片观察ATF的具体实现，建议大家仔细阅读参考资料2和下载代码来看看。

**更多系统安全文章：**

欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。

![](https://pica.zhimg.com/v2-121ecd3d4080deb1c557bf47dc00d246_1440w.jpg)

用微信扫描二维码加入UEFIBlog公众号

## 参考

还没有人送礼物，鼓励一下作者吧

编辑于 2021-07-20 18:55[安全](https://www.zhihu.com/topic/19569215)[ARM 架构](https://www.zhihu.com/topic/19613104)[芯片（集成电路）](https://www.zhihu.com/topic/19583435)[IC设计多个项目推荐，快速积累项目经验？](https://zhuanlan.zhihu.com/p/683556217)

[

了解过IC设计行业的朋友都知道，IC入门门槛标准是天然存在的， 项目是IC设计工程师的护城河。记得之前看到过一位大...

](https://zhuanlan.zhihu.com/p/683556217)

[^1]: TF官网 [https://www.trustedfirmware.org/](https://www.trustedfirmware.org/)

[^2]: NXP SDK doc [https://www.nxp.com.cn/docs/en/user-guide/LSDKUG\_Rev20.04\_290520.pdf](https://www.nxp.com.cn/docs/en/user-guide/LSDKUG_Rev20.04_290520.pdf)

[^3]: NXP TFA Src [https://source.codeaurora.org/external/qoriq/qoriq-components/atf](https://source.codeaurora.org/external/qoriq/qoriq-components/atf)

[^4]: OSFC ARM topic [https://cfp.osfc.io/media/osfc2020/submissions/KB3H9V/resources/ArmSystemReady\_OSFC2020\_9q9i7OA.pdf](https://cfp.osfc.io/media/osfc2020/submissions/KB3H9V/resources/ArmSystemReady_OSFC2020_9q9i7OA.pdf)

[^5]: OPTee官网 [https://www.op-tee.org/](https://www.op-tee.org/)