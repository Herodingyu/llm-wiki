---
doc_id: src-linux-interrupt-evolution
title: Linux 中断处理演进
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/【深度】韦东山：一文看懂linux对中断处理的前世今生(附免费视频).md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-03
tags: [bsp, linux, interrupt, threaded-irq]
---

## Summary

本文系统梳理了 Linux 中断处理的演进历程。Linux 中有硬件中断（hard irq）和软件中断（soft irq）两种类型。硬件中断的处理原则是：不能嵌套，越快越好。文章详细介绍了 Linux 对中断的扩展——引入 threaded irq（使用内核线程处理中断），以及硬件中断和软件中断的区别和处理时机。当某个中断要耗费很多时间来处理时，可将其拆分为上半部（紧急）和下半部（不紧急），下半部可通过 tasklet 或 workqueue 实现。这种设计大大提升了系统的响应性和并发处理能力。

## Key Points

### 1. 硬件中断处理原则
| 原则 | 原因 |
|------|------|
| 不能嵌套 | 避免中断风暴导致栈溢出 |
| 越快越好 | 减少中断延迟，尽早让其他中断被处理 |

### 2. Linux 中断类型
| 类型 | 触发方式 | 处理时机 | 典型应用 |
|------|---------|---------|---------|
| 硬件中断 (hard irq) | 由硬件产生 | 立即处理 | 按键、网卡中断 |
| 软件中断 (soft irq) | 由软件设置 flag | 处理完硬件中断后 | tasklet 实现 |

### 3. 软件中断机制
- **触发**: 由软件设置 flag（`raise_softirq` 设置标记位）
- **处理时机**: 在处理完硬件中断后处理
- **特点**: 不是那么十万火急，可以稍后再处理
- **定时器中断**: 每 10ms 发生一次，为处理软件中断提供机会

### 4. 中断拆分：上半部与下半部
| 部分 | 特点 | 实现方式 |
|------|------|---------|
| 上半部（top half） | 紧急、快速响应 | 硬中断处理函数 |
| 下半部（bottom half） | 不紧急、可延后 | tasklet 或 workqueue |

**为什么要拆分？**
- 中断处理太慢会阻塞其他中断
- 拆分后紧急事项立即处理，不紧急事项延后处理
- 处理下半部时中断是打开的，系统响应性更好

### 5. 下半部实现方式
| 方式 | 适用场景 | 特点 |
|------|---------|------|
| tasklet | 耗时不太长，处理简单 | 使用软件中断实现，同类型 tasklet 不会并行 |
| workqueue | 耗时较长，可能睡眠 | 内核线程处理，可阻塞 |
| threaded irq | 约 2005 年后引入 | 专门的内核线程处理中断 |

## Evidence

- Linux 15 年来中断系统变化不大
- 定时器中断每 10ms 发生一次
- 处理完硬件中断后再处理软件中断

## Open Questions

- Threaded IRQ 与 workqueue、tasklet 的区别
- 实时 Linux（PREEMPT_RT）中的中断处理改进

## Key Quotes

> "最核心的函数是raise_softirq，简单地理解就是设置softirq_veq[nr]的标记位："

> "所以，为了防止这种情况发生，也是为了简单化中断的处理，在Linux系统上中断无法嵌套：即当前中断A没处理完之前，不会响应另一个中断B(即使它的优先级更高)"

> "妈妈在家中照顾小孩时，门铃响起，她开门取快递：这就是中断的处理。她取个快递敢花上半天吗？不怕小孩出意外吗？"

## Related Pages

- [[interrupt]]
- [[linux-kernel]]
- [[threaded-irq]]
- [[softirq]]
