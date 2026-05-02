---
doc_id: src-softirq-cpu-overhead
title: 软中断 CPU 开销分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/软中断会吃掉你多少CPU？.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, softirq, performance]
---

## Summary

本文分析了 Linux 软中断（softirq）的 CPU 开销。软中断配合硬中断处理网络 IO，硬中断只负责收包，软中断负责协议栈处理。通过 top 和 vmstat 工具测量，在 16 核物理机上，每秒约 56000 次软中断，每次软中断约消耗 3.4us CPU 时间。软中断开销包含上下文切换和内核执行两部分。

## Key Points

### 1. 软中断诞生原因
- 硬中断优先级高，如果处理大量网络 IO，会占用过多 CPU
- 软中断优先级较低，负责协议栈处理
- 硬中断收包 → 软中断处理（驱动层 → 网络协议栈 → socket buffer）

### 2. 软中断开销测量
- **top 命令**: 查看 si（soft interrupt）列，如 1.2%
- **vmstat**: 查看每秒中断次数，如 56000 次/秒
- **计算公式**: 每个软中断耗时 = 总耗时 / (总次数 / 核数)

### 3. 测量结果
- 16 核物理机
- 每秒约 56000 次软中断
- CPU 占用约 1.2%（每核约 12ms）
- **每次软中断约 3.4us**

### 4. 开销组成
- 上下文切换开销
- 软中断内核执行开销
- 与系统调用、进程上下文切换对比

## Evidence

```
top - 19:51:24
Cpu(s):  7.1%us, 1.4%sy, 0.0%ni, 90.1%id, 0.1%wa, 0.2%hi, 1.2%si

vmstat 1
57402 interrupts/sec
```

## Open Questions

- 如何优化软中断处理（如 RPS/XPS）
- DPDK 绕过内核协议栈对软中断的影响

## Related Pages

- [[softirq]]
- [[network-performance]]
- [[interrupt]]
- [[dpdk]]
