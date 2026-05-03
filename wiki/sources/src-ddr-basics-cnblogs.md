---
doc_id: src-ddr-basics-cnblogs
title: DDR基础知识点汇总
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/DDR-basics-cnblogs.md
domain: tech/dram
created: 2026-05-02
updated: 2026-05-02
tags: [dram, ddr, basics, memory-architecture, prefetch]
---

# DDR基础知识点汇总

## 来源

- **原始文件**: raw/tech/dram/DDR-basics-cnblogs.md
- **提取日期**: 2026-05-02

## Summary

这是一篇系统总结DDR内存核心基础知识的中文技术文章，源自博客园。文章全面覆盖了DDR内存的物理结构、逻辑组织、时序参数和关键工作机制。内容从宏观的存储层级架构（channel/DIMM/rank/chip/bank/row/column）到微观的电路实现（预取技术、burst传输、时序参数），再到系统级的优化机制（页命中策略、刷新机制、Write Leveling校准），形成了完整的DDR知识体系。文章还涉及了容量计算、控制器架构设计、阻抗匹配（ODT）和ZQ校准等工程实践内容，是理解DDR内存从原理到应用的优秀入门材料。

## Key Points

### 1. DDR存储层级架构

| 层级 | 说明 | 示例 |
|------|------|------|
| Channel | 独立的内存通道，对应一个内存控制器 | 双通道、四通道 |
| DIMM | 双列直插内存模块，插在主板插槽上 | 标准DIMM、SO-DIMM |
| Rank | 一组可独立寻址的芯片集合 | 单Rank、双Rank |
| Chip | 单个DRAM颗粒（如8Gb、16Gb） | - |
| Bank | 芯片内部的独立存储阵列 | 通常4-16个Bank |
| Row/Column | 存储阵列的行列地址 | - |

### 2. 预取技术演进

| 标准 | 预取宽度 | 数据传输率 | 核心频率关系 |
|------|----------|------------|--------------|
| DDR1 | 2n (2bit) | 2×核心频率 | 核心频率 = 数据传输率/2 |
| DDR2 | 4n (4bit) | 4×核心频率 | 核心频率 = 数据传输率/4 |
| DDR3 | 8n (8bit) | 8×核心频率 | 核心频率 = 数据传输率/8 |
| DDR4 | 8n (8bit) | 8×核心频率 | 核心频率 = 数据传输率/8 |
| DDR5 | 16n (16bit) | 16×核心频率 | 核心频率 = 数据传输率/16 |

### 3. 页命中机制与延迟
- **页命中（Page Hit, PH）**：行地址已打开，只需发送列地址，延迟最低
- **页快速命中（Page Fast Hit, PFH）**：类似页命中，但略有差异
- **页错失（Page Miss, PM）**：需要关闭当前行、打开新行、再发送列地址，延迟最高

### 4. 关键时序参数
- **CL（CAS Latency）**：列地址选通延迟，从发送读命令到数据可用
- **tRCD**：行到列延迟，从激活行到可发送列命令
- **tRP**：行预充电时间，关闭当前行所需时间
- **tRAS**：行激活时间，行保持打开的最短时间
- **标准示例**：DDR3-800时序为6-6-6-15（CL-tRCD-tRP-tRAS）

### 5. 自动刷新机制
- 每行最大刷新间隔：7.8μs
- 每Bank最大刷新间隔：64ms
- 一个Bank行数：8192 = 64ms / 7.8μs
- 刷新操作会阻塞正常读写，影响性能

### 6. 关键技术与校准
- **ZQ校准**：使用外部240Ω高精度电阻校准内部阻抗
- **ODT（On-Die Termination）**：片内端接，利用ZQ电阻精确匹配阻抗
- **Write Leveling**：Fly-by拓扑下调整DQS与CLK边沿对齐
- **PHY时钟**：DDR3-1866 PHY时钟 = 1866/2 = 933MHz（双边沿采样）

## Key Quotes

> "DDR存储层级：channel > DIMM > rank > chip > bank > row/column"

> "DDR预取技术：DDR1预取2bit，DDR2预取4bit，DDR3预取8bit（8n prefetch）"

> "三种寻址情况：页命中（PH）、页快速命中（PFH）、页错失（PM），对应不同延迟"

> "ZQ校准：DDR3新增ZQ引脚接240欧姆高精度电阻，用于阻抗校准"

> "Write Leveling：调整DQS与CLK边沿对齐，仅在fly-by布线时需使能"

## 开放问题

- DDR4/DDR5的预取技术和时序参数与DDR3的差异
- 不同厂商DDR颗粒的具体时序参数优化策略
- Write Leveling在实际高速设计中的挑战
