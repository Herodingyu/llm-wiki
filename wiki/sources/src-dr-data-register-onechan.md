---
doc_id: src-dr-data-register-onechan
title: 数据寄存器 DR 的本质：不是存储单元，而是数据搬运通道
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/dr-data-register-onechan.md
domain: tech/soc-pm
created: 2026-05-04
updated: 2026-05-04
tags: [soc-pm]
---

## Summary

> 来源：微信公众号「OneChan」 > 原文链接：https://mp.weixin.qq.com/s/L7w6thW5h2dCwyfB80VPmw > 记录时间：2026-05-04

## Key Points

### 1. 核心观点
**DR 根本不是一个"存储"数据的地方，它是 CPU 总线和外设内部硬件之间唯一的"数据搬运通道"**。对 DR 执行的任何一次读或写，本质上都是在**触发一次硬件级别的数据传输事务**。

### 2. DR 的物理本质：双缓冲结构的"透明窗口"
绝大多数现代 MCU 的外设 DR，在物理上对应着**两个完全独立的硬件寄存器**： - **TDR**（Transmit Data Register，发送数据寄存器） - **RDR**（Receive Data Register，接收数据寄存器）

### 3. DR 的核心工作机制：与移位寄存器的协同


### 4. 发送过程
1. 软件写 DR → 数据写入 TDR，TXE 立即清零 2. 硬件搬运 → 移位寄存器为空时，自动将 TDR 数据并行加载到移位寄存器 3. TXE 置位 → 表示 TDR 已空，可写入下一个数据

### 5. 接收过程
1. 串行接收 → RX 引脚检测到起始位，按波特率采样移入移位寄存器 2. 硬件搬运 → 一帧完整接收后，自动并行加载到 RDR 3. RXNE 置位 → 表示有数据待读取 4. 软件读 DR → CPU 读取 RDR，RXNE 立即清零

## Evidence

- Source: [原始文章](raw/tech/soc-pm/dr-data-register-onechan.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/dr-data-register-onechan.md)
