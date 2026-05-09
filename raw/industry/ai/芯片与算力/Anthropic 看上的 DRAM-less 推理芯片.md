---
title: "Anthropic 看上的 DRAM-less 推理芯片"
source: "https://mp.weixin.qq.com/s?__biz=Mzg3MjcwNjExOA==&mid=2247484541&idx=1&sn=4df945cebe3d8d8f7a9b7a5669198d87&chksm=ceea7d54f99df442767a7205c49a0cfa22d61aff6aa6e20266287dd0c0986d3f659def8a0e70&scene=178&cur_album_id=4496673538715877378&search_click_id=#rd"
author:
  - "[[JW]]"
published:
created: 2026-05-09
description: "如果只看新闻标题，这像是 Anthropic 又想买一种新芯片。它已经有 NVIDIA GPU。"
tags:
  - "clippings"
---
JW *2026年5月6日 11:28*

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/KoTWV9E4RiaAdLXXpNOnkY7rZcYicpMV7N5QhqxOSFvzmrGqiaqQEIicZ7u9TodwmaYoQC6AxoDkf9MJFkiawKV3CpsicicllNZPqNFuia0dT1kjtto/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0)

如果只看新闻标题，这像是 Anthropic 又想买一种新芯片。

它已经有 NVIDIA GPU。

它也在用 Google TPU。

它还和 Amazon 绑定了 Trainium。

为什么还要去看一家英国创业公司的推理芯片？

这件事真正有意思的地方，不是“Anthropic 要不要买 Fractile”，而是 Fractile 被媒体描述成一种 **DRAM-less inference chip** 。

翻成人话就是：

> 它想把大模型推理里最烦人的一部分数据搬运，尽量压到离计算更近的地方。

这不是一个小优化。

训练时代，大家最爱比 FLOPS。

推理时代，尤其是在线推理、长上下文、reasoning model 和 Agent 工作流变多以后，很多系统开始卡在另一个地方：

数据不是算不动，而是搬不动。

模型权重要搬。

KV Cache 要搬。

请求状态要搬。

Prefill 生成的缓存要交给 Decode 用。

多租户、长 prompt、高并发一叠加，GPU 不一定空闲，但用户仍然会感觉慢。

第一句话等很久。

后面的 token 一卡一卡。

p99 延迟突然难看。

这篇文章想讲的就是这件事：

为什么一个还没量产、公开资料也不算多的 DRAM-less 推理芯片，会让 Anthropic 这种模型公司感兴趣？

## 一、先把新闻边界说清楚

目前能确认的是：据媒体报道，Anthropic 与英国 AI 芯片创业公司 Fractile 有过早期接触，希望未来在 Fractile 芯片可用后采购其推理芯片。

这不是已经签署的大规模采购官宣。

也不是 Claude 已经跑在 Fractile 芯片上。

更不是“Anthropic 要抛弃 NVIDIA”。

这些都不能这么写。

比较稳的说法是：

Anthropic 正在为未来推理算力做更多供应线探索。

这和它最近的算力动作是连在一起的。

Anthropic 一边继续使用 NVIDIA GPU，一边和 Amazon 深度绑定 Trainium，一边扩大与 Google TPU 和 Broadcom 的合作。

如果再去接触 Fractile，它不是在押注单一替代品，而是在做一个模型公司越来越绕不开的事：

> 给未来几年的推理成本、容量和供应链，提前找更多解法。

为什么是推理？

因为训练虽然贵，但训练是阶段性工程。

一个大模型训练完之后，真正长期烧钱的是服务。

每天有多少用户问问题。

每个用户上下文有多长。

每次回答生成多少 token。

Agent 调几次工具。

模型要不要推理更久。

这些都会变成持续的推理成本。

如果推理成本降不下来，模型公司就会陷入一个很难受的局面：

模型越好，用的人越多，亏得也越快。

所以 Anthropic 关注推理芯片，不奇怪。

真正值得追问的是：Fractile 这种路线到底想解决什么？

## 二、DRAM-less 不是魔法词

先解释一下这个词。

DRAM 是动态随机存取存储器。

普通服务器内存是 DRAM。

GPU 旁边的 HBM，本质上也是一种高带宽 DRAM，只是堆叠方式、封装方式和带宽能力更适合加速器。

今天的大模型推理，经常依赖 GPU + HBM。

权重放在 HBM。

KV Cache 放在 HBM。

激活和中间状态也要在计算单元与内存之间来回走。

HBM 已经很快，但它仍然在计算芯片外面。

数据每次从 HBM 走到计算单元，再从计算单元回到内存，都要花时间、花能耗、占带宽。

SRAM 不一样。

SRAM 是静态随机存取存储器。

它更快，延迟更低，也更容易放在芯片内部，离计算单元更近。

但 SRAM 的缺点也很硬：

容量小。

面积贵。

成本高。

同样面积里，SRAM 放不下 DRAM 那么多数据。

所以 “DRAM-less” 不能理解成：

一块芯片从此完全不需要任何外部内存，所有 frontier model 都能轻松塞进去。

这不现实。

更合理的理解是：

Fractile 希望把推理路径里最热、最频繁访问、最拖延迟的数据，尽量放到靠近计算的位置，减少对外部 DRAM/HBM 访问的依赖。

它真正挑战的是数据移动路径。

不是简单把 GPU 的 FLOPS 再堆高一点。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

## 三、为什么推理会变成“搬数据”的生意

训练和推理的资源画像不一样。

训练时，一个 batch 里有大量 token，大矩阵乘法可以把算力吃得很满。

系统当然也会受通信、显存、并行策略影响，但很多时候大家仍然围绕吞吐、FLOPS、集群规模来组织问题。

在线推理就没这么干净。

一个请求进来，不是直接一个字一个字往外吐。

它通常先做 Prefill。

Prefill 是把 prompt、历史对话、RAG 文档、工具结果这些输入一次性读完，生成后续生成时要用的 KV Cache。

KV Cache 可以理解成模型读完上下文后留下的运行时记忆。

等 KV Cache 准备好以后，模型进入 Decode。

Decode 是逐 token 生成。

每生成一个 token，都要读模型权重，读历史 KV Cache，算出下一个 token，再把新的 KV 写回去。

也就是说，Decode 不是一次大计算。

它是一串很密的短循环。

每一步都离不开数据读取。

这就是推理芯片和推理系统越来越关注内存的原因。

如果模型很大，权重读起来重。

如果上下文很长，KV Cache 读起来重。

如果并发很高，HBM 里同时驻留的 KV Cache 会变得很拥挤。

如果用户都在流式等待，任何一次调度抖动都会变成“怎么突然不出字了”。

这时你再问“峰值算力多少”，就不够了。

你还要问：

- 每个 token 要搬多少数据？
- KV Cache 在哪里？
- 热数据能不能留在更近的位置？
- 长上下文会不会把短对话拖慢？
- p99 延迟是不是被内存访问和排队打爆？
- 单 token 成本是不是随着上下文长度一起变坏？

这也是为什么 PD 分离、Chunked Prefill、Prefix Cache、KV offload、KV-aware routing 会一起出现。

它们表面上是软件系统优化，实际都在围绕同一个问题转：

> 大模型推理不只是计算问题，它是一套状态和数据移动问题。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

## 四、Fractile 的路线为什么会被注意到

Fractile 公开介绍里反复强调一个方向：

memory 和 compute 不是分开的，而是 physically interleaved。

也就是把内存和计算在物理布局上交织起来。

这句话听起来很抽象。

放到推理系统里看，它的目标就清楚了：

减少数据从远处内存搬到计算单元的距离。

减少等待外部内存的时间。

让推理，尤其是 decode，更像在近处反复读写热数据。

这条路线和 GPU 不一样。

GPU 是通用并行处理器。

它强在生态、通用性、训练能力、复杂算子支持和成熟软件栈。

HBM 带宽也非常高。

但 GPU 的基本形态仍然是计算芯片 + 外部高带宽内存。

Fractile 这种路线则更像在问：

如果目标不是训练一切模型，而是把推理这个问题收窄，能不能用更激进的内存-计算布局换低延迟和低成本？

它和 Groq、Cerebras 这些路线有某种共同点。

Groq 用大量片上 SRAM 和确定性流水线，强调低延迟 token 生成。

Cerebras 用 wafer-scale engine，把大量核心、SRAM 和片上网络放在一整片晶圆上，试图减少跨芯片通信。

Fractile 更强调 DRAM-less 和 memory-compute interleaving。

这些公司路线不同，但都在说同一句话：

> 未来推理芯片不能只比算力，必须重构数据怎么靠近计算。

这不是说它们一定会赢。

而是说明市场开始为“非 GPU 型推理架构”留下空间。

只要推理需求足够大，低延迟、低成本、低能耗这些窄目标，就足以支撑专用架构出现。

## 五、Anthropic 为什么尤其会关心这个问题

Claude 这类模型服务有几个特点。

第一，长上下文压力大。

Claude 的产品叙事一直很重视长文档、代码、企业资料和复杂任务。

长上下文不是把 prompt 上限写大就完了。

上下文越长，Prefill 越重。

后续 Decode 每一步面对的 KV Cache 也越大。

如果用户先上传一份长合同，再连续追问，系统需要在成本和体验之间做很多权衡。

第二，reasoning 会拉长生成过程。

推理更深的模型，不一定只是输入更长。

它还可能输出更多中间推理、规划、工具调用和最终答案。

输出 token 多了，Decode 循环就更长。

每一步都在消耗内存带宽和读写 KV。

第三，Agent 工作流让请求变成多轮状态机。

一个普通聊天请求，可能只需要一次模型调用。

一个 Agent 请求，可能要读文件、查数据库、调 API、写代码、再让模型判断下一步。

每一步都可能带上上下文。

每一步都可能重新进入 Prefill 和 Decode。

如果系统没有把缓存、路由、权限和状态管理好，成本会非常难看。

第四，商业模式逼着模型公司算细账。

API 价格不是随便定的。

订阅价格也不是无限上调的。

企业客户还会要求更稳定的 SLA、更强隔离、更低延迟、更高吞吐。

当模型能力变成商品，推理成本就会变成毛利。

Anthropic 当然要看 NVIDIA。

也当然要看 Trainium、TPU。

但它同时看 Fractile 这种路线，说明它在问一个更长期的问题：

如果未来 Claude 的主要成本来自在线推理，尤其是长上下文和 decode，那么有没有一种芯片能把每 token 的数据移动成本打下来？

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

## 六、不要把 Fractile 写成 GPU 杀手

这类新闻最容易写歪。

一家公司接触一款新芯片，不等于旧芯片要被替代。

一款芯片在仿真里表现好，不等于它能在生产里跑稳。

更不能因为用了 DRAM-less 这个词，就认为它绕开了所有内存问题。

Fractile 要过的关很多。

第一，容量关。

SRAM 快，但贵。

大模型权重和长上下文 KV Cache 太大，不可能都舒舒服服放在一块芯片的 SRAM 里。

如果要多芯片、多节点，就又会遇到通信、分片、同步和调度。

第二，软件栈关。

芯片不是把算力做出来就完了。

客户真正关心的是模型能不能迁移，PyTorch 路径能不能支持，常见算子能不能跑，量化和 attention 变体能不能跟上，编译器出问题时有没有工具排查。

GPU 的护城河很大一部分不在芯片参数，而在 CUDA、库、框架、生态和工程习惯。

第三，模型变化关。

今天是 Transformer。

明天可能有更多 MoE、GQA、MLA、滑动窗口注意力、speculative decoding、长上下文压缩、多模态 encoder、工具调用状态管理。

专用架构越激进，越要证明自己能跟上模型变化。

否则某一代模型跑得很好，下一代模型结构一变，适配成本就会变高。

第四，集群关。

真正的大客户买的不是单芯片 demo。

他们要的是机柜、网络、供电、散热、监控、故障恢复、调度系统和账单模型。

如果一个推理服务要支撑 Claude 级别的流量，单芯片低延迟只是起点。

系统级可靠性才是入场券。

第五，经济账关。

降低数据移动理论上能省电、降延迟、提高吞吐。

但芯片制造、封装、良率、软件团队、客户迁移、供应链和维护也要钱。

最后算的是总成本：

一百万 token 到底便宜多少？

同等 SLA 下需要多少机柜？

高峰期 p99 能不能守住？

开发者迁移要花多久？

如果这些问题答不上来，“DRAM-less” 就只是一个好听的架构词。

## 七、这件事和 PD 分离是同一个方向

前面写 PD 分离时，我们讲过一个判断：

大模型推理正在从“跑一个模型”变成“管理一套状态系统”。

Prefill 负责把输入变成 KV Cache。

Decode 负责围绕 KV Cache 逐 token 生成。

长上下文、高并发、流式输出、Agent 工作流一起来，系统就不得不拆：

prefill worker 和 decode worker 要不要分开？

KV Cache 要不要跨节点传？

热点前缀要不要缓存？

长 prompt 要不要切 chunk？

decode 的 p99 要不要单独保护？

这些是软件系统层面的拆分。

Fractile 这类芯片路线，是硬件层面的同一个趋势：

既然推理的瓶颈越来越像数据移动，那就不能只在远处堆算力。

要让数据更接近计算。

要让热状态更容易复用。

要让每 token 的路径更短。

软件在做 PD 分离、KV-aware routing、cache offload。

硬件在做 SRAM、近内存计算、片上互联、确定性流水线。

它们不是两件独立的事。

它们都在承认一个现实：

> 推理时代，模型服务的核心对象不只是权重，还有运行时状态。

这也是为什么未来的推理系统会越来越像数据库和 CDN。

有热数据和冷数据。

有命中率和失效率。

有路由和粘性。

有缓存隔离和 TTL。

有数据搬运成本和恢复粒度。

芯片厂商如果只讲 TOPS，解释不了这些问题。

推理框架如果只讲吞吐，也解释不了这些问题。

模型公司如果只讲模型能力，更解释不了商业账。

## 八、怎么看这类推理芯片

以后类似新闻会越来越多。

某某公司做 near-memory compute。

某某公司做 wafer-scale。

某某公司做 LPU。

某某公司做 AI ASIC。

某某云厂商自研推理卡。

不要一看到新架构就问“能不能取代 NVIDIA”。

这个问题太粗。

更好的判断框架是五个指标。

第一，看它解决的是 Prefill 还是 Decode。

Prefill 更吃算力和批量。

Decode 更吃内存带宽、低延迟、KV 读取和调度稳定性。

一款芯片到底更适合哪一段，要分开看。

第二，看它怎么处理 KV Cache。

长上下文时代，KV Cache 不是边角料。

它是推理系统里的核心状态。

芯片、内存层级、运行时和路由如果都不关心 KV，长上下文成本就很难压下去。

第三，看它的软件栈。

有没有编译器。

有没有框架支持。

有没有模型适配工具。

有没有监控、profile、调试、量化和部署路径。

芯片参数不能直接变成客户收益，中间隔着一整套系统软件。

第四，看它的集群形态。

单卡快不等于服务快。

推理业务要看机柜、网络、调度、故障恢复、扩缩容和多租户隔离。

第五，看真实成本。

不是官方峰值。

不是发布会 benchmark。

而是同一个模型、同一个上下文分布、同一个并发水平、同一个 SLA 下：

TTFT 多少？

ITL/TPOT 多稳？

p95/p99 怎么样？

每百万 token 多少钱？

运维复杂度多高？

这几个问题答清楚，才谈得上推理芯片竞争。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

## 九、对国产推理芯片的启发

这条新闻也能反过来看国产芯片。

国产 AI 芯片很容易陷入一个叙事：

峰值算力追到多少。

HBM 带宽追到多少。

能不能跑某个大模型。

这些当然重要。

但如果未来推理成本主要卡在长上下文、KV Cache、decode 稳定性、软件栈和单位 token 成本，只比峰值算力就不够了。

真正要回答的是：

能不能把长 prompt 的 TTFT 压下来？

能不能让流式输出不抖？

能不能让 KV Cache 管理和框架打通？

能不能在企业场景里做租户隔离和审计？

能不能让开发者不用大改代码就迁移？

能不能在真实业务分布下算出更低的单 token 成本？

如果这些做不到，芯片参数再漂亮，也很难变成生产系统的稳定选择。

Anthropic 接触 Fractile 这件事，真正提醒我们的不是“某个创业公司要挑战 NVIDIA”。

它提醒的是：

大模型推理芯片的战场正在变窄，也变深。

窄，是因为它不再追求包打所有训练和推理任务。

深，是因为它开始钻进 token 生成、KV Cache、内存层级、低延迟和成本结构里。

以后推理芯片的竞争，可能不会只在一张规格表里结束。

它会发生在每一次用户等待首 token 的时候。

发生在每一次长上下文请求挤进队列的时候。

发生在每一次 decode worker 读 KV Cache 的时候。

发生在每个月模型公司看推理账单的时候。

如果说训练时代的关键词是算力，那么推理时代的关键词会越来越像：

内存。

状态。

数据移动。

以及每一个 token 背后的真实成本。

这篇可以和 PD 分离、Groq、Cerebras 放在一起看。

软件在拆 Prefill、Decode 和 KV Cache。

硬件在拆内存、计算和数据路径。

两条线最后都会落到同一个问题：

大模型推理到底怎样才能稳定、低延迟、低成本地服务真实用户。

芯片与算力 · 目录

继续滑动看下一个

口袋 AI 系统笔记

向上滑动看下一个