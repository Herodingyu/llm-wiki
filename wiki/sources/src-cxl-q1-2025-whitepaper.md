---
doc_id: src-cxl-q1-2025-whitepaper
title: CXL Q1 2025 Whitepaper
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/computeexpresslink-wp-content-uploads-2025-02-CXL_Q1-2025-W.md
domain: tech/dram
created: 2026-05-02
updated: 2026-05-02
tags: [dram, cxl, whitepaper, memory-pooling]
---

# CXL Q1 2025 Whitepaper

## 来源

- **原始文件**: raw/tech/dram/computeexpresslink-wp-content-uploads-2025-02-CXL_Q1-2025-W.md
- **提取日期**: 2026-05-02

## Summary

CXL联盟于2025年第一季度发布的官方白皮书，全面阐述了Compute Express Link（CXL）互连技术的最新进展、市场趋势和生态建设成果。CXL作为一种开放的行业标准，基于PCIe 5.0/6.0物理层构建，通过CXL.io、CXL.cache和CXL.memory三种协议提供高性能、低延迟的CPU与设备间连接，并支持缓存一致性内存访问。白皮书重点介绍了CXL在内存扩展、池化和共享方面的技术优势，以及CXL 3.0引入的fabric能力如何支持多级交换和内存共享，为构建可组合、可扩展的数据中心基础设施提供技术蓝图。该文档反映了CXL技术从标准制定向大规模商业化部署的关键转折。

## Key Points

### 1. CXL技术架构

| 协议层 | 功能 | 应用场景 |
|--------|------|----------|
| CXL.io | 兼容PCIe协议，用于设备发现和配置 | I/O设备连接 |
| CXL.cache | 支持缓存一致性，允许设备共享CPU缓存 | 加速器、智能网卡 |
| CXL.memory | 提供直接内存访问，支持内存扩展和池化 | 内存扩展器、CXL内存模块 |

### 2. 标准演进路线

| 版本 | 发布时间 | 核心特性 |
|------|----------|----------|
| CXL 1.0/1.1 | 2019-2020 | 基础内存扩展能力 |
| CXL 2.0 | 2020 | 内存池化、热插拔、安全增强 |
| CXL 3.0 | 2022 | Fabric能力、多级交换、内存共享 |
| CXL 3.1 | 2023 | 增强结构管理、CXL IDE安全 |

### 3. 核心价值主张
- **内存扩展**：突破单CPU内存通道限制，扩展至TB级容量
- **内存池化**：跨服务器动态分配内存，解决内存搁浅问题
- **内存共享**：多主机共享同一物理内存，支持协同计算
- **资源分解**：计算与内存解耦，独立扩展和升级

### 4. 市场趋势与生态
- 数据中心工作负载（AI/ML、大数据分析）驱动内存需求激增
- 主要CPU厂商（Intel、AMD）和内存厂商（Samsung、SK Hynix、Micron）积极布局
- 与DDR5内存协同，构建分层内存架构
- 软件生态逐步成熟，操作系统和虚拟化层开始支持CXL内存

### 5. 技术基础
- 物理层基于PCIe 5.0/6.0，速率可达64-128 GT/s
- 保持缓存一致性，简化编程模型
- 支持内存一致性模型（Memory Coherence Model）
- 向后兼容PCIe生态系统

## Key Quotes

> "CXL is an open industry standard interconnect offering high-performance, low-latency connectivity between CPU and devices such as memory expanders and accelerators, with cache-coherent memory access."

> "CXL technology supports memory expansion, pooling, and sharing to improve data center resource utilization."

> "CXL 3.0 introduces fabric capabilities, supporting multi-level switching and memory sharing for composable infrastructure."

> "The whitepaper reflects the critical transition of CXL technology from standard development to large-scale commercial deployment."

## Related Pages

- [[cxm]] — CXL 内存模块概念
- [[cxl]] — CXL 互连标准实体
- [[mcrdimm]] — 高带宽内存扩展方案
- [[ddr5]] — CXL 基于 PCIe 物理层，与 DDR5 协同

## 开放问题

- CXL 3.0/3.1的生态系统落地时间表
- CXL与CCIX、UCIe等其他互连标准的关系和竞争格局
- CXL内存池化对系统软件栈的影响
