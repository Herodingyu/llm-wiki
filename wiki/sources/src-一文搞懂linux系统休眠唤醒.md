---
doc_id: src-一文搞懂linux系统休眠唤醒
title: 一文搞懂linux系统休眠唤醒
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/一文搞懂linux系统休眠唤醒.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · linux功耗管理](https://www.zhihu.com/column/c_1589903721982472192) 43 人赞同了该文章 系统休眠唤醒是 [电源管理](https://zhida.zhihu.com/search?content_id=214365975&content_type=Article&match_order=1&q=%E7%94%B5%E6%BA%90%E7%AE%A1%E7%90%86&zhida_source=entity) 中重要的一个技术点，一方面，它能让系统在不需要工作时，尽可能进入一个功耗极低的状态，这时外部的设备、芯片内部ip、

## Key Points

### 1. 1，介绍
系统休眠唤醒是 [电源管理](https://zhida.zhihu.com/search?content_id=214365975&content_type=Article&match_order=1&q=%E7%94%B5%E6%BA%90%E7%AE%A1%E7%90%86&zhida_source=entity) 中重要的一个技术点，一方面，它能让系统在不需要工作时，尽可能进入一个功耗极低

### 2. 2，框架
![](https://pic4.zhimg.com/v2-9572e8ec2d978ef631c9558e69878eb5_1440w.jpg) 系统休眠唤醒框架 系统休眠唤醒的框架包括三部分：services、PM core、PM driver。PM core实现power manage的核心逻辑，为上层services提供操作休眠唤醒的相关接口，通过利用底层相关的技术实现休眠唤醒过程中的cp

### 3. 3，流程


### 4. 3.1 休眠唤醒流程
Linux系统休眠唤醒的整个流程： ![](https://pic4.zhimg.com/v2-054b14da1c7ceb417ecf2adf41423871_1440w.jpg) 系统休眠唤醒流程

### 5. 3.2 休眠唤醒函数调用流程
echo mem > /sys/power/state 做如上操作后，整个函数调用流程如下： ![](https://pic3.zhimg.com/v2-ea4591f75c869274c4f55cde2f355d66_1440w.jpg)

## Key Quotes

> "系统休眠唤醒是电源管理中重要的一个技术点，一方面，它能让系统在不需要工作时，尽可能进入一个功耗极低的状态。"

> "系统休眠唤醒的框架包括三部分：services、PM core、PM driver。"

## Evidence

- Source: [原始文章](raw/tech/bsp/一文搞懂linux系统休眠唤醒.md) [[../../raw/tech/bsp/一文搞懂linux系统休眠唤醒.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/一文搞懂linux系统休眠唤醒.md) [[../../raw/tech/bsp/一文搞懂linux系统休眠唤醒.md|原始文章]]
