---
doc_id: src-arm-bootloader-kernel-logic
title: ARM Bootloader 到 Kernel 启动总逻辑
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/ARM 架构bootloader到kernel启动总逻辑.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-03
tags: [bsp, arm, bootloader, kernel]
---

## Summary

本文简明扼要地描述了 ARM 架构中从 bootloader 到 kernel 的完整启动逻辑。ARMv8 中 EL0/EL1 必须实现，EL2/EL3 为选配。启动流程分为两个阶段：pre-loader 加载 lk/u-boot，以及 lk 加载 kernel。若平台未实现 EL3（ATF），pre-loader 直接加载 lk；若实现 EL3，则先加载 ATF，再由 ATF 加载 lk。整个过程涉及 Boot ROM、ISRAM、DRAM 等关键存储介质，以及设备树（dtb）的初始化。

## Key Points

### 1. 异常等级映射
| 异常等级 | 运行实体 |
|---------|---------|
| EL0 | 用户应用 (App) |
| EL1 | Linux kernel、lk (Little Kernel) |
| EL2 | Hypervisor（虚拟化） |
| EL3 | ARM Trust Firmware、pre-loader |

### 2. 启动路径对比
| 场景 | 启动流程 |
|------|---------|
| 无 ATF | Boot ROM → Pre-loader (ISRAM) → lk/u-boot (DRAM) → Kernel |
| 有 ATF | Boot ROM → Pre-loader (ISRAM) → ATF → lk/u-boot (DRAM) → Kernel |

### 3. 启动步骤详解
1. **设备上电** → 跳转到 Boot ROM 中的 boot code
2. **Boot ROM** 将 pre-loader 加载到 ISRAM（Internal SRAM），此时 DRAM 尚未准备好
3. **Pre-loader** 初始化 DRAM
4. **Pre-loader** 将 lk/u-boot 从 Flash（NAND/eMMC）加载到 DRAM
5. **lk/u-boot** 解压 bootimage 成 ramdisk 和 kernel，载入 DRAM
6. **lk/u-boot** 初始化 dtb（设备树）
7. **lk 跳转到 kernel** 开始初始化
8. **Kernel** 初始化完成后 fork 出 init 进程
9. **Init 进程** 拉起 ramdisk 中的 init 程序，进入用户空间初始化

### 4. 关键存储介质
- **ISRAM**: Internal SRAM，芯片内部 SRAM，用于早期代码执行
- **DRAM**: 普通内存，pre-loader 初始化后使用
- **Boot ROM**: 芯片内部固化的 ROM，非 Flash

## Evidence

- DRAM（RAM 分 SRAM 和 DRAM，SRAM 用于 cache，DRAM 用于普通内存）
- ISRAM: Internal SRAM，芯片内部 SRAM
- Boot ROM 不是 Flash，是芯片内部固化的 ROM

## Open Questions

- 不同厂商（联发科、高通、华为）pre-loader 的实现差异
- lk（Little Kernel）与 u-boot 的选择依据

## Key Quotes

> "若平台未实现EL3（atf），pre-loader直接加载lk："

> "若平台实现EL3，则需要先加载完ATF再由ATF去加载lk："

> "**4-6：** pre-loader初始化好DRAM后就将lk从flash（nand/emmc）中加载到DRAM中运行；"

> "Boot ROM (不是flash)中的boot code中执行把pre-loader加载起到ISRAM"

## Related Pages

- [[soc-boot]]
- [[armv8]]
- [[atf]]
- [[u-boot]]
- [[linux-boot]]
