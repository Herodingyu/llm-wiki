---
title: "低功耗设计基础：Power Gating详解"
source: "https://zhuanlan.zhihu.com/p/104415592"
author:
  - "[[阎浮提公众号：数字后端设计芯讲堂，分享芯片设计知识和资源]]"
published:
created: 2026-05-02
description: "在低功耗设计领域，最有效的降低功耗的手段莫过于电源关断了。其原因在于不论多低的电压，多小的电流，多慢的速度抑或多小的leakage，都不如将电源完全关闭来的彻底。 尽管如此，在实际设计中，由于power gating设…"
tags:
  - "clippings"
---
[收录于 · 数字IC后端设计工程师修炼之路](https://www.zhihu.com/column/c_149714285)

硅农 等 169 人赞同了该文章

在低功耗设计领域，最有效的降低功耗的手段莫过于电源关断了。其原因在于不论多低的电压，多小的电流，多慢的速度抑或多小的leakage，都不如将电源完全关闭来的彻底。

尽管如此，在实际设计中，由于power gating设计方法会极大地增加design的复杂度，从设计到验证，从后端实现到signoff方法学都有很多不同于一般设计的特点。

今天主要从逻辑构成和后端实现的角度介绍一下power gating的特点和原理。一个典型的带有power gating的设计，应该包含以下的主要模块：

![](https://pica.zhimg.com/v2-34a2f1e917351fe28ec9d6e9b29e8432_1440w.jpg)

power gating modules

power gating controller: 控制芯片中关断模块的电源何时关闭并给特殊的cell如retention register输出必要的使能信号；

[power switching fabric](https://zhida.zhihu.com/search?content_id=111333825&content_type=Article&match_order=1&q=power+switching+fabric&zhida_source=entity): 也称power switch, 实现电源关闭的逻辑单元，一般由后端实现阶段加入并按照一定规则摆放；

[always-on module](https://zhida.zhihu.com/search?content_id=111333825&content_type=Article&match_order=1&q=always-on+module&zhida_source=entity): 电源一直保持打开的模块；

isolation cells: 简称ISO，一般在关断模块->电源always-on模块方向的信号需要加入此类cell，具体作用将在后面解释；

[retention DFFs](https://zhida.zhihu.com/search?content_id=111333825&content_type=Article&match_order=1&q=retention+DFFs&zhida_source=entity): 特殊的register能够在主电源关断的情况下保持数据不丢失，只有当关断电源时仍然需要保留部分数据的时候才需要此类cell。

接下来我们分别从几个方面来介绍power gating的原理和特点。

## 关断方式

关断方式主要有两种：关闭VDD或者关闭VSS，二者的基本原理也很简单，如下图所示。在实际应用方面以关闭VDD为主，小编接触过的也全部都是关闭VDD的类型。

![](https://pica.zhimg.com/v2-102b0de236ebdcf4fd23cd42ebbd63c6_1440w.jpg)

一般来说在同一个芯片上只采用一种关断方式，也就是不会存在部分电路关断VDD而另一部分关断VSS的情形。至于具体如何实现关断呢？这就需要用到 [power switch cell](https://zhida.zhihu.com/search?content_id=111333825&content_type=Article&match_order=1&q=power+switch+cell&zhida_source=entity).

## Power Switch Cells

Power switch cell相当于一般电路中的开关，所不同的是，它们并不是由强电电路中的接触开关来实现连接和断开，而是依然通过CMOS电路构造来实现的。但是我们知道，一个MOS管所能通过的电流极其有限，而当需要关断一个或者多个模块的时候，所需要的电流值应该相对很大。因此power switch cell在使用的时候必然是大量cell协同工作的。

其工作方式也有不同的类型，典型的有以下两种：

![](https://pica.zhimg.com/v2-f72b096d6d0f38dc3145f84d50621916_1440w.jpg)

左侧的摆放方式是在需要关断的模块周围摆放一圈或者几圈switch cell并将其首尾相连，外部电源接到power switch的输入上，并将输出连接到模块内供电的高层金属，通过控制模块来控制switch来实现电源的开关；右侧的方法则将power switch cell像standard cell一样以固定的pattern分布在整个design中，电源的上层金属连接到power switch cell的输入端，输出端则连接到power rail上，通过断开rail与上层金属的连接来实现电源关断。

左侧的power switch cell摆放方式很像IO的排列，但是其cell大小一般来说比standard cell大却比IO cell小；右侧的switch cell一般和一般的standard cell差不多大小。

其实power switch的摆放并不局限于这两种摆放形势。当需要关断的模块比较小的时候，少量的switch cell即可实现开启关断，此时的cell摆放不必局限于某种特别的形式，只要保证连接正确，供电满足需求，将switch cell聚集在一起排列起来也没有问题。

关于power switch cell的连接方式，其实也有不同的形式，主要可以总结为以下几种形式，其中daisy chain形式为比较常见的方式。不同形式的摆放和连接方式在响应时间、涌浪电流（Inrush Current）、IR-Drop和占用面积等方面均有不同的特点，在此不做详述，后面有机会再另起文章研究。

![](https://pic1.zhimg.com/v2-77d13bf07b81bcbbfc9b715d12b6a290_1440w.jpg)

## Isolation Cell

当信号从一个模块传入另一个模块，如果输入端的电源关闭，则输出信号可能出现不可预测的数值，若此数值传递出去可能会导致功能出现问题。因此需要将电源关闭模块的输出信号和其他module隔离开来，这时候就需要用到isolation cell。

Isolation cell的作用在于将某个信号点位固定到高电位或低电位。其原理也很简单，基本上等同于AND或者OR门。

![](https://pic4.zhimg.com/v2-dc82a0ab27e512506438c1273c9751a7_1440w.jpg)

为了保证isolation cell能够在power down的时候仍然能够正常工作，一般来说isolation cell都会有一个primary power和一个secondary power，后者能够保证前者power down时器件仍然能够工作。

关于isolation cell的插入位置，我们需要决定是放在power gated模块(source 模块)内还是always-on模块(destination模块)内。由于某些信号从power gated 模块出去后可能达到多个不同的其他模块，如果插在destination 模块就可能需要在所有的destination都插入isolation，从而引起不必要的资源浪费，因此一般推荐放在source模块中。

不管放在那里，其power的连接都需要额外的注意。isolation放置的地方都需要gated power和always-on power同时存在并且物理和逻辑连接都正确，因此经常会把isolation cell指定一个固定的区域放置，可以选择在此区域中打上两种不同的power stripe和power rail来连接它们，抑或选择让工具以自动routing的方式将secondary power连接起来。后者主要在非先进工艺中才可能出现。

**Retention Register**

如果在电源关闭的过程中某些数据仍然不希望丢失，就需要用到retention寄存器来保存数据。它与一般寄存器最大的不同也是拥有两个不同的电源分别power 一个master和一个slave 锁存器。当master需要断电而数据需要保存的时候，将SAVE或者RETAIN信号送入retention register，从而能将数据从master输入slave锁存器。而slave锁存器通常会连接到always-on电源上以保证其能够正常工作。下面是两种典型的retention寄存器的构造：

![](https://pica.zhimg.com/v2-520c7b6149d7be0775201636b2835f7a_1440w.jpg)

从上述结构上看，retention register必然会比一般的register在size上要大一些，一般来说至少要大20%以上。因此，使用retention register需要特别注意它带来的额外的面积和功耗。当需要断电保存的数据过多时，retention cell带来的功耗可能会使整体的low power效果打折扣。

上述power gating的实现和特殊cell的电源连接，实现和验证，都需要 [UPF](https://zhida.zhihu.com/search?content_id=111333825&content_type=Article&match_order=1&q=UPF&zhida_source=entity) (Unified Power Format)的支持。后面我们会讲解一下典型的low power design中UPF中需要定义哪些内容，敬请关注。

**喜欢的话不要忘了点赞~**

如果大家有任何后端技术与职业发展方面的问题，抑或关于数字后端感兴趣的技术话题想要了解和探讨，欢迎关注我的知乎专栏：【 [数字IC后端设计工程师修炼之路](https://zhuanlan.zhihu.com/c_149714285?group_id=933402740021956608) 】

**重磅消息：小编亲自参与制作的数字后端ICC2实践课程上线网易云课堂啦！**

**本课程【数字IC后端设计ICC2完全实践】主要以实际操作的形式用Synopsys后端工具带大家从零开始完成一个后端设计小模块，包含后端实现、时序检查和物理验证等核心步骤的基础操作，以原生命令开始从头搭建流程完成设计，避免跑流程点按钮而得不到提高的问题，重点提高动手能力！现在可通过以下链接购买，加小编微信chen2mao2574还可领取大额优惠券，成功邀请同伴还可再享额外200元/人优惠，数量有限先到先得！**

往期文章：

[【阎浮提】低功耗设计基础：Multi-Bit Cell完全解析](https://zhuanlan.zhihu.com/p/57666742)

[【阎浮提】低功耗设计基础：Multi-Vth](https://zhuanlan.zhihu.com/p/53892494)

[【阎浮提】低功耗设计基础：Clock Gating](https://zhuanlan.zhihu.com/p/48159476)

[【阎浮提】低功耗设计基础：概念篇](https://zhuanlan.zhihu.com/p/47483274)

[【阎浮提】数字后端基础之：Noise详解](https://zhuanlan.zhihu.com/p/46814028)

[【阎浮提】7nm工艺中的后端设计挑战](https://zhuanlan.zhihu.com/p/44626414)

[【阎浮提】Cadence用户大会：Flexible H-Tree详解！](https://zhuanlan.zhihu.com/p/42525558)

[【阎浮提】后端基础概念：各种OCV一网打尽（下篇）！](https://zhuanlan.zhihu.com/p/40908692)

[【阎浮提】后端基础概念：各种OCV一网打尽（上篇）！](https://zhuanlan.zhihu.com/p/40293737)

[【阎浮提】数字后端基础技能之：Clock Tree Synthesis（CTS）下篇](https://zhuanlan.zhihu.com/p/41075732)

[【阎浮提】数字后端新概念：Inbound Cell是个啥？](https://zhuanlan.zhihu.com/p/39237650)

[【阎浮提】SNUG 2018热点之：机器学习终于来了！](https://zhuanlan.zhihu.com/p/38420811)

[【阎浮提】SNUG 2018热点之：所谓融合技术到底是啥？](https://zhuanlan.zhihu.com/p/37685881)

[【阎浮提】数字后端基础技能之：Clock Tree Synthesis（CTS）中篇](https://zhuanlan.zhihu.com/p/37918846)

[【阎浮提】数字后端基础技能之：Clock Tree Synthesis（CTS）上篇](https://zhuanlan.zhihu.com/p/36433282)

[【阎浮提】数字后端基本技能之：绕线Congestion怎么解？](https://zhuanlan.zhihu.com/p/36409628)

[【阎浮提】献给芯片设计新手：后端设计的基本流程是什么？](https://zhuanlan.zhihu.com/p/35520466)

[【阎浮提】数字后端基础之：芯片的整体功耗是如何计算出来的？](https://zhuanlan.zhihu.com/p/35327895)

[【阎浮提】后端Timing基础概念之：为何ICG容易出现setup violation？](https://zhuanlan.zhihu.com/p/34682304)

[【阎浮提】后端Timing基础概念之：为什么时序电路要满足setup和hold？](https://zhuanlan.zhihu.com/p/34253965)

[【阎浮提】后端Timing基本技能之：Hold Violation怎么修？](https://zhuanlan.zhihu.com/p/34254237)

[【阎浮提】后端Timing基本技能之：Setup Violation怎么修？](https://zhuanlan.zhihu.com/p/32713278)

还没有人送礼物，鼓励一下作者吧

编辑于 2022-06-15 20:09[2025双十一选购NAS必看！绿联NAS不同盘位怎么选？一篇文章告诉你，家庭、办公存储需求1-6盘位应该怎么选！](https://zhuanlan.zhihu.com/p/1969839883439808731)

[

为什么现在越来越多人从“网盘用户”转投NAS私有云？只因网盘存满了想扩容，一看年费要几百；开通了VIP，还有高速流量限制；存娃的成长照片或工作文件，总担心隐私泄露。我也不是说...

](https://zhuanlan.zhihu.com/p/1969839883439808731)