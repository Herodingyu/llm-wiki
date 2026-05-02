---
doc_id: src-ezurio-resources-blog-an-overview-of-uart-proto
title: "An Overview of UART Protocols | Ezurio"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/ezurio-resources-blog-an-overview-of-uart-proto.md
domain: tech/peripheral
created: 2026-05-02
updated: 2026-05-02
tags: [peripheral, uart, serial-communication]
---

# An Overview of UART Protocols | Ezurio

## 来源

- **原始文件**: raw/tech/peripheral/ezurio-resources-blog-an-overview-of-uart-proto.md
- **提取日期**: 2026-05-02

## 摘要

本文全面概述了UART协议，介绍了串行通信的基本原理、UART的工作机制、配置参数以及在实际工程中的应用。

## 关键要点

- UART是异步串行通信协议，无需共享时钟
- 支持全双工通信
- 配置灵活：波特率、数据位、停止位、校验位
- 广泛应用于调试、模块间通信、GPS等场景

## 技术细节

- **信号线**: TX、RX、可选的RTS/CTS流控
- **数据格式**: 起始位 + 数据位 + 校验位 + 停止位
- **波特率**: 常见9600、115200、921600等
- **流控制**: 硬件(RTS/CTS)和软件(XON/XOFF)

## Related Pages

- [[uart]] — UART 协议概览
- [[i2c]] — I2C 协议
- [[spi]] — SPI 协议
- [[dma]] — DMA 与 UART 结合

## 开放问题

- 高速UART下的信号完整性问题
- 与现代USB、以太网协议的共存策略
