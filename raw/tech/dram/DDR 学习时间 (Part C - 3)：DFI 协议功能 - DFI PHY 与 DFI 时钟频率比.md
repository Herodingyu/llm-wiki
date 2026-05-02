---
title: "DDR 学习时间 (Part C - 3)：DFI 协议功能 - DFI PHY 与 DFI 时钟频率比"
source: "https://zhuanlan.zhihu.com/p/682379992"
author:
  - "[[LogicJitterGibbsICer && 业余FPGAer]]"
published:
created: 2026-05-02
description: "本节基于 DFI 协议 4.9 节（协议 4.0 版本）讨论 DFI PHY 时钟频率与 DFI 时钟多倍频率比的架构、地址控制/写数据/读数据信号行为。 1 DFI 时钟结构在讨论 DFI PHY 时钟和 DFI 时钟的频率比之前，笔者首先通过下图…"
tags:
  - "clippings"
---
[收录于 · OpenIC 特别兴趣小组](https://www.zhihu.com/column/c_1029044037684183040)

89 人赞同了该文章

目录

本节基于 [DFI 协议](https://zhida.zhihu.com/search?content_id=239770066&content_type=Article&match_order=1&q=DFI+%E5%8D%8F%E8%AE%AE&zhida_source=entity) 4.9 节（协议 4.0 版本）讨论 [DFI PHY](https://zhida.zhihu.com/search?content_id=239770066&content_type=Article&match_order=1&q=DFI+PHY&zhida_source=entity) 时钟频率与 DFI 时钟多倍频率比的架构、地址控制/写数据/读数据信号行为。

## 1 DFI 时钟结构

在讨论 DFI PHY 时钟和 DFI 时钟的频率比之前，笔者首先通过下图对 MC 时钟，PHY 时钟、DFI PHY 时钟和 DFI 时钟做一些阐述。

下图是一个简单但是典型的 MC-PHY 的 DFI 架构的时钟结构示意图。DFI CLK 是 DFI 接口上所有信号的时钟，MC 核心逻辑也工作在该时钟下，所以有时候 MC CLK 指的也是 DFI CLK。

PHY 与 MC 通过 DFI 接口连接的部分因为需要采样和驱动 DFI 信号，也处于 DFI 时钟域，PHY 这部分与 DFI 打交道的逻辑被称为 PHY 接口模块（PHY Interface Module），该模块的时钟被称为 DFI PHY CLK。

输入 PHY 的 DFI 信号在接口模块被转换到 PHY 时钟域，输出给 SoC 芯片外部 DRAM 颗粒。PHY CLK 是 PHY 内部时钟，在许多实现中 PHY 内部 CLK 和 DRAM 的时钟（CK）频率相同，在传输数据与控制信号给 DRAM 的同时，PHY 也将 PHY CLK 通过 CK 差分对传输给 DRAM，作为 DRAM 内部的工作时钟。

尽管严格来说 PHY CLK 和 DRAM CLK 并不是同一个时钟，但因为在这类实现中 DRAM CLK 由 PHY CLK 产生，所以有的时候会用 PHY/DRAM CLK 来指这个一般在 PHY 内部产生，PHY 内部使用，然后传输给 DRAM 的时钟。

![](https://pic4.zhimg.com/v2-ef37dc691f89bd31525d0e176292aed3_1440w.jpg)

*图 1 - 一个典型和简单的 MC-PHY DFI 架构时钟结构示意图*

上图只是一个简单的例子，实际的 MC/PHY CLK 结构会再复杂一点点，比如 PHY 内部时钟可以和 DRAM 时钟频率不同，如下图所示，我们下次在专门讲 DDR 子系统时钟结构文章中再详细讨论 PHY CLK，DRAM CLK。

![](https://pic3.zhimg.com/v2-8bc640541936a971c31f78774cc58496_1440w.jpg)

*图 2 - 一个更复杂的 MC-PHY DFI 架构时钟结构示意图*

本篇作为 DFI 解读文章，重点关注的是 DFI 接口两端的 DFI CLK 和 DFI PHY CLK ，以及它们之间不同的频率比下的信号行为。

## 2 DFI PHY 时钟与 DFI 时钟频率比

当我们选定一个 DRAM 器件的速率后，比如 [DDR4-3200](https://zhida.zhihu.com/search?content_id=239770066&content_type=Article&match_order=1&q=DDR4-3200&zhida_source=entity) 后，PHY 时钟频率实际也已经选定为 1600MHz，也就是 DRAM 数据速率的一半。在本文的讨论中，我们设定 DFI PHY 时钟与 PHY 时钟相同，也是 1600MHz。

我们可以做选择的是 DFI 时钟频率，因为 DFI 协议规定 DFI 时钟频率与 DFI PHY 时钟频率比 （Frequency Ratio）可以是 1:1, 1:2, 或者是 1:4。也就是说 DFI 时钟频率可以等于或者小于 DFI PHY 时钟频率。以 DFI PHY 时钟1600MHz 为例，DFI 时钟可以是 400MHz，800MHz 或者 1600MHz。

下表是以 DDR4-3200 系统为例，列出了系统中存在的时钟/数据频率，帮助读者更清楚这几个频率间的关系。

*表 1- DDR4-3200 系统中的时钟/数据频率*

| 频率/频率比 Frequency Ratio | 1:1 | 1:2 | 1:4 |
| --- | --- | --- | --- |
| DRAM 数据速率 (MT/s) | 3200 | 3200 | 3200 |
| DRAM 时钟频率 (MHz) | 1600 | 1600 | 1600 |
| DFI PHY/ PHY 时钟频率 (MHz) | 1600 | 1600 | 1600 |
| MC/DFI 时钟频率 (MHz) | 1600 | 800 | 400 |

可见，DFI PHY 时钟与 DFI 时钟频率比只会影响 MC 和 DFI 时钟频率，频率比越高，MC 和 DFI 时钟频率可以越低。

## 3 1:2/1:4 倍速率 DFI 时钟的优劣势

MC/DFI 时钟频率可以小于 DFI PHY 时钟频率对于 DDR DFI 架构实现有很大的好处。MC 部分的逻辑要比 PHY 部分复杂一些，因此 MC 的时钟频率很难做的和 PHY 一样高。举个例子，在主流的 [14nm 工艺](https://zhida.zhihu.com/search?content_id=239770066&content_type=Article&match_order=1&q=14nm+%E5%B7%A5%E8%89%BA&zhida_source=entity) 上实现 DDR4-3200 的 DFI 架构，PHY 的 1600MHz 时钟时序收敛是相对容易的，而在 MC 处使用和 PHY 时钟频率 1：2 的 800MHz 时钟会是更可行的选择。笔者个人理解在 14nm 工艺节点上，基本只能在逻辑级数比较少的处理器 (Processor) 流水线电路上实现 1.6GHz 的频率，DDR 控制器的逻辑级数做不到那么少。

> 注： 如果你阅读协议原文会发现，原文的视角是从 DFI PHY 时钟频率可以是 MC 时钟频率的倍数出发。本文选择了对向的视角，觉得更好理解一点。

降低 MC 时钟频率后，MC-PHY 之间的数据位宽会相应倍数增长，使 MC-PHY 的数据量和 PHY-DRAM 保持一致。

下表以 32-bit 位宽 DDR4-3200 系统为例，罗列了不同 MC-PHY 时钟频率比下，MC 的 DFI 数据位宽。

*表 2- 不同 MC-PHY 时钟频率比下，MC 的 DFI 数据位宽*

| 位宽/频率比 Frequency Ratio | 1:1 | 1:2 | 1:4 |
| --- | --- | --- | --- |
| DRAM 位宽 (Bit) | 32 | 32 | 32 |
| DRAM 数据带宽 (GByte/s) | 12.8 | 12.8 | 12.8 |
| DFI 数据位宽 (Bit) | 64 | 128 | 256 |

除了数据位宽之外，地址与控制信号数量也会增长，具体的原因我们在后文讲到地址与控制信号的行为再讲。

这些增加的 DFI 信号可能会增加一些 PD 同事在布局布线上的烦恼，但应该不是太大的问题，毕竟数据位宽大了，但时钟频率低了不是？相信你的后端同事能搞定！

## 4 DFI 多倍速率时钟定义

多倍速率的 DFI PHY CLK 和 DFI CLK 满足以下两条条件：

1. DFI PHY CLK 和 DFI CLK 相位对齐
2. DFI PHY CLK 的频率是 DFI CLK 的两倍或者四倍

因为 DFI 总线中的部分信号是在一个 DFI PHY CLK 相位有效的，为了描述一个 DFI CLK 中的多个 DFI PHY CLK 相位，依次把 DFI PHY CLK 相位称为 P0/P1（1:2）,或者 P0/P1/P2/P3（1:4），如下方的原图 38 和 29 所示。

![](https://pic1.zhimg.com/v2-cd76f8e0cd10518fc1ff8982f5fc876c_1440w.jpg)

因为 DFI CLK 和 DFI PHY CLK 相位对齐，所以 MC 在 DFI CLK 上升沿发出的信号，能够被 PHY 采样。而为 MC 的信号采样建立时间考虑，DFI 协议规定 PHY 只能在 DFI PHY CLK 的 P0 上升沿发送信号。

## 5 多相位地址控制信号行为

因为 PHY 可以在每个 DFI PHY CLK 相位采样一组地址/命令信号发送给 DRAM，因此 MC 有对应 PHY 各个相位的多组地址/命令信号，能够在同一个 DFI CLK 周期里给 PHY 发送多个命令。PHY 同时接收多个命令后，分为多个 PHY 相位发送 DRAM。以 dfi\_address\_pN 信号为例，在 1:2 频率比时分为两个相位的信号：

- dfi\_address\_p0，在 P0 相位有效
- dfi\_address\_p1，在 P1 相位有效

原图 40 是一个 1:2 频率比的例子，可以帮助读者理解多相位地址控制信号的行为。图中 MC 只在 P0 发送命令，依次发送了一个读命令和写命令，因此只有 dfi\_cs\_p0 和其他 dfi\_xxx\_p0 信号有效。PHY 在每个 DFI PHY 周期轮流采样 MC P0 和 P1 信号，因为 P1 信号均无效，所以此时只是相当于 P0 信号被从 DFI CLK 域转换到了 DFI PHY CLK 域。

但是 dfi\_odt\_p1 信号是个例外，DRAM 的 [ODT 信号](https://zhida.zhihu.com/search?content_id=239770066&content_type=Article&match_order=1&q=ODT+%E4%BF%A1%E5%8F%B7&zhida_source=entity) 是一个脉宽受控制的脉冲信号。PHY 轮流采样 MC P0 和 P1 ODT 信号，使 MC DFI P0 和 P1 ODT 信号的 DFI 时钟周期之和等于 DRAM 上的 ODT 信号 PHY DFI 时钟周期。这样 MC 就可以通过 P0 和 P1 上的 ODT 信号的长度，来控制 DRAM 接收到的 ODT 信号脉宽。显然，MC P0 和 P1 上的 ODT 信号需要是连续的，以实现 DRAM 接口上连续的 ODT 信号。

![](https://pic4.zhimg.com/v2-8bb6136fe7e11df1e3b9c031a1bd3a9d_1440w.jpg)

如果读者还没完全明了，可以继续参看下一个 1:4 频率比的例子，如原图 41 所示。

![](https://picx.zhimg.com/v2-2155ce37be7562b0eea764487f72d3e9_1440w.jpg)

### 5.1 DFI 协议一些规定

这里赘述几条 DFI 协议多相位相关的规定，具体读者可以参考协议，结合实践体会：

1. 即使 PHY 支持并处于多相位模式，MC 还是可以自由选择在单个相位，或者多个相位上发出命令。例外是上文提及地 dfi\_odt\_pN 信号和 dfi\_cke\_pN 信号，因为这两个信号需要 MC 在所有相位上驱动，以使 PHY 将其转换为正确长度的信号，发送给 DRAM。
2. PHY 需要能够在任意相位上接收 MC 命令
3. DFI 接口上所有信号的实现不一定需要相同，比如在 2T 模式中，MC 可以在 P0 和 P1 相位上驱动 dfi\_ras\_n\_pN, dfi\_cas\_n\_pN 和 dfi\_we\_n\_pN，以加倍这些信号的有效长度，但只需要在 P0 或 P1 相位上驱动 dfi\_cs\_n\_pN 信号。

## 6 多相位写数据信号行为

在 1:2/1:4 频率比时，和地址控制信号一样，DFI 数据以及数据有效信号也同样分为多个相位与 PHY 进行传输，以完成不同频率的时钟域转换。

写数据涉及的信号为写数据 dfi\_wrdata\_pN 以及写数据有效信号 dfi\_wrdata\_en\_pN。

### 6.1 写数据使能信号

协议规定单个 dfi\_wrdata\_en\_pN 有效周期表示 dfi\_wrdata\_pN 上正在传输一个周期的有效数据，因此所有相位上 dfi\_wrdata\_en\_pN 有效周期数之和定义了有效写数据的数量（周期数 x 总数据位宽）。

如原图 42 所示，图中 P0 和 P1 相位上各两个有效 dfi\_wrdata\_en\_pN 周期转换为 DFI PHY 域四个有效写数据周期。

![](https://pic3.zhimg.com/v2-b3b7ba0bf9831661dc03a7cef3d597bc_1440w.jpg)

### 6.2 数据位宽

以 1:2 频率比为例，因为 DFI CLK 频率是 DFI PHY CLK 频率的二分之一，并且 DRAM 在上升和下降两个时钟沿都会传输数据，因此 DFI 数据总位宽是 DRAM 数据位宽的四倍，如下表所示：

*表 3- 不同 MC-PHY 时钟频率比下，MC 各相位的 DFI 数据位宽*

| 位宽/频率比 Frequency Ratio | 1:1 | 1:2 | 1:4 |
| --- | --- | --- | --- |
| DRAM 位宽 (Bit) | 32 | 32 | 32 |
| DRAM 数据带宽 (GByte/s) | 12.8 | 12.8 | 12.8 |
| DFI 数据位宽 (Bit) | 64 | 128 | 256 |
| DFI 写相位信号个数 | 1 | 2 | 4 |
| DFI 单个写数据相位信号位宽 (Bit) | 64 | 64 | 64 |

可以发现表 3 就是在表 2 的基础上加了一行 DFI 单个相位数据位宽，事实上无论频率比，DFI 单个相位数据位宽是 DRAM 位宽的 2 倍。

PHY 在接收写数据信号时与地址控制总线相同，每个周期轮流采样 dfi\_wrdata\_pN 的 P0 和 P1 信号，将它们转换到 DFI PHY CLK 域，如原图 43 所示，数据字在 PHY dfi\_wrdata 上呈升序顺序。

![](https://pic3.zhimg.com/v2-eeb60ba499d67de50314634e48890614_1440w.jpg)

### 6.3 DFI 时序参数

DFI 多频率比系统中的时序参数与单倍频率比系统相同，没有什么特别的，主要是 [t\_phy\_wrlat](https://zhida.zhihu.com/search?content_id=239770066&content_type=Article&match_order=1&q=t_phy_wrlat&zhida_source=entity) 和 [t\_phy\_wrdata](https://zhida.zhihu.com/search?content_id=239770066&content_type=Article&match_order=1&q=t_phy_wrdata&zhida_source=entity) 两项参数，两者定义在 DFI PHY 时钟域的 PHY 采样时刻，单位为 DFI PHY 时钟周期，下表描述了两项参数的含义：

*表 4- DFI 写时序参数*

| 时序参数 | 时序起点 | 时序终点 |
| --- | --- | --- |
| t\_phy\_wrlat | PHY 采样 Write 命令 | PHY 采样 dfi\_wrdata\_en\_pN 有效 |
| t\_phy\_wrdata | PHY 采样 dfi\_wrdata\_en\_pN 有效 | PHY 采样 dfi\_wrdata\_pN 有效 |

但有一点在多频率比系统中值得注意，我们知道 t\_phy\_wrlat 参数设置的目的是让 DFI write command 和 write data 在传输到 DRAM 总线时，两者的间隔满足 DRAM CWL 时序参数。因此根据需要 t\_phy\_wrlat 可能是奇数或者偶数。但是 t\_phy\_wrlat 参数定义在 DFI PHY 时钟域，MC 不能直接实现奇数的 t\_phy\_wrlat 参数。

以 1:2 频率比系统为例，MC 在发送写命令后，通过同时置起 dfi\_wrdata\_en\_p0 和 dfi\_wrdata\_en\_p1（使 PHY 先采样 P0），还是首先单独置起 dfi\_wrdata\_en\_p1（使 PHY 先采样 P1），来实现偶数或者奇数的 t\_phy\_wrlat。

- MC 首先单独置起 dfi\_wrdata\_en\_p1，此时 t\_phy\_wrlat 为奇数，如上方原图 43 所示。
- MC 同时置起 dfi\_wrdata\_en\_p0 和 dfi\_wrdata\_en\_p1，此时 t\_phy\_wrlat 为偶数，如下方原图 44 所示。
![](https://pic4.zhimg.com/v2-a7301ef4b01bab7811d37cd9911be8f3_1440w.jpg)

## 7 多相位读数据信号行为

读数据信号和写数据信号大致相同，包括读数据信号 dfi\_rddata\_wN 和读数据使能信号 dfi\_rddata\_en\_pN。读数据使能信号的长度同样定义了读数据的周期数。

也有一些不同之处，包括增加了数据有效信号 dfi\_rddata\_valid\_wN，PHY 置起该信号用于通知 MC 读数据就绪。

此外，这里读数据以及读数据有效信号的后缀不是 \_pN，而是 \_wN，原因是读信号并不和相位强相关，这点和写信号不同。后文会详细讨论读数据返回为什么与相位无关。

并且，协议在这部分强调了读数据返回的顺序问题，尤其是读命令的数据长度与读数据信号位宽不等时的情况。

### 7.1 读数据有效信号

DFI 协议规定由 PHY 通过置起 dfi\_rddata\_valid\_wN 通知 MC 返回有效的读数据。我们知道读操作在 DRAM 上的延迟是固定的，从接收到到读命令到读数据开始返回的延迟是 DRAM CL 时序参数。那么 MC 算上已知的 PHY+MC 的内部延迟，和走线延迟（通过训练得到），那么读数据返回所需的时间对 MC 应该也是已知，事实上这部分延迟已经被 MC 算进了 dfi\_rddata\_en\_pN 的延迟中。那么为什么不让 MC 在固定的延迟之后自行接收读数据返回呢？

笔者个人认为协议设计成 PHY 通知 MC 的初衷可能是因为 PHY 内部延迟存在波动，比如

- 数据在跨越 DQS-PHY CLK 时钟域时，其异步 FIFO 指针有可能遇到亚稳态现象导致的额外延迟。
- 在数据接收过程中，PHY 发现走线延迟因为温度或者电压的变化出现变化，对补偿走线延迟的 delay lane 进行更新，而且没来得及通知 MC（这种情况只是笔者的想象，产生条件比较极端）

DFI 读数据操作过程如原图 46 所示，MC 发出读命令后，发出了两个长度为 2 周期的 dfi\_rddata\_en\_pN 信号，对应 4 周期的读数据，随数据返回的还有 PHY 置高的 dfi\_rddata\_valid 信号。

注意图中上下 MC 和 PHY 处的时序画的并不严格，只是示意图，所以会看到 MC 这里读数据出现得比 PHY 处还早。

![](https://picx.zhimg.com/v2-4e2576718760b8b622717b141690b3cf_1440w.jpg)

### 7.2 数据位宽

数据以及读数据有效信号的后缀中的 \_w，表示 data word，一个 data word 包括一个 DQS 时钟周期上升沿和下降沿的数据，也就是两倍 DRAM 位宽。1:2 频率比时，读数据总线划分为 2 个 read data word，1：4 频率比时，读总线划分为 4 个 read data word。

也就是说读写数据信号，dfi\_rddata\_wN 位宽和 dfi\_wrdata\_pN 位宽是一样一样的。区别在于 PHY 可以在一个 DFI 时钟周期内同时返回 dfi\_rddata\_w0 和 dfi\_rddata\_w1，如上方的原图 46 所示，所以信号本身不和相位对应，这也是 DFI 协议在这里着重区分写数据相位和读数据 word 的原因。

*表 5- 不同 MC-PHY 时钟频率比下，MC 各相位/字的 DFI 数据位宽*

| 位宽/频率比 Frequency Ratio | 1:1 | 1:2 | 1:4 |
| --- | --- | --- | --- |
| DRAM 位宽 (Bit) | 32 | 32 | 32 |
| DRAM 数据带宽 (GByte/s) | 12.8 | 12.8 | 12.8 |
| DFI 数据位宽 (Bit) | 64 | 128 | 256 |
| DFI 写相位信号个数 | 1 | 2 | 4 |
| DFI 单个写数据相位信号位宽 (Bit) | 64 | 64 | 64 |
| DFI 读字信号个数 | 1 | 2 | 4 |
| DFI 单个读数据字位宽 (Bit) | 64 | 64 | 64 |

### 7.3 读数据返回顺序

上节提到 PHY 可以在一个 DFI 时钟周期内同时，置起 dfi\_rddata\_valid\_wN ，表示 dfi\_rddata\_wN 有效。

但是 DFI 数据需要保持 DRAM 返回的顺序，依次从 w0 - w1 - w2 - w3 上返回（以 1:4 频率比为例，1:2 同理），这条规则适用于同一笔读命令内的数据，也适用于不同读命令之间的数据（如果每笔读交易数据和 DFI 数据信号位宽不相等的话）。

以下举几个协议上的例子：

1. 如原图 49 所示，1:2 频率比。第一笔读命令长度为 1 个字的数据在 w0 上返回，第二笔读命令长度为 1 个字的数据从 w1 上返回。
2. 如原图 50 所示，1:4 频率比。第一笔读命令长度为 2 个字的数据 D0 D1 分别在 w0 和 w1 上返回，第二笔读命令长度为 4 个字的数据从 w2 上开始返回第一个字 D2。
![](https://picx.zhimg.com/v2-a2ac6b0f6fbae2bec46bfb1c35a43961_1440w.jpg)

![](https://pic4.zhimg.com/v2-154ca0251be1093efa894745f1a7c9d7_1440w.jpg)

### 7.4 DFI 协议一些规定

1. DFI 初始化后，在 dfi\_rddata\_w0 上返回的第一笔读数据。
2. 上一条更具体的规定是，dfi\_init\_start 信号置起后（对应 DFI 初始化，以及 DFI 频率比变化之后等情况），在 dfi\_rddata\_w0 上返回的第一笔读数据。
3. PHY 只能在相位 0 改变读数据有效信号，使读数据在 DFI CLK 上升沿变化，同样是出于增大 MC 读数据采样 margin 的考虑。这是对 7.2 中读数据有效信号与相位无关说法的补充。
4. MC 和 PHY 之间需要保持相同的读数据返回顺序，如果两者之间丢失了读数据顺序的同步，那么会有错误汇报或者重新训练来恢复顺序。表现在 DFI 信号上就是会有 dfi\_ctrlupd 或者 dfi\_phyupd DFI 更新信号的交互，PHY 和 MC 在 DFI 更新完成后，恢复读数据顺序，下一个读数据从 w0 返回。

### 7.5 DFI 时序参数

和写操作一样，多倍频率比系统的读操作的 DFI 时序参数和单倍频率比时定义相同，主要为 t\_phy\_rdlat 和 t\_phy\_rddata\_en。两者定义在 DFI PHY 时钟域的 PHY 采样/发送时刻，单位为 DFI PHY 时钟周期

*表 4- DFI 读时序参数*

| 时序参数 | 时序起点 | 时序终点 |
| --- | --- | --- |
| t\_phy\_rddata\_en | PHY 采样 Read 命令 | PHY 采样 dfi\_rddata\_en\_pN 有效 |
| t\_phy\_rdlat | PHY 采样 dfi\_rddata\_en\_pN 有效 | PHY 发送 dfi\_rddata\_wN |

和写操作一样，读操作时 MC 同样存在如何实现奇数或者偶数 t\_phy\_rddata\_en 的需求。

以 1:2 频率比系统为例，MC 在发送读命令后，通过同时置起 dfi\_rddata\_en\_p0 和 dfi\_rddata\_en\_p1（使 PHY 先采样 P0），还是首先单独置起 dfi\_rddata\_en\_p1（使 PHY 先采样 P1），来实现奇数或者偶数的 t\_phy\_rddata\_en。

- MC 同时置起 dfi\_rddata\_en\_p0 和 dfi\_rddata\_en\_p1，此时 t\_phy\_rddata\_en 为偶数，如上方原图 46 所示。
- MC 首先置起 dfi\_rddata\_en\_p1，此时 t\_phy\_rddata\_en 为奇数，如下方原图 47 所示。
![](https://picx.zhimg.com/v2-f5240cd7300e8f7131d879752c02d85d_1440w.jpg)

## 8 结语

本期我们讨论了：

- DFI 时钟结构，DFI 时钟与 DFI PHY 时钟频率比
- 1:2/1:4 倍速率 DFI PHY 时钟架构的优劣
- 多相位地址控制信号、写数据信号以及读数据信号行为
- 多相位情况下的 DFI 时序参数控制

在后续的文章中我们还会讨论相关的内容

- DFI 读写操作行为以及读写相关的时序参数
- DFI CLK 与 DFI PHY CLK 频率比动态更新

### 关于作者

ljgibbs, 主业是某 Fabless 的 SoC Designer，业余时间是专栏作者与开源开发者。

感兴趣的领域包括：AXI 等片上总线、DDR、PCIe、嵌入式系统与计算机架构、FPGA 、计算机网络通信、半导体行业与市场、翻译&写作、电影&历史。

### 关于《DDR 学习时间》专栏

在 DDR 学习时间专栏中，目前有几个 Part：

- Part-A DRAM 课程、论文以及其他在线资源的学习
- Part-B 基于 DDR4 Spec 的 DDR 特性学习
- Part-C 基于 DFI Spec 的 DDR Controller/PHY 接口行为学习与实现
- Part-D DRAM 系统的调试、验证与测试
- Part-Z DRAM 相关杂谈

计划开设下一个 Part

- Part-S DDR 仿真与实例

编辑于 2024-02-16 22:25・上海[请问自学模拟ic可不可以就业？](https://www.zhihu.com/question/664530063/answer/118531964764)

[

不能先浅谈一下模拟IC设计方向的技能要求。模拟ic设计工程师需要根据芯片要求采用合适的电路结构，定义具体器件参数，然后通过EDA工具仿真，调整电路参数。所以模拟电路（包括放大器...

](https://www.zhihu.com/question/664530063/answer/118531964764)