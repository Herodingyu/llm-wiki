---
doc_id: src-cxl-memory-module-cmm-b
title: CXL Memory Module Box (CMM-B)
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/semiconductor-news-events-tech-blog-cxl-memory-module-.md
domain: tech/dram
created: 2026-05-02
updated: 2026-05-02
tags: [dram, cxl, cmm-b, memory-pooling, rack-scale, samsung]
---

# CXL Memory Module Box (CMM-B)

## 来源

- **原始文件**: raw/tech/dram/semiconductor-news-events-tech-blog-cxl-memory-module-.md
- **提取日期**: 2026-05-02

## 摘要

三星半导体介绍其CXL内存模块盒（CXL Memory Module - Box，CMM-B）产品。CMM-B是一个基于Compute Express Link（CXL）技术的机架级内存池化设备，可与Supermicro机架级解决方案集成，实现内存资源的灵活分配和扩展，避免内存搁浅（memory stranding），降低TCO。

## 关键要点

- CMM-B是业界首个机架级内存解决方案，用于可扩展和可组合的分层内存基础设施
- 支持多达24个E3.S CXL内存模块（CMM-D），最大容量24TB
- 兼容CXL 1.1和CXL 2.0协议
- 配备Samsung Cognos Management Console（SCMC）管理软件

## 技术细节

- CMM-B提供三种核心能力：
  - 分层内存分配：将内存容量作为池化资源在多台服务器间共享
  - 可组合内存编排：允许内存池在多个主机间组合和共享
  - 可扩展内存扩展：将可用内存组合成更大的池并按需分配
- 硬件包括TOR交换机、CMM-B设备、应用服务器和SCMC
- SoC交换机芯片通过CXL协议确保电源效率
- 支持通过REST API进行设备管理
- SCMC提供GUI和内存分配分析仪表板

## Related Pages

- [[cxm]] — CXL 内存模块技术详解
- [[cxl]] — CXL 互连标准实体
- [[ddr5]] — CXM 通常基于 DDR5 DRAM 构建
- [[samsung]] — CMM-B 机架级内存池化设备
- [[3d-dram]] — 未来 CXM 可能采用的底层存储技术

## 开放问题

- CMM-B在实际数据中心部署中的性能表现
- CXL 2.0/3.0内存池化对操作系统和应用程序的透明性
- 与现有内存架构的集成复杂度
