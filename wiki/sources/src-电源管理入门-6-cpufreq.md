---
doc_id: src-电源管理入门-6-cpufreq
title: 电源管理入门 6 CPUFreq
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-6 CPUFreq.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 4 人赞同了该文章 ![](https://pic1.zhimg.com/v2-edf9f14538f8479e3c95f99ca2c1aa3c_1440w.jpg)

## Key Points

### 1. 1\. 整体介绍


### 2. 1.1 DVFS
![](https://pic2.zhimg.com/v2-1a9d3682a70179dac1e385bd8d16e461_1440w.jpg) DVFS（Dynamic Voltage and Frequency Scaling）即动态电压频率调整。这项技术可以根据芯片运行的应用程序的计算需求制定策略，动态调整电压和频率：

### 3. 1.2 Linux 软件流程框图
[CPUFreq](https://zhida.zhihu.com/search?content_id=272281611&content_type=Article&match_order=1&q=CPUFreq&zhida_source=entity) 系统流程：

### 4. 2\. 相关代码介绍


### 5. 2.1 整体代码框架
内核目前有一套完整的代码支持DVFS，具体可参考内核下drivers/cpufreq/。 ![](https://pic3.zhimg.com/v2-90350b5ab963b36ef784b944799f6f08_1440w.jpg)

## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-6 CPUFreq.md) [[../../raw/tech/bsp/电源管理/电源管理入门-6 CPUFreq.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-6 CPUFreq.md) [[../../raw/tech/bsp/电源管理/电源管理入门-6 CPUFreq.md|原始文章]]
