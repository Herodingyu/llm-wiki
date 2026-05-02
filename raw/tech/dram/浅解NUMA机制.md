---
title: "浅解NUMA机制"
source: "https://zhuanlan.zhihu.com/p/67558970"
author:
  - "[[柴可喵斯基云计算｜大学教师]]"
published:
created: 2026-05-02
description: "导读本文适合知道NUMA这个词但想进一步了解的新手。 以下的文章内容包括：NUMA的产生背景，NUMA的架构细节和几个上机演示的例子。 NUMA的诞生背景在NUMA出现之前，CPU朝着高频率的方向发展遇到了天花板，转而向着…"
tags:
  - "clippings"
---
公园野鸭 等 257 人赞同了该文章

## 导读

本文适合知道NUMA这个词但想进一步了解的新手。

以下的文章内容包括：NUMA的产生背景，NUMA的架构细节和几个上机演示的例子。

## NUMA的诞生背景

在NUMA出现之前，CPU朝着高频率的方向发展遇到了天花板，转而向着多核心的方向发展。

在一开始，内存控制器还在北桥中，所有CPU对内存的访问都要通过北桥来完成。此时所有CPU访问内存都是“一致的”，如下图所示：

![](https://pica.zhimg.com/v2-f7b9c88f33850a869d978dc5ebd0d23a_1440w.jpg)

UMA

这样的架构称为UMA(Uniform Memory Access)，直译为“统一内存访问”，这样的架构对软件层面来说非常容易，总线模型保证所有的内存访问是一致的，即 **每个处理器核心共享相同的内存地址空间** 。但随着CPU核心数的增加，这样的架构难免遇到问题，比如对总线的带宽带来挑战、访问同一块内存的冲突问题。为了解决这些问题，有人搞出了NUMA。

## NUMA构架细节

NUMA 全称 Non-Uniform Memory Access，译为“非一致性内存访问”。这种构架下，不同的内存器件和CPU核心从属不同的 Node，每个 Node 都有自己的集成内存控制器（ [IMC](https://zhida.zhihu.com/search?content_id=103142048&content_type=Article&match_order=1&q=IMC&zhida_source=entity) ，Integrated Memory Controller）。

在 Node 内部，架构类似 [SMP](https://zhida.zhihu.com/search?content_id=103142048&content_type=Article&match_order=1&q=SMP&zhida_source=entity) ，使用 IMC Bus 进行不同核心间的通信；不同的 Node 间通过 [QPI](https://zhida.zhihu.com/search?content_id=103142048&content_type=Article&match_order=1&q=QPI&zhida_source=entity) （Quick Path Interconnect）进行通信，如下图所示：

![](https://pic2.zhimg.com/v2-ee9a115806bae6341fc724707e4058cf_1440w.jpg)

NUMA

NUMA

一般来说，一个内存插槽对应一个 Node。需要注意的一个特点是，QPI的延迟要高于IMC Bus，也就是说CPU访问内存有了远近（remote/local）之别，而且实验分析来看，这个 **差别非常明显** 。

在Linux中，对于NUMA有以下几个需要注意的地方：

- 默认情况下，内核不会将内存页面从一个 NUMA Node 迁移到另外一个 NUMA Node；
- 但是有现成的工具可以实现将冷页面迁移到远程（Remote）的节点：NUMA Balancing；
- 关于不同 NUMA Node 上内存页面迁移的规则，社区中有依然有不少争论。

对于初次了解NUMA的人来说，了解到这里就足够了，本文的细节探讨也止步于此，如果想进一步深挖，可以参考开源小站 [这篇文章](https://link.zhihu.com/?target=https%3A//links.jianshu.com/go%3Fto%3Dhttp%253A%252F%252Fwww.litrin.net%252F2017%252F10%252F31%252F%2525E6%2525B7%2525B1%2525E6%25258C%252596numa%252F) 。

## 上机演示

**NUMA Node 分配**

![](https://pic2.zhimg.com/v2-a327d4e9ddb950f2ee60c40b94fc70ff_1440w.jpg)

作者使用的机器中，有两个 NUMA Node，每个节点管理16GB内存。

**NUMA Node 绑定**

Node 和 Node 之间进行通信的代价是不等的，同样是 Remote 节点，其代价可能不一样，这个信息在 node distances 中以一个矩阵的方式展现。

![](https://pic1.zhimg.com/v2-7c7b4ae592b524a963830749194c9a8c_1440w.jpg)

我们可以将一个进程绑定在某个 CPU 或 NUMA Node 的内存上执行，如上图所示。

**NUMA 状态**

![](https://pica.zhimg.com/v2-7cbbde74e5cd6e4ade6aaa58f9aef782_1440w.jpg)

发布于 2019-05-30 19:42