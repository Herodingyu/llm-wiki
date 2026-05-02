---
title: "ATE如何测试SoC的功耗指标"
source: "https://zhuanlan.zhihu.com/p/36510007"
author:
  - "[[李涛“百无一用是书生”，从事半导体测试工作良久，喜爱也厌恶它]]"
published:
created: 2026-05-02
description: "随着移动通讯和物联网的发展普及，低功耗成为越来越多设备的KPI。关于低功耗的SOC设计有许多文章，作为简单易懂的科普文章推荐一下blog （数字IC）低功耗设计入门（一）--低功耗设计目的与功耗的类型 - IC_learner…"
tags:
  - "clippings"
---
[收录于 · 半导体ATE测试](https://www.zhihu.com/column/c_1156987034848710656)

12 人赞同了该文章

随着移动通讯和 [物联网](https://zhida.zhihu.com/search?content_id=6794940&content_type=Article&match_order=1&q=%E7%89%A9%E8%81%94%E7%BD%91&zhida_source=entity) 的发展普及，低功耗成为越来越多设备的KPI。关于低功耗的SOC设计有许多文章，作为简单易懂的科普文章推荐一下blog [（数字IC）低功耗设计入门（一）--低功耗设计目的与功耗的类型 - IC\_learner - 博客园](https://link.zhihu.com/?target=http%3A//www.cnblogs.com/IClearner/p/6893645.html) 。ATE测试越来越强调如何最大限度的降低功耗，本文作为引文讨论如何准确测试功耗。

## 什么是功耗

Soc的总功耗可以简单的分为 [静态功耗](https://zhida.zhihu.com/search?content_id=6794940&content_type=Article&match_order=1&q=%E9%9D%99%E6%80%81%E5%8A%9F%E8%80%97&zhida_source=entity) 和动态功耗

```
TICC（Total power） = SICC（Static power） + DICC（Dynamic Power）
```
- Static power

主要是指 [半导体](https://zhida.zhihu.com/search?content_id=6794940&content_type=Article&match_order=1&q=%E5%8D%8A%E5%AF%BC%E4%BD%93&zhida_source=entity) pn节在voltage bias下的leakage current，该电流主要决定于Vth，Tj和Vdd。随着工艺节点的下探Vth降低，leakage电流反比增加；junction温度Tj上升，leakage电流同比增加； [power rail](https://zhida.zhihu.com/search?content_id=6794940&content_type=Article&match_order=1&q=power+rail&zhida_source=entity) 的电压越高，leakage同比增加。

在目前nm节点Vth大约在0.3v~0.4v左右(leakage＋)，power rail在0.8v左右(leakage－)，但考虑到工艺节点下探单位面积门的数量急剧增加，leakage电流在总电流的比重增加。leakage电流每20度double的特性，在SoC执行high load应用时，Tj迅速升高－>leakage增加－>Tj增高，这种正反馈有可能导致thermal runaway。

```
Ileak = I0*exp(ST*T) 
 I0: T=0 leakage current; ST is temperature dependency coef
```
![](https://pic3.zhimg.com/v2-0c65f22117fa5c3f3ce9ca2ff215baae_1440w.jpg)

- dynamic power

Dynamic power是门翻转驱动后面的 [容性负载](https://zhida.zhihu.com/search?content_id=6794940&content_type=Article&match_order=1&q=%E5%AE%B9%E6%80%A7%E8%B4%9F%E8%BD%BD&zhida_source=entity) 引起的，主要和工作频率，翻转门数(等效驱动负载Cdyn)和 [工作电压](https://zhida.zhihu.com/search?content_id=6794940&content_type=Article&match_order=1&q=%E5%B7%A5%E4%BD%9C%E7%94%B5%E5%8E%8B&zhida_source=entity) 相关。这种翻转引起的电流不随温度变化。

- Rush through电流

以pmos和 [nmos](https://zhida.zhihu.com/search?content_id=6794940&content_type=Article&match_order=1&q=nmos&zhida_source=entity) 组成的inverter为例，当输入0<－>1翻转时有一个短暂时间pmos和nmos同时导通引起大的rush through电流。该电流和leakage电流相似，反比于Vth，正比于Tj和Vdd。

![](https://pic3.zhimg.com/v2-d0c3d46d60fec01f3aaec5e79089e2c4_1440w.jpg)

一般Rush-Through电流是瞬时的，一般平均到整个active时间作为dynamic current的一部分，用等效Cdyn来计算

dicc= Freq \* Cdyn \* Voltage

- Cdyn是什么

dicc可以等效看做gate，wiring和plane之间的寄生电容充放电引起的。gate的等效电容如下计算。一般而言GND/VDD plane之间的电容以及信号走线的电容要远小于gate的 [寄生电容](https://zhida.zhihu.com/search?content_id=6794940&content_type=Article&match_order=2&q=%E5%AF%84%E7%94%9F%E7%94%B5%E5%AE%B9&zhida_source=entity) 。

```
Capacitance = E*（W*L）/D
```

因此Cdyn受以下因素影响：

1. 工艺越先进单个门的capacitance会减少，但单位面积的门数增加导致Cdyn增加。两个因素叠加后决定Cdyn的范围；
2. Cdyn决定于翻转的门数，也一般叫active factor；
![](https://pic2.zhimg.com/v2-47a4d3615cdc73439e218771c91f7df5_1440w.jpg)

## 如何测试功耗

简单讨论ATE如何测试功耗以及如何 [预测系统](https://zhida.zhihu.com/search?content_id=6794940&content_type=Article&match_order=1&q=%E9%A2%84%E6%B5%8B%E7%B3%BB%E7%BB%9F&zhida_source=entity) 应用的功耗。

- static power measurement

ATE pattern需要先power up chip，然后disable所有的 [power gating](https://zhida.zhihu.com/search?content_id=6794940&content_type=Article&match_order=1&q=power+gating&zhida_source=entity) (包括memory的)以保证外部power rail可以直接supply所有内部的logic。

需要注意的一点是：因为SICC受Tj影响很大，测量SICC的同时需要测量Tj。所以DFT需要保证Tj可以容易的用内部temperature sensor测试，否则就只能简单使用外部提供的温度，但会带来额外的误差

- dynamic power measurement

一般SoC产品会根据application定义一些典型应用的user cases的功耗KPI，ATE 需要定义对应的pattern去测量这些KPI。一般ATE pattern受测试时间以及DFT的限制，无法完全等效application的user case，在翻转门数上有很大区别。所以需要做ATE DICC 和 system DICC的correlation，目标是得到等效Cdyn和AF （active factor）可以将ATE dicc计算成system的dicc。

DICC是无法直接测量的，只能测试SICC和TICC = SICC+DICC，然后反算出DICC。如下图为例，该方式的主要问题是单独SICC测试的时候Chip Tj会相对低一些，导致反算的DICC偏高。

一般的改进方式如下：

- 用一些skew lot做SICC的characterization;

在多个温度点单独测试SICC，由测试数据推出函数SICC =Fsicc（Vdd,Tj,ref\_sicc)

- 针对每一个device，先单独测试SICC和对应的Tj1；
- 执行DICC pattern测试TICC，并且测试相应的Tj2。使用char得到的SICC公式，用Tj1的SICC计算Tj2的SICC，然后反算出DICC
![](https://pica.zhimg.com/v2-61fe1b3d3c527a3e63c1fbe17a33d8d6_1440w.jpg)

得到DICC之后可以容易的计算出Cdyn。

```
Cdyn = dicc/（Freq*Voltage）
```

在和system usercase进行correlation之后，一般会计算AF（active factor）去表征work load的不同带来的dicc的不同。

```
dicc_system = Cdyn * Freq * Voltage * AF + offset
```

如上文所述， SICC characterization可以方便的计算出各个（Tj， vdd) 的SICC, 同时得到Cdyn和AF后system的dicc也可以方便的计算出来，因此TICC也就很容易算出来。因为ATE是测试每一个出厂芯片的，所以每一个芯片的user case的TICC都可以根据ATE的SICC和DICC计算出来，如果某个芯片的TICC太大就可以方便的bin out，避免太hot的芯片deliver到custom引起thermal runaway。

本文只是简要的介绍了ATE的 [功耗测试](https://zhida.zhihu.com/search?content_id=6794940&content_type=Article&match_order=1&q=%E5%8A%9F%E8%80%97%E6%B5%8B%E8%AF%95&zhida_source=entity) ，没要涉及dvfs （dynamic voltage frequency scale）以及 per-part Vmin导致的工作电压不同功耗计算问题。但以管窥豹，核心是理解SICC和DICC的概念，受什么因素影响，以及如何做跨系统的 [correlation](https://zhida.zhihu.com/search?content_id=6794940&content_type=Article&match_order=3&q=correlation&zhida_source=entity) 。

编辑于 2019-09-18 22:11[为什么不建议自学PMP？一文看懂！](https://zhuanlan.zhihu.com/p/668486685)

[

2023年，PMP考试真是犹如换了个模样，新考纲和新教材一出，考试内容大变样。尤其是那个敏捷题，占了大约50%。所以，想要...

](https://zhuanlan.zhihu.com/p/668486685)