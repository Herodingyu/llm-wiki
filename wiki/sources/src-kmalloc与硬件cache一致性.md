---
doc_id: src-kmalloc与硬件cache一致性
title: kmalloc与硬件cache一致性
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/kmalloc与硬件cache一致性.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

公园野鸭 等 67 人赞同了该文章 目录 看代码时发现下面一句宏定义和注释很有意思，简单翻译一下：“ [kmalloc](https://zhida.zhihu.com/search?content_id=257332367&content_type=Article&match_order=1&q=kmalloc&zhida_source=entity) () 返回的内存可用于直接内存访问（ [DMA](https://zhida.zhihu.com/search?content_id=257332367&content_type=Article&match_order=1&q=DMA&zhi

## Key Points

### 1. 前言
看代码时发现下面一句宏定义和注释很有意思，简单翻译一下：“ [kmalloc](https://zhida.zhihu.com/search?content_id=257332367&content_type=Article&match_order=1&q=kmalloc&zhida_source=entity) () 返回的内存可用于直接内存访问（ [DMA](https://zhida.zhi

### 2. DMA写入MEM的cache一致性
1\. CPU读取MEM中的数据，同时将数据缓存到CPU的cache中 ![](https://pic1.zhimg.com/v2-c6c7ba55a7e4e3389c3d797e85033da4_1440w.jpg)

### 3. DMA读取MEM的cache一致性
1\. CPU修改MEM中的数据时，只会将local CPU cache内容修改，MEM中的仍会保留老的数据 ![](https://pic3.zhimg.com/v2-3d9781428d29d32d62057b2b1a711fde_1440w.jpg)

### 4. 现有软件同步机制
这里我列举一下DMA操作的主要同步api ![](https://pic4.zhimg.com/v2-2052b029db53ce07156e4f66497b3f61_1440w.jpg) 从前面的例子，我们做个总结，当需要对DMA和CPU访问做同步时，需要对cache做合理的invalid或者clean操作，当然现有的DMA回调函数便提供这个同步API。

### 5. kmalloc为什么要cache line对齐
kmalloc需要考虑cacheline，最直接的原因是，kmalloc分配的内存可能用于DMA操作。 1\. 当A和B两个变量共享一个cache line时，且此时DMA正在改写B变量 ![](https://pica.zhimg.com/v2-b83e5c2215fe58c47d18f76deeac4186_1440w.jpg)

## Key Quotes

- "kmalloc() 返回的内存可用于直接内存访问（DMA），这意味着需要考虑硬件cache一致性问题。"
- "当需要对DMA和CPU访问做同步时，需要对cache做合理的invalid或者clean操作，现有的DMA回调函数提供这个同步API。"
- "kmalloc需要考虑cacheline对齐，最直接的原因是分配的内存可能用于DMA操作，避免变量共享cache line时DMA改写导致的数据不一致。"

## Evidence

- Source: [原始文章](raw/tech/soc-pm/kmalloc与硬件cache一致性.md) [[../../raw/tech/soc-pm/kmalloc与硬件cache一致性.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/kmalloc与硬件cache一致性.md) [[../../raw/tech/soc-pm/kmalloc与硬件cache一致性.md|原始文章]]
