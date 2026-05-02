---
doc_id: signal-integrity
title: 信号完整性
page_type: concept
related_sources:
  - src-ddr5-signal-integrity-ema
  - src-ddr-training-csdn
  - src-ddr-basics-summary
  - src-semiwiki-eda-346400-keysight-eda-at-61dac-its-big
  - src-anysilicon-the-ultimate-signoff-tapeout-checklist
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, dram, pcb-design]
---

# 信号完整性

## 定义

信号完整性（Signal Integrity, SI）是指高速数字信号在传输过程中保持其电压、时序和波形特征的能力。良好的信号完整性确保接收端能够正确识别发送端的逻辑状态，是高速数字系统（尤其是 DDR 内存接口）可靠工作的基础。

## 技术细节

主要信号完整性问题：

- **反射**：阻抗不连续导致信号在传输线两端来回反射
- **串扰**：相邻信号线之间的电磁耦合引起噪声
- **ISI（符号间干扰）**：前一个符号的能量残留影响当前符号判决
- **抖动**：信号边沿相对于理想位置的时序偏移
- **衰减**：高频分量在传输过程中能量损失

缓解措施：
- **阻抗控制**：PCB 走线保持 50Ω 单端 / 100Ω 差分阻抗
- **端接技术**：ODT、串联/并联端接消除反射
- **均衡技术**：DFE（决策反馈均衡）、FFE（前馈均衡）消除 ISI
- **材料选择**：使用超低损耗介电材料减少高频衰减
- **布局规则**：保持 3W 间距、差分对等长等距、连续地平面

## 相关来源

- [[src-ddr5-signal-integrity-ema]] — DDR5 信号完整性设计要点，涵盖 DFE、FFE、眼图分析
- [[src-ddr-training-csdn]] — Training 机制如何补偿信号完整性问题
- [[src-ddr-basics-summary]] — DDR 系统中信号完整性的基础知识
- [[src-semiwiki-eda-346400-keysight-eda-at-61dac-its-big]] — EDA 工具在信号完整性仿真中的应用
- [[src-anysilicon-the-ultimate-signoff-tapeout-checklist]] — 签核阶段的信号完整性验证
- [[src-dcon23-track2-paper]] — DesignCon 2023 Track 2 信号完整性论文
- [[src-ibis-summit-feb24-burns]] — IBIS Summit 2024 信号完整性建模标准

## 相关概念

- [[ddr-training]] — 通过自适应机制补偿信号完整性缺陷
- [[ddr-calibration]] — 校准驱动强度和端接阻抗以改善信号质量
- [[ddr-phy]] — 物理层设计必须优先考虑信号完整性
- [[ddr5]] — 更高频率带来更严峻的信号完整性挑战

## 相关实体

- [[synopsys]] — EDA 工具用于信号完整性仿真
- [[ddr5]] — DDR5 高频信号完整性挑战
