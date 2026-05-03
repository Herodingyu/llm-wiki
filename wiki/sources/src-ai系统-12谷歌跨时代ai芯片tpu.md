---
doc_id: src-ai系统-12谷歌跨时代ai芯片tpu
title: AI系统 12谷歌跨时代AI芯片TPU
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-12谷歌跨时代AI芯片TPU.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 7 人赞同了该文章 ![](https://pic3.zhimg.com/v2-b84901e7f9086ad0e4344c0287288748_1440w.jpg)

## Key Points

### 1. 1\. TPU发展历史
谷歌作为互联网公司，在互联网时代积累了海量的数据，当处理这些数据的时候就需要算力，最开始2006年利用数据中心的剩余算力就可以。但是随着手机语音识别功能的需求剧增，那么当时谷歌的数据中心需要双倍的算力才能满足日益增长的计算需求，而仅仅依靠传统 CPU 来满足这种需求是非常昂贵的。于是，在这个背景下，谷歌开始了 TPU 的设计。

### 2. 2\. TPU架构
张量处理单元 (TPU) 是 Google 设计的专用集成电路 (ASIC)，用于加速机器学习工作负载。 [Cloud TPU](https://zhida.zhihu.com/search?content_id=272035182&content_type=Article&match_order=1&q=Cloud+TPU&zhida_source=entity) 是一种 Google Clou

### 3. 3\. TPU V1
第一代 TPU 主要服务于 8 比特的矩阵计算，由 CPU 通过 PCIe 3.0 总线驱动 CISC 指令。采用 28nm 工艺制造，频率为 700MHz，热设计功耗为 40 瓦。 初代 TPU 主要针对 2015 年左右最火的神经网络进行优化，主要分为以下三类：

### 4. 4\. TPU V2
TPU v2 的设计集成了高带宽的存储解决方案，具有 16 GiB 的 HBM，并能够提供最高 600 GB/s 的内存带宽，以及 45 TFLOPS 的浮点运算能力，用于支持更加高效的内存访问、数据操作、和复杂运算。是一个训练卡。

### 5. 4.1 TPUV2相对于V1的改动
改动一： [Vector Memory](https://zhida.zhihu.com/search?content_id=272035182&content_type=Article&match_order=1&q=Vector+Memory&zhida_source=entity)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-12谷歌跨时代AI芯片TPU.md) [[../../raw/tech/soc-pm/AI系统/AI系统-12谷歌跨时代AI芯片TPU.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-12谷歌跨时代AI芯片TPU.md) [[../../raw/tech/soc-pm/AI系统/AI系统-12谷歌跨时代AI芯片TPU.md|原始文章]]
