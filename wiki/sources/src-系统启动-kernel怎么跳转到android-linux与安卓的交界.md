---
doc_id: src-系统启动-kernel怎么跳转到android-linux与安卓的交界
title: 【系统启动】Kernel怎么跳转到Android：linux与安卓的交界
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【系统启动】Kernel怎么跳转到Android：linux与安卓的交界.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 9 人赞同了该文章 上一篇写了Uboot怎么到Linux [kernel](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=1&q=kernel&zhida_source=entity) ，这一章来看看linux kernel怎么到Android的。

## Key Points

### 1. 1、前言
kernel的启动主要分为两个阶段。

### 2. 1、阶段一
从入口跳转到start\_kernel之前的阶段。 对应代码arch/arm/kernel/head.S中stext的实现： ``` ENTRY(stext) ``` - 这个阶段主要由 [汇编语言](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=1&q=%E6%B1%87%

### 3. 2、阶段二
**start\_kernel开始的阶段。**

### 4. 2、正题-kernel-uboot
Android生在 [linux内核](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=1&q=linux%E5%86%85%E6%A0%B8&zhida_source=entity) 基础上，linux内核启动的最后一步，一定是启动的android的进程。

### 5. 说明一
**总结一个图：kernel 到android核心启动过程** ![](https://pica.zhimg.com/v2-e85a6144289b7c34ff06384360ed8610_1440w.jpg)

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【系统启动】Kernel怎么跳转到Android：linux与安卓的交界.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【系统启动】Kernel怎么跳转到Android：linux与安卓的交界.md|原始文章]]

## Key Quotes

> "虽然是零零碎碎的学习了一些关于Linux的知识"

> "start\_kernel开始的阶段。"

> "后者与前者不同的是：它前面的代码是做自解压的，后面的代码都相同。"

> "prepare\_namespace()"

> "总结一个图：kernel 到android核心启动过程"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【系统启动】Kernel怎么跳转到Android：linux与安卓的交界.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【系统启动】Kernel怎么跳转到Android：linux与安卓的交界.md|原始文章]]
