---
title: "译文：DDR4 SDRAM - Understanding Timing Parameters"
source: "https://zhuanlan.zhihu.com/p/268347945"
author:
  - "[[LogicJitterGibbsICer && 业余FPGAer]]"
published:
created: 2026-05-02
description: "一文了解 DDR4 的基础知识。 原文地址：https://www.systemverilog.io/understanding-ddr4-timing-parameters 申请翻译授权中，如有侵权，将会删除 引言 Introduction在 DDR 标准中有很多很多时序参数（timing par…"
tags:
  - "clippings"
---
[收录于 · OpenIC 特别兴趣小组](https://www.zhihu.com/column/c_1029044037684183040)

99 人赞同了该文章

> 一文了解 [DDR4](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=DDR4&zhida_source=entity) 的基础知识。  
> 原文地址： [systemverilog.io/unders](https://link.zhihu.com/?target=https%3A//www.systemverilog.io/understanding-ddr4-timing-parameters)  
> 申请翻译授权中，如有侵权，将会删除

### 引言 Introduction

在 DDR 标准中有很多很多时序参数（timing parameter），但当你真的和 DDR4 打交道时，会发现经常访问或者读到的参数也就那么几个，它们相比剩下的参数要常用许多。所以，本文将基于具体的 DDR 命令，讨论那些经常用到的参数。

这些命令真的很容易忘记，一段时间不怎么用到后，记忆就会马上模糊。本系列的另一篇文章： [Timing Parameter Cheat Sheet](https://link.zhihu.com/?target=https%3A//www.systemverilog.io/ddr4-timing-parameters-cheatsheet.html) ，可以用作具体时序参数的快速查找手册。

**Note** ：本文所用到的图片都来自于 [JEDEC DDR4 标准](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=JEDEC+DDR4+%E6%A0%87%E5%87%86&zhida_source=entity) ，或者美光的产品手册，在参考文献部分给出了相应的链接。

### 激活命令 ACTIVATE Timing

激活命令用于在访问之前打开某个 bank 中的某个 row。在 [Understanding the Basics](https://link.zhihu.com/?target=https%3A//www.systemverilog.io/ddr4-basics.html) ([译文](https://zhuanlan.zhihu.com/p/262052220))一文中我们了解到每个 bank 有仅有一组 sense amps，所以每个 bank 中可以保持一个 row 处于打开状态。与激活命令相关的常用时序参数共有 3 个， **[tRRD\_S](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=tRRD_S&zhida_source=entity)** ， **[tRRD\_L](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=tRRD_L&zhida_source=entity)** 以及 **[tFAW](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=tFAW&zhida_source=entity)** 。

- **tRRD\_S**
- row-to-row delay--short
	- 当向多个属于不同 bank group 的 bank 发送 ACT 命令时，ACT 命令之间需要满足 **tRRD\_S** 长度的间隔
- **tRRD\_L**
- row-to-row delay--long
	- 与 **tRRD\_S** 的不同点在于，当向多个属于 **同一个** bank group 的 bank 发送 ACT 命令时，ACT 命令之间需要满足 **tRRD\_L** 长度的间隔
![](https://pica.zhimg.com/v2-142baaac2bc9fd3efe8e10efe8aac66c_1440w.jpg)

图-1 **tRRD** 时序图

- **tFAW**
- Four Activate Window
	- 限制容纳 **至多四个 ACT 命令** 的窗口，在这段时间内最多只能发出四个 ACT 命令。
	- 当连续发送 ACT 命令时，ACT 命令之间一方面需要满足 **tRRD\_S/L** ，另一方面，在发送四个 ACT 命令后，需要等待 **tFAW** 窗口结束，才能发送第五个 ACT 命令。
![](https://pic2.zhimg.com/v2-3cd495d3a65c8ebee4b1d25480f719fb_1440w.jpg)

图-2 **tFAW** 时序图

### 刷新命令 REFRESH Timing

为了确保存储在 SDRAM 中的数据不会丢失，存储控制器需要平均间隔 **[tREFI](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=tREFI&zhida_source=entity)** ，发送一次 REFRESH 命令。 但是在进行刷新之前，SDRAM 所有的 bank 需要进行 PRECHARGE 预充电，并空闲一段时间，这个时长称为 **tRP** (min) 。在发出 REFRESH 命令后，必须经过 **[tRFC](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=tRFC&zhida_source=entity)** (min) 的延迟，才能发出下一个命令（ DES 命令除外）。

值得注意的是，这里的 **tREFI** 是刷新命令之间的“平均”间隔，这是因为你可以在周期性发出的刷新命令中，减少一部分，但在后续补上（译注：只需要平均间隔满足 **tREFI** 即可）。延后刷新功能是 DDR4 标准新增的，用于解决高密度刷新带来的较长命令锁定期影响性能的问题。可延后发出的刷新命令数量取决于当前的刷新模式（1x，2x 和 4x），在模式寄存器 MR2 中设置。

- **tREFI**
- DRAM 所需的刷新命令的平均间隔
- **tRFC**
- 刷新命令与其他命令（除 DES 命令）之间的延迟
- **tRP**
- Precharge time
	- 所有 bank 需要在刷新命令前预充电，并保持 **tRP** 的空闲时间
![](https://picx.zhimg.com/v2-42633577e24fbb929aff28c78a57c99d_1440w.png)

图-3 刷新时序图

![](https://pic1.zhimg.com/v2-dffe59db93a891e71635008eae2a125c_1440w.jpg)

图-4 延后刷新命令

### 读命令 READ Timing

读命令相关的时序参数可以分为三类

- 通用读时序 **Read Timing**
- 时钟-数据有效信号（Strobe）间的时序关系 **Clock to Data Strobe relationship**
- 数据-数据有效信号间的时序关系 **Data Strobe to Data relationship**

通过 [DRAM-read-operation](https://link.zhihu.com/?target=https%3A//www.systemverilog.io/ddr4-basics.html%23dram-read) （ [译文](https://zhuanlan.zhihu.com/p/263080272) ）可以了解读操作的基本步骤。

。

### Read Timing

- **[CL](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=CL&zhida_source=entity)** （CAS latency）
- Column-Address-Strobe
	- 当列地址在地址信号上就绪时，CL 是内部读命令与读数据第一个比特之间的延迟时钟周期。
	- CL 大小定义在模式寄存器 MR0 中。SDRAM 标准定义了不同频率下需要设定的 CL 值大小。
- **[AL](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=AL&zhida_source=entity)** （Additive Latency）
- AL 延迟允许紧跟激活命令后发出读命令，器件内部将读命令延迟 AL 个时钟周期后执行。
	- 该项特性用于保持器件内部的高带宽与高速率
- **[RL](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=RL&zhida_source=entity)** （Read Latency）
- 总的读延迟，RL = AL + CL
- **[tCCD\_S/L](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=tCCD_S%2FL&zhida_source=entity)**
- 读取不同 bank 之间的延迟，和 **tRRD\_S/L** 类似，访问不同 bank group 的 bank 相比属于同一 bank group 的延迟要小一点，为 **tRRD\_S** （short）
![](https://pic4.zhimg.com/v2-a0f14970b7835dd63770d8e4a6fe0a5d_1440w.jpg)

图-5 不同 bank group 间的连续读命令。上图中 AL=0，CL=11，所以 RL=11。值得注意的是两次读数据之间没有间隔，后一次的数据紧接着前一次数据。由于两次读命令的 bank group 不同，所以读命令间的延迟是 tCCD\_S

![](https://picx.zhimg.com/v2-b2f79ae7d9affaf08320e9ead445e9eb_1440w.jpg)

图-6 不同 bank group 间的非连续读命令。

![](https://pic2.zhimg.com/v2-9ca64536eb94d79691eabe3a49a15781_1440w.jpg)

图-7 tCCD\_S/L 的不同

### Clock to Data Strobe relationship （CK & DQS）

- **tDQSCK（MIN/MAX）**
- 数据有效信号 strobe **上升沿** 相对于时钟信号 CK\_t（上升沿）、CK\_c（下降沿） 所允许的延迟范围
- **tDQSCK**
- 数据有效信号 strobe **上升沿** 相对于时钟信号 CK\_t（上升沿）、CK\_c（下降沿） 的实际延迟
- **[tQSH](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=tQSH&zhida_source=entity)**
- 数据有效信号高电平脉冲脉宽
- **[tQSL](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=tQSL&zhida_source=entity)**
- 数据有效信号低电平脉冲脉宽
![](https://pic2.zhimg.com/v2-7247f80c095d01b529b333a642cc40e7_1440w.jpg)

图-8 CK-DQS 间相位关系

### Data Strobe to Data relationship （DQS & DQ）

- **tDQSQ**
- 描述 DQ 上升沿相对于 DQS 边沿的最晚时间，（译注，晚于该时刻将影响本次数据采样），在下方的图中可以看到， **tDQSQ** 指的是 DQS 上升沿至有效 DQ 信号左边沿的时间
- **tQH**
- 描述 DQ 上升沿相对于 DQS 边沿的最早时间，（译注，早于该时刻将影响前次数据采样），在下方的图中可以看到， **tQH** 指的是 DQS 上升沿至有效 DQ 信号的右边沿的时间
![](https://pic2.zhimg.com/v2-63f54d2d0caf4f9916d9d77ac80bb417_1440w.jpg)

图-8 续 DQS-DQ 间相位关系

### 写命令 Write Timing

写命令时序大致上与读命令相同...

### 通用写时序 Write timing

- **[CWL](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=CWL&zhida_source=entity)** （CAS Write latency）
- Column-Address-Strobe Write
	- 写命令与第一个送出第一个写数据之间的延迟
	- CWL 大小在模式寄存器 MR2 中定义
- **AL** （Additive Latency）
- AL 延迟允许紧跟激活命令后发出写命令，器件内部将写命令延迟 AL 个时钟周期后执行。
	- 该项特性用于保持器件内部的高带宽与高速率
- **WL** （Read Latency）
- 总的写延迟，WL = AL + CWL
- **tCCD\_S/L**
- 写入不同 bank 之间的延迟，和 **tRRD\_S/L** 类似，访问不同 bank group 的 bank 相比属于同一 bank group 的延迟要小一点，为 **tRRD\_S** （short）

### 时钟-数据有效信号（Strobe）间的时序关系 Clock to Data Strobe relationship

- **tDQSS（MIN/MAX）**
- 数据有效信号 strobe **上升沿** 相对于时钟信号 CK\_t（上升沿）、CK\_c（下降沿） 所允许的延迟范围
- **tDQSS**
- 数据有效信号 strobe **上升沿** 相对于时钟信号 CK\_t（上升沿）、CK\_c（下降沿） 的实际延迟
- **tDQSH**
- 数据有效信号高电平脉冲脉宽
- **tDQSL**
- 数据有效信号低电平脉冲脉宽
- **tWPST**
- Post-write 最后一个数据与有效信号重新置高之间的周期，此时总线并不驱动数据
- **tWPRE**
- Pre-write 数据有效信号（strobe）从无效（non-valid）到有效（valid）之间的周期数
![](https://pic3.zhimg.com/v2-7b6fa5361347acd1f34e13a8496b3a56_1440w.jpg)

图-9 写时序图

### 模式寄存器时序 Mode Register Timing

通过 SDRAM 的 7 个模式寄存器，可以对 SDRAM 的特性，功能以及设置进行编程。这些寄存器本身通过 MRS 命令编辑。模式寄存器一般在初始化期间进行设定，但也可以在后续正常工作期间进行修改。模式寄存器设置有下列两个时序参数：

- **tMRD**
- Mode Register Set command cycle time
	- MRS 命令周期数，指完成寄存器写操作所需要的的周期数，也是两个 MRS 命令之间最小的间隔
![](https://pic4.zhimg.com/v2-fe0931160af736c8719eaef3545ae981_1440w.jpg)

图-10 tMRD timing

- **tMOD**
- Mode Register Set command update time
	- MRS 命令与其他命令（除 DES）之间的最小间隔
![](https://pica.zhimg.com/v2-6b98337cb04793bdb7ff29d6df72e23a_1440w.jpg)

图-10 tMOD timing

### 参考文献 Reference

- [JESD79-49B specification](https://link.zhihu.com/?target=https%3A//www.jedec.org/standards-documents/docs/jesd79-4a)
- [Micron Specification](https://link.zhihu.com/?target=https%3A//www.micron.com/parts/dram/ddr4-sdram/mt40a512m8rh-075e%3Fpc%3D%257B0759757A-85DB-4AD3-9B4D-B7E7DDE8A22D%257D)

编辑于 2021-11-07 22:03[好用的表单制作工具有哪些推荐？](https://www.zhihu.com/question/472809798/answer/3359281696)

[

好用的表单制作工具有哪些推荐？表姐来答一波：那当然是咱家的表单大师了。主要功能数据收集：通过自定义表单对外收集数据 或 对内录入或导入数据数据管理：数据的增删改查、权限分配...

](https://www.zhihu.com/question/472809798/answer/3359281696)