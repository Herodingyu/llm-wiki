---
doc_id: filesystem
title: 文件系统（Filesystem）
page_type: concept
related_sources:
  - src-filesystem-rootfs
  - src-linux-mount-concept
  - src-linux-why-mount
  - src-linux-mount-vs-dev
  - src-io-subsystem-overview
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, bsp, filesystem]
---

# 文件系统（Filesystem）

## 定义

文件系统是操作系统用于管理和组织存储设备上的数据的一种机制。它将存储空间划分为块，通过目录和文件的形式管理数据，屏蔽底层存储介质的读写细节，提供统一的访问接口。

## 核心功能

1. **文件管理**：创建、删除、读写文件
2. **目录管理**：层级目录结构
3. **元数据管理**：文件名、权限、时间戳、大小
4. **空间管理**：块分配、碎片整理
5. **权限控制**：读、写、执行权限

## 挂载（Mount）

### 为什么需要挂载
- /dev 下的设备文件面向的是存储设备本身
- 存储设备提供的是块（扇区）访问
- 直接读取得到的是杂乱的二进制数据
- **挂载将文件系统模块与存储设备关联**，激活运行状态

### 挂载的作用
- 识别设备上的文件系统类型
- 调用适当的驱动读取文件系统元数据
- 将文件和目录挂载到全局目录树

```bash
mount /dev/sdc1 /mnt
# /mnt 下就能看到完整的文件系统结构
```

## 根文件系统（Rootfs）

- 挂载到 "/" 的文件系统
- 存放系统启动必需的命令、配置文件、启动脚本
- 嵌入式系统中通常是 NAND 的一个分区

## 常见文件系统

| 文件系统 | 特点 | 适用场景 |
|----------|------|----------|
| ext4 | 稳定、高性能 | Linux 桌面/服务器 |
| XFS | 大文件性能好 | 服务器 |
| FAT32 | 兼容性好 | U 盘、SD 卡 |
| JFFS2 | 日志结构 | NAND Flash（旧） |
| UBIFS | 支持大容量 NAND | NAND Flash |
| LittleFS | 磨损均衡、掉电安全 | 小容量 Flash |
| tmpfs | 内存文件系统 | /tmp、/run |

## Linux IO 子系统

```
syscall → vfs → file_operations → fs → buffer_head → bio → request
→ io scheduler → ctx → hctx → scsi driver → disk
```

## 相关来源

- [[src-filesystem-rootfs]] — 文件系统与根文件系统
- [[src-linux-why-mount]] — 为什么要挂载
- [[src-io-subsystem-overview]] — IO 子系统全流程
