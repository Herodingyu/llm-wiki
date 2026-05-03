---
doc_id: src-电源管理入门-8-休眠唤醒
title: 电源管理入门 8 休眠唤醒
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-8 休眠唤醒.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 3 人赞同了该文章 ![](https://picx.zhimg.com/v2-db0449fd936cb840c9fdc8a8822a293b_1440w.jpg)

## Key Points

### 1. 1.基本概念和框架


### 2. 1.1 基本概念
> STR > 一般的嵌入式产品仅仅只实现了挂起到RAM（也简称为 [s2ram](https://zhida.zhihu.com/search?content_id=272339753&content_type=Article&match_order=1&q=s2ram&zhida_source=entity) ，或常简称为STR），即将系统的状态保存于内存中，并将SDRAM置于自刷新状态，待用

### 3. 1.2 休眠唤醒技术框架
![](https://pic2.zhimg.com/v2-e3c9e6be15780b0203861dfec65ef90b_1440w.jpg) - 上层service通过 [wakelock](https://zhida.zhihu.com/search?content_id=272339753&content_type=Article&match_order=1&q=wakelock&zhi

### 4. 1、冻结串口，可以在u-boot传入no_console_suspend，释放suspend流程中串口打印
suspend_console()

### 5. 2、外设驱动suspend
dpm_suspend_start()-> dpm_prepare()-> device_prepare()    ## 执行设备电源管理函数中的prepare函数 dpm_suspend()-> device_suspend()->

## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-8 休眠唤醒.md) [[../../raw/tech/bsp/电源管理/电源管理入门-8 休眠唤醒.md|原始文章]]

## Key Quotes

> "注意：电源管理比较小众，这里一次就多发几篇，不占用大家时间。公众号所以文章有需要转载的可以留意或者私信我。欢迎大家点赞，再看，划线，评论等交流！"

> "suspend&resume过程概述"

> "当我们不用设备的时候，一般需要关机，用的时候再开机，这样有一个问题，开机非常的慢，那么有什么方法即省电又可以快速开机呢？"

> "少数嵌入式Linux系统会实现挂起到硬盘（简称STD），它与挂起到RAM的不同是s2ram并不关机，STD则把系统的状态保持于磁盘，然后关闭整个系统。"

> "休眠唤醒流程的确很复杂，直接看代码不同平台实现差异很大，看懂也比较难，我们能做的就是知道大致原理，最后还是要通过PMU或者SCP去实现，都是要区分power domain。然后在需求开发的时候，我们调研几个平台的实现就可以自己攒一个实现了。"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-8 休眠唤醒.md) [[../../raw/tech/bsp/电源管理/电源管理入门-8 休眠唤醒.md|原始文章]]
