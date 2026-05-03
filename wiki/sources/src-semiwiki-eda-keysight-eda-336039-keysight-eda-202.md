---
doc_id: src-semiwiki-eda-keysight-eda-336039-keysight-eda-202
title: Keysight EDA 2024 Delivers Shift Left for Chiplet and PDK Workflows
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/semiwiki-eda-keysight-eda-336039-keysight-eda-202.md
domain: tech/soc-pm
created: 2026-05-02
updated: 2026-05-02
tags: [soc-pm, chip-design]
---

# Keysight EDA 2024 Delivers Shift Left for Chiplet and PDK Workflows

## 来源

- **原始文件**: raw/tech/soc-pm/semiwiki-eda-keysight-eda-336039-keysight-eda-202.md
- **提取日期**: 2026-05-02

## 摘要

Keysight EDA 2024 发布，重点介绍了针对 Chiplet 和 PDK 工作流的 "Shift Left" 功能。包括 Chiplet PHY Designer for UCIe 和 PDK 模型重新定心功能。

## 关键要点

- UCIe (Universal Chiplet Interconnect Express) 填补了 D2D 互连规范的空白
- Chiplet PHY Designer 是业界首款 Chiplet 互连仿真工具
- 支持 UCIe 标准封装 (2D) 和先进封装 (2.5D) 变体
- IC-CAP 新增模型重新定心功能，可节省 70% 的模型提取时间
- QA Express 轻量级模型质量保证工具集成到 Model Builder

## Key Quotes

- "Chiplet PHY Designer is the industry's first chiplet interconnect simulation tool, supporting both 2D standard and 2.5D advanced packaging variants."
- "IC-CAP's new model re-centering feature can save up to 70% of model extraction time."
- "UCIe fills the gap in D2D interconnect specifications, enabling standardized chiplet communication."

## 技术细节

- Chiplet PHY Designer 基于 ADS 2024 Update 1.0
- 精确计算电压传递函数 (VTF)，分析系统 BER 低至 1e-27 或 1e-32
- 支持眼高、眼宽、偏斜、掩模裕量和 BER 轮廓测量
- 模型重新定心使用 FOM (性能指标) 调整现有模型到新工艺

## Related Pages

- [[verification]] — Keysight EDA 2024 Shift Left
- [[synopsys]] — Synopsys EDA 竞争者
- [[chiplet]] — Chiplet PHY Designer
- [[agile-hardware]] — AI 改变芯片设计流程

## 开放问题

- Chiplet PHY Designer 对 BoW 和 AIB 的支持何时推出？
- 在实际项目中，模型重新定心的准确性如何保证？
