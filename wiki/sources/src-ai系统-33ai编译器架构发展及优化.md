---
doc_id: src-ai系统-33ai编译器架构发展及优化
title: AI系统 33AI编译器架构发展及优化
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-33AI编译器架构发展及优化.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) ![](https://picx.zhimg.com/v2-2b802928dc3bad3266e643d090dc7355_1440w.jpg) 之前文章： [AI系统-32AI编译器介绍](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247487554%26idx%3D1%26sn%3D58c6446009

## Key Points

### 1. 1\. 典型AI编译器架构


### 2. 1.1 专用AI编译器架构
现有 [AI 编译器架构](https://zhida.zhihu.com/search?content_id=272216317&content_type=Article&match_order=1&q=AI+%E7%BC%96%E8%AF%91%E5%99%A8%E6%9E%B6%E6%9E%84&zhida_source=entity) 即是专用 AI 编译器的架构：在表达上以 [PyTor

### 3. 1.2 通用AI编译器架构
在开始的时候各家显然都不是基于PyTorch，基本各个大厂都有自己的编译器架构，例如谷歌的 [TensorFlow](https://zhida.zhihu.com/search?content_id=272216317&content_type=Article&match_order=1&q=TensorFlow&zhida_source=entity) 、百度的 [飞浆](https://zh

### 4. 1.2.1 编译器前端
编译器前端（Compiler Frontend）主要负责接收和处理来自不同 AI 框架的模型，并将其转换为通用的中间表示（IR），进行初步优化。 编译器前端的组成集中展示在上图中间靠左部分。输入的神经网络模型格式可以来自多种框架（如 TensorFlow、PyTorch 等）；这些模型通过符号表示的转换（如 [TVM](https://zhida.zhihu.com/search?content_

### 5. 1.2.2 编译器后端
编译器后端（Compiler Backend）负责将优化后的计算图转换为特定硬件平台的低层次表示，并进行硬件特定优化和代码生成。 编译器后端的组成集中展示再上图中间靠右部分。首先进行硬件特定的优化，包括内在映射、内存分配、内存延迟隐藏、循环优化、并行化等；这些优化通过自动调度（如多面体模型）和手动调度（如 [Halide](https://zhida.zhihu.com/search?conten

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-33AI编译器架构发展及优化.md) [[../../raw/tech/soc-pm/AI系统/AI系统-33AI编译器架构发展及优化.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-33AI编译器架构发展及优化.md) [[../../raw/tech/soc-pm/AI系统/AI系统-33AI编译器架构发展及优化.md|原始文章]]
