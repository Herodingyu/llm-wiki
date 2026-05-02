---
title: "DDR 学习时间 (Part B"
source: "https://zhuanlan.zhihu.com/p/798966553"
author:
  - "[[LogicJitterGibbsICer && 业余FPGAer]]"
published:
created: 2026-05-02
description: "本期我们将讨论 DDR4 的 Gear-down mode (直译：降档) 特性，他是一种提高 DDR 系统兼容性、稳定性的特性 基于 JESD79-4B / 4.18 节 本系列连载于 OpenIC SIG，除了 DDR 学习时间专栏外，OICG 目前正在陆续上线 HD…"
tags:
  - "clippings"
---
[收录于 · OpenIC 特别兴趣小组](https://www.zhihu.com/column/c_1029044037684183040)

没有提供感情机器 等 21 人赞同了该文章

目录

本期我们将讨论 DDR4 的 Gear-down mode (直译：降档) 特性，他是一种提高 DDR 系统兼容性、稳定性的特性

*基于 [JESD79-4B](https://zhida.zhihu.com/search?content_id=248838040&content_type=Article&match_order=1&q=JESD79-4B&zhida_source=entity) / 4.18 节*

> 本系列连载于 OpenIC SIG，除了 DDR 学习时间专栏外，OICG 目前正在陆续上线 [HDLBits](https://zhida.zhihu.com/search?content_id=248838040&content_type=Article&match_order=1&q=HDLBits&zhida_source=entity) 中文导学的优化版本，欢迎关注/支持/加入我们

[DDR 学习时间 - OpenIC SIG 开源数字IC技术分享](https://link.zhihu.com/?target=https%3A//digitalasic.design/category/ddr/ddr-%E5%AD%A6%E4%B9%A0%E6%97%B6%E9%97%B4/)

## 导言

DDR4 的 [Gear-down 模式](https://zhida.zhihu.com/search?content_id=248838040&content_type=Article&match_order=1&q=Gear-down+%E6%A8%A1%E5%BC%8F&zhida_source=entity) 是一种通过降低 [DRAM 控制命令](https://zhida.zhihu.com/search?content_id=248838040&content_type=Article&match_order=1&q=DRAM+%E6%8E%A7%E5%88%B6%E5%91%BD%E4%BB%A4&zhida_source=entity) （CA，Control & Address）总线效率，提高控制命令时序裕度，从而提高系统兼容性、稳定性的特性，一般应用在家用 PC 等场景中。

在网络上搜索 Gear-down 模式，一般只有硬件发烧友，内存超频爱好者在讨论打开或者关闭 BIOS 中的 Gear-down 模式，说明首先这不是普通用户操心的事儿（笑）。

从笔者一名 SoC DDR 集成工程师视角出发，Gear-down 模式的意义是可以损失一些可有可无的性能（如果应用场景不存在性能瓶颈的话），提高系统对于Package 出 Pin， PCB 布线、DRAM 器件的兼容性。直白地说，能够降低系统成本——省他一笔！然后再用低成本卷友商！

### 命令控制总线速率

我们知道 DDR4 命令控制总线在 DRAM 时钟（CK）的上升沿发送或者接收命令，这样相对于在上升沿和下降沿都发送或者接收的数据总线（DQ），命令控制总线速率是数据总线的一半，也就是 1/2 DDR4 数据速率。比如 DDR4-3200 中，命令控制总线的工作频率就是 3200/2 = 1600 MHz。

想让 DRAM 颗粒正确接收控制器发出的命令与地址，需要在命令地址信号到达 DRAM 颗粒时满足 DRAM 的建立与保持时序（Setup/Hold timing）。也就是命令与地址信号与时钟的相对相位关系，一般来说随着 DDR 频率的提升，建立与保持时序会变更加严格。比如建立时序， DDR4-3200 的 tIS 为 130ps，而DDR4-2933 的 tIS 为 138ps。

![](https://picx.zhimg.com/v2-4a8602aa25a5e2ffdf7bb72a8845f1fb_1440w.jpg)

一般来说，DRAM 的建立与保持时序是否满足取决于芯片内部、封装、PCB、内存条上对于时钟信号与命令控制信号之间的时延差异（Skew）控制。总的来说，一般专业团队都可以完成满足 DRAM 时序要求的设计，但如果想让工程师名做出更省成本，兼容性更好的设计，他们会对老板们说 “第一，这得加钱，第二，得放松时序要求“ 。这时就出现了 DDR4 Gear-down 模式的用武之地。

## Gear-down 模式原理

正常情况下， [CA 总线](https://zhida.zhihu.com/search?content_id=248838040&content_type=Article&match_order=1&q=CA+%E6%80%BB%E7%BA%BF&zhida_source=entity) 两端的 DRAM 和控制器都工作于 1/2 DDR4 数据速率，而 Gear-down 模式下 DRAM 内部的 CA 总线采样时钟频率减半为 1/4 DDR4 数据速率，但是 DRAM 总线上的 [CK 时钟频率](https://zhida.zhihu.com/search?content_id=248838040&content_type=Article&match_order=1&q=CK+%E6%97%B6%E9%92%9F%E9%A2%91%E7%8E%87&zhida_source=entity) 不变。Gear-down 模式下，控制器可以将 CS\_n、CKE 以及 ODT pin 的速率同样下降到 1/4 数据速率，随着片选信号 CS\_n 有效区间扩大到持续两个周期，其他 ADDR 等地址与控制信号持续时间也同样可以扩大到两个周期，建立和保持时序分别扩大到 tGEAR\_setup 和 tGEAR\_hold，放松了原本的建立与保持时序。

![](https://pica.zhimg.com/v2-156cd2c1e929755ed70217683f4c1fa2_1440w.jpg)

对于何时以及如何进入或者退出 Gear-down 模式，DDR4 协议分别有一些规定。

### 进入 Gear-down 模式

DRAM 只能在初始化或者退出 self-refresh 时进入 Gear-down 模式，以初始化时进入 Gear-down 模式为例，具体的步骤如下：

1. 在上电后，DRAM 默认工作在 1/2 data rate 下，也称 1N 模式
2. 置高 Reset 信号
3. 置高 CKE 信号使能 DRAM，等待 tXPR\_GEAR
4. 发送 MRS 命令设置 MR3 比特 A3 为 1，使能 DRAM Gear-down 模式，注意此时的 MRS 命令已经工作在慢速率下，即 1/4 data rate。而此时的 CS\_n 信号的有效长度仍然为 1N 模式，即一个 CK 周期。
5. 在低速的 MRS 命令之后，发送多个长度为 1N 周期的 CS\_n 同步脉冲信号，用于和 DRAM 建立同步。MRS 命令之后发送同步脉冲信号的时间约束为 tSYNC\_GEAR，规定这是一段长度为偶数个 CK 周期的时序。
6. 继续初始化程序，等待初始化用到的 tDLLK, tZQinit 时序结束，再等待 1N 同步脉冲结束之后 tCMD\_Gear 时序结束，DRAM 进入 Gear-down 模式（2N 模式），后续的 CS\_n 等信号有效长度变成 2 个时钟周期。
![](https://pica.zhimg.com/v2-fd65e28603167382c94d34157ae077fe_1440w.jpg)

在进入 Gear-down 模式后，因为命令持续时间和命令间的间隔都变成了 2 个 CK 周期，因此部分以 CK 周期为单位的时序参数数值需要都为偶数，包括：

- CAS Latency （CL） 时序参数为偶数
- Write Recovery 和 Read to Precharge 时序参数为偶数
- Additive Latency （AL）时序参数为 0 或者 CL - 2
- CAS Write Latency （WL）时序参数为偶数
- CS to Command/Address Latency Mode： 偶数个时钟周期
- CA Parity Latency Mode：偶数个时钟周期

下图是 Gear-down 模式打开或者关闭时的时序图比较，可以看到 Gear-down 模式打开后，命令之间的间隔将增加 1 个 cycle，这是因为 AL 需要等于 CL - 2 ，而不是原本的 CL - 1。但是整体的读数据延迟实际上没有区别。但是如果这个例子中 AL = 0 而 CL 为奇数比如 17 时，这时 RL = AL + CL 将被增加到 18，导致实际读数据出现延迟。

![](https://pica.zhimg.com/v2-b8dd23e06f5549cc253653180fc0a2a6_1440w.jpg)

### 退出 Gear-down 模式

退出 Gear-down 模式的正确做法是使 DRAM 进入 [Self-refresh 模式](https://zhida.zhihu.com/search?content_id=248838040&content_type=Article&match_order=1&q=Self-refresh+%E6%A8%A1%E5%BC%8F&zhida_source=entity) ，进入 Self-refresh 模式后无论 DRAM 之前处于哪种模式，DRAM 都将重返 1N 模式。但换句话说，如果 DRAM 退出 Self-refresh 模式后还想保持 2N 模式，需要重新走一遍流程，重新配置为 2N 模式。

用户或许有不一样的想法，比如想通过直接改写 MR3 比特 A3 为 0，退出 Gear-down 模式。这种情况下，DDR4 协议警告道：如果你通过进入自刷新以外的一切方法退出 Gear-down 模式，标准 DDR4 器件将不保证正常工作，也不保证数据不丢失。

唯一 JEDEC 认证退出 Gear-down 模式的方法：进入自刷新模式。

## Gear-down 模式对于系统性能的影响

首先 Gear-down 模式下需要时序参数为偶数，这使设计者不得不向上取整某些时序参数，导致系统时延（Latency）性能有所下降。其次，Gear-down 模式下单个命令持续两个周期，降低了 CA 总线的效率，在某些场景下会导致后续的命令不得不等待前序命令，从而导致了更大的系统时延。

Gear-down 模式对系统带宽（BW，Bandwidth）的影响不大，因为一般 DRAM 系统带宽的瓶颈在数据总线而不是 CA 总线，毕竟命令数量远少于数据 Burst 数量，影响在于部分命令等待延后执行可能导致其数据传输也延后，数据总线会出现更多空闲，即气泡（Bubble）。

不过，总而言之，Gear-down 模式对于系统的影响大小还是取决于具体的数据流量类型，以及应用对于性能的需求。

## 一些相关概念的讨论

有一些和 Gear-down 模式接近的概念，包括 1T/2T mode，Gear1 和 Gear2 等，笔者结合一些看到的资料和自己的认识聊一下。由于相关资料和笔者认识有限，说得可能不准确，欢迎评论区指正。

### 1T/2T

首先 [1T/2T 模式](https://zhida.zhihu.com/search?content_id=248838040&content_type=Article&match_order=1&q=1T%2F2T+%E6%A8%A1%E5%BC%8F&zhida_source=entity) 和 Gear-down 是并存的两种配置，但两者之间存在关联。所以在一些 BIOS 中，你可以分别调节 1T/2T 模式和 Gear-down 模式，但打开 Gear-down 模式后，没有办法设置 1T/2T 模式。

2T 模式和 Gear-down 模式的相同点在于命令长度延展到两个 CK 周期，所以也会有建立保持时序放松的优势，同样也有随之导致的时延增加等劣势。所以，理论上你不可能同时使用 1T 和 Gear-down 模式

2T 模式和 Gear-down 模式的区别在于，Gear-down 模式使能时，所有地址和控制信号的有效周期都是 2 个 CK ，包括每个 rank 上独立的 CS\_n、CKE 以及 ODT 信号。在 2T 模式下，受限于多 Rank 间的时序要求，这三个信号只能持续一个 CK 周期。所以，理论上当你打开 Gear-down 模式时，此时并不是严格的 2T 模式。

有网友总结到，Gear-down 模式好比是个和 1T/2T 并排的 2.5T 模式，有更好的时序兼容性，但在多 Rank 系统中会受到更大的性能惩罚。

### Gear1/Gear2

Intel 和 AMD CPU 都有 Gear1/Gear2 设置，关于此两者的定义，Intel 表达为两者区分的是控制器和存储的速率比。笔者个人观点：这里具体的说应该是控制器和存储 **CA 总线** 的速率比（因为显然 DQ 总线上双方的速率是相等的），这样理解的话，Gear 1 和 Gear 2 就分别对应 Gear-down 模式关闭和打开。

> Gear 1 means processor memory controller and memory speed are equal.  
> Gear 2 means pocessor memory controller operates at half the memory speed (such as CPU memory controller is at 1600MHz while memory speed is at 3200MHz when operating as Gear 2).  
> For DDR4-2933 (or lower speed):  
> All the [11th Gen Intel Core Processors](https://link.zhihu.com/?target=http%3A//ark.intel.com/content/www/us/en/ark/products/codename/192985/rocket-lake.html%23%40Desktop) operate in Gear 1, no Gear 2.  
> For DDR4-3200:  
> i9-11900K and i9-11900KF operate in Gear 1.  
> The rest of the [11th Gen Intel Core Processors](https://link.zhihu.com/?target=http%3A//ark.intel.com/content/www/us/en/ark/products/codename/192985/rocket-lake.html%23%40Desktop) can operate in Gear 2.

根据网友的 AIDA64 跑分实测数据，DDR5 3600MHz, Gear 2 模式下会导致约 20% 的延迟和 10% 的带宽损失

> Gear 1 对比 Gear 2 的测试结果，有两个明显的变化：  
> **1、** **内存延迟Latency数值由85ns大幅度降低到68.8ns**  
> **2、** **内存Read读取性能由37790MB/S提升到41528MB/S。**

如果从稳定性的角度来理解，一些网友在将 BIOS 从 Gear 2 调至 Gear 1 之后，出现了系统不稳定的现象，所以 Gear 2 虽然性能会差，但稳定性和兼容性也会变好，尤其是在内存超频时。

## 结语

本期我们讨论了：

- Gear-down 模式原理
- DDR4 进入和退出 Gear-down 模式
- Gear-down 模式对系统性能的影响
- Gear-down 模式相关概念讨论

说句题外话，浏览了不少超频玩家的帖子，感觉虽然玩家们对内存和内存控制器的理解不是那么精确（有时候会是错误的），但大体上玩家们关于 1T/2T 和 Gear-down mode 对性能/稳定性影响的理解是对的。这就是实践出真知吧！

## 参考文献

- JESD79-4B
- [What Is the Difference Between Gear 1 vs. Gear 2 DDR4 Memory Speeds? (intel.com)](https://link.zhihu.com/?target=https%3A//www.intel.com/content/www/us/en/support/articles/000058859/processors/intel-core-processors.html%23%3A~%3Atext%3DExplains%2520Gear%25201%2520vs%2520Gear%25202%2520DDR4%2520Memory%2520Speeds%2520Support)
- [内存Gear1和Gear2有多大差距？ - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/520714667#:~:text=%E5%8D%8E%E7%A1%95B660%E4%B8%BB%E6%9D%BF%E5%86%85%E5%AD%98)

---

由于相关政策限制，无法在本站开启评论功能，交流欢迎移步知乎的相关文章，或者发送邮件，谢谢。

## 关于作者

ljgibbs, 主业是某 Fabless 的 SoC Designer，业余时间是 OpenIC SIG 专栏作者与开源开发者。

感兴趣的领域包括：AXI 等片上总线、DDR、嵌入式系统与计算机架构、FPGA 、计算机网络通信、半导体行业与市场、翻译&写作、电影&历史。

### 关于《DDR 学习时间》专栏

在 DDR 学习时间专栏中，目前有几个 Part：

- Part-A DRAM 课程、论文以及其他在线资源的学习
- Part-B 基于 DDR4 Spec 的 DDR 特性学习
- Part-C 基于 DFI Spec 的 DDR Controller/PHY 接口行为学习与实现
- Part-D DRAM 系统的调试、验证与测试
- Part-S DDR 仿真与实例
- Part-Z DRAM 相关杂谈

### 关于连载《DDR 学习时间》专栏的 OpenIC SIG

OpenIC SIG（简称 OICG），开源数字 IC 特别兴趣小组，致力于分享开源项目与知识。

欢迎关注/支持/加入我们！ [contact\_us@digitalasic.design](mailto:contact_us@digitalasic.design)

[DDR 学习时间 - OpenIC SIG 开源数字IC技术分享](https://link.zhihu.com/?target=https%3A//digitalasic.design/category/ddr/ddr-%E5%AD%A6%E4%B9%A0%E6%97%B6%E9%97%B4/)

![](https://pic2.zhimg.com/v2-dc5d9c9154e360050d081b28cff57b47_1440w.jpg)

发布于 2024-10-02 16:05・上海[求有无靠谱的FPGA和IC设计培训？](https://www.zhihu.com/question/386238700/answer/1592723455)

[

靠谱的IC设计培训机构，现在国内的IC培训机构就这么几家，如果要报班培训，就要自己挑选去哪家好，因为培训班价格不菲，你也可以找找你身边的人给你介绍或者带你学习。这里一哥整理了...

](https://www.zhihu.com/question/386238700/answer/1592723455)