---
doc_id: src-ddr1-lpddr4-dqs-vt-drift理解
title: DDR1.LPDDR4 DQS VT drift理解
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/DDR1.LPDDR4 DQS VT drift理解.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

本文深入分析了LPDDR4中DQS（Data Strobe）的VT drift现象及其对系统时序的影响。与DDR4不同，LPDDR4为了追求更低功耗，在DRAM内部将DQS和DQ解耦。在DRAM接口上，经过training后DQS和DQ之间存在一个固定的tDQS2DQ相位差。LPDDR4内部通过延迟链（Delay Buffer）对DQS进行补偿，确保在采样点DQS toggle仍位于DQ眼图中间。然而，这个延迟链受PVT（工艺、电压、温度）影响，特别是V（电压）和T（温度）的变化会导致延迟漂移（VT drift）。电压越高延迟越小，温度越高延迟越大（考虑反温度效应后）。为了精确控制DQS/DQ相位关系，MC/PHY需要读取DRAM内部MR寄存器中存储的计数器值（Cnt），通过OSC（Oscillator）测量延迟链的实际延迟，并根据JEDEC公式计算VT影响。这是LPDDR4系统设计中确保时序可靠性的关键技术。

## Key Points

### 1. LPDDR4与DDR4的DQS/DQ差异
- **DDR4**：DQS和DQ在DRAM接口上直接对齐，training后DQS位于DQ眼图中间
- **LPDDR4**：DQS和DQ在内部解耦，接口上存在tDQS2DQ相位差
- **内部补偿**：LPDDR4通过延迟链将DQS延迟到采样点，保证正确采样

### 2. VT Drift成因
- **PVT影响**：延迟链受工艺、电压、温度影响
- **电压效应（V）**：VDD越大驱动越强，延迟越小
- **温度效应（T）**：温度越高，数字电路延迟越大（50nm工艺后存在反温度效应）
- **VT综合**：T/V比值越大，tDQS2DQ越大

### 3. 电路结构
- **延迟Buffer**：对DQS进行精确延迟，确保采样点位于DQ眼图中间
- **OSC（振荡器）**：在固定run_time内对延迟Buffer的toggle计数
- **计数器（Cnt）**：计数值反映延迟链的实际延迟时间

### 4. 工作流程
1. Training阶段建立初始DQS/DQ相位关系
2. 定期读取DRAM MR寄存器获取Cnt值
3. 通过OSC测量延迟链实际延迟
4. 根据JEDEC公式计算VT影响量
5. MC/PHY动态调整DQS发送时序补偿VT drift

### 5. 计算方法

| 参数 | 影响 | 关系 |
|------|------|------|
| 电压(V) | VDD增加 | tDQS2DQ减小 |
| 温度(T) | 温度升高 | tDQS2DQ增大 |
| Cnt值 | OSC计数值 | 反映实际延迟 |
| 精度 | run_time长度 | 时间越长精度越高 |

- 参考JEDEC标准公式进行精确计算
- T/V_Dly曲线用于评估VT变化范围
- tDQS2DQ与Cnt呈线性关系

## Key Quotes

> "LPDDR4为了追求低功耗，DQS和DQ在其内部是解耦的状态"

> "由于tDQS2DQ的延迟buffer容易受到PVT的影响，对于单独的DRAM设备而言，P不是变量，而应该由DRAM Vendor提供P的影响；因此VT的影响是PHY需要去考量的"

> "V越大则tDQS2DQ越小，T越大则tDQS2DQ越大。因此T/V的值越大，则tDQS2DQ越大"

> "OSC的作用是在特定的时间内run_time对延迟Buffer的toggle进行计数，从而可以从计数值来获取其延迟时间"

> "50nm工艺后存在一定的反温度效应，V指的供电电压，VDD越大则驱动越强，dly越小"
