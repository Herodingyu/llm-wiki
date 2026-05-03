---
doc_id: src-arm-soc-bootflow-intro
title: ARM SOC 启动流程介绍
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片和系统启动(一) --- ARM SOC启动流程介绍.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-03
tags: [bsp, arm, soc, bootflow]
---

## Summary

本文从芯片内部各核心组件的 Firmware 加载和启动为线索，系统介绍了 ARM SOC 的启动流程。ARM SOC 通常包含 ARM 处理器核心（Cortex-A/R/M）、GPU、内存控制器（DDRC）、外设接口、多媒体处理单元（VPU/JPU/DPU）、网络接口、电源管理单元（PMU）和安全模块（TEE/TrustZone）。启动过程中，专门的 BOOT Core（如 ARM7 或 Cortex-M3）负责系统初始化，包括初始化外设接口、加载固件到 SRAM、配置电源和时钟、初始化 DDR，最后解除主处理器（AP CPU）的复位状态，完成系统启动。

## Key Points

### 1. ARM SOC 核心组件
| 组件 | 功能描述 |
|------|---------|
| ARM 处理器核心 | Cortex-A（高性能）、Cortex-R（实时）、Cortex-M（微控制器） |
| GPU | Mali、PowerVR 等，负责图形渲染 |
| DDRC | 管理 SOC 与外部内存的数据传输 |
| 外设接口 | USB、PCIe、I2C、SPI、UART |
| 多媒体处理单元 | VPU（视频）、JPU（JPEG）、DPU（显示） |
| PMU | 功耗管理，优化电池寿命 |
| 安全模块 | TEE、TrustZone，提供硬件级安全保护 |

### 2. 启动流程中的 Firmware
| Firmware | 运行 Core | 类型 | EL 等级 | 功能 |
|----------|-----------|------|---------|------|
| Bootrom | Boot core | ARM7/ARM9/Cortex-M3 | NA | 芯片固化程序 |
| Boot FW | Boot core | 同上 | NA | 初始化片内总线、DDR，启动 AP boot core |
| PM FW | PM core | Xtensa | NA | 电源和时钟管理 |
| BL2 | AP boot core | Cortex-A/X | EL3 | 加载 BL3x 和启动 BL31 |
| BL31 | AP boot core | - | EL3 | 启动 Tee、bootloader |
| BL32 | AP boot core | - | EL1S | 运行 TEE，提供安全服务 |
| BL33 | AP boot core | - | EL1NS/EL2NS | bootloader，加载内核 |

### 3. BOOT Core 的职责
1. 芯片上电后立即运行固化启动代码
2. 初始化基本外设接口（SPI/SDIO）
3. 从外部存储（Flash/SD 卡）读取固件到 SRAM
4. 完成电源管理、时钟配置、片内总线初始化
5. 初始化 DDR 控制器（DDRC）
6. 加载 PM FW 和 BL2 FW 到 DDR
7. 解除 AP CPU 复位，启动高性能核心

## Evidence

- ARM SOC 广泛应用于移动设备、嵌入式系统、物联网、汽车电子、工业控制
- BOOT Core 通常是 ARM7 或 Cortex-M3 等小核心
- 不同厂商对 BOOT Core 的命名可能不同

## Open Questions

- 不同厂商（高通、联发科、华为）BOOT Core 的实现差异
- Bootrom 的安全机制和信任根实现

## Key Quotes

> "在ARM SOC设计中，通常会集成一个专门的小核（如ARM7或Cortex-M3），通常称为 **BOOT Core** （不同厂商可能有不同的命名）"

> "由于其低功耗、高性能和高度集成的特点，ARM SOC已成为现代电子设备的核心组件"

> "了解了SOC的基本组成后，我们下面用一个图来描述启动过程中，SOC内部各个核心的Firmware加载和启动流程"

## Related Pages

- [[soc-boot]]
- [[armv8]]
- [[atf]]
- [[trustzone]]
