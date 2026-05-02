---
title: "Memory闲谈（DRAM，SRAM）"
source: "https://zhuanlan.zhihu.com/p/146094598"
author:
  - "[[宇文青霜​芯片（集成电路）话题下的优秀答主]]"
published:
created: 2026-05-02
description: "一个正常的40nm工艺，一个6T（6 transistors）的SRAM面积是150*0.04*0.04= 0.24um2/SRAM。所以如果我们需要一个1Mb的SRAM，面积是1M*0.24um2= 0.24mm2,也就是大概0.5mm*0.5mm。前天项目周会的时候，一位同事一顿猛…"
tags:
  - "clippings"
---
不坠青云之志 等 488 人赞同了该文章

> 一个正常的40nm工艺，一个6T（6 transistors）的SRAM面积是150\*0.04\*0.04= 0.24um2/SRAM。所以如果我们需要一个1Mb的SRAM，面积是1M\*0.24um2= 0.24mm2,也就是大概0.5mm\*0.5mm。

前天项目周会的时候，一位同事一顿猛算，作者君当时就震惊了……哇撒，这些熟悉memory的人手算能力这么强啊！

本着对强者的仰慕，作者君去Google了一下memory的rule of thumb，发现还真的有这个类似的公式：来自一篇HP的文档

[hpl.hp.com/techreports/](https://link.zhihu.com/?target=https%3A//www.hpl.hp.com/techreports/2008/HPL-2008-20.pdf)

第39页9.11Cell里面，有这么一句话：

> For instance the embedded DRAM cells presented in \[45\] for four different technology nodes – 180/130/90/65nm have areas in the range of 1 **9–26F^2** where F is the feature size of the process. In contrast, a typical SRAM cell would have an area of about **120–150F^2**.

所以说，那位同事的估算是差不多合理的。40nm的CMOS工艺，feature size是40nm，所以一个SRAM的面积大概就是120-150F^2,跟他算的是一样的。

呼呼，memory的面积居然都如此的标准，感觉很是羡慕呢！

话说回来了，为啥DRAM比SRAM的面积小很多呢？ 大家还记得以前 [VLSI](https://zhida.zhihu.com/search?content_id=120598258&content_type=Article&match_order=1&q=VLSI&zhida_source=entity) 课程里面，不同memory的电路图吗？要不这次就跟着作者君复习一下？

![](https://pic1.zhimg.com/v2-ef2d51fd944a3cfff58c8cb26f9ebef0_1440w.jpg)

(a) DRAM; (b) SRAM

上面这个图里，左边是一个DRAM，就是一个transistor加上一个capacitor，结构相当简单。右图是一个SRAM，仔细一看，中间是交叉连接的两个inverter，组成了一个典型的latch。（在作者君看来，latch其实就是一个digital的capacitor），然后左右两个transistor当做了开关，功能和左图DRAM里面那个pass transistor差不多。

> 说到memory的面积，作者君昨天还跟一个做数字前端的朋友聊了聊。他说他们的SOC里面放了一个512MB的SRAM，12nm的工艺下，面积是400mm^2.  
> 所以尺寸是20mm\*20mm。真.土豪公司啊！

作者君继续Google：

![](https://pic3.zhimg.com/v2-3fdcea5d78f4f5445911b962b52be802_1440w.jpg)

SRAM vs. DRAM in Computers

这个表格里面，提到了 [CPU](https://zhida.zhihu.com/search?content_id=120598258&content_type=Article&match_order=1&q=CPU&zhida_source=entity) 里面一般放的是SRAM，不是DRAM。SRAM用了 **positive feedback的latch** ，速度显然比类似于模拟电路（就是一个模拟的开关对电容充电）的DRAM要快很多。（大致上快了十倍以上）

但是，SRAM要6个transistor，DRAM才一个transistor，面积小了如此之多。如果需要很大的memory，DRAM在节约SOC成本这块是不是占优了呢？

等等，这两家伙是一样的process吗？

由于有个很特别的 **电容** 存在，而且这个电容需要有一定的阈值和一定的对抗漏电的能力，所以DRAM的工艺其实不是大家平常能够见到的传统logic process，而是有它自己特别的 **DRAM process** 。目前也基本上只有三家公司提供DRAM的工艺： [美光科技](https://zhida.zhihu.com/search?content_id=120598258&content_type=Article&match_order=1&q=%E7%BE%8E%E5%85%89%E7%A7%91%E6%8A%80&zhida_source=entity) 、 [三星](https://zhida.zhihu.com/search?content_id=120598258&content_type=Article&match_order=1&q=%E4%B8%89%E6%98%9F&zhida_source=entity) 和 [SK 海力士](https://zhida.zhihu.com/search?content_id=120598258&content_type=Article&match_order=1&q=SK+%E6%B5%B7%E5%8A%9B%E5%A3%AB&zhida_source=entity) 。（话说如果想做MPW，人家是不接单的……-\_-）

继续谈成本这块，作者君Google到了下面这句话：

> Logic processes - those used for CPUs - are also more expensive. A logic wafer might cost **$3500 vs $1600 for DRAM**. Intel's logic wafers may cost as much **$5k**. That's costly real estate.

当然，正是因为SRAM的成本压力，所以CPU上面一般也不会集成大的DRAM，而是把DRAM放在片外。CPU的内部，一般也只有SRAM作为cache，并不是主要的memory。

除此之外，现在还有一种所谓的 [Memory Hierarchy](https://zhida.zhihu.com/search?content_id=120598258&content_type=Article&match_order=1&q=Memory+Hierarchy&zhida_source=entity) 。就是一种类似金字塔形状的结构，最大程度的优化速度和成本。大家有兴趣的话，可以去搜一下不同类型的memory。

![](https://pic2.zhimg.com/v2-a8e5527e43191cab3e405989c31f9f1f_1440w.jpg)

最后，作者君再赶时髦谈到CPU和 [GPU](https://zhida.zhihu.com/search?content_id=120598258&content_type=Article&match_order=1&q=GPU&zhida_source=entity) 的区别。有一张特别出名的图片：

![](https://picx.zhimg.com/v2-b8d9d270feba44ece088c05908e382e5_1440w.jpg)

在AI大行其道的今天，回过头来看看CPU和GPU的结构对比。再加深一下对DRAM和SRAM的区分，这张图很能说明一些东西。比如，CPU里面，cache是SRAM，占了相当多的面积，而在GPU里面，由于交互信息不如内部运算的负担大，大部分的面积都拿去做基本的计算了。所以在chip的成本类似的情况下（主要是die area大小差不多的情况），最后GPU的架构跟CPU还是很不一样的。

知乎也有相关的问题，大家可以去看看：

[AI 芯片和传统芯片有何区别？](https://www.zhihu.com/question/285202403/answer/444253962)

PS：大家如果有空去看看layout，会发现有几层layer的名字跟“SRAM”有关。按照foundry的文档，如果在layout里面加上了这样的layer，那么跑DRC的时候，各种rule的要求都会减小，比如metal间距从70nm减小到60nm（作者君瞎编的值，因为这不重要，哇哈哈！），诸如此类……相关工艺请查阅foundry的design manual。

参考资料：

[enterprisestorageforum.com](https://link.zhihu.com/?target=https%3A//www.enterprisestorageforum.com/storage-hardware/sram-vs-dram.html)

[zdnet.com/article/why-d](https://link.zhihu.com/?target=https%3A//www.zdnet.com/article/why-doesnt-intel-put-dram-on-the-cpu/%23%3A~%3Atext%3DAccess%2520times%2520are%2520roughly%252010%2Cto%2520use%2520separate%2520memory%2520chips.)

[14张图看懂半导体工艺演进对DRAM、逻辑器件、NAND三大尖端产品的影响-基础器件-与非网](https://link.zhihu.com/?target=https%3A//www.eefocus.com/component/407909)

[chuansongme.com/n/17541](https://link.zhihu.com/?target=https%3A//chuansongme.com/n/1754136953428)

[semiengineering.com/the](https://link.zhihu.com/?target=https%3A//semiengineering.com/the-next-new-memories/)

知乎最近有点抽风，请关注微信公众号：analogIC\_gossip

发布于 2020-06-06 09:33[想从事IC设计这一行，真的是个好选择吗？](https://zhuanlan.zhihu.com/p/337892334)

[

写给那些要进入IC设计行业的兄弟姐妹们： 最近这段时间一哥遇到过很多这样的问题？ \[图片\] \[图片\] \[图片\] \[图片\] 总结下无非就三点， 1、想进入ic设计行业但不了解这个行业的就业前景的。...

](https://zhuanlan.zhihu.com/p/337892334)