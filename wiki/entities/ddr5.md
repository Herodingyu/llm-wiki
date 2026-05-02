---
doc_id: ddr5
title: DDR5
page_type: entity
entity_type: technology
related_sources: [src-ddr4-initialization-calibration, src-ddr-training-csdn, src-ddr-basics-summary, src-ddr-basics-cnblogs, src-dcon23-track2-paper, src-dlep-micron-cadence, src-ddr5-signal-integrity-ema, src-i3c-prodigytechno-ddr5-i3c, src-ibis-summit-feb24-burns, src-mcrdimm-samsung-hpc, src-micron-1gamma-lpddr5x, src-synopsys-tsmc-advanced-processes]
related_concepts: [concept-dram, concept-signal-integrity, concept-memory-bandwidth]
created: 2026-05-02
updated: 2026-05-02
tags: [entity, technology, dram, memory, semiconductor]
---

# DDR5

## 概述

DDR5（Double Data Rate 5）是第五代双倍数据速率同步动态随机存取存储器标准，由JEDEC固态技术协会制定。DDR5于2020年发布，相比DDR4在带宽、容量和功耗效率方面有显著提升。DDR5起始速率为4800 MT/s，最高可达8400 MT/s以上，工作电压从DDR4的1.2V降低至1.1V。DDR5引入了独立的电源管理IC（PMIC）、决策反馈均衡（DFE）等新技术，对PCB设计和信号完整性提出了更高要求。

## 关键事实

- 起始速率4800 MT/s，最高可达8400 MT/s+，带宽较DDR4提升约50%
- 工作电压1.1V，功耗效率优于DDR4的1.2V
- 引入独立PMIC（电源管理IC），实现更精细的电源管理
- 支持决策反馈均衡（DFE）和前馈均衡（FFE），改善信号完整性
- 最大单条容量可达128GB，是DDR4的4倍
- Samsung MCRDIMM通过双rank同时访问实现DDR5带宽翻倍

## 产品/技术

- **标准DDR5**：面向PC和服务器，DIMM形态
- **LPDDR5/LPDDR5X**：面向移动设备，低功耗版本
- **MCRDIMM**：多列缓冲DIMM，带宽翻倍技术
- **信号完整性**：阻抗控制（50Ω）、差分对等长、超低损耗材料
- **均衡技术**：DFE消除后光标ISI，FFE处理前光标ISI

## 相关来源

- [[src-ddr5-signal-integrity-ema]] — DDR5信号完整性设计要点
- [[src-mcrdimm-samsung-hpc]] — MCRDIMM高带宽技术
- [[src-micron-1gamma-lpddr5x]] — 1γ工艺DDR5/LPDDR5X
- [[src-ddr-training-csdn]] — DDR训练与校准
- [[src-dlep-micron-cadence]] — DDR设计与仿真

## 相关概念

- [[ddr5]] — DDR5是最新一代DRAM标准
- [[signal-integrity]] — DDR5高频设计对信号完整性要求极高
- [[mcrdimm]] — DDR5带宽提升对AI/HPC应用至关重要
