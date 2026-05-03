---
title: "电源管理入门-16 驱动Runtime PM管理"
source: "https://zhuanlan.zhihu.com/p/2022626289681481995"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "Runtime PM管理也就是设备驱动里面的电源管理，即设备驱动结构体里面的struct dev_pm_ops，只控制设备自己的电源。这样可以在设备不需要工作的时候可以进入到低功耗状态，更好的管理设备自己的电源，所谓：“各扫…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

2 人赞同了该文章

![](https://pic2.zhimg.com/v2-1850c5ff27d107b5746fb3fe84d1662d_1440w.jpg)

**[Runtime PM](https://zhida.zhihu.com/search?content_id=272341066&content_type=Article&match_order=1&q=Runtime+PM&zhida_source=entity) 管理** 也就是 **设备驱动** 里面的电源管理，即设备驱动结构体里面的 **struct [dev\_pm\_ops](https://zhida.zhihu.com/search?content_id=272341066&content_type=Article&match_order=1&q=dev_pm_ops&zhida_source=entity) ，** 只控制设备自己的电源。这样可以在设备不需要工作的时候可以进入到低功耗状态，更好的 **管理设备自己的电源，** 所谓：“ **各扫门前雪** ”。

> 为什么需要Runtime PM？  
> 不同于系统的电源管理，设备自己的电源管理更加的 **细化** 。这就像一个层级关系，系统整体的是一个大的电源状态管理，但是对于众多的集成外国设备也不能一刀切，就是不能要干活都干活要休息都休息，要细化管理不能懒政，就 **对每个设备自己也来一套** 电源状态管理，直接把机制从系统哪里复制过来一份一个阉割版的就够用，采用 **分而治之** 的思想，只要系统要统一指挥的时候听话就可以，其他时候可以自己决策执行就是runtime PM管理。这里的设备有可能是 **外设** ，比如sensor、lcdc等。这里的设备也有可能是SOC内部的 **某些IP** ，比如codec、dsp、usb等。

## 1\. 框架介绍

## 1.1 为什么需要Runtime PM Framework?

- 系统基本的电源管理，例如关机休眠等，需要调用device的电源Runtime API就是 **ops回调函数** ，而且需要按一个顺序的queue去实施，而且系统跟设备状态发生冲突的时候也需要去处理，综上就需要一个Framework去统一做这些事情
- 设备驱动需要 **根据系统的一些参数** 来决定自己的电源状态，例如CPU是否idle等，就需要系统框架的支持
- 当设备处于低功耗模式时， **wakeup signal** 常常需要platform或者bus的支持。

## 1.2 系统框架图

![](https://pic1.zhimg.com/v2-aec488d848b23191f668ebd67d535d8a_1440w.jpg)

数据结构：

![](https://picx.zhimg.com/v2-be9b63c732b026f0f60b61752ac04f31_1440w.jpg)

image.png

关机举例：

![](https://pic2.zhimg.com/v2-3e0eb8ab54f02d87619bb5b764533607_1440w.jpg)

休眠举例：

![](https://pic4.zhimg.com/v2-2345e8e527cdbee1b4334913faf6b799_1440w.jpg)

## 2\. Drivers

Device drivers（包括bus、class、 [power domain](https://zhida.zhihu.com/search?content_id=272341066&content_type=Article&match_order=1&q=power+domain&zhida_source=entity) ）实现了runtime pm相关的runtime\_idle/runtime\_suspend/runtime\_resume三个回调：

- **runtime\_suspend** 用于实现设备的低功耗操作
- **runtime\_resume** 用于实现设备的低功耗恢复相关的操作
- **runtime\_idle** 属于runtime\_suspend的一个过渡，用于缓冲频繁的suspend与resume，它会判断设备是否具备suspend的条件，如果具备在合适的时机，就会suspend设备。

runtime\_suspend与runtime\_resume回调函数里会调用clock framework/reset framework/regulator framework提供的时钟开关、复位、电源开关的接口。这里以SPI驱动为例进行说明：

```
subsys_initcall(pl022_init);

static int __init pl022_init(void)
{
        return amba_driver_register(&pl022_driver);
}

static struct amba_driver pl022_driver = {
        .drv = {
                .name        = "ssp-pl022",
                .pm        = &pl022_dev_pm_ops,
        },
        .id_table        = pl022_ids,
        .probe                = pl022_probe,
        .remove                = pl022_remove,
};

static const struct dev_pm_ops pl022_dev_pm_ops = {
        SET_SYSTEM_SLEEP_PM_OPS(pl022_suspend, pl022_resume)
        SET_RUNTIME_PM_OPS(pl022_runtime_suspend, pl022_runtime_resume, NULL)
};
                         
#define SET_RUNTIME_PM_OPS(suspend_fn, resume_fn, idle_fn) \
        .runtime_suspend = suspend_fn, \
        .runtime_resume = resume_fn, \
        .runtime_idle = idle_fn,
```

pm结构体dev\_pm\_ops 中的有3个以runtime开头的成员函数：runtime\_suspend（）、runtime\_resume（）和runtime\_idle（），它们辅助设备完成运行时的电源管理

```
struct dev_pm_ops {
    ...
    int (*runtime_suspend)(struct device *dev);
    int (*runtime_resume)(struct device *dev);
    int (*runtime_idle)(struct device *dev);
    ...
};
```

运行时的PM与前文描述的系统级挂起到RAM时候的PM不太一样，它是针对单个设备，指系统在非睡眠状态的情况下，某个设备在空闲时可以进入运行时挂起状态，而在不是空闲时执行运行时恢复使得设备进入正常工作状态，如此，这个设备在运行时会省电。

![](https://pica.zhimg.com/v2-2c75655d8ad270883592a134bf530022_1440w.jpg)

每个设备处理好自己的电源管理，在不需要工作时进入低功耗状态。也就是"各人自扫门前雪"。Linux提供了一系列API，以便于设备可以声明自己的运行时PM状态：

| 函数名字 | 功能 |
| --- | --- |
| pm\_runtime\_suspend | 引发设备的挂起，执行相关的runtime\_suspend（）函数。 |
| pm\_schedule\_suspend | “调度”设备的挂起，延迟delay毫秒后将挂起工作挂入pm\_wq等待队列，结果等价于delay毫秒后执行相关的runtime\_suspend（）函数。 |
| pm\_runtime\_resume | 引发设备的恢复，执行相关的runtime\_resume（）函数。 |
| pm\_request\_resume | 发起一个设备恢复的请求，该请求也是挂入pm\_wq等待队列。 |
| pm\_runtime\_idle | 引发设备的空闲，执行相关的runtime\_idle（）函数。 |
| pm\_request\_idle | 发起一个设备空闲的请求，该请求也是挂入pm\_wq等待队列。 |
| pm\_runtime\_enable | 使能设备的运行时PM支持。 |
| pm\_runtime\_disable | 禁止设备的运行时PM支持。 |
| pm\_runtime\_getpm\_runtime\_get\_sync | 增加设备的引用计数（usage\_count），这类似于clk\_get（），会间接引发设备的runtime\_resume（）。 |
| pm\_runtime\_putpm\_runtime\_put\_sync | 减小设备的引用计数，这类似于clk\_put（），会间接引发设备的runtime\_idle（）。 |

## 3\. Runtime PM core

Runtime pm core主要提供了三类函数接口：

- 提供 **enable/disable接口** 给设备驱动，用于该设备驱动决定是否打开或关闭RPM，
- 提供 **get、put类接口** 给设备驱动，用于决定什么时候进入或者恢复设备低功耗，
- 在设备驱动调用了get、put接口后RPM会调用各设备驱动实现的 **runtime\_suspend/runtime\_resume接口** 。

对于决定设备是否进入低功耗的get/put接口的调用时机，一般会在操作设备相关寄存器前调用get接口，在操作完相关寄存器后调用put接口。或者在设备驱动的open、release、start、stop等接口里调用，用户层的services通过ioctrl或者驱动提供的文件节点调用驱动的这些接口。

我们可以这样简单地理解Linux运行时PM的机制，每个设备（总线的控制器自身也属于一个设备）都 有引用计数usage\_count和活跃子设备（Active Children，子设备的意思就是该级总线上挂的设备）计数child\_count，当两个计数都为0的时候，就进入空闲状态，调用pm\_request\_idle（dev）。

当设备进入空闲状态，与pm\_request\_idle（dev）对应的PM核并不一定直接调用设备驱动的runtime\_suspend（），它实际上在多数情况下是调用与该设备对应的bus\_type的runtime\_idle（）。

在具体的设备驱动中，一般的用法则是在设备驱动probe（）时运行pm\_runtime\_enable（）使能运行时PM支持，在运行过程中动态地执行“pm\_runtime\_get\_xxx（）->做工作->pm\_runtime\_put\_xxx（）”的序列。如代码清单19.19中的drivers/watchdog/ [omap\_wdt](https://zhida.zhihu.com/search?content_id=272341066&content_type=Article&match_order=1&q=omap_wdt&zhida_source=entity).c OMAP的看门狗驱动。

- 在omap\_wdt\_start（）中启动了pm\_runtime\_get\_sync（），
- 而在omap\_wdt\_stop（）中调用了pm\_runtime\_put\_sync（）。
```
static const struct watchdog_ops omap_wdt_ops = {
        .owner                = THIS_MODULE,
        .start                = omap_wdt_start,
        .stop                = omap_wdt_stop,
        .ping                = omap_wdt_ping,
        .set_timeout        = omap_wdt_set_timeout,
        .get_timeleft        = omap_wdt_get_timeleft,
};

static int omap_wdt_start(struct watchdog_device *wdog)
{

    pm_runtime_get_sync(wdev->dev);//告诉内核要开始用看门狗这个设备了，如果看门狗设备已经进入省电模式（之前引用计数为0且执行了运行时挂起），会导致该设备的运行时恢复
    
static int omap_wdt_stop(struct watchdog_device *wdog)
{
    pm_runtime_put_sync(wdev->dev);//告诉内核不用这个设备了，如果引用计数变为0且活跃子设备为0，则导致该看门狗设备的运行时挂起。
```

在一些设备上不使用的时候不能立即挂起，，因为挂起状态的进入和恢复需要一些时间，如果设备不在挂起之间保留一定的时间，频繁进出挂起反而会带来新的开销。因此，我们可根据情况决定只有设备在空闲了一段时间后才进入挂起（一般来说，一个一段时间没有被使用的设备，还会有一段时间不会被使用），基于此，一些设备驱动也常常使用自动挂动模式进行编程。

![](https://pic2.zhimg.com/v2-2afb268381758d353618a5c24d9eaccd_1440w.jpg)

在执行操作的时候声明pm\_runtime\_get（），操作完成后执行pm\_runtime\_mark\_last\_busy（）和pm\_runtime\_put\_autosuspend（），一旦自动挂动的延时到期且设备的使用计数为0，则引发相关runtime\_suspend（）入口函数的调用。

设备驱动PM成员的runtime\_suspend（）一般完成保存上下文、切到省电模式的工作，而runtime\_resume（）一般完成对硬件上电、恢复上下文的工作

## 4\. power domain framework

一个power domain上可能包含多个IP，每个IP可能对应一个或多个设备。这些设备会在dts中描述与power domain的绑定关系。系统初始化的时候，会将这个power domain放到一个链表中，然后根据设备中dts描述的与power domain的关系，将设备挂在power domain节点下的链表中。

当某个设备驱动通过put接口调用，将usage\_count从1减少到0，这时会先调用power domain注册的runtime\_suspend接口，在这个接口中，会先调用该设备驱动的runtime\_suspend，然后遍历该power domain下所有的设备是否都允许suspend（各设备驱动的usage\_count是否为0）,若允许就会直接调用关闭power domian的接口，否则直接返回。当某个设备驱动通过get接口调用，将usage\_count从0增加到1，这时会先调用power domain注册的runtime\_resume接口，在这个接口中，会先将power domain上电，然后再调用设备驱动对应的runtime\_resume回调函数，让设备退出低功耗。

## 5\. runtime pm的sysfs

对于支持rpm的设备，在相应的设备节点下有多个rpm相关属性的文件节点，分别为control，runtime\_susupend\_time,runtime\_active\_time，autosuspend\_delay\_ms，runtime\_status。接口在文件: /kernel/drivers/base/power/sysfs.c中描述。

/sys/devices/.../power/control

- on - 调用pm\_runtime\_forbid接口，增加设备的引用计数，然后resume设备。
- auto - 调用pm\_runtime\_allow接口，减少设备的引用计数，如果设备的引用计数为0，则idle设备。
![](https://picx.zhimg.com/v2-adb1d81e7232703ad01e839359ea6bc5_1440w.jpg)

/sys/devices/.../power/runtime\_status

- active - 设备的状态是正常工作状态。
- suspend- 设备的状态是低功耗模式。
- suspending-设备的状态正在从active->suspend转化。
- resuming-设备的状态正在从suspend->active转化。
- error-设备runtime出现错误，此时runtime\_error的标志置位。
- unsupported-设备的runtime 没有使能，此时disable\_depth标志置位。

/sys/devices/.../power/runtime\_suspend\_time

- 设备在suspend状态的时间

/sys/devices/.../power/runtime\_active\_time

- 设备在active状态的时间

/sys/devices/.../power/autosuspend\_delay\_ms

- 设备在idle状态多久之后suspend，设置延迟suspend的延迟时间。

## 6参考：

- [zhuanlan.zhihu.com/p/57](https://zhuanlan.zhihu.com/p/576243151)
- [codeantenna.com/a/bZCPl](https://link.zhihu.com/?target=https%3A//codeantenna.com/a/bZCPl5SFSw)
- [github.com/wizardst/Lin](https://link.zhihu.com/?target=https%3A//github.com/wizardst/Linux_drivers_frameworks_doc/blob/master/Linux%25E7%2594%25B5%25E6%25BA%2590%25E7%25AE%25A1%25E7%2590%2586Run-time%2520PM%2520%25E8%25AF%25A6%25E8%25A7%25A3)

> 后记：  
> 在编写驱动的时候，如果涉及电源管理的功耗需求，就需要实现struct dev\_pm\_ops，为驱动程序增加一个电源管理的功能，会更加的灵活，也是我们去优化系统功耗的一个重要方向。因为大多数程序估计是供应商提供的，但是我们自己的加的硬件的程序估计是我们自己去写的，并且做业务挺耗电，给自己写的驱动加个电源管理就挺好。

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言：申请转载，多谢！

后续会继续更新，纯干货分析，欢迎分享给朋友，欢迎点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-04-01 10:48・上海[最简单的库存管理软件有吗？](https://www.zhihu.com/question/670234561/answer/11921940584)

[

推荐一个仓库库存管理软件，超级简单易用，上手就会用。手机电脑都能用，出入库管理用起来很方便。简单好用的库存管理软件...

](https://www.zhihu.com/question/670234561/answer/11921940584)