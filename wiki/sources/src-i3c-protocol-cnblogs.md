---
doc_id: src-i3c-protocol-cnblogs
title: "I3C协议详解"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/I3C-protocol-cnblogs.md
domain: tech/peripheral
created: 2026-05-02
updated: 2026-05-02
tags: [peripheral, i3c, i2c, protocol]
---

# I3C协议详解

## 来源

- **原始文件**: raw/tech/peripheral/I3C-protocol-cnblogs.md
- **提取日期**: 2026-05-02

## 摘要

本文深入解析了I3C协议的通信机制，包括SDR动态地址分配、HDR高速模式以及与I2C设备的共存策略，适合嵌入式开发者学习I3C协议细节。

## 关键要点

- I3C为移动设备多传感器设计，解决I2C/SPI性能瓶颈
- SDR模式默认通信，与I2C高度相似
- 支持动态地址分配和带内中断
- 混合总线可同时挂载I2C和I3C设备

## 技术细节

- **SDR模式**: 默认单数据速率模式
- **HDR模式**: 高速数据传输，包括HDR-DDR、HDR-TSP/TSL、HDR-BT
- **角色定义**: Main Master、Secondary Master、Slave
- **兼容性**: I2C设备通过低通滤波器忽略I3C高速信号

## Related Pages

- [[i3c]] — I3C 协议通信机制详解
- [[i2c]] — I3C 兼容的上一代协议
- [[mipi-alliance]] — MIPI I3C 传感器规范
- [[synopsys]] — Synopsys I3C IP 解决方案
- [[ddr5]] — DDR5 中 I3C 的应用

## 开放问题

- HDR各种模式的具体应用场景
- I3C总线仲裁和错误处理机制
