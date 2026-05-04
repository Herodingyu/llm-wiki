---
doc_id: src-multicore-ipc-onechan
title: 多核 IPC 通信：硬件队列、门铃中断与共享内存
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/multicore-ipc-onechan.md
domain: tech/soc-pm
created: 2026-05-04
updated: 2026-05-04
tags: [soc-pm]
---

## Summary

> 来源：微信公众号「OneChan」 > 原文链接：https://mp.weixin.qq.com/s/e9jccXbkgH-cnn-rH6hFog > 记录时间：2026-05-04

## Key Points

### 1. 核心问题
当多个核心需要高效协同，硬件队列、门铃中断和共享内存如何构建无锁通信的桥梁，又如何在**数据一致性、延迟和吞吐量**之间艰难平衡？

### 2. 多核通信的本质需求
- **数据传输**：一个核心产生的数据传递给另一个核心 - **同步**：协调多个核心的执行顺序，避免竞态条件 - **通知**：一个核心需要通知另一个核心某个事件的发生 简单共享内存的问题： - 数据一致性（缓存不一致）

### 3. 01 硬件队列（Hardware Queue）


### 4. 结构
- 队列控制寄存器（头指针、尾指针、状态寄存器） - 数据缓冲区（槽 0 ~ 槽 N-1）

### 5. 操作流程
- 发送核心：检查空槽 → 写入数据 → 更新尾指针（硬件原子化） - 接收核心：检查数据 → 从头部读取 → 更新头指针（硬件原子化）

## Evidence

- Source: [原始文章](raw/tech/soc-pm/multicore-ipc-onechan.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/multicore-ipc-onechan.md)
