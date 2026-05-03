---
doc_id: src-芯片和系统启动-一-arm-soc启动流程介绍
title: 芯片和系统启动(一)     ARM SOC启动流程介绍
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片和系统启动(一) --- ARM SOC启动流程介绍.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文介绍了ARM SOC（System on Chip）的完整启动流程，首先阐述了SOC的基本概念和核心组件组成（ARM处理器核心、GPU、内存控制器、外设接口、多媒体处理单元、网络接口、电源管理单元PMU、安全模块TEE等），随后用流程图展示了从芯片上电到操作系统运行的完整启动链路。文章重点解释了不同Firmware（固件）在启动过程中的角色和运行环境：BootROM/Boot Firmware在Boot Core上运行，负责初始化基本外设和DDR；PM Firmware在PM Core上管理电源和时钟；BL2/BL31/BL32/BL33在AP Boot Core上依次执行，完成安全监控器初始化、Trust OS启动和Bootloader加载；最终Kernel在所有AP Core上运行。文章还解答了"boot core是否为CPU中的boot core"这一常见疑问，明确了SOC中专用的BOOT Core（如ARM7/Cortex-M3）与AP CPU的区别。

## Key Points

### 1. ARM SOC核心组件

| 组件 | 功能 | 典型实现 |
|------|------|---------|
| ARM处理器核心 | 计算核心 | Cortex-A（应用）/ R（实时）/ M（微控制器） |
| GPU | 图形渲染 | ARM Mali / PowerVR |
| 内存控制器(DDRC) | 管理SOC与外部内存数据传输 | - |
| 外设接口 | 连接外部设备 | USB/PCIe/I2C/SPI/UART |
| 多媒体处理单元 | 音视频编解码 | VPU/JPU/DPU |
| 网络接口 | 网络通信 | 以太网/Wi-Fi/蓝牙 |
| 电源管理单元(PMU) | 功耗管理 | - |
| 安全模块(TEE) | 硬件级安全保护 | TrustZone |

### 2. 启动流程与Firmware角色

```
上电 → BootROM → Boot Firmware → PM Firmware
                         ↓
              DDR初始化完成
                         ↓
              AP CPU解除复位
                         ↓
    BL2 (EL3) → BL31 (EL3) → BL32 (S-EL1) → BL33 (EL1NS/EL2NS)
                                                  ↓
                                              Kernel
```

| Firmware | 运行Core | Core类型 | 运行EL | 功能 |
|----------|---------|---------|--------|------|
| Bootrom | Boot core | ARM7/ARM9/Cortex-M3 | N/A | 芯片固化程序 |
| Boot Firmware | Boot core | 同上 | N/A | 初始化总线、DDR，启动AP |
| PM Firmware | PM core | Xtensa | N/A | 电源和时钟管理 |
| BL2 | AP boot core | Cortex-A/X | EL3 | 加载BL3x并启动BL31 |
| BL31 | AP boot core | - | EL3 | 启动TEE、bootloader |
| BL32 | AP boot core | - | S-EL1 | 运行TEE，提供安全服务 |
| BL33 | AP boot core | - | EL1NS/EL2NS | bootloader，加载内核 |
| Kernel | AP boot + non-boot | - | EL1NS/EL2NS | 操作系统 |
| XPU Firmware | XPU core | - | N/A | DPU/VPU/GPU等固件初始化 |

### 3. BOOT Core启动流程

**BOOT Core**（如ARM7/Cortex-M3）是SOC中专用于启动的小核：

1. **上电后立即执行**芯片固化的BootROM代码
2. **初始化外设接口**（SPI/SDIO）
3. **从外部存储**（Flash/SD卡）读取后续固件到SRAM
4. **完成关键初始化**：电源管理、时钟配置、片内总线、DDR控制器（DDRC）
5. **加载PM FW和BL2到DDR**
6. **解除AP CPU复位**，AP CPU开始执行BL2

### 4. 异常等级（EL）切换

| 阶段 | 异常等级 | 安全状态 |
|------|---------|---------|
| BL2 | EL3 | Secure |
| BL31 | EL3 | Secure |
| BL32（TEE） | S-EL1/S-EL0 | Secure |
| BL33（U-Boot） | EL1/EL2 | Non-secure |
| Kernel | EL1/EL2 | Non-secure |

## Key Quotes

> "ARM SOC（System on Chip，片上系统）是一种集成了多个功能模块的集成电路，通常基于ARM架构的处理器核心。"

> "在ARM SOC设计中，通常会集成一个专门的小核（如ARM7或Cortex-M3），通常称为BOOT Core。"

> "BOOT Core的固件（FW）首先会初始化一些基本的外设接口，例如SPI或SDIO，然后通过这些接口从外部存储介质中读取后续需要运行的固件。"

> "完成这些步骤后，BOOT Core会解除主处理器（AP CPU）的复位状态，使其开始执行代码。"

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片和系统启动(一) --- ARM SOC启动流程介绍.md) [[../../raw/tech/bsp/芯片和系统启动(一) --- ARM SOC启动流程介绍.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片和系统启动(一) --- ARM SOC启动流程介绍.md) [[../../raw/tech/bsp/芯片和系统启动(一) --- ARM SOC启动流程介绍.md|原始文章]]
