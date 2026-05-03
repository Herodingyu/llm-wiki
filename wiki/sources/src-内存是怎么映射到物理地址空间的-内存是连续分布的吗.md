---
doc_id: src-内存是怎么映射到物理地址空间的-内存是连续分布的吗
title: 内存是怎么映射到物理地址空间的？内存是连续分布的吗？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/内存是怎么映射到物理地址空间的？内存是连续分布的吗？.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

知乎日报收录 [ 收录于 · UEFI和BIOS探秘

## Key Points

### 1. 物理地址空间
一个典型的物理地址空间是这样的： ![](https://pic1.zhimg.com/v2-d5b849892dcf0826362c5459a397cdd0_1440w.jpg) 其中只有灰色部分是真正的内存，其余都是MMIO。而内存被分为 [High DRAM](https://zhida.zhihu.com/search?content_id=102859802&content_type=A

### 2. Low MMIO和High MMIO
Low MMIO结构如下图： ![](https://pic1.zhimg.com/v2-392dfb30d8bbd5b4d3c01d93c9843a88_1440w.jpg) 其中有几块要特别说明一下：

### 3. Low DRAM和High DRAM
4G以下内存最高地址叫做BMBOUND，也有叫做Top of Low Usable DRAM (TOLUD) 。BIOS也并不是把这些都报告给操作系统，而是要在里面划分出一部分给核显、ME和SMM等功能：

### 4. 内存的Interleave
从前面可以看出内存在地址空间上被拆分成两块：Low DRAM和High DRAM。那么在每块地址空间上分配连续吗？现代内存系统在引入多通道后，为了规避数据的局部性（这也是Cache为什么起作用的原因）对多通道性能的影响，BIOS基本缺省全部开启了Interleaving，过去美好的DIMM 0和DIMM 1挨个连续分配的日子一去不复返了。

### 5. 物理地址到内存单元的反推
BIOS实际上一手导演的内存的分配，它当然可以从任何物理地址反推回内存的单元地址。我们可以用下面一组数据来唯一确定某个内存单元： ``` Channel #;DIMM #; Rank #;Bank #;Row #;Column #

## Evidence

- Source: [原始文章](raw/tech/dram/内存是怎么映射到物理地址空间的？内存是连续分布的吗？.md) [[../../raw/tech/dram/内存是怎么映射到物理地址空间的？内存是连续分布的吗？.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/内存是怎么映射到物理地址空间的？内存是连续分布的吗？.md) [[../../raw/tech/dram/内存是怎么映射到物理地址空间的？内存是连续分布的吗？.md|原始文章]]
