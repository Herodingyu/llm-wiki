---
doc_id: src-时钟系统bringup-从晶振到pll
title: "时钟系统bringup-从晶振到PLL-onechan"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/时钟系统bringup-从晶振到PLL-onechan.md
domain: tech/soc-pm
created: 2026-05-09
updated: 2026-05-09
tags: [tech, soc-pm, onechan]
---

# 时钟系统bringup-从晶振到PLL-onechan

## 来源

- **原始文件**: raw/tech/soc-pm/时钟系统bringup-从晶振到PLL-onechan.md
- **来源平台**: 微信公众号
- **作者**: 未知
- **收录日期**: 2026-05-09

## 文章类型

技术深度 / 时钟系统与 PLL

## 核心主题

SoC 时钟系统的 bringup：从晶振到 PLL

## 关键内容

- 为什么这是你必须啃透的第一块硬骨头
- 一、晶振振荡：不是通电就会响
- 1.1 石英晶体的等效电路
- 1.2 起振的本质：负阻抵消正阻
- 1.3 匹配电容：不是随便选个 22pF 就行

## 技术亮点

| 亮点 | 说明 |
|------|------|
| 架构级分析 | 从硬件底层到系统级的完整链路 |
| 工程实践 | 可直接应用于芯片设计与验证 |

## 质量评估

| 维度 | 评分 | 说明 |
|------|------|------|
| 技术深度 | ⭐⭐⭐⭐⭐ | 深入硬件微架构与协议细节 |
| 工程实用性 | ⭐⭐⭐⭐⭐ | 提供可直接使用的工程方法论 |
| 可读性 | ⭐⭐⭐⭐ | 结构清晰，层次分明 |

## 建议行动

- ✅ 创建相关概念词条
- ✅ 将关键实践纳入芯片设计规范

## Related Pages

- [[soc]] — SoC 总览
- [[processor-subsystem]] — 处理器子系统

## 开放问题

- 该技术与当前先进工艺的兼容性如何？
- 在不同厂商实现中是否存在系统性差异？
