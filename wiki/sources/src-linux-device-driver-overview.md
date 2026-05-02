---
doc_id: src-linux-device-driver-overview
title: Linux 设备驱动概述
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/2022 年了，重新理解一波设备驱动.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, device-driver]
---

## Summary

本文重新梳理了 Linux 设备驱动的基本概念和开发思路。核心观点是在工作场景中应尽量避免从零构建驱动，而是在高度模块化的驱动框架中添加设备驱动。这样可最大程度复用内核现有代码，获得弹性和可维护性，并为应用提供统一访问接口。文章以字符设备驱动为例，详细讲解了设备节点、设备号、以及驱动开发的基本流程。

## Key Points

### 1. 设备驱动的本质
- 设备驱动是对硬件的抽象
- 可在用户空间运行（通过 UIO、I2CDEV 等接口），更常见的是在内核空间运行
- 字符设备是最常见的硬件抽象，/dev 目录下的设备节点是内核导出的访问接口

### 2. 设备节点信息
- **Type**: 标识 block 或 char device
- **Major number**: 标识设备类别
- **Minor number**: 标识具体设备

### 3. 字符设备驱动编写流程
1. 分配设备号：`register_chrdev_region()` 或 `alloc_chrdev_region()`
2. 实现文件操作：`open`、`read`、`write`、`ioctl` 等
3. 注册字符设备：`cdev_init()` 和 `cdev_add()`

### 4. LED 驱动示例
- 硬件访问：通过 `readl`/`writel` 操作 GPIO 寄存器
- 驱动数据结构：包含设备号、字符设备、LED 状态、寄存器基地址
- 状态管理：读取当前状态、修改位、写回寄存器

## Evidence

```c
static struct {
    dev_t devnum;
    struct cdev cdev;
    unsigned int led_status;
    void __iomem *regbase;
} drvled_data;

static void drvled_setled(unsigned int status) {
    u32 val = readl(drvled_data.regbase + GPIO1_REG_DATA);
    if (status == LED_ON)
        val |= GPIO_BIT;
    else if (status == LED_OFF)
        val &= ~GPIO_BIT;
    writel(val, drvled_data.regbase + GPIO1_REG_DATA);
}
```

## Open Questions

- Linux 5.x/6.x 内核中字符设备驱动的变化
- Platform 设备驱动与 Device Tree 的结合方式

## Related Pages

- [[linux-device-driver]]
- [[character-device]]
- [[platform-driver]]
