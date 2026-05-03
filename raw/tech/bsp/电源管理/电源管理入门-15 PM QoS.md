---
title: "电源管理入门-15 PM QoS"
source: "https://zhuanlan.zhihu.com/p/2022626017022420085"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "QoS(Quality Of Service，服务质量)，一般在网络报文中，某个报文的优先级比较高则优先传输，例如我们觉得微信聊天比看网页更重要，我们就可以提高微信报文的等级即服务质量QoS，来提供好的网络服务解决延迟、网络…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

3 人赞同了该文章

![](https://pic3.zhimg.com/v2-40fecae8f2084113acd94f2d156263ba_1440w.jpg)

**[QoS](https://zhida.zhihu.com/search?content_id=272340981&content_type=Article&match_order=1&q=QoS&zhida_source=entity)** (Quality Of Service， **服务质量**)，一般在网络报文中，某个 **报文的优先级比较高** 则 **优先传输** ，例如我们觉得微信聊天比看网页更重要，我们就可以提高微信报文的等级即服务质量QoS，来提供好的网络服务解决 **延迟** 、网络 **阻塞** 等问题。

> 在电源管理里面的 **策略就各种governor** ，例如什么时候进入 [cpuidle](https://zhida.zhihu.com/search?content_id=272340981&content_type=Article&match_order=1&q=cpuidle&zhida_source=entity) 、什么时候 [DevFreq](https://zhida.zhihu.com/search?content_id=272340981&content_type=Article&match_order=1&q=DevFreq&zhida_source=entity) 等，这些策略是很单一的，算法也都是很单调的， **未考虑到消费者的实际需求** ，那怎么样把用户的需求也在电源管理里面生效呢？  
> **答案** 就是在 **governor中引入QoS** ，在governor中会去查QoS的策略，综合起来进行 **决策** 。

## 1\. 系统框架介绍

## 1.1 功耗控制可能影响用户体验的一些痛点

![](https://pica.zhimg.com/v2-12f958e700d06e484fbc49bf24cf862c_1440w.jpg)

而且功耗管理会引入对 **性能的缺点** ，主要两方面：

- **延时（latency）增加** ：时间的开销，尤其是在恢复的过程中需要时间。比如，系统唤醒需要经过各驱动的恢复，power domain的上电过程也有时间开销。
- **吞吐量（Throughput）减少** ：低功耗也会带来算力的影响，会降低算力及网路的吞吐量。比如，cpu dvfs、cpu hotplug、cpu idle等会影响到cpu算力。

比如在usb传输的时候把dma给限制了，导致传输速率下降，这些是用户不希望看到的。

又比如延时和性能开销，影响到用户的体验，比如界面操作不流畅、卡顿，响应时间过长。

这就像 **苹果手机很流畅** ， **优先响应用户的需求** ，安卓可能更高效但是有点卡，用户就觉得屏幕划不动了。但是很明显苹果手机更有市场， **用户体验才是王道** ！

在面对用户场景的情况下，我们需要在策略中考虑到用户使用感受。在用户眼里更多的看中应用服务，而且 **不是一味的强调功耗低** ，为了核心业务和用户体验是可以适当的牺牲功耗的，产品做出来最终还是要用户用的，技术再好，功耗再低，不满足用户习惯就是0.

如果把Linux PM当做一种服务，那么他 **对其他模块的影响就类比为服务的质量** ，要满足其他指标不受到影响的情况下最大化的省电，这才是 **最终目标** 。那么这里PM QoS的作用就是定义一套框架，以满足系统（如设备驱动等）对QoS的期望为终极目标，通俗的讲：根据实际场景，这些期望可以描述为:xxx不大于某个值等等。

## 1.2 QoS框架

![](https://pic4.zhimg.com/v2-5cf5df730160220d207bdb963c7e1a17_1440w.jpg)

PM QOS使用 **constraint（约束）** 作为指标，用于各模块对PM的诉求及限制。当前系统的指标主要有两类，分别对应两个PM QOS framework。

- 系统级constraint：包括cpu&dma latency（5.4内核），它的实际意义是，当产生一个事件之后（如一个中断），CPU或DMA的响应延迟。例如有些CPU的串口控制器，只有几个byte的FIFO，当接收数据时，CPU或DMA必须在FIFO填满前，将数据读走，否则就可能丢失数据或者降低数据的传输速率。由PM QoS classes framework管理，定义在kernel/power/qos.c中。
- 设备级constraint：包括从低功耗状态resume的latency、active状态的latency和一些QoS flag（如是否允许power off）。由per-device PM QoS framework管理，定义在drivers/base/power/qos.c。
![](https://pica.zhimg.com/v2-cff39d2761737d743d9e97d2982483b8_1440w.jpg)

整个PM QOS框架分为三部分：

- **需求方** ：各service、各driver。他们根据自己的功能需求，提出系统或某些功能的QOS约束，比如cpu&dma latency。
- **框架层** ：PM QOS framework，包含PM QOS classes、per device PM QOS。向需求方提供request的add、modify、remove等接口，用于管理QoS requests。对需求方的约束进行分类，计算出极值，比如cpu&dma latency不小于某个值。向执行方提供request value的查询接口。PM QoS classes framework位于kernel/power/qos.c中，负责系统级别的PM QoS管理，通过misc设备（/dev/cpu\_dma\_latency），向用户空间程序提供PM QoS的request、modify、remove功能，以便满足各service对PM QoS的需求。per-device PM QoS framework位于drivers/base/power/qos.c中，负责per-device的PM QoS管理。
- **执行方** ：power management的机制，比如cpuidle、cpu dvfs等。需要满足由框架层根据需求方提供的约束计算的极值，才能执行相应的低功耗机制。

## 2\. 用户空间操作流程

![](https://pic2.zhimg.com/v2-38d5d34c146e050b8d42f77c422e062f_1440w.jpg)

## 2.2 用户空间数据结构和API

```
struct pm_qos_object {
    struct pm_qos_constraints *constraints;
    struct miscdevice pm_qos_power_miscdev;
    char *name;
};
```

struct pm\_qos\_object，在给每个class定义pm\_qos\_constraints结构体的同时也为每个class定义了miscdev变量，用于给用户空间提供接口。

这些接口主要实现各类PM QoS需求的汇总和计算极值的工作：add/update/remove等，并且提供接口给到用户空间process，用于用户空间的QoS需求，另外还提供了一些notifier API，用于跟踪指定的PM QoS的变化。

主要API:

`void pm_qos_add_request(struct pm_qos_request *req,int pm_qos_class, s32 value)`

1）用于向PM QoS framework添加一个QoS请求，主要是根据指定的pm\_qos\_class，向pm\_qos\_class链表中插入一个新的pm\_qos\_request节点，并且更新target value。

![](https://pic3.zhimg.com/v2-98bf6cb0f06006de4a587b6d9f269e8a_1440w.jpg)

void [pm\_qos\_update\_request](https://zhida.zhihu.com/search?content_id=272340981&content_type=Article&match_order=1&q=pm_qos_update_request&zhida_source=entity) (struct pm\_qos\_request \*req,s32 new\_value)

![](https://pic4.zhimg.com/v2-6d2218865bd0cdf58ce0fd430001746f_1440w.jpg)

void pm\_qos\_update\_request\_timeout(struct pm\_qos\_request \*req, s32 new\_value, unsigned long timeout\_us)//在update的基础上多出来一个定时器，用于特定需求的延迟更新

2） pm\_qos\_update\_request/pm\_qos\_update\_request\_timeout,如果应用场景变化需要满足不同的要求（比如串口波特率变大，相应的响应延迟需要变小），则需要调用该接口来更新相应的qos请求。函数体的主要部分pm\_qos\_update\_target和Add相似，这里就不再介绍。

3） [pm\_qos\_remove\_request](https://zhida.zhihu.com/search?content_id=272340981&content_type=Article&match_order=1&q=pm_qos_remove_request&zhida_source=entity) ，如果对该class没有需求，则可以调用该接口将请求移除。

4） 借助misc设备向用户空间提供的接口（open/read/write等），调用的接口和上面提到的add/remove等类似，这里就不再赘述。

5） [pm\_qos\_add\_notifier](https://zhida.zhihu.com/search?content_id=272340981&content_type=Article&match_order=1&q=pm_qos_add_notifier&zhida_source=entity) / [pm\_qos\_remove\_notifier](https://zhida.zhihu.com/search?content_id=272340981&content_type=Article&match_order=1&q=pm_qos_remove_notifier&zhida_source=entity) ，有部分实体（如cpuidle，比较关注cpu\_dma\_latency的指标）会比较关注某一个pm qos class的target value的变化，kernel提供了这样一个notifier的机制，该实体可以通过pm\_qos\_add\_notifier接口添加一个notifier，这样当value变化时，framework便会通过notifier的回调函数，通知该实体。

**需求方：**

![](https://pic1.zhimg.com/v2-22024fdfd7686122ccbb426686e10392_1440w.jpg)

**执行方：**

![](https://pic4.zhimg.com/v2-36890d6f8845e0468847218a26b16341_1440w.jpg)

## 2.1 struct pm\_qos\_constraints

```
struct pm_qos_constraints {
    struct plist_head list;
    s32 target_value;    /* Do not change to 64 bit */
    s32 default_value;
    s32 no_constraint_value;
    enum pm_qos_type type;
    struct blocking_notifier_head *notifiers;
};

struct pm_qos_request {
    struct plist_node node;
    int pm_qos_class;
    struct delayed_work work; /* for pm_qos_update_request_timeout */
};
```
- struct pm\_qos\_request用于request的add/update/remove等操作。
- struct pm\_qos\_constraints，pm qos约束，用于抽象某一个特定的PM QoS class。

**target\_value、default\_value** ，分别是该指标的目标值（满足所有需求的value，可以是极大值或者极小值等，某一个指标关注的是极大值还是极小值在初始化的时候已经确定），默认值（该指标的默认值，通常是0，表示没有限制）。

## 3\. 初始化流程

![](https://pica.zhimg.com/v2-1f9ca38336150cdb4d42d37b802ccdd2_1440w.jpg)

```
static int __init pm_qos_power_init(void)
{
    for (i = PM_QOS_CPU_DMA_LATENCY; i < PM_QOS_NUM_CLASSES; i++) {
        ret = register_pm_qos_misc(pm_qos_array[i], d);
        if (ret < 0) {
            printk(KERN_ERR "pm_qos_param: %s setup failed\n",
                   pm_qos_array[i]->name);
            return ret;
        }
    }
```

系统支持的QOS类型：

```
enum {
    PM_QOS_RESERVED = 0,
    PM_QOS_CPU_DMA_LATENCY,
    PM_QOS_NETWORK_LATENCY,
    PM_QOS_NETWORK_THROUGHPUT,
    PM_QOS_MEMORY_BANDWIDTH,

    /* insert new class ID */
    PM_QOS_NUM_CLASSES,
};
```

debugfs\_create\_file（）会创建sysfs供用户空间调用。

## 4\. DMA举例

例如启动摄像头的时候，我们系统即便在省电的情况下，也需要cpu\_dma允许的延迟时间不能超过50us，否则影响画面质量。

drivers/media/platform/via-camera.c中

![](https://pic1.zhimg.com/v2-673a459c810f6733477279463c7d0c1a_1440w.jpg)

**pm\_qos\_add\_request** ：在启动camera的时候，这里请求了一个cpu\_dma\_latency的指标，为50us，即camera driver申请的cpu\_dma允许的延迟时间不能超过50us

cpuidle初始化的时候会调用：

```
static inline void latency_notifier_init(struct notifier_block *n)
{
    pm_qos_add_notifier(PM_QOS_CPU_DMA_LATENCY, n);
}
```

PM\_QOS\_CPU\_DMA\_LATENCY变化的时候会通知cpuidle

在进行cpuidle决策的时候，例如ladder governor中，

```
static int ladder_select_state(struct cpuidle_driver *drv,
                struct cpuidle_device *dev)
{
    struct ladder_device *ldev = this_cpu_ptr(&ladder_devices);
    struct ladder_device_state *last_state;
    int last_residency, last_idx = ldev->last_state_idx;
    int latency_req = pm_qos_request(PM_QOS_CPU_DMA_LATENCY);
```

pm\_qos\_request（）函数会获取target\_value，根据这个值来决定进行什么级别的idle。

对于cpuidle idle来说，一般有C1~C3几个等级，在C3等级的退出延迟时间是57us（不同平台会有差别），那么这里camera driver需求的50us容忍延迟就可以让cpuidle退到C2 idle等级（即前面章节提到的执行方需要确保自身的行为满足这些pm qos的需求），就不会导致上面说的DMA transfer gets corrupted的问题了。

## 参考资料：

1. [blog.csdn.net/feelabcli](https://link.zhihu.com/?target=https%3A//blog.csdn.net/feelabclihu/article/details/116810959)
2. [zhuanlan.zhihu.com/p/56](https://zhuanlan.zhihu.com/p/561000691)
3. [hqber.com/archives/459/](https://link.zhihu.com/?target=https%3A//hqber.com/archives/459/)

> 后记  
> 内核版本有时候差异也挺大的，一个机制，特别是小众的可能会有更新，我们在找资料的时候，就需要注意这点，找到合适的学习资料。不过主要的思想是不变的，变的就是结构体定义，api函数的调用流程等。

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位自己有博客公众号的留言：申请转载，多谢！

后续会继续更新，纯干货分析，欢迎分享给朋友，欢迎点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-04-01 10:47・上海[从dft成功转到数字IC前端设计，目标成为全栈IC工程师](https://zhuanlan.zhihu.com/p/1170594983)

[

毕业之后意外从事DFT工程师工作我2019年毕业于西安工业大学，专业是计算机科学与技术。 和很多同学一样，毕业的时候非常迷茫，不知道做些什么。同班同学大多都从事了对口的软件开发...

](https://zhuanlan.zhihu.com/p/1170594983)