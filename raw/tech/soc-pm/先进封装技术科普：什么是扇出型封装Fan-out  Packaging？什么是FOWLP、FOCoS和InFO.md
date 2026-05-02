---
title: "先进封装技术科普：什么是扇出型封装Fan-out  Packaging？什么是FOWLP、FOCoS和InFO?"
source: "https://zhuanlan.zhihu.com/p/477211120"
author:
  - "[[老狼​新知答主]]"
published:
created: 2026-05-02
description: "前不久，先进封装的底层技术，也是Chiplet的关键技术之一，小芯片互联技术UCIe（Universal Chiplet Interconnect Express）公布了第一个版本 [1]。UCIe从Intel高级接口总线 (AIB) 技术发展而来，是一种裸片（Die）…"
tags:
  - "clippings"
---
[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog)

217 人赞同了该文章

目录

前不久，先进封装的底层技术，也是Chiplet的关键技术之一，小芯片互联技术UCIe（Universal Chiplet Interconnect Express）公布了第一个版本 [^1] 。UCIe从Intel高级接口总线 ([AIB](https://zhida.zhihu.com/search?content_id=194178181&content_type=Article&match_order=1&q=AIB&zhida_source=entity)) 技术发展而来，是一种裸片（Die）互联技术。它规定了裸片的凸块间距（bump pitch）、电气信号和上层协议（PCIe和CXL）等，但对于Die dumb之间的互联技术则保持中立，由此它可以和现在流行的很多先进封装技术相容，如Intel的EMIB，或是本文要介绍的扇出型封装技术。

通过UCIe Spec（大家可以在官网 [^1] 注册申请下载，免费），大家可以深入学习到本专栏之前介绍的很多封装技术、芯片制造概念和标准协议，如：

但有些关键技术本专栏还未有涉及，如：什么是Retimer？什么是PHY和Controller？什么是SERDES和transceiver？以及Spec多处引用的扇出型封装概念（ [FOCoS](https://zhida.zhihu.com/search?content_id=194178181&content_type=Article&match_order=1&q=FOCoS&zhida_source=entity) ， [InFO](https://zhida.zhihu.com/search?content_id=194178181&content_type=Article&match_order=1&q=InFO&zhida_source=entity) ），它和EMIB到底哪个高级？厘清这些概念有助于我们理解UCIe，也可以帮助我们理解Intel IDM 2.0将要向何处去。为此，在展开介绍UCIe之前，我们先一个个了解一下这些背景技术，今天就从扇出型封装讲起。

## 什么是扇出型封装？

扇出型封装最近越来越火热，尤其Apple的A10/A11/A12系列CPU经过台积电诸多扇出型封装技术加持，iPhone大放异彩之后，越来越多的人在讨论扇出型封装，甚至很多封装技术在向扇出型封装技术靠，也说自己是扇出型封装。为了避免引起混淆，本文先介绍无基板扇出型封装Fan-out Wafer Level Packaging（ **[FOWLP](https://zhida.zhihu.com/search?content_id=194178181&content_type=Article&match_order=1&q=FOWLP&zhida_source=entity)** ），它特指无基板（Substrate，载板、衬板等），直接将裸片通过 [RDL](https://zhida.zhihu.com/search?content_id=194178181&content_type=Article&match_order=1&q=RDL&zhida_source=entity) （重布线层，redistribution layer）扇出到芯片凸块Bump层。再介绍它和 **FOCoS** 、 **InFO** 的区别，层层推进，有助于大家理解相关概念。那么什么是扇出？什么是Wafer Level Packaging？

### 什么是Wafer Level Packaging？

WLP和传统封装工艺有很大不同：

![](https://picx.zhimg.com/v2-6afeebd8c0ac47c3c670ea1ca8553d6b_1440w.jpg)

传统封装是先切片，在一个个单独封装；而WLP往往是一个晶圆Wafer整体经过封装，封装好了，再进行切片。在Wafer这么大的尺度上进行后续封装，对应力、对齐、切割等等造成很大的挑战，也诞生了数量巨大的专利来应对这些挑战。这里就不展开讲了。其他封装技术还有wirebond（占有率高，古老但成本低）, flip-chip（常用于BGA封装）等，如果大家感兴趣，可以在文后留言，如果需求众多，我可以单独再讲。

### 什么是扇出Fan-out？

扇出对应着扇入，它们并不是在芯片工业发明的新名词，在电路制作中也有。这里的扇入和扇出是指导出的凸点Bump是否超出了裸片Die的面积，从而是否可以提供更多IO：

![](https://pic3.zhimg.com/v2-0db09f41feef1aa7345aa29fc4ebbe92_1440w.jpg)

来源：ASE

左边的扇入型封装Fan-In一般称作CSP（chip-scale packaging），即IO Bump一般只在Die/Chip投影面积内部；而右边扇出型则超出了裸片面积，从而提供了更多的IO Bump。

### 第一代FOWLP：eWLB

第一代大规模量产的FOWLP是由英飞凌（后被Intel收购）2007年开发的嵌入式晶圆级球阵列（eWLB, Embedded Wafer Level Ball Grid Array）,它实际上是一种Die First Face Down FOWLP工艺：

![](https://pica.zhimg.com/v2-003c5448115f4d7a0fd308feef964786_1440w.jpg)

最左面是eWLB工艺：首先将Die面朝下放在带有键合胶的临时基板上；第二步覆盖塑封材料；第三步通过紫外线移除键合胶和临时基板；最后在Die上直接做RDL层和锡球。当然最后还有个切割工艺，如图示这种可以切割成两个成品芯片。

RDL层是其中比较关键的一环，它通过在Die表明沉积金属层和绝缘层形成电路，将IO扇出到Die面积之外，是扇出的主要功臣。一般采用高分子薄膜材料和Al/Cu金属化布线。

eWLB工艺开始用于英飞凌的基带芯片，因为获得成功，乃至于现在还在广泛使用，是很多小芯片的封装方式。高通也是这种技术路线。它还有很多变种，根据Die的先后（Die First，Die Last），Die是向上还是向下（FaceUp，FaceDown）有很多不同工艺。比较有名的是更早出现的飞思卡尔（Freescale，后被NXP收购）的 [RCP](https://zhida.zhihu.com/search?content_id=194178181&content_type=Article&match_order=1&q=RCP&zhida_source=entity) （Redistributed Chip Packaging，2006）工艺，NXP主要是这种技术路线。还有稍后出现的 [M-Series](https://zhida.zhihu.com/search?content_id=194178181&content_type=Article&match_order=1&q=M-Series&zhida_source=entity) ，它是一种Face Up Die First工艺，也就是图中的中间的工艺。它的出现有助于解决精确对齐的问题。

## 其他的扇出封装

Fan-out可以不仅仅用塑封材料，也可以用基板（substrate），从而将扇出型封装扩展出另外一种：Fan-Out Chip on Substrate（FOCoS）。FOWLP也可以和其他3D封装技术混合使用，如台积电的 [InFO-PoP](https://zhida.zhihu.com/search?content_id=194178181&content_type=Article&match_order=1&q=InFO-PoP&zhida_source=entity) [^2] （Integrated Fan-Out Package on Package）,这种技术应用在A10 CPU中，并随着IPhone7而声名大噪。后面我们就来看看他们都是什么。

### 什么是FOCoS？

Fan-Out Chip on Substrate，顾名思义，就是利用Die的基板，进行扇出操作，电路是通过封装的基板进行扩展，而扇出到Die面积之外：

![](https://picx.zhimg.com/v2-7a9acbfe84ae54f05969604586f234a1_1440w.jpg)

来源：ASE

它和FOWLP的关键区别是RDL是在哪里。FOCoS的RDL是在基板上，也就是基板是保留的，锡球最后也是植入在基板上的，这和FOWLP的无基板区别很大。FOCoS也分为Die First和Die Last两种。

### 什么是InFO-PoP？

台积电的Integrated Fan-Out Package on Package是FOWLP和Package on Package的合体。台积电产的A10芯片如下：

![](https://pic4.zhimg.com/v2-0556c3af31c674145e69cd569f595c85_1440w.jpg)

来源：参考资料2

可以看出下面部分是FOWLP，而上面堆叠了一个DRAM芯片，DRAM的IO通过TIV (Through InFO Via)透过塑封材料，连接下面的锡球。

## 结语

好了，我们回头来看UCIe Spec 1.0中相关部分。它目前兼容传统的2D封装：

![](https://pica.zhimg.com/v2-1f7e6be1f3b06f13794e59b883f88ba0_1440w.jpg)

来源：参考资料1

也兼容目前所谓的2.5D封装：

![](https://pic1.zhimg.com/v2-14686e43daeed44107ba5714e53245ca_1440w.jpg)

来源：参考资料1

上面两个分别是EMIB和Interposer的方式，大家可以参考我的EMIB的文章。下面是今天介绍的FOCoS。

**更多的先进封装技术，敬请期待后文。**

最后推荐两款不错的CPU：

欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。关注公众号，留言“资料”，有一些公开芯片资料供下载。

![](https://pic1.zhimg.com/v2-91d380fba0955ebce85e5bf264d63cf6_1440w.jpg)

## 参考

还没有人送礼物，鼓励一下作者吧

编辑于 2022-03-08 18:29[就当下，讯飞AI翻译技术能为我们的工作学习生活带来哪方面的便利？](https://zhuanlan.zhihu.com/p/1959407121381697051)

[

作为一名法语陪同翻译，其实我一直惧怕AI技术在翻译领域拥有过于成熟的表现，毕竟这可是跟我们抢饭碗的一门技术。但也不可否认地，这项技术在现实生活中给我们带来了诸多的便利。 像科...

](https://zhuanlan.zhihu.com/p/1959407121381697051)

[^1]: ^ <sup><a href="#ref_1_0">a</a></sup> <sup><a href="#ref_1_1">b</a></sup> UCIe官网 [https://www.uciexpress.org/](https://www.uciexpress.org/)

[^2]: 台积电介绍 [https://www.tsmc.com/schinese/node/131](https://www.tsmc.com/schinese/node/131)