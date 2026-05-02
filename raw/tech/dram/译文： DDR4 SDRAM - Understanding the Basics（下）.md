---
title: "译文： DDR4 SDRAM - Understanding the Basics（下）"
source: "https://zhuanlan.zhihu.com/p/263080272"
author:
  - "[[LogicJitterGibbsICer && 业余FPGAer]]"
published:
created: 2026-05-02
description: "一文了解 DDR4 的基础知识。 原文地址：https://www.systemverilog.io/ddr4-basics#dram-sub-system 申请翻译授权中，如有侵权，将会删除 存储访问 Accessing MemoryDDR4 的读写访问都基于 Burst 形式（译注：Burs…"
tags:
  - "clippings"
---
[收录于 · OpenIC 特别兴趣小组](https://www.zhihu.com/column/c_1029044037684183040)

112 人赞同了该文章

> 一文了解 [DDR4](https://zhida.zhihu.com/search?content_id=146593061&content_type=Article&match_order=1&q=DDR4&zhida_source=entity) 的基础知识。  
> 原文地址： [systemverilog.io/ddr4-b](https://link.zhihu.com/?target=https%3A//www.systemverilog.io/ddr4-basics%23dram-sub-system)  
> 申请翻译授权中，如有侵权，将会删除

### 存储访问 Accessing Memory

- DDR4 的读写访问都基于 [Burst](https://zhida.zhihu.com/search?content_id=146593061&content_type=Article&match_order=1&q=Burst&zhida_source=entity) 形式（译注：Burst 一般译作突发传输或者猝发传输）。突发传输起始时，由用户指定传输的起始地址，以及本次传输的长度，在 DDR4 中这个长度为 8 或者 4，后者是一个 chopped 的传输。（译注：chopped burst ，即提利昂·兰尼斯特式短小的传输）
- 读写操作分为两个阶段，以 [ACTIVATE](https://zhida.zhihu.com/search?content_id=146593061&content_type=Article&match_order=1&q=ACTIVATE&zhida_source=entity) 激活命令（保持一个周期的 ACT\_n & CS\_n 低电平信号）开始，其后是具体的读或者写命令。
- 与激活命令同时发出的地址信号，用于确定所需激活的 BankGroup，Bank，Row，这项步骤称为 [RAS](https://zhida.zhihu.com/search?content_id=146593061&content_type=Article&match_order=1&q=RAS&zhida_source=entity) 阶段，Row Address Strobe。
- 而在第二阶段，与读写命令同步发出的地址信号用于确定突发传输的起始列地址。这项步骤称为 [CAS](https://zhida.zhihu.com/search?content_id=146593061&content_type=Article&match_order=1&q=CAS&zhida_source=entity) 阶段，Column Address Strobe。
- 由于单个 Bank 只有一个 Sense Amps，只能缓存单个行的内容。因此在激活某行后，访问同一 Bank 不同行之前，需要使用 [PRECHARGE](https://zhida.zhihu.com/search?content_id=146593061&content_type=Article&match_order=1&q=PRECHARGE&zhida_source=entity) 命令关闭（de-activate）当前激活行。PRECHARGE 命令好比关上当前打开的文件柜抽屉，命令发出后当前 Sense Amps 中缓存的行会被写回原地址。
- 相较于直接使用 PRECHARGE 命令关闭某个行，也可以使用 RDA （Read with Auto-Precharge）或者 WRA (Write with Auto-Precharge)命令，在当前传输结束后自动关闭当前行。因为列地址只需要使用 A0-A9 10bit，因此 CAS 阶段使用 A10 比特表示当前是否启用自动关闭（Auto-Precharge)。

### 命令真值表 Command Truth Table

至今为止，我们一直在使用 ”命令“ （Command）这一说法，激活命令，读写命令等等。但在本文开始的时候，我们并没有提到 DRAM 有"命令" IO，那么这些命令都是如何通过 IO 发送给 DRAM 的呢？

事实上，DRAM 使用 ACT\_n, RAS\_n, CAS\_n & WE\_n ，这几个信号 IO 的组合来发出命令。

![](https://pic2.zhimg.com/v2-0e1ca7a686b685d50e5a7008936d34f5_1440w.jpg)

表-部分命令的真值表

上表是 DRAM 部分命令的子集，完整的命令真值表可以在 [JEDEC](https://zhida.zhihu.com/search?content_id=146593061&content_type=Article&match_order=1&q=JEDEC&zhida_source=entity) 标准 JESD79-4B 4.1 节中获得。

### 读命令 Read

![](https://picx.zhimg.com/v2-bbea2c6372c5c946315bf0e2b01e4e3f_1440w.jpg)

图-8 读命令操作

上图是读命令的时序图，此时突发传输长度为 8，称为 BL8。

- 第一步是 ACT 命令，当时在地址总线上的是 row 地址
- 第二步发出了 RDA 命令，此时地址总线上为 column 地址
- RDA 命令指示 DRAM 在读操作完成后自动关闭当前 Bank

### 写命令 Write

![](https://pic3.zhimg.com/v2-630cf0bb1d587e9c7ada9ccb99a2f3ae_1440w.png)

图-9 写命令操作

上图是写命令的时序图。

- 第一步是发出 ACT 命令激活 ROW 行
- 第二步发出了写命令，第一次突发传输写入 COL 起始的地址中，第二次突发传输写入 COL+ 8 地址
- 第二次突发传输之前无需再发出 ACT 命令，因此所操作的 ROW 行此前已经被打开，数据缓存于 Sense Amps 中
- 此外，第一次发出的是纯粹的 WR 命令，所以传输结束后，该行仍处于激活状态。第二次发出的是具有自动关闭功能的 WRA 命令，因此在传输结束后自动关闭了该行。

\[**备注** ：本文对一些内容并没有做出详细的解释，比如 A16&A15&A14 这些具有复用功能的地址信号中，自动关闭功能通过 A10发出，而 A12 则用于选择突发传输的长度：4/8, 如果模式寄存器中相应的配置位使能的话\]

### DRAM 子系统 DRAM sub-system

在前面的章节中，我们已经讨论了很多关于 DRAM 本身的内容，在本节中，我们将讨论 ASIC 或者 FPGA 与 DRAM 通信时所需的系统组件，由 3 部分组成：

- DRAM
- DDR PHY
- DDR Controller（译注：一般简称为 [MC](https://zhida.zhihu.com/search?content_id=146593061&content_type=Article&match_order=1&q=MC&zhida_source=entity) ，即 Memory Controller）
![](https://pica.zhimg.com/v2-5725a408afb008eb934a63d1bf4cc568_1440w.jpg)

图-10 DRAM 子系统组成

上图中的信息量很大，让我们一点点拉扯来看：

- 一般来说，DRAM 是一个焊接在 PCB 上的独立芯片，而 PHY 与 MC 则是 FPGA 或者 ASIC 用户逻辑的一部分
- 用户逻辑与 MC 之间的接口是由用户定义的，并没有被标准化
- 用户逻辑向 MC 发出读写命令时，其中的地址使用的是逻辑地址
- MC 再将逻辑地址转换为物理地址，将用户逻辑的命令转换后向 PHY 发出
- MC 与 PHY 之间采用标准化接口进行通信，一般为 [DFI](https://zhida.zhihu.com/search?content_id=146593061&content_type=Article&match_order=1&q=DFI&zhida_source=entity) （DDR PHY Interface），DFI 标准可从以下链接得到 [ddr-phy.org/](https://link.zhihu.com/?target=http%3A//www.ddr-phy.org/)
- PHY 将 MC 的命令转换为具体的底层信号，驱动 DRAM 的物理 IO 接口
- PHY 与 DRAM 之间的接口由 JEDEC 标准化

由此看来，MC 好比是读写 DDR 的大脑，而 PHY 则是做出反应的肌肉

- 当用户激活一行时，整个行被缓存至 Sense Amps 中。后续用户对该缓存行读写的代价会相对较低，因为可以省略第一阶段的激活命令。MC 一般可以对访问 DRAM 的请求进行重排序，来高效地利用行缓存机制。为了实现重排序，MC 一般具有一小块 cache 或者 TCAM，并始终返回最新的数据（译注：and always returns the lastest data 这里没有搞懂）。所以用户逻辑无需担心数据丢失或者冲突，因为控制器会负责重排序功能
- PHY 中包括了模拟电路的部分，用于驱动 DRAM 的 IO。并负责调整寄存器以增大驱动能力或者调节端接电阻，以提高信号完整性

### 言而总之 In a netshell

让我们最后总结下本文：

- DRAM 以 Bank Groups Bank Row Columns 的形式组织
- 用户发出的地址称为逻辑地址，由 DRAM 控制器转换为物理地址后发送给 DRAM
- DRAM 根据其 DQ 数据总线宽度，划分为 x4、x8 以及 x16 三类
- 可以通过 depth/width 串联多个 DRAM 颗粒实现所需的大小
- 读写命令分为两个阶段进行，第一步激活某行，第二步读写该行
- DRAM 子系统由 DRAM 颗粒、PHY 以及 控制器三部分组成

发布于 2020-10-08 23:18[【净热选购指南】净热一体机怎么选才能避雷流量小、千滚水、换芯贵的机型？一篇说清净热一体机的选购重点！【内附热门净热一体机实用记录】](https://zhuanlan.zhihu.com/p/635367879)

[

“多喝热水包治百病”咱们国人喝热水的习惯可谓是刻在了DNA里， 尤其是有老人和孩子的家庭，更是离不开热水，像我平时就...

](https://zhuanlan.zhihu.com/p/635367879)