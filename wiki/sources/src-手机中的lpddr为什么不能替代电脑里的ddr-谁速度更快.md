---
doc_id: src-手机中的lpddr为什么不能替代电脑里的ddr-谁速度更快
title: 手机中的LPDDR为什么不能替代电脑里的DDR？谁速度更快？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/手机中的LPDDR为什么不能替代电脑里的DDR？谁速度更快？.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) 721 人赞同了该文章 最近一个朋友向我提出了一个有趣的问题：“LPDDR4和DDR4现在主频都很高，LPDDR4又省电，有更好的能耗比，为什么DDR4还继续存在？”这着实是个好问题，脱口而出的答案又被我咽了下去。思考了一天，我们今天就来详细对比一下。

## Key Points

### 1. LPDDR4 vs DDR4
在本专栏中，我们介绍了很多DDR4的原理，这里不再赘述： LPDDR4除了电压更低之外，它设计之初并不是给台式机用的。和它服务的嵌入式系统一样，它的目标市场往往是固定搭配的，这让它的配置少了很多灵活性。它的话语空间中，一个和DDR4重要的区别就是 [Channel](https://zhida.zhihu.com/search?content_id=145878775&content_type=A

### 2. Benchmark数据
我们希望在真实的硬件上一较高下，但会立刻陷入一个麻烦：尽管CPU支持两者，但没有任何一款真正的硬件上可以同时支持两者。那怎么办呢？只有借助于仿真器了，实际上有人已经帮我们比较过了，我们后面的数据都来自这篇论文：

### 3. 结论
详细内容还是建议大家详细读论文。这里稍微解释一下这个结果，DDR4相比LPDDR4，提供了Bank Group，并发性更好；时序（tRCD等）往往更低；价格更便宜。无怪乎能选DDR4，就不会用LPDDR4。但LPDDR4耗电低得多，在手机等等设备上还是必选它。

### 4. 参考
还没有人送礼物，鼓励一下作者吧 编辑于 2020-09-30 22:28[三部门发文+新政解读：ODI备案如何助力企业成功出海【成功案例】](https://zhuanlan.zhihu.com/p/1987171790427006383)

## Evidence

- Source: [原始文章](raw/tech/dram/手机中的LPDDR为什么不能替代电脑里的DDR？谁速度更快？.md) [[../../raw/tech/dram/手机中的LPDDR为什么不能替代电脑里的DDR？谁速度更快？.md|原始文章]]

## Key Quotes

> "每个LPDDR4颗粒提供2个Channel"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/手机中的LPDDR为什么不能替代电脑里的DDR？谁速度更快？.md) [[../../raw/tech/dram/手机中的LPDDR为什么不能替代电脑里的DDR？谁速度更快？.md|原始文章]]
