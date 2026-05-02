---
doc_id: uart
title: UART
page_type: concept
related_sources:
  - src-wevolver-article-uart-protocol-understanding-seri
  - src-ezurio-resources-blog-an-overview-of-uart-proto
  - src-ieeexplore-abstract-document-10673484
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, peripheral, protocol]
---

# UART

## 定义

UART（Universal Asynchronous Receiver/Transmitter，通用异步收发传输器）是一种异步串行通信协议/硬件接口，广泛用于设备间的点对点数据传输。UART 无需共享时钟信号，通过收发双方约定的波特率实现数据同步，是嵌入式调试、蓝牙模组、GPS 模块等场景的标准接口。

## 技术细节

核心特性：

- **异步通信**：无需时钟线，依靠收发双方预设的波特率同步
- **两线接口**：TX（发送）和 RX（接收），全双工
- **点对点**：通常为一对一通信（可通过多路复用扩展）
- **波特率**：常见 9600、115200、921600 等，双方必须一致
- **电平标准**：TTL（3.3V/5V）、RS-232（±3V~±15V）、RS-485（差分）

数据帧格式：
- **起始位**：1 位低电平
- **数据位**：5-9 位（通常 8 位）
- **校验位**：可选（奇校验/偶校验/无校验）
- **停止位**：1、1.5 或 2 位高电平

优缺点：
- 优势：协议简单、硬件成本低、广泛支持、适合长距离（RS-485）
- 劣势：无内置流控（需 RTS/CTS 硬件流控或 XON/XOFF 软件流控）、波特率误差容忍有限、无多主支持

应用场景：
- 嵌入式系统调试串口（Console）
- 蓝牙/WiFi/GPS 模组通信
- 工业控制（RS-485 总线）
- 与 PC 的串口通信

## 相关来源

- [[src-wevolver-article-uart-protocol-understanding-seri]] — UART 协议深入解析
- [[src-ezurio-resources-blog-an-overview-of-uart-proto]] — UART 协议概览
- [[src-ieeexplore-abstract-document-10673484]] — UART 相关学术研究

## 相关概念

- [[i2c]] — 同步多主多从总线
- [[spi]] — 同步全双工高速总线
- [[i3c]] — 现代传感器总线

## 相关实体

- [[qualcomm]] — 提供 UART 等接口的 SoC 平台
