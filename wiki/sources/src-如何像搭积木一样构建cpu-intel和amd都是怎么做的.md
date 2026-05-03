---
doc_id: src-如何像搭积木一样构建cpu-intel和amd都是怎么做的
title: 如何像搭积木一样构建CPU？Intel和AMD都是怎么做的？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/如何像搭积木一样构建CPU？Intel和AMD都是怎么做的？.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) sazc、一刀 等 875 人赞同了该文章 当年Intel推出第一款双核CPU的时候，AMD曾经嘲笑它是个胶水双核。然而时至今日， [MCM](https://zhida.zhihu.com/search?content_id=8788134&content_type=Article&match_order=1&q=MCM&zhida_source=entity) （Multi-Chip-Module）概念洗去风尘，变得妖娆多姿起来，相对来说大核（ [monolithic di

## Key Points

### 1. 为什么要转向MCM？
当我们掀起CPU上面那个金属盖头，一个小小的独立世界就展现了出来。 ![](https://pic1.zhimg.com/v2-2f217d591295c0e0e713cb8c40bb2bba_1440w.jpg)

### 2. 如何在Package内搭建异构部件
我们已经在市场上见到不少MCM的CPU，包括AMD的Threadripper和 [EPYC](https://zhida.zhihu.com/search?content_id=8788134&content_type=Article&match_order=1&q=EPYC&zhida_source=entity) 、Intel的 [Kaby Lake G](https://zhida.zhih

### 3. 结语
EMIB技术可以完全解耦Package中各个Die的依赖关系，10nm, 14nm甚至22nm完全可以共存到一个pacakge里面 ![](https://pic3.zhimg.com/v2-f73a92341e180b7cacf97b2da64f1eb6_1440w.jpg)

### 4. 参考资料：
\[1\]: [Intel Custom Foundry EMIB](https://link.zhihu.com/?target=https%3A//www.intel.com/content/www/us/en/foundry/emib.html)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/如何像搭积木一样构建CPU？Intel和AMD都是怎么做的？.md) [[../../raw/tech/soc-pm/如何像搭积木一样构建CPU？Intel和AMD都是怎么做的？.md|原始文章]]

## Key Quotes

> "3\. 通过EMIB（Embedded Multi-die Interconnect Bridge）"

> "这些缺点在核战争愈演愈烈的今天，严重限制了CPU内核的增长。于是在CPU Package内部引入MCM很自然的被提上了日程"

> "interposer增加额外的成本，尤其是interposer必须很大，如图那样，面积包含所有的Die，大大增加成本"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/如何像搭积木一样构建CPU？Intel和AMD都是怎么做的？.md) [[../../raw/tech/soc-pm/如何像搭积木一样构建CPU？Intel和AMD都是怎么做的？.md|原始文章]]
