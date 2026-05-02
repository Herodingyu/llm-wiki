---
title: "DDR 学习时间 (Part Z - 1)：芯片设计中的 DDR 模型杂谈"
source: "https://zhuanlan.zhihu.com/p/397260462"
author:
  - "[[LogicJitterGibbsICer && 业余FPGAer]]"
published:
created: 2026-05-02
description: "本期是一篇杂谈，讲讲 SoC DDRSS(DDR subsystem) 设计中涉及的几类模型（Model）。 杂谈文风随意，权当作为笔者一些想法的记录。不能保证文中的内容完全准确和全面，欢迎指正和补充。 本系列连载于 OpenIC SIG，除…"
tags:
  - "clippings"
---
[收录于 · OpenIC 特别兴趣小组](https://www.zhihu.com/column/c_1029044037684183040)

79 人赞同了该文章

本期是一篇杂谈，讲讲 [SoC DDRSS](https://zhida.zhihu.com/search?content_id=176410496&content_type=Article&match_order=1&q=SoC+DDRSS&zhida_source=entity) (DDR subsystem) 设计中涉及的几类模型（Model）。

杂谈文风随意，权当作为笔者一些想法的记录。不能保证文中的内容完全准确和全面，欢迎指正和补充。

> 本系列连载于 OpenIC SIG，除了 DDR 学习时间专栏外，OICG 目前正在陆续上线 [HDLBits](https://zhida.zhihu.com/search?content_id=176410496&content_type=Article&match_order=1&q=HDLBits&zhida_source=entity) 中文导学的优化版本，欢迎关注/支持/加入我们

[DDR 学习时间 - OpenIC SIG 开源数字IC技术分享](https://link.zhihu.com/?target=https%3A//digitalasic.design/category/ddr/ddr-%E5%AD%A6%E4%B9%A0%E6%97%B6%E9%97%B4/)

### DDR 复杂 or 不复杂？

DDR 是复杂还是不复杂？这是一个问题。答案是 yes and no.

借用一次 DDR 培训的说法， **DDR 本身物理结构** 并不复杂（not complex）。如果说 x86 CPU 的结构复杂度好比是摩天大楼，那么 DDR 有点像是建筑工人住的板房——DDR 由大量、简单的电路单元的堆叠而成。

但是 **围绕 DDR 搭建的系统** 却很复杂（complicated），比如电路设计上涉及高速的数字与模拟信号，硬件 PCB 设计上需要考虑电源与信号完整性，在软件层面涉及高吞吐与低延迟性能优化，你甚至还需要考虑 DDR 高速信号对芯片的无线系统产生的噪声影响！

为了解决上述几个复杂度问题，在 SoC 设计开发阶段引入了 DRAM 模型（Model），在仿真中提供这些复杂度，给设计作为参照，包括：

- **[DRAM 行为级模型](https://zhida.zhihu.com/search?content_id=176410496&content_type=Article&match_order=1&q=DRAM+%E8%A1%8C%E4%B8%BA%E7%BA%A7%E6%A8%A1%E5%9E%8B&zhida_source=entity)** ， 用于性能评估和仿真
- 由系统架构er / 性能模型仿真er 使用
- **[DRAM 时序模型](https://zhida.zhihu.com/search?content_id=176410496&content_type=Article&match_order=1&q=DRAM+%E6%97%B6%E5%BA%8F%E6%A8%A1%E5%9E%8B&zhida_source=entity)** ，用于时钟周期级的时序检查
- 由数字电路设计er / 验证 er 使用
- **[DRAM 信号完整性模型](https://zhida.zhihu.com/search?content_id=176410496&content_type=Article&match_order=1&q=DRAM+%E4%BF%A1%E5%8F%B7%E5%AE%8C%E6%95%B4%E6%80%A7%E6%A8%A1%E5%9E%8B&zhida_source=entity)** ，检查 SoC 和 DRAM 颗粒之间收发信号的质量
- 由 模拟设计er 和 PCB 设计er 使用
- 其他 DRAM 模型，比如热设计模型，功耗模型等等

没有这些模型，ASIC 的设计阶段可就真变成摸着石头过河了。

这些模型的来源一般是很可靠的厂商，比如 DRAM 原厂或者 DDR IP 厂商等等。

有些模型需要收费，有些是 DDR IP 的赠品，还有些则可以免费下载。免费使用的模型，想要一窥其中实现就不太可能了，往往是加密的。

比如镁光的 DDR4 仿真模型， [下载地址](https://link.zhihu.com/?target=https%3A//media-www.micron.com/-/media/client/global/documents/products/sim-model/dram/ddr4/ddr4_verilog_models.zip%3Frev%3Dcaf27a5eaf6b4a9f81eb894a874a4492)

### 性能模型

在一个 SoC 的架构设计阶段，架构er 是不是有很多问号。比如我是该用四核 A53 还是双核 A73？NORM 频率又该订到多少？

**问题1/2：** 该怎样选择配置，既能满足用户的性能需求，又不花太多钱？

架构er 说这也简单，我们搭一个行为级的仿真平台，找一组典型的用户测试用例来仿真一下。那么仿真平台就会用到 DRAM 的行为级性能模型，作为 CPU 模型的存储从机。

因为笔者的工作没涉及到这部分，以下说一些个人高抽象层次的理解：

性能仿真阶段，我们关心的是 DRAM **和读写相关** 的行为状态，其他的，比如 DRAM 初始化，低功耗等行为就不会关心。

那么归根结底，DRAM 此时只有 2 种状态：

- **忙着** ：正在读写
- DRAM：想下班.jpg
- **闲着** ：随时可以读写
- DRAM：不想上班.jpg

闲着么就是闲着，但忙着其实也分几种：

- **在忙着写**
- **在忙着读**
- 不在写，也不在读，但因为一些限制，此时 **既不能读，也不能写** ，比如处在 Refresh/Precharge 状态
- DRAM: 摸鱼ing

除了当前状态，我们还关心 DRAM 多长时间之后能够结束当前的状态，比如完成一次写传输。

所以需要将 DRAM 的一部分时序纳入模型的考虑范围，以写为例：

- ACT2WR, 代表 ACT 命令之后多久可以发 WR 命令
- tCWL，代表一次写命令需要多长时间完成
- tWR2WR，代表两次写命令之间的最小间隔
- 等等

**问题2/2：** 某种配置下，如何得到尽可能高的性能？

为了正确评估性能，我们希望不同配置下都能够得到最高的吞吐性能。DRAM 的吞吐性能有一些提高的方法，比如：

- 选取工作频率更高的 DRAM 颗粒
- DDR 控制器/仲裁器支持 outstanding，交织等特性提高 DRAM 利用率
- 通过仲裁器对地址进行调度，使 DDR4 连续访问中，地址尽可能在不同 Bank Group 之间切换
- 还是通过仲裁器，希望 DRAM 的访问地址尽可能连续而非随机，尽量避免读写混合。

这就需要 modeling team 基于性能模型做配置做一些调试优化，比如调整 DDR 仲裁器，比如 Memory NoC 的地址映射方式，调整仲裁器的调度参数等等。

### 时序模型

如果说性能模型只关心 DRAM 有没有闲着，那时序模型还关心 DRAM 有没有准确地采样命令和数据，更贴心有没有。

性能模型在建模 DRAM 时，以 DRAM **命令/数据** （Command/Data）作为基本单位。而时序模型的建模则关注 DRAM 的每一根地址/命令、数据信号（ CA/DQ ），这些信号构成了不同的 DRAM **命令/数据** 。

举个例子，在下图中，性能模型关心的是 WR 命令下到后，经过 tWL 个时钟周期后，送出第一个写数据。在 Burst8 后完成写传输。

![](https://pic1.zhimg.com/v2-10edd87828fa0f73ec195d40fb8a6cf8_1440w.jpg)

而时序模型会首先根据真值表，采样 CS\_n,RAS\_n,CAS\_n 等信号的电平，得知当前控制器发出的是 WR 命令。

![](https://pic3.zhimg.com/v2-e496cab1edf00fb610af4176d1d583b2_1440w.jpg)

在 tWL 周期后对写数据的时序进行检查，包括 DQS 和 CK 的关系，DQS 和 DQ 的关系等等。

![](https://pic2.zhimg.com/v2-a9e47d539019379fd2bf2d682b12f2ff_1440w.jpg)

在发现与协议不一致的情况后，会生成错误日志，一般还会贴心地告诉你去看 JEDEC 协议的第几章第几条。

另外，性能模型所不关心的 DRAM 复位、初始化、进出自刷新模式、MRx 读写等过程中的时序，也会由时序模型进行检查。

时序模型一般还能在时序检查之外，提供其他功能，包括错误注入，线延迟模拟等等，可用于在仿真阶段验证我们的 DRAM BIST/DIAG 逻辑以及 Training 逻辑。

一般市面上主流的仿真模型包括 Cadance 的 [Denali Model](https://link.zhihu.com/?target=https%3A//ip.cadence.com/ipportfolio/verification-ip/memory-models/volatile-memory/memory-model-for-ddr4) 等等。

为啥叫 Denali，这样一个充满中东气息的名字，这笔者也不知道~

### 信号完整性模型

我们知道 DDR 是一种高速并行总线，主流的 DDR4-3200 的时钟频率达到 1.6GHz 之高，保证收发信号的完整性日益重要并且困难。

DRAM 信号完整性主要受到几方面的影响，包括我们 SoC IO 、PCB 传输线、DRAM 颗粒 IO 以及他们之间的互相作用。

真实的 DRAM 的信号波形往往验证着一句哲理：

理想很丰满，DQS 和 DQ 信号的边沿规规矩矩。

![](https://picx.zhimg.com/v2-518784ca2938ba8e909481fb353f948b_1440w.jpg)

现实很骨感，DQS 和 DQ 的边沿可能是这个鬼样子的。

![](https://pic2.zhimg.com/v2-3b8a547ae8c1a975cd84f87db14e0491_1440w.jpg)

所以模拟er 和 PCBer 需要借助信号完整性的模型来指导具体的设计，这部分因为笔者不太熟悉就暂时按下不表了。

### 其他模型

此外，还有一些和 DRAM 相关的模型，比如 PCBer 会使用热仿真模型对整个 PCB 方案进行热仿真以确定散热方案。

DRAM 是板级的主要热源之一，虽然热量和 SoC 本身的热量还是不能比。

此外，也需要通过仿真来检查 DRAM 颗粒是否工作在可接受的温度范围内。超出协议规定的工作温度，可能导致 DRAM 内部数据丢失。

### 结语

本期我们讨论了几种 DRAM 模型，包括：

- 行为级性能模型
- 时序模型
- 信号完整性模型
- 其他模型，比如热仿真模型等等

ICer 通过这些模型能够在 SoC 设计仿真和检查与 DRAM 相关的设计，保证芯片回来之后，不至于大悲剧。

毕竟一颗 SoC 的 DDR up 不了，这颗 SoC 基本也完了。变身大号 Testchip，毁灭吧，赶紧的。

---

由于相关政策限制，无法在本站开启评论功能，交流欢迎

移步知乎的相关文章，或者发送邮件，谢谢。

### 关于作者

ljgibbs, 网名 LogicJitterGibbs，主业是某 Fabless 的 SoC Designer，业余时间是 OpenIC SIG 专栏作者与开源开发者。

感兴趣的领域包括：AXI 等片上总线、DDR、嵌入式系统与计算机架构、FPGA 、计算机网络通信、半导体行业与市场、翻译&写作、电影&历史。

### 关于《DDR 学习时间》专栏

在 DDR 学习时间专栏中，目前有 3 个 Part：

- Part-A DRAM 课程、论文以及其他在线资源的学习
- Part-B 基于 DDR4 Spec 的 DDR 特性学习
- Part-Z DRAM 相关杂谈

计划开设第 4 个 Part

- Part-S DDR 仿真与实例

### 关于连载《DDR 学习时间》专栏的 OpenIC SIG

OpenIC SIG（简称 OICG），开源数字 IC 特别兴趣小组，致力于分享开源项目与知识。

欢迎关注/支持/加入我们！ [contact\_us@digitalasic.design](mailto:contact_us@digitalasic.design)

[DDR 学习时间 - OpenIC SIG 开源数字IC技术分享](https://link.zhihu.com/?target=https%3A//digitalasic.design/category/ddr/ddr-%E5%AD%A6%E4%B9%A0%E6%97%B6%E9%97%B4/)

发布于 2021-08-07 10:53[如何学好abaqus？](https://www.zhihu.com/question/524341710/answer/3557606944)

[

导读：本文作者江丙云，分享了他从Abaqus新手小白到大神的学习经验，希望对你有所帮助。仿真高研院致力于帮助零基础小白掌握企业级仿真能力，推出「abaqus结构仿真双证班」，让你不...

](https://www.zhihu.com/question/524341710/answer/3557606944)