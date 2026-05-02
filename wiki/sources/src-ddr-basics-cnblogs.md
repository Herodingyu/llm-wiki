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

## 摘要

一篇中文博客园文章，系统总结了DDR内存的核心基础知识。内容涵盖DDR颗粒电路结构、带宽关系、存储层级组织（channel/DIMM/rank/chip/bank/row/column）、预取技术、burst概念、时序参数、页命中机制、容量计算、控制器架构、自动刷新机制以及Write Leveling等关键技术点。

## 关键要点

- DDR存储层级：channel > DIMM > rank > chip > bank > row/column
- DDR预取技术：DDR1预取2bit，DDR2预取4bit，DDR3预取8bit（8n prefetch）
- 三种寻址情况：页命中（PH）、页快速命中（PFH）、页错失（PM），对应不同延迟
- DDR3-800标准时序为6-6-6-15（CL-tRCD-tRP-tRAS）
- 自动刷新间隔：每行最大7.8us，每bank最大64ms

## 技术细节

- DDR3-1866 PHY时钟频率 = 1866/2 = 933MHz（双边沿采样）
- 若控制器128bit位宽，DDR3-1866 32bit位宽下控制器时钟 = (1866*32)/128 = 466MHz
- ZQ校准：DDR3新增ZQ引脚接240欧姆高精度电阻，用于阻抗校准
- ODT（On-Die Termination）利用ZQ电阻实现精确阻抗匹配
- Write Leveling：调整DQS与CLK边沿对齐，仅在fly-by布线时需使能
- 一个bank行数8192 = 64ms/7.8us

## 开放问题

- DDR4/DDR5的预取技术和时序参数与DDR3的差异
- 不同厂商DDR颗粒的具体时序参数优化策略
- Write Leveling在实际高速设计中的挑战
