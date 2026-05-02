---
doc_id: src-i3c-dynamic-address-csdn
title: "I3C协议详解（含动态地址分配实战）"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/I3C-dynamic-address-csdn.md
domain: tech/peripheral
created: 2026-05-02
updated: 2026-05-02
tags: [peripheral, i3c, i2c, embedded-systems]
---

# I3C协议详解（含动态地址分配实战）

## 来源

- **原始文件**: raw/tech/peripheral/I3C-dynamic-address-csdn.md
- **提取日期**: 2026-05-02

## 摘要

本文详细讲解了I3C协议的工作原理，重点介绍了SDR动态地址分配机制和I3C与I2C设备的共存方式，包含实战示例。

## 关键要点

- I3C最初为移动设备多传感器单一接口而设计
- SDR模式是I3C默认通信模式，与I2C高度相似
- 动态地址分配是I3C的核心特性之一
- I2C和I3C设备可在同一总线共存

## 技术细节

- **SDR模式**: Single Data Rate，单一数据传输模式
- **HDR模式**: High Data Rate，高速数据传输模式
- **角色定义**: Main Master、Secondary Master、Current Master
- **地址分配**: 运行时动态分配，无需硬件配置

## 开放问题

- 动态地址分配的时序和可靠性验证
- 混合总线中I2C设备对I3C性能的影响
