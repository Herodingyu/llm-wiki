---
title: "AMD：第二供应链为什么值钱？"
source: "https://mp.weixin.qq.com/s?__biz=Mzg3MjcwNjExOA==&mid=2247484447&idx=1&sn=8d977569ed080484a8d82e064841255d&chksm=ceea7d36f99df4206afbe062dc75c32cb2ebe4a8e6a51c1934a038332aa3739f4ffd301e4847&scene=178&cur_album_id=4496673538715877378&search_click_id=#rd"
author:
  - "[[JW]]"
published:
created: 2026-05-09
description: "看 AMD 的 AI 芯片，最容易问错一个问题：它能不能全面打败 NVIDIA？"
tags:
  - "clippings"
---
JW *2026年5月3日 14:05*

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/KoTWV9E4RiaBvIAia1Jz60iboFweiatqjHy9DUibkvQ4Sd0BhPKRLcLubDJ0A7ZoDh1JVrFdbGBunNhziaVB4DtZgmv9nrRvasQGcMbVBPuJSaOoU/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0)

看 AMD 的 AI 芯片，最容易问错一个问题：

它能不能全面打败 NVIDIA？

这个问题听起来直接，但对很多云厂商和大客户来说，不是最现实的问题。

更现实的问题是：

> 如果未来几年 AI 推理会变成长期基础设施成本，我能不能只押一条 NVIDIA 供应链？

这才是 AMD 的机会。

AMD 不一定需要在每个 benchmark 上压过 NVIDIA。它真正要证明的是：在大模型推理生产环境里，MI350/MI355X 能不能提供一条足够可用、足够开放、足够大规模交付的 GPU 第二路线。

第二供应链不是备胎。

当 GPU 变成 AI 服务的成本底座，第二供应链本身就有价值。

它影响采购议价、供货安全、云厂商谈判、模型部署选择，也影响一个公司未来几年能不能把 AI 服务成本压下来。

## 一、AMD 不是在发明另一种推理芯片

AMD 的路线和 Google TPU、AWS Trainium、Cerebras、Groq 不一样。

它没有说：我要重新定义大模型推理。

它说的是：我也能提供一条高性能 GPU 路线，而且这条路线更开放。

MI350/MI355X 仍然是通用 GPU。

它支持训练，也支持推理。

它用 HBM3E。

它走 CDNA4 架构。

它靠 Infinity Fabric 做多 GPU 互联。

它用 ROCm 承接 PyTorch、vLLM、ONNX Runtime、JAX、TensorFlow 等框架。

这条路线没有 NVIDIA 那么强的生态惯性，但它的好处也在这里：客户可以在 GPU 范式内获得第二选择，而不是完全切到一个专用 ASIC 或云厂商封闭芯片。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

如果你是一个大模型服务商，切到 TPU、Trainium 或专用 ASIC，可能要面对更强的云绑定、编译器绑定和迁移成本。

切到 AMD 的逻辑不同。

它仍然是 GPU。

模型并行、张量计算、HBM、通信库、推理框架这些概念都还在。

真正的挑战从“要不要换一种芯片范式”，变成了“ROCm 能不能把 CUDA 路线里的工程经验接住”。

AMD 的位置可以这样理解：它不是推理芯片世界里的新物种，而是 NVIDIA GPU 路线里最现实的第二供应商。

## 二、MI355X 的参数说明了什么

先看 MI355X 的核心参数。

| 维度 | AMD Instinct MI355X |
| --- | --- |
| 架构 | CDNA4 |
| 制程 | TSMC 3nm + 6nm FinFET |
| HBM | 288 GB HBM3E |
| 内存带宽 | 8 TB/s |
| Compute Units | 256 |
| Matrix Cores | 1024 |
| MXFP4 / MXFP6 | 10.1 PFLOPS |
| FP8 | 5.1 PFLOPS |
| FP16 / BF16 | 2.5 PFLOPS |
| 8-GPU 平台内存 | 2.304 TB HBM3E |

这些参数里，最值得盯的不是某个峰值算力。

第一是 288 GB HBM3E。

这和 NVIDIA GB300 单 GPU 的 HBM 容量在同一级别。对推理来说，容量很重要，因为长上下文和多并发会持续吃 KV Cache。

第二是 8 TB/s 内存带宽。

Decode 阶段很多时候不是矩阵算不动，而是要不断读 KV Cache、读权重、搬数据。带宽上不去，token 生成就会被拖住。

第三是 FP4、FP6、FP8 支持。

推理成本下降越来越依赖低精度。模型能不能稳定跑在低精度上，关系到 tokens/s、tokens/W 和 tokens/$。

第四是 8-GPU UBB 2.0 平台。

AMD 的 MI355X 平台把 8 个 OAM 加速器放在 Universal Baseboard 上，通过全互联 Infinity Fabric 连接，每颗 GPU 有 288 GB HBM3E，合计 2.304 TB。

这不是 NVL72 那种机柜级 NVLink 域。

它更像一个标准化、开放式 GPU 服务器积木。

AMD 的野心不是把所有东西收进自己的封闭机柜，而是用 OAM、UBB、以太网、ROCm、EPYC 和 Pensando NIC 拼出一套更开放的 AI 基础设施路线。

## 三、为什么大 HBM 对推理有用

很多人看推理芯片时，会先看算力。

但在线推理里，内存经常先出问题。

模型权重要放进 HBM。

KV Cache 要放进 HBM。

多用户并发时，每个用户都在占运行时记忆。

长上下文一上来，KV Cache 会像账本一样越记越大。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

如果 HBM 容量太小，系统只能做几件事：

- 降低 batch。
- 缩短上下文。
- 把 KV Cache offload 到更慢的内存。
- 更频繁地做模型切分和跨卡访问。
- 接受更高的尾延迟。

这些选择都会影响真实服务。

用户看不到 HBM，但能感觉到系统变慢、变贵、并发上不去。

MI355X 的 288 GB HBM3E，就是 AMD 在推理场景里的一个明确押注：大模型服务不是只缺算力，也缺运行时记忆。

这也是 MI300X 当初能进入很多 LLM 推理讨论的原因。大 HBM 给了 AMD 一个很实在的入口。

到了 MI350/MI355X，AMD 继续把这条路线往前推：更高低精度算力，更高带宽，更明确的推理性能叙事。

## 四、第二供应链真正值钱在哪里

如果只从单卡参数看 AMD，很容易低估它。

云厂商和大客户不是只买一张卡。

它们关心的是未来三到五年的 AI 基础设施成本。

第二供应链的价值，至少体现在四个地方。

### 1\. 采购议价

当市场只有一个强供应商，客户谈判空间很小。

GPU 缺货时，客户甚至不是在选性能，而是在抢产能。

AMD 只要能提供足够可用的训练/推理平台，就能改变谈判结构。

它不需要让所有 workload 都迁移过来。

只要一部分推理服务可以稳定跑在 AMD 上，客户就多了一张牌。

### 2\. 供货安全

AI 服务一旦变成业务基础设施，算力就不是一次性采购，而是持续扩容。

如果某条供应链受限，模型发布、产品上线、客户交付都会受影响。

这时第二供应链不是“便宜一点”的问题，而是业务连续性问题。

### 3\. 工作负载分层

不是所有模型都必须跑在最强 NVIDIA 系统上。

有些推理负载更看重成本。

有些更看重 HBM 容量。

有些可以接受迁移调优。

有些企业私有化场景更关心供应商多元化。

AMD 的机会在这些负载里会先出现：不是最极限的前沿模型训练，而是越来越多可规模化、可迁移、对成本敏感的推理服务。

### 4\. 云厂商战略空间

Oracle、Microsoft、Meta、xAI、OpenAI、Cohere、HUMAIN 等名字出现在 AMD Advancing AI 2025 的合作生态里，说明 AMD 的目标很清楚：先进入大客户和云厂商的基础设施选项。

这些客户不一定会把所有模型迁到 AMD。

但它们需要 AMD 存在。

因为只要 AMD 的路线可用，采购、调度、定价、模型部署和供应链规划都会多一种选择。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

## 五、ROCm 是机会，也是压力点

硬件参数写得再漂亮，最后都要落到软件栈。

AMD 的软件栈是 ROCm。

从官方口径看，ROCm 7 强调的是开源、框架支持、开发者体验和大模型推理部署。AMD 也提供面向 MI355X、MI350X、MI325X、MI300X 的 ROCm vLLM Docker 镜像，把 vLLM 和 PyTorch 做成预构建优化环境。

这很重要。

因为开发者真正关心的不是“理论上支持 PyTorch”。

他们关心的是：

- 这个模型能不能直接跑？
- vLLM / SGLang / TensorRT-LLM 对应能力有没有替代？
- 算子不支持时怎么改？
- 性能差在哪里，是 kernel、通信、显存，还是调度？
- 出问题时，有没有足够多的文档、issue、社区经验和厂商支持？

CUDA 的强，不只是 API。

它强在默认路径。

新模型、新算子、新推理框架、新优化论文，很多时候会先围绕 NVIDIA 跑通。

AMD 要做的是把这条默认路径撬开一部分。

ROCm 不需要一夜之间变成 CUDA。

但它必须让足够多的主流模型、主流框架、主流云客户形成可复制的部署路径。

这个路径一旦跑通，第二供应链就不再只是采购部门的事情，而会进入工程团队的真实选项。

## 六、AMD 这条路的代价

AMD 的路线有价值，但代价也很清楚。

第一，软件迁移仍然要付成本。

即使都是 GPU，CUDA 到 ROCm 也不是无痛切换。算子、kernel、通信库、性能调优、监控工具、团队经验都要重新验证。

第二，生态反馈速度要追。

NVIDIA 的优势在于新模型和新框架往往先在 CUDA 上被优化。AMD 如果跟得慢，客户就会把它留给次一级 workload。

第三，机柜级路线还在追赶。

NVIDIA 已经用 GB300 NVL72 把 scale-up 域推到机柜级。AMD 也在讲开放 rack-scale AI infrastructure 和 Helios，但 MI350/MI355X 当前更现实的形态仍然是 8-GPU 平台、标准服务器和云厂商集成。

这不一定是坏事。

开放和标准化降低了锁定，也给 OEM、云厂商和系统集成商更多空间。

但如果 workload 极度依赖机柜内部高带宽互联，AMD 需要证明自己的开放路线能在真实规模下接住。

第四，客户会按 workload 切分，而不是整体替换。

很多企业不会从 NVIDIA 一夜切到 AMD。

更现实的路径是：先把一部分成本敏感、迁移难度可控、吞吐型或长上下文友好的推理负载迁过去。

跑稳之后，再扩大范围。

## 七、怎么判断 AMD 的位置

AMD 的价值不在于把 NVIDIA 故事复制一遍。

NVIDIA 的核心是封闭而强大的全栈控制：GPU、NVLink、整机柜、CUDA、推理框架、运维工具一起往前推。

AMD 的核心是另一种路线：用通用 GPU、大 HBM、标准平台、以太网和 ROCm，给客户一条更开放的第二选择。

这条路线的收益很具体：

- 采购不再只押一家。
- 推理成本有更多谈判空间。
- 长上下文和大 batch workload 可以利用大 HBM。
- 云厂商可以把不同模型放到不同算力池里。
- 企业客户可以降低供应链和生态绑定风险。

代价也具体：

- ROCm 仍要追 CUDA 的默认路径。
- 性能调优需要工程投入。
- 极限规模的机柜级互联还要继续证明。
- 客户不会因为参数好看就自动迁移。

AMD 不是“低配 NVIDIA”，也不是“开放版 NVIDIA”。

更合适的判断是：

> AMD 是 AI 推理进入基础设施阶段之后，最现实的 GPU 第二供应链。它的价值不只在芯片参数，而在客户终于可以问一句：这个 workload 一定要跑在 NVIDIA 上吗？

当这个问题能被认真提出，AMD 就已经进入牌桌了。

---

芯片与算力 · 目录

继续滑动看下一个

口袋 AI 系统笔记

向上滑动看下一个