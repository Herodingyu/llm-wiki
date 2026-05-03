---
doc_id: src-搞ddr必懂的关键技术笔记-深入探究ddr物理结构
title: 搞DDR必懂的关键技术笔记：深入探究DDR物理结构
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/搞DDR必懂的关键技术笔记：深入探究DDR物理结构.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · SoC知识百宝箱](https://www.zhihu.com/column/c_1892355985563169100) 航海家 DBinary 等 338 人赞同 这篇文章的目的就是来看看芯片的物理结构，拿LPDDR5举例。

## Key Points

### 1. 引言
这篇文章的目的就是来看看芯片的物理结构，拿LPDDR5举例。 通过逐步深入探讨LPDDR5内存的 **物理结构** ，到文章结束时，您将清晰了解与LPDDR5内存相关的关键术语，包括： - LPDDR5 IOs：命令总线（CA）、数据总线（DQ/DQS）、芯片选择（CS）、时钟（CK）

### 2. LPDDR5内存芯片


### 3. 单个存储单元
![](https://pic1.zhimg.com/v2-a4c127902462d846b2d3a30512c25fb6_1440w.jpg) 在最底层，一个位本质上是一个电容器，用于存储电荷，而晶体管则作为开关。由于电容器会随时间放电，信息最终会消失，除非电容器被定期“刷新”。

### 4. Bank, Rows and Columns
![](https://pic3.zhimg.com/v2-abc8954059de50094f2a7dbae6dee5ec_1440w.jpg) 当你放大一级视图时，你会注意到存储单元被排列成行和列的网格状。

### 5. LPDDR5 Bank架构
![](https://pic4.zhimg.com/v2-687e9800458c5c0170bfae83608dc587_1440w.jpg) 再放大一级视图，每个LPDDR5芯片都有32个这样的Bank块。这32个块可以以3种不同的配置进行排列。

## Evidence

- Source: [原始文章](raw/tech/dram/搞DDR必懂的关键技术笔记：深入探究DDR物理结构.md) [[../../raw/tech/dram/搞DDR必懂的关键技术笔记：深入探究DDR物理结构.md|原始文章]]

## Key Quotes

> "这样的存储单元网格被称为一个Bank"

> "Bank模式的选择是在初始化期间通过在模式寄存器MR3中设置一个参数来完成的"

> "页大小是指当一行被激活时，加载到感测放大器中的位数。"

> "两行会同时被激活以总共获取256位的数据"

> "两行被激活，所以总页大小为2x1KB = 2KB。"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/搞DDR必懂的关键技术笔记：深入探究DDR物理结构.md) [[../../raw/tech/dram/搞DDR必懂的关键技术笔记：深入探究DDR物理结构.md|原始文章]]
