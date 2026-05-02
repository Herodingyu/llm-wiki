---
doc_id: src-arxiv-html-260303147v1
title: Agentic AI-based Coverage Closure for Formal Verification
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/arxiv-html-260303147v1.md
domain: tech/soc-pm
created: 2026-05-02
updated: 2026-05-02
tags: [soc-pm, verification, agile]
---

# Agentic AI-based Coverage Closure for Formal Verification

## 来源

- **原始文件**: raw/tech/soc-pm/arxiv-html-260303147v1.md
- **提取日期**: 2026-05-02

## 摘要

本文提出了一种基于代理式 AI 的形式验证覆盖率闭合工作流，利用大语言模型 (LLM) 自动化覆盖率分析、识别覆盖率缺口并生成所需的形式属性。

## 关键要点

- 覆盖率闭合是 IC 开发过程中的关键要求
- 传统穷举方法常在项目时间线内无法实现完全覆盖
- Saarthi 框架使用多智能体协作实现端到端形式验证
- 覆盖率代理持续增加覆盖率指标 10%-20%，复杂设计增益更大

## 技术细节

- 主要贡献：
  1. 自动化缺口分类：分析覆盖率报告，分区未覆盖 RTL 区域
  2. 定向属性生成：LLM 生成 SystemVerilog 属性
  3. 迭代代理式覆盖率闭合：循环直到满足阈值
- 基准测试：ECC、CIC Decimator、AXI4LITE、Automotive IP、Memory Scheduler
- 性能最佳：GPT-5 模型，其次是 GPT-4.1，Llama3.3 最低
- 使用 Cadence Jasper Gold 进行形式验证

## Related Pages

- [[verification]] — Agentic AI 覆盖收敛
- [[agile-hardware]] — AI 改变芯片设计验证流程
- [[synopsys]] — Synopsys.ai AI 驱动 EDA
- [[chiplet]] — Chiplet 设计自动化

## 开放问题

- 生成属性的证明率下降问题如何解决？
- 人机协同 (HIL) 在覆盖率闭合中的最佳集成点在哪里？
