---
doc_id: interrupt
title: 中断（Interrupt）
page_type: concept
related_sources:
  - src-linux-interrupt-evolution
  - src-softirq-cpu-overhead
  - src-arm-soc-bootflow-intro
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, bsp, interrupt]
---

# 中断（Interrupt）

## 定义

中断是 CPU 对外部或内部事件的异步响应机制。当事件发生时，CPU 暂停当前执行，转去执行中断处理程序，处理完成后返回原程序继续执行。

## 中断类型

| 类型 | 触发源 | 特点 |
|------|--------|------|
| 硬件中断 | 外设（网卡、按键、定时器） | 异步，外部触发 |
| 软件中断 | 内核触发（softirq、tasklet） | 同步，内部触发 |
| 异常 | CPU 内部（缺页、除零） | 同步，指令执行触发 |

## Linux 中断处理演进

### 传统中断处理
- 所有处理在中断上下文中完成
- 硬中断处理时间长，影响系统响应性

### 上下半部机制
- **上半部（Top Half）**：硬中断，快速响应，只保存数据
- **下半部（Bottom Half）**：延迟处理，包括：
  - softirq：静态定义，高效
  - tasklet：基于 softirq，动态注册
  - workqueue：进程上下文，可睡眠
  - threaded irq：内核线程处理

### Threaded IRQ
- 引入时间：约 2005 年后
- 硬中断只负责 ack 和唤醒线程
- 内核线程执行耗时处理
- 优点：减少硬中断时间，提高系统响应性

## 软中断（Softirq）

### 开销测量
- 每次软中断约 3.4us CPU 时间
- 包含上下文切换和内核执行
- 网络 IO 密集型系统软中断频繁

### 优化
- RPS（Receive Packet Steering）：多核分发接收处理
- XPS（Transmit Packet Steering）：多核分发发送处理
- DPDK：绕过内核协议栈

## ARM 中断控制器

| 版本 | 特点 |
|------|------|
| GICv1/v2 | 基本中断分发 |
| GICv3 | 支持更多中断，安全扩展 |
| GICv4 | 虚拟化支持 |

## 相关来源

- [[src-linux-interrupt-evolution]] — Linux 中断处理演进
- [[src-softirq-cpu-overhead]] — 软中断 CPU 开销分析
