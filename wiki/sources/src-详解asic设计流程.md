---
doc_id: src-详解asic设计流程
title: 详解ASIC设计流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/详解ASIC设计流程.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[ 收录于 · 电子、信息、半导体科普 ](https://www.zhihu.com/column/c_1251280157618802688)

## Key Points

### 1. 目录
--- ***需求(Requirements)*** ***技术指标(Specifications)*** ***架构(Architecture)*** ***数字设计(Digital Design)***

### 2. 写在前面
**[参考资料](https://link.zhihu.com/?target=https%3A//www.chipverify.com/verilog/asic-soc-chip-design-flow)** **[博客首页](https://link.zhihu.com/?target=https%3A//blog.csdn.net/Reborn_Lee)** 还记得去年应届生秋招，出身于FP

### 3. 正文
典型的设计流程遵循以下所示的结构，可以分为多个步骤。 这些阶段中的某些阶段并行发生，而某些阶段依次发生。 我们将研究当今行业中典型的项目设计周期的情况。 ![](https://pic3.zhimg.com/v2-393f9eba352f75ef5d984c76c6641492_1440w.jpg)

### 4. 需求(Requirements)
半导体公司的客户通常是其他一些计划在其系统或最终产品中使用该芯片的公司。 因此，客户的需求在决定如何设计芯片方面也起着重要作用。当然，第一步就是收集需求，估算最终产品的市场价值，并评估完成该项目所需的资源数量。

### 5. 技术指标(Specifications)
下一步将是收集“规范”，这些规范抽象地描述了要设计的芯片的功能，接口和总体架构。这可能类似于： 1.需要计算能力才能运行成像算法以支持虚拟现实 2.需要两个具有相干互连功能的ARMA 53处理器，并且应在600MHz上运行 3.需要USB 3.0，蓝牙和PCle第二代接口 4.应使用适当的控制器支持1920x1080像素显示

## Evidence

- Source: [原始文章](raw/tech/soc-pm/详解ASIC设计流程.md) [[../../raw/tech/soc-pm/详解ASIC设计流程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/详解ASIC设计流程.md) [[../../raw/tech/soc-pm/详解ASIC设计流程.md|原始文章]]
