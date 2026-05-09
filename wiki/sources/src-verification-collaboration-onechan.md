---
doc_id: src-verification-collaboration-onechan
title: 验证协同共建：从旁观者到共建者的"灵魂三问"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/verification-collaboration-onechan.md
domain: tech/soc-pm
created: 2026-05-09
updated: 2026-05-09
tags: [soc-pm]
---

## Summary

> 来源：微信公众号「OneChan」 > 原文链接：https://mp.weixin.qq.com/s/nCpM4tVGOAw6tuG3-hQ46A > 记录时间：2026-05-04

## Key Points

### 1. 核心观点
验证团队告诉你"所有用例都通过了"，但你集成时却踩到了他们没有踩过的坑 —— 因为验证表验证的是**设计应该做什么**，而你需要知道的是**当事情不如预期时，会发生什么**。 > 验证表验证的是"设计是否实现了规格文档中写明的东西"，而软件集成面临的是"在真实世界中所有可能发生的、规格文档中未写明的事情"。

### 2. 视角切换：从"功能验证清单"到"集成风险地图"
传统验证表回答："设计是否做了它该做的事？" 你需要推动验证团队制作**集成风险地图**，回答三个更深刻的问题： 1. **可观测性之问**：当 IP 行为异常时，验证环境能否像未来的你一样看清内部发生了什么？

### 3. 第一问：可观测性之问


### 4. 寄存器映射完备性
- 关键内部状态（状态机、计数器、FIFO 水位）是否映射到软件可读寄存器？ - 验证环境中是直接访问内部信号，还是通过寄存器读取？

### 5. 错误传播路径显性化
- 从内部错误标志 → 中断控制器/状态寄存器的完整路径是否有单独验证？ - 中断被屏蔽时，错误能否被正确锁存而不丢失？

## Evidence

- Source: [原始文章](raw/tech/soc-pm/verification-collaboration-onechan.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/verification-collaboration-onechan.md)
