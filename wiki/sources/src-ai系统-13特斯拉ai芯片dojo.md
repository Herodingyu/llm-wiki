---
doc_id: src-ai系统-13特斯拉ai芯片dojo
title: AI系统 13特斯拉AI芯片DOJO
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-13特斯拉AI芯片DOJO.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 1 人赞同了该文章 ![](https://pica.zhimg.com/v2-4e57766c522915292aa5042d94d5fe12_1440w.jpg)

## Key Points

### 1. 1\. DOJO介绍
特斯拉打造自有芯片的原因是， **GPU 并不是专门为处理深度学习训练而设计的** ，这使得GPU在计算任务中的效率相对较低。特斯拉与 Dojo（Dojo既是训练模组的名称，又是内核架构名称） 的目标是“实现最佳的 AI 训练性能。启用 **更大、更复杂的神经网络模型** ，实现高能效且经济高效的计算。” 特斯拉的标准是制造一台比其他任何计算机都更擅长人工智能计算的计算机，从而他们将来不需要再使用

### 2. 2\. 提高带宽的疯狂
![](https://pic1.zhimg.com/v2-1e8e10f759639ab5d106a0e8b7ba431c_1440w.jpg) 进入 AI 时代，所有标榜 AI 性能的芯片厂商，都在追求带宽最大化。比如英伟达为自家 [A100 芯片](https://zhida.zhihu.com/search?content_id=272035390&content_type=Article

### 3. 3\. DOJO架构


### 4. 3.1 设计哲学
Dojo核心是一个8路译码的内核，具有较高吞吐量和4路矩阵计算单元（8x8）以及 1.25 MB 的本地 SRAM。但是Dojo核心的尺寸却不大，相比之下，富士通的A64FX在同一工艺节点上占据的面积是其 **两倍以上** 。

### 5. 3.2 DOJO核
![](https://pic4.zhimg.com/v2-68731fa7c5ebd1226abf46cdf6a60705_1440w.jpg) 每个Dojo核心是带有向量计算/矩阵计算能力的处理器，具有完整的取指、译码、执行部件。Dojo核心具有类似CPU的 风格，似乎比GPU 更能适应不同的算法和分支代码。D1的指令集 **类似于 [RISC-V](https://zhida.zhihu.c

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-13特斯拉AI芯片DOJO.md) [[../../raw/tech/soc-pm/AI系统/AI系统-13特斯拉AI芯片DOJO.md|原始文章]]

## Key Quotes

> "GPU 并不是专门为处理深度学习训练而设计的"

> "都累计布置了 576 个 112Gb 带宽的 SerDes 接口。"

> "D1 芯片内上下左右各 10TB 每秒→D1芯片间上下左右各 4TB 每秒→5x5 D1 芯片方阵各边 9TB 每秒→Tile 与 Tile 之间最高 36TB 每秒。"

> "每一块 Tile 上面都封装着 25 块 D1 芯片，总算力高达 9PFLOPS，芯片四周扩散出每边 9TB 每秒的超高速通信接口，然后上下则分别连接着水冷散热，以及供电模块。"

> "点赞、收藏、在看、划线和评论交流"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-13特斯拉AI芯片DOJO.md) [[../../raw/tech/soc-pm/AI系统/AI系统-13特斯拉AI芯片DOJO.md|原始文章]]
