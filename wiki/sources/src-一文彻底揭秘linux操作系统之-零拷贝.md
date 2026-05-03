---
doc_id: src-一文彻底揭秘linux操作系统之-零拷贝
title: 一文彻底揭秘linux操作系统之「零拷贝」！
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/一文彻底揭秘linux操作系统之「零拷贝」！.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · linux服务器开发](https://www.zhihu.com/column/c_1242422263888064512) 40 人赞同了该文章 **零拷贝（Zero-Copy）** 是一个大家耳熟能详的概念，那么，具体有哪些框架会使用到零拷贝呢？在思考这个问题之前，让我们先一起探寻一下零拷贝机制的底层原理。

## Key Points

### 1. \- 前言 -
**零拷贝（Zero-Copy）** 是一个大家耳熟能详的概念，那么，具体有哪些框架会使用到零拷贝呢？在思考这个问题之前，让我们先一起探寻一下零拷贝机制的底层原理。 推荐视频： [手写用户态协议栈以及零拷贝的实现](https://link.zhihu.com/?target=https%3A//www.bilibili.com/video/BV1if4y1j7p3/)

### 2. \- 概念篇 -


### 3. 1、零拷贝是什么？
"零拷贝"中的"拷贝"是指操作系统在I/O操作中,将数据从一个内存区域复制到另外一个内存区域，而"零"并不是指0次复制, 更多的是指在用户态和内核态之间的复制是0次。

### 4. 2、零拷贝给我们带来的好处
• 减少甚至完全避免不必要的 CPU 拷贝，从而让 CPU 解脱出来去执行其他的任务； • 减少内存带宽的占用； • 通常零拷贝技术还能够减少用户空间和操作系统内核空间之间的上下文切换。

### 5. 3、操作系统中谁负责IO拷贝？
DMA 负责内核间的 IO 传输，CPU 负责内核和应用间的 IO 传输。 两种拷贝类型： （1） [CPU COPY](https://zhida.zhihu.com/search?content_id=183873062&content_type=Article&match_order=1&q=CPU+COPY&zhida_source=entity)

## Evidence

- Source: [原始文章](raw/tech/bsp/一文彻底揭秘linux操作系统之「零拷贝」！.md) [[../../raw/tech/bsp/一文彻底揭秘linux操作系统之「零拷贝」！.md|原始文章]]

## Key Quotes

> "标注：VFS（virtual File System） 的作用就是采用标准的 Unix 系统调用读写位于不同物理介质上的不同文件系统"

> "支持 scatter-gather 特性的 sendFile。"

> ""零拷贝"中的"拷贝"是指操作系统在I/O操作中,将数据从一个内存区域复制到另外一个内存区域，而"零"并不是指0次复制, 更多的是指在用户态和内核态之间的复制是0次"

> "从内核态到用户态时会发生上下文切换，上下文切换时指由用户态切换到内核态, 以及由内核态切换到用户态"

> "## \- 原理篇 -

## 1、内存管理

Linux 内存管理结构的历史：在 Linux 内核2.4版本之前，内存管理结构中 page cache 和 buffer cache 是分开的，分别是两个独立的"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/一文彻底揭秘linux操作系统之「零拷贝」！.md) [[../../raw/tech/bsp/一文彻底揭秘linux操作系统之「零拷贝」！.md|原始文章]]
