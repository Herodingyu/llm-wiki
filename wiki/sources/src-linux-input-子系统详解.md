---
doc_id: src-linux-input-子系统详解
title: Linux input 子系统详解
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/Linux input 子系统详解.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

## Summary

[收录于 · 手把手教你Linux驱动入门](https://www.zhihu.com/column/c_1278634350209007616) 7 人赞同了该文章 **1\. 模块概述**

## Key Points

### 1. 1.1.相关资料和代码研究
``` drivers/input/ include/uapi/linux/input-event-codes.h ```

### 2. 2\. 模块功能
linux核心的输入框架

### 3. 3\. 模块学习


### 4. 3.1.概述
Linux输入设备种类繁杂，常见的包括触摸屏、键盘、鼠标、摇杆等；这些输入设备属于 [字符设备](https://zhida.zhihu.com/search?content_id=178173873&content_type=Article&match_order=1&q=%E5%AD%97%E7%AC%A6%E8%AE%BE%E5%A4%87&zhida_source=entity) ，而li

### 5. 3.2.软件架构
输入子系统是由设备驱动层（input driver)、输入核心层（input core)、输入事件处理层（input event handle)组成，具体架构如图4.1所示： ![](https://pic2.zhimg.com/v2-3ada226d6aa020ee8b0867c19155c089_1440w.jpg)

## Evidence

- Source: [原始文章](raw/tech/peripheral/Linux input 子系统详解.md) [[../../raw/tech/peripheral/Linux input 子系统详解.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/Linux input 子系统详解.md) [[../../raw/tech/peripheral/Linux input 子系统详解.md|原始文章]]
