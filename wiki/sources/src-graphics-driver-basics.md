---
doc_id: src-graphics-driver-basics
title: 图形驱动基础
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/从内核小白到大神——图形驱动基础.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-03
tags: [bsp, graphics, gpu, driver, dma]
---

## Summary

本文从硬件架构角度介绍了图形驱动的基本概念。显卡包含 GPU（计算核心）、视频输出、显存（VRAM）、电源管理、主机交互总线等部件。重点讲解了 DMA（直接内存访问）机制、各种总线类型（PCI/AGP/PCI-X/PCI-E）的特性差异，以及显存的内部层次结构（内存平面 → bank → rank → subpartition → partition）。DMA 允许外设直接读写内存，无需 CPU 干预，可提高纹理上传和视频流性能，但在实时系统中可能因总线抢占导致错过截止时间。AGP 的 GART 特性是 IOMMU 的简单形式，可将非连续物理页映射为连续区域供 GPU 使用。

## Key Points

### 1. 显卡核心组件
| 组件 | 功能 |
|------|------|
| GPU | 执行所有计算 |
| 视频输出 | 连接屏幕 |
| 显存 (VRAM) | 存储纹理或通用数据 |
| 电源管理 | 降电压、调电流、风扇控制 |
| 主机交互总线 | 与 CPU 通信 |

### 2. DMA（直接内存访问）
- 外设无需 CPU 干预直接读写内存
- 提高纹理上传和视频流性能
- **Scatter-Gather**: 支持非连续内存页的 DMA
- **缺点**: 
  - 实时系统中可能抢占总线导致错过截止时间
  - 小数据传输设置开销可能大于收益

### 3. 总线类型对比
| 总线 | 特点 |
|------|------|
| PCI | 基本总线，支持总线主控（DMA），一致性好 |
| AGP | 改进版 PCI，速度更快（2x/4x/8x），支持 GART、边带寻址、快速写入 |
| PCI-X | 服务器版更快 PCI，图形外设较少 |
| PCI-E | 新一代，与 PCI 本质不同，广泛应用 |

### 4. AGP 特性详解
| 特性 | 说明 |
|------|------|
| GART | 图形光圈重映射表，IOMMU 的简单形式。将非连续物理页映射为连续区域供 GPU 使用 |
| 边带寻址 (SBA) | 8 个额外地址总线位 |
| 快速写入 (FW) | 直接向显卡发送数据，无需 GPU 启动 DMA |

**注意**: SBA 和 FW 在某些硬件上不稳定，常需芯片组特定 hack

### 5. 显存结构层次
```
内存平面 (memory plane) → 内存组 (memory bank) → 内存排 (memory rank)
→ 内存子分区 (memory subpartition) → 内存分区 (memory partition) → VRAM
```
- 每个平面是 R 行 × C 列的二维位数组
- 平面包含缓冲区（可容纳整行）
- DRAM 以行为单位读写

## Evidence

- AGP GART 区域不一致，需要显式刷新
- PCI 总线一致，无需显式刷新
- GPU 和 CPU 位于单芯片上的嵌入式系统中，CPU 可直接访问 GPU 寄存器

## Open Questions

- PCIe 与 PCI 在驱动开发层面的具体差异
- 现代 GPU（NVIDIA/AMD/ARM Mali）的显存管理差异

## Key Quotes

> "它的一个关键特性叫做总线控制，此功能允许给定的外围设备在给定的周期数内占用总线并执行完整的事务（称为DMA，直接内存访问）"

> "当blit发生在两个重叠的源表面和目标表面之间时，副本的语义并不是简单定义的"

> "另外，Morton和Hilbert曲线还支持3D空间的遍历："

## Related Pages

- [[gpu]]
- [[dma]]
- [[pci-e]]
- [[memory-management]]
