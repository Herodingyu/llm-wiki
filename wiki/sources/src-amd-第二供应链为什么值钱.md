---
doc_id: src-amd-第二供应链为什么值钱
title: AMD：第二供应链为什么值钱？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/industry/ai/芯片与算力/AMD：第二供应链为什么值钱？.md
domain: industry/ai
created: 2026-05-09
updated: 2026-05-09
tags: [ai]
---

## Summary

JW *2026年5月3日 14:05* ![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/KoTWV9E4RiaBvIAia1Jz60iboFweiatqjHy9DUibkvQ4Sd0BhPKRLcLubDJ0A7ZoDh1JVrFdbGBunNhziaVB4DtZgmv9nrRvasQGcMbVBPuJSaOoU/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0) 看 AMD 的 AI 芯片，最容易问错一个问题：

## Key Points

### 1. 一、AMD 不是在发明另一种推理芯片
AMD 的路线和 Google TPU、AWS Trainium、Cerebras、Groq 不一样。 它没有说：我要重新定义大模型推理。 它说的是：我也能提供一条高性能 GPU 路线，而且这条路线更开放。

### 2. 二、MI355X 的参数说明了什么
先看 MI355X 的核心参数。 | 维度 | AMD Instinct MI355X | | --- | --- | | 架构 | CDNA4 | | 制程 | TSMC 3nm + 6nm FinFET |

### 3. 三、为什么大 HBM 对推理有用
很多人看推理芯片时，会先看算力。 但在线推理里，内存经常先出问题。 模型权重要放进 HBM。 KV Cache 要放进 HBM。 多用户并发时，每个用户都在占运行时记忆。 长上下文一上来，KV Cache 会像账本一样越记越大。

### 4. 四、第二供应链真正值钱在哪里
如果只从单卡参数看 AMD，很容易低估它。 云厂商和大客户不是只买一张卡。 它们关心的是未来三到五年的 AI 基础设施成本。 第二供应链的价值，至少体现在四个地方。

### 5. 1\. 采购议价
当市场只有一个强供应商，客户谈判空间很小。 GPU 缺货时，客户甚至不是在选性能，而是在抢产能。 AMD 只要能提供足够可用的训练/推理平台，就能改变谈判结构。 它不需要让所有 workload 都迁移过来。

## Evidence

- Source: [原始文章](raw/industry/ai/芯片与算力/AMD：第二供应链为什么值钱？.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/industry/ai/芯片与算力/AMD：第二供应链为什么值钱？.md)
