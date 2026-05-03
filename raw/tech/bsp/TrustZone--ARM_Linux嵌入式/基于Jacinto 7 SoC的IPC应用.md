---
title: "基于Jacinto 7 SoC的IPC应用"
source: "https://zhuanlan.zhihu.com/p/657036327"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！ PerfaceJacinto 7 SoC是德州仪器（TI）的产品。德州仪器是一家全球知名的半导体公司，…"
tags:
  - "clippings"
---
1 人赞同了该文章

---

大家好！我是不知名的 [安全工程师](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E5%B7%A5%E7%A8%8B%E5%B8%88&zhida_source=entity) Hkcoco！

欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

获取更多精彩内容哦！！！

---

## Perface

Jacinto 7 SoC是 [德州仪器](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E5%BE%B7%E5%B7%9E%E4%BB%AA%E5%99%A8&zhida_source=entity) （TI）的产品。德州仪器是一家全球知名的 [半导体](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E5%8D%8A%E5%AF%BC%E4%BD%93&zhida_source=entity) 公司，一直致力于为客户提供创新和可靠的解决方案。

Jacinto 7 SoC是一款高度集成的处理器，专为满足汽车市场的需求而设计。它包含了用于加速数据密集型任务的专用硬件加速器，以及确保 [功能安全](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E5%8A%9F%E8%83%BD%E5%AE%89%E5%85%A8&zhida_source=entity) 的组件。此外，Jacinto 7 SoC还配备了一个统一的软件平台，以支持整车的计算需求。

在制造过程中，Jacinto 7 SoC遵循16 FinFET工艺技术，这使得它能达到一个优秀的性能与 [功率平衡](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E5%8A%9F%E7%8E%87%E5%B9%B3%E8%A1%A1&zhida_source=entity) ，适应汽车环境的热需求。另外，Jacinto 7 SoC还集成了多种硬件加速器，特别是在成像、网络和深度学习领域，以提高整体系统性能并降低成本。

针对汽车应用，Jacinto 7 SoC的一个重要特性是集成了一个安全微控制器单元（MCU），这可以充当一个“芯片中的芯片”的角色。这种设计使得外部MCU的需求被消除，同时仍然满足安全目标和系统电源限制。

总的来说，德州仪器Jacinto 7 SoC是一款专为汽车应用设计的、高度集成的处理器，它通过创新的硬件和 [软件设计](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E8%BD%AF%E4%BB%B6%E8%AE%BE%E8%AE%A1&zhida_source=entity) ，以满足汽车市场的特定需求。

## 特性

Jacinto 7 SoC在SoC上有多个不同的CPU，例如R5F、A72、C7x、C6x。运行在这些CPU上的软件需要相互协作并实现一个用例。协作方式称为处理器间通信或IPC。 **每个CPU和操作系统上都提供了IPC库，以允许更高级别的应用程序相互通信。**

> 它包含了多个CPU核心，其中包括TI DSP处理器（C66/C7x），以及Cortex A72。另外，Jacinto 7 SoC还集成了Main域Cortex R5F和MCU域Cortex R5F，以及一些其他的专用硬件加速器。
> 
> Main域Cortex R5F：这个处理器单元主要负责处理汽车中的各种传感器和 [执行器](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E6%89%A7%E8%A1%8C%E5%99%A8&zhida_source=entity) 的信号，以及执行相应的动作。它需要处理大量的 [实时数据](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E5%AE%9E%E6%97%B6%E6%95%B0%E6%8D%AE&zhida_source=entity) ，并需要与车辆的其他部件（如引擎、 [刹车系统](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E5%88%B9%E8%BD%A6%E7%B3%BB%E7%BB%9F&zhida_source=entity) 等）进行通信。因此，它需要具备高性能和低延迟的处理能力。 MCU域Cortex R5F：这个处理器单元主要负责处理一些特定的汽车控制任务，如启动底层硬件驱动、同步时间，以及启动操作系统和顶层应用软件中的控制执行类部分逻辑运算等。它需要处理的任务可能与车辆的控制系统、 [安全系统](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E7%B3%BB%E7%BB%9F&zhida_source=entity) 等有关。

不同CPU/操作系统上的整体IPC [软件堆栈](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E8%BD%AF%E4%BB%B6%E5%A0%86%E6%A0%88&zhida_source=entity) 如下表所示

| IPC SW layer | Description |
| --- | --- |
| Application | Application which sends/receives IPC messages |
| RPMSG CHAR | \[ONLY in Linux\] User space API used by application to sends/receives IPC messages |
| RPMSG | SW protocol and interface used to exchange messages between endpoints on a destination CPU |
| VRING | Shared memory based SW queue which temporarily holds messages as they are exchanges between two CPUs |
| HW Mailbox | Hardware mechnism used for interrupt notification between two CPUs |

IPC的主要 [软件组件](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E8%BD%AF%E4%BB%B6%E7%BB%84%E4%BB%B6&zhida_source=entity) 是，

- 1、用于TI-RTOS的PDK IPC LLD驱动程序，包括RPMSG、VRING和HW mailbox驱动程序。
- 2、用于Linux的Linux内核IPC驱动程序套件，包括RPMSG Char、RPMSG、VRING和HW mailbox驱动程序。

**PDK IPC库和Linux内核IPC驱动程序套件支持J7ES SoC中存在的所有内核之间的通信** 。PDK IPC库与TI-RTOS应用程序链接，并支持与运行TI-RTOS的其他内核（如R5FSS内核和C6x/C7x DSP内核）基于消息的通信。它还能够使用相同的API与运行Linux的A72内核通信。

Linux IPC [驱动程序](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=6&q=%E9%A9%B1%E5%8A%A8%E7%A8%8B%E5%BA%8F&zhida_source=entity) 作为内核的一部分运行在A72内核上，可以与R5FSS和DSP内核通信。

> PDK：Processor Development Kit（处理器开发工具包）是德州仪器提供的一种开发工具包，用于为Jacinto 7 SoC等处理器开发应用程序和操作系统。它提供了一组工具和库，帮助开发人员编写、调试和测试应用程序，以及集成到TI-RTOS等 [操作系统](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=5&q=%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F&zhida_source=entity) 中。 IPC LLD：IPC Layered Driver（IPC LLD）是德州仪器为Jacinto 7 SoC等处理器提供的一种低级驱动程序。它为处理器和 [外部设备](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E5%A4%96%E9%83%A8%E8%AE%BE%E5%A4%87&zhida_source=entity) 之间的通信提供了一个 [软件接口](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E8%BD%AF%E4%BB%B6%E6%8E%A5%E5%8F%A3&zhida_source=entity) ，使得应用程序可以与硬件设备进行交互。IPC LLD驱动程序通常与操作系统的内核集成，用于管理和控制处理器的底层硬件资源，例如内存、外设和中断等。

## RPMSG and VRING

## RPMSG

**RPMSG是Linux和TI-RTOS使用的通用消息传递框架** 。RPMSG是一种基于端点的协议，服务器 [CPU](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=9&q=CPU&zhida_source=entity) 可以运行在专用端点上侦听传入消息的服务，而所有其他CPU都可以向该（服务器CPU、 [服务端](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E6%9C%8D%E5%8A%A1%E7%AB%AF&zhida_source=entity) 点）元组发送请求。您可以想到网络中的UDP/IP层的类比，其中CPU名称类似于IP地址，端点类似于UDP [端口号](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E7%AB%AF%E5%8F%A3%E5%8F%B7&zhida_source=entity) 。

客户端CPU /任务在向服务器发送消息时也提供了应答端点，以便服务器可以将其应答发送到客户端CPU。

通过使用多个端点，可以在同一组CPU之间打开多个逻辑IPC通信通道。

虽然RPMSG是应用程序所看到的API或协议，但IPC驱动程序在内部使用VRING在不同（RPMSG CPU，端点）元组之间实际传递消息。RMSG端点与VRING之间的关系如下图所示。

![](https://picx.zhimg.com/v2-e862e9271c114b76886be58fe915cab3_1440w.jpg)

RPMSG and VRING

## VRING

VRING是一对CPU之间的 [共享内存段](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E5%85%B1%E4%BA%AB%E5%86%85%E5%AD%98%E6%AE%B5&zhida_source=entity) ，它保存两个CPU之间传递的消息。消息从发送者传递到接收者，然后再次传递回来的事件序列如下图所示。

![](https://pica.zhimg.com/v2-d8a5e5773b30dedf92cf74209f3067f0_1440w.jpg)

RPMSG and VRING message exchange data flow

步骤的顺序如下所述，

- 应用程序将消息发送到给定的目标（CPU、端点）
- 消息首先从应用程序复制到两个CPU之间使用的VRING。此后，IPC驱动程序将VRING ID发布到HW邮箱中。
- 这将在目标CPU上触发中断。在目标CPU的ISR中，它提取VRING ID，然后根据VRING ID检查该VRING中的任何消息
- 如果收到消息，它将从VRING中提取消息，并将其放入目标RPMSG端点队列。然后，它触发此RPMSG端点上阻止的应用程序
- 然后，应用程序处理接收到的消息，并使用相同的RPMSG和VRING机制以相反的方向回复发送者CPU。

## RPMSG CHAR

- RPMSG CHAR是一个用户空间API，它提供对Linux中RPMSG内核驱动程序的访问。
- RPMSG CHAR为linux应用程序提供了一个文件IO接口，用于读取和写入消息到不同的CPU
- TI-RTOS上需要与linux对话的应用程序需要“宣布”其端点到linux。这将在linux上创建一个设备“/dev/rpmsgX”。
- Linux用户空间应用程序可以使用此设备读取和写入消息到RTOS侧的关联端点。
- 通常的linux用户空间API，如“select”，可用于等待来自多个CPU的多个端点。
- 提供了一个实用程序库“rpmsg\_char\_helper”，以简化从不同CPU发现和初始化已宣布的RPMSG端点

## Hardware Mailbox

- 硬件邮箱主要用于提供具有小32位负载的中断事件通知。
	- VRING使用硬件邮箱在目标CPU上触发中断。
- 每个邮箱由16个单向HW队列组成，与最多4个通信用户或CPU接口。
- 每个邮箱队列一次最多可以容纳4个字大小的邮件。
- 每个通信用户都可以使用以下邮箱状态和中断事件通知
	- 每个邮箱的Rx的新消息状态事件（只要邮箱有消息就触发）
		- Tx的非完整状态事件（只要邮箱具有空fifo就会触发）
		- 每个邮箱的“邮箱已满”和“未读邮件数” [状态寄存器](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E7%8A%B6%E6%80%81%E5%AF%84%E5%AD%98%E5%99%A8&zhida_source=entity)
- J721E SoC有12个硬件邮箱实例，即12个16个硬件邮箱队列

下图是硬件邮箱的逻辑框图。

![](https://pic4.zhimg.com/v2-9126ada04e82c5de4cd14bf85f688743_1440w.jpg)

> 本文使用 [Zhihu On VSCode](https://zhuanlan.zhihu.com/p/106057556) 创作并发布

发布于 2023-09-18 22:50・四川[用表单大师无代码平台，如何自由搭建业务系统？看这一篇就够了](https://zhuanlan.zhihu.com/p/678580817)

[

表单大师是什么？ 一句话概括表单大师是一个零代码企业轻应用搭建平台，可以让不懂技术的业务人员也能像搭积木一样轻松搭...

](https://zhuanlan.zhihu.com/p/678580817)