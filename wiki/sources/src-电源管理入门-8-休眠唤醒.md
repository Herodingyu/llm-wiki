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

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-8 休眠唤醒.md) [[../../raw/tech/bsp/电源管理/电源管理入门-8 休眠唤醒.md|原始文章]]
