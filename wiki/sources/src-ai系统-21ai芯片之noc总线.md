---
doc_id: src-ai系统-21ai芯片之noc总线
title: AI系统 21AI芯片之NoC总线
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-21AI芯片之NoC总线.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 22 人赞同了该文章 ![](https://pic1.zhimg.com/v2-dd64a8c256ef9bbd4569496cfdd96288_1440w.jpg)

## Key Points

### 1. 1\. NoC介绍


### 2. 1.1 NoC的诞生
![](https://pic3.zhimg.com/v2-097b702832221af437cb8f5421954902_1440w.jpg) 上图是芯片内部的 **互联技术演进** 。 ![](https://pic1.zhimg.com/v2-6b553adffe2a8fab98dd9dba196582c6_1440w.jpg)

### 3. 1.2 NoC的定义
NoC总线，全称为 **Network on Chip（片上网络）总线** ，是一种为片上系统（SoC）提供高效通信方式的片上通信架构。它采用类似计算机网络的设计思想，将片上系统内部的各个处理器、存储器、I/O等单元连接起来，形成一个可重构的、高效的、灵活的通信网络。

### 4. 1.3 NoC总线的组成
![](https://pic3.zhimg.com/v2-c80c48adbc74005039c8fa52260b750c_1440w.jpg) 借鉴计算机网络，NoC总线主要由三部分： **网络适配器、网络链路、路由器构成，其与IP核链接** ，给IP核提供通信服务。

### 5. 1.3 NoC拓扑结构
**NoC的拓扑结构** 是指路由器之间的连接方式，常见的拓扑结构包括环形，星形，Mesh，树形，胖树形，蝴蝶形和环面等。规则拓扑（如2D Mesh、3D Mesh等）和不规则拓扑（如专用网络、分层网络等）。不同的拓扑结构对网络的性能、功耗和可扩展性等方面有不同的影响。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-21AI芯片之NoC总线.md) [[../../raw/tech/soc-pm/AI系统/AI系统-21AI芯片之NoC总线.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-21AI芯片之NoC总线.md) [[../../raw/tech/soc-pm/AI系统/AI系统-21AI芯片之NoC总线.md|原始文章]]
