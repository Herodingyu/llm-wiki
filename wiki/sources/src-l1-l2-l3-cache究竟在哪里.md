---
doc_id: src-l1-l2-l3-cache究竟在哪里
title: L1，L2，L3 Cache究竟在哪里？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/L1，L2，L3 Cache究竟在哪里？.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) 知乎用户mnZAy1、老石 等 2424 人赞同了该文章 很多人有个疑问，为什么Intel系列CPU在2005年后可以力压AMD十多年？优秀的Cache设计和卓越的微架构是主要的原因。大多数高层程序员认为 Cache 是透明的，CPU可以很聪明地安排他们书写的程序，不需要关心数据是在内存中还是在Cache里。 他们也许是对的，大部分时间Cache都可以安静的工作。但对于操作系统、编译软件、固件工程师和硬件工程师来说，Cache则需要我们特别关照。现在越来越多的数据库软件和人工智

## Key Points

### 1. 什么是Cache?
Cache Memory也被称为Cache，是存储器子系统的组成部分，存放着程序经常使用的指令和数据，这就是Cache的传统定义。从广义的角度上看，Cache是快设备为了缓解访问慢设备延时的预留的Buffer，从而可以在掩盖访问延时的同时，尽可能地提高数据传输率。 快和慢是一个相对概念，与微架构(Microarchitecture)中的 L1/L2/ [L3 Cache](https://zhid

### 2. Cache在哪里呢？
也许很多人会不假思索的说：“在CPU内核里。”Not so fast！它也有可能在主板上！我们先来了解一下Cache的历史。 - PC-AT/XT和286时代：没有Cache，CPU和内存都很慢，CPU直接访问内存。

### 3. Cache速度比内存速度快多少？
大家都知道内存都是DRAM，但对Cache是怎么组成就所知不多了。Cache是由CAM（Content Addressable Memory ）为主体的tag和SRAM组成的。我们今后在系列文章中会详细介绍CAM的组成，这里简单比较一下DRAM和SRAM。DRAM组成很简单：

### 4. 结论
说Cache在CPU的Die里面在现在绝大多数情况下都是正确的。最新Intel的optane内存会让普通DRAM作为cache，而自己作为真正内存，从而组成两级memory( L2 memory)，为这个结构平添了一些变数。细心的读者也许会发现，Cache演变总的来说级数在增加，新加入的层级在位置上总是出现在外层，逐渐向内部靠近。Cache的设计是CPU设计的重要内容之一，我们会在今后的文章中为大

### 5. 后记
- 如何知道自己CPU的L2、L3的容量多大呢？当然可以用CPU-z，但其实可以有个更加简单的办法，在命令行输入： ``` wmic cpu get L2CacheSize,L3CacheSize ```

## Evidence

- Source: [原始文章](raw/tech/soc-pm/L1，L2，L3 Cache究竟在哪里？.md) [[../../raw/tech/soc-pm/L1，L2，L3 Cache究竟在哪里？.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/L1，L2，L3 Cache究竟在哪里？.md) [[../../raw/tech/soc-pm/L1，L2，L3 Cache究竟在哪里？.md|原始文章]]
