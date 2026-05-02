---
title: "DDR1.LPDDR4 DQS VT drift理解"
source: "https://zhuanlan.zhihu.com/p/424702453"
author:
  - "[[西门电工欢迎来到我的IC小站，和我一起分享数字IC的乐趣吧~]]"
published:
created: 2026-05-02
description: "纲要 VT drift概念电路结构示意图工作原理计算方法1.VT drift概念 LPDDR4为了追求低功耗的数据，DQS和DQ在其内部是解耦的状态；DDR4我们知道，在DRAM接口上Write的时候DQS和DQ这样的一种时序关系，DQS toggle经过t…"
tags:
  - "clippings"
---
[收录于 · IC大杂烩~](https://www.zhihu.com/column/c_1398814942535925760)

16 人赞同了该文章

纲要

1.VT drift概念

[LPDDR4](https://zhida.zhihu.com/search?content_id=182508857&content_type=Article&match_order=1&q=LPDDR4&zhida_source=entity) 为了追求低功耗的数据， [DQS](https://zhida.zhihu.com/search?content_id=182508857&content_type=Article&match_order=1&q=DQS&zhida_source=entity) 和DQ在其内部是解耦的状态；DDR4我们知道，在DRAM接口上Write的时候DQS和DQ这样的一种时序关系，DQS toggle经过training之后是位于DQ总线上眼图的中间位置；

如图所示：

![](https://picx.zhimg.com/v2-13272db6b81a09d4f332530eaec2159f_1440w.jpg)

但是在LPDDR4中，在DRAM侧的接口上来看，经过training之后DQS和DQ之间是存在一个tDQS2DQ的相位差，不考虑preamble的影响。

如图所示：

![](https://pic3.zhimg.com/v2-e21e3fcf772b0f2060a6826927d8200a_1440w.jpg)

其从DRAM的接口上看是这样的时序，但是LPDDR4内部存在一个对DQS的延迟链，真正到达DQS采样DQ的逻辑处，其仍然能够保证DQS的toggle处于DQ总线眼图的中间位置；

但是由于tDQS2DQ的延迟buffer容易收到 [PVT](https://zhida.zhihu.com/search?content_id=182508857&content_type=Article&match_order=1&q=PVT&zhida_source=entity) 的影响，对于单独的DRAM设备而言，P不是变量，而应该由DRAM Vendor提供P的影响；因此VT的影响是 [PHY](https://zhida.zhihu.com/search?content_id=182508857&content_type=Article&match_order=1&q=PHY&zhida_source=entity) 需要去考量的，排除反温度效应的影响，V越大则tDQS2DQ越小，T越大则tDQS2DQ越大。因此T/V的值越大，则tDQS2DQ越大。

正因为如此，MC/PHY需要知道VT对tDQS2DQ具体的影响，从而可以准确的发送出满足相位关系的DQS/DQ，通过读取DRAM内部存储Cnt的MR便可。

2.电路结构示意图

对于DRAM中DQS延迟buffer和DQS OSC的示意图：

![](https://pic4.zhimg.com/v2-8f0831aa2dc67ca1a0b180754f8fcf2d_1440w.jpg)

3.工作原理

i.延迟buffer的作用是为了保证DQS能够采样到DQ总线的眼图中间位置；

ii.OSC的作用是在特定的时间内run\_time对延迟Buffer的toggle进行计数，从而可以从计数值来获取其延迟时间，run\_time越长则表示cnt的值越精确。

4.计算方法

直接参考 [JEDEC](https://zhida.zhihu.com/search?content_id=182508857&content_type=Article&match_order=1&q=JEDEC&zhida_source=entity) 的公式便可，由上述理论背景则不难理解其公式：

精度计算：

![](https://pic3.zhimg.com/v2-a52fb829a60e80baa9940885a67d89e6_1440w.jpg)

![](https://pic2.zhimg.com/v2-41981b218e46046850164dc2e1b3c0af_1440w.jpg)

T/V\_Dly曲线：

![](https://pic3.zhimg.com/v2-b57a8a3d834627ab1a9733bb4e7795da_1440w.jpg)

T/V越大则tDQS2DQ越大，简单解释：温度越高，数字电路器件的特性是dly变大，50nm工艺后存在一定的反温度效应，V指的供电电压，VDD越大则驱动越强，dly越小；

tDQS2DQ和Cnt的关系：

![](https://pica.zhimg.com/v2-c5fc65958cb917b80ecf9849646c93e2_1440w.jpg)

[所属专栏 · 2025-09-23 16:22 更新](https://zhuanlan.zhihu.com/c_1398814942535925760)

[![](https://picx.zhimg.com/v2-c5be1695771c4f9b442b5bde56e5e8e0_720w.jpg?source=172ae18b)](https://zhuanlan.zhihu.com/c_1398814942535925760)

[IC大杂烩~](https://zhuanlan.zhihu.com/c_1398814942535925760)

[

西门电工

46 篇内容 · 242 赞同

](https://zhuanlan.zhihu.com/c_1398814942535925760)

[

最热内容 ·

DFT1.OCC电路浅析

](https://zhuanlan.zhihu.com/c_1398814942535925760)

编辑于 2021-10-23 14:28[24届/25届想进IC设计的同学，建议最好有个拿手项目！](https://zhuanlan.zhihu.com/p/716583785)

[

\[图片\] 放眼整个IC行业，公司招聘最看重什么？无疑是项目经验了。 面试问的最多的是什么？是有项目经验没？有流片经历没？ 对初学者或新入行的朋友来讲，没有流片经历，项目经历，确实会...

](https://zhuanlan.zhihu.com/p/716583785)