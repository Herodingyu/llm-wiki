---
title: "什么是IOMMU？ - 匿名用户 的回答"
source: "https://www.zhihu.com/question/325947168/answer/694085423"
author:
  - "[[匿名用户]]"
  - "[[基层架构师和大家一起探索这个有趣的世界]]"
  - "[[宝爷说AI Infra全栈技术专家 | 全网同名]]"
published:
created: 2026-05-02
description: "IOMMU作用。IOMMU允许系统设备在虚拟内存中进行寻址，也就是将虚拟内存地址映射为物理内存地址，让实体设…"
tags:
  - "clippings"
---
85 人赞同了该回答

![](https://pic1.zhimg.com/50/v2-2fd7afc1e1898053f4671cd423bba909_720w.jpg?source=2c26e567)

IOMMU 作用。 IOMMU允许系统设备在 虚拟内存 中进行寻址，也就是将虚拟内存地址映射为 物理内存 地址，让实体设备可以在虚拟的内存环境中工作，这样可以帮助系统扩充内存容量，提升性能。 什么是IOMMU？ 在计算机领域，IOMMU（Input/Output Memory Management Unit）是一个内存管理单元（Memory Management Unit），它的作用是连接 DMA-capable I/O总线 （Direct Memory Access-capable I/O Bus）和主存（main memory）。传统的内存管理单元会把CPU访问的虚拟地址转化成实际的物理地址。而IOMMU则是把设备（device）访问的虚拟地址转化成物理地址。为了防止设备错误地访问内存，有些IOMMU还提供了访问内存保护机制。参考下图： IOMMU的一个重要用途是在 虚拟化技术 （virtualization）：虚拟机上运行的操作系统（ guest OS ）通常不知道它所访问的 host-physical内存地址 。如果要进行DMA操作，就有可能破坏内存，因为实际的硬件（hardware）不知道guest-physical和host-physical内存地址之间的映射关系。IOMMU根据guest-physical和host-physical内存地址之间的转换表（translation table），re-mapping硬件访问的地址，就可以解决这个问题。 另外，在AMD的VIRTUALIZING IO THROUGH THE IO MEMORY MANAGEMENT UNIT (IOMMU)文档中，也有一个更全面的总结图： 参考资料： IOMMU。[IC设计工程师和验证工程师哪一个的发展比较好？](https://www.zhihu.com/question/302613079/answer/49188262164)

[

本科毕业直接入行IC，投FPGA岗，阴差阳错入行DV验证岗。此后的一年多时间，从RTL的功能验证，性能验证（pv）...

](https://www.zhihu.com/question/302613079/answer/49188262164)

#### 更多回答

![](https://pic1.zhimg.com/50/v2-d70e3e6ae77a8bb4bb818ca8887876b7_720w.jpg?source=1def8aca)

图1-1 High-Level SMMU地址翻译流程

## 简介与背景

在虚拟化 I/O 的世界里，无论上层管理面（如对象模型、设备绑定）如何重构，数据面最核心的任务始终未变—— **DMA 映射（DMA Mapping）** 。即如何建立 Guest Physical Address (GPA) 到 Host Physical Address (HPA) 的映射关系，并将其填入 IOMMU 的硬件页表中，使得直通设备能够正确访问虚拟机内存。

在 Legacy VFIO (Type1) 时代，这一职责由 `vfio_legacy_dma_map` 承担，它通过 `VFIO_IOMMU_MAP_DMA` ioctl 操作 Container。而在 QEMU v10.0.3 引入的 IOMMUFD 后端中，这一接力棒交到了 `iommufd_cdev_map` 手中。

看似只是更换了一个 ioctl (`IOMMU_IOAS_MAP`)，但其底层的运作机制却发生了质的飞跃。IOMMUFD 不仅解决了 Legacy 模式下的资源重复计费问题，还引入了更细粒度的锁机制以及对大页（Huge Page）的原生友好支持。本文将深入 QEMU 和 Linux 内核源码，揭示这一高性能数据通路背后的技术细节。

## 2\. QEMU 侧实现：从 MemoryListener 到 IOMMU\_IOAS\_MAP

QEMU 维护内存映射的机制是通用的 **MemoryListener** 。当虚拟机的内存布局发生变化（如启动时的 RAM 分配、内存热插拔）时， `vfio_memory_listener` 会被触发，进而调用后端的 `.dma_map` 回调。

### 2.1 入口：iommufd\_cdev\_map

在 `hw/vfio/iommufd.c` 中，IOMMUFD 容器实现了该回调：

```
/* hw/vfio/iommufd.c */
static int iommufd_cdev_map(const VFIOContainerBase *bcontainer, hwaddr iova,
                            ram_addr_t size, void *vaddr, bool readonly)
{
    const VFIOIOMMUFDContainer *container =
        container_of(bcontainer, const VFIOIOMMUFDContainer, bcontainer);

    /* 
     * 核心差异点：
     * Legacy 模式传入的是 container->fd (即 /dev/vfio/vfio)
     * IOMMUFD 模式传入的是 container->be (即 /dev/iommu 的后端对象)
     * 以及最关键的 container->ioas_id
     */
    return iommufd_backend_map_dma(container->be,
                                   container->ioas_id,
                                   iova, size, vaddr, readonly);
}
```

这里再次印证了 IOMMUFD 的“对象化”设计：映射操作不再针对模糊的 Container，而是精准指向一个 **IOAS ID** 。

### 2.2 后端封装：iommufd\_backend\_map\_dma

代码下沉到 `backends/iommufd.c` ，这里是 QEMU 与内核 ABI 交互的边界。

```
/* backends/iommufd.c */
int iommufd_backend_map_dma(IOMMUFDBackend *be, uint32_t ioas_id, hwaddr iova,
                            ram_addr_t size, void *vaddr, bool readonly)
{
    /* 构造内核定义的 ioctl 参数结构体 */
    struct iommu_ioas_map map = {
        .size = sizeof(map),
        .flags = IOMMU_IOAS_MAP_READABLE |
                 IOMMU_IOAS_MAP_WRITEABLE, // 默认读写
        .ioas_id = ioas_id,                // 目标地址空间
        .user_va = (uintptr_t)vaddr,       // QEMU 进程的虚拟地址 (HVA)
        .length = size,                    // 映射长度
        .iova = iova,                      // 虚拟机的物理地址 (GPA)
    };
    int ret;

    if (readonly) {
        map.flags &= ~IOMMU_IOAS_MAP_WRITEABLE;
    }

    /* 
     * 发起系统调用
     * trace point: trace_iommufd_backend_map_dma(...)
     */
    ret = ioctl(be->fd, IOMMU_IOAS_MAP, &map);
    
    if (ret < 0) {
        /* 
         * 错误处理：
         * EEXIST: 该区域已经映射过（通常是 QEMU 逻辑 bug 或重叠区域）
         * ENOMEM: 无法 Pin 住内存（超过了 rlimit）
         */
        if (errno == EEXIST) {
            warn_report("IOMMU_IOAS_MAP: Region overlap ...");
        }
        return -errno;
    }
    return 0;
}
```

**关键字段解析** ：

- **`.ioas_id`** ：告诉内核，我要修改哪棵映射树。
- **`.user_va`** ：这是 Host 侧的虚拟地址。内核 IOMMUFD 子系统会利用这个地址调用 `pin_user_pages` ，锁定物理内存。
- **`.flags`** ：支持 `IOMMU_IOAS_MAP_FIXED_IOVA` （默认行为），即由用户态指定 IOVA，而不是由内核动态分配。

## 3\. 内核深度解析：性能优化的幕后

当 `ioctl(IOMMU_IOAS_MAP)` 进入 Linux 内核（ `drivers/iommu/iommufd/ioas.c` ）后，一系列优化机制开始运作。

### 3.1 锁机制：从粗犷到精细

在 Legacy VFIO 中， `vfio_iommu_type1` 使用一把大锁（Mutex）保护整个 Container。这意味着，如果一个 QEMU 进程管理着多个 Container（对应多个 NUMA 节点的设备），或者多个 vCPU 线程并发触发 Map 操作，它们会在内核层发生串行化，导致大内存虚拟机的启动和迁移性能受限。

**IOMMUFD 的改进** ：

- **对象级锁** ：锁的粒度下降到了 **IOAS 对象** 级别。
- **读写锁 (Rwsem)** ：IOMMUFD 使用读写信号量（ `down_read/write` ）。虽然 Map 操作通常需要写锁，但针对不同 IOAS 的操作是完全并行的。
- **未来演进** ：内核社区正在推进细粒度的区间锁（Range Lock），允许同一 IOAS 内不同地址段的 Map 操作并发执行。

### 3.2 Pinning 优化：解决“重复计费”难题

这是 IOMMUFD 解决的一个痛点。在虚拟化场景中，物理页必须被 Pin 住（Lock）以防止 Swap。

- **Legacy 的痛** ：如果两个 Container 映射了同一块共享内存（例如 IVSHMEM 或多个 VM 共享大页），Legacy VFIO 会对每一页 Pin 两次。这会导致用户的 `RLIMIT_MEMLOCK` 额度被双倍消耗，常常导致 VM 启动失败。
- **IOMMUFD 的解** ： IOMMUFD 引入了 **Unified Pinning Accounting** 。它通过 `iopt_pages` 对象管理内存页。
- 当发生 Map 请求时，IOMMUFD 会检查这些页面是否已经被同一个 `iommufd_ctx` （上下文） Pin 过了。
	- 如果是，它仅仅增加内部引用计数，而不会再次增加进程级的 `locked_vm` 计数。
	- 这使得多设备共享内存、多 IOAS 复用内存的场景变得极其高效且廉价。

### 3.3 大页对齐 (Huge Page Alignment)

高性能网络（100G/200G RDMA）对 IOTLB（IOMMU TLB）极其敏感。如果使用 4KB 页表，大量 DMA 请求会导致 IOTLB Miss，严重降低吞吐量。使用 2MB 或 1GB 大页是标准优化手段。

在 QEMU 代码中， `util_align` 相关逻辑会尽量确保传递给内核的 `user_va` 和 `iova` 是大页对齐的。

**内核行为** ： IOMMUFD 的 `iopt_map_pages` 函数会进行智能检测：

1. **检查对齐** ：判断 `iova` 和 `paddr` 是否都满足 IOMMU 硬件支持的大页尺寸（如 2MB）。
2. **Huge TTE 建立** ：如果满足，IOMMU 驱动（如 Intel VT-d driver）会直接在页表中间层（PMD）写入物理地址，并设置 `SuperPage` 标志。
3. **效果** ：原本需要 512 个 4KB 页表项，现在只需要 1 个 2MB 页表项。IOTLB 覆盖范围扩大 512 倍，大幅提升 DMA 性能。

### 3.4 健壮的 Unmap 操作

对应的 `IOMMU_IOAS_UNMAP` 接口也做了增强。

```
/**
 * struct iommu_ioas_unmap - ioctl(IOMMU_IOAS_UNMAP)
 * @size: sizeof(struct iommu_ioas_unmap)
 * @ioas_id: IOAS ID to change the mapping of
 * @iova: IOVA to start the unmapping at
 * @length: Number of bytes to unmap, and return back the bytes unmapped
 *
 * Unmap an IOVA range. The iova/length must be a superset of a previously
 * mapped range used with IOMMU_IOAS_MAP or IOMMU_IOAS_COPY. Splitting or
 * truncating ranges is not allowed. The values 0 to U64_MAX will unmap
 * everything.
 */
struct iommu_ioas_unmap {
    __u32 size;
    __u32 ioas_id;
    __aligned_u64 iova;
    __aligned_u64 length;
};
```
- **返回值机制** ：Legacy 的 Unmap 有时在处理“部分 Unmap”时行为未定义。IOMMUFD 在结构体中返回实际被 Unmap 的 `length` 。
- **IOTLB 刷新** ：IOMMUFD 确保在 Unmap 返回用户态之前，相关的 IOTLB 刷新指令（Invalidation）已经下发到硬件，保证了安全性。

## 4\. 总结

`iommufd_cdev_map` 及其背后的 `IOMMU_IOAS_MAP` ioctl，表面上只是 Legacy `MAP_DMA` 的简单替代，但其内部实现体现了 Linux I/O 虚拟化栈的现代化改造：

1. **更细的锁** ：IOAS 级锁机制释放了多线程/多设备并发的性能潜力。
2. **更准的账** ：统一 Pinning 计费解决了长期存在的资源浪费和额度限制问题。
3. **更强的核** ：对大页和 IOTLB 的深度优化，确保了在 400G 网络时代的吞吐量需求。

对于 QEMU 开发者而言，接入 IOMMUFD 意味着可以免费获得这些底层性能红利，而无需修改上层 MemoryListener 的核心逻辑。这也是 QEMU 积极推进 IOMMUFD 后端落地的主要动力之一。

## 关于作者

大家好，我是宝爷，浙大本科、前华为工程师、现某芯片公司系统架构负责人，关注个人成长。

新的图解文章都在公众号「宝爷说」首发，别忘记关注了哦！

感谢你读到这里。

如果这篇文章对您有所帮助，欢迎点赞、分享或收藏！你的支持是我创作的动力！

如果您不想错过未来的更新，记得点个星标 ⭐，下次我更新你就能第一时间收到推送啦。

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 335 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 294 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[曝吴宣仪提出解约遭乐华拒绝 290 万](https://www.zhihu.com/search?q=%E6%9B%9D%E5%90%B4%E5%AE%A3%E4%BB%AA%E6%8F%90%E5%87%BA%E8%A7%A3%E7%BA%A6%E9%81%AD%E4%B9%90%E5%8D%8E%E6%8B%92%E7%BB%9D&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[阿 Sa 蔡卓妍官宣结婚 290 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 267 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)