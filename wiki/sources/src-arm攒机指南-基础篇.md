---
doc_id: src-arm攒机指南-基础篇
title: ARM攒机指南 基础篇
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-基础篇.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · ARM攒机指南](https://www.zhihu.com/column/c_70349842) 在开篇里，我们对芯片PPA有了初步的认识。下面，让我们从访存这个简单的问题开始展开介绍芯片基础概念。 CPU是怎样访问内存的？简单的答案是，CPU执行一条访存指令，把读写请求发往 [内存管理单元](https://zhida.zhihu.com/search?content_id=5135517&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E7%AE%A1%E7%90%86%E5%8D%95%E5%85%83&zh

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-基础篇.md) [[../../raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-基础篇.md|原始文章]]

## Key Quotes

> "过程并不复杂，但程序员关心的是这个过程的瓶颈在哪，对读写性能影响如何。我们已经解释过，对于写，由于它可以立刻完成，所以它的瓶颈并不来自于存取单元；对于读，由于处理器会等待，所以我们需要找到读取路径每一步能发出多少OT，每个OT的数据长度是多少"

> "我们有时候也可以利用Non-Cacheable的读通道，和Cacheable的读操作并行，提高效率。它的原理就是同时利用linefill buffer和read buffer。此时必须保证处理器有足够的OT，不停顿"

> "总而言之，访存的软件优化的原则就是，保持对齐，找出更多可利用的OT，访存和预取混用，保持更连续的访问地址，缩短每一环节的延迟"

> "所以，即使是在3.2Gbps的DDR4上，大部分时间还都是在内存，显然优化可以从它上面入手。在处理器中的时间只有一小部分。但从另外一个方面，处理器控制着linefill，eviction的次数，地址的连续性，以及预取的效率，虽然它自己所占时间最少，但也是优化的重点"

> "还有，在ARM新的面向网络和服务器的核心上，会出现一核两线程的设计。处理包的任务天然适合多线程，而一核两线程可以更有效的利用硬件资源，再加上stashing，如虎添翼"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-基础篇.md) [[../../raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-基础篇.md|原始文章]]
