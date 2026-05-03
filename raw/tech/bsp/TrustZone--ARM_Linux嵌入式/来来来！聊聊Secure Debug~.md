---
title: "来来来！聊聊Secure Debug~"
source: "https://zhuanlan.zhihu.com/p/918156783"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "Secure Debug的白话前言Secure Debug的核心价值Secure Debug的运作机制Secure Debug的实施策略Secure Debug的关键举措Secure Debug的具体实现 Secure Debug的白话前言想象一下，你的设备里有一个特别的保安系统，…"
tags:
  - "clippings"
---
[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770)

5 人赞同了该文章

- [Secure Debug的白话前言](https://zhuanlan.zhihu.com/write)
- [Secure Debug的核心价值](https://zhuanlan.zhihu.com/write)
- [Secure Debug的运作机制](https://zhuanlan.zhihu.com/write)
- [Secure Debug的实施策略](https://zhuanlan.zhihu.com/write)
- [Secure Debug的关键举措](https://zhuanlan.zhihu.com/write)
- [Secure Debug的具体实现](https://zhuanlan.zhihu.com/write)

## Secure Debug的白话前言

想象一下，你的设备里有一个特别的保安系统，这个保安系统叫做“ [安全管理器](https://zhida.zhihu.com/search?content_id=249077675&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E7%AE%A1%E7%90%86%E5%99%A8&zhida_source=entity) ”。这个保安系统有一个特殊的功能，叫做“ [Debug逻辑](https://zhida.zhihu.com/search?content_id=249077675&content_type=Article&match_order=1&q=Debug%E9%80%BB%E8%BE%91&zhida_source=entity) ”，它就像是一个多功能的钥匙，可以用来检查和修理电脑或手机内部的问题（这就是调试功能）。当然这么内部的问题，不能谁想看就能看，因此还需要控制这些调试的接口如JTAG、 [CPU](https://zhida.zhihu.com/search?content_id=249077675&content_type=Article&match_order=1&q=CPU&zhida_source=entity) 、 [DAP](https://zhida.zhihu.com/search?content_id=249077675&content_type=Article&match_order=1&q=DAP&zhida_source=entity) 和CoreSight的访问权限。

简言之这就是安全管理器中的Debug逻辑，不但具备调试功能，也负责控制JTAG、CPU、调试访问端口（DAP）以及CoreSight域这些调试功能本身的启用或禁用状态。

实现这种调试访问的权限控制是由debug fuses, [option bits](https://zhida.zhihu.com/search?content_id=249077675&content_type=Article&match_order=1&q=option+bits&zhida_source=entity), 和寄存器共同决定，它们会改变调试外设的默认状态并设定其功能状态。

在电源上电复位期间，系统会阻止对所有调试域的访问。而在热复位期间，除JTAG外，系统会阻止对其他所有调试域的访问。一旦退出冷复位或热复位， **[dbg\_disable\_access保险丝](https://zhida.zhihu.com/search?content_id=249077675&content_type=Article&match_order=1&q=dbg_disable_access%E4%BF%9D%E9%99%A9%E4%B8%9D&zhida_source=entity) 和dbg\_lock\*保险丝的值将决定默认的调试访问权限。**

怎么理解这句话？先说说几个概念

1. **电源上电复位** ：当设备首次接通电源或电源被切断后重新接通时，会触发电源上电复位。在这个过程中，系统会阻止对所有调试域的访问， **以确保设备在启动时的安全性。**
2. **热复位** ： **热复位是在设备已经运行的情况下，通过某种方式（如软件指令或硬件按钮）触发的复位** 。与电源上电复位不同，热复位期间， **系统通常会保留部分数据（如寄存器值），但会停止当前执行的程序并重新开始执行** 。在这个过程中，系统会阻止对所有除JTAG外的调试域的访问。JTAG（Joint Test Action Group）是一种国际标准测试协议，用于对芯片进行测试、调试和编程。在某些情况下， **即使在热复位期间，也可能需要保留对JTAG的访问权限，以便进行必要的测试或调试操作。**
3. **复位结束后的调试访问权限** ：一旦设备退出冷复位或热复位状态，dbg\_disable\_access保险丝和dbg\_lock *保险丝的值将决定 **默认的调试访问权限** 。这些保险丝是硬件级别的安全机制，用于控制对调试功能的访问。如果dbg\_disable\_access保险丝被熔断（即设置为禁用状态），那么复位后，系统将默认禁用对所有调试域的访问。如果dbg\_disable\_access保险丝未被熔断，并且dbg\_lock* 保险丝也处于允许访问的状态，那么复位后，系统将允许对调试域的访问， **但具体的访问权限可能还受到其他安全机制（如软件锁、密码保护等）的限制。**

总的来说，这就是强调了在不同复位操作期间和复位结束后，系统对调试域访问权限的严格控制，以及通过保险丝等硬件安全机制来确保设备的安全性。

看到这里你也知道这是一个关于 [SoC DFX](https://zhida.zhihu.com/search?content_id=249077675&content_type=Article&match_order=1&q=SoC+DFX&zhida_source=entity) 的手段，日常我们都是使用DS5或者劳特巴赫去调试芯片，但是那种状态下，咱们的调试接口必然是出于Open状态，设备也是处在研发阶段。一般出厂的话都会设置成客户不能轻易访问的状态。

> 白话就扯这么多，下面来严肃的聊聊。

## Secure Debug的核心价值

说白了就是重要性：

1. **固件安全守护** ： 安全调试通过设立调试接口的访问门槛，坚决捍卫了控制器固件的安全。任何未经授权的访问企图都将被无情阻断，从而确保了固件信息的机密性与完整性。
2. **系统完整性维护** ： 在守护控制器系统完整性方面，安全调试扮演着举足轻重的角色。它确保系统始终处于稳固的安全状态，大幅降低了攻击者趁机捣乱的风险。
3. **法规遵从的保障** ： 众多行业规范均将调试端口的安全管理视为产品安全机制的关键一环。而安全调试的引入，则是满足这些监管要求的必要之举。

> 做安全产品，尤其是国内是非常的不重视的，但是国家在推行，出海尤其是欧洲，那更是要求极其严格，很多对安全的要求变成了产品的准入规则之一，所以有时候可能第三点的源动力是盖过了前面两点。哈哈哈。

## Secure Debug的运作机制

1. **精细的访问控制** ： 安全调试只允许经过严格认证的调试端口访问。认证流程可能涵盖密码验证、数字证书或其他安全凭证的核验。
2. **灵活的临时激活** ： 调试接口仅在必要时刻被临时激活，且授权有效期极为有限。一旦授权期满，系统将自动恢复调试接口的禁用状态。
3. **详尽的安全日志** ： 所有调试活动均被详细记录，为未来可能的安全审计与数据分析提供了宝贵的参考依据。这些日志详细记录了调试接口的使用者、使用时间以及使用目的。

## Secure Debug的实施策略

> 需要控制调试范围、决定由系统的哪些部分来组合配合控制

1. **主机调试控制器的运用** ： 安全调试通常借助 [CHIP](https://zhida.zhihu.com/search?content_id=249077675&content_type=Article&match_order=1&q=CHIP&zhida_source=entity) 提供的主机调试控制器功能得以实现。该控制器要求在执行调试命令前进行认证，从而确保了调试操作的合法性。
2. **HSM（硬件安全模块）的守护** ： HSM在决定是否允许调试访问方面发挥着关键作用。它负责执行安全密钥管理与加密任务，为调试访问筑起了一道坚不可摧的安全防线。

> 推荐阅读： **[【硬件安全】硬件安全模块—HSM](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247488837%26idx%3D1%26sn%3Dfeb00411b7c3513edfbeb9edfc951c5b%26chksm%3Dfa5c4858cd2bc14e0dce203311ddcffd2c5119ce2bbb9d94b952526f08fa896f575dc6a03e6e%26token%3D141580961%26lang%3Dzh_CN%23rd)**

1. **调试范围的严格限制** ： 尽管安全调试允许通过认证程序临时访问调试接口，但其访问范围被严格限定在主机范围内。对于HSM的访问则被坚决禁止，从而进一步提升了系统的安全等级。

## Secure Debug的关键举措

- **因CHIP而异的实施策略** ： 安全调试功能可能因CHIP的不同而有所差异。因此，我们需要根据每个CHIP的特性来定制适合的安全调试方案，并向 [OEM](https://zhida.zhihu.com/search?content_id=249077675&content_type=Article&match_order=1&q=OEM&zhida_source=entity) （原始设备制造商）提出并获得批准。

> 这里的每个，是一个type，而不是每个die。

- **密码的个性化设置** ： 若CHIP提供了基于密码的安全调试功能，建议为每个批量生产的产品设置不同的密码。这一举措将有效提升每个产品的安全性，并显著降低批量攻击的风险。

> 这是必要的，不然哈哈哈一旦破解一个，那不白搭。

---

## Secure Debug的具体实现

前面说了为了防止生产设备在编程发货后被调试访问，可以设置保险丝来禁用调试模块或启用安全JTAG模式。 **在安全JTAG模式下** ， **调试/编程硬件在连接时需要使用密码** 。如果没有正确的密码，安全JTAG模式 **将不允许** 通过调试模块进行内存读写或代码执行访问。

![](https://pic3.zhimg.com/v2-15506220bb88f54f0f7aa9526eefb56a_1440w.jpg)

如果提供了正确的密码，则可以使用正常的JTAG/SWD模式对设备进行调试或重新编程。

![](https://pic1.zhimg.com/v2-e3e6451dbb83ed689b163c3d9598e4e2_1440w.jpg)

工具会把JTAG密码、签名证书和加密的启动密钥都放在一个叫做PEKeyFile的文件里（这个文件扩展名是.peKeyFile）。在这个PEKeyFile文件里，你可以存一套四个签名证书，还有你想存多少就存多少的JTAG密码和加密的启动密钥。很多需要安全启动的项目都可以共享这些安全信息。

> 那这个控制访问权限，以及比对密钥判断是否放行的“靓仔”内部长什么样子呢？

![](https://pic4.zhimg.com/v2-11938de8661720c9e0523256c49c7ddf_1440w.jpg)

> 上面这张图是来自ARM的，ARM是真的太细心(想赚钱)了，啥都有。

上面这个是ARM的CoreSight 调试认证通道，Arm推出的一套全方位的安全解决方案，其中包含一个通过密钥交换来确认外部调试能否访问系统的验证机制。这个机制带来了以下好处：

- 根据设备的生命周期阶段和加密身份来进行调试授权
- 将授权范围限定在特定的设备及其功能上
- 允许将可调试资源与不同的信任源关联起来
- 支持证书过期和资源锁定功能

这个套件提供了一个接口，你可以通过这个接口，利用现有的调试访问端口（DAP）将安全调试证书导入到平台中。这样一来，原始设备制造商（OEM）就不需要再为这些证书开发专用的导入机制了。

下面的图表展示了调试器工作站是如何通过CoreSight连接到目标系统的。在这个例子中，DAP负责将调试器指令发送到CPU DAP和内存访问端口（MEMAP），但在安全软件成功验证调试器的调试证书之前，这两个端口都是关闭的。

一旦验证通过，安全软件就会根据证书中指定的设置来配置 [CryptoCell DCU](https://zhida.zhihu.com/search?content_id=249077675&content_type=Article&match_order=1&q=CryptoCell+DCU&zhida_source=entity) ，随后CPU DAP和MEMAP就会被激活。调试器会通过CoreSight SDC-600通信通道发送其调试证书。这个通信过程是由软件驱动程序来处理的，它会通过软件调试处理器与CryptoCell驱动程序进行交互。调试会话结束后，调试器需要在恢复正常操作之前先执行系统重置，以清除DCU的值。

![](https://pica.zhimg.com/v2-2ad041dd6e2bea7b56b0850b32b38e6c_1440w.jpg)

当然每个厂家的自研实现都是千差万别的，毕竟这个我理解只需要根据这提供的思路，我计算做离线的简单密钥比对方案也就成立，只不过需要把密钥和安全方案配合做一个端到端的闭环方案。

- 再详细，明天再聊，太晚了。
- 友友们你们最近咋回事，咋只转发不点赞，心痛，再这样没动力更新了哈。

---

> 要想完整详细的去了解这部分，你可能还需要了解一下Coresight。不好意思，就是这么体贴，很早之前的很多文章都替你写好了，记得看哦。

- **[【芯片DFX】Arm调试架构篇](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247488158%26idx%3D1%26sn%3D74b4c3702733c2ca87be3c22842df646%26chksm%3Dfa5c4f83cd2bc695cd0e8dce502305ff01110351403fdda6f878f47970b6cefdc663d073b199%26token%3D141580961%26lang%3Dzh_CN%23rd)**

发布于 2024-10-10 22:12・四川[Debug](https://www.zhihu.com/topic/19620367)[VMware 替代专题 | VMware 超融合国产替代之性能对比篇](https://zhuanlan.zhihu.com/p/569039543)

[

2024 最新资料：文章：VMware 替代专题｜博通收购 VMware 后的订阅策略、产品组合调整，以及不同用户...

](https://zhuanlan.zhihu.com/p/569039543)