---
doc_id: src-linux启动第七篇-bootrom做了什么
title: "Linux启动第七篇-BootROM做了什么"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/Linux启动第七篇-BootROM做了什么.md
domain: tech/bsp
created: 2026-05-09
updated: 2026-05-09
tags: [tech, bsp, onechan]
---

# Linux启动第七篇-BootROM做了什么

## 来源

- **原始文件**: raw/tech/bsp/Linux启动第七篇-BootROM做了什么.md
- **来源平台**: 微信公众号
- **作者**: 未知
- **收录日期**: 2026-05-09

## 文章类型

技术深度 / 芯片启动与复位机制

## 核心主题

A53 从复位到第一条指令的启动全流程

## 关键内容

- 一句话先讲明白
- 第一，BootROM 是什么？
- 第二，BootROM 上电后到底在做什么？
- 1. 读取启动模式
- 2. 去目标介质找第一阶段镜像

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
