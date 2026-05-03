---
doc_id: src-flash-xip-vs-ram
title: Flash 中代码执行 — XIP 与 RAM 加载
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/嵌入式系统中，FLASH 中的程序代码必须搬到 RAM 中运行吗？ - 某人 的回答.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-03
tags: [bsp, flash, xip, ram, nor-flash]
---

## Summary

本文回答了嵌入式系统中 Flash 代码是否必须搬到 RAM 中运行的核心问题。取决于 Flash 的访问特性：NOR Flash 支持任意寻址（XIP，Execute In Place），可直接执行代码；NAND Flash 按块访问，不支持 XIP，必须加载到 RAM 中执行。文章还详细介绍了 MCU 启动流程（Cortex-M 的异常向量表、SP/PC 寄存器设置）、启动时 data/bss 段的初始化，以及片内/片外 RAM 的性能差异。对于代码超过 RAM 空间的情况，建议分阶段加载或更换硬件配置。

## Key Points

### 1. Flash 类型对比
| 类型 | 读取方式 | 写入方式 | XIP 支持 | 特点 |
|------|---------|---------|---------|------|
| NOR Flash | 任意寻址 | 按块擦除 | 支持 | 读取快，适合存储代码 |
| NAND Flash | 按块读取 | 按块擦除 | 不支持 | 容量大，适合存储数据 |

### 2. XIP（Execute In Place）
- NOR Flash 支持 XIP，可直接在 Flash 中执行程序代码
- 无需加载到 RAM
- MCU 内置的 Flash 通常是 NOR Flash
- CPU 通过地址总线直接访问，类似于 RAM

### 3. 启动流程（Cortex-M）
1. 上电后 CPU 从 0x00000000 读取代码
2. 读取前两个字：初始栈地址（SP）和复位向量（PC）
3. 跳转到复位异常处理函数执行
4. 启动存储器通过引脚配置选择（bootROM 或内置 Flash）

### 4. 运行时初始化
| 段 | 处理方式 | 原因 |
|----|---------|------|
| text | 留在 Flash 中 | 只读 |
| rodata | 留在 Flash 中 | 只读 |
| data | 从 Flash 加载到 RAM | 需要读写 |
| bss | 在 RAM 中分配空间并清零 | 运行时变量 |

### 5. 片内 vs 片外 RAM
| 类型 | 性能 | 容量 |
|------|------|------|
| 片内 RAM | 更好 | 一般较小 |
| 片外 RAM | 取决于时钟和延迟 | 更大 |

### 6. 代码超过 RAM 空间
- 可分阶段加载执行（Overlay）
- 程序组织复杂，运行低效
- **建议**: 更换硬件配置或优化裁剪

## Evidence

- Cortex-M3/M4 内置 Flash 可直接执行
- Cortex-A 系列通常从 bootROM 启动，再加载到 SRAM
- 链接文件（.icf）定义 Flash 起始地址为栈指针和复位向量

## Open Questions

- 不同厂商（STM32、NXP、TI）启动模式的差异
- XIP 与 RAM 执行的性能对比

## Key Quotes

> "前面写了一篇 STM32的完整启动流程分析，但是感觉有些地方没有完全理明白，因此对不清楚的地方又做了一些总结"

> "当然在一些早期的ARM处理器设计中，如Arm7TDMI，复位后会直接读取0地址处的代码进行执行，由软件初始化栈指针，0地址处存放的直接就是中断处理函数，而不是函数地址"

> "Flash类似于ROM一类的存储器，但它其实是可读可写的，不同于同样可读可写的RAM，它在写入数据时需要先将你所写位置所属的块擦除"

## Related Pages

- [[xip]]
- [[nor-flash]]
- [[nand-flash]]
- [[bootloader]]
- [[cortex-m]]
