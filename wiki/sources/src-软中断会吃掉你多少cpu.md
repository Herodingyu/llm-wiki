---
doc_id: src-软中断会吃掉你多少cpu
title: 软中断会吃掉你多少CPU？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/软中断会吃掉你多少CPU？.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 开发内功修炼](https://www.zhihu.com/column/c_1147478886047719424) 81 人赞同了该文章 前面的几篇文章里讨论过了 [进程上下文切换](https://zhida.zhihu.com/search?content_id=106021619&content_type=Article&match_order=1&q=%E8%BF%9B%E7%A8%8B%E4%B8%8A%E4%B8%8B%E6%96%87%E5%88%87%E6%8D%A2&zhida_source=entity) 和 [系统调用](https://zhida.zh

## Key Points

### 1. 软中断的诞生
CPU正常情况下都是专心处理用户的进程的，当外部的硬件或软件有消息想要通知CPU，就会通过 **中断请求（interrupt request，IRQ）** 的方式来进行。比如当你的鼠标有了点击产生，再比如磁盘设备完成了数据的读取的时候，都会通过中断通知CPU工作已完成。

### 2. 软中断开销估算
前面大致介绍了软中断的来龙去脉，好了直接进入本文的主题上，软中断开销到底多大。好了，请跟我来一起计算： 1） 查看软中断总耗时 首先用top命令可以看出每个核上软中断的开销占比，是在si列 ``` top

### 3. 软中断的上下文切换
前文我们计算出了一个相对比较精确的开销时间。这个时间里其实包含两部分，一是上下文切换开销，二是软中断内核执行开销。 其中上下文切换和系统调用、进程上下文切换有很多相似的地方。让我们将他们进行一个简单的对比：

### 4. 1.和系统调用开销对比
《深入理解Linux内核-第五章》开头的一句话，很形象地把中断和系统调用两个不相关的概念联系了起来，巧妙地找到了这二者之间的相似处。“你可以把内核看做是不断对请求进行响应的服务器，这些请求可能来自在CPU上执行的进程，也可能来自发出中断的外部设备。老板的请求相当于中断，而顾客的请求相当于用户态进程发出的系统调用”。

### 5. 2.和进程上下文切换开销对比
和进程上下文切换比较起来，进程上下文切换是从用户进程A切换到了用户进程B。而软中断切换是从用户进程A切换到了内核线程ksoftirqd上。 而ksoftirqd作为一个内核控制路径，其处理程序比一个用户进程要轻量，所以上下文切换开销相对比进程切换要稍一些。大家感兴趣的，可以继续阅读《深入理解Linux内核》的-第五章。

## Evidence

- Source: [原始文章](raw/tech/bsp/软中断会吃掉你多少CPU？.md) [[../../raw/tech/bsp/软中断会吃掉你多少CPU？.md|原始文章]]

## Key Quotes

> "中断请求（interrupt request，IRQ）"

> "软中断消耗的CPU周期相对比硬中断要多不少"

> "从实验数据来看，一次软中断CPU开销大约3.4us左右"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/软中断会吃掉你多少CPU？.md) [[../../raw/tech/bsp/软中断会吃掉你多少CPU？.md|原始文章]]
