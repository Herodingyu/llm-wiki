---
doc_id: src-译文-ddr4-sdram-understanding-timing-parameters
title: 译文：DDR4 SDRAM   Understanding Timing Parameters
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/译文：DDR4 SDRAM - Understanding Timing Parameters.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · OpenIC 特别兴趣小组](https://www.zhihu.com/column/c_1029044037684183040) 99 人赞同了该文章 > 一文了解 [DDR4](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=DDR4&zhida_source=entity) 的基础知识。

## Key Points

### 1. 引言 Introduction
在 DDR 标准中有很多很多时序参数（timing parameter），但当你真的和 DDR4 打交道时，会发现经常访问或者读到的参数也就那么几个，它们相比剩下的参数要常用许多。所以，本文将基于具体的 DDR 命令，讨论那些经常用到的参数。

### 2. 激活命令 ACTIVATE Timing
激活命令用于在访问之前打开某个 bank 中的某个 row。在 [Understanding the Basics](https://link.zhihu.com/?target=https%3A//www.systemverilog.io/ddr4-basics.html) ([译文](https://zhuanlan.zhihu.com/p/262052220))一文中我们了解到每个 bank

### 3. 刷新命令 REFRESH Timing
为了确保存储在 SDRAM 中的数据不会丢失，存储控制器需要平均间隔 **[tREFI](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=tREFI&zhida_source=entity)** ，发送一次 REFRESH 命令。 但是在进行刷新之前，SDRAM 所有的

### 4. 读命令 READ Timing
读命令相关的时序参数可以分为三类 - 通用读时序 **Read Timing** - 时钟-数据有效信号（Strobe）间的时序关系 **Clock to Data Strobe relationship**

### 5. Read Timing
- **[CL](https://zhida.zhihu.com/search?content_id=147763714&content_type=Article&match_order=1&q=CL&zhida_source=entity)** （CAS latency）

## Evidence

- Source: [原始文章](raw/tech/dram/译文：DDR4 SDRAM - Understanding Timing Parameters.md) [[../../raw/tech/dram/译文：DDR4 SDRAM - Understanding Timing Parameters.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/译文：DDR4 SDRAM - Understanding Timing Parameters.md) [[../../raw/tech/dram/译文：DDR4 SDRAM - Understanding Timing Parameters.md|原始文章]]
