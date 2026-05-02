---
doc_id: src-uio-driver-mechanism
title: UIO 用户空间设备驱动机制
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/设备驱动之 UIO 机制.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, uio, userspace-driver]
---

## Summary

本文介绍了 Linux UIO（Userspace I/O）机制，允许在用户空间开发设备驱动。UIO 核心通过 mmap() 处理物理内存、逻辑内存和虚拟内存映射。中断应答必须在内核空间进行，但其余工作交给用户空间。用户空间通过 read() /dev/uioX 等待中断，通过 select()/poll() 实现超时等待。设备内存映射通过 /sys/class/uio/uio0/maps/mapX 文件暴露。

## Key Points

### 1. UIO 核心功能
- **mmap()**: 处理物理内存、逻辑内存、虚拟内存映射
- **中断处理**: 内核空间应答中断，用户空间处理其余工作
- **read()**: 阻塞等待中断，中断发生时立即返回
- **poll()**: 支持 select() 等待中断，可设置超时

### 2. UIO 设备注册
```c
struct uio_info {
    struct uio_device *uio_dev;
    const char *name;
    const char *version;
    struct uio_mem mem[MAX_UIO_MAPS];
    struct uio_port port[MAX_UIO_PORT_REGIONS];
    long irq;              // 中断号
    unsigned long irq_flags;
    void *priv;
    irqreturn_t (*handler)(int irq, struct uio_info *dev_info);
    int (*mmap)(struct uio_info *info, struct vm_area_struct *vma);
    int (*open)(struct uio_info *info, struct inode *inode);
    int (*release)(struct uio_info *info, struct inode *inode);
    int (*irqcontrol)(struct uio_info *info, s32 irq_on);
};
```

### 3. 设备内存访问
- 设备内存映射文件：`/sys/class/uio/uio0/maps/mapX`
- 对该文件的读写即对设备内存的读写

### 4. UIO 驱动编写步骤
1. 定义 `struct uio_info` 结构体
2. 设置内存区域（addr、size、memtype）
3. 设置中断号和处理函数
4. 调用 `uio_register_device()` 注册

## Evidence

```c
struct uio_info kpart_info = {
    .name = "kpart",
    .version = "0.1",
    .irq = UIO_IRQ_NONE,
};

static int drv_kpart_probe(struct device *dev) {
    kpart_info.mem[0].addr = (unsigned long)kmalloc(1024, GFP_KERNEL);
    // ...
    return uio_register_device(dev, &kpart_info);
}
```

## Open Questions

- UIO 与 VFIO 的区别和适用场景
- DPDK 如何利用 UIO 实现高性能网络驱动

## Related Pages

- [[uio]]
- [[linux-device-driver]]
- [[userspace-driver]]
- [[dpdk]]
