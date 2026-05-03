---
doc_id: src-renesas-en-products-as3824
title: AS3824 - 16-Channel Local Dimming LED Backlight Controller
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/tv-backlight/renesas-en-products-as3824.md
domain: tech/tv-backlight
created: 2026-05-02
updated: 2026-05-02
tags: [tv-backlight, led-driver, local-dimming]
---

# AS3824 - 16-Channel Local Dimming LED Backlight Controller

## 来源

- **原始文件**: raw/tech/tv-backlight/renesas-en-products-as3824.md
- **提取日期**: 2026-05-02

## 摘要

Renesas AS3824是一款16通道LED电视背光控制器，支持局部调光（local dimming），可提升画质并实现20%-30%的功耗节省。适用于高清（HD）、超高清（UHD/4K）电视以及HDR显示器。

## 关键要点

- 16通道独立LED背光控制，每通道配备12位PWM发生器
- 全局10位DAC设定LED电流（精度±0.5%），16个独立8位DAC用于帧内电流微调
- 支持外部同步信号，无VLED/ILED限制（控制器不暴露于高压/大电流）
- 相比全局背光控制器可实现额外的系统功耗节省

## 关键引用

- "Renesas AS3824 is a 16-channel LED TV backlight controller supporting local dimming for improved picture quality and 20%-30% power savings."
- "Each channel features independent 12-bit PWM generation with global 10-bit DAC for LED current setting (±0.5% accuracy)."
- "The controller avoids exposure to high voltage/current, with no VLED/ILED limitations."
- "Local dimming enables significant system power savings compared to global backlight controllers."

## 技术细节

- **通道数**: 16通道
- **PWM分辨率**: 12位（每通道独立）
- **电流设定**: 10位全局DAC + 8位独立DAC
- **输入电压**: 4.5V - 5.5V
- **接口**: SPI
- **封装**: QFN-48 (7mm×7mm) / LQFP-44 (10mm×10mm)
- **保护功能**: 故障开关（Fault Switch）
- **应用场景**: HD/UHD电视、HDR显示器

## Related Pages

- [[led-driver]] — Renesas AS3824 LED 驱动产品
- [[local-dimming]] — 分区背光驱动 IC 方案
- [[mini-led]] — Mini LED 背光驱动需求
- [[renesas]] — 瑞萨电子显示背光解决方案
- [[spi]] — AS3824 使用 SPI 接口通信

## 开放问题

- 具体的PWM频率范围未在摘要中提及
- 与竞品（如TI、Macroblock）的性能对比数据不足
