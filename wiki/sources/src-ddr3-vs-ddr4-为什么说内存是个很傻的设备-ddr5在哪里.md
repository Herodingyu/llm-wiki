---
doc_id: src-ddr3-vs-ddr4-为什么说内存是个很傻的设备-ddr5在哪里
title: DDR3 vs DDR4 为什么说内存是个很傻的设备？DDR5在哪里？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/DDR3 vs DDR4 为什么说内存是个很傻的设备？DDR5在哪里？.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) 吴建明wujianming、sazc 等 932 人赞同了该文章 DDR4已经在市面上好几年了， [DDR5](https://zhida.zhihu.com/search?content_id=101959450&content_type=Article&match_order=1&q=DDR5&zhida_source=entity) 的draft也已经起草完毕，它的支持已经在视线可及的地平线上。作为 [BIOS](https://zhida.zhihu.com/searc

## Key Points

### 1. DDR3和它的先辈们
可以说DDR4是DDR系列从SDRAM脱胎以来，变化最大的一次。为什么这么说呢？如果我们看DDR3和它的前辈们的演变关系： ![](https://pic3.zhimg.com/v2-34a2e99340255eacb71ad57e5a2b65a0_1440w.jpg)

### 2. DDR4来了
DDR4当然和前代每次变化一样，降低了电压；增加了地址线Ax，所以可以支持更大容量。除此之外，有个明显的不同变化，prefetch的倍增停止了。 DDR4和DDR3一样，只有8n的prefetch，但为了提升前端Front End的总线速度，不得不在核心频率上动起了手脚：

### 3. DDR5会带来什么？
DDR5的标准尚未公布，据悉会进一步降低电压，这当然是拜现在芯片工艺提升所赐。另外prefetch会进一步从8n prefetch变成16n prefetch。 有同学会问了，你刚才说了DDR4不能从8n变成16n，是碰到了巨大的问题。为什么DDR5又没有问题了呢？因为协议没有公布，等公布后我们再来回顾这个问题。

### 4. 参考资料：
\[1\]: [en.wikipedia.org/wiki/D](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/DDR2_SDRAM)

## Evidence

- Source: [原始文章](raw/tech/dram/DDR3 vs DDR4 为什么说内存是个很傻的设备？DDR5在哪里？.md) [[../../raw/tech/dram/DDR3 vs DDR4 为什么说内存是个很傻的设备？DDR5在哪里？.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/DDR3 vs DDR4 为什么说内存是个很傻的设备？DDR5在哪里？.md) [[../../raw/tech/dram/DDR3 vs DDR4 为什么说内存是个很傻的设备？DDR5在哪里？.md|原始文章]]
