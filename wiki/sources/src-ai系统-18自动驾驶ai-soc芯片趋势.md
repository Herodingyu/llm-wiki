---
doc_id: src-ai系统-18自动驾驶ai-soc芯片趋势
title: AI系统 18自动驾驶AI SoC芯片趋势
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-18自动驾驶AI SoC芯片趋势.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 2 人赞同了该文章 ![](https://pic1.zhimg.com/v2-4a4b7792af7ac9c9bb76b5d5826e961c_1440w.jpg)

## Key Points

### 1. 1\. SoC组成相关
> MCU是SoC的不？ > \--是的。系统级芯片(SoC)是一个将计算处理器和其它电子系统集成到单一芯片的集成电路。尽管微控制器(MCU)通常只有不到100 kB的RAM，但是事实上它是一种简易、功能弱化的SoC。

### 2. 2\. 芯片软硬件分工
参考之前芯片设计文章： [芯片-设计流程入门](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484755%26idx%3D1%26sn%3D30d4fc8dbda1bcc0d04b228932bbf6f4%26chksm%3Dfa5283

### 3. 3\. 新技术趋势


### 4. 3.1 异构计算
计算子系统通常包含 **CPU、GPU、以及AI处理器** 等同构或异构的计算单元。 随着 **人工智能** 应用及技术的成熟，对于AI终端运行及计算的高效、可靠、稳定的需求与日俱增，不同的应用场景对于芯片PPA的需求存在差异，单个内核已经达不到AI应用场景所需的多通路多运算流并且兼顾功耗及运算资源的目的。所以 **异构多核** 计算技术成了应对这些应用最好的解决方案。

### 5. 3.2 存储单元
存储子系统通常会采用 **DDR/LPDDR/HBM/GDDR** 等标准的大容量外部动态随机存储器，以及基于 **SRAM** 的静态高速片上存储器。 在AI芯片里面，NPU的瓶颈一大部分就是 **存储速率跟不上** ，所以需要采用LPDDR5、SRAM等更高速的存储技术。另外 **存储容量也在增大** ，以空间换时间，把海量数据直接放入高速内存中，运算更快。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-18自动驾驶AI SoC芯片趋势.md) [[../../raw/tech/soc-pm/AI系统/AI系统-18自动驾驶AI SoC芯片趋势.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-18自动驾驶AI SoC芯片趋势.md) [[../../raw/tech/soc-pm/AI系统/AI系统-18自动驾驶AI SoC芯片趋势.md|原始文章]]
