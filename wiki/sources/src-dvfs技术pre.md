---
doc_id: src-dvfs技术pre
title: DVFS技术pre
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/DVFS技术pre.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · 半导学社](https://www.zhihu.com/column/stephen) 75 人赞同了该文章 这回讲的DVFS（动态电压频率调整）技术，相比于普通的 [clk gating](https://zhida.zhihu.com/search?content_id=368010&content_type=Article&match_order=1&q=clk+gating&zhida_source=entity) ， [power gating](https://zhida.zhihu.com/search?content_id=368010&content_type=

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/DVFS技术pre.md) [[../../raw/tech/soc-pm/DVFS技术pre.md|原始文章]]

## Key Quotes

> "我们知道任务这个东西，所需要执行的指令是一定的。降频可以让任务变慢，单位时间消耗的功率降低，但是任务的执行时间却延长了。频率降低一半，动态功率可以降低一半，任务时间却成了两倍，所以真实的功耗并不会减少。如果考虑到静态功耗，其实总功耗是增加的。所以说单纯降频是没有用的"

> "关键点在于频率和电压是相关的。降频之后，紧接着就可以降压。频率一降，电路的时序就会宽松很多，就可以降压，充分利用时序裕量。电压跟动态功耗是二次方关系，与静态功耗是一次方关系，所以一降压立刻可以大大减小功耗"

> "所以，DVFS技术必须是电压和频率联调，只调电压不行，只调频率也不行。调频率只是预备步骤，真正省电是因为调了电压"

> "不过要注意，进出省电模式操作顺序是不一样的：进入省电模式，需要先调低频率，然后降低电压。恢复到正常模式，需要先提高电压，然后提高频率。想一想为什么"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/DVFS技术pre.md) [[../../raw/tech/soc-pm/DVFS技术pre.md|原始文章]]
