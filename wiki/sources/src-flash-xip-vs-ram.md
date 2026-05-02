---
doc_id: src-flash-xip-vs-ram
title: Flash 中代码执行 — XIP 与 RAM 加载
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/嵌入式系统中，FLASH 中的程序代码必须搬到 RAM 中运行吗？ - 某人 的回答.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, flash, xip, ram, nor-flash]
---

## Summary

本文回答了嵌入式系统中 Flash 代码是否必须搬到 RAM 中运行的问题。取决于 Flash 的访问特性：NOR Flash 支持任意寻址（XIP，Execute In Place），可直接执行代码；NAND Flash 按块访问，不支持 XIP，必须加载到 RAM 中执行。文章还详细介绍了 MCU 启动流程（Cortex-M 的异常向量表、SP/PC 寄存器设置）以及启动时 data/bss 段的初始化。

## Key Points

### 1. Flash 类型对比
| 类型 | 读取 | 写入 | XIP | 特点 |
|------|------|------|-----|------|
| NOR Flash | 任意寻址 | 按块擦除 | 支持 | 读取快，适合存储代码 |
| NAND Flash | 按块读取 | 按块擦除 | 不支持 | 容量大，适合存储数据 |

### 2. XIP（Execute In Place）
- NOR Flash 支持 XIP
- 可直接在 Flash 中执行程序代码
- 无需加载到 RAM
- MCU 内置的 Flash 通常是 NOR Flash

### 3. 启动流程（Cortex-M）
1. 上电后 CPU 从 0x00000000 读取代码
2. 读取前两个字：初始栈地址（SP）和复位向量（PC）
3. 跳转到复位异常处理函数执行
4. 启动存储器通过引脚配置选择（bootROM 或内置 Flash）

### 4. 运行时初始化
- **text 段**: 留在 Flash 中（只读）
- **rodata 段**: 留在 Flash 中（只读）
- **data 段**: 从 Flash 加载到 RAM
- **bss 段**: 在 RAM 中分配空间并清零

### 5. 片内 vs 片外 RAM
- 片内 RAM: 性能更好，容量一般较小
- 片外 RAM: 容量更大，性能取决于时钟和延迟

### 6. 代码超过 RAM 空间
- 可分阶段加载执行
- 程序组织复杂，运行低效
- 建议更换硬件配置或优化裁剪

## Evidence

- Cortex-M3/M4 内置 Flash 可直接执行
- Cortex-A 系列通常从 bootROM 启动，再加载到 SRAM
- 链接文件（.icf）定义 Flash 起始地址为栈指针和复位向量

## Open Questions

- 不同厂商（STM32、NXP、TI）启动模式的差异
- XIP 与 RAM 执行的性能对比

## Related Pages

- [[xip]]
- [[nor-flash]]
- [[nand-flash]]
- [[bootloader]]
- [[cortex-m]]
