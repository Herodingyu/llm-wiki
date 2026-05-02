---
title: "低功耗设计的RTL coding方法"
source: "https://zhuanlan.zhihu.com/p/23826707"
author:
  - "[[龚黎明​中央处理器 (CPU)等 2 个话题下的优秀答主]]"
published:
created: 2026-05-02
description: "今天讲一个可行度非常高的技术。 对于低功耗设计，跟前端设计人员有关系，但是似乎也没那么大关系。常用的低功耗技术就是clock gating，power gating，retention逻辑，以及SRAM的低电压retention，DVFS，另外还有…"
tags:
  - "clippings"
---
[收录于 · 半导学社](https://www.zhihu.com/column/stephen)

李一雷 等 145 人赞同了该文章

今天讲一个可行度非常高的技术。

对于低功耗设计，跟前端设计人员有关系，但是似乎也没那么大关系。常用的低功耗技术就是 [clock gating](https://zhida.zhihu.com/search?content_id=1716939&content_type=Article&match_order=1&q=clock+gating&zhida_source=entity) ， [power gating](https://zhida.zhihu.com/search?content_id=1716939&content_type=Article&match_order=1&q=power+gating&zhida_source=entity) ， [retention逻辑](https://zhida.zhihu.com/search?content_id=1716939&content_type=Article&match_order=1&q=retention%E9%80%BB%E8%BE%91&zhida_source=entity) ，以及 [SRAM](https://zhida.zhihu.com/search?content_id=1716939&content_type=Article&match_order=1&q=SRAM&zhida_source=entity) 的低电压retention，DVFS，另外还有的跟综合策略有关系，比如限制某些cell的使用，另外还有加工工艺这种不由设计者控制的事情。这些技术大部分我之前的文章里面都有简单的介绍。但是这些似乎很少跟RTL coding技巧有关系。

如果你问一个IC前端人员，当你写代码的时候，怎么保证你的模块功耗比较小？大部分能告诉你的无非就两点：

（1）对于寄存器，不工作的时候关掉clock。

（2）对于组合逻辑，减少其无谓的跳变。

（1）其实就是clock gating。这是最常用的也最受前端人员热爱的技术。写完代码之后也会review一下clock gating的覆盖率，看看有没有达到95%以上。

clock gating可以是设计人员手动在代码里面添加，也可以综合工具自动插入，这个叫做 [ICG clock gating](https://zhida.zhihu.com/search?content_id=1716939&content_type=Article&match_order=1&q=ICG+clock+gating&zhida_source=entity) ，这个之前也讲过。

（2）就比较玄乎了。

实际coding过程中，不会有人去check每个组合逻辑是不是跳变太多，有些多余的跳变，只要不干扰功能的正确性，没有人会去管。

比如说： a=b&c；

假如在一段时间内，b的值为0，那么a的值无疑肯定是0，那么c的跳变就是无意义的跳变。那么输出c信号的cell就是在做无用功，在浪费功耗。

可是组合逻辑不像寄存器，寄存器你只要关掉它的clock，它的输出就不会有任何跳变，就会只剩下静态功耗。组合逻辑没有clock端，与门没有时钟端，或门没有时钟端，MUX没有时钟端，你要关掉它，只能关掉给它提供输入的上一级寄存器源。

听起来，问题似乎都在寄存器端，只要做好了寄存器的clock gating，理论上就没事了啊，只要寄存器output保持不变，从该寄存器拿值的下一级的组合逻辑自然也就保持不变了，自然就没有动态功耗了。毕竟组合逻辑说到底也是上一级寄存器驱动的。

如果一个chip（注意是整个chip）所有的寄存器都让我把clock给停了，理论上不光里面的寄存器只剩下静态功耗，组合逻辑因为输入信号都是恒定值，输出也是保持不变的，不需翻转，也就只剩下静态功耗了。

![](https://pic4.zhimg.com/v2-cb6d7b5ee22d2eb2aa8e9f04760dd967_1440w.png)

那还需要讲啥？做好clock gating就行了呗。

问题在于，寄存器只能管它下级的组合逻辑，不能管它上级的组合逻辑。

假如关掉一个模块（注意是一个模块）的所有寄存器，这个模块的动态功耗是不是就一定就是0？

不是。

一个模块input上一个模块的输出数据，通常需要做一些逻辑运算，然后才会放入寄存器里面做存储，或者输出。下图是一个典型的模块。红色的圈圈代表组合逻辑，蓝色的方块代表寄存器。当你把这个模块的所有寄存器的clock全部关掉之后，后半部分的组合逻辑会因为输入恒定而不翻转，只剩下静态功耗。但是前半部分，直接从input接口拿数据的那部分仍然可能在翻转，成为漏网之鱼！

也就是说，停掉这个模块的clock并不能完全停掉这个模块的动态功耗，你还必须停掉这个模块的输入信号的跳变！这些输入信号从别的模块而来，别的模块可能仍在工作。

![](https://pic4.zhimg.com/v2-868cf9eb0ad32bd9a290cb573c8a06ef_1440w.jpg)

那怎么办？怎么彻底清掉这个模块的动态功耗呢？

将该模块的input弄成恒定值。

假如说一个模块，你可以停掉它的clock，那么理所当然的，你可以将其输入全部tie成恒定值。因为反正输入啥都不影响功能。

这就是我要讲的一个技巧：

当你的一个模块在某一段时间，完全不工作的时候，你可以：（1）在这段时间，关掉这个模块的clock。（2）检查这个模块的input，对还在跳变的input，将其全部tie成恒定值。这样才可以根除这个模块的动态功耗。

当然我只推崇这种模块级的检查。因为一个系统组合逻辑实在是太多，没有必要检查每一条assign语句是不是写得够干净，没有必要检查每个寄存器当它的clock被停掉时，它的D端是不是还在跳。只需要针对一个模块，如果一个模块的clock你可以停掉，那么再补一刀，将这个模块的input全部弄成恒定值，就会大大减少这个模块的动态功耗。

之所以将模块作为一个单元，检查组合逻辑的冗余跳变，也是因为模块本身的划分通常都是逻辑最窄的地方，属于主干，在这个地方做逻辑，效率最高。只需要tie住所有input，不管多大模块都可以变得十分平静，没有翻转。

希望大家学有所获~

欢迎大家关注我的微信公众号： **半导学社。**

还没有人送礼物，鼓励一下作者吧

编辑于 2020-08-20 07:08