---
doc_id: src-为什么内存测试不只是简单的读写-一文看懂从位衰减到行走1的8种测试方法
title: 为什么内存测试不只是简单的读写？一文看懂从位衰减到行走1的8种测试方法
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/为什么内存测试不只是简单的读写？一文看懂从位衰减到行走1的8种测试方法.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) 航海家 SuperSodaSea 等 61 人赞同 目录

## Key Points

### 1. 准备工作
首先下载到MemTest86+源码，在test目录下，就有我们今天要一一看的八个算法： ![](https://picx.zhimg.com/v2-2d9b684b0493e31af17398ac3d899df1_1440w.jpg)

### 2. Bit Fade测试
bit\_fade.c 专门用于检测内存中的"位衰减"（Bit Fade）故障。位衰减，是指内存单元在一段时间后无法保持其原始值的现象，也就是内容会随时间而衰减掉。它通常由内存刷新不足、颗粒Cell电容泄漏、电压不稳定等原因带来，其中某些可能是内存控制器的原因，也可以能是内存颗粒的质量问题。

### 3. 块移动测试
block\_move.c 是就是实现所谓"块移动测试"（Block Move Test）的模块。这是一种专门用于测试内存在数据移动过程中的完整性和稳定性的测试方法。块移动测试的核心思想是通过在内存中移动大块数据，检测在数据传输过程中可能出现的错误。

### 4. 模N测试
modulo\_n.c 中实现了"模N测试"（Modulo-N Test）。这是一种专门用于检测内存地址解码和数据线干扰问题的测试方法。模N测试的核心思想是：1. 在内存中按照特定间隔（每隔N个位置）写入特定模式；2. 在其他位置写入不同的模式；3. 然后检查特定间隔位置的数据是否保持不变。

### 5. Address Walking Ones Test
addr\_walk1.c 中实现了" [地址线行走测试](https://zhida.zhihu.com/search?content_id=255865168&content_type=Article&match_order=1&q=%E5%9C%B0%E5%9D%80%E7%BA%BF%E8%A1%8C%E8%B5%B0%E6%B5%8B%E8%AF%95&zhida_source=enti

## Evidence

- Source: [原始文章](raw/tech/dram/为什么内存测试不只是简单的读写？一文看懂从位衰减到行走1的8种测试方法.md) [[../../raw/tech/dram/为什么内存测试不只是简单的读写？一文看懂从位衰减到行走1的8种测试方法.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/为什么内存测试不只是简单的读写？一文看懂从位衰减到行走1的8种测试方法.md) [[../../raw/tech/dram/为什么内存测试不只是简单的读写？一文看懂从位衰减到行走1的8种测试方法.md|原始文章]]
