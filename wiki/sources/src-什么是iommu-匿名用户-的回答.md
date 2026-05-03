---
doc_id: src-什么是iommu-匿名用户-的回答
title: 什么是IOMMU？   匿名用户 的回答
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/什么是IOMMU？ - 匿名用户 的回答.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

85 人赞同了该回答 ![](https://pic1.zhimg.com/50/v2-2fd7afc1e1898053f4671cd423bba909_720w.jpg?source=2c26e567) IOMMU 作用。 IOMMU允许系统设备在 虚拟内存 中进行寻址，也就是将虚拟内存地址映射为 物理内存 地址，让实体设备可以在虚拟的内存环境中工作，这样可以帮助系统扩充内存容量，提升性能。 什么是IOMMU？ 在计算机领域，IOMMU（Input/Output Memory Management Unit）是一个内存管理单元（Memory Management Unit），它的作用是连接 

## Key Points

### 1. 简介与背景
在虚拟化 I/O 的世界里，无论上层管理面（如对象模型、设备绑定）如何重构，数据面最核心的任务始终未变—— **DMA 映射（DMA Mapping）** 。即如何建立 Guest Physical Address (GPA) 到 Host Physical Address (HPA) 的映射关系，并将其填入 IOMMU 的硬件页表中，使得直通设备能够正确访问虚拟机内存。

### 2. 2\. QEMU 侧实现：从 MemoryListener 到 IOMMU\_IOAS\_MAP
QEMU 维护内存映射的机制是通用的 **MemoryListener** 。当虚拟机的内存布局发生变化（如启动时的 RAM 分配、内存热插拔）时， `vfio_memory_listener` 会被触发，进而调用后端的 `.dma_map` 回调。

### 3. 2.1 入口：iommufd\_cdev\_map
在 `hw/vfio/iommufd.c` 中，IOMMUFD 容器实现了该回调： ``` /* hw/vfio/iommufd.c */ static int iommufd_cdev_map(const VFIOContainerBase *bcontainer, hwaddr iova,

### 4. 2.2 后端封装：iommufd\_backend\_map\_dma
代码下沉到 `backends/iommufd.c` ，这里是 QEMU 与内核 ABI 交互的边界。 ``` /* backends/iommufd.c */ int iommufd_backend_map_dma(IOMMUFDBackend *be, uint32_t ioas_id, hwaddr iova,

### 5. 3\. 内核深度解析：性能优化的幕后
当 `ioctl(IOMMU_IOAS_MAP)` 进入 Linux 内核（ `drivers/iommu/iommufd/ioas.c` ）后，一系列优化机制开始运作。

## Evidence

- Source: [原始文章](raw/tech/bsp/什么是IOMMU？ - 匿名用户 的回答.md) [[../../raw/tech/bsp/什么是IOMMU？ - 匿名用户 的回答.md|原始文章]]

## Key Quotes

> "DMA 映射（DMA Mapping）"

> "Unified Pinning Accounting"

> "IOMMU允许系统设备在 虚拟内存 中进行寻址，也就是将虚拟内存地址映射为 物理内存 地址，让实体设备可以在虚拟的内存环境中工作，这样可以帮助系统扩充内存容量，提升性能"

> "### 2.2 后端封装：iommufd\_backend\_map\_dma

代码下沉到 `backends/iommufd.c` ，这里是 QEMU 与内核 ABI 交互的边界"

> "### 3.2 Pinning 优化：解决“重复计费”难题

这是 IOMMUFD 解决的一个痛点。在虚拟化场景中，物理页必须被 Pin 住（Lock）以防止 Swap"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/什么是IOMMU？ - 匿名用户 的回答.md) [[../../raw/tech/bsp/什么是IOMMU？ - 匿名用户 的回答.md|原始文章]]
