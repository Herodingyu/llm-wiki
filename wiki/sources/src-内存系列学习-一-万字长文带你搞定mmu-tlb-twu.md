---
doc_id: src-内存系列学习-一-万字长文带你搞定mmu-tlb-twu
title: 内存系列学习（一）：万字长文带你搞定MMU&TLB&TWU
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/内存系列学习（一）：万字长文带你搞定MMU&TLB&TWU.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 48 人赞同了该文章 大家好！我是不知名的安全工程师Hkcoco！

## Key Points

### 1. 前言
一直在学习内存管理，也知道 [MMU](https://zhida.zhihu.com/search?content_id=232786360&content_type=Article&match_order=1&q=MMU&zhida_source=entity) 是管理内存的映射的逻辑IP，还知道里面有个 [TLB](https://zhida.zhihu.com/search?content

### 2. PART 一：MMU 架构篇
**MMU（Memory Management Unit，内存管理单元）是一种硬件模块** ，用于在 **CPU和内存之间实现 [虚拟内存](https://zhida.zhihu.com/search?content_id=232786360&content_type=Article&match_order=1&q=%E8%99%9A%E6%8B%9F%E5%86%85%E5%AD%98&zhi

### 3. 1-宏观理解
地址空间是一个抽象的概念，由CPU体系架构的地址总线决定，一般等同于CPU的寻址范围、x位处理器中的x。 **地址空间一般分为 [虚拟地址空间](https://zhida.zhihu.com/search?content_id=232786360&content_type=Article&match_order=1&q=%E8%99%9A%E6%8B%9F%E5%9C%B0%E5%9D%80%E

### 4. 2-微观理解
内存管理单元（MMU）的一个重要功能是 **使系统能够运行多个任务，作为独立的程序运行在他们自己的** **私有虚拟内存空间。** 它们不需要了解系统的物理内存图，即硬件实际使用的地址，也不需要了解可能在同一时间执行的其他程序。

### 5. 1-CPU发出的虚拟地址
CPU发出的虚拟地址由两部分组成：VPN和offset，VPN（virtual page number）是 [页表](https://zhida.zhihu.com/search?content_id=232786360&content_type=Article&match_order=1&q=%E9%A1%B5%E8%A1%A8&zhida_source=entity) 中的条目number，而

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/内存系列学习（一）：万字长文带你搞定MMU&TLB&TWU.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/内存系列学习（一）：万字长文带你搞定MMU&TLB&TWU.md|原始文章]]

## Key Quotes

> "MMU（Memory Management Unit，内存管理单元）是一种硬件模块"

> "其主要功能是将虚拟地址转换为物理地址"

> "与虚拟地址空间和虚拟地址相对应的则是物理地址空间和物理地址"

> "大多数时候我们的系统所具备的物理地址空间只是虚拟地址空间的一个子集。"

> "使系统能够运行多个任务，作为独立的程序运行在他们自己的"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/内存系列学习（一）：万字长文带你搞定MMU&TLB&TWU.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/内存系列学习（一）：万字长文带你搞定MMU&TLB&TWU.md|原始文章]]
