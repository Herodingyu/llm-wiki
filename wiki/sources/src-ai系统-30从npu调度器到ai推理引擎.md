---
doc_id: src-ai系统-30从npu调度器到ai推理引擎
title: AI系统 30从NPU调度器到AI推理引擎
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-30从NPU调度器到AI推理引擎.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 1 人赞同了该文章 ![](https://pic2.zhimg.com/v2-78a11f6b04524f5e0329de05d6f8642b_1440w.jpg)

## Key Points

### 1. 1\. NPU调度器介绍
这里还以华为的 [Ascend](https://zhida.zhihu.com/search?content_id=272215982&content_type=Article&match_order=1&q=Ascend&zhida_source=entity) 为例，参考： [zhuanlan.zhihu.com/p/70](http://zhuanlan.zhihu.com/p/70714

### 2. 2\. 调度器的设计
![](https://pic4.zhimg.com/v2-cca530fb34bc801d604d78a0798148b3_1440w.jpg) 如上图是AI芯片中A核负责任务分发，Accelerators也就是NPU负责任务执行，其拥有大量异构加速器的软硬件系统。由于加速器可能需要使用CPU生产的数据，因此内存的coherence和consistence的设计十分具有挑战。并且操作系统的堆栈、

### 3. 2.1 调度模型
![](https://pic4.zhimg.com/v2-c3b80c1eaa1a00208e67c433c2555719_1440w.jpg) 学界和工业界一直在寻找不同级别的并行编程模型来提高计算性能，通常的并行编程模型有ILP (Instruction Level Parallelism)、TLP (Thread Level Parallelism)和DLP (Data Level Par

### 4. 2.2 软件调度器
通常，基于task的并行计算环境由两个组件组成： （1）任务并行API （2）任务runtime系统。 前者定义了开发人员描述并行性、依赖性、数据分发等的方式，而后者定义了环境的效率和能力。runtime确定了支持的体系结构、调度的目标、调度策略和异常处理等。但是，这种基于软件的调度器具有固有的缺点：

### 5. 2.3 硬件调度器
![](https://pic2.zhimg.com/v2-2e184e3c88cd43e37bcd753872e4b1cf_1440w.jpg) 如果NPU系统中包含一个SoC级别的硬件任务调度器，则可以大大减轻上述缺点，编译器可以编译出细粒度的任务来充分利用细粒度的并行。如上图，将 [HTS](https://zhida.zhihu.com/search?content_id=27221598

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-30从NPU调度器到AI推理引擎.md) [[../../raw/tech/soc-pm/AI系统/AI系统-30从NPU调度器到AI推理引擎.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-30从NPU调度器到AI推理引擎.md) [[../../raw/tech/soc-pm/AI系统/AI系统-30从NPU调度器到AI推理引擎.md|原始文章]]
