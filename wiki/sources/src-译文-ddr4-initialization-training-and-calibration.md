---
doc_id: src-译文-ddr4-initialization-training-and-calibration
title: 译文：DDR4   Initialization, Training and Calibration
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/译文：DDR4 - Initialization, Training and Calibration.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · OpenIC 特别兴趣小组](https://www.zhihu.com/column/c_1029044037684183040) lgjjeff 等 426 人赞同了该文章 > 一文了解 DDR4 中的初始化(Initialization)、内存训练(Training )以及校准(Calibration)，简称 ITC。（ITC 只是译者自己想的缩写）。

## Key Points

### 1. 引言 Introduction
当一个拥有 DRAM 子系统的设备启动时，有几件事需要在 DRAM 进入工作状态之前完成。下图是来自 JEDEC specification （DDR4 标准， [jedec.org/standards-doc](https://link.zhihu.com/?target=https%3A//www.jedec.org/standards-documents/docs/jesd79-4a) ）的

### 2. 初始化 Initialization
![](https://picx.zhimg.com/v2-f0340e8e036bf46a549090e330127455_1440w.png) 图-3 初始化相关的状态 上电与初始化是由一系列精心设计的步骤组成的序列（sequence）。一般来说，在系统上电之后，ASIC/FPGA/处理器中的 DDR 控制器会被从复位状态中释放，自动执行上电与初始化序列。下文中列举了一个超简化的控制器所做的工

### 3. ZQ 校准 ZQ Calibration
![](https://pic2.zhimg.com/v2-e9856e098d450d47697ed511796a183f_1440w.png) 图-4 ZQCL ZQ 校准的概念与 DDR 数据信号线 DQ 的电路有关。当讨论 ZQ 校准做了什么以及为何而做之前，我们首先需要来看下每个 DQ 管脚之后的电路。请注意，DQ 管脚都是双向的（bidirectional），负责在写操作时接收数据，在

### 4. DQ 判决电平校准 Verf DQ Calibraton
![](https://pica.zhimg.com/v2-ad47f121ccc8f664a7ff82d40d36a4e0_1440w.png) 图-8 VrefDQ Calibration DDR4 数据线的端接方式（Termination Style）从 CCT（Center Tapped Termination，也称 SSTL，Series-Stud Terminated Logic）更改

### 5. 读写训练 Read/Write Training
在完成上述步骤后，DRAM 初始化已经完成，并处于 IDLE 状态，但此时存储介质仍然未处于正确的工作状态。在正确读写 DRAM 之前，DDR 控制器或者物理层还必须来做一些重要的步骤，称为读写训练，也称存储介质训练/初始校准。

## Evidence

- Source: [原始文章](raw/tech/dram/译文：DDR4 - Initialization, Training and Calibration.md) [[../../raw/tech/dram/译文：DDR4 - Initialization, Training and Calibration.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/译文：DDR4 - Initialization, Training and Calibration.md) [[../../raw/tech/dram/译文：DDR4 - Initialization, Training and Calibration.md|原始文章]]
