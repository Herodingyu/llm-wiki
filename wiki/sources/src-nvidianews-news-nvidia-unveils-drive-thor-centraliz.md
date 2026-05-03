---
doc_id: src-nvidianews-news-nvidia-unveils-drive-thor-centraliz
title: NVIDIA Unveils DRIVE Thor — Centralized Car Computer Unifying Cluster, Infotainment, Automated Driving, and Parking
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/industry/car-infotainment/nvidianews-news-nvidia-unveils-drive-thor-centraliz.md
domain: industry/car-infotainment
created: 2026-05-02
updated: 2026-05-02
tags: [car-infotainment, cockpit, nvidia]
---

# NVIDIA Unveils DRIVE Thor — Centralized Car Computer Unifying Cluster, Infotainment, Automated Driving, and Parking

## 来源

- **原始文件**: raw/industry/car-infotainment/nvidianews-news-nvidia-unveils-drive-thor-centraliz.md
- **提取日期**: 2026-05-02

## 摘要

2022年9月，NVIDIA在GTC大会上发布了DRIVE Thor——下一代集中式车载计算机。作为NVIDIA DRIVE平台的旗舰产品，DRIVE Thor实现了高达2000 teraflops的FP8算力，将自动驾驶（AD）、高级驾驶辅助（ADAS）、自动泊车、驾驶员/乘员监控（DMS/OMS）、数字仪表集群（Cluster）和信息娱乐（IVI）等功能统一整合于单一芯片架构之上，代表了汽车电子电气架构向中央计算演进的最前沿技术。

DRIVE Thor采用了NVIDIA最新的多域融合架构，集成Hopper Multi-Instance GPU（MIG）、Grace CPU和Ada Lovelace GPU三大核心组件。其中最具创新性的是集成了业界首个Transformer推理引擎，可加速基于Transformer的深度学习网络推理性能高达9倍。通过NVLink-C2C芯片互联技术，DRIVE Thor支持在同一芯片上运行多个操作系统，实现功能安全域和信息娱乐域的物理隔离。极氪（ZEEKR）成为DRIVE Thor的首个量产客户，计划2025年初实现装车量产，这将是有史以来性能最强的车载计算平台之一。

## 关键要点

### 核心性能指标

| 参数 | 规格 |
|------|------|
| **算力** | 2000 TFLOPS (FP8精度) |
| **架构** | Hopper MIG GPU + Grace CPU + Ada Lovelace GPU |
| **Transformer加速** | 推理性能提升最高9倍 |
| **多系统支持** | NVLink-C2C，支持多OS并行运行 |
| **功能安全** | >15,000工程年投入，符合ISO 26262 |
| **量产客户** | 极氪（ZEEKR），2025年初量产 |

### 舱驾融合架构

DRIVE Thor是业界首批实现真正"舱驾融合"（Cockpit-ADAS Integration）的集中式计算平台：

- **功能整合**: 自动驾驶 + ADAS + 泊车 + DMS/OMS + 数字仪表 + 信息娱乐
- **资源共享**: 统一算力池按需分配给不同功能域
- **成本优化**: 替代多个独立ECU，降低线束和BOM成本
- **软件定义**: 支持OTA持续升级，功能可迭代扩展

### Transformer引擎创新

- **业界首个**: 集成Transformer推理引擎的自动驾驶平台
- **性能提升**: Transformer DNN推理加速最高达9倍
- **应用价值**: 加速BEV（鸟瞰图）、Occupancy Network等先进智驾算法
- **精度保持**: FP8精度下不牺牲模型推理准确度

### 多实例GPU（MIG）技术

- **资源隔离**: 通过硬件级虚拟化将GPU划分为多个独立实例
- **多租户**: 不同功能域（智驾、座舱）共享GPU但互不干扰
- **灵活调度**: 根据场景需求动态分配算力资源
- **功能安全**: 硬件级隔离满足ASIL等级要求

### 与DRIVE家族对比

| 平台 | 算力 | 定位 | 架构 |
|------|------|------|------|
| **DRIVE Orin** | 254 TOPS | 当前主流 | Ampere GPU |
| **DRIVE Atlan** | 1000 TOPS | 已取消 | 原计划继任者 |
| **DRIVE Thor** | 2000 TFLOPS | 下一代旗舰 | Hopper+Grace+Ada |

## 关键引用

> "DRIVE Thor achieves up to 2000 teraflops of performance, unifying automated driving, parking, driver and occupant monitoring, digital instrument cluster, and infotainment in a single architecture."

> "The first automotive platform to integrate a Transformer inference engine, accelerating Transformer DNN inference performance by up to 9x."

> "With FP8 precision, DRIVE Thor delivers 2000 teraflops without sacrificing accuracy."

> "Over 15,000 engineering years invested in functional safety, meeting ISO 26262 standards."

> "ZEEKR is the first customer, with production planned for early 2025."

## Related Pages

- [[smart-cockpit]] — NVIDIA DRIVE Thor 舱驾融合平台
- [[nvidia]] — DRIVE Thor 集中式车载计算机
- [[qualcomm]] — Snapdragon 座舱平台竞争者
- [[mediatek]] — Dimensity Auto 座舱平台竞争者
- [[dms]] — DRIVE Thor 平台集成的 DMS 方案
- [[oms]] — DRIVE Thor 平台集成的 OMS 方案

## 开放问题

- 2000 TOPS算力在实际车载场景中的利用率
- 舱驾融合架构下的功能安全与信息安全平衡
- 与Qualcomm等竞争对手的差异化定位
