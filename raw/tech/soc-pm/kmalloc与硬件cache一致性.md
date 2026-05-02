---
title: "kmalloc与硬件cache一致性"
source: "https://zhuanlan.zhihu.com/p/1902711607114576939"
author:
  - "[[PilgrimTaolinux内核从业者，单片机爱好者]]"
published:
created: 2026-05-02
description: "前言看代码时发现下面一句宏定义和注释很有意思，简单翻译一下：“kmalloc() 返回的内存可用于直接内存访问（DMA），所以我们必须确保所有此类分配都是缓存对齐的。否则，无关的代码可能会导致在DMA传输完成之前部…"
tags:
  - "clippings"
---
公园野鸭 等 67 人赞同了该文章

目录

## 前言

看代码时发现下面一句宏定义和注释很有意思，简单翻译一下：“ [kmalloc](https://zhida.zhihu.com/search?content_id=257332367&content_type=Article&match_order=1&q=kmalloc&zhida_source=entity) () 返回的内存可用于直接内存访问（ [DMA](https://zhida.zhihu.com/search?content_id=257332367&content_type=Article&match_order=1&q=DMA&zhida_source=entity) ），所以我们必须确保所有此类分配都是缓存对齐的。否则，无关的代码可能会导致在DMA传输完成之前部分缓冲区被读入cache，从而使CPU看到旧数据。”

![](https://pic4.zhimg.com/v2-fb9d4b9c4805e3be1bac0fd2fdbe0157_1440w.jpg)

在旧版本的kernel中，kmalloc是不能分配小于 [cacheline size](https://zhida.zhihu.com/search?content_id=257332367&content_type=Article&match_order=1&q=cacheline+size&zhida_source=entity) 的内存的

![](https://pic4.zhimg.com/v2-4f417c6d0dbdaaa4e7be07a684955deb_1440w.jpg)

同时我发现在kernel v6.5合入了一组patch： [lkml.kernel.org/r/20230](https://link.zhihu.com/?target=https%3A//lkml.kernel.org/r/20230612153201.554742-12-catalin.marinas%40arm.com)

kernel v6.5之后的版本kmalloc已经没有了cacheline的限制了，这又是为什么呢？接下来我们以这个问题为引子，一起研究一下软件为了应对硬件cache一致性所做的努力。

## DMA写入MEM的cache一致性

1\. CPU读取MEM中的数据，同时将数据缓存到CPU的cache中

![](https://pic1.zhimg.com/v2-c6c7ba55a7e4e3389c3d797e85033da4_1440w.jpg)

2\. DMA将MEM中的数据修改，未通知CPU

![](https://pic3.zhimg.com/v2-8f5f98f7ae860e055451a9ede5c8ef04_1440w.jpg)

3\. CPU再次读取MEM中的数据时，cache命中，会使用上次的老数据，导致逻辑错误

4\. 当前软件同步方法是DMA写入完毕后将CPU cache invalid，当CPU再次读取MEM中的数据时会重新加载cache

![](https://pic1.zhimg.com/v2-0fd85639b52355e918547432a0e8929e_1440w.jpg)

## DMA读取MEM的cache一致性

1\. CPU修改MEM中的数据时，只会将local CPU cache内容修改，MEM中的仍会保留老的数据

![](https://pic3.zhimg.com/v2-3d9781428d29d32d62057b2b1a711fde_1440w.jpg)

2\. DMA读取MEM中的数据时，由于数据未更新，所以DMA会读取到MEM中的老数据

![](https://pic2.zhimg.com/v2-52f178c450630b7df265984419b296f5_1440w.jpg)

3\. 当前软件同步方法是DMA读取前将CPU cache clean，当DMA读取数据时，就是更新后的数据了

![](https://picx.zhimg.com/v2-94ae901ee76914e45fa011e9dc2ef98d_1440w.jpg)

## 现有软件同步机制

这里我列举一下DMA操作的主要同步api

![](https://pic4.zhimg.com/v2-2052b029db53ce07156e4f66497b3f61_1440w.jpg)

从前面的例子，我们做个总结，当需要对DMA和CPU访问做同步时，需要对cache做合理的invalid或者clean操作，当然现有的DMA回调函数便提供这个同步API。

![](https://pic4.zhimg.com/v2-03b786e97663e6a5140c4c017b86d341_1440w.jpg)

## kmalloc为什么要cache line对齐

kmalloc需要考虑cacheline，最直接的原因是，kmalloc分配的内存可能用于DMA操作。

1\. 当A和B两个变量共享一个cache line时，且此时DMA正在改写B变量

![](https://pica.zhimg.com/v2-b83e5c2215fe58c47d18f76deeac4186_1440w.jpg)

2\. 此时CPU的cache中A变量时脏数据需要回写更新MEM

![](https://pic2.zhimg.com/v2-836a1234336eaebb4e8faa89177b0b93_1440w.jpg)

3\. 由于A和B共享CPU cache line，B变量也会同步回写

![](https://pic3.zhimg.com/v2-7512dfb0e505a4113a149d568669f3bc_1440w.jpg)

4\. 此时B变量会把DMA写过的数据覆盖掉，造成B数据错误

![](https://pic4.zhimg.com/v2-125b50ea3c9a82b3bed342d4d5bf2763_1440w.jpg)

历史上碰到这种问题，软件无法靠同步解决，所以为了避免数据错误，必须要求用于DMA的变量保证cache line对齐，以防止多个变量共享cache line。

由于kmalloc分配的内存可能用于DMA，因此我们被迫将所有的kmalloc内存强制cache line对齐，对于ARM架构支持两种cache line（64或128字节），为了兼容导致arm64中的kmalloc最小仅支持128字节分配。这只是一个妥协策略，因为它是以slab浪费为代价保证DMA和cache一致性的

## 社区同步方案

在文章的开头我们变提到过，v6.5之后的kernel已经不需要考虑cache line对齐了，接下来我们来介绍一下它的实现思想。

1\. 当发现DMA访问的数据size小于cache line size，会分配一个符合cache line size的副本B'，然后DMA将数据写入副本中

![](https://pic2.zhimg.com/v2-931509f6e992c647eb38e45187047b2d_1440w.jpg)

2\. 然后CPU将副本B'的内容copy到B中，在此copy之前由于 [MESI协议](https://zhida.zhihu.com/search?content_id=257332367&content_type=Article&match_order=1&q=MESI%E5%8D%8F%E8%AE%AE&zhida_source=entity) 的存在，硬件会先将CPU cache的内容clean

![](https://pic1.zhimg.com/v2-1f9d72a8ec4ff3cbfcea3238993b3bf2_1440w.jpg)

3\. 采用这种策略我们就能保证小于cache line的数据在进行DMA操作时的cache一致性，这个机制的名字叫 [swiotlb](https://zhida.zhihu.com/search?content_id=257332367&content_type=Article&match_order=1&q=swiotlb&zhida_source=entity)

4\. 对于软件的优化流程如下图

![](https://picx.zhimg.com/v2-3b5a616e95cfd5cc08147ffc4b95cad7_1440w.jpg)

## 多核cache一致性

为了保证多核cache数据保持一致，硬件设计引入了一个一致性协议MESI，前面的章节也提到过这个硬件协议，这里我就不详细介绍了，有兴趣的道友可以网上查查，资料很多。

![](https://pic4.zhimg.com/v2-7a7eea1939ddda287d4290369624df43_1440w.jpg)

## 伪共享问题

1\. 在全局变量A和B共享一个cache line的情况下，CPU 1修改全局变量A时，会将A和B缓存在CPU 1的cache中并标记为modified状态

![](https://pic3.zhimg.com/v2-a0857f0d33d8c68f16a891d60c8a49d2_1440w.jpg)

2\. CPU 2修改了全局变量B，会将A和B缓存在CPU 2的cache中并标记为modified状态，并clean掉CPU 1的cahce

![](https://pic4.zhimg.com/v2-647287dda51484efc5b61f832b20451b_1440w.jpg)

3\. CPU 1又修改了全局变量A，会将A和B缓存在CPU 1的cache中并标记为modified状态，并clean掉CPU 2的cahce

![](https://picx.zhimg.com/v2-73cc33bdb8c718cd962988408653ef3f_1440w.jpg)

如此往复，全局变量A和B其实并没有任何的关系，却由于落在同一行cache line的原因导致cache颠簸。

由于CPU数据总线只要8字节，这就意味着理论上所有的全局变量都可能会出现伪共享问题，那为什么内核没有把所有的全局变量都做cache line对齐，以提高性能呢？

因为发生伪共享的条件很苛刻：

kmalloc申请小于cacheline size的空间时，无疑会增加伪共享的概率，但是不用担心，软件必须同时满足上述4个条件才会发生伪共享问题，由于伪共享发生的概率比较低，因此内核定义了如下宏，仅仅在需要的时候将变量定义为 [\_\_cacheline\_aligned](https://zhida.zhihu.com/search?content_id=257332367&content_type=Article&match_order=1&q=__cacheline_aligned&zhida_source=entity) 类型，保持cache line对齐

![](https://picx.zhimg.com/v2-c29817e4f3d3fcda397d286ba7a713f3_1440w.jpg)

举个例子

![](https://picx.zhimg.com/v2-7b18a7a9cbf1be3a5fc33758357f8c39_1440w.jpg)

发布于 2025-05-05 15:56・北京