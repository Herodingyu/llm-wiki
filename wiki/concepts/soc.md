---
doc_id: soc
title: SoC（System on Chip）
page_type: concept
related_sources:
  - src-onechan-soc-peripheral-subsystem
  - src-onechan-soc-interconnect-subsystem
  - src-onechan-soc-memory-subsystem
  - src-onechan-soc-processor-subsystem
  - src-onechan-soc-low-power-design
related_entities: []
created: 2026-05-09
updated: 2026-05-09
tags: [concept, soc, architecture, system-design]
---

# SoC（System on Chip）

## 定义

SoC（System on Chip，系统级芯片）是将一个完整电子系统的核心功能集成到单一芯片上的设计方式。它通常包含处理器、存储器、外设接口、互联架构和电源管理等多个子系统，能够独立运行完整的软件栈。

## 核心理念

- **集成度决定竞争力**：SoC 的价值在于用一颗芯片替代原本需要多颗芯片组成的系统
- **子系统协同**：五大子系统（处理器、存储、互联、外设、电源）必须协同设计，而非简单堆砌
- **架构决定上限**：性能、功耗、成本的最终表现，70% 在架构阶段就已确定
- **软硬件协同**：硬件提供能力，软件释放潜力，接口设计是两者契约

## SoC 五大子系统

| 子系统 | 核心职责 | 关键指标 | 设计权衡 |
|--------|---------|---------|---------|
| **处理器子系统** | 计算与控制 | 性能、能效比、实时性 | 通用 vs 专用 |
| **存储子系统** | 数据存取 | 带宽、延迟、容量、功耗 | 速度 vs 成本 |
| **互联子系统** | 模块通信 | 带宽、延迟、仲裁效率 | 性能 vs 功耗 |
| **外设子系统** | 连接外部世界 | 接口种类、速率、兼容性 | 功能 vs 面积 |
| **低功耗设计** | 能耗管理 | 功耗、唤醒时间、漏电 | 性能 vs 续航 |

## SoC 设计层次

### 1. 架构级（Architecture）
- 确定子系统划分与互联拓扑
- 选择处理器类型与数量
- 规划存储层级与地址映射
- 定义电源域与时钟域

### 2. 微架构级（Micro-architecture）
- Cache 策略、总线协议、仲裁算法
- DMA 通道设计、中断路由
- 复位策略、时钟树设计

### 3. 实现级（Implementation）
- RTL 编码、综合、布局布线
- 时序收敛、功耗分析、物理验证

## 相关来源

- [[src-onechan-soc-peripheral-subsystem]] — 外设子系统
- [[src-onechan-soc-interconnect-subsystem]] — 互联子系统
- [[src-onechan-soc-memory-subsystem]] — 存储子系统
- [[src-onechan-soc-processor-subsystem]] — 处理器子系统
- [[src-onechan-soc-low-power-design]] — 架构级低功耗设计

## 开放问题

- Chiplet 架构是否会重新定义 SoC 的边界？
- RISC-V 生态成熟后，SoC 设计范式会如何变化？
- AI 加速器（NPU/TPU）是否会成为 SoC 的"第六大子系统"？
