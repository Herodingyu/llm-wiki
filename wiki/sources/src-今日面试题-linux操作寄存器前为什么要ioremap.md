---
doc_id: src-今日面试题-linux操作寄存器前为什么要ioremap
title: 今日面试题  Linux操作寄存器前为什么要ioremap
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/今日面试题  Linux操作寄存器前为什么要ioremap.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · Linux驱动开发](https://www.zhihu.com/column/c_1287651091745013760) 15 人赞同了该文章 - 这里只考虑有 [MMU](https://zhida.zhihu.com/search?content_id=147186152&content_type=Article&match_order=1&q=MMU&zhida_source=entity) 的芯片，Linux 为了实现进程虚拟地址空间，在启用 MMU 后，在内核中操作的都是虚拟地址，内核访问不到物理地址。

## Key Points

### 1. 1\. 原因
- 这里只考虑有 [MMU](https://zhida.zhihu.com/search?content_id=147186152&content_type=Article&match_order=1&q=MMU&zhida_source=entity) 的芯片，Linux 为了实现进程虚拟地址空间，在启用 MMU 后，在内核中操作的都是虚拟地址，内核访问不到物理地址。

### 2. 2\. ioremap() 实验
**实验环境：** - Linux-4.14 + Allwinner/H3。 **实验代码：** ```c static volatile unsigned long *gpio_regs = NULL;

### 3. 3\. ioremap() 的实现内幕
ioremap() 的实现内幕会涉及到比较多的内存管理的知识，这里我们抛开代码细节简单了解一下原理就好。 - ioremap() 将 vmalloc 区的某段虚拟内存块映射到 io memory，其实现原理与vmalloc() 类似，都是通过在 vmalloc 区分配虚拟地址块，然后修改内核页表的方式将其映射到设备的 I/O 地址空间。

### 4. 4\. 相关参考
- 深入理解 Linux 内核 / 8.3.2 - 深入 Linux 内核架构 / 3.5.7 - 深入理解Linux设备驱动程序内核机制 / 3.5.3 - [blog.csdn.net/njuitjf/a](https://link.zhihu.com/?target=https%3A//blog.csdn.net/njuitjf/article/details/40745227)

### 5. 5\. 参与讨论
关于嵌入式软件软件(应用/驱动)开发，大家都遇到过哪些经典的面试题呢？快抛出来一起讨论吧~ 你和我各有一个苹果，如果我们交换苹果的话，我们还是只有一个苹果。但当你和我各有一个想法，我们交换想法的话，我们就都有两个想法了。

## Evidence

- Source: [原始文章](raw/tech/bsp/今日面试题  Linux操作寄存器前为什么要ioremap.md) [[../../raw/tech/bsp/今日面试题  Linux操作寄存器前为什么要ioremap.md|原始文章]]

## Key Quotes

> "嵌入式系统 (Linux、RTOS、OpenWrt、Android) 和 开源软件"

> "原因这里只考虑有 MMU 的芯片，Linux 为了实现进程虚拟地址空间，在启用 MMU 后，在内核中操作的都是虚拟地址，内核访问不到物理地址"

> "- ioremap() 将 vmalloc 区的某段虚拟内存块映射到 io memory，其实现原理与vmalloc() 类似，都是通过在 vmalloc 区分配虚拟地址块，然后修改内核页表的方式将其映射到设备的 I/O 地址空间"

> "- 与 vmalloc() 不同的是，ioremap() 并不需要通过伙伴系统去分配物理页，因为ioremap() 要映射的目标地址是 io memory，不是物理内存 (RAM)"

> "参与讨论

关于嵌入式软件软件(应用/驱动)开发，大家都遇到过哪些经典的面试题呢？快抛出来一起讨论吧~

你和我各有一个苹果，如果我们交换苹果的话，我们还是只有一个苹果。但当你和我各有一个想法，我们交换想法的话，我们就都有两个想法了"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/今日面试题  Linux操作寄存器前为什么要ioremap.md) [[../../raw/tech/bsp/今日面试题  Linux操作寄存器前为什么要ioremap.md|原始文章]]
