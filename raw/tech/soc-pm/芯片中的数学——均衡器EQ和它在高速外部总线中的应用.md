---
title: "芯片中的数学——均衡器EQ和它在高速外部总线中的应用"
source: "https://zhuanlan.zhihu.com/p/48343011"
author:
  - "[[老狼​新知答主]]"
published:
created: 2026-05-02
description: "高速的串行总线逐渐淘汰了系统中的并行总线，作为并行总线最后堡垒的内存总线也越来越多的吸收了其中关键技术，尤其是均衡器（Equalization，EQ）技术。为什么串行总线会替代并行总线？EQ被广泛使用，程序员甚至固…"
tags:
  - "clippings"
---
[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog)

531 人赞同了该文章

高速的串行总线逐渐淘汰了系统中的并行总线，作为并行总线最后堡垒的内存总线也越来越多的吸收了其中关键技术，尤其是 [均衡器](https://zhida.zhihu.com/search?content_id=9804921&content_type=Article&match_order=1&q=%E5%9D%87%E8%A1%A1%E5%99%A8&zhida_source=entity) （Equalization，EQ）技术。为什么串行总线会替代并行总线？EQ被广泛使用，程序员甚至固件工程师为什么接触不多？本文主要介绍为什么要引入EQ，EQ对信号完整性的好处，眼图的作用，最后讨论各种均衡器在 [PCIe](https://zhida.zhihu.com/search?content_id=9804921&content_type=Article&match_order=1&q=PCIe&zhida_source=entity) 、USB等等高速串行总线中的应用及固件BIOS和驱动为什么没有涉及众多EQ。

## 并行总线到串行总线的转变

过去都认为串行比并行慢，串口比并口慢，就像四车道比单车道通行速度高一样很好理解。然而近十几年来，并行总线发展遇到了瓶颈。并行总线因为抗干扰能力差，时钟与数据同时传输的并行传输方式和线路串扰等等问题导致很难达到1Gb/s以上带宽，内存总线为了对齐/校准时钟与数据付出了极大的代价。而串行总线自从引入了差分信号后，对共模干扰抵抗能力很强，信道中没有时钟信号，时钟是在数据接收端进行恢复。

这些优点让串行总线频率可以越来越高，应用串行总线的USB、PCIe、SATA、QPI、HDMI等等外部总线将并行总线挤压到只剩下内存总线这个最后的堡垒。甚至连接Flash的总线也变成了SPI串行总线。

在传输速度不断提高后，即使如差分信号，它的信号完整性的问题也慢慢变得越来越严重。最新的接口版本如 PCI-Express 3.0 和 USB 3.1 等速率 都已经提升到 8Gbps 和10Gpbs以上：

![](https://pica.zhimg.com/v2-a976f327774eaa2e36eb97ab0563f106_1440w.jpg)

而我们主板却还是沿用FR4低成本板材，信号在经过多次连接和传输后衰竭严重：

![](https://pic2.zhimg.com/v2-13638ba1d7d7fd31dc2fccd260f1a833_1440w.jpg)

![](https://pic2.zhimg.com/v2-d82782ea2747cff89177d298c6986083_1440w.jpg)

这是两根PCB走线的插入损耗图：

![](https://pic3.zhimg.com/v2-44b46ade0f27de2120373dff4b08a6c8_1440w.jpg)

红色10英寸，蓝色5英寸。可以看出频率越高，插入损耗越大，信号的衰减在10英寸后可达26dB，而USB 3.0最大只能允许23dB的衰减。所以不经过处理，信号从发送端Tx到达接收端Rx时，已经有了较大的损耗，可能导致Rx无法正确还原和解码信号，从而出现误码，甚至眼图完全闭合。

为降低误码率，USB 3.1要求发送端Tx必须实现 **[FFE](https://zhida.zhihu.com/search?content_id=9804921&content_type=Article&match_order=1&q=FFE&zhida_source=entity)** （Feed-forward Equalizer，前馈均衡器），接收端Rx必须实现 **[CTLE](https://zhida.zhihu.com/search?content_id=9804921&content_type=Article&match_order=1&q=CTLE&zhida_source=entity)** (Continuous Time Linear Equalizer，连续时间线性均衡器)和 **[DFE](https://zhida.zhihu.com/search?content_id=9804921&content_type=Article&match_order=1&q=DFE&zhida_source=entity)** (Decision Feedback Equalizer，判决反馈均衡器)。PCIe在1代（gen1）和2代（gen2）中使用了去加重（ **[De-emphasis](https://zhida.zhihu.com/search?content_id=9804921&content_type=Article&match_order=1&q=De-emphasis&zhida_source=entity)** ）技 术和 **[Preshoot](https://zhida.zhihu.com/search?content_id=9804921&content_type=Article&match_order=1&q=Preshoot&zhida_source=entity)** 技术，在3代（gen3）8GHz时钟的要求下

![](https://pic4.zhimg.com/v2-0f40104755e969508423e657d647ae71_1440w.jpg)

也引入了FFE、CTLE、DFE和CDR均衡器（EQ）。

在我们介绍各种EQ之前，我们先来了解一下什么是眼图和眼图对于信号完整性的重要作用。

## 什么是眼图？

眼图并不是眼睛的图：

![](https://picx.zhimg.com/v2-3ef6cef1befe52613683b9bb6e74240d_1440w.jpg)

所谓眼图就是把一连串信号(000,001,010,011, 100, 101,110,111)叠加在一起，形成一个类似眼睛的图像，通常是在示波器上。

![](https://pic2.zhimg.com/v2-db0dd8b4fcb4106915d0a06687dcc967_1440w.jpg)

如这个示意图，把011、001、100和110叠加在一起形成一个眼图。它有不少术语：

![](https://picx.zhimg.com/v2-1811772c45f196f46da2722dd50fa793_1440w.jpg)

其中包括：高电平，低电平，周期(UI,Unit Interval)，眼高，眼宽，上升时，下降时和抖动Jitter。

眼宽大，眼高高，Jitter窄，眼图就好，我们叫做眼图睁开；眼宽扁，眼高低，Jitter窄，信号就差，甚至难以采样和辨识，这时我们就叫眼图闭合。

![](https://pic4.zhimg.com/v2-cfe0bea57f6666baf46e171460ec2229_1440w.jpg)

好眼图 VS 差眼图

举个例子：

![](https://pic2.zhimg.com/v2-4f956b3f959129afb7488f2f448146fb_1440w.jpg)

这是PCIe在10英寸的PCB版上Rx端接收到的眼图。2.5G是眼图睁开，5G则是半闭，而8G就完全闭合了，这时是不能够辨识数据的。

为了确保信号传输后的完整性，各个高速协议组织都公布了测试标准，例如USB协会发布了眼图模板：

![](https://pic1.zhimg.com/v2-b5e5794406a055ec51545bb9a69c037e_1440w.jpg)

这些红线部分是眼图不能碰的，碰到就属于不符合标准。一个符合标准的眼图如下：

![](https://pic2.zhimg.com/v2-97163a649aea6381cba57ec65b5aca0b_1440w.jpg)

而不符合标准的质量比较差的电缆则眼图十分糟糕。

如前面所说，为了对抗高频信号的衰减和干扰，各种方法如去加重（ **De-emphasis** ）和 **Preshoot** 技术，以及各种EQ被引入传输协议。下面就以PCIe为例，介绍一下我们BIOS工程师和电脑爱好者可能感兴趣的其中几个关键技术。

## 是么是去加重和preshoot？

去加重（ **De-emphasis** ）和preshoot是为了对抗码间干扰的（ **inter-symbol interference， ISI** ）。

什么是码间干扰呢？我们可以这么理解，当我们发送111101111这样的数据是，忽然变化的0，让电路里的电容很难迅速放电达到0，后面又被迅速拉到1，造成0的信号眼图很小：

![](https://pic3.zhimg.com/v2-6d90441916c6a742a38017ad36aa3b62_1440w.jpg)

而这种情况随着频率的提高越来越严重。从信号的角度来看，也就是信道对高频衰减大，而对低频衰减小。那怎么办呢？通过压低1的幅度来张开0的眼图：

![](https://pic4.zhimg.com/v2-dbbe2a7da8699f1039ac1cb5edf6fe25_1440w.jpg)

![](https://pic4.zhimg.com/v2-dac00fefedcb011a0762be6f939d275f_1440w.jpg)

而Preshoot是将跳变前一个增大幅度：

![](https://pic2.zhimg.com/v2-1e4e6f7a102a8ef5d163ffbdf4cf6c5b_1440w.jpg)

PCIE 3 代中规定了共 11 种不同的 Preshoot 和 De-emphasis 的组合（Preset）

![](https://picx.zhimg.com/v2-d66198e7a7d843ed231317d9c459b2bb_1440w.jpg)

在PCIe root port链路初始化Training中，Rx发送TxEQ preset设置 要求给Tx，此过程叫做动态均衡。是的，他们本质上是一种 **FFE** （Feed-forward Equalizer，前馈均衡器），发送端Tx通过它提高信号完整性。那么接受端Rx呢？

## 什么是CTLE和DFE？

Rx端采用 **CTLE** (Continuous Time Linear Equalizer，连续时间线性均衡器)和 **DFE** (Decision Feedback Equalizer，判决反馈均衡器)。限于篇幅，本文只简要介绍一下。

CTLE是利用连续的信号曲线，减缓低频部分，用来补偿高频部分，因为高频部分损耗较大，所谓削峰填谷。它有个缺点是会放大高频噪声。

DFE也是一种回馈均衡器，是用上次信道的输出经过判断后加权反馈到输入上。它不会放大高频噪声，但是只能处理码后干扰，不能消除码前干扰，且设计复杂和耗电。

## 效果如何？

PCIe 3.0信号不经过EQ处理是这样，眼图关闭：

![](https://pica.zhimg.com/v2-223b7f9626bd4600db93e87340d1e59e_1440w.jpg)

Tx经过EQ变成：

![](https://pic4.zhimg.com/v2-1278337400345580e3f280646825e37d_1440w.jpg)

再在Rx经过CTLE和DFE后：

![](https://pic2.zhimg.com/v2-bf70964a2ddc078cd1db23121c6e0fef_1440w.jpg)

眼图才全部张开。

## 结论

我们把FFE和DFE这种具有回馈和自动调整的EQ叫做 [自适应均衡器](https://zhida.zhihu.com/search?content_id=9804921&content_type=Article&match_order=1&q=%E8%87%AA%E9%80%82%E5%BA%94%E5%9D%87%E8%A1%A1%E5%99%A8&zhida_source=entity) （Adaptive Equalization），将CTLE这种叫做固定均衡器（Fixed Equalization）。普通程序员和一般BIOS工程师尽管可能接触了不少PCIe、USB、HDMI甚至是QPI的内容，但几乎都不会接触EQ。这是因为EQ大部分是自适应的，是在链路train的时候，由硬件自动完成的，芯片组完成了Tx的部分，板卡或者设备中TI等的芯片完成了Rx的部分，极少需要固件和驱动参与。只有在链路出现问题后的调试甚至workaround错误时才需要手动设置EQ参数，来解决不能train通或者train到更高速率的问题。

不仅仅高速串行总线，现在内存的并行总线中也引入了DFE和CTLE算法，但它是MRC程序实现而不是硬件实现。

据知乎的“创作者中心”提供的数据，我的专栏全部读完的人只占阅读人数的5%左右。如果你读到这里，恭喜你打败了95%的专栏读者！！

最后出个思考题：为什么内存还不采用流行的串行总线？

**更多BIOS知识尽在BIOS培训云课堂** ：

欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。同时欢迎大家给本专栏和公众号投稿！

![](https://pica.zhimg.com/v2-121ecd3d4080deb1c557bf47dc00d246_1440w.jpg)

用微信扫描二维码加入UEFIBlog公众号

还没有人送礼物，鼓励一下作者吧

编辑于 2021-05-17 12:44[如何避免缓存击穿？超融合常驻缓存和多存储池方案对比](https://zhuanlan.zhihu.com/p/10395785735)

[

作者：SmartX 解决方案专家 钟锦锌 很多运维人员都知道，混合存储介质配置可能会带来“ 缓存击穿 ”的问题，尤其是大数据分析...

](https://zhuanlan.zhihu.com/p/10395785735)