---
title: "DDR 学习时间 (Part B - 1)：DRAM 刷新"
source: "https://zhuanlan.zhihu.com/p/343262874"
author:
  - "[[LogicJitterGibbsICer && 业余FPGAer]]"
published:
created: 2026-05-02
description: "本期我们基于 JESD-79 学习 DDR 的刷新及其刷新命令。 Refresh，刷新是 DRAM 的一项重要特性，又被称为动态刷新（Dynamic refresh），而 Dynamic 就是 DRAM 中的 'D' 所代表的意思。DRAM 刷新与其结构息息…"
tags:
  - "clippings"
---
[收录于 · OpenIC 特别兴趣小组](https://www.zhihu.com/column/c_1029044037684183040)

118 人赞同了该文章

本期我们基于 [JESD-79](https://zhida.zhihu.com/search?content_id=164410070&content_type=Article&match_order=1&q=JESD-79&zhida_source=entity) 学习 DDR 的刷新及其刷新命令。

Refresh，刷新是 DRAM 的一项重要特性，又被称为 [动态刷新](https://zhida.zhihu.com/search?content_id=164410070&content_type=Article&match_order=1&q=%E5%8A%A8%E6%80%81%E5%88%B7%E6%96%B0&zhida_source=entity) （Dynamic refresh），而 Dynamic 就是 DRAM 中的 'D' 所代表的意思。 [DRAM 刷新](https://zhida.zhihu.com/search?content_id=164410070&content_type=Article&match_order=1&q=DRAM+%E5%88%B7%E6%96%B0&zhida_source=entity) 与其结构息息相关。

> 本系列连载于 OpenIC SIG，除了 DDR 学习时间专栏外，OICSIG 目前正在陆续上线 [HDLBits](https://zhida.zhihu.com/search?content_id=164410070&content_type=Article&match_order=1&q=HDLBits&zhida_source=entity) 中文导学的优化版本，欢迎关注/支持/加入我们

[DDR 学习时间 - OpenIC SIG 开源数字IC技术分享](https://link.zhihu.com/?target=https%3A//digitalasic.design/category/ddr/ddr-%25e5%25ad%25a6%25e4%25b9%25a0%25e6%2597%25b6%25e9%2597%25b4/)

在 DDR 学习时间专栏中，目前有两个 Part：

- Part-A DRAM 课程、论文以及其他在线资源的学习
- Part-B 基于 DDR4 Spec 的 DDR 特性学习

### DRAM 基本结构

我们知道 DRAM 使用电容 **充电/未充电** 两个状态来分别表示二进制的 **1/0** 符号。

拿小学数学题中的常客——水池来打比方，电容是一个水池，晶体管是这个水池的阀门。

小明是一个记忆只有 7 秒的熊孩子，数字他统共就认识两个： 0 和 1。每次需要记下一个数字时，如果是 1 小明就用水装满池子( 1'b1 )，如果是 0 就把水全部放走（ 1‘b0 ）。非常不爱惜水资源，大家不要学他。

![](https://pic1.zhimg.com/v2-c207abae90c3018a79ee39415e812048_1440w.jpg)

单个 DRAM 基本单元由一个电容和一个晶体管构成，称为 1-T 结构，请注意图中右边出现的第二个电容 CBL 并不是有意制造在存储单元中的，它其实是控制线 BL 的寄生电容。

相较于由 6 个或者更多晶体管组成的 SRAM， DRAM 具有结构简单的优点。简单的结构能够降低制造难度和提高良率，说中文就是：更便宜！

但是，命运馈赠的礼物，都早已在暗中标好了价格，DRAM 也不例外。单个电容和晶体管的简单结构有一个棘手的问题： [漏电流](https://zhida.zhihu.com/search?content_id=164410070&content_type=Article&match_order=1&q=%E6%BC%8F%E7%94%B5%E6%B5%81&zhida_source=entity) 。

### 不紧的阀门：漏电流

小明の记忆水池工作的关键在于有一个紧密不漏水的阀门。如果水池阀门漏水，那么小明面对一个干涸水池的时候，他是懵逼的：到底是本来没水（ 1‘b0 ），还是本来有水但是全流光了( 1'b1 )？

不幸的是， DRAM 中的晶体管就是一个漏水的阀门。

![](https://pic1.zhimg.com/v2-fea853b7c078c6a4f679bff6cfa7a682_1440w.jpg)

由于制作工艺的影响，或者说这个世界上原本就不存在完美的晶体管，能够一丝不苟地实现开关功能，保证关断时没有电流流过。这些在关断时流过的电流称为漏电流，leakage current。

在没有任何 DRAM 操作的情况下，漏电流也会导致电容上的电荷随着时间流失。当电荷数量低于阈值时，DRAM 将无法正确地读取所存储的 1/0 数据。此时，数据就被没了（corrupt the data）。

### DRAM 刷新

为了防止数据被破坏，为了使 DRAM 这一更廉价的存储介质可以得到普及，DRAM 设计中加入了动态刷新机制。

DRAM 刷新过程中，首先读取原本的数据，将电容的电平与参考电平进行比较，判断数据的 1/0 值后，再将原数据写回。写回的过程中将电容完全充满电荷（如果数据为 1），好比进行了一次充电操作。

DRAM 刷新每间隔一段时间进行一次，对随时间流失的电荷进行补充。

间隔的时间不能太长，间隔太长可能导致刷新时数据电平已经无法辨认。但间隔的时间也不能太短，因为充电期间不能进行正常的读写，过于频繁的刷新会导致 DRAM 的吞吐性能下降。

一般来说，间隔时间的下限由 DRAM 本身的属性决定，比如 DRAM 的容量密度、运行频率等。而间隔时间上限则由性能吞吐的需求决定。

### DRAM 刷新命令

DRAM 刷新由控制器 (MC) 和 DRAM 颗粒内部电路共同实现。 MC 以发送刷新命令的方式通知 DRAM 颗粒进行刷新；DRAM 颗粒内部电路则负责进行刷新操作。这里我们重点来看 MC 侧的刷新命令发送部分。

刷新命令，Refresh Command，DRAM 命令代号为 REF。表示 REF 的 DRAM bus 信号真值表为：

![](https://pica.zhimg.com/v2-a02a232f94a7496e6697cb449f3e607a_1440w.jpg)

如果你是第一次看到这张经典的 DRAM 命令真值表，那正好借此机会介绍一番：

> H、L 标识的信号在该 DRAM 命令中必须为高或者低电平；  
>   
> X，V 标识的信号在该命令中都不起任何作用，可以为任何值。区别在于 V 表示信号可以为高电平或者低电平。X 更近一步，信号还可以为悬空值（float）。  
>   
> 用 OP Code 等具体名称标识的信号是命令的一部分，它们的值用于表示命令的某个字段的值；

比如发送 REF 命令时，CS\_n 必须为低电平，ACT\_n 信号必须为高电平。而 Ax 地址信号可以为高，也可以为低电平。

### DRAM 刷新时序参数

REF 不是一个持久性（persistent）命令，需要间隔一个平均周期循环发送，这个周期称为 [tREFI](https://zhida.zhihu.com/search?content_id=164410070&content_type=Article&match_order=1&q=tREFI&zhida_source=entity) 。tREFI 与 DRAM 容量密度和工作温度有关。

![](https://pica.zhimg.com/v2-9f5a5e012636d02e533c4711ac4ece6c_1440w.jpg)

REF 命令发出后，DRAM 内部电路会对所有存储单元进行刷新，这需要一些时间，称为 [tRFC](https://zhida.zhihu.com/search?content_id=164410070&content_type=Article&match_order=1&q=tRFC&zhida_source=entity), Refresh Cycle Time。在此期间不能向 DRAM 发出任何有效命令。tRFC 与 DRAM 容量密度和工作频率有关。

![](https://pic3.zhimg.com/v2-34aac63a1867eaa30b9a16e7dd35232e_1440w.jpg)

tREFI 和 tRFC 是 REF 命令唯二的时序参数，可以用以下的时序图表示：

![](https://pic2.zhimg.com/v2-f24924d7b4b2c11e61e6b3ed7e897f33_1440w.jpg)

图中，REF 命令与其他有效命令（VALID 表示）的最小间隔为 tRFC，两个 REF 命令之间的最小间隔也需要大于 tRFC，这段时间用于等待刷新操作完成。

两个 REF 命令之间的间隔一般等于 tREFI，但为什么图中标出的最大间隔为 9\*tREFI ？这是因为 DDR 支持 **[超前/延后刷新命令](https://zhida.zhihu.com/search?content_id=164410070&content_type=Article&match_order=1&q=%E8%B6%85%E5%89%8D%2F%E5%BB%B6%E5%90%8E%E5%88%B7%E6%96%B0%E5%91%BD%E4%BB%A4&zhida_source=entity)** 这一机制。

### 超前/延后刷新命令

一般而言，REF 命令两两之间保持着相同的车距，等周期间隔 tREFI。但是正如前文所提到的，在大吞吐量的场景中，频繁的刷新命令会降低吞吐效率。

**超前/延后刷新命令** 机制可以在不改变刷新命令总数的情况下，拉开 REF 命令之间的间距，从而提高密集 DRAM 读写期间的效率。

最多可以抽取 8 个 REF 命令，提前或者延后进行，因此两个 REF 命令之间的最大间隔为 9 tREFI。

![](https://pic1.zhimg.com/v2-dffe59db93a891e71635008eae2a125c_1440w.jpg)

![](https://picx.zhimg.com/v2-af0205c621db1f47ecd9ed00291cbe07_1440w.jpg)

### 结语

本文从 DRAM 的基本结构出发，讨论了 DRAM 需要刷新的原因以及刷新的过程。基于 DDR4 标准讨论了 REF 命令、刷新相关的时序参数以及超前/延后刷新命令机制。

在 DDR 的命令真值表中还存在着另一个与刷新相关的名词， **Self Refresh** ，自刷新。那么自刷新机制是怎么回事，用在那些场景中，我们下回一起来看看。

![](https://pica.zhimg.com/v2-a02a232f94a7496e6697cb449f3e607a_1440w.jpg)

编辑于 2021-01-10 18:52[一文看懂 K8s 持久化存储、云原生存储、容器原生存储、K8s 原生存储有何区别](https://zhuanlan.zhihu.com/p/638422219)

[

随着云原生时代的到来，越来越多的企业开始采用 Kubernetes（K8s）加速现代应用的开发和部署过程。为了适应容器环境敏捷、可...

](https://zhuanlan.zhihu.com/p/638422219)