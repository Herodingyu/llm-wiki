---
doc_id: ddr-phy
title: DDR PHY
page_type: concept
related_sources:
  - src-ddr-basics-summary
  - src-ddr-training-csdn
  - src-ddr5-signal-integrity-ema
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, dram]
---

# DDR PHY

## 定义

DDR PHY（Physical Layer，物理层）是连接 DDR 内存控制器与 DRAM 颗粒的模拟/混合信号接口电路，负责将数字控制信号转换为符合 DDR 时序规范的物理电信号，并处理双向数据、地址、命令和时钟信号的收发。

## 技术细节

DDR PHY 的核心功能：

- **信号驱动与接收**：将控制器数字信号转换为符合 DDR 规范的差分/单端信号
- **时序控制**：管理 DQ/DQS/CLK 等信号的精确时序关系
- **Training 执行**：在初始化阶段执行 Write Leveling、Read Training、ZQ Calibration 等
- **ODT 控制**：动态管理片上端接电阻以优化信号完整性
- **延迟线控制**：通过 LCDL 等可调延迟单元实现眼图优化

设计要点：
- 需要与 PCB 走线、DRAM 颗粒特性协同设计
- 支持不同 DRAM 类型（DDR4/DDR5/LPDDR5）需要不同的 PHY 架构
- 先进工艺节点（7nm 及以下）对模拟电路设计提出更高挑战

## 相关来源

- [[src-ddr-basics-summary]] — DDR 基础知识中关于 PHY、ODT 和信号路径的说明
- [[src-ddr-training-csdn]] — PHY 在 Training 过程中的角色
- [[src-ddr5-signal-integrity-ema]] — DDR5 信号完整性对 PHY 设计的要求

## 相关概念

- [[ddr-training]] — PHY 负责执行训练序列
- [[ddr-calibration]] — PHY 包含校准电路
- [[signal-integrity]] — PHY 设计必须解决的核心问题
- [[write-leveling]] — PHY 实现的关键时序对齐技术

## 相关实体

- [[ddr5]] — DDR5 实体标准
- [[synopsys]] — 提供 DDR PHY IP 解决方案
- [[micron]] — DRAM 物理层设计合作
