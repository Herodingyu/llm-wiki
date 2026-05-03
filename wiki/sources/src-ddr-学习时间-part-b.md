---
doc_id: src-ddr-学习时间-part-b
title: DDR 学习时间 (Part B
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/DDR 学习时间 (Part B.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · OpenIC 特别兴趣小组](https://www.zhihu.com/column/c_1029044037684183040) 没有提供感情机器 等 21 人赞同了该文章 目录

## Key Points

### 1. 导言
DDR4 的 [Gear-down 模式](https://zhida.zhihu.com/search?content_id=248838040&content_type=Article&match_order=1&q=Gear-down+%E6%A8%A1%E5%BC%8F&zhida_source=entity) 是一种通过降低 [DRAM 控制命令](https://zhida.zhihu

### 2. 命令控制总线速率
我们知道 DDR4 命令控制总线在 DRAM 时钟（CK）的上升沿发送或者接收命令，这样相对于在上升沿和下降沿都发送或者接收的数据总线（DQ），命令控制总线速率是数据总线的一半，也就是 1/2 DDR4 数据速率。比如 DDR4-3200 中，命令控制总线的工作频率就是 3200/2 = 1600 MHz。

### 3. Gear-down 模式原理
正常情况下， [CA 总线](https://zhida.zhihu.com/search?content_id=248838040&content_type=Article&match_order=1&q=CA+%E6%80%BB%E7%BA%BF&zhida_source=entity) 两端的 DRAM 和控制器都工作于 1/2 DDR4 数据速率，而 Gear-down 模式下 DRAM

### 4. 进入 Gear-down 模式
DRAM 只能在初始化或者退出 self-refresh 时进入 Gear-down 模式，以初始化时进入 Gear-down 模式为例，具体的步骤如下： 1. 在上电后，DRAM 默认工作在 1/2 data rate 下，也称 1N 模式

### 5. 退出 Gear-down 模式
退出 Gear-down 模式的正确做法是使 DRAM 进入 [Self-refresh 模式](https://zhida.zhihu.com/search?content_id=248838040&content_type=Article&match_order=1&q=Self-refresh+%E6%A8%A1%E5%BC%8F&zhida_source=entity) ，进入 Self-

## Evidence

- Source: [原始文章](raw/tech/dram/DDR 学习时间 (Part B.md) [[../../raw/tech/dram/DDR 学习时间 (Part B.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/DDR 学习时间 (Part B.md) [[../../raw/tech/dram/DDR 学习时间 (Part B.md|原始文章]]
