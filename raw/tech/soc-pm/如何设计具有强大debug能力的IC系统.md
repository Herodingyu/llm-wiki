---
title: "如何设计具有强大debug能力的IC系统"
source: "https://zhuanlan.zhihu.com/p/23938987"
author:
  - "[[龚黎明​中央处理器 (CPU)等 2 个话题下的优秀答主]]"
published:
created: 2026-05-02
description: "很多搞IC的盆友把注意力放在写代码上，但是对于写完代码之后的善后工作做得非常不到位，比如debug接口信号的选择和设计。不出bug还好，坑爹的就是芯片tapeout之后，做测试发现出了bug，需要debug的时候。 实际测试…"
tags:
  - "clippings"
---
[收录于 · 半导学社](https://www.zhihu.com/column/stephen)

116 人赞同了该文章

很多搞IC的盆友把注意力放在写代码上，但是对于写完代码之后的善后工作做得非常不到位，比如debug接口信号的选择和设计。不出bug还好，坑爹的就是 [芯片](https://zhida.zhihu.com/search?content_id=1761985&content_type=Article&match_order=1&q=%E8%8A%AF%E7%89%87&zhida_source=entity) tapeout之后，做测试发现出了bug，需要debug的时候。

实际测试中，经常会出现有一个问题需要跑十几个小时才能复现，但是由于你的模块debug信号设计不佳，想看的信号看不到，或者能看到但是不是最佳组合，导致需要用 [逻辑分析仪](https://zhida.zhihu.com/search?content_id=1761985&content_type=Article&match_order=1&q=%E9%80%BB%E8%BE%91%E5%88%86%E6%9E%90%E4%BB%AA&zhida_source=entity) 反反复复的抓信号来拼凑现场，然后来推断到底发生了啥。有时候 [关键信号](https://zhida.zhihu.com/search?content_id=1761985&content_type=Article&match_order=1&q=%E5%85%B3%E9%94%AE%E4%BF%A1%E5%8F%B7&zhida_source=entity) 看不了，会直接导致你无法得到确定性的bug原因，只能雾里看花的大概猜测是某个原因。

可以说，代码写的怎么样，直接决定你啥时候出bug，debug接口写的怎么样，直接决定你debug一个问题要多久。反正我见过的半个月泡在测试台debug一个问题的人很多。被老板push的要死要活的。

讲到具体怎么设计之前，我还是先讲一个自己的故事。

我进公司之初，负责一个模块，这个模块处于多个模块的中心，跟多个模块都有交互，就像下图这样。结果芯片测试的时候，一出问题基本都要看我的模块是个什么情况。因为只有看了我的模块，才能进一步快速确定朝谁那里甩锅。然后别人再想办法往下一级甩锅或者自己背锅。虽然背锅的那个人基本总不是我，但是坑爹的是不管出了啥bug，我都要被叫上去看现场。每回一看现场，我都得用逻辑分析仪（后面简称LA）抓debug pin，看完debug pin之后再做下一步该看谁的推论。

![](https://pic1.zhimg.com/v2-5491e88ca9041f3f69f71081da96070e_1440w.png)

使用过逻辑分析仪的童鞋都知道，那是一个很坑爹的玩意，有时候抓的不对，有时候没抓着，有时候现场每回抓都不一样，有时候一抓抓一天，你也不知道啥时候抓着。总之费时费力。

但是我也意识到有些人debug非常快。为什么呢？因为这帮狡猾的人把自己模块的debug信号做了一个CPU的read接口，可以用CPU将debug接口的值给读出来，这样，一到debug的时候，他们不需要用LA，只需要用CPU读几个寄存器，就可以成功摆脱嫌疑。

结果就是，出了bug，我跟那哥们一起去看现场，他用CPU读了几个 [寄存器](https://zhida.zhihu.com/search?content_id=1761985&content_type=Article&match_order=2&q=%E5%AF%84%E5%AD%98%E5%99%A8&zhida_source=entity) ，看了下值，说不关我的事，我的行为是对的，5分钟后走出了实验室。他走出门的时候，我刚把LA推出来开机，然后我花了一下午抓各种组合的信号，看完之后，我也说不管我的事，你们找谁谁谁再来看。虽然跟我无关，但是我浪费了一下午的时间。

这就是我要说的设计，对于SOC系统，将系统的debug接口做成CPU可读的寄存器，这样就可以极大的方便debug。因为用CPU读寄存器相比于抓LA是非常容易并且快速的。

简单来说，系统的架构如下：

涂红色的部分表示每个模块的debug信号。每个模块都有，整个chip因为pin数量有限，会通过一些MUX将这些debug信号通过pin输出。我们通常的debug方式是通过LA来抓chip的pin做debug，也就是图中的圈1的通路。而今天讲的就是增加一个圈2的通路。将这些debug信号做成CPU可读，就可以大大方便debug，同时也不需要增加多大的开销。

![](https://pic2.zhimg.com/v2-dd1bfd7af90c91d88a8a14d4b4049a17_1440w.jpg)

希望大家学有所获，做好 [coding](https://zhida.zhihu.com/search?content_id=1761985&content_type=Article&match_order=1&q=coding&zhida_source=entity) 的善后工作~

欢迎大家关注我的微信公众号： **半导学社。**

还没有人送礼物，鼓励一下作者吧

编辑于 2020-08-20 07:07