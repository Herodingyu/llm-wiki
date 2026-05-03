---
doc_id: src-单根内存条的极限容量是多少-内存条上的2r-x-8代表了什么意思
title: 单根内存条的极限容量是多少？内存条上的2R X 8代表了什么意思？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/单根内存条的极限容量是多少？内存条上的2R X 8代表了什么意思？.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) LogicJitterGibbs 等 786 人赞同了该文章 我们平时看到内存条，有的上面单面有8个内存颗粒：

## Key Points

### 1. DRAM原理
内存DRAM的每个单元可以看作一个晶体管和一个电容的组合： ![](https://pic2.zhimg.com/v2-6037d8252f77d6d21e4aebebab75438b_1440w.jpg)

### 2. 内存颗粒容量限制
内存颗粒并不能无限变大，因为没有那么多地址线。尽管从DDR开始，JEDEC标准就不停的增加地址线，但到了DDR4，地址还是有限的，这也是DDR5必须尽早出来的原因之一。地址线的多少决定了可以寻址多大空间，也决定了单颗内存容量的上限。

### 3. 结论
单根UDIMM/RDIMM的容量最大128GB，这是JEDEC的标准所允许的最大容量。LRDIMM可以达到更大容量。它的原理我们今后再讲。 另外我们看到，如果选用X16的颗粒，单颗颗粒可以容量更大，但是总容量受只能用4个颗粒的限制，还是不能超过64GB。而同样容量的内存颗粒，因为单元数目相同，成本差别不大，为了组成更大内存，内存条厂商往往选择x 4的来组成大容量内存。这也就为什么超大容量内存条总是

## Evidence

- Source: [原始文章](raw/tech/dram/单根内存条的极限容量是多少？内存条上的2R X 8代表了什么意思？.md) [[../../raw/tech/dram/单根内存条的极限容量是多少？内存条上的2R X 8代表了什么意思？.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/单根内存条的极限容量是多少？内存条上的2R X 8代表了什么意思？.md) [[../../raw/tech/dram/单根内存条的极限容量是多少？内存条上的2R X 8代表了什么意思？.md|原始文章]]
