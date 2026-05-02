---
doc_id: u-boot
title: U-Boot
page_type: concept
related_sources:
  - src-uboot-core-issues
  - src-uboot-bootflow-analysis
  - src-uboot-dm-model
  - src-uboot-start-s-determination
  - src-arm-bootloader-kernel-logic
  - src-soc-bootflow-detailed
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, bsp, bootloader]
---

# U-Boot

## 定义

U-Boot（Universal Boot Loader）是嵌入式系统中最广泛使用的开源 boot loader，由德国 DENX 软件工程中心的 Wolfgang Denk 于 1999 年发起。它支持多种处理器架构（ARM、x86、MIPS、PowerPC、RISC-V 等）和大量开发板，是事实上的嵌入式 boot loader 标准。

## 核心功能

1. **启动操作系统内核**：U-Boot 的终极目标是加载并启动 Linux（或其他 OS）内核
2. **系统部署**：支持通过 tftp、fastboot、SD 卡等方式烧录系统镜像
3. **硬件初始化**：初始化 DDR、Flash、网卡、LCD、串口等外设
4. **命令行交互**：提供类似 shell 的命令行界面，支持数十种命令
5. **环境变量管理**：支持在 Flash 中持久化存储配置参数

## 启动流程

U-Boot 启动分为两个阶段：

### BL1 (SPL - Secondary Program Loader)
- 由 SoC bootROM 加载到 SRAM
- 完成最基本硬件初始化（DDR 初始化）
- 将 U-Boot 主程序加载到 DDR

### BL2 (U-Boot Proper)
1. **链接脚本入口**：`u-boot.lds` 中 `ENTRY(_start)` 定义入口
2. **board_init_f**：前置初始化（串口、定时器、设备树、DM 模型）
3. **relocate_code**：代码重定位到 DDR 高端地址
4. **board_init_r**：后置初始化（外设、网络、存储）
5. **main_loop**：主循环，处理命令行或自动启动

## 驱动模型 (DM)

U-Boot 从 2014 年开始引入 Driver Model，借鉴 Linux 设备驱动模型：

- **uclass**：驱动类别管理器（如 GPIO、MMC、NET）
- **uclass_driver**：为 uclass 提供统一操作接口
- **udevice**：设备实例，通过设备树或硬编码定义
- **driver**：具体驱动实现，通过 `U_BOOT_DRIVER` 宏注册

## 常用命令

| 命令 | 功能 |
|------|------|
| `bootm` | 启动内核并传参 |
| `go` | 跳转到地址执行（不传参） |
| `tftp` | 通过网络下载镜像 |
| `mmc`/`movi` | SD/eMMC 操作 |
| `nand` | NAND Flash 操作 |
| `setenv`/`printenv` | 环境变量管理 |
| `saveenv` | 保存环境变量到 Flash |

## 环境变量

- **bootcmd**：自动启动命令
- **bootargs**：传递给内核的启动参数
- **bootdelay**：自动启动倒计时
- **ipaddr**/**serverip**：网络配置

## 相关来源

- [[src-uboot-core-issues]] — U-Boot 核心问题详解
- [[src-uboot-bootflow-analysis]] — BL2 启动流程分析
- [[src-uboot-dm-model]] — DM 驱动模型详解
- [[src-uboot-start-s-determination]] — start.S 选择与 Makefile 分析
