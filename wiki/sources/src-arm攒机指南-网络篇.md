---
doc_id: src-arm攒机指南-网络篇
title: ARM攒机指南 网络篇
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-网络篇.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · ARM攒机指南](https://www.zhihu.com/column/c_70349842) 181 人赞同了该文章 这一篇谈下 [网络处理器](https://zhida.zhihu.com/search?content_id=5826195&content_type=Article&match_order=1&q=%E7%BD%91%E7%BB%9C%E5%A4%84%E7%90%86%E5%99%A8&zhida_source=entity) 。

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-网络篇.md) [[../../raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-网络篇.md|原始文章]]

## Key Quotes

> "曾几何时，网络处理器是高性能的代名词。为数众多的核心，强大的转发能力，定制的总线拓扑，专用的的指令和微结构，许多优秀设计思想沿用至今"

> "第三， 在电信端，吞吐量远大于1Tbps，此时需要核心路由器，由专用芯片做转发"

> "在网络芯片上，有两个重要的基本指标，那就是接口线速和转发能力。前者代表了接口能做到的数据吞吐量上限，后者代表了处理网络包的能力"

> "以太网控制器写入DDR的延迟。假设是最小包，64字节的话，延迟x1。如果是大包，可能存在并发。但是和第一步中CPU对寄存器的写入存在依赖关系，所以不会小于延迟x1。假定为100ns"

> "CPU从DDR读入数据的延迟。如果只需包头，那就是64字节，通常和缓存行同样大小，延迟x1。假定为100ns"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-网络篇.md) [[../../raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-网络篇.md|原始文章]]
