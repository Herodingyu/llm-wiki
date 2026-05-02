---
title: "为什么不把南桥集成进CPU？CPU和南桥芯片中什么资源最珍贵？"
source: "https://zhuanlan.zhihu.com/p/47479121"
author:
  - "[[老狼​新知答主]]"
published:
created: 2026-05-02
description: "南桥芯片，这个统管外部IO的芯片组，正在逐步变得面目可憎起来。经历了ICH到PCH的转变，越来越多的人都在质疑它的存在。为什么不把PCH集成进CPU中？DMI 4个lane的小水管下面带那么多PCIe root port加各种USB 3.0/3…"
tags:
  - "clippings"
---
[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog)

LogicJitterGibbs 等 1542 人赞同了该文章

南桥芯片，这个统管外部IO的芯片组，正在逐步变得面目可憎起来。经历了ICH到 [PCH](https://zhida.zhihu.com/search?content_id=9613015&content_type=Article&match_order=1&q=PCH&zhida_source=entity) 的转变，越来越多的人都在质疑它的存在。为什么不把PCH集成进CPU中？ [DMI](https://zhida.zhihu.com/search?content_id=9613015&content_type=Article&match_order=1&q=DMI&zhida_source=entity) 4个lane的小水管下面带那么多 [PCIe root port](https://zhida.zhihu.com/search?content_id=9613015&content_type=Article&match_order=1&q=PCIe+root+port&zhida_source=entity) 加各种USB 3.0/3.1和SATA port，会不会肠梗阻？今天我们一起来分析一下这么做背后深层次的原因。

## 南桥的江湖地位问题

熟悉计算机系统演变历史的小伙伴们都知道。很久很久以前（也没有多久了），计算机主板上有CPU、北桥（MCH）和南桥（ICH）这三个主要的芯片：

![](https://picx.zhimg.com/v2-a395fe37a767fd9af36d4efc91b1229f_1440w.jpg)

由于FSB变成了系统效能的瓶颈和对多CPU的制约，在台式机和笔记本电脑中，MCH被请进CPU中，服务器市场虽然短暂的出现了IOH，但也慢慢的被CPU吞噬。

![](https://pica.zhimg.com/v2-6705809070bc5ddfaff7ddda005777ee_1440w.jpg)

前后简单的对比

CPU中MCH原来的部分，在桌面CPU中叫做System Agent（SA），在服务器CPU中叫做uncore（和内核core对应）。它基本还负责原来的功能，那就是内存管理和提供 **至少** 16个Lane的PCIe Root port来驱动显卡（服务器uncore还包括QPI）。这绝不是表面看起来“换个马甲”这么简单。脱离了FSB这条小细管道，内存控制器、PICe Root Port的root complex和内核之间的通信变成了ring bus乃至目前的Mesh网络这种片内总线，羊肠小路变成了高速公路。如此改变让原来的瓶颈消失了，计算机效能才在酷睿后有了质的飞跃。

作为统管大部分IO设备的江湖大佬，ICH到PCH的转变却十分的小，时至今日，除了DMI随着PCIe 3.0升级到DMI 3.0，和增加了更多的功能外，变化相对较小。很多人看他不顺眼，欲除之而后快，让江湖最后一个大佬CPU一统主板。如果也把PCH整合进CPU，单芯片解决方案，也就是SOC，会带来很多好处：

1. 主板可以更便宜。少一块芯片的钱，主板设计简单一些，线路少些，这些都会帮助主板成本下降。
2. 南桥的设备可以摆脱DMI 3.0 8Gbps \* 4的带宽限制。如果我们把PCH中高速的USB 3.0/3.1， SATA ports和PCIe root ports提供的带宽都加在一起，我们就会发现这个数字会远远高于DMI 3.0能够提供的带宽。如果将南桥整合进CPU，这些设备也就可以和原北桥的PCIe root port一样接入IOSF骨干bus，摆脱DMI小水管。

## What holds up?

现实中我们除了看到ATOM系列全部是SOC、部分低端入门系列服务器是SOC（它原因比较有趣，我们今后再说）外，绝大部分主流系统PCH还是傲娇地继续战斗在第一线。这是为什么呢？

有两个原因十分明显：

1. 集成进PCH会造成CPU Die增大不少，从而造成CPU良率下降很多，成本增加明显。这里有一篇讨论Die大小和良率的文章： [CPU制造的那些事之二：Die的大小和良品率](https://zhuanlan.zhihu.com/p/29767262)
2. PCH和CPU松耦合，从而CPU和PCH可以单独生产，采用不同的工艺。实际上，CPU往往采用最新的制程，而PCH往往使用前期的制程。

还有一个十分重要的原因，也许是最重要的原因，往往不被人所知，那就是CPU的引脚 **pin不够用了** ！

如果我们看现在的CPU引脚，因为内存channel的不断增加和一些新的功能，LGA封装的引脚不断增加，一千多个引脚密密麻麻蔚为壮观。随便增加引脚会带来CPU兼容性的问题，Intel花了很大力气才能基本保证2年的引脚不变，而AMD则为了保证4年引脚兼容性更付出了巨大的代价，个中原因我们今后再讲。

如果我们再看PCH的引脚，就会发现它比CPU还要糟糕。几乎所有低速的引脚都被复用了，某些引脚甚至有三到四个功能！需要BIOS来选择（通过MUX）。高速引脚通过 [HSIO](https://zhida.zhihu.com/search?content_id=9613015&content_type=Article&match_order=1&q=HSIO&zhida_source=entity) 也被复用。如果PCH被整合到CPU中，会给引脚问题带来灾难性的后果，而主板因为引脚的急剧增加，也对工艺和稳定性带来负面影响。

## 什么是HSIO？

PCH的引脚就那么多，而人们对高速设备，尤其是USB host和PCIe root port的需求却越来越大。在所有低速引脚已经被充分挖潜，而低速引脚和高速引脚不能复用（想想看为什么）的前提下，如何提供更多的高速设备，同时尽可能不很快增加引脚数量的问题被提上日程。

在引入Flex IO后，逐渐在所有PCH甚至ATOM SOC上，HSIO被作为一种高速设备复用技术被集成进入芯片中：

![](https://pic1.zhimg.com/v2-9d3e4632f1fcfa90a42e59c688c5fe02_1440w.jpg)

Denverton microserver SOC

每一路HSIO Lane提供8 Gbps的带宽。内部的PCIe/USB/SATA设备控制器通过一层HSIO映射关系表对应到外部引脚上：

![](https://pic2.zhimg.com/v2-2a07eb7419449886646ce0fe191cc847_1440w.jpg)

譬如我们可以将HSIO #10选择连接到USB 3.0 #10上，或者是PCIe #4上，甚至是GBe（PCH集成网卡）。如此这般，给了主板厂商很大的自由度，让主板厂商根据主板的实际情况，自由选择要多少PCIe，多少USB或者SATA。

另外需要澄清的是DMI并不在HSIO中。

## DMI的带宽问题

DMI 3.0 4 × 8Gbps怎么带动这么多的高速IO?我们上图中有30个HSIO，每个支持8Gbps，如果他们都接上设备，会不会在DMI上造成拥堵？

当然会，不过在普通的台式机上这个问题不是很严重，而在高端台式机和服务器上是通过高端PCH提供的uplink直连CPU来解决的。你看的没错，PCH也有很多种，高端PCH甚至HSIO都会多一些。借用一句《动物庄园》里的话：

**所有PCH生来平等，但贵的PCH更平等一些。**

## 结论

引脚的稀缺性很多人都没有意识到。于此同理，HSIO资源也是稀缺的，每升级一代，PCH就会提供更多的HSIO，来提供更多的USB port，因为现在越来越多的人选择M.2 NvME SSD，PCIe root port也捉襟见肘起来。更多的HSIO，可以让主板厂商有更多的腾挪和发挥空间。

最后给大家两个思考题， **Coffeelake** CPU引脚图如下 **：**

![](https://pic3.zhimg.com/v2-7c475ca06a22cf516866c9b81ecb7d6a_1440w.jpg)

Kabylake CPU:

![](https://pic4.zhimg.com/v2-00ac34c5dad5a5550749bee27499bf19_1440w.jpg)

1. **说引脚不够用，为什么电源和地占据了几乎一半引脚** ？
2. **同样1151 socket，从Kabylake到Coffeelake什么变了，为什么** ？

**更多BIOS知识尽在BIOS培训云课堂** ：

**其他CPU硬件文章：**

欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。

![](https://pica.zhimg.com/v2-121ecd3d4080deb1c557bf47dc00d246_1440w.jpg)

用微信扫描二维码加入UEFIBlog公众号

3 人已送礼物

编辑于 2021-05-17 12:47[微电子专业研究生流片真的很难吗。?](https://www.zhihu.com/question/639362340/answer/3528987148)

[没有流片经验？研究生流片很难？找工作没有竞争力？找不到可以流片的项目？看过来&gt;&gt;给苦于无流片项目的同学提供一个可以流片的项目!https://xg.zhihu.com/plugin/...](https://www.zhihu.com/question/639362340/answer/3528987148)