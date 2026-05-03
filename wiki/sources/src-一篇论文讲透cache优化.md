---
doc_id: src-一篇论文讲透cache优化
title: 一篇论文讲透Cache优化
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/一篇论文讲透Cache优化.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · IT](https://www.zhihu.com/column/c_1705318239930867712) 没有提供感情机器 等 1750 人赞同了该文章 《What Every Programmer Should Know About Memory》是Ulrich Drepper大佬的一篇神作，洋洋洒洒100多页，基本上涵盖了当时（2007年）关于访存原理和优化的所有问题。即使今天的CPU又有了进一步的发展，但是依然没有跳出这篇文章的探讨范围。只要是讨论访存优化的文章，基本上都会引用这篇论文。

## Key Points

### 1. 一 原理


### 2. 1.1 Cache架构
![](https://pica.zhimg.com/v2-db76f92d9a8a56c74d1f64ef1f90e764_1440w.jpg) ![](https://pic2.zhimg.com/v2-9771fed8a54f17697f91b4dc9f7ad713_1440w.jpg)

### 3. 1.2 Cache速度差距
![](https://pic3.zhimg.com/v2-9bcc7186a94080ca9d1c5a0048896128_1440w.jpg) ![](https://picx.zhimg.com/v2-f7ea4e112e0d45b5ca88ac11d41ff1eb_1440w.jpg)

### 4. 1.3 Cache实现细节


### 5. 1.3.1 Cache的Key
![](https://pic3.zhimg.com/v2-f5873c14a04bd7bb4cfc372884970b8c_1440w.jpg) - T和S一起，唯一标识一个CacheLine，将Cache的组织想象成一个二维数组，通过两个角标T和S定位

## Evidence

- Source: [原始文章](raw/tech/dram/一篇论文讲透Cache优化.md) [[../../raw/tech/dram/一篇论文讲透Cache优化.md|原始文章]]

## Key Quotes

> "- 当NPAD>7时类似

一方面，因为每次预取通常只是减少MemoryStall，无法完全消除，平均每次访问所需要的预取次数越多，耗时越多。另一方面，更多的预取也可能占用更多的内存带宽，降低速率"

> "- 超出L2后需要访问内存，4条线的差异很大，主要有三个原因：
- Prefetch无法完全消除Memory Stall。被访问的数据虽然被预取，但是在访问时还没有完全加载到Cache中。这个原因可以解释NPAD >= 7的3条线高于NPAD=0，但是无法解释NPAD7，15，31的差异"

> "- PageBoundaries的影响。一个物理页通常是4KB，在物理页边界时无法预取，因为PageFault需要操作系统来调度，CPU做不了。当NPAD越大，达到PageBoundaries所需要的元素个数越少，每次PageBoundaries开销均摊下来也就越大"

> "- 也就是说，同样是64B的WorkingSize，OnCacheLine消耗真实内存64B，OnPage消耗真实内存是4K
	- 为啥做这么奇怪的规定？因为数组元素的大小只是决定顺序访问的Stride，每次访问的只有第一个指针，只访问一个CacheLine"

> "- 虽然Stride是一个Page，但是每次只是访问一个CacheLine，为什么Cache没有生效？L2的key是物理地址，需要先经过TLB的转换，所以失效。L1通常是依照逻辑地址，但是载入L1之前需要先载入到L2，所以也受TLB限制"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/一篇论文讲透Cache优化.md) [[../../raw/tech/dram/一篇论文讲透Cache优化.md|原始文章]]
