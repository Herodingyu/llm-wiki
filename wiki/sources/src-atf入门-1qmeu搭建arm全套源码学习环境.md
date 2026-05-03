---
doc_id: src-atf入门-1qmeu搭建arm全套源码学习环境
title: ATF入门-1：QEMU搭建ARM全套源码学习环境
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/ATF入门-1qmeu搭建ARM全套源码学习环境.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, atf, qemu, arm, optee, uefi]
---

## Summary

本文介绍了如何通过QEMU搭建完整的ARM软件栈学习环境，涵盖从BL1、BL2、BL31、U-Boot、OP-TEE、SCP到Linux的完整启动流程。基于OP-TEE官方manifest仓库，使用repo工具同步整套源码，包括ATF（trusted-firmware-a）、OP-TEE OS、Linux内核、EDK2（UEFI实现）、QEMU模拟器等。文章详细说明了源码下载、编译依赖安装、编译运行步骤，以及各源码目录的功能说明。这是一个"王炸"级别的开源学习资源，涵盖了ARM嵌入式最核心的技术知识。

## Key Points

### 1. 源码下载
- **仓库**：OP-TEE官方manifest
- **命令**：
  ```bash
  mkdir -p optee && cd optee
  repo init -u https://github.com/OP-TEE/manifest.git -m qemu_v8.xml
  repo sync -j4 --no-clone-bundle
  ```
- **前提**：安装repo工具，需要访问GitHub

### 2. 源码目录结构
| 目录 | 功能 |
|------|------|
| **build/** | 不同平台的Makefile及Kconfig |
| **buildroot/** | 编译工具链 |
| **edk2/** | UEFI标准Bootloader源码 |
| **linux/** | Linux内核源码 |
| **optee_os/** | OP-TEE安全OS源码 |
| **optee_client/** | OP-TEE非安全侧源码 |
| **qemu/** | QEMU模拟器源码 |
| **trusted-firmware-a/** | ATF源码 |
| **out/** | 编译输出镜像（bl1.bin, bl2.bin等） |
| **toolchains/** | 交叉编译工具链 |

### 3. 编译运行
- **编译依赖**：
  ```bash
  sudo dpkg --add-architecture i386
  sudo apt-get update
  sudo apt-get install android-tools-adb autoconf ...
  ```
- **编译运行**：
  ```bash
  cd ~/optee/build
  make run          # 编译并运行
  make -f qemu_v8.mk run-only  # 仅运行
  ```

### 4. 学习资源
- **ATF官网**：trustedfirmware.org
- **OP-TEE文档**：optee.readthedocs.io
- **周贺贺ARM资料**：hehezhou.cn/arm/index.html

### 5. 涵盖技术栈
- **安全固件**：ATF（BL1/BL2/BL31）
- **可信执行环境**：OP-TEE
- **Bootloader**：U-Boot / EDK2
- **系统控制**：SCP固件
- **操作系统**：Linux内核
- **模拟环境**：QEMU v8

## Key Quotes

> "你想学习的ARM软件技术都在这套源码里面，可以qemu运行起来从BL1、BL2、BL31、uboot、optee、SCP、linux等。"

> "这套源码可以做什么？可以说很多培训班、卖课的都在讲这些东西，ARM嵌入式最核心的一些知识都在这些源码里面。"

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-1qmeu搭建ARM全套源码学习环境.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-1qmeu搭建ARM全套源码学习环境.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-1qmeu搭建ARM全套源码学习环境.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-1qmeu搭建ARM全套源码学习环境.md|原始文章]]
