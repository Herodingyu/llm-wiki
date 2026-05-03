---
doc_id: src-如何设计具有强大debug能力的ic系统
title: 如何设计具有强大debug能力的IC系统
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/如何设计具有强大debug能力的IC系统.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · 半导学社](https://www.zhihu.com/column/stephen) 116 人赞同了该文章 很多搞IC的盆友把注意力放在写代码上，但是对于写完代码之后的善后工作做得非常不到位，比如debug接口信号的选择和设计。不出bug还好，坑爹的就是 [芯片](https://zhida.zhihu.com/search?content_id=1761985&content_type=Article&match_order=1&q=%E8%8A%AF%E7%89%87&zhida_source=entity) tapeout之后，做测试发现出了bug，需要debug的时候

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/如何设计具有强大debug能力的IC系统.md) [[../../raw/tech/soc-pm/如何设计具有强大debug能力的IC系统.md|原始文章]]

## Key Quotes

> "讲到具体怎么设计之前，我还是先讲一个自己的故事"

> "但是我也意识到有些人debug非常快。为什么呢？因为这帮狡猾的人把自己模块的debug信号做了一个CPU的read接口，可以用CPU将debug接口的值给读出来，这样，一到debug的时候，他们不需要用LA，只需要用CPU读几个寄存器，就可以成功摆脱嫌疑"

> "这就是我要说的设计，对于SOC系统，将系统的debug接口做成CPU可读的寄存器，这样就可以极大的方便debug。因为用CPU读寄存器相比于抓LA是非常容易并且快速的"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/如何设计具有强大debug能力的IC系统.md) [[../../raw/tech/soc-pm/如何设计具有强大debug能力的IC系统.md|原始文章]]
