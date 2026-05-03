---
doc_id: src-armv8中断路由机制
title: armv8中断路由机制
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/armv8中断路由机制.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 中断系统](https://www.zhihu.com/column/c_1513125306935898112) 37 人赞同了该文章 Armv8一共有四个异常等级 [EL0](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=EL0&zhida_source=entity) 、 [EL1](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_or

## Key Points

### 1. 1　 概述
Armv8一共有四个异常等级 [EL0](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=EL0&zhida_source=entity) 、 [EL1](https://zhida.zhihu.com/search?content_id=203733643&conte

### 2. ２　 GIC的配置
[GICv3](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=GICv3&zhida_source=entity) 对security进行了扩展，可以将GIC配置为工作在两种secure状态或单一secure状态。它可以通过配置寄存器 [GICD\_CTRL.DS](

### 3. ３　 CPU的配置
GIC能做的只有中断是以哪种方式（fiq或irq）触发，若要达到不同group中断能被不同异常等级处理的目的，还需要cpu的配合才行。在 [armv8](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=armv8&zhida_source=entity) 中 [SCR\

### 4. ４　异常向量表
armv8中除EL0以外，不同异常等拥有独立的异常向量表，它们的基地址被分别保存在 [VBAR\_EL1](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=VBAR_EL1&zhida_source=entity) 、VBAR\_EL2和VBAR\_EL3寄存器中。由于

## Evidence

- Source: [原始文章](raw/tech/bsp/armv8中断路由机制.md) [[../../raw/tech/bsp/armv8中断路由机制.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/armv8中断路由机制.md) [[../../raw/tech/bsp/armv8中断路由机制.md|原始文章]]
