---
doc_id: src-deepbluembedded-how-to-receive-spi-with-stm32-dma-interr
title: "How To Receive SPI Data With STM32 DMA / Interrupt / Polling Modes"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/deepbluembedded-how-to-receive-spi-with-stm32-dma-interr.md
domain: tech/peripheral
created: 2026-05-02
updated: 2026-05-02
tags: [peripheral, spi, dma, stm32]
---

# How To Receive SPI Data With STM32 DMA / Interrupt / Polling Modes

## 来源

- **原始文件**: raw/tech/peripheral/deepbluembedded-how-to-receive-spi-with-stm32-dma-interr.md
- **提取日期**: 2026-05-02

## 摘要

本文详细介绍了在STM32微控制器上使用SPI接口的三种数据接收模式：DMA、中断和轮询，提供了实用的代码示例和配置指南。

## 关键要点

- DMA模式适合大批量数据传输，CPU开销最小
- 中断模式适合中等数据量，响应及时
- 轮询模式简单直接，适合小数据量和调试场景
- STM32 HAL库提供了统一的SPI API接口

## 技术细节

- **DMA模式配置**: SPI + DMA通道配置、缓冲区管理
- **中断处理**: TXE/RXNE标志位处理、中断优先级设置
- **轮询实现**: 直接查询状态寄存器等待数据就绪
- **性能比较**: DMA > 中断 > 轮询（吞吐量角度）

## Related Pages

- [[spi]] — SPI 接口工作原理
- [[dma]] — DMA 直接内存访问机制
- [[i2c]] — 另一种常见外设总线
- [[uart]] — 异步串行通信协议

## 开放问题

- 在高速SPI场景下DMA与CPU缓存一致性问题
- 多从机配置下的SPI DMA管理策略
