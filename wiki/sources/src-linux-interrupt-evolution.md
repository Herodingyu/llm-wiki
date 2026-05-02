---
doc_id: src-linux-interrupt-evolution
title: Linux 中断处理演进
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/【深度】韦东山：一文看懂linux对中断处理的前世今生(附免费视频).md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, interrupt, threaded-irq]
---

## Summary

本文系统梳理了 Linux 中断处理的演进历程。Linux 中有硬件中断（hard irq）和软件中断（soft irq）。硬件中断的处理原则是：不能嵌套，越快越好。文章详细介绍了 Linux 对中断的扩展（引入 threaded irq，使用内核线程处理中断），以及硬件中断和软件中断的区别和处理时机。

## Key Points

### 1. 硬件中断处理原则
- **不能嵌套**: 避免中断风暴
- **越快越好**: 减少中断延迟

### 2. Linux 中断扩展
- **硬件中断 (hard irq)**: 由硬件产生，如按键、网卡中断
- **软件中断 (soft irq)**: 由软件设置 flag 触发
- **Threaded irq**: 使用内核线程处理中断，减轻硬中断负担

### 3. 软件中断
- **触发时机**: 由软件设置 flag（设置为 1 表示发生）
- **处理时机**: 在处理完硬件中断后处理
- **特点**: 不是那么十万火急，可以稍后再处理

### 4. 中断处理流程
```
硬件中断 → 硬中断处理函数（快速） → 软件中断处理（稍后）
```

### 5. Threaded IRQ
- 引入时间：约 2005 年后
- 核心思想：将中断处理分为两部分
  - 上半部（top half）：硬中断，快速响应
  - 下半部（bottom half）：内核线程，处理耗时操作
- 优点：减少硬中断执行时间，提高系统响应性

## Evidence

- Linux 15 年来中断系统变化不大
- 定时器中断每 10ms 发生一次
- 处理完硬件中断后再处理软件中断

## Open Questions

- Threaded IRQ 与 workqueue、tasklet 的区别
- 实时 Linux（PREEMPT_RT）中的中断处理改进

## Related Pages

- [[interrupt]]
- [[linux-kernel]]
- [[threaded-irq]]
- [[softirq]]
