---
doc_id: src-zero-copy
title: Linux 零拷贝技术
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/一文彻底揭秘linux操作系统之「零拷贝」！.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, zero-copy, io, dma]
---

## Summary

本文系统介绍了 Linux 零拷贝（Zero-Copy）技术的原理和实现。零拷贝的核心是减少用户态和内核态之间的数据复制，让 CPU 解脱出来执行其他任务，减少内存带宽占用和上下文切换。文章详细分析了 DMA 和 CPU 拷贝的区别，以及 Linux 内存管理结构（Page Cache 和 Buffer Cache）在零拷贝中的作用。

## Key Points

### 1. 零拷贝定义
- "零"指用户态和内核态之间的复制为 0 次
- 减少不必要的 CPU 拷贝
- 减少内存带宽占用
- 减少用户空间与内核空间的上下文切换

### 2. 拷贝类型
| 类型 | 负责方 | 特点 |
|------|--------|------|
| CPU COPY | CPU | 占用 CPU 资源和总线带宽 |
| DMA COPY | DMA 控制器 | CPU 只需初始化，无需干预 |

### 3. 上下文切换
- 用户态 ↔ 内核态切换发生在 I/O 操作时
- 零拷贝技术减少这种切换

### 4. Linux 内存管理结构
- **Page Cache**: 内存管理系统和 VFS 交互
- **Buffer Cache**: 具体文件系统与外围存储设备交互
- 每个 Page Cache 包含若干 Buffer Cache
- VFS 负责 Page Cache 与用户空间的数据交换

### 5. VFS 作用
- 采用标准 Unix 系统调用读写不同文件系统
- 为各类文件系统提供统一操作界面和编程接口
- open()、read()、write() 等系统调用无需关心底层存储介质

### 6. 零拷贝历史
- Linux 2.4 之前：page cache 和 buffer cache 分开
- Linux 2.4+：优化内存管理机制，支持零拷贝

## Evidence

- DMA 传输时 CPU 只需初始化，可继续执行其他指令
- CPU COPY 需要暂停现有处理逻辑协助内存读写
- Page Cache 和 Buffer Cache 的层级关系

## Key Quotes

> "标注：VFS（virtual File System） 的作用就是采用标准的 Unix 系统调用读写位于不同物理介质上的不同文件系统"

> "支持 scatter-gather 特性的 sendFile。"

> ""零拷贝"中的"拷贝"是指操作系统在I/O操作中,将数据从一个内存区域复制到另外一个内存区域，而"零"并不是指0次复制, 更多的是指在用户态和内核态之间的复制是0次"

> "从内核态到用户态时会发生上下文切换，上下文切换时指由用户态切换到内核态, 以及由内核态切换到用户态"

> "## \- 原理篇 -

## 1、内存管理

Linux 内存管理结构的历史：在 Linux 内核2.4版本之前，内存管理结构中 page cache 和 buffer cache 是分开的，分别是两个独立的"

## Open Questions

- sendfile、splice、mmap 等零拷贝 API 的具体实现差异
- 零拷贝在网络 I/O 和文件 I/O 中的应用场景对比

## Related Pages

- [[zero-copy]]
- [[dma]]
- [[page-cache]]
- [[vfs]]
