---
doc_id: src-mcrdimm-samsung-hpc
title: "Innovative Memory Solution: Samsung's MCRDIMM Targets High-Performance Computing"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/semiconductor-news-events-tech-blog-innovative-memory-.md
domain: tech/dram
created: 2026-05-02
updated: 2026-05-02
tags: [dram, mcrdimm, ddr5, hpc, ai, samsung]
---

# Innovative Memory Solution: Samsung's MCRDIMM Targets High-Performance Computing

## 来源

- **原始文件**: raw/tech/dram/semiconductor-news-events-tech-blog-innovative-memory-.md
- **提取日期**: 2026-05-02

## 摘要

三星半导体介绍其多列缓冲双列直插式内存模块（Multi-Ranked Buffered Dual In-Line Memory Module，MCRDIMM）。MCRDIMM通过将两个DDR5组件组合在一个DIMM上，使CPU能够同时访问两个rank，从而在不增加服务器主板内存插槽的情况下实现内存带宽翻倍，数据传输速度高达8.8 Gb/s，面向AI、ML和LLM处理等高性能计算应用。

## 关键要点

- MCRDIMM使现有DRAM组件的带宽翻倍，数据传输速度达8.8 Gb/s
- CPU可在单个DIMM上同时访问两个rank
- DRAM设备无需以更高的时钟频率运行
- 面向AI、机器学习和大型语言模型处理应用

## 技术细节

- MCRDIMM采用两个相同DDR5 DIMM的芯片组布局
- 通过DRAM上的特殊复用数据缓冲器（mux data buffer）实现同时对两个DIMM的访问
- 三星第一代MCRDIMM提供高达8.8 Gb/s的数据传输速率
- 正在采样16Gb Mono MCRDIMM设备，具备增强的性能、容量和功耗表现
- 关键技术是通过缓冲器实现双rank同时访问，而非提升DRAM核心频率

## Related Pages

- [[mcrdimm]] — 三星 MCRDIMM 技术详细介绍
- [[ddr5]] — MCRDIMM 基于 DDR5 技术构建
- [[cxm]] — 同为高带宽/高容量内存扩展方案
- [[3d-dram]] — 未来可能进一步提升 MCRDIMM 容量的技术
- [[samsung]] — MCRDIMM 技术开发者

## 开放问题

- MCRDIMM与标准DDR5控制器的兼容性要求
- 缓冲器引入的额外延迟对系统性能的影响
- MCRDIMM在主流服务器平台的采用前景
