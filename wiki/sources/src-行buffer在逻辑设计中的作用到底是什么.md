---
doc_id: src-行buffer在逻辑设计中的作用到底是什么
title: 行buffer在逻辑设计中的作用到底是什么？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/行buffer在逻辑设计中的作用到底是什么？.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

不坠青云之志 等 174 人赞同了该文章 很多初入芯片行业的同学经常会听到老员工谈论 [行buffer](https://zhida.zhihu.com/search?content_id=182380063&content_type=Article&match_order=1&q=%E8%A1%8Cbuffer&zhida_source=entity) 、line buffer，似乎朦胧的知道它是用来节省带宽用的。但是它为什么可以节省带宽，怎么节省的带宽，节省了多少带宽？这种结构是唯一的吗？它与滑动窗有什么关系？还有其它作用吗？。。。今天我想从系统的角度聊聊其中的原理。 虽然很多同学参与的是

## Key Points

### 1. SoC与ASIC
虽然很多同学参与的是某SoC芯片项目，但是其实他们开发的是SoC中某专用IP，本质上这是ASIC--Application Specific IC。相比SoC中已有的building block，ASIC开发就像在一张白纸上从头开始画画，目标就是做出最适合某特殊功能的逻辑电路来。

### 2. 什么是line buffer
先说说buffer是什么，buffer在芯片物理上是 **SRAM** （也可以是寄存器组），它是用来在逻辑芯片上暂时存储数据用的。而 **DRAM** ，典型的指DDR，是另外一种芯片，叫做存储芯片，用来存储大密度数据。 **line buffer不过是存储数据结构为line方式的SRAM，主要用来存储二维行列数据中的行数据，最典型的就是图像的一行像素。**

### 3. SRAM vs. DRAM
为什么要有两种不同的存储电路？为什么不只用SRAM或DRAM呢？因为它们都有优点和缺点，混合使用它们的目的就是希望兼顾它们的优点！那么我们简单看看SRAM和DRAM的优缺点。 ![](https://pica.zhimg.com/v2-3adfae7568580785002fe3a493d623f2_1440w.jpg)

### 4. 为什么一定要使用line buffer
从上一节的分析，似乎得到的结论是DRAM更便宜，速度快慢还要比较两者的时钟频率。那到底是什么驱使我们一定要使用line buffer呢？ 本质原因是 **带宽** 而不是速度， **相比DDR有限的带宽，SRAM的带宽近乎无限！DDR带宽成本要远高于SRAM带宽成本！**

### 5. line buffer节省了多少DDR带宽？
以图像处理领域为例，常常需要对图像进行滤波处理，或者说进行卷积运算。假设卷积核为3x3像素。我们比较下，使用和不使用line buffer时所使用的带宽分别是多少？ 1. 假设，没有line buffer暂存像素数据也没有寄存器暂存读入的像素。每次需要从DDR读3x3=9个像素到卷积计算单元中（假设没有寄存器暂存任何像素），然后才能开始计算，由于卷积的水平垂直滑动步长为1，总共需要读取的数据量为图

## Evidence

- Source: [原始文章](raw/tech/soc-pm/行buffer在逻辑设计中的作用到底是什么？.md) [[../../raw/tech/soc-pm/行buffer在逻辑设计中的作用到底是什么？.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/行buffer在逻辑设计中的作用到底是什么？.md) [[../../raw/tech/soc-pm/行buffer在逻辑设计中的作用到底是什么？.md|原始文章]]
