---
doc_id: src-总结dwc-lpddr-mc的多bank-的仲裁-arbitration-和重排序-reorderi
title: 总结DWC LPDDR MC的多Bank 的仲裁（Arbitration）和重排序（Reordering）机制
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/总结DWC LPDDR MC的多Bank 的仲裁（Arbitration）和重排序（Reordering）机制.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

19 人赞同了该文章 针对 **[DesignWare](https://zhida.zhihu.com/search?content_id=256104565&content_type=Article&match_order=1&q=DesignWare&zhida_source=entity) ® Cores [LPDDR5](https://zhida.zhihu.com/search?content_id=256104565&content_type=Article&match_order=1&q=LPDDR5&zhida_source=entity) /4/4X 内存控制器** 在 

## Key Points

### 1. 一、核心框架：多层级调度架构
DesignWare 控制器的调度架构通常为 **3 级流水线** ： 1. 1.**事务层（Transaction Layer）** 接收来自 SoC 主机的 AXI/CHI 总线请求，将请求按 Bank 分组存储至 **分片队列（Bank-Sliced Queues）** ，每个 Bank 拥有独立队列以支持并行处理。

### 2. 二、仲裁机制（Arbitration）：QoS 与带宽分配


### 3. 1\. 基础策略
- **Bank 并行性优先** ：优先调度不同 Bank 的请求以最大化 Bank 并发访问（避免 Bank 冲突）。 - **时间公平性（Round-Robin）** ：在无冲突条件下，按循环顺序服务各 Bank 队列，确保公平性。

### 4. 2\. QoS 优先级
- **带宽与延迟分配** ： 控制器支持配置每个 AXI 端口的优先级（如 0-3 级）： - 高优先级端口（如 GPU 显示控制器）可占用 50% 以上的带宽，并设置 **时间片阈值** （如 100ns 内必须响应）。

### 5. 3\. 时序冲突管理
- **冲突检测** ：硬件逻辑实时监测 DRAM 时序参数，如 tRRD（Row-to-Row Delay）、tFAW（Four Activate Window）等。 当新请求与正在执行的操作存在时序冲突时，该请求将被阻塞，仲裁器自动切换至其他可行请求。

## Evidence

- Source: [原始文章](raw/tech/dram/总结DWC LPDDR MC的多Bank 的仲裁（Arbitration）和重排序（Reordering）机制.md) [[../../raw/tech/dram/总结DWC LPDDR MC的多Bank 的仲裁（Arbitration）和重排序（Reordering）机制.md|原始文章]]

## Key Quotes

> "最大化内存带宽利用率、降低访问延迟并优化功耗效率"

> "事务层（Transaction Layer）"

> "分片队列（Bank-Sliced Queues）"

> "命令调度层（Command Scheduler）"

> "物理层（PHY Interface）"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/总结DWC LPDDR MC的多Bank 的仲裁（Arbitration）和重排序（Reordering）机制.md) [[../../raw/tech/dram/总结DWC LPDDR MC的多Bank 的仲裁（Arbitration）和重排序（Reordering）机制.md|原始文章]]
