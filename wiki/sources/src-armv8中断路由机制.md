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
tags: [bsp, armv8, gicv3, interrupt, routing]
---

## Summary

本文系统梳理了ARMv8架构下的中断路由机制，重点分析GICv3与CPU如何协同工作以实现中断的正确分发。文章从GIC配置（中断分组、触发方式）、CPU配置（SCR_EL3寄存器）、以及异常向量表三个维度，详细阐述了在不同异常等级（EL1/EL3）和security状态（secure/non-secure）下，中断是如何被路由到正确的处理器的。核心结论是：GIC负责中断以IRQ或FIQ方式触发，CPU通过SCR寄存器决定中断路由到哪个异常等级，两者配合完成完整的中断路由链路。

## Key Points

### 1. ARMv8中断路由架构
- **四个异常等级**：EL0、EL1、EL2、EL3
- **两种security状态**：secure和non-secure
- **GICv3三种中断group**：Group 0（EL3处理）、Secure Group 1（Secure EL1/EL2）、Non-secure Group 1（Non-secure EL1/EL2）
- 目标：不同group中断在不同状态下分别路由到IRQ或FIQ

### 2. GICv3配置
- **GICD_CTRL.DS位**：控制是否支持两种security状态
  - DS=0：支持secure+non-secure，三个中断group
  - DS=1：单一security状态，最多两个group
- **中断分组寄存器**：GICD_IGROUPR/GICD_IGRPMODR配置SPI中断group
- **触发方式**：
  - Group 0：总是FIQ触发
  - Secure Group 1：secure状态IRQ，non-secure状态FIQ
  - Non-secure Group 1：non-secure状态IRQ，secure状态FIQ

### 3. CPU配置（SCR_EL3）
- **SCR_EL3.IRQ/FIQ位**：控制中断路由目标
  - 位=0：中断路由到第一个可处理的异常等级（FEL）
  - 位=1：中断路由到EL3
- **Secure EL1中断路由**：
  - Secure EL1执行：IRQ触发，SCR.IRQ=0
  - Non-secure EL1执行：FIQ触发，SCR.FIQ=1，经EL3转发
  - EL3执行：FIQ触发，SCR.FIQ=1，经EL3转发
- **Non-secure EL1中断路由**：
  - Secure EL1执行：FIQ触发，SCR.FIQ=1，经EL3转发
  - Non-secure EL1执行：IRQ触发，SCR.IRQ=0
  - EL3执行：FIQ触发，SCR.FIQ=1，经EL3转发
- **EL3中断路由**：任何状态下都是FIQ触发，SCR.FIQ=1

### 4. 异常向量表与中断处理
- **独立向量表**：EL1/EL2/EL3各有独立异常向量表，基地址保存在VBAR_ELx
- **四张表结构**：每个异常等级下根据异常发生时系统状态（SP_EL0/SP_ELx、aarch32/aarch64）使用不同表
- **上下文切换**：secure状态切换时需重新设置VBAR_EL1/VBAR_EL2

### 5. 中断路由配置总结
| 异常等级 | SCR.IRQ | SCR.FIQ | 说明 |
|---------|---------|---------|------|
| Secure EL1 | 0 | 1 | Secure中断本地IRQ，Non-secure中断经EL3转发 |
| Non-secure EL1 | 0 | 1 | Non-secure中断本地IRQ，Secure中断经EL3转发 |
| EL3 | 1 | 1 | 所有中断经EL3处理 |

## Key Quotes

> "GIC能做的只有中断是以哪种方式（fiq或irq）触发，若要达到不同group中断能被不同异常等级处理的目的，还需要cpu的配合才行。"

> "group 0中断总是以FIQ方式触发。"

> "secure group 1中断根据cpu的当前执行状态确定触发方式。若当前执行状态为secure EL0、EL1、EL2，以irq方式触发。否则，以fiq方式触发。"

## Evidence

- Source: [原始文章](raw/tech/bsp/armv8中断路由机制.md) [[../../raw/tech/bsp/armv8中断路由机制.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/armv8中断路由机制.md) [[../../raw/tech/bsp/armv8中断路由机制.md|原始文章]]
