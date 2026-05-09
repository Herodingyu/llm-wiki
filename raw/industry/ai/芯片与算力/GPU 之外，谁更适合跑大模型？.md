---
title: "GPU 之外，谁更适合跑大模型？"
source: "https://mp.weixin.qq.com/s?__biz=Mzg3MjcwNjExOA==&mid=2247484523&idx=1&sn=5e92099f15bbb5d805444da25d131575&chksm=ceea7d42f99df454862116bfe1543d64b2c8342a5875ebd9521efd2269947d36d44113b555d7&scene=178&cur_album_id=4496673538715877378&search_click_id=#rd"
author:
  - "[[JW]]"
published:
created: 2026-05-09
description: "本文基于论文 The xPU-athalon: Quantifying the Competition of"
tags:
  - "clippings"
---
JW *2026年5月5日 09:44*

本文基于论文 *The xPU-athalon: Quantifying the Competition of AI Acceleration* 展开。论文作者为 Alicia Golden、Carole-Jean Wu、Gu-Yeon Wei、David Brooks，来自 Harvard University 与 FAIR at Meta。论文版本为 arXiv:2604.10852v1，发布日期是 2026 年 4 月 12 日。

如果只用一句话概括这篇论文，我会这样说：

AI 加速器的竞争，已经从“谁的单卡 FLOPS 更高”，变成了“在具体模型、具体 batch、具体上下文长度、具体并发和具体软件栈下面，谁能用更低延迟、更低能耗、更少通信、更高利用率把 token 稳定吐出来”。

这句话听起来像废话。

但它其实很重要。

因为今天大多数关于 AI 芯片的讨论，仍然习惯把问题压缩成几张参数表：

NVIDIA H100 多少 TFLOPS。

AMD MI300X 多少显存。

Cerebras 一整片晶圆多少核心。

Groq 每秒多少 token。

TPU 一整个 pod 多大。

SambaNova 是不是更适合推理。

Gaudi 是不是性价比更好。

这些问题都不是错的，但都不够。

论文《The xPU-athalon: Quantifying the Competition of AI Acceleration》真正想做的事，是把这些不同形态的 AI 加速器放到同一张工程地图里，量化比较它们在延迟、吞吐、功耗、能效、通信、算子、编译和可编程性上的差别。

它比较的对象包括八类平台：

- NVIDIA A100；
- NVIDIA H100；
- AMD MI300；
- Cerebras CS-3；
- SambaNova SN-40；
- Groq；
- Gaudi；
- Google TPUv5e。

这不是一篇“谁打败谁”的论文。

它更像一篇提醒工程界冷静下来的论文：

别再把 AI 加速器竞争看成单指标竞赛了。硬件架构确实重要，但架构优势只有落到真实推理流程里，才算优势。尤其是大模型推理，一旦进入分布式 scale-out，通信、内存容量、KV cache、batch size、sequence length、模型大小和软件成熟度都会改变结论。

也就是说，今天问“哪种 AI 芯片最好”，本身就是一个不够精确的问题。

更好的问题是：

> 对这个模型、这个上下文长度、这个 batch、这个延迟目标和这个部署规模，哪种硬件系统在 latency-energy Pareto frontier 上？

这篇论文的价值就在这里。

它不是给一个统一冠军，而是把“没有统一冠军”这件事量化出来。

## 先说结论：这不是一张 AI 芯片排行榜

如果你只想先拿走判断，可以记住三句话。

第一， **GPU 之外的 AI 加速器确实有优势，但优势不是通吃** 。

Cerebras 在低 batch、低延迟和片内通信能耗上很有特点；Groq 在部分小尺度计算 primitive 上非常快；SambaNova 在高吞吐和 fused kernel 场景里有空间；TPU、MI300、H100 在更偏规模化吞吐或成熟生态的场景里仍然会回到 Pareto frontier。

第二， **大模型推理的硬件比较，不能脱离 prefill、decode、batch、上下文长度和 scale-out 通信** 。

同一块硬件，跑 Llama-3.1-8B 低 batch 和跑 Llama-3.1-70B 128K 长上下文，不是同一道题。只看单卡 FLOPS，会把很多真实瓶颈藏起来：KV cache、内存带宽、跨芯片通信、idle power、编译时间和算子覆盖都会改写结果。

第三， **这篇论文和 MLPerf 不冲突，它们回答的是不同问题** 。

MLPerf 更像标准化赛道：固定任务、固定规则、固定提交口径，比较谁在标准 benchmark 下跑得好。

xPU-athalon 更像系统解剖：它追问为什么换一个 batch、换一个 sequence length、换一个模型规模、加入 scale-out 通信之后，最优硬件会变。

所以更准确的关系是：

> MLPerf 解决“标准赛道谁跑得快”；  
> xPU-athalon 解释“为什么换一条赛道，冠军可能变了”。

对工程师来说，这个差别很实际。

如果你在做采购、容量规划或推理服务选型，MLPerf 可以提供标准化参考，但还不够。你还要问：我的模型是不是长上下文？我的请求是不是低 batch？decode 阶段功耗多少？通信有没有暴露在关键路径上？软件栈能不能让我自己改模型和 profile？

这些问题，才决定硬件最后是不是划算。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

图源：Golden et al., *The xPU-athalon*, arXiv:2604.10852v1。中文解读为本文整理。

这张图不是在给八个平台排总分。

它更像一张提醒： **延迟、吞吐、能效、可编程性很难同时拉满** 。Cerebras 和 Groq 在低延迟方向更突出，SambaNova 更偏高吞吐，Gaudi 和 TPU 的软件可用性更靠前，传统 GPU 则胜在生态和均衡。

## 一、为什么现在需要重新比较 AI 加速器

过去十多年，AI 计算基本是 GPU 的时代。

CUDA、cuDNN、NCCL、TensorRT、PyTorch、Megatron、vLLM、FlashAttention、NVLink、NVSwitch、DGX、HGX、机柜级系统，这些东西叠在一起，构成了 NVIDIA 最强的护城河。

但大模型爆发以后，需求变得太大了。

训练要算力。

推理要容量。

长上下文要显存。

agent 工作流要低延迟。

多模态要带宽。

大规模线上服务要功耗和利用率。

云厂商和模型公司不可能永远只押一种硬件。论文开头提到，主要行业玩家已经开始走向多供应商部署，OpenAI 与 AMD 的 6GW GPU 部署计划就是一个信号。这个信号不是说 AMD 已经替代 NVIDIA，而是说明 hyperscaler 开始认真考虑容量、供应链和架构多样性。

在这个背景下，很多非传统 GPU 架构重新变得有讨论价值。

Cerebras 走的是 wafer-scale 路线，把整片晶圆做成一台计算机器，用巨量片上 SRAM 减少跨芯片通信。

Groq 走的是确定性执行和 SRAM-only 路线，牺牲一部分通用性，换取非常低的延迟和高度可预测的执行。

SambaNova 走的是可重构数据流架构，用空间优化的数据路径和 kernel fusion 来提高吞吐。

Gaudi 走的是面向 AI 的可编程张量处理核心，强调云上可获得性和软件栈。

TPU 是 Google 长期自研的 systolic array 路线，尤其适合在 pod 形态里 scale-out。

AMD MI300 则是 GPU 路线里对 NVIDIA 最直接的竞争者，用更大的 HBM 容量和较强的算力进入大模型推理和训练市场。

论文的基本判断是：

这些架构都不是“GPU 的简单替代品”。

它们各自押了不同的瓶颈。

有人押片上 SRAM。

有人押确定性调度。

有人押数据流。

有人押云上可部署性。

有人押大容量 HBM。

问题在于，哪一种押注在真实 AI workload 里成立，不能靠厂商宣传判断，只能靠系统性测量。

## 二、论文先统一语言：别被各家术语带偏

AI 加速器特别容易被术语污染。

Cerebras 讲 wafer。

SambaNova 讲 RDU、PMU、PCU。

Groq 讲 LPU。

Gaudi 讲 TPC。

TPU 讲 systolic array。

GPU 讲 SM、Tensor Core、HBM、NVLink。

如果直接拿这些词比较，很快就会变成厂商白皮书互相打架。

所以论文先做了一件很有用的事：抽象出一个通用加速器模型。

最底层是 block。

一个 block 由 compute core 和 private SRAM 组成，可以理解成一个小的计算与局部存储单元。

多个 block 组成一个 accelerator。

accelerator 内部可能有 shared on-chip SRAM，也可能连接 off-chip DRAM。

多个 accelerator 组成一个 node。

多个 node 再组成 system。

这个抽象很关键。

因为它让 Cerebras、SambaNova、Groq、Gaudi、GPU、TPU 这些完全不同的话术，能被放到同一个问题上比较：

计算在哪里？

私有 SRAM 在哪里？

共享 SRAM 在哪里？

DRAM 在哪里？

芯片之间怎么连？

系统 scale-out 以后，数据要走多远？

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

图源：Golden et al., *The xPU-athalon*, arXiv:2604.10852v1。中文解读为本文整理。

读这张图时，不要先看谁的曲线最高。

先看内存位置。Cerebras 和 Groq 把大量工作放在片上 SRAM 附近，目标是少搬数据；GPU 和 TPU 更依赖外部高带宽内存和成熟互联。 **AI 推理的瓶颈，很多时候不是“算不算得动”，而是数据从哪里来、走多远、多久回来。**

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

图源：Golden et al., *The xPU-athalon*, arXiv:2604.10852v1。中文解读为本文整理。

论文对几类架构的描述可以这样理解。

Cerebras CS-3 是一整片晶圆。它把大量 compute core 和 memory 放在同一块硅上，目标是减少芯片到芯片之间的数据搬运。它的核心优势不是“像 GPU 一样堆更多卡”，而是尽量让一个大模型或一部分模型在晶圆内部移动数据。

SambaNova SN-40 是 coarse-grained reconfigurable array，也就是粗粒度可重构阵列。它的 RDU 由 PMU 和 PCU 网格组成，PCU 可以按 workload 配成类似 systolic array 或 SIMD core。它更强调根据数据流配置空间路径。

Groq 是一种专门做 LLM 推理的处理器，经常被叫作 LPU。论文强调它没有传统意义上的多级内存层次，主要依赖片上 SRAM。它是 fully deterministic 的，控制逻辑和拥塞缓解逻辑可以减少，执行更可预测。

Gaudi v1 由 8 个 tensor processing core 组成，每个 TPC 是可编程 VLIW 处理器，面向矩阵和张量计算。论文用的是 AWS 上公开可用的 Gaudi1，虽然业界已经有更新一代。

TPUv5e 是 Google 面向推理优化的 TPU 版本。它以 systolic array 为基础，强调矩阵乘和 pod 级 scale-out。

GPU 则是传统基线，包括 A100、H100 和 AMD MI300。它们通用性强，软件生态成熟，HBM 容量和带宽高，scale-out 生态也最成熟。

论文的架构抽象告诉我们：不要只看“它叫什么芯片”，要看它把 compute、SRAM、DRAM 和通信路径放在哪里。

这会直接决定推理时的延迟、能耗和 scale-out 成本。

## 三、roofline 看上去 Cerebras 很强，但单加速器比较不公平

论文用 roofline 模型比较各平台的计算和内存能力。

从单 accelerator 粒度看，Cerebras CS-3 的峰值吞吐比当代 GPU 高大约两个数量级。这个数字很震撼，但论文马上提醒：这不是 apples-to-apples。

原因很简单。

一台 Cerebras CS-3 本来就不是一颗普通 GPU 尺度的芯片。它是一整片晶圆级系统。把它和一颗 H100 直接放在同一个坐标里，当然会出现量级差异。

所以论文又做了一个更公平的归一化：把不同硬件平台缩放到“等效 FLOPS”后，比较功耗、内存带宽/容量比和面积效率。

这里有几个重要结论。

第一，按等效 FLOPS 比较功耗，CS-3 看起来最省电。论文给出的例子是：相对于 1 个 H100 的等效 FLOPS，CS-3 只需要 0.54 倍功耗。MI300 也表现不错，只需要 0.81 倍 H100 功耗。

第二，按 memory bandwidth / capacity ratio 比较，CS-3 和 Groq 很突出，因为它们大量使用 SRAM。这个指标不是简单的“带宽越大越好”，而是在问：为了承载模型权重和工作集，内存系统是不是过度或不足配置。SRAM 的高带宽让 Cerebras 和 Groq 在这项指标上更有优势。

第三，按面积效率比较，结论更复杂。CS-3 的面积效率和 H100、MI300 相对可比；SambaNova SN-40 和 Groq 的面积效率分别只有 H100 的 0.40 倍和 0.11 倍。论文特别指出，Groq 为了获得等效 FLOPS，需要的硅面积相对更大。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

图源：Golden et al., *The xPU-athalon*, arXiv:2604.10852v1。中文解读为本文整理。

这组图的意义是把“系统尺度”从比较里剥出来。

如果只拿一整台 CS-3 和一颗 H100 比，当然会得到很大的数字差异。论文把平台缩放到等效 FLOPS 后再看功耗、内存系统和面积效率，结论就细得多：Cerebras 的功耗和通信路线有优势，但 Groq 的面积效率并不好。 **一个架构强不强，要看它为这个优势付了什么代价。**

这部分最值得记住的不是某个数字，而是方法。

AI 加速器比较不能只看单卡峰值。

如果不归一化，就会把“系统尺度差异”误读成“架构效率差异”。

但如果只归一化 FLOPS，又会漏掉内存容量、通信和软件栈。

所以论文后面才会进入真实 LLM 推理、功耗曲线、算子微基准和通信能耗。

## 四、测量本身就很难：每个平台暴露的指标不一样

论文第三节讲 measurement methodology，这部分很工程，也很重要。

作者不是只调用云 API 看 token/s，而是尽量拿到物理硬件做 profiling。

因为如果只看 API，最多知道端到端延迟，很难知道底层功耗、kernel 行为、utilization、温度、通信和编译成本。

不同平台的实验环境如下。

GPU 部分，NVIDIA A100/H100 是多 GPU server node，每个 DGX-Box 8 张 GPU，用 NVLink 互联；AMD MI300 也是类似 8 GPU 设置。NVIDIA 用 nvidia-smi 和 PyTorch profiler，AMD 用 amd-smi 和 rocm-smi。

Cerebras 部分，作者拿到了一台 CS-3 wafer，用 cszoo、appliance 2.5 和 cstorch 跑 workload，用 Cerebras Software Language SDK 1.4 控制数据移动。功耗通过 9 个 PDU 读数求和得到。

SambaNova 部分，作者有 SN-40 API，但功耗和 benchmark 需要物理硬件，所以用可访问的 SN-30 rack 补充测量。软件栈是 SambaFlow 1.24.1，并基于 SambaNova Model Zoo 写自定义 benchmark。功耗同样读 PDU。

Groq 部分，作者有 1 个 GroqRack，也就是 72 个 GroqChip。物理硬件用于系统和编译数据，复杂 workload 则用 API 补充。微基准使用 Groqit 和 Groqflow 4.3.1。

Gaudi 通过 AWS 访问 Gaudi1，用 Habana 软件栈和 HPU backend，profiling 工具是 hl-smi。

TPUv5e 通过 Google Cloud TPU VM 访问，用 tpu-info profiler 读取 latency、utilization 等信息。

这里的难点在于，不同平台能看到的 profiler 指标完全不同。

论文的 Table I 总结了可用指标：

所有平台都能看到 end-to-end latency。

但 per-kernel latency 只有 NVIDIA、AMD、Gaudi、TPU 暴露；Cerebras、SambaNova、Groq 没有同样粒度。

功耗方面，NVIDIA、AMD、Gaudi 有内置 telemetry；Cerebras 和 SambaNova 要通过 PDU，且需要管理员权限；Groq 的功耗来自确定性编译器输出和 CLI。

温度、compute utilization、memory capacity utilization、memory bandwidth utilization、memory copies、PCIe stats、IO stats 的支持也各不相同。

更麻烦的是，即便同一个词，在不同平台上也可能不是同一个定义。

NVIDIA 的 utilization 可能指 SM utilization。

Cerebras 的 utilization 可能指 compute FLOPS utilization。

所以跨平台比较时，论文特别谨慎：能比较端到端就比较端到端，能比较功耗就看真实功耗；不能把不同厂商定义的 utilization 简单放在一张表里当同一指标。

这其实是一个很大的现实问题。

今天 AI 芯片行业的 benchmark 不只是硬件问题，也是可观测性问题。

如果一个系统难以 profile，就很难优化。

如果不同系统的 profile 口径不一致，就很难公平比较。

## 五、模型支持也不一致：能跑 API，不等于能 profile

论文用 Llama 系列模型做端到端推理比较，包括 Llama-2-7B-hf、Llama-3.1-8B、Llama-3.1-70B。

但不同硬件对模型的支持不同。

A100/H100 和 MI300 支持这些模型。

TPUv5e 和 Gaudi 也支持。

Groq 对部分模型可以物理硬件跑，部分需要 API。

Cerebras 对 Llama-3.1-8B 可以跑，但对 Llama-2-7B-hf 不支持，Llama-3.1-70B 只能 API。

SambaNova SN-40 多数是 API，物理 profiling 依赖 SN-30 补充。

这引出一个非常现实的区分：

能通过在线 API 调用一个模型，不等于研究者能拿到底层 profiler 数据。

对真实用户来说，API latency 可能够了。

但对系统研究来说，不知道底层功耗、kernel、通信、编译，就很难判断架构本身到底强在哪里。

论文因此把 workload 分成两层：

一层是 end-to-end inference，看完整模型推理延迟。

另一层是 operator-level microbenchmark，看单个计算 primitive 的行为。

这样做的原因是，端到端结果会混合硬件、软件、模型支持、编译器、kernel library、并行策略等多个因素；microbenchmark 则能更接近硬件 primitive 的能力。

## 六、LLM 推理不能只看单机：scale-out 会改变 Pareto frontier

论文最重要的观点之一，是分布式推理必须纳入比较。

LLM 推理有两个阶段：

prefill 和 decode。

prefill 处理输入 prompt，通常更偏 compute-bound。输入上下文一次性进来，矩阵乘可以更充分地吃满算力。

decode 一次生成一个 token，通常更偏 memory bandwidth-bound。每生成一步都要读权重、读 KV cache、更新状态，内存带宽和通信会变得关键。

如果只用“prefill 看 TFLOPS，decode 看 memory bandwidth”来估算性能，仍然不够。

因为大模型经常放不进一颗 accelerator。

论文以 Llama-3.1-70B 为例，指出为了容纳模型权重和 KV cache，不同平台需要的 accelerator 数量可能从 2 到 576 不等。

这会带来通信。

通信是否暴露在关键路径上，会极大改变延迟和能耗。

论文在 Figure 5 里做了一个很有意思的对比：对 Llama-3.1-70B、batch size 1、sequence length 128K，分别画出 prefill 和 decode 的 latency-energy Pareto curve。

它比较两种场景：

一种是乐观场景，假设通信延迟完全不暴露。

另一种是真实场景，把 distributed inference 中不可避免的通信暴露出来。

结果是：在不考虑通信时，Groq 可以在 decode 的 Pareto frontier 上；但一旦考虑 scale-out 通信，Groq 就不再是最优点。

这不是说 Groq 不快。

恰恰相反，Groq 在小尺度 primitive 上很快。

问题是 Groq 架构高度 disaggregated，单芯片 SRAM 容量有限，服务大模型时需要更多 scale-out。scale-out 一旦进入关键路径，它的小尺度优势会被通信成本吃掉一部分。

这就是论文的 Key Takeaway 1：

当比较不同尺度的 AI 加速器时，必须考虑分布式 scale-out。一个平台在孤立假设下看起来最优，加入真实通信开销后可能失去优势。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

图源：Golden et al., *The xPU-athalon*, arXiv:2604.10852v1。中文解读为本文整理。

这张图最该看的不是哪个点更靠左下，而是实线和虚线之间的变化。

虚线相当于“通信不拖后腿”的理想世界，实线更接近真实分布式推理。Groq 在理想 decode 场景里可以进 Pareto frontier，但加入通信后位置变差。 **很多专用芯片的亮点，只有在模型刚好放进它擅长的尺度里才成立。**

这点对所有“专用 AI 芯片”都很关键。

如果模型或 workload 能放进它最擅长的形态里，它可能非常强。

如果模型必须跨很多芯片，通信就会重新定义结果。

所以判断一个 AI 加速器，不能只问“小模型低 batch 快不快”，还要问“大模型长上下文 scale-out 后还快不快”。

## 七、没有统一最优硬件：batch、上下文长度和模型大小都会改结论

论文接着做了更大的 optimization space exploration。

它的结论很明确：

最优硬件平台会随 batch size、sequence length 和 model size 改变。

Figure 6 展示的是 Llama-3.1-70B、sequence length 128K 下的 batch size sweep。

在低 batch size 时，Cerebras 在 latency-energy trade-off 上最优。

但随着 batch size 增大，Cerebras 很快从 Pareto curve 上掉下来。

decode 阶段里，Cerebras 能比 prefill 阶段在更高 batch 下保持优势，但也不是无限保持。

当 workload 更偏吞吐时，SambaNova、MI300、H100、TPU 会进入 Pareto frontier。

更细的结论是，这个 batch threshold 还会随 sequence length 和 model size 改变。

论文提到，对 Llama-3.1-405B，即便 batch size 是 1，CS-3、H100、MI300 都会出现在 Pareto frontier 上。

这就是 Key Takeaway 2：

LLM 推理最优加速器不是固定的。它取决于 batch size、sequence length 和模型规模。比如 Llama-3.1-8B、128K sequence length、低 batch 时 Cerebras 最好；但吞吐需求上来后，SambaNova、AMD MI300、TPU、H100 会进入 Pareto frontier。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

图源：Golden et al., *The xPU-athalon*, arXiv:2604.10852v1。中文解读为本文整理。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

图源：Golden et al., *The xPU-athalon*, arXiv:2604.10852v1。中文解读为本文整理。

这组图回答的是采购里最常见的问题：同一套模型，batch 变了，结论会不会变？

论文的答案是会。低 batch 时，Cerebras 的延迟-能耗位置很好；batch 上来以后，吞吐型平台开始进入 Pareto frontier。 **所以“某芯片比 H100 快”这句话必须补条件：什么模型、什么上下文、什么 batch、什么延迟目标。**

论文还测了一个低 batch、小模型案例：Llama-3.1-8B。

论文在这个配置下测得，Cerebras 的 latency per token 最低，只有 H100 baseline 的 22.89%。

Groq 和 SN-40 也比 H100 更优，论文给出的相对值分别是 H100 的 30.03% 和 48.61%。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

图源：Golden et al., *The xPU-athalon*, arXiv:2604.10852v1。中文解读为本文整理。

这说明，在低 batch、小模型、低延迟目标下，非 GPU 加速器确实可以有明显优势。

但论文同时做了一个重要区分：

这些性能差异主要来自硬件架构属性，比如 FLOPS 和 memory bandwidth，而不是短期软件版本变化。

作者收集了 Groq 六个月内 13 个软件包版本的性能，发现对所测模型配置没有统计显著变化。

同时，他们在 H100 上关闭部分先进软件优化，比如 FlashAttention3 和 vLLM 优化等级，观察到 latency per token 最高会增加 2.14 倍，影响随模型配置和优化类型变化。

这说明两件事。

第一，软件优化确实能显著影响 GPU 表现。

第二，在论文测到的 Groq vs H100 差距里，硬件因素仍然是主导。

作者也预期，随着 Groq 等相对不成熟的软件栈继续演进，它们还可能获得增量收益，但这不会改变“硬件架构是主要驱动因素”的判断。

## 八、功耗不是 TDP：prefill 和 decode 的功耗形态差异很大

论文没有只用 TDP 估算能耗，而是实际采集了各平台的 power traces。

这部分很重要，因为 TDP 是一个上限或设计口径，不等于真实 workload 下的功耗。

作者把 LLM inference 拆成 prefill 和 decode 两段，分别测功耗，并让系统在两段之间回到 idle。

Figure 8 展示了 Llama-3.1-8B 在 A100、H100、AMD MI300、Cerebras CS-3、SambaNova、Gaudi 上的功耗曲线。

总体上，prefill 比 decode 更耗电，因为 prefill 更 compute-bound。

但不同平台的 prefill/decode 差异很不一样。

论文测得，prefill 阶段所有平台大致消耗 75% 到 100% TDP。

decode 阶段，NVIDIA A100 和 H100 大约是 TDP 的 50% 到 60%。

SambaNova 和 AMD MI300 更高，论文测得分别接近 75% 和 80% TDP。

Cerebras 最特殊，它在 decode 阶段也接近 100% TDP，和 prefill 相当。

论文对此的解释是：SambaNova 和 MI300 在 memory-bound decode 阶段仍然有较高功耗，可能说明数据在内存和计算之间搬运的功耗更高。Cerebras decode 功耗等同 prefill，说明在它上面 memory-bound 操作消耗的功率和 compute-bound 操作差不多。

这就是 Key Takeaway 3：

prefill 和 decode 的相对功耗差异随加速器变化。NVIDIA GPU 的 decode 通常只用 prefill 功耗的 50% 到 60%；SambaNova 和 Cerebras 则分别接近 75% 和 100%。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

图源：Golden et al., *The xPU-athalon*, arXiv:2604.10852v1。中文解读为本文整理。

这张图适合用来反驳一个常见偷懒算法：直接拿 TDP 估算推理能耗。

decode 是 memory-bound，但不同平台在 decode 时的功耗下降幅度完全不同。NVIDIA GPU 会明显降下来，Cerebras 几乎不降。 **推理成本不能只看满载峰值，还要看 prefill、decode 和 idle 三种状态各自怎么耗电。**

更关键的是 idle power。

论文发现：

论文测得，A100、H100 和 AMD MI300 的 idle power 大约是 TDP 的 20%。

Gaudi 稍高，约 30%。

SambaNova 约 40%。

Cerebras 最高，约 80%。

这个数字非常刺眼。

因为如果一个系统 idle power 很高，那么它必须保持高利用率，才能兑现能效优势。

论文还提到，Cerebras 在 34% duty cycle 时可以与 32-GPU H100 cluster 达到 energy-per-token parity。换句话说，如果利用率不够，专用硬件的理论能效会被 idle power 吃掉。

这就是 Key Takeaway 4：

Cerebras、SambaNova、Gaudi 相比传统 GPU 有更高 idle power，因此实际部署中必须保持高利用率。

这点对采购很重要。

一个低延迟、低通信的专用系统，如果业务流量不够稳定，或者调度系统不能把它长期喂满，最终账单未必好看。

硬件效率不是只看跑起来的时候。

还要看等活的时候。

## 九、算子微基准：Groq 小尺度很强，但不是所有算子都支持

端到端推理会混进很多因素。

为了看更底层的计算 primitive，论文设计了一组 microbenchmark。

它们从 HuggingFace LLM 中抽取常见算子和张量形状，覆盖 sequence length、batch size、hidden dimension 等参数。

Figure 9 展示了六类 transformer LLM inference 相关算子的部分结果，包括 attention、matrix multiply、mul、rsqrt、silu、sin 等。

这里最突出的结论是 Groq。

在小尺度下，Groq 的 primitive latency 很强：

论文测得，sin 操作比 H100 快 1.64 倍。

matrix multiply 比 H100 快 14.42 倍。

rsqrt 操作比 H100 快 300.16 倍。

这说明 Groq 的确定性 SRAM 架构在部分 primitive 上确实有巨大低延迟优势。

但论文马上补充限制：Groq 的优势只体现在它支持的 operators 上。它在物理硬件上并不支持一些关键 PyTorch operator，包括 torch.mm 和标准 PyTorch attention，也缺少 PyTorch scaled dot product attention，也就是 SDPA kernel。

这就是 Key Takeaway 5：

Groq 的延迟优势主要出现在小尺度，因为它的强项是非常快的计算 primitive，而不是大规模 scale-out 部署。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

图源：Golden et al., *The xPU-athalon*, arXiv:2604.10852v1。中文解读为本文整理。

这张图说明 Groq 的故事为什么既有吸引力，也有边界。

在一些小尺度 primitive 上，Groq 可以非常快；但它不是对所有 PyTorch 算子都快，也不是所有算子都支持。更重要的是，快的同时功耗并不低。 **算子级胜利不能直接外推成端到端大模型胜利。**

SambaNova 的表现也很有意思。

它不像 Groq 那样在普通 primitive 上全面低延迟，但它在 fused kernel 上有优势。

论文说，SambaNova 在大型 fused ops 上表现好，例如 SDPA，比 A100 快 1.12 倍；但在 rsqrt、sin 这类通用操作上落后，A100 最多可以快 7 倍。

这说明不同架构的优势颗粒度不一样。

Groq 强在小尺度 primitive。

SambaNova 强在某些 fused kernel。

GPU 强在通用算子覆盖、成熟 kernel 库和软件优化。

论文还记录了 power、temperature、memory usage、clock frequency、memory utilization 等指标。

Groq 虽然快，但也是最“吃功率”的平台。在 rsqrt 上功耗最高比其他平台高 35 倍，在 sin 上高 51.44 倍，在 matrix multiply 上高 18.61 倍。

温度控制也有差异。

AMD MI300 的温度最稳定。

Gaudi 的温度变化最大，说明不同平台的 thermal regulation 策略很不一样。

memory capacity utilization 也差异巨大，attention workload 可以从 0.41% 到 100% 不等，取决于平台和张量形状。

所以 microbenchmark 给出的不是简单胜负，而是更细的工程画像：

谁低延迟。

谁高功耗。

谁支持哪些算子。

谁在 fused kernel 上强。

谁的温度和内存利用率更稳定。

## 十、通信能耗：Cerebras 的晶圆级路线在这里最有说服力

论文另一个核心贡献，是量化 communication energy。

大模型推理里，通信不只是延迟问题，也是能耗问题。

每跨一次芯片、跨一次板、跨一次节点，数据都要付电费。

论文设计了通信 microbenchmark：传输 B bytes 数据，测功耗和执行时间，再用 benchmark power 减去 idle power，得到通信能耗。

对 Cerebras，作者用 Cerebras SDK 和低级 CSL 语言，指定 sender PE 和 receiver PE，在 wafer 内不同距离上传输数据，并用 SDK simulation 验证 wavelet 传输。然后在真实晶圆上跑 benchmark，通过 PDU 输出算功耗。

对 Groq，作者设计跨 chip 数据传输 microbenchmark，并通过 Chip-to-Chip unit 的 power utilization 验证。

对 H100，则用类似方法测 NVLink 数据传输。

结果非常明确：

论文测得，在 161mm 通信距离下，CS-3 每 byte 能耗比 H100 系统低 34,454 倍，比 Groq 低 2.74 倍。

Figure 10d 还显示，CS-3 最高可以比 H100 少 74,433 倍 communication energy per byte。

这就是 Key Takeaway 6：

当模型能放进单个 wafer 内时，Cerebras 相比 H100 和 Groq 显著降低通信能耗，因为大硅面积让更多数据移动留在片上。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

图源：Golden et al., *The xPU-athalon*, arXiv:2604.10852v1。中文解读为本文整理。

这张图把 Cerebras 的核心卖点讲得最清楚。

它不是简单说“我有更多核心”，而是说“我能让数据少离开硅片”。当模型能放进单个 wafer 内，通信能耗可以比 H100 NVLink 低几个数量级。但右下角的编译时间图也提醒另一件事： **硬件把通信省下来的同时，软件栈可能把工程时间花回去。**

这部分是 Cerebras 路线最强的论据。

很多时候我们讨论 Cerebras，会先盯它的晶圆尺寸、核心数量、片上 SRAM 容量。

但真正的核心是数据移动距离。

GPU 集群强在灵活和成熟，但模型一旦切到多 GPU、多节点，通信不可避免。

Cerebras 的赌注是：如果把足够多 compute 和 SRAM 放在同一片硅上，就能把一部分通信留在片内，减少跨芯片和跨节点搬运。

论文的通信能耗测量证明，在模型适配它的情况下，这个思路确实有能耗优势。

但注意条件：

模型要能 fit inside a single wafer。

如果不能，scale-out 问题仍然会回来。

这也是为什么全文一直强调“没有统一最优”。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

图源：Golden et al., *The xPU-athalon*, arXiv:2604.10852v1。中文解读为本文整理。

## 十一、软件栈才是新加速器最大的瓶颈

论文第六节的讨论部分，几乎是给所有 AI 加速器厂商的一封公开信：

硬件再有想法，软件跑不起来也没用。

作者总结了 profiling 和部署中的几个挑战。

第一，可编程性。

每个平台都有自己的 toolchain、compiler configuration 和 profiling workflow。

厂商都会说自己有 model zoo，但实际跑起来经常有 caveat。论文特别提到，即便是简单 batch size scaling，在作者的物理 CS-3 和 Groq 设置上也不支持。

软件不一致、限制没文档、kernel 覆盖不完整，都会让研究停滞或被迫绕路。

第二，编译和 build time。

专用加速器经常有很长 build time。

Figure 11 显示，Groq 的 build time 可以超过 4500 秒，并且随芯片数量线性增长。

Groq build 的详细拆解里，compile 和 assembly 分别占总 build time 的 40% 和 59%。

编译时间对不同使用场景意义不同。如果模型参数很固定，长编译可以接受；如果研究人员频繁改模型、改 shape、改 batch，那长编译会严重拖慢迭代。

第三，指标口径不统一。

前面说过，同样叫 utilization，不同平台定义不同。没有统一口径，就很难跨平台判断谁真的吃满了硬件。

第四，管理员权限。

要测 Cerebras 和 SambaNova 的功耗，需要 PDU 数据，常常要 sudo 或管理员协助。研究者不一定有权限。

这些问题说明，AI 加速器竞争不只是芯片设计竞争，也是软件工程、工具链、profiling、文档和可观测性的竞争。

## 十二、PyTorch 支持：名字相似，不代表体验相似

论文进一步比较了各平台的软件可编程性。

Cerebras 支持 CSTorch，这是一个专门为 Cerebras wafer 设计的 PyTorch API。

但它有不少限制：tensor 要提前初始化；需要 special step closure，防止过早取回 tensor values；运行单个 operation 还需要 custom template code；当前不支持直接跑 individual operator benchmark。

SambaNova 也类似，需要专门的 PyTorch-like 语言和 SambaFlow SDK。相对于 PyTorch 3000 多个 operator，SambaFlow 支持的是低几百个 operator。tensor 需要用 samba package 定义，分布式通信 primitive 也依赖 SambaFlow-specific implementation。

Groq 对 PyTorch 语言的支持看起来更直接，但支持的 operator 集合也只有几百个。论文特别提到，它在物理硬件上缺少几个关键 operator，包括 torch.mm 和标准 PyTorch attention。代码还需要 wrapper，先 export，再转 ONNX，最后才能跑在硬件上。函数还必须符合统一的内部 template；虽然理论上可以绕开，但没有公开文档和支持。

model zoo 也不能只看宣传。

论文说，尽管 Groq 宣传支持 LLaMA，把 LLaMA 模型部署到 9 个 Groq rack 上实际需要约 1.5 年协调和反复处理编译器问题，最后只有 Groq 工程师手工编译的模型能跑，变体不能跑。

Cerebras model zoo 支持 30 多个 workload，但开源工具主要面向训练。

SambaNova 也提供先进模型，但配置上有局限。

这部分其实点破了新硬件落地的最大矛盾：

厂商展示 demo 和客户生产部署之间，有一条很长的软件路。

硬件能跑一个模型，不等于客户能自由改变 batch、sequence length、并行策略、模型变体和算子组合。

如果每次变体都要厂商工程师手工介入，那它还不是一个成熟生态。

## 十三、论文对社区的呼吁：软件栈 enablement 是关键

论文最后明确呼吁，社区应该把更多努力放在 AI 加速器软件栈上，尤其是 compiler flow 和 optimized kernel development。

原因很简单。

真实性能取决于 compiler、runtime、kernel library 能不能把硬件能力用起来。

缺 operator、kernel 没优化、编译太慢、profile 不透明，都会遮蔽硬件本来的能力。

硬件厂商常常说自己的架构更好，但如果用户很难把模型跑上去，或者跑上去后不能调优，那架构优势就无法兑现。

论文还提到一个有意思的方向：LLM 可能反过来帮助降低软件开销。

未来 LLM 可以自动生成优化 kernel，减少人类工程师手写底层代码的时间。

这不是论文的主实验，但它是一个值得关注的判断。

如果 AI 模型能帮助 AI 加速器生成更好的 compiler pass、kernel 和 mapping，那么新架构的软件成熟速度可能会被加快。

但在今天，结论仍然是：

软件栈成熟度是新 AI 加速器 adoption 的主要瓶颈之一。

## 十四、相关工作：为什么现有 benchmark 不够

论文还把自己和已有工作区分开。

MLPerf 和 MLPerf Power 是最重要的标准化 benchmark，但主要还是围绕 CPU、GPU，最近才逐步包括部分 TPU，对特殊 AI 加速器支持有限。

ArtificialAnalysis 这类平台会给出硬件吞吐等高层指标，有参考价值，但难以解释底层系统性质。

一些 edge AI accelerator 研究用 performance-per-watt 或 TDP 做粗粒度估算，也无法捕捉动态 workload 下的真实功耗和 operator-level 行为。

还有一些研究评估 novel accelerator，但主要看 throughput，且常聚焦较老 transformer 模型或训练，不是现代 LLM inference。

这篇论文的不同点在于，它把 end-to-end workload、operator microbenchmark、真实功耗、通信能耗、编译时间和软件成熟度放在一起。

它不满足于说“某平台每秒 token 多”，而是追问：

这个 token 是在什么 batch 下来的？

模型是否需要 scale-out？

通信是否暴露？

decode 阶段功耗是多少？

idle power 多少？

算子层面谁快？

支持哪些 kernel？

编译要多久？

用户是否能真的改模型？

这才更接近生产部署的真实问题。

## 十五、把整篇论文压成六个结论

这篇论文可以压成六个核心结论。

第一，scale-out 必须被纳入 AI 加速器比较。

Groq 这种小尺度低延迟架构，在不考虑通信时可能出现在 Pareto frontier 上；但一旦模型需要大规模跨芯片通信，它的优势会被削弱。

第二，没有固定的最佳 LLM 推理硬件。

batch size、sequence length、model size 会改变最优点。低 batch 下 Cerebras 很强；吞吐需求上来后，SambaNova、MI300、H100、TPU 可能更优。

第三，prefill 和 decode 的功耗比例因平台而异。

NVIDIA GPU decode 功耗相对低，SambaNova、MI300、Cerebras decode 功耗更高，Cerebras decode 几乎等同 prefill。

第四，idle power 会决定专用硬件的真实经济性。

Cerebras、SambaNova、Gaudi 的 idle power 高于传统 GPU。专用硬件必须保持高利用率，否则理论能效会被空闲功耗吃掉。

第五，Groq 的优势主要在小尺度 primitive，而不是所有大规模推理场景。

它在 sin、mm、rsqrt 等 primitive 上可以非常快，但 operator support 不完整，而且 scale-out 后通信会改变结论。

第六，Cerebras 的片内通信能耗优势很大。

当模型能放进单个 wafer，CS-3 能显著降低 communication energy，比 H100 NVLink 低几个数量级。

## 十六、这篇论文对 AI 芯片行业意味着什么

如果你站在芯片厂商角度，这篇论文的提醒是：

不要只宣传峰值 FLOPS。

用户真正关心的是 workload-specific Pareto frontier。

你的芯片在哪些 batch、哪些 sequence length、哪些模型大小、哪些并行策略下有优势？

你的优势来自低延迟、低功耗、低通信、低 idle power，还是更成熟的软件？

这些问题必须被量化。

如果你站在云厂商角度，这篇论文的提醒是：

多硬件部署会变得更合理，但调度会更复杂。

不同 accelerator 适合不同 workload。低 batch 长上下文、吞吐型 batch、超大模型、固定模型 API、研究型模型迭代，可能应该跑在不同硬件上。

未来云上的 AI compute 可能不再是“所有东西都丢给 GPU”，而是更像异构资源调度：

这个请求给 H100。

那个固定模型给 Groq。

某个低 batch 长上下文给 Cerebras。

某个高吞吐场景给 SambaNova 或 TPU。

某些大显存需求给 MI300。

但前提是软件栈和调度系统能管理这种复杂度。

如果你站在模型公司角度，这篇论文的提醒是：

不要只问供应商“你比 H100 快多少”。

要问得更具体：

Llama-3.1-70B，128K context，batch size 1、64、256，TTFT 和 TPOT 分别多少？

功耗曲线是什么？

idle power 多少？

scale-out 后通信延迟暴露多少？

支持哪些 PyTorch operator？

改模型 shape 后要重新编译多久？

能不能自己 profile？

能不能自己写 kernel？

这些问题比发布会数字更接近真实采购。

如果你站在投资者角度，这篇论文的提醒是：

AI 芯片公司不能只看“架构故事”。

架构故事必须落实到：

可运行模型覆盖；

端到端延迟；

能耗；

通信；

idle power；

软件栈；

编译时间；

客户是否能独立部署。

没有软件成熟度的硬件优势，很容易停留在 demo。

## 十七、最后的判断：GPU 不会消失，但 AI 加速器会分层

这篇论文没有说 GPU 要被替代。

相反，它间接说明 GPU 仍然很强。

GPU 的优势不只是硬件，而是成熟生态、通用性、kernel 覆盖、profiling、scale-out、开发者经验和生产稳定性。

但论文也说明，GPU 不再是所有场景的唯一合理答案。

在低 batch、小模型、固定模型、低延迟、片内通信、特定 fused kernel、高吞吐等场景里，Cerebras、Groq、SambaNova、TPU、MI300、Gaudi 都可能进入各自的最优区间。

未来 AI 加速器竞争很可能会分层：

通用训练和快速模型迭代，GPU 仍然强。

大显存推理和替代供应，MI300 这类 GPU 会越来越重要。

固定模型低延迟 API，Groq 这种确定性架构有机会。

能放进晶圆的大模型或长上下文场景，Cerebras 的通信能耗优势有价值。

高吞吐和 fused dataflow workload，SambaNova 有自己的位置。

云厂商内部可控负载，TPU 继续有优势。

成本敏感、云上可获得的场景，Gaudi 也可能有空间。

真正的问题不是“谁赢了 GPU”。

真正的问题是：

谁能在某类明确 workload 上，给出可重复、可 profile、可部署、可扩展的 latency-energy-cost 优势。

这也是 xPU-athalon 这个题目最有意思的地方。

它把 AI 加速器竞争从营销语言拉回到了工程语言。

不是喊“我的芯片更快”。

而是问：

在哪个模型上？

哪个 batch？

哪个上下文长度？

几颗芯片？

通信怎么算？

功耗怎么算？

idle 怎么算？

编译多久？

能不能自己改？

这些问题都回答完，AI 加速器竞争才真正开始。

## 参考资料

Golden, Alicia, Carole-Jean Wu, Gu-Yeon Wei, and David Brooks. *The xPU-athalon: Quantifying the Competition of AI Acceleration*. arXiv:2604.10852v1, 2026. https://arxiv.org/pdf/2604.10852

芯片与算力 · 目录

继续滑动看下一个

口袋 AI 系统笔记

向上滑动看下一个