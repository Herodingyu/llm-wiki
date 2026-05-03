---
doc_id: src-soc低功耗-avs与dvfs
title: SOC低功耗 AVS与DVFS
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/SOC低功耗 AVS与DVFS.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · SOC学习](https://www.zhihu.com/column/c_1792243028209037312) 29 人赞同了该文章 由于工艺，温度，老化程度等原因，每个器件满足性能所需要的最小电压是动态变化的。AVS（Adaptive Voltage Scaling）是一种动态调整供电电压的技术，通过为每类器件分配其所需的最小电压，在满足性能需求的同时最小化功耗。

## Key Points

### 1. AVS
由于工艺，温度，老化程度等原因，每个器件满足性能所需要的最小电压是动态变化的。AVS（Adaptive Voltage Scaling）是一种动态调整供电电压的技术，通过为每类器件分配其所需的最小电压，在满足性能需求的同时最小化功耗。

### 2. DVFS
DVFS（Dynamic Voltage Frequency Scaling）是指根据系统负载动态调整电源电压（VDD）和时钟频率（FCLK）的技术，其核心目标是在性能需求与功耗之间取得平衡。看上去和AVS很像，但DVFS中电压和频率是提前设置好的离散值，软件根据当前任务负载决定把电压频率调整到哪个值。所以AVS省功耗的能力比DVFS更强，但是实现起来也更复杂。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/SOC低功耗 AVS与DVFS.md) [[../../raw/tech/soc-pm/SOC低功耗 AVS与DVFS.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/SOC低功耗 AVS与DVFS.md) [[../../raw/tech/soc-pm/SOC低功耗 AVS与DVFS.md|原始文章]]
