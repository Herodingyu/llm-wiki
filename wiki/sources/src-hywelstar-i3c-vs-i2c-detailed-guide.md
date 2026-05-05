---
doc_id: src-hywelstar-i3c-vs-i2c-detailed-guide
title: I3C 协议详解：从 I2C 痛点到动态地址分配与 HDR-DDR 传输
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/hywelstar-i3c-vs-i2c-detailed-guide.md
domain: tech/peripheral
created: 2026-05-05
updated: 2026-05-05
tags: [peripheral]
---

## Summary

作者：HywelStar 做嵌入式开发的朋友，I2C 一定不陌生——两根线、简单好用，连接传感器、EEPROM、各种小外设，几乎成了低速通信的"万金油"。但后来发现有一个叫做 I3C（Improved Inter-Integrated Circuit，改进型集成电路总线）的东西，于是今天记录下。 这篇文章就来聊聊 I3C 是什么、为什么诞生、比 I2C 强在哪里，以及什么时候你真的应该考虑它。

## Key Points

### 1. 1. I2C 的痛点
I2C 诞生于上世纪 80 年代，距今已经 40 多年了。虽然它在大多数低速场景下依然够用，但随着 IoT、可穿戴、自动驾驶等场景的爆发，I2C 的短板开始凸显： - **速度慢**：I2C 常见速率包括 Standard-mode 100 kbps、Fast-mode 400 kbps、Fast-mode Plus 1 Mbps；High-speed mode 可到 3.4 Mbps，但实际在普

### 2. 2. I3C 登场：MIPI 联盟的答案
I3C 由 MIPI Alliance（手机行业接口联盟）主导制定，目标是在保持 I2C 兼容性的前提下，把速度、功耗、功能全面升级。它的设计初衷来自对手机、IoT、MEMS 传感器厂商的广泛需求调研。

### 3. 3. I3C vs I2C 区别对比
四大核心特征： **Push-Pull 驱动**：I2C 用开漏输出，上升沿靠上拉电阻，速度受限。I2C 主要依赖开漏输出和上拉电阻，上升沿受 RC 时间常数影响。I3C 在部分阶段仍保留开漏用于兼容和仲裁，但在 SDR 数据传输阶段使用推挽方式，因此可以在相近引脚数量下获得更高有效吞吐。

### 4. 4. I3C 时序
本章节可以参考：NXP Tech Days 2022 — https://www.nxp.com/docs/en/training-reference-material/TIP-1109-MIPI-I3C-CN-1.pdf

### 5. 4.1 I3C 读写时序
写操作和 I2C 几乎一模一样，唯一的区别在第 5 个字段：I2C 用 ACK/NACK 应答，I3C 换成了 **T-bit（奇偶校验位）**。T-bit 由发送方驱动，接收方通过它判断数据完整性，不再依赖对端拉低应答——这让总线驱动逻辑更简洁。

## Evidence

- Source: [原始文章](raw/tech/peripheral/hywelstar-i3c-vs-i2c-detailed-guide.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/hywelstar-i3c-vs-i2c-detailed-guide.md)
