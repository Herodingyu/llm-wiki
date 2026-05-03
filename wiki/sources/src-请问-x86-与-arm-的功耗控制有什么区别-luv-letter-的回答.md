---
doc_id: src-请问-x86-与-arm-的功耗控制有什么区别-luv-letter-的回答
title: 请问 X86 与 ARM 的功耗控制有什么区别？   Luv Letter 的回答
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/请问 X86 与 ARM 的功耗控制有什么区别？ - Luv Letter 的回答.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

最省电的ATOM，性能差、功耗不低，性能比高通差好多… 好一点的core M，功耗控制不了，满载功耗十几瓦… 两者的平板和笔记本都用过，可是续航一点都… 194 人赞同了该回答 ![](https://pica.zhimg.com/50/v2-f76d1d0a264e391ad4ac3a9453a12858_720w.jpg?source=2c26e567)

## Key Points

### 1. 请问 X86 与 ARM 的功耗控制有什么区别？
最省电的ATOM，性能差、功耗不低，性能比高通差好多… 好一点的core M，功耗控制不了，满载功耗十几瓦… 两者的平板和笔记本都用过，可是续航一点都… 194 人赞同了该回答 ![](https://pica.zhimg.com/50/v2-f76d1d0a264e391ad4ac3a9453a12858_720w.jpg?source=2c26e567)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/请问 X86 与 ARM 的功耗控制有什么区别？ - Luv Letter 的回答.md) [[../../raw/tech/soc-pm/请问 X86 与 ARM 的功耗控制有什么区别？ - Luv Letter 的回答.md|原始文章]]

## Key Quotes

> "一般来说ARM比x86省电，但是这种省电是有代价的，这种代价是需要软件或者操作系统设计者来承担的"

> "答案是：在ARM上，可能一直不会。尝试过等待一个tick（约16ms），一秒，200个tick以后，non-cache地址上一直读到的都是修改前的值，除非软件主动调用cache flush"

> "x86上能不能像ARM那样也不刷cache？可以，但是很多软件可能需要重写"

> "评论区有人提到是不是SMPEN没有打开的问题，这其实是理解错了我这个回答要表达的场景。ARM的核间同步是没有问题的，任何多核CPU都要支持MESI或者类似的协议，否则就不能正常工作了，这个测试跟核间同步也没有关系，这个测试要测的是write back的时机"

> "因为一个核心是以cache方式写数据，第二个核心使用的是non-cache的方式直接访问的主存读数据，第二个核心整个读周期都没有使用cache，所以这个场景就跟MESI没关系了，说明第一个核心没有把cache写入主存"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/请问 X86 与 ARM 的功耗控制有什么区别？ - Luv Letter 的回答.md) [[../../raw/tech/soc-pm/请问 X86 与 ARM 的功耗控制有什么区别？ - Luv Letter 的回答.md|原始文章]]
