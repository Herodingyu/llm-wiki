---
doc_id: src-linux-why-mount
title: Linux 为什么要挂载
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/linux为什么访问设备数据先要mount - 醉卧沙场 的回答.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, mount, filesystem, block-device]
---

## Summary

本文深入解释了 Linux 中访问设备数据前为什么要先挂载。核心区别在于：/dev 下的设备文件面向的是存储设备本身（块设备），而用户需要的是文件系统提供的"文件"抽象。存储设备提供的访问单元是块（扇区），直接读取得到的是杂乱的二进制数据。挂载操作将文件系统模块与存储设备关联，使文件系统的元数据（文件名、路径、权限等）被正确解析，用户才能有序地访问文件。

## Key Points

### 1. 存储设备 vs 文件系统
- **存储设备**（/dev/sdb4）: 面向块（扇区），直接读写得到二进制数据
- **文件系统**: 提供"文件"抽象，管理文件名、路径、权限等元数据
- 文件数据可能散落在存储设备的各个角落

### 2. 为什么需要挂载
- 文件数据散落在不同块中
- 需要文件系统管理逻辑来组织这些数据
- 挂载 = 将文件系统模块与存储设备关联，激活运行状态

### 3. 挂载的作用
- 识别设备上的文件系统类型
- 调用适当的驱动读取文件系统元数据
- 将文件和目录关系挂载到全局目录树
- 初始化其他必要的文件系统状态

### 4. 不挂载直接访问 /dev 的问题
```bash
dd if=/dev/sdb4 of=/tmp/test bs=4M count=2
# 复制出来的是杂乱无章的二进制数据，无法读取有效文件内容
```

### 5. Linux 设计哲学
- 一切皆文件（广义）
- 文件 = 可以打开、关闭、读取、写入的实体
- 包括：逻辑文件（pdf、图片）、物理设备（CPU、GPU、磁盘）、内核对象（锁、信号量）

## Evidence

- /dev 下的设备文件只记录设备"身份证"
- mount 后才可通过 ls 看到文件夹和文件
- ext4、NTFS 等文件系统负责元数据管理

## Open Questions

- 文件系统驱动（VFS）的挂载流程
- 不同文件系统（ext4、XFS、Btrfs）的挂载差异

## Related Pages

- [[mount]]
- [[filesystem]]
- [[vfs]]
- [[block-device]]
