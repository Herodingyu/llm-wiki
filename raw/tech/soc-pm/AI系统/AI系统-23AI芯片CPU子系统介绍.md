---
title: "AI系统-23AI芯片CPU子系统介绍"
source: "https://zhuanlan.zhihu.com/p/2021604325730828842"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "AI SoC中有很多 异构核，围绕着这些异构核产生了很多子系统之前也介绍过:AI系统-16AI SoC推理芯片架构介绍。这里面的 老大哥毫无疑问就是CPU子系统，尽管其他AI子系统特别是NPU，是干活的主力，但是头把交椅还得资…"
tags:
  - "clippings"
---
[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810)

16 人赞同了该文章

![](https://pic4.zhimg.com/v2-c841558187f588b55027233e17899c3f_1440w.jpg)

AI SoC中有很多 **异构核** ，围绕着这些异构核产生了很多子系统之前也介绍过:[AI系统-16AI SoC推理芯片架构介绍](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247487299%26idx%3D1%26sn%3D2937eb9277f5f98025bbd993391e5fd8%26scene%3D21%23wechat_redirect) 。

这里面的 **老大哥** 毫无疑问就是 **CPU子系统** ，尽管其他AI子系统特别是NPU，是干活的主力，但是 **头把交椅** 还得 **资格最老** 的CPU来坐，进行全局指挥。当然还有一个太上皇，参考之前的文章： [ARM SCP入门-简介和代码下载编译](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484440%26idx%3D1%26sn%3De08b89ca8526eb6ad19ed2f55c61b80e%26scene%3D21%23wechat_redirect)

本文从比较成熟、使用最广的 **[ARM A核](https://zhida.zhihu.com/search?content_id=272190831&content_type=Article&match_order=1&q=ARM+A%E6%A0%B8&zhida_source=entity)** 为例来介绍下CPU子系统，应该比较浅显，具体细节会无比的复杂，这里能 **入门** 可以。

## 1\. CPU子系统介绍

参考：

[developer.arm.com/Proce](https://link.zhihu.com/?target=https%3A//developer.arm.com/Processors/CoreLink) [CMN-600AE](https://zhida.zhihu.com/search?content_id=272190831&content_type=Article&match_order=1&q=CMN-600AE&zhida_source=entity)

![](https://pic2.zhimg.com/v2-94cf1168598493e58b6d2fbc0b5d1023_1440w.jpg)

上图是ARM针对高性能汽车系统而设计的 **CMN-600AE** ，包括数字驾 **驶舱** 、高级 **驾驶辅助** 系统 (ADAS) 和 **自动驾驶** 系统。在设计CPU子系统的时候可以选用如上图 **Arm CoreLink CMN-600AE 相干网状网络** 的架构。

**CMN-600AE** 是 Arm Safety Ready 计划的一部分，该计划是 Arm 产品组合中的一系列产品，这些产品都经过了各种严格级别的 **功能安全** 系统流程和开发。

在ARM架构的 **CPU子系统** 中，组件设计旨在高效地整合了多种功能模块，以支持处理器核心的运行、内存管理、中断处理、数据交换以及与外部设备的交互等。以下是ARM CPU子系统中的一些 **关键组** 件：

1. **CPU Cores (处理器核心)**: 包括多个处理单元，如高性能的Cortex-A系列核心或高效能效核心，负责执行指令。
2. **GIC (Generic Interrupt Controller)**: 管理中断请求，确保系统对事件做出快速响应，支持多级中断处理和虚拟化。
3. **DSU (DynamIQ Shared Unit)**: 在具备DynamIQ技术的SoC中，DSU管理共享资源，如 **L3缓存，优化多核通信和数据一致性** 。
4. **Cache System**: 包括L1 Cache（靠近核心的高速缓存，分指令和数据缓存），L2 Cache（更大，有时是多核共享）。
5. **Memory Controller**: 控制内存访问，如DDR控制器，管理与主存交互。
6. **AMBA总线**: 如AMBA总线架构，提供系统内部组件间的通信，包括常见的AXI（Advanced eXtensible Interface）协议。
7. **System Control Block**: 负理系统复位、时钟、电源管理等初始化配置。
8. **Security Features**: 如TrustZone、加密引擎，确保系统安全。
9. **Debugging and Trace**: CoreSight、JTAGC等，方便调试和性能分析。
10. **Connectivity and Peripherals**: 包括USB、Ethernet控制器、显示接口、I2C、SPI等，以支持与外设别交互。

这些组件共同构成了复杂且高度集成的CPU子系统，支持现代计算平台的 **高效、低功耗、安全性以及可扩展性** 需求。ARM对于异构处理器架构 **bit.LITTLE（高性能，小功耗）** 给出的一张经典图：

![](https://pic2.zhimg.com/v2-eb93a05e47416578a786c5362d52c39b_1440w.jpg)

## 2\. 关键组件

## 2.1 CPU Core

ARM在 **商用领域** 还是领先，其有广泛的使用场景设计和成熟的稳定性，生态发展很好。后来者 **RISC-V** 目前在一些低端产品中使用较多。ARM分为三个系列： **Cortex-A，Cortex-R，Cortex-M** 。

![](https://picx.zhimg.com/v2-579fca040e775dd41febc0b749be229b_1440w.jpg)

其他的一些 **应用** 如下：

![](https://pica.zhimg.com/v2-0c05a07548fb2c352b03f0d289ccec62_1440w.jpg)

这里我们以针对汽车的 **A76AE** 为例进行说明，A76AE 与 A76 类似，但具有 **Split-Lock的额外优势** ，使其适用于 **汽车、航空、机器人** 和其他自主应用。

Cortex-A76 专为 AI/ML 打造，可提高 **边缘响应** 能力。ARM 表示，与 A75 相比，这款处理器的整数浮点性能提高了 25%，浮点性能提高了 35%。

该核心每周期可获取 4 条指令，同时在同一周期内重命名和调度 4 个 Mops 和 8 个 μop。与 A90 相比， **内存带宽** 也增加了 75%。

该处理器支持 **DynamIQ** ，与更节能的A55核心一起使用时可提供高性能计算。

举例像 DSGW-380 RK3588工业机器学习边缘AI网关 得益于这种 **异构系统** ，它们能够在处理复杂的边缘 AI 任务时提供高性能和能效的结合。该网关还在其 8 核 CPU 中内置了 NEON 协处理器，在其 SoC 中内置了 6 TOPS NPU，以增强其 AI 功能。

![](https://pic4.zhimg.com/v2-f3635361281903cb083d801e177338b5_1440w.jpg)

对于前端架构，总体来看，Cortex-A76是这样一个结构： **超标量乱序结构** ，拥有4个解码前端（4发射），8个执行端口，总流水线级数13级，执行延迟为11级。在前端，ARM设计了一个新的预测/获取单元，被称为“ **基于预测的获取** ”，这意味着分支预测单元将介入指令获取单元的工作，这和之前所有的ARM **微架构** 都有所不同，能够实现更高的性能和更低的功耗。

![](https://picx.zhimg.com/v2-66b36222d366f76cb905183709619a21_1440w.jpg)

对于后端架构的执行部分。Cortex-A76的整数核心包含了 **6个执行单元** ，其中图中有4个单元分别是1个分支、2个ALU、1个ALU/MAC/DIV单元，再加上一个加载/存储单元。其中的3个整数执行流水线中的2个ALU进行简单算术操作，1个复杂流水线执行乘法触发和CRC操作。3个整数管道由一个深度为16的指令队列提供指令服务，2个加载/存储单元则由深度为12的指令队列负责。

**浮点** 方面，ARM设计了2个执行单元，其中一个执行FMUL/FADD/FDIV/ALU/IMAC等，功能较为强大，另一个比较简单只执行FMUL/FADD/ALU，ASMID浮点核心由2个深度为16的队列提供指令服务。

下面介绍 **A76AE** ：

![](https://pic1.zhimg.com/v2-3f4f6f1de2f1d2803cddb1c7e571fe96_1440w.jpg)

Arm [Cortex-A76AE](https://zhida.zhihu.com/search?content_id=272190831&content_type=Article&match_order=1&q=Cortex-A76AE&zhida_source=entity) 带来了最高水平的 **Split-Lock** 能力，包括 **双核锁步** （DCLS）的能力。Cortex-A76AE也提供了毫不妥协的性能和热效率。它是下一代 **高级驾驶辅助系统（ADAS）和自动驾驶系统** 的首选处理器。

1. **热效率更高效** ：包含最新的最先进的微体系结构特性，提供更大的单线程整数、浮动点、内存和ML性能。在有限的功率范围内执行具有持续性能的工作负载。
2. **使用Split-Lock的灵活性** ：使用ASIL D硬件指标切换最高的分裂模式的多核性能或高级多核容错的锁定模式。为未来的混合临界性应用程序提供额外的灵活性。
3. **超尺度处理器核心** ：超尺度处理器核心解码、问题和执行比上一代更多的指令。增强功能还包括完全无序处理、非阻塞的高吞吐量L1缓存，以及高级指令和数据预取。

当然这里只是举个例子，实际应用中随着时间的推移，新的处理器的出现。但是其基本原理是相似的。

## 2.2 DSU

![](https://pica.zhimg.com/v2-6260e7de29a88615441fd855f6f7033c_1440w.jpg)

ARM的IP可以直接去 **ARM官网** 下载资料： [developer.arm.com/docum](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/100453/latest/)

DSU的一些特点：

1. **成簇绑定使用** ：核心功能是控制CPU内核，使其成簇Cluster使用，簇内每一个核心可以单独开关、调整频率/电压，能效表现更佳，甚至制造商是可以将不同核心以不对等的数量放到一个簇内，兼顾成本与性能。
2. **L3缓存的共享** ：DSU能够使用CCI、CCN或是CMN不同总线技术，把CPU与SoC里其它单元（GPU、Modem、内存）高速连接起来；假如它拥有4MB三级缓存，能以动态方式分配缓存给每个核心，比如说Cortex-A75×1+ Cortex-A55×7下，可以将3MB缓存分配给A75核心，剩下7个A55核心共享1MB缓存，甚至可将三级缓存交给GPU等单元使用，灵活性非常高；
3. **冗余设计** ：设计DynamIQ之时ARM还考虑到冗余需求，比如相比智能手机，汽车对可靠性、冗余度要求高出不少，DynamIQ允许多个簇通过CCIX连接在一起，这样处理器就可以分布于汽车不同位置，当发生交通意外一个簇受损时，DynamIQ技术可以调用出备用处理器，保证汽车正常运转。

DynamIQ™共享单元（DSU）包括 **L3内存系统** 、控制逻辑和外部接口，以支持DynamIQ™集群。DynamIQ™集群微体系结构整合了一个或多个核心与 DSU，形成一个按指定配置实现的集群。在宏单元实施过程中，可以选择和配置core。

集群可以以以下 **三种配置之一** 实现：

- 一组，具有相同微体系结构的核心。
- 两组核心，其中每组具有不同的微体系结构。这种配置可能在 DynamIQ™ big.LITTLE™集群中使用。
- 三组核心，其中每组具有不同的微体系结构。

DynamIQ cluster顶层由DSU与DebugBlock组成。

**DSU：** 包含L3、ctrl logic & external interface。

**DebugBlock：** 包含3组apb接口、rom、CTM、CTI & PMU。

![](https://pic1.zhimg.com/v2-675d90d78e305b3f902afc20fed8c7fc_1440w.jpg)

一个DynamIQ™集群系统由两个顶级模块组成： **一个包含核心的模块和一个DynamIQ™共享单元（DSU** ）。

DynamIQ™集群被称为该集群。将 **调试组件与集群分开** ，可以在单独的电源域中实现调试组件，从而允许在断电时进行调试。下图显示了DynamIQ™集群系统中的主要组件

**CN代表一组核** ，其中CN的值为核总数-1。Arm架构允许内核是单个的，或多线程的。 **处理元素（PE）** 执行一个执行线程。一个单线程核心有一个PE，一个多线程核心有两个或更多个PE。在引用一个核心的地方，这个核心可以是一个单一的，或者多线程核心。与PEs相关联的信号名称使用缩写PE，其中PE的值为PEs - 1的总数。

**DSU AE** 主要是添加了 **比较器** ，再有就是亮色部分都复制一份，包括执行逻辑、时钟、功率状态，各个界面，当然缓存不能复制，那样成本太高，也意义不大。

![](https://pic3.zhimg.com/v2-864f5885005bd3bb2146c9f40da5f3f6_1440w.jpg)

| 元件 | 描述 |
| --- | --- |
| CPU桥接器 | CPU 网桥，控制内核和 DSU 之间的缓冲和异步处理。 |
| 时钟和电源管理 | 群集支持一组由外部电源控制器控制的省电模式。这些模式是通过 P 通道上的电源模式请求来选择的，对于每个内核，以及用于 DSU 的单独 PChannel。通过从外部时钟控制器向DSU发出的Q通道请求来支持时钟门控。Q 通道允许单独控制 SCLK、PCLK、ATCLK 和 GICCLK 时钟输入。 |
| Snoop 控制单元 | Snoop Control Unit (SCU)   保持集群中所有数据缓存之间的一致性，存在私有的缓冲区 |
| L3 缓存 | 缓存大小实现为 256KB、512KB、1MB、1.5MB、2MB、3MB 或 4MB。所有缓存的行长均为 64 字节。可选择实现数据和标签RAM的ECC保护。 |
| 主存储器主控 | 主存储器接口最多支持两个ACE或CHI主接口。 |
| 加速器一致性端口 | 加速器一致性端口 （ACP） 是可选的从接口。ACP 提供对可缓存内存的直接内存访问。SCU 通过检查 ACP 访问在核心和 L3 缓存中的分配来保持缓存一致性。ACP 实现了ACELite 协议的子集。 |
| 外设端口 | 外设端口是可选的主接口，提供对紧密耦合加速器的DEVICE访问。该端口实现 AXI 4 主接口协议。 |
| DSU系统控制寄存器 | DSU 实现一组系统控制寄存器，这些寄存器对群集中的所有内核都是通用的。您可以从集群中的任何内核访问这些寄存器。这些寄存器提供：1.控制群集的电源管理。2.L3缓存分区控制。3.CHI QoS总线控制和方案ID分配。4.有关 DSU硬件配置的信息。5.L3 缓存命中和未命中计数信息。 |
| 调试和跟踪组件 | 每个内核都包括一个嵌入式跟踪宏单元 （ETM），允许在调试时进行程序跟踪。来自内核的触发事件被合并并输出到调试 APB 主节点。在调试 APB 从机上接收到内核的触发事件和调试寄存器访问。 |
| 群集到 DebugBlock APB | 当 APB 写入时，来自内核的触发事件将传输到 DebugBlock |
| DebugBlock 群集 APB | 触发事件在APB 写入 DSU 时传输到内核。来自系统调试APB 的寄存器访问被传输到 DSU |
| 系统调试 APB | 系统调试 APB 从属接口连接到外部 CoreSight 组件，如调试访问端口（DAP） |
| CTI 和 CTM | DebugBlock 实现嵌入式交叉触发器 （ECT）。交叉触发接口 （CTI） 分配给集群中的每个 PE，如果存在，则为集群 ELA 分配额外的 CTI。CTI 通过交叉触发矩阵 （CTM） 相互连接。实现单个外部通道接口，允许将交叉触发扩展到 SoC。 |
| 调试ROM | ROM 表包含系统中的组件列表。调试器可以使用 ROM 表来确定实现了哪些CoreSight 组件 |
| 电源管理和时钟门控 | DebugBlock 实现了两个 Q 通道接口，一个用于控制 PCLK 时钟的请求，另一个用于控制调试电源域的请求。 |

DSU的流程：

![](https://pica.zhimg.com/v2-8daa24132ab580d972cee83c169e521c_1440w.jpg)

其 **主要功能和特点** 包括：

1. **L3缓存控制器** ：DSU集成L3缓存控制器，为整个CPU集群提供共享的、大容量的高速缓存，以减少对更慢速主存的依赖，提高数据交换效率。
2. **一致性管理** ：在多核处理器系统中，DSU负责维护缓存一致性，确保所有核心看到的数据是一致的，通过实施缓存一致性协议（如MESI、MOESI）来协调数据更新。
3. **数据共享与分配** ：DSU优化多核间的数据分配和共享，通过有效的缓存分配策略和传输机制，减少数据复制，提高数据访问效率。
4. **能效管理** ：作为SoC的一部分，DSU还可能集成能效管理机制，支持动态调整频率和电源状态，以平衡性能与能耗。
5. **系统互联** ：DSU通过高带宽、低延迟的内部总线与CPU核心、外设别、内存控制器等SoC组件相连，确保数据快速流动。

简言之，DynamIQ Shared Unit是DynamIQ架构中的一个核心组件，它通过提供 **共享缓存、缓存一致性管理、数据高效共享和能效优化，支持高性能、多核处理器系统中复杂数据处理和高效协作** 。

## 2.3 缓存

计算机系统中的 **层次化缓存层次结构** 通常由多个级别的缓存组成，这些级别包括L1缓存、L2缓存和L3缓存。每个级别的缓存都有不同的特性，例如容量、访问速度和成本。以下是一般的层次化缓存结构：

**L1缓存** （第一级缓存）：

位置：通常与 **处理器核心** 紧密集成，位于核心内部。容量：相对较小，以KB为单位。访问速度：非常快，与处理器核心的时钟速度相匹配。作用：提供最快的数据访问，用于存储频繁使用的指令和数据。

**L2缓存** （第二级缓存）：

位置：通常位于处理器核心和 **主内存** 之间。容量：比L1缓存大，以MB为单位。访问速度：比主内存快，但相对于L1缓存较慢。作用：扩展了缓存层次结构，提供更多的缓存空间，用于存储更多的指令和数据。

**L3缓存** （第三级缓存）：

位置：通常位于 **多个处理器核心之间** ，是共享的。容量：更大，以MB或更大的单位为准。访问速度：相对于L2缓存和L1缓存较慢，但仍然比主内存快。作用：为多个处理器核心提供共享的缓存资源，促进核心之间的数据共享和一致性。

**主内存** （RAM）：

位置：通常位于计算机系统的 **主板上** 。容量：远大于L3缓存，以GB为单位。访问速度：相对较慢，远低于缓存。作用：存储操作系统、应用程序和数据，是计算机系统中存储层次结构的最大容量部分。层次化缓存结构的设计旨在利用不同级别缓存的优势，通过提供更小、更快的缓存来提高数据访问速度，并通过较大、较慢的缓存提供更大的存储容量。这有助于平衡性能和成本。

程序执行时，会先将内存中的数据加载到共享的 L3 Cache 中，再加载到每个核心独有的 L2 Cache，最后进入到最快的 L1 Cache，之后才会被 CPU 读取。

![](https://pic4.zhimg.com/v2-3d8993f937d57ac7a17a6b925a47c617_1440w.jpg)

2）L3 Cache：

L3 Cache（第三级缓存）是计算机系统中的一个层次化缓存层次结构中的一部分。在这里 **L3 Cache是DSU的组成部分之一** ，用于支持DynamIQ™集群中的多个处理核心。

具体来说，关于L3 Cache的说明包括以下几个关键点：

**简化进程迁移** ：L3 Cache的一个作用是简化处理core之间的进程迁移。当一些处理core被配置为没有独立的L2缓存时，它们可以共享L3 Cache，并将其视为自己的L2缓存。这有助于在处理器核心之间更灵活地进行任务切换和迁移。

**层次化缓存结构** ：在计算机系统中，层次化缓存结构是一种常见的设计，其中L1、L2和L3缓存层次不同，越高级别的缓存容量越大，但访问速度相对较慢。L3 Cache通常是多个处理核心共享的，以提供更大的缓存容量。

**一致性维护** ：L3 Cache通过Snoop控制单元（Snoop Control Unit，SCU）来维持处理核心和L3缓存之间的一致性。这确保了所有核心对共享数据的访问是同步和一致的，防止数据不一致的问题。

总体而言，L3 Cache在多核系统中发挥着重要作用，提供了更大的共享缓存，促进了任务之间的灵活性和数据一致性。

通常情况下，每个处理器core都有自己的L1缓存和L2缓存。然而，有时为了某些设计或性能的考虑，可以选择将某些core配置为没有独立的L2缓存。 **没有L2的core，L3 cache可视为L2cache。** 在这种情况下，这些core需要访问共享的L3缓存来获取缓存的好处，以满足其对数据和指令的快速访问需求。这种配置的优点可能包括 **降低硅芯片的复杂性、减小硅芯片的面积、降低成本** 等。然而，也需要确保在共享L3缓存的情况下，这些核心仍然能够有效地协同工作，并且对共享缓存的访问能够被管理和优化，以确保整体性能的提升。

## 2.4 SCU

![](https://pic2.zhimg.com/v2-d16d964e01684939589b173c545e4475_1440w.jpg)

**Snoop Control Unit（SCU** ）是 **多处理器** 系统中的一个关键组件，特别是在包含 **缓存一致性** 设计中，如对称多处理机群集（ **SMP** ）或片上系统（SoC）中。其主要作用是 **维护缓存一致性** ，确保所有处理器核心对 **共享缓存** 的内容有统一的视图景，从而保证数据的一致性和正确性。SCU的工作机制通常包括以下方面：

1. **监听（Snooping）**: SCU监听所有处理器核心对共享缓存的访问请求，包括读取和写入操作。当一个核心试图修改缓存中的数据时，SCU介入以确保其他核心对该数据的缓存副本不会变得陈旧。
2. **缓存更新**: 如果一个核心请求的数据在另一个核心的缓存中是脏（已修改但未回写回主存），SCU会促使持有该脏数据的核心将其写回到共享缓存或主存，然后更新请求核心的缓存，保证数据最新。
3. **一致性协议**: SCU遵循一定的缓存一致性协议，如MESI（Modified, Exclusive, Shared, Invalid）、MOESI（Modified, Owner, Exclusive, Shared, Invalid）或其他协议，来决定如何响应缓存访问并维护一致性。
4. **广播与仲裁**: 在多核系统中，SCU可能需要广播某些缓存操作，比如写操作，给所有核心，或仲裁缓存访问冲突，决定哪个核心优先级次序。
5. **目录管理**: 在大型系统中，SCU可能配合缓存目录使用，目录存储哪个缓存行位于哪些地方，其状态，减少广播范围和提高效率。

综上所述，Snoop Control Unit是多处理器缓存一致性机制中的重要一环，通过 **监听和协调处理器间的缓存操作，确保数据的一致性，从而支持高效、可靠并行计算** 。

## 2.5 Coresight system

![](https://pic1.zhimg.com/v2-93d383a7e62fc8256248c4cbe3b896dc_1440w.jpg)

**CoreSight架构** 是ARM公司为复杂系统级芯片（SoC）设计的 **调试和追踪解决方案** ，它提供了一个高度集成且可扩展的框架，用于系统级的调试、性能分析和优化。

CoreSight架构旨在支持 **多核和多处理器环境** ，尤其是在面对现代嵌入式系统和高性能计算领域，其功能强大且灵活的特性能够显著提升开发效率和系统性能。以下是CoreSight架构的一些关键组成部分和功能：

1. **调试和追踪IP模块** ：•包括嵌入式追踪宏单元（ETM, Embedded Trace Macrocell, ETM）、系统追踪宏单元（STM, System Trace Macrocell, STM）、数据观看点单元（Data Watchpoint Unit, DWT）等，这些模块负责捕获程序执行时的指令流、数据访问、系统事件、性能计数等信息。
2. **跨触发接口** - CTI（Cross Trigger Interface, CTI）：允许不同调试和追踪组件之间同步事件，支持复杂的系统级调试和性能分析。
3. **调试访问点** - DAP（Debug Access Port, DAP）和DP（Debug Port）：提供调试接口，允许调试器通过串行线调试协议（如JTAG, SWD）访问系统。
4. **电源管理** ：支持系统级的动态电压和频率调整（DVFS），优化能效。

CoreSight架构的组件可 **按需组合** ，根据SoC的具体需求定制化集成，以达到最佳的调试、性能监控和系统优化效果，支持从简单的单核微控制器到复杂的多核服务器芯片的广泛应用。

## 2.6 SMMU

**ARM SMMU** 指的是ARM架构中的System Memory Management Unit，它是一种 **系统级的内存管理单元** ，主要负责 **地址转换和内存访问权限控制** 。

在ARM架构中，SMMU主要用于 **处理非CPU核心的内存管理** ，尤其是 **外设别和硬件加速器** 的内存访问。与CPU核心中的 **MMU（管理虚拟地址到物理地址转换）** 类似，SMMU提供了对系统其他组件的内存访问控制，确保安全和高效的数据交互。特别地，ARM SMMU在不同场景下的应用和功能包括：

1. **外设别DMA访问隔离** ：SMMU通过配置映射表管理外设别DMA请求，确保其只能访问被授权的内存区域，防止非法或越界访问，增强了系统安全性。
2. **硬件加速器访问控制** ：对于硬件加速器（如GPU、网络加速器、加密加速器等），SMMU确保它们仅访问指定的内存区域，避免对系统关键数据的干扰，同时优化访问效率。
3. **虚拟化支持** ：在虚拟化环境中，SMMU为每个虚拟机提供独立的地址空间映射表，实现内存的隔离，保障虚拟机间不能互相干扰，提升了虚拟化平台的安全性和稳定性。
4. **中断处理** ：SMMU在某些实现中，如GICv3，可能间接参与中断路由和管理，特别是与中断的虚拟化处理，确保中断能被正确、高效地路由至目标处理器。
5. **内存属性管理** ：SMMU还可以控制内存访问属性，如是否缓存、共享与否、访问权限等，进一步细化内存管理，提升系统整体性能和安全性。组件与实现：•Stream Table：根表基地址寄存于寄存器中，是SMMU查找中断或DMA请求映射的起点。•Context Descriptor：描述符定义了第一阶段映射表的基地址，与第二阶段配置相关联。•Translation Tables：用于实际的地址转换，依据不同阶段的映射表结构，完成从虚拟到物理地址的映射。

综上，ARM SMMU是系统中一个关键的组件，它对 **内存访问的高效、安全控制和虚拟化支持至关重要，特别是在高性能、多核和异构计算系统中** 。

SMMU（system mmu),是 **I/O device与总线之间** 的地址转换桥。它在系统的位置如下图：

![](https://pic4.zhimg.com/v2-83fb094e00db707b93648035fb0df28d_1440w.jpg)

它与mmu的功能类似，可以实现地址转换，内存属性转换，权限检查等功能。

**为什么需要SMMU？**

了解SMMU出现的背景，需要知道系统中的两个概念： **DMA和虚拟化** 。

**DMA** ：（(Direct Memory Access），直接内存存取, 是一种 **外部设备不通过CPU而直接与系统内存交换数据** 的接口技术 。外设可以通过DMA，将数据批量传输到内存，然后再发送一个中断通知CPU取，其传输过程并不经过CPU， 减轻了CPU的负担。但由于DMA不能像CPU一样通过MMU操作虚拟地址，所以DMA需要连续的物理地址。

**虚拟化** ：在虚拟化场景， 所有的VM都运行在中间层 **hypervisor** 上，每一个VM独立运行自己的OS（guest OS）,Hypervisor完成硬件资源的共享, 隔离和切换。

![](https://pic1.zhimg.com/v2-c1f7827c62b90d38f35f935822ba650c_1440w.jpg)

但对于 **Hypervisor + GuestOS的虚拟化** 系统来说, guest VM使用的物理地址是GPA, 看到的内存并非实际的物理地址(也就是HPA)，因此Guest OS无法正常的将连续的物理地址分给硬件。

因此，为了支持I/O透传机制中的DMA设备传输，而引入了IOMMU技术（ARM称作SMMU）。

总而言之，SMMU可以为 **ARM架构下实现虚拟化扩展** 提供支持。它可以和MMU一样，提供stage1转换（VA->PA）, 或者stage2转换（IPA->PA）,或者stage1 + stage2转换（VA->IPA->PA）的灵活配置。

**VA：虚拟地址；IPA: 中间物理地址；PA：物理地址**

> SMMU的地址映射和隔离功能，但是其实现 **比较复杂** ，对软件的要求也比较高。如果不需要地址映射，另外粉笔系统隔离也仅仅做一些简单的，例如安全世界和非安全世界那或许不适合使用SMMU，使用tzc的ip更适合。

## 2.7 CMN

ARM发展了一种介于 **总线和NoC之间** 的连接系统，称之为 **CMN（Coherent Mesh Network）** ，主要用于连接CPU内核，也可以CPU内核和加速器之间的连接。采用 **MESH网格结构，但没有路由功能，本质上还是总线** ，但MESH网格支持的单元很多，远比一般总线要多，最高可支持512核，支持512MB的L3缓存，目标市场主要是HPC领域。

以cmn600AE为例， **官方文档** 参考： [developer.arm.com/Proce](https://link.zhihu.com/?target=https%3A//developer.arm.com/Processors/CoreLink) CMN-600

CoreLink **CMN600AE** ，一种支持 **车规级安全功能** 的CoherentMeshNetwork，强调其功能安全合规性、高性能、可靠性以及低功耗特性。对外支持AMBA CHI/ACE-LITE等接口，内部改用路由结构转发数据，并提供 **硬件一致性和系统缓存，还支持多芯片互联** 。CMN600在T16FFC上可以做到2Ghz，另外AE版本增加了车规芯片的安全功能，总线内部采用EDC检查，接口采用的奇校验。

CMN-600AE应用于整个soc之间的 **cache一致性** ，具有以下特点：

- **功能安全合规性** ：该网络符合功能安全标准，例如ISO 26262（汽车电子领域的功能安全标准）或IEC 61508（工业自动化领域的功能安全标准）等。
- **高性能** ：CMN-600AE采用了先进的连通性算法和协议，以提供低延迟、高带宽和高吞吐量的数据传输。
- **可靠性** ：该网络具有内建的容错机制，能够在节点故障时自动重新路由数据流，确保系统的连通性和可靠性。
- **低功耗** ：CMN-600AE优化了功耗，可以在满足高性能需求的同时降低能源消耗。
![](https://pic4.zhimg.com/v2-55195427e8aecba42637dbf04d064173_1440w.jpg)

例如上图为一个CMN 2X2的mesh结构。对 **DDR** 发起访问的master为 **CPU和GPU** ，CPU内部有自己的 **L1/L2/L3cache** ，当GPU发起DDR访问时，会 **通过HN-F节点去管理整个系统的cache一致性** 。

SoC中的设备，比如Core、L3缓存、DDR控制器等先连接到Node上，然后通过 **XP** （Crosspoint）水平和垂直互联，拓扑图如下：

![](https://pica.zhimg.com/v2-489da2c520d996f0fe44cef34baf5c26_1440w.jpg)

**CHI协议** CHI 的全称是 **Coherent Hub Interface** 。CHI 协议是 AMBA的第五代协议，可以说是 ACE 协议的进化版，将所有的信息传输采用包（packet）的形式来完成。但是从接口的角度看，CHI 和 ACE，AXI 这些协议完全不一样了

![](https://pic2.zhimg.com/v2-75f4a23638c15a44edee63def9a1a79d_1440w.jpg)

一个 **RN** 会产生 transaction（read，write，maintenance）给 HN； **HN** 接收，并对 RN发来的请求进行排序，产生 transaction 给 SN； **SN** 接收这些请求，返回数据或者响应。问题来了，transaction 如何在系统中的节点间路由呢？首先，CHI 协议规定，系统中的每个节点必须有一个节点号（Node ID）。系统中的每个 RN 和 HN 内部要有一个系统地址映射（System Address Map，以后简称 SAM），负责把地址转换成目标节点的 ID。也就是说，RN 的 SAM 负责把物理地址转换成 HN 的ID；而 HN 的 SAM 需要把物理地址转换成 SN 的 ID。看下图的一个简单例子：

![](https://pic1.zhimg.com/v2-b7b04e72933740664d8cc6fa0ac708b4_1440w.jpg)

• RN0根据内部的SAM知道要把请求发给HN0（TgtID是HN0，SrcID是RN0）；

•HN0在通过内部的SAM知道要继续发给SN0（ReturnNID是RN0）；

•SN0接收请求，返回数据（HomeNID是HN0，TgtID从HN0的ReturnNID而来）；

•RN0接收到SN0的数据响应，返回CompAck给HN以结束此次transaction（TgtID是HN0，从HomeNID而来）

下图展示了一个3\*4的互联Mesh，用于具有多个RNF实例的大型系统配置，包含的Node有HN-F、RN-D、SN-F和HN-D。每个互联的Mesh，以左下角的XP为坐标原点，建立二元坐标系（X，Y）；每个XP有若干个Port，用来连接具体的设备；基于此，设备可以通过一个4元组（X， Y， Port， DeviceID） ，唯一标示，分别代表设备所在XP的坐标，Port，以及设备ID。

![](https://pic4.zhimg.com/v2-791d33aea3602570d60a7d5a4b2895d1_1440w.jpg)

在mesh的架构中CMN600网络提高性能的方法：

1、mesh的架构层，通过 **多级的cache** ，以及设计HNF node可以去snoop cluster中的cache，提高性能

2、协议层，CHI协议中支持 **DMT、DCT、和prefetch** 功能提高性能

3、soc层，支持 **qos机制** 来提高性能，qos的value一共有4bit，值为0-15，值越高优先级越高

## 2.8 GIC

**GIC 的全称为 General Interrupt Controller** ，主要作用可以归结为： **接受硬件中断信号并进行简单处理，通过一定的设置策略，分给对应的CPU进行处理** 。这里以 **GIC600AE** （有功能安全功能）为例，ARM官网手册： [developer.arm.com/docum](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/101206/latest/)

![](https://picx.zhimg.com/v2-cb2e377e158d26d72ae26a67b940f401_1440w.jpg)

这里以 **gicv3** 为例，gicv4跟gicv3相比功能差异不大，只是提高了虚拟化的性能，增加了直接注入虚拟中断的能力和LPI中断注入加速的能力。gic网上的资料比较多，这里挑拣一些。一些基本术语如下：

![](https://pica.zhimg.com/v2-a2b932025f7e18925f628b74693c9ec8_1440w.jpg)

**ARM四种中断类型：**

1. **SGI: Software Generated Interrupt，软件产生中断，中断号是 0-15** 。通过向SGI寄存器写数触发，可用于CPU间的通信，比如时间同步，全局进程调度信息等。每个 PE 都有这么多 SGI 号。The Redistributor provides the configuration settings for PPIs and SGIs.
2. **PPI: Private Peripheral Interrupt，私有外设中断，中断号是 16~31** 。这些中断一般是发送给特定的CPU的，比如每个CPU有自己对应的 Generic Timer，产生的中断信号就发送给这个特定的CPU进行处理。每个 PE 都有这么多 PPI号。The Redistributor provides the configuration settings for PPIs and SGIs.
3. **SPI: Shared Peripheral Interrupt，共享外设中断，中断号是 32~1019** 。比如按键触发一个中断，手机触摸屏触发的中断，共享的意思是说可以从多个 PE 中选择一个发送处理，当然也可以指定发送给某个 PE。The Distributor provides the routing configuration for SPIs, and holds all the associated routing and priority information. 特殊中断号。1020-1023。这个在 GICv3 中用于指示特别的场景，例如给 EL3 的软件使用。保留中断号，1024-8191。
4. **LPI: Locality-specific Peripheral Interrupt，局部外设中断，中断号 >=8192** 。LPI 没有 active or active and pending state，得到响应后由处理器自动转入 inactive 状态。LPIs are new in GICv3, and they are different to the other types of interruptin a number of ways. In particular, LPIs are always message-based interrupts,and their configuration is held in tables in memory rather than registers. NOTE: LPIs are only supported when GICD\_CTLR.ARE\_NS==1.

中断号也叫INTID，如下图：

![](https://picx.zhimg.com/v2-93119f59b10e88f965330ed912b69e5d_1440w.jpg)

**gicV3四大组件** ：

![](https://picx.zhimg.com/v2-fa6107c6fa70072784f0fd9e4b4af565_1440w.jpg)

- **distributor** ：SPI中断的管理，将中断发送给redistributor
- **redistributor** ：PPI，SGI，LPI中断的管理，将中断发送给cpu interface
- **cpu interface** ：传输中断给core
- **ITS** ：用来解析LPI中断

其中，cpu interface是实现在 **core内部** 的，distributor，redistributor，ITS是实现在gic内部的。cpu interface和gic的redistributor通信，通过 **AXI-Stream** 协议，来实现通信。

**每个core，连接一个cpu interface，而cpu interface会连接gic中的一个redistributor。redistributor的标识和core的标识一样。**

![](https://picx.zhimg.com/v2-03e2b26c4ae384dd087f1e8485e9a109_1440w.jpg)

**中断分组：** gicv3，将中断分成了2个大组，group0和group1。

![](https://pic2.zhimg.com/v2-2bda2709a2c70dc114bd1bc2717ebe2b_1440w.jpg)

- group0：提供给EL3使用
- group1：又分为2组，分别给安全中断和非安全中断使用 以下是IRQ,FIQ与组的对应关系。

**关于ARM EL的等级如下：**

![](https://pica.zhimg.com/v2-3360b9d91c0f528f3d904d656dbb13e8_1440w.jpg)

**中断生命周期：**

![](https://pic4.zhimg.com/v2-45436e897e2709b96861ee73ec13f699_1440w.jpg)

- **generate** ：外设发起一个中断
- **distribute** ：distributor对收到的中断源进行仲裁，然后发送给对应的cpu interface
- **deliver** ：cpu interface将中断发送给core
- **activate** ：core通过读取 GICC\_IAR 寄存器，来对中断进行认可
- **priority drop**: core通过写 GICC\_EOIR 寄存器，来实现优先级重置
- **deactivation** ：core通过写 GICC\_DIR 寄存器，来无效该中断  
	这个中断生命周期，和gicv2的中断生命周期是一样的。

**中断流程：**

下图是gic的中断流程，中断分成2类：

- 一类是中断要 **通过distributor** ，比如SPI中断
- 一类是中断 **不通过distributor** ，比如LPI中断
![](https://pica.zhimg.com/v2-224920e3d3e78715bab5c30dec9d589e_1440w.jpg)

中断要通过distributor的中断流程

- 外设发起中断，发送给distributor
- distributor将该中断，分发给合适的re-distributor
- re-distributor将中断信息，发送给cpu interface。
- cpu interface产生合适的中断异常给处理器
- 处理器接收该异常，并且软件处理该中断

LPI中断流程：

![](https://pic4.zhimg.com/v2-0a8da9bb2096de58884cddfdc33fe457_1440w.jpg)

Locality Specific Interrupts（LPI），这是一个与GICv3及之后版本相关的概念。LPI中断是GIC架构中用来优化中断管理的一部分，特别是针对 **PCI Express (PCIe) 设备** 的中断处理，它与传统的共享中断线方法不同，提供了更高效的中断处理机制。以下是LPI的主要特点和工作原理：

1. **基于消息的中断** ：LPI中断不同于传统的硬件中断线机制，它基于消息传递，即中断信号通过写入内存中的特定地址（中断向量寄存器）来触发，而非通过物理线路。
2. **中断优化** ：LPI机制设计用于优化了中断处理，减少中断延迟和提高吞吐量，特别是在多核和虚拟化环境中。它避免了物理中断线的限制，简化了系统设计和扩展性。
3. **中断状态表** ：LPI中断的状态信息存储在内存中，GIC通过配置的中断状态表（Pending状态表）来跟踪这些中断，这允许快速查询和处理状态，减少了硬件开销耗。
4. **GICv3及以后支持** ：GICv3开始引入了对LPI中断的直接注入支持，包括了中断状态表和中断配置寄存取址等，而GICv4在此基础上进一步优化，如支持虚拟中断直接注入到虚拟机。
5. **中断路由与优先级** ：LPI中断也涉及到中断的路由和优先级管理，GIC的Distributor组件会根据中断的属性和系统策略，决定如何路由到适当的CPU核心，以及处理的优先级。

综上所述，LPI在GIC框架下是针对 **高性能和高效中断处理** 的一个设计，特别是在现代的多核处理器和虚拟化系统中，它利用内存消息机制替代传统的硬件中断线，优化中断管理，提升了系统响应速度和效率。

其在计算机体系结构中，软硬件融合中属于 **硬件软化，来提高性能和灵活度** 。

再来看看中断控制器 **GIC600AE** 。以AE结尾的IP表示在原有的基础上做了功能安全设计，可以支持到 **Asil-D** 。GIC600AE结构如下图：

![](https://pic2.zhimg.com/v2-09b2b13cac59396295d246dbf9ac61f9_1440w.jpg)

和处理器一样，GIC600AE的逻辑部分是靠锁步来支持Asil-B/D，内存部分是ECC。不同的是，不像处理器是一个单一硬核，GIC600AE是一个分布式的结构，布局布线可以分开，只是在中心有个分配器（Distributor）。每个处理器附近的子分配器（Redistributor）和分配器之间，就需要安全总线协议设计，这就是新的AMBA点对点功能安全扩展：

![](https://pic1.zhimg.com/v2-53edd6ca1fba368c4194f98bbac3bb50_1440w.jpg)

可以看到的是，各类AMBA的地址和数据线，接口上均添加了 **奇偶校验** ，这也是 **ISO26262** 所要求的传输线安全措施之一；对于重置和时钟，P/Q通道等信号，大多采用 **复制** 的方式来保护；而对于AXIS端口，则采用负载加上 **CRC** 的方法，免去添加管脚。由于中断控制器不像处理器，可以有中断系统来处理各类错误和失效，因此GIC600AE在分配器中添加了一个 **错误管理单元** ，可以把我们所提及 **的各类错误做集中管理，记录并上报** 。此外，在分配器与子分配器之间，GIC600AE还添加了 **看门狗** ，防止超时未响应。

## 2.9 外设

常见的一些外设如下，篇幅有限，下一篇单独讲解这些高低速外设。其实这些外设很多是 **所有子系统共用的** ，并不是CPU子系统独有，只是也连接到CPU子系统里面，其可以访问使用。

- cru
- mailbox
- uart
- wdt
- pvt
- dma
- usb
- eth
- UFS
- efuse

## 3\. 总结

辅助驾驶的芯片框架图，和中控不同，辅助驾驶需要感知和决策，是一个复杂的实时运算过程，没有办法通过 **安全岛** 监测来达到高等级安全，只能通过处理器本身来保证。所以这里的处理器全部换成了带 **冗余设计的A76AE和A65AE** 。

虚拟化在这个系统里并不是必须， **MMU600AE** 仅仅是为了虚实地址转换。由于没有采用虚拟机，各个处理单元之间的数据隔离可以靠 **CMN600AE的MPU** 来完成。没有经过CMN600AE的设备，需要在和总线之间添加 **MPU** 来实行地址保护，并且所有的MPU配置要保持一致。另一方面，使用MPU也限制了分区不能太多，否则就需要映射到内存。到底使用虚拟机还是MPU进行隔离需要看应用来决定。另外，如果需要 **片间互联** ，那所有主设备都应该通过NoC AE形成子网连到CMN600AE。

![](https://pic2.zhimg.com/v2-3586505464ca385d3f108379b4d3ad8f_1440w.jpg)

这个框架的计算流是这样的：C71（Asil-B）把 **数据从传感器收集，做固定的图像信号处理，把结果放到DDR；A65AE读取数据，进行车道检测等传统的矢量运算** 。

相对于大核，A65AE提供了高能效比的 **运算能力** ，适合多路并行计算；也可以把任务丢到图形处理器来运算，延迟稍大，能效比也很高。如果涉及神经网络运算，那A76AE会把任务调度到 **AI加速器上** ，同时在 **算子** 不支持的情况下负责部分计算；也可以把所有神经网络运算调度到图形处理器，这样就不存在算子不支持的问题。当然，对于神经网络计算，图形处理器能效比还是赶不上 **专用加速器** 。

**A76AE** 作为大核，具有很高的单线程性能，可以用来做辅助驾驶的决策。CMN600AE作为桥梁，连接了所有设备，并提供高带宽，硬件一致性以及系统缓存。由于总线支持单向硬件一致性，图形处理器和AI加速器从处理器拿数据的时候，处理器不用刷新缓存，从而减少延迟。当然，由于受布线和接口协议限制，有些对延迟不敏感的主设备还是需要通过NoC连到CMN600AE。

汽车芯片的关键是 **实时性，功能安全，电气，虚拟化** 。功能安全最复杂，需要IP级就开始支持。如果不符合，那需要场景分析做分解， **用最少的代价实现安全** 。

## 参考：

1. [SoC芯片设计系列---ARM CPU子系统组件介绍-公众号：SoC芯片](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzA4NjIxNzczMw%3D%3D%26mid%3D2455541177%26idx%3D2%26sn%3Df0df261b5e9517dba7c1890c6c762aee%26scene%3D21%23wechat_redirect)
2. 向7nm时代的性能巅峰出击！ARM Cortex-A76架构解析
3. ARM DSU(DynamIQ™ Shared Unit）概述
4. ARM一致性总线CMN600AE
5. ARM GIC（一） GIC V3架构基础学习笔记。
6. ARM GIC（四） gicv3架构基础
7. ARM攒机指南之汽车篇

> 后记：  
> 其实题目CPU子系统非常的大，展开来说软硬件非常的多，这里从SoC设计角度，挑了一些重点。如果在使用SoC的过程中那么几千页的编程手册一定要多看看。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、 **点赞、收藏、在看、划线和评论交流** ！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-03-30 09:21・上海[小白初入模拟ic设计行业，如何快速学习?](https://www.zhihu.com/question/544023696/answer/2788291410)

[我们一直都在强调，非科班很难转行模拟设计，因为模拟设计入门很难，熟练掌握更难。大家都在开着一本拉扎维就能入门模拟的玩笑，但实际上要更难一点。越是困难越是具备竞争力，这也是...](https://www.zhihu.com/question/544023696/answer/2788291410)