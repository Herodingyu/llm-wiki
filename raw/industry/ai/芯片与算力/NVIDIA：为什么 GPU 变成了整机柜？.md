---
title: "NVIDIA：为什么 GPU 变成了整机柜？"
source: "https://mp.weixin.qq.com/s?__biz=Mzg3MjcwNjExOA==&mid=2247484438&idx=1&sn=7102e1615971fbd2e12554d5b78abf82&chksm=ceea7d3ff99df4294f34dfbc9ff9924f009dfee7336618c9027e9aeff4f90898945ad8253fd3&scene=178&cur_album_id=4496673538715877378&search_click_id=#rd"
author:
  - "[[JW]]"
published:
created: 2026-05-09
description: "很多人还在用“买 GPU”理解 NVIDIA。但到了 GB300 和 Vera Rubin 这一代，NVIDIA 真正在卖的已经不是一块卡，而是一整个推理机器。"
tags:
  - "clippings"
---
JW *2026年5月3日 12:53*

![图片](https://mmbiz.qpic.cn/mmbiz_png/KoTWV9E4RiaD99oWbJicueFyx1vG0e0rHibeY2XqNePJqSBldMAdSLucAbeP1APjvDPSQibHKNxSrQobPyEdhGn9HSFfkWl4NWUibx78R03gaxDc/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0)

很多人还在用“买 GPU”理解 NVIDIA。

但到了 GB300 和 Vera Rubin 这一代，NVIDIA 真正在卖的已经不是一块卡，而是一整个推理机器。

GB300 NVL72 这个名字里，最重要的不是 GB300，而是 NVL72。

它不是 72 张 GPU 简单插在一起。

它是 72 颗 Blackwell Ultra GPU、36 颗 Grace CPU、NVLink、NVSwitch、ConnectX、液冷、管理软件和推理框架组成的一个机柜级计算域。

换句话说，NVIDIA 正在把“GPU 集群”收缩成“机柜里的单台大机器”。

为什么要这么做？

因为大模型推理的瓶颈变了。

过去我们问的是：一张 GPU 每秒能做多少浮点运算？

现在更关键的问题变成：

> 一个机柜能不能在长上下文、MoE、Agent、多用户并发下，稳定地产生更多 token？

问题不再是“这张卡快不快”，而是“这个机柜能不能像一台机器一样跑推理”。

## 一、推理不再只是把矩阵算快

大模型推理有两个阶段：Prefill 和 Decode。

Prefill 是读完整输入。

用户把 prompt、历史对话、文档、代码仓库、图片描述都塞进来，模型要先把这些上下文处理一遍。

这个阶段更像吞吐型计算：输入越长，矩阵计算越多，HBM 读写也越多。

Decode 是逐 token 生成。

模型每吐一个 token，都要读前面已经积累的 KV Cache。

KV Cache 可以简单理解成模型为了避免重复计算而留下的运行时记忆。上下文越长、并发越高、对话越多，它占用的显存和带宽就越多。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

这两个阶段的硬件压力不一样。

Prefill 要吞吐。

Decode 要低延迟、稳定带宽和高并发。

Agentic AI 又把问题放大了。

一个 Agent 不是问一句答一句。它可能读文件、查网页、调用工具、写代码、再根据工具结果继续推理。

这会带来三类压力：

- 上下文更长，KV Cache 更大。
- 推理轮次更多，尾延迟更重要。
- 请求形态更不规则，调度更难。

这时再只看 TOPS，很容易看错方向。

TOPS 或 FLOPS 只能说明峰值计算能力。真实推理卡住时，问题经常出在别处：显存被 KV Cache 占满，Decode 读缓存读不动，MoE 跨卡通信拖慢尾延迟，CPU 侧调度和网络请求把 GPU 晾在一边。

NVIDIA 做整机柜，针对的就是这些单卡指标看不出来的地方。

## 二、GB300 NVL72 到底是什么

先看 GB300 NVL72 的几个关键参数。

| 维度 | GB300 NVL72 |
| --- | --- |
| 计算单元 | 72 颗 Blackwell Ultra GPU + 36 颗 Grace CPU |
| GPU 内存 | 约 20 TB HBM3e，单 GPU 288 GB |
| CPU 内存 | 约 17 TB LPDDR5X |
| NVLink 带宽 | 130 TB/s |
| FP4 Tensor Core | 1440 PFLOPS，稀疏口径 |
| FP8/FP6 Tensor Core | 720 PFLOPS，稀疏口径 |
| FP16/BF16 Tensor Core | 360 PFLOPS，稀疏口径 |

这些数字里，最容易被误读的是算力。

1440 PFLOPS FP4 看起来很夸张，但它不是这篇文章的重点。

真正值得看的是三件事。

第一，单 GPU 的 HBM3e 到了 288 GB。

这意味着 NVIDIA 很清楚：推理不是只缺算力，也缺显存容量。长上下文、更多 batch、更大的 KV Cache，都在推高显存需求。

第二，整个机柜有约 20 TB GPU HBM，再加约 17 TB CPU LPDDR5X。

这不是传统意义上的“一台服务器配一点 CPU 内存”。Grace CPU 在这个系统里不是配角，它承担数据预处理、调度、内存层级和 CPU 侧 workload。

第三，72 颗 GPU 被放进一个 NVLink 域。

NVIDIA 官方把 GB300 NVL72 描述成一个 rack-scale architecture。它通过第五代 NVLink 和 NVSwitch，把 72 颗 GPU 组织成一个更大的计算域。

如果 72 张卡只是通过普通网络连起来，很多大模型 workload 会被通信拖住。

模型并行要跨卡传激活。

MoE 要做 expert 路由。

长上下文和大 batch 会放大数据搬运。

推理服务还要在 Prefill 和 Decode 之间拆分、调度、迁移 KV Cache。

这时，卡间互联就不再是配件，而是推理性能的一部分。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

GB300 NVL72 的本质不是“72 张更强 GPU”，而是一台机柜级 AI 计算机。

GPU 负责张量计算。

HBM 负责模型权重和 KV Cache。

Grace CPU 负责 CPU 侧任务、内存层级和系统协同。

NVLink/NVSwitch 负责把机柜内部变成一个高带宽 scale-up 域。

ConnectX 和 InfiniBand/Spectrum-X 负责向外扩展到更多机柜。

Mission Control、TensorRT-LLM、Dynamo 等软件负责把硬件能力变成可运行、可调度、可运维的推理服务。

单个芯片只负责把某一段算快。GB300 NVL72 要处理的是整条推理链路。

## 三、为什么一定要做成整机柜

整机柜不是为了好看。

它对应的是三个在生产环境里经常出现的推理系统问题。

### 1\. HBM 不够时，单卡再强也没用

推理系统里有两类大东西要放进快内存。

第一类是模型权重。

第二类是 KV Cache。

权重是静态的，模型多大，权重基本就多大。

KV Cache 是动态的，和上下文长度、batch、并发、层数、隐藏维度都相关。

长上下文让推理系统变贵，不是因为模型突然变聪明了，而是因为每个用户的上下文都在持续占用运行时记忆。

如果只靠一张卡，显存容量很快会成为边界。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

把 72 颗 GPU 组织在一个高带宽域里，NVIDIA 就能在机柜范围内组织更大的模型、更大的 batch、更长的上下文和更复杂的并行策略。

这不是说所有请求都要吃满 72 颗 GPU。

真正的价值是：系统可以在机柜级别调度资源，而不是被单卡边界过早卡住。

### 2\. MoE 和长上下文会放大卡间通信

MoE 模型的特点是总参数很大，但每个 token 只激活一部分 expert。

听起来很省。

但工程上有个麻烦：token 要被路由到不同 expert，expert 可能分布在不同 GPU 上。

这会带来 all-to-all 通信。

通信慢，MoE 就不省。

长上下文也类似。

模型可以通过 MLA、稀疏 attention、KV 压缩等方式减少缓存压力，但只要模型跨多卡运行，数据还是要在卡之间移动。

NVIDIA 做 NVL72，本质是在说：

既然模型越来越大、上下文越来越长、MoE 越来越常见，那就把机柜内部做成一个高速互联域，尽量不要让普通网络成为瓶颈。

这也是 NVLink 的价值。

它不是替代以太网，而是解决同一机柜内部 GPU 之间的高频通信。

### 3\. Agentic 推理需要 CPU、GPU、网络一起工作

Agentic AI 不是单纯的 GPU 计算。

一次真实 agent 任务里，GPU 负责模型推理，但 CPU 和网络也很忙：

- tokenizer、请求解析、队列调度。
- 工具调用、函数执行、文件读写。
- 向量检索、数据库访问、权限检查。
- 多轮状态管理、日志、监控、失败恢复。
- Prefill/Decode 分离后的调度和缓存管理。

如果 GPU 很强，但 CPU、网络、存储和调度跟不上，用户看到的仍然是慢。

这也是 Grace CPU 被放进 GB300 和 Vera Rubin 叙事里的原因。

它不是附属品，而是 NVIDIA 把 AI Factory 做成完整系统的一部分。

## 四、软件栈才是 NVIDIA 的真正护城河

硬件只是第一层。

NVIDIA 真正难替代的地方，是硬件和软件长期绑在一起。

CUDA 是底座。

cuDNN、NCCL、TensorRT、TensorRT-LLM、Triton、Dynamo、NVIDIA AI Enterprise 是上层工具。

对推理服务来说，这些软件至少做四件事：

| 软件层 | 解决的问题 |
| --- | --- |
| CUDA / 底层库 | 让算子、kernel、通信库能稳定利用 GPU |
| TensorRT-LLM | 做低精度、算子融合、模型执行优化 |
| Dynamo | 面向大规模推理做调度、分离式服务和吞吐优化 |
| Mission Control | 面向 AI Factory 做运维、弹性和基础设施管理 |

这里不能只问“有没有一个替代 CUDA 的 SDK”。

更现实的问题是：模型一发布，能不能很快跑起来；跑起来之后，能不能稳定榨出性能；性能问题出现后，工程师能不能定位到算子、通信、显存、调度哪一层。

NVIDIA 的强项就在这里。

它让硬件发布不是孤立事件，而是软件栈一起升级。

GB300 对 reasoning inference 的提升，不只来自 FP4 算力和更大 HBM，也来自 TensorRT-LLM、Dynamo、低精度 kernel、分离式推理调度等软件优化。

很多国产芯片、云厂商自研芯片、专用 ASIC 面临的难题也在这里：不是“能不能做出算力”。

而是能不能在真实模型、真实框架、真实服务里把算力用起来。

NVIDIA 最可怕的地方不是某一代 GPU 很强，而是每一代硬件都能吃到 CUDA 生态的复利。

## 五、Blackwell Ultra 和 Vera Rubin：当前平台与下一代路线

写 NVIDIA 容易犯一个错误：把已部署平台和未来路线混在一起。

这篇文章要分清楚。

GB300 NVL72 是 Blackwell Ultra 这一代的当前平台。NVIDIA 官方页面已经把它标为 Available Now，并给出 72 颗 Blackwell Ultra GPU、36 颗 Grace CPU、20 TB GPU HBM、130 TB/s NVLink 带宽等规格。

Vera Rubin 是下一代平台。

NVIDIA 在 2026 年 3 月发布 Vera Rubin 平台，称七颗新芯片已经 full production。Vera Rubin NVL72 会把 72 颗 Rubin GPU、36 颗 Vera CPU、NVLink 6、ConnectX-9、BlueField-4 等放进同一个 rack-scale 系统。

它的方向很清楚：

- 更强 CPU/GPU 协同。
- 更高 NVLink 带宽。
- 更强机柜级安全和 confidential computing。
- 更强调 agentic AI、reasoning、test-time scaling。
- 继续把 AI 基础设施从“服务器集群”推向“AI Factory 参考设计”。

但对工程判断来说，GB300 和 Vera Rubin 的地位不同。

GB300 是现在可以分析生产形态的主角。

Vera Rubin 是判断 NVIDIA 下一代路线的信号。

这两者不能混写。

## 六、这套架构的代价是什么

NVIDIA 的机柜级路线很强，但不是没有代价。

第一，成本高。

NVL72 不是便宜设备。液冷、NVLink、Grace CPU、HBM、DPU、NIC、机柜级集成和软件授权都会进入成本。

对小团队来说，NVIDIA 的能力往往只能通过云厂商间接使用。

第二，功耗和数据中心要求高。

机柜级 AI 系统需要配套供电、液冷、网络和运维能力。不是有预算买设备就能直接跑好。

第三，生态绑定强。

CUDA 生态是优势，也是锁定。工程团队越依赖 TensorRT-LLM、NCCL、Dynamo 和 NVIDIA 专用优化，迁移到 AMD、TPU、Trainium、国产芯片或专用 ASIC 的成本越高。

第四，系统复杂度更高。

当一台“机器”变成一个机柜，问题也会从单卡故障变成跨 GPU、跨 CPU、跨网络、跨调度层的系统问题。

这也是为什么 NVIDIA 要同时推 Mission Control、AI Enterprise 和参考架构。

它知道客户真正买的不是芯片，而是可生产、可运维、可扩展的 AI Factory。

## 七、怎么判断 NVIDIA 这条路

如果只看芯片，NVIDIA 的路线会显得很“重”。

又是 HBM，又是 NVLink，又是液冷，又是 DPU，又是机柜。

但如果从推理系统看，这条路线非常一致：

大模型推理正在变成长上下文、多轮 agent、MoE、多模态、低延迟服务。

这些负载的共同特点是：单卡算力不再够解释性能。

真正决定 token 成本的是机柜级资源组织能力。

把 GPU 变成整机柜，不是把发布会包装得更大，而是把推理系统里原本分散的问题收进一个交付单元。

这条路的收益很明确：

- HBM 容量和带宽。
- 机柜内部 GPU 通信。
- CPU/GPU 协同。
- 大规模推理调度。
- 软件栈和运维闭环。

代价也很明确：

- 更高采购成本。
- 更高电力和冷却门槛。
- 更强生态绑定。
- 更复杂的基础设施运维。

这篇的结论不是“NVIDIA 还是最强”。

> NVIDIA 正在把 GPU 从一颗加速芯片，变成 AI Factory 的标准构件。GB300 NVL72 的意义，不是 72 颗 GPU 更快，而是它把推理系统的算力、内存、互联、CPU 和软件栈压进了一个可交付的机柜。

后面分析 AMD、Google TPU、AWS Trainium、Cerebras、Groq、华为昇腾和寒武纪时，都可以拿这把尺子对照。

真正的问题不是谁的单芯片参数更漂亮。

而是谁能把真实推理 workload 组织成稳定、低成本、可扩展的 token 生产系统。

---

这篇是「AI 推理芯片品牌剖析」系列的第一篇。

后面我会继续按同一把尺子拆不同芯片平台：为什么选这种架构，它解决了什么推理瓶颈，关键参数说明了什么，软件栈能不能支撑生产，以及它把问题转移到了哪里。

如果你不想只看厂商发布会参数，而是想真正看懂推理芯片背后的架构取舍，可以关注这个系列。

也欢迎在评论区留下你最想看的芯片品牌或问题，我会优先把读者最关心的部分拆透。

芯片与算力 · 目录

继续滑动看下一个

口袋 AI 系统笔记

向上滑动看下一个