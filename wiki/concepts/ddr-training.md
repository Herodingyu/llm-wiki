---
doc_id: ddr-training
title: DDR Training
page_type: concept
related_sources:
  - src-ddr-training-csdn
  - src-ddr-basics-summary
  - src-ddr4-initialization-calibration
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, dram]
---

# DDR Training

## 定义

DDR Training（DDR 训练）是 DDR 内存初始化过程中的关键步骤，通过自适应机制补偿信号完整性问题、对齐时钟与数据信号、适应不同物理层设计，从而提高数据传输的可靠性和效率。

## 技术细节

DDR Training 包含多个训练阶段：

- **CS Training**：对齐 CS_N 和 CK 信号
- **CA Training**：对齐 CA 和 CK 信号  
- **ZQ Calibration**：使用外部 240Ω 精密电阻校准 DQ 输出驱动强度和输入端接电阻
- **DLL (Delay Lock Loop)**：延迟锁定环路，补偿时钟与数据之间的相位差
- **Write Leveling**：调整 DQS 信号和 CLK 信号边沿对齐

关键参数包括：
- **LCDL (Load Command Delay Line)**：负载命令延迟线，用于眼图训练
- **VREF (参考电压)**：确定稳定读取/写入的电压范围
- **Eye Diagram (眼图)**：评估信号质量的关键指标

## 相关来源

- [[src-ddr-training-csdn]] — DDR Training 详解，涵盖训练序列、关键参数和训练原因
- [[src-ddr-basics-summary]] — DDR 基础知识汇总，包含 Training 在初始化中的位置和作用
- [[src-ddr4-initialization-calibration]] — DDR4 初始化与校准流程
- [[src-iccircle-20240529]] — ICCircle DRAM 技术文档
- [[src-www2-pubs-techrpts-2024-eecs-2024-222pdf]] — UC Berkeley EECS 技术报告

## 相关概念

- [[ddr-calibration]] — 训练过程中的校准机制
- [[ddr-phy]] — 负责执行训练的物理层接口
- [[write-leveling]] — Training 的一个关键子步骤
- [[signal-integrity]] — Training 旨在补偿的核心问题

## 相关实体

- [[ddr5]] — DDR5 实体标准
- [[micron]] — DRAM 设计与训练技术
- [[sk-hynix]] — DRAM 供应商
