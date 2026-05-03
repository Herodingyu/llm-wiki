---
title: "AI系统-26芯片高速外设USB/ETH/PCIE等"
source: "https://zhuanlan.zhihu.com/p/2021880266117883735"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "本篇介绍SoC中 高速设备和接口。还是以点带面，有一个整体的认识，拓展视野就可以，具体研究需要自己调研查资料了。1. USB1.1 USB简介 参考《USB中文网》： https://www.usbzh.com/article/detail-344.html 这里基…"
tags:
  - "clippings"
---
[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810)

4 人赞同了该文章

![](https://pic1.zhimg.com/v2-65f20eb56f430e87f9099b7e1a3bb1ee_1440w.jpg)

本篇介绍SoC中 **高速设备和接口** 。还是 **以点带面** ，有一个整体的认识， **拓展视野** 就可以，具体研究需要自己调研查资料了。

## 1\. USB

![](https://pic2.zhimg.com/v2-e372cb7f65fe2ed9e1873980f50f8e5d_1440w.jpg)

## 1.1 USB简介

![](https://pic1.zhimg.com/v2-6c1577c8794f98aee331277fe9dd94ee_1440w.jpg)

参考《USB中文网》： [usbzh.com/article/detai](https://link.zhihu.com/?target=https%3A//www.usbzh.com/article/detail-344.html) 这里基础知识很全面，有兴趣可以打开看看，篇幅有限，这里只简单介绍下。

**通用串行总线** （英语： **U** niversal **S** erial **B** us，缩写： **USB** ）是连接电脑与设备的一种序列总线标准，也是一种输入输出(I/O) 连接端口的技术规范，广泛应用于个人电脑和移动设备等信息通信产品，并扩展至摄影器材、数字电视（机顶盒）、游戏机等其它相关领域。

多媒体电脑刚问世时，外接式设备的传输接口各不相同，如打印机只能接并行端口、调制解调器只能接RS232、鼠标键盘只能接PS/2等。繁杂的接口系统，加上必须安装驱动程序并重启才能使用的限制，都会造成用户的困扰。因此，创造出一个统一且支持易插拔的外接式传输接口，便成为无可避免的趋势，USB应运而生。

最新一代的USB是USB4，传输速度为40Gbit/s。物理接头USB Type-A、Type-B接头分正反面，新型USB Type-C接头不分正反面。

![](https://pic1.zhimg.com/v2-bf83ef0ff8fd60ac5959f57ba4e72a86_1440w.jpg)

## 1.2 synopsys USB介绍

![](https://pic3.zhimg.com/v2-f9045e1699e8230bc8c260d2af9f1400_1440w.jpg)

这里我们以synopsys USB为例进行说明。官网资料：

[synopsys.com/zh-cn/desi](https://link.zhihu.com/?target=https%3A//www.synopsys.com/zh-cn/designware-ip/interface-ip/usb.html) 需要有账号才能下载资料，这里找到一个可以用的：

[blog.csdn.net/gitblog\_0](https://link.zhihu.com/?target=https%3A//blog.csdn.net/gitblog_06679/article/details/143337930)

Synopsys USB IP 解决方案提供完整的 **高质量 USB 数字控制器、PHY、验证 IP、IP 子系统和 IP 原型套件** ，帮助片上系统 (SoC) 设计人员构建符合 USB-IF 要求的产品，并确保与市场上超过 40 亿个支持 USB 的产品（包括具有 USB Type-C 连接的产品）的互操作性。这里以USB3.0进行说明：

### 1.2.1 USB 3.0

**1\. USB Controller** ：Synopsys 为设计人员提供经过硅验证的可配置 Synopsys USB 3.0 控制器，这些控制器符合 USB 实施者论坛 (USB-IF) USB 3.0 规范。Synopsys USB 3.0 控制器提供最低的门数、采用双电源轨优化的高效电源管理以及用于 PHY 的 USB 3.0 PIPE 和 USB 2.0 UTMI/UTMI+ 接口。该综合解决方案还支持双角色设备 (DRD)、xHCI 主机和设备控制器以及超高速芯片间连接 (SSIC)、高速芯片间连接 (HSIC) 和 OTG 2.0 功能。

- 支持超高速 USB 省电模式、统一电源格式 (UPF) 和双电源轨
- 通过设计降低整体系统功耗
- 可配置数据缓冲选项，以微调性能/面积权衡
- 主机支持超高速、高速、全速和低速操作
- 主机控制器兼容支持 xHCI 标准的常见操作系统，例如 Windows 8 和 Linux
- 设备支持超高速、高速和全速运行
- DRD 支持主机或设备操作
1. **PHY IP** ：Synopsys 的 USB-C 3.0 和 USB 3.0 PHY IP 为设计人员提供了业界最佳的低面积和低功耗组合，并支持从 65 纳米到 14/16 纳米 FinFET 的领先工艺技术。Synopsys USB-C 和 USB 3.0 PHY 均提供单一高效的 GDSII 设计，支持所有四种 USB 3.0 速度模式（超高速、高速、全速和低速）。为了最大限度地延长移动应用中的电池寿命，Synopsys USB-C/USB 3.0 PHY 旨在最大限度地降低功耗和待机电流。此外，Synopsys USB-C 3.0 femtoPHY 经过优化，支持 USB Type-C 连接规范。
- 综合 IP 解决方案的一部分，包括 xHCI 主机和设备控制器、PHY、验证 IP、IP 原型设计套件和 IP 软件开发套件
- 专为先进的 1.8V CMOS 平面体和 FinFET 工艺节点而设计
- USB-C femtoPHY IP 支持 USB Type-C 规范
- 采用 14/16 纳米 FinFET 和 28 纳米工艺的 USB-C/USB 3.0 femtoPHY 占用面积缩小 50%，性能卓越，并具有先进的电源功能
- 集成 PHY 包括发射器、接收器、PLL、数字核心和 ESD
- 设计最小化面积和功耗
- 高良率：旨在通过降低对代工工艺、芯片和电路板寄生效应以及工艺设备变化所导致的变化的敏感度来提高关键的营业利润率
- Synopsys USB 3.0 PHY IP 已获得 USB-IF 认证

### 1.2.2 eUSB2 IP

参考：

[synopsys.com/dw/doc.php](https://link.zhihu.com/?target=https%3A//www.synopsys.com/dw/doc.php/ds/c/dwc_eusb2_china.pdf)

![](https://pic4.zhimg.com/v2-20735e64af91293634011db09636b20b_1440w.jpg)

符合eUSB2 1.1规范 • 可用于USB主机、设备和双角色应用中 • eUSB2 PHY和eUSB2中继器支持 USB 2.0 480Mbps（高速）、12Mbps（全速）和 1.5Mbps（低速）数据速率 • eUSB2 PHY专为不支持3.3V信号和5V容限 的最先进工艺节点而设计 • eUSB2 PHY接口：UTMI+ 3级规范 • eUSB2中继器专为支持3.3V信号和5V容限 的成熟工艺节点而设计

**eUSB2 PHY IP**

![](https://pic2.zhimg.com/v2-681bab9a5b5134b0c419a87c565988e7_1440w.jpg)

• 专为高级工艺节点（7nm及以下）设计 • 最大限度地减少由于工艺、电压、温度、封装和板卡寄生参数的变化而产生的影响 • 支持USB 2.0 480Mbps（高速）、12Mbps（全速）和1.5Mbps（低速）数据速率 • 与新思科技的DesignWare USB 2.0、3.0、3.1和3.2主机、设备及双角色控制器连接 • 最低功耗：对于用于eUSB2 芯片间通信的高级移动设备，可延长电池寿命

**eUSB2中继器IP**

![](https://picx.zhimg.com/v2-e854365e865bfd3da8004f4e43027611_1440w.jpg)

在eUSB2和USB 2.0信号电平间转换，使配有eUSB2 PHY的SoC能够与旧有USB 2.0产品连接 • 专为成熟工艺节点而设计 • 可集成到PMIC、音频、Wi-Fi、组合式无线芯片中，或作为独立（多端口）中继器芯片实施 • 支持USB 2.0 480Mbps（高速）、12Mbps（全速）和1.5Mbps（低速）数据速率 • 高级内置自检 (BIST)、可调性和诊断

### 1.2.3 USB4

参考：

1. [synopsys.com/zh-cn/desi](https://link.zhihu.com/?target=https%3A//www.synopsys.com/zh-cn/designware-ip/technical-bulletin/usb4-socs-ip.html)
2. [synopsys.com/designware](https://link.zhihu.com/?target=https%3A//www.synopsys.com/designware-ip/interface-ip/usb/usb4.html)

**USB4** 是 USB 开发者论坛 (USB-IF) 制定的一种新的连接标准。USB4 支持多种高速接口协议，包括 USB4、 [DisplayPort](https://zhida.zhihu.com/search?content_id=272214099&content_type=Article&match_order=1&q=DisplayPort&zhida_source=entity) 、 [PCI Express](https://zhida.zhihu.com/search?content_id=272214099&content_type=Article&match_order=1&q=PCI+Express&zhida_source=entity) 和 [Thunderbolt 3](https://zhida.zhihu.com/search?content_id=272214099&content_type=Article&match_order=1&q=Thunderbolt+3&zhida_source=entity) ，可通过单根 USB Type-C 电缆高效地传输数据并同时传递数据、电源和高分辨率视频。USB4 实现高达 40Gbps 的速度，是之前的 USB 3.2 Gen 2x2 标准的两倍。本文简要概述了复杂的 USB4 新标准，包括电缆和连接器，以及片上系统 (SoC) 构建块。

## USB4 电缆和连接器

USB4 可以使用与 USB 3.2 相同的无源 Type-C 到 Type-C 电缆，但是电缆长度可能不同。USB 3.2 支持在长达 **2 米的电缆上保持 5 Gbps** 的超高速，同样的电缆支持 USB4 达到 **20 Gbps** 的速度。USB 3.2 支持在长达1 米的电缆上保持 10 Gbps 和 20 Gbps 的超高速，同样的电缆也支持 USB4 达到 20 Gbps 的速度。将电缆长度减少到 **0.8 米** ，可以支持 USB4 40 Gbps 的速度。因此，我们预计 USB 3.2 的 1 米电缆将被淘汰，取而代之的是使用新的 USB4 标志的 0.8 米电缆。除 DisplayPort 切换模式外，这些 0.8 米的电缆还适用于 USB 3.2 和 USB4。

USB4 40 Gbps 的电缆长度大于 0.8 米，USB4 20 Gbps 的电缆长度大于 2 米时，需要使用有源电缆。有源电缆的设计很复杂。USB4 营销指南包含新的端口和电缆图标，表明支持 USB4。

![](https://pic1.zhimg.com/v2-e1698e45dde6114e8476cea233b86ebc_1440w.jpg)

USB4 规范描述了不同 USB4 产品类型的特性和功能。

上图显示了 USB4 **双总线系统架构** ，其中 USB 2.0（用于向后兼容）与 USB4 分开布线。

USB 主机“下游端口”连接到 USB4 集线器、USB 扩展坞（图中未显示）和 USB4 设备“上游端口”。

其他 USB4 集线器、USB4 扩展坞和/或 USB4 设备的连接就像 USB 2.0 和 USB 3.2 规范中已知的标准 USB 拓扑和设备树一样。

![](https://pic3.zhimg.com/v2-45ea6ed43c081750c9232c0e7958352e_1440w.jpg)

USB4 PHY IP 可在 USB4 主机、USB4 集线器下游端口 (DFP)、USB4 扩展坞 DFP 和某些 USB4 设备应用的高级工艺节点中使用。

新思科技 USB4 PHY 可以通过定制 Type-C 辅助 (TCA) 数字cross-bar切换功能，以实现主机应用的通道多路复用，如上图所示。

数字交叉开关确保卓越的信号质量，这对于保证 10 Gbps 和 20 Gbps 的数据速率至关重要。

Synopsys 还在为某些 USB4 设备应用提供合适的低成本工艺节点的 USB4 PHY。

USB4 主机、集线器和扩展坞上用于 DFP 的 USB4 PHY 必须以多种模式运行：

USB4、Thunderbolt3、USB 3.x 和 DisplayPort TX 切换模式，如图所示。

![](https://pica.zhimg.com/v2-1f22dcd06895a57b8d14bb30ccac1c30_1440w.jpg)

Synopsys 提供 **DesignWare USB4 设备路由器 IP** ，该 IP 最初面向的是边缘和大容量存储应用的人工智能（AI）加速器。

每个 AI 加速器如何与关联的本地计算和存储器一起运行，取决于具体实际情况，但是图 3 展示了一个可能的示例。

在 USB4 模式下，这个 AI 加速器使用 USB4 连接到带有隧道 PCIe 的 PCIe 4.0 嵌入式端点。

这种模式使 AI 加速器可以利用连接到主机系统存储器的低延迟直接存储器访问 (DMA) 连接。

在 USB 3.x 模式下，该 AI 加速器使用旧版 USB 流（同步）或大量流量连接到 USB 主机。

图 3 还显示了支持 PCIe 4.0 的定制 USB4 PHY。

集成定制的 USB4 PHY 时，可以将 AI 加速器安装在嵌入式主机中的 PCB 上，或安装在 PCIe 扩展卡上。

## 1.3 USB 2.0

参考：

[blog.csdn.net/weixin\_49](https://link.zhihu.com/?target=https%3A//blog.csdn.net/weixin_49259827/article/details/139993521)

**新思USB 2.0 IP** 主要有两个文档需要参考：

《DesignWare Cores USB 2.0 Hi-Speed On-TheGo (OTG) Data book》

《DesignWare Cores USB 2.0 Hi-Speed On-TheGo (OTG) Programming Guide》

前者是描述IP的架构、信号、配置、寄存器等，后者是编程指导，驱动编写主要参考这一部分进行。

![](https://pic3.zhimg.com/v2-3fd280b81fa923a702b20488bba93674_1440w.jpg)

上图左边部分是 **AHB总线** 接口，这一部分主要是实现 **CPU和DWC\_otg** 控制器信息交互功能。

1. **AHB Slave I/F** ：AHB slave接口，此时DWC\_otg控制器是从设备，CPU通过该接口对DWC\_otg的控制和状态寄存器(CSR)、数据FIFO和队列进行读写访问。
2. **AHB Master I/F** （可选的）：AHB master接口，对应DMA部分描述，使能DMA时，DMA是主设备，负责在系统的memory和内部的RAM之间搬运数据。
3. **Data FIFO RAM/IF** ：上图下面部分是Data RAM接口，连接一个外部单端口FIFO RAM(SPRAM)，用于数据存储。

DWC\_otg控制器支持3种PHY接口，如上图右边部分所示：

（1）UTMI+ Level 3 PHY 接口(Revision 1.0 or HSIC)

UTMI+PHY可以是单向或双向的，可以配置为8、16或8/16位数据总线(软件可配置)。UTMI+接口可以配置为与符合修订版1.0的PHY或符合HSIC的PHY一起工作。

（2）ULPI PHY 接口 (Revision 1.1)

ULPI PHY可以是单向或双向的，具有8位SDR或4位DDR总线(软件可配置)。

（3）USB 1.1全速串行收发器接口

USB 1.1全速串行收发器可以作为专用接口，也可以在芯片外部PHY的UTMI+或ULPI接口上共享引脚(软件可配)。

DWC\_otg\_pmu模块（电源管理单元或pmu）负责休眠过程，如下：

![](https://pic3.zhimg.com/v2-57334c580a7087b9a28f6cf0dadeaede_1440w.jpg)

**DWC\_otg控制器** 中各个模块的层次结构，如下：

![](https://picx.zhimg.com/v2-62a872c20a9257fbfa18f4ca74d5708f_1440w.jpg)

DWC\_otg系统的主要模块和控制流程，如下：

![](https://pic2.zhimg.com/v2-49a78f86c5a10ad38c0593ff1a4d2d93_1440w.jpg)

**USB Host模式** 下DWC\_otg控制器的总线接口架构，如下：

![](https://pic4.zhimg.com/v2-ad51bf9236de46498bb48c7614395d3f_1440w.jpg)

image.png

**DWC\_otg\_core架构框图** 。从上到下依次是BIU模块、AIU模块、PFC模块、MAC模块、WPC模块和PIU模块，右边还有个CSR模块：

![](https://pica.zhimg.com/v2-b7155809fd382b0eb3fa2fb59536d2fa_1440w.jpg)

## 1.4 USB3.0

参考：

[blog.csdn.net/gitblog\_0](https://link.zhihu.com/?target=https%3A//blog.csdn.net/gitblog_06679/article/details/143337930)

![](https://pic1.zhimg.com/v2-14cd98f2ddb9107a4e53649ea9bb9bce_1440w.jpg)

**DWC\_usb3核心** 的主要块如下：

■上层常用于USB 2.0和USB 3.0操作。

它具有总线接口、缓冲区管理块、用于调度的列表处理器，以及控制和状态寄存器（CSR）功能。

■USB 2.0付费和MAC层■USB 3.0物理，链接和MAC层因为你可以连接一个设备USB 2.0或USB 3.0设备，其中一个操作活动在给定的时间：

■主机模式，USB2.0和USB 3.0操作可以同时活动同时支持USB 2.0和USB 3.0设备。

■在多端口主机模式下，将实例化PHY、Link和MAC层的多个实例。

缓冲区管理还为每个总线实例提供了单独的Rx和Tx缓冲区。

![](https://picx.zhimg.com/v2-ea24957dfb781d89a5b766a737d90671_1440w.jpg)

上图显示了 **USB 3.0控制器** 的 **逻辑层次结构、时钟域和数据流** 。

图中显示的域在“块描述”中进行了描述。

![](https://pic2.zhimg.com/v2-a12d12ad320075e9b81c1df7903791a1_1440w.jpg)

![](https://picx.zhimg.com/v2-2633a2c5e372c0d0588df7625d999e87_1440w.jpg)

对于USB IP的需求，一般需要梳理：

- 根据速率和功能选择USB2.0或者3.0等
- 需要支持的模式选择SSP、SS、HS等
- 支持协议的选择，例如xCHI
- 是否使用外置TYPC-C
- 时钟复位源确定

## 2\. ETH

![](https://pic3.zhimg.com/v2-446a5811d9e74548000b2030e72142d6_1440w.jpg)

## 2.1 简介

以太网控制器通常由 **MAC（Media Access Control）** 和 **PHY（Physical Layer）** 两部分组成：

- MAC负责 **数据帧的封装和解封装** ，以及管理数据包在局域网中的传输；
- PHY则负责 **将数字信号转换为模拟信号** 进行物理层传输，并在接收端将模拟信号转换为数字信号。
![](https://pic4.zhimg.com/v2-2b1cd45dbdee21288d933cd49582eb3f_1440w.jpg)

**MAC（Media Access Control）** ：

**MAC层** 是以太网协议栈的第二层（数据链路层Data Link Layer），负责管理数据帧的封装和解封装，实现数据包的发送和接收。MAC层还包括地址识别、冲突检测、重发机制等功能。在10M以太网控制器中，MAC层通常运行在硬件中，负责处理以太网帧的发送和接收，确保数据在局域网中的正确传输。PHY（Physical Layer）：

**PHY层** 是以太网协议栈的第一层（物理层Physical Layer），负责将数字信号转换为模拟信号进行物理层传输，并在接收端将模拟信号转换为数字信号。PHY层还包括编解码、调制解调、时钟恢复等功能。10M以太网控制器的PHY层负责将数据从MAC层传输到物理介质上，以及从物理介质接收数据并传递给MAC层。工作原理：

MAC层 **将数据封装为以太网帧** ，并通过PHY层将其转换为模拟信号发送到网络中。接收端的PHY层将 **模拟信号转换为数字信号** 后交给MAC层进行解封装，最终将数据包传递给上层协议栈。以太网控制器遵循IEEE 802.3标准，使用CSMA/CD（Carrier Sense Multiple Access with Collision Detection）协议来协调网络设备之间的数据传输，以实现可靠的数据通信。

![](https://pic4.zhimg.com/v2-f65fbf9422152f5ccdb123fafc574373_1440w.jpg)

是使用的时候还需要DMA的协助，如上图。

CPU 集成 MAC，PHY 采用独立芯片，这种比较常见，如下图：

![](https://pic1.zhimg.com/v2-12e90c664ad9f087b8e29e82cf5c1fe6_1440w.jpg)

MAC 及 PHY 工作在 **OSI 七层模型** 的数据链路层和物理层。具体如下

![](https://pic3.zhimg.com/v2-9df9c4512988da3773043e158c4527c0_1440w.jpg)

![](https://pic2.zhimg.com/v2-439f39d3fd831c96cf2817bffeeafc69_1440w.jpg)

在发送数据的时候，MAC 协议可以事先判断是否可以发送数据，如果可以发送将给数据加上一些控制信息，最终将数据以及控制信息以规定的格式发送到物理层；在接收数据的时候，MAC 协议首先判断输入的信息并是否发生传输错误，如果没有错误，则去掉控制信息发送至 LLC（逻辑链路控制）层。该层协议是以太网 MAC，由 IEEE-802. 3 以太网标准定义。

**什么是 MII?**MII（Media Independent Interface）即 **媒体独立接口** ，MII 接口是 **MAC 与 PHY 连接的标准接口** 。它是 IEEE-802.3 定义的以太网行业标准。MII 接口提供了 MAC 与 PHY 之间、PHY 与 STA（Station Management）之间的互联技术，该接口支持 10Mb/s 与 100Mb/s 的数据传输速率，数据传输的位宽为 4 位。" **媒体独立** "表明在不对MAC硬件重新设计或替换的情况下，任何类型的PHY设备都可以正常工作。802.3协议最多支持32个PHY，但有一定的限制：要符合协议要求的connector特性。MII 接口如下图所示：

![](https://pic1.zhimg.com/v2-0b81ddabf22ad2d9dd0f332946829c4c_1440w.jpg)

image.png

MII 接口主要包括四个部分。

- 一是从 MAC 层到 PHY 层的发送数据接口，
- 二是从 PHY 层到 MAC 层的接收数据接口，
- 三是从PHY 层到 MAC 层的状态指示信号，
- 四是 MAC 层和 PHY 层之间传送控制和状态信息的 MDIO 接口。
![](https://pic3.zhimg.com/v2-ddc1e08c88efe39a58a2569baf6017fc_1440w.jpg)

![](https://pic3.zhimg.com/v2-ddc1e08c88efe39a58a2569baf6017fc_1440w.jpg)

GMII是千兆网的MII接口，这个也有相应的RGMII接口，表示简化了的GMII接口。

**什么是PHY？** PHY（Physical Layer，PHY）是 IEEE802.3 中定义的一个标准模块，STA（station management entity，管理实体，一般为MAC 或 CPU） **通过 SMI（Serial Manage Interface）对 PHY 的行为、状态进行管理和控制，而具体管理和控制动作是通过读写 PHY 内部的寄存器实现的** 。一个 PHY 的基本结构如下图：

![](https://pic4.zhimg.com/v2-fe22c2f29ef2d80808c1590534009669_1440w.jpg)

参考：

1. [blog.csdn.net/csdnpmsm/](https://link.zhihu.com/?target=https%3A//blog.csdn.net/csdnpmsm/article/details/138136174)
2. [blog.csdn.net/qq\_298833](https://link.zhihu.com/?target=https%3A//blog.csdn.net/qq_29883393/article/details/142058929%3Fspm%3D1001.2101.3001.6650.2%26utm_medium%3Ddistribute.pc_relevant.none-task-blog-2~default~YuanLiJiHua~Position-2-142058929-blog-126250407.235) ^v43^pc\_blog\_bottom\_relevance\_base3&depth\_1-utm\_source=distribute.pc\_relevant.none-task-blog-2~default~YuanLiJiHua~Position-2-142058929-blog-126250407.235^v43^pc\_blog\_bottom\_relevance\_base3&utm\_relevant\_index=5

## 2.2 Xilinx的千兆以太网解决方案

**吉比特级以太网媒体访问控制器核（ [GEMAC](https://zhida.zhihu.com/search?content_id=272214099&content_type=Article&match_order=1&q=GEMAC&zhida_source=entity) ）** 是针对1Gb/s（Gbps）以太网媒体访问控制器功能的可参数化的LogiCORE IP解决方案。GEMAC核的设计符合 IEEE 802.3-2002规范。GWMAC核支持两个PHY端接口选项： **GMII或RGMII** 。并且，Xilinx 全面的1Gb/s以太网解决方案包含吉比特MAC和PCS/PMA IP核产品。Xilinx吉比特以太网MAC解决方案还包括带有内置处理器本地总线（PLB）接口（PLB GEMAC）的配置。该配置通过Xilinx嵌入式开发套件（EDK）提供。GEMAC LogiCORE IP可以实现与1000 Base-X PCS/PMA或SGMII核的无缝集成，并提供3种选项用来与PHY器件接口：1000 BASE-X或10位接口（TBI）或SGMII。

![](https://pic2.zhimg.com/v2-fed2f90f3e3f4450992a4fc3d459a885_1440w.jpg)

整个系统分为 **发送模块、接收模块、MAC状态模块、MAC控制模块、MII管理模块和主机接口模块** 六部分。发送模块和接收模块主要提供MAC帧的发送和接收功能，其主要操作有MAC帧的封装与解包以及错误检测，它直接提供了到外部物理层芯片的并行数据接口。在实现中物理层处理直接利用商用的千兆PHY芯片，主要开发量集中在MAC控制器的开发上。

MII管理模块用于 **控制MAC与外部PHY之间的接口** ，用于对PHY进行配置并读取其状态信息。该接口由时钟信号MDC和双向数据信号MDIO组成。MII管理模块则由时钟生成模块、移位寄存器模块和输出控制模块三部分组成。参考： [bbs.elecfans.com/jishu\_](https://link.zhihu.com/?target=https%3A//bbs.elecfans.com/jishu_2072388_1_1.html)

## 2.3 synopsys的以太网解决方案

![](https://pic1.zhimg.com/v2-480948dd5c36340f30d835a43be2dde0_1440w.jpg)

以太网的普及性使其成为我们互联世界不可或缺的一部分，推动通信速度高达 **1.6T** 。为了满足以太网 SoC 的质量、高性能和安全需求，Synopsys 提供了完整的 IP 解决方案，包括可配置的 MAC 和 PCS 控制器以及经过硅验证的 1G 至 224G PHY、MACsec 安全模块、验证 IP 和接口 IP 子系统。应用主要分为三部分：PHY、PCS、XGMA

**PHY：**

多通道 Synopsys 多协议 25G PHY IP 是 Synopsys 高性能多速率收发器产品组合的一部分，适用于高端网络和云计算应用。PHY 面积小，提供低活动和待机功率解决方案，支持多种 **电气标准，包括 PCI Express (PCIe) 4.0、25G 和 100G 以太网、加速器缓存一致性互连 (CCIX)、SATA 和其他行业标准互连协议** 。多协议 25G PHY 使用领先的设计、分析、仿真和测量技术，提供超出标准电气规格的信号完整性和抖动性能。

可配置的发射器和接收器均衡器以及连续校准和自适应 (CCA) 使设计人员能够控制和优化电压和温度变化下的信号完整性和性能。PHY 为待机和工作电源提供高级电源管理功能。 **嵌入式误码率测试器 (BERT)** 和内部眼图监视器提供片上可测试性和通道性能可见性。PHY 与 Synopsys **物理编码子层 (PCS) 和数字控制器/媒体访问控制器 (MAC)** 无缝集成，以缩短设计时间并帮助设计人员实现一次通过硅片成功。

- 支持 1.25 至 25.8 Gbps 数据速率
- 支持带通道裕度的 PCI Express 4.0、1G 至 100G 以太网、CCIX 和 SATA 协议
- 支持具有聚合和分叉功能的 x1 至 x16 宏配置
- 扩频时钟 (SSC)、\` PCIe 单独 Refclk 独立 SSC (SRIS) 和电源管理功能
- 以太网电气节能 (EEE)
- 聚合宏配置的参考时钟共享
- 连续时间线性均衡器 (CTLE)、判决反馈均衡 (DFE) 和前馈均衡 (FFE)
- 嵌入式误码率测试仪 (BERT) 和内部眼图监视器
- 支持 IEEE 1149.6 AC 边界扫描

Synopsys 多协议 32G PHY基本一致。

**PCS：**

Synopsys **以太网物理编码子层 (PCS)** IP 符合 IEEE 802 和 1G、2.5G、5G 和 10G 以太网 PCS 层的联盟规范。Synopsys 以太网 PCS 核心通过独立于介质的接口提供介质访问控制 (MAC) 和物理介质附加子层 (PMA) 之间的接口。支持 1000BASE-X PCS 的 GMII，该 PCS 为单通道定义，工作频率为 125 MHz，以支持 1000BASE-X PMA；支持 10GBASE-X PCS 的 XGMII，该 PCS 为 **四通道定义** ，工作频率为每通道 312.5 MHz，以支持 10GBASE-X 和 10GBASE-R PMA。为了保持转换密度和 DC 平衡，1000BASE-X 和 10GBASE-X PCS 使用 8B/10B 编码/解码，而 10GBASE-R PCS 使用 64B/66B 编码或解码和加扰技术。

Synopsys Ethernet PCS IP 采用最先进的方法进行验证， **包括 RTL 设计、验证、硬件验证和互操作性测试** 。该 IP 易于配置，具有用户友好的应用程序界面，可轻松实现功能和实施目标以满足设计要求，使 Synopsys Ethernet PCS IP 成为精简而灵活的解决方案。结合 Synopsys XGMAC IP 和支持 1G/2.5G/5G/10G 以太网应用的可配置 MAC，以太网 PCS IP 可轻松将 SoC 集成到 1G/2.5G/5G/10G 以太网设计中。

- 符合 XGXS 应用的 IEEE 802.3ae 第 47 条和第 48 条以及 1000B-KX、10GBASE-KX4、自动协商和联盟规范的 IEEE 802.3ap 第 36 条、第 45 条、第 48 条和第 73 条
- 支持 1000BASE-X 应用的第 37 条自动协商
- 符合 1000BASE-X 应用的第 36 条和第 37 条自动协商要求
- 使用 XGXS-PCS 或 10GBASE-X PCS 和/或 1000BASE-X 等千兆应用，可轻松配置为 10 千兆以太网应用
- 选择支持 RXAUI 和 SGMII (10/100/1000 Mbps 操作模式) 等行业标准
- 适用于 KX 和 KX4 的背板以太网，仅 KX 或仅 KX4，KX 配置只需增加时钟频率即可实现 2.5 千兆以太网速度
- 双数据速率 XGMII 转换为单数据速率 312.5 MHz 数据总线
- 可选择将 156.25 MHz 时钟频率的双倍数据宽度（64 位）XGMII 操作转换为 312.5 MHz 时钟频率的单倍数据速率（32 位）操作
- 与 Synopsys XAUI-PHY SerDes 无缝集成
- 可选择为主机配备符合 IEEE 802.3 第 45 条的 MDIO 串行接口或并行微控制器接口。
- 将 XGMII 空闲控制字符转换为随机序列的代码组，以实现通道同步、通道与通道对齐以及时钟速率补偿
- 8B/10B 编码将二进制数据转换为每个通道的 10 位编码数据
- 接收端的通道同步确定代码组边界
- 将所有接收到的代码组校正为对齐模式，最大允许偏移为 5 个周期
- 时钟速率补偿，通过插入或删除空闲字符来补偿恢复时钟和本地时钟之间的频率变化，时钟间最大允许变化为 200ppm
- 支持 XGMII 上的内部环回，以便通过接收到发送数字路径进行调试，以及对 SerDes PHY 发送到 SerDes PHY 接收通道的环回控制
- 故障情况下的链路状态报告以及可用于监控和调试的错误状态和统计的多种选项

**XGMA：**

Synopsys 10G 以太网 XGMAC IP 专为 1/2.5/5/10G 以太网应用而设计，提供一套全面的 **可配置功能，以实现优化实施** 。它可配置为仅 MAC，在发送和接收端使用 FIFO 接口，或使用 ARM® AMBA® AXI 主/次接口。管理数据输入/输出 (MDIO) 访问可配置为 AMBA APB™ 或 AMBA AXI 次接口。

Synopsys XGMAC IP 提供 **10G 媒体独立接口 (XGMII)，用于与 10G PHY 通信** 。它还提供了 **MDIO 接口** ，用于寻址符合 IEEE 802.3 标准的 MDIO 设备。

Synopsys Ethernet XGMAC 可以与符合标准的 **全双工内联Synopsys MACsec 安全模块** 相结合，使设计人员能够快速在其系统中集成安全性，从而缩短产品上市时间并降低风险。

- 符合 IEEE 802.3az-2010 规范
- 支持 1/2.5/5/10G 数据速率
- 支持VLAN标签处理校验和插入和AVB
- 支持 IEEE 1588 PTP
- 使用 RMON/MIB 计数器完成网络统计（可选）
- MDIO 接口和高级电源管理功能
- ASIL B Ready IP 专门针对 ISO 26262 随机硬件故障进行开发和评估，ASIL 系统性进展顺利
- 以太网和 AMBA 的验证 IP
- 经过硅验证
- 轻松与 MACsec 安全模块集成

Synopsys **以太网服务质量控制器 IP** ：

Synopsys 以太网服务质量 (**QoS**) 控制器 IP 支持 1M、10M、1G 和 2.5G 速度，可实现开放系统互连 (OSI) 以太网系统的链路层。经过硅验证的可配置和可扩展 IP 已批量出货，并已成功应用于各种以太网应用，包括 **专业和消费音频/视频、汽车、工业和一系列消费和数据中心应用** 。经 ASIL B Ready ISO 26262 认证的 Synopsys 以太网 QoS 控制器 IP 配有汽车安全套件。

Synopsys 以太网 QoS 控制器 IP 旨在支持实时网络以及原始 **IEEE 音频视频桥接 (AVB) 和后续时间敏感网络 (TSN) 规范** 。此外，还提供当今设计所需的数据中心桥接、分段和 UDP 卸载功能等高级功能作为简单的配置选项。

可配置 IP 的典型设计会导致在配置期间 **跨接多个层** ，从而导致数据在跨层传输时出现双重缓冲，产生许多不必要的延迟。coreConsultant 配置工具可在配置时消除延迟，从而提供高性能 IP。

参考：

[synopsys.com/zh-cn/desi](https://link.zhihu.com/?target=https%3A//www.synopsys.com/zh-cn/designware-ip/interface-ip/ethernet.html)

tips：

- 对于汽车来说，需要使用带功能安全的MAC和PHY IP
- 访问DMA的总线需求，例如AXI支持
- 配置eth寄存器需要总线支持，例如APB
- 中断跟core的配置连接
- 根据性能需求进行选择
- Qos音视频实时数据需求及时间敏感网络支持
- 低功耗设计，休眠唤醒、关闭等功能

## 3\. PCIe

![](https://pica.zhimg.com/v2-ab7fbe1cbc64f129b7bdd2a0597286a2_1440w.jpg)

## 3.1 简介

`PCI总线（Peripheral Component Interconnect，外部设备互联），由Intel公司提出，其主要功能是连接外部设备；`

PCIE(PCI Express)和PCI不同的是实现了传输方式从并行到串行的转变。PCI Express是采用点对点的串行连接方式，这个和以前的并行通道大为不同，它允许和每个设备建立独立的数据传输通道。不用再向整个系统请求带宽，这样也就轻松的到达了其他接口设备可望而不可及的高带宽。

`PCI Express主要可以为我们带来如下的新功能：`

性能：PCI Express总线只需要从芯片组中引出很少的引脚，所以使得主板布线难度大大降低（其引线数目比现在的PCI总线减少大约75％）但是却具有比现在的PCI高的多的带宽和传输速度，另外在配置的灵活性方面PCI Express也优于PCI。它可以根据所连接的硬件设备的不同，使用不同频率的同其联系通讯。

多种连接方式:这是同PCI总线非常不同的地方, PCI Express总线可以“走出机箱”。也就是说PCI Express可以如同现在的USB或者Firewire一样通过计算机上的一定接口同外部采用相应符合PCI Express标准接口的设备进行连接和通讯。

点对点总线:相对于PCI这种“总线式”的连接方式，一旦PCI总线有瓶颈现象发生，将会影响所有连接其上的PCI设备。PCI Express总线采用了点对点技术，这样每个PCI Express设备都是直接同系统芯片进行交流，而不再存在带宽问题。

高级功能：PCI Express可以使用多种不同的信号协议包括它本身的协议。它还具有高级电源管理和监视功能，这样所有的PCI Express设备都会支持热插拔。在PCI Express中诸如内存纠错等功能都会成为标准功能。

跨平台的兼容性：PCI Express最大的优点之一就是它的跨平台兼容性。现在的符合PCI 2。3规范的板卡将可以在低带宽的PCI Express插槽上使用。采用了点到点的连接技术PCI Express在每个设备都有自己专用的连接，不需要向共享总线请求带宽。更加直白的说，PCI Express的目标就是要实现芯片之间的I/O连接、扩展板卡（比如显卡、声卡）的连接，甚至还能提供USB 接口、IEEE 1394接口的连接支持。

`参考：https://zhuanlan.zhihu.com/p/607999027PCIE` 是一种 **高速串行计算机扩展总线标准** ，属于高速串行点对点双通道高带宽传输，所连接的设备分配独享通道带宽，不共享总线带宽，支持主动电源的管理，错误报告，端对端的可靠性传输，热插拔以及服务质量等功能。优点有 **数据传输速率高** ， **发展潜力相当大** 。

基于硬件的通信，提高速率有几个点：

1\. 线个数要多，整理PCIE就比ETH USB多很多线

2\. 单个线的数据要快，使用金子传输速度快，损耗小，稳定高速

3\. 通信距离要近

4\. 其他软件编码优化方法

![](https://pica.zhimg.com/v2-27dcc0b47ec83d50eaf268e725dbd610_1440w.jpg)

PCI Express（PCIe）的通道（lane）配置是决定PCIe设备性能的关键因素。通道配置通常用“x”后跟一个数字表示，如x1、x4、x8、x16等，这个数字代表了有多少个独立的PCIe通道被使用，即有几个lane。这些配置影响了设备的带宽和数据传输速率，从而影响了整体的系统性能。x32基本没有产品实现过，所以一般最大是x16.

- **从PCIe 1.0到最新版本的关键变化**
- **PCIe 1.0**  
	：提供2.5 GTps的单向带宽，每个通道的最大传输速率为250 MB/s。
- **PCIe 2.0**  
	：带宽翻倍至5.0 GTps，每个通道的最大传输速率为500 MB/s。
- **PCIe 3.0**  
	：再次翻倍至8.0 GTps，每个通道的最大传输速率为1 GB/s，同时提高了编码效率，从8b/10b编码改为128b/130b编码。
- **PCIe 4.0**  
	：带宽达到16.0 GTps，每个通道的最大传输速率为2 GB/s。
- **PCIe 5.0**  
	：最新版本，带宽为32.0 GTps，每个通道的最大传输速率为4 GB/s。
- **PCIe 6.0**  
	：带宽达到64.0 GTps，每个通道的最大传输速率为8 GB/s，引入了PAM4调制技术，进一步提高传输效率。
![](https://pic1.zhimg.com/v2-d66c83e86ace75e333d515236eec537c_1440w.jpg)

![](https://pic3.zhimg.com/v2-08577d20d18e9be925d326c87a92deb4_1440w.jpg)

上面的层次组成结构图展示了PCIe总线的层次组成结构。

- **应用层**  
	：这不是PCIe规范正式定义的一部分，而是由具体实现者根据需求设计的部分。应用层决定了设备的功能和类型，例如存储设备、网络适配器或图形卡。
- **事务层（Transaction Layer）**  
	：负责处理事务的初始化和完成，包括读取、写入、配置和中断等操作。事务层还管理事务的优先级和流量控制，确保数据请求和响应的高效处理。
- **数据链路层（Data Link Layer）**  
	：分为两个子层：
- **链路子层（Link Sublayer）**  
	：负责链路的建立、训练、维护和错误检测，确保数据包的准确传输。
- **物理媒体附件子层（Physical Media Attachment Sublayer）**  
	：负责数据的编码和解码，确保数据在物理层的正确传输。
- **物理层（Physical Layer）**  
	：包括电气信号的生成、接收和处理，以及串行数据的编码和解码。物理层进一步细分为两个子层：
- **电气子层（Electrical Sublayer）**  
	：处理电气信号的生成和接收，确保信号的完整性和稳定性。
- **介质访问控制子层（Media Access Control Sublayer）**  
	：管理数据在物理介质上的传输，包括信号的编码和解码。

PCIE报文：

![](https://pic2.zhimg.com/v2-0e358bd65314c94098336ca42c748157_1440w.jpg)

数据报文发送时在核心层中产生，经过设备的事务层、数据链路层和物理层，最终发送出去;接收时则相反。实际上一个完整的TLP包由多个字段组成，并且这些字段分别由三个层次各自构建，最后经过物理层形成最终的TLP。

PCIe的拓扑结构：

![](https://pic1.zhimg.com/v2-868218dd42b1d3b591277144441c4386_1440w.jpg)

Root Complex：RC，将PCIe总线端口，存储器控制器等一系列与外部设备有关的接口都集成在一起，统称为RC。

Endpoint：EP，基于PCIe总线的设备。

Switch: 一个特殊的设备，多个虚拟PCI-to-PCI桥接设备的逻辑组件，该设备由1个上游端口和2~n个下游端口组成

**配置空间与地址映射** 每个PCIe设备都有一个配置空间，其中包含了设备的信息和控制寄存器。配置空间分为多个寄存器，包括Vendor ID、Device ID、Class Code、BAR（Base Address Register）等。地址映射确保了主机能够正确地寻址和通信，通过配置空间可以读取和修改设备的状态和设置。

## 3.2 Synopsys PCIE介绍

参考： [synopsys.com/dw/ipdir.p](https://link.zhihu.com/?target=https%3A//www.synopsys.com/dw/ipdir.php%3Fds%3Ddwc_pcie6_controller)

![](https://pica.zhimg.com/v2-00d709e620b0a60fbea343e6df5211c0_1440w.jpg)

可配置且可扩展的 Synopsys PCI Express® (PCIe®) 6.x 控制器 IP 支持 PCI Express 6.x 规范的所有必需功能，并可由用户配置以支持端点 (EP)、根端口、双模 (DM) 或交换端口 (SW) 应用。采用全新 MultiStream 架构的低延迟控制器支持 64GT/s x16 通道带宽，最高支持 1024 位数据路径，同时在 1GHz 频率下实现时序收敛。该控制器可确保多源和多虚拟通道实现最佳流量。对主机、设备和双模的支持，即使在缺乏可用的 6.x 主机和互操作合作伙伴的情况下，也能实现早期互操作性。设计人员可以利用该控制器对 Arm AXI 的支持以及包括可延迟内存写入在内的高级主机功能，为基于 Arm 的 SoC 实现最大吞吐量。该控制器的可靠性、可用性和可维护性 (RAS) 功能可增强数据完整性、简化固件开发并改善链路启动。

![](https://pic1.zhimg.com/v2-50269b22d127bf6732e1f017b417db32_1440w.jpg)

如上图为整个PCIE的框架，在C1中PIPE-CompliantPHY部分的SERDES模块，DWC PCIe Core为synopsys提供的IP黄色部分为用户需要完成的部分，主要包括参数的配置和数据的发送和接收。

- 支持 PCI Express 6.2/6.1/6.0.1 (64GT/s)、5.0 (32 GT/s)、4.0 (16 GT/s)、3.1 (8 GT/s) 和 PIPE (32 位) 规范的所有必需功能
- 基于经过硅验证的 PCIe 6.x 控制器设计
- 允许完整的 64GT/s x16 通道带宽，最高支持 1024 位数据路径实现
- 支持包括 ECC 在内的高级 RAS 数据保护功能
- 支持 Synopsys 原生接口或可选的 Arm® AMBA® 5/4/3 AXI 应用接口
- 可配置为低功耗、小面积和低延迟
- 利用 Synopsys HyperDMA™ 实现高效的嵌入式 DMA 应用
- 通过完整性和数据加密 (IDE) ECN 可选支持 PCI Express 链路加密
- 符合标准的 IDE 安全模块使用 PCIe 6.x 接口保护 SoC 的数据传输
- TDISP 支持 PCIe 的单根 I/O 虚拟化 (SR IOV) 和通过 IDE 实现的硬件安全

Synopsys面向 PCIe 6.x 的完整性和数据加密 (IDE) 安全模块已通过 Synopsys 控制器 IP 预验证，可帮助设计人员保护其 SoC 中的数据传输免遭篡改和物理攻击。符合标准的 IDE 安全模块采用 Synopsys 面向 PCIe 的控制器 IP 进行设计和验证，可加速 SoC 集成，提供高效的机密性、完整性和重放保护。带有 IDE 的 Synopsys 安全 PCIe 控制器支持 TEE 设备接口安全协议 (TDISP)，这是 PCI-SIG 发布的工程变更通知 (ECN)。TDISP 标准化框架定义了如何保护虚拟机主机和设备之间的互连，无论数据中心位于何处或谁有权访问内部服务器。带有 IDE 的 Synopsys PCIe 控制器使设计人员能够在其超大规模 SoC 中构建完整的 TDISP 支持，并缓解数据和系统攻击，从而应对虚拟化云安全挑战。了解丰富的接口安全解决方案组合。

Synopsys PCIe 6.x 控制器 IP 可与先进 FinFET 工艺中经过硅验证的 PCIe 6 PHY IP 无缝互操作，从而提供一种低风险解决方案，设计人员可以使用它来加快产品上市时间并高效地提供需要 64GT/s PCIe 6.x 技术的差异化产品。

- 支持 PCIe 6.x 和 CXL 3.x 规范的最新特性
- 支持 PAM-4 信令和最多 x16 通道分叉配置
- 通过独特的 DSP 算法实现跨通道更高的功率效率
- 利用正在申请专利的诊断功能实现接近零的链路中断时间
- 利用布局感知架构最大限度地减少封装串扰
- 通过基于 ADC/DSP 的架构，实现跨 PVT 变化的一致性能
- 支持接收器的 PCIe 通道裕度
- 支持L0p子状态电源状态、电源门控和电源岛
- 嵌入式误码率测试仪 (BERT)、非破坏性内部眼图监视器和第一位误码率 (FBER)
- 内置自测试向量、伪随机位序列器 (PRBS) 生成和检查器
- 支持-40°C至125°C结温
- 支持倒装芯片封装

## 3.3 PCIE驱动软件介绍

在linux环境下开发一个基本的PCIe驱动程序框架，其主要需要包含以下模块：

1. 编写设备描述：根据PCIe设备规范，编写设备描述，包括设备的厂商ID、设备ID、供应商特定的信息等。
2. 分配和注册驱动程序：分配一个驱动程序对象，并在系统中注册该驱动程序。这使得操作系统可以识别和加载驱动程序。
3. 初始化设备：在驱动程序中编写设备初始化函数，初始化PCIe设备的各种配置和状态。
4. 分配和映射内存资源：如果设备使用了内存空间，需要分配和映射内存资源，以便驱动程序可以访问并与设备进行数据交换。
5. 注册中断处理程序：如果设备支持中断，驱动程序需要注册中断处理程序，以便在设备触发中断时进行相应的处理。
6. 实现具体的设备操作函数：编写设备操作函数，例如读取设备寄存器、写入设备寄存器、发送命令等，以与设备进行通信和控制。

设备描述需要用到PCI的配置寄存器。

![](https://pic1.zhimg.com/v2-3aa6ddd45d0cfb577e89649195b73638_1440w.jpg)

PCI兼容配置寄存器空间

上图展示了PCI配置寄存器空间，每个PCI设备都至少有256字节的地址空间，前64字节是标准化的，其余是设备相关的。当引入PCIe之后，最初始的256byte配置空间已经不足以放下所有新需要的配置了。因此配置空间的大小从原先的256Byte扩展至了4KByte，增加了可选扩展寄存器。通常，随设备一同发布的技术文档会详细描述已支持的寄存器。本文这里关心的是如何标识设备以及驱动程序如何查询设备，因此只介绍几个常用的寄存器。

用三五个PCI寄存器便可标识一个设备：vendorID、deviceID和class是常用的三个寄存器。每个PCI设备制造商会将正确的值赋予这三个只读寄存器，驱动程序可利用它们查询设备。此外，subsystem vendorID和subsystem deviceID字段用来进一步区分相似的设备。

vendorID用于标识硬件制造商。例如，每个Intel设备被标识为同一个厂商编号，即0x8086。PCISpecialInterest Group维护有一个全球的厂商编号注册表，制造商必须申请一个唯一编号并赋于它们的寄存器。

deviceID由制造商选择;无需对设备ID进行官方注册。该ID通常和厂商ID 配对生成一个唯一的 32 位硬件设备标识符。我们使用签名(signature)一词来表示一对厂商和设备ID。设备驱动程序通常依靠于该签名来识别其设备;可以从硬件手册中找到目标设备的签名值。

class用于标识每个外部设备属于某个类 (class)。例如，“ethernet(以太网)”和“token ring(令牌环)”是同属“network(网络)”组的两个类，而“serial(串行)”和“parallel(并行)”类同属“communication(通信)”组。某些驱动程序可支持多个相似的设备，每个具有不同的签名，但都属于同一个类;这些驱动程序可依靠 class 寄存器来识别它们的外设。

我们可以通过执行lspci -nn指令来查看系统中pci设备的相关信息，输出如下图所示。

![](https://pic1.zhimg.com/v2-595d7c6f0066f07a82838b019ed789de_1440w.jpg)

以图中第一行输出为例，00:00.0表示此设备位于PCI总线上的位置，Host bridge\[0600\]表示该设备的类型是主机桥。Intel Corporation 12th Gen Core Processor Host Bridge/DRAM Registers表示该设备是Intel12代处理器的主桥，8086：4668则分别指明了vendorID和deviceID，rev代表了版本信息。 除此之外，lspci指令还可以更详细的展示设备信息、也可以查看PCI设备的配置空间，具体用法请参见手册。

在pci驱动程序中，pci\_dev、pci\_driver、pci\_device\_id等结构体起着非常关键的作用。pci\_device\_id用于定义该驱动程序支持的不同类型的PCI设备列表。

pci\_driver结构体用来向PCI核心描述PCI驱动程序，主要定义了驱动名称、探测函数、移除函数等变量和函数指针。所有的PCI驱动程序都应该创建该结构体并注册到内核中。该结构体定义在include/linux/pci.h中。

详细参考： [zhuanlan.zhihu.com/p/66](https://zhuanlan.zhihu.com/p/663693506)

> 后记：  
> 本篇本来想再把高速外设的内容涵盖全一点，但是 **篇幅有限** ，下一篇再继续。  
> 其实上面的内容基本都是 **东拼西凑** ，但是并不是没有价值。对于没有入门的朋友来说，一般是 **你不知道：你要知道什么** 。例如驱动开发人员，就不了解硬件的一些东西，或许只有SoC原厂的工作经验才能了解。知识有很多，不断新见到的名字符号， **哪些跟你有联系，那个方向是正确的** 。需要系统的去看待，找几个实例整体的研究下。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、 **点赞、收藏、在看、划线和评论交流** ！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-03-30 09:25・上海[真的需要万兆吗？2K+的万兆NAS 绿联DXP4800 Pro 是真利器还是噱头？真机实测，一探究竟](https://zhuanlan.zhihu.com/p/1979558185040885257)

[

如果说千兆网络是城市快速路，应对日常通勤是OK的；那么2.5G网就是宽阔平坦的高速大道，让多任务并行也畅通无阻；而万兆...

](https://zhuanlan.zhihu.com/p/1979558185040885257)