---
doc_id: ddr-calibration
title: DDR Calibration
page_type: concept
related_sources:
  - src-ddr4-initialization-calibration
  - src-ddr-training-csdn
  - src-ddr-basics-summary
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, dram]
---

# DDR Calibration

## 定义

DDR Calibration（DDR 校准）是在 DDR 内存初始化及运行期间，通过参考精密电阻和自适应算法调整内部电路参数，以确保输出驱动强度、端接阻抗和时序关系符合 JEDEC 规范的过程。

## 技术细节

主要校准类型包括：

- **ZQ Calibration**：
  - 使用外部 240Ω 精密电阻（±1%）作为参考
  - ZQCL：上电初始化时执行，持续 512 个时钟周期
  - ZQCS：正常操作期间周期性执行，持续 64 个时钟周期
  - 校准 DQ 输出驱动强度和 ODT 输入端接电阻

- **ODT (On-die Termination)**：
  - 利用 ZQ 电阻值实现精确阻抗匹配
  - 解决 DDR PHY + PCB + SDRAM 通路的信号反射问题
  - 有效改善信号完整性

- **VREF Calibration**：
  - 确定稳定读取/写入的电压阈值
  - 补偿温度、电压和工艺变化

## 相关来源

- [[src-ddr4-initialization-calibration]] — DDR4 初始化与校准完整流程
- [[src-ddr-training-csdn]] — 包含 ZQ Calibration 在 Training 序列中的位置
- [[src-ddr-basics-summary]] — DDR 基础知识中的 ZQ 校准和 ODT 说明

## 相关概念

- [[ddr-training]] — 校准是训练过程的核心组成部分
- [[ddr-phy]] — 物理层实现校准电路
- [[signal-integrity]] — 校准旨在解决的信号质量问题
- [[write-leveling]] — 时序对齐校准的一种

## 相关实体

- [[ddr5]] — DDR5 实体标准
- [[micron]] — DRAM 校准与设计技术
- [[synopsys]] — 提供 DDR PHY 和校准 IP
