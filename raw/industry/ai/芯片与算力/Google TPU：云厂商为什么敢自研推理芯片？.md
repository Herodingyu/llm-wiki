---
title: "Google TPU：云厂商为什么敢自研推理芯片？"
source: "https://mp.weixin.qq.com/s?__biz=Mzg3MjcwNjExOA==&mid=2247484456&idx=1&sn=18f3315ca2fdb02011078768fabcc4c4&chksm=ceea7d01f99df4179544b6ca90a27c5c1b0984e97a5fcc6fbaca1ff0f8b7e31035ec9d6a30c4&scene=178&cur_album_id=4496673538715877378&search_click_id=#rd"
author:
  - "[[JW]]"
published:
created: 2026-05-09
description: "Google 做 TPU，最容易被问成一个开放市场问题：它能不能像 NVIDIA GPU 一样，被所有人买来跑"
tags:
  - "clippings"
---
JW *2026年5月3日 16:02*

![图片](https://mmbiz.qpic.cn/mmbiz_png/KoTWV9E4RiaDEWpvqBqaK8wxNhXrrLCtNcBa5GgadlAN6gR1QRsz08MhowGP0dU9QqicFZK2BY5dqxRHrGLaXjicVdKf3xgmdw3Nee5URWKDUI/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0)

Google 做 TPU，最容易被问成一个开放市场问题：

它能不能像 NVIDIA GPU 一样，被所有人买来跑所有模型？

这个问题不太对。

TPU 从一开始就不是一块面向所有人的通用显卡。

它更像 Google 自己 AI 工厂里的专用机器：服务 Google 自己的模型、自己的编译器、自己的云、自己的调度系统，也服务愿意进入 Google Cloud 这套体系的客户。

Google 敢自研推理芯片，不是因为它觉得开放生态不重要。

而是因为它掌握了几件普通芯片公司很难同时掌握的东西：

- 模型。
- 编译器。
- 云服务。
- 数据中心网络。
- 调度系统。
- 自己的超大规模 workload。

这让 TPU 的评价口径和普通 GPU 不一样。

普通芯片要回答：我能不能适配尽可能多的模型和框架？

Google TPU 更像在回答：

> 如果模型、编译器、硬件、网络和云服务都在我手里，我能不能把特定 workload 跑得更便宜、更稳定、更低延迟？

云厂商自研芯片的底层逻辑在这里：需求不是外部找来的，而是云平台自己每天都在产生。

## 一、TPU 不是开放市场里的万能芯片

NVIDIA 的优势是通用生态。

新模型出来，开发者通常会先想 CUDA、PyTorch、TensorRT-LLM、vLLM、NCCL。

AMD 的机会是第二条 GPU 路线。

它仍然在 GPU 范式里竞争，希望 ROCm 能接住一部分 CUDA 路径。

Google TPU 的位置不一样。

它不是想成为“另一个 CUDA”。

TPU 的核心是垂直整合。

Google 可以让 Gemini、JAX/XLA、TPU、ICI 网络、Borg/GKE、Google Cloud 服务和数据中心一起演进。

这件事对推理特别重要。

推理不是只跑一次矩阵乘法。

在线服务里会有长上下文、多轮对话、Agent 调用、批处理、缓存、尾延迟、SLA、功耗和利用率。

如果你只能控制芯片，很难把整条链路一起优化。

如果你能控制模型和云，很多设计就可以更激进。

Google 的 TPU 路线，本质上是在用“少一点开放性”，换“更多系统协同”。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

这也是为什么 TPU 不需要和 NVIDIA 在每一个开发者场景里正面对打。

它只需要在 Google Cloud 和 Google 自己的模型服务里，证明这套闭环的成本、能效、延迟和规模化是划算的。

## 二、Ironwood 为什么被称为 inference-era TPU

Google 在 2025 年发布 Ironwood 时，给它的定位很明确：面向 inference age 的 TPU。

看几个关键参数。

| 维度 | Google TPU7x / Ironwood |
| --- | --- |
| 单芯片 FP8 峰值 | 4614 TFLOPS |
| 单芯片 BF16 峰值 | 2307 TFLOPS |
| 单芯片 HBM | 192 GiB |
| 单芯片 HBM 带宽 | 7380 GB/s |
| 单芯片 ICI 带宽 | 1200 GB/s，双向 |
| 最大 pod 规模 | 9216 芯片 |
| 最大 pod HBM | 约 1.77 PiB |

这些数字说明了 Google 对推理的判断。

第一，Ironwood 强调 FP8。

推理成本要下降，低精度是绕不开的。模型权重、激活、KV Cache、算子稳定性，都要配合低精度路线。

第二，单芯片 192 GiB HBM。

这不是为了好看。长上下文和多并发会把 KV Cache 推成运行时内存问题。推理系统不只是算力池，也是缓存池。

第三，单芯片 7380 GB/s HBM 带宽。

Decode 阶段经常不是“算不动”，而是持续读缓存、读权重、搬数据。带宽会直接影响 token 生成速度和尾延迟。

第四，ICI 互联和 9216 芯片 pod。

Google TPU 不是单芯片产品，而是 pod 产品。TPU 的规模化逻辑依赖 ICI，把大量 TPU 组织成一个面向训练和推理的大计算域。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

这和 NVIDIA NVL72 的方向有相似处：单卡参数不够，系统规模才重要。

但两者的控制边界不同。

NVIDIA 把 GPU、CPU、NVLink、DPU、NIC、软件栈交给客户和云厂商使用。

Google 是把 TPU 放进自己的 AI Hypercomputer 和 Google Cloud 体系里，让客户通过云服务使用。

Ironwood 的价值不只是“这颗 TPU 多快”。

更重要的是它能不能在 Google 的模型和云服务里，把大规模推理变成可调度、可计费、可运维的服务。

## 三、XLA 是 TPU 路线的核心，不是附属品

很多人讨论 TPU，只看芯片。

但 TPU 如果离开编译器，就很难理解。

XLA 可以把高层模型计算图编译成适合 TPU 执行的低层操作。JAX、TensorFlow，以及部分 PyTorch/XLA 路径，都依赖这套编译思想。

对 TPU 来说，编译器不是“开发工具”那么简单。

它决定了模型如何切分、算子如何融合、数据如何放置、通信如何安排、哪些计算可以重排，哪些内存访问可以减少。

GPU 生态更像是开发者和框架长期围绕 CUDA 手写、优化、积累出大量路径。

TPU 路线更依赖编译器把模型结构映射到硬件结构上。

这有好处。

如果模型结构、编译器和硬件一起设计，系统可以在特定 workload 上做得很深。

Gemini、内部推荐、搜索、翻译、图片、视频、云客户模型，都能反过来影响 TPU 设计。

这也有代价。

当模型、算子或框架路径不在 TPU 的舒适区，迁移成本会变高。

开发者可能要处理 XLA 编译、shape、算子支持、性能 profile、分布式切分和调试体验。

TPU 的问题从来不是“能不能做矩阵乘法”。

真正的问题是：你的模型和工作流，能不能被 Google 这套编译和云体系很好地接住。

## 四、云厂商自研芯片为什么成立

普通芯片公司做自研 AI 芯片，最难的是找 workload。

做出来之后，谁来用？

模型怎么适配？

框架怎么支持？

客户为什么迁移？

云厂商不一样。

Google 自己就是超大规模 AI workload 的拥有者。

Search、YouTube、Photos、Ads、Workspace、Gemini、Vertex AI、Google Cloud 客户，都能形成持续需求。

这让自研芯片变成一种成本工具。

当每天要处理海量 token、图片、视频、搜索、推荐和 Agent 请求时，一点点性能/瓦特、性能/美元、尾延迟改进都会变成长期财务收益。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

Google 还多一层优势：它可以做“客户零号”。

TPU 先服务 Google 自己的模型和业务。

如果内部跑通，再交给 Google Cloud 客户。

这和独立芯片公司先找外部客户完全不同。

独立芯片公司需要证明“你应该迁移到我这里”。

Google 可以先证明“我自己的业务已经在用这条路降成本、提效率、保供给”。

云厂商敢自研推理芯片，靠的就是这个确定需求闭环。

不是因为自研芯片容易。

而是因为它们能把芯片放进一个确定的需求闭环里。

## 五、TPU 8i/8t 暴露了下一步：训练和推理正在分家

2026 年 Cloud Next，Google 发布了第八代 TPU，拆成两种芯片：TPU 8t 和 TPU 8i。

这个信号比单个参数更重要。

TPU 8t 面向训练。

Google 说它可以扩展到 9600 个 TPU，并在单个 superpod 中提供 2 PB 共享高带宽内存。

TPU 8i 面向推理。

Google 说它在单个 pod 中连接 1152 个 TPU，强调低延迟，并有 3 倍片上 SRAM，用来支撑大量 agent 的高吞吐和低延迟。

这说明 Google 已经不满足于“一个 TPU 同时兼顾训练和推理”。

它开始把训练和推理拆成不同架构。

原因很现实。

训练要的是大规模同步、吞吐、稳定的高带宽通信和大内存池。

推理要的是低延迟、KV Cache、并发、服务调度、成本/token 和用户体验。

这两个 workload 越来越不像。

NVIDIA 用 Blackwell Ultra、Rubin、NVL72、Dynamo 等系统路线处理这个分化。

Google 则直接把 TPU 8t 和 8i 拆开。

这不是单纯发布两颗芯片，而是承认：AI 基础设施已经进入 workload 专用化阶段。

## 六、TPU 路线的代价

TPU 的优势来自闭环，代价也来自闭环。

第一，开放性不如 GPU。

CUDA 的默认路径太强。很多开源模型、推理框架、性能优化、社区经验都会先围绕 NVIDIA 跑通。

TPU 能跑很多 workload，但它不是大多数开发者的默认路径。

第二，迁移成本更集中在编译和框架。

GPU 迁移常常卡在 kernel、通信库和显存调优。

TPU 迁移还会碰到 XLA 编译、shape、算子支持、分布式切分和调试方式。

第三，云绑定更强。

TPU 的价值高度依赖 Google Cloud。客户获得的是云服务能力，不是拿一块 TPU 回自己数据中心。

这对一些企业是优势：不用自己搭底层系统。

对另一些企业是限制：供应商绑定更强。

第四，外部 benchmark 不容易解释真实价值。

TPU 的价值经常体现在 Google 自己的模型、调度、数据中心和云服务里。外部单点 benchmark 很难完整反映它的系统收益。

判断 TPU，不能只问“它是不是比某张 GPU 快”。

更应该问：你的 workload 是否适合进入 Google 的模型/编译器/云服务闭环。

## 七、怎么判断 Google TPU

Google TPU 的核心不是开放，而是垂直整合。

它把模型、编译器、芯片、网络、调度和云服务绑在一起。

这条路的收益很清楚：

- Google 可以为自己的模型和云 workload 定制硬件。
- XLA 和 TPU 可以一起优化特定计算图。
- ICI pod 让 TPU 以 pod 形态扩展，而不是只卖单芯片。
- Google Cloud 可以把 TPU 变成 AI Hypercomputer 的一部分。
- 内部 workload 可以先验证，再开放给客户。

代价也同样清楚：

- 开发生态不如 CUDA 普遍。
- 迁移和调试更依赖 Google 工具链。
- 客户更容易绑定到 Google Cloud。
- 外部团队不一定能复现 Google 内部的系统收益。

Google 敢自研推理芯片，不是因为它能绕开所有生态问题。

而是因为它不需要在所有场景里赢。

它只需要在自己能控制的模型、编译器、云和数据中心里，把 AI 推理跑成一门长期可优化的生意。

这也是 TPU 和 NVIDIA、AMD 最大的不同。

NVIDIA 卖的是被全行业采用的默认算力路径。

AMD 卖的是 GPU 第二供应链。

Google TPU 卖的是云厂商垂直整合后的系统效率。

---

这篇属于「AI 推理芯片品牌剖析」系列。

Google TPU 这一篇的重点不是“TPU 能不能替代 GPU”，而是云厂商为什么有资格走一条更封闭、更垂直、更系统化的芯片路线。

后面继续拆其他平台时，也会沿着这个问题看：它是靠开放生态赢，靠供应链赢，靠云服务入口赢，还是靠某个专用 workload 赢。

如果你更关心 TPU、XLA、JAX、Gemini 或云厂商自研芯片的工程细节，欢迎在评论区留下问题。

芯片与算力 · 目录

继续滑动看下一个

口袋 AI 系统笔记

向上滑动看下一个