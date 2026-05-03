---
doc_id: src-ai系统-11ai芯片基础npu
title: AI系统 11AI芯片基础NPU
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-11AI芯片基础NPU.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 9 人赞同了该文章 ![](https://pic2.zhimg.com/v2-26e6c01d0ab07df5d5a5fb767062ce51_1440w.jpg)

## Key Points

### 1. 1\. NPU介绍
![](https://picx.zhimg.com/v2-ee80821e2db883edc269bf58600559c7_1440w.jpg) NPU（Neural network Processing Unit）， 即神经网络处理器。顾名思义，是想用电路模拟人类的神经元和突触结构。

### 2. 1.1 算力介绍
> 什么是算力？ > 算力不是一个计算机的专业术语，感觉更多的是汇报用的，现在大家都在用。 > 简单说就是计算能力，“算力是设备根据内部每秒可处理的信息数据量"。算力实现的核心是CPU、GPU等各类计算芯片，并由计算机、服务器、高性能计算集群和各类智能终端等承载，海量数据处理和各种数字化应用都离不开算力的加工和计算。

### 3. 1.2 AI视觉芯片
AI视觉感知芯片需要具备两大功能：一是看得清，二是看得懂，其中AI-ISP负责的就是看得清，AI-NPU负责看得懂。目前，使用NPU加速的AI视觉芯片已被广泛地应用于大数据、智能驾驶和图像处理领域。 ![](https://pic1.zhimg.com/v2-f855fbaa7c1e3124a3ef6f2a340a2954_1440w.jpg)

### 4. 1.3 NPU实现痛点
![](https://pica.zhimg.com/v2-d281a79c85eb1c841aa5385a8efb9c4a_1440w.jpg) 主要就是内存和功耗两个痛点： 1. 内存：当通过堆MAC单元来拉高算力指标的同时，数据带宽一定要跟上，否则数据供应能力不足，就会带来MAC单元不断等待数据的现象，处理性能就会下降。

### 5. 1.4 NPU硬件架构演进
NPU硬件架构的演进，其总体特性可以归结如下： **软件定义架构：** 当前行业云化和数字化推动软件架构从单体应用架构 - 垂直应用架构 - 分布式架构 -SOA 架构 - 微服务架构的演变。对于大算力NPU的硬件架构而言，其演进也不言而喻，同样需要解决高并发、大吞吐等问题，针对算法的多样性需求，同样需要通过软件定义架构，来实现底层微架构硬件的可配置、可调度、可弹性扩展特性，以及顶层架构的微任务与

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-11AI芯片基础NPU.md) [[../../raw/tech/soc-pm/AI系统/AI系统-11AI芯片基础NPU.md|原始文章]]

## Key Quotes

> "点赞、收藏、在看、划线和评论交流"

> "算力不是一个计算机的专业术语，感觉更多的是汇报用的，现在大家都在用。"

> "简单说就是计算能力，“算力是设备根据内部每秒可处理的信息数据量"。算力实现的核心是CPU、GPU等各类计算芯片，并由计算机、服务器、高性能计算集群和各类智能终端等承载，海量数据处理和各种数字化应用都离不开算力的加工和计算。"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-11AI芯片基础NPU.md) [[../../raw/tech/soc-pm/AI系统/AI系统-11AI芯片基础NPU.md|原始文章]]
