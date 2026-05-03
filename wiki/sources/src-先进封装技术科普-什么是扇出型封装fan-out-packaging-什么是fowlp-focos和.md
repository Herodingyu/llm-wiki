---
doc_id: src-先进封装技术科普-什么是扇出型封装fan-out-packaging-什么是fowlp-focos和
title: 先进封装技术科普：什么是扇出型封装Fan out  Packaging？什么是FOWLP、FOCoS和InFO
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/先进封装技术科普：什么是扇出型封装Fan-out  Packaging？什么是FOWLP、FOCoS和InFO.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) 217 人赞同了该文章 目录

## Key Points

### 1. 什么是扇出型封装？
扇出型封装最近越来越火热，尤其Apple的A10/A11/A12系列CPU经过台积电诸多扇出型封装技术加持，iPhone大放异彩之后，越来越多的人在讨论扇出型封装，甚至很多封装技术在向扇出型封装技术靠，也说自己是扇出型封装。为了避免引起混淆，本文先介绍无基板扇出型封装Fan-out Wafer Level Packaging（ **[FOWLP](https://zhida.zhihu.com/s

### 2. 什么是Wafer Level Packaging？
WLP和传统封装工艺有很大不同： ![](https://picx.zhimg.com/v2-6afeebd8c0ac47c3c670ea1ca8553d6b_1440w.jpg) 传统封装是先切片，在一个个单独封装；而WLP往往是一个晶圆Wafer整体经过封装，封装好了，再进行切片。在Wafer这么大的尺度上进行后续封装，对应力、对齐、切割等等造成很大的挑战，也诞生了数量巨大的专利来应对这些挑战

### 3. 什么是扇出Fan-out？
扇出对应着扇入，它们并不是在芯片工业发明的新名词，在电路制作中也有。这里的扇入和扇出是指导出的凸点Bump是否超出了裸片Die的面积，从而是否可以提供更多IO： ![](https://pic3.zhimg.com/v2-0db09f41feef1aa7345aa29fc4ebbe92_1440w.jpg)

### 4. 第一代FOWLP：eWLB
第一代大规模量产的FOWLP是由英飞凌（后被Intel收购）2007年开发的嵌入式晶圆级球阵列（eWLB, Embedded Wafer Level Ball Grid Array）,它实际上是一种Die First Face Down FOWLP工艺：

### 5. 其他的扇出封装
Fan-out可以不仅仅用塑封材料，也可以用基板（substrate），从而将扇出型封装扩展出另外一种：Fan-Out Chip on Substrate（FOCoS）。FOWLP也可以和其他3D封装技术混合使用，如台积电的 [InFO-PoP](https://zhida.zhihu.com/search?content_id=194178181&content_type=Article&mat

## Evidence

- Source: [原始文章](raw/tech/soc-pm/先进封装技术科普：什么是扇出型封装Fan-out  Packaging？什么是FOWLP、FOCoS和InFO.md) [[../../raw/tech/soc-pm/先进封装技术科普：什么是扇出型封装Fan-out  Packaging？什么是FOWLP、FOCoS和InFO.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/先进封装技术科普：什么是扇出型封装Fan-out  Packaging？什么是FOWLP、FOCoS和InFO.md) [[../../raw/tech/soc-pm/先进封装技术科普：什么是扇出型封装Fan-out  Packaging？什么是FOWLP、FOCoS和InFO.md|原始文章]]
