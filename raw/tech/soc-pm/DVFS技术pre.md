---
title: "DVFS技术pre"
source: "https://zhuanlan.zhihu.com/p/20463360"
author:
  - "[[龚黎明​中央处理器 (CPU)等 2 个话题下的优秀答主]]"
published:
created: 2026-05-02
description: "这回讲的DVFS（动态电压频率调整）技术，相比于普通的clk gating，power gating等技术，在低功耗这块更加激进，因为它需要在系统运行中，根据当前的任务场景推算接下来的任务对性能的需求，并动态调整电压和频率，…"
tags:
  - "clippings"
---
[收录于 · 半导学社](https://www.zhihu.com/column/stephen)

75 人赞同了该文章

这回讲的DVFS（动态电压频率调整）技术，相比于普通的 [clk gating](https://zhida.zhihu.com/search?content_id=368010&content_type=Article&match_order=1&q=clk+gating&zhida_source=entity) ， [power gating](https://zhida.zhihu.com/search?content_id=368010&content_type=Article&match_order=1&q=power+gating&zhida_source=entity) 等技术，在低功耗这块更加激进，因为它需要在系统运行中，根据当前的任务场景推算接下来的任务对性能的需求，并动态调整电压和频率，这需要更加复杂的控制，在设计流程上也要复杂的多，并且会对DFT带来很大麻烦。

这些我们通通不讲，只讲一点基础。

我们都知道 [CMOS](https://zhida.zhihu.com/search?content_id=368010&content_type=Article&match_order=1&q=CMOS&zhida_source=entity) 功耗分为 [动态功耗](https://zhida.zhihu.com/search?content_id=368010&content_type=Article&match_order=1&q=%E5%8A%A8%E6%80%81%E5%8A%9F%E8%80%97&zhida_source=entity) 与 [静态功耗](https://zhida.zhihu.com/search?content_id=368010&content_type=Article&match_order=1&q=%E9%9D%99%E6%80%81%E5%8A%9F%E8%80%97&zhida_source=entity) 。动态功耗与频率和电压的平方成正比，静态功耗与电压和 [漏电流](https://zhida.zhihu.com/search?content_id=368010&content_type=Article&match_order=1&q=%E6%BC%8F%E7%94%B5%E6%B5%81&zhida_source=entity) 成正比。所以降频可以减少动态功耗，降压既可以减少动态功耗也可以减少静态功耗。

可是多想一点，降频真的可以降低功耗吗？

我们知道任务这个东西，所需要执行的指令是一定的。降频可以让任务变慢，单位时间消耗的功率降低，但是任务的执行时间却延长了。频率降低一半，动态功率可以降低一半，任务时间却成了两倍，所以真实的功耗并不会减少。如果考虑到静态功耗，其实总功耗是增加的。所以说单纯降频是没有用的。

那DVFS技术如何做到省电？

关键点在于频率和电压是相关的。降频之后，紧接着就可以降压。频率一降，电路的时序就会宽松很多，就可以降压，充分利用时序裕量。电压跟动态功耗是二次方关系，与静态功耗是一次方关系，所以一降压立刻可以大大减小功耗。

所以，DVFS技术必须是电压和频率联调，只调电压不行，只调频率也不行。调频率只是预备步骤，真正省电是因为调了电压。

不过要注意，进出省电模式操作顺序是不一样的：进入省电模式，需要先调低频率，然后降低电压。恢复到正常模式，需要先提高电压，然后提高频率。想一想为什么？

如果有学到东西就点个赞吧。

欢迎大家关注我的微信公众号： **半导学社。**

还没有人送礼物，鼓励一下作者吧

编辑于 2020-08-20 07:17[干货分享｜K8s 持久化存储怎么做？这本电子书带你从入门到选型](https://zhuanlan.zhihu.com/p/664899260)

[

随着信息化转型的不断深入，越来越多的企业开始以容器和 Kubernetes 支持中间件、数据库和生产环境业务应用。这些使用场景中...

](https://zhuanlan.zhihu.com/p/664899260)