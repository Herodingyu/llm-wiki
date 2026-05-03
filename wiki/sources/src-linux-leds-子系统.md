---
doc_id: src-linux-leds-子系统
title: Linux leds 子系统
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/Linux leds 子系统.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

## Summary

2 人赞同了该文章 什么叫做驱动框架? 内核中驱动部分维护者针对每个种类的驱动设计一套成熟的、标准的、典型的驱动实现，并把不同厂家的同类硬件驱动中相同的部分抽出来自己实现好，再把不同部分留出接口给具体的驱动开发工程师来实现，这就叫驱动框架。即标准化的驱动实现,统一管理系统资源,维护系统稳定。

## Key Points

### 1. 前言
什么叫做驱动框架? 内核中驱动部分维护者针对每个种类的驱动设计一套成熟的、标准的、典型的驱动实现，并把不同厂家的同类硬件驱动中相同的部分抽出来自己实现好，再把不同部分留出接口给具体的驱动开发工程师来实现，这就叫驱动框架。即标准化的驱动实现,统一管理系统资源,维护系统稳定。

### 2. 概述
led [子系统](https://zhida.zhihu.com/search?content_id=197704797&content_type=Article&match_order=1&q=%E5%AD%90%E7%B3%BB%E7%BB%9F&zhida_source=entity) 驱动框架:

### 3. 代码框架分析
led-class.c(led子系统框架的入口) 和 led-core.c led\_classdev 代表 led 的实例： ``` struct led_classdev { const char  *name;//名字

## Evidence

- Source: [原始文章](raw/tech/peripheral/Linux leds 子系统.md) [[../../raw/tech/peripheral/Linux leds 子系统.md|原始文章]]

## Key Quotes

> "有的led可能是接在gpio管脚上,不同的led有不同的gpio来控制
2"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/Linux leds 子系统.md) [[../../raw/tech/peripheral/Linux leds 子系统.md|原始文章]]
