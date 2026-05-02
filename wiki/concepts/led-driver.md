---
doc_id: led-driver
title: LED 驱动芯片
page_type: concept
related_sources:
  - src-asianda-top-10-mini-led-driver-chip-manufacturer
  - src-kinet-ic-display-power-led-backlight-drivers-ics
  - src-renesas-en-products-as3824
  - src-trendforce-news-2024-08-29-2024-mini-led-backlight
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, display, driver-ic]
---

# LED 驱动芯片

## 定义

LED 驱动芯片（LED Driver IC）是用于控制 LED 电流和亮度的专用集成电路。LED 需要恒流驱动以保持亮度和色温稳定，LED 驱动芯片通过内部电流源、PWM 调光模块和保护电路，为从单颗 LED 到数千颗 LED 阵列提供精确的驱动和控制。

## 技术细节

核心功能：

- **恒流输出**：提供稳定的 LED 驱动电流，不受输入电压波动影响
- **PWM 调光**：通过调节 PWM 占空比实现亮度控制
- **多通道输出**：单芯片支持数十甚至数百路独立输出（如 48 通道、96 通道）
- **通信接口**：通过 I2C、SPI 或专用协议接收主控器的亮度配置
- **保护功能**：过压、过流、过温、开路/短路保护

在显示背光中的应用：
- **直下式背光**：驱动背板上的 LED 阵列，配合 Local Dimming 算法
- **侧入式背光**：驱动灯条上的 LED，通过导光板实现面光源
- **Mini LED 驱动**：支持更多分区、更高精度的调光，通道数可达数百
- **AM 驱动集成**：部分方案将驱动电路与 TFT 集成到玻璃基板

主要厂商：
- 国际：TI、Renesas、ROHM、ON Semi、Maxim
- 国内：聚积科技、富满微、明微电子、士兰微、晶丰明源

技术趋势：
- 通道数持续增加以支持更多分区
- 集成度提升（驱动 + 电源 + 通信）
- 支持更高 PWM 频率以消除闪烁
- 与 AI 调光算法协同优化

## 相关来源

- [[src-asianda-top-10-mini-led-driver-chip-manufacturer]] — 全球 Mini LED 驱动芯片厂商排名
- [[src-kinet-ic-display-power-led-backlight-drivers-ics]] — LED 背光驱动 IC 技术详解
- [[src-renesas-en-products-as3824]] — Renesas LED 驱动产品方案
- [[src-trendforce-news-2024-08-29-2024-mini-led-backlight]] — Mini LED 背光驱动市场分析
- [[src-ti-lit-pdf-slvaef3]] — TI LED 背光驱动技术文档
- [[src-st-content-ccc-resource-training-technical]] — STMicroelectronics LED 驱动培训资料

## 相关概念

- [[mini-led]] — 需要专用驱动芯片支持
- [[local-dimming]] — 驱动芯片配合实现分区调光
- [[pwm]] — LED 亮度调节的核心技术
- [[i2c]] — 常用的 LED 驱动芯片配置接口
- [[spi]] — 高速 LED 驱动芯片配置接口

## 相关实体

- [[renesas]] — AS3824 LED 驱动产品
- [[tcl]] — Mini LED 电视驱动方案
- [[samsung]] — Neo QLED 驱动技术
