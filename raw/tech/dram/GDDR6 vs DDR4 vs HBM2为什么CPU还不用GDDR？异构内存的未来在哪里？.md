---
title: "GDDR6 vs DDR4 vs HBM2?为什么CPU还不用GDDR？异构内存的未来在哪里？"
source: "https://zhuanlan.zhihu.com/p/83935084"
author:
  - "[[老狼​新知答主]]"
published:
created: 2026-05-02
description: "经常有网友问“GPU都DDR6了为什么CPU还在用DDR4?”，如果简单的回答说你漏看了一个G字，似乎并不能令人满意。问题接踵而来，GDDR6比DDR4如何？6这个数字显然看起来比4牛了不少。如果我们用一个用于GPU，一个用于CP…"
tags:
  - "clippings"
---
[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog)

公园野鸭 等 1185 人赞同了该文章

经常有网友问“GPU都DDR6了为什么CPU还在用DDR4?”，如果简单的回答说你漏看了一个G字，似乎并不能令人满意。问题接踵而来， [GDDR6](https://zhida.zhihu.com/search?content_id=106781696&content_type=Article&match_order=1&q=GDDR6&zhida_source=entity) 比DDR4如何？6这个数字显然看起来比4牛了不少。如果我们用一个用于GPU，一个用于CPU来分野，也似乎十分苍白。DDR可以用于显卡。同一个GPU核心，往往低端显卡用DDR内存，高端用GDDR内存，再高端用HMB2内存；GDDR也可以用于主存。PS4和Xbox One用了同样的AMD CPU，但一个用了GDDR，另一个用了DDR。GDDR和DDR的应用场景模糊了起来，那么是什么原因，为什么电脑主存都是DDR，而显存大多是GDDR？

尽管GDDR6的6说明不了什么，但如果我们来观察市面上最新的内存产品：GDDR6和DDR4，就会发现GDDR6似乎占尽优势。脱胎于DDR3的GDDR5/GDDR5x和GDDR6以高带宽著称，同时功耗也相当低，更加省电：

![](https://pic2.zhimg.com/v2-a7a5d44377b685f947aaf7b7d2005d7f_1440w.jpg)

来源：三星

（注：LP4是指LPDDR4）

似乎暗示我们GDDR才是未来的发展方向，是这样吗？答案是否定的。为了让大家知其然，也知其所以然，我将GDDR的冤家 [HBM2](https://zhida.zhihu.com/search?content_id=106781696&content_type=Article&match_order=1&q=HBM2&zhida_source=entity) 也放进来，来个一锅炖，综合介绍一下他们的区别。对技术不感兴趣的同学可以直接看结论部分。

本专栏已经介绍了大量的DDR相关内容，篇幅所限，不再重复。没有看过的同学可以移步这里，它们是读懂本文的基础：

我们重点放在GDDR和HMB的技术细节，以及和它们和DDR的比较。

## GDDR5/GDDR5x/GDDR6

GDDR3已DDR3为基础，慢慢发展到GDDR6，已立四代。名字里面的G字，表明了它是为了显示优化而来。它的内存颗粒区别于DDR的DRAM，叫做 **[SGRAM](https://zhida.zhihu.com/search?content_id=106781696&content_type=Article&match_order=1&q=SGRAM&zhida_source=entity)** (synchronous graphics random access memory)。

它的内存访问方式也和DDR（Double Data Rate）一样，在时钟上下沿各采样一次，对得起名字中的Double字样。DDR4也是如此，所以我们看传输率是时钟的两倍：

![](https://picx.zhimg.com/v2-a47082374da076283aa4f711beedf43f_1440w.jpg)

注意红框和篮框部分的比较

但我们看GDDR5的参数就会发现不同：

![](https://pic1.zhimg.com/v2-e0aeaca73529542a7196e4b359fe6868_1440w.jpg)

7Gpbs是1750MHz的4倍而不是2倍，这是怎么回事呢？秘密就隐藏在GDDR对DDR的改变上：引入了 [WCK](https://zhida.zhihu.com/search?content_id=106781696&content_type=Article&match_order=1&q=WCK&zhida_source=entity) /WCK#（word clock），它的速度是CK/CK#的两倍，而数据DQ的采样是在WCK而不是在CK的上升沿和下降沿采样。 **此改动将传输速度凭空提高了一倍，从而主要拉开了和DDR的差距。** 相比差不多的DDR4 1600MHz，只提供3200MT/s，而1750MHz的GDDR5，则提供7000MT/s的传输率。

GDDR5单颗颗粒提供x32的位宽，如上图篮框所示，提供： **7G × 32bit / 8bit = 28GB/s** 的带宽。最高可以达到32GB/s。加上GDDR的控制器Channel往往比DDR多很多，整体传输率是十分大的。

GDDR5x在此基础上引入了 [QDR](https://zhida.zhihu.com/search?content_id=106781696&content_type=Article&match_order=1&q=QDR&zhida_source=entity) （quad data rate）：

![](https://pic3.zhimg.com/v2-0d0ee54ebaac2ef0877788d1da0febac_1440w.jpg)

又在此基础上再次翻倍，在WCK的周期采样四次！严格意义上已经不是DDR了。这让它的传输率可以高达14Gbps（保留上冲16Gps），单颗粒可以高达56GB/s。GDDR6再次提高，最高可以单颗粒提供72GB/s的超高带宽。

GDDR从LPDDR，也就是手机等低功耗设备的标准中吸取了不少内容。这有助于让显存相当省电，电压相对DDR来说更低。

![](https://pic4.zhimg.com/v2-5b32cdfc72fe2ed5d2ddb31722421063_1440w.jpg)

## HBM和HBM2

HBM全称 **High Bandwidth Memory** 。一般一个HBM内存是由4个HBM的Die堆叠形成：

![](https://pic3.zhimg.com/v2-b734cab5d0827ed0960c2a70d7653f18_1440w.jpg)

我们叫做一个Stack。Stack和Stack之间是独立的，各自有自己的地址空间。每个Die都有独立的两个128bit的Channel， **4个Die就有8个Channel总共1024bit的位宽** ！

这样尽管HBM的频率并不高，一般只有500MHz，但也是DDR方式访问，所以带宽总共：

500 × 2 × 1024 / 8 = **128GB/s**

一出现就已经超过了当时的GDDR5x，甚至最新的GDDR6都自叹不如。HBM2更将频率提高一倍，整体 **单Stack带宽高达256GB/s** ！更是从4层Die，变成了8层，容量可以更大：

![](https://pic3.zhimg.com/v2-dd804cedd015099d34dae65a8a4e6708_1440w.jpg)

来源：三星

像不像三星自己的开发大楼？:)

![](https://pica.zhimg.com/v2-4d28ce6e1b8924d28139a0ed019494ce_1440w.jpg)

HBM还有个优势是封装相当小，同样容量比GDDR6小很多，这就是3D封装的好处：

![](https://pica.zhimg.com/v2-1c3829c54dd719d8e6fa33522ed88156_1440w.jpg)

注意GDDR5是小b,而HBM2是大B，容量是GDDR的4倍，但更小。小封装让GPU的显卡更小，一个典型的GPU对比：

![](https://pic1.zhimg.com/v2-fadce2553b017c46559de71b1ac94e30_1440w.jpg)

HBM显然更加小巧。我们比较一下两者的带宽：

GDDR5：12 channel ×28GB/s = 336GB/s

HMB: 4 stack × 128 = 512GB/s

![](https://pic2.zhimg.com/v2-1fead0db5c8012a4c3b37e7af780d17d_1440w.jpg)

HMB相对GDDR来说，带宽高，更省电，封装更小，简直完美？那GDDR为啥还存在？

## 为什么DDR和GDDR还存在？HBM有啥弱点？

似乎DDR完全没有存在的必要，较GDDR带宽低功耗高：

![](https://pic2.zhimg.com/v2-a7a5d44377b685f947aaf7b7d2005d7f_1440w.jpg)

而我们知道DDR不仅活着还在紧锣密鼓的张罗马上就要上市的DDR5，这是为什么呢？GDDR为了图像显示和渲染，带宽很大，更省电，但有四个重要的缺点：

1.延迟高。也就是CAS的Latency高，这让GDDR更适合图像处理这种高并发的，大块搬移内存的操作。而像CPU这种几乎完全随机的访问，延迟更加重要。

2.容量小。从这篇文章：

我们知道 X几对内存容量是十分重要的。GDDR一般X32甚至X64，不容易组成大容量内存。

3.价格贵。工艺要求高，时序复杂，更贵。

4\. 不适合CPU cacheline。这个我就不展开讲了，大家可以参考我讲的为什么DDR4是8n prefech来考虑这个问题。

HBM的缺点呢？那就是更贵，贵的多。堆叠技术让传输速度快，信号质量好，更近更省电，但1024个bit的位宽是个大麻烦：

![](https://pic3.zhimg.com/v2-d0a9f4bdac8d67e8dcdc9492fb718728_1440w.jpg)

注意 [TSV](https://zhida.zhihu.com/search?content_id=106781696&content_type=Article&match_order=1&q=TSV&zhida_source=entity) ，也叫做硅通道。它负责穿透堆叠的Die来传输数据和信号。别看示意图中就几个，实际上1024个bit的位宽这种通道可以达到超过4000个！制作工艺十分复杂。也很贵，这是HBM不能铺开的最主要原因。

## 结论

东西虽好也怕贵啊，只有合适的才是最好的。HBM虽好，但是太贵了。DDR还是会存在相当长的一段时间。但据悉Intel和AMD的CPU都有计划上HBM2，但应该只出现在高端和服务器CPU中。

![](https://pic4.zhimg.com/v2-d4745f8598e3f85ff30e331613ee07e1_1440w.jpg)

如果引入HBM在内存系统中，加上DIMM类型的 [傲腾内存](https://zhida.zhihu.com/search?content_id=106781696&content_type=Article&match_order=1&q=%E5%82%B2%E8%85%BE%E5%86%85%E5%AD%98&zhida_source=entity) ，我们就可能有三种内存共存的情况，每种内存都有自己的好处：HBM快，但是少；DDR内存多些，居中；傲腾内存最慢，但是容量大，而且内容不会丢失。三种内存可以形成互相cache的关系，也可以都报告给操作系统，让操作系统根据它们的特性和任务的特性，来主动选择具体存在哪里。如此，就形成了异构内存系统，这是内存发展的方向。

其他内存相关文章：

欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。

![](https://pica.zhimg.com/v2-121ecd3d4080deb1c557bf47dc00d246_1440w.jpg)

用微信扫描二维码加入UEFIBlog公众号

1 人已送礼物

编辑于 2019-11-10 11:43[IC设计初学入门指南！内含学习资料~](https://zhuanlan.zhihu.com/p/698268202)

[

芯片设计行业高门槛、高要求、高薪资，但没有具体了解这个门槛和要求到底有多高。 以芯片设计校招来看，基本都是要求硕士起步。 再说知识储备，数电模电、数集模集是基础中的基础，模块/...

](https://zhuanlan.zhihu.com/p/698268202)