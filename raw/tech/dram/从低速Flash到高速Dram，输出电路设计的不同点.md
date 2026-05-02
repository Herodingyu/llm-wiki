---
title: "从低速Flash到高速Dram，输出电路设计的不同点"
source: "https://zhuanlan.zhihu.com/p/43838028"
author:
  - "[[IC君公众号 icstudy 数模混合设计工程师]]"
published:
created: 2026-05-02
description: "IC君的第29篇原创文章 （同步于 公众号 icstudy ） 好长时间没有更新文章了，前一段时间IC君换了工作，人生轨迹发生了小小的变化，之后也一直忙于学习一些工作上的新东西。文章写多了，也要多积累积累，不然身体迟…"
tags:
  - "clippings"
---
[收录于 · 跟IC君一起学习集成电路](https://www.zhihu.com/column/icstudy)

27 人赞同了该文章

[IC君](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=IC%E5%90%9B&zhida_source=entity) 的第29篇原创文章 （同步于 公众号 icstudy ）

好长时间没有更新文章了，前一段时间IC君换了工作，人生轨迹发生了小小的变化，之后也一直忙于学习一些工作上的新东西。文章写多了，也要多积累积累，不然身体迟早被掏空！

这篇文章聊一聊输入输出（IO）中的输出。大家都知道IO是芯片跟系统交互的直接路径，IO做的好与坏系统很容易就能检测出来。比如输出无法达到VOH/VOL、输出波形爬的太慢或者太快、输出的上升沿或 [下降沿](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E4%B8%8B%E9%99%8D%E6%B2%BF&zhida_source=entity) 不对称等等。输出特性的好坏更专业的是用如下的 [眼图](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E7%9C%BC%E5%9B%BE&zhida_source=entity) 来描述。

![](https://pica.zhimg.com/v2-f5754901dfbb3e08516a6c4810620fa4_1440w.jpg)

图中的阴影部分表示眼睛，眼睛睁开的越大，表示传输特性越好，有机会IC君会好好的研究一下眼图，先给自己留个作业。

对于中低速的应用而言，比如Flash的数据输出速度大概是100MHz左右，基本的CMOS输出电路如下图所示：

![](https://picx.zhimg.com/v2-ccf8639bf0ec1e8c8b6c3634105096e3_1440w.jpg)

原理也很简单，输出“1”的时候，PMOS作为上拉管对Cload进行充电，从0到VOH；输出“0”的时候，NMOS作为下拉管对Cload进行放电，从VOH到0。根据MOS的充放电电流，假设MOS管一直工作在 [饱和区](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E9%A5%B1%E5%92%8C%E5%8C%BA&zhida_source=entity) (实际平均电流是饱和区和 [线性区](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E7%BA%BF%E6%80%A7%E5%8C%BA&zhida_source=entity) 的平均)，得到以下公式：

![](https://pic4.zhimg.com/v2-609cebcec8ac7cc597884f5b6003784b_1440w.jpg)

当电压达到VDD/2时所消耗的时间为：

![](https://pic4.zhimg.com/v2-476b88e52fab050a18df1aff6c2ccad1_1440w.jpg)

最终可以得到MOS管子的宽长比如下：

![](https://pic3.zhimg.com/v2-2e0cea20b3f095c2e440e235fe2b1314_1440w.jpg)

输出电路的最重要的设计spec通常如下图蓝色框图所示

![](https://pic4.zhimg.com/v2-512337bb2144b19f530664eeb148bcb3_1440w.jpg)

从CLK的某个沿到输出数据valid的时间 tCO 举个例子 Cload=30pF ，tCO=9ns。

根据这个spec以及上面的公式可以得到PMOS/NMOS的尺寸，再通过hspice来确认自己设计的正确性。当然实际设计要留更多的Margin来cover一些工艺的偏差，还要考虑 [信号线](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E4%BF%A1%E5%8F%B7%E7%BA%BF&zhida_source=entity) 和电源线的routing，另外在设计中要注意尽量降低数据在切换时候的PMOS/NMOS同时导通的cross bar 电流。

在整个设计过程中，芯片输出在PCB板上驱动至下一个芯片的路径看成了一根 [理想导线](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E7%90%86%E6%83%B3%E5%AF%BC%E7%BA%BF&zhida_source=entity) ，被驱动的芯片作为负载简化成了Cload。这样的假设在中低频的应用中（200Mhz以下）可能问题不大，而且VDD通常也是1.8V或者3V，幅度也比较宽。信号在整个传输过程中，不用特别考虑 [信号完整性](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E4%BF%A1%E5%8F%B7%E5%AE%8C%E6%95%B4%E6%80%A7&zhida_source=entity) 的问题。

对于高速应用而言，比如DRAM的速度都是Ghz量级的， [低功耗](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E4%BD%8E%E5%8A%9F%E8%80%97&zhida_source=entity) DRAM LPDDR4 的VDD电压幅度为1.1V，而且有越来越小的趋势。 DRAM的性能趋势可以参考下图：

![](https://pica.zhimg.com/v2-0808090838f89eb64d06f82f08a02566_1440w.jpg)

高速应用下芯片输出在PCB板上驱动至下一个芯片的路径不能只当作导线，必须考虑信号完整性的问题。

信号完整性大致受到以下2个方面的影响：

1. **[传输线效应](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E4%BC%A0%E8%BE%93%E7%BA%BF%E6%95%88%E5%BA%94&zhida_source=entity) ，比如反射；**
2. **与通道其他因素的交互，比如串扰和电源线的噪声。**

信号完整性问题和很多因素相关，频率提高、上升时间减少、摆幅降低、互联通道不理想、供电环境恶劣、通道之间延时不一致等都可能导致信号完整性问题。 **但究其根源，主要是信号上升时间减小了。** 上升时间越小，信号中包含的高频成分就越多，高频分量和通道间的相互作用（反射、 [串扰](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=2&q=%E4%B8%B2%E6%89%B0&zhida_source=entity) 、电源噪声等）就可能使得信号产生严重的畸变。

下图就是由反射引起的振铃现象：

![](https://pic2.zhimg.com/v2-396f553cd55410a6e0925abd6fe6f2d7_1440w.jpg)

信号在2个不同阻抗域传输的反射系数和传输系数：

反射系数为 [反射电压](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E5%8F%8D%E5%B0%84%E7%94%B5%E5%8E%8B&zhida_source=entity) 和 [输入电压](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E8%BE%93%E5%85%A5%E7%94%B5%E5%8E%8B&zhida_source=entity) 的比值：

**Xf =（Z2-Z1）/ (Z1+Z2)**

传输系数是传输电压和输入电压的比值：

**Xtran = 2\*Z2 / (Z1+Z2)**

反射的具体原理有兴趣可以找文章末尾的参考书籍阅读。

**从反射系数的公式可以看到，要想消除反射的影响，必须 [阻抗匹配](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E9%98%BB%E6%8A%97%E5%8C%B9%E9%85%8D&zhida_source=entity) ，也就是Z2=Z1。**

考虑到 **反射的消除** 以及 **输出上升下降时间的控制，** 输出电路的示意图如下：

![](https://picx.zhimg.com/v2-c25ca827a59fe2f96cc0bb40e6ad61cf_1440w.jpg)

上拉由7条240欧姆的PMOS分支构成，具体enable哪几条可以调整，在DRAM中可以通过模式 [寄存器](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E5%AF%84%E5%AD%98%E5%99%A8&zhida_source=entity) 控制。比如enable其中3条，那上拉电阻就是3条并联，最终 [电阻](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=2&q=%E7%94%B5%E9%98%BB&zhida_source=entity) 为80欧姆；下拉也是也是由7条240欧姆的NMOS分支构成，工作原理与上面类似。

有人肯定要问，这个电路就能做到精确的电阻匹配吗？

答案是不能。

**因为我们的芯片在制造过程中会引入工艺的偏差，而且实际使用过程中温度电压也不一样** ，那怎么办呢？

引入校准机制，校准之后就可以得到相对精确的阻抗。首先要引入一个精确 [外部电阻](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E5%A4%96%E9%83%A8%E7%94%B5%E9%98%BB&zhida_source=entity) 作为标准，不然后续的校准基础都是错误的。

DRAM引入了ZQ pin， 这个pin 外接了一个精确的电阻240欧姆。 **DRAM在上电之后就会进行ZQ 校准，校准出系统需要的 [阻抗](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=4&q=%E9%98%BB%E6%8A%97&zhida_source=entity) ，传递给所有的输出pin。**

电路示意图如下图所示：

![](https://picx.zhimg.com/v2-e0e1696c9d7853901a1f54f67d784c83_1440w.jpg)

每一个分支的具体电路示意图如下：

![](https://pic1.zhimg.com/v2-a64077ca1f832197379356a4f5845996_1440w.jpg)

可以看出，每一个分支是由一堆并联的PMOS或者NMOS，再串联一个电阻RLIN得到。我们的目标就是将这个分支精确匹配到240欧姆。

从MOS管的IV特性得出MOS管的 [等效阻抗](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E7%AD%89%E6%95%88%E9%98%BB%E6%8A%97&zhida_source=entity) 其实不是线性的，希望阻抗得到精确匹配，就不能完全用MOS来作为 [等效电阻](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E7%AD%89%E6%95%88%E7%94%B5%E9%98%BB&zhida_source=entity) 。

串联电阻RLIN可以取一个比较大的值，比如100欧姆，那剩下的MOS就要匹配240-100=140欧姆的电阻。可以通过PU1 PU2... PUN来确定到底开多少个MOS管，然后用分压去跟VDD/2去作为比较，根据比较结果动态调整PU\[5:1\]的值。通常这里用的是 **[逐次逼近](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E9%80%90%E6%AC%A1%E9%80%BC%E8%BF%91&zhida_source=entity) SAR算法** ，这个算法也蛮有意思的，ADC中也经常会用到，IC君会在后续的文章中研究，又留一次作业。

说完电阻匹配，再来聊一聊信号的上升下降沿的时间（斜率）控制。 [输出信号](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E8%BE%93%E5%87%BA%E4%BF%A1%E5%8F%B7&zhida_source=entity) 的 [斜率](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=2&q=%E6%96%9C%E7%8E%87&zhida_source=entity) 可以通过打开分支的时间来控制，示意图如下：

![](https://pic1.zhimg.com/v2-749fcdb0e946f75dd0efabea35bc4ad6_1440w.jpg)

逐步打开分支，使得输出DQ信号的斜率相对缓慢的上去。

同时我们还可以在分支内部做精细的控制,示意图如下：

![](https://picx.zhimg.com/v2-d3c8307a206b102a9cbb4b55816e10e9_1440w.jpg)

把MOS的gate [控制信号](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E6%8E%A7%E5%88%B6%E4%BF%A1%E5%8F%B7&zhida_source=entity) 进行延迟，可以通过C0、C1、C2这3条路径得到不同的D0D。D0D驱动的DQ与D0驱动的DQ叠加，调整最终DQ的斜率。

从低频到高频，对于CMOS类型的输出 [电路设计](https://zhida.zhihu.com/search?content_id=8803549&content_type=Article&match_order=1&q=%E7%94%B5%E8%B7%AF%E8%AE%BE%E8%AE%A1&zhida_source=entity) 而言，基本的原理其实差不多。但是高频需要考虑信号完整性的问题，电路也因此变得更复杂。

最后列出本文所用的参考文献，有兴趣的ICer可以参考。

1. VLSI-Design of Non-Volatile Memories
2. DRAM Circuit Design Fundamental and High-Speed Topics
3. 信号完整性揭秘-于博士SI设计手記
4. A Process and Temperature Tolerant Low Power Semi-Self Calibration of High Speed Transceiver for DRAM Interface

编辑于 2018-09-05 19:40[双非本科电科想做ic请问一下哪些岗位容易进呢?](https://www.zhihu.com/question/542487738/answer/2674342765)

[常见的几个岗位？数IC前端设计工程师数字IC验证工程师数字后端设计工程师DFT设计工程师模拟IC设计工程师模拟版图设计工程师ATE芯片测试工程师嵌入式芯片工程师如何选择：https://xg.z...](https://www.zhihu.com/question/542487738/answer/2674342765)