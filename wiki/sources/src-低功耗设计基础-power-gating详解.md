---
doc_id: src-低功耗设计基础-power-gating详解
title: 低功耗设计基础：Power Gating详解
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/低功耗设计基础：Power Gating详解.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · 数字IC后端设计工程师修炼之路](https://www.zhihu.com/column/c_149714285) 硅农 等 169 人赞同了该文章 在低功耗设计领域，最有效的降低功耗的手段莫过于电源关断了。其原因在于不论多低的电压，多小的电流，多慢的速度抑或多小的leakage，都不如将电源完全关闭来的彻底。

## Key Points

### 1. 关断方式
关断方式主要有两种：关闭VDD或者关闭VSS，二者的基本原理也很简单，如下图所示。在实际应用方面以关闭VDD为主，小编接触过的也全部都是关闭VDD的类型。 ![](https://pica.zhimg.com/v2-102b0de236ebdcf4fd23cd42ebbd63c6_1440w.jpg)

### 2. Power Switch Cells
Power switch cell相当于一般电路中的开关，所不同的是，它们并不是由强电电路中的接触开关来实现连接和断开，而是依然通过CMOS电路构造来实现的。但是我们知道，一个MOS管所能通过的电流极其有限，而当需要关断一个或者多个模块的时候，所需要的电流值应该相对很大。因此power switch cell在使用的时候必然是大量cell协同工作的。

### 3. Isolation Cell
当信号从一个模块传入另一个模块，如果输入端的电源关闭，则输出信号可能出现不可预测的数值，若此数值传递出去可能会导致功能出现问题。因此需要将电源关闭模块的输出信号和其他module隔离开来，这时候就需要用到isolation cell。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/低功耗设计基础：Power Gating详解.md) [[../../raw/tech/soc-pm/低功耗设计基础：Power Gating详解.md|原始文章]]

## Key Quotes

> "Retention Register"

> "重磅消息：小编亲自参与制作的数字后端ICC2实践课程上线网易云课堂啦！"

> "## 关断方式

关断方式主要有两种：关闭VDD或者关闭VSS，二者的基本原理也很简单，如下图所示。在实际应用方面以关闭VDD为主，小编接触过的也全部都是关闭VDD的类型"

> "左侧的power switch cell摆放方式很像IO的排列，但是其cell大小一般来说比standard cell大却比IO cell小；右侧的switch cell一般和一般的standard cell差不多大小"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/低功耗设计基础：Power Gating详解.md) [[../../raw/tech/soc-pm/低功耗设计基础：Power Gating详解.md|原始文章]]
