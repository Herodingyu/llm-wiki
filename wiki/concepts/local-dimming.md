---
doc_id: local-dimming
title: 分区背光
page_type: concept
related_sources:
  - src-displaydaily-the-miniled-road-to-success
  - src-lincolntechsolutions-blog-full-array-local-dimming-mini-led-e
  - src-cgvis-publications-2012-sig-asia-briefpdf
  - src-displayspecifications-en-news-b606c11-1b8dc0
  - src-renesas-en-products-as3824
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, display, backlight]
---

# 分区背光

## 定义

分区背光（Local Dimming）是一种 LCD 显示技术，通过将背光源划分为多个独立控制的区域（分区），根据显示内容动态调节各区域的亮度，从而显著提升对比度和 HDR（高动态范围）表现。分区背光是 LCD 电视追赶 OLED 无限对比度的核心技术路径。

## 技术细节

主要技术方案：

- **1D 调光**：LED 按单行或单列组织，控制较粗糙，成本低
- **2D 调光**：创建背光分区网格，实现更精细控制，高对比度场景效果尤佳
- **全阵列调光（Full Array Local Dimming）**：LED 均匀分布在整个背板后方，分区数可达数百甚至数千

驱动方式：
- **PM（Passive Matrix，被动驱动）**：
  - 静态驱动：各 LED 独立控制，适合少分区
  - 动态扫描：行列顺序点亮，适合当前量产
- **AM（Active Matrix，主动驱动）**：
  - 各分区 LED 独立控制，精度更高
  - 与玻璃基板集成可降低成本，适合高分区 Mini LED

关键技术挑战：
- **光晕效应（Halo Effect）**：亮区光线溢入相邻暗区，高分区/高分辨率面板更明显
- **缓解策略**：
  - 光学结构：透镜准直、银行隔离
  - 减小光学孔径
  - CNN-based 调光算法：基于卷积神经网络根据场景内容动态调整调光值

与 Mini LED 的关系：
- Mini LED（100-200 微米）使高分区数成为可能
- 分区数从传统 LED 的几十区提升至数百甚至数千区
- 配合 Local Dimming 算法，HDR 效果接近 OLED

## 相关来源

- [[src-displaydaily-the-miniled-road-to-success]] — MiniLED 背光技术综述，含 Local Dimming 方案
- [[src-lincolntechsolutions-blog-full-array-local-dimming-mini-led-e]] — 全阵列分区背光与 Mini LED
- [[src-cgvis-publications-2012-sig-asia-briefpdf]] — Local Dimming 算法学术研究
- [[src-displayspecifications-en-news-b606c11-1b8dc0]] — 显示规格中的分区背光参数
- [[src-renesas-en-products-as3824]] — 分区背光驱动 IC 方案

## 相关概念

- [[mini-led]] — 实现高分区背光的关键 LED 技术
- [[led-driver]] — 驱动各分区 LED 的专用芯片
- [[pwm]] — 控制各分区 LED 亮度的核心技术
- [[oled]] — 无需背光的自发光技术，对比度更高

## 相关实体

- [[lg]] — OLED 电视领导者，QNED Mini LED 产品线
- [[tcl]] — Mini LED 电视主要推动者
- [[samsung]] — Neo QLED Mini LED 系列
- [[renesas]] — AS3824 分区背光驱动 IC
