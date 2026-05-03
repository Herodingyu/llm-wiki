---
doc_id: src-u-boot中有好多start-s-怎么确定从哪个开始执行啊-闪光吧linux-的回答
title: u boot中有好多start.s,怎么确定从哪个开始执行啊？   闪光吧Linux 的回答
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/u-boot中有好多start.s,怎么确定从哪个开始执行啊？ - 闪光吧Linux 的回答.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, uboot, bootloader, build-system]
---

## Summary

本文解答了 U-Boot 工程中有多个 start.S 文件时，如何确定编译时实际使用哪个 start.S 的实用问题。文章介绍了三种快速确定方法：查看 u-boot.map 文件中的 .text 段、查看 u-boot.lds 链接脚本中的入口定义、以及搜索 start.o 编译产物。此外，文章还深入分析了 U-Boot 的 Makefile 体系，包括 `make xxx_defconfig` 的执行流程、Kconfig 配置系统的调用链、以及 `scripts/basic/fixdep` 等辅助工具的编译过程，帮助开发者从表面技巧深入到 U-Boot 编译系统的底层逻辑。

## Key Points

### 1. 确定 start.S 的三种方法
| 方法 | 操作 | 原理 |
|------|------|------|
| 方法1 | 查看 `u-boot.map` 中的 `.text` 段 | 找到 `start.o` 的路径 |
| 方法2 | 查看 `u-boot.lds` 链接脚本 | 查看入口定义 |
| 方法3 | `find . -name "start.o"` | 搜索编译产物 |

### 2. 编译流程
```bash
# 步骤1：确定单板配置
make qemu_arm64_defconfig

# 步骤2：编译
make CROSS_COMPILE=aarch64-linux-gnu- -j4

# 步骤3：确定 start.S
# 查看 u-boot.map / u-boot.lds 或搜索 start.o
```

### 3. make xxx_defconfig 执行流程
```
%config: scripts_basic outputmakefile FORCE
  → $(MAKE) $(build)=scripts/kconfig $@
```

**依赖项**:
| 依赖 | 作用 |
|------|------|
| FORCE | 强制触发目标更新，避免 Make 跳过配置 |
| outputmakefile | 源码目录与输出目录分离时生成 Makefile |
| scripts_basic | 编译辅助工具（如 fixdep） |

### 4. Makefile.build 框架
- `make -f scripts/Makefile.build obj=scripts/basic`
- 通用构建框架，所有目录编译基于此
- 编译 `fixdep` 工具（解析代码依赖）

### 5. Kconfig 配置系统
- `conf` 工具编译：读取 `configs/xxx_defconfig` + Kconfig 规则 → 生成 `.config`
- 调用链：`%config` → `scripts/kconfig` → `conf` → `.config`

### 6. U-Boot 驱动模型
| 结构体 | 作用 |
|--------|------|
| `struct driver` | 描述驱动程序，包含 name、uclass_id、of_match、bind/probe/remove 等回调 |
| `struct udevice` | 设备实例，通过 `U_BOOT_DEVICE` 或设备树定义 |

**绑定流程**:
```
dm_init_and_scan() → lists_bind_fdt() → 匹配 compatible → 创建 udevice → 绑定 driver
```

## Evidence

- U-Boot 编译命令：`make qemu_arm64_defconfig; make CROSS_COMPILE=aarch64-linux-gnu- -j4`
- fixdep 工具路径：`scripts/basic/fixdep`
- 链接脚本路径：`u-boot.lds`（由 Makefile 生成）

## Open Questions

- 不同架构（ARM32/ARM64/RISC-V）的 start.S 选择逻辑
- U-Boot 的 SPL 和 U-Boot proper 使用不同 start.S 的情况

## Key Quotes

> "最好的办法是先编译U-boot。如果你还不清楚如何编译U-boot，请先看我的文章： 没时间看也没关系，请继续往下看，我手把手教你："

> "总结 到此，你已经学会了如何确定当前 主板 U-boot运行的是哪个start.s。当然以上只是经验之上的技巧"

> "（1）依赖项 1：FORCE目标 FORCE 是顶层 Makefile 定义的'空目标'： 1610 PHONY += FORCE 1611 FORCE: 作用： 强制触发目标更新"

> "4.2 编译配置工具scripts/kconfig/conf 中定义了 工具的编译规则， 会调用该规则，编译 scripts/kconfig/conf.c zconf.tab.c 可执行工具"

## Related Links

- [原始文章](raw/tech/bsp/u-boot中有好多start.s,怎么确定从哪个开始执行啊？ - 闪光吧Linux 的回答.md)
- [[u-boot]]
- [[bootloader]]
- [[device-driver]]
- [[device-tree]]
