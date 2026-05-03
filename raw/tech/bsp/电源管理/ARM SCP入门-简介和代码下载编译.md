---
title: "ARM SCP入门-简介和代码下载编译"
source: "https://zhuanlan.zhihu.com/p/2025239399823065284"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "这个配图有点唬人，要说 权利巅峰还得是太上皇，夺舍太上皇就有点不讲武德了。在现代SoC芯片中CPU只能说是皇帝，掌握资源命脉的还得是太上皇SCP。 讲SoC前我们先看下传统的PC构架，当你去买电脑的时候，首先决定价…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

3 人赞同了该文章

![](https://pic2.zhimg.com/v2-0b5dcc27e122643c87165f1ee3b6eb21_1440w.jpg)

这个配图有点唬人，要说 **权利巅峰** 还得是 **太上皇** ，夺舍太上皇就有点不讲武德了。在现代 [SoC](https://zhida.zhihu.com/search?content_id=272741614&content_type=Article&match_order=1&q=SoC&zhida_source=entity) 芯片中 **CPU** 只能说是皇帝，掌握资源命脉的还得是太上皇 **SCP** 。

讲SoC前我们先看下传统的PC构架，当你去买电脑的时候，首先决定价位的就是 **CPU** ，然后就是 **显卡、声卡、无线网卡** 等各种配件，最后电脑攒出来了，一个机箱个头不小啊，耗电也是响当当的。家里插电还可以用，但是对于手机、汽车等移动设备来说，电池供电再这么搞是不行了，系统对 **省电、体积、功能** 有更高的要求，需要越来越多的模块，解决方案就是 **SoC** 。

![](https://pic4.zhimg.com/v2-c4c7d06f5a052147b21a378bb3bcabf9_1440w.jpg)

随着芯片的集成化程度提升，很多模块都做到芯片的内部，比如isp、dsp、gpu，这样做成 **片上系统** （System

on Chip，简称 **SoC** ），好处是整个系统功能更内聚，板级面积会减少，但是芯片的体积却越来越大。大的芯片面积造成芯片成本和功耗增加，但是整体功耗相对减小，随着芯片制造工艺的提高，可以提高能耗比和降低成本。

SoC诞生后，一个问题愈发的严重，就像“ **一个和尚挑水吃，两个和尚抬水吃，三个和尚没水吃** ”，模块多了就会有资源的争夺。CPU上的OS软件之前一直是皇帝般的存在，硬件之上都自己掌控，现在不同了，出现了藩王，像GPU各种人工智能专属的NPU，地平线自己还命名了一个BPU，总之各种 **PU** 一堆，CPU还是皇帝，但是其他PU拥有自己独立的硬件和OS就像藩王，有点不受控啊。争夺最厉害的就是电源，这可是大奶妈，然后就是存储、时钟、传感器等。这时候CPU皇帝很头大了，需要搬出来 **太上皇** 了，就是我们本篇介绍的 **SCP** （ **system control** processor）。那么CPU可以代理太上皇吗，答案是不能，有的情况下比如休眠关机，CPU都得关了但是还有的NPU还在运行，CPU还没那个资格统领全局。上面图里面根据网络小说的名字，看来作者知道 **太上皇** 才是权利巅峰，从而意淫夺舍，夺舍在计算机里面算是黑客入侵控制了，但是SoC里面这个太上皇可不好夺舍，是极度安全的幕后人物，拥有自己的全套基础设施，而又让你甚至感觉不到他的存在。但是当你一直沿着软件 **OS-》ATF** 往下分析发现还有这个 **幕后黑手** SCP。

## 1\. ARM PCSA规范

![](https://pic3.zhimg.com/v2-aed692604c0b8fe200812f598ea53b9a_1440w.jpg)

上图所示是一个典型的SoC，里面除了CPU还有各种其他处理器。之前介绍的 [ARM ATF入门-安全固件软件介绍和代码运行](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484384%26idx%3D1%26sn%3Dc6a2c66b967a28f8f46430263bad7df6%26chksm%3Dfa5285c4cd250cd27a333f15bfcef80e8a8f92ac9afe8ac766f93e75a0dbc7500de2d4df0eff%26scene%3D21%23wechat_redirect) 中的固件都是在CPU上运行的，也就是ARM的A核，这里说的SCP是在M核上运行的。

俗话说

“ **君权神授** ”，这个SCP肯定得是造物主ARM提出来的了。 随着SoC的复杂性增加，为了更好的功耗管理，需要从系统中其他的控制器和应用处理器中抽象出来各种电源或其他系统管理任务，进行集中管理，利用一个独立的控制器核心实现。因此ARM提出了功耗控制系统架构（power control system architecture，简称 **PCSA** ），用来规范芯片功耗控制的逻辑实现。

**为什么SoC需要集中功耗控制？**

- 首先SoC的复杂性，现代SOC集成了大量的硬件模块，在电源管理方面，这些模块间需要进行集成和协调，实现难度大；
- 其次功耗管理的复杂性，涉及时钟、电源域、传感器、事件等方面。

可以在ARM官网下载PCSA规范文档：

[developer.arm.com/docum](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/den0050/d/%3Flang%3Den)

PCSA描述了一种使用标准基础设施组件、低功耗接口和相关方法进行功率控制集成的方法。PCSA基于ARM的组件实现，规范包括：

- 电压、电源和时钟的划分；
- 电源的状态和模式；
- ARM电源控制框架和集成规范；
- ARM特定组件的电源和时钟集成；
- 带有低功耗Q-channel和P-channel接口的IP。

## 2\. SCP简介

![](https://picx.zhimg.com/v2-7655cdd123f8c897ae7b3db5158b8397_1440w.jpg)

PCSA 定义了 **系统控制处理器** (SCP) 的概念，一般是一个硬件模块，例如 [cortex-M4](https://zhida.zhihu.com/search?content_id=272741614&content_type=Article&match_order=1&q=cortex-M4&zhida_source=entity) 微处理器再加上一些外围逻辑电路做成的功耗控制单元。SCP用于从应用程序处理器中抽象出电源和系统管理任务，配合操作系统的功耗管理软件或驱动，来完成顶层的功耗控制。上面这个图中间是 **SCP** ，AP只是其中的一个 **Agent** ，还有其他的Agent，真正控制硬件的还是SCP，这就很安全。SCP相关的软件交互定义如下：

- **AP** 软件是SCP服务的请求者。
- 系统中的其他 **Agent** 也可以请求SCP的服务。代理例如一个modem子系统，或者其他的硬件模块。
- SCP基于处理器，有自己的 **固件** ，控制自己的一组 **硬件资源** ，例如本地私有内存、计时器、中断控制以及系统配置、控制和状态的寄存器。
- 最底层是SCP控制的 **硬件资源** ，例如时钟源、电源域门控、电压电压和传感器等

**SCP提供的服务：**

1. 系统初始化：SCP负责通电复位系统初始化任务，从主系统和AP核心电源域的通电顺序到AP启动。
2. OSPM定向操作：SCP在OSPM指导下执行电压供应变化、电源控制操作和时钟源管理。这些服务也可以被其他请求的Agent使用。
3. 对系统事件的响应：
- 计时器事件：SCP有本地计时器资源，可用于触发系统唤醒和任何周期性动作，如监控。
- 唤醒事件：响应唤醒请求，包括由路由到断电核心的中断引起的GIC唤醒请求，以及来自其他代理的系统访问请求。
- 调试访问电源控制：响应来自调试访问端口的请求和相关控件的请求，包括调试基础设施的电源管理。
- 看门狗事件和系统恢复操作：在本地看门狗超时时，SCP可以执行一个重置和重新初始化序列。

4\. 系统感知功能：

- SCP可以协调来自OSPM和其他代理对共享资源的请求。例如，它可以控制到主存的路径，或进入SoC睡眠模式和退出，而不需要AP核心活动。
- SCP可负责监测传感器和测量功能。监控任务可能包括过程和温度传感器的数据收集和相关的操作，如操作点优化和报警条件。
- SCP在操作点选择中的作用可以扩展到必要时覆盖OSPM方向，以确保系统的电气和热保护。
![](https://pic3.zhimg.com/v2-05bfb2fa77081324a5a2066d913e2112_1440w.jpg)

**SCP在安全方面的优势：**

由于其是一个 **独立** 的硬件模块和固件，其内部资源例如内存、外设不能够被外界控制，另外其还能控制外界的一些公共资源，SCP具有较高的权限。配合安全引导过程，SCP可以成为一个 **可信** 软件模块。

**SCP固件为其他MCP的固件实现提供了参考：**

SOC中除了SCP处理器外，还有一些其他的可管理性控制处理器 (MCP)，其他MCP的实现固件框架跟SCP类似，目的是为需要可管理性的片上系统 (SoC) 提供管理入口点。

## 3\. 电源管理软件协议栈

![](https://pic4.zhimg.com/v2-69290ceda3a06993855e7267b4347241_1440w.jpg)

**用户层：**

首先用户发起的一些操作，通过用户空间的各service处理，会经过内核提供的sysfs，操作cpu hotplug、device

pm、EAS、IPA等。

**内核层：**

在linux内核中，EAS（energy aware scheduling）通过感知到当前的负载及相应的功耗，经过cpu

idle、cpu dvfs及调度选择idle等级、cpu频率及大核或者小核上运行。IPA（intrlligent power

allocation）经过与EAS的交互，做热相关的管理。

**ATF层：**

Linux kernel中发起的操作，会经过电源状态协调接口（Power State Coordination Interface，简称PSCI），由操作系统无关的framework（ARM Trusted Firmware，简称ATF）做相关的处理后，通过系统控制与管理接口（System Control and Management Interface，简称 [SCMI](https://zhida.zhihu.com/search?content_id=272741614&content_type=Article&match_order=1&q=SCMI&zhida_source=entity) ），向系统控制处理器（system control processor，简称SCP）发起低功耗操作。

**SCP层：**

SCP最终会控制芯片上的sensor、clock、power

domain、及板级的pmic做低功耗相关的处理。

**总结：用户进程 --sysfs--> 内核（EAS、IPA）--PSCI--> ATF --SCMI-->SCP --LPI--> 功耗输出器件**

## 4\. 电压域和电源域划分

为了更好地对电进行控制，ARM划分了两个电相关的概念： **电源域** （power domain）和 **电压域** （voltage domain）。

**电压域** 指使用同一个电压源的模块合集，如果几个模块使用相同的电压源，就认为这几个模块属于同一个电压域。 **电源域** 指的是在同一个电压域内，共享相同电源开关逻辑的模块合集。即在同一个电源域的模块被相同的电源开关逻辑控制，同时上、下电。一个电压域内的模块，可以根据设计需求，拆分到不同电源域。因此，电压域对应的是功能是dvfs，而电源域的概念对应的是power gating。

![](https://pic1.zhimg.com/v2-860f11da97ea52fdd4841d45e3acf9a8_1440w.jpg)

如上图，不同颜色表示不同的电压域，VBIG是大核处理器的电源供电，VLITTLE是小核处理器的电源供电，VGPU是图形处理器的电源供电，VSYS是系统电源。虚线框包围的模块表示可以做电源开关处理，比如处理器核。实线框包围的模块表示不能做电源开关，比如SCP。

## 5\. SCP代码下载编译和功能介绍

![](https://pic2.zhimg.com/v2-5b01bfd115284aed6fcadba807fcd507_1440w.jpg)

官方开源代码路径： [github.com/ARM-software](https://link.zhihu.com/?target=https%3A//github.com/ARM-software/SCP-firmware) ，代码下载：

```
git clone https://github.com/ARM-software/SCP-firmware.git
git submodule update --init
```

| 目录名字 | 主要功能 |
| --- | --- |
| framework | 存放scp架构的定义和实现，是scp 的代码的主干 |
| module | 存放scp的各个通用功能模块的代码，runtime   services都是以module实现。例如power\_domain， smt，scmi，scmi\_power\_domain，scmi\_reset\_domain，scmi\_sensordeng，scmi\_system\_power，scmi\_voltage\_domain等 |
| product | 存放具体的产品代码，例如juno |
| tools | 存放编译脚本等工具 |
| doc | 项目文档 |
| arch | 处理器架构，目前支持armv8-a和m |

ARM的PCSA规范（电源控制系统框架）定义了SCP（系统控制处理器）相关内容，SCP固件为系统控制提供了一个软件参考实现，一个典型就是SCP源码中有一个 **optee** 实现（product/optee-stm32mp1/fw/Firmware.cmake）。

SCP固件实现的功能可以分为两大类： **system** 和 **runtime**

**实时功能（runtime services）：**

- Power domain management（电源域管理）
- System power management（系统电源管理），涉及开关机
- Performance domain management (Dynamic voltage and frequency scaling)，性能管理，这个主要就是ddr的调频了（调频对应电压）。
- Clock management（时钟管理），Linux中也有，这里只提供重要的时钟管理
- Sensor management（传感器管理）
- Reset domain management（域重置管理）
- Voltage domain management（电压域管理）

**系统相关功能（system services）：**

- 系统初始化，启用应用核心引导
- 系统控制和管理接口(SCMI，平台端)
- 支持GNU Arm嵌入式和Arm Compiler 6工具链
- 支持具有多个控制处理器的平台

我们以juno开发板为例，介绍下 **编译** ，执行如下全编译命令：

```
make -f Makefile.cmake PRODUCT=juno MODE=debug
```
![](https://pic2.zhimg.com/v2-3f04bfe86099fa75c47eb24cc7ecb8bd_1440w.jpg)

我们编译了 **三个镜像** ：

- **juno-bl1.bin**: SCP ROM 固件映像 - 处理 RAM 固件到专用 SRAM 的传输并跳转到它
- **juno-bl1-bypass.bin**: 正常情况下scp\_bl1（SCP ROM固件）需要对scp\_bl2（SCP RAM固件）进行校验，进行安全链式加载。此bin文件把bl1中对bl2固件的校验去掉了，方便调试验证的时候使用。
- **juno-bl2.bin**: SCP RAM 固件映像 - 管理系统运行时服务

要使用 [TF-A](https://zhida.zhihu.com/search?content_id=272741614&content_type=Article&match_order=1&q=TF-A&zhida_source=entity) 在 Juno 上启动 SCP 固件，您至少需要三个额外的映像：

- bl1: BL1 - 存储在系统 ROM 中的第一阶段引导加载程序
- bl2: BL2 - 加载的第二阶段bootloader bl1，负责交给scp\_bl2SCP
- fip: FIP - 包含bl2和的固件映像包scp\_bl2  
	疑问：这里为什么有juno-bl1和juno-bl2，跟ATF里面的BL2又有什么关系？--将在下面SCP boot章节解释。

## 6\. SCP boot流程分析

固件romfw和ramfw介绍：

对于一个product的scp firmware分为两部分：romfw（scp\_bl1）和ramfw（scp\_bl2）。

1. **上电时** ：在开机上电时首先运行scp\_bl1，然后启动SOC其他核心例如AP（AP启动后会运行BL1），等待AP发送指令，从系统ram把ramfw加载到SCP内部ram，并跳转执行。scp\_bl1用于加载和执行scp\_bl2。
2. **运行时** ：scp\_bl2为scp主要runtime应用代码，提供scp各种服务，例如scmi。
3. **复位时** ：当硬件发生复位时，SCP上复位运行scp\_bl1，时间上和ATF的AP\_BL1 and AP\_BL2同时运行。

juno固件相关目录如下：

```
~/arm/SCP-firmware/product/juno$ ls
includemodule  product.mk  scp_ramfw scp_romfw  scp_romfw_bypass  scp_ut src
```
![](https://pica.zhimg.com/v2-91e4a32905f8de9b2844189c63c73b7c_1440w.jpg)

1. **SCP\_BL1 boot 流程：**

系统启动，首先运行scp\_romfw firmware代码。执行scp应用初始化流程的初始流程fwk\_arch\_init（），按照Firmware.cmake中定义的module顺序进行初始化，中断初始化，module启动，这些完成后会循环调用处理运行时event消息。

1. **ATF中BL2加载SCP\_BL2：**

TF(Trusted Firmware)是ARM在Armv8引入的安全解决方案，为安全提供了整体解决方案。它包括启动和运行过程中的特权级划分。ATF BL2的主要职责就是将后续固件如u-boot。kernel，SCP或者其他异构核的固件，加载到ram中。SCP firmware的加载及boot 由arm Arm Trusted Firmware-A (TF-A)来完成。

SCP用于电源，时钟，复位和系统控制。BL2将可选的SCP\_BL2镜像从平台存储设备加载到特定的安全内存区域。SCP\_BL2的后续处理是特定于具体平台的，需要自行实现。例如，Arm Juno ：

- BL2先把SCP\_BL2加载到trust sram，
- 再使用Boot  
	Over MHU (BOM) 协议，把SCP\_BL2加载到 SCP的内部RAM之后，
- SCP运行SCP\_BL2，
- SCP给AP发出signals，通知BL2继续执行。

ATF中，BL2的编译选项在如下位置定义plat/arm/board/juno/platform.mk中的BL2\_SOURCES，morello ATF plat/arm/board/morello/platform.mk中未定义BL2\_SOURCES，不包含BL2.是否包含BL2相关通用代码及配置由CSS\_LOAD\_SCP\_IMAGES决定

1. **scp romfw 跳转执行ramfw：**

在juno中，ATF的BL2中通过 [SDS](https://zhida.zhihu.com/search?content_id=272741614&content_type=Article&match_order=1&q=SDS&zhida_source=entity) (Shared-Data-Structure,在Juno平台中替代之前Boot-Over\_MHU (BOM)协议)和SCP的romfw通信(mod\_bootloader调用sds API)，发送ramfw到安全内存，然后再由romfw从安全内存加载到其他位置并执行。

**备注** ：SCP\_BL2的运行跟SCP\_BL1一样，两者都是使用SCP的框架代码，属于两个系统。执行scp应用初始化流程的初始流程fwk\_arch\_init（），按照Firmware.cmake中定义的module顺序进行初始化，中断初始化，module启动，这些完成后会循环调用处理运行时event消息。

后记：

本篇对SCP进行了介绍，下次文章介绍下SCP的 **代码分析** ，作为一个M核运行的系统代码，其代码框架还是有很多 **通用性和优点** ，号称OPTEE固件可以直接在其框架下实现应用，对电源管理和SoC有兴趣的朋友可以关注。

“ **啥都懂一点** ， **啥都不精通** ，

**干啥都能干** ， **干啥啥不是** ，

**专业入门劝退** ， **堪称程序员杂家** ”。

后续会继续更新，纯干货分析，无广告，不打赏，欢迎转载，欢迎评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-04-08 15:52・上海[IC设计求职者梦寐以求的流片项目，终于找到了！](https://zhuanlan.zhihu.com/p/702152453)

[

多一个流片项目，多一份经验，就多一份竞争力，求职乃至于谈薪的时候就多一份胜算和底气。 这句话来自一位复旦科班的求职者；不知从什么时候开始，企业的招聘要求中出现了一条：有项目...

](https://zhuanlan.zhihu.com/p/702152453)