---
doc_id: src-corner的分类
title: corner的分类
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/corner的分类.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · IC物理设计专栏](https://www.zhihu.com/column/c_1264992427053891584) 36 人赞同了该文章 > Corner可以分为对晶体管的偏差建模的 [PVT corner](https://zhida.zhihu.com/search?content_id=120911189&content_type=Article&match_order=1&q=PVT+corner&zhida_source=entity) ，以及对互联线偏差建模的 [RC Corner](https://zhida.zhihu.com/search?content

## Key Points

### 1. PVT corner
PVT corner需要覆盖全局工艺偏差，温度偏差以及电压偏差。

### 2. process corner
Lot 与 Lot 之间, Wafer Wafer之间, Die 和 Die之间的工艺的偏差都是全局工艺偏差。 全局工艺偏差的差别远大于局部工艺偏差的影响（local process variation）

### 3. voltage corner
晶体管的速度随着电压的升高而提高。 因此，时序签收时需要考虑极限电压的情况，以保证芯片在整个电压范围能够正常工作。

### 4. temprature corner
温度会影响晶体管的速度。 时序签收时，需要能够保证芯片在设计的整个温度范围能够正常工作。 由于结温与环境温度的差异，需保留足够的设计余量。

### 5. RC Corner
工艺与温度会对芯片内部的互联线以及via的电阻，电容造成影响。 RC Corner用于对互联线的偏差进行建模。 常用的RC Corner Typical Cbest Cworst RCbest RCworst

## Evidence

- Source: [原始文章](raw/tech/soc-pm/corner的分类.md) [[../../raw/tech/soc-pm/corner的分类.md|原始文章]]

## Key Quotes

> "PVT Corner用于描述晶体管的全局工艺偏差。 RC Corner 用于描述互联线工艺偏差。"

> "### process corner

Lot 与 Lot 之间, Wafer Wafer之间, Die 和 Die之间的工艺的偏差都是全局工艺偏差"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/corner的分类.md) [[../../raw/tech/soc-pm/corner的分类.md|原始文章]]
