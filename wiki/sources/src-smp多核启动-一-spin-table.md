---
doc_id: src-smp多核启动-一-spin-table
title: SMP多核启动（一）：spin table
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/SMP多核启动（一）：spin-table.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, smp, spin-table, armv8, bootloader]
---

## Summary

本文详细介绍了 ARM 架构下 SMP（对称多处理）多核启动的 spin-table 机制。SMP 是指在一个计算机上汇集一组处理器，各 CPU 共享内存子系统和总线结构。在启动阶段，primary cpu 执行启动流程，而 secondary cpu 进入 WFE 睡眠状态等待唤醒。spin-table 的核心机制是：uboot 为内核准备一块内存用于填写 secondary cpu 的入口地址，并通过设备树传递给内核。当内核初始化完成后，将入口地址写入该内存并唤醒 secondary cpu，后者跳转到指定地址执行。文章还分析了 uboot 中 secondary cpu 进入 WFE 状态的汇编代码实现，以及 spin_table_update_dt 函数将地址写入设备树的详细流程。

## Key Points

### 1. SMP 基本概念
- **SMP**: Symmetric Multi-Processing，对称多处理结构
- **CMP**: Chip Multi-processors，单芯片多处理器（多核）
- 各 CPU 拥有独立的寄存器（PC、SP 等），共享内存和外设
- 多核环境下访问临界区需使用自旋锁防止竞态

### 2. 启动流程中的 CPU 角色
| CPU 类型 | 角色 | 状态 |
|---------|------|------|
| Primary CPU | 执行启动流程、内核初始化 | 主动运行 |
| Secondary CPU | 等待被唤醒后直接跳转内核 | WFE 睡眠状态 |

### 3. spin-table 启动机制
```
芯片上电 → primary cpu 执行启动
  → secondary cpu 进入 WFE 睡眠
  → uboot 将 spin_table 内存地址写入设备树
  → 内核初始化完成后，将入口地址写入 spin_table 内存
  → 唤醒 secondary cpu
  → secondary cpu 检查地址并跳转执行
```

### 4. secondary cpu 初始化状态（uboot 汇编代码）
```asm
branch_if_master x0, x1, master_cpu    // 判断是否为 primary cpu
b    spin_table_secondary_jump          // secondary cpu 进入 spin

master_cpu:
bl    _main
```

**spin_table_secondary_jump 实现**:
```asm
0:    wfe                                           // 进入睡眠
      ldr    x0, spin_table_cpu_release_addr       // 读取入口地址
      cbz    x0, 0b                                // 为0则继续睡眠
      br    x0                                    // 跳转到内核入口
```

### 5. spin_table 地址传递
- **关键约束**: armv8 架构下，uboot **只能通过设备树** 向内核传递参数
- **实现函数**: `spin_table_update_dt()`
- **流程**: bootm → 启动前准备 → 将 spin-table 地址写入设备树 → 启动内核

### 6. aarch64 多核启动方式对比
| 方式 | 功能 | 适用场景 |
|------|------|---------|
| spin-table | 仅支持 secondary cpu 启动 | 简单场景 |
| PSCI | 支持 cpu 热插拔、idle 等电源管理 | 复杂电源管理需求 |

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/SMP多核启动（一）：spin-table.md)

## Open Questions

- PSCI 与 spin-table 的性能对比
- 不同厂商（高通、华为、NXP）SMP 启动实现的差异

## Key Quotes

> "故其启动的关键是如何将内核入口地址告知secondary cpu，以使其能跳转到正确的执行位置。"

> "uboot只能通过devicetree向内核传递参数信息"

> "到这里我们就知道了spin-table这个流程。不得不说前辈对这个逻辑理解很清楚"

> "汇编代码中会通过cpu的affinity值"

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/SMP多核启动（一）：spin-table.md)
- [[smp]]
- [[spin-table]]
- [[psci]]
- [[uboot]]
