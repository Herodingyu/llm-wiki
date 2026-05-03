---
doc_id: src-fpga的asic原型验证-总体概览
title: FPGA的ASIC原型验证——总体概览
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/FPGA的ASIC原型验证——总体概览.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · 一个AI芯片的FPGA原型验证](https://www.zhihu.com/column/c_1210541663111946240) 57 人赞同了该文章 随着芯片性能的提高、集成越来越多的SOC、IP，芯片的复杂度也愈发复杂，给芯片验证带来了资金和时间上挑战。FPGA可以进行 [RTL验证](https://zhida.zhihu.com/search?content_id=111720014&content_type=Article&match_order=1&q=RTL%E9%AA%8C%E8%AF%81&zhida_source=entity) 、加速仿真进度、提前进

## Key Points

### 1. 前言
随着芯片性能的提高、集成越来越多的SOC、IP，芯片的复杂度也愈发复杂，给芯片验证带来了资金和时间上挑战。FPGA可以进行 [RTL验证](https://zhida.zhihu.com/search?content_id=111720014&content_type=Article&match_order=1&q=RTL%E9%AA%8C%E8%AF%81&zhida_source=entity

### 2. FPGA资源
下面对FPGA的资源逐一对比，如下表格所示。除了普通的RTL逻辑和基本端口，其他的类似存储时钟DSP等，最好都手动映射，这也意味着ASIC在转为FPGA验证平台中哪些内容是需要重点关注的，并手动分配的。

### 3. FPGA的ASIC的原型验证步骤
1. FPGA仿真平台选型 2. 把ASIC转成FPGA代码 3. FPGA综合分析 4. 载入软件运行，调试 5. 软硬件系统协同验证

### 4. FPGA仿真平台
FPGA仿真平台选型主要关心一下几个方面： 1. 容量：门数按照多一倍预估、Block RAM、时钟资源尽量多 2. 内置IP：首要考虑，按照需求支持PCIE、DDR4等 3. 接口：IO一般来说都够用

### 5. ASIC代码转为FPGA代码
一般纯的RTL可以直接综合成对应资源，但是pad、Gate-level netlists、SOC cell、SOC Memory、特殊IP、BIST、Gated Clock、Clock无法这样做，我们需要做特殊的调整。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/FPGA的ASIC原型验证——总体概览.md) [[../../raw/tech/soc-pm/FPGA的ASIC原型验证——总体概览.md|原始文章]]

## Key Quotes

> "但是，我们也要看到FPGA原型的一些限制：

1"

> "速度限制：芯片的频率在一般1GHz以上，但是FPGA中的频率在20MHz以下，在多片FPGA的芯片验证中甚至低于5MHz；
3"

> "在FPGA的ASIC验证中，我们需要对ASIC的代码做相应修改，以完成对应功能，甚至有些IP是无法覆盖的"

> "## FPGA资源

下面对FPGA的资源逐一对比，如下表格所示。除了普通的RTL逻辑和基本端口，其他的类似存储时钟DSP等，最好都手动映射，这也意味着ASIC在转为FPGA验证平台中哪些内容是需要重点关注的，并手动分配的"

> "### ASIC代码转为FPGA代码

一般纯的RTL可以直接综合成对应资源，但是pad、Gate-level netlists、SOC cell、SOC Memory、特殊IP、BIST、Gated Clock、Clock无法这样做，我们需要做特殊的调整"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/FPGA的ASIC原型验证——总体概览.md) [[../../raw/tech/soc-pm/FPGA的ASIC原型验证——总体概览.md|原始文章]]
