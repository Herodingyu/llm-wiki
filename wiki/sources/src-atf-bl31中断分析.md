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
tags: [bsp, atf, gicv3, interrupt, bl31]
---

## Summary

本文深入分析了ATF（ARM Trusted Firmware）BL31阶段的中断处理机制，基于ARMv8架构和GICv3中断控制器。文章详细阐述了BL31中GICv3驱动的加载流程（包括distributor、redistributor和CPU interface的初始化）、中断处理的具体实现（异常向量表、上下文保存与切换）、以及异常等级切换时的中断路由模型配置。核心在于理解BL31作为EL3特权级固件，如何通过配置SCR_EL3寄存器和GICv3中断分组，实现secure/non-secure中断的正确路由与处理。

## Key Points

### 1. BL31中断功能概述
- BL31提供GICv3驱动加载、中断处理、中断路由配置及电源管理功能
- 中断分组：Group 0（EL3处理）、Secure Group 1（Secure EL1/EL2）、Non-secure Group 1（Non-secure EL1/EL2）

### 2. GICv3驱动加载流程
- **驱动初始化**：解析GIC版本、特性，初始化redistributor基地址
- **Distributor初始化**：清除中断使能→设置ARE位→配置SPI默认属性→设置BL31注册中断属性
- **Redistributor初始化**：配置PPI/SGI默认属性→设置BL31注册的PPI/SGI属性
- **CPU Interface初始化**：设置唤醒状态→配置SRE寄存器→初始化优先级mask→使能中断组

### 3. BL31中断处理流程
- 异常向量表定义在`runtime_exceptions.S`，仅实现低异常等级→EL3的中断处理
- BL31运行时处于**关中断状态**（非重入），防止smc调用返回信息被覆盖
- 中断处理使用`handle_interrupt_exception`宏：保存上下文→切换runtime栈→获取中断类型→调用处理函数→恢复上下文

### 4. 中断路由模型设置
- **Group 0中断**：总是FIQ触发，路由到EL3
- **Secure Group 1**：Secure EL1下IRQ触发；Non-secure EL1/EL3下FIQ触发，经EL3转发
- **Non-secure Group 1**：Non-secure EL1下IRQ触发；Secure EL1/EL3下FIQ触发，经EL3转发
- 通过`set_routing_model`函数配置SCR_EL3.IRQ和SCR_EL3.FIQ位

### 5. 异常处理函数分类
- **Group 0中断**：由Exception Handler Framework (EHF)管理
- **Secure EL1中断**：由bl31接收并转发给bl32（如OP-TEE的`opteed_sel1_interrupt_handler`）

## Key Quotes

> "bl31中的异常处理函数是非重入的，bl31运行时当前PE处于关中断状态。"

> "group 0中断总是以FIQ方式触发，且不管当前运行在哪个异常等级都需要被路由到EL3下处理。"

> "该宏由所有需要在EL3下执行的镜像共享，如BL1和BL31都会入口处调用该函数，只是传入的参数有所区别。"

## Evidence

- Source: [原始文章](raw/tech/bsp/ATF bl31中断分析.md) [[../../raw/tech/bsp/ATF bl31中断分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/ATF bl31中断分析.md) [[../../raw/tech/bsp/ATF bl31中断分析.md|原始文章]]
