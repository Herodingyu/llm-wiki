---
doc_id: write-leveling
title: Write Leveling
page_type: concept
related_sources:
  - src-ddr-basics-summary
  - src-ddr4-initialization-calibration
  - src-ddr-training-csdn
  - src-ddr-basics-cnblogs
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, dram]
---

# Write Leveling

## 定义

Write Leveling（写均衡）是 DDR 内存初始化过程中的关键训练步骤，用于补偿 fly-by 拓扑布线结构下 DQS（数据选通）信号与 CLK（时钟）信号之间的时序偏差，确保写入数据能够正确锁存到 DRAM 颗粒中。

## 技术细节

为什么需要 Write Leveling：

- **Fly-by 拓扑**：DDR3/DDR4/DDR5 采用 fly-by 菊花链布线，CLK 信号从 DIMM 一端依次传递到各 DRAM 芯片
- **时序偏差**：各 DRAM 芯片接收到的 CLK 边沿存在时间差异
- **DQS 对齐要求**：每个 DRAM 芯片需要 DQS 与本地 CLK 边沿精确对齐，以确保 DQ 数据正确采样
- **Write Leveling 作用**：通过调整控制器端 DQS 输出延迟，使 DQS 边沿与各 DRAM 芯片的 CLK 边沿对齐

工作流程：
1. 控制器发送 Write Leveling 使能命令
2. DRAM 进入特殊模式，将 DQS 与内部 CLK 比较
3. 控制器逐步调整 DQS 延迟
4. DRAM 通过 DQ 引脚反馈对齐状态
5. 找到最佳延迟值后保存到训练结果

技术要点：
- 多 rank 系统中需要为每个 rank 单独执行 Write Leveling
- 温度、电压变化可能导致已训练的值漂移，需要周期性重新训练
- LPDDR 系列使用类似的 Write Training 机制

## 相关来源

- [[src-ddr-basics-summary]] — Write Leveling 在 DDR 系统中的位置和作用
- [[src-ddr4-initialization-calibration]] — DDR4 初始化中 Write Leveling 的详细流程
- [[src-ddr-training-csdn]] — Training 序列中 Write Leveling 的执行时机
- [[src-ddr-basics-cnblogs]] — DDR 基础中的 Write Leveling 原理

## 相关概念

- [[ddr-training]] — Write Leveling 是 Training 的核心子步骤
- [[ddr-calibration]] — 与 ZQ Calibration 协同完成初始化
- [[ddr-phy]] — PHY 实现 DQS 延迟调整电路
- [[signal-integrity]] — 布线拓扑引起的时序偏差根源

## 相关实体

- [[ddr5]] — DDR5 实体标准
- [[synopsys]] — 提供 DDR 训练 IP 解决方案
