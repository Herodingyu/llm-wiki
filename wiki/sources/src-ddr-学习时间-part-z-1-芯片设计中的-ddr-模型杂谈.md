---
doc_id: src-ddr-学习时间-part-z-1-芯片设计中的-ddr-模型杂谈
title: DDR 学习时间 (Part Z   1)：芯片设计中的 DDR 模型杂谈
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/DDR 学习时间 (Part Z - 1)：芯片设计中的 DDR 模型杂谈.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · OpenIC 特别兴趣小组](https://www.zhihu.com/column/c_1029044037684183040) 79 人赞同了该文章 本期是一篇杂谈，讲讲 [SoC DDRSS](https://zhida.zhihu.com/search?content_id=176410496&content_type=Article&match_order=1&q=SoC+DDRSS&zhida_source=entity) (DDR subsystem) 设计中涉及的几类模型（Model）。

## Key Points

### 1. DDR 复杂 or 不复杂？
DDR 是复杂还是不复杂？这是一个问题。答案是 yes and no. 借用一次 DDR 培训的说法， **DDR 本身物理结构** 并不复杂（not complex）。如果说 x86 CPU 的结构复杂度好比是摩天大楼，那么 DDR 有点像是建筑工人住的板房——DDR 由大量、简单的电路单元的堆叠而成。

### 2. 性能模型
在一个 SoC 的架构设计阶段，架构er 是不是有很多问号。比如我是该用四核 A53 还是双核 A73？NORM 频率又该订到多少？ **问题1/2：** 该怎样选择配置，既能满足用户的性能需求，又不花太多钱？

### 3. 时序模型
如果说性能模型只关心 DRAM 有没有闲着，那时序模型还关心 DRAM 有没有准确地采样命令和数据，更贴心有没有。 性能模型在建模 DRAM 时，以 DRAM **命令/数据** （Command/Data）作为基本单位。而时序模型的建模则关注 DRAM 的每一根地址/命令、数据信号（ CA/DQ ），这些信号构成了不同的 DRAM **命令/数据** 。

### 4. 信号完整性模型
我们知道 DDR 是一种高速并行总线，主流的 DDR4-3200 的时钟频率达到 1.6GHz 之高，保证收发信号的完整性日益重要并且困难。 DRAM 信号完整性主要受到几方面的影响，包括我们 SoC IO 、PCB 传输线、DRAM 颗粒 IO 以及他们之间的互相作用。

### 5. 其他模型
此外，还有一些和 DRAM 相关的模型，比如 PCBer 会使用热仿真模型对整个 PCB 方案进行热仿真以确定散热方案。 DRAM 是板级的主要热源之一，虽然热量和 SoC 本身的热量还是不能比。 此外，也需要通过仿真来检查 DRAM 颗粒是否工作在可接受的温度范围内。超出协议规定的工作温度，可能导致 DRAM 内部数据丢失。

## Evidence

- Source: [原始文章](raw/tech/dram/DDR 学习时间 (Part Z - 1)：芯片设计中的 DDR 模型杂谈.md) [[../../raw/tech/dram/DDR 学习时间 (Part Z - 1)：芯片设计中的 DDR 模型杂谈.md|原始文章]]

## Key Quotes

> "杂谈文风随意，权当作为笔者一些想法的记录。不能保证文中的内容完全准确和全面，欢迎指正和补充"

> "DDR 是复杂还是不复杂？这是一个问题。答案是 yes and no"

> "这些模型的来源一般是很可靠的厂商，比如 DRAM 原厂或者 DDR IP 厂商等等"

> "有些模型需要收费，有些是 DDR IP 的赠品，还有些则可以免费下载。免费使用的模型，想要一窥其中实现就不太可能了，往往是加密的"

> "举个例子，在下图中，性能模型关心的是 WR 命令下到后，经过 tWL 个时钟周期后，送出第一个写数据。在 Burst8 后完成写传输"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/DDR 学习时间 (Part Z - 1)：芯片设计中的 DDR 模型杂谈.md) [[../../raw/tech/dram/DDR 学习时间 (Part Z - 1)：芯片设计中的 DDR 模型杂谈.md|原始文章]]
