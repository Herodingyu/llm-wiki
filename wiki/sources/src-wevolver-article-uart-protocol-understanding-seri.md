---
doc_id: src-wevolver-article-uart-protocol-understanding-seri
title: "UART Protocol: Understanding Serial Communication for Engineers"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/wevolver-article-uart-protocol-understanding-seri.md
domain: tech/peripheral
created: 2026-05-02
updated: 2026-05-04
tags: [peripheral, uart, serial-communication]
---

# UART Protocol: Understanding Serial Communication for Engineers

## 来源

- **原始文件**: raw/tech/peripheral/wevolver-article-uart-protocol-understanding-seri.md
- **提取日期**: 2026-05-02

## Summary

本文是Wevolver发布的面向数字设计工程师、硬件工程师和电子工程专业学生的UART协议 comprehensive 指南，深入解析了通用异步收发传输器（UART）的工作原理、架构设计、数据帧格式、配置参数以及实际应用场景。UART作为最基础且广泛应用的异步串行通信协议，通过将并行数据转换为串行比特流实现设备间通信，无需共享时钟信号，仅依靠起始位和停止位实现收发同步。文章详细阐述了UART的核心架构模块（发送器、接收器、波特率发生器、FIFO缓冲区）、数据帧结构（起始位、数据位、校验位、停止位）、常见帧格式（8N1等）、过采样技术以及硬件接口扩展（TTL、RS-232、RS-485）。此外，文章还介绍了现代UART的高级特性如FIFO、DMA支持、流控制机制，并分析了UART在物联网、汽车电子和工业自动化领域的市场趋势，为工程师掌握串行通信技术提供了全面的理论基础和实践指导。

## Key Points

### UART核心架构模块

| 模块 | 功能 | 关键技术 |
|------|------|---------|
| 发送器（Transmitter） | 将并行数据转换为串行帧并发送 | 移位寄存器、帧格式化 |
| 接收器（Receiver） | 检测起始位并重建并行数据 | 过采样、位同步 |
| 波特率发生器 | 从系统时钟生成精确的位时序 | 可编程分频器 |
| FIFO缓冲区 | 减少CPU干预，支持突发传输 | 可配置触发阈值 |
| 错误检测逻辑 | 识别帧错误、校验错误、溢出错误 | 状态标志位 |

### UART数据帧结构

标准UART帧包含以下字段：

1. **起始位（Start Bit）**
   - 固定为逻辑低电平（0）
   - 标志新帧开始
   - 提供接收器时序参考

2. **数据位（Data Bits）**
   - 可配置5-9位，常用8位
   - 最低有效位（LSB）先传输
   - ASCII字符通常编码为8位帧

3. **校验位（Parity Bit）** - 可选
   - 偶校验（Even）：确保1的个数为偶数
   - 奇校验（Odd）：确保1的个数为奇数
   - 仅检测单比特错误，无纠错能力

4. **停止位（Stop Bits）**
   - 1或2个逻辑高电平（1）
   - 标志帧结束
   - 提供最小空闲间隔

### 常见帧格式与效率

| 格式 | 含义 | 每帧位数 | 协议效率 |
|------|------|---------|---------|
| 8N1 | 8数据位、无校验、1停止位 | 10位 | 80% |
| 7E1 | 7数据位、偶校验、1停止位 | 10位 | 70% |
| 8O2 | 8数据位、奇校验、2停止位 | 12位 | 66.7% |

### 波特率与过采样

- **标准波特率**：9600、19200、38400、57600、115200 bps等
- **过采样技术**：通常以8×或16×波特率采样
- **容差要求**：收发双方波特率误差通常需控制在±2-10%以内
- **采样点**：在每位中间时刻采样，最小化噪声和信号边沿影响

### 硬件接口标准

| 标准 | 信号类型 | 电压范围 | 传输距离 | 拓扑 |
|------|---------|---------|---------|------|
| TTL UART | 单端 | 0V/3.3V或5V | <1m | 点对点 |
| RS-232 | 单端反相 | ±3V~±15V | ~15m | 点对点 |
| RS-485 | 差分 | -7V~+12V | 1.2km | 多点总线 |

### 流控制机制

1. **硬件流控（RTS/CTS）**
   - RTS（请求发送）：接收方准备好接收数据
   - CTS（清除发送）：允许对方发送数据
   - 适用于高速或不可靠链路

2. **软件流控（XON/XOFF）**
   - XON（0x11）：继续传输
   - XOFF（0x13）：暂停传输
   - 无需额外硬件线路

### 现代UART高级特性

- **FIFO缓冲区**：支持16/32/64字节深度，减少中断频率
- **DMA支持**：实现高速数据传输无需CPU参与
- **自动波特率检测**：接收方自动识别发送方波特率
- **多处理器模式**：支持9位数据位进行地址唤醒
- **IrDA支持**：红外数据协会物理层编码

## Key Quotes

> "UART is a hardware communication peripheral that enables the transmission and reception of data between two digital devices by converting data between parallel and serial formats."

> "In an 8N1 configuration, 10 bits are transmitted for every 8 bits of data, resulting in approximately 80% protocol efficiency."

> "Most UART implementations use oversampling, typically at 8× or 16× the baud rate. Multiple samples are taken for each bit, and the final bit value is determined using averaging or majority voting."

> "RS-485 uses differential signaling to support multi-drop networks up to 1.2 km, making it ideal for industrial automation applications."

> "Modern UARTs often include FIFO buffers, interrupt support, and DMA, allowing microcontrollers to offload data transfer and achieve higher throughput."

## Related Pages

- [[uart]] — UART 协议深入解析
- [[i2c]] — 同步多主多从总线
- [[spi]] — 同步全双工高速总线
- [[i3c]] — 现代传感器总线
- [[dma]] — 常与 UART 配合使用

## 开放问题

- 高速UART与低功耗设计的平衡
- 在可靠性要求高的系统中的错误处理策略
- UART在工业现场总线中的替代方案比较
- 多通道UART芯片在物联网网关中的应用趋势
