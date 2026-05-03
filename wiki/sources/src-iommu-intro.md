---
doc_id: src-iommu-intro
title: IOMMU 简介
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/什么是IOMMU？ - 匿名用户 的回答.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-03
tags: [bsp, iommu, virtualization, dma]
---

## Summary

本文介绍了 IOMMU（Input/Output Memory Management Unit）的基本概念和核心作用。IOMMU 连接 DMA-capable I/O 总线和主存，将设备访问的虚拟地址转换为物理地址。在虚拟化场景中，IOMMU 通过 GPA（Guest Physical Address）到 HPA（Host Physical Address）的映射，解决虚拟机 DMA 操作可能破坏 host 内存的问题。文章还深入分析了 QEMU 中 IOMMUFD 后端的实现，包括 MemoryListener 机制、iommufd_cdev_map 回调、IOMMU_IOAS_MAP ioctl，以及 IOMMUFD 相比 Legacy VFIO 在锁机制、Pinning 优化和大页对齐方面的改进。

## Key Points

### 1. IOMMU 核心作用
- 允许系统设备在虚拟内存中寻址
- 将设备虚拟地址映射为物理内存地址
- 帮助系统扩充内存容量，提升性能
- 提供内存访问保护机制

### 2. IOMMU vs MMU
| 对比项 | MMU | IOMMU |
|--------|-----|-------|
| 转换方向 | CPU 虚拟地址 → 物理地址 | 设备虚拟地址 → 物理地址 |
| 保护对象 | CPU 访问 | 设备 DMA 访问 |

### 3. 虚拟化中的应用
- Guest OS 不知道 host-physical 内存地址
- 虚拟机 DMA 可能破坏 host 内存
- IOMMU 根据 GPA→HPA 转换表重新映射设备访问地址

### 4. QEMU IOMMUFD 后端
**MemoryListener 机制**
- 虚拟机内存布局变化时触发
- `vfio_memory_listener` 调用 `.dma_map` 回调

**iommufd_cdev_map**
```c
static int iommufd_cdev_map(const VFIOContainerBase *bcontainer, hwaddr iova,
                            ram_addr_t size, void *vaddr, bool readonly) {
    return iommufd_backend_map_dma(container->be, container->ioas_id,
                                   iova, size, vaddr, readonly);
}
```

**IOMMU_IOAS_MAP ioctl 优势**
| 特性 | Legacy VFIO | IOMMUFD |
|------|------------|---------|
| 设计模式 | 针对模糊 Container | 对象化设计（IOAS ID） |
| 资源计费 | 重复计费 | Unified Pinning Accounting |
| 锁机制 | 大锁（Mutex） | 细粒度锁（IOAS 级别） |
| 大页支持 | 有限 | 原生支持 |

### 5. IOMMUFD 性能优化
- **对象级锁**: 锁粒度下降到 IOAS 对象级别
- **统一 Pinning 计费**: 避免共享内存重复计费
- **大页对齐**: 减少 IOTLB Miss，提升 100G/200G RDMA 性能

## Evidence

- IOMMU 连接 DMA-capable I/O Bus 和 main memory
- AMD IOMMU 文档：VIRTUALIZING IO THROUGH THE IO MEMORY MANAGEMENT UNIT
- ARM SMMU（System MMU）是 IOMMU 的 ARM 实现

## Open Questions

- IOMMU 对设备直通性能的影响
- SMMUv3 与 SMMUv2 的关键差异

## Key Quotes

> "IOMMU允许系统设备在虚拟内存中进行寻址，也就是将虚拟内存地址映射为物理内存地址，让实体设备可以在虚拟的内存环境中工作"

> "即如何建立 Guest Physical Address (GPA) 到 Host Physical Address (HPA) 的映射关系，并将其填入 IOMMU 的硬件页表中，使得直通设备能够正确访问虚拟机内存"

> "IOMMUFD 不仅解决了 Legacy 模式下的资源重复计费问题，还引入了更细粒度的锁机制以及对大页（Huge Page）的原生友好支持"

## Related Pages

- [[iommu]]
- [[smmu]]
- [[virtualization]]
- [[dma]]
