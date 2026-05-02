---
doc_id: linux-device-driver
title: Linux 设备驱动
page_type: concept
related_sources:
  - src-linux-device-driver-overview
  - src-linux-driver-basics
  - src-uio-driver-mechanism
  - src-character-device-driver
  - src-userspace-hardware-access
  - src-graphics-driver-basics
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, bsp, driver]
---

# Linux 设备驱动

## 定义

Linux 设备驱动是对硬件设备的抽象，为应用程序提供统一的访问接口。它是操作系统内核的一部分，负责与硬件设备进行通信，屏蔽底层硬件差异。

## 驱动类型

| 类型 | 特点 | 示例 |
|------|------|------|
| 字符设备 | 按字节流访问 | 串口、GPIO、LED |
| 块设备 | 按块访问，支持缓存 | 硬盘、SSD、SD 卡 |
| 网络设备 | 数据包收发 | 网卡、WiFi |
| 平台设备 | 通过设备树描述 | SoC 内部外设 |

## 字符设备驱动核心

### 设备号
- **主设备号**：标识设备类别
- **次设备号**：标识具体设备
- `dev_t`：32 位，12 位主设备号 + 20 位次设备号

### file_operations
```c
struct file_operations {
    .open = drv_open,
    .release = drv_release,
    .read = drv_read,
    .write = drv_write,
    .ioctl = drv_ioctl,
    .mmap = drv_mmap,
};
```

### 注册流程
1. `alloc_chrdev_region()` — 分配设备号
2. `cdev_init()` — 初始化字符设备
3. `cdev_add()` — 注册到内核

## 驱动模型演进

### 传统驱动
- 硬编码设备信息
- 大量平台相关代码

### 平台驱动 + 设备树
- 设备信息从代码中分离
- 通过设备树描述硬件
- 驱动通过 `compatible` 字符串匹配设备

### UIO（Userspace I/O）
- 内核中只需少量代码注册设备
- 用户空间通过 `mmap()` 直接访问硬件寄存器
- 适合 DPDK 等高性能场景

## 开发建议

- 尽量避免从零构建驱动
- 在高度模块化的驱动框架中添加设备驱动
- 复用内核现有代码，获得弹性和可维护性

## 相关来源

- [[src-linux-device-driver-overview]] — 设备驱动概述
- [[src-character-device-driver]] — 字符设备详解
- [[src-uio-driver-mechanism]] — UIO 机制
- [[src-userspace-hardware-access]] — 用户态驱动实践
