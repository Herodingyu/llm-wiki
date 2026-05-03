---
doc_id: src-soc-101-六-memory
title: SoC 101（六）：Memory
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/SoC 101（六）：Memory.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · SoC101](https://www.zhihu.com/column/c_1746233246805774337) 目录 本篇文章将给大家带来Memory相关的内容。我之前的文章写了很多Memory相关的内容，包括 [Cache](https://zhida.zhihu.com/search?content_id=240434334&content_type=Article&match_order=1&q=Cache&zhida_source=entity) 、虚拟内存等。感兴趣的可以去看我之前的文章，本篇文章就当是我自己复习这一部分内容了。

## Key Points

### 1. 1、Introduction to the memory hierarchy
首先我们来看一下存储器的层次结构。即使不是芯片工程师或者计算机相关的技术人员，应该也知道内存和硬盘。内存容量通常比较小，硬盘容量比较大。为什么要这么设计呢？就不能用一种很大的吗？答案就是不能，大的存储器是为了尽可能存储更多的内容，而小的存储器相对较快，能够提升用户的体验。对于存储器而言，大和快是矛盾的。通过合理的层次划分，来营造一种又大又快的存储器假象。

### 2. 2、Cache Organization
我们知道了为什么要有Cache，接下来我们看一下Cache的结构。 ![](https://pic2.zhimg.com/v2-74f4d7d268be6251b328fc56936997ff_1440w.jpg)

### 3. 3、Tradeoffs in Cache Design
我们来看一下，Cache什么时候会发生缺失。 [3C定律](https://zhida.zhihu.com/search?content_id=240434334&content_type=Article&match_order=1&q=3C%E5%AE%9A%E5%BE%8B&zhida_source=entity) 由计算机体系结构大牛Mark D. Hill提出。首先是Compulsory缺

### 4. 4、Virtual Memory
这一部分可以看我之前写过的虚拟内存文章。此处就当巩固复习了。 在传统的处理器中，我们只有物理地址。什么是物理地址呢？就是真真实实分配的地址。具有绝对性，唯一性。其映射到存储器的哪一个点。这就引出了一个问题，什么问题呢？

### 5. 5、Practical Paging
上面讨论的都是一两个进程，实际上大家可以打开任务管理器，看一下电脑有多少个进程正在执行。我们之前就知道，不同的进程使用的是不同的页表。我们先来看一下一个页表有多大。 页表存放的是地址映射关系，一页的大小本身是4KB，如果需要覆盖4GB的内存，那么理论上就需要1M的表项数量，一个表项即Entry是4B，因此总共需要4MB。是不是听上去还行？但实际上，你的电脑大概率是几百个进程同时在运行，这样就需要几

## Evidence

- Source: [原始文章](raw/tech/soc-pm/SoC 101（六）：Memory.md) [[../../raw/tech/soc-pm/SoC 101（六）：Memory.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/SoC 101（六）：Memory.md) [[../../raw/tech/soc-pm/SoC 101（六）：Memory.md|原始文章]]
