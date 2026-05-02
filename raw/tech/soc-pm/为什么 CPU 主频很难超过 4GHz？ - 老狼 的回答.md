---
title: "为什么 CPU 主频很难超过 4GHz？ - 老狼 的回答"
source: "https://www.zhihu.com/question/32096371/answer/250710354"
author:
  - "[[老狼​新知答主已关注]]"
  - "[[Sisyphus​香港科技大学 电子与计算机工程系硕士]]"
  - "[[垂手拎锤]]"
published:
created: 2026-05-02
description: "原因主要在于散热，提高主频超过一定范围后，热密度急速提高，很不经济，也造成散热困难。回首2004年，In…"
tags:
  - "clippings"
---
825 人赞同了该回答

![](https://picx.zhimg.com/50/v2-2f8750efcf6e5cb165a8ef7a6fdc56fb_720w.jpg?source=2c26e567)

i7 2600k能耗和频率的关系

还没有人送礼物，鼓励一下作者吧

[编辑于 2021-10-14 18:25](https://www.zhihu.com/question/32096371/answer/250710354)[2025双十一选购NAS必看！绿联NAS不同盘位怎么选？一篇文章告诉你，家庭、办公存储需求1-6盘位应该怎么选！](https://zhuanlan.zhihu.com/p/1969839883439808731)

[

为什么现在越来越多人从“网盘用户”转投NAS私有云？只因网盘存满了想扩容，一看年费要几百；开通了VIP，还有高速流量限制；存娃的成长照片或工作文件，总担心隐私泄露。我也不是说...

](https://zhuanlan.zhihu.com/p/1969839883439808731)

#### 更多回答

![](https://pic1.zhimg.com/50/ccac44e9f461af65dc7978ff773768f9_720w.jpg?source=1def8aca)

题主眼光非常独到。为什么CPU没能变得更快？题主是在阐述一个计算机架构里的现象。主流中央处理器的确在05年之后就很少超过4GHz的频率。登纳德定律说单核上晶体管数量每两年能翻一倍，然而05年之后碰到了瓶颈，之后就很少提登纳德定律，只能依靠并行运算来为摩尔定律续命。我们可以看到上图的绿线指示的是主流中央处理器的频率，不但没能上升，近来还有下降的趋势。工程师们天生是要为整个系统做权衡的。而在登纳德定律和摩尔定律都生效的年代，电子工程师不需要权衡，只要做一件事：把晶体管做小。无需权衡，只要做小，那简直是电子工程师的黄金年代。然而五十年过去了，黄金时代已经过去，工程师们必须做权衡。 需要权衡的瓶颈包括是内存读取瓶颈，指令行并行处理瓶颈，和散热瓶颈。而散热瓶颈被认为是最难以跨越的。\[1\] 先说内存读取。中央处理器和内存是分离的两个区域，之间依靠信道连接，而信道是有带宽的。处理器的晶体管数量每两年翻一倍，然而带宽的增长达不到它的速度，所以内存读写所占的时间逐渐超过处理器计算的时间，削弱了创新的动力。 再说指令行并行处理。CPU主频每翻一倍，只要所有元件都能完成运算，整个系统的运行速度就能上升一倍。然而每个元件和电线都是有物理属性的；电信号传过元件后会有延迟，受元件电阻和电容影响；电信号在电线中也只能以介质中的光速传播，小于3亿米每秒，大约2亿米每秒。4GHz时是每秒40亿下时钟，电信号只能前进6厘米。工业界近20年来为了加快主频，在其他方式都到极限后采用了流水线式设计，把一条指令拆成多个时钟来完成，以此在一条指令完成时间不变的情况下，增加单位时间的吞吐量。上图是我学架构时设计的五级流水线式处理器构架，把一条机械语言拆成取指令，解码指令，处理，写回内存，和写回寄存器五级。而英特尔i7现在的技术把整个指令拆到了二十四级\[2\]，如此细致的拆分令人发指，同时也很难再想象如何再改进。 而温度是最可怕的权衡。超过4GHz后，温度上升造成的性能损失超过了指令行处理加速获得的性能提升。如果说前两个瓶颈还能依靠设计解决，那这个瓶颈就只能靠新材料或是工艺来解决了。而现代计算机所依赖的物理元件，MOSFET，全称金属氧化物半导体场效应管，从登纳德定律出现到05年四十年时间内都没有更好的替代产品。最新出了一批新的场效应管，然而没能在根本上解决散热的问题。

![](https://pic1.zhimg.com/50/968791b3261b5e36c4161592dca434db_720w.jpg?source=1def8aca)

知乎很少出现微电子的问题，这么久怎么没人来抢呢。 吐槽： 1. 题主的确切的问题应该是 “计算机CPU的主频为什么很难超过4G”。因为计算机的其他部件的工作频率是远低于CPU主频。在此不做讨论。 2. 如很多答主列出的，目前很多cpu主频已经超过4G， 问题不够准确。 3. 登那德定律以及摩尔定律只是对目前半导体技术的简单预测， 不存在严谨的科学依据，在实际的研发过程中没人会把这个没有经过论证的“定律”当回事。比如，你认为墨菲定律真的会影响事情的结果么？ 3. 目前排名第一的Sisyphus的答案存在一些错误， 此处斗胆指出。 - CPU运算单元和数据存取怎么会是分离的，L1/L2 cache 用来干什么的。 - 电信号速度， 这个说法不准确， 应该说是线延迟，也就是信号穿过传输线的延迟。我们选用目前使用最为简便的Elmore模型来看线延迟 再简化这个模型，就是我们说的Td=RC， 也就是说电信号穿过一段传输线只是和这段线的电阻和电容反向相关，和光速有什么关系。 - CPU主频的极限是导致我们将指令使用流水线结构的原因，切勿本末倒置。 下面说正事： CPU/ASIC芯片时钟限制在4G+ 的范围是确是事实，此是由诸多因素造成。其中最为主要的是工艺限制和功耗。 Quora里已经有这个问题很好的答案，英文好的同学移步此处。 Why haven't CPU clock speeds increased in the last 5 years? 因为Quora上Jonathan Kang的答案非常精确和完善，本答案大部分以其作为参考。 其中图片版权问题，我正在和他联系，如果Jonathan不同意转贴使用，会在之后删除。 工艺水平， 先来看下Jonathan Kang （此人应该是Apple的cpu工程师）怎么说： If you look at x86 processors, the actual complexity of the CPU core has not significantly changed for a few generations now. Haswell, from a functionality point of view, is not that much different that Ivy Bridge or Sandy Bridge before it. The circuits have been optimized, the power management significantly improved, the transistors have shrunk and performs better and certain internal buffers and queues have been resized for slightly better performance. But for the most part, the CPU core hasn't change radically. x86 cpu近几年没有什么革命性的改进， 其性能提升主要是借助于工艺的改进。因为先看下过去几十年工艺改进带给CPU的好处。 目前CPU/ASIC基本都是使用CMOS逻辑电路， 而工艺水平的改进使CMOS管延迟减小，也就使每条指令可以在更短的时钟周期内完成。也就是主频可以随工艺加深而得以提高。 我们再看下为什么工艺加深会让晶体管延迟减小，下图是CMOS晶体管的截面示意图，晶体管的开关速度是收很多因素的影响，其中电场强度和电子迁移率。 电场强度是受加载到源漏两极的电压以及沟道长度的影响。 沟道长度(也就是平时说的28nm,16nm工艺)越窄，电场强度就越大，CMOS管的开关速度就越快。 但是随着工艺加深，沟道长度越来难以缩短，也就是说CMOS管的延迟难以再缩小。那么为什么还是要不停的改进工艺，目的就是更小的面积容纳更多的晶体管，从而可以通过更复杂的电路设计比如并行运算， 行为预测等来提高芯片性能。 功耗 伴随着工艺加深， 功耗这个芯片设计的噩梦愈加凸显，功耗增加的原因此处不再展开。下图是I7的随着运行频率的增加功耗的变化。 当运行频率超过4.5G之后，芯片功耗会急剧增加。因为芯片的设计温度范围通常在-40摄氏度至125摄氏度， 如果功耗带来的热量积累造成芯片温度是不能超出此范围。 但是因为工艺加深，单位面积的晶体管数量增加， 单位面积的热积累越明显，而受限于封装以及降温成本的考虑，现在几乎所有的大规模芯片都只能非常苛刻的在意功耗问题，但是因为x86先天的构架缺陷，造成功耗很难做的很好，也就是为什么x86为什么没能在mobile产品领域做的很好。 答案中有人说温度提高，芯片性能会下降，实则不然。在90nm/65nm工艺之前， 这么说是没问题的。 但是在45nm之后，因为低温反型效应影响，实际上温度越高，载流子迁移率会越高，也就是芯片实际上性能是会变好。具体原因就是电子迁移时杂质散射和晶格散射谁占主导的问题，这里不展开了。 除去这些因素，随着工艺加深和时钟频率的提升， 其他因素的影响也增加了设计难度，比如 - 因为传输线宽度变下，线电阻变大，线延迟在电路延迟的比例增大。 - 时钟频率提高，而传输线间间距变小，时钟串扰明显。 时钟树设计约来越难。 - 器件性能随着温度电压漂移严重，设计难度增加 其中一些问题比如功耗可以在FinFET工艺中得以改善， 但不是革命性的，所以通过简单靠提高主频来提升芯片性能的时代怕是已成历史。 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ 因为本题实际会涉及半导体工艺，半导体器件，量子力学， 封装技术，计算机工程，信号与系统。 很多东西已经不再熟悉，可能有些地方有纰漏，欢迎大家拍砖，越拍越乐，拍死最好。

![](chrome-extension://difoiogjjojoaoomphldepapgpbgkhkb/assets/logo-O35E636P.png) Sider

[导游称大熊猫花花是残疾游客秒报警 340 万](https://www.zhihu.com/search?q=%E5%AF%BC%E6%B8%B8%E7%A7%B0%E5%A4%A7%E7%86%8A%E7%8C%AB%E8%8A%B1%E8%8A%B1%E6%98%AF%E6%AE%8B%E7%96%BE%E6%B8%B8%E5%AE%A2%E7%A7%92%E6%8A%A5%E8%AD%A6&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[孙杨被曝疑违规录取博士 335 万](https://www.zhihu.com/search?q=%E5%AD%99%E6%9D%A8%E8%A2%AB%E6%9B%9D%E7%96%91%E8%BF%9D%E8%A7%84%E5%BD%95%E5%8F%96%E5%8D%9A%E5%A3%AB&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[女子徒手给月子里宝宝打耳洞 294 万](https://www.zhihu.com/search?q=%E5%A5%B3%E5%AD%90%E5%BE%92%E6%89%8B%E7%BB%99%E6%9C%88%E5%AD%90%E9%87%8C%E5%AE%9D%E5%AE%9D%E6%89%93%E8%80%B3%E6%B4%9E&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content) 热

[曝吴宣仪提出解约遭乐华拒绝 290 万](https://www.zhihu.com/search?q=%E6%9B%9D%E5%90%B4%E5%AE%A3%E4%BB%AA%E6%8F%90%E5%87%BA%E8%A7%A3%E7%BA%A6%E9%81%AD%E4%B9%90%E5%8D%8E%E6%8B%92%E7%BB%9D&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[阿 Sa 蔡卓妍官宣结婚 290 万](https://www.zhihu.com/search?q=%E9%98%BF+Sa+%E8%94%A1%E5%8D%93%E5%A6%8D%E5%AE%98%E5%AE%A3%E7%BB%93%E5%A9%9A&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)

[广州地铁有人喷洒不明液体 267 万](https://www.zhihu.com/search?q=%E5%B9%BF%E5%B7%9E%E5%9C%B0%E9%93%81%E6%9C%89%E4%BA%BA%E5%96%B7%E6%B4%92%E4%B8%8D%E6%98%8E%E6%B6%B2%E4%BD%93&search_source=Trending&utm_content=search_hot&utm_medium=organic&utm_source=zhihu&type=content)