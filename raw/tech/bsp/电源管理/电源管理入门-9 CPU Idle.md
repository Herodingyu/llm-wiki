---
title: "电源管理入门-9 CPU Idle"
source: "https://zhuanlan.zhihu.com/p/2022622958867235347"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "关于Linux的很多知识其实网上的资料非常的多，但是也有些问题： 有时候是缺乏系统的讲解不像书里一章一章的， 有时候知识性太强，往往基础概念或者用法介绍缺失，就像：“我们从哪里来，我们是谁，我们要到哪里去…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

5 人赞同了该文章

![](https://pica.zhimg.com/v2-5c5bcf207834780719e02fba67adc27c_1440w.jpg)

关于Linux的很多知识其实网上的资料非常的多，但是也有些问题：

- 有时候是缺乏系统的讲解不像书里一章一章的，
- 有时候知识性太强，往往基础概念或者用法介绍缺失，就像：“我们从哪里来，我们是谁，我们要到哪里去”，只讲中间的我们是谁，并且讲的很详细，我们从哪里来到哪里去压根没提到，这也是入门的一个障碍，往往大多数人不需要知道我们是谁，你先告诉我这东西有什么用，为啥搞出来个这个东西，对我有用了我再学习啊。

## 1\. CPU Idle有什么用？

![](https://pica.zhimg.com/v2-3e8d06108bfc5526057da58567cf00fa_1440w.jpg)

答案就是“省电”，当多核CPU没有任务执行的时候，这时候需要将除主Core之外的其他Core进行低功耗处理，这件事就是CPU Idle机制做的。

> idle状态: 在Linux kernel中，当cpu中没有任务在执行，也没有任何中断、异常信号过来的时候，我们称为处于idle状态，针对这种状态Linux设计了一套 [cpuidle framework](https://zhida.zhihu.com/search?content_id=272339892&content_type=Article&match_order=1&q=cpuidle+framework&zhida_source=entity) 框架，专门用于cpuidle的管理。

Linux系统初始化时会为每个cpu创建一个idle线程，当没有其他进程需要运行的时候，便运行idle线程。

对于不同的功耗及恢复时间的要求，可以根据芯片硬件支持的情况定义多种idle状态，这些状态按功耗从低到高（对应着恢复时间从少到多）排列，利用linux提供的cpuidle框架，用户选用不同的idle策略。这么做的目的就是尽可能在不影响性能的前提下，减少功耗。

在ARM64架构中，至少会提供一个 [wfi](https://zhida.zhihu.com/search?content_id=272339892&content_type=Article&match_order=1&q=wfi&zhida_source=entity) 的idle状态，有些芯片可能还会提供core下电的idle状态。当CPU idle时，根据预测的idle时间、功耗受益大小、恢复的时间长短，选用一个idle状态，比如进入wfi，关掉CPU的arch timer以便降低功耗，当有中断触发时，CPU又会恢复回来。

## 2\. CPU Idle整体框架

![](https://pic1.zhimg.com/v2-2185b67f87c6af20f4f22d0c58b4da36_1440w.jpg)

首先是CPUIdle子系统通过sysfs向userspace提供的节点：

- 一类是针对整个系统的/sys/devices/system/cpu/cpuidle，通过其中的current\_driver、current\_governor、available\_governors等节点可以获取或设置CPUIdle的驱动信息以及governor。
- 一类是针对每个CPU的/sys/devices/system/cpu/cpux/cpuidle，通过子节点暴露各个在线的CPU中每个不同Idle级别的name、desc、power、latency等信息。

> 什么时候进入idle？  
> 关闭一些核可以节省功耗，但关闭之后对时延(性能)必会造成一定的影响，如果在关闭之后很短的时间内就被唤醒，那么就会造成功耗/性能双方都不讨好，在进入退出idle的过程中也是会有功耗的损失的，如果在idle状态下面节省的功耗还无法弥补进入退出该idle的功耗，那么反而会得不偿失。  
> \--解决方法就是：策略。是由cpuidle framework会根据不同的场景来进行仲裁选择使用何种的idle状态。

![](https://pic4.zhimg.com/v2-440b6b251c90b807eebeb8b8f1d12063_1440w.jpg)

在kernel中cpuidle framework主体包含三个模块，分别为cpuidle core、cpuidle governors和 [cpuidle driver](https://zhida.zhihu.com/search?content_id=272339892&content_type=Article&match_order=1&q=cpuidle+driver&zhida_source=entity) s，

- cpu idle core：负责整体框架，同时负责和sched模块对接，当调度器发现没有任务在执行时候，就切换到idle进程，通知到cpuidle framework的cpuidle core模块要做接下来的idle操作。向cpuidle driver/governors模块提供统一的driver和governors注册和管理接口，向用户空间程序提供governor选择的接口。
- cpuidle driver：负责具体idle机制的实现（不同等级下面idle的指标也是在这个模块进行填充），不同的平台会有不同的drivers实现。
- cpudile governors：在这个模块进行cpuidle的选择，选择的算法主要是基于切换的功耗代价和系统的延迟容忍度，电源管理的目标就是在保证延迟在系统可以接受的范围内尽可能的节省功耗。

## 3\. Idle状态判断

在Linux系统启动的时候，会在每个cpu上创建对应的idle进程，start\_kernel()函数初始化内核需要的所有数据结构，并创建一个名为init的进程（pid=1），当init进程创建完后，cpu的idle进程处于cpu\_idle\_loop()无限循环中，当没有其他进程处于TASK\_RUNNING状态时候，调度器才会执行cpu idle线程，让cpu进入idle模式.其函数调用关系简要概括如下：

start\_kernel –> rest\_init –> cpu\_startup\_entry， 在cpu\_startup\_entry这个函数中，最终程序会进入无限循环do\_idle loop中。

> 这里我们又进入看代码环节，可以参考公众号之前的文章 [\# Linux驱动-IMX6ULL开发板qemu环境搭建](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484117%26idx%3D1%26sn%3D52af62bd90b92d6d2d341748d0b3a438%26chksm%3Dfa5284f1cd250de78afd4939479a551989366a516318d4511a8c363888a044b0686b0aa5c1cf%26token%3D648667206%26lang%3Dzh_CN%26scene%3D21%23wechat_redirect) ，我们修改好qemu启动脚本加-s -S后，在VS中打断点，进行代码查看。

![](https://picx.zhimg.com/v2-8dcf93709d75d962bd8b25449419775d_1440w.jpg)

cpu\_idle\_loop（）函数中会不断的进行轮询判断

```
while (1) {
    ...
    if (cpu_is_offline(cpu)) {
            cpuhp_report_idle_dead();
            arch_cpu_idle_dead();
    }

    local_irq_disable();
    arch_cpu_idle_enter();
    ...
}
```

## 3\. cpuidle core

cpuidle core抽象出了三个数据结构：

- cpuidle device：用于描述CPU核的cpuidle设备。
- cpuidle driver：用于描述CPU核的cpuidle驱动。
- cpuidle governor：主要根据cpuidle的device和driver状态来选择策略。
![](https://pic1.zhimg.com/v2-7ac8935555e236e0620e377a41e085e0_1440w.jpg)

以cpuidle-pcsi.c为例，整个cpuidle注册流程如下图：

![](https://pic3.zhimg.com/v2-b31f8165cd7c145e28e34f6440d5eb02_1440w.jpg)

## 4\. 注册初始化

cpuidle初始化包括governor注册、驱动注册和设备注册三部分

## 4.1 cpuidle governor注册

![](https://pic3.zhimg.com/v2-d5dc9e0c7df01152001029024df87b36_1440w.jpg)

cpuidle governor在cpuidle驱动和设备之前注册，内核使用一个链表维护系统中所有已注册的governor。当前新版内核一共支持ladder、menu、teo和haltpoll四种governor，它们都通过调用cpuidle\_register\_governor函数将自身注册到系统中。

- Haltpoll governor：它是用于优化虚拟机性能的一种cpuidle governor。其原理为当vcpu进入idle时，通过guest端执行poll操作，以避免使其陷入host中。它的优点是减少了vm切换和通过ipi唤醒vcpu的成本，但它也造成在guest睡眠时，host无法复用该vcpu对应的物理cpu，从而降低系统吞吐量的问题。
- Ladder governor：该governor通过cpu前一次idle状态的驻留时间是否超过该state延迟时间一个特定的值（promotion\_time\_ns），以及下一个state的延迟时间是否超过系统延迟容忍度，来确定是否需要提升idle state。由于该governor每次只能提升一个state，因此其state提升方式就像梯子一样逐级往上，这也是它的名字由来。它往往用于periodic timer tick system。
- Menu governor：直接选择可能满足需求的最深休眠态，就好像你拿着菜单（menu）选菜一样。如果深度的idle state更好，那么就会直接进入到深度的idle state。
- Teo governor：采用的策略跟menu governor一样，都是预测接下来会有多长时间能待在idle状态，然后据此选择合适的idle mode。不过它跟menu governor考虑多方因素的策略是不同的。teo的理念是，多数系统上CPU唤醒最频繁的唤醒源都是timer events，而不是设备中断(device interrupts)。timer中断的数量要比其他中断高几个数量级。所以只要依据timer event就可以做好预测工作了。

## 4.2 cpuidle driver注册

![](https://pic1.zhimg.com/v2-8729d18bf234a516280b7bf12b6902f4_1440w.jpg)

cpuidle驱动注册流程比较简单，它主要包含以下三部分内容

- idle state相关参数设置、以及可能的broadcast timer
- 若设置了local-timer-stop属性，则为每个cpu设置相应的broadcast timer
- 若为该driver指定了governor，则切换current governor

cpuidle driver的主要工作是定义所支持的cpuidle state，以及state的enter接口，如下面所示，cpudile driver就要负责将平台定义的idle-state信息填充到这个结构体中

![](https://pica.zhimg.com/v2-fbd3f08c810622e2a96a1b9a6d405428_1440w.jpg)

## 4.3 cpuidle device注册

![](https://pic4.zhimg.com/v2-6f8dfaa8b5626ae641ee5e0c30a53679_1440w.jpg)

cpuidle设备注册主要包括初始化一些参数值，将该设备添加到全局设备链表中，然后为其初始化sysfs属性和使能该设备。

注册之后，cpuidle设备、cpuidle驱动及governor之间建立起了连接，最终系统经由cpuidle framework，通过接口来调用下层的接口，进而完成具体的硬件操作。

在现在的SMP系统中，每个cpu core都会有一个对应的cpuidle device，内核是通过使用struct cpuidle\_device抽象cpuidle device,该结构体主要成员含义如下：

lenabled：设备是否已经使能 lcpu:该device对应的cpu number llast\_residency:该设备上一次停留在idle状态的时间 lstates\_usage:记录了该设备的每个idle state的统计信息

## 5\. cpuidle触发流程

Idle task通过cpu\_startup\_entry为入口，调用到cpuidle\_framework，流程如下图：

![](https://pica.zhimg.com/v2-020b269593b4d5827c9452c404b83b90_1440w.jpg)

cpu启动完成时，会通过cpu\_startup\_entry函数将其自身切换到idle线程。除此之外，当某个cpu上没有可运行线程时，也会切换idle线程（上流程没画出，后面梳理进程调度的时候再细讲）。切换idle线程后，最终都会执行idle线程的主函数do\_idle，并最终通过该函数将cpu设置为特定的idle state。

其中governor中的select、reflect函数是cpuidle的核心功能，决定了cpuidle状态的选择策略。

## 参考资料：

1. [zhuanlan.zhihu.com/p/54](https://zhuanlan.zhihu.com/p/548268554)
2. [blog.csdn.net/feelabcli](https://link.zhihu.com/?target=https%3A//blog.csdn.net/feelabclihu/article/details/125688355)

> 后记：  
> 关于cpu idle的学习大家可以自己百度找点资料，文章中的资料也是参考别人写的进行学习，感觉要想彻底掌握还是需要调试，大多数我们能做的还是配置DTS，简单了解下基本构架也是可以的。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位自己有博客公众号的留言：申请转载，多谢！

后续会继续更新，纯干货分析，欢迎分享给朋友，欢迎点赞、收藏、在看、划线和评论交流以！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-01 10:35・上海[本科机械，工作4年 能转行做IC吗？](https://www.zhihu.com/question/596245463/answer/1946230052049105795)

[

2019年我毕业于某文理学院的机械专业，跟芯片可以说是八竿子打不着的关系。毕业后我在一家快消公司做市场专员，每天的工作就是写活动方案、对接渠道、统计销量。做了三年多，每天重复...

](https://www.zhihu.com/question/596245463/answer/1946230052049105795)