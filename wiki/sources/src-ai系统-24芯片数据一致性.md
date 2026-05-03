---
doc_id: src-ai系统-24芯片数据一致性
title: AI系统 24芯片数据一致性
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-24芯片数据一致性.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 4 人赞同了该文章 ![](https://pic3.zhimg.com/v2-963f006ea48dfa5d02c395783ae2310e_1440w.jpg)

## Key Points

### 1. 1\. 多核cache一致性
![](https://pic4.zhimg.com/v2-9e6d9f13708afa9a0272bffbcbeff435_1440w.jpg) 提高CPU的 **运算能力** ，一方面 **提高CPU的频率** ，另一方面对运算过程中的瓶颈：DDR跟CPU的数据 **交换耗时进行优化** 。这时就需要在CPU和DDR之间添加 **cache** ，减少CPU的 **盲等时间** 。

### 2. 1.1 为什么cache不一致
> 为什么cache不一致？ > 数据不光是只有读操作，还有写操作，那么如果数据写入 Cache 之后，内存与 Cache 相对应的数据将会不同，这种情况下 Cache 和内存数据都不一致了，于是我们肯定是要把 Cache 中的数据同步到内存里的。

### 3. 1.2 怎么解决多核Cache不一致
要解决这一问题，就需要一种 **机制** ，来 **同步两个不同核心里面的缓存数据** 。要实现的这个机制的话，要保证做到下面这 2 点： 1. 某个 CPU 核心里的 Cache 数据更新时，必须要传播到其他核心的 Cache，这个称为 **写传播** ；

### 4. 1.3 CHI协议
一致性总线通过 **snoop filter来记录各个cache中的cache line状态** ，在总线的视角中，cache中每个cache line的状态都在掌握之中。而常用的cache一致性协议包含两种： **MESI和MOESI** 。

### 5. 1.4 DSU
![](https://pic2.zhimg.com/v2-06ca6e14af48c95caccb01b2d9089e8d_1440w.jpg) 首先介绍部分核之间按簇进行cache一致性的IP：DSU，同时起提供按簇的L3 cache，之前的文章 [AI系统-23AI芯片CPU子系统介绍](https://link.zhihu.com/?target=https%3A//mp.weixin.q

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-24芯片数据一致性.md) [[../../raw/tech/soc-pm/AI系统/AI系统-24芯片数据一致性.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-24芯片数据一致性.md) [[../../raw/tech/soc-pm/AI系统/AI系统-24芯片数据一致性.md|原始文章]]
