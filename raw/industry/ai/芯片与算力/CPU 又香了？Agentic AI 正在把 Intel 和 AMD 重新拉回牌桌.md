---
title: "CPU 又香了？Agentic AI 正在把 Intel 和 AMD 重新拉回牌桌"
source: "https://mp.weixin.qq.com/s?__biz=Mzg3MjcwNjExOA==&mid=2247484216&idx=1&sn=f40cdba956c92a7124a20f677adef60f&chksm=ceea7a11f99df30764c0016d6a77c3ad711f41a73e0a18e258b45358ddb34c897ee051a9b058&scene=178&cur_album_id=4496673538715877378&search_click_id=#rd"
author:
  - "[[JW]]"
published:
created: 2026-05-09
description: "最近科技股市场有一条线很有意思：CPU 又被重新讨论了。过去两年，AI 交易的核心几乎只有一个词：GPU。"
tags:
  - "clippings"
---
JW *2026年4月25日 09:35*

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/KoTWV9E4RiaAP2aKCNo6U22xauowuAxOjRZkvyGy8WfEatk4b4pm95gL6r7Hye0tTytAb3KHxWBtdmTWZwrD8lr4NyzXjia6euwHPYVaBqaLQ/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0)

最近科技股市场有一条线很有意思：

**CPU 又被重新讨论了。**

过去两年，AI 交易的核心几乎只有一个词：GPU。

谁能拿到更多 GPU，谁就更接近 AI 基础设施的核心资产。

但到了 2026 年，随着 Agentic AI、实时推理、RAG、企业自动化开始落地，市场开始重新看 CPU。

这不是说 CPU 要替代 GPU。

更准确地说：

**AI 从训练大模型，走向大规模推理和 Agent 工作流之后，CPU 重新变成系统算力里的关键角色。**

这也是为什么 Intel、AMD 重新被市场拉回牌桌。

先说明：这篇不是投资建议，也不讨论买卖点，只拆解一个科技股热点背后的产业逻辑。

## 一、市场炒的不是 CPU 回归，而是 AI 工作负载变了

训练时代，最核心的是 GPU。

大模型训练需要海量矩阵计算，GPU 的并行计算能力决定训练速度。

但推理和 Agentic AI 不一样。

一个 Agent 任务不是一次模型调用，而是多步骤流程：

- 读文件
- 检索数据库
- 调用工具
- 访问 API
- 跑代码
- 读取日志
- 判断下一步
- 失败后重试
- 最后给出结果

这些工作并不全是 GPU 擅长的矩阵计算。

它们需要 CPU 做调度、内存管理、I/O、网络、权限、安全、任务编排和控制流。

AMD 在 2026 年 3 月的官方文章里说得很直接：Agentic AI 会让推理变成多步骤 workflow，CPU 要负责 scheduling、data prep、memory and I/O、control flow，让加速器保持高效工作。

Intel 也在 2026 年 3 月宣布，Xeon 6 会作为 NVIDIA DGX Rubin NVL8 的 Host CPU。Intel 强调，随着 AI 从大规模训练转向实时推理，Host CPU 在 orchestration、memory access、model security、throughput 上变得 mission-critical。

这两个信号放在一起看，说明市场不是突然怀旧 CPU。

市场是在重新定价一个事实：

**AI 基础设施开始从单点 GPU 叙事，进入 CPU + GPU + 内存 + 网络 + 存储的系统算力叙事。**

## 二、为什么 Intel 会被重新看见？

Intel 过去几年在 AI 叙事里并不占优势。

GPU 训练主线属于 NVIDIA。

先进制程和代工主线有 TSMC。

AI 服务器和加速器主线里，Intel 的声音一度比较弱。

但 Host CPU 这条线给了 Intel 一个新的叙事入口。

Intel Xeon 6 进入 NVIDIA DGX Rubin NVL8 系统，这件事的意义不在于“Intel 打败 GPU”，而在于它被放到了顶级 GPU 系统的控制层。

在 GPU 集群里，CPU 要负责很多底层工作：

- 管理内存访问
- 调度任务
- 处理 I/O
- 支撑安全隔离
- 管理数据路径
- 保障系统稳定
- 协调 GPU、网络、存储

当 AI 推理规模扩大，尤其是 Agentic AI 需要大量工具调用和实时响应时，Host CPU 的价值就会被放大。

Intel 的优势在于：

第一，x86 企业生态深。

很多企业数据中心、虚拟化、数据库、中间件、传统业务系统仍然跑在 x86 生态里。

第二，安全和兼容性是企业采购的重要因素。

AI 进入生产环境后，企业不只看性能，还看隔离、审计、长期维护和软件兼容。

第三，Intel 有机会借 Host CPU 重新进入 AI 数据中心叙事。

这不是说 Intel 一定会恢复过去的统治地位。

但至少说明：AI 基础设施不只需要 GPU，也需要成熟的 CPU 控制层。

这就是 Intel 被重新定价的原因之一。

## 三、为什么 AMD 也受益？

AMD 的逻辑更清楚。

它既有 EPYC 服务器 CPU，也有 Instinct GPU，还有 ROCm 软件栈和 Pensando 网络技术。

换句话说，AMD 讲的是“全栈 AI 基础设施”。

在训练时代，市场最关心 GPU 能不能追上 NVIDIA。

但在 Agentic AI 时代，系统级能力的重要性会上升。

AMD 可以讲几条线：

第一，EPYC 服务器 CPU 支撑推理和 Agent workflow。

Agent 需要大量 CPU 调度、数据移动、工具调用和企业应用集成。

第二，CPU 和 GPU 可以协同。

AMD 的叙事不是单独卖 CPU，而是 CPU + GPU + 网络 + 软件栈。

第三，数据中心更新周期可能被 AI 推动。

如果企业开始部署更多推理服务、RAG 系统、Agent 自动化，就不只是买 GPU，也会更新服务器 CPU、内存、存储和网络。

所以 AMD 的机会不只是“GPU 追赶者”，也包括“系统算力平台提供者”。

这就是为什么 Agentic AI 会让 AMD 的 CPU 叙事变强。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

## 四、为什么这条线会成为股市热点？

股市最喜欢两类东西。

第一，已经很强的主线。

比如 GPU、HBM、先进封装。

第二，被重新发现的主线。

CPU 现在更像第二类。

过去很多人觉得 CPU 是传统业务，增长有限，AI 红利主要在 GPU。

但 Agentic AI 把 CPU 拉回来了。

市场会开始问：

如果 AI 推理占比上升，CPU 需求会不会增加？

如果 Agent 变成企业工作流，服务器 CPU 会不会被重新定价？

如果 GPU 集群越来越复杂，Host CPU 会不会成为系统效率关键？

如果企业部署私有 RAG 和 Agent，EPYC / Xeon 会不会受益？

如果 AI 数据中心从训练转向实时推理，CPU、内存、I/O、网络会不会一起受益？

这些问题叠在一起，就形成了 CPU 热。

注意，这不是单纯财报逻辑，而是预期差逻辑。

市场先发现一个新叙事，再观察业绩能不能跟上。

所以这条线会有弹性，也会有波动。

## 五、这条线真正看什么？

CPU 热能不能持续，不能只看新闻和股价。

要看三个指标。

第一，真实需求。

Agentic AI、RAG、企业推理、工具调用有没有真的规模化？如果只停留在 Demo，CPU 需求不会爆发。

第二，兑现能力。

Intel 和 AMD 的服务器 CPU 收入、数据中心业务、毛利率、订单指引能不能体现这条线？

第三，系统位置。

CPU 是不是在新一代 AI 机柜、推理集群、企业 Agent 平台中扮演不可替代角色？

如果这三条同时成立，CPU 热就不是短炒。

如果只有股价先跑、业绩没跟上，那就容易回调。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

## 六、不要把 CPU 热理解成 GPU 退潮

这是最容易误解的地方。

CPU 热，不等于 GPU 不行。

大模型训练、高吞吐推理、视频生成、多模态模型，仍然高度依赖 GPU 和专用加速器。

CPU 的价值不是替代 GPU。

CPU 的价值是让 GPU 更高效地工作。

换句话说：

GPU 决定模型能力上限；

CPU 决定系统运行效率；

内存和 HBM 决定数据能不能喂上去；

网络决定集群能不能协同；

存储决定数据能不能及时到位；

软件栈决定利用率能不能释放。

AI 基础设施进入系统算力时代后，市场不再只盯单颗芯片，而会重新估值整套系统。

这就是 CPU 被重新看见的根本原因。

## 结语：Intel 和 AMD 被拉回牌桌，但牌局变了

如果把这轮 CPU 热理解成“CPU 又要取代 GPU”，那就看浅了。

真正的变化是：

AI 从训练走向推理；

从聊天走向 Agent；

从单次回答走向持续执行；

从单点算力走向系统效率。

在这个过程中，CPU 重新变得重要。

Intel 的机会在于 Host CPU、安全、x86 生态和数据中心兼容性。

AMD 的机会在于 EPYC、Instinct、ROCm、网络和全栈系统能力。

但这条线最终能不能持续，不取决于标题多热，而取决于 Agentic AI 是否真的进入生产环境，以及服务器 CPU 需求是否能在业绩里兑现。

**CPU 又香了，但不是因为 AI 回到 CPU。**

**而是因为 AI 进入了系统算力时代。**

## 你怎么看？

你觉得 CPU 热最可能先在哪个方向兑现？

- 数据中心 Host CPU
- 企业 RAG / Agent 推理
- AMD 全栈 AI 平台
- Intel Xeon 安全和兼容生态
- Arm 数据中心 CPU

本文不构成投资建议，只做产业逻辑分析。

**本文关键词：Agentic AI、Intel、AMD、CPU、Xeon、EPYC、AI 数据中心、Host CPU、推理成本、系统算力。**

## 参考资料

- Intel Newsroom：Intel Xeon 6 used as Host CPUs in NVIDIA DGX Rubin NVL8 Systems，2026-03-16
- AMD：Agentic AI Brings New Attention to CPUs in the AI Data Center，2026-03-13
- Arm Newsroom：As AI scales, so do CPUs，2026-02-26
- Arm Newsroom：Announcing Arm AGI CPU，2026-03-24
- TrendForce：New CPUs Driven by Agentic AI，2026-04

芯片与算力 · 目录

继续滑动看下一个

口袋 AI 系统笔记

向上滑动看下一个