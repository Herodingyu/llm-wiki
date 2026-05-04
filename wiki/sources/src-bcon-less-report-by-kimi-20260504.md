---
doc_id: src-bcon-less-report-by-kimi-20260504
title: Bcon-less Mini-LED 背光技术分析报告
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/tv-backlight/bcon-less-report-by-kimi-20260504.md
domain: tech/tv-backlight
created: 2026-05-04
updated: 2026-05-04
tags: [tv-backlight]
---

## Summary

**Bcon-less**（或写作 Bconless）是 Mini LED 背光显示领域的一种系统架构创新，其核心思路是**取消独立的背光控制 MCU（即 BCON 芯片）**，将背光分区调光（Local Dimming）、时序控制等功能直接集成到主 SoC 或 FPGA 中，从而简化系统架构、降低物料成本（BOM）并减少信号传输延迟。 该术语中的 "Bcon" 即 **Backlight Control** 的缩写，指传统方案中负责背光分区控制的独立微控制器单元。 | 维度 | 传统架构（含 Bcon） | Bcon-less 架构 |

## Key Points

### 1. 1. 技术概述
**Bcon-less**（或写作 Bconless）是 Mini LED 背光显示领域的一种系统架构创新，其核心思路是**取消独立的背光控制 MCU（即 BCON 芯片）**，将背光分区调光（Local Dimming）、时序控制等功能直接集成到主 SoC 或 FPGA 中，从而简化系统架构、降低物料成本（BOM）并减少信号传输延迟。

### 2. 2. 技术架构对比
| 维度 | 传统架构（含 Bcon） | Bcon-less 架构 | |------|---------------------|----------------| | **控制链路** | 主 SoC → BCON MCU → LED 驱动 IC → Mini LED 灯板 | 主 SoC（内置调光算法）→ LED 驱动 IC → Mini LED 灯板 |

### 3. 3. 行业发展历程


### 4. 3.1 长虹智慧显示 —— 行业首发
2022 年 7 月，长虹智慧显示在行业首次推出 Bconless 技术方案，取消了独立的背光控制 MCU，完成了从芯片选型、通信协议到调光算法的全链路底层设计优化，并在内部代号为 "4号项目" 的 Mini LED 电视产品中率先实现量产。

### 5. 3.2 明微电子 —— 芯片层跟进
2025 年，明微电子推出 **SM6228N** 系列 Mini LED 驱动芯片，在其官方资料中明确标注该产品 "特别适用于降本 BCONLESS 场景下的应用需求"，并强调该芯片在双线版本下可为 Bconless 方案提供更好的调试体验。该芯片内置 BFI（Black Frame Insertion）功能，并支持 VRR（可变刷新率）与 Local Dimming 联动。

## Evidence

- Source: [原始文章](raw/tech/tv-backlight/bcon-less-report-by-kimi-20260504.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/tv-backlight/bcon-less-report-by-kimi-20260504.md)
