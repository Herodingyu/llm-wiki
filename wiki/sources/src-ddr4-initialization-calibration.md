---
doc_id: src-ddr4-initialization-calibration
title: DDR4 SDRAM - Initialization, Training and Calibration
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/systemverilog-design-ddr4-initialization-and-calibrati.md
domain: tech/dram
created: 2026-05-02
updated: 2026-05-02
tags: [dram, ddr4, initialization, calibration, training, write-leveling]
---

# DDR4 SDRAM - Initialization, Training and Calibration

## 来源

- **原始文件**: raw/tech/dram/systemverilog-design-ddr4-initialization-and-calibrati.md
- **提取日期**: 2026-05-02

## Summary

本文是systemverilog.io上的深度技术文章，全面讲解了DDR4 SDRAM从开机上电到进入可操作状态的完整初始化与校准流程。DDR4的初始化过程分为四个核心阶段：上电初始化（Power-up Initialization）、ZQ校准（ZQ Calibration）、VrefDQ校准（VrefDQ Training）和读写训练（Read/Write Training）。文章详细介绍了每个阶段的目的、实现原理和具体算法。与DDR3的SSTL端接不同，DDR4采用POD（Pseudo Open Drain）端接技术，具有更好的信号完整性和更低的功耗。ZQ校准利用外部240Ω精密电阻作为参考，校准内部DQ驱动阻抗和ODT端接值。VrefDQ校准通过MR6模式寄存器动态调整参考电压。读写训练包括Write Leveling（对齐DQS与CK）、MPR Pattern Write、Read Centering（找到读数据眼中心）和Write Centering（找到写数据眼中心）四个关键算法。此外，文章还介绍了周期性校准机制，用于补偿工作过程中的电压和温度变化，确保系统长期稳定运行。

## Key Points

### 1. 初始化四阶段流程

| 阶段 | 目的 | 关键技术 |
|------|------|----------|
| 上电初始化 | 完成DRAM上电时序和基本配置 | 电源稳定、复位、MR寄存器初始化 |
| ZQ校准 | 校准DQ驱动强度和ODT阻抗 | 外部240Ω参考电阻、VOH调谐 |
| VrefDQ校准 | 确定最佳数据参考电压 | MR6模式寄存器、眼图扫描 |
| 读写训练 | 对齐读写时序，找到眼图中心 | Write Leveling、Read/Write Centering |

### 2. POD端接技术
- **DDR4创新**：采用Pseudo Open Drain替代DDR3的SSTL
- **优势**：更好的信号完整性、更低功耗
- **实现**：上拉到VDDQ，而非SSTL的分压端接
- **控制**：通过RTT_NOM、RTT_WR、RTT_PARK动态调整端接值

### 3. ZQ校准机制

| 类型 | 用途 | 时间 |
|------|------|------|
| ZQCL (Long) | 初始化时完整校准 | 约512个时钟周期 |
| ZQCS (Short) | 周期性短校准 | 约128个时钟周期 |

- 使用外部精密240Ω电阻作为参考
- DQ电路内部：多晶硅电阻 + 并联p沟道器件
- 通过VOH[0:4]控制字调谐至目标阻抗
- 驱动强度由MR1[2:1]控制

### 4. 读写训练算法

| 算法 | 目的 | 方法 |
|------|------|------|
| Write Leveling | DQS与CK对齐 | DRAM采样CK，通过DQ反馈，调整DQS延迟 |
| MPR Pattern Write | 使用已知pattern训练 | 写入MPR（Multi Purpose Register）模式 |
| Read Centering | 找到读数据眼中心 | 连续READ，扫描左右边缘，取中点 |
| Write Centering | 找到写数据眼中心 | WRITE-READ-SHIFT-COMPARE循环 |

### 5. 周期性校准
- **目的**：补偿工作中的电压波动和温度变化
- **Periodic ZQ**：定期执行短ZQ校准，维持阻抗精度
- **Periodic Read Centering**：定期重新校准读时序
- **触发条件**：温度变化超过阈值、长时间运行后

## Key Quotes

> "DDR4 initialization consists of four main stages: Power-up Initialization, ZQ Calibration, VrefDQ Calibration, and Read/Write Training."

> "DDR4 adopts POD (Pseudo Open Drain) termination, replacing SSTL used in DDR3, offering better signal integrity and lower power consumption."

> "ZQ calibration uses an external precision 240Ω resistor as reference to calibrate internal DQ pin impedance and ODT termination values."

> "Write Leveling: DRAM samples CK using DQS in write leveling mode, returns sampling value via DQ, and the controller adjusts DQS delay until 0→1 transition."

> "Periodic calibration (Periodic ZQ and Periodic Read Centering) compensates for voltage and temperature variations during operation."

## Related Pages

- [[ddr-training]] — DDR4 初始化中 Write Leveling 的详细流程
- [[ddr-calibration]] — ZQ Calibration 和 VrefDQ 校准机制
- [[write-leveling]] — Write Leveling 在 DDR4 系统中的位置和作用
- [[ddr5]] — DDR5 初始化流程与 DDR4 的主要差异
- [[ddr-phy]] — PHY 在 Training 过程中的角色

## 开放问题

- DDR5初始化流程与DDR4的主要差异
- 不同厂商PHY IP的校准算法实现差异
- 高速DDR4系统中信号完整性对训练结果的影响
