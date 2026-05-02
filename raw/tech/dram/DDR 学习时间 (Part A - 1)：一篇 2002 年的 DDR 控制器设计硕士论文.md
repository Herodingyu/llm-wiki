---
title: "DDR 学习时间 (Part A - 1)：一篇 2002 年的 DDR 控制器设计硕士论文"
source: "https://zhuanlan.zhihu.com/p/336521142"
author:
  - "[[LogicJitterGibbsICer && 业余FPGAer]]"
published:
created: 2026-05-02
description: "DDR 学习时间 (Part A - 1)：一篇 2002 年的 DDR 控制器设计硕士论文Part A-1 ，DDR 控制器设计，学习第一期 本期学习挪威科技大学教授 Magnus Själander 在2002 年的硕士论文《SoC 的 DDR SDRAM 控制器设计与实…"
tags:
  - "clippings"
---
[收录于 · OpenIC 特别兴趣小组](https://www.zhihu.com/column/c_1029044037684183040)

200 人赞同了该文章

Part A-1 ，DDR 控制器设计，学习第一期

本期学习挪威科技大学教授 Magnus Själander 在2002 年的硕士论文《 [SoC](https://zhida.zhihu.com/search?content_id=162912588&content_type=Article&match_order=1&q=SoC&zhida_source=entity) 的 [DDR SDRAM](https://zhida.zhihu.com/search?content_id=162912588&content_type=Article&match_order=1&q=DDR+SDRAM&zhida_source=entity) 控制器设计与实现》。Magnus 教授在硕士毕业之后，研究重心转到了低功耗领域，并没有继续研究 DDR 控制器设计，但这篇硕士论文仍然十分不错。

本文的特点是 DDR 控制器的实现比较简单，偏重于功能的实现而不是性能的优化。但对 DRAM 本身以及控制器的功能做了比较简洁但全面的介绍。另外本文比较早期，其 20 年前的 DDR （换句话说 DDR 1）控制器似乎有些落伍，但其中的核心思想与今天的 DDR3/4 (后文称之为现代 DDR/DRAM )控制器相似，所以我们可以借此学习一番 DRAM 控制器实现的基础功能。

> Magnus Själander 教授个人主页： [sjalander.com/research/#](https://link.zhihu.com/?target=https%3A//sjalander.com/research/%23publications)  
> 其硕士论文首页： [sjalander.com/research/](https://link.zhihu.com/?target=https%3A//www.sjalander.com/research/thesis/) ，可以获取到论文与 PPT。

---

![](https://pic2.zhimg.com/v2-a38267ce114a9e5dd7b7f770a539a04b_1440w.jpg)

![](https://pic2.zhimg.com/v2-fe7da1256d8f82aac561e41497150797_1440w.jpg)

论文首先比较 DDR 与 SDR （Single Data Rate）接口的优劣，其次讨论 DRAM 颗粒的基本构成与功能，接下来是控制器的架构与设计，然后重点分析设计中的难点： DDR 数据重同步（Resynchronization）。剩下的部分中，作者阐述了控制器的后端实现，包括综合、Floorplan、PR 等。最后是展望与总结。

![](https://pic2.zhimg.com/v2-aad0c6e58e7f440afb0c5a4ee1edc207_1440w.jpg)

相比于传统的 SDR 接口，DDR 接口最大的特点是：在时钟的上升与下降沿都进行数据传输，一个时钟周期传输两拍数据，故名双倍数据速率（Double Data Rate）。单个数据在总线的有效时间从一个周期降至半个周期，因此 DDR 需要满足更严苛的时序要求。

此外，DDR 设计中增加了 Date Strobe 信号，在传统的同步总线通信中，通信源与目的双方约定在时钟的边沿采样数据。DDR 时钟由源方产生，是一个源同步系统，如果时钟在传输过程中出现偏移（Clock Skew），将影响接收方采样。与数据同步的 [Data Strobe](https://zhida.zhihu.com/search?content_id=162912588&content_type=Article&match_order=1&q=Data+Strobe&zhida_source=entity) 信号可解决时钟偏移的问题，目的端只需要基于与数据同步的 Data Strobe 信号采样即可。

在 DDR 这样一个源同步系统中，面临的挑战之一是发送端如何与同一总线上的多个接收端进行通信。在今天的系统中，系统中有多个共享总线的 DRAM 颗粒是很常见的事情。每个 DRAM 发出的数据之间是不同步的，需要控制器能够在不同的 Data Stobe 信号上升沿采样不同的数据，并将他们重新同步。因此一个用于将接收数据重同步至接收方内部时钟的输入缓冲区（Resynchronization Input Buffer）是 DRAM 控制器设计的重点。

![](https://pic2.zhimg.com/v2-64ec39b80148834d443f36b3c629d0f3_1440w.jpg)

在了解了 DDR 接口后，我们来对 DRAM 颗粒的架构和行为有一个了解，以指导后续的控制器设计。

为了实现更高的总线带宽，DRAM 设计有多个结构相同的并行单元，称为 Bank。多 Bank 的设计允许向每个Bank 发出不同的命令。当然，不可能同时读取或者写入多个 Bank，因为读写通道只有 1 个，当时可以在 1 个 Bank 读写时，向另一个 Bank 发出 Precharge 或者 Active 命令。

每个 Bank 划分为多个 row，在每个 row 中，以颗粒位宽为单位划分为多个 column。具体的 DRAM 颗粒内部结构有多种形式，作者举了一个例子：

> DRAM 中有 4 （A）个 Bank，每个 Bank 有若干（B）个 row，每个 row 以 32bit(C bit) 为单位，划分为多个 column。  
> A、B、C 的值取决于具体颗粒的容量以及位宽。

![](https://pic1.zhimg.com/v2-c207abae90c3018a79ee39415e812048_1440w.jpg)

DRAM 的基本存储单元由 1 个晶体管 M 与 1 个电容 Cs（红框中的电容）组成，使用电容存储的电荷量，有电荷或者无电荷，即电平为高或者低，来代表存储的信息量，称为"1-T ceil"。1-T 这个名字对应于由更多晶体管组成的 SRAM "6-T ceil" 单元。请注意图中右边的电容 CBL 并不是有意制造在存储单元中的，实际是控制线 BL 的寄生电容。

在读写操作中，通过行选择与列选择线来选择操作的基本存储单元。如上图所示，存储单元位于行列选择线的交叉处。

在读写操作之前需要以行为单位激活（Active）存储单元，所谓激活就是导通该行所有存储单元中的管子 M，将储能电容 Cs 通过信号线 Bitline 与灵敏放大器（Sense Amplifier）相连，灵敏放大器将电容中的电平放大至 DRAM 颗粒的 0（GND）/1（VDD）电平。

在随后的读写操作中，放大器将数值传输到外部的数据 IO 上（读操作），或者获取新数值写入存储单元（写操作），所谓写入新数值，即写入电平 1 时为电容充电，写入电平 0 即为电容放电。

在读写另一行的存储单元之前，需要使用 precharge 命令完成本行善后工作以及为下一行读写做好准备。

在读写完成后自然要关闭刚刚打开的管子，使电容 Cs 保持现有的电荷，所以 precharge 操作一方面关闭管子 M。另一方面，将信号线的电平预充电至 1/2 VDD,这是这步操作称为预充电的原因，为什么需要为下一次读写操作预充电与读写时细节有关，可以参考论文的 3.1.1。

![](https://pic4.zhimg.com/v2-18a7a0eb871970ceb1fc7ae310e329b5_1440w.jpg)

DDR 有两项主要的技术 2n-prefetch （2 倍预取），和 DLL （延迟锁相环）。这在历代 DDR 协议中都是一脉相承的，DDR3/4 采用的是 8 倍预取，8n-prefetch，同时也设计有 DLL。

![](https://pic1.zhimg.com/v2-fca1a3d0875de4015f65966700fd192e_1440w.jpg)

在传统的 SDRAM 中，受限于列地址解码、以及从灵敏放大器读取数据的延迟，在读取操作中，从输入地址到读取数据的时间是很长的，并限制了 SDRAM 的频率（在当时的工艺下，是 7ns）。DDR 引入了 [Delay Lock Loop](https://zhida.zhihu.com/search?content_id=162912588&content_type=Article&match_order=1&q=Delay+Lock+Loop&zhida_source=entity) 来提高时钟频率。

![](https://pic4.zhimg.com/v2-497b82ee26ba982fcb5c8c6669c222f9_1440w.jpg)

DLL 对主时钟延迟固定相位后，延迟后的时钟作为数据输出缓冲区的时钟。由于采样地址的是原时钟，而数据输出由延迟后的时钟驱动，数据读取操作的延迟可以超过 1 个周期，并且不影响在每个时钟连续产生的读数据的 burst 模式。如上图中的例子，时钟周期为 5ns，而读操作需要 7ns。DLL 将时钟延迟 2ns，使读 burst 操作能够在 5ns 时钟下进行。DLL 在 DRAM 结构中的位置如图 6 所示。

![](https://pica.zhimg.com/v2-090153b7d51853ea463bf162fbb13c24_1440w.jpg)

我们以 2 倍预取为例，来看 DDR 的 prefetch 技术。所谓 2 倍预取，即在一个时钟的上升边沿读取当前地址单元的数据，并同时读取下一个地址单元的数据。由于预取技术，存储单元每个时钟输出的数据位宽是外部总线的 2 倍，以图 8 为例，外部 IO 是 32 位，存储单元可以在一个周期内输出 64 位。这样一来，有足够的数据在时钟上升沿输出第一个单元的 32 位数据，时钟下降沿输出第二个单元的 32 位数据，实现所谓的 'double rate'。

由于预取技术存在，存储单元可以适应更高的外部 IO 频率。打个比方，假设 IO 频率是 200MHz，要实现真正的双倍速率，存储单元需要工作在 400MHz。这以当时的工艺是不可能实现的，但通过 2 倍预取，存储单元只需要同样工作在 200MHz 即可。在更现代的 DDR4 中，虽然最高 IO 频率高达 1600MHz，双倍数据速率达到 3200MHz，但因为采用了 8 倍预取技术，存储单元工作在 400MHz 即可。

写操作时由图 8 中的 Input Register 模块在数据时钟上升与下降沿采样，将数据位宽转换为 2 倍的存储单元位宽，与读操作类似。由于采用了 n-prefetch，所以 DDR 访问模式一般限制为长度为 n 倍的 burst 模式，即连续读取若干个连续地址的数据。

![](https://pic2.zhimg.com/v2-6b1c8580bf7936810d52db5cab7e20ff_1440w.jpg)

图 9 是 2n-prefetch 的波形示意图，可以看到 DLL 通过延迟时钟，实现了 5ns 周期下的连续读写的 n-burst 模式，尽管一次读写操作需要 7ns。

![](https://pic2.zhimg.com/v2-79ee6b65e6a3e75f50fc8c9e699421ab_1440w.jpg)

这页 PPT 列举出了 DDR 的主要指令，与 SDRAM 基本相同，新增了 [EMRS 指令](https://zhida.zhihu.com/search?content_id=162912588&content_type=Article&match_order=1&q=EMRS+%E6%8C%87%E4%BB%A4&zhida_source=entity) 。

ACTIVATE，ACT 指令，用于打开某个 DRAM 行进行读写。

Precharge，PRE 指令，与 ACT 对应，用于在读写完成后，关闭该 DRAM 行

READ 与 WRITE 分别为读写命令，所以一个典型的读写指令流程是，ACT - WRITE/READ - PRE。

REFRESH 指令用于刷新 DRAM 存储单元中电容 Cs 的电荷，即定时给表示 ‘1’ 的电容充电。DRAM 相比于 SRAM 的一个重要区别在于，DRAM 需要定时刷新，因为控制 Cs 的开关管存在漏电流，在长时间不刷新后，Cs 的电荷会下降，从而失去所保存的数据。

MRS 指令用于读写 DRAM 上的一组寄存器，称为模式寄存器（Mode Register Set），用户通过 MRS 指令可以设置 DRAM 的相关工作模式，比如 Burst 长度与类型，读写延迟的大小等等。

EMRS 指令似乎在现代 DRAM 中被取消了，这里我们不再讨论。

这里对指令只做了简单的介绍，将来的 《DDR 学习时间》将做更详细的介绍，比如读写指令的时序、模式寄存器的构成等等。

![](https://pic2.zhimg.com/v2-e10b3fc9c77b1256ffadd77ffc4a6477_1440w.jpg)

接下来的 PPT 中，作者开始简要地介绍他的控制器 design。整个顶层设计划分为1）控制器核心逻辑 2）接口部分 3）数据 IO 部分。

接口方面，设计有 AHB 与 [APB 接口](https://zhida.zhihu.com/search?content_id=162912588&content_type=Article&match_order=1&q=APB+%E6%8E%A5%E5%8F%A3&zhida_source=entity) 。高性能的 [AHB 接口](https://zhida.zhihu.com/search?content_id=162912588&content_type=Article&match_order=1&q=AHB+%E6%8E%A5%E5%8F%A3&zhida_source=entity) 用于向控制逻辑发送地址与指令，以及连接数据通路。小面积的 APB 接口用于核心控制逻辑的初始化与模式寄存器配置。核心控制逻辑用于将 AHB 总线读写逻辑转换为 DRAM 命令，并维持 DRAM 刷新等状态。

![](https://pic4.zhimg.com/v2-aad1412d372bfef171bb87c68c389c85_1440w.jpg)

根据不同的时间点，控制逻辑需要执行以下三项功能：

1. 初始化
2. 读写事务支持
3. DRAM 数据状态维护

在一个典型的读写事务中，AHB 中的 HADDR、HWRITE 等信号传达了读写命令与地址，控制逻辑负责以下主要工作：

1. 将整个 AHB 读写事务，以 burst 长度为单位，切分为若干个 DRAM 访问事务
2. 在读写事务前后，发出 ACT 与 PRE 命令，激活或关闭相应行
3. 维持 DRAM 读写时序，如 CL，CWL 等
4. 在 DRAM 读数据就绪或者写数据完成时，通知接口模块将其转换 AHB 读数据或者写响应

在读写事务之前，控制逻辑还需要支持 DRAM 的初始化与配置等功能：

1. DRAM 复位、上电时序控制、初始化
2. 根据 APB 总线上的配置信息，配置模式寄存器

在读写事务之间，控制逻辑需要保持 DRAM 的数据：

1. 定时发出 REFRESH 指令，防止 DRAM 因为长时间未刷新而丢失数据

作者在论文中将控制逻辑划分为：地址解析、Bank 开关、读写命令、命令时序维持、地址管理、跨行事务支持等六个模块，并在论文第 5.1 节做了详细介绍，有兴趣可以参阅。

![](https://picx.zhimg.com/v2-e7cf0cb0eb2ed1873915f21695066e3f_1440w.jpg)

DDR 控制器通过 AHB 从机接口与 SoC 连接，用于其他担当主机的 IP 进行访问，比如 CPU、DSP、DMA 等等。AHB 接口模块由 **AHB 总线控制逻辑** 、 **数据缓冲区** 和 **数据同步模块** 组成。

总线控制逻辑在 AHB 总线和数据缓冲区之间提供接口转换，并接收读写命令传输至存储控制逻辑。读写数据会首先缓存于数据缓冲区，模块通过 HReady 反压信号，在读数据或者写事务尚未就绪时停止总线传输。

数据同步模块，图中的"x2"模块，用于在 DRAM 和 AHB 接口间进行数据同步。x2 模块工作于数据 IO 频率（即 DRAM 核心频率的 2 倍），根据存储控制器的信号行事。在写事务中，当控制器送出 present 信号后，x2 模块从数据缓存中读取写数据写入 DRAM。由存储控制器产生相应的 Mask 与 strobe 信号，写数据与 strobe 信号边沿对齐。

![](https://pic2.zhimg.com/v2-74d310436a777506667805657c5cd1bf_1440w.jpg)

而在读事务中，x2 模块根据 DRAM 发出的 strobe 信号采样读数据。采样时钟为总线时钟的 2 倍频，在 2 倍频时钟的上升沿采样 DRAM 数据 IO，在 strobe 信号为高时采样第偶数个数据，stobe 信号为低时采样第奇数个数据，最后将奇偶数据合并，得到一个与总线时钟两倍速率的读数据。

读事务采样流程如图 27 所示，DRAM 发出的 stobe 信号最初与数据边沿对齐，在采样时将 stobe 信号延迟，使其边沿与数据周期中央对齐。在后文将对该延迟采样技术再做介绍。

![](https://pic3.zhimg.com/v2-9fd59c9da525227aeeb25a037934a5b2_1440w.jpg)

多个 AHB 接口能够提高 DDR 访问的效率，多接口 DDR 控制器也是复杂 SoC 的实际需求，因此作者设计了用于双 AHB 接口的仲裁器，两个 AHB 接口模块以轮询仲裁的方式，轮流获得存储控制器的访问权。

![](https://pica.zhimg.com/v2-979004001bf18aad888721ee38457c4c_1440w.jpg)

确保读数据采样的正确性是 DDR 控制器设计的关键之一。DDR 采用了基于 strobe 信号的重同步采样技术。

在传统的源同步接口中，接收端基于时钟边沿采样容易受到时钟偏移的影响。随着时钟频率的提高，这一现象更加明显。DDR 接口加入了与数据同步的 strobe 信号用于解决这一问题。接收方可以根据 strobe 信号，将输入数据采样到接收方时钟域中。

由于 DRAM 发出的 strobe 信号与数据边沿对齐，直接利用 strobe 信号边沿作为采样触发存在风险。DDR 读数据采样中对 strobe 信号进行固定相位延迟。得到一个对齐于数据周期中央的延迟 strobe信号，实现稳定安全的数据采样。

![](https://picx.zhimg.com/v2-c8fac2062042c09a02e317c6891c3443_1440w.jpg)

Strobe 信号延迟的固定相位通常是 90°，四分之一周期。实现延迟的方式有以下几种：

1. 延迟锁相环，DLL
2. 非门延迟
3. PCB 走线延迟
4. 基于温度传感器的可编程延迟链

这里我们主要看下 DLL 的基本实现原理。

![](https://pic4.zhimg.com/v2-efff2b8f65c91451185953aa2181b765_1440w.jpg)

Delay Lock Loop，延迟锁相环，结构上是锁相环（ PLL）的简化版本，包括相位检测器以及可编程延迟链两部分。一般使用的是数字延迟锁相环，其延迟链是数字可编程的。DLL 的工作原理大致如下：

1. 数字延迟链初始化为 0 延迟
2. 鉴相器将延迟链的输出与输入进行比较，如果延迟小于 90 度相位，则给数字延迟链配置更大的延迟量
3. 当上次延迟相位小于 90 度，记为 A，本次延迟相位大于 90 度时，设为 B
4. 将延迟量设置为 1/2(A+B)，完成锁定

DLL 的优势在于精确的 90 度延迟，而设计难点在于避免抖动（jitter）以及减少相位锁定所需的时间。

![](https://pica.zhimg.com/v2-4438278d9df13ebb9c78558c9e1f7d5c_1440w.jpg)

经过相位延迟的 strobe 信号能够安全地采样读数据，但在采样之后控制器还需要将读数据同步到自己的时钟域中，作者为此设计了数据同步电路。电路中包括 2 个触发器，分别在 strobe 信号的上升沿与下降沿采样数据。2 个触发器可以分别将奇数倍与偶数倍保持 2 个数据周期，这样便于将两组数据整合。

![](https://pic3.zhimg.com/v2-905c26ddbc7f0cba97297c4aae7b8e02_1440w.jpg)

但是采用 strobe 信号作为时钟采样的数据仍处于 stobe 时钟域，而 strobe 信号与控制器内部时钟是两个同频不同步的时钟。因此我们需要一个频率是控制器内部时钟两倍的同步时钟来完成时钟域的转换，因为 2x 时钟频率是 strobe 信号频率的 2 倍，2 个相邻上升沿内至少有 1 个上升沿都够采样稳定的奇数据或者偶数据，2x 时钟采样时刻选择的关键在于确保数据稳定。

上图展示了稳定采样的机制，Reference 代表内部时钟。图中上方的波形表示，在内部时钟上升沿时刻， strobe 信号为高，此时下一个 2x 时钟上升沿能够稳定采样。而在下方的波形中，内部时钟上升沿时刻， strobe 信号为低，此时下一个的下一个 2x 时钟上升沿一定能够稳定采样。

换句话说， strobe 信号与内部时钟间的相位前后关系决定了采样时刻。

![](https://picx.zhimg.com/v2-96213b86e6348cd76570912ccee110e7_1440w.jpg)

在实现中作者通过一个简化版的鉴相器做到上述的 strobe 信号与内部时钟间的相位前后关系比较。上图是鉴相器的结构与功能波形。简单来说如果 clk I 超前，输出寄存器会被置位，反之输出 Phase 则会被复位。

![](https://pic2.zhimg.com/v2-631c93fc6d78f744174f0df5ba00e8f9_1440w.jpg)

这样一来，根据鉴相器的输出 Phase 与内部时钟电平的关系就可以判断采样时刻：

> ~(Phrase & Reference Clk) and (posedge Clk x2 )

![](https://pic3.zhimg.com/v2-56541140ac73042879e108bc6e55f4c2_1440w.jpg)

![](https://picx.zhimg.com/v2-0d88268d3a3978ea06a14c4f300aba55_1440w.jpg)

接下来作者 poll 了一些物理实现的布局布线结果。

![](https://pic1.zhimg.com/v2-0427e5b19f2bbcdbb64783ca35ee635e_1440w.jpg)

在展望中，作者提到几点改进：

减少读写 burst 的延迟，通过优化接口调度模块合并 CSL 延迟、改善写事务中的 buffer 机制等手段实现；

DDR 协议中允许在至多 8 个刷新周期中不接受刷新指令，而随后集中接收这 8 个刷新指令。因此调度器可以通过刷新指令的调度以提高读写性能

改进数据缓存机制，以提高 cache 性能

![](https://pic3.zhimg.com/v2-cfaa309df8c1e58e1ee8aa96df33c290_1440w.jpg)

最后是作者的总结，本文为爱立信（所以会有 ERICSSON 的 logo 出现在 PPT 上）设计并实现了一个可工作的 DDR 控制器，以满足他们的芯片平台对于性能与带宽的需求。此外本文着重讨论了数据接收中的采样问题，并提出了几种解决方案，为后续的 DDR 控制器设计提供了参考。

发布于 2020-12-12 23:56[如何成为IC验证工程师，需要具备哪些能力？](https://zhuanlan.zhihu.com/p/420197396)

[

首先问个问题？什么是IC验证工程师？验证是什么意思? 有的同学清楚，有的可能不太清楚。 ic验证工程师就是根据芯片的需求规格（spec），采用相应的验证语言、验证工具、验证方法，设计...

](https://zhuanlan.zhihu.com/p/420197396)