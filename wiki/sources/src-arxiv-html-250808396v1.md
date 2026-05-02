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

## 摘要

本文提出了XDMA，一种分布式可扩展DMA架构，用于异构多加速器SoC中的布局灵活数据移动。XDMA通过硬件地址生成器替代软件循环，实现了高达151.2倍的链路利用率提升，同时面积开销小于2%。

## 关键要点

- XDMA引入数据流引擎作为前端，用硬件地址生成器替代软件循环
- 分布式DMA架构最大化链路利用率，将配置与数据传输分离
- 灵活插件支持传输过程中的实时数据操作
- 相比现有DMA方案面积开销<2%，功耗占系统17%

## 技术细节

- **架构组件**: XDMA Orchestration、XDMA Controller、XDMA Datapath
- **性能提升**: 合成工作负载中链路利用率提升151.2倍/8.2倍
- **实际应用**: 真实FPGA工作负载平均加速2.3倍
- **适用场景**: 矩阵布局变换、AI加速器内存访问

## Related Pages

- [[dma]] — XDMA 分布式可扩展 DMA 架构
- [[synopsys]] — Synopsys 提供 DMA IP
- [[qualcomm]] — SoC 中集成 DMA 控制器

## 开放问题

- XDMA在具体SoC设计中的集成复杂度如何？
- 与现有内存一致性协议的兼容性需要进一步验证
