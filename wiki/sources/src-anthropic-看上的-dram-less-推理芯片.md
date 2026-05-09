---
doc_id: src-anthropic-看上的-dram-less-推理芯片
title: Anthropic 看上的 DRAM less 推理芯片
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/industry/ai/芯片与算力/Anthropic 看上的 DRAM-less 推理芯片.md
domain: industry/ai
created: 2026-05-09
updated: 2026-05-09
tags: [ai]
---

## Summary

JW *2026年5月6日 11:28* ![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/KoTWV9E4RiaAdLXXpNOnkY7rZcYicpMV7N5QhqxOSFvzmrGqiaqQEIicZ7u9TodwmaYoQC6AxoDkf9MJFkiawKV3CpsicicllNZPqNFuia0dT1kjtto/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0) 如果只看新闻标题，这像是 Anthropic 又想买一种新芯片。

## Key Points

### 1. 一、先把新闻边界说清楚
目前能确认的是：据媒体报道，Anthropic 与英国 AI 芯片创业公司 Fractile 有过早期接触，希望未来在 Fractile 芯片可用后采购其推理芯片。 这不是已经签署的大规模采购官宣。 也不是 Claude 已经跑在 Fractile 芯片上。

### 2. 二、DRAM-less 不是魔法词
先解释一下这个词。 DRAM 是动态随机存取存储器。 普通服务器内存是 DRAM。 GPU 旁边的 HBM，本质上也是一种高带宽 DRAM，只是堆叠方式、封装方式和带宽能力更适合加速器。 今天的大模型推理，经常依赖 GPU + HBM。

### 3. 三、为什么推理会变成“搬数据”的生意
训练和推理的资源画像不一样。 训练时，一个 batch 里有大量 token，大矩阵乘法可以把算力吃得很满。 系统当然也会受通信、显存、并行策略影响，但很多时候大家仍然围绕吞吐、FLOPS、集群规模来组织问题。

### 4. 四、Fractile 的路线为什么会被注意到
Fractile 公开介绍里反复强调一个方向： memory 和 compute 不是分开的，而是 physically interleaved。 也就是把内存和计算在物理布局上交织起来。 这句话听起来很抽象。

### 5. 五、Anthropic 为什么尤其会关心这个问题
Claude 这类模型服务有几个特点。 第一，长上下文压力大。 Claude 的产品叙事一直很重视长文档、代码、企业资料和复杂任务。 长上下文不是把 prompt 上限写大就完了。 上下文越长，Prefill 越重。

## Evidence

- Source: [原始文章](raw/industry/ai/芯片与算力/Anthropic 看上的 DRAM-less 推理芯片.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/industry/ai/芯片与算力/Anthropic 看上的 DRAM-less 推理芯片.md)
