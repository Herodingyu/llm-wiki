---
doc_id: src-character-device-driver
title: 字符设备驱动
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/字符设备驱动.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, character-device, driver]
---

## Summary

本文系统介绍了 Linux 字符设备驱动的核心概念和 API。字符设备使用 cdev 结构体描述，设备号 dev_t 为 32 位（12 位主设备号 + 20 位次设备号）。文章详细讲解了设备号分配、字符设备初始化、注册和注销的 API，以及 file_operations 结构体的关键成员。

## Key Points

### 1. cdev 结构体
```c
struct cdev {
    struct kobject kobj;
    struct module *owner;
    const struct file_operations *ops;
    struct list_head list;
    dev_t dev;           // 设备号
    unsigned int count;
};
```

### 2. 设备号操作
- **MKDEV(major, minor)**: 组合主/次设备号
- **MAJOR(dev)**: 提取主设备号
- **MINOR(dev)**: 提取次设备号

### 3. 设备号分配与释放
```c
int register_chrdev_region(dev_t from, unsigned count, const char *name);
int alloc_chrdev_region(dev_t *dev, unsigned baseminor, unsigned count, const char *name);
void unregister_chrdev_region(dev_t from, unsigned count);
```

### 4. 字符设备初始化与注册
```c
void cdev_init(struct cdev *cdev, const struct file_operations *fops);
struct cdev *cdev_alloc(void);  // 动态分配
int cdev_add(struct cdev *p, dev_t dev, unsigned count);  // 添加到系统
void cdev_del(struct cdev *p);  // 删除
```

### 5. file_operations 关键成员
- `open`: 打开设备
- `release`: 关闭设备
- `read`: 读取数据
- `write`: 写入数据
- `ioctl`: 设备控制命令
- `mmap`: 内存映射
- `llseek`: 文件位置操作
- `poll`: 查询是否阻塞

## Evidence

- dev_t: 32位，12位主设备号 + 20位次设备号
- 主设备号标识设备类别，次设备号标识具体设备
- 字符设备统一放在 /dev 目录

## Open Questions

- 动态分配设备号（alloc_chrdev_region）与静态分配的选择策略
- 字符设备与块设备在驱动开发中的关键差异

## Related Pages

- [[character-device]]
- [[linux-device-driver]]
- [[file-operations]]
