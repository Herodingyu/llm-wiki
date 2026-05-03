---
doc_id: src-芯片中的数学-均衡器eq和它在高速外部总线中的应用
title: 芯片中的数学——均衡器EQ和它在高速外部总线中的应用
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/芯片中的数学——均衡器EQ和它在高速外部总线中的应用.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) 531 人赞同了该文章 高速的串行总线逐渐淘汰了系统中的并行总线，作为并行总线最后堡垒的内存总线也越来越多的吸收了其中关键技术，尤其是 [均衡器](https://zhida.zhihu.com/search?content_id=9804921&content_type=Article&match_order=1&q=%E5%9D%87%E8%A1%A1%E5%99%A8&zhida_source=entity) （Equalization，EQ）技术。为什么串行总线会替代并

## Key Points

### 1. 并行总线到串行总线的转变
过去都认为串行比并行慢，串口比并口慢，就像四车道比单车道通行速度高一样很好理解。然而近十几年来，并行总线发展遇到了瓶颈。并行总线因为抗干扰能力差，时钟与数据同时传输的并行传输方式和线路串扰等等问题导致很难达到1Gb/s以上带宽，内存总线为了对齐/校准时钟与数据付出了极大的代价。而串行总线自从引入了差分信号后，对共模干扰抵抗能力很强，信道中没有时钟信号，时钟是在数据接收端进行恢复。

### 2. 什么是眼图？
眼图并不是眼睛的图： ![](https://picx.zhimg.com/v2-3ef6cef1befe52613683b9bb6e74240d_1440w.jpg) 所谓眼图就是把一连串信号(000,001,010,011, 100, 101,110,111)叠加在一起，形成一个类似眼睛的图像，通常是在示波器上。

### 3. 是么是去加重和preshoot？
去加重（ **De-emphasis** ）和preshoot是为了对抗码间干扰的（ **inter-symbol interference， ISI** ）。 什么是码间干扰呢？我们可以这么理解，当我们发送111101111这样的数据是，忽然变化的0，让电路里的电容很难迅速放电达到0，后面又被迅速拉到1，造成0的信号眼图很小：

### 4. 什么是CTLE和DFE？
Rx端采用 **CTLE** (Continuous Time Linear Equalizer，连续时间线性均衡器)和 **DFE** (Decision Feedback Equalizer，判决反馈均衡器)。限于篇幅，本文只简要介绍一下。

### 5. 效果如何？
PCIe 3.0信号不经过EQ处理是这样，眼图关闭： ![](https://pica.zhimg.com/v2-223b7f9626bd4600db93e87340d1e59e_1440w.jpg)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/芯片中的数学——均衡器EQ和它在高速外部总线中的应用.md) [[../../raw/tech/soc-pm/芯片中的数学——均衡器EQ和它在高速外部总线中的应用.md|原始文章]]

## Key Quotes

> "inter-symbol interference， ISI"

> "更多BIOS知识尽在BIOS培训云课堂"

> "在我们介绍各种EQ之前，我们先来了解一下什么是眼图和眼图对于信号完整性的重要作用"

> "CTLE是利用连续的信号曲线，减缓低频部分，用来补偿高频部分，因为高频部分损耗较大，所谓削峰填谷。它有个缺点是会放大高频噪声"

> "DFE也是一种回馈均衡器，是用上次信道的输出经过判断后加权反馈到输入上。它不会放大高频噪声，但是只能处理码后干扰，不能消除码前干扰，且设计复杂和耗电"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/芯片中的数学——均衡器EQ和它在高速外部总线中的应用.md) [[../../raw/tech/soc-pm/芯片中的数学——均衡器EQ和它在高速外部总线中的应用.md|原始文章]]
