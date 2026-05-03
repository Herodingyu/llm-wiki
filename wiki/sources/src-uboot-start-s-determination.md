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
| 方法 | 操作 | 输出示例 |
|------|------|---------|
| 方法1 | 查看 `u-boot.map` 中的 `.text` 段 | `arch/arm/cpu/armv8/start.o` |
| 方法2 | 查看 `u-boot.lds` 链接脚本 | 入口定义位置 |
| 方法3 | `find . -name "start.o"` | 匹配具体路径 |

### 2. make xxx_defconfig 执行流程
```
%config: scripts_basic outputmakefile FORCE
  → $(MAKE) $(build)=scripts/kconfig $@
```

**依赖解析**:
| 依赖 | 功能 |
|------|------|
| scripts_basic | 编译 fixdep 等辅助工具 |
| outputmakefile | 源码与输出目录分离时生成 Makefile |
| FORCE | 空目标，强制触发重新执行 |

### 3. Makefile.build 框架
- `make -f scripts/Makefile.build obj=scripts/basic`
- 通用构建框架，所有目录编译基于此
- 编译 `fixdep` 工具（解析代码依赖关系）

### 4. Kconfig 配置系统
```
%config → scripts/kconfig → conf → .config
```
- `conf` 工具读取 `configs/xxx_defconfig` + Kconfig 规则
- 生成根目录 `.config` 文件（后续编译的核心依据）

### 5. U-Boot 驱动模型核心结构
| 结构体 | 功能描述 |
|--------|---------|
| `struct driver` | 描述驱动程序，包含 name、uclass_id、of_match、bind/probe/remove 回调 |
| `struct udevice` | 设备实例，通过设备树或 `U_BOOT_DEVICE` 定义 |

**绑定流程**:
```
dm_init_and_scan() → lists_bind_fdt() → 匹配 compatible 
  → 创建 udevice → 绑定 driver
```

## Evidence

- U-Boot 编译命令：`make qemu_arm64_defconfig; make CROSS_COMPILE=aarch64-linux-gnu- -j4`
- fixdep 工具路径：`scripts/basic/fixdep`
- 链接脚本路径：`u-boot.lds`（由 Makefile 生成）

## Open Questions

- 不同架构（ARM32/ARM64/RISC-V）的 start.S 选择逻辑
- U-Boot 的 SPL 和 U-Boot proper 使用不同 start.S 的情况

## Key Quotes

> "最好的办法是先编译U-boot。如果你还不清楚如何编译U-boot，请先看我的文章： 没时间看也没关系，请继续往下看，我手把手教你： 步骤1：确定当前单板配置 比如我当前的单板 配置文件 为'qemu_arm64_defconfig'"

> "总结 到此，你已经学会了如何确定当前 主板 U-boot运行的是哪个start.s。当然以上只是经验之上的技巧"

> "（1）依赖项 1：FORCE目标 FORCE 是顶层 Makefile 定义的'空目标'： 1610 PHONY += FORCE 1611 FORCE: 作用： 强制触发目标更新"

> "4.2 编译配置工具scripts/kconfig/conf 中定义了 工具的编译规则"

## Related Pages

- [[u-boot]]
- [[bootloader]]
- [[device-driver]]
- [[device-tree]]
