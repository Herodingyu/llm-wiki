---
doc_id: tapeout
title: 流片
page_type: concept
related_sources:
  - src-anysilicon-the-ultimate-signoff-tapeout-checklist
  - src-vlsisystemdesign-soc-labs
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, soc-pm, manufacturing]
---

# 流片

## 定义

流片（Tapeout）是芯片设计流程中将最终验证通过的设计数据（GDSII/OASIS 版图文件）提交给晶圆代工厂（Foundry）进行掩膜版（Mask）制作和晶圆制造的里程碑节点。流片是芯片设计中最关键的决策点之一，一旦流片，任何设计缺陷都将通过昂贵的掩膜版和晶圆制造成本体现，且修改周期长达数月。

## 技术细节

流片前签核检查（Signoff）：

- **DRC（Design Rule Check）**：验证版图是否符合代工厂的设计规则（最小特征尺寸、间距、虚拟填充、天线规则等）
- **LVS（Layout vs Schematic）**：确保物理版图与逻辑网表一致
- **时序分析（STA）**：验证所有路径满足建立时间（Setup）和保持时间（Hold）约束
- **功耗分析**：动态功耗、静态漏电功耗、时钟门控和电源门控效率
- **电源完整性**：静态/动态 IR 压降、电迁移（Power EM、Signal EM）
- **信号完整性**：高速信号的串扰、反射、抖动分析
- **ERC（Electrical Rule Check）**：连通性检查、短路/开路检查
- **ESD 保护验证**：静电放电保护电路的完整性
- **功能验证**：仿真覆盖率、形式验证、测试平台验证

常用工具：
- DRC/LVS：Mentor Calibre、Synopsys IC Validator
- 时序：Synopsys PrimeTime、Cadence Tempus
- 功耗/电源完整性：Ansys Redhawk、Cadence Voltus
- 功能验证：Synopsys VCS、Cadence Xcelium、Mentor Questa

流片后阶段：
- **MPW（Multi-Project Wafer）**：多项目共享掩膜版，降低小批量试产成本
- **Full Mask**：全套掩膜版，用于量产
- **Wafer Out**：晶圆制造完成
- **封装测试**：晶圆切割、封装、ATE 测试

## 相关来源

- [[src-anysilicon-the-ultimate-signoff-tapeout-checklist]] — 完整的流片签核检查清单
- [[src-vlsisystemdesign-soc-labs]] — SoC 实验室流片相关知识

## 相关概念

- [[verification]] — 流片前必须完成充分验证
- [[agile-hardware]] — 敏捷方法旨在加速流片周期
- [[chiplet]] — Chiplet 架构可分解流片风险

## 相关实体

- [[synopsys]] — 提供 PrimeTime、VCS 等签核工具
- [[nvidia]] — 使用 Synopsys 工具进行验证和签核
