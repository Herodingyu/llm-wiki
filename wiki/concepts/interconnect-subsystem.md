---
doc_id: interconnect-subsystem
title: 互联子系统（Interconnect Subsystem）
page_type: concept
related_sources:
  - src-onechan-soc-interconnect-subsystem
related_entities: []
created: 2026-05-09
updated: 2026-05-09
tags: [concept, soc, interconnect, bus, noc, axi, apb, ahb]
---

# 互联子系统（Interconnect Subsystem）

## 定义

互联子系统是 SoC 内部的"道路和桥梁"，负责在不同模块之间传输数据和控制信号。它的设计直接影响系统性能、功耗和可扩展性。

## 核心理念

- **不是所有模块都该走"高速公路"**：低速外设挂 APB，高性能模块走 AXI，中间通过桥接连接
- **分层互联**：根据带宽需求和功耗预算选择合适总线层级
- **仲裁决定体验**：多主设备竞争时，仲裁策略决定系统响应

## 互联架构类型

### 1. 总线型（Bus-Based）
| 总线 | 带宽 | 典型连接 | 特点 |
|------|------|---------|------|
| AXI4 | 高 | CPU、GPU、DMA、DDR | 多通道、乱序、突发传输 |
| AHB | 中 | 中等性能外设 | 流水线、单时钟边沿 |
| APB | 低 | 低速外设 | 简单、低功耗、无流水线 |

### 2. 交叉开关（Crossbar）
- 多主多从全连接或部分连接
- 无仲裁冲突时可并行传输
- 面积随端口数平方增长

### 3. 片上网络（NoC, Network-on-Chip）
- 路由器节点 + 链路组成网格拓扑
- 适合超多核、大规模 SoC
- 支持 QoS、多播、容错路由

## 关键设计要素

### 仲裁策略
| 策略 | 特点 | 适用场景 |
|------|------|---------|
| 固定优先级 | 简单、低延迟 | 有明确主次关系的系统 |
| 轮询 | 公平、无饥饿 | 同级设备竞争 |
| 加权轮询 | 兼顾公平与优先级 | 多媒体系统 |
| 突发配额 | 限制单次占用时长 | 防止某设备垄断总线 |

### QoS 机制
- 优先级标签（AXI QoS 信号）
- 带宽预留与流量整形
- 超时与死锁检测

### 一致性支持
- ACE/CHI 协议：多核 Cache 一致性
- 监听过滤器（Snoop Filter）：减少广播开销
- 系统级缓存（System Cache）：共享缓存层级

## 相关来源

- [[src-onechan-soc-interconnect-subsystem]] — SoC（2）：浅谈互联子系统

## 开放问题

- NoC 在中等规模 SoC（4-8 核）中是否值得采用？
- CXL/UCie 等片外互联标准是否会改变 SoC 内部架构？
