---
doc_id: src-ai系统-16ai-soc推理芯片架构介绍
title: AI系统 16AI SoC推理芯片架构介绍
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-16AI SoC推理芯片架构介绍.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 1 人赞同了该文章 ![](https://pic2.zhimg.com/v2-0ca8415ee6d8aed2040439150c0bcf17_1440w.jpg)

## Key Points

### 1. 1\. AI推理SoC芯片架构


### 2. 1.1 华为达芬奇
参考：ZOMI酱《AI系统》B站视频： [bilibili.com/video/BV1L](https://link.zhihu.com/?target=http%3A//www.bilibili.com/video/BV1Ls) …

### 3. 1.2 特斯拉FSD芯片
参考之前文章： [AI系统-14特斯拉FSD芯片](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247487239%26idx%3D1%26sn%3D705c14f95e9e87a48965634aef99d122%26scene%3D21%2

### 4. 1.3英伟达Origin
参考： [NVIDIA ADAS-英伟达Orin芯片介绍](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485050%26idx%3D1%26sn%3D8fa0d94f783e93aaf4ccb4f7b26e117a%26scene%3D

### 5. 2\. AI推理芯片SoC设计
如果设计一个AI SoC首先就根据需求分模块，首先看看我们需要什么。 1. CPU根据性能和安全需求进行选择 2. 例如图像处理，那就需要ISP、NPU、VPU 3. 如果需要功能安全就用FSI 4. 如果需要信息安全就要有HSM

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-16AI SoC推理芯片架构介绍.md) [[../../raw/tech/soc-pm/AI系统/AI系统-16AI SoC推理芯片架构介绍.md|原始文章]]

## Key Quotes

> "基于网络的拓扑结构，来提高片上通信的效率"

> "NoC逐渐取代总线和交叉开关(crossbar)，而成为片上互连的行业标准"

> "ARM自家的CI-700和Arteris的NoC"

> "核间通信MailBox，准确来说是告知"

> "感知芯片的工艺变化和操作环境，包含以下几种传感器"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-16AI SoC推理芯片架构介绍.md) [[../../raw/tech/soc-pm/AI系统/AI系统-16AI SoC推理芯片架构介绍.md|原始文章]]
