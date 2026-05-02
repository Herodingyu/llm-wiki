---
title: "IC基础课 | 多模块异步交互时，如何确定缓冲区大小"
source: "https://zhuanlan.zhihu.com/p/24563198"
author:
  - "[[龚黎明​中央处理器 (CPU)等 2 个话题下的优秀答主]]"
published:
created: 2026-05-02
description: "今天讲一个IC前端搞架构时候需要讨论的一个问题。 做芯片的时候，在开始RTL coding之前，需要有很多的规划工作。比如用多高的时钟频率，有多少个时钟，吞吐量是多少，并行度是多少，乱序还是顺序。其中还有一个很…"
tags:
  - "clippings"
---
[收录于 · 半导学社](https://www.zhihu.com/column/stephen)

42 人赞同了该文章

今天讲一个IC前端搞架构时候需要讨论的一个问题。

做 [芯片](https://zhida.zhihu.com/search?content_id=2011796&content_type=Article&match_order=1&q=%E8%8A%AF%E7%89%87&zhida_source=entity) 的时候，在开始RTL coding之前，需要有很多的规划工作。比如用多高的 [时钟频率](https://zhida.zhihu.com/search?content_id=2011796&content_type=Article&match_order=1&q=%E6%97%B6%E9%92%9F%E9%A2%91%E7%8E%87&zhida_source=entity) ，有多少个时钟，吞吐量是多少， [并行度](https://zhida.zhihu.com/search?content_id=2011796&content_type=Article&match_order=1&q=%E5%B9%B6%E8%A1%8C%E5%BA%A6&zhida_source=entity) 是多少，乱序还是顺序。其中还有一个很关键的，就是用多大的SRAM。你的模块里面，需要多大的存储空间；多个模块中间如果有缓冲区的话，需要多大的缓冲。

之所以这么早就讨论需要多大的SRAM，还有另一个考虑就是可以尽早的预估芯片的面积，因为SRAM只要规格确定下来，面积就能确定下来。并且可以大致的评估芯片的布局，而且由于SRAM需要使用特殊的IP生成工具来生成，并且还需要专门的BIST(memory BIST,用于测试memory的 [良率](https://zhida.zhihu.com/search?content_id=2011796&content_type=Article&match_order=1&q=%E8%89%AF%E7%8E%87&zhida_source=entity))，所以也需要尽早确定下来。

由于绝大部分 [SOC系统](https://zhida.zhihu.com/search?content_id=2011796&content_type=Article&match_order=1&q=SOC%E7%B3%BB%E7%BB%9F&zhida_source=entity) ，都是多个模块互相独立运行，然后交互数据和命令。所以经常会需要 [缓冲区](https://zhida.zhihu.com/search?content_id=2011796&content_type=Article&match_order=2&q=%E7%BC%93%E5%86%B2%E5%8C%BA&zhida_source=entity) 来平衡各个模块的带宽和延时。就像火车的相邻车厢，中间需要一截弹性区来缓冲两车厢的不一致运动。

我们希望的是，数据的传输，在跨越各个模块的时候，可以一刻不停留。多个模块不需要互相等待，紧凑运行。但是遗憾的是通常做不到。数据的滞留在一个 [复杂系统](https://zhida.zhihu.com/search?content_id=2011796&content_type=Article&match_order=1&q=%E5%A4%8D%E6%9D%82%E7%B3%BB%E7%BB%9F&zhida_source=entity) 里面某些情况下总是不可避免。

实际设计的时候，搞架构的同事会咨询每个模块的设计者，你内部是否需要SRAM，需要多大的SRAM？有一些是很好确定的。但是有一些则不那么好确定。比如说，某系统最大支持同时执行64笔CMD，每个CMD是4个DW（一个32bit叫一个DW）。那么我们需要一个SRAM存储这些CMD，深度是64\*4=256，位宽是32bit，这个很容易确定。

哪些是不容易确定的，通常就是各个模块间的灰色地带。你可以说缓冲区越大越好，但是也没说一定得是多少。但是小了，效率就会低。

考虑下面一个最基本的情况：

模块A工作在时钟CLK1下，模块B工作在时钟CLK2下。两者是异步时钟，各自独立工作。现在A发起一笔传输送给B，因为某些原因，B不能立即取数，需要等待一个条件才能取数，通常这个条件会在A发起传输之后t ns达成。现在问，在A模块和B模块之间的缓冲区最好多大？

首先要明白，为什么需要缓冲区？

缓冲区的存在，是为了让数据能够连续操作。假如说缓冲区太小，那么不等B来取，A很快就把缓冲区填满了，然后就会因为没有缓冲空间进入等待状态， [数据流](https://zhida.zhihu.com/search?content_id=2011796&content_type=Article&match_order=1&q=%E6%95%B0%E6%8D%AE%E6%B5%81&zhida_source=entity) 就断了。缓冲区过大，毫无疑问是浪费。

怎么样让数据流不断？能够连续起来？又不使用过多的SRAM？

这其实是个基本数学的 [追及问题](https://zhida.zhihu.com/search?content_id=2011796&content_type=Article&match_order=1&q=%E8%BF%BD%E5%8F%8A%E9%97%AE%E9%A2%98&zhida_source=entity) 。

A在往一个池子里面注水，池子的水位越升越高，过了时间t，B开始把池子里面的水往外排。假设A注水的速度的Va，B排水的速度是Vb，两者速度上接近或者Vb比较大。那么池子多深才能保证水不溢出，A的水流连续？

![](https://pic3.zhimg.com/v2-abfe883bc5a2f8bd63489e74bbe70988_1440w.png)

答案很简单。我们需要在B还没有排水的时间段里，A可以一直往缓冲区里面注水。所以缓冲区的大小，就等于B开始排水的延迟乘以A注水的速度。

有了这么大的缓冲区，就可以保证在B还没有开始排水的时候，A可以一直往池子里面注水，A接口就可以满吞吐量运行。

实际系统里面，因为能力问题，总是有的模块慢，有的快。这些慢的地方就是 [系统瓶颈](https://zhida.zhihu.com/search?content_id=2011796&content_type=Article&match_order=1&q=%E7%B3%BB%E7%BB%9F%E7%93%B6%E9%A2%88&zhida_source=entity) ，减小瓶颈的一大办法，就是让慢的部件可以一直有活干。什么时候只要他想干了，其他部分都得立即配合，让他最舒服。

同样的例子。比如说，CPU [访问内存](https://zhida.zhihu.com/search?content_id=2011796&content_type=Article&match_order=1&q=%E8%AE%BF%E9%97%AE%E5%86%85%E5%AD%98&zhida_source=entity) 。我们知道内存是系统瓶颈，因为内存相对于CPU来说频率低，延迟也大，并且内存是有确定规范的，比如说DDR4接口2133Hz。所以你如果设计 [内存控制器](https://zhida.zhihu.com/search?content_id=2011796&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E6%8E%A7%E5%88%B6%E5%99%A8&zhida_source=entity) ，那么最基本的要求是保证内存的带宽用满。所以读写内存的数据都需要加一个大缓存。这个缓存的目的，就是保证内存的数据不论是读写，都可以连续操作，不能因为没有缓冲区拖了后腿。只有访存没有滞留，才算是达到了该系统的理论极限。

再比如说U盘，用的是USB接口。U盘内部可以通过增加Flash颗粒的并行度不断提高吞吐量。一个好的U盘，理论上速度瓶颈在USB接口上，因为接口是有明确规范的，比如说USB2.0可以到480Mb/s，最高也只能到这个速度。所以设计高质量U盘的时候，需要保证的就是USB接口满负荷运行，不能因为各种后续模块的延时拖了后腿，所以需要加大的 [buffer](https://zhida.zhihu.com/search?content_id=2011796&content_type=Article&match_order=1&q=buffer&zhida_source=entity) 。

欢迎大家关注我的微信公众号： **半导学社。**

还没有人送礼物，鼓励一下作者吧

编辑于 2020-08-20 07:06