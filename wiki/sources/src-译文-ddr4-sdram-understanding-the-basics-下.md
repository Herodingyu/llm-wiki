---
doc_id: src-译文-ddr4-sdram-understanding-the-basics-下
title: 译文： DDR4 SDRAM   Understanding the Basics（下）
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/译文： DDR4 SDRAM - Understanding the Basics（下）.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · OpenIC 特别兴趣小组](https://www.zhihu.com/column/c_1029044037684183040) 112 人赞同了该文章 > 一文了解 [DDR4](https://zhida.zhihu.com/search?content_id=146593061&content_type=Article&match_order=1&q=DDR4&zhida_source=entity) 的基础知识。

## Key Points

### 1. 存储访问 Accessing Memory
- DDR4 的读写访问都基于 [Burst](https://zhida.zhihu.com/search?content_id=146593061&content_type=Article&match_order=1&q=Burst&zhida_source=entity) 形式（译注：Burst 一般译作突发传输或者猝发传输）。突发传输起始时，由用户指定传输的起始地址，以及本次传输的长度，在

### 2. 命令真值表 Command Truth Table
至今为止，我们一直在使用 ”命令“ （Command）这一说法，激活命令，读写命令等等。但在本文开始的时候，我们并没有提到 DRAM 有"命令" IO，那么这些命令都是如何通过 IO 发送给 DRAM 的呢？

### 3. 读命令 Read
![](https://picx.zhimg.com/v2-bbea2c6372c5c946315bf0e2b01e4e3f_1440w.jpg) 图-8 读命令操作 上图是读命令的时序图，此时突发传输长度为 8，称为 BL8。

### 4. 写命令 Write
![](https://pic3.zhimg.com/v2-630cf0bb1d587e9c7ada9ccb99a2f3ae_1440w.png) 图-9 写命令操作 上图是写命令的时序图。 - 第一步是发出 ACT 命令激活 ROW 行

### 5. DRAM 子系统 DRAM sub-system
在前面的章节中，我们已经讨论了很多关于 DRAM 本身的内容，在本节中，我们将讨论 ASIC 或者 FPGA 与 DRAM 通信时所需的系统组件，由 3 部分组成： - DRAM - DDR PHY - DDR Controller（译注：一般简称为 [MC](https://zhida.zhihu.com/search?content_id=146593061&content_type=Arti

## Evidence

- Source: [原始文章](raw/tech/dram/译文： DDR4 SDRAM - Understanding the Basics（下）.md) [[../../raw/tech/dram/译文： DDR4 SDRAM - Understanding the Basics（下）.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/译文： DDR4 SDRAM - Understanding the Basics（下）.md) [[../../raw/tech/dram/译文： DDR4 SDRAM - Understanding the Basics（下）.md|原始文章]]
