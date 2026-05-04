---
doc_id: src-bcon-less-mini-led-backlight-analysis
title: Bcon-less Mini-LED 背光技术分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/tv-backlight/bcon-less-mini-led-backlight-analysis.md
domain: tech/tv-backlight
created: 2026-05-04
updated: 2026-05-04
tags: [tv-backlight]
---

## Summary

**Bcon-less**（或写作 Bconless）是 Mini LED 背光显示领域的一种系统架构创新，其核心思路是**取消独立的背光控制 MCU（即 BCON 芯片）**，将背光分区调光（Local Dimming）、时序控制等功能直接集成到主 SoC 或 FPGA 中，从而简化系统架构、降低物料成本（BOM）并减少信号传输延迟。 该术语中的 "Bcon" 即 **Backlight Control** 的缩写，指传统方案中负责背光分区控制的独立微控制器单元。 Innolux 在 Mini LED 背光方案的技术说明中明确将 "Bcon" 作为标准术语使用：

## Key Points

### 1. 1. 技术概述
**Bcon-less**（或写作 Bconless）是 Mini LED 背光显示领域的一种系统架构创新，其核心思路是**取消独立的背光控制 MCU（即 BCON 芯片）**，将背光分区调光（Local Dimming）、时序控制等功能直接集成到主 SoC 或 FPGA 中，从而简化系统架构、降低物料成本（BOM）并减少信号传输延迟。

### 2. 2. 术语溯源："Bcon" 在显示行业中的定义


### 3. 2.1 Innolux（群创光电）的技术资料
Innolux 在 Mini LED 背光方案的技术说明中明确将 "Bcon" 作为标准术语使用： | 接口类型 | 背光控制方案 | |----------|-------------| | MIPI | 需独立的 MCU board |

### 4. 3. 技术架构对比
| 维度 | 传统架构（含 Bcon） | Bcon-less 架构 | |------|---------------------|----------------| | 控制链路 | SoC → BCON MCU → LED Driver IC → Mini LED 灯板 | SoC（内置调光算法）→ LED Driver IC → Mini LED 灯板 |

### 5. 4. 行业发展历程


## Evidence

- Source: [原始文章](raw/tech/tv-backlight/bcon-less-mini-led-backlight-analysis.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/tv-backlight/bcon-less-mini-led-backlight-analysis.md)
