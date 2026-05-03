---
doc_id: src-同型号同款-cpu-为什么会有-体质-之分-yx-huang-的回答
title: 同型号同款 CPU 为什么会有「体质」之分？   yx huang 的回答
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/同型号同款 CPU 为什么会有「体质」之分？ - yx huang 的回答.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

36 人赞同了该回答 ![](https://picx.zhimg.com/50/e4b637349c1a1df842327aa599dcf9ac_720w.jpg?source=2c26e567) 好了，这个十分接近于自己方向的问题。楼上答得都很不错了，我来说下自己的看法。主要是电路设计的角度。在物理成因上的接触不算多，有工艺仔可以出来答答。 任何物品都是非理想的，对于芯片来说说也一样。同批次生产出来的芯片，就是会不同，以下称为 分布 （variability）。这个分布有 硅片 硅片（D2D）不同，也硅片间不同（WID）。这些不同主要的体现就是开关速度（ 门间延时 ），以及 静态功耗 。当

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/同型号同款 CPU 为什么会有「体质」之分？ - yx huang 的回答.md) [[../../raw/tech/soc-pm/同型号同款 CPU 为什么会有「体质」之分？ - yx huang 的回答.md|原始文章]]

## Key Quotes

> "在过去，基本只用考虑D2D分布，因为它决定了一片芯片不同于另一片芯片，简单来说就是电路延时/最高频率的限制（timing closure）。而WID分布则不用考虑，一则这个不同不大，二则因为他们相互可以抵消：一个管子快一个管子慢，最后总延时"

> "而现在28nm往下，大家也越来越看重WID的分布了，特别是对于intel这种CPU，因为频率很高， 寄存器 到寄存器间门很少，相互抵消作用不明显。所以WID的分析越来越重要"

> "在过去，分布产生的主要原因就是 阈值电压 （Vth）的分布，这个阈值电压高了，管子（芯片）就变慢，但是静态功耗就升高了（省电）。静态功耗就是芯片什么活都不干消耗的能量。这个对于Intel这种1.8billion个管子的CPU来说，已经不可忽视了。所以这个阈值电压就是一个平衡，高了不好低了也不好"

> "阈值电压的改变对于Intel这种CPU的速度的影响其实不是很大。相反，那些低电压低功耗的器件（比如医疗用的小感应器）对于阈值电压很敏感，所以过去体质的研究主要在这里"

> "Khang） 上文提到的生产一批次，找出快的片子卖得贵，慢的片子卖得便宜就是属于以上的Post-silicon characterization的办法。据说Intel花了很多时间在这种生产后调试上，而且用了很多年了"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/同型号同款 CPU 为什么会有「体质」之分？ - yx huang 的回答.md) [[../../raw/tech/soc-pm/同型号同款 CPU 为什么会有「体质」之分？ - yx huang 的回答.md|原始文章]]
