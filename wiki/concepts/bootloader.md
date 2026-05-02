---
doc_id: bootloader
title: Bootloader
page_type: concept
related_sources:
  - src-uboot-core-issues
  - src-arm-bootloader-kernel-logic
  - src-armv8-bootflow-overview
  - src-soc-bootflow-detailed
  - src-uefi-loader
  - src-arm-secure-boot-atf
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, bsp, bootloader]
---

# Bootloader

## 定义

Bootloader 是在操作系统内核运行之前运行的一段小程序。它负责初始化硬件设备、建立内存空间映射图，将操作系统内核映像从存储介质（Flash、硬盘、网络等）加载到 RAM 中，并将系统控制权转交给操作系统内核。

## 启动流程（通用）

```
上电 → BootROM → Bootloader → 内核 → 根文件系统 → 用户空间
```

### ARM 典型启动链
```
BL1 (BootROM) → BL2 (SPL/U-Boot) → BL31 (ATF) → BL32 (OP-TEE) → BL33 (U-Boot/UEFI) → Linux
```

### x86 典型启动链
```
BIOS/UEFI → Bootloader (GRUB) → Linux
```

## Bootloader 类型

| 类型 | 代表 | 特点 |
|------|------|------|
| 通用型 | U-Boot | 支持多架构，功能丰富，社区活跃 |
| 轻量型 | Barebox | U-Boot 前身，代码更精简 |
| x86 专用 | GRUB | GNU 项目，支持多系统引导 |
| 嵌入式 | RedBoot | eCos 项目，支持调试 |
| 厂商定制 | lk (Little Kernel) | 高通/联发科常用 |
| 固件标准 | UEFI | 统一可扩展固件接口 |

## 核心职责

1. **硬件初始化**：DDR、时钟、GPIO、存储控制器
2. **加载内核**：从 Flash/SD/网络读取内核镜像
3. **传递参数**：设置 bootargs、设备树地址
4. **启动内核**：跳转到内核入口点执行

## 执行模式

- **XIP (Execute In Place)**：直接在 Flash 中执行（NOR Flash）
- **RAM 执行**：加载到 RAM 后执行（NAND Flash、SD 卡）

## 相关概念

- [[u-boot]] — 最流行的开源 bootloader
- [[atf]] — ARM 可信固件
- [[secure-boot]] — 安全启动机制
- [[device-tree]] — 硬件描述方式
