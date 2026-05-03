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

## Summary

UART（Universal Asynchronous Receiver/Transmitter）是最基础、最广泛应用的异步串行通信协议之一。与I2C和SPI等同步协议不同，UART无需共享时钟信号，通信双方通过预先约定的波特率来同步数据传输。UART仅需TX（发送）和RX（接收）两根数据线即可实现全双工通信，这种简洁性使其成为调试端口、GPS模块、蓝牙模块、Wi-Fi模块等场景的首选接口。协议支持灵活的配置参数，包括波特率、数据位长度（5-9位）、停止位（1、1.5、2位）、校验方式（奇校验、偶校验、无校验）以及流控制（硬件RTS/CTS或软件XON/XOFF）。尽管速率通常低于SPI，但UART的异步特性和全双工能力使其在模块间通信、远程调试和数据采集等应用中不可替代。现代UART支持高达数Mbps的波特率，配合DMA可进一步提升吞吐量。

## Key Points

### UART核心特性

| 特性 | 说明 |
|------|------|
| 通信方式 | 异步串行，无需共享时钟 |
| 数据线 | TX（发送）、RX（接收） |
| 双工模式 | 全双工（可同时收发） |
| 连接拓扑 | 点对点（一对一） |
| 电压标准 | TTL（3.3V/5V）、RS-232、RS-485 |

### 数据帧格式

```
[起始位(1)] [数据位(5-9)] [校验位(0-1)] [停止位(1-2)]
```

| 字段 | 长度 | 说明 |
|------|------|------|
| 起始位 | 1位 | 低电平，标志帧开始 |
| 数据位 | 5-9位 | 实际传输数据（通常8位） |
| 校验位 | 0-1位 | 奇校验、偶校验或无校验 |
| 停止位 | 1-2位 | 高电平，标志帧结束 |

### 常用波特率

| 波特率 | 应用场景 |
|--------|----------|
| 9600 | 低速传感器、 legacy设备 |
| 115200 | 标准调试端口、大多数模块 |
| 460800 | 高速GPS、图像传输 |
| 921600 | 高速数据下载、固件烧录 |
| 3000000+ | 高速UART（部分现代SoC支持） |

### 流控制机制

1. **硬件流控（RTS/CTS）**
   - RTS（Request To Send）：请求发送
   - CTS（Clear To Send）：允许发送
   - 防止接收缓冲区溢出

2. **软件流控（XON/XOFF）**
   - XON（0x11）：继续发送
   - XOFF（0x13）：暂停发送
   - 无需额外硬件线

### 电平标准对比

| 标准 | 电压范围 | 传输距离 | 应用场景 |
|------|----------|----------|----------|
| TTL UART | 0V/3.3V或5V | <1米 | 板级通信 |
| RS-232 | ±3V~±15V | 15米 | 工业设备、PC串口 |
| RS-485 | 差分信号 | 1200米 | 工业总线、多节点网络 |

## Key Quotes

> "UART is one of the most fundamental and widely used asynchronous serial communication protocols in embedded systems."

> "Unlike synchronous protocols such as I2C and SPI, UART does not require a shared clock signal."

> "With just TX and RX data lines, UART enables full-duplex communication, making it the preferred interface for debug ports and module interconnections."

> "Modern UART interfaces can support baud rates of several Mbps, and when combined with DMA, throughput can be further enhanced."

## Related Pages

- [[uart]] — UART 协议概览
- [[i2c]] — I2C 协议
- [[spi]] — SPI 协议
- [[dma]] — DMA 与 UART 结合

## 开放问题

- 高速UART下的信号完整性问题
- 与现代USB、以太网协议的共存策略