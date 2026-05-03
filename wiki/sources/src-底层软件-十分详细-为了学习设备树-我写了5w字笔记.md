---
doc_id: src-底层软件-十分详细-为了学习设备树-我写了5w字笔记
title: 底层软件  十分详细，为了学习设备树，我写了5w字笔记！
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/底层软件  十分详细，为了学习设备树，我写了5w字笔记！.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 20 人赞同了该文章 1. [compatible属性](https://zhida.zhihu.com/search?content_id=245279727&content_type=Article&match_order=1&q=compatible%E5%B1%9E%E6%80%A7&zhida_source=entity)

## Key Points

### 1. 0、设备树是什么？
我的理解，就是以前对于很多的冗余重复的东西进行来组件化。 以前每个硬件都有自己的代码进行细节描述，但是将这些代码组件化后，你每个板子需要用什么，给你个dts树架子，你需要啥，就选啥，少啥就加啥。 就别重复整了。

### 2. 1、DTS
文件.dts是一种ASCII文本格式的设备树描述，此文本格式非常人性化，适合人类的阅读习惯。但是内核肯定和人不一样，所以就的转换。 基本上，在ARM Linux中，一个.dts文件对应一个ARM的设备，一般放置在内核的arch/arm/boot/dts/目录中。值得注意的是，在arch/powerpc/boot/dts、arch/powerpc/boot/dts、arch/c6x/boot/dts

### 3. 1.1 dts简介
由于一个SoC可能对应多个设备（一个SoC可以对应多个产品和电路板），这些.dts文件势必须包含许多共同的部分，Linux内核为了简化，\*\*把SoC公用的部分或者多个设备共同的部分一般提炼为.dtsi，\*\*类似于C语言的头文件。（我要解析的就是.dtsi文件）

### 4. 1.2 dts例子
上面知道了基础的知识，下来整个栗瞅瞅 ![](https://pic4.zhimg.com/v2-f01d4d67972c46327d052d788111ca4f_1440w.jpg) 先来文字描述：

### 5. 2、DTC（Device Tree Compiler）
**DTC是将.dts编译为.dtb的工具。** DTC的源代码位于内核的scripts/dtc目录中，在Linux内核使能了设备树的情况下，编译内核的时候主机工具DTC会被编译出来，对应于scripts/dtc/Makefile中“hostprogs-y：=dtc”这一hostprogs的编译目标。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/底层软件  十分详细，为了学习设备树，我写了5w字笔记！.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/底层软件  十分详细，为了学习设备树，我写了5w字笔记！.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/底层软件  十分详细，为了学习设备树，我写了5w字笔记！.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/底层软件  十分详细，为了学习设备树，我写了5w字笔记！.md|原始文章]]
