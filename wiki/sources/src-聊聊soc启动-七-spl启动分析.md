---
doc_id: src-聊聊soc启动-七-spl启动分析
title: 聊聊SOC启动（七） SPL启动分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（七） SPL启动分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944) 32 人赞同了该文章 典型的 [uboot](https://zhida.zhihu.com/search?content_id=203729759&content_type=Article&match_order=1&q=uboot&zhida_source=entity) 启动流程通常包含三个阶段， [bootrom](https://zhida.zhihu.com/search?content_id=203729759&content_type=Article

## Key Points

### 1. 1　spl简介
典型的 [uboot](https://zhida.zhihu.com/search?content_id=203729759&content_type=Article&match_order=1&q=uboot&zhida_source=entity) 启动流程通常包含三个阶段， [bootrom](https://zhida.zhihu.com/search?content_id=203729

### 2. 2　入口函数在哪里之SPL链接脚本简要分析
对于任何一个程序，我们首先需要找到其入口函数，对于应用程序，程序的入口函数为main（）函数，而对于SPL这样的裸机程序，其入口函数实际上是在链接时指定的。我们打开armv8的SPL链接脚本arch/arm/cpu/armv8/u-boot-spl.lds，它的内容如下：

### 3. ３　SPL 代码分析1(Start.S)
armv8架构下的SPL入口函数位于arch/arm/cpu/armv8/start.S文件的\_start，它的定义如下： ``` .globl  _start _start: /* * Various SoCs need something special and SoC-specific up front in

### 4. ４　SPL 代码分析2(CRT0\_64.S)
\_main的代码如下： ``` ENTRY(_main) /* * Set up initial C runtime environment and call board_init_f(0). */

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（七） SPL启动分析.md) [[../../raw/tech/bsp/聊聊SOC启动（七） SPL启动分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（七） SPL启动分析.md) [[../../raw/tech/bsp/聊聊SOC启动（七） SPL启动分析.md|原始文章]]
