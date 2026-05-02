---
doc_id: ddr5
title: DDR5
page_type: concept
related_sources:
  - src-ddr5-signal-integrity-ema
  - src-ddr-basics-summary
  - src-i3c-prodigytechno-ddr5-i3c
  - src-mcrdimm-samsung-hpc
  - src-micron-1gamma-lpddr5x
  - src-synopsys-tsmc-advanced-processes
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, dram]
---

# DDR5

## 定义

DDR5（Double Data Rate 5）是 JEDEC 制定的第五代双倍数据速率同步动态随机存取内存标准，于 2020 年发布。DDR5 在 DDR4 基础上将数据传输速率提升至 4800 MT/s 起步（最高可达 8400+ MT/s），同时通过架构改进提高了带宽效率和功耗表现。

## 技术细节

主要技术特性：

- **更高频率**：起始 4800 MT/s，目标 8400+ MT/s
- **更低电压**：VDD 从 1.2V 降至 1.1V，VDDQ 降至 1.05V
- **Bank Group 架构**：每个设备支持 8 个 bank group（DDR4 为 4 个），提升并行性
- **片上 ECC**：每 128 位数据附带 8 位 ECC，提升可靠性
- **双通道 DIMM**：单条 DIMM 分为两个独立 32 位通道（含 ECC 为 40 位）
- **PMIC 集成**：电源管理芯片从主板移至 DIMM，改善电源完整性
- **决策反馈均衡（DFE）**：接收端集成 DFE 以补偿高频信号衰减

与 DDR4 的关键差异：
- 预取数保持 16n（与 DDR4 相同）
- Burst Length 固定为 16（DDR4 支持 4/8）
- 引入 Same Bank Refresh 命令减少刷新开销

## 相关来源

- [[src-ddr5-signal-integrity-ema]] — DDR5 信号完整性设计要点
- [[src-ddr-basics-summary]] — DDR 历代技术演进对比
- [[src-i3c-prodigytechno-ddr5-i3c]] — DDR5 与 I3C 的协同应用
- [[src-mcrdimm-samsung-hpc]] — 基于 DDR5 的 MCRDIMM 技术
- [[src-micron-1gamma-lpddr5x]] — LPDDR5X 与 DDR5 的工艺演进关系
- [[src-synopsys-tsmc-advanced-processes]] — 先进工艺对 DDR5 设计的支持

## 相关概念

- [[lpddr5]] — 移动设备专用的低功耗版本
- [[ddr-training]] — DDR5 需要更复杂的训练流程
- [[signal-integrity]] — DDR5 高频信号完整性挑战
- [[mcrdimm]] — 基于 DDR5 的高带宽模块方案

## 相关实体

- [[samsung]] — 推出基于 DDR5 的 MCRDIMM 技术
- [[micron]] — 率先出货 1γ 工艺 DDR5 样品
- [[sk-hynix]] — 全球三大 DRAM 供应商之一
- [[ddr5]] — DDR5 标准实体页
- [[lpddr5x]] — 基于 DDR5 架构的低功耗移动内存
