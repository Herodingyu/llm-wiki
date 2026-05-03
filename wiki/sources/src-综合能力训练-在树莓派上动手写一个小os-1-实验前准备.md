---
doc_id: src-综合能力训练-在树莓派上动手写一个小os-1-实验前准备
title: 综合能力训练：在树莓派上动手写一个小OS（1）：实验前准备
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/综合能力训练：在树莓派上动手写一个小OS（1）：实验前准备.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

5 人赞同了该文章 > 本文节选自《奔跑吧linux内核 入门篇》第二版第16章 学习 [操作系统](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F&zhida_source=entity) 最有效且最具有挑战性的训练是从零开始动手写一个小OS（操作系统）。目前很多国内外知名大学的“操作系统”课程中的实验与动手写一个小OS相关，比如 [麻省理工学院](https://zhida.zhihu.c

## Key Points

### 1. 16.1 实验准备


### 2. 16.1.1 开发流程
我们的开发平台有两个。 1. 软件模拟平台：QEMU [虚拟机](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E8%99%9A%E6%8B%9F%E6%9C%BA&zhida_source=entity) 。

### 3. 16.1.2 配置串口线
要在树莓派上运行BenOS实验代码，我们需要一根USB转串口线，这样在系统启动时便可通过串口输出信息来协助调试。读者可从网上商店购买USB转串口线，图16.1所示是某个厂商售卖的一款USB转串口线。串口一般有3根线。另外，串口还有一根额外的电源线（可选）。

### 4. 16.1.3 寄存器地址
树莓派3B采用的博通BCM2837芯片通过 [内存映射](https://zhida.zhihu.com/search?content_id=197006112&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E6%98%A0%E5%B0%84&zhida_source=entity) 的方式来访问所有的片内外设。外设的寄存器地址空间

## Evidence

- Source: [原始文章](raw/tech/bsp/综合能力训练：在树莓派上动手写一个小OS（1）：实验前准备.md) [[../../raw/tech/bsp/综合能力训练：在树莓派上动手写一个小OS（1）：实验前准备.md|原始文章]]

## Key Quotes

> "本文节选自《奔跑吧linux内核 入门篇》第二版第16章"

> "动手写一个小OS会让我们对计算机底层技术有更深的理解，我们对操作系统中核心功能（比如系统启动、内存管理、进程管理等）的理解也会更深刻。本章介绍了24小实验来引导读者在树莓派上从零开始实现一个小OS，我们把这个OS命名为BenOS"

> "### 16.1.2 配置串口线

要在树莓派上运行BenOS实验代码，我们需要一根USB转串口线，这样在系统启动时便可通过串口输出信息来协助调试。读者可从网上商店购买USB转串口线，图16.1所示是某个厂商售卖的一款USB转串口线。串口一般有3根线。另外，串口还有一根额外的电源线（可选）"

> "树莓派4B采用的是博通BCM2711芯片，BCM2711芯片在BCM2837芯片的基础上做了如下改进"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/综合能力训练：在树莓派上动手写一个小OS（1）：实验前准备.md) [[../../raw/tech/bsp/综合能力训练：在树莓派上动手写一个小OS（1）：实验前准备.md|原始文章]]
