---
title: "DDR3 vs DDR4? 为什么说内存是个很傻的设备？DDR5在哪里？"
source: "https://zhuanlan.zhihu.com/p/62234511"
author:
  - "[[老狼​新知答主]]"
published:
created: 2026-05-02
description: "DDR4已经在市面上好几年了，DDR5的draft也已经起草完毕，它的支持已经在视线可及的地平线上。作为BIOS从业者，可以说内存初始化是BIOS中最重要的部分，也可以说是计算机系统里面最傻的设备。这个“傻”表现在它是…"
tags:
  - "clippings"
---
[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog)

吴建明wujianming、sazc 等 932 人赞同了该文章

DDR4已经在市面上好几年了， [DDR5](https://zhida.zhihu.com/search?content_id=101959450&content_type=Article&match_order=1&q=DDR5&zhida_source=entity) 的draft也已经起草完毕，它的支持已经在视线可及的地平线上。作为 [BIOS](https://zhida.zhihu.com/search?content_id=101959450&content_type=Article&match_order=1&q=BIOS&zhida_source=entity) 从业者，可以说内存初始化是BIOS中最重要的部分，也可以说是计算机系统里面最傻的设备。这个“傻”表现在它是完全被动的，所有活动全部需要 [内存控制器](https://zhida.zhihu.com/search?content_id=101959450&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E6%8E%A7%E5%88%B6%E5%99%A8&zhida_source=entity) 来指挥，自己并没有固件（排除最近的NvDIMM傲腾）。它的傻还表现在为了节约成本，增加容量，核心频率十数年没有提高。毕竟增加逻辑就要增加电路，会费电和提高成本；提高核心频率也会费电和提高成本；所有的一切都是能省则省。为什么这么傻的设备在这个世界还能够存活，我们还可以忍受呢？我今天就从DDR4到底比DDR3强在哪里，DDR5又有些什么特性可以期待来展开讨论。阅读前如果对DDR不了解可以参考这两篇文章：

## DDR3和它的先辈们

可以说DDR4是DDR系列从SDRAM脱胎以来，变化最大的一次。为什么这么说呢？如果我们看DDR3和它的前辈们的演变关系：

![](https://pic3.zhimg.com/v2-34a2e99340255eacb71ad57e5a2b65a0_1440w.jpg)

注意我红框标出的DRAM的核心频率基本不变，传输速度的提高是通过增加prefetch的位数（黄框）来做到的。例如同样是100MHz的核心频率，SDRAM一周期取一次，它和内存控制器的速度是100M T/s（这里的T是传输的意思）；DDR上升沿下降沿各取一次，相当于2次prefetch，Bus速度变成200；DDR2变成4n prefetch，Bus speed变成400；DDR3，照此办理，8n带来了800。MT/s和带宽MB/s的关系参见：

DDRx的核心频率 **一直维持在100Mhz到266MHz** 的水平上，每代速度的提升都是靠 **倍增** [Prefetch](https://zhida.zhihu.com/search?content_id=101959450&content_type=Article&match_order=1&q=Prefetch&zhida_source=entity) 的个数来达到的。我们看DDR2和DDR3的对照表：

![](https://pic3.zhimg.com/v2-60d1dc0bc1563a7e23d239cfd23f6068_1440w.jpg)

DDR2，注意看Clock rate。（来源wikipedia，参考资料1）

![](https://pic2.zhimg.com/v2-1ae39c2842799a67445741a4bae18be3_1440w.jpg)

DDR3,注意看cell array clock(来源wikipedia,参考资料2)

这么做有什么好处吗？当然最重要的是降低成本和省电了。如果看看内存颗粒里面的结构：

![](https://pic3.zhimg.com/v2-66748992c94cd42ce9ed7c5fbd2627e0_1440w.jpg)

DDR2，4n prefetch

和外部Bus速度相同的是紫色部分（front end），而大片白色的部分(back end)都是工作在核心频率下，也就是100~266HMz下。低速带来了两个好处：

1.低频漏电流小，功耗低。

2.工艺简单，可以大规模堆量。

聪明的工程师从DDR开始不停的倍增prefetch，帽子戏法一而再，再而三上演，DDRx的外部总线带宽稳步提升，成本却提高不大，两全其美，太棒了。直到DDR4，这个故事不能够继续上演。

## DDR4来了

DDR4当然和前代每次变化一样，降低了电压；增加了地址线Ax，所以可以支持更大容量。除此之外，有个明显的不同变化，prefetch的倍增停止了。

DDR4和DDR3一样，只有8n的prefetch，但为了提升前端Front End的总线速度，不得不在核心频率上动起了手脚：

![](https://picx.zhimg.com/v2-7e4c0d71ad74ce38e9d797cbc776afb5_1440w.jpg)

DDR4，来源wikipedia(参考资料3)

核心频率不在徘徊在100～266HMz，直接200起跳，到400Mhz。因为核心频率提高，8bit的prefetch不变，总线速度才得以提升。

**现在我给大家留一个思考题，为什么DDR3之前可以不停提高prefetch，而DDR4却不行了？这里给一点提示，和Cache line和BL（Burst Length）有关。我过一阵会公布答案，也欢迎在评论区留言。**

DDR4还有个巨大且很有意思的改变，也和效能有关。那就是 [Bank Group](https://zhida.zhihu.com/search?content_id=101959450&content_type=Article&match_order=1&q=Bank+Group&zhida_source=entity) ：

![](https://pic2.zhimg.com/v2-b84e8aaca403c61d4f346149a9409dd5_1440w.jpg)

图片出自参考资料4

随着Bank Group还带来了两个新Timings： [tCCD\_S](https://zhida.zhihu.com/search?content_id=101959450&content_type=Article&match_order=1&q=tCCD_S&zhida_source=entity) 和 [tCCD\_L](https://zhida.zhihu.com/search?content_id=101959450&content_type=Article&match_order=1&q=tCCD_L&zhida_source=entity) 。CCD代表“Column to Column Delay”。S是Short，L是Long。每个Group都可以单独工作，一次完整的8n prefetch不需要等待另一个group，所以是短的delay,也就是tCCD\_S，一般是4。Group内部，每次都要等待一个更长的时间，也就是tCCD\_L，tCCD\_L随不同频率各不相同。

如果我们的数据十分凑巧，都分布在不同的group中，Bank Group会带来巨大的性能提升。最好情况下，2个bank groups和16n prefetch的提升一样，4个bank groups和32n prefetch一样。如果我们的数据刚好都在一个bank group中，频率又十分高，最坏情况，bank group不会带来任何好处。借助Bank interleave，我们的实际情况一般在最好和最坏之间。

DDR4借助核心频率的提升和bank group，性能提升不少。即使PC4-12800和PC3-12800相比，无论功耗和性能，都有不少提高。

## DDR5会带来什么？

DDR5的标准尚未公布，据悉会进一步降低电压，这当然是拜现在芯片工艺提升所赐。另外prefetch会进一步从8n prefetch变成16n prefetch。

有同学会问了，你刚才说了DDR4不能从8n变成16n，是碰到了巨大的问题。为什么DDR5又没有问题了呢？因为协议没有公布，等公布后我们再来回顾这个问题。

最后再加个彩蛋，谁知道题图是哪种内存（ [UDIMM](https://zhida.zhihu.com/search?content_id=101959450&content_type=Article&match_order=1&q=UDIMM&zhida_source=entity) / [RDIMM](https://zhida.zhihu.com/search?content_id=101959450&content_type=Article&match_order=1&q=RDIMM&zhida_source=entity) / [LPDIMM](https://zhida.zhihu.com/search?content_id=101959450&content_type=Article&match_order=1&q=LPDIMM&zhida_source=entity) / LRDIMM / [FBDIMM](https://zhida.zhihu.com/search?content_id=101959450&content_type=Article&match_order=1&q=FBDIMM&zhida_source=entity) ，等等），为什么？请留言，谁先猜出来，会推荐成精彩评论哦。

其他内存相关文章：

欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。同时欢迎大家给本专栏和公众号投稿！

![](https://pica.zhimg.com/v2-121ecd3d4080deb1c557bf47dc00d246_1440w.jpg)

用微信扫描二维码加入UEFIBlog公众号

### 参考资料：

\[1\]: [en.wikipedia.org/wiki/D](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/DDR2_SDRAM)

\[2\]: [en.wikipedia.org/wiki/D](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/DDR3_SDRAM)

\[3\]: [en.wikipedia.org/wiki/D](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/DDR4_SDRAM)

\[4\]: [systemverilog.io/ddr4-b](https://link.zhihu.com/?target=https%3A//www.systemverilog.io/ddr4-basics)

2 人已送礼物

编辑于 2019-04-12 18:36[28岁转行嵌入式适合转嵌入式吗?](https://www.zhihu.com/question/630407863/answer/3372155686)

[可以转，如果真是喜欢的话是没有问题的，但是嵌入式入门并不简单，不想浪费时间的话，最好是报个班，最好是线下的小班。当时我在汉码未来学习的时候，一个班只有5个人，特别适合我这...](https://www.zhihu.com/question/630407863/answer/3372155686)