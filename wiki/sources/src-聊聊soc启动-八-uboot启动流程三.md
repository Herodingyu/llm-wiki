---
doc_id: src-聊聊soc启动-八-uboot启动流程三
title: 聊聊SOC启动（八） uboot启动流程三
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（八） uboot启动流程三.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文基于AARCH64架构和U-Boot 2021.10-rc1，详细介绍了U-Boot启动流程的第三阶段——操作系统镜像加载与启动。文章首先介绍了Linux启动所需的三大基础组件：内核镜像（vmlinux/Image/zImage）、设备树（dtb/dtbo）和根文件系统（initrd/initramfs/磁盘rootfs），并详细说明了各组件的生成方式和特性。随后深入解析了U-Boot支持的三种镜像格式：Legacy uImage（64字节header）、FIT uImage（基于设备树语法的its/itb格式，支持多镜像组合和Secure Boot）以及Android Boot Image（v0-v2版本，支持kernel/ramdisk/second stage/dtb）。最后通过流程图详细展示了bootm命令的执行流程，包括镜像头解析、解压校验和最终的do_bootm_linux跳转。

## Key Points

### 1. Linux启动基础镜像

U-Boot启动Linux需要三大组件：

| 组件 | 格式 | 生成方式 | 说明 |
|------|------|----------|------|
| 内核镜像 | vmlinux → Image/zImage | objcopy去ELF头 + 可选压缩 | 纯二进制文件，可被booti直接启动 |
| 设备树 | .dts → .dtb | dtc编译器 | 支持dtb overlay机制 |
| 根文件系统 | initrd/initramfs/磁盘 | 预构建镜像 | initrd需U-Boot独立加载 |

#### 1.1 内核镜像演变

- **vmlinux**: ELF格式，含符号表和调试信息，不能直接用于启动
- **Image**: 通过`objcopy -O binary`去掉ELF头后的纯二进制文件
- **zImage**: Image经gzip压缩后的格式，减小镜像体积

#### 1.2 设备树Overlay机制

支持基础dtb + 多个dtbo的合并方式：
1. 通过FIT镜像自动解析并执行merge
2. 手动加载和apply overlay（通过`fdt resize` + `fdt apply`命令）

#### 1.3 根文件系统类型

| 类型 | 是否需要U-Boot加载 | 传递方式 |
|------|-------------------|----------|
| initrd | 是 | `bootm $kernel_addr $initrd_addr $fdt_addr` |
| initramfs | 否 | 与内核打包在一起 |
| 磁盘rootfs | 否 | `root=/dev/xxx`参数 |

### 2. U-Boot支持的镜像格式

#### 2.1 Legacy uImage格式

64字节header结构（`image_header_t`），包含：
- 魔数、CRC校验、时间戳、数据大小
- 加载地址、入口地址、操作系统类型、架构、压缩类型

**缺点**：
- 需分别加载内核/initrd/dtb
- 启动参数多，需分别指定各组件地址
- Secure Boot支持不足

#### 2.2 FIT uImage格式

基于设备树语法定义镜像描述（.its文件），编译生成.itb文件：

```bash
mkimage -f xxx.its xxx.itb
bootm 0x80000000        # 使用默认配置
bootm 0x80000000#config@2  # 指定非默认配置
```

**核心特性**：
- 支持多内核/ramdisk/fdt组合配置
- 支持完整性校验（md5/sha1/sha256）
- 支持Secure Boot（sha1+rsa2048签名）

#### 2.3 Android Boot Image格式

| 版本 | 新增内容 |
|------|----------|
| v0 | andr_img_hdr + kernel + ramdisk + second stage |
| v1 | 增加recovery dtbo/acpio |
| v2 | 增加dtb |

通过`mkbootimg.py`工具制作，各组件需2K页对齐。

### 3. bootm启动流程

bootm命令执行流程：
1. 解析镜像头获取镜像信息（类型、压缩方式、加载地址等）
2. 根据镜像头执行校验（CRC/hash）和解压
3. 调用特定OS的启动函数（如`do_bootm_linux`）
4. `do_bootm_linux`流程：设置bootargs、加载dtb、准备启动参数、跳转到内核入口

## Key Quotes

> "uboot主要用于启动操作系统，以armv8架构下的linux为例，其启动时需要包含kernel、dtb和rootfs三部分。"

> "Fit uimage是使用devicetree语法来定义uimage镜像描述信息以及启动时的各种属性，这些信息被写入一个后缀名为its的源文件中。"

> "Fit image除了支持完整性校验外，还可支持hash算法 + 非对称算法的secure boot方案。"

> "bootm是uboot用于启动操作系统的命令，它的主要流程包括根据镜像头获取镜像信息，解压镜像，以及启动操作系统。"

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（八） uboot启动流程三.md) [[../../raw/tech/bsp/聊聊SOC启动（八） uboot启动流程三.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（八） uboot启动流程三.md) [[../../raw/tech/bsp/聊聊SOC启动（八） uboot启动流程三.md|原始文章]]
