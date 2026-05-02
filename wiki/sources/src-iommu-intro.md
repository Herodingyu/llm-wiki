---
doc_id: src-iommu-intro
title: IOMMU 简介
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/什么是IOMMU？ - 匿名用户 的回答.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, iommu, virtualization, dma]
---

## Summary

本文介绍了 IOMMU（Input/Output Memory Management Unit）的基本概念和作用。IOMMU 连接 DMA-capable I/O 总线和主存，将设备访问的虚拟地址转换为物理地址。在虚拟化场景中，IOMMU 通过 GPA（Guest Physical Address）到 HPA（Host Physical Address）的映射，解决虚拟机 DMA 操作可能破坏 host 内存的问题。文章还分析了 QEMU 中 IOMMUFD 后端的实现，包括 MemoryListener 机制、iommufd_cdev_map 回调、以及 IOMMU_IOAS_MAP ioctl。

## Key Points

### 1. IOMMU 作用
- 允许系统设备在虚拟内存中寻址
- 将设备虚拟地址映射为物理内存地址
- 帮助系统扩充内存容量，提升性能
- 提供内存访问保护机制

### 2. IOMMU vs MMU
| | MMU | IOMMU |
|---|---|---|
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

**IOMMU_IOAS_MAP ioctl**
- 对象化设计：映射操作针对 IOAS ID 而非模糊 Container
- 解决 Legacy 模式下资源重复计费问题
- 引入更细粒度锁机制
- 原生支持大页（Huge Page）

## Evidence

- IOMMU 连接 DMA-capable I/O Bus 和 main memory
- AMD IOMMU 文档：VIRTUALIZING IO THROUGH THE IO MEMORY MANAGEMENT UNIT
- ARM SMMU（System MMU）是 IOMMU 的 ARM 实现

## Open Questions

- IOMMU 对设备直通性能的影响
- SMMUv3 与 SMMUv2 的关键差异

## Related Pages

- [[iommu]]
- [[smmu]]
- [[virtualization]]
- [[dma]]
