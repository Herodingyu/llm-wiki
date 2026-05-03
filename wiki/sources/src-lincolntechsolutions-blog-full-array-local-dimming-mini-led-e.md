---
doc_id: src-lincolntechsolutions-blog-full-array-local-dimming-mini-led-e
title: "Full Array Local Dimming Mini-LED Evolution: LTS's Pioneering Journey"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/tv-backlight/lincolntechsolutions-blog-full-array-local-dimming-mini-led-e.md
domain: tech/tv-backlight
created: 2026-05-02
updated: 2026-05-02
tags: [tv-backlight, mini-led, local-dimming, backlight]
---

# Full Array Local Dimming Mini-LED Evolution: LTS's Pioneering Journey

## 来源

- **原始文件**: raw/tech/tv-backlight/lincolntechsolutions-blog-full-array-local-dimming-mini-led-e.md
- **提取日期**: 2026-05-02

## 摘要

Lincoln Technology Solutions（LTS）自2018年起 pioneering Mini-LED Full Array Local Dimming（FALD）技术，从第一代单LED单分区发展到第四代COB封装技术。文章详细介绍了Mini-LED FALD的技术原理、四代演进路线以及各代产品的应用场景和规格。

## 关键要点

- Mini-LED尺寸小于0.2mm，可在面板后部署数千颗LED
- FALD将LED以完整网格形式置于面板后方，实现超高对比度和HDR性能
- LTS四代演进：Gen 1（360 LEDs/360 zones）→ Gen 2（1,092 LEDs/273 zones）→ Gen 3（1,000 LEDs/1,000 zones，多路复用）→ Gen 4（1,000 zones COB封装）
- LTS最新LCD255产品可实现高达80%的功耗节省

## 关键引用

- "Lincoln Technology Solutions has been pioneering Mini-LED Full Array Local Dimming technology since 2018, evolving from single-LED single-zone to fourth-generation COB packaging."
- "Full Array Local Dimming places LEDs in a complete grid behind the panel, achieving ultra-high contrast and HDR performance."
- "LTS's latest LCD255 product can achieve up to 80% power savings compared to conventional backlight solutions."
- "FALD algorithm uses FPGA-based line-by-line buffer computation without frame buffering, avoiding backlight-to-video stream latency."

## 技术细节

- **Gen 1**: 2835 LED封装，360分区，应用于广播监视器、车载HUD、医疗AR显示
- **Gen 2**: 4014 LED封装，1,092 LEDs / 273 zones，面向零售标牌等低功耗应用
- **Gen 3**: 1212 CSP LEDs，1,000 zones，多路复用驱动+膜层堆叠，便携设备HDR
- **Gen 4**: COB LEDs直接贴装PCB，7"至32"可扩展，医疗/广播监视器
- **FALD算法**: 基于FPGA的逐行缓冲计算，无需帧缓存，避免背光与视频流延迟
- **LED封装演进**: 2835 → 4014 → 1212 → 0620

## Related Pages

- [[local-dimming]] — LTS 全阵列分区背光演进
- [[mini-led]] — Mini LED 背光技术
- [[led-driver]] — 分区背光驱动 IC
- [[oled]] — 与 Mini LED 竞争的显示技术

## 开放问题

- Gen 4的具体分区数量和LED数量未明确说明
- COB封装的热管理细节和长期可靠性数据不足
- 多路复用（multiplex）驱动方案的具体实现原理需进一步了解
