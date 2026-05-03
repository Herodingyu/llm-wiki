---
doc_id: src-为什么不把南桥集成进cpu-cpu和南桥芯片中什么资源最珍贵
title: 为什么不把南桥集成进CPU？CPU和南桥芯片中什么资源最珍贵？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/为什么不把南桥集成进CPU？CPU和南桥芯片中什么资源最珍贵？.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) LogicJitterGibbs 等 1542 人赞同了该文章 南桥芯片，这个统管外部IO的芯片组，正在逐步变得面目可憎起来。经历了ICH到 [PCH](https://zhida.zhihu.com/search?content_id=9613015&content_type=Article&match_order=1&q=PCH&zhida_source=entity) 的转变，越来越多的人都在质疑它的存在。为什么不把PCH集成进CPU中？ [DMI](https://zh

## Key Points

### 1. 南桥的江湖地位问题
熟悉计算机系统演变历史的小伙伴们都知道。很久很久以前（也没有多久了），计算机主板上有CPU、北桥（MCH）和南桥（ICH）这三个主要的芯片： ![](https://picx.zhimg.com/v2-a395fe37a767fd9af36d4efc91b1229f_1440w.jpg)

### 2. What holds up?
现实中我们除了看到ATOM系列全部是SOC、部分低端入门系列服务器是SOC（它原因比较有趣，我们今后再说）外，绝大部分主流系统PCH还是傲娇地继续战斗在第一线。这是为什么呢？ 有两个原因十分明显： 1. 集成进PCH会造成CPU Die增大不少，从而造成CPU良率下降很多，成本增加明显。这里有一篇讨论Die大小和良率的文章： [CPU制造的那些事之二：Die的大小和良品率](https://zhu

### 3. 什么是HSIO？
PCH的引脚就那么多，而人们对高速设备，尤其是USB host和PCIe root port的需求却越来越大。在所有低速引脚已经被充分挖潜，而低速引脚和高速引脚不能复用（想想看为什么）的前提下，如何提供更多的高速设备，同时尽可能不很快增加引脚数量的问题被提上日程。

### 4. DMI的带宽问题
DMI 3.0 4 × 8Gbps怎么带动这么多的高速IO?我们上图中有30个HSIO，每个支持8Gbps，如果他们都接上设备，会不会在DMI上造成拥堵？ 当然会，不过在普通的台式机上这个问题不是很严重，而在高端台式机和服务器上是通过高端PCH提供的uplink直连CPU来解决的。你看的没错，PCH也有很多种，高端PCH甚至HSIO都会多一些。借用一句《动物庄园》里的话：

### 5. 结论
引脚的稀缺性很多人都没有意识到。于此同理，HSIO资源也是稀缺的，每升级一代，PCH就会提供更多的HSIO，来提供更多的USB port，因为现在越来越多的人选择M.2 NvME SSD，PCIe root port也捉襟见肘起来。更多的HSIO，可以让主板厂商有更多的腾挪和发挥空间。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/为什么不把南桥集成进CPU？CPU和南桥芯片中什么资源最珍贵？.md) [[../../raw/tech/soc-pm/为什么不把南桥集成进CPU？CPU和南桥芯片中什么资源最珍贵？.md|原始文章]]

## Key Quotes

> "所有PCH生来平等，但贵的PCH更平等一些。"

> "说引脚不够用，为什么电源和地占据了几乎一半引脚"

> "同样1151 socket，从Kabylake到Coffeelake什么变了，为什么"

> "更多BIOS知识尽在BIOS培训云课堂"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/为什么不把南桥集成进CPU？CPU和南桥芯片中什么资源最珍贵？.md) [[../../raw/tech/soc-pm/为什么不把南桥集成进CPU？CPU和南桥芯片中什么资源最珍贵？.md|原始文章]]
