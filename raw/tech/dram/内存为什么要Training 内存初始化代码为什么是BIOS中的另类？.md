---
title: "内存为什么要Training? 内存初始化代码为什么是BIOS中的另类？"
source: "https://zhuanlan.zhihu.com/p/107898009"
author:
  - "[[老狼​新知答主]]"
published:
created: 2026-05-02
description: "有人说BIOS程序就是按照硬件手册和根据用户选择填寄存器，几张表就能解决的事为什么要这许多程序呢？虽然数千个选择形成的组合爆炸让穷举表成为不可能，但它也道出了BIOS大部分程序的实质：填写寄存器。有一个声音…"
tags:
  - "clippings"
---
[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog)

LogicJitterGibbs 等 293 人赞同了该文章

有人说 [BIOS](https://zhida.zhihu.com/search?content_id=112107980&content_type=Article&match_order=1&q=BIOS&zhida_source=entity) 程序就是按照硬件手册和根据用户选择填寄存器，几张表就能解决的事为什么要这许多程序呢？虽然数千个选择形成的组合爆炸让穷举表成为不可能，但它也道出了BIOS大部分程序的实质：填写寄存器。有一个声音发出了不同意见，在BIOS程序里面，长期居住了一个另类，他的名字叫做 [MRC](https://zhida.zhihu.com/search?content_id=112107980&content_type=Article&match_order=1&q=MRC&zhida_source=entity) ：内存参考代码。他的任务就是初始化内存，而他却管自己叫做 [Memory Training](https://zhida.zhihu.com/search?content_id=112107980&content_type=Article&match_order=1&q=Memory+Training&zhida_source=entity) 代码，主打的是调整时序和提高信号完整性。好高级的名字：Training，训练，似乎和人工智能有关？

当然不是，但和AI 模型的training之所以取名如此一样，都是为了通过实验来寻找可以解决问题的方案。 [Deep Learning](https://zhida.zhihu.com/search?content_id=112107980&content_type=Article&match_order=1&q=Deep+Learning&zhida_source=entity) 的Training得到神经网络的权重矩阵；而Memory Training得到一组对齐、补偿和参考电压参数，来平衡和对冲线路的差异和信号的噪声。

如果我们查看 [Intel](https://zhida.zhihu.com/search?content_id=112107980&content_type=Article&match_order=1&q=Intel&zhida_source=entity) 的BIOS的代码，会发现MRC代码量很大。而它所以另类因为它是唯一与模拟信号和信号完整性打交道的地方，大量的采样、眼图代码让它与众不同。 [ARM](https://zhida.zhihu.com/search?content_id=112107980&content_type=Article&match_order=1&q=ARM&zhida_source=entity) 和 [AMD](https://zhida.zhihu.com/search?content_id=112107980&content_type=Article&match_order=1&q=AMD&zhida_source=entity) 则没有如此大量的Memory Training代码，这是为什么呢？内存不Training行不行？

## 内存为什么要Training?

内存I/O部分频率越来越高，如此高的频率让小小的一点误差都会被放大。熟悉主板布线的同学应该知道高速信号布线的时钟约束十分严苛，一组高速信号在主板上拐个弯，内圈和外圈的走线长度会产生差距，尽管很小，低速信号没关系，但高速信号时钟约束就达不到，必须在相反的方向拐回来补偿一下。内存I/O频率上G的频率，让任何细小的误差都必须得到补偿，所以要在整个数据链路进行对齐和补偿。

一个比较完整的内存访问链路包括了很多部分：

![](https://pic3.zhimg.com/v2-0a562015cd737bfffdfd41b8058e019e_1440w.jpg)

从源头开始包括MC （内存控制器，memory Controller）、PHY（MC和PHY有些在一起，很多是分离设计来增加灵活性）；从Pitch到pin，再从pin穿过主板到达slot的布线；slot过金手指通过fly-by或者直连到内存颗粒；内存颗粒中到内存Cell。这么长的链条每个点都有可能引入时钟不同步和采样延迟的问题，所以要在各个部分分别对齐，让内存DIMM的上百条连线整齐划一。

我在这篇文章中介绍了 [JEDEC标准](https://zhida.zhihu.com/search?content_id=112107980&content_type=Article&match_order=1&q=JEDEC%E6%A0%87%E5%87%86&zhida_source=entity) 的 [Write Leveling](https://zhida.zhihu.com/search?content_id=112107980&content_type=Article&match_order=1&q=Write+Leveling&zhida_source=entity) ：

这其实是内存初始化对齐大步骤共十几个的末尾部分。对齐和补偿要从芯片内部开始，当芯片出口好了，再对齐DCA、DCS（因为下面的步骤需要下command）；再是jedec spec里面的 [Read Leveling](https://zhida.zhihu.com/search?content_id=112107980&content_type=Article&match_order=1&q=Read+Leveling&zhida_source=entity) ，read DQS/DQ；再下来才是Write Leveling，和write DQS/DQ。为了信号好，还要匹配 [RON](https://zhida.zhihu.com/search?content_id=112107980&content_type=Article&match_order=1&q=RON&zhida_source=entity) 和 [ODT电阻](https://zhida.zhihu.com/search?content_id=112107980&content_type=Article&match_order=1&q=ODT%E7%94%B5%E9%98%BB&zhida_source=entity) ，以及通过调整vRef来让眼图眼睛张开，并寻找安全和合适的采样点。DDR5因为速度太高，还要加入DFE等均衡器来提高信号完整性：

这些步骤还不包括RDIMM要求的backside training和LRDIMM的 DB到颗粒的额外Training步骤，所以服务器内存初始化更加繁杂的多。

## 谁来进行Training？

这些步骤大部分是所有内存方案都要做的，包括焊在板子上的Solder Down方案和不同的内存控制器。关键是谁来执行这些步骤，谁来Training整个命令和数据链条。

有两种方案：In Band和OOB（Out Of Band）。大家经常在通信领域听到band概念，这里没有通信调制，还提band是怎么个意思呢？其实这种说法在silicon技术文档里面经常提到，这个所谓的band，是指CPU的计算资源，即CPU的Compute Bandwidth。In Band，就是CPU自己亲历亲为，自己完成任务；OOB是说不占用CPU资源，让别家完成，比较典型的是由一个MCU完成，当然完成过程中和过后还需要和CPU通过mailbox等机制互相交互。

OOB training十分常见，比大家认为的常见更加常见。现在几乎所有高速通信线路都需要Training，包括但不限于PCIe、USB、SATA等等。而完成这个Training的并不是CPU，可以是MCU和DSP等。

## 结论

好了，我们回到原来的问题：为什么Intel的MRC代码量很大，而ARM和AMD则没有如此大量的Memory Training代码？相信同学们都已经有了答案。是的，Intel采用 [In Band training](https://zhida.zhihu.com/search?content_id=112107980&content_type=Article&match_order=1&q=In+Band+training&zhida_source=entity) ，而ARM和AMD采用 [OOB Training](https://zhida.zhihu.com/search?content_id=112107980&content_type=Article&match_order=1&q=OOB+Training&zhida_source=entity) 。

最后给大家留个思考题：这两种方式各有什么优缺点，为什么Intel采用In Band，而ARM和AMD采用OOB？

**BIOS培训云课堂** ：

其他内存相关文章：

欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。

![](https://pica.zhimg.com/v2-121ecd3d4080deb1c557bf47dc00d246_1440w.jpg)

用微信扫描二维码加入UEFIBlog公众号

还没有人送礼物，鼓励一下作者吧

编辑于 2021-05-06 15:52[双非一本软件工程，想往硬件方向靠一靠，嵌入式还能选吗？](https://www.zhihu.com/question/1907886287706384370/answer/1916817694965076449)

[

同学你好！这里是汉码未来。你的情况非常典型，很多软件工程学生都会在职业规划中遇到类似困惑。结合你的背景和需求，我们...

](https://www.zhihu.com/question/1907886287706384370/answer/1916817694965076449)