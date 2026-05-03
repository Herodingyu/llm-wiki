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

[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944) 22 人赞同了该文章 本文基于以下软硬件假定：

## Key Points

### 1. １　Linux启动基础镜像
uboot主要用于启动操作系统，以armv8架构下的linux为例，其启动时需要包含kernel、dtb和rootfs三部分。uboot镜像都是以它们为基础制作的，因此在介绍uboot镜像格式之前我们需要先了解一下它们的构成。

### 2. １.1　内核镜像


### 3. １.1.1　vmlinux镜像
linux内核编译完成后会在根目录生成原始的内核文件为vmlinux，使用readelf工具可看到其为elf文件格式： ``` lgj@ubuntu:~/work/linux$ readelf -h vmlinux

### 4. １.1.2　Image和zImage镜像
Image镜像是vlinux经过objcopy去头后生成的纯二进制文件，对于armv8架构其编译的Makefile如下： ``` OBJCOPYFLAGS_Image := -O binary -R .note -R .note.gnu.build-id -R .comment –S   （1）

### 5. １.2　设备树
设备树是设备树dts源文件经过编译后生成的，其目标文件为二进制格式的dtb文件。其示例编译命令如下： ``` dtc -I dts -O dtb -o example.dtb example.dts ```

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（八） uboot启动流程三.md) [[../../raw/tech/bsp/聊聊SOC启动（八） uboot启动流程三.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（八） uboot启动流程三.md) [[../../raw/tech/bsp/聊聊SOC启动（八） uboot启动流程三.md|原始文章]]
