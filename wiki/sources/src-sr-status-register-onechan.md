---
doc_id: src-sr-status-register-onechan
title: 状态寄存器 SR 的本质：硬件与软件的"握手协议"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/sr-status-register-onechan.md
domain: tech/soc-pm
created: 2026-05-04
updated: 2026-05-04
tags: [soc-pm]
---

## Summary

> 来源：微信公众号「OneChan」 > 原文链接：https://mp.weixin.qq.com/s/bG5dB_v-_2AiasfuenV_3A > 记录时间：2026-05-04

## Key Points

### 1. 核心观点
SR 不是一个简单的"存储单元"，它是**数字系统中硬件与软件之间唯一的、标准化的、实时的状态同步接口**。它解决的根本矛盾是：**硬件是并行的、连续的、事件驱动的，而软件是串行的、离散的、指令驱动的**。

### 2. 为什么必须有 SR？
如果没有 SR，软件怎么知道硬件刚才做了什么？ 以 `ADD R0, R1, R2` 为例，CPU 执行需要 3 个时钟周期： 1. 周期 1：读 R1 和 R2 2. 周期 2：ALU 计算 3. 周期 3：结果写入 R0

### 3. SR 的硬件本质："事件锁存器阵列"
- **通用寄存器**：软件写、硬件读 - **SR**：**硬件写、软件读**的事件锁存器阵列 每个标志位背后对应一个独立的硬件事件源，事件发生时硬件自动置位；软件只能通过特定指令读取或清除，不能像写普通寄存器一样随意修改。

### 4. 经典标志位深度解析


### 5. 算术标志位（所有条件分支指令的基础）
| 标志位 | 名称 | 硬件生成逻辑 | 软件意义 | |--------|------|-------------|----------| | Z | 零标志 | Result == 0 | 运算结果为零 |

## Evidence

- Source: [原始文章](raw/tech/soc-pm/sr-status-register-onechan.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/sr-status-register-onechan.md)
