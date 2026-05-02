---
doc_id: src-anysilicon-the-ultimate-signoff-tapeout-checklist
title: The Ultimate Signoff (TapeOut) Checklist
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/anysilicon-the-ultimate-signoff-tapeout-checklist.md
domain: tech/soc-pm
created: 2026-05-02
updated: 2026-05-02
tags: [soc-pm, tapeout, chip-design]
---

# The Ultimate Signoff (TapeOut) Checklist

## 来源

- **原始文件**: raw/tech/soc-pm/anysilicon-the-ultimate-signoff-tapeout-checklist.md
- **提取日期**: 2026-05-02

## 摘要

AnySilicon 提供的完整流片签核检查清单，涵盖从设计规则检查 (DRC) 到功能验证的所有关键签核活动，确保芯片设计在送交代工前满足所有要求。

## 关键要点

- 签核是芯片制造过程中的关键质量控制检查点
- 涵盖七大类签核检查：DRC、时序分析、功耗分析、电源完整性、ERC、信号完整性、热分析
- 还包括 ESD 保护验证、LVS 和功能验证
- 工具包括 Calibre、PrimeTime、Redhawk、VCS 等

## 技术细节

- **DRC**: 最小特征尺寸、间距、虚拟填充、天线规则
- **时序分析**: 约束验证、时序收敛 (setup/hold、时钟域跨越)
- **功耗分析**: 动态/静态功耗、时钟门控、电源门控
- **电源完整性**: 静态/动态 IR 压降、电迁移 (Power EM、Signal EM)
- **ERC**: 连通性检查、短路/开路检查
- **LVS**: 版图与原理图对比，确保物理版图与逻辑设计一致
- **功能验证**: 仿真、测试平台、覆盖率分析、形式验证

## Related Pages

- [[tapeout]] — 流片签核检查清单
- [[verification]] — 流片前必须完成充分验证
- [[agile-hardware]] — 敏捷方法旨在加速流片周期
- [[chiplet]] — Chiplet 架构可分解流片风险
- [[synopsys]] — 提供 PrimeTime、IC Validator 等签核工具

## 开放问题

- 在先进节点 (7nm 及以下)，签核检查的复杂度如何变化？
- AI 辅助签核工具的实际效果如何？
