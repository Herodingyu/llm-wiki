---
doc_id: src-ai系统-17npu架构设计介绍
title: AI系统 17NPU架构设计介绍
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-17NPU架构设计介绍.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 13 人赞同了该文章 ![](https://pica.zhimg.com/v2-d079b72818a0e521df51f2080fbf4e2e_1440w.jpg)

## Key Points

### 1. 1\. NPU Cluster介绍
首先为什么要有簇？ 一个AI计算任务，例如人脸识别需要大量的数据运算，那么要并行处理就需要对任务进行切片并行处理，那么一个子任务对应硬件的处理就是cluster，可以理解为多个cluster并行工作。

### 2. 1.1 壁仞科技
![](https://pic1.zhimg.com/v2-086ea583cce8f4055e7f7d61b7dbbd16_1440w.jpg) ![](https://pic4.zhimg.com/v2-891222fc7b3db7b524213ab8d46f8151_1440w.jpg)

### 3. 1.2 寒武纪
![](https://pic3.zhimg.com/v2-8b6efb84523591a9d012769a07d33a0a_1440w.jpg) 其IPU就是PE，上图中是一个cluster里面有4个PE。

### 4. 1.3 华为达芬奇
![](https://picx.zhimg.com/v2-d67e85eac1565d8e81f1bbea33b8371d_1440w.jpg) ![](https://pica.zhimg.com/v2-8fb3b85224bbdc4fc94e8421791bc4ac_1440w.jpg)

### 5. 2\. NPU整体架构设计
了解完cluster这个NPU中最重要的单位，我们再从NPU整体出发，以AI芯片架构分析五步法进行彻底的剖析： > 对于AI芯片的架构，总结有下面5点（AI芯片五步分析法）： 1. 簇：计算部分有很多的cluster就是簇

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-17NPU架构设计介绍.md) [[../../raw/tech/soc-pm/AI系统/AI系统-17NPU架构设计介绍.md|原始文章]]

## Key Quotes

> "点赞、收藏、在看、划线和评论交流"

> "对于AI芯片的架构，总结有下面5点（AI芯片五步分析法）："

> "本文后续都按华为的一个Core就是一个cluster来介绍，因为其实现了cluster的功能，除了PE（计算单元外又集成了存储、控制等功能）。如果这个架构扩展一个cluster4个PE，那就把计算单元给分成4份就可以了。这里根据华为的场景子任务应该不需要那么多的Core，一份就够用了，这个就是一个cluster使用几个PE的权衡。"

> "华为达芬奇按AI芯片架构分析五步法归纳如下："

> "但是实现存算一体还有个问题就是对编译器的挑战，存算一体的数据是提前编译器搞好的，里面包含了调度依赖，这样减轻了调度器的压力（把运行时干的活放编译干，等于提前准备，干活时就快，这是计算机的一项重要技术），存算一体对PE来说是好处很多，运算时不用受调度器的指挥，只管对着存算一体数据干活，干完活才汇报，干活过程中不受打扰。"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-17NPU架构设计介绍.md) [[../../raw/tech/soc-pm/AI系统/AI系统-17NPU架构设计介绍.md|原始文章]]
