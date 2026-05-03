---
doc_id: src-内存管理-一-深入理解硬件原理和分页管理区别
title: 内存管理(一)：深入理解硬件原理和分页管理区别
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/内存管理(一)：深入理解硬件原理和分页管理区别.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · Linux内核学习笔记](https://www.zhihu.com/column/c_1469696126375419904) 20 人赞同了该文章 内存管理相对复杂，涉及到硬件和软件，从微机原理到应用程序到内核。比如，硬件上的cache，CPU如何去寻址内存，页表， DMA，IOMMU。 软件上，要知道底层怎么分配内存，怎么管理内存，应用程序怎么申请内存。

## Key Points

### 1. 前言
内存管理相对复杂，涉及到硬件和软件，从微机原理到应用程序到内核。比如，硬件上的cache，CPU如何去寻址内存，页表， DMA，IOMMU。 软件上，要知道底层怎么分配内存，怎么管理内存，应用程序怎么申请内存。

### 2. 硬件原理 和 分页管理
本文主要让大家理解内存管理最底层的buddy算法，内存为什么要分成多个Zone? - CPU寻址内存，虚拟地址、物理地址 - MMU 以及RWX权限、kernel和user模式权限 - 内存的zone: DMA、Normal和HIGHMEM

### 3. 页表（Page table）记录的页权限
cpu虚拟地址，mmu根据cpu请求的虚拟地址，访问页表，查得物理地址。 每个MMU中的页表项，除了有虚拟地址到物理地址的映射之外，还可以标注这个页的 RWX权限和 kernel和user模式权限（用户空间,内核空间读取地址的权限），它们是内存管理两个的非常重要的权限。

### 4. 内存分Zone
下面解释内存为什么分Zone? DMA zone. ![](https://pic1.zhimg.com/v2-1e7044675d97cf46b7da8ef44c13b0dc_1440w.jpg) 内存的分Zone，全都是物理地址的概念。内存条，被分为三个Zone。

### 5. 硬件层的内存管理- buddy算法
每个zone都会使用buddy算法，把所有的空闲页面变成2的n次方进行管理。 /proc/buddyinfo 通过/proc/buddyinfo，可以看出 [空闲内存](https://zhida.zhihu.com/search?content_id=191141270&content_type=Article&match_order=1&q=%E7%A9%BA%E9%97%B2%E5%86%8

## Evidence

- Source: [原始文章](raw/tech/dram/内存管理(一)：深入理解硬件原理和分页管理区别.md) [[../../raw/tech/dram/内存管理(一)：深入理解硬件原理和分页管理区别.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/内存管理(一)：深入理解硬件原理和分页管理区别.md) [[../../raw/tech/dram/内存管理(一)：深入理解硬件原理和分页管理区别.md|原始文章]]
