---
title: "linux系统休眠（一）休眠介绍"
source: "https://zhuanlan.zhihu.com/p/542445635"
author:
  - "[[lgjjeff]]"
published:
created: 2026-05-02
description: "本文基于以下软硬件假定： 架构：AARCH64 内核版本：5.14.0-rc5 1 系统休眠介绍 在日常工作中经常会有以下情形，当我们正在使用电脑编写代码时，需要临时去开个会或处理一些紧急问题，此时就需要暂停编码工作。电…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_1531340022309036032)

17 人赞同了该文章

本文基于以下软硬件假定：

架构：AARCH64

内核版本：5.14.0-rc5

## 1　系统休眠介绍

　　在日常工作中经常会有以下情形，当我们正在使用电脑编写代码时，需要临时去开个会或处理一些紧急问题，此时就需要暂停编码工作。电脑在一段时间无操作后，将会关闭大部分硬件的电源，并进入睡眠模式，以降低功耗。当我们回来以后，通过操作键盘或鼠标，则又可以唤醒电脑，并继续先前未完成的工作。

　　同样当不需要使用手机时，它将会关闭屏幕进入待机状态，此时系统会保存进程上下文，并关闭外设和cpu电源。当需要再次使用手机时，又可通过按键等方式唤醒系统，然后恢复先前保存的上下文。

　　以上都是系统休眠的一些典型案例，由于休眠需要保存当前执行上下文，且在唤醒时恢复这些上下文，因此与关机相比，休眠唤醒需要处理更多的流程。如休眠时需要先关闭哪些设备，后关闭哪些设备，休眠过程中如何处理中断，以及如何唤醒已休眠的系统等。

## ２　休眠方式

　　与cpuilde类似，系统休眠也有深有浅，其中睡的越深功耗越低，相应的唤醒延迟越大，睡的越浅功耗越高，而其唤醒延迟也越小。根据睡眠状态由浅到深，Linux当前一共支持freeze、standby、mem和disk四种休眠方式，其特点如下：  
（1）freeze（ [suspend to idle](https://zhida.zhihu.com/search?content_id=208676503&content_type=Article&match_order=1&q=suspend+to+idle&zhida_source=entity) ）：这种方式会冻结系统中的进程，挂起所有需要挂起的设备，然后将cpu切换为idle进程，使其进入idle状态。它不会将cpu从内核中移除，因此一旦被唤醒只需从idle状态退出，恢复挂起的设备和被冻结的进程即可

（2）standby（ [suspend to standby](https://zhida.zhihu.com/search?content_id=208676503&content_type=Article&match_order=1&q=suspend+to+standby&zhida_source=entity) ）：这种方式除了执行所有freeze相关的流程外，还会将secondary cpu从内核中移除，然后primary cpu进入standby睡眠模式。standby模式睡眠较浅，不会对cpu断电，因此在睡眠时不需要保存cpu上下文。当其一旦被唤醒，cpu就能马上投入工作，并依次恢复系统运行

（3）mem（ [suspend to mem](https://zhida.zhihu.com/search?content_id=208676503&content_type=Article&match_order=1&q=suspend+to+mem&zhida_source=entity) ）：相对于standby方式，这种方式下primary cpu需要先将cpu上下文保存到内存中，然后将自身断电。因此它不能直接被唤醒，而是需要先通过其它模块为其上电，然后再执行恢复cpu上下文以及其它模块的工作。由于这种方式，内核整个都已经睡着了，因此也不会有访问ddr的需求，因此也可以将ddr设置为自刷新模式，以进一步降低功耗

（4）disk（ [suspend to disk](https://zhida.zhihu.com/search?content_id=208676503&content_type=Article&match_order=1&q=suspend+to+disk&zhida_source=entity) 或hibernate）：这是最深的一种睡眠模式，与suspend to mem将系统相关上下文保存到ddr中不同，它将系统上下文保存到磁盘中。由于所有上下文都已经保存到磁盘中，因此不仅外设、cpu可以下电，而且此时ddr也可以被断电

　　更进一步，为了更好地节能，SOC一般会将芯片上的电源分为多个 [power domain](https://zhida.zhihu.com/search?content_id=208676503&content_type=Article&match_order=1&q=power+domain&zhida_source=entity) ，其中 [aon domain](https://zhida.zhihu.com/search?content_id=208676503&content_type=Article&match_order=1&q=aon+domain&zhida_source=entity) 在一般的休眠流程中不会被断电（如唤醒时需要该domain的支持）。而在hibernate时，由于可以从磁盘中的信息恢复整个系统，因此包含aon domain在内的整个系统都会被断电。当需要恢复系统时，则只需为其重新上电，然后从disk中恢复执行系统状态即可

　　当然系统并不需要支持以上所有休眠方式，如一般的架构都会支持freeze和mem方式，而standby和disk方式则可根据需求确定是否要支持。

　　我们可通过命令cat /sys/power/state查看系统支持的休眠方式，如在我的ubuntu系统中，支持所有四种休眠模式，其查询结果如下：

![](https://pic2.zhimg.com/v2-6d02b77886ef8d3b6f5de8e15cffffb5_1440w.png)

　　而在qemu模拟的arm64系统中，只支持freeze和mem两种休眠方式，其相应的查询结果如下：

![](https://pic4.zhimg.com/v2-7ce58d349f4bef9554a53a8155e26bf5_1440w.png)

由于hibernate休眠方式相对比较特殊，因此除了特别提及以外，后面的介绍将主要围绕suspend to ram进行。

## ３　休眠的主要任务

　　休眠的本质是保存系统当前的运行状态，然后将其设置为一个低功耗模式。当休眠完成被唤醒时，则又通过先前保存的状态恢复系统执行。因此那些能独立执行特定任务的硬件都需要保存其运行状态，如cpu可执行程序代码，设备也可根据配置信息执行特定的功能。故系统休眠不仅需要考虑保存cpu相关的上下文，还需要保存设备相关的上下文。

　　对于cpu，其执行上下文主要包括进程上下文和中断上下文，因此在休眠时首先需要冻结系统中正在执行的进程，其次需要关闭相关的中断。同时，cpu本身还有一些全局的控制器寄存器（如armv8中的sctlr\_elx等），并不与特定的进程上下文或中断上下文相关，因此在休眠时还需要保存cpu本身的上下文。

　　对于设备而言，由于不同设备的实现千差万别，因此包括上下文保存相关的休眠操作需要由每个设备自身实现。内核只为它们提供一个统一的框架，如在休眠的哪个阶段会调用哪个回调函数，设备驱动就可根据自身的需求实现其中相关的回调函数即可。

## ４　休眠唤醒总体流程

　　由以上介绍可知系统休眠主要包含冻结进程，挂起设备，关闭中断，挂起secondary cpu以及最终挂起primary cpu使整个系统进入休眠状态。其主要执行流程如下：

![](https://picx.zhimg.com/v2-f8990da63dd8cc1e8d12b9d56662dd3d_1440w.jpg)

　　在该流程中，platform\_xxx相关的函数由不同的平台通过回调函数的方式注册到pm core中，回调函数的格式根据休眠方式是否为freeze（suspend to idle）而有所不同，其定义分别如下：

```
struct platform_s2idle_ops {
    int (*begin)(void);
    int (*prepare)(void);
    int (*prepare_late)(void);
    bool (*wake)(void);
    void (*restore_early)(void);
    void (*restore)(void);
    void (*end)(void);
}

struct platform_suspend_ops {
    int (*valid)(suspend_state_t state);
    int (*begin)(suspend_state_t state);
    int (*prepare)(void);
    int (*prepare_late)(void);
    int (*enter)(suspend_state_t state);
    void (*wake)(void);
    void (*finish)(void);
    bool (*suspend_again)(void);
    void (*end)(void);
    void (*recover)(void);
}
```

　　在该定义中包含了多个不同的函数定义，它们分别在系统休眠流程的不同阶段被调用，平台可通过它们在相应阶段执行一些必要的操作。而dpm\_xxx相关函数用于设备休眠流程，它同样包含了一组在不同阶段调用的回调函数，其定义如下：

```
struct dev_pm_ops {
    int (*prepare)(struct device *dev);
    void (*complete)(struct device *dev);
    int (*suspend)(struct device *dev);
    int (*resume)(struct device *dev);
    int (*freeze)(struct device *dev);
    int (*thaw)(struct device *dev);
    int (*poweroff)(struct device *dev);
    int (*restore)(struct device *dev);
    int (*suspend_late)(struct device *dev);
    int (*resume_early)(struct device *dev);
    int (*freeze_late)(struct device *dev);
    int (*thaw_early)(struct device *dev);
    int (*poweroff_late)(struct device *dev);
    int (*restore_early)(struct device *dev);
    int (*suspend_noirq)(struct device *dev);
    int (*resume_noirq)(struct device *dev);
    int (*freeze_noirq)(struct device *dev);
    int (*thaw_noirq)(struct device *dev);
    int (*poweroff_noirq)(struct device *dev);
    int (*restore_noirq)(struct device *dev);
    int (*runtime_suspend)(struct device *dev);
    int (*runtime_resume)(struct device *dev);
    int (*runtime_idle)(struct device *dev);
}
```

　　由于每个设备的休眠方式可能都不同，因此每个需要休眠的设备都需要实现其自身的回调函数。为了管理这些函数，内核将以上结构体加入到了设备模型中。当需要执行设备电源管理操作时，就可从设备模型中获取相应的回调函数。

　　同时，需要电源管理的设备会被加入到一个全局链表dpm\_list中，电源管理核心可通过该链表遍历所有设备，并对其依次执行电源管理操作。以下为该链表的定义（drivers/base/power/main.c）：

```
LIST_HEAD(dpm_list);
```

　　当内核调用suspend\_ops.enter函数后，系统最终会进入休眠状态，在系统被唤醒之前该函数将不会返回。当系统被唤醒后，该函数将会返回，此后它将会执行系统恢复（resume）相关操作，其流程如下：

![](https://pica.zhimg.com/v2-2b21de9bdc8caf631d1592f08ef58e3a_1440w.jpg)

　　系统恢复流程基本上是系统休眠流程的逆过程，它会使能cpu中断，启动secondary cpu，然后在不同阶段分别执行设备和平台相关的回调函数。当整个系统恢复完成后，系统将恢复为休眠前的状态，并继续执行相关的任务

发布于 2022-07-16 19:30