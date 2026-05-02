---
title: "译文： DDR4 SDRAM - Understanding the Basics（上）"
source: "https://zhuanlan.zhihu.com/p/262052220"
author:
  - "[[LogicJitterGibbsICer && 业余FPGAer]]"
published:
created: 2026-05-02
description: "一文了解 DDR4 的基础知识。 原文地址：https://www.systemverilog.io/ddr4-basics#dram-sub-system 申请翻译授权中，如有侵权，将会删除 引言 Introduction如今，DDR4 SDRAM 是基于 FPGA 或者 ASIC 的设备中非常…"
tags:
  - "clippings"
---
[收录于 · OpenIC 特别兴趣小组](https://www.zhihu.com/column/c_1029044037684183040)

不坠青云之志 等 261 人赞同了该文章

> 一文了解 DDR4 的基础知识。  
> 原文地址： [systemverilog.io/ddr4-b](https://link.zhihu.com/?target=https%3A//www.systemverilog.io/ddr4-basics%23dram-sub-system)  
> 申请翻译授权中，如有侵权，将会删除

### 引言 Introduction

如今，DDR4 SDRAM 是基于 [FPGA](https://zhida.zhihu.com/search?content_id=146364341&content_type=Article&match_order=1&q=FPGA&zhida_source=entity) 或者 [ASIC](https://zhida.zhihu.com/search?content_id=146364341&content_type=Article&match_order=1&q=ASIC&zhida_source=entity) 的设备中非常流行的存储介质。本文我们将探寻 DDR4 的一些的基础知识：

- DDR4 SDRAM 的内部结构是怎么样的
- DDR4 的基础操作：读写操作是如何进行的，以及
- 高层次的 [SDRAM 子系统](https://zhida.zhihu.com/search?content_id=146364341&content_type=Article&match_order=1&q=SDRAM+%E5%AD%90%E7%B3%BB%E7%BB%9F&zhida_source=entity) 概述，比如 FPGA/ASIC 与 DDR4 SDRAM 通信的整个系统

### 物理结构 Physical Structure

从 DRAM 必要的 IO 管脚及其功能来开始本文是个不错的主意。本章我们将从 DRAM 外部的 IO 开始，一直向底层讨论到 DRAM 内部的基础电路单元。

### 顶层 Top Level

正如你预期的那样，DRAM 拥有时钟、复位、片选、地址以及数据输入。下文中的表格有关于各个引脚更详细的信息。表格中并没有列出所有的 IO，只列出了其中基础的部分。读者可以花一些时间来了解各个 IO 的功能，尤其是那些拥有复用功能的地址信号。

![](https://picx.zhimg.com/v2-fbd513cb71d0476fa6e4b650d4aa97cf_1440w.jpg)

图-1 顶层 IO 信息

![](https://picx.zhimg.com/v2-32e84ec270d9d937eeb2afa0668043b5_1440w.jpg)

### BankGroup，Bank，Row，Column

上节中的 DRAM 顶层结构展示了提供给外部的 IO 管脚。而下图则展示了 DRAM 内部的构造，以 bank 以及 bankgroup 为单元组织起来。

![](https://picx.zhimg.com/v2-99190bdd68184baea68d7598db10ae8f_1440w.jpg)

图-2 BankGroup 以及 Bank

当从存储介质中读取数据时，需要提供读数据的地址；在写入数据时，除地址外还需提供写数据。由用户提供的地址，一般称为“逻辑地址”（logical address）。逻辑地址在传输给 DRAM 前，会转换为物理地址（Physical address 译注：转换工作通常由 MMU 完成）。物理地址由以下几个域（field）组成：

- Bank Group
- Bank
- Row
- Column

这些域将用于区分读取或者写入数据的存储介质单元的位置。

如果再深入一个层次，看看单个 Bank 的组成部分。

- 存储阵列 Memory Arrays
- 行译码 row decoder
- 列译码 column decoder
- [Sense Amplifiers](https://zhida.zhihu.com/search?content_id=146364341&content_type=Article&match_order=1&q=Sense+Amplifiers&zhida_source=entity)
![](https://pica.zhimg.com/v2-08ddaf89b8a304292dbc371e8cb95a2e_1440w.jpg)

图-3 行&列译码

在确定了待读取地址的 Bank 组与 Bank 后，地址中的行部分将激活（activate）存储阵列中的一行（line），这被称为 Word line。在该行被激活后，其数据被从存储阵列中读出，写入 Sense Amplifiers。随后，DRAM 根据列地址从 Sense Amplifiers 中缓存的 Word line 再读取出属于该列的数据，这部分数据的长度与 DRAM 列数据位宽相同，称为 Bit line。

DRAM 协议规定了列数据位宽，包括 4 bit，8 bit 和 16 bit 三种，DRAM 也因此分为三类：x4,x8 以及 x16 。此外请注意：DRAM 颗粒的 DQ 宽度与列数据位宽相同。所以也可以说 DRAM 是根据 DQ 总线宽度划分的，为了简便起见。

\[**备注**\] x16 DRAM 仅有 2 个 Bank Group 而 x4 以及 x8 DRAM 有 4 个 Bank Group，如图 2 所示。

**举例时间** ：一个 DRAM 芯片好比就是一个装满着文件柜的建筑

**BankGroup** 地址用于找到楼层

**Bank** 地址用于找到你所需的那个文件柜

**Row** 地址用于在这个文件柜里找到你所需的抽屉

**Col** 地址则用来标记抽屉里第几份文件是你需要的

而在更低的层次上，每个比特实际上由一个保持电荷的电容，以及一个用作开关的晶体管组成。

![](https://picx.zhimg.com/v2-62dfb78c10c821db09586ce9f1a0ea59_1440w.jpg)

图-4 比特层组成

由于电容中保持的电荷会随着时间流逝而放电，DRAM 中保持的信息会逐渐丢失除非周期性地对电容充电，即重刷新。这也就是 DRAM 中 'D' 的由来，代表 Dynamic，对应于 SRAM （Static Random Access Memory）。

### DRAM 容量与地址 DRAM Sizing & Addressing

DRAM 采用标准容量，由 [JEDEC 标准](https://zhida.zhihu.com/search?content_id=146364341&content_type=Article&match_order=1&q=JEDEC+%E6%A0%87%E5%87%86&zhida_source=entity) 制定。JEDEC 是决定 DDR 设计与发展路线的标准委员会。下文的内容来自 JEDEC DDR4 标准（JESD79-4B）的 2.7 节。

![](https://pica.zhimg.com/v2-0ec832e2aa2971d77f6baa45d2be5a8c_1440w.jpg)

图-5 不同容量的 DRAM 颗粒的地址映射

### DRAM 容量计算 DRAM Size Calculation

接下来让我们通过手工计算 2 个颗粒的大小来更深入地理解上一份表格的内容。

```
/* 4Gb x4 Device */  4Gb x4 颗粒
Number of Row Address bits: A0-A15 = 16 bits
行地址信号位宽：16bit
    Total number of row = 2^16 = 64K
    总行数：64k
Number of Column Address bits: A0-A9 = 10 bits
列地址信号位宽：10bit    
    Number of columns per row = 1K
    总列数：1k
Width of each column = 4 bits
每列的数据位宽：4bit
Number of Bank Groups = 4
Bank Group 数量：4
Number of Banks = 4
Bank 数量：4

Total DRAM Capacity = 
    Num.Rows x 
    Num.Columns x Width.of.Column x 
    Num.BankGroups x Num.Banks
DRAM 容量计算 = 行数 x 列数 x 列的数据位宽 x Bank Group 数量 x Bank 数量

Total DRAM Capacity = 
    64K x 1K x 4 x 4 x 4 = 4Gb

/* 4Gb x8 Device */
Number of Row Address bits: A0-A154 = 15 bits
    Total number of row = 2^15 = 32K
Number of Column Address bits: A0-A9 = 10 bits
    Number of columns per row = 1K
Width of each column = 8 bits
Number of Bank Groups = 4
Number of Banks = 4

Total DRAM Capacity = 
    Num.Rows x 
    Num.Columns x Width.of.Column x 
    Num.BankGroups x Num.Banks

Total DRAM Capacity =
    32K x 1K x 8 x 4 x 4 = 4Gb
```

### DRAM Page 大小计算 DRAM Page Size

在上文的表格中，提到了 Page Size 这一概念，指的是每一行中的 bit 数量。换句话说，是当一行被激活时，载入到 Sense Amps 的比特数量。考虑到列地址的位宽为 10bit，每一行有 1k 个列。

所以对于 x4 器件而言，每一行的 bit 数量为 1k x 4 = 4k bit（512B）。

同理，x8/16 器件的 page size 分别为 1k/2k Byte

### Rank (Depth Cascading)

DRAM 中有 single/Dual/Quad Rank 等术语。Rank 是 DRAM 中的最高层次的逻辑单元，一般用于增加整个系统的存储容量。

比如说你需要 16Gb 存储，根据市场上的供应情况、价格以及你自己口袋里的银子，你可能会选择单个 16Gb 的芯片，那么此时你拥有的就是 Single Rank 的系统，因为你只需要单个片选信号（CS\_n，毕竟你只有单个 chip），就可以读取整个 16Gb 空间。

你也可以选择两个单独的 8Gb 的颗粒来组成 16Gb 空间，这两个颗粒一起焊在一块 PCB 上，一般来说这比单个 16Gb 的颗粒要便宜。此时，这两个颗粒共享同一组地址与数据总线，因此你需要控制 2 个片选信号来分时选中这两个颗粒，此时即为 Dual Rank。

\[**备注**\] 你可能会遇到另一种形式的 Dual Rank DDR——Dual-Die Package，即 DDP。DDP 将两个 DDR 颗粒封装在一起，此时你看见的就只有单个芯片了，但其实这两个颗粒还是共享总线，是一种 Dual Rank 器件。

![](https://pic1.zhimg.com/v2-678c70d68ac2f2e93d9c95e92337b8fa_1440w.jpg)

图-6 Rank 的组成

### Width Cascading

再举个多芯片系统的例子，但与 RANK 无关。假设你需要一个 8Gb 存储，并且你的借口是 x8 位宽的，即位宽为 8 bit。此时，你可以选择单个 8Gb x8 的颗粒，或者两个’位宽串联‘的 4Gb x4 的颗粒。在位宽串联（Width Cascading）模式中，两个颗粒连接到同一个片选信号、地址以及数据总线。但不同的是，连接至数据总线的不同部分，在下图中，第一个 x4 颗粒连接到 DQ\[3:0\]，而第二个颗粒则连接至 DQ\[7:4\]。（译注：此时两者都是 single rank ）

![](https://pic1.zhimg.com/v2-bbf24c257dcc7edf9959d251c70ee470_1440w.jpg)

图-7 位宽串联的 DRAM 颗粒

书接下回

编辑于 2020-10-09 22:10[H3N3我不怕！自愈小妙招分享](https://zhuanlan.zhihu.com/p/1982399414472578530)

[

突然在图书馆里打起寒颤。量完体温38.5度，心里顿时咯噔一下，关键时刻居然遇上H3N3。 \[图片\] 这次的症状像坐过山车，时好时坏的低烧配上停不下来的干咳。室友教了我几个小妙招：罗汉...

](https://zhuanlan.zhihu.com/p/1982399414472578530)