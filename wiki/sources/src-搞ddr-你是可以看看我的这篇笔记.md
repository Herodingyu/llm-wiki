---
doc_id: src-搞ddr-你是可以看看我的这篇笔记
title: 搞DDR，你是可以看看我的这篇笔记
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/搞DDR，你是可以看看我的这篇笔记.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · SoC知识百宝箱](https://www.zhihu.com/column/c_1892355985563169100) 不坠青云之志、LogicJitterGibbs 等 218 人赞同了该文章 - [搞DDR，你必须得看看我的这篇笔记（一）：DRAM](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247499731%26idx%3D1%26sn%3Ded6d2d9c7c1394cb2e14e06d816ca6d3%26c

## Key Points

### 1. DFI
**内存控制器逻辑和PHY接口是DDR内存系统中的两个主要设计元素** ，这些系统几乎应用于所有电子系统设计中，从手机、机顶盒到计算机和网络路由器。内存系统的这两个组件需要一套独特且不同的工程技能、工具和方法，因此，它们通常由不同的工程团队开发，或者从不同的第三方设计知识产权（IP）供应商处获得。

### 2. DDRPHY内部
过了DFI， **这下就应该到PHY的内部了。** DDR内存接口IP解决方案包括DDR控制器、PHY和接口。当我们提到DDR内存子系统时，我们指的是主机片上系统（SoC）控制和访问DDR内存，以及主机和DDR内存设备之间的接口和互连（通常是PCB），以及DDR SDRAM设备本身。

### 3. PHY的初始化
控制器的初始化序列包括以下几个阶段： - PHY初始化 - DRAM初始化 - Data training 此图展示了PHY初始化序列的高级图示。 ![](https://pic3.zhimg.com/v2-f7561d4fc96f0198aef8d933dd32ce16_1440w.jpg)

### 4. Data Eye Training是做什么的？
Data Eye Training（数据眼图训练）是内存接口（如DDR、LPDDR等）中的一项关键技术，旨在优化数据传输的质量和可靠性。随着时钟频率的不断提高，数据眼图的宽度变得越来越窄，这增加了数据采样的难度。数据眼图训练通过一系列自动或手动的调整过程，确保数据信号在最佳的时间窗口内被准确捕获和传输。

### 5. 阻抗校准
PHY包括校准I/O单元和有限状态机逻辑，用于自动补偿输出驱动强度和片内终止强度，以适应工艺、电压和温度的变化。

## Evidence

- Source: [原始文章](raw/tech/dram/搞DDR，你是可以看看我的这篇笔记.md) [[../../raw/tech/dram/搞DDR，你是可以看看我的这篇笔记.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/搞DDR，你是可以看看我的这篇笔记.md) [[../../raw/tech/dram/搞DDR，你是可以看看我的这篇笔记.md|原始文章]]
