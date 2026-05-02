---
title: "综合能力训练：在树莓派上动手写一个小OS（1）：实验前准备"
source: "https://zhuanlan.zhihu.com/p/489935232"
author:
  - "[[奔跑吧Linux社区为开源布道！]]"
published:
created: 2026-05-02
description: "本文节选自《奔跑吧linux内核 入门篇》第二版第16章学习操作系统最有效且最具有挑战性的训练是从零开始动手写一个小OS（操作系统）。目前很多国内外知名大学的“操作系统”课程中的实验与动手写一个小OS相关，比如…"
tags:
  - "clippings"
---
5 人赞同了该文章

> 本文节选自《奔跑吧linux内核 入门篇》第二版第16章

学习 [操作系统](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F&zhida_source=entity) 最有效且最具有挑战性的训练是从零开始动手写一个小OS（操作系统）。目前很多国内外知名大学的“操作系统”课程中的实验与动手写一个小OS相关，比如 [麻省理工学院](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E9%BA%BB%E7%9C%81%E7%90%86%E5%B7%A5%E5%AD%A6%E9%99%A2&zhida_source=entity) 的操作系统课程采用xv6系统来做实验。xv6是在 [x86处理器](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=x86%E5%A4%84%E7%90%86%E5%99%A8&zhida_source=entity) 上重新实现的UNIX第6版系统，用于教学目的。清华大学的操作系统课程也采用类似的思路，他们基于xv6的设计思想，通过实验一步一步完善一个小OS——ucore OS。xv6和ucore OS实验都采用类似于英语考试中 [完形填空](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E5%AE%8C%E5%BD%A2%E5%A1%AB%E7%A9%BA&zhida_source=entity) 的方式来引导大家实现和完善一个小OS。  
动手写一个小OS会让我们对计算机底层技术有更深的理解，我们对操作系统中核心功能（比如系统启动、内存管理、进程管理等）的理解也会更深刻。本章介绍了24小实验来引导读者在树莓派上从零开始实现一个小OS，我们把这个OS命名为BenOS。  
本章需要准备的实验设备如下。

1. 硬件 [开发平台](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E5%BC%80%E5%8F%91%E5%B9%B3%E5%8F%B0&zhida_source=entity) ：树莓派3B或 [树莓派4B](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E6%A0%91%E8%8E%93%E6%B4%BE4B&zhida_source=entity) 。
2. 软件模拟平台：QEMU 4.2。
3. 处理器架构：ARMv8架构（aarch64）。
4. 开发主机：Ubuntu Linux 20.04。
5. MicroSD卡一张以及读卡器。
6. USB转串口线一根。
7. J-Link [仿真器](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E4%BB%BF%E7%9C%9F%E5%99%A8&zhida_source=entity) （可选 ）。

本章用到的芯片手册如下。

1. 《ARM Architecture Reference Manual, ARMv8, for ARMv8-A architecture profile》的v8.4版本。
2. 《BCM2837 ARM Peripherals》的v2.1版本，用于树莓派3B。
3. BCM2711芯片手册《BCM2711 ARM Peripherals》的v1版本，用于树莓派4B。

本章的实验按照难易程度分成3个阶段。

1. 入门动手篇。一般读者在完成相对容易的5个实验之后，将对ARM64架构、操作系统启动、中断和进程管理有初步的认识。
2. 进阶挑战篇。对操作系统有浓厚兴趣以及学有余力的读者可以完成进阶篇的12个实验。这12个实验涉及操作系统最核心的功能，比如物理内存管理、 [虚拟内存管理](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E8%99%9A%E6%8B%9F%E5%86%85%E5%AD%98%E7%AE%A1%E7%90%86&zhida_source=entity) 、缺页异常处理、进程管理以及 [进程调度](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E8%BF%9B%E7%A8%8B%E8%B0%83%E5%BA%A6&zhida_source=entity) 等。
3. 高手完善篇。对操作系统有执着追求的读者可以继续完成高手篇的实验，从而一步一步完成一个有一定使用价值的小OS。  
	本章的所有实验为开放性实验，读者可以根据实际情况选做部分或全部实验。

### 16.1 实验准备

### 16.1.1 开发流程

我们的开发平台有两个。

1. 软件模拟平台：QEMU [虚拟机](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E8%99%9A%E6%8B%9F%E6%9C%BA&zhida_source=entity) 。
2. 硬件开发平台：树莓派3B或树莓派4B。

QEMU虚拟机可以模拟树莓派绝大部分的硬件工具 ，另外使用QEMU内置的GDB调试功能可以很方便地调试和定位问题。我们建议的开发流程如下。  
（1）在Ubuntu主机上编写实验代码，然后编译代码。  
（2）在QEMU虚拟机上调试并运行代码。  
（3）将代码装载到 [树莓派](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=9&q=%E6%A0%91%E8%8E%93%E6%B4%BE&zhida_source=entity) 上运行（可选）。  
如果读者手头没有树莓派，那么可以在QEMU虚拟机上完成本章的所有实验。

### 16.1.2 配置串口线

要在树莓派上运行BenOS实验代码，我们需要一根USB转串口线，这样在系统启动时便可通过串口输出信息来协助调试。读者可从网上商店购买USB转串口线，图16.1所示是某个厂商售卖的一款USB转串口线。串口一般有3根线。另外，串口还有一根额外的电源线（可选）。

![](https://pica.zhimg.com/v2-3e09a15a6e8ccf1397e8a4e8b677887a_1440w.jpg)

1. 电源线（红色 ）：5V或3.3V电源线（可选）。
2. 地线（黑色）。
3. 接收线（白色）：串口的接收线RXD。
4. 发送线（绿色）：串口的发送线TXD。

树莓派支持包含40个GPIO引脚的扩展接口，这些扩展接口的定义如图16.2所示。根据扩展接口的定义，我们需要把串口的三根线连接到扩展接口，如图16.3所示。  
地线：连接到第6个引脚。  
RXD线：连接到第8个引脚。  
TXD线：连接到第10个 [引脚](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=4&q=%E5%BC%95%E8%84%9A&zhida_source=entity) 。

![](https://pic3.zhimg.com/v2-ee52186e181568930630d95a41cf3218_1440w.jpg)

图16.2 树莓派扩展接口的定义

![](https://pic4.zhimg.com/v2-5ae6c46613e19548dde9954e3b7006cf_1440w.jpg)

图16.3 将串口连接到树莓派扩展接口  
读者可以参照实验1-3，在 [MicroSD卡](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=2&q=MicroSD%E5%8D%A1&zhida_source=entity) 上安装支持树莓派的操作系统（比如 [优麒麟](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E4%BC%98%E9%BA%92%E9%BA%9F&zhida_source=entity) Linux 20.04），然后打开 [串口软件](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E4%B8%B2%E5%8F%A3%E8%BD%AF%E4%BB%B6&zhida_source=entity) ，查看是否有信息输出。在Windows 10操作系统中，你需要在设备管理器里查看 [串口号](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E4%B8%B2%E5%8F%A3%E5%8F%B7&zhida_source=entity) ，如图16.4所示。你还需要在Windows 10操作系统中安装用于USB转串口的驱动。

![](https://pic4.zhimg.com/v2-a07e3380ace40ccb707ee2692b6faad3_1440w.jpg)

图16.4 在设备管理器中查看串口号  
插入MicroSD卡到树莓派，接上USB电源，在串口终端软件（如PuTTY或MobaXterm等）中查看是否有输出，如图16.5所示。

![](https://pic3.zhimg.com/v2-6fdde2024df3b4d37ac14bb6c7151704_1440w.jpg)

图16.5 在 [串口终端](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=2&q=%E4%B8%B2%E5%8F%A3%E7%BB%88%E7%AB%AF&zhida_source=entity) 软件中查看是否有输出

### 16.1.3 寄存器地址

树莓派3B采用的博通BCM2837芯片通过 [内存映射](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E6%98%A0%E5%B0%84&zhida_source=entity) 的方式来访问所有的片内外设。外设的寄存器地址空间为0x3F000000～0x3FFFFFFF。  
树莓派4B采用的是博通BCM2711芯片，BCM2711芯片在BCM2837芯片的基础上做了如下改进。

1. CPU内核：使用性能更好的 [Cortex-A72](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=Cortex-A72&zhida_source=entity) 。采用4核CPU的设计，最高频率可以达到1.5 GHz。
2. L1缓存：32 KB数据缓存，48 KB [指令缓存](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E6%8C%87%E4%BB%A4%E7%BC%93%E5%AD%98&zhida_source=entity) 。
3. L2缓存：大小为1 MB。
4. GPU：采用VideoCore VI核心，最高 [主频](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E4%B8%BB%E9%A2%91&zhida_source=entity) 可以达到500 MHz。
5. 内存：1～4 GB LPDDR4。
6. 支持USB 3.0。

BCM2711芯片支持两种地址模式。

1. 低地址模式：外设的寄存器地址空间为0xFC000000 ~ 0xFF7FFFFF，通常外设的寄存器基地址为0xFE000000。
2. 35位全地址模式：可以支持更大的地址空间。在这种地址模式下，外设的寄存器地址空间为0x47c000000 ~ 0x47FFFFFFF。  
	树莓派4B默认情况下使用低地址模式。

发布于 2022-03-30 01:14[操作系统](https://www.zhihu.com/topic/19552686)[一文告诉你人工智能纯小白学习路线！](https://zhuanlan.zhihu.com/p/31863323446)

[

全文5196字，按照我这个路线坚持完，你会变成一个人工智能的牛人的。它是假定一个没有人工智能基础的程序员学习路线。写在前面：我觉的从deepseek开源以后，会有更多的企业和开发者...

](https://zhuanlan.zhihu.com/p/31863323446)