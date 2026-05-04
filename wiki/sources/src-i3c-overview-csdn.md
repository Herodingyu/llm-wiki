---
doc_id: src-i3c-overview-csdn
title: I3C —— 未来传感器的"全能通信王"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/I3C-overview-csdn.md
domain: tech/peripheral
created: 2026-05-04
updated: 2026-05-04
tags: [peripheral]
---

## Summary

> 来源: CSDN (blog.csdn.net/weixin_44650422) > 原URL: https://blog.csdn.net/weixin_44650422/article/details/146899955 > 收集时间: 2026-05-01

## Key Points

### 1. 一、I3C是什么？
**一句话秒懂**：I3C就像通信协议界的"瑞士军刀"：把I2C的省线和SPI的快结合起来，再加点超能力（动态寻址、热插拔），专治各种传感器网络的"不服"！ **基础概念**： - **中文名**：改进型集成电路总线（Improved Inter-Integrated Circuit）

### 2. 二、硬件接线：如何升级"老式电话线"？
**接线规则（两根线走天下）**： - **必选线路**： - **SCL**：时钟线（开漏输出，需上拉电阻） - **SDA**：数据线（支持推挽输出，提升速度） - **可选附加**：HDR模式需用SPI-like的专用时序

### 3. 三、I3C vs I2C vs SPI：核心对比
| 特性 | I3C | I2C | SPI | |------|-----|-----|-----| | 信号线数 | 2（SCL, SDA） | 2（SCL, SDA） | 4+（SCLK, MOSI, MISO, CS） |

### 4. 四、核心技术特性


### 5. 1. 多速率工作模式
| 模式 | 全称 | 速率 | 特点 | |------|------|------|------| | SDR | Single Data Rate | 最高12.5 Mbps | 基础模式，兼容I2C时序 |

## Evidence

- Source: [原始文章](raw/tech/peripheral/I3C-overview-csdn.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/I3C-overview-csdn.md)
