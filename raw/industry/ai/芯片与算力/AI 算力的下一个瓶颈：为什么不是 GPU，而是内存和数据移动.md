---
title: "AI 算力的下一个瓶颈：为什么不是 GPU，而是内存和数据移动"
source: "https://mp.weixin.qq.com/s?__biz=Mzg3MjcwNjExOA==&mid=2247484188&idx=1&sn=2077f3d4c2f7aedad87a8cac8807b7b0&chksm=ceea7a35f99df3237eadff8dddd1c368a488fa1455d0734b24eb8211c0b609d86fe64e59b78d&scene=178&cur_album_id=4496673538715877378&search_click_id=#rd"
author:
  - "[[JW]]"
published:
created: 2026-05-09
description: "过去两年，AI 行业几乎形成了一个共识：谁拥有更多 GPU，谁就拥有更强的 AI 能力。这个判断没有错，但它正在变得不完整。"
tags:
  - "clippings"
---
JW *2026年4月24日 10:33*

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/KoTWV9E4RiaBN01HcEGaCprQoYwtL0ibDonAdmgU4xWg2icHhiayuKtLuLLeDxTkGTks1aehDWAZGE8K0mB9wfmF99icjGhOzDB1IeMATlaEjEicA/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1#imgIndex=0)

过去两年，AI 行业几乎形成了一个共识：谁拥有更多 GPU，谁就拥有更强的 AI 能力。

这个判断没有错，但它正在变得不完整。

当模型越来越大，推理越来越复杂，Agent 开始调用工具、读写长期记忆、处理多模态数据时，真正限制 AI 系统效率的，未必还是 GPU 的计算峰值，而是另一个更底层的问题：

**数据能不能足够快、足够便宜、足够低功耗地移动到该去的地方。**

换句话说，AI 算力的下一个瓶颈，不只是“算不算得快”，而是“数据搬不搬得动”。

## 一、GPU 很强，但 GPU 不能凭空计算

很多人理解 AI 算力时，第一反应是 GPU 的 FLOPS。

FLOPS 衡量的是芯片每秒能做多少浮点运算。这个指标当然重要，尤其是在大模型训练阶段，矩阵乘法规模巨大，GPU 的计算能力直接影响训练速度。

但有一个经常被忽略的事实：

**GPU 再强，也必须先拿到数据，才能开始计算。**

模型参数、KV Cache、激活值、训练样本、向量索引、多模态输入，这些数据都要在存储、内存、显存、GPU 核心、不同 GPU、甚至不同服务器之间来回移动。

一旦数据移动速度跟不上，GPU 就会等待。

这时你买到的不是满负荷工作的 GPU，而是一堆被内存、互联和 I/O 拖住的昂贵硬件。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

## 二、AI 系统里真正昂贵的，不只是计算，而是搬数据

在传统软件里，我们经常说“计算很贵”。

但在现代 AI 系统里，很多时候更贵的是数据移动。

一次大模型推理，表面看是模型在“思考”，底层其实是海量参数和中间状态不断被读取、传输、缓存和复用。

尤其进入推理阶段后，瓶颈会变得更明显。

训练时，大量计算可以批量并行，GPU 利用率相对容易做高。

但推理时，特别是长上下文、多轮对话、Agent 工作流、实时交互场景，系统要不断读取历史上下文、调用工具结果、维护 KV Cache，还要处理低延迟响应。

这时候，问题不只是 GPU 算得快不快，而是：

- 显存容量够不够？
- 显存带宽够不够？
- 多 GPU 之间通信快不快？
- CPU、内存、SSD、网络之间的数据路径是否顺畅？
- 数据移动产生的功耗和成本是否可接受？

AI 的成本结构，正在从单纯的“计算成本”，转向“计算 + 存储 + 内存 + 网络 + 能耗”的系统成本。

## 三、HBM 为什么突然变得这么重要？

如果说 GPU 是 AI 芯片的发动机，那么 HBM 高带宽显存就是燃料管道。

HBM 的全称是 High Bandwidth Memory，高带宽内存。它通过 3D 堆叠和超宽位宽接口，把内存直接放在计算芯片附近，从而提供远高于传统内存的带宽。

这也是为什么近两年 HBM 会变成 AI 硬件产业链里的核心资源。

以当前主流 AI 加速器为例，NVIDIA Blackwell 级别 GPU 已经把 HBM 带宽推到 TB/s 级别；NVIDIA 的 GB200 NVL72 这类机柜级系统，也把 HBM 容量、带宽和 NVLink 互联放在同一张系统能力表里展示。

Micron 等存储厂商也在推进 HBM4。它们强调的不只是更高带宽，还有更大容量和更好的能效。

这背后的逻辑很简单：

模型越大，参数越多；

上下文越长，KV Cache 越大；

推理并发越高，显存压力越大；

多模态和 Agent 越复杂，数据移动越频繁。

AI 系统对 HBM 的需求，不只是“多一点显存”，而是“更大的容量、更高的带宽、更低的功耗”。

未来 AI 芯片竞争，表面看是 GPU 对 GPU，实际上也是 HBM 供应链、先进封装、互联架构和系统设计的竞争。

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

## 四、长上下文和 Agent，会进一步放大内存瓶颈

如果只是短文本问答，模型推理还相对简单。

但现在 AI 应用正在走向三个方向：

第一，长上下文。

用户希望模型一次处理几十万字、上百万 token 的文档、代码库、会议记录和知识库。

第二，多模态。

模型不只看文字，还要看图片、视频、语音、表格、网页和传感器数据。

第三，Agent。

模型不再只是回答问题，而是规划任务、调用工具、读取文件、写代码、联网检索、执行操作。

这些能力都会带来一个共同结果：

**系统状态越来越大，数据流动越来越复杂。**

尤其是 KV Cache。

KV Cache 是大模型推理中保存历史注意力状态的重要结构。上下文越长、并发越高，KV Cache 占用的显存和带宽就越可观。

NVIDIA 技术博客里提到，KV Cache 会随着 prompt 长度线性增长；当上下文窗口变长、用户并发变高时，它会成为推理系统里的重要瓶颈。

所以，未来 AI 系统优化的重点，不会只停留在“换更大的模型”上，而会越来越关注：

- 如何压缩 KV Cache
- 如何做分层存储
- 如何在 GPU、CPU 内存、SSD 之间调度数据
- 如何减少重复读取
- 如何让模型只访问真正需要的信息
- 如何把计算移动到数据附近

这就是为什么“内存墙”和“数据移动”会成为 AI 系统工程的核心问题。

## 五、未来的赢家，不只是买更多 GPU 的公司

如果 AI 算力瓶颈转向内存和数据移动，那么未来的竞争格局也会发生变化。

第一类机会在硬件层。

HBM、先进封装、Chiplet、CXL、PCIe 6.0、高速互联、液冷数据中心，都会成为 AI 基础设施的重要组成部分。

第二类机会在系统层。

如何调度多 GPU，如何做推理服务，如何管理 KV Cache，如何降低显存占用，如何提升集群利用率，会直接影响 AI 产品的毛利率。

第三类机会在软件层。

模型压缩、量化、稀疏化、缓存优化、向量数据库、RAG 架构、Agent 记忆管理，都会围绕一个目标展开：减少无效数据移动。

第四类机会在应用层。

真正成熟的 AI 应用，不会只是调用一个大模型 API，而是会把模型、数据、工具、记忆和工作流组织成一个高效系统。

所以，未来 AI 公司的技术壁垒，可能不只是“我用了什么模型”，而是：

**我能不能用更低的内存、更少的数据移动、更低的延迟，完成同样甚至更复杂的任务。**

![图片](data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Ctitle%3E%3C/title%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' fill-opacity='0'%3E%3Cg transform='translate(-249.000000, -126.000000)' fill='%23FFFFFF'%3E%3Crect x='249' y='126' width='1' height='1'%3E%3C/rect%3E%3C/g%3E%3C/g%3E%3C/svg%3E)

## 六、给开发者和创业者的三个判断

**第一，不要只盯模型参数，要关注系统成本。**

同样一个 AI 应用，模型调用成本、上下文长度、缓存策略、数据读取方式，都会影响最终利润。

**第二，长上下文不是免费午餐。**

能塞更多 token，不等于应该塞更多 token。未来好的 AI 系统，会更像一个会检索、会压缩、会分层记忆的系统，而不是简单把所有东西扔进上下文。

**第三，AI 基础设施还有很长红利期。**

当所有人都在讨论模型时，真正稳定赚钱的机会，往往在模型背后的基础设施：内存、存储、网络、推理优化、数据管线和开发工具。

## 结语：AI 的下一场竞争，是“数据流效率”的竞争

过去，我们用 GPU 数量衡量 AI 实力。

未来，这个指标仍然重要，但不够完整。

AI 系统越复杂，越需要回答一个更底层的问题：

数据在哪里？

怎么移动？

移动一次要花多少钱？

能不能少移动？

能不能让计算靠近数据？

能不能让内存、存储、网络和 GPU 协同起来？

当模型能力逐渐成为基础设施，真正拉开差距的，将是系统效率。

**AI 算力的下一场竞争，不只是更快的 GPU，而是更高效的数据流。**

## 互动

你觉得未来 AI 基础设施里，最先爆发瓶颈的是哪一个？

- HBM 显存
- 多 GPU 互联
- 存储 I/O
- 数据中心能耗
- 长上下文带来的 KV Cache

欢迎留言，我后面可以继续拆一篇：

**《KV Cache 为什么会成为大模型推理的隐形成本中心？》**

## 参考资料

- NVIDIA GB200 NVL72 官方规格页
- NVIDIA Technical Blog：How to Reduce KV Cache Bottlenecks with NVIDIA Dynamo
- NVIDIA Technical Blog：Accelerate Large-Scale LLM Inference and KV Cache Offload with CPU-GPU Memory Sharing
- Micron High-Bandwidth Memory 产品资料

芯片与算力 · 目录

继续滑动看下一个

口袋 AI 系统笔记

向上滑动看下一个