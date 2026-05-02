---
title: "L1，L2，L3 Cache究竟在哪里？"
source: "https://zhuanlan.zhihu.com/p/31422201"
author:
  - "[[老狼​新知答主]]"
published:
created: 2026-05-02
description: "很多人有个疑问，为什么Intel系列CPU在2005年后可以力压AMD十多年？优秀的Cache设计和卓越的微架构是主要的原因。大多数高层程序员认为 Cache 是透明的，CPU可以很聪明地安排他们书写的程序，不需要关心数据是在内…"
tags:
  - "clippings"
---
[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog)

知乎用户mnZAy1、老石 等 2424 人赞同了该文章

很多人有个疑问，为什么Intel系列CPU在2005年后可以力压AMD十多年？优秀的Cache设计和卓越的微架构是主要的原因。大多数高层程序员认为 Cache 是透明的，CPU可以很聪明地安排他们书写的程序，不需要关心数据是在内存中还是在Cache里。 他们也许是对的，大部分时间Cache都可以安静的工作。但对于操作系统、编译软件、固件工程师和硬件工程师来说，Cache则需要我们特别关照。现在越来越多的数据库软件和人工智能引擎也对Cache越来越敏感，需要针对性地优化。Cache设计和相关知识从而不再是阳春白雪，你也许某一天就会需要了解它。

本系列希望通过将Cache相关领域知识点拆解成大家关心的几个问题，来串起相关内容。这些问题包括：

1. Cache究竟在哪里？
2. [Cache是怎么组织和工作的？什么是n-ways Set-Associative Cache?](https://zhuanlan.zhihu.com/p/31859105)
3. 什么是 [Cache Coloring](https://zhida.zhihu.com/search?content_id=4757500&content_type=Article&match_order=1&q=Cache+Coloring&zhida_source=entity) (Page Coloring)? 什么是Inclusive Cache或者 [Exclusive Cache](https://zhida.zhihu.com/search?content_id=4757500&content_type=Article&match_order=1&q=Exclusive+Cache&zhida_source=entity)?
4. [Cache line淘汰算法](https://zhida.zhihu.com/search?content_id=4757500&content_type=Article&match_order=1&q=Cache+line%E6%B7%98%E6%B1%B0%E7%AE%97%E6%B3%95&zhida_source=entity) 有哪些？
5. [Cache为什么有那么多级？为什么一级比一级大？是不是Cache越大越好？](https://zhuanlan.zhihu.com/p/32058808)
6. [Cache的一致性是怎么保证的](https://zhuanlan.zhihu.com/p/63494668) ？
7. Cache的属性是谁设定的，怎么设定的？

下面是本系列的第一篇。

## 什么是Cache?

Cache Memory也被称为Cache，是存储器子系统的组成部分，存放着程序经常使用的指令和数据，这就是Cache的传统定义。从广义的角度上看，Cache是快设备为了缓解访问慢设备延时的预留的Buffer，从而可以在掩盖访问延时的同时，尽可能地提高数据传输率。 快和慢是一个相对概念，与微架构(Microarchitecture)中的 L1/L2/ [L3 Cache](https://zhida.zhihu.com/search?content_id=4757500&content_type=Article&match_order=1&q=L3+Cache&zhida_source=entity) 相比， [DDR内存](https://zhida.zhihu.com/search?content_id=4757500&content_type=Article&match_order=1&q=DDR%E5%86%85%E5%AD%98&zhida_source=entity) 是一个慢速设备；在磁盘 I/O 系统中，DDR却是快速设备，在磁盘 I/O 系统中，仍在使用DDR内存作为磁介质的Cache。在一个微架构中，除了有L1/L2/L3 Cache之外，用于虚实地址转换的各级 [TLB](https://zhida.zhihu.com/search?content_id=4757500&content_type=Article&match_order=1&q=TLB&zhida_source=entity) ， [MOB](https://zhida.zhihu.com/search?content_id=4757500&content_type=Article&match_order=1&q=MOB&zhida_source=entity) ( Memory Ordering Buffers)、在指令流水线中的 [ROB](https://zhida.zhihu.com/search?content_id=4757500&content_type=Article&match_order=1&q=ROB&zhida_source=entity) ， [Register File](https://zhida.zhihu.com/search?content_id=4757500&content_type=Article&match_order=1&q=Register+File&zhida_source=entity) 和 [BTB](https://zhida.zhihu.com/search?content_id=4757500&content_type=Article&match_order=1&q=BTB&zhida_source=entity) 等等也是一种Cache。我们这里的Cache，是狭义 Cache，是CPU流水线和主存储器的 L1/L2/L3 Cache。

## Cache在哪里呢？

也许很多人会不假思索的说：“在CPU内核里。”Not so fast！它也有可能在主板上！我们先来了解一下Cache的历史。

- PC-AT/XT和286时代：没有Cache，CPU和内存都很慢，CPU直接访问内存。
- 386时代：CPU速度开始和内存速度不匹配了。为了能够加速内存访问，芯片组增加了对快速内存的支持，这也是在电脑上第一次出现Cache（尽管IBM 360 model系统上已经出现很久了），也是L1（一级Cache）的雏形。这个Cache是可选的，低端主板并没有它，从而性能受到很大影响。而高级主板则带有64KB，甚至高端大气上档次的128KB Cache，在当时也是可以笑傲江湖了。当时的Cache都是Write-Through，即Cache内容的更新都会立刻写回内存中。
- 486时代：Intel在CPU里面加入了8KB的 [L1 Cache](https://zhida.zhihu.com/search?content_id=4757500&content_type=Article&match_order=1&q=L1+Cache&zhida_source=entity) ，当时也叫做内部Cache。它在当时是Unified Cache，就是不分代码和数据，都存在一起。原先在386上面的Cache，变成了L2，也被叫做外部Cache。大小从128KB到256KB不等。这时增加了Write-back的Cache属性，即Cache内容更改后不立刻更新内存，而是在Cache miss的时候再更新，避免了不必要的更新。
![](https://picx.zhimg.com/v2-c5d059e74aa8265ada74a9bcec658001_1440w.jpg)

- 586/Pentium-1时代：L1 Cache被一分为二，分为Code和data，各自8KB。这是因为code和data的更新策略并不相同，而且因为CISC的变长指令，code cache要做特殊优化。与此同时L2还被放在主板上。后期Intel推出了 [Pentium Pro](https://link.zhihu.com/?target=http%3A//en.wikipedia.org/wiki/Pentium_Pro) ('80686')，L2被放入到CPU的Package上：
![](https://pic1.zhimg.com/v2-0a00b2bdb4e27615e1ab918e09fa8546_1440w.jpg)

- 奔腾2/3：变化不大，L2还在CPU Die外面，只是容量大了不少。
![](https://pic1.zhimg.com/v2-27119841a945f4f65feedd1f6f278720_1440w.jpg)

- 奔腾4/奔腾D：L2被放入到了Die里面。这就和现在的L1和L2很相像了，问题来了，多内核呢？第一代奔腾D双核中，L1和L2被两个Die各自占据。Netburst的Pentium 4 Extreme Edition高端版甚至加入L3。但在后期与HT一起随着 [Netburst架构](https://zhida.zhihu.com/search?content_id=4757500&content_type=Article&match_order=1&q=Netburst%E6%9E%B6%E6%9E%84&zhida_source=entity) 被放弃。
- Core/Core2：巨大的变化发生在L2，L2变成多核共享模式：
![](https://pic3.zhimg.com/v2-cd11ef0fcf50b3a122cc2c86ae7fea8c_1440w.jpg)

- 现在：L3被加入到CPU Die中，它在逻辑上是共享模式。而L2则被每个Core单独占据。这时L2也常被指做 **MLC** （Middle Level Cache），而L3也被叫做 **LLC** （Last Level Cache）：
![](https://pic4.zhimg.com/v2-16ada06ec2a01cad09cc4d3c0fcc4b81_1440w.jpg)

- Haswell/Broadwell:在Iris系列中，一块高速DRAM被放入Package中，叫做 [eDRAM](https://zhida.zhihu.com/search?content_id=4757500&content_type=Article&match_order=1&q=eDRAM&zhida_source=entity) 。
![](https://pic2.zhimg.com/v2-a2e2b5846696660f84c15df14f8b8b55_1440w.jpg)

它在平时可以做显存。也可以被设定为L4缓存：

![](https://pic1.zhimg.com/v2-dada31c65af46f4b82bfe3e8ed63fd32_1440w.jpg)

## Cache速度比内存速度快多少？

大家都知道内存都是DRAM，但对Cache是怎么组成就所知不多了。Cache是由CAM（Content Addressable Memory ）为主体的tag和SRAM组成的。我们今后在系列文章中会详细介绍CAM的组成，这里简单比较一下DRAM和SRAM。DRAM组成很简单：

![](https://picx.zhimg.com/v2-81eb423b81c9cdfb08e15a9cfef631c7_1440w.jpg)

DRAM

只有一个晶体管和一个电容。而SRAM就复杂多了,一个简化的例子：

![](https://picx.zhimg.com/v2-7056f546c21dfa14654990a6b9f7c109_1440w.jpg)

SRAM

需要6个晶体管。一个简单的比较如下：

![](https://pic3.zhimg.com/v2-716fc9fb477660645f8abee928897de4_1440w.jpg)

那么速度差距多大呢？各级Cache的延迟差距很大，如下图：

![](https://pic3.zhimg.com/v2-ce714e2a5ec81adbe545bc88152e6888_1440w.jpg)

可以看到延迟最低的是Registers和MOB（Memory Ordering Buffers），L1的延迟和CPU core在一个数量级之内（注意这里并不能简单的认为L1就是3个Cycle，因为有pre-fetch），而DRAM延迟是它的60多倍。

## 结论

说Cache在CPU的Die里面在现在绝大多数情况下都是正确的。最新Intel的optane内存会让普通DRAM作为cache，而自己作为真正内存，从而组成两级memory( L2 memory)，为这个结构平添了一些变数。细心的读者也许会发现，Cache演变总的来说级数在增加，新加入的层级在位置上总是出现在外层，逐渐向内部靠近。Cache的设计是CPU设计的重要内容之一，我们会在今后的文章中为大家详细介绍。

**Cache其他文章：**

## 后记

- 如何知道自己CPU的L2、L3的容量多大呢？当然可以用CPU-z，但其实可以有个更加简单的办法，在命令行输入：
```
wmic cpu get L2CacheSize,L3CacheSize
```

我的笔记本得到这个结果：

![](https://pic2.zhimg.com/v2-732163a984cc8da79538134da998f6f5_1440w.jpg)

- 想体验一下不要Cache的极限慢速吗？很多BIOS都有设置，可以关掉cache：
![](https://pic3.zhimg.com/v2-3c7b633ad4d2d1f90348b7c8361318c8_1440w.jpg)

**BIOS培训云课堂** ：

欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。

![](https://pica.zhimg.com/v2-45479ebdd2351fcdcfb0771bd06fff3a_1440w.jpg)

用微信扫描二维码加入UEFIBlog公众号

13 人已送礼物

编辑于 2021-05-06 16:02[硬件](https://www.zhihu.com/topic/19559524)[26年4月，NAS选购指南丨绿联、群晖、极空间、威联通、华为丨一网打尽，各种玩法丨PT下载、影音、公网IP、硬盘丨NAS存储清单选购](https://zhuanlan.zhihu.com/p/343824994)

[

大家好，我是加勒比考斯！考斯之前是媒体记者，后面是NAS从业人员，知道行业最深内幕！ \[图片\] NAS动态篇31、...

](https://zhuanlan.zhihu.com/p/343824994)