---
doc_id: src-一篇论文讲透cache优化
title: 一篇论文讲透Cache优化
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/一篇论文讲透Cache优化.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · IT](https://www.zhihu.com/column/c_1705318239930867712) 没有提供感情机器 等 1750 人赞同了该文章 《What Every Programmer Should Know About Memory》是Ulrich Drepper大佬的一篇神作，洋洋洒洒100多页，基本上涵盖了当时（2007年）关于访存原理和优化的所有问题。即使今天的CPU又有了进一步的发展，但是依然没有跳出这篇文章的探讨范围。只要是讨论访存优化的文章，基本上都会引用这篇论文。

## Key Points

### 1. 一 原理


### 2. 1.1 Cache架构
![](https://pica.zhimg.com/v2-db76f92d9a8a56c74d1f64ef1f90e764_1440w.jpg) ![](https://pic2.zhimg.com/v2-9771fed8a54f17697f91b4dc9f7ad713_1440w.jpg)

### 3. 1.2 Cache速度差距
![](https://pic3.zhimg.com/v2-9bcc7186a94080ca9d1c5a0048896128_1440w.jpg) ![](https://picx.zhimg.com/v2-f7ea4e112e0d45b5ca88ac11d41ff1eb_1440w.jpg)

### 4. 1.3 Cache实现细节


### 5. 1.3.1 Cache的Key
![](https://pic3.zhimg.com/v2-f5873c14a04bd7bb4cfc372884970b8c_1440w.jpg) - T和S一起，唯一标识一个CacheLine，将Cache的组织想象成一个二维数组，通过两个角标T和S定位

## Evidence

- Source: [原始文章](raw/tech/dram/一篇论文讲透Cache优化.md) [[../../raw/tech/dram/一篇论文讲透Cache优化.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/一篇论文讲透Cache优化.md) [[../../raw/tech/dram/一篇论文讲透Cache优化.md|原始文章]]
