---
title: "如何像搭积木一样构建CPU？Intel和AMD都是怎么做的？"
source: "https://zhuanlan.zhihu.com/p/43768401"
author:
  - "[[老狼​新知答主]]"
published:
created: 2026-05-02
description: "当年Intel推出第一款双核CPU的时候，AMD曾经嘲笑它是个胶水双核。然而时至今日，MCM（Multi-Chip-Module）概念洗去风尘，变得妖娆多姿起来，相对来说大核（monolithic die）却变得面目可憎，AMD和Intel都推出了MCM…"
tags:
  - "clippings"
---
[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog)

sazc、一刀 等 875 人赞同了该文章

当年Intel推出第一款双核CPU的时候，AMD曾经嘲笑它是个胶水双核。然而时至今日， [MCM](https://zhida.zhihu.com/search?content_id=8788134&content_type=Article&match_order=1&q=MCM&zhida_source=entity) （Multi-Chip-Module）概念洗去风尘，变得妖娆多姿起来，相对来说大核（ [monolithic die](https://zhida.zhihu.com/search?content_id=8788134&content_type=Article&match_order=1&q=monolithic+die&zhida_source=entity) ）却变得面目可憎，AMD和Intel都推出了MCM的CPU。发生了什么？什么导致了这种转变？MCM都有什么优点和缺点？Intel和AMD的现有产品都有哪些特点？未来的方向在哪里呢？

## 为什么要转向MCM？

当我们掀起CPU上面那个金属盖头，一个小小的独立世界就展现了出来。

![](https://pic1.zhimg.com/v2-2f217d591295c0e0e713cb8c40bb2bba_1440w.jpg)

绿色的是基板（substrate），可以看作一个小型的电路板；居于正中的就是CPU的心脏和大脑：Die；整个CPU构成了一个Package。图示是个典型的大核设计（monolithic die），它只有一个Die，所有重要电路都在Die里面。它的优点是明显的：Die内部的总线速度非常快，同时功耗很低，我们叫它片内总线。在Intel CPU片内总线原来是Ring Bus，在Skylake后改为Mesh:

![](https://picx.zhimg.com/v2-52d0a3a8a0e9ea83fd0124ab59f51881_1440w.jpg)

![](https://pic3.zhimg.com/v2-f94dd2ec0927e2ec00fe056c46ff0008_1440w.jpg)

它的缺点也十分明显：

I： 为了加入更多的内核，Die的大小会越涨越大，而在Die越大，良品率就越低，成本也越高。我在这篇文章详细介绍了Die大小和良品率的关系：

II：内核的各个IP必须统一生产工艺，灵活性很低，TTM时间较长。

这些缺点在核战争愈演愈烈的今天，严重限制了CPU内核的增长。于是在CPU Package内部引入MCM很自然的被提上了日程。

## 如何在Package内搭建异构部件

我们已经在市场上见到不少MCM的CPU，包括AMD的Threadripper和 [EPYC](https://zhida.zhihu.com/search?content_id=8788134&content_type=Article&match_order=1&q=EPYC&zhida_source=entity) 、Intel的 [Kaby Lake G](https://zhida.zhihu.com/search?content_id=8788134&content_type=Article&match_order=1&q=Kaby+Lake+G&zhida_source=entity) 和 [Knights Landing](https://zhida.zhihu.com/search?content_id=8788134&content_type=Article&match_order=1&q=Knights+Landing&zhida_source=entity) 。GPU也有使用了相关技术的，包括Nvidia的 [Volta](https://zhida.zhihu.com/search?content_id=8788134&content_type=Article&match_order=1&q=Volta&zhida_source=entity) 和AMD的 [Vega](https://zhida.zhihu.com/search?content_id=8788134&content_type=Article&match_order=1&q=Vega&zhida_source=entity) 。Intel的 [Stratix 10 FPGA](https://zhida.zhihu.com/search?content_id=8788134&content_type=Article&match_order=1&q=Stratix+10+FPGA&zhida_source=entity) 也使用了相关技术。

目前在Package内部建构MCM有三种技术。我们来看分别了解一下这些技术，和现实中的产品都使用了那个技术。

**1\. 传统多芯片封装技术**

传统的技术比较简单粗暴：

![](https://picx.zhimg.com/v2-16456f239f55363ae915d558a3b66803_1440w.jpg)

Die之间的通讯通过在基板内布置电路来解决。这时基板就像一个小型的PCB板，只是规模较小罢了。这种技术由来已久，本身CPU设计就包括Package电路设计。这样设计的SOC形式的CPU比较多，也相对成熟，比较典型的是Intel将CPU和南桥集成到一个CPU Package的SOC和AMD的Threadripper和EPYC。 它简单可靠，但缺点十分明显：集成密度很低，难以形成大规模连接从而限制了集成IP的个数。我们举个例子来看一下，EYPC:

![](https://pic2.zhimg.com/v2-445e2d687624ebb89db2294da2ee683f_1440w.jpg)

在一个Package上集成了4个Zeppelin die，它们之间用Infinity Fabric连接在一起：

![](https://pic4.zhimg.com/v2-76622a6ad18431a90bf003eb40b0fc81_1440w.jpg)

我们知道Infinity Fabric是片间总线，一般会做到主板上，在这里被做到了package里面，使得Package更像一个小型的主板。我们来看一下透视照：

![](https://pic2.zhimg.com/v2-dc411828c2ad8c06031d6f8a57f52dd7_1440w.jpg)

布线密密麻麻。这也就解释了EPYC的package为什么这么大，Die之间为什么间距如此之远。因为集成度如此之低，再向EPYC CPU内部嵌入内存等等其他高速复杂总线几乎是不可能的了。

**2\. 借助硅中阶层**

在基底和Die之间加入一层硅中介层（silicon interposer）可以帮助我们解决传统MCM技术的低集成度弊病：

![](https://picx.zhimg.com/v2-bc7a53114f79f35ab8b73916662a7c51_1440w.jpg)

一层薄薄的中介层被加入基底核Die之间，起到承上启下的作用。Die和Die之间的通讯可以通过中介层链接，从而提高Package的集成度。中介层目前有两种形式：

1. Passive interposer。一种2.5D封装形式，interposer里面只有电路。
2. Active interposer。一种3D封装形式，interposer里面除了有电路还可以有其他器件。

但它也有自己的问题：

I. 硅中介层会增加Package厚度。

II. interposer增加额外的成本，尤其是interposer必须很大，如图那样，面积包含所有的Die，大大增加成本。

III. 最重要的问题是，Die的所有连接必须全部通过interposer，包括不需要Die到Die通讯的信号：

![](https://picx.zhimg.com/v2-5cf598128495eb2a98d425836657c5fb_1440w.jpg)

而这些信号需要在interposer打过孔（Through Silicon Vias ，TSVs），大大增加CPU制作成本很工序。

AMD目前走的就是这个方向。

**3\. 通过EMIB（Embedded Multi-die Interconnect Bridge）**

EMIB是Intel在2014年就提出来的"新"技术，并在2017年IDF上进行了推广，详见参考资料：

![](https://pica.zhimg.com/v2-c39f96b7c7324a6bf25e9a8189bfd54c_1440w.jpg)

通过在基底嵌入一层薄薄的Silicon Bridge，它解决了硅中介层的很多问题：

I. 它没有硅中介层，不会增加Package厚度，可以用于超薄本等对厚度要求比较高的产品中。

II. 只有Die到Die的通讯需要通过Silicon Bridge，其他信号不受影响，不需要TSVs：

![](https://picx.zhimg.com/v2-80b68ff535be6e5f0deb6b7b4fd44243_1440w.jpg)

III. 没有硅中介层，降低成本，减少工序。

IV. 没有一个需要面积包含所有Die的硅中介，没有Die大小的限制。

V. 最重要的是EMIB可以让Die直接的距离减小到100微米级别，可以大大减小die和die传输损耗的电力，提高传输速度，甚至可以采取并行信号降低延迟：

![](https://pic3.zhimg.com/v2-64c96a52936dd14dd4826c87b18d72b8_1440w.jpg)

Intel的Stratix 10 FPGA就使用了EMIB:

![](https://pic4.zhimg.com/v2-f65388211579192dd47f3d0f1640f85b_1440w.jpg)

有没有混用这些技术的呢？还真有，Intel的Kaby Lake G内嵌了AMD Radeon GPU，为了保证GPU和HBM内存的高带宽和低延迟，要尽量靠近GPU和HBM，它们之间就采用了EMIB。而CPU和GPU直接则用传统的第一种在基板里面走长线的形式：

![](https://pic2.zhimg.com/v2-c59c42c59c06a20a3979984a5d71f6f3_1440w.jpg)

这就解释了为什么Kaby Lake G看起来左右距离十分不均匀：

![](https://pic4.zhimg.com/v2-025614d7260782fa68cfdc251e912e1f_1440w.jpg)

没有硅中介的Kaby Lake G十分的薄，完全可以放入超薄本中去。

## 结语

EMIB技术可以完全解耦Package中各个Die的依赖关系，10nm, 14nm甚至22nm完全可以共存到一个pacakge里面

![](https://pic3.zhimg.com/v2-f73a92341e180b7cacf97b2da64f1eb6_1440w.jpg)

同时借助UIB和AIB等SiP标准界面，完全可以像搭积木一样构建灵活的未来CPU结构。内核数量不够？多来几块Die就好了。相信在未来，我们会看到越拉越多的使用EMIB的产品。

**其他CPU硬件文章：**

更多CPU电源管理的文章：

欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。同时欢迎大家给本专栏和公众号投稿！

![](https://pica.zhimg.com/v2-45479ebdd2351fcdcfb0771bd06fff3a_1440w.jpg)

用微信扫描二维码加入UEFIBlog公众号

## 参考资料：

\[1\]: [Intel Custom Foundry EMIB](https://link.zhihu.com/?target=https%3A//www.intel.com/content/www/us/en/foundry/emib.html)

\[2\]: [intel.com/content/dam/w](https://link.zhihu.com/?target=https%3A//www.intel.com/content/dam/www/programmable/us/en/pdfs/literature/wp/wp-01251-enabling-nextgen-with-3d-system-in-package.pdf)

还没有人送礼物，鼓励一下作者吧

发布于 2018-09-05 15:15[IC设计求职者梦寐以求的流片项目，终于找到了！](https://zhuanlan.zhihu.com/p/702152453)

[

多一个流片项目，多一份经验，就多一份竞争力，求职乃至于谈薪的时候就多一份胜算和底气。 这句话来自一位复旦科班的求职者；不知从什么时候开始，企业的招聘要求中出现了一条：有项目...

](https://zhuanlan.zhihu.com/p/702152453)