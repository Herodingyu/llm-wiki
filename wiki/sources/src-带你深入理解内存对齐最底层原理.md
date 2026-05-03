---
doc_id: src-带你深入理解内存对齐最底层原理
title: 带你深入理解内存对齐最底层原理
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/带你深入理解内存对齐最底层原理.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · 开发内功修炼](https://www.zhihu.com/column/c_1147478886047719424) 931 人赞同了该文章 相信绝大多数的人都了解 [内存对齐](https://zhida.zhihu.com/search?content_id=106673639&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E5%AF%B9%E9%BD%90&zhida_source=entity) ，对齐后性能高。但是其最最底层的原理是啥呢？ 有的人可能会说，因为 [高速缓存](https://zhida.

## Key Points

### 1. 内存物理结构
我们来了解一下内存的物理构造，一般内存的外形图片如下图： ![](https://pica.zhimg.com/v2-279e1b14a8987fd3c66cd36fc1094f4e_1440w.jpg)

### 2. 内存编址方式
那么对于我们在应用程序中内存中地址连续的8个字节,例如0x0000-0x0007，是从位于bank上的呢？直观感觉，应该是在第一个bank上吗？ 其实不是的，程序员视角看起来连续的地址0x0000-0x0007，实际上位8个bank中的，每一个bank只保存了一个字节。在物理上，他们并不连续。下图很好地阐述了实际情况。

### 3. 结论
**所以，内存对齐最最底层的原因是内存的IO是以8个字节64bit为单位进行的。** 对于64位数据宽度的内存，假如cpu也是64位的cpu（现在的计算机基本都是这样的），每次内存IO获取数据都是从同行同列的8个bank中各自读取一个字节拼起来的。从内存的0地址开始，0-7字节的数据可以一次IO读取出来，8-15字节的数据也可以一次读取出来。

## Evidence

- Source: [原始文章](raw/tech/dram/带你深入理解内存对齐最底层原理.md) [[../../raw/tech/dram/带你深入理解内存对齐最底层原理.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/带你深入理解内存对齐最底层原理.md) [[../../raw/tech/dram/带你深入理解内存对齐最底层原理.md|原始文章]]
