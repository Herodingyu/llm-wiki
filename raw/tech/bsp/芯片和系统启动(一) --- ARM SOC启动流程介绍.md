---
title: "芯片和系统启动(一) --- ARM SOC启动流程介绍"
source: "https://zhuanlan.zhihu.com/p/27403211109"
author:
  - "[[Alfred最近对性能分析方面比较感兴趣]]"
published:
created: 2026-05-02
description: "有小伙伴问我芯片启动的时候boot core是不是CPU中的boot core。鉴于这个疑问，我整理了一个芯片启动流程图，介绍一下芯片启动的过程。 首先我们需要了解SOC。以ARM为例，ARM SOC（System on Chip，片上系统）是一…"
tags:
  - "clippings"
---
187 人赞同了该文章

有小伙伴问我芯片启动的时候boot core是不是CPU中的boot core。鉴于这个疑问，我整理了一个芯片启动流程图，介绍一下芯片启动的过程。

首先我们需要了解SOC。以ARM为例，ARM SOC（System on Chip，片上系统）是一种集成了多个功能模块的集成电路，通常基于ARM架构的处理器核心。ARM SOC广泛应用于移动设备、嵌入式系统、物联网设备、汽车电子、工业控制等领域。由于其低功耗、高性能和高度集成的特点，ARM SOC已成为现代电子设备的核心组件。

ARM SOC通常包含以下核心组件：

- **ARM处理器核心** ：ARM SOC的核心是ARM架构的CPU，常见的核心包括 [Cortex-A系列](https://zhida.zhihu.com/search?content_id=254503361&content_type=Article&match_order=1&q=Cortex-A%E7%B3%BB%E5%88%97&zhida_source=entity) （高性能应用处理器）、 [Cortex-R系列](https://zhida.zhihu.com/search?content_id=254503361&content_type=Article&match_order=1&q=Cortex-R%E7%B3%BB%E5%88%97&zhida_source=entity) （实时处理器）和 [Cortex-M系列](https://zhida.zhihu.com/search?content_id=254503361&content_type=Article&match_order=1&q=Cortex-M%E7%B3%BB%E5%88%97&zhida_source=entity) （微控制器）。不同的核心针对不同的应用场景进行了优化。
- **图形处理单元（GPU）** ：用于处理图形渲染任务，常见的GPU包括 [ARM Mali系列](https://zhida.zhihu.com/search?content_id=254503361&content_type=Article&match_order=1&q=ARM+Mali%E7%B3%BB%E5%88%97&zhida_source=entity) 、Imagination Technologies的 [PowerVR系列](https://zhida.zhihu.com/search?content_id=254503361&content_type=Article&match_order=1&q=PowerVR%E7%B3%BB%E5%88%97&zhida_source=entity) 等。
- **内存控制器(DDRC)** ：负责管理SOC与外部内存（如DRAM、SRAM）之间的数据传输。
- **外设接口** ：包括USB、PCIe、I2C、SPI、UART等接口，用于连接外部设备。
- **多媒体处理单元(VPU/JPU/DPU)** ：用于处理音频、视频编解码等任务，通常包括硬件加速器。
- **网络接口** ：如以太网、Wi-Fi、蓝牙等，用于网络通信。
- **电源管理单元（PMU）** ：负责管理SOC的功耗，优化电池寿命。
- **安全模块(TEE)** ：如 [TrustZone技术](https://zhida.zhihu.com/search?content_id=254503361&content_type=Article&match_order=1&q=TrustZone%E6%8A%80%E6%9C%AF&zhida_source=entity) ，用于提供硬件级别的安全保护。
![](https://pica.zhimg.com/v2-e4c4cb65d1cc8e11d77b786d05ab0782_1440w.jpg)

ARM SOC内部各个核心示意图

了解了SOC的基本组成后，我们下面用一个图来描述启动过程中，SOC内部各个核心的Firmware加载和启动流程。

![](https://pic4.zhimg.com/v2-6e33a90c347e87309e345c63871b1069_1440w.jpg)

芯片启动流程示意图

各个Firmware(固件)描述如下表：

| Firmware | 运行Core | Core类型 | 运行EL等级 | 功能描述 |
| --- | --- | --- | --- | --- |
| Bootrom | Boot core | ARM7/ARM9/CortexM3 | NA | 芯片固化程序 |
| Boot Firmware | Boot core | 同上 | NA | 初始化片内总线、DDR，启动AP boot   core |
| PM Firmware | PM core | Xtensa core | NA | 电源和时钟等管理 |
| BL2 Firmware | AP boot core | Cortex Axxx或者Cortex   X | EL3 | 加载BL3x和启动BL31 |
| BL31 Firmware | AP boot core |  | EL3 | 启动Tee、bootloader |
| BL32 Firmware | AP boot core |  | EL1S | 运行TEE，提供安全服务 |
| BL33 Firmware | AP boot core |  | EL1NS/EL2NS | 提供bootloader功能，加载和启动内核 |
| Kernel | AP boot core & non boot core |  | EL1NS/EL2NS |  |
| XPU Firmware | XPU core |  | NA | DPU、VPU、GPU等的固件，初始化XPU核心 |

现在回答前面的问题。

在ARM SOC设计中，通常会集成一个专门的小核（如ARM7或Cortex-M3），通常称为 **BOOT Core** （不同厂商可能有不同的命名）。这个核心在芯片上电时负责系统的启动任务。芯片内部会固化一段启动代码，上电后这段代码会立即运行。

BOOT Core的固件（FW）首先会初始化一些基本的外设接口，例如SPI或SDIO，然后通过这些接口从外部存储介质（如Flash或SD卡）中读取后续需要运行的固件，并将其加载到SRAM中执行。

接下来，BOOT Core的固件会进一步完成电源管理、时钟配置、片内总线初始化等关键操作，并初始化DDR控制器（DDRC）。一旦DDR初始化完成并可以正常访问，BOOT Core会将后续的电源管理固件（PM FW）和第二阶段引导程序（BL2 FW）加载到DDR中。

完成这些步骤后，BOOT Core会解除主处理器（AP CPU）的复位状态，使其开始执行代码。至此，SOC中的高性能核心（如Cortex-A系列）正式启动并运行。

如果你喜欢本文，可以给我点赞、收藏、留言，看你对什么感兴趣。我们可以接着分享。

编辑于 2025-03-15 22:23・湖北[芯片](https://www.zhihu.com/topic/19557457)[嵌入式培训班大家觉得有必要吗？](https://www.zhihu.com/question/452052914/answer/3245825541)

[

不太建议嵌入式的初学者一上来就看书，其实不只是嵌入式，整个IT行业都属于技术行业，初学者一上来就盯着专业书学习，很容易会感觉枯燥乏味，产生厌学的心理。如果是想要了解嵌入式，...

](https://www.zhihu.com/question/452052914/answer/3245825541)