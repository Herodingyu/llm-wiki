---
doc_id: src-从硬件架构与软件架构看trustzone-v2-0
title: 从硬件架构与软件架构看TrustZone V2.0
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/从硬件架构与软件架构看TrustZone-V2.0.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文从硬件架构和软件架构两个维度深入解析了ARM TrustZone安全技术。文章首先回顾了传统安全手段的局限（进程隔离、特权级隔离无法防止内存明文被偷窥），引出外部安全模块（易被监听）和内部安全模块（成本高、性能有限）的不足，进而阐述TrustZone将SoC资源划分为安全世界（Secure World）和非安全世界（Normal World）的核心设计思想。详细解析了TrustZone的基础设施AMBA3 AXI总线（NS位控制访问）、必选组件（TZPC、TZASC）和可选组件（TZMA），以及REE（Rich Execution Environment）与TEE（Trusted Execution Environment）的双世界软件架构。

## Key Points

### 1. 安全背景与TrustZone诞生
- **传统局限**：CPU内存映射和特权级隔离无法防止内存明文被同处内存的其他应用偷窥
- **外部安全模块**：SIM卡、智能卡等，通信线路暴露，易被监听破解，速率低
- **内部安全模块**：集成到芯片内的安全核，通信在芯片内部，但占用SoC面积、成本高
- **TrustZone方案**：在概念上将SoC硬件和软件资源划分为安全世界和非安全世界

### 2. TrustZone 核心组件
| 类型 | 组件 | 功能 |
|------|------|------|
| **必选** | AMBA3 AXI总线 | 安全基础设施，NS位区分安全/非安全访问 |
| **必选** | TZPC | TrustZone Protection Controller，控制外设安全特性 |
| **必选** | TZASC | TrustZone Address Space Controller，内存区域划分和保护 |
| **可选** | TZMA | TrustZone Memory Adapter，片上ROM/RAM区域划分 |
| **可选** | AXI-to-APB bridge | 桥接APB总线外设支持TrustZone |

### 3. AMBA3 AXI 总线安全机制
- **NS位**：Non-Secure控制信号，针对读写分别叫ARPROT[1]和AWPROT[1]
  - 低 = Secure，高 = Non-Secure
- **访问控制**：非安全主设备（Non-Secure masters）必须将NS位置高，无法访问安全从设备（Secure Slaves）
- **错误响应**：违规访问会引发SLVERR（slave error）或DECERR（decode error）

### 4. 双世界软件架构
- **REE（Rich Execution Environment）**：非安全世界，运行用户操作系统和应用程序
- **TEE（Trusted Execution Environment）**：安全世界，运行Trusted OS和可信应用（TA）
- **典型TA**：DRM认证、DTCP-IP、HDCP 2.0验证、指纹识别、安全支付等

## Key Quotes

> "TrustZone在概念上将SoC的硬件和软件资源划分为安全(Secure World)和非安全(Normal World)两个世界。"

> "由于内存中的代码和数据都是明文，容易被同处于内存中的其它应用偷窥，因此出现了扩展的安全模块。"

> "AMBA3 AXI总线针对每一个信道的读写增加了一个额外的控制信号位，这个控制位叫做Non-Secure或者NS位。"

> "非安全世界的主设备尝试访问安全世界的从设备会引发访问错误。"

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/从硬件架构与软件架构看TrustZone-V2.0.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/从硬件架构与软件架构看TrustZone-V2.0.md|原始文章]]

## Open Questions

- TrustZone与RISC-V的MultiZone、Intel SGX等安全技术的对比
- TrustZone在物联网设备中的实际部署挑战

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/从硬件架构与软件架构看TrustZone-V2.0.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/从硬件架构与软件架构看TrustZone-V2.0.md|原始文章]]
