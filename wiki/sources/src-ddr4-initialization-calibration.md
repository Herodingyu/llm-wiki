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

## 摘要

systemverilog.io上的技术文章，深入讲解DDR4 SDRAM从开机到可操作状态的完整初始化流程。文章涵盖四个主要阶段：上电初始化、ZQ校准、VrefDQ校准和读写训练（Memory Training）。详细介绍了每个阶段的目的、实现原理和相关算法，包括Write Leveling、MPR Pattern Write、Read Centering和Write Centering。

## 关键要点

- DDR4初始化包含4个阶段：上电初始化 → ZQ校准 → VrefDQ校准 → 读写训练
- ZQ校准使用外部精密240Ω电阻作为参考，校准内部DQ引脚阻抗
- DDR4采用POD（Pseudo Open Drain）端接，替代DDR3的SSTL
- VrefDQ通过MR6模式寄存器设置，由内存控制器在校准阶段确定
- 读写训练包括Write Leveling、Read Centering和Write Centering四个算法

## 技术细节

- ZQCL（ZQ Calibration Long）用于初始化，ZQCS（Short）用于周期性校准
- DQ电路内部使用多晶硅电阻+并联p沟道器件，可通过VOH[0:4]调谐至240Ω
- 驱动强度由MR1[2:1]控制，端接由RTT_NOM、RTT_WR和RTT_PARK控制
- Write Leveling：DRAM在write leveling模式下用DQS采样CK，通过DQ返回采样值，控制器调整DQS延迟直至0→1跳变
- Read Centering：通过连续READ找到数据眼左右边缘，将捕获点置于眼图中心
- Write Centering：通过WRITE-READ-SHIFT-COMPARE循环找到写数据眼边缘，使DQ居中于DQS
- 周期性校准（Periodic ZQ和Periodic Read Centering）用于补偿工作中的电压和温度变化

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
