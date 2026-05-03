---
doc_id: src-tee中的scmi服务与scp固件
title: TEE中的SCMI服务与SCP固件
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE中的SCMI服务与SCP固件.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文详细介绍了SCMI（System Control and Management Interface）标准化接口及其在TEE环境中的实现。SCMI覆盖电源域管理、性能管理、时钟管理、传感器管理、复位管理和电压域管理，通过定义统一的命令、消息和数据结构，为操作系统、固件和硬件提供通用通信接口。文章重点阐述了SCMI server在OP-TEE中的架构设计，包括基于共享内存的传输层、多通道并发支持（最多8条待处理消息）、以及与Linux/U-Boot的集成方案，展示了如何通过SCP固件（运行在Cortex-M微控制器）减轻AP处理器负载。

## Key Points

### 1. SCMI 核心功能
| 管理域 | 说明 |
|--------|------|
| **电源域管理** | 控制芯片/模块的电源开关，实现低功耗状态 |
| **电压域管理** | 配置供电电压，支持动态调压（DVFS） |
| **性能管理** | 调整系统参数，优化运行效率 |
| **时钟管理** | 控制设备时钟频率和同步 |
| **传感器管理** | 温度、湿度、压力等传感器数据采集 |
| **复位管理** | 系统故障时的复位操作 |

### 2. SCMI 架构组件
- **AP（应用处理器）**：通过安全或非安全通道发送SCMI命令
- **SCP（系统控制处理器）**：微控制器（Cortex-M），协调请求并驱动硬件状态
- **通信通道**：硬件mailbox实现AP与SCP间通信

### 3. OP-TEE 中的 SCMI Server
- **传输层**：OP-TEE共享内存 + OP-TEE调用命令
- **并发支持**：每个通道最多8条待处理消息，按顺序处理
- **多通道**：每个传输通道对应一个OP-TEE会话，允许多请求并发
- **集成**：支持Linux OP-TEE传输层、U-Boot OP-TEE传输层

### 4. SCP 固件
- **实现**：针对Cortex-M处理器的开源固件（SCP-firmware）
- **功能**：基于硬件mailbox提供SCMI服务
- **优势**：统一软件栈，支持不同硬件配置，最大化软件复用

## Key Quotes

> "SCMI通过定义一组命令、消息和数据结构，为操作系统、虚拟机、固件和硬件提供一个通用的通信接口。"

> "应用处理器可以通过安全或者非安全通道发送SCMI命令给微控制器，微控制器则协调来自所有这些请求，并将硬件驱动到适当的电源或性能状态。"

> "对所有配置使用一个SW，最大限度地重用软件。"

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE中的SCMI服务与SCP固件.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE中的SCMI服务与SCP固件.md|原始文章]]

## Open Questions

- SCMI协议不同版本的功能差异和迁移策略
- 多通道并发场景下的消息优先级和死锁处理

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE中的SCMI服务与SCP固件.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE中的SCMI服务与SCP固件.md|原始文章]]

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE中的SCMI服务与SCP固件.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE中的SCMI服务与SCP固件.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE中的SCMI服务与SCP固件.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE中的SCMI服务与SCP固件.md|原始文章]]
