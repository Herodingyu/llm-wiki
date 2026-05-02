---
doc_id: mcrdimm
title: MCRDIMM
page_type: concept
related_sources:
  - src-mcrdimm-samsung-hpc
  - src-ddr5-signal-integrity-ema
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, dram, hpc]
---

# MCRDIMM

## 定义

MCRDIMM（Multi-Ranked Buffered Dual In-Line Memory Module，多列缓冲双列直插式内存模块）是三星推出的创新内存解决方案。通过在单个 DIMM 上集成两个 rank 并配备特殊的数据缓冲器，MCRDIMM 使 CPU 能够同时访问两个 rank，从而在不增加主板内存插槽的情况下实现内存带宽翻倍。

## 技术细节

核心技术原理：

- **双 Rank 同时访问**：采用两个相同 DDR5 DIMM 的芯片组布局
- **复用数据缓冲器（Mux Data Buffer）**：通过 DRAM 上的特殊缓冲器实现同时对两个 DIMM 的访问
- **无需提升核心频率**：DRAM 设备无需以更高的时钟频率运行，通过并行化提升带宽
- **数据传输速率**：第一代 MCRDIMM 提供高达 8.8 Gb/s 的数据传输速率

性能特点：
- 内存带宽较标准 DDR5 DIMM 翻倍
- 面向 AI、机器学习和大型语言模型（LLM）处理等高性能计算应用
- 正在采样 16Gb Mono MCRDIMM 设备，具备增强的性能、容量和功耗表现

设计考量：
- 缓冲器引入的额外延迟对系统性能的影响需要评估
- 与标准 DDR5 控制器的兼容性要求
- 在主流服务器平台的采用前景取决于生态建设

## 相关来源

- [[src-mcrdimm-samsung-hpc]] — 三星 MCRDIMM 技术详细介绍
- [[src-ddr5-signal-integrity-ema]] — DDR5 信号完整性对高密度模块设计的要求

## 相关概念

- [[ddr5]] — MCRDIMM 基于 DDR5 技术构建
- [[cxm]] — 同为高带宽/高容量内存扩展方案
- [[3d-dram]] — 未来可能进一步提升 MCRDIMM 容量的技术

## 相关实体

- [[samsung]] — MCRDIMM 技术开发者
- [[ddr5]] — 基于 DDR5 的高带宽模块
