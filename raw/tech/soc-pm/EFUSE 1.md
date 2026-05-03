---
title: "EFUSE 1"
source: "https://zhuanlan.zhihu.com/p/676203535"
author:
  - "[[LeonardT​​芯片设计]]"
published:
created: 2026-05-03
description: "2024年的第一篇文章，就从EFUSE开始，EFUSE属于Security System的一个组件，没记错的话大约2010年左右就已经应用在了手机SOC芯片上（By the way，当年的手机SOC芯片AP的功能普遍都很弱，整体架构上更像现在的独立M…"
tags:
  - "clippings"
---
[收录于 · 芯片架构设计](https://www.zhihu.com/column/c_1877951126294372352)

61 人赞同了该文章

2024年的第一篇文章，就从EFUSE开始，EFUSE属于 [Security System](https://zhida.zhihu.com/search?content_id=238397567&content_type=Article&match_order=1&q=Security+System&zhida_source=entity) 的一个组件，没记错的话大约2010年左右就已经应用在了手机SOC芯片上（By the way，当年的手机SOC芯片AP的功能普遍都很弱，整体架构上更像现在的独立Modem芯片，主要完成通信功能）。多年前设计的Security模块，曾经在多家公司的多颗芯片上存活了10年之久，也算是经久考验的架构和代码了。但是在EFUSE上，也创造过整个设计生涯中最大的bug，还落在一个非常成功卖了xx kk颗的手机SOC芯片上。“只要能work around的bug，都不是真正的bug”，这话DE(Design Engineer)说出来虽然显得很厚颜，但却是工作过程中的至理名言，也是 ***DE在设计过程中需要认真考虑的原则问题。如何避免设计中出现bug，如何在设计的过程中留够软件work around的空间***...

言归正传。EFUSE的全称是Electronic Fuse（也叫电子熔断器或电子保险丝），是一种具有一次性可编程能力的非易失性存储器件。EFUSE通过使用I/O电压（通常为2.5V）向内部器件施加高密度电流（一个持续200微秒的10毫安直流脉冲即可）来编程，EFUSE内部低电阻金属由于高密度电流通过而被电迁移熔断从而完成编程。这个过程是不可逆的，一旦EFUSE被熔断，就不能再次编程。芯片出厂时，EFUSE中的所有比特全为“0”，如果向某一比特写入“1”，那么就彻底烧死这一比特了，它的值再无法变为“0”了。

EFUSE的优点是具有一次性编程能力，可以在生产测试或者使用过程中完成编程，且存储信息不易擦除，因此在当前的芯片设计过程中被广泛采用。EFUSE的缺点主要有如下几点：

- 仅具有一次性编程能力，无法回退，编程过程中如果出现错误只能丢弃掉整个芯片
- EFUSE的容量一般较小，最大不超过几kb，且面积通常远大于相同容量的片上存储器（SRAM），存储成本高
- EFUSE的功耗一般较高
- EFUSE容易受到攻击，黑客可以使用高功率的激光器来擦除EFUSE中的数据，或者使用特殊的攻击技术来破解EFUSE的安全性

除了EFUSE外，当下业内也会使用 [OTP](https://zhida.zhihu.com/search?content_id=238397567&content_type=Article&match_order=1&q=OTP&zhida_source=entity) （Anti-Fuse）作为一次性可编程存储器。它们虽然工作原理和feature各不相同，但是用途却基本相似。一般而言，EFUSE由Fab开发并基本免费提供，而OTP需要找IP Vendor购买，因此没有特殊原因多采用EFUSE作为一次性可编程存储器。

- 一般而言，OTP的存储密度要好于EFUSE，因此使用OTP的话芯片内可以放入更大容量一次性可编程存储器
- OTP的安全性更好，即使通过电子显微镜也无法破解出OTP内存储的信息（EFUSE可以通过电子显微镜破解）
- OTP的功耗更低
- OTP的可读取次数更多
![](https://pic3.zhimg.com/v2-29adb07fa3ccb421e78d098d8358a140_1440w.jpg)

EFUSE功能示意，from知乎

EFUSE常用于存储需要保护的信息和芯片工作时用到的关键信息，包括但不限于：

- [芯片版本管理](https://zhida.zhihu.com/search?content_id=238397567&content_type=Article&match_order=1&q=%E8%8A%AF%E7%89%87%E7%89%88%E6%9C%AC%E7%AE%A1%E7%90%86&zhida_source=entity)

\-) chip id

\-) 生产和产品信息

\-) 芯片关键配置

\-) 软件版本号

\-) 版权保护信息

- 安全保护

\-) Boot根密钥，AES KEY

\-) RSA Hash Key

- Memory Repair
- 模拟器件校准

典型的EFUSE结构框图如下所示。

![](https://pic4.zhimg.com/v2-3aab8c3eaf4e3e3e4827f76dd84fe001_1440w.jpg)

典型的EFUSE结构框图，from CSDN

***在进行一项设计工作时，首先需要思考的问题是设计对象的本质是什么*** 。对于EFUSE而言，首先它是一个只能进行一次写操作的可读写存储器。因此处理器/DMA对EFUSE的访问，就应该设计成存储器该有的样子，EFUSE被映射成系统地址空间的某一小段，访问某个地址写数据，访问某个地址读数据。其次EFUSE从cell端口上看，更像是IO控制器，通过控制IO时序实现不同的功能。把握住了两端，EFUSE Controller怎么设计也就很清晰了。

一般而言，EFUSE有三种工作模式，可以通过EFUSE端口信号不同时序进入不同的工作模式并完成相应操作。

- 非活动模式（Inactive mode）

\-) 默认状态

- 编程模式（Program mode）

\-) 一般而言，EFUSE都是按照bit为单位完成烧写

\-) 典型的编程模式时序如下：

![](https://pic3.zhimg.com/v2-164d88562006686ad56cb1e196670ece_1440w.jpg)

典型的EFUSE写模式时序，from CSDN

- 读取模式（Read mode）

\-) T家常按照word单位进行读取，早期S家按照byte单位进行读取

\-) 典型的读模式时序如下：

![](https://pic3.zhimg.com/v2-ded28c0590623ce7670d51edc32cbe2e_1440w.jpg)

典型的EFUSE读模式时序，from CSDN

限于篇幅和时间，这篇文章主要介绍了EFUSE的功能、结构、接口，下篇文章将介绍EFUSE Controller设计和security中的相关内容，如果找回了github的密码又有足够的时间，也会把示例RTL代码放上，敬请期待。

编辑于 2024-01-15 11:05・北京