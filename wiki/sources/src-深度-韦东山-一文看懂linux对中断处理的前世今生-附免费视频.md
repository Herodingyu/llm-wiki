---
doc_id: src-深度-韦东山-一文看懂linux对中断处理的前世今生-附免费视频
title: 【深度】韦东山：一文看懂linux对中断处理的前世今生(附免费视频)
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/【深度】韦东山：一文看懂linux对中断处理的前世今生(附免费视频).md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 韦东山嵌入式Linux](https://www.zhihu.com/column/c_118891916) 265 人赞同了该文章 前言：

## Key Points

### 1. Linux系统对中断处理的演进
从2005年我接触Linux到现在15年了，Linux中断系统的变化并不大。比较重要的就是引入了 [threaded irq](https://zhida.zhihu.com/search?content_id=113242159&content_type=Article&match_order=1&q=threaded+irq&zhida_source=entity) ：使用内核线程来处理中断。

### 2. 1.Linux对中断的扩展：硬件中断、软件中断
Linux系统把中断的意义扩展了，对于按键中断等硬件产生的中断，称之为“硬件中断”(hard irq)。每个硬件中断都有对应的处理函数，比如按键中断、网卡中断的处理函数肯定不一样。 为方便理解，你可以先认为对硬件中断的处理是用数组来实现的，数组里存放的是函数指针：

### 3. 2.中断处理原则1：不能嵌套
官方资料：中断处理不能嵌套 [git.kernel.org/pub/scm/](https://link.zhihu.com/?target=https%3A//git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/%3Fid%3De58aa3d2d0cc)

### 4. 3.中断处理原则2：越快越好
妈妈在家中照顾小孩时，门铃响起，她开门取快递：这就是中断的处理。她取个快递敢花上半天吗？不怕小孩出意外吗？ 同理，在Linux系统中，中断的处理也是越快越好。 在单芯片系统中，假设中断处理很慢，那应用程序在这段时间内就无法执行：系统显得很迟顿。

### 5. 4.要处理的事情实在太多，拆分为：上半部、下半部
当一个中断要耗费很多时间来处理时，它的坏处是：在这段时间内，其他中断无法被处理。换句话说，在这段时间内，系统是关中断的。 如果某个中断就是要做那么多事，我们能不能把它拆分成两部分：紧急的、不紧急的？ 在handler函数里只做紧急的事，然后就重新开中断，让系统得以正常运行；那些不紧急的事，以后再处理，处理时是开中断的。

## Evidence

- Source: [原始文章](raw/tech/bsp/【深度】韦东山：一文看懂linux对中断处理的前世今生(附免费视频).md) [[../../raw/tech/bsp/【深度】韦东山：一文看懂linux对中断处理的前世今生(附免费视频).md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/【深度】韦东山：一文看懂linux对中断处理的前世今生(附免费视频).md) [[../../raw/tech/bsp/【深度】韦东山：一文看懂linux对中断处理的前世今生(附免费视频).md|原始文章]]
