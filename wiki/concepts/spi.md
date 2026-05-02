---
doc_id: spi
title: SPI
page_type: concept
related_sources:
  - src-wevolver-article-how-does-spi-work-a-comprehensiv
  - src-deepbluembedded-how-to-receive-spi-with-stm32-dma-interr
  - src-renesas-en-products-as3824
  - src-blog-chinamaoge-article-details-143466179
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, peripheral, protocol]
---

# SPI

## 定义

SPI（Serial Peripheral Interface）是 Motorola 开发的同步串行通信协议，采用主从架构和全双工通信。与 I2C 相比，SPI 使用更多引脚（通常 4 根）但提供更高的传输速率和更简单的协议，广泛应用于存储器、显示屏、传感器等需要高速数据传输的外设。

## 技术细节

核心特性：

- **四线接口**：
  - SCLK（Serial Clock）：时钟信号，由主设备产生
  - MOSI（Master Out Slave In）：主设备发送数据
  - MISO（Master In Slave Out）：从设备发送数据
  - CS/SS（Chip Select）：从设备片选，低电平有效
- **全双工通信**：可同时发送和接收数据
- **推挽驱动**：CMOS 推挽输出，上升/下降沿速度快
- **高传输速率**：通常可达几十 MHz（取决于设备和 PCB 设计）
- **无地址机制**：通过独立的 CS 线选择从设备

通信模式（CPOL/CPHA 组合）：
- **Mode 0**：CPOL=0, CPHA=0 — 时钟空闲低，数据在上升沿采样
- **Mode 1**：CPOL=0, CPHA=1 — 时钟空闲低，数据在下降沿采样
- **Mode 2**：CPOL=1, CPHA=0 — 时钟空闲高，数据在下降沿采样
- **Mode 3**：CPOL=1, CPHA=1 — 时钟空闲高，数据在上升沿采样

优缺点：
- 优势：速度快、协议简单、全双工、无地址冲突
- 劣势：引脚数随从设备增加（每个从设备需独立 CS）、无标准流控、传输距离短

## 相关来源

- [[src-wevolver-article-how-does-spi-work-a-comprehensiv]] — SPI 工作原理全面解析
- [[src-deepbluembedded-how-to-receive-spi-with-stm32-dma-interr]] — STM32 SPI + DMA 接收实现
- [[src-renesas-en-products-as3824]] — LED 驱动器中 SPI 接口的应用
- [[src-blog-chinamaoge-article-details-143466179]] — SPI 在嵌入式系统中的应用
- [[src-design-reuse-blog-56212-accelerating-your-development]] — 多协议 SerDes IP 简化 SoC I/O 设计

## 相关概念

- [[i2c]] — 引脚更少但速度较慢的两线总线
- [[i3c]] — 在某些场景下可替代 SPI 的高速总线
- [[uart]] — 异步串行通信协议
- [[dma]] — 常与 SPI 配合使用以实现高效数据传输

## 相关实体

- [[synopsys]] — 提供 SPI 等接口 IP
- [[renesas]] — LED 驱动器中 SPI 接口应用
