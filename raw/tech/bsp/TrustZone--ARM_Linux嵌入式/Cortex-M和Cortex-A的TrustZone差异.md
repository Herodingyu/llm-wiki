---
title: "Cortex-M和Cortex-A的TrustZone差异"
source: "https://zhuanlan.zhihu.com/p/653830460"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！ 相信关注安全和嵌入式的开发者对TrustZone都不陌生，最近看到有网友在问Cortex-A和Cort…"
tags:
  - "clippings"
---
1 人赞同了该文章

---

大家好！我是不知名的 [安全工程师](https://zhida.zhihu.com/search?content_id=233424185&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E5%B7%A5%E7%A8%8B%E5%B8%88&zhida_source=entity) Hkcoco！

欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

获取更多精彩内容哦！！！

---

相信关注安全和 [嵌入式](https://zhida.zhihu.com/search?content_id=233424185&content_type=Article&match_order=1&q=%E5%B5%8C%E5%85%A5%E5%BC%8F&zhida_source=entity) 的开发者对TrustZone都不陌生，最近看到有网友在问Cortex-A和Cortex-M的TrustZone之间的差异，我们来简单介绍下。

## 共同点

Arm在2003年的Armv6开始就开始引入TrustZone，到Armv7-A和Armv8-A把 [trustzone](https://zhida.zhihu.com/search?content_id=233424185&content_type=Article&match_order=1&q=trustzone&zhida_source=entity) 作为架构的可选的安全扩展。虽然TrustZone做架构的可选扩展，但是所有的Cortex-A的CPU都实现这个扩展，例如Cortex-A7，Cortex-A53， [Cortex-A55](https://zhida.zhihu.com/search?content_id=233424185&content_type=Article&match_order=1&q=Cortex-A55&zhida_source=entity) ，和最新的Cortex-A77等都支持TrustZone，并且得到非常广泛的应用，比较典型的场景如指纹识别，人脸识别，移动支付，企业应用， [数字版权保护](https://zhida.zhihu.com/search?content_id=233424185&content_type=Article&match_order=1&q=%E6%95%B0%E5%AD%97%E7%89%88%E6%9D%83%E4%BF%9D%E6%8A%A4&zhida_source=entity) 等等，都是基于TrustZone来实现保护的。

其实对于底层安全技术来说，无论是哪个场景的安全要求归结到硬件上面可以分为两点，一个对数据的访问，一个是对外设的控制。TrustZone天生就具备这样的优势，因为CPU分为安全状态和普通状态，结合 [地址空间](https://zhida.zhihu.com/search?content_id=233424185&content_type=Article&match_order=1&q=%E5%9C%B0%E5%9D%80%E7%A9%BA%E9%97%B4&zhida_source=entity) 控制器可以实现对不同的访问数据权限，结合总线和系统IP可以非常灵活控制外设的 [访问权限](https://zhida.zhihu.com/search?content_id=233424185&content_type=Article&match_order=1&q=%E8%AE%BF%E9%97%AE%E6%9D%83%E9%99%90&zhida_source=entity) ，网上有非常多的Cortex-A的TrustZone资料。

![](https://pic1.zhimg.com/v2-d715485bb34929db3624a58c237147b4_1440w.jpg)

在这里插入图片描述

Arm从2015年把TrustZone引入到M系列，也是作为Armv8-M的可选的安全扩展，同样虽然是可选的安全扩展，但是Cortex-M23、Cortex-M33等CPU都实现TrustZone，为什么把TrustZone引入到M系列呢？因为越来越多的设备具备联网能力，只要能够联网都存在安全威胁，云服务商要确保只有可信的设备才能接入到他们的云服务，另外是设备端一般要把数据上传到云端，如果设备端不安全，数据的源头都不安全，那么上传到云端也没有价值，或者有负价值，所以说设备端是IOT安全的源头，确保设备的安全性是IOT安全的基础。

![](https://pic4.zhimg.com/v2-6caea767aaa267f37375f2d7272a1a57_1440w.jpg)

在这里插入图片描述

## 差异点

Cortex-A 和Cortex-M的TrustZone在设计思想上是一样的，CPU都有两个安全状态，并且系统上的资源划分为安全资源和非安全资源，在非安全状态下只能访问非安全资源，在安全状态下能否访问所有的资源。但是M系列和A系列架构本身就存在差异，那么TrustZone从具体实现角度来看也存在差异，并且M系列资源比较有限和需要实时响应，在安全的具体设计时也不一样。例如在A系列两个状态的切换只能通过monitor来切换，M系列的切换入口就比较多；M系列可以直接响应非安全中断，也可以直接调用非安全的代码；M系列的banked [寄存器](https://zhida.zhihu.com/search?content_id=233424185&content_type=Article&match_order=1&q=%E5%AF%84%E5%AD%98%E5%99%A8&zhida_source=entity) 也会更多，在软件的差异上也比较大，A系列需要软件来保存上下文，M系列很多是通过硬件的方式自动保存，Arm在网站介绍了 [Cortex-A](https://zhida.zhihu.com/search?content_id=233424185&content_type=Article&match_order=9&q=Cortex-A&zhida_source=entity) 和Cortex-M之间的差异，同时也提供了Armv8-M的TrustZone白皮书。

![](https://pica.zhimg.com/v2-f15f6a56cdbe39c90ac64473fd1e65ba_1440w.jpg)

在这里插入图片描述

原文链接： [aijishu.com/a/106000000](https://link.zhihu.com/?target=https%3A//aijishu.com/a/1060000000003352)

> 本文使用 [Zhihu On VSCode](https://zhuanlan.zhihu.com/p/106057556) 创作并发布

发布于 2023-09-01 22:41・四川[24届/25届想进IC设计的同学，建议最好有个拿手项目！](https://zhuanlan.zhihu.com/p/716583785)

[

\[图片\] 放眼整个IC行业，公司招聘最看重什么？无疑是项目经验了。 面试问的最多的是什么？是有项目经验没？有流片经历没？ 对初学者或新入行的朋友来讲，没有流片经历，项目经历，确实会...

](https://zhuanlan.zhihu.com/p/716583785)