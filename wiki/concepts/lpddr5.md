---
doc_id: lpddr5
title: LPDDR5
page_type: concept
related_sources:
  - src-micron-1gamma-lpddr5x
  - src-ddr-training-csdn
  - src-dlep-micron-cadence
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, dram, mobile]
---

# LPDDR5

## 定义

LPDDR5（Low Power Double Data Rate 5）是 JEDEC 为移动设备（智能手机、平板、笔记本电脑）制定的低功耗内存标准。LPDDR5 在提供高带宽的同时通过多种低功耗技术显著降低能耗，是旗舰移动设备的主流内存方案。

## 技术细节

主要技术特性：

- **更高带宽**：起始 5500 MT/s，LPDDR5X 可达 8533 MT/s，下一代目标 9600+ MT/s
- **更低电压**：VDD 从 LPDDR4 的 1.1V 降至 0.5V（LPDDR5）/ 0.46V（LPDDR5X）
- **DVFS 支持**：动态电压频率调整，根据负载实时调节性能和功耗
- **多 Bank Group**：支持 4 或 8 个 bank group，提升并行访问效率
- **WCK 时钟**：引入差分 WCK 时钟（与 CK 独立），数据速率可达 WCK 频率的 4 倍
- **数据复制/链接模式**：支持将数据从一个位置快速复制到另一个位置

LPDDR5X 增强：
- 速率提升至 8533 MT/s（未来 9600+ MT/s）
- 引入自适应刷新管理，进一步降低待机功耗
- 更精细的粒度电源管理

工艺演进：
- 美光率先推出基于 1γ（1-gamma）工艺的 LPDDR5X，速率达 10.7 Gbps
- 1γ 为第六代 10nm 级 DRAM 工艺，线宽约 11-12nm

## 相关来源

- [[src-micron-1gamma-lpddr5x]] — 全球首款 1γ 工艺 LPDDR5X 样品出货
- [[src-ddr-training-csdn]] — LPDDR5 与 DDR4 Training 流程的差异
- [[src-dlep-micron-cadence]] — LPDDR5 设计与验证相关技术

## 相关概念

- [[ddr5]] — 标准 DDR5 与 LPDDR5 的架构差异
- [[ddr-training]] — LPDDR5 具有独特的训练流程
- [[ddr-calibration]] — LPDDR5 的校准机制

## 相关实体

- [[micron]] — 率先出货 1γ 工艺 LPDDR5X
- [[lpddr5x]] — LPDDR5X 增强版实体
- [[ddr5]] — 与标准 DDR5 的架构对比
