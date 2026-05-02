---
doc_id: src-blog-chinamaoge-article-details-143466179
title: 汽车智能座舱软件架构
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/industry/car-infotainment/blog-chinamaoge-article-details-143466179.md
domain: industry/car-infotainment
created: 2026-05-02
updated: 2026-05-02
tags: [car-infotainment, cockpit]
---

# 汽车智能座舱软件架构

## 来源

- **原始文件**: raw/industry/car-infotainment/blog-chinamaoge-article-details-143466179.md
- **提取日期**: 2026-05-02

## 摘要

CSDN技术博客对智能座舱软件架构的系统介绍，涵盖从分布式架构到中央计算的演进、Hypervisor虚拟化技术、QNX+Android双系统架构，以及未来AI大模型域的架构猜想。

## 关键要点

- 汽车E/E架构从分布式向域控制器再向中央计算演进
- 主流座舱采用QNX（Host OS）+ Android Automotive（Guest OS）双系统架构
- Hypervisor技术实现硬件虚拟化，支持仪表和娱乐功能在同一SoC上运行
- 中央计算架构分三阶段：One Box → One Board → One Chip
- AI大模型域可能成为独立域，通过Hypervisor为座舱和智驾提供AI能力

## 产品/技术细节

**架构演进**:
- **One Box**: 各域控制器独立PCB，板间通过Ethernet（~125MB/s）
- **One Board**: 各域控芯片在同一块板子上，通过PCIe 4.0 x4（~8GB/s）
- **One Chip**: 各域功能作为SoC中的IP core，片内通信（~120Gb/s带宽）

**软件栈（Qualcomm平台示例）**:
- **QNX侧**: Infrastructure Service（Log/Power/Vehicle Signal/IPC/Display）、Cluster Service（仪表HMI）、APP（Unity/Unreal Engine）
- **Android侧**: APP → Framework → Native Service → HAL → BSP
- **MCU侧**: 基于AUTOSAR标准，处理总线信号和车控功能

**数据链路示例（空调控制）**:
Air Condition APP → Car Service → Vehicle HAL → FDBUS/SOME/IP → QNX Vehicle Signal Service → IPC Service → SPI → MCU CAN Service → CEM → 空调压缩机

**未来趋势**:
- Type1 Hypervisor架构（解耦Host OS和Hypervisor）
- MCU功能可能集成到SoC作为独立IP核
- 大模型域独立于座舱和智驾域，共享算力资源

## Related Pages

- [[smart-cockpit]] — 汽车智能座舱软件架构
- [[qualcomm]] — Snapdragon 座舱平台
- [[nvidia]] — DRIVE Thor 舱驾融合
- [[carplay]] — 手机与智能座舱的互联方案

## 开放问题

- 48V低压架构升级对中央计算平台功耗的承载能力
- MCU集成到SoC的安全性和实时性保障
- AI大模型域的资源调度和隔离机制设计
