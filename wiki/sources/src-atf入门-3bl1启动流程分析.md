---
doc_id: src-atf入门-3bl1启动流程分析
title: ATF入门-3：BL1启动流程分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/ATF入门-3BL1启动流程分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, atf, bl1, boot, arm]
---

## Summary

本文深入分析了ATF（ARM Trusted Firmware）BL1（Boot ROM）的启动流程。BL1是系统上电后执行的第一阶段代码，位于CPU内部ROM中，运行在EL3异常等级。文章详细解析了BL1的五大核心功能：决定启动路径（冷启动/热启动）、架构初始化（异常向量、控制寄存器）、平台初始化（看门狗、控制台、MMU、存储）、固件更新处理、以及BL2镜像加载和执行。重点分析了`bl1_entrypoint`入口函数的执行流程：`el3_entrypoint_common`系统初始化 → `bl1_setup`平台设置 → `bl1_main`加载BL2 → `el3_exit`跳转到BL2。

## Key Points

### 1. BL1定位与功能
- **位置**：CPU内部ROM，上电复位后执行的第一条指令地址
- **运行等级**：EL3（最高特权级）
- **核心职责**：
  1. 决定启动路径（冷启动 vs 热启动）
  2. 架构初始化（异常向量、CPU复位处理、控制寄存器）
  3. 平台初始化（看门狗、控制台、MMU、存储设备）
  4. 固件更新处理
  5. 加载并验证BL2镜像，跳转到BL2执行

### 2. 启动流程
```
Boot ROM → BL1 (EL3) → 加载验证BL2 → 跳转到BL2 (Secure EL1)
```

### 3. 入口函数 bl1_entrypoint
- **定义**：`bl1/aarch64/bl1_entrypoint.S`
- **链接脚本**：`bl1/bl1.ld.S`，ENTRY(bl1_entrypoint)
- **执行流程**：
  1. `el3_entrypoint_common`：初始化系统状态、C运行时环境、栈指针
  2. `bl1_setup`：平台相关操作（串口、内存布局、MMU）
  3. `bl1_main`：BL2镜像加载和跳转准备
  4. `el3_exit`：上下文切换，跳转到BL2

### 4. el3_entrypoint_common 详解
- **实现**：`include/arch/aarch64/el3_common_macros.S`
- **关键参数**：
  - `_init_sctlr`：初始化系统控制寄存器（大小端、对齐检查、WXN等）
  - `_warm_boot_mailbox`：检查冷启动或热启动
  - `_secondary_cold_boot`：确定主CPU或从属CPU
  - `_init_memory`：初始化内存
  - `_init_c_runtime`：初始化C运行时环境
  - `_exception_vectors`：设置异常向量表
  - `_pie_fixup_size`：PIE（位置无关可执行文件）修复

### 5. 关键寄存器初始化
- **SCTLR_EL3**：系统控制寄存器（Cache、对齐、字节序等）
- **SCR_EL3**：安全配置寄存器（路由控制、安全状态）
- **CPTR_EL3**：协处理器陷阱寄存器（浮点/SIMD使能）
- **DAIF**：中断屏蔽位

### 6. BL2加载流程
- 输出"Booting Trusted Firmware"
- 加载BL2到SRAM
- 验证BL2镜像（签名/哈希校验）
- 切换到Secure EL1，执行权交给BL2

## Key Quotes

> "BL1就是bootrom，bootrom的地址就是CPU上电复位后执行的第一条指令地址，这个是写死的。"

> "BL1是系统启动的第一阶段，其主要目的是初始化CPU，设定异常向量，将bl2的image加载到安全RAM中，然后跳转到bl2中进行执行。"

> "el3_entrypoint_common函数是所有在EL3下执行镜像共享的，如BL1和BL31都会通过该函数初始化系统状态。"

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-3BL1启动流程分析.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-3BL1启动流程分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-3BL1启动流程分析.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-3BL1启动流程分析.md|原始文章]]
