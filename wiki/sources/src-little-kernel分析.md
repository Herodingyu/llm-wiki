---
doc_id: src-little-kernel分析
title: Little Kernel分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/little-kernel分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, little-kernel, bootloader, rtos, aarch32]
---

## Summary

本文深入分析了Little Kernel（LK）实时操作系统的架构和启动流程。LK是一个基于线程的轻量级RTOS，运行在AARCH32状态，与uCOS类似，程序不可动态加载，需在编译时与操作系统一起编译。文章以dragonboard410c源码为例，详细解析了LK的启动流程：从`_start`入口（crt0.S）的异常向量表设置、SCTLR寄存器初始化、MMU和Cache使能，到BSS清零、数据段重定位，最终跳转到kmain()。LK目前广泛用于Android的bootloader（如aboot），提供event、mutex、timer、thread等基础OS功能。

## Key Points

### 1. Little Kernel简介
- **类型**：基于线程的轻量级RTOS
- **运行状态**：AARCH32
- **特点**：程序不可动态加载，编译时静态链接
- **功能**：event、mutex、timer、thread支持
- **应用场景**：Android bootloader（aboot作为其应用程序）
- **源码获取**：`git clone git://codeaurora.org/kernel/lk.git`

### 2. 编译环境
```bash
# 安装交叉编译器
sudo apt install gcc-arm-linux-gnueabi
export TOOLCHAIN_PREFIX=arm-linux-gnueabi-
# 编译（以msm8916为例）
make msm8916 EMMC_BOOT=1
```

### 3. 启动流程
```
_start (crt0.S) → 异常向量表 → reset → SCTLR初始化 → MMU/Cache → BSS清零 → 数据段重定位 → kmain()
```

### 4. crt0.S 关键初始化
**异常向量表：**
- reset → 复位异常
- arm_undefined → 未定义指令异常
- arm_syscall → 软件中断（系统调用）
- arm_prefetch_abort → 指令预取异常
- arm_data_abort → 数据访问异常
- arm_irq → 普通中断
- arm_fiq → 快速中断

**SCTLR寄存器配置：**
- 清除b15（保留）、b13（异常基地址重映射到VBAR）、b12（指令缓存）
- 清除b2（数据缓存）、b0（MMU）
- 清除b1（对齐检测异常）
- 设置b5（ARMv8 barrier指令使能）
- **结果**：关闭I/D Cache，关闭MMU，使能异常重映射，使能barrier

**后续操作：**
- 初始化堆栈指针
- 清零BSS段
- 数据段重定位（从加载地址复制到运行地址）
- 跳转到kmain()

## Key Quotes

> "little kernel是一个基于线程的操作系统，是运行在AARCH32状态下的操作系统，跟uCOS类似程序不可以动态加载。"

> "crt0.S实现了异常向量表、堆栈初始化、数据段初始化（data、BSS）并把自己移动到合适的地址，最后跳转到kmain。"

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/little-kernel分析.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/little-kernel分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/little-kernel分析.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/little-kernel分析.md|原始文章]]
