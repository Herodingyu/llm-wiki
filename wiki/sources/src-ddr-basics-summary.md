---
doc_id: src-ddr-basics-summary
title: DDR 基础知识点汇总
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/ddr-basics-summary.md
---

## Summary

本文系统梳理了DDR SDRAM的核心概念，包括存储层级结构（channel > DIMM > rank > chip > bank > row/column）、数据预取技术、时序参数、寻址策略、控制器架构、ZQ校准与ODT、Write Leveling等关键技术。

## Key Points

### 1. DDR 存储层级
channel > DIMM > rank > chip > bank > row/column

### 2. 数据预取技术演进
- SDRAM：1bit/周期（单边沿采样）
- DDR1：2bit/周期（双边沿采样，预取2bit）
- DDR2：4bit/周期（预取4bit）
- DDR3：8bit/周期（预取8bit，即 8n prefetch）

### 3. 时序参数
- **CL (CAS Latency)**：列地址到数据输出的延迟
- **tRCD**：行地址到列地址的延迟
- **tRP**：行预充电时间
- **tRAS**：行激活时间

### 4. 寻址效率
- **页命中（PH）**：tRCD + CL
- **页快速命中（PFH）**：CL（最理想）
- **页错失（PM）**：tRP + tRCD + CL（最糟糕）

### 5. ZQ Calibration
- 使用外部 240Ω 精密电阻作为参考
- ZQCL：上电初始化，512个时钟周期
- ZQCS：正常操作跟踪，64个时钟周期

### 6. ODT (On-die Termination)
- 利用 ZQ 电阻值实现精确阻抗匹配
- 解决 DDR PHY + PCB + SDRAM 通路的信号反射问题

### 7. Write Leveling
- 调整 DQS 信号和 CLK 信号边沿对齐
- fly-by 布线结构下必须使能

## Evidence

- DDR3-800 核心频率 100MHz，I/O时钟 400MHz，有效数据传输频率 800MHz
- 一个 bank 最大自动刷新间隔 64ms，行数约 8192（64ms/7.8us）
- 自动刷新间隔 7.8us 每次

## Open Questions

- 现代 DDR5 中 bank group 架构如何影响访问效率？
- LPDDR 的 self-refresh 功耗优化策略？
- 多 rank 配置下的 interleaving 策略对性能的影响？

## Related Links

- [DDR Training 详解](src-ddr-training-csdn.md)
- [DDR 学习时间(Part A-1)：DDR控制器设计硕士论文](https://zhuanlan.zhihu.com/p/362834729)
