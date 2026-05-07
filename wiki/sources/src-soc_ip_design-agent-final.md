---
doc_id: src-soc_ip_design-agent-final
title: SoC 外设 IP 架构设计手册
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/soc_ip_design.agent.final.md
domain: tech/peripheral
created: 2026-05-06
updated: 2026-05-06
tags: [peripheral]
---

## Summary

> **文档版本**: v1.0 > **适用范围**: 嵌入式 SoC 数字外设 IP 设计与软件开发 > **总线架构**: ARM AMBA AXI4/AHB Lite/APB4

## Key Points

### 1. 1.1 系统互联拓扑


### 2. 1.1.1 总线矩阵架构：CPU Core + AXI Crossbar + AHB/APB Bridge 的分层总线结构
本 SoC 采用三级分层总线架构，从高到低依次为 AXI4 交叉开关（Crossbar）、AHB Lite 矩阵、APB 总线桥接层。该分层设计的核心考量在于性能与面积的权衡：CPU 指令/数据取指和 DMA 大块数据传输对带宽与延迟敏感，因此挂载于 AXI4 总线层；而外设寄存器访问以单字读写为主、吞吐量低，降级到 APB 总线层可显著降低门数与功耗。

### 3. 1.1.2 各 IP 在总线层级中的位置：DMA 挂 AXI Master，外设挂 APB Slave
在总线层级定位上，各 IP 的接口属性决定其挂载位置。DMA 控制器具备双重接口：其 AXI4 Master 端口直接连接至 AXI Crossbar 的 Master 端口，支持突发（Burst）传输以完成存储器到存储器、存储器到外设的数据搬运；其 APB Slave 配置端口则通过 AHB-to-APB Bridge 接入，供 CPU 配置通道参数、源/目的地址与传输长度。其余 12 个 IP

### 4. 1.1.3 多主多从互连关系：CPU、DMA 作为 Master；外设 IP 作为 Slave 的访问矩阵
系统存在两类总线主设备（Bus Master）和三类从设备（Bus Slave）。主设备包括 CPU Core（发起指令与数据访问）与 DMA 控制器（发起外设数据搬运访问）。从设备分为三组：AXI 层的片内 SRAM 与扩展端口、AHB 层的 APB 桥接器、APB 层的 13 个外设寄存器接口。

### 5. 1.2 地址空间规划


## Evidence

- Source: [原始文章](raw/tech/peripheral/soc_ip_design.agent.final.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/soc_ip_design.agent.final.md)
