---
doc_id: src-l1-l2-l3-cache究竟在哪里
title: L1，L2，L3 Cache究竟在哪里？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/L1，L2，L3 Cache究竟在哪里？.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## 摘要

本文系统梳理了CPU Cache从386时代到现代的演变历程，回答了"L1/L2/L3 Cache究竟在哪里"这一问题。文章指出：386时代Cache在主板上（外部Cache），486时代L1进入CPU内部，Pentium Pro时代L2进入CPU Package，Core时代L2变为多核共享，现代CPU则将L3集成在Die中。作者详细对比了DRAM和SRAM的物理结构差异（1晶体管+1电容 vs 6晶体管），并给出了各级存储器的延迟数据。核心 insight：Cache级数不断增加，新层级从外部逐渐向内部靠近，Cache设计是CPU微架构竞争的核心战场之一。

## 关键要点

### 1. Cache的历史演变
| 时代 | L1位置 | L2位置 | 关键特性 |
|------|--------|--------|---------|
| 386时代 | 无/外部 | 主板上(可选) | 首次出现Cache，Write-Through策略 |
| 486时代 | CPU内部(8KB Unified) | 主板上(外部Cache) | 加入Write-Back策略 |
| Pentium/ Pentium Pro | CPU内部分拆(Code+Data各8KB) | CPU Package上 | L1分为代码Cache和数据Cache |
| Pentium 4/D | CPU Die内部 | CPU Die内部 | 多核各自独占L2 |
| Core/Core2 | CPU Die内部 | 多核共享 | L2共享模式出现 |
| 现代CPU | 每核独占 | 每核独占(MLC) | L3逻辑共享(LLC) |
| Haswell/Broadwell | - | - | Iris系列加入eDRAM作为L4 |

### 2. Cache的物理实现：SRAM vs DRAM
| 特性 | DRAM | SRAM |
|------|------|------|
| 单元结构 | 1晶体管 + 1电容 | 6晶体管 |
| 密度 | 高（结构简单） | 低（结构复杂） |
| 速度 | 慢（需刷新，电容充放电） | 快（无需刷新，触发器直接输出） |
| 功耗 | 动态功耗+刷新功耗 | 静态功耗为主 |
| 成本/位 | 低 | 高 |
| 用途 | 主内存 | Cache、寄存器堆 |

### 3. 各级存储器延迟对比
| 存储层级 | 典型延迟 | 与CPU关系 |
|---------|---------|----------|
| Registers | <1 cycle | 直接访问 |
| MOB(Memory Ordering Buffers) | ~1 cycle | 乱序执行核心 |
| L1 Cache | ~3-4 cycles | 与CPU core同数量级 |
| L2 Cache | ~10-20 cycles | 比L1慢数倍 |
| L3 Cache | ~40-60 cycles | 多核共享 |
| DRAM | ~200-300 cycles | 比L1慢50-100倍 |

### 4. Cache的广义定义
- **狭义Cache**：CPU流水线与主存之间的L1/L2/L3 Cache
- **广义Cache**：快设备为缓解慢设备延迟而预留的Buffer
- **其他Cache类型**：
  - TLB（虚实地址转换缓存）
  - MOB（内存排序缓冲）
  - ROB（重排序缓冲）
  - BTB（分支目标缓冲）
  - Register File（寄存器堆）

### 5. Cache演进趋势
- **级数增加**：从单层到L1→L2→L3→L4
- **位置内移**：新层级先出现在外部，逐渐向Die内部靠近
- **容量增大**：每代新产品Cache容量显著提升
- **共享模式**：L3从独占演变为逻辑共享，提高利用率

## 关键引用

- "Cache演变总的来说级数在增加，新加入的层级在位置上总是出现在外层，逐渐向内部靠近。Cache的设计是CPU设计的重要内容之一。"
- "从广义的角度上看，Cache是快设备为了缓解访问慢设备延时的预留的Buffer，从而可以在掩盖访问延时的同时，尽可能地提高数据传输率。"
- "DRAM的单元结构是1晶体管+1电容，SRAM是6晶体管；Cache Memory也被称为Cache，存放着程序经常使用的指令和数据。"
- "各级存储器延迟对比：L1 Cache约3-4 cycles，L2 Cache约10-20 cycles，L3 Cache约40-60 cycles，DRAM约200-300 cycles。"

## 技术细节

- **Inclusive Cache**：外层Cache包含内层Cache的全部内容
- **Exclusive Cache**：各层Cache内容互不重叠，总容量为各层之和
- **Cache Coloring(Page Coloring)**：OS通过页面着色减少Cache冲突
- **eDRAM**：嵌入式DRAM，Haswell Iris中用作L4缓存，平时也可做显存
- **查询命令**：`wmic cpu get L2CacheSize,L3CacheSize` 可快速查看Cache容量

## 原文引用

> "他们也许是对的，大部分时间Cache都可以安静的工作。但对于操作系统、编译软件、固件工程师和硬件工程师来说，Cache则需要我们特别关照。现在越来越多的数据库软件和人工智能引擎也对Cache越来越敏感，需要针对性地优化。Cache设计和相关知识从而不再是阳春白雪，你也许某一天就会需要了解它"

> "Cache Memory也被称为Cache，是存储器子系统的组成部分，存放着程序经常使用的指令和数据，这就是Cache的传统定义。从广义的角度上看，Cache是快设备为了缓解访问慢设备延时的预留的Buffer，从而可以在掩盖访问延时的同时，尽可能地提高数据传输率"

> "也许很多人会不假思索的说：'在CPU内核里。'Not so fast！它也有可能在主板上！"

> "Cache演变总的来说级数在增加，新加入的层级在位置上总是出现在外层，逐渐向内部靠近。Cache的设计是CPU设计的重要内容之一"

> "细心的读者也许会发现，Cache演变总的来说级数在增加，新加入的层级在位置上总是出现在外层，逐渐向内部靠近"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/L1，L2，L3 Cache究竟在哪里？.md) [[../../raw/tech/soc-pm/L1，L2，L3 Cache究竟在哪里？.md|原始文章]]