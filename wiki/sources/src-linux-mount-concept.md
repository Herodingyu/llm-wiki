---
doc_id: src-linux-mount-concept
title: Linux 挂载概念详解
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/linux 挂载 到底是什么作用呢，可不可以回答得形象点啊？ - Linux段子手老王 的回答.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, mount, filesystem]
---

## Summary

本文用形象的方式解释了 Linux 挂载的概念。挂载相当于 Windows 中给未分配盘符的磁盘分配盘符（如 D 盘、E 盘），分配后才能在"我的电脑"中看到并访问。Linux 中挂载是将存储设备的内容放到文件目录树中，使用户可以通过目录访问设备中的文件。

## Key Points

### 1. 挂载的本质
- 将存储设备的内容关联到文件系统的某个目录
- 类似于 Windows 分配盘符

### 2. 类比理解
- **Windows**: 未分配盘符的磁盘只能在磁盘管理中看到
- **Linux**: 未挂载的设备无法直接访问文件

### 3. 挂载的作用
- 使存储设备中的文件和目录可见
- 通过挂载点目录访问设备内容
- 支持创建、删除、读写文件

### 4. 实际应用
- Linux 系统损坏时，可挂载其他正常 Linux 系统读取文件
- U 盘、硬盘、分区都需要挂载后才能使用

## Evidence

- 挂载前：只能在 /dev 下看到设备文件
- 挂载后：通过挂载点目录访问设备内容
- `mount /dev/sdc /new_disk` → /new_disk 下可见完整文件系统

## Open Questions

- 自动挂载（fstab、systemd automount）的配置方法
- 网络文件系统（NFS、SMB）的挂载差异

## Related Pages

- [[mount]]
- [[filesystem]]
- [[rootfs]]
