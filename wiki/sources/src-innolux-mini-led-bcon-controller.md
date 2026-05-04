---
doc_id: src-innolux-mini-led-bcon-controller
title: "Innolux Mini LED Backlight — Bcon Controller Definition"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/tv-backlight/bcon-less-mini-led-backlight-analysis.md
domain: tech/tv-backlight
created: 2026-05-04
updated: 2026-05-04
tags: [tv-backlight, mini-led, bcon, innolux, local-dimming]
---

# Innolux Mini LED Backlight — Bcon Controller Definition

## 来源

- **原始文件**: raw/tech/tv-backlight/bcon-less-mini-led-backlight-analysis.md
- **原始 URL**: https://www.beck-elektronik.de/en/newsroom/news/article/innolux-mini-led-display-new-local-dimming-backlight-technology
- **提取日期**: 2026-05-04

## 摘要

Innolux（群创光电）在 Mini LED 背光方案的技术说明中，将 "Bcon" 作为行业标准术语使用。根据接口类型不同，背光控制方案分为三种：MIPI 需独立 MCU board、LVDS 使用 Bcon 背光控制器、eDP 功能集成在 Tcon 中。这直接证明了 **"Bcon" = Backlight Controller** 是显示行业的通用缩写，非某厂商专有。

## 关键要点

- MIPI 接口方案：需独立的 MCU board
- LVDS 接口方案：使用 **Bcon 背光控制器**
- eDP 接口方案：功能集成在 Tcon 时序控制器中
- "Bcon" 是显示行业通用术语，对应 Backlight Controller

## 关键引用

- "For MIPI, Innolux offers a corresponding chip for the MCU board, for LVDS a Bcon backlight controller and for eDP the function is included in the Tcon timing controller."

## Related Pages

- [[bcon-less]] — Bcon 的定义直接支撑 Bcon-less 概念的理解
- [[mini-led]] — Mini LED 背光技术
- [[tcon]] — 时序控制器，与 Bcon 并列的显示控制单元

## 开放问题

- Innolux 是否也在开发集成 Bcon 功能到 SoC 的方案？
