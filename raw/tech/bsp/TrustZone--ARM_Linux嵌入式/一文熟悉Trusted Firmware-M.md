---
title: "一文熟悉Trusted Firmware-M"
source: "https://zhuanlan.zhihu.com/p/651683753"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "大家好！我是安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！ 前言最近有位朋友私信说相看一篇关于TFM的博客，于是今天乘着一个人的七夕节，来满足一下这位朋…"
tags:
  - "clippings"
---
6 人赞同了该文章

---

大家好！我是安全工程师Hkcoco！

欢迎大家关注我的微信公众号： [TrustZone](https://zhida.zhihu.com/search?content_id=232947795&content_type=Article&match_order=1&q=TrustZone&zhida_source=entity) | CSDN：Hkcoco

获取更多精彩内容哦！！！

---

## 前言

最近有位朋友私信说相看一篇关于TFM的博客，于是今天乘着一个人的七夕节，来满足一下这位朋友，话不多说开始吧。

[Trusted Firmware](https://zhida.zhihu.com/search?content_id=232947795&content_type=Article&match_order=1&q=Trusted+Firmware&zhida_source=entity) 是ARM基于自家具有TrustZone功能的处理器所实作的开源程序，其主要目的是让相关厂商可以更快速地将TrustZone构架性的整合到产品当中，此外同时也是厂商要取得ARM [PSA certification](https://zhida.zhihu.com/search?content_id=232947795&content_type=Article&match_order=1&q=PSA+certification&zhida_source=entity) 认证的参考资源。

由于近年来资安议题逐渐受到重视，愈来愈多客户开始寻找结合硬件实现的安全方案，因此就有这个机会了解一下Trusted Firmware软件构架及其中的 [secure boot](https://zhida.zhihu.com/search?content_id=232947795&content_type=Article&match_order=1&q=secure+boot&zhida_source=entity) 流程。

Trusted Firmware包含了几个项目，这篇文章是以其中的Trusted Firmware-M（Arm v7-M & v8-M）为例，如果是A系列的处理器则有Trusted Firmware-A可供参考。

## 概要

## 架构

首先先来看Trusted Firmware-M的构架：

![](https://pic4.zhimg.com/v2-8187c08ba1027816102ee94aec8b9763_1440w.jpg)

Figure 1: FF-M compliant design with TF-M

Trusted Firmware-M（TF-M）为Armv8-M、Armv8.1-M架构（例如 [Cortex-M33](https://zhida.zhihu.com/search?content_id=232947795&content_type=Article&match_order=1&q=Cortex-M33&zhida_source=entity) 、Cortex-M23、CortexM55、CortexM85处理器）和双核平台实现了安全处理环境（SPE）。它是与PSA认证指南相一致的平台安全架构参考实施，使芯片、实时操作系统和设备能够获得PSA认证。 TF-M依赖于非安全处理环境（NSPE）和安全处理环境之间的隔离边界。

最主要的概念是透过硬件控制（记忆体位置区间、权限控管等）的方式，将原先的执行环境切割成secure processing enviroment（SPE）和non secure processing enviroment（NSPE）两个执行环境。

TF-M包括：

- 安全引导以验证NSPE和SPE镜像
- TF-M核心，用于控制SPE内以及与NSPE的隔离、通信和执行
- 加密、内部可信存储（ITS）、受保护存储（PS）、固件更新和认证安全服务

## 栗子

SPE主要是提供需要安全保护的服务，例如固件更新、加解密； 而NSPE则是一般使用者执行应用程序的环境。

如果在NSPE中执行的应用程序使用到secure层级的服务，则需要透过特定API来呼叫（这个概念类似操作系统的user-space和kernel-space会透过system call来沟通），这样可以限制NSPE的操作权限，避免重要机密资源外泄。

听起来有点抽象，那就来举个具体的例子吧！

![](https://picx.zhimg.com/v2-a72fb12e6d02699e9df6bc72875987b3_1440w.jpg)

应用场景

假设有一个应用场景是：一个应用程序需要使用硬件所保护的OTP（one-time programmable）secure key来进行数据的加解密。![](https://pic4.zhimg.com/v2-a08114b2ff4127a415090702b45a95c3_1440w.jpg)

執行流程

- 1、Task（应用程序）呼叫整合进RTOS的Crypto PSA（Platform Security Architecture）API，发出Crypto request。
- 2、TF-M core收到request，由context manager产生对应的request context（包含执行此request的stack、crypto service ID等）。
- 3、Crypto Service接收到此request，接着呼叫hardware API从OTP读取secure key并进行加解密算法。
- 4、加解密完成，Crypto Service将加解密后的结果透过context回传给Task。

如上述例子，由于 **重要的数据或是key仅能在SPE下存取** ，因此透过此构架来处理加解密需求，就能 **确保在NSPE执行的应用程序不会取得key。**

其实这里和TFA是极其类似的思想。

## 安全启动-Secure Boot

除了NSPE和SPE两个环境的沟通流程之外，secure boot也是Trusted Firmware很重要的设计环节。

Secure boot最主要的目的就是防止系统使用到恶意的固件程序或操作系统，在开机流程中，boot code会先透过密码学（cryptography）算法验证是否为可信任的的程序，如果验证成功即会开始执行，否则中止流程。

在Trusted Firmware-M的secure boot流程如下：

![](https://pic4.zhimg.com/v2-a316de716e427df426103b8293c0eaa5_1440w.jpg)

在这里插入图片描述

## Boot loader stage 1（BL1）

此阶段主要是必要的硬件初始化或是设定， **因此BL1 boot code必须要是可信任且不可被窜改** 。在执行完初始化后，就会跳到BL2的entry point继续执行BL2。

```
The bootloader code must be stored and executed from ROM or such part of flash memory which supports write protection.
```

## Boot loader stage 2（BL2）

BL2负责其他需要的初始化操作，例如启动 [MCUboot](https://zhida.zhihu.com/search?content_id=232947795&content_type=Article&match_order=1&q=MCUboot&zhida_source=entity) 前所需的设定或检查，接着就会把执行移交给MCUboot。

## MCUboot

MCUboot是针对32-bit microcontroller所设计的secure bootloader，其中包含完整的程序验证流程，因此也是Trusted Firmware-M secure boot流程的核心。而MCUboot本身是独立的open source project，因此也能应用在其他项目上。

## TF-M

TF-M会依据memory layout放置在指定的內存位置，而MCUboot会先去该位置取得TF-M binary code，并且进行相关验证确认，如果TF-M已被加密，也会在这阶段进行解密。在确认完TF-M是正确且可信任后，就会加载TF-M。

要注意的是，Trusted Firmware-M手册中有提到，验证和解密所需key建议放在OTP memory中，以确保不可修改。

```
ROTPK（root of trust public key）can be stored in a one-time-programmable（OTP）memory.
```

此外，由于需要在加载TF-M前就对TF-M binary进行验证，因此上一个段落提到的crypto流程不适用在这里， **我们需要额外的crypto API来处理验证与加解密。**

一般这个时候使用的驱动和接口会封装在BL2。

## RTOS

最后阶段就是加载RTOS以及应用程序。这阶段的流程和上一个阶段相似，同样要先验证确认且解密，确认无误后再加载并执行。

## 实际操作

了解secure boot流程后，我们实际使用Trusted-Firmware-M来测试secure boot流程。

代码链接： [git.trustedfirmware.org](https://link.zhihu.com/?target=https%3A//git.trustedfirmware.org/TF-M/trusted-firmware-m.git/)

## 工具和环境

- [QEMU emulator](https://zhida.zhihu.com/search?content_id=232947795&content_type=Article&match_order=1&q=QEMU+emulator&zhida_source=entity) version 4.2.1
- Trusted-Firmware-M v1.5.0
- Host OS: Ubuntu 20.04.1 x86\_64

## QEMU

- Machine: MPS2 AN521 CPU: Cortex-m33(Armv8-M)

## Memory Layout of MPS2 AN521

```
1* 0x0000_0000 BL2 - MCUBoot (0.5 MB)
 2* 0x0008_0000 Secure image     primary slot (0.5 MB)
 3* 0x0010_0000 Non-secure image primary slot (0.5 MB)
 4* 0x0018_0000 Secure image     secondary slot (0.5 MB)
 5* 0x0020_0000 Non-secure image secondary slot (0.5 MB)
 6* 0x0028_0000 Scratch area (0.5 MB)
 7* 0x0030_0000 Protected Storage Area (20 KB)
 8* 0x0030_5000 Internal Trusted Storage Area (16 KB)
 9* 0x0030_9000 OTP / NV counters area (8 KB)
10* 0x0030_B000 Unused (984 KB)
```

## The configuration of MPS2 AN521

```
1static void mps2tz_an521_class_init(ObjectClass *oc, void *data)
 2{
 3    MachineClass *mc = MACHINE_CLASS(oc);
 4    MPS2TZMachineClass *mmc = MPS2TZ_MACHINE_CLASS(oc);
 5
 6    mc->desc = "ARM MPS2 with AN521 FPGA image for dual Cortex-M33";
 7    mc->default_cpus = 2;
 8    mc->min_cpus = mc->default_cpus;
 9    mc->max_cpus = mc->default_cpus;
10    mmc->fpga_type = FPGA_AN521;
11    mc->default_cpu_type = ARM_CPU_TYPE_NAME("cortex-m33");
12    mmc->scc_id = 0x41045210;
13    mmc->sysclk_frq = 20 * 1000 * 1000; /* 20MHz */
14    mmc->apb_periph_frq = mmc->sysclk_frq;
15    mmc->oscclk = an505_oscclk; /* AN521 is the same as AN505 here */
16    mmc->len_oscclk = ARRAY_SIZE(an505_oscclk);
17    mmc->fpgaio_num_leds = 2;
18    mmc->fpgaio_has_switches = false;
19    mmc->fpgaio_has_dbgctrl = false;
20    mmc->numirq = 92;
21    mmc->uart_overflow_irq = 47;
22        
23        /* For v8M, initial value of the Secure VTOR */
24    mmc->init_svtor = 0x10000000; 
25    mmc->sram_addr_width = 15;
26    mmc->raminfo = an505_raminfo; /* AN521 is the same as AN505 here */
27    mmc->armsse_type = TYPE_SSE200;
28    mmc->boot_ram_size = 0;
29    mps2tz_set_default_ram_info(mmc);
30}
```

## 编译

Build TF-M with MCUboot

```
1cmake -S . -B cmake_build -DTFM_PLATFORM=arm/mps2/an521 \
2  -DTFM_TOOLCHAIN_FILE=toolchain_GNUARM.cmake \
3  -DTEST_BL2=ON
4
5cmake --build cmake_build -- install
```

## Run QEMU emulator

```
1# 0x10080000 the base address of Secure image
2qemu-system-arm -machine mps2-an521 -cpu cortex-m33 \
3  -kernel ~/trusted-firmware-m/cmake_build/install/outputs/bl2.axf \
4  -device loader,file="~/trusted-firmware-m/cmake_build/install/outputs/tfm_s_signed.bin",addr=0x10080000 \
5  -serial stdio -display none
```

## Result

```
1#### Execute test suites for the MCUBOOT area ####
 2Running Test Suite MCUboot Integration test (TFM_MCUBOOT_INTEGRATION_TEST_0XXX)...
 3> Executing 'TFM_MCUBOOT_INTEGRATION_TEST_0001'
 4  Description: 'Integration invalid image signature test'
 5  TEST: TFM_MCUBOOT_INTEGRATION_TEST_0001 - PASSED!
 6TESTSUITE PASSED!
 7
 8*** MCUBOOT test suites summary ***
 9Test suite 'MCUboot Integration test (TFM_MCUBOOT_INTEGRATION_TEST_0XXX)' has PASSED
10
11*** End of MCUBOOT test suites ***
```

## 小结

其实关于TFM和TFA会有部分的区别，但是整个思想和架构是具有迁移性的，希望那位私信让我分享一些TFM的伙伴看完此文有所收获，那将万分荣幸。

## 参考资料

- [【TrustedFirmware-M (TF-M)】](https://link.zhihu.com/?target=https%3A//www.trustedfirmware.org/projects/tf-m/)
- [【tf-m-user-guide】](https://link.zhihu.com/?target=https%3A//tf-m-user-guide.trustedfirmware.org/introduction/index.html)

> 本文使用 [Zhihu On VSCode](https://zhuanlan.zhihu.com/p/106057556) 创作并发布

编辑于 2023-08-22 20:19・四川[计算机专业网络安全就业前景好，还是软件前端开发前景好?](https://www.zhihu.com/question/1935655981653667977/answer/1941465117360366001)

[在 IT 行业飞速发展的当下，计算机专业的同学面临着不少职业方向的选择，其中网络安全和软件前端开发备受关注，两者各有优势与发展特点，而选择适合自己的方向，再辅以系统的学习，往往...](https://www.zhihu.com/question/1935655981653667977/answer/1941465117360366001)