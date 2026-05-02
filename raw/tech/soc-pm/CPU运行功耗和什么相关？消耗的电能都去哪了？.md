---
title: "CPU运行功耗和什么相关？消耗的电能都去哪了？"
source: "https://zhuanlan.zhihu.com/p/35120669"
author:
  - "[[老狼​新知答主]]"
published:
created: 2026-05-02
description: "很久很久以前，在邀请下，我收藏了一个问题： CPU的功耗和什么相关？为什么一个while(1);就可占满CPU的功耗？这个问题看起来有点傻，实际上也并不成立。一个while(1)最多可以让CPU某个逻辑内核占有率100%，而不会…"
tags:
  - "clippings"
---
[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog)

575 人赞同了该文章

很久很久以前，在邀请下，我收藏了一个问题：

这个问题看起来有点傻，实际上也并不成立。一个while(1)最多可以让CPU某个逻辑内核占有率100%，而不会让所有内核占有率100%，更不会让CPU达到TDP。

在我就要回答他，笑话他很傻很天真之前，忽然想到，那while(1)到底占了多少CPU功耗呢？这些功耗去哪里了呢？凡事就怕认真二字，如果仔细思考这个问题，就会发现和它相关的知识点很多。尤其在今天这个更加注重每瓦功耗的年代，知道原理，进而研究如何省电也就是应有之义了。

今天我们就来详细讨论一下CPU耗能的基本原理，它和什么相关等等问题。

## CPU耗能的基本原理

我在这篇颇受欢迎的文章里面介绍过基本原理：

我们将CPU简单看作场效应晶体管 [FET](https://zhida.zhihu.com/search?content_id=6238136&content_type=Article&match_order=1&q=FET&zhida_source=entity) 的集合。这么多个FET随着每一次的翻转都在消耗者能量。一个FET的简单示意图如下：

![](https://pica.zhimg.com/v2-303d17d16f6842a687b4874599e0809e_1440w.jpg)

当输入低电平时，CL被充电，我们假设a焦耳的电能被储存在电容中。而当输入变成高电平后，这些电能则被释放，a焦耳的能量被释放了出来。因为CL很小，这个a也十分的小，几乎可以忽略不计。但如果我们以1GHz频率翻转这个FET，则能量消耗就是a × 10^9，这就不能忽略了，再加上CPU中有几十亿个FET，消耗的能量变得相当可观。

从这里我们可以看出CPU的能耗和有多少个晶体管参与工作有关，似乎还和频率是正相关的。我们下面分别来看一下。

## 指令功耗

如果我们将CPU简单看作单核的，是不是运行while(1);就能让该CPU达到TDP呢？实际上并不会。每条指令所要调动的晶体管数目不同，而功耗是被调动晶体管功耗的总和。

《动物庄园》有一句话很经典：“所有动物生来平等 但有些动物比其他动物更平等”。是不是指令都是平等的呢？当然不是了，有些指令更平等！每条指令需要调动的晶体管数目有很大不同，一条新指令和已经在 [L1指令Cache](https://zhida.zhihu.com/search?content_id=6238136&content_type=Article&match_order=1&q=L1%E6%8C%87%E4%BB%A4Cache&zhida_source=entity) 中的指令也不同。一个简化版Hesswell CPU的流水线示意图如下：

![](https://picx.zhimg.com/v2-5feb159830e863bcdc36d54bc73b200d_1440w.jpg)

一个指令要不要调度运算器，要不要访问外存，要不要回写，在不在L1中都会带来不少的区别。综合下来，流水线中各个阶段的功耗饼图如下：

![](https://picx.zhimg.com/v2-1978bbc0d774d5b0aa1480f1d97d60eb_1440w.jpg)

可以看到Fetch指令和decode占据了大头，而我们的 **执行才占据%9** ！！while(1);编译完的指令们，这时已经在L1中，Fetch会节省不少能耗。这也是达成同样功能，ASIC很省电，而CPU很费电的原因:

![](https://pic3.zhimg.com/v2-046c9bea6c74afae3ce604ef99ae129c_1440w.jpg)

如果我们不讨论指令的差异，在平均意义上来看指令的功耗，它有个专有的名词：指令功耗（ [EPI](https://zhida.zhihu.com/search?content_id=6238136&content_type=Article&match_order=1&q=EPI&zhida_source=entity) ，Energy per Instruction）。

**EPI和CPU制程、设计息息相关** 。Intel的CPU在P4的EPI达到一个高峰，后来在注重每瓦功耗的情况下，逐年在下降：

![](https://pic4.zhimg.com/v2-246950c26fee6b773bc8d55f5aec6c75_1440w.jpg)

## 耗能和频率的关系

从图1中，也许你可以直观的看出，能耗和频率是正相关的。这个理解很正确，实际上能耗和频率成线性相关。能耗关系公示是(参考资料2)：

![](https://pic1.zhimg.com/v2-8e6a44f8e69f7925b63429b5d8643fec_1440w.jpg)

P代表能耗。C可以简单看作一个常数，它由制程和设计等因素决定；V代表电压；而f就是频率了。理想情况，提高一倍频率，则能耗提高一倍。看起来并不十分严重，不是吗？但实际情况却没有这么简单。

我们这里要引入 [门延迟](https://zhida.zhihu.com/search?content_id=6238136&content_type=Article&match_order=1&q=%E9%97%A8%E5%BB%B6%E8%BF%9F&zhida_source=entity) （Gate Delay）的概念。简单来说，组成CPU的FET充放电需要一定时间，这个时间就是门延迟。只有在充放电完成后采样才能保证信号的完整性。而这个充放电时间和电压负相关，即电压高，则充放电时间就短。也和制程正相关，即制程越小，充放电时间就短。让我们去除制程的干扰因素，当我们不断提高频率f后，过了某个节点，太快的翻转会造成门延迟跟不上，从而影响数字信号的完整性，从而造成错误。这也是为什么超频到某个阶段会不稳定，随机出错的原因。那么怎么办呢？聪明的你也许想到了超频中常用的办法：加压。对了，可以通过提高电压来减小门延迟，让系统重新稳定下来。

让我们回头再来看看公式，你会发现电压和功耗可不是线性相关，而是平方的关系！再乘以f，情况就更加糟糕了。我们提高频率，同时不得不提高电压，造成P的大幅提高！我们回忆一下初中学过的y=x^3的函数图：

![](https://pica.zhimg.com/v2-87102ddc7ce4c76d05bcd5960f918004_1440w.jpg)

Y在经过前期缓慢的提高后在a点会开始陡峭的上升。这个a就是转折点，过了它，就划不来了。功耗和频率的关系也大抵如此，我们看两个实际的例子：

![](https://pic2.zhimg.com/v2-8ec5a7a1ba5ef533363bb208c244c0c3_1440w.jpg)

i7-2600K频率和功耗的关系

![](https://pica.zhimg.com/v2-76abc3219d3f8e3aa12b724db4f74f26_1440w.jpg)

Exynos频率和功耗的关系

从ARM和X86阵营来看，他们能耗曲线是不是和幂函数图很像？

## 其他因素

一个while(1);最多让某个内核占有率100%，其他内核呢？CPU近期的目标是提供越来越精细的电源管理策略。原来不跑的部分就让它闲着，后来改成它降频运行，接着改成不提供时钟信号，这样犹嫌不足。现在CPU的电源管理由 [PMC](https://zhida.zhihu.com/search?content_id=6238136&content_type=Article&match_order=1&q=PMC&zhida_source=entity) 负责，它会完全切断不用部分的电路。

在操作系统层面，它会尽力将不用的内核设置成CState，从而让PMC等电源控制模块有足够的提示（hint）来关闭电源。更多CState的知识见：

## 结论

拉拉杂杂的说了这许多，我们可以看出，while(1);并不会耗掉整个CPU的TDP。就算一个内核，它的耗能也不会达到该内核的能耗上线（现在都是 [Turbo Mode](https://zhida.zhihu.com/search?content_id=6238136&content_type=Article&match_order=1&q=Turbo+Mode&zhida_source=entity) ，内核能耗上限是个动态的结果）。它可以把该内核拉入Turbo Mode的最高频率，但因为指令都在L1中，耗能也不会很高。

至于消耗的能量都到哪里去了，根据 [能量守恒定律](https://zhida.zhihu.com/search?content_id=6238136&content_type=Article&match_order=1&q=%E8%83%BD%E9%87%8F%E5%AE%88%E6%81%92%E5%AE%9A%E5%BE%8B&zhida_source=entity) ，一定是变成热量散发出去了。这个过程中也许会产生动能（风扇转动等等），光能（GPIO驱动LED发光），但在最后的最后，都会变成热能。

**其他CPU硬件文章：**

更多CPU电源管理的文章：

欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。同时欢迎大家给本专栏和公众号投稿！

![](https://pica.zhimg.com/v2-45479ebdd2351fcdcfb0771bd06fff3a_1440w.jpg)

用微信扫描二维码加入UEFIBlog公众号

**参考资料：**

\[1\] [comsol.com/blogs/havent](https://link.zhihu.com/?target=https%3A//www.comsol.com/blogs/havent-cpu-clock-speeds-increased-last-years/)

\[2\] [CPU power dissipation](https://link.zhihu.com/?target=https%3A//en.wikipedia.org/wiki/CPU_power_dissipation)

\[3\] [How small can CPUs get?](https://link.zhihu.com/?target=http%3A//computer.howstuffworks.com/small-cpu2.htm)

\[4\] [The Samsung Exynos 7420 Deep Dive - Inside A Modern 14nm SoC - Cheap PC hardware News &amp; Rumors](https://link.zhihu.com/?target=http%3A//www.turnhardware.net/%3Fp%3D9770)

\[5\] [arxiv.org/pdf/quant-ph/](https://link.zhihu.com/?target=https%3A//arxiv.org/pdf/quant-ph/9908043.pdf)

1 人已送礼物

编辑于 2018-05-09 23:58[硬件](https://www.zhihu.com/topic/19559524)[2026净热一体机怎么挑？内行人揭秘净热一体机5个关键点，看完再买，拒绝踩坑！！！](https://zhuanlan.zhihu.com/p/359480748)

[

你是不是装完净水器才发现： 宣传说的大流量，但接一杯水得等好几分钟？ 而本来厨房就寸土寸金，大块头净水器直接塞满了...

](https://zhuanlan.zhihu.com/p/359480748)