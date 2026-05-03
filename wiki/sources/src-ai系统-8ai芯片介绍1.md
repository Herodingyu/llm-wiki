---
doc_id: src-ai系统-8ai芯片介绍1
title: AI系统 8AI芯片介绍1
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-8AI芯片介绍1.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 1 人赞同了该文章 ![](https://pic3.zhimg.com/v2-e91c13f7f349e691c10003aa60192198_1440w.jpg)

## Key Points

### 1. 1\. AI芯片介绍
![](https://pic2.zhimg.com/v2-b2da2a8ee37e850308e72fc9105bd37f_1440w.jpg) AI计算中可以用到的四种芯片类型： - **CPU** ：CPU 是冯诺依曼架构下的处理器，遵循“Fetch （取指）-Decode （译码）- Execute （执行）- Memory Access （访存）-Write Back （写回）”的处理流

### 2. 2\. AI计算特点介绍


### 3. 2.1 AI运算的类型
> 首先一个问题：AI计算都在做哪些运算？ ![](https://picx.zhimg.com/v2-ba8c9e2012dc3d3a610fe5e012846c31_1440w.jpg) 下图是一个经典的图像分类的卷积神经网络结构，网络结构从左到右有多个网络模型层数组成，每一层都用来提取更高维的目标特征（这些中间层的输出称为特征图，特征图数据是可以通过可视化工具展示出来的，用来观察每一层的神经

### 4. 2.2 AI芯片的关键指标
![](https://pic2.zhimg.com/v2-707a39df806ed0653c96c8a5ff7a3903_1440w.jpg) 芯片制程，内存大小，核心数，带宽，算力等，这些指标体现了 AI 产品的核心竞争力。 一些基本概念介绍如下：

### 5. 2.3 AI芯片关键设计点
![](https://picx.zhimg.com/v2-23341d4477dcd973035078bd09ec4697_1440w.jpg) AI 芯片设计的关键点围绕着如何提高吞吐量和降低时延，以及低时延和 Batch Size 之间权衡。具体的实现策略主要表现在 MACs 和 [PE](https://zhida.zhihu.com/search?content_id=272034529

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-8AI芯片介绍1.md) [[../../raw/tech/soc-pm/AI系统/AI系统-8AI芯片介绍1.md|原始文章]]

## Key Quotes

> "需要有灵活的软件配置接口，支持更多的神经网络模型结构"

> "提供不同的 bit 位数的计算单元"

> "提供不同的 bit 位数存储格式"

> "利用硬件提供专门针对稀疏结构计算的优化逻辑"

> "硬件提供专门针对量化压缩算法的硬件电路"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-8AI芯片介绍1.md) [[../../raw/tech/soc-pm/AI系统/AI系统-8AI芯片介绍1.md|原始文章]]
