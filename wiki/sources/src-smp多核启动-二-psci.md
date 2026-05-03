---
doc_id: src-smp多核启动-二-psci
title: SMP多核启动（二）：PSCI
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/SMP多核启动（二）：PSCI.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 11 人赞同了该文章 前面我们知道了 [SMP多核启动](https://zhida.zhihu.com/search?content_id=237065670&content_type=Article&match_order=1&q=SMP%E5%A4%9A%E6%A0%B8%E5%90%AF%E5%8A%A8&zhida_source=entity) 有两种方式，上一篇讲了spin-table。 **但是因为这个玩意只能启动从核，功能太单一了。*

## Key Points

### 1. 前言
前面我们知道了 [SMP多核启动](https://zhida.zhihu.com/search?content_id=237065670&content_type=Article&match_order=1&q=SMP%E5%A4%9A%E6%A0%B8%E5%90%AF%E5%8A%A8&zhida_source=entity) 有两种方式，上一篇讲了spin-table。 **但是因为这个玩

### 2. 1、psci感性认识
psci是arm提供的一套电源管理接口，当前一共包含0.1、0.2和1.0三个版本。它可被用于以下场景： （1）cpu的idle管理 （2）cpu hotplug以及secondary cpu启动 （3）系统shutdown和reset

### 3. 2 psci 基础概念知识
下面我们将按照电源管理拓扑结构（ [power domain](https://zhida.zhihu.com/search?content_id=237065670&content_type=Article&match_order=1&q=power+domain&zhida_source=entity) ）、电源状态（ [power state](https://zhida.zhihu.com

### 4. 1　power domain
我们前面已经介绍过cpu的拓扑结构，如aarch64架构下每块soc可能会包含多个cluster，而每个cluster又包含多个core，它们共同组成了层次化的拓扑结构。如以下为一块包含2个cluster，每个cluster包含四个core的soc：

### 5. 2　power state
由于aarch64架构有多种不用的电源状态，不同电源状态的功耗和唤醒延迟不同。 如standby状态会关闭power domain的clock，但并不关闭电源。 **因此它虽然消除了门电路翻转引起的动态功耗，但依然存在漏电流等引起的静态功耗。故其功耗相对较大** ，但相应地唤醒延迟就比较低。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/SMP多核启动（二）：PSCI.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/SMP多核启动（二）：PSCI.md|原始文章]]

## Key Quotes

> "但是因为这个玩意只能启动从核，功能太单一了。"

> "这里只讲解smc陷入el3启动多核的情况。"

> "由于其中每个core以及每个cluster的电源都可以独立地执行开关操作"

> "因此它虽然消除了门电路翻转引起的动态功耗，但依然存在漏电流等引起的静态功耗。故其功耗相对较大"

> "让linux实现具体的电源管理策略"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/SMP多核启动（二）：PSCI.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/SMP多核启动（二）：PSCI.md|原始文章]]
