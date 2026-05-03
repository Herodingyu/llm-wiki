---
doc_id: src-电源管理入门-9-cpu-idle
title: 电源管理入门 9 CPU Idle
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-9 CPU Idle.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 5 人赞同了该文章 ![](https://pica.zhimg.com/v2-5c5bcf207834780719e02fba67adc27c_1440w.jpg)

## Key Points

### 1. 1\. CPU Idle有什么用？
![](https://pica.zhimg.com/v2-3e8d06108bfc5526057da58567cf00fa_1440w.jpg) 答案就是“省电”，当多核CPU没有任务执行的时候，这时候需要将除主Core之外的其他Core进行低功耗处理，这件事就是CPU Idle机制做的。

### 2. 2\. CPU Idle整体框架
![](https://pic1.zhimg.com/v2-2185b67f87c6af20f4f22d0c58b4da36_1440w.jpg) 首先是CPUIdle子系统通过sysfs向userspace提供的节点：

### 3. 3\. Idle状态判断
在Linux系统启动的时候，会在每个cpu上创建对应的idle进程，start\_kernel()函数初始化内核需要的所有数据结构，并创建一个名为init的进程（pid=1），当init进程创建完后，cpu的idle进程处于cpu\_idle\_loop()无限循环中，当没有其他进程处于TASK\_RUNNING状态时候，调度器才会执行cpu idle线程，让cpu进入idle模式.其函数调用关系

### 4. 3\. cpuidle core
cpuidle core抽象出了三个数据结构： - cpuidle device：用于描述CPU核的cpuidle设备。 - cpuidle driver：用于描述CPU核的cpuidle驱动。 - cpuidle governor：主要根据cpuidle的device和driver状态来选择策略。

### 5. 4\. 注册初始化
cpuidle初始化包括governor注册、驱动注册和设备注册三部分

## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-9 CPU Idle.md) [[../../raw/tech/bsp/电源管理/电源管理入门-9 CPU Idle.md|原始文章]]

## Key Quotes

> "关闭一些核可以节省功耗，但关闭之后对时延(性能)必会造成一定的影响，如果在关闭之后很短的时间内就被唤醒，那么就会造成功耗/性能双方都不讨好，在进入退出idle的过程中也是会有功耗的损失的，如果在idle状态下面节省的功耗还无法弥补进入退出该idle的功耗，那么反而会得不偿失。"

> "\--解决方法就是：策略。是由cpuidle framework会根据不同的场景来进行仲裁选择使用何种的idle状态。"

> "关于cpu idle的学习大家可以自己百度找点资料，文章中的资料也是参考别人写的进行学习，感觉要想彻底掌握还是需要调试，大多数我们能做的还是配置DTS，简单了解下基本构架也是可以的。"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-9 CPU Idle.md) [[../../raw/tech/bsp/电源管理/电源管理入门-9 CPU Idle.md|原始文章]]
