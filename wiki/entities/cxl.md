---
doc_id: cxl
title: CXL (Compute Express Link)
page_type: entity
entity_type: standard
related_sources: [src-cxl-q1-2025-whitepaper, src-cxl-memory-module-cmm-b, src-cxl-fms-2024-anandtech, src-mcrdimm-samsung-hpc]
related_concepts: [concept-memory-expansion, concept-memory-pooling, concept-pcie, concept-data-center]
created: 2026-05-02
updated: 2026-05-02
tags: [entity, standard, interconnect, memory, data-center]
---

# CXL (Compute Express Link)

## 概述

CXL（Compute Express Link）是一种开放的高速互连标准，基于PCIe物理层构建，旨在实现CPU与加速器、内存扩展设备之间的一致性内存访问。CXL由Intel主导发起，于2019年正式成立CXL联盟，成员包括AMD、Google、Microsoft、Samsung、Micron等业界巨头。CXL主要应用于数据中心，解决AI/ML工作负载带来的内存容量和带宽扩展需求。CXL 2.0引入内存池化和交换功能，CXL 3.0进一步提升带宽和拓扑灵活性。

## 关键事实

- 2019年由Intel主导成立，现已成为业界主流内存扩展标准
- 基于PCIe 5.0/6.0物理层，提供缓存一致性内存访问
- CXL 2.0支持内存池化和交换，CXL 3.0支持更复杂的拓扑
- 主要应用场景：AI/ML训练、内存数据库、高性能计算
- Samsung、Micron等存储厂商推出CXL内存模块（CMM）
- 2024年闪存峰会（FMS 2024）显示CXL生态正在快速成熟

## 产品/技术

- **CXL.mem**：内存扩展协议，允许CPU访问外部DRAM
- **CXL.io**：I/O兼容协议，基于PCIe
- **CXL.cache**：缓存一致性协议
- **CXL内存模块（CMM）**：基于CXL的内存扩展卡
- **内存池化**：跨服务器共享内存资源
- **内存分层**：将CXL内存作为DDR的扩展层

## 相关来源

- [[src-cxl-fms-2024-anandtech]] — FMS 2024 CXL技术动态
- [[src-cxl-memory-module-cmm-b]] — CXL内存模块技术
- [[src-cxl-q1-2025-whitepaper]] — CXL市场白皮书
- [[src-mcrdimm-samsung-hpc]] — Samsung内存扩展方案

## 相关概念

- [[cxm]] — CXL解决数据中心内存扩展需求
- [[cxm]] — CXL 2.0+支持跨设备内存共享
- [[cxl]] — CXL基于PCIe物理层
- [[cxm]] — CXL主要面向数据中心和AI应用
