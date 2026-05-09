---
doc_id: src-ai-数据中心正在变成什么-从-gpu-集群到-ai-factory-的真实成本
title: AI 数据中心正在变成什么：从 GPU 集群到 AI Factory 的真实成本
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/industry/ai/芯片与算力/AI 数据中心正在变成什么：从 GPU 集群到 AI Factory 的真实成本.md
domain: industry/ai
created: 2026-05-09
updated: 2026-05-09
tags: [ai]
---

## Summary

JW *2026年5月1日 19:36* ![图片](https://mmbiz.qpic.cn/mmbiz_png/KoTWV9E4RiaDOA4W8O3pAAuZPo4HdQ9GuM96k6qeHkjDzrbEFDKUiaOwloVdqmcK6MDR7dSLiaAmugJUWFazd7SvEwibxOXqaYEJWIlbmeM3icLM/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0) 今天再看 AI 数据中心，不能只把它理解成“很多 GPU 摆在一起”。

## Key Points

### 1. 一、AI Factory 不是一排 GPU，而是一条 token 生产线
![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org

### 2. 二、2026 年的新技术信号：大家都在往机架级和全栈走
2026 年最明显的变化，是大厂不再只发布“芯片”，而是在发布“系统”。 NVIDIA 的 Vera Rubin 不是单颗 GPU 叙事，而是 NVL72 机架级系统：Vera CPU、Rubin GPU、NVLink 6、ConnectX-9、BlueField-4、Spectrum-X、液冷、AI Enterprise 软件一起出现。

### 3. 三、真实成本不只在 GPU，而在整条链路
![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org

### 4. 1\. 芯片折旧
GPU、TPU、Trainium、Maia、MTIA、AI200 这类加速器都很贵。 但芯片买回来之后，成本不是一次性消失，而是会摊到每一天、每小时、每个 token 上。 如果利用率低，token 成本会非常难看。

### 5. 2\. HBM 和内存
AI 推理越来越像内存生意。 模型权重要放在 HBM 里。 KV Cache 要放在 HBM 或更复杂的内存层级里。 长上下文、多并发、多轮对话会持续扩大缓存需求。 很多时候，推理系统不是算力先满，而是显存容量、带宽或缓存管理先变成瓶颈。

## Evidence

- Source: [原始文章](raw/industry/ai/芯片与算力/AI 数据中心正在变成什么：从 GPU 集群到 AI Factory 的真实成本.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/industry/ai/芯片与算力/AI 数据中心正在变成什么：从 GPU 集群到 AI Factory 的真实成本.md)
