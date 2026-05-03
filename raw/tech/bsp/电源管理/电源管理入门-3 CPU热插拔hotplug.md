---
title: "电源管理入门-3 CPU热插拔hotplug"
source: "https://zhuanlan.zhihu.com/p/2022262799364101416"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "之前介绍了电源的 开机和关机重启，本小节开始介绍省电的技术，其中最暴力的省电方法就是直接拔核hotplug处理，就像需要10个人干活都要吃饭，但是现在活少了最节省的方法就是砍掉几个人，有点像裁员啊。1. 省电技…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

3 人赞同了该文章

![](https://pic4.zhimg.com/v2-d25d179549b5ecdd6dd609bbcea30aa1_1440w.jpg)

之前介绍了电源的 **开机** 和 **关机重启** ，本小节开始介绍 **省电** 的技术，其中最暴力的省电方法就是直接 **拔核hotplug** 处理，就像需要10个人干活都要吃饭，但是现在活少了最节省的方法就是砍掉几个人，有点像 **裁员** 啊。

### 1\. 省电技术概览

![](https://pic3.zhimg.com/v2-d98c191e8bc1e5a8acbac5ed00abb868_1440w.jpg)

对于省电，我们短时间不使用设备的时候可以进行 **休眠唤醒** ，长时间不使用就直接 **关机** 了。在使用设备的时候可以按照当前需要的性能进行调频处理就是 **[CPUFreq](https://zhida.zhihu.com/search?content_id=272281208&content_type=Article&match_order=1&q=CPUFreq&zhida_source=entity)** 和 **[DevFeq](https://zhida.zhihu.com/search?content_id=272281208&content_type=Article&match_order=1&q=DevFeq&zhida_source=entity)** ，当没重度使用或者只运行系统必须进程的时候可以进行CPU休闲(**[CPUIdle](https://zhida.zhihu.com/search?content_id=272281208&content_type=Article&match_order=1&q=CPUIdle&zhida_source=entity)**)、 [CPU热插拔](https://zhida.zhihu.com/search?content_id=272281208&content_type=Article&match_order=1&q=CPU%E7%83%AD%E6%8F%92%E6%8B%94&zhida_source=entity) (**CPU Hotplug**)、CPU隔离(**Core Isolate**)和动态PM(**[Runtime PM](https://zhida.zhihu.com/search?content_id=272281208&content_type=Article&match_order=1&q=Runtime+PM&zhida_source=entity)**)。

- **CPUIdle** 指的是当某个CPU上没有进程可调度的时候可以暂时局部关掉这个CPU的电源，从而达到省电的目的，当再有进程需要执行的时候再恢复电源。
- **CPU Hotplug** 指的是我们可以把某个CPU热移除，然后系统就不会再往这个CPU上派任务了，这个CPU就可以放心地完全关闭电源了，当把这个CPU再热插入之后，就对这个CPU恢复供电，这个CPU就可以正常执行任务了。
- **CPU隔离** 指的是我们把某个CPU隔离开来，系统不再把它作为进程调度的目标，这样这个CPU就可以长久地进入Idle状态了，达到省电的目的。不过CPU隔离并不是专门的省电机制，我们把CPU隔离之后还可以通过set\_affinity把进程专门迁移到这个CPU上，这个CPU还会继续运行。CPU隔离能达到一种介于CPUIdle和CPU热插拔之间的效果。
- **Runtime PM** 指的是设备的动态电源管理，系统中存在很多设备，但是并不是每种设备都在一直使用，比如相机可能在大部分时间都不会使用，所以我们可以在大部分时间把相机的电源关闭，在需用相机的时候，再给相机供电。

> cpu hotplug和idle的区别？  
> hotplug是从硬件上拔掉核下电，idle只是从软件上进行处理，也就是说调度器在idle时只是不去调用但是核还是可见的，hotplug直接没这个核了，软件完全不可见。

省电管理可以达到省电的目的，但是也会降低系统的性能，包括响应延迟、带宽、吞吐量等。所以内核又提供了一个 **[PM QoS](https://zhida.zhihu.com/search?content_id=272281208&content_type=Article&match_order=1&q=PM+QoS&zhida_source=entity)** 框架，QoS是Quality Of Service(服务质量)。PM QoS框架一面向顾客提供接口，顾客可以通过这些接口对系统的性能提出要求，一面向各种省电机制下发要求，省电机制在省电的同时也要满足这些性能要求。PM QoS的顾客包括内核和进程：对于内核，PM QoS提供了接口函数可以直接调用；对于进程，PM QoS提供了一些设备文件可以让用户空间进行读写。PM QoS对某一项性能指标的要求叫做一个约束，约束分为系统级约束和设备级约束。系统级约束针对的是整个系统的性能要求，设备级约束针对的是某个设备的性能要求。

> 整体上电源管理也是策略和机制分离的，例如：  
> hotplug是一个机制，谁去用？可以用户App制定的策略、温控策略、系统suspend时需要等。  
> CPUFreq是策略和机制都包含的。

### 2\. 热插拔代码介绍

![](https://pic3.zhimg.com/v2-625c30ed21088b101d60e54f4e1951bc_1440w.jpg)

cpu的状态包括：possible、present、online、active。

- **possible** 状态的cpu：可理解为存在这个CPU资源，但还没有纳入Kernel的管理范围。
- **present** 状态的cpu：表示已经被kernel接管。
- **online** 状态的cpu：表示可以被调度器使用。
- **active** 状态的cpu：表示可以被迁移migrate。

Linux内核在初始的时候，会创建虚拟总线cpu\_subsys，每个cpu调用register\_cpu注册时，都会将cpu设备挂在这个总线下。cpu的拔插是通过操作文件节点online实现的，具体拔插操作如下（以cpu1为例）：

```
echo 0 > /sys/devices/system/cpu/cpu1/online //拔核操作
echo 1 > /sys/devices/system/cpu/cpu1/online //插核操作
```

> 为什么以cpu1为例?  
> Linux CPU热插拔，支持在系统启动后，关闭任意一个 `secondary cpu` （在ARM架构中，CPU0为 `boot cpu` ，不能被关闭），并在需要时重新打开它。

当操作/sys/devices/system/cpu/cpu1/online文件的时候，会执行drivers/base/core.c中online\_store（）函数

```
static ssize_t online_store(struct device *dev, struct device_attribute *attr,
                            const char *buf, size_t count
)
{
        bool val;
        int ret;

        ret = strtobool(buf, &val);
        if (ret < 0)
                return ret;

        ret = lock_device_hotplug_sysfs();
        if (ret)
                return ret;

        ret = val ? device_online(dev) : device_offline(dev);
        unlock_device_hotplug();
        return ret < 0 ? ret : count;
}
static DEVICE_ATTR_RW(online);
```

这块有一个 **sysfs** 的知识点，就是DEVICE\_ATTR\_RW(online);声明了这个宏，就可以在文件系统里面为这个设备熟悉添加一个文件，当向这个文件写入字符串的时候就会调用拼接出来的online\_store（）函数，读这个文件的时候就会调用online\_show（）函数

```
#define __ATTR(_name, _mode, _show, _store) {        \
  .attr = {.name = __stringify(_name),        \
     .mode = VERIFY_OCTAL_PERMISSIONS(_mode) },    \
  .show  = _show,            \
  .store  = _store,            \
}

#define __ATTR_RW(_name) __ATTR(_name, 0644, _name##_show, _name##_store)

#define DEVICE_ATTR_RW(_name) \
  struct device_attribute dev_attr_##_name = __ATTR_RW(_name)
```

在online\_store（）函数中，拔核就执行device\_offline(dev)函数device\_offline中dev->bus->offline(dev);drivers/base/cpu.c中

```
struct bus_type cpu_subsys = {
        .name = "cpu",
        .dev_name = "cpu",
        .match = cpu_subsys_match,
#ifdef CONFIG_HOTPLUG_CPU
        .online = cpu_subsys_online,
        .offline = cpu_subsys_offline,
#endif
};
    cpu_device_down
        cpu_down
            cpu_down_maps_locked
                _cpu_down
                    cpuhp_down_callbacks
                        takedown_cpu
[CPUHP_TEARDOWN_CPU] = {
        .name                   = "cpu:teardown",
        .startup.single         = NULL,
        .teardown.single        = takedown_cpu,
        .cant_stop              = true,
},
```

do\_idle状态机会调用

```
arch_cpu_idle_dead
    cpu_die
        cpu_die
            psci_cpu_die
                psci_ops.cpu_off
                    psci_0_2_cpu_off
```

psci\_0\_2\_cpu\_off会调用\_\_psci\_cpu\_off(PSCI\_0\_2\_FN\_CPU\_OFF, state);最终发送smc指令给ATF，上面的cpu down流程汇总如下图：

![](https://pic2.zhimg.com/v2-f22a2496244778580aeec81124c239fb_1440w.jpg)

cpu up流程：

![](https://pic2.zhimg.com/v2-5391450b77a24e0fd3a3898e885c72a9_1440w.jpg)

具体代码自己加log，或者打断点看好些。

### 3\. ATF中处理

之前在 [电源管理入门-1关机重启详解](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484601%26idx%3D1%26sn%3D4b3e42481f74110d0b5a21e01d95a09d%26chksm%3Dfa52829dcd250b8ba7a691a91759498a2a862510833856e7f07ef2c9315f15c72f8f88413812%26scene%3D21%23wechat_redirect) 中介绍的 [PSCI协议](https://zhida.zhihu.com/search?content_id=272281208&content_type=Article&match_order=1&q=PSCI%E5%8D%8F%E8%AE%AE&zhida_source=entity) 部分，这里会发送smc指令到ATF。在ATF中同理,会处理这些PSCI协议，这里不详细介绍了。

---

### 后记

> 本篇文章尝试用markdown进行编写，图片用Midjourney生成，感觉效果还可以，之前每篇文章的排版很费时间。markdown可以只保留最小的一些格式，把注意力关注到文章内容本身，提高效率才能多写一些文章进行更新。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

后续会继续更新，纯干货分析，欢迎分享给朋友，欢迎评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-03-31 10:44・上海[NAS到底是极客还是大众产品？记一次给小白用户配置NAS的经历|顺便绿联DXP 4800 Plus评测](https://zhuanlan.zhihu.com/p/1987561483337486998)

[

10月份我发过一篇长文记录，具体复盘了我自己给一位新投入居家电商直播的小白用户升级全屋网络配置的思路和过程。这波没想...

](https://zhuanlan.zhihu.com/p/1987561483337486998)