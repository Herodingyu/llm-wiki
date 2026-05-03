---
doc_id: src-atf入门-4bl31启动流程分析
title: ATF入门-4：BL31启动流程分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/ATF入门-4BL31启动流程分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, atf, bl31, runtime, smc]
---

## Summary

本文深入分析了ATF BL31（EL3 Runtime Firmware）的启动流程。BL31是ATF中最复杂的组件，具有双重角色：启动阶段负责软硬件初始化并加载BL32/BL33；系统运行后作为常驻runtime处理SMC异常和EL3中断。文章详细解析了`bl31_entrypoint`入口函数（支持冷启动和热启动两种路径）、`bl31_setup`平台初始化、`bl31_main`核心主函数的执行流程。重点阐述了BL31初始化的八大工作：CPU初始化、C运行时环境、基本硬件初始化（GIC/串口/定时器）、页表和Cache、后级镜像启动准备、中断处理框架、SMC处理及上下文切换、运行时服务注册。

## Key Points

### 1. BL31双重角色
- **启动阶段**：执行软硬件初始化，启动BL32（OP-TEE）和BL33（U-Boot/Linux）
- **Runtime阶段**：系统启动后继续驻留，处理SMC异常和EL3中断
- **为什么需要BL31**：
  - EL3需要运行时处理特权指令（关机、休眠等）
  - BL2不适合做runtime（功能不同、安全考虑、运行等级可能不是EL3）

### 2. 入口函数 bl31_entrypoint
- **链接脚本**：`bl31.ld.S`，ENTRY(bl31_entrypoint)
- **两种启动路径**：
  - **冷启动**（RESET_TO_BL31=0）：从BL1跳转而来，不初始化sctlr/memory
  - **热启动**（RESET_TO_BL31=1）：直接复位到BL31，需完整初始化
- **执行流程**：
  1. 保存x0-x3参数
  2. `el3_entrypoint_common`：EL3系统初始化
  3. `bl31_setup`：平台架构相关初始化
  4. `bl31_main`：BL31主函数，核心操作

### 3. bl31_main 核心工作
- **CPU初始化**：架构特性检测、CPU配置
- **C运行时环境**：栈、堆、BSS初始化
- **硬件初始化**：GIC、串口、定时器等
- **页表创建**：建立EL3地址映射，使能MMU和Cache
- **镜像启动准备**：加载并启动BL32、BL33
- **中断框架**：初始化EL3中断处理（若支持）
- **SMC处理**：注册运行时服务，处理Secure/Non-Secure切换
- **上下文切换**：初始化世界切换上下文

### 4. SMC运行时服务
- **服务注册**：通过`runtime_services`数组注册各类SMC handler
- **标准服务**：PSCI（电源管理）、SPM（安全分区管理）等
- **快速/标准SMC**：区分快速响应和标准流程的SMC调用
- **参数传递**：通过寄存器x0-x7传递SMC参数

### 5. 中断处理
- **中断路由**：配置GIC将中断路由到EL3
- **中断类型**：FIQ/IRQ，根据安全状态分发
- **处理流程**：保存上下文 → 处理中断 → 恢复上下文 → ERET返回

### 6. 安全世界切换
- **切换触发**：SMC指令或中断
- **上下文保存**：保存当前世界的寄存器状态
- **上下文恢复**：恢复目标世界的寄存器状态
- **切换方向**：Secure ↔ Non-Secure，EL3 ↔ EL2/EL1

## Key Quotes

> "bl31包含两部分功能：在启动时作为启动流程的一部分，执行软硬件初始化以及启动bl32和bl33镜像；在系统启动完成后，将继续驻留于系统中作为runtime。"

> "系统启动后运行做业务的时候，EL1运行的Linux，EL0运行的应用，那么EL3也需要一个运行时来处理EL3级别的指令。"

> "bl31_main函数主要完成必要初始化操作，配置EL3中的各种smc操作，以便在后续顺利响应在CA和TA中产生的smc操作。"

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-4BL31启动流程分析.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-4BL31启动流程分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-4BL31启动流程分析.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-4BL31启动流程分析.md|原始文章]]
