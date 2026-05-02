---
title: "CPU是如何做体检和分级的？兼论DFx的重要性"
source: "https://zhuanlan.zhihu.com/p/300736239"
author:
  - "[[老狼​新知答主]]"
published:
created: 2026-05-02
description: "前几天去参加公司体检，一大早乌泱泱数百个人冲进体检中心，半个小时后就手捧体重超标的报告出来了，真是高效。想起以前有个同事从来不去体检，怕真发现什么问题，我说他是“讳疾忌医”的典型代表。身体要定期检查…"
tags:
  - "clippings"
---
[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog)

249 人赞同了该文章

前几天去参加公司体检，一大早乌泱泱数百个人冲进体检中心，半个小时后就手捧体重超标的报告出来了，真是高效。想起以前有个同事从来不去体检，怕真发现什么问题，我说他是“讳疾忌医”的典型代表。身体要定期检查，早发现问题，早治疗才好。CPU也一样，从躺在晶圆里面就开始经过一遍遍测试，保证到了我们消费者手中，不会有严重的质量问题。如果我们搜索硅谷的招聘网站，就会发现Intel和AMD在大量招聘 [DFT](https://zhida.zhihu.com/search?content_id=154959800&content_type=Article&match_order=1&q=DFT&zhida_source=entity) 工程师，什么是DFT呢？DFT是Design for Test的缩写，也就是在芯片设计的时候就要考虑芯片测试的问题，在芯片设计的时候就要埋入测试晶体管、电路和接口。芯片测试关系到千万CPU用户的使用体验，产品的成品率和质量。它的另一个有趣的功能是可以做产品分级（ [Classing](https://zhida.zhihu.com/search?content_id=154959800&content_type=Article&match_order=1&q=Classing&zhida_source=entity) ），这样一个产线上出来的CPU内核，可以根据功能良好的CPU内核数量、好Cache的大小、能达到稳定主频的高低等指标，Fuse成不同的Sku，如i5、i7等，卖不同的价格。我在这篇颇受欢迎的文章里面进行了初步介绍：

[![](https://pica.zhimg.com/v2-1b0b7cd0ae09c04e0d40ee619e2e0998.jpg?source=7e7ef6e2&needBackground=1)](https://zhuanlan.zhihu.com/p/29743431)

但有些同学进行了过度解读，甚至认为Intel每一代只有一条产线，这是严重错误的，关于这点我们会在文章的最后讨论。

一个芯片整体制造周期大致如下：

![](https://picx.zhimg.com/v2-bc65214fb76cacb68ffd37696930a967_1440w.jpg)

其中晶圆（Wafer）的制造相当有趣，而掩模（Mask）的制作在这个视频中有所展示，相当高科技：

关于它我们今后再详细讨论，今天的故事就从成品开始：

![](https://pic2.zhimg.com/v2-7c59cbec8824caae4e3c0a64266bfb51_1440w.jpg)

## 芯片封装测试

现代CPU的测试流程如下：

![](https://pic2.zhimg.com/v2-69c04e4fbd1adb4d18db75d5ece635b9_1440w.jpg)

**1.分类（Sort）** ：也叫作 [Wafer test](https://zhida.zhihu.com/search?content_id=154959800&content_type=Article&match_order=1&q=Wafer+test&zhida_source=entity) 。用探针在每个Die外围的接口进行SCAN测试。示意图是这样：

![](https://pic2.zhimg.com/v2-be132cf9d114a6d369048bac64d23323_1440w.jpg)

这个步骤主要发现芯片制造中的各种缺陷。随着制程的提高，芯片制造中的缺陷越来越多，一些典型的缺陷如下面这些：

![](https://pic1.zhimg.com/v2-634be78a957e22018ec9c0557e949be4_1440w.jpg)

空洞缺陷

![](https://pic4.zhimg.com/v2-510a2877a3ce349764433325a0b54fab_1440w.jpg)

断裂，Stringer，短缺缺陷

现在各个公司在设计时在芯片中加入大量测试晶体管、电路和接口，甚至可以在很短时间内检测几乎每个触发器（Flip-flop）的状态。

没有通过检测的Die被标记废弃。出问题的Die少，良品率就高；反之则良品率低。这里 <sup><a href="#ref_1">[1]</a></sup> 有个比较形象的良品率模拟计算器，大家可以填一下缺陷率，直观的观察良品率：

![](https://picx.zhimg.com/v2-6291ed120af4b9179b15c57dec6ea191_1440w.jpg)

看看撒芝麻的效果

**2.切片和封装** ：这一步实际上和测试关系不大，但糟糕的切片和封装会降低成品率

![](https://pica.zhimg.com/v2-4b53e79dbb8696fea982d0b8b80b6e72_1440w.jpg)

![](https://pic4.zhimg.com/v2-d69d21da117d501ab32afb4709801fc5_1440w.jpg)

![](https://pic1.zhimg.com/v2-81a82997942129866d02812232e68334_1440w.jpg)

**3\. 老化测试（Burn-in）** ：芯片的可靠性符合浴缸周期：

![](https://picx.zhimg.com/v2-06bcc379c2c20e9931daa544cb918fe9_1440w.jpg)

CPU在开始使用时,失效率很高（ **早期失效期** ）,但随着产品工作时间的增加,失效率迅速降低。它的原因是由于制造和原材料带来的缺陷。为了尽快度过 **早期失效期，** 把CPU放入高温的环境下洗个澡（heat soaking），并加上高压。这样几个小时就相当于过了好几周。在把CPU拿出来测试，不好的淘汰掉，好的就可以进入浴缸曲线的底部稳定期，才能出货。这个工序叫做老化（Burn-in）测试。关于它的详情，可以参考我的这篇文章：

**4.定级（Class Test）：** 这个步骤已经聚焦在Package层面的测试了。它的主要两个目的：把前面没有发现，但仍然有缺陷的和在老化测试中出了问题的CPU过滤掉。另一个主要目的是为CPU定级。

出了严重问题的CPU前面就会被淘汰掉，但还可以挽救的就靠这一步了。如一部分内核损坏：

![](https://pica.zhimg.com/v2-a564fe5641e5b8c7c03392d3d58ddddc_1440w.jpg)

则标记好的内核；或者一部分Cache损坏，则标记好的Cache；还有一些内核的一部分达不到很高的频率，就标记低频CPU；GPU损坏，就标记无GPU；等等。这些信息最后写在Fuse信息表里，变成了各种各样SKU。这个过程就是 [Binning](https://zhida.zhihu.com/search?content_id=154959800&content_type=Article&match_order=1&q=Binning&zhida_source=entity) 。

**5\. PPV （Produce平台测试）** ：放在主板上进行最后的测试。这是到消费者手前最后一关，但能做的测试非常有限。

## i3/i5/i7全部都是一条产线上出来的吗？

上面的Binning的过程，会让有些同学产生误解，认为所有i3，i5和i7都是一个产线出来的，再Binning成不同的产品。实际上，Intel在每一代都会定义几种不同的SKU，如H，U，Y等等，它们的Die大小本身就是不同的。这个因素，加上Binning的结果，组合成几十种Sku，i3还有部分小核Atom的产品线。实际上，区分i5是Binning的结果，还是设计如此没有太大意义，关键是价格和性能是否符合自己的预期。

## 什么是DFx？

从整个测试流程可以看出，越早发现问题，解决问题的代价越小。出了问题的CPU最好在给到最终客户那里之前就得到充分验证，并提供丰富的手段帮助调试，于是这些总的汇集起来就是DFx，x在这里代表一个集合，它包括： [DFD](https://zhida.zhihu.com/search?content_id=154959800&content_type=Article&match_order=1&q=DFD&zhida_source=entity) 、DFT和 [DFM](https://zhida.zhihu.com/search?content_id=154959800&content_type=Article&match_order=1&q=DFM&zhida_source=entity) ：

1. DFD：design for debug，有额外的电路帮助工程师debug硬件软件问题；可以帮助修正（Workaround）硬件问题。
2. DFT：design for test，额外的电路帮助发现和定位生产过程中的问题和缺陷，做产品测试。
3. DFM：design for Manufactruability，额外的电路去定位良品率的问题，帮助生产。

随着制程的提高，芯片制造中的缺陷越来越多和不可避免，从而DFx的重要性也越来越高。设计良好的DFx，甚至可以减少流片的次数。无怪乎，硅谷从事DFx的人越来越多。我发现国内芯片制造这块重视度不够，pre-silicon的验证也远远不足。也许这里能够发现新的商机！

其他CPU相关文章：

欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。

![](https://pica.zhimg.com/v2-121ecd3d4080deb1c557bf47dc00d246_1440w.jpg)

用微信扫描二维码加入UEFIBlog公众号

## 参考

1. 良品率计算器 [https://caly-technologies.com/die-yield-calculator/](https://caly-technologies.com/die-yield-calculator/)

还没有人送礼物，鼓励一下作者吧

编辑于 2020-11-19 16:59[千元NAS入门首选？绿联DH4300Plus使用体验全解析，内含NAS选购建议](https://zhuanlan.zhihu.com/p/1964042339514315618)

[

一、引言提到NAS，很多人第一反应是“贵”。 大部分品牌的空盘版NAS动辄2000元以上，要是再加上一个4T硬盘，...

](https://zhuanlan.zhihu.com/p/1964042339514315618)