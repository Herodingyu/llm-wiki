---
doc_id: src-电源管理入门-7-devfreq
title: 电源管理入门 7 DevFreq
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-7 DevFreq.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 1 人赞同了该文章 ![](https://pic1.zhimg.com/v2-42c48b0ea1e55f615d80ef27e36a2c7e_1440w.jpg)

## Key Points

### 1. 1\. 整体介绍


### 2. 1.1 Devfreq基础概念
> OPP： > 复杂SoC由多个子模块协同工作组成,在运行中并非SoC中的所有模块都需要始终保持最高性能。为方便起见，将SoC中的子模块分组为域，从而允许某些域以较低的电压和频率运行，而其他域以较高的电压/频率对运行。对于这些设备支持的频率和电压对，我们称之为OPP（Operating Performance Point）。对于具有OPP功能的非CPU设备，本文称之为OPP device，需要通

### 3. 1.2 devfreq框图
![](https://pic4.zhimg.com/v2-2e10f2b99f826bfd341c7c08a4ba35ed_1440w.jpg) 整个devfreq framework中的三大部分组成：

### 4. 1.3 sysfs用户接口
这里以DDR为例：/sys/devices/platform/dmc0/devfreq/devfreq0目录下面 ![](https://picx.zhimg.com/v2-7e5fe5221138cd891eb49cf539eb0a47_1440w.jpg)

### 5. 2\. Linux 关键数据结构和API实现


## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-7 DevFreq.md) [[../../raw/tech/bsp/电源管理/电源管理入门-7 DevFreq.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-7 DevFreq.md) [[../../raw/tech/bsp/电源管理/电源管理入门-7 DevFreq.md|原始文章]]
