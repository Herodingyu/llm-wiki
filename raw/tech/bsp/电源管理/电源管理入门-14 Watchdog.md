---
title: "电源管理入门-14 Watchdog"
source: "https://zhuanlan.zhihu.com/p/2022625797907780604"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "看门狗,又叫 watchdog timer,是一个定时器电路, 一般有一个输入,叫喂狗,一个输出到MCU的RST端,MCU正常工作的时候,每隔一段时间输出一个信号到喂狗端,给 WDT 清零,如果超过规定的时间不喂狗,(一般在程序跑飞时),WDT…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

5 人赞同了该文章

![](https://pic4.zhimg.com/v2-1fae95c4bfed6193d5c14181fe985161_1440w.jpg)

看门狗,又叫 **[watchdog timer](https://zhida.zhihu.com/search?content_id=272340895&content_type=Article&match_order=1&q=watchdog+timer&zhida_source=entity)**,是一个定时器电路, 一般有一个输入,叫 **喂狗**,一个输出到 [MCU](https://zhida.zhihu.com/search?content_id=272340895&content_type=Article&match_order=1&q=MCU&zhida_source=entity) 的 [RST端](https://zhida.zhihu.com/search?content_id=272340895&content_type=Article&match_order=1&q=RST%E7%AB%AF&zhida_source=entity),MCU正常工作的时候,每隔一段时间输出一个信号到喂狗端,给 WDT **清零**,如果超过规定的时间不喂狗,(一般在程序跑飞时),WDT 定时超过,就会给出一个 **复位信号** 到MCU,是MCU复位. 防止MCU死机. 看门狗的作用就是防止程序发生死循环，或者说程序跑飞。

watchdog的操作就是 **reset** ，所以跟电源是有联系的。

## 1\. 软硬件watchdog的区别

![](https://pica.zhimg.com/v2-fd303afd9daeb3736fb38b4454fdff72_1440w.jpg)

1. 通常情况下，watchdog需要硬件支持，但是如果确实没有相应的硬件，还想使用watchdog功能，则可以使用 **[liunx模拟的watchdog](https://zhida.zhihu.com/search?content_id=272340895&content_type=Article&match_order=1&q=liunx%E6%A8%A1%E6%8B%9F%E7%9A%84watchdog&zhida_source=entity)** ，即软件watchdog。
2. 硬件watchdog必须有硬件电路支持, 设备节点 **/dev/watchdog** 对应着真实的物理设备， 不同类型的硬件watchdog设备由相应的硬件驱动管理。软件watchdog由一内核模块softdog.ko 通过定时器机制实现，/dev/watchdog并不对应着真实的物理设备，只是为应用提供了一个与操作硬件watchdog相同的接口。
3. 硬件watchdog比软件watchdog有 **更好的可靠性** 。软件watchdog基于 **内核的定时器** 实现，当内核或中断出现异常时，软件watchdog将会失效。而硬件watchdog由自身的硬件电路控制, 独立于内核。无论当前系统状态如何，硬件watchdog在设定的时间间隔内没有被执行写操作，仍会重新启动系统。
4. 一些 **硬件** watchdog卡如WDT501P 以及一些Berkshire卡还可以监测系统温度，提供了 /dev/temperature接口。
5. 对于应用程序而言, 操作软件、硬件watchdog的 **方式基本相同** ：打开设备/dev/watchdog, 在重启时间间隔内对/dev/watchdog执行写操作。即软件、硬件watchdog对应用程序而言基本是透明的。  
	在任一时刻， 只能有一个watchdog驱动模块被加载，管理/dev/watchdog 设备节点。如果系统没有硬件watchdog电路，则可以加载软件watchdog驱动softdog.ko。

## 2\. 软件看门狗

## 2.1 kernel watchdog

kernel watchdog是用来检测 [Lockup](https://zhida.zhihu.com/search?content_id=272340895&content_type=Article&match_order=1&q=Lockup&zhida_source=entity) 的。所谓 **lockup** ，是指 **某段内核代码占着CPU不放** 。Lockup严重的情况下会导致整个系统失去响应。Lockup有几个特点：

- 首先只有内核代码才能引起lockup，因为用户代码是可以被抢占的，不可能形成lockup（只有一种情况例外，就是SCHED\_FIFO优先级为99的实时进程即使在用户态也可能使\[watchdog/x\]内核线程抢不到CPU而形成 [soft lockup](https://zhida.zhihu.com/search?content_id=272340895&content_type=Article&match_order=1&q=soft+lockup&zhida_source=entity) ）
- 其次内核代码必须处于禁止内核抢占的状态(preemption disabled)，因为Linux是可抢占式的内核，只在某些特定的代码区才禁止抢占（例如spinlock），在这些代码区才有可能形成lockup。

### 2.1.1 soft lockup

Lockup分为两种：soft lockup 和 [hard lockup](https://zhida.zhihu.com/search?content_id=272340895&content_type=Article&match_order=1&q=hard+lockup&zhida_source=entity) ，它们的区别是 **hard lockup 发生在CPU屏蔽中断的情况下** 。而 **soft lockup则是单个CPU被一直占用的情况** （中断仍然可以响应）。

> **NMI，即非可屏蔽中断** 。即使在内核代码中设置了屏蔽所有中断的时候，NMI也是不可以被屏蔽的。  
> 可屏蔽中断包含时钟中断， **外设中断** （比如键盘中断，I/O设备中断，等等），当我们处理中断处理程序的时候，在中断处理程序top half时候，在不允许嵌套的情况下，需要关闭中断。  
>   
> 但NMI就不一样了，即便在关闭中断的情况下，他也能被响应。触发NMI的条件一般都是ECC error之类的硬件Error。但NMI也给我们提供了一种机制，在系统中断被误关闭的情况下，依然能通过中断处理程序来执行一些紧急操作，比如kernel panic。

检测soft lockup的原理是给每个CPU分配一个定时执行的内核线程\[watchdog/x\]，如果该线程在设定的期限内没有得到执行的话就意味着发生了soft lockup，\[watchdog/x\]是SCHED\_FIFO实时进程，优先级为最高的99，拥有优先运行的特权。

系统会有一个高精度的计时器hrtimer（一般来源于APIC），该计时器能定期产生时钟中断，该中断对应的中断处理例程是kernel/watchdog.c: watchdog\_timer\_fn()，在该例程中：

- 要递增计数器hrtimer\_interrupts，这个计数器同时为hard lockup detector用于判断CPU是否响应中断；
- 还要唤醒\[watchdog/x\]内核线程，该线程的任务是更新一个时间戳；
- soft lock detector检查时间戳，如果超过soft lockup threshold一直未更新，说明\[watchdog/x\]未得到运行机会，意味着CPU被霸占，也就是发生了soft lockup。

linux kernel会自动检测softlockup，在发生softlockup情况下，系统默认会打印相关warning信息。如果需要出发panic的话，可以设置

```
echo 1 > /proc/sys/kernel/softlockup_panic
```

可以同时设置 watchdog\_thresh参数来定义发现softlockup以后系统panic的时间，默认是10s, 也就是说20s后系统panic。最大能设到60s，也就是说，120s后启动系统panic。

一般来说，在production system上，不建议使用softlockup\_panic选项（有可能误伤）。可以在调试系统上使用。

### 2.1.1 hard lockup

Hard lockup比soft lockup更加严重， **CPU不仅无法执行其它进程，而且不再响应中断** 。检测hard lockup的原理利用了PMU的NMI perf event，因为NMI中断是不可屏蔽的，在CPU不再响应中断的情况下仍然可以得到执行，它再去检查时钟中断的计数器hrtimer\_interrupts是否在保持递增，如果停滞就意味着时钟中断未得到响应，也就是发生了hard lockup

Linux kernel设计了一个检测lockup的机制，称为NMI Watchdog，是利用NMI中断实现的，用NMI是因为lockup有可能发生在中断被屏蔽的状态下，这时唯一能把CPU抢下来的方法就是通过NMI，因为NMI中断是不可屏蔽的。

[NMI watchdog](https://zhida.zhihu.com/search?content_id=272340895&content_type=Article&match_order=1&q=NMI+watchdog&zhida_source=entity) 会利用到之前讲到的hrtimer。它的触发条件是基于PMU的NMI perf event，当PMU的计数器溢出时会触发NMI中断，对应的中断处理例程是 kernel/watchdog.c: watchdog\_overflow\_callback()，hard lockup detector就在其中，它会检查上述hrtimer的中断次数(hrtimer\_interrupts)是否在保持递增，如果停滞则表明hrtimer中断未得到响应，也就是发生了hard lockup。

这里面，被watch的对象是hrtimer，而watchdog则是由 [PMU设备](https://zhida.zhihu.com/search?content_id=272340895&content_type=Article&match_order=1&q=PMU%E8%AE%BE%E5%A4%87&zhida_source=entity) 发起的NMI中断处理程序 watchdog\_overflow\_callback()

hardlockup的检测需要启动NMI watchdog。可以通过设置内核参数实现:

echo 1 > /proc/sys/kernel/nmi\_watchdog 1 在发生hardlockup情况下，如果我们需要系统panic，可以设置（默认已设定）

echo 1 > /proc/sys/kernel/hardlockup\_panic

## 2.2 用户态watchdog

**用户程序有可能占着临界资源无法释放，系统太忙，疲于响应各种中断，导致无法执行调度程序** 。这都可能导致系统无法正常使用。

在这种情况下，时钟中断和NMI中断仍然能够被响应，所以内核lockup检测机制无法检查出来。但由于系统已经无法正常工作，我们需要一种机制，一种用户态的watchdog，来检测这种系统挂起的状态，并作出相应的动作。

用户态watchdog，自然检测的对象是用户态的程序（是否能被调度）。这里面，基于硬件支持程度不同，我们分为hardware watchdog和software watchdog。后者简称softdog。

### 2.2.1 softdog

使用softdog很简单，只需要：

1. 安装 watchdog rpm
2. 启动softdog服务  
	\- `systemctl start softdog.service`

默认情况下，watchdog程序会通过softdog.ko创建一个叫做/dev/watchdog1的设备（timer 设备），并且定期往它写东西（用于更新时间戳）。

位于内核的softdog会模拟timer设备（通过时钟中断的方式模拟），并执行相应的中断处理例程，该例程的目的是检查timer 设备（即/dev/watchdog1）是否timeout。如果timeout，则执行相应动作（默认为panic）。

### 2.2.1 hardware watchdog

通过 [BMC实现](https://zhida.zhihu.com/search?content_id=272340895&content_type=Article&match_order=1&q=BMC%E5%AE%9E%E7%8E%B0&zhida_source=entity) 、通过 [iTCO实现](https://zhida.zhihu.com/search?content_id=272340895&content_type=Article&match_order=1&q=iTCO%E5%AE%9E%E7%8E%B0&zhida_source=entity)

## 3\. 硬件看门狗

## 3.1 硬件寄存器介绍

看门狗主要由 **寄存器、计数器和狗叫模块** 构成，通过寄存器对看门狗进行基本设置，计数器计算狗叫时间，狗叫模块决定看门狗超时后发出的中断或复位方式。

QOTOM Q300P自带硬件看门狗，由SuperIO芯片提供，这里简单实现一下看门狗的复位功能，只需要对看门狗的配置寄存器组和数据寄存器组进行操作。

**WDTCTRL:** Watch Dog Timer Control Register (Index=71h, Default=00h) 控制寄存器，主要是设置中断，这里不涉及

**WDTCONF:** Watch Dog Timer Configuration Register (Index=72h, Default=001s0000b) 配置寄存器 Bit6 or Bit4设置为1即可开启看门狗功能，这里使用Bit6脉冲信号

![](https://picx.zhimg.com/v2-74ae6fd13e27ebc28db30c2860a52fa3_1440w.jpg)

**WDTVALLSB:** Watch Dog Timer Time-out Value (LSB) Register (Index=73h, Default=38h) 低位数据寄存器 **WDTVALMSB:** Watch Dog Timer Time-out Value (MSB) Register (Index=74h, Default=00h) 高位数据寄存器

## 3.2 喂狗操作

samples/watchdog/watchdog-simple.c中有一个简单的例子：

```
int main(void)
{
    int fd = open("/dev/watchdog", O_WRONLY);
    int ret = 0;
    if (fd == -1) {
        perror("watchdog");
        exit(EXIT_FAILURE);
    }
    while (1) {
        ret = write(fd, "\0", 1);
        if (ret != 1) {
            ret = -1;
            break;
        }
        sleep(10);
    }
    close(fd);
    return ret;
}
```

## 3.3 watchdog硬件驱动编写

例如：drivers/watchdog/imx\_sc\_wdt.c中 imx\_sc\_wdt\_probe中会调用devm\_watchdog\_register\_device

```
#define DEFAULT_TIMEOUT 60
#define MAX_TIMEOUT 128

static int imx_sc_wdt_probe(struct platform_device *pdev)
{
    struct watchdog_device *wdog;
    struct device *dev = &pdev->dev;
    int ret;

    wdog = &imx_sc_wdd->wdd;
    wdog->info = &imx_sc_wdt_info;
    wdog->ops = &imx_sc_wdt_ops;
    wdog->min_timeout = 1;
    wdog->max_timeout = MAX_TIMEOUT;
    wdog->parent = dev;
    wdog->timeout = DEFAULT_TIMEOUT;
    
    ret = imx_sc_wdt_set_timeout(wdog, wdog->timeout);
    if (ret)
        return ret;
        
    return devm_watchdog_register_device(dev, wdog);
```

imx\_sc\_wdt\_ops的定义为：

```
static const struct watchdog_ops imx_sc_wdt_ops = {
    .owner = THIS_MODULE,
    .start = imx_sc_wdt_start,
    .stop  = imx_sc_wdt_stop,
    .ping  = imx_sc_wdt_ping,
    .set_timeout = imx_sc_wdt_set_timeout,
    .set_pretimeout = imx_sc_wdt_set_pretimeout,
};
```

例如imx\_sc\_wdt\_start的实现，使用了smc下发到BL31中处理，为了突出安全性。

```
static int imx_sc_wdt_start(struct watchdog_device *wdog)
{
    struct arm_smccc_res res;

    arm_smccc_smc(IMX_SIP_TIMER, IMX_SIP_TIMER_START_WDOG,
              0, 0, 0, 0, 0, 0, &res);
    if (res.a0)
        return -EACCES;

    arm_smccc_smc(IMX_SIP_TIMER, IMX_SIP_TIMER_SET_WDOG_ACT,
              SC_TIMER_WDOG_ACTION_PARTITION,
              0, 0, 0, 0, 0, &res);
    return res.a0 ? -EACCES : 0;
}
```

## 参考：

1. [qkxu.github.io/2019/04/](https://link.zhihu.com/?target=https%3A//qkxu.github.io/2019/04/15/linux%25E4%25B8%258B%25E7%259A%2584watchdog.html)
2. [minipc.netlify.app/post](https://link.zhihu.com/?target=https%3A//minipc.netlify.app/posts/fe902d45/)
3. [blog.csdn.net/ericstarm](https://link.zhihu.com/?target=https%3A//blog.csdn.net/ericstarmars/article/details/81750919)
4. [blog.csdn.net/weixin\_44](https://link.zhihu.com/?target=https%3A//blog.csdn.net/weixin_44410537/article/details/86708540)

> 后记：  
> 对于重要的驱动操作的寄存器，在ARM中需要放入BL31中，也就是说寄存器地址是在安全世界的，不能让内核直接按地址操作，只暴露了通用的协议接口，就是一个约束，只能这么用，其他用法不行。暴露API而不是所有寄存器是安全世界和非安全世界的一个重要区别。“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位自己有博客公众号的留言：申请转载，多谢！

后续会继续更新，纯干货分析，欢迎分享给朋友，欢迎点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-01 10:46・上海[有什么简单的库存管理软件？](https://www.zhihu.com/question/635557587/answer/1974413172032156202)

[

用表单大师搭建库存管理系统，低成本、高效率，个性化不怕踩雷，轻松实现生产、销售、库存、财务管理一体化。同时操作成本也不高，操作者往往只需要用户进行直观地拖、拉、拽、连线等...

](https://www.zhihu.com/question/635557587/answer/1974413172032156202)