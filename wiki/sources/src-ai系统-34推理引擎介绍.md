---
doc_id: src-ai系统-34推理引擎介绍
title: AI系统 34推理引擎介绍
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-34推理引擎介绍.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) ![](https://pic1.zhimg.com/v2-4ad300ac9a2211bcc1299ba7d2b78f42_1440w.jpg) 本文首先介绍下 [AI推理引擎](https://zhida.zhihu.com/search?content_id=272280220&content_type=Article&match_order=1&q=AI%E6%8E%A8%E7%90%86%E5%BC%95%E6%93%8E&zhida_source=en

## Key Points

### 1. 1\. 推理系统介绍


### 2. 1.1 训练和推理流程介绍
训练过程通过设定数据处理方式，并设计合适的网络模型结构以及损失函数和优化算法，在此基础上将数据集以小批量（mini-batch）反复进行前向计算并计算损失，然后反向计算梯度利用特定的优化函数来更新模型，来使得损失函数达到最优的结果。训练过程最重要的就是梯度的计算和反向传播。

### 3. 1.2 推理引擎概念
![](https://pica.zhimg.com/v2-9884452729977bc9c057c581c60527e6_1440w.jpg) **推理系统** ，是一个专门用于部署神经网络模型，执行推理预测任务的 AI 系统。它类似于传统的 Web 服务或移动端应用系统，但专注于 AI 模型的部署与运行。推理系统会加载模型到内存，并进行版本管理，确保新版本能够顺利上线，旧版本能够安全回滚。此

### 4. 1.3 推理引擎部署
![](https://pic4.zhimg.com/v2-d903432018450cd066dd3e89f64f5313_1440w.jpg) 除了云端的部署，神经网络模型的另一大场景就是边缘（Edge）部署，随着越来越多的物联网设备智能化，越来越多的移动端系统中开始部署神经网络模型。移动端部署应用常常有以下场景：智能设备，智慧城市，智能工业互联网，智慧办公室等。

### 5. 方式一：边缘设备计算
第一种就是纯粹在边缘里面去做一个推理的，包括在手机、耳机还有手环上面，去做一个简单的推理，如下图所示。许多研究工作都集中在如何减少深度学习在资源受限的设备上执行时的延迟。 在这里，我们描述了在高效硬件和 DNN 模型设计方面的主要优化：

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-34推理引擎介绍.md) [[../../raw/tech/soc-pm/AI系统/AI系统-34推理引擎介绍.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-34推理引擎介绍.md) [[../../raw/tech/soc-pm/AI系统/AI系统-34推理引擎介绍.md|原始文章]]
