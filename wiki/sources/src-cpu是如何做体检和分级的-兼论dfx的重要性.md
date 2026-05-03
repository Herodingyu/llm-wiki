---
doc_id: src-cpu是如何做体检和分级的-兼论dfx的重要性
title: CPU是如何做体检和分级的？兼论DFx的重要性
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/CPU是如何做体检和分级的？兼论DFx的重要性.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) 249 人赞同了该文章 前几天去参加公司体检，一大早乌泱泱数百个人冲进体检中心，半个小时后就手捧体重超标的报告出来了，真是高效。想起以前有个同事从来不去体检，怕真发现什么问题，我说他是“讳疾忌医”的典型代表。身体要定期检查，早发现问题，早治疗才好。CPU也一样，从躺在晶圆里面就开始经过一遍遍测试，保证到了我们消费者手中，不会有严重的质量问题。如果我们搜索硅谷的招聘网站，就会发现Intel和AMD在大量招聘 [DFT](https://zhida.zhihu.com/search

## Key Points

### 1. 芯片封装测试
现代CPU的测试流程如下： ![](https://pic2.zhimg.com/v2-69c04e4fbd1adb4d18db75d5ece635b9_1440w.jpg) **1.分类（Sort）** ：也叫作 [Wafer test](https://zhida.zhihu.com/search?content_id=154959800&content_type=Article&match_

### 2. i3/i5/i7全部都是一条产线上出来的吗？
上面的Binning的过程，会让有些同学产生误解，认为所有i3，i5和i7都是一个产线出来的，再Binning成不同的产品。实际上，Intel在每一代都会定义几种不同的SKU，如H，U，Y等等，它们的Die大小本身就是不同的。这个因素，加上Binning的结果，组合成几十种Sku，i3还有部分小核Atom的产品线。实际上，区分i5是Binning的结果，还是设计如此没有太大意义，关键是价格和性能是

### 3. 什么是DFx？
从整个测试流程可以看出，越早发现问题，解决问题的代价越小。出了问题的CPU最好在给到最终客户那里之前就得到充分验证，并提供丰富的手段帮助调试，于是这些总的汇集起来就是DFx，x在这里代表一个集合，它包括： [DFD](https://zhida.zhihu.com/search?content_id=154959800&content_type=Article&match_order=1&q=DF

### 4. 参考
1. 良品率计算器 [https://caly-technologies.com/die-yield-calculator/](https://caly-technologies.com/die-yield-calculator/)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/CPU是如何做体检和分级的？兼论DFx的重要性.md) [[../../raw/tech/soc-pm/CPU是如何做体检和分级的？兼论DFx的重要性.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/CPU是如何做体检和分级的？兼论DFx的重要性.md) [[../../raw/tech/soc-pm/CPU是如何做体检和分级的？兼论DFx的重要性.md|原始文章]]
