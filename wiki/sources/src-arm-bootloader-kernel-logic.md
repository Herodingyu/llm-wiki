---
doc_id: src-arm-bootloader-kernel-logic
title: ARM Bootloader 到 Kernel 启动总逻辑
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/ARM 架构bootloader到kernel启动总逻辑.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, arm, bootloader, kernel]
---

## Summary

本文简明扼要地描述了 ARM 架构中从 bootloader 到 kernel 的启动总逻辑。ARMv8 中 EL0/EL1 必须实现，EL2/EL3 选配。若平台未实现 EL3（ATF），pre-loader 直接加载 lk（u-boot）；若实现 EL3，则先加载 ATF，再由 ATF 加载 lk。启动分为两个阶段：pre-loader 加载 lk/u-boot，以及 lk 加载 kernel。

## Key Points

### 1. 异常等级映射
- EL0: App
- EL1: Linux kernel、lk
- EL2: Hypervisor（虚拟化）
- EL3: ARM trust firmware、pre-loader

### 2. 无 ATF 的启动路径
```
Boot ROM → Pre-loader (ISRAM) → lk/u-boot (DRAM) → Kernel
```

### 3. 有 ATF 的启动路径
```
Boot ROM → Pre-loader (ISRAM) → ATF → lk/u-boot (DRAM) → Kernel
```

### 4. 启动步骤详解
1. **设备上电** → 跳转到 Boot ROM 中的 boot code
2. **Boot ROM** 将 pre-loader 加载到 ISRAM（Internal SRAM）
   - 此时 DRAM 尚未准备好
3. **Pre-loader** 初始化 DRAM
4. **Pre-loader** 将 lk/u-boot 从 Flash（nand/emmc）加载到 DRAM
5. **lk/u-boot** 解压 bootimage 成 ramdisk 和 kernel，载入 DRAM
6. **lk/u-boot** 初始化 dtb（设备树）
7. **lk 跳转到 kernel** 初始化
8. **Kernel** 初始化完成后 fork 出 init 进程
9. **Init 进程** 拉起 ramdisk 中的 init 程序，进入用户空间初始化

## Evidence

- DRAM（RAM 分 SRAM 和 DRAM，SRAM 用于 cache，DRAM 用于普通内存）
- ISRAM: Internal SRAM，芯片内部 SRAM
- Boot ROM 不是 Flash，是芯片内部固化的 ROM

## Open Questions

- 不同厂商（联发科、高通、华为）pre-loader 的实现差异
- lk（Little Kernel）与 u-boot 的选择依据

## Related Pages

- [[soc-boot]]
- [[armv8]]
- [[atf]]
- [[u-boot]]
- [[linux-boot]]
