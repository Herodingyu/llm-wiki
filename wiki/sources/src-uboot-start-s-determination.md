---
doc_id: src-uboot-start-s-determination
title: U-Boot 中如何确定执行哪个 start.S
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/u-boot中有好多start.s,怎么确定从哪个开始执行啊？ - 闪光吧Linux 的回答.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, uboot, bootloader, build-system]
---

## Summary

本文回答了 U-Boot 工程中有多个 start.S 文件时，如何确定编译时实际使用哪个 start.S 的问题。通过分析 U-Boot 的 Makefile 和编译产物，介绍了三种确定方法：查看 u-boot.map 文件中的 .text 段、查看 u-boot.lds 链接脚本、以及搜索 start.o 编译产物。文章还深入分析了 U-Boot 的 Makefile 体系，包括 `make xxx_defconfig` 的执行流程、Kconfig 配置系统的调用链、以及 `scripts/basic/fixdep` 等辅助工具的编译过程。

## Key Points

### 1. 确定 start.S 的三种方法
- **方法1**: 查看 `u-boot.map` 文件中的 `.text` 段，找到 `start.o` 的路径
- **方法2**: 查看 `u-boot.lds` 链接脚本中的入口定义
- **方法3**: 搜索编译产物 `find . -name "start.o"`

### 2. make xxx_defconfig 执行流程
- 触发顶层 Makefile 的 `%config` 模式目标
- 依赖：`scripts_basic` → `outputmakefile` → `FORCE`
- `scripts_basic`: 编译辅助工具（如 fixdep）
- 调用 `scripts/kconfig` 生成 `.config` 文件

### 3. Makefile.build 框架
- `make -f scripts/Makefile.build obj=scripts/basic`
- 通用构建框架，所有目录编译基于此
- 编译 `fixdep` 工具（解析代码依赖）

### 4. Kconfig 配置系统
- `conf` 工具编译：读取 `configs/xxx_defconfig` + Kconfig 规则 → 生成 `.config`
- 调用链：`%config` → `scripts/kconfig` → `conf` → `.config`

### 5. U-Boot 驱动模型中的 driver 结构
- `struct driver`: 描述驱动程序，包含 name、uclass_id、of_match、bind/probe/remove 等回调
- `struct udevice`: 设备实例，通过 `U_BOOT_DEVICE` 或设备树定义
- 绑定流程：`dm_init_and_scan()` → `lists_bind_fdt()` → 匹配 compatible → 创建 udevice → 绑定 driver

## Evidence

- U-Boot 编译命令：`make qemu_arm64_defconfig; make CROSS_COMPILE=aarch64-linux-gnu- -j4`
- fixdep 工具路径：`scripts/basic/fixdep`
- 链接脚本路径：`u-boot.lds`（由 Makefile 生成）

## Open Questions

- 不同架构（ARM32/ARM64/RISC-V）的 start.S 选择逻辑
- U-Boot 的 SPL 和 U-Boot  proper 使用不同 start.S 的情况

## Related Pages

- [[u-boot]]
- [[bootloader]]
- [[device-driver]]
- [[device-tree]]
