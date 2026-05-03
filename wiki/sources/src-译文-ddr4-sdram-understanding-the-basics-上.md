---
doc_id: src-译文-ddr4-sdram-understanding-the-basics-上
title: 译文： DDR4 SDRAM   Understanding the Basics（上）
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/译文： DDR4 SDRAM - Understanding the Basics（上）.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · OpenIC 特别兴趣小组](https://www.zhihu.com/column/c_1029044037684183040) 不坠青云之志 等 261 人赞同了该文章 > 一文了解 DDR4 的基础知识。

## Key Points

### 1. 引言 Introduction
如今，DDR4 SDRAM 是基于 [FPGA](https://zhida.zhihu.com/search?content_id=146364341&content_type=Article&match_order=1&q=FPGA&zhida_source=entity) 或者 [ASIC](https://zhida.zhihu.com/search?content_id=14636434

### 2. 物理结构 Physical Structure
从 DRAM 必要的 IO 管脚及其功能来开始本文是个不错的主意。本章我们将从 DRAM 外部的 IO 开始，一直向底层讨论到 DRAM 内部的基础电路单元。

### 3. 顶层 Top Level
正如你预期的那样，DRAM 拥有时钟、复位、片选、地址以及数据输入。下文中的表格有关于各个引脚更详细的信息。表格中并没有列出所有的 IO，只列出了其中基础的部分。读者可以花一些时间来了解各个 IO 的功能，尤其是那些拥有复用功能的地址信号。

### 4. BankGroup，Bank，Row，Column
上节中的 DRAM 顶层结构展示了提供给外部的 IO 管脚。而下图则展示了 DRAM 内部的构造，以 bank 以及 bankgroup 为单元组织起来。 ![](https://picx.zhimg.com/v2-99190bdd68184baea68d7598db10ae8f_1440w.jpg)

### 5. DRAM 容量与地址 DRAM Sizing & Addressing
DRAM 采用标准容量，由 [JEDEC 标准](https://zhida.zhihu.com/search?content_id=146364341&content_type=Article&match_order=1&q=JEDEC+%E6%A0%87%E5%87%86&zhida_source=entity) 制定。JEDEC 是决定 DDR 设计与发展路线的标准委员会。下文的内容来自 J

## Evidence

- Source: [原始文章](raw/tech/dram/译文： DDR4 SDRAM - Understanding the Basics（上）.md) [[../../raw/tech/dram/译文： DDR4 SDRAM - Understanding the Basics（上）.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/译文： DDR4 SDRAM - Understanding the Basics（上）.md) [[../../raw/tech/dram/译文： DDR4 SDRAM - Understanding the Basics（上）.md|原始文章]]
