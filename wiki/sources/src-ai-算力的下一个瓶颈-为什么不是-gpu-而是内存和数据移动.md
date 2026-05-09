---
doc_id: src-ai-算力的下一个瓶颈-为什么不是-gpu-而是内存和数据移动
title: AI 算力的下一个瓶颈：为什么不是 GPU，而是内存和数据移动
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/industry/ai/芯片与算力/AI 算力的下一个瓶颈：为什么不是 GPU，而是内存和数据移动.md
domain: industry/ai
created: 2026-05-09
updated: 2026-05-09
tags: [ai]
---

## Summary

JW *2026年4月24日 10:33* ![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/KoTWV9E4RiaBN01HcEGaCprQoYwtL0ibDonAdmgU4xWg2icHhiayuKtLuLLeDxTkGTks1aehDWAZGE8K0mB9wfmF99icjGhOzDB1IeMATlaEjEicA/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0) 过去两年，AI 行业几乎形成了一个共识：谁拥有更多 GPU，谁就拥有更强的 AI 能力。

## Key Points

### 1. 一、GPU 很强，但 GPU 不能凭空计算
很多人理解 AI 算力时，第一反应是 GPU 的 FLOPS。 FLOPS 衡量的是芯片每秒能做多少浮点运算。这个指标当然重要，尤其是在大模型训练阶段，矩阵乘法规模巨大，GPU 的计算能力直接影响训练速度。

### 2. 二、AI 系统里真正昂贵的，不只是计算，而是搬数据
在传统软件里，我们经常说“计算很贵”。 但在现代 AI 系统里，很多时候更贵的是数据移动。 一次大模型推理，表面看是模型在“思考”，底层其实是海量参数和中间状态不断被读取、传输、缓存和复用。 尤其进入推理阶段后，瓶颈会变得更明显。

### 3. 三、HBM 为什么突然变得这么重要？
如果说 GPU 是 AI 芯片的发动机，那么 HBM 高带宽显存就是燃料管道。 HBM 的全称是 High Bandwidth Memory，高带宽内存。它通过 3D 堆叠和超宽位宽接口，把内存直接放在计算芯片附近，从而提供远高于传统内存的带宽。

### 4. 四、长上下文和 Agent，会进一步放大内存瓶颈
如果只是短文本问答，模型推理还相对简单。 但现在 AI 应用正在走向三个方向： 第一，长上下文。 用户希望模型一次处理几十万字、上百万 token 的文档、代码库、会议记录和知识库。 第二，多模态。 模型不只看文字，还要看图片、视频、语音、表格、网页和传感器数据。

### 5. 五、未来的赢家，不只是买更多 GPU 的公司
如果 AI 算力瓶颈转向内存和数据移动，那么未来的竞争格局也会发生变化。 第一类机会在硬件层。 HBM、先进封装、Chiplet、CXL、PCIe 6.0、高速互联、液冷数据中心，都会成为 AI 基础设施的重要组成部分。

## Evidence

- Source: [原始文章](raw/industry/ai/芯片与算力/AI 算力的下一个瓶颈：为什么不是 GPU，而是内存和数据移动.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/industry/ai/芯片与算力/AI 算力的下一个瓶颈：为什么不是 GPU，而是内存和数据移动.md)
