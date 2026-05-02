---
title: "聊聊Linux的DMA机制"
source: "https://zhuanlan.zhihu.com/p/7943091314"
author:
  - "[[lgjjeff]]"
published:
created: 2026-05-02
description: "1 前言有过系统编程经历的同学，可能对DMA都有一定的了解，如对于一些需要大量数据传输的外设，一般都支持通过DMA方式访问内存。它的引入主要是为了提高系统的整体性能和运行效率 我们知道，CPU主要用于对系统进行…"
tags:
  - "clippings"
---
[收录于 · 内存管理](https://www.zhihu.com/column/c_1515722871497977856)

公园野鸭 等 232 人赞同了该文章

## 1 前言

有过系统编程经历的同学，可能对 [DMA](https://zhida.zhihu.com/search?content_id=250611338&content_type=Article&match_order=1&q=DMA&zhida_source=entity) 都有一定的了解，如对于一些需要大量数据传输的外设，一般都支持通过DMA方式访问内存。它的引入主要是为了提高系统的整体性能和运行效率

我们知道，CPU主要用于对系统进行控制和调度，其访问内存的效率并不高，虽然现代处理器对访内操作做了诸多优化，如增加多级高速缓存，支持乱序执行，总线支持事务合并、提前响应等。但访问内存操作依然是其主要瓶颈，如对于cache miss的情况，就可能导致较长时间的流水线stall，严重影响CPU的性能

更恶劣的是，若大量外设都需要CPU帮忙拷贝数据，则CPU的负载可能会变得很高，甚至造成其无法执行正常的功能

DMA则正好可以解决以上问题，如对于支持DMA的外设，CPU就不需要亲力亲为地为其拷贝数据，而只需为它设置好DMA传输相关的参数即可。这就像有个工地，原先所有的砖都由工头自己去搬，但随着工地用砖需求的不断增加，工头再也无法完成这些任务了，甚至由于搬砖占用了其大量时间，导致其它重要工作都无法及时处理。这时，工头招了一些搬砖工人，自己则只负责为其分配任务即可，从而大大减轻了自身的负担，在这里工头就是CPU，而搬砖工人则是DMA

## 2 DMA的使用限制

DMA在带来效率提升的同时，也给软件编码提出了更多的要求，若系统编程人员不能正确地执行操作流程，则很可能会造成DMA操作失败，或数据与预期结果不符等问题。本节我们将重点看一下其所带来的问题，以及相应的解决方案

现代CPU普遍都支持虚拟内存系统，即每个CPU都包含一个 [MMU](https://zhida.zhihu.com/search?content_id=250611338&content_type=Article&match_order=1&q=MMU&zhida_source=entity) ，物理地址需要先通过MMU转换为虚拟地址，才能被CPU访问。在一个SMP系统中，所有CPU可以通过共享页表的方式，实现其内存视角的一致。即CPU 0视角下的虚拟地址vaddr，与CPU 1视角下的虚拟地址vaddr，是通过同一页表映射到一个相同的物理地址，且具有相同权限的

而在通常情况下，DMA与CPU视角下的地址并不一致。根据不同的硬件实现，它可能包含以下几种情况：

（1）DMA直接连接到总线上

该方案中DMA外设会直接连接到系统总线上，因此DMA可以直接使用物理地址访问内存。以下为其示意图：

![](https://picx.zhimg.com/v2-0bfcaa36843c2e28b7f89fea8bdd2335_1440w.jpg)

这种方式物理连线简单，也无须增加额外的硬件，但也会带来一系列的问题。首先，软件在编程时要注意，需要先将CPU虚拟地址转换为物理地址，才能将其传给DMA使用

其次，由于DMA访问内存时没有使用MMU保护，故其具有全地址空间的访问能力，因此编程错误，可能会导致DMA踩踏其它master的地址空间。更进一步，若DMA外设为non secure设备，而该外设被黑客攻击后，则攻击者可以通过DMA访问关键敏感数据，从而给系统带来security风险。在当前方案下，该问题没有较好的解决方案，除非在系统中添加 [IOMMU](https://zhida.zhihu.com/search?content_id=250611338&content_type=Article&match_order=1&q=IOMMU&zhida_source=entity) ，或者SOC设计者在DMA端口上添加一些轻量级的内存保护硬件

再次，由于DMA直接通过物理地址访问内存，因而对于不支持 [scatter-gather](https://zhida.zhihu.com/search?content_id=250611338&content_type=Article&match_order=1&q=scatter-gather&zhida_source=entity) 机制的DMA，必须要使用连续的物理地址，而当系统内存碎片比较严重时，它可能是不容易被满足的。当然，若支持IOMMU，则也可以解决该问题，即可以像CPU的MMU一样，通过IOMMU将不连续的物理地址，映射到一段连续的IOVA地址，然后将IOVA传给DMA。此时，从DMA的视角来看，它就像在操作一段连续的地址一样

另外，由于DMA与CPU通常不是处于同一个cache coherency domain中，这种情况下，DMA的数据读写操作并不经过cache。此时，CPU在进行DMA操作时，需要保证该段地址在cache中与主存中的数据是一致的。它可以通过两种方式实现，一种为将该段地址映射为non cache类型页面，另一种则是依然将其映射为cache类型页面，但在执行DMA操作前后需要由软件手动执行cache维护操作，以确保它们之间数据的一致性

但对于有些与CPU处于同一个cache coherency domain的DMA，则由于该外设访问内存时也会经过CPU的cache，故软件并不需要执行cache维护操作。例如某个GPU（在CPU视角，此处GPU与DMA的行为类似）通过ACE-LITE接口连接到一致性interconnect上时，则该GPU就可以snoop CPU的cache，因此其访问内存时就不再需要软件维护cache操作了

还有当前SOC通常都支持64位地址空间，而有些DMA外设依然只有32位甚至更低的地址空间访问能力。此时，若DMA需要搬运高地址空间的数据时，可能就无能为力了。同样，若支持了IOMMU，则IOMMU可以通过将高于32bit的物理地址，映射到32bit之内的IOVA中解决该问题

当然，Linux也为不支持IOMMU的系统提供了一种软件workaround机制，该机制名为 [swiotlb](https://zhida.zhihu.com/search?content_id=250611338&content_type=Article&match_order=1&q=swiotlb&zhida_source=entity) 。其原理是系统为DMA预留一块地址位于32bit之内的物理内存，在执行DMA操作时，先从其中为其分配一段source buffer和一段dest buffer内存，然后将源数据拷贝到source buffer后，再执行DMA操作。当DMA操作完成之后，最后将目的dest buffer的数据拷贝回软件设置的高位地址处。该方案虽然解决了DMA地址访问能力限制问题，但实际上增加了额外的数据拷贝，不仅影响DMA操作执行的效率，还会占用CPU资源

最后，在支持虚拟化的系统中，由于物理地址对guest OS并不可见，因此若guest OS需要执行DMA操作时，就需要guest OS先将虚拟地址转换为IPA，然后由hypervisor将IPA地址转换为实际的物理地址，因此系统需要支持IO地址的两级映射。这通常也需要IOMMU的支持

（2）DMA通过IOMMU连接到总线上

该方案中DMA与interconnect通过IOMMU相连，即DMA不再直接操作物理地址，而是先通过IOMMU将物理地址映射为IOVA，然后通过IOVA访问系统内存。以下为其示意图：

![](https://pic3.zhimg.com/v2-04889c0a5a0897fe077c624176230998_1440w.jpg)

其中该图以arm架构为例，在该架构中IOMMU类型的硬件被称为 [SMMU](https://zhida.zhihu.com/search?content_id=250611338&content_type=Article&match_order=1&q=SMMU&zhida_source=entity) 。其中在SMMU中，硬件支持TBU和TCU的分布式布局，即SOC中可能包含多个分布在不同位置的TBU和一个TCU，不同的外设可能会被连接到不同的TBU上。由于此处主要为了介绍其基本原理，因此在该图中将其简化成了一个SMMU模块

在增加IOMMU的支持之后，前面DMA直接与interconnect相连时的大部分问题都可以得到解决。如通过SMMU映射，可以对页表进行权限控制，从而可避免DMA访问非法地址。页表映射时，也可以将一组离散的物理地址映射到一块连续的IOVA虚拟地址上，因此支持对非连续物理地址的操作。同时，它也可以将高于32位的地址区间，映射到低于32位，甚至更低的IOVA地址空间，从而解决DMA地址访问空间限制问题。最后，SMMU还支持两级页表映射机制，从而可以支持DMA设备的虚拟化

当然，支持SMMU之后，软件还需要注意cache一致性问题，在DMA操作过程中，正确地使用cache维护操作，以确保数据的一致性

## 3 Linux对DMA的支持

由以上分析可知，虽然设备在执行DMA操作时可能会有各种限制，但这些限制主要都与内存地址和cache一致性相关。故只要软件正确处理了DMA地址映射和cache一致性问题，就可以保证DMA操作的正确性

Linux的DMA接口即是以该原则设计的，为了使用方便，Linux一共实现了两类DMA API接口。它们分别为一致性映射DMA接口和流式映射DMA接口，以下为其基本特点：

（1）一致性DMA接口

该接口会为调用者分配一块指定大小的DMA内存，并将其映射为DMA地址。该内存同时还保证对DMA设备是cache一致的，因此调用者在使用它进行DMA操作时，不需要执行额外的cache相关操作。其中对于普通DMA设备，其数据一致性可以通过将其映射为非cache内存的方式实现，而对于本身与CPU处于同一cache一致性domain的设备，则该内存可以被映射为cache类型，数据的一致性则可由硬件保证（如一致性总线协议和一致性interconnect）

（2） [流式DMA接口](https://zhida.zhihu.com/search?content_id=250611338&content_type=Article&match_order=1&q=%E6%B5%81%E5%BC%8FDMA%E6%8E%A5%E5%8F%A3&zhida_source=entity)

与一致性DMA接口不同，通常情况下，流式DMA接口会将指定内存映射为cache类型的DMA地址。调用者在使用该内存进行DMA操作时，需要由软件保证数据的一致性。如在DMA写操作之前，需要先将CPU cache中的数据刷到内存上，然后再启动DMA写传输，而在DMA读操作之前，需要先将CPU cache中的数据invalidate掉，再从内存中读取新的数据

### 3.1 一致性DMA接口的流程

一致性DMA主要包括内存分配和内存释放接口，其接口定义如下：

```
inline void *dma_alloc_coherent(struct device *dev, size_t size,
    dma_addr_t *dma_handle, gfp_t gfp)
inline void dma_free_coherent(struct device *dev, size_t size,
    void *cpu_addr, dma_addr_t dma_handle)
```

其中size为需要分配的内存大小，gfp为内存分配的掩码标志，dma\_handle为分配成功后返回的dma地址，分配成功后返回值为其cpu虚拟地址，否则返回值为0。其中下图为内存分配的主要流程：

![](https://pic1.zhimg.com/v2-08ec68e138793224a848a2a6ba25de8e_1440w.jpg)

从流程图可看出，该接口主要尝试通过三种方式分配DMA内存：

（1）通过设备自身保留的coherent内存中分配（dma\_alloc\_from\_dev\_coherent）

这种方式需要设备在初始化时为其自身预留一段一致性的DMA内存，因此这段被预留的内存需要保证其是满足DMA一致性的。以下为其相应的接口：

```
int dma_declare_coherent_memory(struct device *dev, phys_addr_t phys_addr,
    dma_addr_t device_addr, size_t size)
```

若该设备未预留内存，则需要使用后两种方式分配

（2）直接从系统内存中分配（dma\_direct\_alloc）

只有当该设备没有注册dma内存操作函数时，才会从系统中直接分配内存，否则就会通过step 3的方式分配。此时，根据DMA是否支持硬件cache一致性，确定其分配流程，其中设备是否支持硬件一致性可以通过dts中的dma-coherent参数设置。

当设备不支持硬件一致性时，若其支持global dma pool，则将从global dma pool中分配dma内存。其中 若要支持global dma pool，需要在dts的reserved-memory中保留compatible值为shared-dma-pool，且包含属性linux,dma-default的节点。以下为其中的一个示例：

```
reserved-memory {
 #address-cells = <1>;
 #size-cells = <1>;
 ranges;
 
 linux,cma {
     compatible = "shared-dma-pool";
     no-map;
     size = <0x100000>;
     linux,dma-default;
     };
 };
```

当dts包含以上节点时，则在linux内核初始化时，会通过以下接口为其初始化global dma pool，并将相应的保留内存设置到该内存池中：

```
dma_init_reserved_memory（void）                                     ->
int dma_init_global_coherent(phys_addr_t phys_addr, size_t size)
```

否则，若使能了CONFIG\_DMA\_GLOBAL\_POOL，则其将会从atomic dma pool中分配，该pool实际上是在linux启动时，由系统预留的。以下为其预留相关的接口：

```
dma_atomic_pool_init（）
```

其中该pool的size与系统内存有关，在默认情况下，每1G内存会为其保留128K的size。否则，若其未设置CONFIG\_ARCH\_HAS\_DMA\_SET\_UNCACHED且是非swiotlb分配，则会通过arch相关的dma内存分配接口分配。当都不是以上这些情形时，它将使用与硬件一致性DMA内存相似的分配方式，其区别是其会将内存设置为non cache类型

硬件一致性分配时，若其需要执行内存解密操作，则内存分配流程将不能block，此时它也需要从atomic pool中分配内存。否则它将会直接从系统内存中分配，它又包括以下几种方式：

\- 若支持swiotlb，则从swiotlb中分配

\- 否则，尝试从cma内存中分配

\- 若分配失败，则尝试从系统内存中直接分配

（3）通过已注册的dev设备内存分配操作函数分配（ops->alloc）

当设备注册了dma\_ops，则该设备需要通过其ops对应的接口分配dma内存。以armv8的iommu为例，该接口的注册流程如下：

![](https://pic4.zhimg.com/v2-a051646798c76e5ead051526e5b52371_1440w.jpg)

其中iommu对应的dma\_ops定义如下：

```
const struct dma_map_ops iommu_dma_ops = {
     .flags = DMA_F_PCI_P2PDMA_SUPPORTED,
     .alloc = iommu_dma_alloc,
     .free = iommu_dma_free,
     .alloc_pages = dma_common_alloc_pages,
     .free_pages = dma_common_free_pages,
     .alloc_noncontiguous = iommu_dma_alloc_noncontiguous,
     .free_noncontiguous = iommu_dma_free_noncontiguous,
     .mmap = iommu_dma_mmap,
     .get_sgtable = iommu_dma_get_sgtable,
     .map_page = iommu_dma_map_page,
     .unmap_page = iommu_dma_unmap_page,
     .map_sg = iommu_dma_map_sg,
     .unmap_sg = iommu_dma_unmap_sg,
     .sync_single_for_cpu = iommu_dma_sync_single_for_cpu,
     .sync_single_for_device = iommu_dma_sync_single_for_device,
     .sync_sg_for_cpu = iommu_dma_sync_sg_for_cpu,
     .sync_sg_for_device = iommu_dma_sync_sg_for_device,
     .map_resource = iommu_dma_map_resource,
     .unmap_resource = iommu_dma_unmap_resource,
     .get_merge_boundary = iommu_dma_get_merge_boundary,
     .opt_mapping_size = iommu_dma_opt_mapping_size,
};
```

其中内存分配流程与step 2类似，其主要区别是通过这种方式分配的内存，需要通过iommu将其映射为iova后，才能传给DMA使用

此外，由于dma\_alloc\_coherent()是以page为单位分配内存的，若驱动需要多次分配小于一个page的内存，则可以使用dmapool来实现。由于该接口的功能实现较单一，故此处不再具体介绍，其中以下为其主要接口：

（1）dmapool创建接口

```
struct dma_pool *dmam_pool_create(const char *name, struct device *dev,
    size_t size, size_t align, size_t allocation)
```

（2）dmapool销毁接口

```
void dmam_pool_destroy(struct dma_pool *pool)
```

（3）dmapool内存分配接口

```
void *dma_pool_alloc(struct dma_pool *pool, gfp_t mem_flags,
    dma_addr_t *handle)
```

（4）dmapool内存释放接口

```
void dma_pool_free(struct dma_pool *pool, void *vaddr, dma_addr_t dma)
```

最后，以上流程中还需要考虑一致性DMA所能支持的寻址范围，并使分配的内存地址位于寻址范围之内。其中一致性映射接口的寻址范围可通过以下接口设置：

```
inline int dma_set_mask_and_coherent(struct device *dev, u64 mask)
```

流式DMA的寻址范围可通过以下接口设置：

```
inline int dma_set_mask(struct device *dev, u64 mask)
```

也可以通过以下接口同时设置一致性DMA和流式DMA接口的寻址范围：

```
inline int dma_set_mask_and_coherent(struct device *dev, u64 mask)
```

### 3.2 流式DMA接口的流程

与一致性映射接口不同，流式DMA映射接口不会分配内存，而是将输入参数中传入的内存映射为DMA地址。由于在CPU视角下，它也可能被映射成了cache类型的内存，故其对应的cache中可能含有dirty数据。为了确保DMA和CPU都能获取到正确的数据，则在DMA操作流程中，软件需要维护cache与主存数据的一致性。因此它包括以下两类接口：

（1）内存映射接口

```
#define dma_map_single(d, a, s, r) dma_map_single_attrs(d, a, s, r, 0)
#define dma_unmap_single(d, a, s, r) dma_unmap_single_attrs(d, a, s, r, 0)
#define dma_map_sg(d, s, n, r) dma_map_sg_attrs(d, s, n, r, 0)
#define dma_unmap_sg(d, s, n, r) dma_unmap_sg_attrs(d, s, n, r, 0)
#define dma_map_page(d, p, o, s, r) dma_map_page_attrs(d, p, o, s, r, 0)
#define dma_unmap_page(d, a, s, r) dma_unmap_page_attrs(d, a, s, r, 0)
```

其中对于不支持scatter gather机制的DMA，需要使用dma\_map\_single或dma\_map\_page接口。它们的差别在于，dma\_map\_single会将一块物理上连续的内存，映射为DMA地址，而dma\_map\_page会将一个内存page映射为DMA地址

由于支持scatter gather的DMA，可以处理离散的地址，因此传给DMA的实际上是一个离散地址的列表，该列表中的每一项都需要映射为DMA地址。因此它需要使用与连续地址不同的映射接口，在Linux中该dma\_map\_sg来实现的

（2）cache维护接口

由于流式DMA对应的内存，在CPU侧通常会映射为带cache的方式，从而使这段地址的读写受到cache的影响。因此，在执行DMA操作时，软件就需要维护cache与主存中数据的一致性，其中以下为其相应的接口：

```
inline void dma_sync_single_for_cpu(struct device *dev, dma_addr_t addr,
    size_t size, enum dma_data_direction dir)
inline void dma_sync_single_for_device(struct device *dev,
    dma_addr_t addr, size_t size, enum dma_data_direction dir)
inline void dma_sync_sg_for_cpu(struct device *dev,
    struct scatterlist *sg, int nelems, enum dma_data_direction dir)
inline void dma_sync_sg_for_device(struct device *dev,
    struct scatterlist *sg, int nelems, enum dma_data_direction dir)
```

当DMA需要将数据从内存搬到设备时，需要先调用dma\_sync\_single\_for\_device或dma\_sync\_sg\_for\_device接口，其目的是使CPU和设备处于同一cache一致性视角。以下为其single版本的代码实现：

```
static inline void dma_direct_sync_single_for_device(struct device *dev,
    dma_addr_t addr, size_t size, enum dma_data_direction dir)
{
    phys_addr_t paddr = dma_to_phys(dev, addr);
 
    if (unlikely(is_swiotlb_buffer(dev, paddr)))
        swiotlb_sync_single_for_device(dev, paddr, size, dir);
 
    if (!dev_is_dma_coherent(dev))
        arch_sync_dma_for_device(paddr, size, dir);
}
```

由于swiotlb需要将数据拷贝到其它内存地址后，再执行DMA操作，因此需要对实际执行DMA操作的内存做cache同步操作，但其原理是类似的，故这里不再详述。在非swiotlb的情形下，cache同步操作包括以下两种情况：

\- 若设备与CPU不在同一硬件一致性domain中，则需要先通过clean操作，将cache中的数据刷到内存中

\- 若设备与CPU处于同一硬件一致性domain中，则由于设备也能访问CPU cache数据，因此不需要执行cache clean流程

当DMA需要将数据从设备搬到内存时，需要先调用dma\_sync\_single\_for\_cpu或dma\_sync\_sg\_for\_cpu接口。其中以下为其single版本的代码实现：

```
static inline void dma_direct_sync_single_for_cpu(struct device *dev,
    dma_addr_t addr, size_t size, enum dma_data_direction dir)
{
    phys_addr_t paddr = dma_to_phys(dev, addr);
 
    if (!dev_is_dma_coherent(dev)) {
        arch_sync_dma_for_cpu(paddr, size, dir);
        arch_sync_dma_for_cpu_all();
    }
 
    if (unlikely(is_swiotlb_buffer(dev, paddr)))
        swiotlb_sync_single_for_cpu(dev, paddr, size, dir);
 
    if (dir == DMA_FROM_DEVICE)
        arch_dma_mark_clean(paddr, size);
}
```

类似的，不考虑swiotlb的情况下，对于非硬件一致性设备，在执行DMA操作前需要先将目的地址对应内存的数据invalidate掉，从而使得在DMA操作结束后，能从内存中读取到最新的数据。而对于硬件一致性设备，则不需要做任何操作

在以上这些接口中，都包含了一个dir参数，以用于指定在该次操作中数据的传输方向，如数据是从内存搬运到设备，还是从设备搬运到内存，该参数对应的宏定义如下：

```
DMA_BIDIRECTIONAL
DMA_TO_DEVICE 
DMA_FROM_DEVICE
DMA_NONE
```

其中当数据从内存搬到设备时，需要使用DMA\_TO\_DEVICE标志，反之则使用DMA\_FROM\_DEVICE标志。当然，若调用者对方向不了解，也可以使用DMA\_BIDIRECTIONAL标志，它能保证功能的正确性，但对性能会有一定的影响

编辑于 2024-11-25 22:37・浙江