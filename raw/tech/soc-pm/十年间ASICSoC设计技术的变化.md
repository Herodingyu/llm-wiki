---
title: "十年间ASIC/SoC设计技术的变化"
source: "https://zhuanlan.zhihu.com/p/24412897"
author:
  - "[[Forever snow​芯片（集成电路）话题下的优秀答主]]"
published:
created: 2026-05-02
description: "我将从工艺、数字后端、数字前端、验证、高层次综合几个方面进行比较。 大神摩尔镇楼！ 工艺 * 这十年集成电路的发展基本遵循了“摩尔定律” 当价格不变时，集成电路上可容纳的元器件的数目，约每隔18-24个月便会…"
tags:
  - "clippings"
---
[收录于 · 观芯志](https://www.zhihu.com/column/c_56408722)

不坠青云之志 等 111 人赞同了该文章

我将从工艺、 [数字后端](https://zhida.zhihu.com/search?content_id=1951787&content_type=Article&match_order=1&q=%E6%95%B0%E5%AD%97%E5%90%8E%E7%AB%AF&zhida_source=entity) 、数字前端、验证、高层次综合几个方面进行比较。

大神摩尔镇楼！

![](https://picx.zhimg.com/v2-e39412efa5a5a5e3070fa61e2b3f03ad_1440w.jpg)

工艺  
\* 这十年集成电路的发展基本遵循了“摩尔定律”  
当价格不变时，集成电路上可容纳的元器件的数目，约每隔18-24个月便会增加一倍，性能也将提升一倍。  
  
![](https://pic3.zhimg.com/v2-39f4250949816d3de6bd37afa5b6ff0e_1440w.jpg)

\* 十年前我们还在讨论， [硅工艺](https://zhida.zhihu.com/search?content_id=1951787&content_type=Article&match_order=1&q=%E7%A1%85%E5%B7%A5%E8%89%BA&zhida_source=entity) 的极限是40nm，还是28nm。

今天我们在讨论，硅工艺的极限是不是5nm？

\* 十年前我们还不考虑芯片走线之间的SI （ [信号完整性](https://zhida.zhihu.com/search?content_id=1951787&content_type=Article&match_order=1&q=%E4%BF%A1%E5%8F%B7%E5%AE%8C%E6%95%B4%E6%80%A7&zhida_source=entity) ）。

今天SI的影响，变成了 [影响线](https://zhida.zhihu.com/search?content_id=1951787&content_type=Article&match_order=1&q=%E5%BD%B1%E5%93%8D%E7%BA%BF&zhida_source=entity) 延时的主要因素之一。

![](https://pic3.zhimg.com/v2-3af1dc9c2ba289769de4aa68aad5ec1c_1440w.jpg)

\* 十年前我们还在讨论，哪种MOS的结构才是未来。

今天FINFET晶体管，已经在16nm已下广泛使用，我们在讨论未来代替它的结构式是管状晶体管，还是超浅沟道晶体管？

![](https://picx.zhimg.com/v2-b0269fefea8bdeee851093ff7952f3e7_1440w.jpg)

\* 十年前我们还在讨论，如何使刻线的尺寸达到更小。

今天我们开发了 double pattern 技术， triple pattern技术， [自对准技术](https://zhida.zhihu.com/search?content_id=1951787&content_type=Article&match_order=1&q=%E8%87%AA%E5%AF%B9%E5%87%86%E6%8A%80%E6%9C%AF&zhida_source=entity) ，等等。工艺复杂度是之前的很多倍。

\*十年前后端设计中，主要的延时还是来自于基本单元。

在今天，14nm，10nm的节点，线上的延时已经占了总延时的30%以上。

\*十年前芯片内部的可靠性检查还不多。

在今天，ESD ([Electro-Static discharge](https://zhida.zhihu.com/search?content_id=1951787&content_type=Article&match_order=1&q=Electro-Static+discharge&zhida_source=entity)), EM(电子迁移) 等可靠性检查，成为必须检查的部分。

![](https://pic1.zhimg.com/v2-203a5533ceee79bf0a4be74818674c16_1440w.jpg)

\*十年前 [低功耗设计](https://zhida.zhihu.com/search?content_id=1951787&content_type=Article&match_order=1&q=%E4%BD%8E%E5%8A%9F%E8%80%97%E8%AE%BE%E8%AE%A1&zhida_source=entity) 概念刚刚进入大家的视野。

在今天，low power design 已经成为各大公司的标配。

在现在性能过剩的时代，大家都在比拼到底谁的功耗更低。

\*十年前光刻当中的光 [衍射效应](https://zhida.zhihu.com/search?content_id=1951787&content_type=Article&match_order=1&q=%E8%A1%8D%E5%B0%84%E6%95%88%E5%BA%94&zhida_source=entity) 对于光刻没有什么影响。

在今天，光刻检查（Lithography Friendly Design rules）已经成为了必要的检查。

前端设计角度：

\*十年前，VHDL语言和VERILOG语言还能平分秋色。

现在VERILOG语言的普及率已经远远超过VHDL.

\*十年前，电路性能只关注两个指标：时钟频率和面积。

在现在，不提供 [电路功耗](https://zhida.zhihu.com/search?content_id=1951787&content_type=Article&match_order=1&q=%E7%94%B5%E8%B7%AF%E5%8A%9F%E8%80%97&zhida_source=entity) 就是在耍流氓。

.\*十年前，ARM总线搞定一切总线互连

在现在， [异构多核架构](https://zhida.zhihu.com/search?content_id=1951787&content_type=Article&match_order=1&q=%E5%BC%82%E6%9E%84%E5%A4%9A%E6%A0%B8%E6%9E%B6%E6%9E%84&zhida_source=entity) 的巨大需求使得NoC技术迅速推进并应用。

![](https://picx.zhimg.com/v2-52f3894119d347b392a7465bfd69fda9_1440w.jpg)

验证

\*十年前，前端工程师自己就可以手动用verilog验证。

在现在，验证工程师比前端工程师还多

高层次综合

\*十年前， [硬件描述语言](https://zhida.zhihu.com/search?content_id=1951787&content_type=Article&match_order=1&q=%E7%A1%AC%E4%BB%B6%E6%8F%8F%E8%BF%B0%E8%AF%AD%E8%A8%80&zhida_source=entity) 已经成为主流

在现在，高层次综合已经在xilinx等几个厂商的领导下，逐步推进

也许未来，Verilog也会跟手动画图的方式一样被淘汰。

![](https://pic2.zhimg.com/v2-f1124032a17c45c4ad6281dcdd14f531_1440w.png)

最后关于微电子行业的更多信息，请关注我近期的知乎Live

1、半导体先进工艺下挑战：

[知乎 Live 入口](https://zhihu.com/lives/789127697296019456?utm_campaign=zhihulive&utm_source=zhihucolumn&utm_medium=Livecolumn)

2、你不了解的微电子行业：

[Forever snow的 Live －－ 你不了解的微电子行业 - Forever snow的文章 - 知乎专栏](https://zhuanlan.zhihu.com/p/22321813?refer=zhihulive)

还没有人送礼物，鼓励一下作者吧

编辑于 2016-12-16 22:25[测试工程师岗位招聘的新方向，赢麻了！（附转型关键策略+保姆级资源）](https://zhuanlan.zhihu.com/p/1977810568351015550)

[

2025年AI测试岗真的爆了！岗位薪资普篇高出传统测试一大截！大厂给出 高薪挖人！成为一名高薪的AI测试需要技术、...

](https://zhuanlan.zhihu.com/p/1977810568351015550)