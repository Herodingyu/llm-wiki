---
doc_id: cxm
title: CXM
page_type: concept
related_sources:
  - src-cxl-memory-module-cmm-b
  - src-cxl-fms-2024-anandtech
  - src-cxl-q1-2025-whitepaper
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, dram, cxl]
---

# CXM

## 定义

CXM（CXL Memory Module，CXL 内存模块）是基于 CXL（Compute Express Link）互连协议的内存扩展模块。CXL 是一种开放的行业标准互连技术，允许 CPU、GPU、AI 加速器等设备以缓存一致的方式共享内存资源，CXM 则是实现这一架构的物理内存模块形态。

## 技术细节

核心特性：

- **CXL 协议基础**：基于 PCIe 物理层，支持 CXL.io、CXL.cache 和 CXL.memory 三种协议
- **内存池化**：允许将多个 CXM 模块的内存资源整合为共享内存池，供多个处理器动态分配
- **缓存一致性**：CPU 可以直接访问 CXM 上的内存，保持缓存一致性
- **即插即用扩展**：无需修改现有软件即可扩展系统内存容量

CXL 内存扩展的优势：
- 突破单 CPU 的内存通道数量限制
- 实现内存与计算的解耦，独立扩展
- 支持异构计算架构（CPU + GPU + AI 加速器）共享统一内存空间
- 提高数据中心内存利用率，降低 TCO

技术演进：
- CXL 1.0/1.1：基础内存扩展
- CXL 2.0：引入内存池化和交换（Switching）
- CXL 3.0/3.1：增强的一致性、更大的拓扑结构和更高的带宽

## 相关来源

- [[src-cxl-memory-module-cmm-b]] — CXL 内存模块技术详解
- [[src-cxl-fms-2024-anandtech]] — CXL 在 FMS 2024 的最新进展
- [[src-cxl-q1-2025-whitepaper]] — CXL 技术白皮书

## 相关概念

- [[ddr5]] — CXM 通常基于 DDR5 DRAM 构建
- [[mcrdimm]] — 同为高带宽内存模块方案，面向不同应用场景
- [[3d-dram]] — 未来 CXM 可能采用的底层存储技术

## 相关实体

- [[cxl]] — CXL 互连标准实体
- [[samsung]] — 推出 CMM-B 机架级内存池化设备
- [[ddr5]] — CXM 通常基于 DDR5 DRAM 构建
