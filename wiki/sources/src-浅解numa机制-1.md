---
doc_id: src-浅解numa机制-1
title: 浅解NUMA机制 1
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/浅解NUMA机制 1.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

公园野鸭 等 257 人赞同了该文章 本文适合知道NUMA这个词但想进一步了解的新手。 以下的文章内容包括：NUMA的产生背景，NUMA的架构细节和几个上机演示的例子。

## Key Points

### 1. 导读
本文适合知道NUMA这个词但想进一步了解的新手。 以下的文章内容包括：NUMA的产生背景，NUMA的架构细节和几个上机演示的例子。

### 2. NUMA的诞生背景
在NUMA出现之前，CPU朝着高频率的方向发展遇到了天花板，转而向着多核心的方向发展。 在一开始，内存控制器还在北桥中，所有CPU对内存的访问都要通过北桥来完成。此时所有CPU访问内存都是“一致的”，如下图所示：

### 3. NUMA构架细节
NUMA 全称 Non-Uniform Memory Access，译为“非一致性内存访问”。这种构架下，不同的内存器件和CPU核心从属不同的 Node，每个 Node 都有自己的集成内存控制器（ [IMC](https://zhida.zhihu.com/search?content_id=103142048&content_type=Article&match_order=1&q=IMC&zh

### 4. 上机演示
**NUMA Node 分配** ![](https://pic2.zhimg.com/v2-a327d4e9ddb950f2ee60c40b94fc70ff_1440w.jpg) 作者使用的机器中，有两个 NUMA Node，每个节点管理16GB内存。

## Evidence

- Source: [原始文章](raw/tech/dram/浅解NUMA机制 1.md) [[../../raw/tech/dram/浅解NUMA机制 1.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/浅解NUMA机制 1.md) [[../../raw/tech/dram/浅解NUMA机制 1.md|原始文章]]
