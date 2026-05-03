---
doc_id: src-atf-bl31中断分析
title: ATF bl31中断分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/ATF bl31中断分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 中断系统](https://www.zhihu.com/column/c_1513125306935898112) TrustZone 等 13 人赞同了该文章 [ARM架构](https://zhida.zhihu.com/search?content_id=203723383&content_type=Article&match_order=1&q=ARM%E6%9E%B6%E6%9E%84&zhida_source=entity) ：ARMv8

## Key Points

### 1. 1　Bl31中断功能概述
ATF在 [bl31](https://zhida.zhihu.com/search?content_id=203723383&content_type=Article&match_order=1&q=bl31&zhida_source=entity) 中提供了GICv3驱动加载、bl31的中断处理、异常等级切换时中断路由信息配置以及GICv3相关的电源管理功能，由于电源管理功能与中断处理流程关联

### 2. ２　GICv3驱动加载流程
GICv3驱动加载流程由bl31启动流程调用，主要包含两部分， [GIC驱动初始化](https://zhida.zhihu.com/search?content_id=203723383&content_type=Article&match_order=1&q=GIC%E9%A9%B1%E5%8A%A8%E5%88%9D%E5%A7%8B%E5%8C%96&zhida_source=entity

### 3. ３　Bl31中断处理流程
中断处理需要软件和硬件配合完成，GICv3根据中断分组情况以及系统当前运行的异常等级确定中断是以IRQ还是FIQ触发。CPU通过设置SCR\_EL3.IRQ和SCR\_EL3.FIQ确定IRQ和FIQ中断分别是被路由到当前异常等级还是被路由到EL3。若中断被路由到EL3，根据异常发生时系统所处的异常等级，使用的栈指针是SP\_EL0还是SP\_ELx（x> 0），以及使用的aarch32还是aar

### 4. ４　Bl31中断路由模型设置流程
ARMv8 security模型的设计原则是secure相关的资源必须由secure空间处理，而non secure相关的资源可以由secure空间或non secure空间处理。显然，group 0中断和secure group 1中断都是secure资源，不应该被路由到non secure空间中。

## Evidence

- Source: [原始文章](raw/tech/bsp/ATF bl31中断分析.md) [[../../raw/tech/bsp/ATF bl31中断分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/ATF bl31中断分析.md) [[../../raw/tech/bsp/ATF bl31中断分析.md|原始文章]]
