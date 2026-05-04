---
doc_id: src-register-types-ro-rw-wo-onechan
title: 只读、只写、读写寄存器的设计意图与避坑清单
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/register-types-ro-rw-wo-onechan.md
domain: tech/soc-pm
created: 2026-05-04
updated: 2026-05-04
tags: [soc-pm]
---

## Summary

> 来源：微信公众号「OneChan」 > 原文链接：https://mp.weixin.qq.com/s/-bDz9zU0869bCnlqttuFuw > 记录时间：2026-05-04

## Key Points

### 1. 核心观点
寄存器不是硬件给软件出的考试题，而是**硬件和软件之间的通信协议**。每一个寄存器的设计、每一个位的定义、每一种访问类型的选择，都不是随便拍脑袋决定的，背后都有硬件工程师的深思熟虑。

### 2. 只读寄存器（RO）：不是为了不让你写，而是为了保护你


### 3. 设计意图
只读寄存器的本质是**硬件给软件的一个"安全承诺"**——保证这个寄存器的值永远不会被软件意外修改。

### 4. 案例：英飞凌 TC3xx SMU 故障状态寄存器
- 全部为硬件级只读，即使 CPU 处于最高特权级也写不了 - 如果可写，软件 bug 可能意外清除故障状态，导致安全机制未触发 - 汽车 120km/h 行驶时刹车系统故障被清除，后果不堪设想

### 5. 冷知识
**99% 的只读寄存器，在硬件内部其实是可写的**，只是硬件只允许自己写，不允许软件写。例如 CPU 的程序计数器 PC，软件看来是只读的，但硬件内部每时每刻都在修改。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/register-types-ro-rw-wo-onechan.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/register-types-ro-rw-wo-onechan.md)
