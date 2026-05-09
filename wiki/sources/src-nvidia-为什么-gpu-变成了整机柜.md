---
doc_id: src-nvidia-为什么-gpu-变成了整机柜
title: NVIDIA：为什么 GPU 变成了整机柜？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/industry/ai/芯片与算力/NVIDIA：为什么 GPU 变成了整机柜？.md
domain: industry/ai
created: 2026-05-09
updated: 2026-05-09
tags: [ai]
---

## Summary

JW *2026年5月3日 12:53* ![图片](https://mmbiz.qpic.cn/mmbiz_png/KoTWV9E4RiaD99oWbJicueFyx1vG0e0rHibeY2XqNePJqSBldMAdSLucAbeP1APjvDPSQibHKNxSrQobPyEdhGn9HSFfkWl4NWUibx78R03gaxDc/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0) 很多人还在用“买 GPU”理解 NVIDIA。

## Key Points

### 1. 一、推理不再只是把矩阵算快
大模型推理有两个阶段：Prefill 和 Decode。 Prefill 是读完整输入。 用户把 prompt、历史对话、文档、代码仓库、图片描述都塞进来，模型要先把这些上下文处理一遍。 这个阶段更像吞吐型计算：输入越长，矩阵计算越多，HBM 读写也越多。

### 2. 二、GB300 NVL72 到底是什么
先看 GB300 NVL72 的几个关键参数。 | 维度 | GB300 NVL72 | | --- | --- | | 计算单元 | 72 颗 Blackwell Ultra GPU + 36 颗 Grace CPU |

### 3. 三、为什么一定要做成整机柜
整机柜不是为了好看。 它对应的是三个在生产环境里经常出现的推理系统问题。

### 4. 1\. HBM 不够时，单卡再强也没用
推理系统里有两类大东西要放进快内存。 第一类是模型权重。 第二类是 KV Cache。 权重是静态的，模型多大，权重基本就多大。 KV Cache 是动态的，和上下文长度、batch、并发、层数、隐藏维度都相关。

### 5. 2\. MoE 和长上下文会放大卡间通信
MoE 模型的特点是总参数很大，但每个 token 只激活一部分 expert。 听起来很省。 但工程上有个麻烦：token 要被路由到不同 expert，expert 可能分布在不同 GPU 上。 这会带来 all-to-all 通信。

## Evidence

- Source: [原始文章](raw/industry/ai/芯片与算力/NVIDIA：为什么 GPU 变成了整机柜？.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/industry/ai/芯片与算力/NVIDIA：为什么 GPU 变成了整机柜？.md)
