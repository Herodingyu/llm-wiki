---
doc_id: src-处理器间通信-mailbox与mutex
title: 处理器间通信：MailBox与MUTEX
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/处理器间通信：MailBox与MUTEX.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文介绍了多处理器系统（异构SoC/FPGA）中两种核心的处理器间通信（IPC）机制：MailBox和MUTEX。MailBox基于FIFO消息传递实现处理器间双向通信，MUTEX通过互斥锁保护共享资源（如内存、UART）防止并发访问冲突。文章以Zynq+MicroBlaze为例，详细展示了在Vivado中搭建硬件框图、配置AXI接口、编写软件应用程序的完整流程，包括BSP提供的XMbox/XMutex API使用、中断处理、调试配置等实践细节。

## Key Points

### 1. IPC 背景与角色分工

多处理器系统（硬核+软核组合）需要在不同内核间划分任务，同时安全可靠地通信和共享系统资源。MailBox和MUTEX在IPC中扮演不同角色：

| 机制 | 功能 | 核心特性 |
|------|------|----------|
| **MailBox** | 基于FIFO的消息传递 | 支持双向通信，可配置FIFO深度，支持中断通知 |
| **MUTEX** | 互斥锁保护共享资源 | 防止并发访问冲突，支持1-8个处理器共享32个互斥体 |

### 2. MailBox 实现要点

MailBox在两个处理器之间通过AXI接口连接，使用FIFO传输消息：
- **FIFO深度可配置**：通过重复使用mailbox IP来配置
- **中断机制**：能够在消息排队时向相关处理器生成中断
- **API函数**：`XMbox_Read` / `XMbox_ReadBlocking` / `XMbox_Write` / `XMbox_WriteBlocking`
- **数据对齐要求**：发送或接收的字节数必须是4的倍数
- **典型应用**：Zynq PS A9内核与PL MicroBlaze之间的状态消息传递

### 3. MUTEX 实现要点

MUTEX解决多处理器共享公共资源时的竞争条件问题：
- **竞争条件**：测试和设置标志之间存在时间窗口，可能导致双方同时认为资源空闲
- **原子操作**：Xilinx互斥体将测试和设置合并为单个操作，写入互斥体时若空闲则自动分配
- **CPU ID保护**：防止处理器无意中或恶意地解锁互斥体
- **可选硬件保护**：AXI HWID字段用于锁定和解锁互斥体
- **API函数**：`XMutex_Lock()`（阻塞）/ `XMutex_Trylock()`（非阻塞）
- **用户寄存器**：每个互斥体有可选32位寄存器用于共享配置数据

### 4. 硬件设计流程（Zynq + MicroBlaze）

1. 添加Zynq处理系统IP并运行块自动化
2. 添加MicroBlaze IP，选择微控制器预设
3. 从Xilinx IP目录添加MailBox和MUTEX
4. 使用连接自动化向导连接两个处理器系统的AXI接口
5. 构建硬件并导出到SDK编写软件应用程序

## Key Quotes

> 异构SoC（System on Chip）处理器是一种集成多个不同架构处理单元核心的SoC处理器。例如，TI的OMAP-L138（DSP C674x + ARM9）和AM5708（DSP C66x + ARM Cortex-A15）SoC处理器，以及Xilinx的ZYNQ（ARM Cortex-A9 + Artix-7/Kintex-7可编程逻辑架构）SoC处理器等。

> 解决竞争条件的方法是确保测试和设置操作合并到一个操作中，也就是说，如果我们测试互斥标记，并且它是自由的，那么它就会被设置。

> 为了防止处理器无意中或恶意地解锁互斥体，使用CPU ID。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/处理器间通信：MailBox与MUTEX.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/处理器间通信：MailBox与MUTEX.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/处理器间通信：MailBox与MUTEX.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/处理器间通信：MailBox与MUTEX.md|原始文章]]
