---
title: "power gating与clk gating"
source: "https://zhuanlan.zhihu.com/p/20447291"
author:
  - "[[龚黎明​中央处理器 (CPU)等 2 个话题下的优秀答主]]"
published:
created: 2026-05-02
description: "作为节省power的强有力手段，clk gating和power gating被广泛使用。所谓clk gating就是在模块不需要工作的时候关闭其clk，减少功耗。由于clk的loading往往很多，驱动大量的buffer和reg，翻转率又最高，所以关掉clk…"
tags:
  - "clippings"
---
[收录于 · 半导学社](https://www.zhihu.com/column/stephen)

46 人赞同了该文章

作为节省power的强有力手段， [clk gating](https://zhida.zhihu.com/search?content_id=361502&content_type=Article&match_order=1&q=clk+gating&zhida_source=entity) 和 [power gating](https://zhida.zhihu.com/search?content_id=361502&content_type=Article&match_order=1&q=power+gating&zhida_source=entity) 被广泛使用。所谓clk gating就是在模块不需要工作的时候关闭其clk，减少功耗。由于clk的loading往往很多，驱动大量的buffer和reg，翻转率又最高，所以关掉clk效果通常很明显。关掉之后，将没有任何 [动态功耗](https://zhida.zhihu.com/search?content_id=361502&content_type=Article&match_order=1&q=%E5%8A%A8%E6%80%81%E5%8A%9F%E8%80%97&zhida_source=entity) ，只有 [静态功耗](https://zhida.zhihu.com/search?content_id=361502&content_type=Article&match_order=1&q=%E9%9D%99%E6%80%81%E5%8A%9F%E8%80%97&zhida_source=entity) 。为了进一步节省功耗，更激进的办法是使用power gating，直接断掉区域供电，那么静态功耗将大大减少。

clk gating的优点在于设计简单，省电明显，clk停掉信息不丢失。power gating则更加复杂，但是省电效果也很明显，尤其是消费电子，要知道很多部件工作时间远远少于idle时间，所以节省静态功耗更有意义。power gating的缺点在于电源关闭之后信息会丢失，所以重新工作的时候，需要一段时间来准备，需要重新给电源网络供电，重新启动clk，重新配置模块，从而增大延时。

下面几张图很好的给出了使用clk gating的效果与使用power gating的效果。

第一张是做了cllk gating的，可以看到sleep之后只剩 [漏电流](https://zhida.zhihu.com/search?content_id=361502&content_type=Article&match_order=1&q=%E6%BC%8F%E7%94%B5%E6%B5%81&zhida_source=entity) ，但是没有唤醒延迟：

![](https://picx.zhimg.com/7a082aa7313150b47f18d32318847c75_1440w.png)

第二张图基于第一张做了power gating的，可以看到sleep之后，漏电流大大减少，但是唤醒延时增大了：

![](https://picx.zhimg.com/dbd94f8a3c943f6c664a861d97015479_1440w.png)

第三张图是实际的power gating带来的效果，可以看到sleep之后漏电流的减少有一个渐变的过程，也就是说并不是理想的：

![](https://pic3.zhimg.com/be1a8520005cc75acac5d127da3cace8_1440w.png)

那么怎么样既使用power gating减少静态功耗，又减少唤醒延时呢？

有机会再讲这种非常牛逼的技术。

欢迎大家关注我的微信公众号： **半导学社。**

还没有人送礼物，鼓励一下作者吧

编辑于 2020-08-20 07:18[表单是什么？表单和表格有何区别？](https://www.zhihu.com/question/266077661/answer/2939267363)

[

这不点我名儿了么，表单大师来告诉你，表单和表格有何区别表单和表格都是用于展示数据的方式，但它们在实际使用中有一些区别。表格通常是一个包含行和列的网格状结构，每一行代表一...

](https://www.zhihu.com/question/266077661/answer/2939267363)