---
doc_id: src-filesystem-rootfs
title: 文件系统与根文件系统
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/何为文件系统，何为根文件系统？ - 宅学部落-王利涛 的回答.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, filesystem, rootfs, linux]
---

## Summary

本文从嵌入式开发角度解释了文件系统和根文件系统的概念。文件系统是管理存储单元（硬盘、NAND Flash 等）的程序，通过目录/文件形式屏蔽底层读写细节，提供统一的 read/write 接口。挂载是将存储分区关联到目录的过程。根文件系统是挂载到 "/" 根节点的文件系统，存放系统启动必需的命令、配置文件和启动脚本。

## Key Points

### 1. 文件系统本质
- 管理存储单元的程序（如硬盘、NAND Flash）
- 将存储空间划分成块，编号，统一管理
- 通过目录/文件形式管理数据
- 屏蔽底层读写时序细节
- 提供统一的 read/write 接口

### 2. 挂载（Mount）
- 将存储分区关联到目录
- 目录成为存储分区的访问入口
- 读写目录 = 读写对应分区
- 删除文件 = 断开映射关系（数据仍在）

### 3. 根文件系统
- 挂载到 "/" 根节点的文件系统
- 存放系统启动必需的文件
- 包括：基本 Linux 命令、系统配置文件、启动脚本
- 嵌入式系统中通常是 NAND 的一个分区

### 4. 文件系统类型
- **RAM 文件系统**: 存在于内存中，速度快
- **存储文件系统**: 管理磁盘、U盘、SD 卡等，速度较慢
- 不同存储设备可挂载到根文件系统的目录下

## Evidence

- 无文件系统时需了解 NAND 读写时序，一页一页读取
- 有文件系统后通过文件名即可读写
- 删除文件只是断开映射，数据可恢复（除非格式化）

## Open Questions

- 不同文件系统（ext4、FAT32、JFFS2、UBIFS）的适用场景
- 嵌入式系统中根文件系统的选择和优化

## Related Pages

- [[filesystem]]
- [[rootfs]]
- [[mount]]
- [[nand-flash]]
