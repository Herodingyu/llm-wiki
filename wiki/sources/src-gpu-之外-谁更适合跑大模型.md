---
doc_id: src-gpu-之外-谁更适合跑大模型
title: GPU 之外，谁更适合跑大模型？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/industry/ai/芯片与算力/GPU 之外，谁更适合跑大模型？.md
domain: industry/ai
created: 2026-05-09
updated: 2026-05-09
tags: [ai]
---

## Summary

JW *2026年5月5日 09:44* 本文基于论文 *The xPU-athalon: Quantifying the Competition of AI Acceleration* 展开。论文作者为 Alicia Golden、Carole-Jean Wu、Gu-Yeon Wei、David Brooks，来自 Harvard University 与 FAIR at Meta。论文版本为 arXiv:2604.10852v1，发布日期是 2026 年 4 月 12 日。 如果只用一句话概括这篇论文，我会这样说：

## Key Points

### 1. 先说结论：这不是一张 AI 芯片排行榜
如果你只想先拿走判断，可以记住三句话。 第一， **GPU 之外的 AI 加速器确实有优势，但优势不是通吃** 。 Cerebras 在低 batch、低延迟和片内通信能耗上很有特点；Groq 在部分小尺度计算 primitive 上非常快；SambaNova 在高吞吐和 fused kernel 场景里有空间；TPU、MI300、H100 在更偏规模化吞吐或成熟生态的场景里仍然会回到 Paret

### 2. 一、为什么现在需要重新比较 AI 加速器
过去十多年，AI 计算基本是 GPU 的时代。 CUDA、cuDNN、NCCL、TensorRT、PyTorch、Megatron、vLLM、FlashAttention、NVLink、NVSwitch、DGX、HGX、机柜级系统，这些东西叠在一起，构成了 NVIDIA 最强的护城河。

### 3. 二、论文先统一语言：别被各家术语带偏
AI 加速器特别容易被术语污染。 Cerebras 讲 wafer。 SambaNova 讲 RDU、PMU、PCU。 Groq 讲 LPU。 Gaudi 讲 TPC。 TPU 讲 systolic array。

### 4. 三、roofline 看上去 Cerebras 很强，但单加速器比较不公平
论文用 roofline 模型比较各平台的计算和内存能力。 从单 accelerator 粒度看，Cerebras CS-3 的峰值吞吐比当代 GPU 高大约两个数量级。这个数字很震撼，但论文马上提醒：这不是 apples-to-apples。

### 5. 四、测量本身就很难：每个平台暴露的指标不一样
论文第三节讲 measurement methodology，这部分很工程，也很重要。 作者不是只调用云 API 看 token/s，而是尽量拿到物理硬件做 profiling。 因为如果只看 API，最多知道端到端延迟，很难知道底层功耗、kernel 行为、utilization、温度、通信和编译成本。

## Evidence

- Source: [原始文章](raw/industry/ai/芯片与算力/GPU 之外，谁更适合跑大模型？.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/industry/ai/芯片与算力/GPU 之外，谁更适合跑大模型？.md)
