---
doc_id: atf
title: ATF（ARM Trusted Firmware）
page_type: concept
related_sources:
  - src-arm-secure-boot-atf
  - src-soc-bootflow-detailed
  - src-armv8-bootflow-overview
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, bsp, security]
---

# ATF（ARM Trusted Firmware）

## 定义

ATF（ARM Trusted Firmware）是 ARM 推出的开源可信固件项目，为 ARMv8-A 架构提供安全启动和运行时安全服务。它将系统分为多个异常等级（EL0~EL3），建立从启动到运行时的完整信任链。

## 异常等级

| 等级 | 名称 | 用途 |
|------|------|------|
| EL0 | Application | 用户态应用 |
| EL1 | OS Kernel | 操作系统内核 |
| EL2 | Hypervisor | 虚拟化层 |
| EL3 | Secure Monitor | 最高特权级，安全监控 |

## 启动阶段

```
BL1 (BootROM) → BL2 → BL31 → BL32 → BL33 → OS
```

| 阶段 | 运行等级 | 功能 |
|------|----------|------|
| **BL1** | EL3 | BootROM，固化在芯片中，初始化 SRAM |
| **BL2** | EL3/EL1S | 加载后续镜像，初始化硬件（DDR） |
| **BL31** | EL3 | 运行时安全监控，处理 SMC 调用 |
| **BL32** | EL1S | OP-TEE OS（可选） |
| **BL33** | EL1NS/EL2NS | U-Boot 或 UEFI |

## 跳转方式

- **ERET**：从高等级到低等级（如 EL3 → EL2）
- **SMC**：从低等级到高等级（如 EL1 → EL3）
- **IRQ/FIQ**：中断触发特权切换

## 与 x86 对比

| | ARM ATF | x86 |
|---|---|---|
| 信任根 | BootROM | Boot Guard ACM |
| 安全固件 | ATF BL1/BL2/BL31 | BIOS PEI/DXE |
| 虚拟化 | EL2 (Hypervisor) | VMX/SVM |
| 安全服务 | SMC + OP-TEE | SMM + TEE |

## 相关来源

- [[src-arm-secure-boot-atf]] — ARM 安全启动与 ATF
- [[src-soc-bootflow-detailed]] — SOC 启动详解（含 ATF 代码分析）
- [[src-armv8-bootflow-overview]] — ARMv8 启动流程
