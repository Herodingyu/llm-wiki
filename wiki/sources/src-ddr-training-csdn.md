---
doc_id: src-ddr-training-csdn
title: DDR Training 详解
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/ddr-training-csdn.md
---

## Summary

DDR Training（训练）是DDR内存初始化过程中的关键步骤，目的是通过自适应机制补偿信号完整性问题、对齐时钟与数据信号、适应不同物理层设计，从而提高数据传输的可靠性和效率。

## Key Points

### 1. Training 出现的原因
- **信号完整性（SI）问题**：高速信号存在反射、串扰、噪声干扰
- **时钟与数据信号对齐**：物理布局、走线长度差异导致时序偏差
- **适应不同物理层设计**：主板、内存条设计差异
- **提高数据传输效率**：DDR双倍数据速率需要精确的时序控制

### 2. Training Sequence
- **CS Training**：对齐 CS_N 和 CK 信号
- **CA Training**：对齐 CA 和 CK 信号
- **ZQ Calibration**：使用外部 240Ω 精密电阻校准 DQ 输出驱动强度和输入端接电阻
- **DLL (Delay Lock Loop)**：延迟锁定环路，补偿时钟与数据之间的相位差

### 3. 关键参数
- **LCDL (Load Command Delay Line)**：负载命令延迟线，用于眼图训练
- **VREF (参考电压)**：确定稳定读取/写入的电压范围
- **Eye Diagram (眼图)**：评估信号质量的关键指标

## Evidence

- ZQ Calibration 使用外部精密（±1%）240Ω 电阻作为参考
- 训练通过改变 LCDL 值和 VREF 设置来找到最佳眼图位置
- Write Leveling 用于对齐 DRAM 颗粒端 DQS 信号和 CLK 信号边沿

## Open Questions

- DLL 校准在不同温度下的稳定性如何保证？
- 眼图训练失败时的回退策略是什么？
- LPDDR5 中 training 流程与 DDR4 有何本质区别？

## Related Links

- [DDR 基础知识点汇总](src-ddr-basics-summary.md)
- [DDR中的ZQ Calibration && trainning](https://blog.csdn.net/li_kin/article/details/144360626)
- [DRAM Training](https://blog.csdn.net/m0_73549240/article/details/132605266)
