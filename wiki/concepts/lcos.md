---
doc_id: lcos
title: LCOS
page_type: concept
related_sources:
  - src-en-meta-rayban-display-lcos-smart-glasses-s
  - src-woshipm-ai-6341694html
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, smart-glasses, display-technology]
---

# LCOS

## 定义

LCOS（Liquid Crystal on Silicon，硅基液晶）是一种反射式微型显示技术，将液晶层涂覆在硅基 CMOS 电路上。与传统透射式 LCD 不同，LCOS 利用硅基板的高反射率和精细电路实现高像素密度、高开口率和高分辨率，是 AR 眼镜、微型投影机和光通信领域的核心显示方案之一。

## 技术细节

工作原理：

- **硅基背板**：使用标准 CMOS 工艺制造驱动电路，像素尺寸可小至数微米
- **液晶层**：夹在硅基板和透明玻璃盖板之间
- **反射式调制**：入射光穿过液晶层后被硅基板反射，液晶分子旋转改变光的偏振态，从而调制像素亮度
- **彩色生成**：
  - 场序彩色（Field Sequential Color, FSC）：快速切换 RGB 三色光源，单面板实现全彩
  - 三面板方案：三个 LCOS 面板分别调制 RGB

技术优势：
- **高分辨率**：像素尺寸小，可达 3000+ PPI（每英寸像素数）
- **高开口率**：电路隐藏在反射层下方，开口率 > 90%
- **高对比度**：硅基板可集成复杂驱动电路，实现精确灰度控制
- **小尺寸**：适合 AR 眼镜等空间受限场景
- **成熟工艺**：基于标准 CMOS 和液晶工艺，供应链成熟

在 AR 中的应用：
- **Meta Ray-Ban**：采用 LCOS 微显示器配合光波导
- **光波导组合**：LCOS 作为图像源，通过光波导将图像导入人眼
- **亮度要求**：AR 场景需要高亮度以对抗环境光，LCOS 配合高亮度 LED 光源可达要求

竞争技术：
- **Micro OLED**：对比度更高、响应更快，但亮度受限
- **Micro LED**：亮度最高、寿命最长，但制造工艺复杂、成本高昂
- **DLP**：亮度高但体积较大，不适合轻薄 AR 眼镜

## 相关来源

- [[src-en-meta-rayban-display-lcos-smart-glasses-s]] — Meta Ray-Ban LCOS 显示技术分析
- [[src-woshipm-ai-6341694html]] — LCOS 在智能眼镜中的应用分析

## 相关概念

- [[ar]] — LCOS 是 AR 眼镜的主要显示技术之一
- [[waveguide]] — LCOS 与光波导协同工作实现 AR 显示
- [[micro-led]] — LCOS 的潜在替代技术
- [[oled]] — Micro OLED 与 LCOS 在微显示领域的竞争

## 相关实体

- [[meta]] — Meta Ray-Ban Display 采用 LCoS 微显示
- [[meta-ray-ban]] — LCoS + Lumus 波导方案
- [[apple-vision-pro]] — 采用 Micro-OLED（LCoS 的竞争技术）
