---
title: "电源管理入门-10 OPP介绍"
source: "https://zhuanlan.zhihu.com/p/2022623318835042197"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "之前的文章设置clock的时候多次提到了（Operating Performance Point）OPP，例如DEVFreq、CPUFreq等，在现代SoC上存在有Power Domain，也可以以Power Domain为单位进行OPP的电压频率定义。 1. 什么是OPP，怎么用？…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

1 人赞同了该文章

![](https://pic3.zhimg.com/v2-1c2bd9fe957bd1d00aa2a6d54e9bb0ca_1440w.jpg)

之前的文章设置clock的时候多次提到了（Operating Performance Point）OPP，例如DEVFreq、CPUFreq等，在现代SoC上存在有 [Power Domain](https://zhida.zhihu.com/search?content_id=272340012&content_type=Article&match_order=1&q=Power+Domain&zhida_source=entity) ，也可以以Power Domain为单位进行OPP的电压频率定义。

## 1\. 什么是OPP，怎么用？

> 在SoC内，某些domain可以运行在较低的频率和电压下，而其他domain可以运行在较高的频率和电压下，某个domain所支持的<频率，电压>对的集合被称为Operating Performance Point，缩写OPP。

在 [DTS](https://zhida.zhihu.com/search?content_id=272340012&content_type=Article&match_order=1&q=DTS&zhida_source=entity) 中配置后自动有OPP框架驱动加载使用，例如CPU的OPP，从设备树文件arch/arm/boot/dts/imx6ull.dtsi中找到

```
cpu0: cpu@0 {
        compatible = "arm,cortex-a7";
        device_type = "cpu";
        reg = <0>;
        clock-latency = <61036>; /* two CLK32 periods */
        operating-points = <
                /* kHz        uV */
                900000        1275000
                792000        1225000
                528000        1175000
                396000        1025000
                198000        950000
        >;
        fsl,soc-operating-points = <
                /* KHz        uV */
                900000        1175000
                792000        1175000
                528000        1175000
                396000        1175000
                198000        1175000
        >;
```

## 2\. 系统初始化加载OPP信息

```
DT_MACHINE_START

--》imx6ul_init_late

--》imx6ul_opp_init

--》_of_add_opp_table_v1(dev);

--》_opp_add_v1

--》_opp_add
```

\_of\_add\_opp\_table\_v1中会根据DTS中信息找到对应的信息：

![](https://pic1.zhimg.com/v2-14152ddef6705c52a08d4be5f1ef1a6a_1440w.jpg)

\_opp\_add\_v1中会把DTS中信息提取出来，存入struct [dev\_pm\_opp](https://zhida.zhihu.com/search?content_id=272340012&content_type=Article&match_order=1&q=dev_pm_opp&zhida_source=entity) \*new\_opp;

![](https://picx.zhimg.com/v2-5c7605ead8451f3b88cfe1031d69e62d_1440w.jpg)

这里struct dev\_pm\_opp如下：

```
struct dev_pm_opp {
    struct list_head node;

    bool available;
    unsigned long rate;
    unsigned long u_volt;

    struct device_opp *dev_opp;
    struct rcu_head head;
};
```

**node:** 用于链表管理此设备下的opp。 **available:** 用于判断此opp使能可以使用。 **rate:** 频率，单位Hz **u\_volt:** 电压。 **dev\_opp:** struct device\_opp类型指针，指向此opp所属的设备。

## 3\. 触发使用

例如输入命令：

```
echo 700000 > /sys/devices/system/cpu/cpu0/cpufreq/scaling_setspeed
```

\_\_ [cpufreq\_driver\_target](https://zhida.zhihu.com/search?content_id=272340012&content_type=Article&match_order=1&q=cpufreq_driver_target&zhida_source=entity) ->\_\_target\_index->cpufreq\_driver->target\_index

```
static int set_target(struct cpufreq_policy *policy, unsigned int index)
{
        struct private_data *priv = policy->driver_data;

        return dev_pm_opp_set_rate(priv->cpu_dev,
            policy->freq_table[index].frequency * 1000);
}
```

dev\_pm\_opp\_set\_rate（）函数在drivers/base/power/opp/core.c中定义

```
opp_table = _find_opp_table(dev);
      
      clk = opp_table->clk;
      freq = clk_round_rate(clk, target_freq);
      if ((long)freq <= 0)
              freq = target_freq;

      old_freq = clk_get_rate(clk);
      
ret = _generic_set_opp_clk_only(dev, clk, old_freq, freq);
```

clk\_set\_rate进行频率设置。

## 4\. API介绍

- dev\_pm\_opp\_add ：( WARNING: Do not use this function in interrupt context.)
- 向指定的设备添加一个频率/电压（opp table）组合，频率和电压的单位分别是Hz和uV。
- dev\_pm\_opp\_remove:
- remove an opp from opp table.
- dev\_pm\_opp\_get:
- increment the reference count of opp.
- dev\_pm\_opp\_enable：
- 用于使能指定的OPP，调用dev\_pm\_opp\_add添加进去的OPP，默认是enable的。
- dev\_pm\_opp\_disable：
- 虽然设备支持某些OPP，但driver有可能觉得比较危险，不想使用，则可以调用dev\_pm\_opp\_disable接口，禁止该OPP。
- dev\_pm\_opp\_get\_voltage：
- 获得电压。
- dev\_pm\_opp\_get\_freq：
- 获得频率。
- dev\_pm\_opp\_set\_regulators：
- 进行voltage scaling
- dev\_pm\_opp\_put\_regulators：
- free the resources acquired by the OPP core
- dev\_pm\_opp\_set\_rate：
- This routine configures the device for the OPP with the lowest frequency greater than or equal to the target frequency.
- dev\_pm\_opp\_get\_opp\_count：
- 获取opp table opps numbers
- dev\_pm\_opp\_of\_add\_table ：
- 解析并初始化一个设备的opp table。
- OPP的查询接口包括：
- dev\_pm\_opp\_find\_freq\_floor，查询小于或者等于指定freq的OPP，在返回OPP的同时，从freq指针中返回实际的freq值；
- dev\_pm\_opp\_find\_freq\_ceil，查询大于或者等于指定freq的OPP，在返回OPP的同时，从freq指针中返回实际的freq值；
- dev\_pm\_opp\_find\_freq\_exact，精确查找指定freq的OPP，同时通过available变量，可以控制是否查找处于disable状态的OPP。上面两个查找接口，是不查找处于disable状态的OPP的。

> 后记：  
> Linux驱动的套路其实就是DTS里面有个compatible，然后内核启动的时候走各种平台设备初始化就会去寻找加载，然后变成链表结构体。在使用的时候：用户通过设备节点或者中断产生或者内核进程触发就可以运行。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位自己有博客公众号的留言：申请转载，多谢！

后续会继续更新，纯干货分析，欢迎分享给朋友，欢迎点赞、收藏、在看、划线和评论交流以！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-04-01 10:36・上海[PMP报考流程是怎么样的？每年什么时候考试？](https://zhuanlan.zhihu.com/p/660531106)

[

本文主要内容： 一、PMP考试的时间安排 二、PMP报考流程详解 三、PMP费用是如何的下面是我整理的 关于PMP的全方位信息，...

](https://zhuanlan.zhihu.com/p/660531106)