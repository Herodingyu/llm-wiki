---
doc_id: src-arxiv-html-250808396v1
title: "XDMA: A Distributed, Extensible DMA Architecture for Layout-Flexible Data Movements in Heterogeneous Multi-Accelerator SoCs"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/arxiv-html-250808396v1.md
domain: tech/peripheral
created: 2026-05-02
updated: 2026-05-02
tags: [peripheral, dma, soc, accelerator]
---

# XDMA: A Distributed, Extensible DMA Architecture for Layout-Flexible Data Movements in Heterogeneous Multi-Accelerator SoCs

## 来源

- **原始文件**: raw/tech/peripheral/arxiv-html-250808396v1.md
- **提取日期**: 2026-05-02

## Summary

随着AI工作负载日益依赖异构加速器，加速器内存之间高带宽且布局灵活的数据移动成为关键挑战。传统DMA引擎仅支持连续内存访问，非连续数据布局变换需依赖软件循环控制，导致控制开销过大、片上互连带宽利用率低下。本文提出XDMA，一种分布式可扩展DMA架构，通过三大创新解决该问题：(1) 数据流引擎作为XDMA前端，用硬件地址生成器替代软件循环；(2) 分布式DMA架构最大化链路利用率，将配置传输与数据传令分离；(3) 灵活的插件机制支持传输过程中的实时数据操作。在合成工作负载中，XDMA相比软件实现链路利用率提升高达151.2倍；在真实FPGA工作负载（DeepSeek-V3 KV-cache预填充/加载）中平均加速2.3倍。ASIC综合结果显示，XDMA面积开销不到现有DMA方案的2%，功耗占加速器集群总功耗的17%。

## Key Points

### 架构设计

| 组件 | 功能 | 特点 |
|------|------|------|
| XDMA Orchestration | 协调读写请求 | 两阶段电路交换协议（CFG + Data），去耦合读写端口 |
| XDMA Controller | 指令解析与配置路由 | 将CSR指令转为XDMACfg结构，路由至本地或远程XDMA单元 |
| XDMA Frontend | 内存访问接口 | N维仿射地址生成器 + 数据缓冲区，支持灵活内存访问模式 |
| XDMA Plugin | 实时数据处理 | 标准化接口，支持读写端级联插件，实现传输中数据操作 |
| XDMA Backend | AXI互连兼容层 | 虚拟隧道映射，AXI主/从双模式，支持全双工传输 |

### 与SoTA DMA对比

| 特性 | XDMA | HyperDMA | ESP DMA | Gemmini DMA | AMD DMA v7.1 | TI EDMA3 |
|------|------|----------|---------|-------------|--------------|----------|
| 架构 | **分布式** | 分布式 | 单体 | 单体 | 单体 | 单体 |
| 地址生成 | **N维仿射** | N维 | 1维 | 2维 | 可选2维 | 3维 |
| 数据访问 | **直接精细粒度** | 直接粗粒度 | 经互连 | 经互连 | 经互连 | 经互连 |
| 传输中计算 | **灵活插件** | 无 | 无 | 转置/缩放 | 无 | 无 |
| 开源 | **是** | 否 | 是 | 是 | 否 | 否 |

### 性能评估

- **合成工作负载**：4D矩阵reshape任务中，XDMA9相比软件循环+iDMA提升**151.2×**链路利用率
- **对比专用加速器**：相比DMA+专用布局变换加速器方案提升**2.4×**
- **真实工作负载**：DeepSeek-V3 KV-cache预填充/加载场景平均加速**2.3×**
- **面积开销**：XDMA9仅占FPGA集群面积的7.6%，ASIC实现不到SoTA DMA的**2%**
- **功耗占比**：执行1D拷贝任务时占加速器集群总功耗的**17%**

### 应用场景

1. **AI加速器内存布局变换**：GeMM加速器与SIMD加速器之间的数据格式转换（如MNM8N8 ↔ MN）
2. **LLM KV-cache管理**：跨集群KV-cache预填充、加载与转置操作
3. **多加速器SoC数据编排**：异构加速器间的灵活数据移动，避免软件控制瓶颈

## Key Quotes

> "As modern AI workloads increasingly rely on heterogeneous accelerators, ensuring high-bandwidth and layout-flexible data movements between accelerator memories has become a pressing challenge."

> "XDMA demonstrates up to 151.2× higher link utilization than software-based implementations in synthetic workloads and achieves 2.3× average speedup over accelerators with SoTA DMA in real-world applications."

> "Our design incurs <<2% area overhead over SoTA DMA solutions while consuming 17% of system power."

> "XDMA proves that co-optimizing memory access, layout transformation, and interconnect protocols is key to unlocking heterogeneous multi-accelerator SoC performance."

> "We replace software-managed loops by a hardware solution, enabling N-dimensional affine address generation with minimal bandwidth penalties."

## Related Pages

- [[dma]] — XDMA 分布式可扩展 DMA 架构
- [[synopsys]] — Synopsys 提供 DMA IP
- [[qualcomm]] — SoC 中集成 DMA 控制器

## 开放问题

- XDMA在具体SoC设计中的集成复杂度如何？
- 与现有内存一致性协议的兼容性需要进一步验证
