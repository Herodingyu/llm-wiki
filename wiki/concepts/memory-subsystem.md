---
doc_id: memory-subsystem
title: 存储子系统（Memory Subsystem）
page_type: concept
related_sources:
  - src-onechan-soc-memory-subsystem
related_entities: []
created: 2026-05-09
updated: 2026-05-09
tags: [concept, soc, memory, cache, ddr, sram, flash, spm]
---

# 存储子系统（Memory Subsystem）

## 定义

存储子系统是 SoC 的"记忆系统"，负责数据的存储、读取和管理。它不是简单地放几块 SRAM、接一颗 DDR、挂一个 Flash，而是要让数据被快速、可靠、低功耗、可预测地访问。

## 核心理念

- **存储是分层的**：不同数据放在不同速度、容量、成本和功耗特性的存储中
- **热数据靠近计算**：寄存器 → Cache → SRAM → DDR → Flash 形成层级
- **搬数据比计算更费电**：减少数据搬运往往比减少计算更重要

## 存储层级

| 层级 | 速度 | 容量 | 功耗 | 成本 | 典型用途 |
|------|------|------|------|------|---------|
| 寄存器 | 最快 | 极小 | 低 | 极高 | 运算操作数 |
| L1 Cache | ~1-4 周期 | 32-64 KB | 低 | 高 | 指令/数据缓存 |
| L2 Cache | ~10-20 周期 | 256 KB - 1 MB | 中 | 中高 | 二级缓存 |
| L3/LLC | ~30-50 周期 | 2-32 MB | 中 | 中 | 多核共享缓存 |
| SRAM/SPM | ~10-50 周期 | 64 KB - 8 MB | 低 | 高 | 关键代码/数据缓冲 |
| DDR | ~100-300 周期 | 512 MB - 32 GB | 中高 | 低 | 主运行内存 |
| Flash | ~μs-ms | 1 GB - 1 TB | 低 | 最低 | 代码/数据持久存储 |

## 关键技术

### Cache
- **时间局部性**：刚访问的数据很可能再次被访问
- **空间局部性**：访问某地址后，附近地址也可能被访问
- **Cache 一致性**：多核/多设备共享内存时的数据同步

### SPM（ScratchPad Memory）
- 软件显式管理 vs Cache 硬件自动管理
- 确定性延迟，无 Cache Miss 风险
- 适合实时 DSP、音频处理、基带处理

### 存储控制器
- DDR 控制器：初始化、刷新、命令调度、PHY 训练
- Flash 控制器：页读写、块擦除、ECC、坏块管理
- DMA 控制器：数据搬运，减轻 CPU 负担

## 设计权衡

| 场景 | 推荐方案 | 原因 |
|------|---------|------|
| 通用计算 | Cache + DDR | 平均性能最优 |
| 实时控制 | SPM + SRAM | 确定性延迟 |
| 大数据吞吐 | 高带宽 DDR + 多通道 DMA | 带宽优先 |
| 低功耗待机 | SRAM 保持 + DDR 自刷新 | 功耗优先 |

## 相关来源

- [[src-onechan-soc-memory-subsystem]] — SoC（3）：一文看懂存储子系统

## 开放问题

- CXL/UCie 是否会模糊片上/片外存储边界？
- 3D 堆叠存储（HBM/HMC）在消费级 SoC 中的普及前景？
