---
doc_id: src-arm攒机指南-开篇
title: ARM攒机指南 开篇
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-开篇.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · ARM攒机指南](https://www.zhihu.com/column/c_70349842) 355 人赞同了该文章 经常有人说，现在做手机芯片就像搭积木，买点IP，连一下，后端外包。等芯片回来，上电，起操作系统，大功告成。这么简单，要不我们也来动手攒一颗吧。不过在攒机之前，我们还是先要把基础概念捋顺了。

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-开篇.md) [[../../raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-开篇.md|原始文章]]

## Key Quotes

> "评价一颗芯片，着眼点主要是功能，性能，功耗和价格。功能，是看芯片内部有什么运算模块，比如处理器，浮点器，编解码器，数字信号处理器，图形加速器，网络加速器等，还要看提供了什么接口，比如闪存，内存，PCIe，USB，SATA，以太网等"

> "接下来，受布局和布线的影响。芯片里面和主板一样，也是需要多层布线的，每一层都有个利用率。总体面积越小，利用率越高，布线就越困难。而层数越多，利用率越低，成本就越高。在给出一些初始和限制条件后，EDA软件会自己去不停的计算，最后给出一个可行的频率和面积"

> "再次，受前后端协同设计的影响。处理器的关键路径直接决定了最高频率"

> "从功耗角度，同样是前后端协同设计，某个访问片上内存的操作，如果知道处理器会花多少时间，用哪些资源，就可以让内存的空闲块关闭，从而达到省电的目的。这种技巧可能有上千处，只有自己做处理器才会很清楚"

> "再往上，就是软件电源管理了。芯片设计者把每个大模块的clock gating和power gating进行组合，形成不同的休眠状态，软件可以根据温度和运行的任务，动态的告诉处理器每个模块进入不同的休眠状态，从而在任务不忙的时候降低功耗"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-开篇.md) [[../../raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-开篇.md|原始文章]]
