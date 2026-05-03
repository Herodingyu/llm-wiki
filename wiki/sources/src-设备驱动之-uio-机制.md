---
doc_id: src-设备驱动之-uio-机制
title: 设备驱动之 UIO 机制
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/设备驱动之 UIO 机制.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文介绍了Linux内核中的UIO（Userspace I/O）用户空间I/O机制，该机制允许将大部分设备驱动逻辑从内核空间转移到用户空间执行。文章首先阐述了UIO的核心设计思想：驱动的主要任务（设备内存访问和设备中断处理）中，内存访问通过mmap实现直接映射，而中断应答仅需要极少量内核代码，其余工作全部交给用户空间处理。随后详细讲解了UIO驱动的注册流程（通过填充`uio_info`结构体并调用`uio_register_device`），以及用户空间如何通过`/dev/uioX`设备节点和`/sys/class/uio/uio0/maps/mapX`文件系统接口与UIO设备交互。文章最后通过对比简单UIO驱动示例和DPDK的`igb_uio`实现，展示了UIO在高性能网络、GPU、FPGA等领域的实际应用场景。

## Key Points

### 1. UIO机制核心原理

UIO将设备驱动的两个主要任务分离处理：

| 任务 | 处理位置 | 实现方式 |
|------|---------|---------|
| 设备内存存取 | 用户空间 | `mmap()`映射物理/逻辑/虚拟内存 |
| 设备中断处理 | 内核+用户空间 | 内核应答中断，用户空间处理业务逻辑 |

**关键特性**：
- 用户空间通过`read()`阻塞等待中断，中断产生时立即返回
- 支持`poll()`/`select()`等待中断，可设置超时
- 设备控制通过`/sys/class/uio`下文件读写完成
- 设备内存信息通过`/sys/class/uio/uioX/maps/mapX/addr`和`size`获取

### 2. UIO驱动注册

#### 2.1 核心结构体 uio_info

```c
struct uio_info {
    struct uio_device   *uio_dev;
    const char          *name;
    const char          *version;
    struct uio_mem      mem[MAX_UIO_MAPS];    // 内存映射区域
    struct uio_port     port[MAX_UIO_PORT_REGIONS];
    long                irq;                  // 中断号
    unsigned long       irq_flags;
    void                *priv;
    irqreturn_t (*handler)(int irq, struct uio_info *dev_info);  // 中断处理
    int (*mmap)(struct uio_info *info, struct vm_area_struct *vma);
    int (*open)(struct uio_info *info, struct inode *inode);
    int (*release)(struct uio_info *info, struct inode *inode);
    int (*irqcontrol)(struct uio_info *info, s32 irq_on);        // 中断控制
};
```

#### 2.2 注册流程

1. 填充`uio_info`（name、version、irq、内存区域等）
2. 调用`uio_register_device(dev, &info)`注册到内核
3. 注册后设备出现在`/sys/class/uio/uioX/`

#### 2.3 内存类型

| 类型 | 说明 |
|------|------|
| `UIO_MEM_PHYS` | 物理内存 |
| `UIO_MEM_LOGICAL` | 逻辑内存（kmalloc分配） |
| `UIO_MEM_VIRTUAL` | 虚拟内存 |

### 3. 用户空间访问UIO设备

```c
// 1. 打开设备
int uio_fd = open("/dev/uio0", O_RDWR);

// 2. 读取内存地址和大小
int addr_fd = open("/sys/class/uio/uio0/maps/map0/addr", O_RDONLY);
int size_fd = open("/sys/class/uio/uio0/maps/map0/size", O_RDONLY);
read(addr_fd, addr_buf, sizeof(addr_buf));
read(size_fd, size_buf, sizeof(size_buf));

// 3. mmap映射到用户空间
void *access_address = mmap(NULL, uio_size, PROT_READ | PROT_WRITE,
                            MAP_SHARED, uio_fd, 0);
```

### 4. DPDK igb_uio实现

DPDK通过`igb_uio`驱动利用UIO机制实现零拷贝高性能网络：

| 特性 | 实现 |
|------|------|
| PCI设备绑定 | 注册`pci_driver`，在probe中处理 |
| 内存映射 | `igbuio_setup_bars`设置PCI BAR映射 |
| 中断模式 | 支持MSI-X/MSI/Legacy三种中断 |
| DMA配置 | 设置64-bit DMA mask |
| 设备注册 | 调用`uio_register_device`注册UIO设备 |

**关键流程**：
1. `igbuio_pci_init_module` → `pci_register_driver`
2. `igbuio_pci_probe`中：
   - `pci_enable_device`使能设备
   - `pci_request_regions`保留PCI内存区域
   - `pci_set_master`使能bus mastering
   - `igbuio_setup_bars`映射IO内存
   - 填充`uio_info`并调用`uio_register_device`

### 5. UIO应用场景

| 场景 | 优势 |
|------|------|
| 高性能网络（DPDK） | 零拷贝、用户空间直接操作网卡 |
| GPU驱动 | 减少内核态切换开销 |
| FPGA加速 | 用户空间直接访问FPGA寄存器 |
| 自定义硬件 | 驱动开发简化，无需深入内核 |

## Key Quotes

> "一个设备驱动的主要任务有两个：1. 存取设备的内存 2. 处理设备产生的中断。"

> "对于设备中断的应答必须在内核空间进行。所以在内核空间有一小部分代码用来应答中断和禁止中断，可是其余的工作全部留给用户空间处理。"

> "假设用户空间要等待一个设备中断，它只需要简单的堵塞在对 /dev/uioX的read()操作上。当设备产生中断时，read()操作马上返回。"

> "代码很简单，就是讲刚才那几个文件读出来，并且重新mmap出来，最后将其打印出来。由此我们可以简单的看到，想要操作uio设备，只需要重新mmap，而后我们便可操作一般的内存一样操作设备内存。"

## Evidence

- Source: [原始文章](raw/tech/bsp/设备驱动之 UIO 机制.md) [[../../raw/tech/bsp/设备驱动之 UIO 机制.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/设备驱动之 UIO 机制.md) [[../../raw/tech/bsp/设备驱动之 UIO 机制.md|原始文章]]
