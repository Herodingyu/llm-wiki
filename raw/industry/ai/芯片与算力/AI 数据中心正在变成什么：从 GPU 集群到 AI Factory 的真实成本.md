---
title: "AI 数据中心正在变成什么：从 GPU 集群到 AI Factory 的真实成本"
source: "https://mp.weixin.qq.com/s?__biz=Mzg3MjcwNjExOA==&mid=2247484360&idx=1&sn=93a22920b26aa4e67cb322624991f51d&chksm=ceea7ae1f99df3f73a900e203e13c35e2f3d04d4d23387a44d9c74fb871a5cefc7f430fc02ad&scene=178&cur_album_id=4496673538715877378&search_click_id=#rd"
author:
  - "[[JW]]"
published:
created: 2026-05-09
description: "今天再看 AI 数据中心，不能只把它理解成“很多 GPU 摆在一起”。这个理解在 2023、2024 年还勉强够用。"
tags:
  - "clippings"
---
JW *2026年5月1日 19:36*

![图片](https://mmbiz.qpic.cn/mmbiz_png/KoTWV9E4RiaDOA4W8O3pAAuZPo4HdQ9GuM96k6qeHkjDzrbEFDKUiaOwloVdqmcK6MDR7dSLiaAmugJUWFazd7SvEwibxOXqaYEJWIlbmeM3icLM/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0)

今天再看 AI 数据中心，不能只把它理解成“很多 GPU 摆在一起”。

这个理解在 2023、2024 年还勉强够用。

那时很多讨论都围绕一个问题：谁能拿到更多 H100、H200、B200，谁就能训练更大的模型，服务更多用户。

但到 2026 年，这个问题已经变形了。

GPU 仍然重要，而且非常重要。

但是 AI 数据中心的竞争，正在从“谁买到更多卡”，变成“谁能把电力、冷却、网络、内存、芯片、调度、模型服务和 token 经济性组织成一座稳定运转的 AI Factory”。

所谓 AI Factory，不是一个好听的新词。

它背后的含义很具体：

> 数据中心不再只是放服务器的地方，而是持续把电力、数据和模型权重转化成 token 的生产系统。

如果把 AI 应用比作前台产品，那么 AI Factory 就是后台工厂。

用户看到的是聊天、代码、图片、视频、搜索、Agent。

系统里真正发生的是：请求进入队列，模型读上下文，KV Cache 占用显存，GPU/TPU/NPU 执行矩阵计算和 Attention，网络搬运张量，液冷带走热量，调度系统控制并发，最后把一个个 token 吐回用户。

所以 AI 数据中心的真实成本，已经不是一句“GPU 很贵”能解释的。

它至少包括六层：

- 芯片成本
- HBM 和内存成本
- 网络互联成本
- 电力和冷却成本
- 软件调度成本
- 运维和利用率成本

这六层加起来，才是 tokens/$ 和 tokens/W。

而 tokens/$ 和 tokens/W，正在变成 AI 基础设施真正的财务指标。

## 一、AI Factory 不是一排 GPU，而是一条 token 生产线

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

传统数据中心的基本问题是：如何稳定运行网站、数据库、缓存、存储、虚拟机和容器。

AI 数据中心的基本问题变了：

如何在尽可能低的成本下，持续、稳定、低延迟地产生 token。

这听起来像一句抽象话，但工程上很具体。

一次大模型调用不是“跑一下模型”。

它通常会经历：

1\. 请求进入网关和队列。  
2\. tokenizer 把文本变成 token。  
3\. 推理框架决定如何 batch。  
4\. Prefill 阶段读取完整输入。  
5\. KV Cache 被写入显存或内存层级。  
6\. Decode 阶段逐 token 生成。  
7\. 多轮对话继续复用或扩展缓存。  
8\. 如果是 Agent，还要调用工具、读文件、写代码、检索、等待外部系统。  
9\. 如果是多模态，还要先处理图片、视频、OCR、视觉编码。

每一步都消耗不同资源。

Prefill 更像一次吞吐型计算，输入越长，读得越多。

Decode 更像持续的小步生成，每个用户都在等下一个 token。

KV Cache 更像一块隐形显存账本，上下文越长、并发越高、会话越多，它越容易成为瓶颈。

Agent 则会把一次调用拉长成一个工作流，把等待时间、工具调用、状态管理和错误恢复都带进推理系统。

所以 AI Factory 的核心不是“有多少算力”，而是“能不能把不同形态的 AI 负载组织起来”。

这也是为什么 NVIDIA、Google、Microsoft、AWS、AMD、Meta、Qualcomm 都在讲机架级、液冷、网络、内存层级和软件栈。

单颗芯片的峰值仍然重要，但它已经只是工厂里的一台机器。

真正决定产能的是整条生产线。

## 二、2026 年的新技术信号：大家都在往机架级和全栈走

2026 年最明显的变化，是大厂不再只发布“芯片”，而是在发布“系统”。

NVIDIA 的 Vera Rubin 不是单颗 GPU 叙事，而是 NVL72 机架级系统：Vera CPU、Rubin GPU、NVLink 6、ConnectX-9、BlueField-4、Spectrum-X、液冷、AI Enterprise 软件一起出现。

Google 第八代 TPU 直接分成 TPU 8t 和 TPU 8i：8t 面向训练，8i 面向推理，背后是更清晰的训练/推理负载分工。

Microsoft Maia 200 不是公开零售显卡，而是 Azure 内部面向 inference 的自研加速器，目标是改善 Copilot、Foundry 和大模型服务的 token 经济性。

AWS Trainium3 / Trn3 UltraServers 已经 GA，关键词也不是单卡，而是 UltraServer、Neuron 软件栈、Bedrock 和 agentic/reasoning/video generation 的成本。

AMD MI400 / MI455X / Helios 则把 GPU、EPYC Venice、Pensando NIC、ROCm、OCP Open Rack Wide 和液冷放到一个 rack-scale 路线里。

Meta 扩展 MTIA，不是为了对外卖卡，而是为了让推荐、GenAI inference、平台内部 AI 服务不完全依赖通用 GPU。

Qualcomm AI200 / AI250 进入数据中心推理，也强调 rack-scale、内存容量和 TCO，而不是只拿手机 NPU 的思路做云端。

这些路线看起来不同，但共同方向很一致。

| 厂商/系统 | 最新信号 | 关键词 | 对 AI 数据中心的含义 |
| --- | --- | --- | --- |
| NVIDIA Vera Rubin / GB300 | 机架级 AI Factory 平台 | NVL72、NVLink、液冷、DPU、NIC | 数据中心从服务器部署走向整机架交付 |
| Google TPU 8i / 8t | 训练和推理分化 | 8i inference、8t training、agentic era | 云厂商按负载重构芯片和网络 |
| Microsoft Maia 200 | Azure 自研推理芯片 | FP8/FP4、HBM3e、on-chip SRAM | hyperscaler 用自研芯片优化内部 token 成本 |
| AWS Trainium3 | Trn3 UltraServers GA | 3nm、UltraServer、Neuron、token economics | 云内训练/推理成本成为产品竞争力 |
| AMD Helios / MI400 | 开放 rack-scale 路线 | MI455X、EPYC、Pensando、ROCm、ORW | 机架级竞争不再只有 NVIDIA 路线 |
| Meta MTIA | 自研芯片组合扩展 | inference、recommendation、GenAI | 超大应用平台用专用芯片降低长期成本 |
| Qualcomm AI200/AI250 | 进入 rack-scale inference | LPDDR、低 TCO、推理专用 | 推理市场足够大，会容纳更多专用架构 |

这张表背后的共同点是：AI 数据中心正在从“采购服务器”变成“设计生产系统”。

以前 IT 团队问：这台服务器能不能上架？

现在 AI 基础设施团队问：

这一个机架能提供多少 tokens/sec？

多少 tokens/W？

多少 tokens/$？

p99 延迟是多少？

长上下文和 Agent 会不会把 KV Cache 打爆？

液冷、供电、网络和软件栈能不能一起撑住？

## 三、真实成本不只在 GPU，而在整条链路

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

很多人说 AI 很贵，第一反应是“GPU 很贵”。

这当然没错。

但对运营 AI 服务的人来说，GPU 只是成本入口，不是成本全貌。

真正应该看的，是一次 token 背后消耗了多少资源。

### 1\. 芯片折旧

GPU、TPU、Trainium、Maia、MTIA、AI200 这类加速器都很贵。

但芯片买回来之后，成本不是一次性消失，而是会摊到每一天、每小时、每个 token 上。

如果利用率低，token 成本会非常难看。

一台昂贵设备空闲时，不是在省钱，而是在持续折旧。

### 2\. HBM 和内存

AI 推理越来越像内存生意。

模型权重要放在 HBM 里。

KV Cache 要放在 HBM 或更复杂的内存层级里。

长上下文、多并发、多轮对话会持续扩大缓存需求。

很多时候，推理系统不是算力先满，而是显存容量、带宽或缓存管理先变成瓶颈。

这也是为什么 Maia 200、MI400、Vera Rubin、Qualcomm AI200 都在强调 memory system。

### 3\. 网络互联

大模型服务越来越依赖 scale-up 和 scale-out。

Scale-up 是同一机架或同一 pod 内，把多颗芯片组织成一个更大的计算域。

Scale-out 是跨机架、跨 pod、跨数据中心扩展。

MoE、模型并行、长上下文、多模态和大规模训练都会放大网络压力。

网络慢，GPU 就等数据。

GPU 等数据，利用率就下降。

利用率下降，tokens/$ 就变差。

### 4\. 电力

AI 数据中心不是“能不能插电”这么简单。

高密度机架会改变配电、UPS、变压器、备用电源、园区选址和并网节奏。

OpenAI 在 2026 年 4 月提到，到 2029 年在美国 securing 10GW AI infrastructure 的目标。

10GW 是什么概念？

它已经不是普通企业机房扩容，而是能源项目。

当 AI 基础设施进入 GW 级别，电力不再是后台资源，而是战略资源。

### 5\. 冷却

AI 芯片功耗越来越高，机架密度越来越高，空气冷却越来越难。

Direct-to-chip liquid cooling、CDU、冷板、rear-door heat exchanger、液冷验证、维护流程，都会进入基础设施设计。

液冷不是“给机房加个水管”。

它会影响机架结构、维护方式、故障处理、供应链、数据中心改造和运维团队技能。

### 6\. 软件调度

最后还有一个经常被低估的成本：调度。

硬件再强，如果推理框架不能把请求组织起来，资源照样浪费。

动态 batching、prefix cache、KV Cache 管理、speculative decoding、模型路由、负载均衡、故障迁移、冷热模型调度，都会影响最终成本。

AI Factory 的软件层，和芯片一样重要。

## 四、从 GPU 集群到 AI Factory：基本单位正在上移

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

传统 GPU 集群的基本单位是服务器。

你买一台服务器，里面插几张 GPU，接入网络，装驱动，跑框架。

后来变成节点和 pod。

多个节点通过高速网络连起来，组成训练集群或推理集群。

现在，AI 基础设施的基本单位正在继续上移：从服务器到机架，从机架到园区，从园区到电力合约。

这就是 AI Factory 的变化。

| 阶段 | 基本单位 | 典型关注点 | 局限 |
| --- | --- | --- | --- |
| 单机 GPU | 服务器 | GPU 数量、显存、驱动 | 适合开发和小规模服务 |
| GPU 集群 | 节点/pod | 网络、调度、并行、存储 | 运维复杂，资源利用率难稳定 |
| Rack-scale AI | 整机架 | scale-up 互联、液冷、供电、统一交付 | 对机房和供应链要求更高 |
| AI Factory | 园区/云区 | 电力、冷却、网络、模型服务、token economics | 已经是能源和资本密集型系统 |

NVIDIA NVL72、GB300、Vera Rubin，AMD Helios，AWS Trn3 UltraServers，Google TPU pod，都是这个方向的体现。

它们不只是更大的机器。

它们是在把“多颗芯片怎么协同”这件事前置到系统设计阶段。

这有一个很重要的工程含义：

> 未来很多 AI 性能差异，不会来自某颗芯片单点参数，而会来自整机架、整网络、整软件栈的协同效率。

对于应用团队来说，这意味着云厂商之间的差异会变大。

同样的模型，在不同云、不同推理框架、不同硬件后端上，价格、延迟、并发、稳定性可能完全不同。

对于企业私有化来说，这意味着“买几台 GPU 服务器”越来越难覆盖真实需求。

如果业务真的要长期跑 AI，必须提前考虑机房电力、液冷、网络、运维、模型升级和推理框架。

## 五、电力和液冷，正在从配角变成主角

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

AI 基础设施最现实的瓶颈，往往不是“有没有钱买芯片”，而是“有没有地方把它们稳定跑起来”。

芯片可以下订单。

电力接入、机房建设、液冷改造、审批、供电冗余、运维体系，不是下单就立刻出现。

这就是为什么 AI 数据中心开始像能源工程。

### 电力：从 IT 容量变成战略容量

普通互联网服务当然也耗电。

但 AI 训练和推理的增长方式不一样。

模型越大、上下文越长、Agent 越普及、视频生成越多，单位用户的计算消耗会显著上升。

过去一个用户请求可能只是数据库查询和网页渲染。

现在一个用户请求可能触发几十秒推理、数十万 token 上下文、多轮工具调用，甚至图像或视频生成。

用户数量增长是一层压力。

单用户计算量增长是另一层压力。

两层叠加，才是 AI 数据中心扩张的真正原因。

### 液冷：不是高级配置，而是高密度 AI 的基础设施

空气冷却的能力有限。

当 rack power density 上升到几十 kW，甚至向 100kW 以上靠近，直接用空气带走热量会越来越困难。

Direct-to-chip liquid cooling 的逻辑很直观：

把冷板贴近芯片，让液体在热源附近带走热量。

但实际系统很复杂。

你需要 CDU 分配冷却液。

你需要监测流量、压力、温度。

你需要考虑泄漏、维护、兼容性、冗余。

你还要把液冷系统和机房电力、机架布局、服务器维护周期一起设计。

所以液冷不是“降低温度”的小功能，而是 AI Factory 的结构性变化。

### 改造旧机房，比新建更难

很多企业和服务商不会一开始就拥有专门为 AI 设计的新园区。

他们会尝试在现有机房里部署 AI rack。

这时会遇到几个问题：

- 原有供电容量不够。
- 地板承重和机架尺寸不合适。
- 空调系统不能承受高密度热源。
- 网络布线和东西向流量设计不足。
- 运维团队没有液冷经验。

所以未来几年，AI 数据中心会出现两条路线：

一条是 hyperscaler 和大型云厂商的新建 AI Factory。

另一条是企业和托管服务商的 brownfield modernization，也就是在旧数据中心里局部改造，部署液冷、高密度机架和 AI 推理集群。

这两条路线都会存在。

前者追求极限规模。

后者追求现实可落地。

## 六、网络互联进入成本中心：不是所有带宽都一样

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

AI 数据中心里的网络，不是普通业务网络的放大版。

它有几个特殊要求。

第一，带宽要高。

模型并行、数据并行、专家并行、checkpoint、参数同步、KV Cache 迁移，都需要大量数据移动。

第二，延迟要低。

推理服务里，用户等的是 token。

如果一次生成要跨多颗芯片，网络延迟会直接进入用户体验。

第三，拥塞要可控。

训练和推理都会产生突发流量。

MoE 的 token 路由尤其容易制造不均衡流量。

第四，网络要和软件栈协同。

NVLink、InfiniBand、Spectrum-X Ethernet、Google TPU ICI、UALink、Ultra Ethernet，这些不是品牌词堆叠，而是在回答同一个问题：

如何让多颗芯片、多台服务器、多排机架像一个可调度的计算系统。

| 网络层级 | 解决什么问题 | 典型技术 |
| --- | --- | --- |
| 芯片内/封装内 | chiplet、HBM、片上数据移动 | NoC、HBM interposer、片上 SRAM |
| 服务器内 | 多加速器协同 | NVLink、PCIe、CXL 等 |
| 机架内 scale-up | 把多颗加速器组织成更大的计算域 | NVL72、UALink、TPU ICI |
| 机架间 scale-out | 扩展训练/推理集群 | InfiniBand、Spectrum-X、Ultra Ethernet |
| 云区/园区 | 多集群调度和容灾 | 云网络、存储网络、控制面 |

为什么网络会进入成本中心？

因为网络慢会让芯片闲着。

芯片闲着会让折旧摊薄变差。

折旧变差会让 tokens/$ 变差。

最终，网络不是“额外成本”，而是决定昂贵芯片能不能充分利用的核心基础设施。

## 七、AI Factory 服务的不是一种负载

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

AI 数据中心最难的地方，是负载越来越混合。

训练、微调、推理、Agent、多模态、视频生成、搜索推荐、合成数据、强化学习，都在争同一批基础设施。

这些负载对系统的要求完全不同。

| 负载 | 主要瓶颈 | 对基础设施的要求 |
| --- | --- | --- |
| 预训练 | 大规模同步、网络、存储、checkpoint | 高吞吐网络、稳定集群、容错 |
| 后训练/强化学习 | 多阶段流水线、数据生成、评测 | 调度灵活、模型版本管理、评测闭环 |
| 在线推理 | 低延迟、KV Cache、并发 | 动态 batching、缓存管理、p99 控制 |
| Agent | 长时间任务、工具调用、状态 | 工作流调度、上下文压缩、任务恢复 |
| 多模态 | 视觉编码、视频帧、存储带宽 | 数据预处理、GPU/CPU/NPU 协同 |
| 推荐/排序 | 高频低延迟、大规模特征 | 专用推理芯片、CPU/加速器协同 |

这也是 hyperscaler 自研芯片越来越多的原因。

通用 GPU 很强，但不一定是所有负载的最低成本解。

Meta 的 MTIA、Microsoft Maia、Google TPU、AWS Trainium/Inferentia，本质都是在说：当 AI 负载足够大、足够稳定、足够长期，自研芯片就可能摊得过来。

但这不意味着通用 GPU 会消失。

更可能发生的是分层：

前沿训练、复杂多模态、快速迭代模型，继续需要最强通用 GPU 和成熟生态。

大规模稳定推理、推荐排序、内部 Copilot、特定模型服务，会逐步迁移到更专用、更便宜、更可控的硬件。

这就是 AI Factory 的第二个变化：

> 它不是一种硬件，而是一组硬件组合。

GPU、TPU、NPU、LPU、CPU、DPU、NIC、存储、液冷、电力和调度系统，会按负载重新分工。

## 八、从“买算力”到“运营 token”：指标体系也要变

过去评价数据中心，常见指标是：

PUE。

机柜数量。

服务器数量。

CPU 核数。

GPU 数量。

网络带宽。

这些仍然有意义，但 AI Factory 还需要另一组指标。

| 指标 | 含义 | 为什么重要 |
| --- | --- | --- |
| MW / GW capacity | 电力容量 | 决定可部署 AI 规模上限 |
| Rack kW | 单机架功率密度 | 决定是否需要液冷和新型机架 |
| PUE | 总能耗 / IT 能耗 | 衡量能源使用效率，但不能单独代表 AI 成本 |
| WUE | 水资源效率 | 液冷和蒸发冷却都会影响水资源策略 |
| HBM TB / rack | 每机架高带宽内存容量 | 影响模型大小、长上下文和并发 |
| Network bisection bandwidth | 集群横向通信能力 | 决定训练、MoE、模型并行是否顺畅 |
| TTFT | 首 token 延迟 | 影响用户感知启动速度 |
| TPS/user | 单用户生成速度 | 比总吞吐更贴近在线体验 |
| p95/p99 latency | 尾延迟 | Agent 和企业应用最怕不稳定 |
| utilization | 芯片利用率 | 直接影响折旧摊薄 |
| tokens/$ | 每美元能产多少 token | 商业化核心指标 |
| tokens/W | 每瓦能产多少 token | 能源约束下的核心指标 |

这里有一个容易忽略的点：

PUE 很重要，但 PUE 不是 AI Factory 的全部。

如果一个数据中心 PUE 很好，但模型服务调度很差，GPU 大量空闲，tokens/$ 仍然会很差。

反过来，如果某套系统 PUE 一般，但硬件利用率高、缓存命中好、p99 稳定、低精度跑得好，真实 token 成本可能更低。

所以 AI 数据中心的评估口径必须从“机房效率”扩展到“模型服务效率”。

## 九、为什么 hyperscaler 都在自研芯片

自研芯片不是每家公司都该做。

它需要巨额研发投入、长期负载、软件栈、供应链、封装、编译器、运维和规模化部署能力。

但对 hyperscaler 来说，自研芯片有一个非常直接的理由：

他们的 AI 负载足够大。

如果一个公司每天要服务数十亿次推荐、搜索、对话、Copilot、广告排序、内容理解、视频生成，那么每个 token、每次 inference、每瓦能耗的微小优化，都会被规模放大。

Microsoft Maia 200 是这个逻辑。

它不是为了让所有人买一张 Maia 卡，而是为了让 Azure、Microsoft 365 Copilot、Foundry 和 OpenAI 相关负载在微软云内获得更好的性能/成本。

AWS Trainium3 是这个逻辑。

它不是单纯和 GPU 比参数，而是放进 EC2、Bedrock、Neuron、UltraServer 体系里，服务 AWS 的训练和推理客户。

Google TPU 更是这个逻辑。

TPU 从一开始就是 Google 内部和 Google Cloud 共同演化的系统，Gemini、搜索、广告、云客户都在推动它迭代。

Meta MTIA 也是这个逻辑。

Meta 的推荐、广告、Feed、Reels、GenAI 助手，如果长期依赖外部通用 GPU，成本和供应链都会受制于人。

所以自研芯片的核心不是“打败 NVIDIA”。

更准确的说法是：

> 当 AI 负载足够稳定、足够大，平台公司会把一部分工作负载从通用 GPU 迁移到更适合自己的专用硬件。

这并不削弱 NVIDIA 的位置。

前沿模型、快速变化的工作负载、生态复杂的训练和推理，仍然高度依赖 NVIDIA 的完整栈。

但它说明 AI 数据中心会越来越异构。

未来不是一个芯片赢下所有负载，而是不同负载被分配到不同硬件层。

## 十、开放机架和标准化：AI 工厂不能每家都从零造

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

AI Factory 还有一个现实问题：每家公司都自己定义机架、电源、冷却、维护方式，行业会非常低效。

这就是 OCP、Open Rack Wide、UALink、Ultra Ethernet 这类开放标准重要的原因。

AMD Helios 选择对齐 OCP Open Rack Wide，是一个很典型的信号。

它说明 AI rack 不只是芯片公司内部设计，也需要机柜、电源、冷却、交换机、服务器厂商、云厂商一起协作。

为什么机架标准重要？

因为高密度 AI rack 不只是“宽一点、高一点”。

它要解决：

- 电力怎么进机架。
- 液冷管路怎么布。
- 服务器怎么维护。
- 加速器怎么互联。
- 故障节点怎么更换。
- 热插拔和运维空间怎么设计。
- 机房如何批量部署。

标准化越好，AI Factory 的建设速度越快。

标准化越差，每个项目都是定制工程，成本和风险都会上升。

所以 AI 数据中心竞争会分成两层。

第一层是芯片和软件栈竞争。

第二层是基础设施标准和供应链竞争。

很多时候，第二层反而决定了能不能大规模落地。

## 十一、应用工程师为什么也要关心 AI 数据中心

有人可能会觉得，数据中心、电力、液冷、机架，这些离应用工程师很远。

实际上不远。

因为基础设施的变化会反过来改变应用设计。

### 长上下文不是免费午餐

如果模型支持 1M context，应用是不是就可以把所有文档都塞进去？

不一定。

长上下文会增加 prefill 成本。

会放大 KV Cache。

会影响并发。

会拖慢首 token。

会让推理服务更依赖 HBM、带宽和缓存管理。

所以应用工程师仍然需要 RAG、摘要、分段、缓存、上下文压缩和记忆管理。

### Agent 不是无限循环

Agent 的每一步都可能消耗 token、工具调用、上下文、等待时间和外部系统资源。

一个“看起来很聪明”的 Agent，如果没有预算控制，很容易变成成本黑洞。

AI Factory 越强，Agent 能做的事越多。

但应用层越要有任务边界、终止条件、评测和成本观测。

### 多模态会改变数据管道

图片、视频、音频不是文本 token 的简单扩展。

多模态应用会带来更重的数据预处理、存储、编码和带宽压力。

如果应用团队不理解这些底层成本，很容易在 demo 阶段感觉很好，上线后成本失控。

### 模型路由会变成常规能力

不是每个请求都该上最大模型。

未来 AI 应用很可能默认有模型路由：

简单问题走小模型。

代码和复杂推理走大模型。

长文档先走压缩和检索。

多模态请求走专门视觉模型。

高价值任务才使用最强推理模型。

这不是产品细节，而是 AI Factory 时代的应用成本控制。

## 十二、企业应该怎么判断自己的 AI 基础设施路线

不是所有企业都需要自己建 AI Factory。

大多数企业更现实的选择，是在云服务、托管 GPU、私有化小集群、端侧模型和 API 服务之间做组合。

可以用下面这个框架判断。

| 场景 | 更适合的路线 | 原因 |
| --- | --- | --- |
| 早期 AI 应用验证 | API / 云模型 | 上线快，不承担硬件折旧 |
| 中等规模企业知识库 | 云推理 + RAG + 缓存 | 成本和灵活性平衡 |
| 数据敏感、稳定负载 | 私有化推理集群 | 安全、可控、长期成本可优化 |
| 超大规模稳定推理 | 专用硬件 / 自研或深度定制 | 规模足够摊薄硬件和软件投入 |
| 端侧实时体验 | 端云协同 / 小模型 | 低延迟、隐私、离线可用 |
| 视频/多模态生成 | 云端高性能集群 | 资源消耗大，硬件更新快 |

一个简单判断是：

如果你的 AI 负载还不稳定，不要急着买重资产。

如果你的 AI 负载已经稳定、量大、长期存在，才值得认真评估专用推理集群。

如果你的组织没有推理框架、模型评测、SRE、成本观测和硬件运维能力，买 GPU 不是终点，而是问题的开始。

真正成熟的 AI 基础设施，不是“有卡”，而是能回答这些问题：

- 单次请求成本是多少？
- 峰值并发下 p99 延迟是多少？
- KV Cache 占用如何随上下文增长？
- 不同模型的路由规则是什么？
- 硬件利用率是多少？
- 低精度有没有真的降低成本？
- 故障时会不会影响在线业务？
- 模型升级有没有回归评测？
- 电力和冷却还有多少余量？

这些问题回答不出来，说明还没有进入 AI Factory 思维。

## 十三、未来三年的几个判断

第一，AI 数据中心会继续变大，但不会只比“谁的 GPU 更多”。

电力、液冷、机架级互联、软件调度、利用率，会成为同等重要的竞争变量。

第二，推理会成为更大的长期成本中心。

训练很贵，但训练是阶段性支出。

推理是持续支出。

只要用户在使用 AI，token 就一直在生产，成本就一直在发生。

第三，专用芯片会增加，但通用 GPU 不会消失。

AI 负载会分层：通用 GPU 负责快速变化和复杂任务，专用芯片负责稳定高频负载。

第四，液冷会从“高端配置”变成“高密度 AI 的默认假设”。

特别是当 rack 级系统成为主流，冷却不再是机房后端问题，而是系统设计前提。

第五，应用工程会越来越受基础设施约束。

长上下文、Agent、多模态、视频生成、实时语音，都不是纯产品能力。

它们背后都有明确的 token、显存、带宽、电力和调度成本。

第六，AI Factory 会让云厂商差异变大。

过去不同云之间的 VM、对象存储、数据库差异已经存在，但 AI 时代差异会更大。

因为每家云的芯片、网络、模型服务、推理框架、缓存策略、价格模型都不同。

## 十四、最后的判断清单

以后再看一个 AI 数据中心项目，不要只问“用了多少 GPU”。

至少问下面这些问题：

1\. 单机架功率密度是多少？  
2\. 是否默认液冷？  
3\. HBM 容量和带宽如何？  
4\. scale-up 和 scale-out 网络分别是什么？  
5\. 推理框架如何管理 KV Cache？  
6\. 是否支持 FP8、FP6、FP4、INT4 等低精度？  
7\. tokens/$ 和 tokens/W 如何计算？  
8\. p95/p99 延迟有没有公开或内部监控？  
9\. 训练、推理、Agent、多模态是否共用资源池？  
10\. 资源调度是按 GPU、按模型，还是按 token 经济性？  
11\. 电力和冷却是否还有扩容余量？  
12\. 软件栈是否能稳定支持真实业务模型？

如果这些问题没有答案，只说“我们有很多 GPU”，那还不是 AI Factory。

那只是一个昂贵的 GPU 集群。

真正的 AI Factory，要能把模型能力转化成稳定、可计费、可扩展的 token 产能。

这也是 AI 数据中心正在发生的根本变化：

> 它从算力仓库，变成了 token 工厂。

---

## 系列导航

如果你想继续读 AI 算力和推理系统，可以按这个顺序：

1\. **《AI 算力的下一个瓶颈：为什么不是 GPU，而是内存和数据移动》**  
先理解为什么大模型不只吃算力，也吃内存、带宽和数据搬运。

2\. **《推理芯片为什么难做：大模型不是只要矩阵乘法》**  
再看芯片为什么要面对 Prefill、Decode、KV Cache、MoE 和长上下文。

3\. **《2026 推理芯片之战：大模型正在把硬件从 GPU 推向 AI Factory》**  
把最新模型和最新芯片放到同一个系统里看。

4\. **《AI 数据中心正在变成什么：从 GPU 集群到 AI Factory 的真实成本》**  
继续把视角从芯片扩展到电力、液冷、网络、机架和 token economics。

---

## 参考来源

- NVIDIA Vera Rubin 平台官方新闻稿
- NVIDIA Vera Rubin 技术博客
- Google Cloud 第八代 TPU 发布
- Microsoft Maia 200 官方博客
- AWS Trainium3 / Trn3 UltraServers GA
- AMD Helios 与 Celestica 合作
- AMD Helios 与 OCP Open Rack Wide
- Meta MTIA 自研芯片扩展
- Qualcomm AI200 / AI250 官方发布
- Schneider Electric：Direct-to-chip liquid cooling
- Schneider Electric：旧数据中心液冷改造
- OpenAI：Building the compute infrastructure for the Intelligence Age

芯片与算力 · 目录

继续滑动看下一个

口袋 AI 系统笔记

向上滑动看下一个