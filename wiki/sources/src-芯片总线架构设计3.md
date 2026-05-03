---
doc_id: src-芯片总线架构设计3
title: 芯片总线架构设计3
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/芯片总线架构设计3.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · 芯片架构设计](https://www.zhihu.com/column/c_1877951126294372352) 164 人赞同了该文章 2025年一眨眼就过去了，在这忙碌又清闲的一年里又做了一个芯片的 [SOC架构设计](https://zhida.zhihu.com/search?content_id=269927412&content_type=Article&match_order=1&q=SOC%E6%9E%B6%E6%9E%84%E8%AE%BE%E8%AE%A1&zhida_source=entity) ，年终的时候汇总成了一句话，万事开头难。如果把承载业务的

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/芯片总线架构设计3.md) [[../../raw/tech/soc-pm/芯片总线架构设计3.md|原始文章]]

## Key Quotes

> "CPU里是CPU核）比作头脑的话，SOC大体上就是躯体，而总线则是躯体里的血管。血管既要匹配来自心脏的澎湃动力，又要根据躯干的需求把血液按时保量的传输到需要的部位"

> "一颗芯片（特别是算力芯片）的设计可以分成计算、传输、存储、SOC这四个scope，芯片总线的设计大体上也可以分成拓扑、性能、实现、监控这四个方向，把这四个方向都考虑清楚了，芯片的总线架构也就水到渠成了"

> "除了传统的物理可实现性外，工具可实现性也成为工程上需要考虑的问题，在项目中也碰到过总线太大工具点不动的情况，碰到这种场景也是醉了"

> "对于一个完整的总线设计，可观测性是需要认真考虑的，否则回片后的性能调优无从下手。除此之外，总线挂死是在调试中经常碰到的问题，如何在挂死的时候尽可能多的看到现场并且从挂死的状态下采用尽可能小的代价恢复，也是需要好好设计的（当然很多时候在真实业务下未必能用上）"

> "---

最后写点最近的一些经验和教训，做项目也好多年了，最近发现也能经常碰到新问题，有些是以前没关注到的，有些是和合作伙伴的认知不match"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/芯片总线架构设计3.md) [[../../raw/tech/soc-pm/芯片总线架构设计3.md|原始文章]]
