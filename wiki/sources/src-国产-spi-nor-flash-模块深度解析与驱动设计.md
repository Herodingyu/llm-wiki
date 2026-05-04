---
doc_id: src-国产-spi-nor-flash-模块深度解析与驱动设计
title: 国产 SPI NOR Flash 模块深度解析与驱动设计
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/国产 SPI NOR Flash 模块深度解析与驱动设计.md
domain: tech/peripheral
created: 2026-05-04
updated: 2026-05-04
tags: [peripheral]
---

## Summary

OneChan *2026年3月23日 19:30* 本文以一款国产 64Mbit SPI NOR Flash 为例，从底层原理到代码实现，完整剖析其工作方式。每一段原理讲解后均附有对应的代码实现，代码中的命令码均使用宏定义，便于理解与维护。本文旨在让读者不仅“会用”，更能“懂其所以然”，遇到问题时能快速定位根源。 在嵌入式系统中，存储方案的选择直接影响系统的成本、性能与可靠性。SPI NOR Flash 因其接口简单、支持片内执行（XiP）、擦写次数高、数据保持时间长等优势，广泛应用于以下场景：

## Key Points

### 1. 一、设计目标与选型依据
在嵌入式系统中，存储方案的选择直接影响系统的成本、性能与可靠性。SPI NOR Flash 因其接口简单、支持片内执行（XiP）、擦写次数高、数据保持时间长等优势，广泛应用于以下场景： | 应用场景 | 核心需求 |

### 2. 二、工作原理深度解析
理解 Flash 的工作方式是写出正确驱动的前提。本节将从存储单元、接口协议、状态机、地址映射、擦写原理、高速模式、安全机制等维度深入剖析。

### 3. 2.1 存储单元与阵列结构
NOR Flash 的每个存储单元是一个浮栅晶体管，结构如下： ```js 控制栅   │   ▼┌───────────┐│ 浮栅（绝缘） │  ← 存储电荷├───────────┤│ 源极 │ 漏极 │└───────────┘

### 4. 2.2 SPI 通信协议深度解析
SPI 有四种工作模式，由时钟极性（CPOL）和时钟相位（CPHA）决定。本芯片同时支持 Mode 0 和 Mode 3： | 模式 | CPOL | CPHA | 特性 | | --- | --- | --- | --- |

### 5. 2.3 状态机与写保护机制
芯片内部有两个关键状态位，驱动必须时刻关注： | 位 | 名称 | 位置 | 说明 | | --- | --- | --- | --- | | WIP | Write In Progress | SR1\[0\] | 1 = 内部编程/擦除/写状态寄存器进行中，此时不接受新命令 |

## Evidence

- Source: [原始文章](raw/tech/peripheral/国产 SPI NOR Flash 模块深度解析与驱动设计.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/国产 SPI NOR Flash 模块深度解析与驱动设计.md)
