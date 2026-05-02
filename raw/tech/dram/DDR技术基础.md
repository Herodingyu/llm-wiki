---
title: "DDR技术基础"
source: "https://zhuanlan.zhihu.com/p/20940759"
author:
  - "[[龚黎明​中央处理器 (CPU)等 2 个话题下的优秀答主]]"
published:
created: 2026-05-02
description: "核弹炸楼： 作为一个不打游戏的三好青年，本人对于显卡本身是不感兴趣的，反正穷，也买不起；但是作为一名有追求的工程师，看到GTX1080的技术参数中含有GDDR5x的时候，我本能的搜了一搜。 相信很多人对于内存以及…"
tags:
  - "clippings"
---
[收录于 · 半导学社](https://www.zhihu.com/column/stephen)

吴建明wujianming、ICer 等 320 人赞同了该文章

核弹炸楼：

![](https://picx.zhimg.com/228897da4cf558ae3b0194fc29efacfd_1440w.png)

作为一个不打游戏的三好青年，本人对于显卡本身是不感兴趣的，反正穷，也买不起；但是作为一名有追求的工程师，看到GTX1080的技术参数中含有 [GDDR5x](https://zhida.zhihu.com/search?content_id=559114&content_type=Article&match_order=1&q=GDDR5x&zhida_source=entity) 的时候，我本能的搜了一搜。

相信很多人对于内存以及显存的技术都是一知半解，关于 [SRAM](https://zhida.zhihu.com/search?content_id=559114&content_type=Article&match_order=1&q=SRAM&zhida_source=entity) ， [SDRAM](https://zhida.zhihu.com/search?content_id=559114&content_type=Article&match_order=1&q=SDRAM&zhida_source=entity) 和DDR， [LPDDR](https://zhida.zhihu.com/search?content_id=559114&content_type=Article&match_order=1&q=LPDDR&zhida_source=entity) 以及GDDR等。今天我们就来简单讲讲这些东西。

要讲LPDDR以及GDDR，都得先讲DRAM，因为前两者其实是DRAM技术的衍生品，只不过LPDDR主要应用于笔记本电脑、手机、平板等低功耗领域，GDDR主要应用于显卡领域。

我自己也是查找了不少资料。其实在我查资料之前，我一直有一个很大的困惑：自1968年，IBM申请DRAM专利，1970年intel研发了第一款商用的DRAM chip，intel 1103，大小是1KB。说起来DRAM的技术已经发展了46年了，但是当前最先进的DDR协议竟然只是DDR4。这年头，推出不到十年的Iphone马上都要出7了， [PCIe协议](https://zhida.zhihu.com/search?content_id=559114&content_type=Article&match_order=1&q=PCIe%E5%8D%8F%E8%AE%AE&zhida_source=entity) 历经十年就演进到了第3代，历时将近50年的DRAM，接口协议版本居然只有4这么低，真是让人蛋疼。

简单回顾一下DRAM相关技术的发展历史：

![](https://pic1.zhimg.com/5e9a2a19a9d2974280a94e2295b83fe2_1440w.png)

早期的DRAM处于异步工作模式，其主频与CPU的主频并不一致。在DRAM的46年的发展历史中，一半时间（前23年）处于这种“远古”阶段。在此阶段，DRAM的容量从1Kb，做到4Kb，16Kb......到了89年，DRAM的容量达到4MB，92年16MB，接口技术其实并没有什么本质创新，频率被限制在50M以下。当然了，这频率也不算差，1989年的intel 486 DX处理器主频也只有33M而已。

现代化的DRAM技术从1993年才真正开始。这一年三星引入了SDRAM技术，也叫同步DRAM，这里的同步是指跟CPU的外频时钟同步，频率也飙升到133M。而DDR倍频技术从2000年才开始，应用于显卡的GDDR从2001年出现，应用于手机等移动设备的LPDDR 2010年才出现。

DDR接口的出现，带来了内存速度的大幅提高。下面这张图比较好的给出了DDR接口的演进历史，从DDR2->DDR3->DDR4等。解释下含义：DDR3-1333是说，DRAM接口单根pin的速度为1333Mbit/s，如果接口为128pin，那么DRAM接口速度可以达到21.3GB/s。

![](https://pic1.zhimg.com/cf436513d05486bf0b832c7a8b333ee2_1440w.png)

需要指出的是，现代化的DRAM技术，更像是一门接口技术，而不像是存储技术。得益于 [摩尔定律](https://zhida.zhihu.com/search?content_id=559114&content_type=Article&match_order=1&q=%E6%91%A9%E5%B0%94%E5%AE%9A%E5%BE%8B&zhida_source=entity) ，随着工艺尺寸的不断缩进，DRAM的容量越做越大，这个并不难，但是如果没有DDR1，DDR2和DDR3，DDR4等不断的倍频高速接口出现，DRAM的速度基本没有办法提高。

其原因在于，DRAM作为一个大的存储体，尤其是靠电容作为存储的手段，其内部操作速度很难做到很高。电容的容量做得太小，内存读写的确可以变快，后果是漏电也会很快，需要不停的刷新防止数据丢失，内存的性能会受到影响。电容的容量做得太大，数据确实可以保存的很久，但是写入和读取的延时就会大大增加，DRAM的性能又会大大降低。

基于此，DRAM的内部存储操作速度难以大幅度改进。举个例子：即使DRAM接口pin做到了1066M，DRAM的存储单元其实并没有工作在1066M这么高的时钟下面，相反只有133M。快的只是接口而已。

就好像一个很粗的水管，里面的水流速其实并不快，但是只要我们把出口收窄，出口的水速就会大幅提高，远远高于水管内的水速。

在下图给出的示例中，SDRAM的接口速度是133M，DDR1接口的速度是266M，DDR2接口的速度是533M，DDR3的接口速度是1066M。每提高一代，接口性能都提高了一倍，但是注意看，这四代接口的核心频率都是133M！！也就是说，DRAM存储单元的读写速度没有丝毫提高！！

![](https://pic1.zhimg.com/6eb41d95e8927ad534a5a3f148a17d7e_1440w.jpg)

这是怎么做到的？？？

核心技术点就在于：（1）双沿传输。（2）预取。

SDRAM是单沿传输的。核心频率133M，没有预取，也就是说，每个时钟只取1bit数据，接口频率也是133M，接口速度还是133M（只有上升沿传数）。

DDR1是双沿传输的。核心频率依然是133M，但是有2bit预取，也就是说每个时钟可以取出2bit，接口频率是133M，但是接口速度是266M（注意接口时钟仍然是133M，但是其上升和下降沿都可以传数，所以接口速度翻倍）。

DDR2是双沿传输的。核心频率依然是133M，但是有4bit预取，也就是说每个时钟可以取出4bit，接口频率是266M，但是接口速度是533M（上升和下降沿都可以传数）。

DDR3是双沿传输的。核心频率依然是133M，但是有8bit预取，也就是说每个时钟可以取出8bit，接口频率是533M，但是接口速度是1066M（上升和下降沿都可以传数）。

这样，靠着增大预取，尽管内部存储单元工作在133M时钟下，DRAM的速度却可以越做越快。这就是DRAM接口的最大秘密。

下面这张图给出了DDR各代技术的对比，没有包含最新的DDR4，大家看个大概即可，关键是理解上面说的原理：

![](https://pic1.zhimg.com/f41cb8bcd286c8451aec65bbc308db64_1440w.png)

当然了，DRAM接口的速度提高，内部存储单元的数据带宽也必须同步提高；但是由于存储单元的操作频率又上不去，所以只能不停的增加DRAM内部的BUS宽度。如果预取为2，那么对于64pin的DRAM，其内部BUS位宽是128bit宽，内外BUS宽比为2:1；如果预取为4，那么内部BUS的位宽是256bit宽，内外BUS宽比为4。如下图：

![](https://picx.zhimg.com/9160d683191f1604e096b3b31b21377b_1440w.png)

粗暴的增加DRAM内部BUS的宽度，每个T取出更多的bit，然后使用超高速的IO接口把这些数敲出去，这就是DRAM各代技术的简化版。正因为如此，我们说DRAM更像是一门接口技术，反而不太像存储技术。DDR接口技术乃是十分经典的并行接口技术，DDR的BUS协议也被广泛借鉴，目前的NAND Flash也沿用了DDR接口技术。

关于LPDDR和GDDR，乃是DDR技术的衍生品，略过。

欢迎大家关注我的微信公众号： **半导学社。**

还没有人送礼物，鼓励一下作者吧

编辑于 2020-08-20 07:12[IC设计今年的行情，强烈建议ICer们做多手准备！](https://zhuanlan.zhihu.com/p/703094411)

[

很多微电子与集成电路专业的学生、初入IC职场的工程师，以及电子/机械大类专业的同学，在进入芯片设计行业时，都或多或少听说了参与流片的重要性。 但是却并不是很清楚——流片到底有多...

](https://zhuanlan.zhihu.com/p/703094411)