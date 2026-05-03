---
doc_id: src-电源管理入门-14-watchdog
title: 电源管理入门 14 Watchdog
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-14 Watchdog.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 5 人赞同了该文章 ![](https://pic4.zhimg.com/v2-1fae95c4bfed6193d5c14181fe985161_1440w.jpg)

## Key Points

### 1. 1\. 软硬件watchdog的区别
![](https://pica.zhimg.com/v2-fd303afd9daeb3736fb38b4454fdff72_1440w.jpg) 1. 通常情况下，watchdog需要硬件支持，但是如果确实没有相应的硬件，还想使用watchdog功能，则可以使用 **[liunx模拟的watchdog](https://zhida.zhihu.com/search?content_id=2723

### 2. 2\. 软件看门狗


### 3. 2.1 kernel watchdog
kernel watchdog是用来检测 [Lockup](https://zhida.zhihu.com/search?content_id=272340895&content_type=Article&match_order=1&q=Lockup&zhida_source=entity) 的。所谓 **lockup** ，是指 **某段内核代码占着CPU不放** 。Lockup严重的情况下会导

### 4. 2.1.1 soft lockup
Lockup分为两种：soft lockup 和 [hard lockup](https://zhida.zhihu.com/search?content_id=272340895&content_type=Article&match_order=1&q=hard+lockup&zhida_source=entity) ，它们的区别是 **hard lockup 发生在CPU屏蔽中断的情况下**

### 5. 2.1.1 hard lockup
Hard lockup比soft lockup更加严重， **CPU不仅无法执行其它进程，而且不再响应中断** 。检测hard lockup的原理利用了PMU的NMI perf event，因为NMI中断是不可屏蔽的，在CPU不再响应中断的情况下仍然可以得到执行，它再去检查时钟中断的计数器hrtimer\_interrupts是否在保持递增，如果停滞就意味着时钟中断未得到响应，也就是发生了hard

## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-14 Watchdog.md) [[../../raw/tech/bsp/电源管理/电源管理入门-14 Watchdog.md|原始文章]]

## Key Quotes

> "hard lockup 发生在CPU屏蔽中断的情况下"

> "soft lockup则是单个CPU被一直占用的情况"

> "CPU不仅无法执行其它进程，而且不再响应中断"

> "用户程序有可能占着临界资源无法释放，系统太忙，疲于响应各种中断，导致无法执行调度程序"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-14 Watchdog.md) [[../../raw/tech/bsp/电源管理/电源管理入门-14 Watchdog.md|原始文章]]
