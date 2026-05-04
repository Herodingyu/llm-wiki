---
doc_id: src-macroblock-mcu-less-mini-led-backlight
title: "Macroblock MCU-less Mini-LED Backlight Solution"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/tv-backlight/bcon-less-mini-led-backlight-analysis.md
domain: tech/tv-backlight
created: 2026-05-04
updated: 2026-05-04
tags: [tv-backlight, mini-led, bcon-less, mcu-less, led-driver, macroblock]
---

# Macroblock MCU-less Mini-LED Backlight Solution

## 来源

- **原始文件**: raw/tech/tv-backlight/bcon-less-mini-led-backlight-analysis.md
- **原始 URL**: https://www.mblock.com.tw/en/news/detail/303
- **提取日期**: 2026-05-04

## 摘要

Macroblock（聚积科技）2021 年发布的 Mini-LED 背光驱动方案，针对中小尺寸显示（笔电/平板）推出 MBI6322 和 MBI6334 两款芯片，明确标注 **"do not need to apply MCU"** 即可处理 Mini-LED 背光矩阵的调光信号，可直接配合 T-con IC 或 Bridge IC 工作。这是行业最早将 "MCU-less" 作为明确卖点的大型驱动芯片厂商之一。

## 关键要点

- MBI6322：内置 MOSFET，高集成度，可直接配合 T-con IC
- MBI6334：细长 BGA 封装，适配窄 PCB 空间
- 两者均 **无需 MCU**，简化系统架构
- 中大尺寸 TV 方案（MBI6353/MBI6328）通常仍需要 MCU（如 Nuvoton M484）

## 关键引用

- "MBI6322 and MBI6334 do not need to apply MCU to handle the dimming signal of the mini-LED backlight matrix."
- "They can choose commercially available T-con ICs or bridge ICs directly."
- "For medium- to large-size LCD displays, most will apply 'MCU'."

## 技术细节

**中小尺寸系统架构**:
```
SoC → T-con IC/Bridge IC → LED Driver IC (MBI6322/MBI6334) → Mini LED 灯板
```

**中大尺寸传统架构**:
```
SoC → MCU (如 Nuvoton M484) → LED Driver IC (MBI6353/MBI6328) → Mini LED 灯板
```

## Related Pages

- [[bcon-less]] — Macroblock 的 MCU-less 方案是 Bcon-less 架构的芯片层实现
- [[mini-led]] — Mini LED 背光驱动技术
- [[led-driver]] — LED 驱动 IC 技术
- [[local-dimming]] — 分区背光调光技术

## 开放问题

- Macroblock 是否计划推出 TV 级无 MCU 的大电流驱动方案？
- MBI6322/MBI6334 的最大分区数和电流限制是多少？
