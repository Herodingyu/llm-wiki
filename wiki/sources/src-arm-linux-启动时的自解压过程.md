---
doc_id: src-arm-linux-启动时的自解压过程
title: ARM Linux 启动时的自解压过程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/ARM Linux 启动时的自解压过程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, linux, arm, boot, decompression]
---

## Summary

本文详细解析了ARM Linux内核启动时的自解压（self-decompression）过程。ARM Linux通常使用压缩内核镜像（zImage）以节省存储空间和加快加载速度。文章从Bootloader加载内核开始，深入分析了arch/arm/boot/compressed/head.S中的解压启动代码，包括物理内存地址确定、解压空间检查、缓存和MMU处理、以及最终的decompress_kernel调用。核心在于理解zImage如何在无MMU、无缓存的原始环境下完成自解压，并将解压后的内核（vmlinux）放置到正确的物理内存位置，为后续内核启动做准备。

## Key Points

### 1. 为什么使用压缩内核
- **节省存储空间**：例如vmlinux 11.8MB，zImage仅4.8MB，节省50%+
- **加快加载速度**：从NAND Flash等慢速存储加载时，解压时间通常小于传输未压缩镜像的时间

### 2. Bootloader的准备工作
- **加载位置**：将内核映像放置到物理内存的某个位置
- **寄存器传参**：
  - r0 = 0
  - r1 = Machine ID（传统）/ 忽略（设备树时代）
  - r2 = ATAG指针（传统）/ DTB指针（设备树时代）
- **执行环境**：管理模式下跳转，中断、MMU、缓存均disabled

### 3. zImage解压启动流程（arch/arm/boot/compressed/head.S）
- **入口**：`start`符号，以8/7个NOP指令开头（遗留原因）
- **保存参数**：保存ATAG/DTB指针（r2）到r8，架构ID（r1）到r7
- **确定物理内存起始地址**：
  - 现代平台通过`AUTO_ZRELADDR`配置，将PC寄存器128MB对齐获得
  - 假设内核加载在物理内存第一块的起始部分
- **检查解压空间**：确保目标解压地址不会覆盖当前运行的解压代码
- **缓存和MMU处理**：
  - 若启用了缓存，需要处理一致性问题
  - 关闭MMU（若已开启）
- **调用解压代码**：`decompress_kernel()`将压缩内核解压到指定位置

### 4. 解压后的启动
- 解压完成后，跳转到解压后的内核入口（stext）
- 此时进入真正的内核启动流程（setup_arch、start_kernel等）

### 5. 新旧架构差异
- **传统ARM（arch/arm）**：使用zImage自解压机制
- **ARM64（arch/arm64）**：Image格式，通常由Bootloader（如UEFI）负责解压
- **设备树支持**：现代内核使用DTB传递硬件信息，替代传统ATAG

## Key Quotes

> "ARM Linux 一般都使用压缩的内核，例如 zImage。"

> "在我工作的平台上，vmlinux 未压缩的内核是 11.8 MB，而压缩后的 zImage 只有4.8MB，节省了 50% 以上的空间。"

> "通常情况下，解压消耗的时间比从存储介质传输未压缩镜像的时间要短。"

## Evidence

- Source: [原始文章](raw/tech/bsp/ARM Linux 启动时的自解压过程.md) [[../../raw/tech/bsp/ARM Linux 启动时的自解压过程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/ARM Linux 启动时的自解压过程.md) [[../../raw/tech/bsp/ARM Linux 启动时的自解压过程.md|原始文章]]
