---
doc_id: src-uboot-core-issues
title: U-Boot 开发的几个核心问题
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/【长文】说说UBOOT开发的几个核心问题.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, uboot, bootloader]
---

## Summary

本文系统阐述了 U-Boot 作为嵌入式系统 bootloader 的核心作用，包括：启动操作系统内核、部署整个计算机系统、驱动外设（Flash、LCD、触摸屏等）、提供命令行界面。文章详细介绍了 U-Boot 的版本演进、可移植性概念、生命周期、命令体系、环境变量机制，以及 Flash 和 DDR 的分区管理策略。

## Key Points

### 1. U-Boot 的核心作用
- 启动操作系统内核（终极目标）
- 部署整个计算机系统（uboot/kernel/rootfs 镜像烧录）
- 驱动外设（Flash、LCD、触摸屏、网卡等）
- 提供命令行界面供人工操作

### 2. 启动流程对比
- **PC 机**: BIOS → 初始化 DDR/硬盘 → 加载 OS 到 DDR → 跳转执行
- **嵌入式 Linux**: U-Boot → 初始化 DDR/Flash → 加载 OS 到 DDR → 启动 OS
- **Android**: 与 Linux 类似，但在 rootfs 加载后有差异

### 3. U-Boot 的生命周期
- 本质是裸机程序，上电自动启动
- 唯一出口是启动内核（执行后无法返回）
- 重启不是"复活"，而是新的生命周期

### 4. Flash 分区管理
- U-Boot 必须从 Flash 起始地址开始存放
- 典型分区：uboot (512KB/1MB) → env (32KB+) → kernel (3-5MB) → rootfs (剩余)
- 分区表在 U-Boot 和 Kernel 中使用同一个

### 5. 常用命令
- `printenv`/`print`: 打印环境变量
- `setenv`/`set`: 设置环境变量
- `saveenv`/`save`: 保存环境变量到 Flash
- `tftp`: 通过网络下载镜像
- `bootm`: 启动内核（传参）
- `go`: 跳转执行（不传参）

### 6. 关键环境变量
- `bootdelay`: 自动启动倒数时间
- `bootcmd`: 自动执行的启动命令
- `bootargs`: 传递给内核的启动参数
- `ipaddr`/`serverip`: 网络配置

## Evidence

- U-Boot 镜像大小一般在 180KB-400KB 之间
- 环境变量存储在 Flash 的专用分区，掉电保持
- 典型 bootargs: `console=ttySAC0,115200 root=/dev/mmcblk0p2 rw init=/linuxrc rootfstype=ext3`

## Open Questions

- 不同 SoC 的启动设计差异对 U-Boot 移植的影响
- U-Boot 驱动模型（DM）与传统驱动的兼容性

## Related Pages

- [[u-boot]]
- [[bootloader]]
- [[soc-boot]]
