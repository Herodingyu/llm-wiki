---
doc_id: src-displaydaily-the-miniled-road-to-success
title: "The MiniLED Road to Success"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/tv-backlight/displaydaily-the-miniled-road-to-success.md
domain: tech/tv-backlight
created: 2026-05-02
updated: 2026-05-02
tags: [tv-backlight, mini-led, local-dimming, backlight]
---

# The MiniLED Road to Success

## 来源

- **原始文件**: raw/tech/tv-backlight/displaydaily-the-miniled-road-to-success.md
- **提取日期**: 2026-05-02

## 摘要

Display Daily发表的MiniLED技术综述文章，系统介绍了MiniLED背光技术的封装创新（POB/COB/COG）、色彩转换方法（荧光粉/量子点）、局部调光方案（1D/2D dimming）、驱动方式（PM/AM）以及光晕效应（halo effect）的 mitigation 策略。

## 关键要点

- MiniLED尺寸100-200微米，可实现比传统LED更精细的局部调光，HDR效果接近OLED
- 三种主要封装技术：POB（最成熟/成本最低）、COB（更亮更均匀/精度要求高）、COG（最薄/仍在发展）
- 色彩转换：荧光粉（稀土掺杂绿粉+窄谱红粉）和量子点（NTSC >110%）
- 驱动方式：PM（静态驱动/动态扫描，适合少分区）和AM（独立控制各LED，适合高分区）
- 光晕效应缓解：光学结构（透镜准直/银行隔离）、减小光学孔径、CNN-based调光算法

## 关键引用

- MiniLED尺寸100-200微米，可实现比传统LED更精细的局部调光，HDR效果接近OLED。
- 三种主要封装技术：POB（最成熟/成本最低）、COB（更亮更均匀/精度要求高）、COG（最薄/仍在发展）。
- 驱动方式分为PM（适合少分区）和AM（独立控制各LED，适合高分区）。
- 光晕效应可通过光学结构、减小光学孔径和CNN-based调光算法缓解。

## 技术细节

- **1D调光**: LED按单行或单列组织，控制较粗糙
- **2D调光**: 创建背光分区网格，实现更精细控制，高对比度场景效果尤佳
- **PM驱动**: 静态驱动（各LED独立控制）或动态扫描（行列顺序点亮），适合当前量产
- **AM驱动**: 各分区LED独立控制，精度更高，但复杂度和成本较高；与玻璃基板集成可降低成本
- **光晕效应成因**: 亮区光线溢入相邻暗区，高分区/高分辨率面板更明显
- **CNN算法**: 基于卷积神经网络的局部调光算法，根据场景内容动态调整调光值

## Related Pages

- [[mini-led]] — MiniLED 技术全面综述
- [[local-dimming]] — 局部调光方案（1D/2D dimming）
- [[led-driver]] — Mini LED 驱动 IC 技术
- [[oled]] — 与 Mini LED 竞争的显示技术
- [[micro-led]] — 比 Mini LED 更小的下一代 LED 技术
- [[tcl]] — Mini LED 电视主要推动者
- [[samsung]] — Neo QLED Mini LED 系列

## 开放问题

- AM驱动与玻璃基板集成的具体量产进展
- CNN-based调光算法的计算复杂度和硬件实现方案
- 量子点材料的温度稳定性和无重金属替代方案成熟度
