---
doc_id: src-内存系统-cache-dram和disk-概述
title: 内存系统：cache、DRAM和disk   概述
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/内存系统：cache、DRAM和disk---概述.md
domain: tech/dram
created: 2026-05-04
updated: 2026-05-04
tags: [dram]
---

## Summary

概述" source: "https://mp.weixin.qq.com/s/KHG4hbMQRp2v4pv_UZ5x3A" author:

## Key Points

### 1. 摘要
一个良好实现的层次可以同时实现最快组件的性能、最便宜组件的成本以及最高效组件的能效。这些年，内存层次的设计已经变得很方便并有些固化，进而允许进行模块化设计，比如从上到下分别是Cache、Dram和Disk。然而，这种简单的通过一个定义好的接口来将各层存储结构作为独立的子系统来孤立的进行优化，这对于现代存储系统设计来说是不够的。其具体的一些实现相关问题已经变得越来越明显，比如：信号协议和拓扑的选择、

### 2. 1\. 内存系统
RAM(random-access memory)是图灵机和当年软件系统的基础，所有的处理器都需要可以读取任意地址上的内容。 功能基础上，处理器对存储也提出了一些需求： - 快速，需要匹配上处理器的计算速度；

### 3. 1.1 引用的局部性产生了内存层次
人类的思维方式是线性的，所以在编程时，也倾向于一步一步的执行任务。表现出来的结果就是：计算机对内存系统的使用是高度可预测而不是随机的进而产生了时间局部性和空间局部性： - 如果你使用了某个数据，那么会倾向于再次使用；

### 4. 1.2 重要的特性指标
本节正式提出一些提出一些对存储系统设计工程师非常重要的指标。根据存储系统的使用环境（超算、服务器、笔记本电脑等），不同指标的重要性可能有所不同。 **性能** 衡量性能的指标如下： - $平均访问时间=(hit率 *hit访问时间)+(miss率* miss访问时间)$

### 5. 1.3 内存层次的目标
内存系统的设计与目标应用程序息息相关，主要包括两类： - 通用系统，特点是需要对所有类型的计算具有普遍适用性； - 嵌入式系统，在特定方向如成本、功耗或可靠性方面有着严格限制。 - 当下，应该还需要增加一项：专用处理器的设计特别是AI应用。

## Evidence

- Source: [原始文章](raw/tech/dram/内存系统：cache、DRAM和disk---概述.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/内存系统：cache、DRAM和disk---概述.md)
