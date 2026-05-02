---
doc_id: tcon
title: TCON
page_type: concept
related_sources:
  - src-strategicmarketresearch-market-report-display-timing-controller
  - src-portersfiveforce-blogs-competitors-novatek
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, display, driver-ic]
---

# TCON

## 定义

TCON（Timing Controller，时序控制器/显示时序控制器）是液晶显示器（LCD）和 OLED 显示器中的核心控制芯片，负责接收来自 GPU/SoC 的视频信号（如 LVDS、eDP、MIPI DSI、HDMI 等），将其转换为驱动面板所需的时序信号（Gate 驱动信号和 Source 驱动信号），并控制图像数据的精确分配和显示时序。

## 技术细节

核心功能：

- **时序生成**：产生面板扫描所需的垂直同步（Vsync）、水平同步（Hsync）、数据使能（DE）等时序信号
- **数据分配**：将输入视频数据重新排列并分发到各列 Source Driver
- **Gate 控制**：控制行扫描顺序和时序，驱动 Gate Driver 逐行开启 TFT 开关
- **色彩处理**：Gamma 校正、色彩空间转换（如 RGB 到面板原生色域）
- **图像增强**：OverDrive（加速液晶响应）、FRC（帧率控制）、局部调光控制
- **电源管理**：生成面板所需的各种电压（AVDD、VGH、VGL、VCOM 等）

输入接口：
- LVDS（Low-Voltage Differential Signaling）
- eDP（Embedded DisplayPort）
- MIPI DSI（Display Serial Interface）
- HDMI / DP（用于电视和大屏显示器）

输出接口：
- TTL/RSDS（到 Source Driver）
- COG（Chip on Glass）接口
- Mini-LVDS / CEDS / CMI（到 Gate/Source Driver）

技术趋势：
- **集成化**：TCON 与 Source Driver、PMIC 集成到单一芯片（如 TCON-integrated Driver）
- **高刷新率**：支持 120Hz、240Hz 甚至 480Hz 面板
- **高分辨率**：8K 面板需要更高带宽和更复杂的时序控制
- **Local Dimming 控制**：TCON 集成调光算法，直接控制背光驱动 IC
- **OLEDDD（OLED Display Driver）**：针对 OLED 面板的专用 TCON + Driver 方案

主要厂商：
- 联咏科技（Novatek）：全球 TCON 市场领导者
- 瑞鼎科技（Raydium）、谱瑞科技（Parade）、硅创电子（Sitronix）
- 韩国：Samsung LSIT、MagnaChip
- 日本：THine Electronics

## 相关来源

- [[src-strategicmarketresearch-market-report-display-timing-controller]] — 显示时序控制器市场研究报告
- [[src-portersfiveforce-blogs-competitors-novatek]] — 联咏科技在 TCON 领域的竞争分析
- [[src-electronics-buyingguides-amlogic-s928x-android-tv-bo]] — Amlogic S928X Android TV Box 选购指南

## 相关概念

- [[oled]] — OLED TCON 与传统 LCD TCON 的技术差异
- [[mini-led]] — Mini LED 分区背光对 TCON 提出更高要求
- [[local-dimming]] — TCON 集成 Local Dimming 控制算法
- [[led-driver]] — TCON 与 LED 驱动 IC 协同工作

## 相关实体

- [[mediatek]] — Pentonic 800 SoC 集成 TCON 功能
- [[lg]] — OLED TCON 技术
- [[samsung]] — 显示驱动 IC 市场
