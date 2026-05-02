---
doc_id: iommu
title: IOMMU（IO 内存管理单元）
page_type: concept
related_sources:
  - src-iommu-intro
  - src-graphics-driver-basics
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, bsp, virtualization]
---

# IOMMU（Input/Output Memory Management Unit）

## 定义

IOMMU 是一种内存管理单元，负责将设备（DMA-capable）访问的虚拟地址转换为物理地址。它是 MMU 的 IO 版本，为 DMA 操作提供地址转换和内存保护。

## IOMMU vs MMU

| | MMU | IOMMU |
|---|---|---|
| 服务对象 | CPU | 设备（DMA） |
| 转换方向 | CPU 虚拟地址 → 物理地址 | 设备虚拟地址（IOVA）→ 物理地址 |
| 保护对象 | CPU 内存访问 | 设备 DMA 访问 |
| TLB | TLB（Translation Lookaside Buffer） | IOTLB |

## 核心功能

### 1. 地址转换
- 设备使用虚拟地址（IOVA）发起 DMA
- IOMMU 根据页表转换为物理地址
- 支持多级页表（类似 MMU）

### 2. 内存保护
- 防止设备访问未授权的内存区域
- 隔离不同设备的 DMA 空间
- 防止恶意设备破坏内存

### 3. 虚拟化支持
- **设备直通（Passthrough）**：设备直接分配给虚拟机
- **GPA→HPA 转换**：虚拟机物理地址到宿主机物理地址
- **VFIO**：用户态设备驱动框架

## 虚拟化中的 IOMMU

```
Guest VM          Host
   |                |
   v                v
GPA (Guest PA)   HPA (Host PA)
   |                |
   v                v
IOMMU (转换)      物理内存
   |
   v
HPA
```

## IOMMU 实现

| 厂商 | 实现 | 说明 |
|------|------|------|
| Intel | VT-d | Virtualization Technology for Directed I/O |
| AMD | AMD-Vi | AMD Virtualization I/O |
| ARM | SMMU | System MMU |

## QEMU 中的 IOMMU

- **Legacy VFIO**: `VFIO_IOMMU_MAP_DMA` ioctl
- **IOMMUFD**: 新后端，对象化设计
  - 精准指向 IOAS ID
  - 解决资源重复计费
  - 原生支持大页（Huge Page）

## 相关来源

- [[src-iommu-intro]] — IOMMU 简介与 QEMU 实现
- [[src-graphics-driver-basics]] — GPU、DMA、PCIe
