---
title: "搞DDR，你是可以看看我的这篇笔记"
source: "https://zhuanlan.zhihu.com/p/711689353"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-02
description: "搞DDR，你必须得看看我的这篇笔记（一）：DRAM搞DDR，你必须得看看我的这篇笔记（二）：DDRC搞DDR，你是可以看看我的这篇笔记（三）：DDRPHY搞DDR，你是可以看看我的这篇笔记（四）：架构&总结 关于DDR PHY这…"
tags:
  - "clippings"
---
[收录于 · SoC知识百宝箱](https://www.zhihu.com/column/c_1892355985563169100)

不坠青云之志、LogicJitterGibbs 等 218 人赞同了该文章

- [搞DDR，你必须得看看我的这篇笔记（一）：DRAM](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247499731%26idx%3D1%26sn%3Ded6d2d9c7c1394cb2e14e06d816ca6d3%26chksm%3Dfa5fa2cecd282bd83fc7b03b9ced81f340106c4eff24584cdb43f67951cd8b79a0103d9ac5e8%26payreadticket%3DHIRmBy507MIugzZMMmmuQ0AWO4p3txZaIfjD8aztw7CoTccSKWTcw99cdX4632pLwKgKzgI%23rd)
- [搞DDR，你必须得看看我的这篇笔记（二）：DDRC](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247499810%26idx%3D1%26sn%3D645237902019cbbdbcf8b10a809ce99d%26chksm%3Dfa5f9d3fcd281429ef86e0978187565eff36f00e65b4056e9630d568cd6446354a402a8f2c44%26payreadticket%3DHPE0wn7SohYJRH0lQwSlb-zec4XZDS94KHrAWJ5y4DH3rszLagMHRmlEiL4t4Oifq-uLZYc%23rd)
- [搞DDR，你是可以看看我的这篇笔记（三）：DDRPHY](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247499837%26idx%3D1%26sn%3Dd6a26437743137ba2c7e2af35fdd35b4%26chksm%3Dfa5f9d20cd281436f50709e2f8c7cba68d9d525f3488540b15b0ee4a059eef96448aa1438499%26token%3D84940425%26lang%3Dzh_CN%23rd)
- [搞DDR，你是可以看看我的这篇笔记（四）：架构&总结](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247499905%26idx%3D1%26sn%3D0ff71ca88db96df46cd7737cfe879c1c%26chksm%3Dfa5f9d9ccd28148aabcdad1e5723097e106b8d2e61d7b3ef25d0b66fdd2192abb9143ec2ec26%26payreadticket%3DHP3Lcx2CT8EUeZAA1k_9b_qNK3qKf2UZeWWXUL3sZBbkHow76grJuzIEY066JTru97EsUlw%23rd)

---

> 关于DDR PHY这个部分，是数模混合器件，工作涉及到了很多信号完整性，眼图，模拟等相关的东西我就没讲了。因为确实不太熟悉，只能站在架构、功能、使用上去聊聊。

![](https://pic3.zhimg.com/v2-35082fdd3a3a9d4a7b08e59f3450607a_1440w.jpg)

上一篇我们看了这个图片，简化就是下面这个样子：

![](https://pic2.zhimg.com/v2-5b219e460fbd44167a7a1d416e9acdcb_1440w.jpg)

其实这个也不太合适~~~

![](https://pic2.zhimg.com/v2-3d139349eca570f122f2cdb499f9bfb9_1440w.jpg)

这样舒服多了，一般DDRC和DDRPHTY都会放在一个团队，作为一个子系统来交，好的。开始正题：

上一篇，我在笔记2大概的介绍了DDRC的功能：

- DDRC通过AXI接受到来自Master的读写命令
- 将来自master的命令转为DDR读写时序序列
- 通过 [DFI协议](https://zhida.zhihu.com/search?content_id=246284125&content_type=Article&match_order=1&q=DFI%E5%8D%8F%E8%AE%AE&zhida_source=entity) 传给PHY
![](https://pic4.zhimg.com/v2-1390cfbea852eebf2b4b0f7a6b6b28cf_1440w.jpg)

DDR4 Memory Interface Subsystem

这一篇就来看看DDRPHY，在开始之前我们得了解一些PHY到底是什么？

PHY，其实就是物理physical的前三个词语，放在通信中就是物理层的意思，不知DDR有PHY，PCIE、USB、HDMI、DP等等这些涉及到通信的都有这个PHY的概念。

主要就是负责物理层的数据处理，是负责数字逻辑对接器件的桥梁。是的，PHY这玩意是个数模混合的器件。

DDRPHY干了什么？它将来自控制器的数据包，转换成DDR接口电气特性、时序特性的信号，送给对端器件DDR，也负责将DDR返回的数据转成控制器对应的数据包。

到这里是不是有感觉了？DDRC将来自AXI的命令转成对应DDRC数据包，PHY再将DDRC数据包转成DDR能识别的时序信号。

![](https://pic2.zhimg.com/v2-5dbcd3731d44708e3b63d5b1fac9a72f_1440w.jpg)

来自：新思

> 这个图是不是蛮不错的

**但是DDRPHY就做个数据转换？**

那肯定不是！首先说说兼容性，一个PHY一般会支持多个协议，对接不同的DDR，其次是支持扩容对吧，前面我们DDRC说了支持，那DDRPHY肯定需要配套的支持。

其次你说这个DDR，我们在搞启动的时候，很多时候有 [DDRtraning](https://zhida.zhihu.com/search?content_id=246284125&content_type=Article&match_order=1&q=DDRtraning&zhida_source=entity) ，对吧。这个需要和DDR PHY支持吧。

那你都说启动了，DRAM颗粒的也许初始化，它又只是个介质，这个也需要DDRPHY来搞一下。其它的什么通信协议转换，这是本质工作， [展频](https://zhida.zhihu.com/search?content_id=246284125&content_type=Article&match_order=1&q=%E5%B1%95%E9%A2%91&zhida_source=entity) 这些也是一个好的DDRPHY需要支持的撒。

当然DFT做 [BIST](https://zhida.zhihu.com/search?content_id=246284125&content_type=Article&match_order=1&q=BIST&zhida_source=entity) ，肯定也需要支持。

对了还有，你说这个待机启动， [低功耗设计](https://zhida.zhihu.com/search?content_id=246284125&content_type=Article&match_order=1&q=%E4%BD%8E%E5%8A%9F%E8%80%97%E8%AE%BE%E8%AE%A1&zhida_source=entity) ，这个唤醒的工作也得交给DDRPHY，谁让你离DRAM近呢？

> 我喜欢以和朋友聊天的语气，先把想到的东西都聊出来，再整理成点，这样哈哈哈自然点。

到这里我们来简单梳理一下DDRPHY暂时我们考虑到的功能：

- 支持多协议DDRx/LPDDRx
- 支持多种接口：DFI、APB
- 支持扩容：多RANK、多通信比率
- 支持DRAM颗粒的初始化与配置
- 支持DRAM 的Training
- 支持BIST
- 支持待机唤醒
- 支持低功耗、展频

对吧，后面发现有遗漏咱们再补充。继续继续往下聊！

首先迎来的就是入口DFI。

## DFI

**内存控制器逻辑和PHY接口是DDR内存系统中的两个主要设计元素** ，这些系统几乎应用于所有电子系统设计中，从手机、机顶盒到计算机和网络路由器。内存系统的这两个组件需要一套独特且不同的工程技能、工具和方法，因此，它们通常由不同的工程团队开发，或者从不同的第三方设计知识产权（IP）供应商处获得。

因此， **这两个设计元素之间缺乏标准接口已成为系统开发人员** 、内存控制器供应商和PHY提供商面临的主要集成和验证成本来源。 **[DFI规范](https://zhida.zhihu.com/search?content_id=246284125&content_type=Article&match_order=1&q=DFI%E8%A7%84%E8%8C%83&zhida_source=entity) 的目标是定义内存控制器逻辑和PHY接口之间的通用接口** ，以降低成本、缩短上市时间，并提高构成内存系统的各个组件的重用潜力。

DFI规范由半导体、IP和电子设计自动化（EDA）行业公认的领先企业的专家贡献者共同制定，包括：ARM、Avago、Cadence、Intel、Samsung、ST Microelectronics、Synopsys和Uniquify。

**DFI规范定义了内存控制器逻辑和PHY接口之间的接口协议** ，旨在降低集成成本的同时提高性能和数据吞吐量效率。该协议定义了跨接口进行有效通信所需的信号、时序和功能。

该规范旨在供内存控制器和PHY设计的开发人员使用，但不对内存控制器如何与系统设计接口或PHY如何与内存设备接口施加任何限制。

DDR PHY接口（DFI）被用于多种消费电子设备中，包括智能手机。

我们也知道了DFI是一种接口协议，它定义了将 **控制信息和数据从DRAM设备传输到微控制器（MC）和PHY之间** ，以及从微控制器（MC）和PHY之间传输到DRAM设备 **所需的信号、时序和可编程参数** 。DFI适用于所有DRAM协议，包括DDR4、DDR3、DDR2、DDR、LPDDR4、LPDDR3、LPDDR2和LPDDR。

> 到这里你应该知道为什么需要DFI？

当MC（内存控制器）和PHY被专门开发 **以协同工作时** ，DFI接口并不是必需的。然而，在许多情况下，MC和PHY是分开设计的——通常由不同的公司完成。 **DFI允许公司在开发MC和PHY IP设计时知道它们将能够与其他公司开发的设备互操作。**

此外，MC设备主要是基于时钟的，而PHY则通常包含大量的模拟逻辑，因此即使在同一公司内部， **这两个设备也往往由不同的工程师开发。DFI为这两个独立的设计团队创建了一个定义明确的接口。**

![](https://pic4.zhimg.com/v2-7b161143a737c42a34174f520c9cd1c7_1440w.jpg)

DFI in Memory System

最新的DFI规范版本是4.0，修订版2。多年来，该规范已经历了多次重大改进，如下表所示：

![](https://pic2.zhimg.com/v2-f20b5936bbd1f3d4e0d18b99c1e8b2af_1440w.jpg)

> DFI协议的主要特点

- 不同的频率比 – DFI接口支持1:1、1:2和1:4的内存控制器（MC）到PHY时钟频率比，以实现快速的PHY内存访问。DFI规范定义了MC和PHY之间的频率更改协议，允许设备更改内存控制器和PHY的时钟频率，而无需完全重置系统。
- 对MC或PHY无限制 – DFI协议并不包含MC或PHY的所有功能，也不对MC或PHY如何与系统其他方面的接口施加任何限制。
- 数据总线反转（DBI） – DBI可用于减少总线上的转换次数和/或降低总线上的噪声和功耗。
- DFI读写训练操作可以提高DDR4、DDR3、LPDDR4、LPDDR3和LPDDR2系统中信号放置的准确性，特别是在更高速度下。
- 低功耗模式 – 如果PHY知道DFI将在一段时间内处于空闲状态，那么PHY可能能够进入 **由MC启动的低功耗状态。**

**看看，是不是这里和我们上面的功能点对上了哈哈哈。**

DDR PHY接口规范没有指定MC和PHY之间信号的时序值。\*\*唯一的要求是DFI时钟必须存在，并且所有由DFI定义的信号都必须由参考DFI时钟上升沿的寄存器驱动。\*\*对于这些信号的接收方式没有限制，也没有规定DFI时钟的来源。在给定频率下，MC和PHY之间的兼容性取决于对驱动信号的输出时序规范以及DFI上接收这些信号的建立和保持要求。

**DFI规范包括了符合DFI所需的信号和时序参数描述** 。DFI兼容性 **取决于MC和PHY提供的信号和时序参数的宽度和值** 。如果DFI信号宽度和/或时序参数不一致，即使完全符合DFI规范的设备也可能不兼容， **即如果它们的系统设置不一致或时序参数超出范围，则它们可能无法或能够通过DFI进行通信。**

DFI并不规定DRAM设备控制信号、读取数据或写入数据的绝对延迟。然而，DFI确实包含了必须由MC、PHY或整个系统为符合DFI而指定的时序参数定义。这些时序参数定义了DFI协议在DFI上发送控制、读取和写入数据时的信号时序关系。各个时序参数支持的值由MC和PHY分别定义。MC和PHY之间的兼容性取决于每个组件单独支持的时序参数的值和范围。DFI规范没有规定必须支持的值的固定范围。

DFI规范允许某些时序参数被指定为固定值、最大值或基于系统中其他值的常数。这些时序参数在DFI总线上执行命令时必须保持不变；但是，如果有必要，这些值可以在总线空闲时更改。

DFI规范定义了MC和PHY之间的匹配频率接口。然而，DFI可以在PHY相对于MC以频率倍数运行的系统中使用。

此外，DFI规范还包括一个可选的协议，用于处理系统频率变化。符合DFI要求并不要求支持此协议。

来看一下这个简图：

![](https://picx.zhimg.com/v2-765b6a72608c5c40cf490073c39c8483_1440w.jpg)

关于这部分协议，详细你需要使用的话请参考：

- **DDR-PHY-Interface-Specification-v3-0.pdf\[1\]**
- **DDRPHY-Interface-Specification-v2.1.pdf\[2\]**

我就不一一展开了。

> 最近有朋友，给我说英语看着很难受。哈哈哈忍一下，英语会一直都是前沿技术的主流语言。好好练习一下，是有用的。

## DDRPHY内部

过了DFI， **这下就应该到PHY的内部了。**

DDR内存接口IP解决方案包括DDR控制器、PHY和接口。当我们提到DDR内存子系统时，我们指的是主机片上系统（SoC）控制和访问DDR内存，以及主机和DDR内存设备之间的接口和互连（通常是PCB），以及DDR SDRAM设备本身。

这是一整个Harden。

![](https://pic4.zhimg.com/v2-9c8fbecb5362ade4a2903170c0d1cd6d_1440w.jpg)

DDR PHY和DDR控制器之间的一些关键参数， **如DDR模式、频率比和内存数据宽度，必须保持一致。**

DDR PHY的实现分为内部模块实现和顶层实现。通常，DDR PHY包含以下五种类型的模块。 **根据DDR的配置，这些模块可以根据逻辑进行更改。**

- 数据控制模块：它控制数据的读/写操作。\*\*它将DQ（数据信号）、相关的DM（数据掩码信号）和DQS（数据选通信号）信号连接至RAM。\*\*根据RAM接口所需的数据宽度，数据块会进行复制。
- Data Control Block（地址控制模块）：它生成RAM控制信号，这些信号基于芯片选择（CS）、地址选择（AS）和其他控制信号的数量。
- Address Control Block（内存时钟模块）：它为RAM提供DDR时钟。
- Memory clock block（地址控制主模块）：它控制所有地址控制模块。
- Address Control Master Block（加法器生成模块）：它生成DRAM地址并提供地址信号。
- PLL（ [相位锁定环](https://zhida.zhihu.com/search?content_id=246284125&content_type=Article&match_order=1&q=%E7%9B%B8%E4%BD%8D%E9%94%81%E5%AE%9A%E7%8E%AF&zhida_source=entity) ）：DDR的顶层模块还包括两个PLL。一个PLL生成PHY时钟，而另一个与内存时钟模块一起工作的PLL生成DRAM时钟。
![](https://pic2.zhimg.com/v2-a10b553edd392b8eede1fdd72d4ababd_1440w.jpg)

上面是内部组件图，下面是加了信号线的结构图：

![](https://pic1.zhimg.com/v2-e65ae21f5d0aac2c5f9bc29775a07aca_1440w.jpg)

- 这里面JTAG是用来Debug的。
- APB就是配置通路，这个在之前也提过哦。

到这里我们了解了PHY的内部架构，下面就是来聊聊PHY的工作如何开展的，这部分我暂时也是个二杆子，我找了一份资料，翻译了PHY的部分翻译，位于本文最后一个章节。

在看这个之前，我们得理解一些概念！

---

## PHY的初始化

控制器的初始化序列包括以下几个阶段：

- PHY初始化
- DRAM初始化
- Data training

此图展示了PHY初始化序列的高级图示。

![](https://pic3.zhimg.com/v2-f7561d4fc96f0198aef8d933dd32ce16_1440w.jpg)

![](https://pic3.zhimg.com/v2-424feb083fa6602f66c14ee022e0388a_1440w.jpg)

**PHY初始化**

在复位解除后，PHY处于未初始化状态。PHY初始化包括初始化PHY的PLL（相位锁定环）、执行初始阻抗校准和运行延迟线校准。这些功能都可以通过写入PIR = x0000\_0033来同时触发。初始阻抗校准可以与PLL初始化和随后的延迟线校准并行执行。

**DRAM初始化**

DDR控制器执行DRAM初始化。DDR\_PHY的PIR必须编程为PIR = 0004\_0001，以便将DFI接口的控制权从PUB转移到DDR控制器，以进行DRAM初始化。

**Data Training**

在RDIMM初始化和SDRAM初始化之后，可以通过编程PIR来运行一个或多个训练步骤。

以下训练步骤可以通过向相应的PIR寄存器位写入来触发：

1. CA训练（仅LPDDR3）。
2. 写电平调整。
3. 读电平调整。
4. DQS2DQ训练（仅LPDDR4）。
5. 写延迟调整训练。
6. 读数据位去偏斜训练。
7. 写数据位去偏斜训练。
8. 读数据眼图训练。
9. 写数据眼图训练。
10. [VREF训练](https://zhida.zhihu.com/search?content_id=246284125&content_type=Article&match_order=1&q=VREF%E8%AE%AD%E7%BB%83&zhida_source=entity) （DDR4和LPDDR4）。

**动态DDR配置**

在DDR控制器处于复位状态时，控制器能够在运行时配置不同的内存设置。通常，这通过I2C外设从DIMM SPD EEPROM读取DRAM配置来在DIMM拓扑中使用。

## Data Eye Training是做什么的？

Data Eye Training（数据眼图训练）是内存接口（如DDR、LPDDR等）中的一项关键技术，旨在优化数据传输的质量和可靠性。随着时钟频率的不断提高，数据眼图的宽度变得越来越窄，这增加了数据采样的难度。数据眼图训练通过一系列自动或手动的调整过程，确保数据信号在最佳的时间窗口内被准确捕获和传输。

具体来说，Data Eye Training的作用和目的包括以下几个方面：

1. **优化时序裕量** ：通过调整信号的时序参数，如DQS（数据选通信号）和DQ（数据信号）之间的相对延迟，确保数据信号在DQS的有效窗口内稳定传输，从而增加数据传输的可靠性。
2. **消除静态偏斜和噪声** ：在高速数据传输中，信号可能会受到各种因素的影响而产生偏斜和噪声。Data Eye Training通过引入适当的补偿和调整机制，减少这些因素对数据信号的影响，使数据眼图保持较宽的宽度，便于数据的准确采样。
3. **提升系统性能** ：通过优化数据信号的时序和传输质量，Data Eye Training可以提升整个内存子系统的性能，包括数据传输速率、稳定性和响应时间等。
4. **适应不同工作环境** ：由于不同的工作环境（如温度、电压等）会对信号传输产生影响，Data Eye Training通常包括一系列自动调整机制，以适应这些变化，确保在各种工作环境下都能保持稳定的数据传输质量。

在Data Eye Training过程中，通常会涉及多个步骤和参数调整，包括但不限于：

- **CA（控制、时钟和命令/地址）校准** ：确保控制、时钟和命令/地址信号在DRAM设备中正确注册。
- **写电平调整** ：调整DQS信号与DQ信号之间的相对延迟，以确保写操作时的数据对齐。
- **读电平调整** ：类似地，调整读操作时的DQS和DQ信号之间的相对延迟。
- **DQS2DQ训练（仅限LPDDR4）** ：针对LPDDR4等特定内存类型进行的特殊训练步骤。
- **写延迟调整训练** ：优化写操作的延迟参数。
- **读写数据位去偏斜训练** ：消除数据位之间的偏斜，确保数据信号在传输过程中保持同步。
- **读写数据眼图训练** ：通过调整DQS信号的位置和时序参数，优化读写操作时的数据眼图宽度和稳定性。

Data Eye Training它通过优化信号的时序和传输质量，确保数据在高速传输过程中的准确性和可靠性。

### 阻抗校准

PHY包括校准I/O单元和有限状态机逻辑，用于自动补偿输出驱动强度和片内终止强度，以适应工艺、电压和温度的变化。

### CA Training (LPDDR3 Only)

在DDR（Double Data Rate）内存技术中，特别是针对LPDDR3（Low Power Double Data Rate 3）版本，CA Training（控制、地址和命令训练）是一个重要的特性，其主要作用可以归纳如下：

1. 优化时序参数
- **建立时间和保持时间优化** ：CA Training用于优化控制、地址和命令（CA）总线信号相对于内存时钟的建立时间和保持时间。这是确保高速数据传输过程中，这些关键信号能够准确无误地被内存接收并处理的关键步骤。
	- **信号完整性提升** ：通过调整CA总线的时序参数，CA Training有助于减少信号传输中的畸变和干扰，提升信号完整性，从而确保数据传输的可靠性和稳定性。
1. 适应工作环境变化
- **工艺、电压和温度补偿** ：由于工艺偏差、电压波动和温度变化等因素会对信号传输产生影响，CA Training能够自动调整CA总线的时序参数，以适应这些工作环境的变化。这有助于确保系统在各种条件下都能保持稳定的性能表现。
1. 简化系统设计和调试
- **内置训练机制** ：LPDDR3通过内置CA Training机制，使得系统设计者能够更容易地调整和优化内存的时序参数。这有助于简化系统的设计和调试过程，降低开发成本和时间。
1. 提升系统性能
- **高速数据传输支持** ：通过优化CA总线的时序参数，CA Training有助于提升系统的高速数据传输能力。这对于需要处理大量数据和复杂任务的现代电子设备尤为重要。
1. 确保数据准确性
- **减少数据传输错误** ：通过精确控制CA信号的定时，CA Training有助于减少数据传输过程中的错误和丢包现象，确保数据的准确性和完整性。

### 写均衡（Write Leveling）

出于信号完整性的考虑，多个SDRAM系统中的时钟、地址和控制信号必须按顺序从一个SDRAM路由到下一个。这被称为飞越（fly-by）拓扑结构，有助于减少分支的数量和长度。然而，写数据和选通信号可以等延迟地路由到每个SDRAM。飞越拓扑结构可能会在时钟和数据选通信号之间引起偏差，使得控制器难以维持tDQSS、tDSS和tDSH规范。为了补偿这种偏差，写均衡（Write Leveling）功能用于在每个SDRAM处将时钟与数据选通信号对齐。

PHY使用写均衡功能以及SDRAM的反馈来调整DQS\_t - DQS\_c与CK\_t - CK\_c之间的关系。写均衡在DQS\_t - DQS\_c上具有可调节的延迟设置，以便将DQS\_t - DQS\_c的上升沿与DRAM引脚处时钟的上升沿对齐。DRAM通过DQ总线异步反馈CK\_t - CK\_c（以DQS\_t - DQS\_c的上升沿采样），写均衡反复延迟DQS\_t - DQS\_c，直到检测到从0到1的转换。通过写均衡建立的DQS\_t - DQS\_c延迟确保了tDQSS规范的实现。

Write Leveling（写入均衡）在DDR（Double Data Rate，双倍数据率）内存技术中，特别是从DDR3开始引入，其主要用途是解决DQS（数据选通信号）和CLK（时钟信号）之间的边沿对齐问题，以提升信号完整性和系统性能。具体来说，Write Leveling的用途可以归纳如下：

1. 解决信号边沿对齐问题
- **边沿对齐** ：在高速数据传输中，DQS和CLK信号的边沿对齐对于确保数据的正确采样和传输至关重要。Write Leveling通过调整DQS信号的延迟，使得每个DRAM颗粒的DQS信号和CLK信号的边沿能够精确对齐，从而满足时序要求。
- **补偿skew** ：由于PCB布线、信号衰减和时钟抖动等因素，DQS和CLK信号在传输过程中可能会产生skew（偏差）。Write Leveling能够补偿这种偏差，确保信号在DRAM端接收时保持同步。
1. 提升信号完整性
- **减少信号畸变** ：通过精确控制DQS和CLK信号的边沿对齐，Write Leveling有助于减少信号在传输过程中的畸变和干扰，提升信号的整体质量。
- **增强系统稳定性** ：信号完整性的提升有助于增强系统的稳定性和可靠性，减少数据传输中的错误和丢包现象。
1. 支持高速数据传输
- **适应高速率** ：随着DDR技术的发展，数据传输速率不断提高。Write Leveling作为DDR技术的一部分，能够支持更高的数据传输速率，满足现代电子设备对性能的需求。
- **优化时序参数** ：通过调整DQS信号的延迟，Write Leveling能够优化时序参数，如tDQSS（DQS信号上升沿到CLK信号上升沿的时间差），确保系统在高速运行下仍能保持稳定的性能表现。
1. 简化系统设计和调试
- **内置训练机制** ：DDR内存通常内置Write Leveling训练机制，使得系统设计者能够更容易地调整和优化内存的时序参数，无需依赖复杂的外部硬件或软件工具。
- **自动化校准** ：Write Leveling能够自动校准DQS和CLK信号的边沿对齐，简化了系统调试过程，降低了开发成本和时间。

### Read Leveling

作用类似。

### VREF Training（仅DDR4和LPDDR4）

为了保证稳定且可靠的内存访问，写入和读取的眼图（eye diagram）应该尽可能宽。眼图的位置取决于LCDL（Load Command Delay Line，负载命令延迟线）以及VREF（参考电压）的值。写入和读取数据眼图训练用于通过改变LCDL的值（结合初始计算和编程的VREF设置）来找出最佳的眼图位置。

VREF训练用于确定一个VREF值的范围，在该范围内内存接口（写入和读取）是稳定的，并进一步确定最佳的写入和读取眼图位置。

支持的VREF训练类型包括：

• **DRAM VREF训练** ：此训练用于通过扫描内存内部的DRAM VrefDQ值来优化写入眼图。

• **Host VREF训练** ：此训练用于通过扫描PHY I/O的VREF设置来优化读取眼图。

## PHY做了什么？

对于PHY如何运作，以及功能，我这里我找到了一个资料：

- **Versal Adaptive SoC Programmable Network on Chip and Integrated Memory Controller\[3\]**

> 这个资料很完整的介绍了整个PHY到底做了什么？因为PHY的工作涉及到模拟，涉及到信号完整性。我翻译了PHY的部分，更多的原文可以参考上面的内容。

---

### PHY前言

PHY被视为与外部DDR4或LPDDR4/4X SDRAM设备的低级物理接口，以及所有校准逻辑，用于确保物理接口本身的可靠运行。PHY生成与存储设备接口所需的信号时序和序列。

PHY包含以下功能：

- 时钟/地址/控制生成逻辑
- 写入和读取数据路径
- 上电后初始化SDRAM的逻辑

此外，PHY还包含校准逻辑，用于对读写数据路径进行时序训练，以考虑系统的静态和动态延迟。

### PHY架构

Versal架构的PHY由专用模块和集成的校准逻辑组成。这些专用模块彼此相邻排列，并通过背靠背互连来最小化构建高性能物理层所需的时钟和数据路径路由。

内存控制器和校准逻辑通过慢频率时钟域与这个专用PHY进行通信，该时钟域可以是DDR4或LPDDR4/4X内存时钟的四分频或二分频，具体取决于所使用的内存类型。

### 内存初始化和校准序列

在系统复位解除后，PHY执行所需的内部校准步骤：

- 首先，运行PHY的内置自检（BISC）。BISC在PHY中用于计算内部偏差，以便在校准完成后用于电压和温度跟踪。
- BISC完成后，校准逻辑执行内存所需的上电初始化序列。
- 随后，对写入和读取数据路径进行多个阶段的时序校准。
- 校准完成后，PHY计算内部偏移量，以便在电压和温度跟踪中使用。
- PHY指示校准完成，控制器开始向内存发出命令。

重要提示：校准仅针对具有至少一个NMU的NoC实例中的MC完成。没有通过NoC连接到内存的MC不会进行校准。为了测试目的，用户可以创建一个块设计，其中CIPS驱动感兴趣的MC。

下图展示了 **内存初始化的总体流程以及校准的不同阶段** 。虽然图中显示了一个迭代循环，

![](https://pic2.zhimg.com/v2-a5ba9776e26099a393034d1de51d0327_1440w.jpg)

PHY总体初始化和校准序列

---

### LPDDR4/4X CS和CA训练

LPDDR4/4X SDRAM在启用高频操作的终止功能之前，提供了一种对命令总线进行训练的机制。对于高于1866 Mb/s的操作，此训练阶段使用命令总线训练模式（Command Bus Training mode）来使DRAM中的CS（片选）和CA（命令/地址）信号与CK（时钟）对齐。在此模式下，DRAM使用CS和CK来捕获CA引脚上的值，并将结果通过DQ\[13:8\]引脚反馈给控制器。

训练分为两个阶段： **CS训练和CA训练。**

首先进行CS训练，以将CS的跳变与CK的下降沿对齐。在CA引脚上驱动一个静态模式，同时改变CS到CK的时序。通过比较DQ引脚上接收到的模式与CA引脚上发送的模式，控制器可以确定噪声区域。完成此步骤后，调整CS延迟，使CK的上升沿在噪声区域中心外半个时钟周期处。将CS与CK对齐后，CA训练使用CA线上的切换模式来对齐和居中CA信号与CK。

### DQS门控

在校准的此阶段，会检测读取DQS前导码，并校准自适应SoC中的门控，以便在DQ上的第一个有效数据之前一个时钟周期开始捕获数据。在此阶段调整DQS门控的粗调和微调抽头（RL\_DLY\_COARSE和RL\_DLY\_FINE）。发出读取命令时，命令之间会有间隔，以持续搜索DQS前导码的位置。此阶段会启用DDR4/LPDDR4/4X前导码训练模式，以增加低前导码周期并辅助检测。在校准的此阶段，仅监视读取DQS信号，而不监视读取DQ信号。所有字节的DQS前导码检测是并行进行的。在校准的此阶段，首先调整粗调抽头以搜索低前导码位置和第一个DQS上升沿。

如果未找到前导码，则读取延迟增加一个单位。然后重置粗调抽头，并在搜索低前导码和第一个DQS上升沿时再次进行调整。正确检测到前导码位置后，调整细调抽头以微调采样时钟的位置并与DQS对齐。

### 写入均衡

写入均衡允许控制器相对于转发到DDR4/LPDDR4/4X SDRAM设备的CK独立调整每个写入DQS相位。这可以补偿DQS和CK之间的偏斜，并满足tDQSS规范。

在写入均衡过程中，DQS由自适应SoC内存接口驱动，DQ由DDR4/LPDDR4/4X SDRAM设备驱动以提供反馈。DQS会延迟，直到在DQ上检测到0到1的边沿转换。DQS延迟是通过使用ODELAY和粗调抽头延迟来实现的。

检测到边沿转换后，写入均衡算法将重点放在转换周围的噪声区域上，以最大化裕量。这一步仅使用ODELAY抽头来完成。

### 逐位读取DQ去斜和居中（简单）

注意：对于1,600 Mb/s或更低的数据速率，将跳过以下列出的前两个校准阶段。在低数据速率下，数据眼足够宽，之前的校准阶段已提供足够的DQS居中。

为了最大化数据眼并在读取DQ窗口中居中对内部读取采样时钟以实现稳健采样，逐位读取DQ去斜和居中将在多个阶段进行。为实现这一点，读取眼训练将执行以下顺序步骤：

1. 使用逐位读取DQ去斜消除偏斜和片上变化（OCV）效应，从而最大化DQ眼。
2. 扫描所有DQ位的DQS，并使用简单（多功能寄存器数据模式）和复杂数据模式找到数据眼的中心。DQS和DQS#的数据眼居中均已完成。
3. 校准后，在VT范围内连续维持DQS与DQ之间的相对延迟。

### 逐位读取去斜

逐位读取去斜是按位进行的，而读取DQS居中则是按字节进行的。在逐位去斜过程中，从DRAM中读取预定义的训练模式101010…，同时进行DQS调整（DQS上的PQTR和NQTR单个微调抽头）和DQ调整（IDELAY）。在此阶段结束时，DQ位将在内部与进入的DQS的左边缘对齐。

### 读取DQS居中（简单）

在读取DQS居中（简单）过程中，会连续读取切换的101010...多用途寄存器（MPR）模式，同时进行DQS调整（DQS上的PQTR和NQTR单个微调抽头）和DQ调整（IDELAY）。这是为了使用不依赖于向DRAM写入模式的简单模式来建立初始DQS中心点。

> 写入DQS到DQ去斜

注意：对于低于1,600 Mbps的数据速率，将跳过这些校准阶段。

写入DQS到DQ校准是必需的，以便将每个位的写入DQS在写入DQ窗口中居中对齐。在写入DQS居中和逐位去斜开始时，DQS与CK对齐，但尚未对写入窗口进行任何调整。写入窗口调整在以下两个连续阶段中进行：

1. 写入逐位去斜
2. 写入DQS居中
3. 写入DQS到DQ逐位去斜

在写入逐位去斜期间，会连续写入并读取切换的10101010模式，同时在写入DQ上进行90°时钟相位调整，并在DQS和DQ上进行单独的精细ODELAY调整。在逐位写入DQ去斜结束时，写入DQ位在传输到内存时会对齐。

> 写入DQS到DQ居中

在写入DQS居中期间，会连续写入并读取相同的切换10101010模式。还会对DQS和DQ进行ODELAY调整，但给定字节的所有DQ ODELAY调整都会同步进行，以保持之前去斜后的对齐。

### 写入DQS到DQ去斜

注意：对于低于1,600 Mbps的数据速率，将跳过这些校准阶段。

写入DQS到DQ校准是必需的，以便将每个位的写入DQS在写入DQ窗口中居中对齐。在写入DQS居中和逐位去斜开始时，DQS与CK对齐，但尚未对写入窗口进行任何调整。写入窗口调整在以下两个连续阶段中进行：

1. 写入逐位去斜
2. 写入DQS居中

> 写入DQS到DQ逐位去斜

在写入逐位去斜期间，会连续写入并读取切换的10101010模式，同时在写入DQ上进行90°时钟相位调整，并在DQS和DQ上进行单独的精细ODELAY调整。在逐位写入DQ去斜结束时，写入DQ位在传输到内存时会对齐。

> 写入DQS到DQ居中

在写入DQS居中期间，会连续写入并读取相同的切换10101010模式。同时也会对DQS和DQ进行ODELAY调整，但给定字节的所有DQ ODELAY调整都会同步进行，以保持之前去斜后的对齐。

### 写入DQS到DM/DBI去斜和居中（简单）

当为DDR4/LPDDR4选择写入DBI选项时，引脚本身会在校准结束时作为DM进行校准，并启用写入DBI。

在所有之前的校准阶段中，数据掩码信号在所需时间前后都保持低电平，以确保它们不会对校准产生影响。现在，读取和写入都已完成校准，可以可靠地调整数据掩码。如果接口中未使用DM信号，则跳过此校准阶段。

在DM校准期间，首先向地址0x000写入数据模式55555555\_55555555，然后向同一地址写入数据模式BBBBBBBB\_BBBBBBBB，但在DQS的上升沿期间断言DM。随后发出读取请求，预期的回读模式应全为0xB，除了DM被断言的数据位置。在这些被屏蔽的位置，预期值为5。随后，完成与写入逐位去斜和写入DQS居中期间相同的步骤序列，但针对的是DM位。

### 写入延迟校准

写入延迟校准是必需的，以便将DQS与正确的CK边沿对齐。在写入均衡期间，DQS与CK的最近上升沿对齐。然而，这可能不是捕获写命令的边沿。

根据接口类型（UDIMM、RDIMM、LRDIMM或组件），DQS可能比捕获写命令的CK边沿早一个CK周期、早两个CK周期或与该边沿对齐。

这是一种基于模式的校准，其中针对每个字节进行粗略调整，直到读取回预期的准时写入模式。过程如下：

1. 发出扩展写入操作，随后进行一次读取。
2. 将读取回的模式与预期模式进行比较。
3. 如有必要，添加粗略调整。
4. 重复上述步骤，直到读取回准时写入模式，表示DQS与正确的CK周期对齐，或者接收到不正确的模式导致写入延迟失败。

### 读取DBI逐位去斜和居中

如果为DDR4/LPDDR4选择了读取DBI选项，则通过将101010...模式写入DRAM，启用读取DBI功能，并从DRAM读取回该模式来校准DBI输入引脚。DRAM将数据作为11111111发送回（对于LPDDR4，则为00000000\_00000000），但DBI引脚本身具有101010...模式，该模式用于校准DBI输入引脚本身。

### 读取DQS居中（DBI）

如果为DDR4/LPDDR4/4X选择了读取DBI选项，则数据有效窗口中DQS的位置也必须使用DBI引脚本身的时序信息，因为DBI引脚可能是数据有效窗口的边界。

将0F0F0F0F模式写入DRAM，并启用读取DBI进行读取。DRAM将数据作为FFFFFFFF发送回，但DBI引脚具有时钟模式01010101，该模式用于测量DBI输入引脚本身的数据有效窗口。最终的DQS位置是根据DQ和DBI引脚的组合窗口确定的。

### 读取DQS居中（复杂）

注意：对于2,133 Mbps或更低的数据速率，将跳过此校准阶段。在这些数据速率下，数据眼足够宽，因此先前的校准阶段提供了足够的DQS居中。

在正常工作之前完成的DQS读取居中的最后阶段，是重复在MPR DQS读取居中期间执行的步骤，但使用更困难/复杂的模式。使用复杂模式的目的是在计算读取DQS中心位置时，对系统进行SI效应（如ISI和噪声）的压力测试。这确保了读取中心位置能够在真实系统中可靠地捕获带有裕量的数据。

### 写入DQS到DQ居中（复杂）

注意：此校准步骤仅在多排系统中的第一排启用。对于2,133 Mbps或更低的数据速率，将跳过此校准阶段。在这些数据速率下，数据眼足够宽，因此先前的校准阶段提供了足够的DQS居中。

与读取DQS居中（复杂）中所述的原因相同，在写入路径上使用复杂的数据模式来调整写入DQS到DQ的对齐。重复写入DQS到DQ居中的详细步骤，但使用复杂的数据模式。

### 启用VT跟踪

在DQS门控多排调整（如果需要）之后，会向XPHY发送一个信号，以重新校准内部延迟并开始电压和温度跟踪。

对于多排系统，当所有半字节（nibble）都准备好进行正常操作时，XPHY需要在开始正常数据传输之前向DRAM发送两个写入-读取突发。第一个使用F00FF00F数据模式，第二个使用0FF00FF0数据模式。数据本身不会被检查，并且预期会失败。

### DDR4 LRDIMM内存初始化和校准序列

除非另有说明，否则LRDIMM校准序列的大部分细节都与之前“内存初始化和校准序列”部分中描述的DDR4核心校准序列细节一致。

以下图表显示了内存初始化的总体流程以及LRDIMM校准序列的不同阶段。

![](https://pica.zhimg.com/v2-4b6601de0b969f1aa170d44c6a0a12e4_1440w.jpg)

为了满足数据缓冲区和DRAM之间的时序要求，增加了以下数据缓冲区校准阶段，并且这些阶段会针对LRDIMM卡/插槽的每一排重复进行。

- MREP训练
- MRD周期训练
- MRD中心训练
- DWL训练
- MWD周期训练
- MWD中心训练

主机侧校准阶段则用于测试主机与数据缓冲区之间的时序，这些阶段会针对每个LRDIMM卡/插槽执行一次。

首先执行数据缓冲区和DRAM之间的所有校准阶段，然后执行主机侧校准阶段。

在每个数据缓冲区校准阶段结束时，会启用按缓冲区寻址（PBA）模式，将校准后的延迟和延迟值编程到数据缓冲区寄存器中。

以下部分将描述数据缓冲区校准阶段。

> DRAM接口MDQ接收使能相位（MREP）训练

此训练将读取MDQS相位与数据缓冲区时钟对齐。在训练模式下，主机发送一系列读取命令，DRAM发送MDQS，数据缓冲区使用时钟对选通信号进行采样，并将结果反馈在DQ上。校准继续进行此训练，以找到使用数据缓冲区时钟采样的读取MDQS上的0到1转换点。

> DRAM到DB读取延迟（MRD）周期训练

此训练找到在数据缓冲区中保持设定的读取延迟值所需的正确周期。在训练模式下，主机将数据缓冲区MPR寄存器预编程为预期模式，并发出读取命令。数据缓冲区将读取数据与预期数据进行比较，并将结果反馈在DQ总线上。校准根据比较结果选择正确的周期。

> DRAM到DB读取延迟（MRD）中心训练

此训练将读取MDQS与数据缓冲区中读取MDQ窗口的中心对齐。在训练模式下，主机将数据缓冲区MPR寄存器预编程为预期模式，并发出命令。数据缓冲区将读取数据与预期数据进行比较，并将结果反馈在DQ总线上。校准找到读取MDQ有效窗口的左边缘和右边缘，并将读取MDQS居中对齐。

> DRAM接口写入电平调整（DWL）训练

此训练将写入MDQS相位与DRAM时钟对齐。在训练模式下，数据缓冲区驱动MDQS脉冲，DRAM使用MDQS对时钟进行采样，并将结果反馈在MDQ上。数据缓冲区将MDQ上的结果转发到DQ。校准继续进行此训练，以找到DRAM中使用写入MDQS采样的时钟上的0到1转换点。

> DB到DRAM写入延迟（MWD）周期训练

此训练找到在DRAM中保持设定的写入延迟值所需的正确周期。在训练模式下，主机将数据缓冲区MPR寄存器预编程为预期模式，发出写入命令以将数据加载到内存中，并发出读取命令以从内存中读取数据。数据缓冲区将读取数据与预期数据进行比较，并将结果反馈到DQ总线上。校准根据比较结果确定正确的周期。

> DB到DRAM写入延迟（MWD）中心训练

此训练将写入MDQS在DRAM的写入MDQ窗口中居中对齐。在训练模式下，主机将数据缓冲区MPR寄存器预编程为预期模式，发出写入命令以将数据加载到内存中，并发出读取命令以从内存中读取数据。数据缓冲区将读取数据与预期数据进行比较，并将结果反馈到DQ总线上。校准找到MDQ有效窗口的左边缘和右边缘，并将MDQS居中对齐。

---

ok！差不多就这些内容！下面是一个DDR的User Guide，里面内容还是蛮不错的。对于PHY，我确实还有许多概念不清楚。希望下次能和大家清楚的聊聊！

- **Speedster7t DDR User Guide(UG096)\[4\]**

> 周末愉快！有用的话记得点赞关注分享收藏哦！

### 参考资料

\[1\]

DDR-PHY-Interface-Specification-v3-0.pdf: *[files.chinaaet.com/file](https://link.zhihu.com/?target=http%3A//files.chinaaet.com/files/blog/2019/20170809/1000019445-6363788588719579817890087.pdf)*

\[2\]

DDRPHY-Interface-Specification-v2.1.pdf: *[files.chinaaet.com/file](https://link.zhihu.com/?target=http%3A//files.chinaaet.com/files/blog/2019/20170809/1000019445-6363788588725829797105240.pdf)*

\[3\]

Versal Adaptive SoC Programmable Network on Chip and Integrated Memory Controller: *[docs.amd.com/r/en-US/pg](https://link.zhihu.com/?target=https%3A//docs.amd.com/r/en-US/pg313-network-on-chip/PHY%3FtocId%3D4hypv~9gjhB7UHrGIYy48Q)*

\[4\]

Speedster7t DDR User Guide(UG096): *[achronix.com/sites/defa](https://link.zhihu.com/?target=https%3A//www.achronix.com/sites/default/files/docs/Speedster7t_DDR_User_Guide_UG096.pdf)*

还没有人送礼物，鼓励一下作者吧

编辑于 2025-03-18 16:48・四川[进销存ERP、进销存库存管理系统开发案例](https://zhuanlan.zhihu.com/p/658475128)

[

这是给成都中铁五局开发的材料管理系统，客户本身现在有有一套管理系统在用，但是无法满足个性化的一些使用需求，找到我们是想解决个性化使用需求，经过技术验证测试，原有的属于加密...

](https://zhuanlan.zhihu.com/p/658475128)