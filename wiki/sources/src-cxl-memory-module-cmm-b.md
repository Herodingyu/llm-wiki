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

## Summary

三星半导体推出的CXL内存模块盒（CXL Memory Module Box，CMM-B）是业界首个机架级内存池化解决方案。该产品基于Compute Express Link（CXL）开放互连标准，与Supermicro机架级解决方案深度集成，旨在构建可扩展、可组合的分层内存基础设施。CMM-B支持多达24个E3.S CXL内存模块（CMM-D），最大容量可达24TB，兼容CXL 1.1和CXL 2.0协议。通过三星Cognos Management Console（SCMC）管理软件，实现内存资源的灵活分配、池化和编排，有效解决数据中心常见的"内存搁浅"（Memory Stranding）问题，显著降低总体拥有成本（TCO）。该产品标志着CXL技术从概念验证向商业化部署的重要迈进。

## Key Points

### 1. 产品定位与架构
- 业界首个机架级CXL内存池化设备
- 与Supermicro机架级解决方案集成
- 构建分层内存基础设施：本地DRAM + CXL扩展内存
- 解决内存搁浅问题，提升资源利用率

### 2. 硬件规格

| 规格项 | 参数 |
|--------|------|
| 支持模块 | 最多24个E3.S CMM-D |
| 最大容量 | 24TB |
| 协议支持 | CXL 1.1 / CXL 2.0 |
| 核心组件 | TOR交换机、CMM-B设备、应用服务器 |
| 交换机芯片 | 专用SoC，优化电源效率 |

### 3. 三大核心能力

| 能力 | 描述 | 价值 |
|------|------|------|
| 分层内存分配 | 内存容量作为池化资源在多服务器间共享 | 提高利用率，避免资源浪费 |
| 可组合内存编排 | 内存池在多个主机间组合和共享 | 灵活匹配工作负载需求 |
| 可扩展内存扩展 | 可用内存组合成更大池并按需分配 | 随需扩展，降低前期投入 |

### 4. 管理软件（SCMC）
- Samsung Cognos Management Console提供统一管理平台
- 支持GUI界面和REST API接口
- 提供内存分配分析仪表板
- 实时监控和优化内存资源使用

### 5. 应用场景
- AI/ML训练：大模型需要TB级内存
- 内存数据库：Redis、SAP HANA等内存密集型应用
- 虚拟化环境：动态调整虚拟机内存分配
- 云计算：按需分配内存资源，提高多租户效率

## Key Quotes

> "CMM-B is the industry's first rack-scale memory solution for scalable and composable tiered memory infrastructure."

> "Supporting up to 24 E3.S CXL memory modules (CMM-D) with maximum capacity of 24TB."

> "Tiered memory allocation: share memory capacity as a pooled resource across multiple servers."

> "Composable memory orchestration: allow memory pools to be composed and shared across multiple hosts."

> "Scalable memory expansion: combine available memory into larger pools and allocate on demand."

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
