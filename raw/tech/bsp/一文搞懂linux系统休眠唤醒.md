---
title: "一文搞懂linux系统休眠唤醒"
source: "https://zhuanlan.zhihu.com/p/568050822"
author:
  - "[[黑客与摄影师​东南大学 电子与通信工程硕士]]"
published:
created: 2026-05-02
description: "1，介绍 系统休眠唤醒是电源管理中重要的一个技术点，一方面，它能让系统在不需要工作时，尽可能进入一个功耗极低的状态，这时外部的设备、芯片内部ip、时钟进入了低功耗状态或关闭电源状态，从而尽可能的减少功耗…"
tags:
  - "clippings"
---
[收录于 · linux功耗管理](https://www.zhihu.com/column/c_1589903721982472192)

43 人赞同了该文章

## 1，介绍

系统休眠唤醒是 [电源管理](https://zhida.zhihu.com/search?content_id=214365975&content_type=Article&match_order=1&q=%E7%94%B5%E6%BA%90%E7%AE%A1%E7%90%86&zhida_source=entity) 中重要的一个技术点，一方面，它能让系统在不需要工作时，尽可能进入一个功耗极低的状态，这时外部的设备、芯片内部ip、时钟进入了低功耗状态或关闭电源状态，从而尽可能的减少功耗，增加产品的续航；另一方面，在用户需要系统工作的时候，系统能够快速恢复电源、时钟、芯片内部ip及外部设备的工作，从而不影响用户的使用体验。系统休眠唤醒比其他的功耗管理对系统的影响更大。比如， [clock框架](https://zhida.zhihu.com/search?content_id=214365975&content_type=Article&match_order=1&q=clock%E6%A1%86%E6%9E%B6&zhida_source=entity) 管理的是时钟资源，runtime power manage管理的是power domain， [regulator](https://zhida.zhihu.com/search?content_id=214365975&content_type=Article&match_order=1&q=regulator&zhida_source=entity) 管理的是供电， [reset框架](https://zhida.zhihu.com/search?content_id=214365975&content_type=Article&match_order=1&q=reset%E6%A1%86%E6%9E%B6&zhida_source=entity) 管理的是各模块的复位功能，cpu dvfs、 [idle](https://zhida.zhihu.com/search?content_id=214365975&content_type=Article&match_order=1&q=idle&zhida_source=entity) 、 [hotplug](https://zhida.zhihu.com/search?content_id=214365975&content_type=Article&match_order=1&q=hotplug&zhida_source=entity) 管理的是cpu的低功耗功能。但是，系统休眠唤醒基本上涉及了如上所有的功能模块，那他是怎么协调这么多资源进入或者退出低功耗状态的呢？本文主要的目的就是回答这个问题。

[Linux内核](https://zhida.zhihu.com/search?content_id=214365975&content_type=Article&match_order=1&q=Linux%E5%86%85%E6%A0%B8&zhida_source=entity) 提供了多种休眠（休眠）方式： [freeze](https://zhida.zhihu.com/search?content_id=214365975&content_type=Article&match_order=1&q=freeze&zhida_source=entity) 、standyby、 [STR](https://zhida.zhihu.com/search?content_id=214365975&content_type=Article&match_order=1&q=STR&zhida_source=entity) （suspend to RAM）和STD（suspend to disk），这些休眠方式通过文件节点/sys/power/state提供给用户操作，在用户空间通过向/sys/power/state文件节点分别写入freeze、standy、mem、disk，系统就会进入相应的状态。这样可以在系统需要进入相应状态的时候，由用户发起相应的休眠。在休眠之前会配置唤醒源，当系统休眠下去后，通过这些唤醒源（比如，按键、RTC、屏幕、USB拔插等）可以在需要的时候唤醒（resume）系统。这样在系统进入了休眠状态后，用户可以选择什么时刻，通过什么方式将系统快速唤醒，即兼顾了功耗低，又兼顾了时间短。

系统休眠及唤醒过程涉及到pm core框架、 [device pm框架](https://zhida.zhihu.com/search?content_id=214365975&content_type=Article&match_order=1&q=device+pm%E6%A1%86%E6%9E%B6&zhida_source=entity) 、用户进程及内核线程或worker，各设备驱动、power domain、cpu管理等多个模块，并且涉及了process freeze&thaw、wakeup处理、设备suspend&resume、syscore suspend&resume、ddr自刷新等技术点。

## 2，框架

![](https://pic4.zhimg.com/v2-9572e8ec2d978ef631c9558e69878eb5_1440w.jpg)

系统休眠唤醒框架

系统休眠唤醒的框架包括三部分：services、PM core、PM driver。PM core实现power manage的核心逻辑，为上层services提供操作休眠唤醒的相关接口，通过利用底层相关的技术实现休眠唤醒过程中的cpu hotplug、wakup source enable/disable、设备的suspend&resume等。上层service通过wakelock的使用，在系统不需要工作的时候经由power manager利用PM core提供的文件节点发起休眠。然后，休眠的过程中PM driver会配置、取消唤醒源，调用设备的suspend&resume函数，进行syscore的suspend&resume操作。

Services部分由两类service组成，power manager service及普通的app service。其中，power manager service提供了wakelock锁的create/request/release管理功能，当没有services持有wakelock的话，power manager service会通过往文件节点/sys/power/state写mem发起内核的休眠。

PM core部分提供了wakelock（决定是否发起休眠）的实现，wakeup\_count（用于各services释放wakelock后，到发起内核休眠的期间是否有唤醒源，从而是否进行resume的管理）的实现，suspend的实现。这三个功能分别向上层提供了相应的文件节点，供上层操作。休眠、唤醒的过程中会涉及到进程的freeze&thaw，wakeup source的使能、失能，设备的休眠、唤醒，power domain的关、开，cpu的拔、插等功能或框架。

PM driver部分主要实现了设备驱动的suspend&resume实现，架构驱动（gpio、irq、timer等）低功耗相关的操作。

## 3，流程

### 3.1 休眠唤醒流程

Linux系统休眠唤醒的整个流程：

![](https://pic4.zhimg.com/v2-054b14da1c7ceb417ecf2adf41423871_1440w.jpg)

系统休眠唤醒流程

### 3.2 休眠唤醒函数调用流程

echo mem > /sys/power/state

做如上操作后，整个函数调用流程如下：

![](https://pic3.zhimg.com/v2-ea4591f75c869274c4f55cde2f355d66_1440w.jpg)

系统休眠唤醒函数调用流程

还没有人送礼物，鼓励一下作者吧

编辑于 2023-12-20 13:26・上海[2025年值得买的「AI学习机」推荐！AI学习机真的不是智商税吗？真的能提升成绩吗？内附科大讯飞、作业帮、小猿、学而思学习机真实测评！](https://zhuanlan.zhihu.com/p/1916532050904711282)

[

2025年了，不要一味地胡乱努力了， 要学会灵活运用工具。以前我们家长辅导孩子不是自己亲自上阵就是花钱补习请家教，不但特别牵扯精力，而且特别费钱，毕竟补课老师的水平参差不齐，想...

](https://zhuanlan.zhihu.com/p/1916532050904711282)