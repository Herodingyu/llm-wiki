---
doc_id: src-聊聊linux的dma机制
title: 聊聊Linux的DMA机制
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/聊聊Linux的DMA机制.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

## Summary

[收录于 · 内存管理](https://www.zhihu.com/column/c_1515722871497977856) 公园野鸭 等 232 人赞同了该文章 有过系统编程经历的同学，可能对 [DMA](https://zhida.zhihu.com/search?content_id=250611338&content_type=Article&match_order=1&q=DMA&zhida_source=entity) 都有一定的了解，如对于一些需要大量数据传输的外设，一般都支持通过DMA方式访问内存。它的引入主要是为了提高系统的整体性能和运行效率

## Key Points

### 1. 1 前言
有过系统编程经历的同学，可能对 [DMA](https://zhida.zhihu.com/search?content_id=250611338&content_type=Article&match_order=1&q=DMA&zhida_source=entity) 都有一定的了解，如对于一些需要大量数据传输的外设，一般都支持通过DMA方式访问内存。它的引入主要是为了提高系统的整体性能和运行效

### 2. 2 DMA的使用限制
DMA在带来效率提升的同时，也给软件编码提出了更多的要求，若系统编程人员不能正确地执行操作流程，则很可能会造成DMA操作失败，或数据与预期结果不符等问题。本节我们将重点看一下其所带来的问题，以及相应的解决方案

### 3. 3 Linux对DMA的支持
由以上分析可知，虽然设备在执行DMA操作时可能会有各种限制，但这些限制主要都与内存地址和cache一致性相关。故只要软件正确处理了DMA地址映射和cache一致性问题，就可以保证DMA操作的正确性 Linux的DMA接口即是以该原则设计的，为了使用方便，Linux一共实现了两类DMA API接口。它们分别为一致性映射DMA接口和流式映射DMA接口，以下为其基本特点：

### 4. 3.1 一致性DMA接口的流程
一致性DMA主要包括内存分配和内存释放接口，其接口定义如下： ``` inline void *dma_alloc_coherent(struct device *dev, size_t size, dma_addr_t *dma_handle, gfp_t gfp)

### 5. 3.2 流式DMA接口的流程
与一致性映射接口不同，流式DMA映射接口不会分配内存，而是将输入参数中传入的内存映射为DMA地址。由于在CPU视角下，它也可能被映射成了cache类型的内存，故其对应的cache中可能含有dirty数据。为了确保DMA和CPU都能获取到正确的数据，则在DMA操作流程中，软件需要维护cache与主存数据的一致性。因此它包括以下两类接口：

## Evidence

- Source: [原始文章](raw/tech/peripheral/聊聊Linux的DMA机制.md) [[../../raw/tech/peripheral/聊聊Linux的DMA机制.md|原始文章]]

## Key Quotes

> "有过系统编程经历的同学，可能对DMA都有一定的了解，如对于一些需要大量数据传输的外设，一般都支持通过DMA方式访问内存。它的引入主要是为了提高系统的整体性能和运行效率。"

> "DMA则正好可以解决以上问题，如对于支持DMA的外设，CPU就不需要亲力亲为地为其拷贝数据，而只需为它设置好DMA传输相关的参数即可。"

> "由以上分析可知，虽然设备在执行DMA操作时可能会有各种限制，但这些限制主要都与内存地址和cache一致性相关。故只要软件正确处理了DMA地址映射和cache一致性问题，就可以保证DMA操作的正确性。"

> "Linux的DMA接口即是以该原则设计的，为了使用方便，Linux一共实现了两类DMA API接口。它们分别为一致性映射DMA接口和流式映射DMA接口。"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/聊聊Linux的DMA机制.md) [[../../raw/tech/peripheral/聊聊Linux的DMA机制.md|原始文章]]
