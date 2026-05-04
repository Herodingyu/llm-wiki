---
doc_id: src-ti-e2e-local-dimming-architecture
title: "TI E2E — Local Dimming LED Backlight System Architecture Discussion"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/tv-backlight/bcon-less-mini-led-backlight-analysis.md
domain: tech/tv-backlight
created: 2026-05-04
updated: 2026-05-04
tags: [tv-backlight, mini-led, local-dimming, mcu, system-architecture]
---

# TI E2E — Local Dimming LED Backlight System Architecture Discussion

## 来源

- **原始文件**: raw/tech/tv-backlight/bcon-less-mini-led-backlight-analysis.md
- **原始 URL**: https://e2e.ti.com/support/power-management-group/power-management/f/power-management-forum/696861/does-ti-have-local-dimming-led-backlight-drive-total-solution
- **提取日期**: 2026-05-04

## 摘要

TI E2E 社区中关于 Local Dimming LED 背光驱动方案的讨论，明确展示了传统 Mini LED 背光系统的三层架构：SoC/FPGA → MCU → LED Driver IC。客户方案为 5 分区，每区 672 颗 LED（共 3360 颗），电流 110mA、电压 32V。这个讨论是理解传统含 MCU 架构的典型参考。

## 关键要点

- 传统 Local Dimming 方案含三层：SoC → MCU → LED Driver IC
- SoC 通过 SPI 向 MCU 发送图像数据
- MCU 处理后通过 SPI 控制一个或多个 LED Driver IC
- 示例规格：5 分区，每区 672 LED，共 3360 颗，110mA/32V

## 关键引用

- "The local dimming scheme based on MCU consists of three parts: FPGA or SOC, MCU and LED Driver IC."
- "SOC collect image signals and send data to MCU through SPI interface."
- "After data processing, MCU controls one or more LED drivers through SPI."

## Related Pages

- [[bcon-less]] — Bcon-less 正是要取消这个三层架构中的 MCU 层级
- [[mini-led]] — Mini LED 背光驱动系统架构
- [[local-dimming]] — 分区背光调光技术
- [[led-driver]] — LED 驱动 IC 技术

## 开放问题

- TI 是否有支持 SoC 直连的无 MCU 方案？
