---
title: "电源管理入门-6 CPUFreq"
source: "https://zhuanlan.zhihu.com/p/2022264001644471603"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "之前章节介绍的电源管理都都直接下电，不用电当然能节能，但是还有比较温柔的方法就是通过调节电压频率。比如经常的一个说法：CPU太热了跑不动了，快给降频下。频率就干活的速度，干活太快，CPU都要烧了，太热了，…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

4 人赞同了该文章

![](https://pic1.zhimg.com/v2-edf9f14538f8479e3c95f99ca2c1aa3c_1440w.jpg)

之前章节介绍的电源管理都都直接下电，不用电当然能节能，但是还有比较温柔的方法就是通过调节电压频率。比如经常的一个说法：CPU太热了跑不动了，快给降频下。频率就干活的速度，干活太快，CPU都要烧了，太热了，费电啊。但是在户外的设备，环境温度过高还是要考虑遮阳、通风来应对，但降频也可以降低温度，但是会引起卡顿啊。

> 一般电压和频率是成对出现的，也叫 [OPP](https://zhida.zhihu.com/search?content_id=272281611&content_type=Article&match_order=1&q=OPP&zhida_source=entity) （Operating Performance Points），对其进行调节也叫DVFS（Dynamic Voltage and Frequency Scaling），下面就来揭开这些技术的神秘面纱。

## 1\. 整体介绍

## 1.1 DVFS

![](https://pic2.zhimg.com/v2-1a9d3682a70179dac1e385bd8d16e461_1440w.jpg)

DVFS（Dynamic Voltage and Frequency Scaling）即动态电压频率调整。这项技术可以根据芯片运行的应用程序的计算需求制定策略，动态调整电压和频率：

- 在不需要高性能时，降低电压和频率，以降低功耗；
- 在需要高性能时，提高电压和频率，以提高性能，从而达到兼顾性能而又节能的目的。

DVFS技术利用了CMOS芯片的特性：CMOS芯片的能量消耗正比于电压的平方和时钟频率：

- 减少能量消耗需要降低电压和频率。
- 仅仅降低时钟频率并不节约能量，因为时钟频率的降低会带来任务执行时间的增加。调节电压需要以相同的比例调节频率以满足信号传播延迟要求。然而不管是电压调节还是频率调节，都会造成系统性能的损失，并增加系统的响应延迟。
- DVFS技术是以延长任务执行时间为代价来达到减少系统能量消耗的目的，体现了功耗与性能之间的权衡。可以通过减少时钟频率来降低通用处理器功耗的。

## 1.2 Linux 软件流程框图

[CPUFreq](https://zhida.zhihu.com/search?content_id=272281611&content_type=Article&match_order=1&q=CPUFreq&zhida_source=entity) 系统流程：

![](https://pic1.zhimg.com/v2-f56e17e31487bda4f8049845f2b79ed8_1440w.jpg)

1. 用户app可以使用/sys/devices/system/cpu/cpu0/cpufreq/下的接口文件设置cpu频率
2. 设置频率的时候会调用相关governor的函数，主要包括查询、设置等
3. governor负责采集与系统负载有关的信号，计算当前的系统负载。根据系统的当前负载，根据调节策略预测系统在下一时间段需要的性能。将预测的性能转换成需要的频率和电压在cpufreq table中选择一个，进行调整芯片的时钟和电压设置。
4. governor需要设置的时候会调用cpufreq core的接口 [cpufreq\_driver](https://zhida.zhihu.com/search?content_id=272281611&content_type=Article&match_order=1&q=cpufreq_driver&zhida_source=entity) ->target\_index进行设置
5. driver会继续调用opp驱动clk\_set\_rate(clk, freq)接口进行寄存器设置，让电压频率生效 另外：动态策略的governor会自动收集系统中的各种信号进行动态调节

DVFS调节策略 一味的降频降压当然是不能降低功耗的，因为低频下运行可能使系统处理任务的时长增加，从而整体上可能增加了功耗。所以DVFS的核心是动态调整的策略，其目的是根据当时的系统负载实时调整，从而提供满足当时性能要求的最低功率，也就达到了最低功耗。

需要统计出这些模块的负载情况，基本的策略当然是工作负载增加则升频升压，工作负载降低则降频降压。工作负载的粗略模型是在一个时间窗口内，统计模块工作的时间长度，设定不同阈值，高阈值对应高电压高频率，低阈值对应低电压低频率。每次统计值穿过阈值边界，触发DVFS转换。

![](https://pic4.zhimg.com/v2-ffd70d2a2036be4daa4ad027453bd7e9_1440w.jpg)

\> 在调整频率和电压时，要特别注意调整的顺序： > - 当频率由高到低调整时，应该先降频率，再降电压； > - 相反，当升高频率时，应该先升电压，再升频率。

## 2\. 相关代码介绍

## 2.1 整体代码框架

内核目前有一套完整的代码支持DVFS，具体可参考内核下drivers/cpufreq/。

![](https://pic3.zhimg.com/v2-90350b5ab963b36ef784b944799f6f08_1440w.jpg)

image.png

1. cpufreq core：是cpufreq framework的核心模块，和kernel其它framework类似，主要实现三类功能：
- 向上，以sysfs的形式向用户空间提供统一的接口，以notifier的形式向其它driver提供频率变化的通知。
- 内部，抽象调频调压的公共逻辑和接口，主要围绕struct cpufreq\_driver、struct [cpufreq\_policy](https://zhida.zhihu.com/search?content_id=272281611&content_type=Article&match_order=1&q=cpufreq_policy&zhida_source=entity) 和struct cpufreq\_governor三个数据结构进行。包括:围绕结构struct cpufreq\_governor提供governor框架，用于实现不同的频率调整机制；围绕struct cpufreq\_policy实现的一些功能等。
- 向下：提供CPU频率和电压控制的驱动框架，封装通用操作接口给驱动，方便底层驱动的开发；
1. cpufreq governor：负责调频调压的各种策略，每种governor计算频率的方式不同，根据提供的频率范围和参数(阈值等)，计算合适的频率。
2. cpufreq driver：负责平台相关的调频调压机制的实现，基于cpu subsystem driver、OPP、clock driver、regulator driver等模块，提供对CPU频率和电压的控制。kernel中实现了比较通用的驱动模块cpufreq-dt.c
3. cpufreq stats：负责调频信息和各频点运行时间等统计，提供每个cpu的cpufreq有关的统计信息。

## 2.2 用户态接口

cpufreq相关驱动模块加载后，会在各cpu下创建：/sys/devices/system/cpu/cpuX/cpufreq接口

![](https://pica.zhimg.com/v2-abc1a921a19158c9dfb96df66694a6c2_1440w.jpg)

这是一个软链接：cpufreq ->../cpufreq/policy0

![](https://picx.zhimg.com/v2-cecee54b731bc3edda4f75bdc9856f09_1440w.jpg)

![](https://pic1.zhimg.com/v2-f1da59dea9a46ccde2fd17a39e57ac70_1440w.jpg)

image.png

前缀是scaling的属性文件表示软件可调节的几种属性，前缀是cpuinfo的属性文件表示硬件支持的几种属性。cpuinfo是scaling的子集，因为软件设置范围在硬件支持范围内。 scaling\_governor 可以手动修改设置：

```
echo ondemand > /sys/devices/system/cpu/cpu0/scaling_governor
```

一般系统启动默认为performance，支持5种模式，可以通过make menuconfig配置。

目前DVFS支持调频调压策略主要就是上面支持的5种：

1. **userspace** （用户定义的） 使用用户在/sys 节点scaling\_setspeed设置的频率运行。 最早的 cpufreq 子系统通过 userspace governor 为用户提供了这种灵活性。系统将变频策略的决策权交给了用户态应用程序，并提供了相应的接口供用户态应用程序调节 CPU 运行频率使用。 （可以使用Dominik 等人开发了cpufrequtils 工具包 ）
2. **performance** cpu（突出性能） 按照支持的最高频率运行
3. **ondemand** （按需的） 系统负载小时以低频率运行，系统负载提高时按需提高频率 userspace是内核态的检测，效率低。而ondemand正是人们长期以来希望看到的一个完全在内核态下工作并且能够以更加细粒度的时间间隔对系统负载情况进行采样分析的governor。
4. **conservative** （保守的） 跟ondemand方式类似， 不同之处在于提高频率时渐进提高，而ondemand是跳变提高，ondemand比conservative先进，是conservative的改良版本。 ondemand governor 的最初实现是在可选的频率范围内调低至下一个可用频率。这种降频策略的主导思想是尽量减小对系统性能的负面影响，从而不会使得系统性能在短时间内迅速降低以影响用户体验。但是在 ondemand governor 的这种最初实现版本在社区发布后，大量用户的使用结果表明这种担心实际上是多余的， ondemand governor在降频时对于目标频率的选择完全可以更加激进。因此最新的 ondemand governor 在降频时会在所有可选频率中一次性选择出可以保证 CPU 工作在 80% 以上负荷的频率，当然如果没有任何一个可选频率满足要求的话则会选择 CPU 支持的最低运行频率。大量用户的测试结果表明这种新的算法可以在不影响系统性能的前提下做到更高效的节能。在算法改进后， ondemand governor 的名字并没有改变，而 ondemand governor 最初的实现也保存了下来，并且由于其算法的保守性而得名conservative 。 Ondemand降频更加激进，conservative降频比较缓慢保守，事实使用ondemand的效果也是比较好的。
5. **powersave** cpu（省电的） 以支持的最低频率运行 CPU会固定工作在其支持的最低运行频率上。因此其和performance这两种 governors 都属于静态 governor ，即在使用它们时 CPU 的运行频率 **不会根据系统运行时负载的变化动态作出调整** 。这两种 governors 对应的是两种极端的应用场景，使用 performance governor 体现的是对系统高性能的最大追求，而使用 powersave governor 则是对系统低功耗的最大追求。
6. **[schedutil](https://zhida.zhihu.com/search?content_id=272281611&content_type=Article&match_order=1&q=schedutil&zhida_source=entity)** ：通过将自己的调频策略 **注册到hook** ，在负载发生变化的时候，会调用该hook，此时就可以进行调频决策或执行调频动作。前面的调频策略都是 **周期采样** 计算cpu负载有滞后性，精度也有限，而schedutil可以使用PELT(per entity load tracking)或者WALT(window assist load tracking)准确的计算task的负载。如果支持fast\_switch的功能，可以在中断上下文直接进行调频。

**功耗：performance > ondemand > conservative >powersave**

## 2.3 主要数据结构

![](https://pic4.zhimg.com/v2-909d1f61a78edb7a95a30aa10f74379d_1440w.jpg)

image.png

### 2.3.1 驱动相关cpufreq\_driver

在include/linux/cpufreq.h中，用于描述cpufreq的驱动，是驱动工程师最关注的结构。如下默认值：

```
static struct cpufreq_driver dt_cpufreq_driver = {
        .flags = CPUFREQ_STICKY | CPUFREQ_NEED_INITIAL_FREQ_CHECK,
        .verify = cpufreq_generic_frequency_table_verify,
        .target_index = set_target,
        .get = cpufreq_generic_get,
        .init = cpufreq_init,
        .exit = cpufreq_exit,
        .ready = cpufreq_ready,
        .name = "cpufreq-dt",
        .attr = cpufreq_dt_attr,
        .suspend = cpufreq_generic_suspend,
};
```
- name，该driver的名字，需要唯一，因为cpufreq framework允许同时注册多个driver，用户可以根据实际情况选择使用哪个driver。driver的标识，就是name。
- flags，一些flag，具体会在后续的文章中介绍。 init，driver的入口，由cpufreq core在设备枚举的时候调用，driver需要根据硬件情况，填充policy的内容。
- verify，验证policy中的内容是否符合硬件要求。它和init接口都是必须实现的接口。
- setpolicy，driver需要提供这个接口，用于设置CPU core动态频率调整的范围（即policy）。
- target、target\_index，driver需要实现这两个接口中的一个（target为旧接口，不推荐使用），用于设置CPU core为指定频率（同时修改为对应的电压）。target\_index（）接口底层真正用于设置cpu为指定频率的接口（同时修改为对应的电压）

有关struct cpufreq\_driver的API包括：

分别为driver的注册、注销。获取当前所使用的driver名称，以及该driver的私有数据结构（driver\_data字段）。

### 2.3.2 策略相关cpufreq\_policy

linux使用cpufreq policy来抽象cpu设备的调频调压功能，用于描述不同的policy，包含频率表、cpuinfo等各种信息，并且每个policy都会对应某个具体的governor。

min/max frequency，调频范围，对于可以自动调频的CPU而言，只需要这两个参数就够了。 current frequency和governor，对于不能自动调频的CPU，需要governor设置具体的频率值。下面介绍一下governor。 struct cpufreq\_policy不会直接对外提供API。

### 2.3.3 管理策略cpufreq\_governor

不同policy的管理策略，根据使用场景的不同，会有不同的调频调压策略。如下一个governor的默认值：

```
static struct cpufreq_governor cpufreq_gov_userspace = {
        .name                 = "userspace",
        .init                 = cpufreq_userspace_policy_init,
        .exit                 = cpufreq_userspace_policy_exit,
        .start                = cpufreq_userspace_policy_start,
        .stop                 = cpufreq_userspace_policy_stop,
        .limits               = cpufreq_userspace_policy_limits,
        .store_setspeed       = cpufreq_set,
        .show_setspeed        = show_speed,
        .owner                = THIS_MODULE,
};
```
- name，该governor的名称。
- governor，用于governor状态切换的回调函数。
- show\_setspeed、store\_setspeed，用于提供sysfs “setspeed” attribute文件的回调函数。
- max\_transition\_latency，该governor所能容忍的最大频率切换延迟。
- cpufreq governors主要向具体的governor模块提供governor的注册和注销接口

## 2.2 初始化流程

![](https://pic4.zhimg.com/v2-c5ca5a01922fddc3846a70ac4f5aed95_1440w.jpg)

image.png

### 2.2.1 governor注册

cpufreq\_register\_governor 如果policy中有默认的governor，则调用find\_governor，在列表中寻找。cpufreq core定义了一个全局链表变量：cpufreq\_governor\_list，注册函数首先根据governor的名称，通过\_\_find\_governor()函数查找该governor是否已经被注册过，如果没有被注册过，则把代表该governor的结构体添加到cpufreq\_governor\_list链表中。

系统中可以同时存在多个governor，policy通过cpufreq\_policy->governor指针和某个governor相关联。要想一个governor能够被使用，首先要把该governor注册到cpufreq framework中。例如：

```
static int __init cpufreq_gov_userspace_init(void)
{
        return cpufreq_register_governor(&cpufreq_gov_userspace);
}

#ifdef CONFIG_CPU_FREQ_DEFAULT_GOV_USERSPACE
struct cpufreq_governor *cpufreq_default_governor(void)
{
        return &cpufreq_gov_userspace;
}

fs_initcall(cpufreq_gov_userspace_init);
```

注册的gov定义为：

```
static struct cpufreq_governor cpufreq_gov_userspace = {
        .name                = "userspace",
        .init                = cpufreq_userspace_policy_init,
        .exit                = cpufreq_userspace_policy_exit,
        .start                = cpufreq_userspace_policy_start,
        .stop                = cpufreq_userspace_policy_stop,
        .limits                = cpufreq_userspace_policy_limits,
        .store_setspeed        = cpufreq_set,
        .show_setspeed        = show_speed,
        .owner                = THIS_MODULE,
};
```

### 2.2.2 cpufreq驱动发现注册

dt\_cpufreq\_probe（）在drivers/cpufreq/cpufreq-dt.c中 系统启动的时候平台驱动dt\_cpufreq\_platdrv，会执行prob函数dt\_cpufreq\_probe（）

```
static struct cpufreq_driver dt_cpufreq_driver = {
        .flags = CPUFREQ_STICKY | CPUFREQ_NEED_INITIAL_FREQ_CHECK,
        .verify = cpufreq_generic_frequency_table_verify,
        .target_index = set_target,
        .get = cpufreq_generic_get,
        .init = cpufreq_init,
        .exit = cpufreq_exit,
        .ready = cpufreq_ready,
        .name = "cpufreq-dt",
        .attr = cpufreq_dt_attr,
        .suspend = cpufreq_generic_suspend,
};
```

cpufreq\_register\_driver(&dt\_cpufreq\_driver)，在drivers/cpufreq/cpufreq.c中 cpufreq\_register\_driver为cpufreqdriver注册的入口，驱动程序通过调用该函数进行初始化，并传入相关的struct cpufreq\_driver，cpufreq\_register\_driver会调用subsys\_interface\_register，入参为：

```
static struct subsys_interface cpufreq_interface = {
        .name                = "cpufreq",
        .subsys                = &cpu_subsys,
        .add_dev        = cpufreq_add_dev,
        .remove_dev        = cpufreq_remove_dev,
};
```

最终执行回调函数cpufreq\_add\_dev。

### 2.2.3 CPU subsys注册

kernel将cpu都抽象成device，并抽象出cpu\_subsys bus，所有cpu都挂载在这个bus下。每个bus都包含一个struct subsys\_private结构的成员p，该结构包括一个interface list成员interfaces和设备链表klist\_devices。interface list上的一个interface通常用于抽象bus下的一个功能。

cpufreq是CPU device的一类特定功能，也就被抽象为一个subsys interface(kernel使用struct subsys\_interface结构表示)即变量cpufreq\_interface，, 挂载在interface list下。cpufreq作为一个功能挂载到cpu subsys下后会对相应的所有设备即cpu执行interface.add\_dev()操作，表示对subsys\_private支持的设备都添加这个功能，在添加这个功能时为每个cpu设备生成具体的policy结构，即struct cpufreq\_policy.

![](https://pic4.zhimg.com/v2-c5ca5a01922fddc3846a70ac4f5aed95_1440w.jpg)

上图涉及cpu初始化，在系统启动的时候：

```
//drivers/base/cpu.c
register_cpu
    cpu->dev.bus = &cpu_subsys;
    device_register
        device_add
            bus_add_device
                error = device_add_groups(dev, bus->dev_groups);//向总线注册设备
                klist_add_tail(&dev->p->knode_bus, &bus->p->klist_devices);//向subsys_private
```

回到cpureq流程中，subsys\_interface\_register（），在drivers/base/bus.c中

```
mutex_lock(&subsys->p->mutex);
list_add_tail(&sif->node, &subsys->p->interfaces);
if (sif->add_dev) {
        subsys_dev_iter_init(&iter, subsys, NULL, NULL);
        while ((dev = subsys_dev_iter_next(&iter)))
                sif->add_dev(dev, sif);
        subsys_dev_iter_exit(&iter);
}
mutex_unlock(&subsys->p->mutex);
```

这里可以看到对于多核，都执行了cpufreq\_add\_dev，会为cpu device创建struct cpufreq\_policy结构。 cpufreq\_add\_dev（），在drivers/cpufreq/cpufreq.c中

```
static int cpufreq_add_dev(struct device *dev, struct subsys_interface *sif)
{
        struct cpufreq_policy *policy;
        unsigned cpu = dev->id;
        int ret;

        if (cpu_online(cpu)) {
                ret = cpufreq_online(cpu);
                if (ret)
                        return ret;
        }

        /* Create sysfs link on CPU registration */
        policy = per_cpu(cpufreq_cpu_data, cpu);
        if (policy)
                add_cpu_dev_symlink(policy, cpu);

        return 0;
}
```

### 3.2.4 CPU上线设置

cpufreq\_online(cpu)在drivers/cpufreq/cpufreq.c中

```
•    cpufreq_policy_alloc（）创建policy节点/sys/devices/system/cpu/cpufreq/*
•    cpufreq_driver->init(policy)指向cpufreq_init（）
•    cpufreq_add_dev_interface（）创建sysfs节点的一些可选属性
•    cpufreq_init_policy（）初始化policy的governor
```

cpufreq\_driver->init对应cpufreq\_init（）函数 这个函数会解析cpu信息得到cpu\_dev、cpu\_clk、opp\_table等

```
cpu_dev = get_cpu_device(policy->cpu);
cpu_clk = clk_get(cpu_dev, NULL);
ret = dev_pm_opp_of_get_sharing_cpus(cpu_dev, policy->cpus);//多CPU共享
opp_table = dev_pm_opp_set_regulators(cpu_dev, &name, 1);

priv->reg_name = name;
priv->opp_table = opp_table;

priv->cpu_dev = cpu_dev;
policy->driver_data = priv;
policy->clk = cpu_clk;

policy->suspend_freq = dev_pm_opp_get_suspend_opp_freq(cpu_dev) / 1000;

ret = cpufreq_table_validate_and_show(policy, freq_table);
```

cpufreq\_table\_validate\_and\_show（）里面找到CPU支持的最大和最小频率

```
int cpufreq_frequency_table_cpuinfo(struct cpufreq_policy *policy,
                                    struct cpufreq_frequency_table *table)
{
        struct cpufreq_frequency_table *pos;
        unsigned int min_freq = ~0;
        unsigned int max_freq = 0;
        unsigned int freq;

        cpufreq_for_each_valid_entry(pos, table) {
                freq = pos->frequency;

                if (!cpufreq_boost_enabled()
                    && (pos->flags & CPUFREQ_BOOST_FREQ))
                        continue;

                pr_debug("table entry %u: %u kHz\n", (int)(pos - table), freq);
                if (freq < min_freq)
                        min_freq = freq;
                if (freq > max_freq)
                        max_freq = freq;
        }

        policy->min = policy->cpuinfo.min_freq = min_freq;
        policy->max = policy->cpuinfo.max_freq = max_freq;

        if (policy->min == ~0)
                return -EINVAL;
        else
                return 0;
}
```

设置policy的时候，会读取cpu的频率表，赋值给policy->min和policy->max。另外各种governor也用到frequency table。

frequency table是CPU core可以正确运行的一组频率/电压组合，之所以存在的一个思考点是：table是频率和电压之间的一个一一对应的组合，因此cpufreq framework只需要关心频率，所有的策略都称做“调频”策略。而cpufreq driver可以在“调频”的同时，通过table取出和频率对应的电压，进行修改CPU core电压，实现“调压”的功能，这简化了设计。 例如在DTS中：

![](https://pic3.zhimg.com/v2-1141806426205d3614d474bdbeaa2b06_1440w.jpg)

![](https://pic3.zhimg.com/v2-e5c0564b6fbb382ca3cc73ff2b82bba4_1440w.jpg)

### 2.2.5 策略初始化

cpufreq\_init\_policy（），drivers/cpufreq/cpufreq.c在 使用默认策略初始化policy

```
/* Update governor of new_policy to the governor used before hotplug */
gov = find_governor(policy->last_governor);
if (gov) {
        pr_info("dddd Restoring governor %s for cpu %d\n",
                        policy->governor->name, policy->cpu);
} else {
        gov = cpufreq_default_governor();
        if (!gov)
                return -ENODATA;
}

new_policy.governor = gov;

/* set default policy */
return cpufreq_set_policy(policy, &new_policy);
```

如果policy中有默认的governor，则调用find\_governor，在列表中寻找。cpufreq core定义了一个全局链表变量：cpufreq\_governor\_list，注册函数首先根据governor的名称，通过\_\_find\_governor()函数查找该governor是否已经被注册过，如果没有被注册过，则把代表该governor的结构体添加到cpufreq\_governor\_list链表中。

系统中可以同时存在多个governor，policy通过cpufreq\_policy->governor指针和某个governor相关联。要想一个governor能够被使用，首先要把该governor注册到cpufreq framework中。例如：

```
fs_initcall(cpufreq_gov_performance_init);
static int __init cpufreq_gov_performance_init(void)
{
        return cpufreq_register_governor(&cpufreq_gov_performance);
}
```

这里我们默认使用default

```
#ifdef CONFIG_CPU_FREQ_DEFAULT_GOV_PERFORMANCE
struct cpufreq_governor *cpufreq_default_governor(void)
{
        return &cpufreq_gov_performance;
}
#endif
static struct cpufreq_governor cpufreq_gov_performance = {
        .name                = "performance",
        .owner                = THIS_MODULE,
        .limits                = cpufreq_gov_performance_limits,
};
```

最后调用cpufreq\_set\_policy(policy, &new\_policy);去设置policy

### 2.2.6 governor初始化

cpufreq\_set\_policy（），在drivers/cpufreq/cpufreq.c中

```
cpufreq_init_governor->policy->governor->init(policy);

cpufreq_start_governor->policy->governor->start(policy);
```

在governor初始化和启动的时候会发生：CPUFreq通知 CPUFreq子系统会发出通知的情况有两种：CPUFreq的策略变化或者CPU运行频率变化。

在策略变化的过程中，例如cpufreq\_set\_policy函数中，会发送3次通知：

1. CPUFREQ\_ADJUST：所有注册的notifier可以根据硬件或者温度的情况去修改范围（即policy->min和policy->max）；
2. CPUFREQ\_INCOMPATIBLE：除非前面的策略设定可能会导致硬件出错，否则被注册的notifier不能改变范围等设定；
3. CPUFREQ\_NOTIFY：所有注册的notifier都会被告知新的策略已经被设置。

在频率变化的过程中，例如\_\_cpufreq\_notify\_transition函数中，会发送2次通知：

1. CPUFREQ\_PRECHANGE：准备进行频率变更；
2. CPUFREQ\_POSTCHANGE：已经完成频率变更。
```
/* notification of the new policy */
        blocking_notifier_call_chain(&cpufreq_policy_notifier_list,
                        CPUFREQ_NOTIFY, new_policy);
cpufreq_policy_notifier_list
```

cpufreq\_register\_notifier（）函数注册这个链表

### 3.2.6 设置热插拔计算机状态的回调函数

cpuhp\_setup\_state\_nocalls\_cpuslocked（）： 参数说明：

```
__cpuhp_setup_state_cpuslocked(
CPUHP_AP_ONLINE_DYN, "cpufreq:online", false, 
cpuhp_cpufreq_online,cpuhp_cpufreq_offline, false);

* __cpuhp_setup_state_cpuuslocked—设置热插拔计算机状态的回调函数
* @state:要设置的状态
* @invoke:如果为true，启动函数将被调用于cpu，cpu state >= @state
* @startup:启动回调函数
* @teardown: teardown回调函数
* @multi_instance:状态是为多个实例设置的，然后添加。
```

## 2.3 userspace governor

![](https://pic1.zhimg.com/v2-4465e41198b9058d5c2742240520cef4_1440w.jpg)

image.png

用户空间监控CPUFreq流程图

\### 2.3.1 用户接口说明 userspace governor是一种用户可以自己手动调整自己cpu频率的governor，即在linux目录下：/sys/devices/system/cpu/cpu0/cpufreq/，有一个参数scaling\_setspeed，是这个governor转有的，其他governor是不能对其进行读写操作的，只有这个governor才能这样做。

![](https://pic3.zhimg.com/v2-ebff773243542340696fbdafff2f2312_1440w.jpg)

对应底层有处理函数，设置也有处理函数。

### 2.3.2 配置说明

默认是Performance的策略，我们可以通过make menuconfig选择，如下：

![](https://picx.zhimg.com/v2-eabd9fba81418be8d706dd88f21c735b_1440w.jpg)

保存后在.config中可以看到

```
CONFIG_CPU_FREQ_DEFAULT_GOV_USERSPACE=y
```

在代码里面搜索这个宏，drivers/cpufreq/cpufreq\_userspace.c中：

```
#ifdef CONFIG_CPU_FREQ_DEFAULT_GOV_USERSPACE
struct cpufreq_governor *cpufreq_default_governor(void)
{
        return &cpufreq_gov_userspace;
}
```

### 2.3.3 回调函数介绍

cpufreq\_gov\_userspace对应

```
static struct cpufreq_governor cpufreq_gov_userspace = {
        .name                = "userspace",
        .init                = cpufreq_userspace_policy_init,
        .exit                = cpufreq_userspace_policy_exit,
        .start                = cpufreq_userspace_policy_start,
        .stop                = cpufreq_userspace_policy_stop,
        .limits                = cpufreq_userspace_policy_limits,
        .store_setspeed        = cpufreq_set,
        .show_setspeed        = show_speed,
        .owner                = THIS_MODULE,
};
```

可以看到其中有init函数和start函数。 cpufreq\_userspace\_policy\_init 申请一个governor\_data

```
policy->governor_data = setspeed;
cpufreq_userspace_policy_start 设置policy的cur频率
*setspeed = policy->cur;
cpufreq_userspace_policy_limits 就是约束性检查，如果超过max或者小于min进行重新设定

show_setspeed   就是读scaling_setspeed-当前cpu频率
store_setspeed   就是写scaling_setspeed，可以用户控制。改变cpu频率的时候会调用如下函数：

ret = __cpufreq_driver_target(policy, freq, CPUFREQ_RELATION_L);
```

### 2.3.4 调频调压流程

例如输入命令：

```
echo 700000 > /sys/devices/system/cpu/cpu0/cpufreq/scaling_setspeed
```

\_\_cpufreq\_driver\_target->\_\_target\_index->cpufreq\_driver->target\_index

```
static int set_target(struct cpufreq_policy *policy, unsigned int index)
{
        struct private_data *priv = policy->driver_data;

        return dev_pm_opp_set_rate(priv->cpu_dev,
                                   policy->freq_table[index].frequency * 1000);
}
```

dev\_pm\_opp\_set\_rate（）函数在drivers/base/power/opp/core.c中定义 找到opp\_table进行调频调压，opp\_table的名字是/cpus/cpu0\_opp\_table

```
opp_table = _find_opp_table(dev);
      
      clk = opp_table->clk;
      freq = clk_round_rate(clk, target_freq);
      if ((long)freq <= 0)
              freq = target_freq;

      old_freq = clk_get_rate(clk);
      
ret = _generic_set_opp_clk_only(dev, clk, old_freq, freq);
```

clk\_set\_rate(clk, freq);在drivers/clk/clk.c中定义

```
ret = clk_core_set_rate_nolock(clk->core, rate);
```

clk的名字是，rate是要设置的频率

```
/* change the rates */
clk_change_rate(top);
```

top的名字为cpu\_core0\_mux\_clk，节点父子关系为：

```
armpll1_912m_cpu_clk->cpu_core0_mux_clk->cpu_core0_div_clk->cpu_core0_clk
首先设置armpll1_912m_cpu_clk
clk_change_rate（）
core->ops->set_parent(core->hw, core->new_parent_index);
set_parent对应clk_mux_set_parent（）函数在drivers/clk/clk-mux.c中
```

static int clk\_mux\_set\_parent(struct clk\_hw \*hw, u8 index) { struct clk\_mux \*mux = to\_clk\_mux(hw);

```
val = clk_readl(mux->reg);
    val &= ~(mux->mask << mux->shift);

    val |= index << mux->shift;
    clk_writel(val, mux->reg);
mux->reg值是0x42000020，index是4，clk_readl出来是默认值5，需要写入为4
 

cpu_core0_div_clk进行了频率设置
clk_change_rate
core->ops->set_rate(core->hw, core->new_rate, best_parent_rate);
```

const struct clk\_ops clk\_divider\_ops = {.recalc\_rate = clk\_divider\_recalc\_rate,.round\_rate = clk\_divider\_round\_rate,.set\_rate = clk\_divider\_set\_rate, };

```
clk_divider_set_rate
```

static int clk\_divider\_set\_rate(struct clk\_hw \*hw, unsigned long rate, unsigned long parent\_rate) { value = divider\_get\_val(rate, parent\_rate, divider->table, divider->width, divider->flags);

```
if (divider->flags & CLK_DIVIDER_HIWORD_MASK) {
        val = div_mask(divider->width) << (divider->shift + 16);
} else {
        val = clk_readl(divider->reg);
        val &= ~(div_mask(divider->width) << divider->shift);
}

val |= (u32)value << divider->shift;
clk_writel(val, divider->reg);
```

其中divider->reg为0x42000020,value=0 divider->shift的值为8 clk\_readl(divider->reg);读出来值为4已经是要设置的值了。

## 2.4 其他governor

### 2.4.1 ondemand governor

ondemand governor，最终是通过调频接口od\_dbs\_update实现计算负载进行调频的。

```
//drivers/cpufreq/cpufreq_ondemand.c
od_dbs_update
        od_update

static void od_update(struct cpufreq_policy *policy)
{
        unsigned int load = dbs_update(policy);//负载(百分比)(1)
        
        /* Check for frequency increase */
        if (load > dbs_data->up_threshold) {//（2）如果负载大于策略设置的阈值，则直接切换到最大频率
                /* If switching to max speed, apply sampling_down_factor */
                if (policy->cur < policy->max)
                        policy_dbs->rate_mult = dbs_data->sampling_down_factor;
                dbs_freq_increase(policy, policy->max);
        } else {
                /* Calculate the next frequency proportional to load */
                unsigned int freq_next, min_f, max_f;

                min_f = policy->cpuinfo.min_freq;
                max_f = policy->cpuinfo.max_freq;
                freq_next = min_f + load * (max_f - min_f) / 100;
                                //（3）按照负载百分比，在频率范围内选择合适频率

                /* No longer fully busy, reset rate_mult */
                policy_dbs->rate_mult = 1;

                if (od_tuners->powersave_bias)//(4)
                        freq_next = od_ops.powersave_bias_target(policy,
                                                                 freq_next,
                                                                 CPUFREQ_RELATION_L);

                __cpufreq_driver_target(policy, freq_next, CPUFREQ_RELATION_C);//设置频率
        }
```

(1)计算负载函数： od\_dbs\_update（）核心方法是: 当前负载load = 100 \* (time\_elapsed - idle\_time) / time\_elapsed idle\_time = 本次idle时间 - 上次idle时间 time\_elapsed = 本次总运行时间 - 上次总运行时间 该函数返回使用此policy的各个cpu中的最大负载。

（2）当最大负载大于策略设置的最大阈值时，调用dbs\_freq\_increase（）将频率设置在最大频率。

（3）按照负载百分比设置合适频率 freq\_next = min\_f + load \* (max\_f - min\_f) / 100;

(4) 表明我们为了进一步节省电力，我们希望在计算出来的新频率的基础上，再乘以一个powersave\_bias设定的百分比，作为真正的运行频率，powersave\_bias的值从0-1000，每一步代表0.1%

### 2.4.2 schedutil governor

![](https://pic3.zhimg.com/v2-7b5adac76f328824535fe6add9fa715c_1440w.jpg)

不同的governor的触发调频调压流程不一样，这里以schedutil governor为例。 CFS负载变化的时候或者RT、DL任务状态更新的时候，就会启动调频。这几个scheduler类会调用cpufreq\_update\_util函数（前面注册进来的hook函数）触发schedutil工作。每个cpu最终会回调到sugov\_upate\_shared或者sugov\_upate\_single函数中的一个。 由于是从scheduler里直接调用下来的，最终执行调频切换时，无论是快速路径触发的简单写寄存器，还是慢速路径触发的kthread都不会占用过多时间或者调度开销。

### 2.4.3 Interactive governor

Interactive 与Conservative相对，快速提升频率，缓慢降低频率

- 优点: 比Ondemand稍强的性能，较快的响应速度
- 缺点: 在不需要时仍然维持较高的频率，比Ondemand耗电 Interactive X 基于Interactive改进，区分开关屏状态情景
- 优点：比Interactive省电
- 缺点：稳定性不如Interactive 代码位置：drivers/cpufreq/cpufreq\_interactive.c 首先需要定义一个cpufreq\_governor类型的结构体用来描述interactive governor.
```
static struct interactive_governor interactive_gov = {
        .gov = {
                .name                        = "interactive",
                .max_transition_latency        = TRANSITION_LATENCY_LIMIT,
                .owner                        = THIS_MODULE,
                .init                        = cpufreq_interactive_init,
                .exit                        = cpufreq_interactive_exit,
                .start                        = cpufreq_interactive_start,
                .stop                        = cpufreq_interactive_stop,
                .limits                        = cpufreq_interactive_limits,
        }
};
```

> 后记  
> 本节代码有点多，不是调试这个可以不用关注代码，想深入学习还是需要运行起来代码打点log比较好。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

后续会继续更新，纯干货分析，欢迎分享给朋友，欢迎评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-03-31 10:49・上海[千元NAS入门首选？绿联DH4300Plus使用体验全解析，内含NAS选购建议](https://zhuanlan.zhihu.com/p/1964042339514315618)

[

一、引言提到NAS，很多人第一反应是“贵”。 大部分品牌的空盘版NAS动辄2000元以上，要是再加上一个4T硬盘，...

](https://zhuanlan.zhihu.com/p/1964042339514315618)