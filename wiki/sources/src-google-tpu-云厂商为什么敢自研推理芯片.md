---
doc_id: src-google-tpu-云厂商为什么敢自研推理芯片
title: Google TPU：云厂商为什么敢自研推理芯片？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/industry/ai/芯片与算力/Google TPU：云厂商为什么敢自研推理芯片？.md
domain: industry/ai
created: 2026-05-09
updated: 2026-05-09
tags: [ai]
---

## Summary

JW *2026年5月3日 16:02* ![图片](https://mmbiz.qpic.cn/mmbiz_png/KoTWV9E4RiaDEWpvqBqaK8wxNhXrrLCtNcBa5GgadlAN6gR1QRsz08MhowGP0dU9QqicFZK2BY5dqxRHrGLaXjicVdKf3xgmdw3Nee5URWKDUI/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0) Google 做 TPU，最容易被问成一个开放市场问题：

## Key Points

### 1. 一、TPU 不是开放市场里的万能芯片
NVIDIA 的优势是通用生态。 新模型出来，开发者通常会先想 CUDA、PyTorch、TensorRT-LLM、vLLM、NCCL。 AMD 的机会是第二条 GPU 路线。 它仍然在 GPU 范式里竞争，希望 ROCm 能接住一部分 CUDA 路径。

### 2. 二、Ironwood 为什么被称为 inference-era TPU
Google 在 2025 年发布 Ironwood 时，给它的定位很明确：面向 inference age 的 TPU。 看几个关键参数。 | 维度 | Google TPU7x / Ironwood |

### 3. 三、XLA 是 TPU 路线的核心，不是附属品
很多人讨论 TPU，只看芯片。 但 TPU 如果离开编译器，就很难理解。 XLA 可以把高层模型计算图编译成适合 TPU 执行的低层操作。JAX、TensorFlow，以及部分 PyTorch/XLA 路径，都依赖这套编译思想。

### 4. 四、云厂商自研芯片为什么成立
普通芯片公司做自研 AI 芯片，最难的是找 workload。 做出来之后，谁来用？ 模型怎么适配？ 框架怎么支持？ 客户为什么迁移？ 云厂商不一样。 Google 自己就是超大规模 AI workload 的拥有者。

### 5. 五、TPU 8i/8t 暴露了下一步：训练和推理正在分家
2026 年 Cloud Next，Google 发布了第八代 TPU，拆成两种芯片：TPU 8t 和 TPU 8i。 这个信号比单个参数更重要。 TPU 8t 面向训练。 Google 说它可以扩展到 9600 个 TPU，并在单个 superpod 中提供 2 PB 共享高带宽内存。

## Evidence

- Source: [原始文章](raw/industry/ai/芯片与算力/Google TPU：云厂商为什么敢自研推理芯片？.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/industry/ai/芯片与算力/Google TPU：云厂商为什么敢自研推理芯片？.md)
