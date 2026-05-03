---
doc_id: src-arm-架构bootloader到kernel启动总逻辑
title: ARM 架构bootloader到kernel启动总逻辑
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/ARM 架构bootloader到kernel启动总逻辑.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, arm, bootloader, kernel, boot]
---

## Summary

本文梳理了ARM架构从bootloader到kernel启动的完整流程，基于ARMv8异常等级模型（EL0-EL3）。文章对比了两种启动路径：无ATF平台（pre-loader直接加载lk/u-boot）和有ATF平台（pre-loader加载ATF，ATF再加载lk）。详细解析了11个关键启动步骤：从Boot ROM执行boot code、pre-loader加载到ISRAM、DRAM初始化、lk/u-boot加载到DRAM、bootimage解压、kernel初始化、用户空间启动等。核心在于理解ARM SoC启动过程中各阶段的角色分工和内存布局变化。

## Key Points

### 1. ARM异常等级模型
- **EL0**：APP应用（必须实现）
- **EL1**：Linux kernel / LK（必须实现）
- **EL2**：Hypervisor（虚拟化，选配）
- **EL3**：ARM Trusted Firmware / pre-loader（选配）

### 2. 两种启动路径

**路径一：无ATF平台**
```
Boot ROM → pre-loader → lk/u-boot → kernel
```

**路径二：有ATF平台**
```
Boot ROM → pre-loader → ATF (BL1/BL2/BL31) → lk/u-boot → kernel
```

### 3. 启动流程详解（11步）

**阶段一：pre-loader加载（步骤1-3）**
- **步骤1**：设备上电，跳转到Boot ROM中的boot code
- **步骤2**：boot code将pre-loader加载到ISRAM（Internal SRAM）
- **步骤3**：原因：DRAM尚未初始化，只能使用芯片内部SRAM

**阶段二：lk/u-boot加载（步骤4-6）**
- **步骤4**：pre-loader初始化DRAM
- **步骤5**：将lk/u-boot从flash（nand/emmc）加载到DRAM
- **步骤6**：解压bootimage成ramdisk和kernel，载入DRAM，初始化dtb

**阶段三：kernel启动（步骤7-11）**
- **步骤7**：lk跳转到kernel初始化
- **步骤8-10**：kernel初始化完成，fork出init进程
- **步骤11**：拉起ramdisk中的init程序，进入用户空间初始化

### 4. 关键概念
- **Boot ROM**：芯片内部只读存储器，存储初始启动代码
- **ISRAM**：Internal SRAM，芯片内部静态RAM，无需初始化即可使用
- **DRAM**：动态RAM，需要控制器初始化后才能使用
- **pre-loader**：初级加载器，负责初始化关键硬件并加载下一级bootloader
- **lk**：Little Kernel，轻量级bootloader，常用于移动设备

## Key Quotes

> "ARM架构中，EL0/EL1是必须实现，EL2/EL3是选配。"

> "设备上电起来后，跳转到Boot ROM中的boot code中执行把pre-loader加载起到ISRAM，因为当前DRAM还没有准备好。"

> "bootloader启动分两个阶段，一个是pre-loader加载lk阶段，另一个是lk加载kernel阶段。"

## Evidence

- Source: [原始文章](raw/tech/bsp/ARM 架构bootloader到kernel启动总逻辑.md) [[../../raw/tech/bsp/ARM 架构bootloader到kernel启动总逻辑.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/ARM 架构bootloader到kernel启动总逻辑.md) [[../../raw/tech/bsp/ARM 架构bootloader到kernel启动总逻辑.md|原始文章]]
