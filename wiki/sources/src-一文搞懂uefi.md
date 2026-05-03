---
doc_id: src-一文搞懂uefi
title: 一文搞懂UEFI
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文搞懂UEFI.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 107 人赞同了该文章 > Hi！早哦。今天又是宠读者的一天，应允聊聊UEFI。

## Key Points

### 1. 前言
很难用一篇文章去完全的了解UEFI，这篇文章的目标是希望能让不了解的朋友看完后达到下面几个目标： - UEFI是什么：概念 - UFEI用来干什么：应用 - UEFI有些什么东西：架构 - UEFI重点场景：启动

### 2. UEFI是什么？
这就不得不提提BIOS。

### 3. 传统BIOS
为了更好地理解UEFI，我们首先需要回顾一下历史。自20世纪80年代以来，计算机一直在使用BIOS。 当我们提到BIOS时，根据上下文的不同，它可能代表不同的含义： 1. **BIOS标准** ：这是一个广泛的概念，指的是一种在计算机启动时初始化硬件并加载操作系统引导程序的标准接口。

### 4. BIOS作为标准
作为一个标准，BIOS定义了以下内容： 1. 一个硬编码的内存位置，计算机在开机时CPU将从该位置开始执行BIOS代码。 2. 磁盘位置，操作系统制造商可以在这些位置放置其引导加载程序以启动其操作系统。

### 5. BIOS作为实现
你可能熟悉更新主板BIOS的过程。待刷新的BIOS是特定于主板的（即不存在适用于所有主板的单一BIOS），因为BIOS的实现是特定于主板的。 我并不完全了解制造商特有的所有内容，但我猜测不同主板的芯片组会有所不同，比如内存控制器的初始化和处理、内置图形处理器等。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文搞懂UEFI.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文搞懂UEFI.md|原始文章]]

## Key Quotes

> "而UEFI（统一可扩展固件接口）是BIOS的现代替代品，提供了更多的功能和更好的安全性。"

> "你通常可以配置启动顺序，如CD-ROM、硬盘1、硬盘2等，以及它们的任何组合。BIOS会根据你的启动顺序偏好找到第一个可启动项。"

> "因此仅凭这个大小的引导加载程序绝对无法加载现代操作系统。"

> "MBR中的引导加载程序会将控制权传递给活动分区的引导加载程序"

> "它将所有关于初始化和启动的数据存储在.efi 文件中，而不是存储在固件上。"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文搞懂UEFI.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文搞懂UEFI.md|原始文章]]
