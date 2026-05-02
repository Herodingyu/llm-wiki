---
doc_id: src-userspace-hardware-access
title: 用户态直接操纵硬件 — UIO 框架实践
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/【术】怎样绕过Linux kernel在用户态操纵硬件.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, uio, userspace, driver]
---

## Summary

本文介绍了如何利用 Linux UIO 框架在用户空间开发硬件驱动，无需修改和编译内核。核心思路是在内核中写少量代码（几十行）将寄存器地址告诉 UIO，UIO 会生成 /dev/uio0 设备文件，用户空间通过 mmap() 映射后即可直接操纵寄存器。文章给出了完整的内核模块代码和用户空间代码示例，包括设备树配置和引脚复用（pin mux）说明。

## Key Points

### 1. UIO 原理
- UIO = Userspace I/O
- 内核中只需少量代码注册设备
- UIO 通过 ioremap 将硬件寄存器映射到用户态虚拟地址
- 用户空间通过 mmap() 直接访问虚拟地址 → 实际访问物理寄存器

### 2. 内核模块代码
```c
static struct uio_info info;
info.name = "example_uio";
info.version = "1.0";
info.mem[0].memtype = UIO_MEM_PHYS;
info.mem[0].addr = 0x30300000;  // 实际寄存器地址
info.mem[0].size = 0x10000;      // 大小
```

### 3. 设备树配置
```dts
UIO {
    compatible = "example,UIO";
    reg = <0x30300000 0x10000>;
    // 配置 pinctrl
};
```

### 4. 用户空间代码
```c
devuio_fd = open("/dev/uio0", O_RDWR | O_SYNC);
demo_driver_map = mmap(NULL, 0x10000, PROT_READ|PROT_WRITE, MAP_SHARED, devuio_fd, 0);
// 直接读写 demo_driver_map 即可操纵寄存器
```

### 5. 关键点
- 设备树中 compatible 必须匹配驱动中的 of_device_id
- 需要配置 pinctrl 处理引脚复用
- 无需重新编译内核，方便迭代开发

## Evidence

- UIO 框架把 page table 修改工作做好了
- 用户空间访问虚拟地址时，page table 引导到实际物理地址
- 可以点亮/熄灭 LED 等简单硬件操作

## Open Questions

- UIO 与 sysfs /dev/mem 直接访问的优劣对比
- 用户空间驱动的安全性和稳定性问题

## Related Pages

- [[uio]]
- [[linux-device-driver]]
- [[userspace-driver]]
- [[device-tree]]
