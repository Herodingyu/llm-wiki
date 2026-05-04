---
doc_id: src-register-offset-alignment-stride-onechan
title: 寄存器地址偏移、地址对齐与 Stride 的底层逻辑
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/register-offset-alignment-stride-onechan.md
domain: tech/soc-pm
created: 2026-05-04
updated: 2026-05-04
tags: [soc-pm]
---

## Summary

> 来源：微信公众号「OneChan」 > 原文链接：https://mp.weixin.qq.com/s/kaj70_dL_WcTSRsGDfw38g > 记录时间：2026-05-04

## Key Points

### 1. 核心观点
寄存器地址偏移、地址对齐、Stride 共同构成了嵌入式系统**内存映射 I/O（MMIO）**的底层逻辑，是固件开发和 FPGA 设计中必须掌握的硬件思维。 ---

### 2. 01 寄存器地址偏移：模块化寻址的硬件基石


### 3. 核心原理
采用 **"基地址 + 偏移量"** 的线性寻址模型： ``` ADDR = BASE + OFFSET ``` - 高位地址线（如 [31:8]）用于**片选**（选中该外设） - 低位地址线（如 [7:0]）用于**偏移译码**（选中外设内的具体寄存器）

### 4. 示例：ARM Cortex-M3 UART0（基地址 0x4000C000）
| 寄存器 | 偏移量 | 功能 | |--------|--------|------| | DR | 0x00 | 数据寄存器（读写） | | SR | 0x04 | 状态寄存器（只读） | | BRR | 0x08 | 波特率寄存器（读写） |

### 5. 02 地址对齐：总线与存储系统的效率约束


## Evidence

- Source: [原始文章](raw/tech/soc-pm/register-offset-alignment-stride-onechan.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/register-offset-alignment-stride-onechan.md)
