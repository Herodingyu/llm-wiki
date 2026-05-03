---
doc_id: src-深入理解cpu和异构计算芯片gpufpgaasic-下篇
title: 深入理解CPU和异构计算芯片GPUFPGAASIC （下篇）
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/深入理解CPU和异构计算芯片GPUFPGAASIC （下篇）.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · 服务器运维与安全](https://www.zhihu.com/column/kxkid) 60 人赞同了该文章 这里CPU计算能力用Intel的 [Haswell架构](https://zhida.zhihu.com/search?content_id=2585673&content_type=Article&match_order=1&q=Haswell%E6%9E%B6%E6%9E%84&zhida_source=entity) 进行分析，Haswell架构上计算单元有2个 [FMA](https://zhida.zhihu.com/search?content_id=25

## Key Points

### 1. 3.2.1 CPU计算能力分析
这里CPU计算能力用Intel的 [Haswell架构](https://zhida.zhihu.com/search?content_id=2585673&content_type=Article&match_order=1&q=Haswell%E6%9E%B6%E6%9E%84&zhida_source=entity) 进行分析，Haswell架构上计算单元有2个 [FMA](https://

### 2. 3.2.2 GPU计算能力分析
[GPU](https://link.zhihu.com/?target=https%3A//www.qcloud.com/document/product/560/8015%3FfromSource%3Dgwzcw.57431.57431.57431) 主要擅长做类似图像处理的并行计算，所谓的“粗粒度并行（coarse-grain parallelism）”。图形处理计算的特征表现为高密度的计算

### 3. 3.2.3 FPGA计算能力分析
[FPGA](https://link.zhihu.com/?target=https%3A//www.qcloud.com/document/product/565/8220%3FfromSource%3Dgwzcw.57433.57433.57433) 作为一种高性能、低功耗的可编程芯片，可以根据客户定制来做针对性的算法设计。所以在处理海量数据的时候，FPGA 相比于CPU 和GPU，优势在于

### 4. 3.2.4 ASIC计算能力分析
ASIC是一种专用芯片，与传统的通用芯片有一定的差异。是为了某种特定的需求而专门定制的芯片。ASIC芯片的计算能力和计算效率都可以根据算法需要进行定制，所以ASIC与通用芯片相比，具有以下几个方面的优越性：体积小、功耗低、计算性能高、计算效率高、芯片出货量越大成本越低。但是缺点也很明显：算法是固定的，一旦算法变化就可能无法使用。目前人工智能属于大爆发时期，大量的算法不断涌出，远没有到算法平稳期，A

### 5. 3.3平台性能和功耗比较
由于不同的芯片生产工艺，对芯片的功耗和性能都有影响，这里用相同工艺或者接近工艺下进行对比，ASIC芯片还没有商用的芯片出现，Google的TPU也只是自己使用没有对外提供信息，这里ASIC芯片用在学术论文发表的《 [DianNao](https://zhida.zhihu.com/search?content_id=2585673&content_type=Article&match_order=

## Evidence

- Source: [原始文章](raw/tech/soc-pm/深入理解CPU和异构计算芯片GPUFPGAASIC （下篇）.md) [[../../raw/tech/soc-pm/深入理解CPU和异构计算芯片GPUFPGAASIC （下篇）.md|原始文章]]

## Key Quotes

> "CPU芯片结构是否可以充分发挥浮点计算能力？CPU的指令执行过程是：取指令 ->指令译码 ->指令执行，只有在指令执行的时候，计算单元才发挥作用，这样取指令和指令译码的两段时间，计算单元是不在工作的，如图4所示"

> "FPGA的英文缩写名翻译过来，全称是现场可编程逻辑门阵列，这个名称已经揭示了FPGA的功能，它就是一堆逻辑门电路的组合，可以编程，还可以重复编程。图8展示了可编程FPGA的内部原理图"

> "FPGA芯片结构是否可以充分发挥浮点计算能力？FPGA由于算法是定制的，所以没有CPU和GPU的取指令和指令译码过程，数据流直接根据定制的算法进行固定操作，计算单元在每个时钟周期上都可以执行，所以可以充分发挥浮点计算能力，计算效率高于CPU和GPU"

> "另外，如果出货量大的话，工厂大规模生产玩具的成本会比用乐高积木做便宜许多。FPGA 和 ASIC 也是如此，在同一时间点上用最好的工艺实现的 ASIC 的加速器的速度会比用同样工艺 FPGA 做的加速器速度快 5-10 倍，而且一旦量产后 ASIC 的成本会远远低于 FPGA 方案"

> "讲了这么多，当遇到业务瓶颈的需要异构计算芯片的时候，你是否能够根据业务特性和芯片特性选择出合适的芯片呢"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/深入理解CPU和异构计算芯片GPUFPGAASIC （下篇）.md) [[../../raw/tech/soc-pm/深入理解CPU和异构计算芯片GPUFPGAASIC （下篇）.md|原始文章]]
