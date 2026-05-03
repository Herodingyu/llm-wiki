---
doc_id: src-ddr-学习时间-part-c-3-dfi-协议功能-dfi-phy-与-dfi-时钟频率比
title: DDR 学习时间 (Part C   3)：DFI 协议功能   DFI PHY 与 DFI 时钟频率比
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/DDR 学习时间 (Part C - 3)：DFI 协议功能 - DFI PHY 与 DFI 时钟频率比.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · OpenIC 特别兴趣小组](https://www.zhihu.com/column/c_1029044037684183040) 89 人赞同了该文章 目录

## Key Points

### 1. 1 DFI 时钟结构
在讨论 DFI PHY 时钟和 DFI 时钟的频率比之前，笔者首先通过下图对 MC 时钟，PHY 时钟、DFI PHY 时钟和 DFI 时钟做一些阐述。 下图是一个简单但是典型的 MC-PHY 的 DFI 架构的时钟结构示意图。DFI CLK 是 DFI 接口上所有信号的时钟，MC 核心逻辑也工作在该时钟下，所以有时候 MC CLK 指的也是 DFI CLK。

### 2. 2 DFI PHY 时钟与 DFI 时钟频率比
当我们选定一个 DRAM 器件的速率后，比如 [DDR4-3200](https://zhida.zhihu.com/search?content_id=239770066&content_type=Article&match_order=1&q=DDR4-3200&zhida_source=entity) 后，PHY 时钟频率实际也已经选定为 1600MHz，也就是 DRAM 数据速率的一半。在

### 3. 3 1:2/1:4 倍速率 DFI 时钟的优劣势
MC/DFI 时钟频率可以小于 DFI PHY 时钟频率对于 DDR DFI 架构实现有很大的好处。MC 部分的逻辑要比 PHY 部分复杂一些，因此 MC 的时钟频率很难做的和 PHY 一样高。举个例子，在主流的 [14nm 工艺](https://zhida.zhihu.com/search?content_id=239770066&content_type=Article&match_orde

### 4. 4 DFI 多倍速率时钟定义
多倍速率的 DFI PHY CLK 和 DFI CLK 满足以下两条条件： 1. DFI PHY CLK 和 DFI CLK 相位对齐 2. DFI PHY CLK 的频率是 DFI CLK 的两倍或者四倍

### 5. 5 多相位地址控制信号行为
因为 PHY 可以在每个 DFI PHY CLK 相位采样一组地址/命令信号发送给 DRAM，因此 MC 有对应 PHY 各个相位的多组地址/命令信号，能够在同一个 DFI CLK 周期里给 PHY 发送多个命令。PHY 同时接收多个命令后，分为多个 PHY 相位发送 DRAM。以 dfi\_address\_pN 信号为例，在 1:2 频率比时分为两个相位的信号：

## Evidence

- Source: [原始文章](raw/tech/dram/DDR 学习时间 (Part C - 3)：DFI 协议功能 - DFI PHY 与 DFI 时钟频率比.md) [[../../raw/tech/dram/DDR 学习时间 (Part C - 3)：DFI 协议功能 - DFI PHY 与 DFI 时钟频率比.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/DDR 学习时间 (Part C - 3)：DFI 协议功能 - DFI PHY 与 DFI 时钟频率比.md) [[../../raw/tech/dram/DDR 学习时间 (Part C - 3)：DFI 协议功能 - DFI PHY 与 DFI 时钟频率比.md|原始文章]]
