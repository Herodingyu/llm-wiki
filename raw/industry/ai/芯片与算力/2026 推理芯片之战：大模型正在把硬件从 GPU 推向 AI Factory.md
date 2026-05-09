---
title: "2026 推理芯片之战：大模型正在把硬件从 GPU 推向 AI Factory"
source: "https://mp.weixin.qq.com/s?__biz=Mzg3MjcwNjExOA==&mid=2247484348&idx=1&sn=66a4564452e0ecd8d56404801d9e1c73&chksm=ceea7a95f99df38387e2fcc6f09700a385db6e9f7959f4c53614e81edc24b983ea88a7abe880&scene=178&cur_album_id=4496673538715877378&search_click_id=#rd"
author:
  - "[[jw]]"
published:
created: 2026-05-09
description: "今天是 2026 年 5 月 1 日。如果还用“GPU 算矩阵乘法很快，所以推理芯片就是更高 TOPS”来理解 AI 硬件，已经明显落后了。"
tags:
  - "clippings"
---
jw *2026年5月1日 14:44*

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/KoTWV9E4RiaDiaGAlUkdTE1SIqOpr3xf0Hx503B9TaVic914ibFaaF0vliaUQWXRBfUtLnm7zkZ9Gkrh03MZlWgdhuPexGryjsH7HT3vLr3ia1jkY/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0)

今天是 2026 年 5 月 1 日。

如果还用“GPU 算矩阵乘法很快，所以推理芯片就是更高 TOPS”来理解 AI 硬件，已经明显落后了。

这句话不是说矩阵乘法不重要。

大模型里仍然有大量 GEMM：QKV 投影、MLP、MoE expert、vision encoder、低精度 tensor core，都离不开矩阵计算。

但到了 2026 年，真正难的地方已经不只是“把一个大矩阵算快”。

难的是：

> 大模型推理正在变成长上下文、MoE、低精度、自定义 Attention、Agent、多模态和在线服务调度混在一起的系统工程。

所以芯片竞争也变了。

NVIDIA 不再只讲单颗 GPU，而是讲 Vera Rubin NVL72、Rubin GPU、Vera CPU、NVLink 6、BlueField-4、Spectrum-6，以及专门面向低延迟推理的 Groq 3 LPX。

Google 不再把 TPU 当成一个统一芯片，而是在 2026 年把第八代 TPU 拆成 8t 和 8i：8t 偏训练，8i 明确面向低延迟推理和 agent。

Microsoft 推出 Maia 200，不是为了在公开零售市场卖卡，而是为了让 Copilot、Foundry 和 OpenAI 模型在自己的云里更便宜、更稳定地生成 token。

AMD 从 MI355X 继续走向 MI400/MI455X 和 Helios rack，把 GPU、EPYC Venice、Pensando NIC、ROCm 放进同一个机架级系统叙事。

AWS 的 Trainium3 已经 GA，它讲的关键词也不是“我有多少 TOPS”，而是 Trn3 UltraServer、Neuron、Bedrock、agentic/reasoning/video generation 的 token economics。

Meta、Qualcomm、Huawei 也在往同一个方向走：更多自研、更多推理专用、更多机架级设计。

关键问题不是“谁的芯片最强”。

这个问题很容易变成参数表比赛，也很容易被厂商宣传带跑。

我们要讲的是另一件事：

**为什么 DeepSeek V4、Kimi K2.6、Qwen3.6 这类 2026 年模型，会把推理芯片从 GPU 时代推向 AI Factory 时代。**

所谓 AI Factory，不是一个营销词。

它的意思是：推理不再只是把模型放到一张卡上跑，而是要把 GPU/TPU/NPU、CPU、网络、KV Cache、存储、调度、低精度 kernel、服务框架和功耗一起设计。

谁能把这些东西放进一个稳定、可扩展、可计费、可运维的系统里，谁才真的有推理优势。

---

## 一、先看时间线：模型和芯片几乎同时转向推理

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

先把最新节点摆出来。

截至 2026 年 5 月 1 日，最值得关注的模型和芯片，不是 2024 年那批，也不只是 2025 年初那批。

应该是下面这些。

| 类别 | 型号/系统 | 发布时间 | 状态 | 为什么重要 |
| --- | --- | --- | --- | --- |
| 模型 | Qwen3.6-Plus | 2026-04-02 | API/闭源 | 1M context、agentic coding、多模态推理 |
| 模型 | Qwen3.6-35B-A3B | 2026-04-16 | 开源权重 | 35B 总参数、3B 激活、Gated DeltaNet + Gated Attention |
| 模型 | Kimi K2.6 | 2026-04-20/21 | 开源权重 + API | 1T MoE、32B 激活、MLA、native INT4、Agent Swarm |
| 模型 | DeepSeek V4 Preview | 2026-04-24 | 开源权重 + API | V4-Pro 1.6T/49B active，V4-Flash 284B/13B active，1M context |
| 芯片/系统 | AWS Trainium3 / Trn3 UltraServers | 2025-12-02 | GA | 3nm AWS AI chip，144 颗 Trainium3 组成 UltraServer |
| 芯片/系统 | Microsoft Maia 200 | 2026-01-26 | 微软云内基础设施 | 3nm、FP8/FP4、216GB HBM3e、面向 token 生成经济性 |
| 芯片/系统 | NVIDIA Vera Rubin / Groq 3 LPX | 2026-03-16 | full production，2026 下半年起交付 | 七颗芯片组成 AI Factory，新增低延迟 LPU 推理路径 |
| 芯片/系统 | Google TPU 8i / 8t | 2026-04-22 | 2026 年晚些时候 GA | 8i 面向 inference，8t 面向 training |
| 芯片/系统 | AMD MI400 / MI455X / Helios | 2026-01 CES | 预览/路线，目标 2026 下半年 | AMD 的 rack-scale AI 系统路线 |

这个表里有两个重点。

第一，最新模型的关键词高度一致：

长上下文、MoE、Agent、多模态、低精度、自定义 Attention。

第二，最新芯片的关键词也高度一致：

机架级、内存层级、互联、低延迟、低精度、推理经济性。

这不是巧合。

模型在变，所以芯片必须跟着变。

过去我们习惯把训练和推理分开讲。

训练需要吞吐，需要大集群，需要高带宽互联。

推理只要把模型部署出来，优化一下 batch，算得便宜一点就行。

这个理解在小模型、短上下文、简单聊天阶段还能用。

但到 2026 年，它已经不够解释现实了。

DeepSeek V4 直接把 1M context 作为官方服务的标准能力。

Kimi K2.6 把 300 个 sub-agent、4000 步协调、长时间 coding execution 放进产品叙事。

Qwen3.6-Plus 把 repository-level engineering、visual coding、1M context 放在同一个发布稿里。

这些都不是“给你一句 prompt，模型回一句话”的简单推理。

这些是长时间、长状态、多阶段、多工具、多模态的推理。

芯片如果还只按单步矩阵乘法去设计，就会在真实业务里被内存、互联、调度和尾延迟拖住。

---

## 二、为什么不能只看单卡：推理芯片的评价口径变了

过去评价推理芯片，很多人会先问三个问题：

算力峰值是多少？

显存多大？

跑某个 benchmark 的吞吐是多少？

这些指标仍然重要，但已经不够用了。

因为 2026 年的大模型推理，越来越不像一个规整的离线计算任务。

它更像一条在线生产线：

用户请求长短不一。

上下文可能从几千 token 拉到几十万甚至百万 token。

有的请求只问一句话，有的请求要让 agent 连续调用工具。

有的 token 只走普通 Attention，有的 token 要触发 MoE 路由、视觉编码、长上下文检索或低精度 kernel。

如果只看单卡 TOPS，就像只看一座工厂里某台机器的最高转速，却不看原料怎么进来、半成品怎么流转、仓库够不够、运输带会不会堵、质检和调度能不能跟上。

真实推理服务关心的是另一组问题：

首 token 能不能快？

长上下文能不能撑住？

多用户并发时显存会不会被 KV Cache 吃光？

MoE 跨卡通信会不会拖慢尾延迟？

低精度能不能真正跑在主流模型上？

软件栈能不能把硬件能力稳定释放出来？

所以 2026 年的芯片竞争，已经从“单颗芯片参数”转向“系统交付能力”。

核心判断可以压缩成一句话：

> 2026 年的推理竞争，不是单个 GPU、TPU、NPU 谁峰值更高，而是谁能把真实大模型服务组织成低延迟、低成本、可扩展的 AI Factory。

---

## 三、模型侧先变了：DeepSeek V4、Kimi K2.6、Qwen3.6 都在制造不规则负载

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

先看模型。

很多人讨论新模型，只看榜单。

谁 coding 更强。

谁数学更强。

谁多模态更强。

谁价格更低。

这些当然重要。

但如果从推理芯片角度看，更重要的是另一件事：

**这些模型到底给硬件制造了什么样的新负载。**

| 模型 | 发布时间 | 架构/能力关键词 | 对推理系统的压力 |
| --- | --- | --- | --- |
| DeepSeek V4-Pro / V4-Flash | 2026-04-24 | MoE、1M context、token-wise compression、DSA，技术报告摘要提到 CSA/HCA | 超长上下文、压缩 KV、稀疏读取、MoE 路由、低精度 |
| Kimi K2.6 | 2026-04-20/21 | 1T MoE、32B active、MLA、native INT4、MoonViT、Agent Swarm | 长时间 agent、视觉输入、低精度、MoE、长上下文稳定性 |
| Qwen3.6-Plus | 2026-04-02 | 1M context、agentic coding、多模态推理 | 仓库级代码理解、视觉 coding、长输入、高并发服务 |
| Qwen3.6-35B-A3B | 2026-04-16 | 35B total、3B active、Gated DeltaNet + Gated Attention、MoE、MTP | 混合 attention、低激活 MoE、speculative/MTP 推理适配 |
| Kimi Linear | 2025 技术报告 | KDA + MLA、1M context、decode throughput | 长上下文 decode 和 KV Cache 成本 |
| Qwen3-Next | 2025-09 | Gated DeltaNet + Gated Attention、高稀疏 MoE、MTP | 混合架构和低激活推理路线的前奏 |

注意，这些变化不是独立的。

它们都在解决同一个问题：

**模型想要更长的上下文、更强的推理、更低的成本、更好的 Agent 能力，但标准 Transformer 的推理成本已经太高。**

所以模型开始自己“改硬件友好性”。

DeepSeek V4 的重点不是单纯把参数做大。

官方发布里明确说 V4-Pro 是 1.6T total / 49B active，V4-Flash 是 284B total / 13B active，并把 1M context 作为官方服务标准能力。

官方 API 文档把结构创新概括为 token-wise compression + DSA，也就是通过 token 级压缩和稀疏 attention 降低长上下文成本。

技术报告摘要进一步把长上下文机制展开为 CSA + HCA。

CSA 可以理解成：先把一段 KV 压缩成更少的表示，再通过稀疏选择读取相关块，同时保留局部窗口。

HCA 则压得更狠，用更粗粒度的全局摘要承担远距离依赖。

这件事对芯片的含义很直接：

长上下文不再只是“显存够不够装 1M token”。

它变成了“压缩后的 KV 如何组织、如何索引、如何调度、如何复用、如何在多层 attention 里保持吞吐”的问题。

Kimi K2.6 也不是简单的“又一个 1T MoE”。

官方模型卡写得很清楚：1T 总参数、32B activated parameters、384 experts、8 个 routed experts、1 个 shared expert、256K context、attention mechanism 是 MLA，vision encoder 是 MoonViT，native INT4 quantization。

官方技术博客又把 K2.6 的产品重点放在 long-horizon coding、coding-driven design、Agent Swarm、proactive agents。

这对芯片意味着什么？

它意味着一次请求可能不是几十秒的对话。

它可能是几小时的 coding loop。

它可能会不停读代码、改文件、跑测试、看报错、再改代码。

它可能会调用视觉模型理解截图，再调用代码工具生成前端，再调用浏览器检查结果。

这种负载不是一个连续、规整、纯 GPU 的 batch。

它是碎片化的。

它有暂停和恢复。

它有大量上下文状态。

它有工具调用间隙。

它有 p95、p99 延迟。

它有 KV Cache 生命周期管理。

Qwen3.6 则代表另一条路线。

Qwen3.6-Plus 是 API 侧的旗舰生产模型，官方发布强调 1M context、agentic coding、多模态 perception and reasoning，以及 repository-level engineering。

Qwen3.6-35B-A3B 是开源权重侧更适合工程师分析的模型。

它不是普通 dense model。

模型卡里写得非常具体：35B total、3B activated，hidden layout 是多组 Gated DeltaNet + MoE，再穿插 Gated Attention + MoE，context length 原生 262,144，并可扩展到约 1,010,000 tokens。

这说明 Qwen 并没有只靠标准 attention 往前堆。

它在用混合结构降低推理成本。

模型侧的趋势已经很清楚：

第一，参数越来越大，但激活参数不一定同步变大。

第二，上下文越来越长，但不能再靠完整 KV 硬扛。

第三，Attention 正在碎片化，不同模型会采用 MLA、DSA、CSA/HCA、KDA、Gated DeltaNet 等不同路线。

第四，推理不再只是聊天，而是 Agent、多模态、代码仓库、长文档、视频和工具调用。

这就是芯片变难的根源。

---

## 四、芯片侧也变了：从“单卡”走向“机架”和“系统”

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

再看芯片。

如果只看单颗芯片，2026 年的信息会很乱。

Rubin、GB300、TPU 8i、Maia 200、MI355X、MI455X、Trainium3、MTIA、AI200、Ascend。

每个厂商都说自己更快、更省、更适合推理。

但如果按“解决什么推理瓶颈”来分类，就清楚很多。

| 厂商 | 最新推理相关型号/系统 | 时间 | 当前口径 | 核心方向 |
| --- | --- | --- | --- | --- |
| NVIDIA | Vera Rubin NVL72、Rubin GPU、Groq 3 LPX、BlueField-4 STX | 2026-03-16 | full production，产品 2026 下半年起可用 | AI Factory、低延迟 decode、KV cache storage、NVLink 6 |
| NVIDIA | GB300 / Blackwell Ultra NVL72 | 2025 | 已部署/已有 MLPerf 公开结果 | 当前最可验证的高端 GPU 推理系统 |
| Google | TPU 8i | 2026-04-22 | 2026 年晚些时候 GA | 推理专用 TPU、288GB HBM、384MB SRAM、Boardfly、CAE |
| Microsoft | Maia 200 | 2026-01-26 | 微软云内自用/服务 | 3nm、FP8/FP4、216GB HBM3e、272MB SRAM |
| AMD | MI355X / MI350 Series | 2025-06；MLPerf 6.0 于 2026-04 | 已有公开推理结果 | 288GB HBM3E、FP4/FP6、ROCm |
| AMD | MI400 / MI455X / Helios | 2026-01 预览 | 目标 2026 下半年 | HBM4、rack-scale、EPYC Venice、Pensando NIC |
| AWS | Trainium3 / Trn3 UltraServers | 2025-12-02 | GA | 144 chips、Neuron、Bedrock、token economics |
| Meta | MTIA 300/400/450/500 | 2026-03-11 | 300 已生产，后续两年部署 | inference-first、自用、PyTorch/vLLM/Triton |
| Qualcomm | AI200 / AI250 | 2025-10-27 | AI200 计划 2026，AI250 计划 2027 | 数据中心推理、near-memory computing |
| Huawei | Ascend 950PR/950DT 路线、Atlas 系统 | 2025-09 路线，2026 推进 | 公开信息分散 | 区域化供应链、国产推理系统 |

这个表里要特别注意“状态”。

最新不等于已经大规模可买。

已经有公开 benchmark，也不等于它是下一代路线。

所以写文章时要分两层：

**第一层：今天最可验证的主力系统。**

例如 NVIDIA GB300/Blackwell Ultra、AMD MI355X、AWS Trainium3。

这些已经有公开部署、公开结果或者 GA 信息。

**第二层：2026 年最新发布的方向性系统。**

例如 NVIDIA Vera Rubin/Groq 3 LPX、Google TPU 8i、Microsoft Maia 200、AMD MI400/MI455X/Helios。

这些更能说明技术趋势，但要注明交付和可用状态。

这也是技术写作里很重要的一点：

不要把 roadmap 当成今天已经随便可以买到的硬件。

也不要因为一个系统还在交付路线上，就忽略它代表的架构方向。

---

## 五、NVIDIA 的变化：从 GPU 到 Vera Rubin AI Factory

NVIDIA 的最新叙事最清楚。

2026 年 3 月 16 日，NVIDIA 发布 Vera Rubin 平台，官方说法是七颗新芯片 full production，用于扩展世界级 AI factories。

这七颗芯片包括 Vera CPU、Rubin GPU、NVLink 6 Switch、ConnectX-9 SuperNIC、BlueField-4 DPU、Spectrum-6 Ethernet switch，以及新集成的 Groq 3 LPU。

如果只看“Rubin GPU 比 Blackwell 快多少”，就看窄了。

真正值得关注的是：

NVIDIA 把 GPU、CPU、网络、DPU、交换机、LPU、KV cache storage 放进了一个统一系统。

这正是 AI Factory 的形态。

Vera Rubin NVL72 是 72 个 Rubin GPU + 36 个 Vera CPU 的机架级系统。

官方强调它面向 pretraining、post-training、test-time scaling、agentic inference。

这说明 NVIDIA 已经不把“训练”和“推理”割裂成两套完全不同的叙事。

原因很简单：

Reasoning、Agent、test-time scaling 正在让推理越来越像小型训练或在线搜索。

模型会生成中间思考。

会调用工具。

会比较多个路径。

会保留上下文。

会不断做自我修正。

推理系统必须支持这些循环。

更有意思的是 Groq 3 LPX。

NVIDIA 官方发布里把 LPX 定位为低延迟、大上下文 agentic systems 的推理加速器。

LPX rack 有 256 个 LPU processors、128GB on-chip SRAM、640TB/s scale-up bandwidth。

它不是替代 Rubin GPU，而是和 Rubin GPU 一起负责 decode。

这个信号非常强。

它等于承认：

> 对某些推理阶段，传统 GPU 并不是唯一最优形态。低延迟 decode 可能需要更偏 SRAM、更偏确定性、更偏 token 级流水的专用路径。

BlueField-4 STX 也很关键。

它面向的是 KV cache storage，把 GPU memory 扩展到 POD 级上下文记忆。

以前我们说 KV Cache，通常还停留在显存里的分页、复用、淘汰。

但到了 million-token context 和 agentic workflow，KV Cache 已经可能变成一种“存储层”。

这就是 NVIDIA 的路线：

GPU 继续负责大算力。

CPU 负责环境、调度和 Agent 执行。

LPU 负责低延迟 decode。

DPU/Storage 负责 KV 和数据移动。

NVLink/Spectrum-X 负责机架和 POD 级互联。

这已经不是“一张推理卡”。

这是 AI Factory。

---

## 六、Google 的变化：TPU 8i 说明推理终于有了专用主线

Google 2026 年 Cloud Next 发布第八代 TPU，拆成 TPU 8t 和 TPU 8i。

8t 面向训练。

8i 面向推理。

这个拆分本身就很重要。

过去 TPU 虽然也能推理，但很多代际讨论仍然围绕训练大模型展开。

TPU 8i 明确说自己是 reasoning engine，面向低延迟 inference 和 agent。

官方给了几个非常值得注意的指标：

TPU 8i 配 288GB 高带宽内存。

有 384MB on-chip SRAM，是前代的 3 倍。

ICI bandwidth 提到 19.2Tb/s。

新的 Boardfly 拓扑把最大网络直径降低超过 50%。

CAE，也就是 Collectives Acceleration Engine，把全局操作 offload 掉，降低 on-chip latency。

官方还说 TPU 8i 相比前代有 80% better performance-per-dollar，TPU 8t/8i 相比 Ironwood 有最高 2 倍 performance-per-watt。

这些数字背后的方向很明确：

Google 不是只在堆矩阵算力。

它在解决推理里的 memory wall、agent swarming、MoE 通信、collective latency、CPU host 效率。

TPU 8i 的设计非常贴近 2026 年模型的负载。

长上下文需要更多 HBM 和更强 KV 组织。

MoE 需要更好的互联拓扑。

Agent 需要更低尾延迟。

多模型、多轮调用需要更稳定的系统级调度。

Google 的优势是全栈。

Gemini 模型、TPU、JAX、Pathways、Google Cloud、AI Hypercomputer 能一起设计。

这种全栈协同会越来越重要。

因为模型结构变化太快。

如果硬件、编译器、runtime、serving 框架、模型团队之间没有足够短的反馈回路，很难及时支持新的 attention、routing、低精度格式和推理调度策略。

---

## 七、Microsoft Maia 200：云厂商为什么要自己做推理芯片

Microsoft Maia 200 是另一个信号。

2026 年 1 月 26 日，Microsoft 官方发布 Maia 200，明确称它是 AI accelerator built for inference。

官方披露的核心参数包括：

TSMC 3nm。

Native FP8/FP4 tensor cores。

216GB HBM3e。

7TB/s memory bandwidth。

272MB on-chip SRAM。

数据移动引擎。

它会服务 Microsoft Foundry、Microsoft 365 Copilot，以及包括 OpenAI GPT-5.2 在内的模型。

这说明 hyperscaler 自研推理芯片的逻辑很现实：

不是为了在芯片市场卖货。

而是为了控制自己的 token 生成成本。

当 Copilot、Office、GitHub、Azure、Teams 里的 AI 调用规模足够大，推理成本就不是边缘成本。

它会变成云厂商利润表里的核心变量。

如果每生成一个 token 都要依赖外部 GPU 供应、外部软件栈、外部调度逻辑，成本和供给都会受制于人。

所以 Maia 200 的意义不是“它能不能打赢 NVIDIA”。

它的意义是：

> 当推理变成云产品的基础能力，云厂商会倾向于为自己的稳定负载设计专用硬件。

这和 Google TPU、AWS Trainium、Meta MTIA 是同一条逻辑。

如果负载足够稳定、规模足够大、自家软件栈足够强，自研芯片就有经济意义。

---

## 八、AMD 和 AWS：一个走开放机架，一个走云内 token economics

AMD 的路线需要分两段看。

第一段是 MI350/MI355X。

AMD 在 2025 年发布 MI350 系列，MI355X 采用 CDNA 4，支持 FP4/FP6，配 288GB HBM3E。

2026 年 4 月 MLPerf Inference v6.0 里，AMD 强调 MI355X 在新一代 GenAI 推理 benchmark 上跨过 1M tokens/sec 的多节点吞吐，并展示 DeepSeek-R1 等推理负载。

这说明 AMD 已经不只是“有大显存卡”。

它在用 ROCm、低精度和公开 benchmark 证明自己能跑真实推理服务。

第二段是 MI400/MI455X/Helios。

AMD 在 CES 2026 给出 Helios rack-scale 平台预览：MI455X、EPYC Venice、Pensando Vulcano NIC、ROCm 被放进同一套 rack-scale 设计。

这和 NVIDIA 的方向相同：

从单卡走向机架。

从算力走向系统。

但 AMD 的叙事重点更偏开放生态和标准化机架。

如果 ROCm、vLLM、SGLang、Triton、主流模型适配继续跟上，AMD 在推理侧会比训练侧更容易拿到机会。

原因很简单：

推理场景比训练更分散。

很多企业不需要最顶级训练集群，但需要更便宜、更可控、更容易采购的推理系统。

AWS Trainium3 则是另一种路线。

2025 年 12 月 2 日，AWS 宣布 Amazon EC2 Trn3 UltraServers GA。

它基于 Trainium3，AWS 称这是第一颗 3nm AWS AI chip，面向 next-generation agentic、reasoning、video generation applications 的 token economics。

Trn3 UltraServers 最多可以扩展到 144 颗 Trainium3，官方给出 362 FP8 PFLOPs total，并能进入 EC2 UltraClusters 3.0 扩展到数十万颗芯片。

这里的关键词仍然不是单芯片峰值。

而是：

AWS 自己的 Neuron 软件栈。

Bedrock 里的模型服务。

EC2 的资源池。

UltraCluster 的规模化。

客户愿不愿意迁移到 Trainium。

AWS 不是在争取所有模型开发者都买一张 Trainium 卡。

AWS 是在争取更多云上推理和训练负载进入自己的专用硬件池。

这就是云厂商自研芯片的核心。

---

## 九、Prefill 和 Decode：推理不是一种负载

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

现在回到推理本身。

一次大模型调用至少要拆成两个阶段。

Prefill。

Decode。

Prefill 是处理输入上下文。

用户 prompt、历史对话、RAG 文档、代码仓库、图片和视频转换出的视觉 token，都在这个阶段进入模型。

这个阶段往往更像大矩阵计算。

输入 token 多。

如果 batch 组织得好，矩阵单元容易吃满。

所以在 prefill 阶段，GPU、TPU、NPU 的峰值算力和高带宽内存都很重要。

Decode 是逐 token 生成输出。

每生成一个 token，都要读取历史 KV Cache，然后预测下一个 token。

这个阶段通常 batch 小、序列长、延迟敏感。

它很容易被内存带宽、KV 读取、kernel launch、调度开销、跨卡通信拖住。

所以同一颗芯片可能出现这种情况：

Prefill 看起来很强。

Decode 体验一般。

短上下文很好。

长上下文突然变贵。

离线吞吐很好。

线上 p99 不稳定。

这就是为什么很多推理系统开始做 prefill/decode disaggregation。

Prefill 可以集中用大 batch 跑。

Decode 可以用更适合低延迟的小 batch 服务。

一些系统会把 prefill 和 decode 放在不同 GPU 池、不同实例、甚至不同硬件路径上。

NVIDIA 把 Rubin GPU 和 Groq 3 LPX 组合起来，本质上也在回应这个问题。

大规模算力和低延迟 token 生成，并不一定需要完全相同的硬件形态。

对于工程师来说，这里最重要的结论是：

> 看推理芯片，不能只看它跑某个大模型的 offline throughput，也要看 TTFT、decode TPS/user、p95/p99，以及长上下文下的吞吐曲线。

TTFT 是 time to first token。

它主要受 prefill、排队和调度影响。

TPS/user 是每个用户实际看到的输出速度。

它主要受 decode 和 KV 读写影响。

p95/p99 是线上体验的真实底线。

它会暴露调度、内存碎片、跨卡通信、冷启动和资源抢占问题。

这些指标比“峰值 TOPS”更接近真实业务。

---

## 十、KV Cache：推理芯片进入状态管理时代

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

训练时代，芯片主要在处理参数、激活、梯度、优化器状态。

推理时代，尤其是长上下文时代，KV Cache 成为另一个核心对象。

KV Cache 是 attention 为历史 token 保存的 Key 和 Value。

它避免 decode 时每一步都重新计算完整历史。

但它也让模型推理拥有了“状态”。

上下文越长，KV 越大。

并发越高，KV 越多。

Agent 工具调用越复杂，KV 生命周期越难管理。

多轮对话越多，KV 复用越有价值。

视觉 token、视频帧、代码仓库、PDF 文档进入上下文后，KV 压力会继续放大。

到 1M context 时代，KV Cache 已经不只是显存里的一块缓存。

它变成了推理系统的运行时记忆。

这会改变芯片设计。

第一，HBM 容量变重要。

DeepSeek V4、Qwen3.6、Kimi K2.6 都在讲长上下文。

如果 HBM 不够，长上下文和高并发就只能二选一。

第二，HBM 带宽变重要。

Decode 阶段每生成一个 token 都要访问 KV。

如果带宽不足，矩阵单元再强也会等待数据。

第三，on-chip SRAM 变重要。

Google TPU 8i 把 on-chip SRAM 提到 384MB，Microsoft Maia 200 有 272MB SRAM，NVIDIA Groq 3 LPX 走的是更激进的 SRAM-heavy 低延迟推理路径。

这说明大家都知道：如果每一步都去远端内存拿数据，延迟和能耗都受不了。

第四，KV 分页、压缩和复用变重要。

PagedAttention、prefix caching、context caching、KV compression、on-disk KV storage，都会从框架优化变成基础设施能力。

第五，存储和网络会被拖进来。

NVIDIA BlueField-4 STX 把 KV cache storage 做成 rack-scale context memory，这就是一个明显信号。

百万上下文和 agentic memory 不会永远只放在单卡显存里。

它会扩展到机架、POD，甚至更大的内存层级。

所以，看推理芯片时要问：

它的 HBM 容量是多少？

带宽是多少？

SRAM 有多少？

KV 分页效率怎样？

长上下文下吞吐怎么掉？

prefix caching 是否稳定？

能不能在多租户服务里管理 KV 生命周期？

这些问题比 TOPS 更接近真实成本。

---

## 十一、MoE：省掉的计算，可能被路由和互联吃回来

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

DeepSeek V4 是 MoE。

Kimi K2.6 是 MoE。

Qwen3.6-35B-A3B 是 MoE。

MoE 的好处很清楚：

总参数可以很大，但每个 token 只激活一部分 expert。

比如 Kimi K2.6 是 1T total、32B active。

DeepSeek V4-Pro 是 1.6T total、49B active。

Qwen3.6-35B-A3B 是 35B total、3B active。

这让模型能力和推理成本之间多了一层调节空间。

但 MoE 对硬件并不总是友好。

因为 MoE 带来了动态路由。

不同 token 会去不同 expert。

不同 expert 可能分布在不同芯片、不同节点、不同机架。

如果负载不均衡，一些 expert 会很忙，另一些 expert 会空着。

如果通信成本高，省下来的 FLOPs 会被 all-to-all 吃掉。

如果 batch 太小，expert 利用率会下降。

如果路由变化太快，调度和缓存都会变复杂。

所以 MoE 对推理芯片提出了新要求：

互联要快。

通信延迟要低。

runtime 要能做 expert placement。

serving 框架要能做 continuous batching。

kernel 要能把 MoE 计算、通信和内存访问重叠起来。

负载均衡要能控制尾延迟。

DeepSeek V4 技术报告摘要里提到 fused MoE kernel，会 overlap compute、communication、memory access。

这类优化不是锦上添花。

它是 MoE 能不能在线上稳定服务的关键。

对芯片厂商来说，MoE 也会改变竞争指标。

不是只看单卡矩阵吞吐。

还要看 scale-up bandwidth。

看 scale-out 网络。

看 all-to-all 效率。

看 expert 并行。

看跨卡延迟。

看机架内互联拓扑。

Google TPU 8i 强调 Boardfly 和 ICI bandwidth，NVIDIA 强调 NVLink 6，AMD Helios 强调 rack-scale 和网络，都是在回应这个问题。

MoE 让模型省了计算。

但如果系统做不好，省掉的计算会从网络和调度里重新涨回来。

---

## 十二、Attention 机制碎片化：芯片和软件栈必须跟模型一起跑

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

过去几年，大家最熟悉的优化是 FlashAttention、PagedAttention、MLA。

但 2025 到 2026 年之后，模型侧 attention 机制变得更碎。

DeepSeek V4 有 token-wise compression、DSA，技术报告摘要里有 CSA/HCA。

DeepSeek V3 用 MLA。

Kimi K2.6 用 MLA，并做 native INT4。

Kimi Linear 用 KDA + MLA。

Qwen3.6-35B-A3B 用 Gated DeltaNet + Gated Attention。

Qwen3-Next 也已经走过 Gated DeltaNet + Gated Attention + MoE + MTP 这条路线。

这些机制名字很多，但底层目标类似：

减少长上下文 attention 的计算。

减少 KV Cache。

保持远距离依赖。

提升 decode throughput。

让模型在 256K、1M context 下还能服务。

问题是：

每一种新机制都可能需要新的 kernel、compiler 支持、serving 框架适配、显存布局和调度策略。

如果一个芯片只有固定的矩阵乘法很强，但对自定义算子支持差，模型一变就会很痛苦。

这也是为什么软件栈越来越重要。

NVIDIA 的 CUDA、TensorRT-LLM、Dynamo、Triton、cuDNN、NCCL 是护城河。

AMD 的 ROCm 必须追上 vLLM、SGLang、PyTorch、Triton 和主流模型适配。

Google TPU 需要 JAX、Pathways、XLA、vLLM/SGLang/PyTorch 支持。

AWS Trainium 需要 Neuron 生态。

Meta MTIA 直接强调 PyTorch、vLLM、Triton 和 OCP。

国产芯片也一样，CANN、Neuware、vLLM 分支、SGLang 适配都很关键。

2026 年的推理芯片竞争，不只是硬件团队之间的竞争。

也是 compiler、runtime、kernel、framework、model team 之间的协同竞争。

谁能最快支持新模型结构，谁的芯片就更容易被真实业务采用。

---

## 十三、低精度：不是把模型文件压小，而是全链路重做

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

低精度是推理芯片的核心战场。

但它经常被误解。

很多人以为量化就是把模型变小。

比如 FP16 变 INT8，INT8 变 INT4。

文件变小，显存变少，速度变快。

这只是表面。

真正上线时，低精度至少有四个问题。

第一，硬件要支持。

没有原生 FP4/FP8/INT4 路径，低精度只是在存储上省，计算时还要转换，收益会打折。

NVIDIA Blackwell/Blackwell Ultra 强调 FP4/NVFP4。

AMD MI355X 支持 FP4/FP6。

Microsoft Maia 200 有 native FP8/FP4 tensor cores。

DeepSeek V4 技术报告摘要提到 FP4 QAT 和 FP4×FP8 GEMM。

Kimi K2.6 模型卡写到 native INT4 quantization。

这些都说明低精度已经从后处理压缩进入模型和芯片共同设计阶段。

第二，模型质量要扛得住。

不是所有层都适合同样精度。

不是所有任务都能接受同样误差。

数学、代码、长上下文、工具调用、多模态，对量化误差的敏感程度不同。

第三，kernel 要真的快。

低精度格式再漂亮，如果矩阵 kernel、attention kernel、MoE kernel、通信 overlap 没有优化，实际服务不一定快。

第四，serving 要稳定。

线上服务关注的不只是平均吞吐。

还关注长尾延迟、异常输出、OOM、回退路径、混合精度策略、批处理稳定性。

所以低精度不是“模型变小”。

它是模型训练、量化感知训练、硬件格式、kernel、框架、服务调度一起协同。

这也是为什么最新模型和最新芯片会同时强调低精度。

模型想降低推理成本。

芯片想提高 token per watt。

两者必须在格式上对齐。

---

## 十四、Agent 和多模态：推理负载变成混合流水线

Agent 是 2026 年推理系统最大的变量之一。

传统聊天是：

用户输入。

模型输出。

一次请求基本结束。

Agent 是：

用户给目标。

模型拆任务。

模型调用工具。

工具返回结果。

模型继续思考。

模型再调用工具。

中间可能跑代码、查网页、读 PDF、操作浏览器、生成图片、处理视频、写文档、做表格。

这不是一个连续矩阵计算。

这是一个混合流水线。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

Agent 给推理系统带来几个新问题。

第一，请求时间变长。

Kimi K2.6 官方博客里展示的长时间 coding case，本质上说明模型已经被用于持续执行任务，而不是只回答问题。

请求越长，资源占用越不规整。

第二，上下文会反复增长和压缩。

Agent 会保留任务状态、工具结果、中间推理、错误信息、文件内容。

这些都会进入上下文管理。

第三，工具调用会制造空洞。

模型生成 tool call 后可能等待外部系统。

这个等待期间 GPU/TPU/NPU 资源如何释放、KV 如何保留、请求如何恢复，都是推理系统问题。

第四，p95/p99 更难控制。

普通聊天里，一个慢请求可能只是用户等久一点。

Agent 工作流里，一个慢步骤会拖累整个任务链路。

第五，多模态让负载更混合。

图片不是简单 token。

视频更不是简单 token。

OCR、vision encoder、LLM、工具调用、代码执行、视频生成可能混在一起。

一个 AI 应用可能先用视觉模型理解截图，再用 LLM 规划，再用代码模型生成前端，再用浏览器检查，再用图像模型补素材。

这要求硬件系统不只服务一个 LLM decode。

它要服务一条端到端 AI 流水线。

所以推理芯片会越来越和 CPU、网络、存储、调度框架绑在一起。

CPU 负责工具环境和控制流。

GPU/TPU/NPU 负责大模型计算。

LPU 或专用路径负责低延迟 token。

存储负责上下文和 KV。

网络负责 MoE、集群调度和数据移动。

这就是 AI Factory 的真实含义。

---

## 十五、从模型需求反推硬件指标

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

如果你是应用工程师、Infra 工程师、技术负责人，不需要每天读芯片论文。

但你需要知道该怎么判断一套推理硬件是不是真的适合你的业务。

不要先问：

这张卡多少 TOPS？

先问：

你的模型和业务属于哪类负载？

| 业务/模型需求 | 典型例子 | 真正要看的硬件指标 |
| --- | --- | --- |
| 短问答、高并发 | 客服、搜索摘要、轻量 Copilot | TPS/user、p99、batching、tokens/$ |
| 长上下文 | 代码仓库、法律合同、科研论文、1M context RAG | HBM 容量、KV Cache、prefix caching、长上下文吞吐曲线 |
| MoE 模型 | DeepSeek V4、Kimi K2.6、Qwen3.6-A3B | 互联带宽、expert routing、all-to-all、负载均衡 |
| Agent 工作流 | coding agent、数据分析 agent、浏览器 agent | 状态恢复、资源释放、CPU/GPU 协同、队列调度 |
| 多模态 | 图片理解、视频理解、截图转代码 | vision encoder 支持、混合流水线、显存规划 |
| 低成本大规模服务 | 面向 C 端的 AI assistant | FP4/INT4、功耗、tokens/W、tokens/$ |
| 企业私有化 | 本地部署、合规、内网数据 | 软件栈成熟度、模型适配、运维工具、故障恢复 |

这样看，芯片选择会更实际。

如果你的业务主要是短上下文、高并发问答，低延迟 decode、batching、cache 命中和 tokens/$ 可能比极限训练性能更重要。

如果你的业务是长文档分析，HBM 容量、KV 管理、context caching 会比峰值 FLOPS 更重要。

如果你的业务是 coding agent，CPU、文件系统、容器、浏览器、测试环境、模型上下文管理都会影响端到端速度。

如果你的业务是 MoE 模型，互联和 serving 框架比单卡峰值更重要。

如果你的业务是多模态，别只看 LLM benchmark，要看视觉输入如何计费、如何缓存、如何进入上下文、是否拖慢 prefill。

这就是“从模型需求反推硬件指标”。

---

## 十六、判断推理芯片，不要只看 TOPS，看这 10 个指标

最后给一个更实用的判断清单。

以后再看推理芯片、推理云、模型服务，不要只盯着 TOPS。

至少看下面 10 个指标。

| 指标 | 解释 | 为什么重要 |
| --- | --- | --- |
| TTFT | Time to First Token | 影响用户觉得“模型开始响应快不快” |
| Decode TPS/user | 每个用户实际看到的生成速度 | 比 offline 总吞吐更接近体验 |
| p95/p99 latency | 长尾延迟 | Agent、多轮对话和企业服务最怕尾延迟 |
| HBM 容量 | 高带宽显存/内存容量 | 决定长上下文、高并发、模型大小上限 |
| HBM 带宽 | 读取 KV、权重、激活的速度 | Decode 常常受带宽限制 |
| On-chip SRAM | 片上缓存 | 降低 token 级访问延迟和功耗 |
| 互联带宽 | NVLink、ICI、Ethernet、InfiniBand 等 | MoE、模型并行、机架级推理必须看 |
| 低精度支持 | FP8、FP6、FP4、INT4 | 影响 tokens/W 和 tokens/$ |
| 软件栈成熟度 | CUDA、ROCm、Neuron、XLA、vLLM、SGLang、Triton | 决定模型能不能跑、跑得稳不稳 |
| 端到端 TCO | tokens/sec/$、tokens/W、运维成本 | 最终决定商业可用性 |

这 10 个指标里，只有一部分和芯片本身有关。

其他很多都和系统有关。

这正是推理芯片竞争的核心变化：

> 推理芯片的竞争，正在从芯片参数竞争，转向系统交付竞争。

NVIDIA 的优势是完整生态和 AI Factory。

Google 的优势是 TPU + Gemini + Cloud 的全栈协同。

Microsoft 的优势是自家云和 Copilot/OpenAI 工作负载。

AWS 的优势是 EC2/Bedrock/Trainium/Neuron 的云内闭环。

AMD 的机会是开放机架、ROCm 成熟和更强的性价比。

Meta 的路线是自研芯片服务自家超大规模推理。

Qualcomm、Huawei 等路线则说明推理市场足够大，大到会容纳更多专用和区域化硬件。

---

## 十七、应用工程师该怎么理解这场战争

对于应用工程师来说，这场推理芯片战争不只是硬件新闻。

它会影响你未来做 AI 应用的方式。

第一，模型选择会越来越依赖推理成本。

不是最强模型永远最好。

DeepSeek V4-Pro、V4-Flash、Kimi K2.6、Qwen3.6-35B-A3B 的差异，不只是能力差异，也是成本、延迟、上下文、部署方式的差异。

应用工程师要学会按任务分层用模型。

简单任务用小模型。

长上下文任务用上下文友好的模型。

代码 agent 用工具调用稳定的模型。

视觉任务用原生多模态模型。

第二，Prompt 优化不够了。

以前应用层常说“调 prompt”。

现在更重要的是上下文工程。

哪些内容进上下文？

哪些内容进缓存？

哪些内容摘要？

哪些工具结果保留？

哪些历史要丢弃？

这些都会直接影响 KV Cache、prefill 成本、decode 延迟。

第三，RAG 也不只是向量数据库。

长上下文模型让“塞更多文档进去”变得容易，但不代表免费。

1M context 不是让你无脑把所有东西塞进去。

它让你有更大的设计空间，但成本仍然由 prefill、KV、cache 命中率和模型结构决定。

第四，Agent 会让成本曲线更难预测。

一次 agent 任务可能调用几十次模型。

每次调用的上下文都不同。

工具失败会重试。

浏览器、代码执行、文件读写会制造等待。

所以要评估 agent 成本，不能只看一次 chat completion 的价格。

要看整个 workflow 的 token、时间、工具、失败率和重试。

第五，未来的 AI Infra 岗位会越来越重要。

不是所有公司都要自研推理引擎。

但越来越多公司需要理解：

vLLM、SGLang、TensorRT-LLM、Triton、ROCm、Neuron、XLA、KV Cache、continuous batching、speculative decoding、disaggregated serving。

这些会从“底层优化”变成 AI 应用工程的一部分。

---

## 十八、结语：2026 年的推理芯片，不再只是芯片

回到开头。

推理芯片为什么难做？

因为真实大模型推理不只是矩阵乘法。

但如果只停在这句话，还不够。

2026 年的新变化是：

大模型正在把推理硬件从“GPU/TPU/NPU 单点能力”推向“AI Factory 系统能力”。

DeepSeek V4 把 1M context、token-wise compression、DSA、CSA/HCA、MoE、低精度和 agent 能力放在一起。

Kimi K2.6 把 1T MoE、MLA、native INT4、多模态、Agent Swarm 和长时间 coding execution 放在一起。

Qwen3.6 把 1M context、agentic coding、Gated DeltaNet、Gated Attention、MoE、MTP 放在一起。

这些模型都在告诉硬件厂商：

未来的推理不是一个规整算子。

未来的推理是一个长时间运行、状态丰富、结构不规则、对延迟敏感、对成本极敏感的系统。

NVIDIA 的 Vera Rubin/Groq 3 LPX、Google TPU 8i、Microsoft Maia 200、AMD MI400/Helios、AWS Trainium3、Meta MTIA、Qualcomm AI200/AI250，都在从不同角度回答这个问题。

有的回答是机架级 GPU 超级系统。

有的回答是推理专用 TPU。

有的回答是云内自研 accelerator。

有的回答是开放机架。

有的回答是专用低延迟 LPU。

有的回答是 near-memory computing。

但它们最终竞争的是同一件事：

**谁能用更低的成本、更低的延迟、更高的稳定性，持续生成高质量 token。**

这也是为什么下一代推理芯片不能只看 TOPS。

要看 tokens/sec。

要看 tokens/W。

要看 tokens/$。

要看 KV Cache。

要看 MoE 通信。

要看低精度。

要看软件栈。

要看 p99。

要看端到端 AI 应用的真实成本。

一句话总结：

> 训练时代，芯片竞争的核心是把模型训出来；推理时代，芯片竞争的核心是把智能稳定、便宜、快速地交付给每个用户。

这就是 2026 年推理芯片之战真正发生变化的地方。

---

## 参考资料

- DeepSeek API Docs：DeepSeek V4 Preview Release
- Hugging Face：DeepSeek-V4-Pro Technical Report Summary
- Moonshot AI：Kimi K2.6 model card
- Kimi：Kimi K2.6 Tech Blog
- Qwen：Qwen3.6 GitHub
- Qwen：Qwen3.6-35B-A3B model card
- Alibaba Cloud：Qwen3.6-Plus release
- NVIDIA：Vera Rubin platform release
- Google：TPU 8t and TPU 8i announcement
- Microsoft：Maia 200 announcement
- AMD：MI400 / Helios CES 2026 press release
- AMD：MLPerf Inference 6.0 results
- AWS：Amazon EC2 Trn3 UltraServers
- Meta：MTIA roadmap
- Qualcomm：AI200 and AI250 announcement
- MLCommons：MLPerf Inference v6.0

芯片与算力 · 目录

继续滑动看下一个

口袋 AI 系统笔记

向上滑动看下一个