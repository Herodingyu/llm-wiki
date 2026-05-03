---
doc_id: src-电源管理入门-16-驱动runtime-pm管理
title: 电源管理入门 16 驱动Runtime PM管理
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-16 驱动Runtime PM管理.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 2 人赞同了该文章 ![](https://pic2.zhimg.com/v2-1850c5ff27d107b5746fb3fe84d1662d_1440w.jpg)

## Key Points

### 1. 1\. 框架介绍


### 2. 1.1 为什么需要Runtime PM Framework?
- 系统基本的电源管理，例如关机休眠等，需要调用device的电源Runtime API就是 **ops回调函数** ，而且需要按一个顺序的queue去实施，而且系统跟设备状态发生冲突的时候也需要去处理，综上就需要一个Framework去统一做这些事情

### 3. 1.2 系统框架图
![](https://pic1.zhimg.com/v2-aec488d848b23191f668ebd67d535d8a_1440w.jpg) 数据结构： ![](https://picx.zhimg.com/v2-be9b63c732b026f0f60b61752ac04f31_1440w.jpg)

### 4. 2\. Drivers
Device drivers（包括bus、class、 [power domain](https://zhida.zhihu.com/search?content_id=272341066&content_type=Article&match_order=1&q=power+domain&zhida_source=entity) ）实现了runtime pm相关的runtime\_idle/run

### 5. 3\. Runtime PM core
Runtime pm core主要提供了三类函数接口： - 提供 **enable/disable接口** 给设备驱动，用于该设备驱动决定是否打开或关闭RPM， - 提供 **get、put类接口** 给设备驱动，用于决定什么时候进入或者恢复设备低功耗，

## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-16 驱动Runtime PM管理.md) [[../../raw/tech/bsp/电源管理/电源管理入门-16 驱动Runtime PM管理.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-16 驱动Runtime PM管理.md) [[../../raw/tech/bsp/电源管理/电源管理入门-16 驱动Runtime PM管理.md|原始文章]]
