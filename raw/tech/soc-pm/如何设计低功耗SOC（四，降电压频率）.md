---
title: "如何设计低功耗SOC（四，降电压频率）"
source: "https://zhuanlan.zhihu.com/p/159054374"
author:
  - "[[桔里猫​​新知答主]]"
published:
created: 2026-05-02
description: "这是这个系列 桔里猫：如何设计低功耗SOC（一，综述）的第四章，这个英文名字是Frequency and voltage scaling。在边缘端低功耗情况下也是比较有效的方法。1、降电压频率的基本原理这个在多电源域的时候就讲过。降…"
tags:
  - "clippings"
---
[收录于 · 聚沙成芯：如何造芯片](https://www.zhihu.com/column/c_1264903132552757248)

Trustintruth 等 22 人赞同了该文章

这是这个系列 [桔里猫：如何设计低功耗SOC（一，综述）](https://zhuanlan.zhihu.com/p/158410142) 的第四章，这个英文名字是Frequency and voltage scaling。在边缘端低功耗情况下也是比较有效的方法。

## 1、降电压频率的基本原理

这个在多电源域的时候就讲过。降电压是可以降 [动态功耗](https://zhida.zhihu.com/search?content_id=123478535&content_type=Article&match_order=1&q=%E5%8A%A8%E6%80%81%E5%8A%9F%E8%80%97&zhida_source=entity) 的。但是会增加延时。对于数字电路来讲，可以通过降低 [时钟频率](https://zhida.zhihu.com/search?content_id=123478535&content_type=Article&match_order=1&q=%E6%97%B6%E9%92%9F%E9%A2%91%E7%8E%87&zhida_source=entity) 的手段来保证功能的正确。

![](https://pica.zhimg.com/v2-5a4b63240032d802a6d101c6be014d58_1440w.jpg)

如上图所示，对于一个固定的电压，能跑到的最高频率是有限度的，但是一般来讲并不能无限通过降低电压来节省功耗。因为电压降低到一定程度芯片计算结果就不对了。

![](https://pic2.zhimg.com/v2-363df8ded03ed45f95286ec9e0843279_1440w.jpg)

如上图所示，能节省的功耗其实是两方面的，一方面是电压变低了，另一方面是因为频率降低了 [翻转率](https://zhida.zhihu.com/search?content_id=123478535&content_type=Article&match_order=1&q=%E7%BF%BB%E8%BD%AC%E7%8E%87&zhida_source=entity) 变低了。

## 2、降电压频率可以节省能量么？

那么你要问了，频率变低了，岂不是完成一个任务的时间变长了？事实上确实是这样的。

![](https://pica.zhimg.com/v2-75add7e7a255ff81a30b0f6a300bf464_1440w.jpg)

如上图所示，如果单纯的降低频率其实是没什么作用的，但是同时降电压和频率就不一样。电压与功耗是平方关系，最后会导致整个芯片消耗的能量往下降。

## 3\. DVFS是什么？

这个词可以说是非常容易出现了。Dynamic Voltage and Frequency Scaling。动态的电压频率调节。最常见的实现手段是用CPU来来调节电压和频率。典型的做法如下图。

![](https://pic3.zhimg.com/v2-7f36a0dccd03614f48c7522e66d25ec2_1440w.jpg)

主要的过程有两种。如果目标的 [频率比](https://zhida.zhihu.com/search?content_id=123478535&content_type=Article&match_order=1&q=%E9%A2%91%E7%8E%87%E6%AF%94&zhida_source=entity) 现在高，那么先调电压，再调频。

1. CPU先给Power Supply外设写个值，调一下电压。
2. 然后等着，直到电压变高。
3. 然后CPU频率切到高频即可。
4. 如果SOC部分需要调频，那通过CPU配置Sysclock generator或者PLL即可。

反过来，如果目标频率比现在低，先调频率，后调电压。一般来讲， [频率电压](https://zhida.zhihu.com/search?content_id=123478535&content_type=Article&match_order=1&q=%E9%A2%91%E7%8E%87%E7%94%B5%E5%8E%8B&zhida_source=entity) 数值是提前设计好的，会有若干的频点，工作状态在这些频点之间变化。

一般来讲，为了时序好处理，一种简单的办法是CPU的时钟只允许是总线的整数倍。然后接口出加上latch。

![](https://pic3.zhimg.com/v2-fe7ad1680bb9e76d270749709c75e68e_1440w.jpg)

如上图所示。。LPHLAT就是latch。HCLK是BUS的时钟。latch的作用是同步一下CPU的信号。然后时序约束的时候考虑一下CPUCLK和HCLK的差别留出足够的余量就可以了。

## 4、总结

这个部分东西学术研究还是比较多的尤其DVFS的各种变种。但是实际产品中如果不是极致追求，不一定能用的到。以上！

编辑于 2022-07-24 23:13[25届微电子应届生，就业如何选择？](https://www.zhihu.com/question/661861553/answer/128373577699)

[

请认真看完（纯干货）很明显，两条路：一、直接选择design方向岗位作为一个上海top3微电子专业的硕士，学历肯定...

](https://www.zhihu.com/question/661861553/answer/128373577699)