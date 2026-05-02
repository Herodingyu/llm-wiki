---
doc_id: src-linux-driver-basics
title: Linux 底层驱动基础认知
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/对于Linux底层驱动的简单认知.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, device-driver]
---

## Summary

本文从初学者角度介绍了 Linux 底层驱动的基本概念。驱动是使设备工作的基本程序，通过操作 CPU 寄存器实现功能。用户通过 /dev 目录下的设备节点文件操作驱动。文章详细讲解了主设备号和次设备号的区分方式、驱动链表 file_operations 结构体、以及驱动的注册和使用流程。

## Key Points

### 1. 什么是底层驱动
- 让设备工作的基本程序
- 给用户提供使用设备的接口
- 操作 CPU 寄存器实现功能

### 2. 驱动的使用流程
1. 打开设备：`open("/dev/xxx", O_RDWR)` → 生成文件描述符 fd
2. 发送指令：`write(fd, "xxx", size_t)`
3. 读取数据：`read(fd, char *, size_t)`

### 3. 设备号
- **主设备号**: 区分不同设备（GPIO、I2C、UART 等）
- **次设备号**: 区分相同设备中的多个设备（GPIO.0、GPIO.1 等）
- 查看：`ls -l /dev`

### 4. 驱动链表 file_operations
```c
struct file_operations {
    struct module *owner;
    loff_t (*llseek)(struct file *, loff_t, int);
    ssize_t (*read)(struct file *, char __user *, size_t, loff_t *);
    ssize_t (*write)(struct file *, const char __user *, size_t, loff_t *);
    int (*ioctl)(struct inode *, struct file *, unsigned int, unsigned long);
    int (*mmap)(struct file *, struct vm_area_struct *);
    int (*open)(struct inode *, struct file *);
    int (*release)(struct inode *, struct file *);
    // ...
};
```

### 5. 驱动注册
- 驱动需要加入驱动链表
- 链表位置由设备号决定
- 注册即插入一个节点

## Evidence

- Linux 驱动文件统一放在 /dev 目录
- 一切皆文件，驱动也不例外
- 驱动注册后出现在 /dev 目录

## Open Questions

- 设备树（Device Tree）如何替代传统的硬编码设备信息
- Platform 驱动与 GPIO 子系统的交互方式

## Related Pages

- [[linux-device-driver]]
- [[character-device]]
- [[file-operations]]
