---
doc_id: src-atf启动-一-整体启动流程
title: ATF启动（一）：整体启动流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/ATF启动（一）：整体启动流程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, atf, boot, arm, trustzone]
---

## Summary

本文从宏观角度梳理了ARM Trusted Firmware（ATF）的完整冷启动流程，将启动过程划分为5个阶段：BL1（AP Trusted ROM/BootROM）、BL2（Trusted Boot Firmware）、BL31（EL3 Runtime Firmware）、BL32（Secure-EL1 Payload/TEE OS）、BL33（Non-Trusted Firmware/U-Boot或Linux）。文章详细描述了每个阶段的运行环境、核心职责，以及阶段间的跳转关系。核心在于理解ATF如何建立从硬件复位到操作系统启动的信任链，以及各固件组件在安全世界（Secure World）和非安全世界（Normal World）之间的协作与切换机制。

## Key Points

### 1. ATF冷启动五阶段
| 阶段 | 名称 | 运行环境 | 核心职责 |
|------|------|----------|----------|
| **BL1** | AP Trusted ROM | EL3, ROM | 系统最早启动代码，初始化CPU和平台，加载验证BL2 |
| **BL2** | Trusted Boot Firmware | Secure EL1, SRAM | 加载后续固件（BL31/BL32/BL33），安全校验 |
| **BL31** | EL3 Runtime Firmware | EL3, SRAM | 安全监控器，提供SMC服务，管理安全/非安全世界切换 |
| **BL32** | Secure-EL1 Payload | Secure EL1 | TEE OS（如OP-TEE），运行可信应用 |
| **BL33** | Non-Trusted Firmware | Non-Secure EL1/EL2 | U-Boot或Linux内核，非安全世界启动 |

### 2. BL1 阶段（BootROM）
- **位置**：芯片内部ROM
- **运行等级**：EL3
- **核心工作**：
  - 决定启动路径（冷启动/热启动）
  - 架构初始化：异常向量、CPU复位处理、控制寄存器（SCRLR_EL3/SCR_EL3/CPTR_EL3/DAIF）
  - 平台初始化：Trusted Watchdog、控制台、硬件一致性互联、MMU、存储设备
  - 固件更新处理
  - 加载并验证BL2镜像，跳转到BL2执行

### 3. BL2 阶段（Trusted Bootloader）
- **位置**：SRAM
- **运行等级**：Secure EL1
- **核心工作**：
  - 架构初始化：EL1/EL0使能浮点单元和ASIMD
  - 平台初始化：控制台、存储设备、MMU、设备安全配置
  - SCP_BL2：加载系统控制处理器镜像（功耗/时钟/复位管理）
  - 加载BL31：将控制权交给BL1，BL1关闭MMU和Cache后转交BL31
  - 加载BL32：依赖BL31将控制权交给BL32（Secure-EL1 Payload）
  - 加载BL33：依赖BL31将控制权交给BL33（Non-Trusted Firmware）

### 4. BL31 阶段（Secure Monitor）
- **位置**：SRAM
- **运行等级**：EL3
- **核心工作**：
  - PSCI服务初始化：提供CPU功耗管理操作
  - BL32镜像运行初始化（Secure EL1模式）
  - 初始化非安全EL2或EL1，跳转到BL33执行
  - 负责安全/非安全世界切换
  - 安全服务请求分发

### 5. 阶段间跳转关系
- **BL1 → BL2**：BL1验证BL2后，切换到Secure EL1，执行权交给BL2
- **BL2 → BL31**：BL2加载BL31后，通过BL1中转（BL1关闭MMU/Cache），控制权交给BL31
- **BL31 → BL32**：BL31初始化Secure EL1环境，启动BL32（TEE OS）
- **BL31 → BL33**：BL31初始化Non-Secure EL2/EL1，启动BL33（U-Boot/Linux）

## Key Quotes

> "ATF冷启动实现分为5个步骤：BL1 - AP Trusted ROM，一般为BootRom；BL2 - Trusted Boot Firmware，一般为Trusted Bootloader；BL31 - EL3 Runtime Firmware，一般为SML；BL32 - Secure-EL1 Payload，一般为TEE OS Image；BL33 - Non-Trusted Firmware，一般为uboot、linux kernel。"

> "ATF将系统启动从最底层进行了完整的统一划分，将secure monitor的功能放到了bl31中进行，这样当系统完全启动之后，在CA或者TEE OS中触发了smc或者是其他的中断之后，首先是遍历注册到bl31中的对应的service来判定具体的handle。"

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/ATF启动（一）：整体启动流程.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/ATF启动（一）：整体启动流程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/ATF启动（一）：整体启动流程.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/ATF启动（一）：整体启动流程.md|原始文章]]
