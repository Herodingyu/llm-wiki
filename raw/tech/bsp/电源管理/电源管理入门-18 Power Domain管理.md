---
title: "电源管理入门-18 Power Domain管理"
source: "https://zhuanlan.zhihu.com/p/2025236816920363365"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "SoC中通常有很多IP，按逻辑可以把几个相关功能的IP划为一个电源域。一个电源域内的IP，通常按相同的方式由同一个硬件模块PMIC供电，电压一样并且电源管理例如休眠唤醒一致。为什么有设备电源管理还需要power domai…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

2 人赞同了该文章

![](https://pic1.zhimg.com/v2-94169dffc9e4f61b6191844bfdf64c86_1440w.jpg)

**SoC** 中通常有很多IP， **按逻辑** 可以把几个相关功能的IP划为一个 **电源域** 。一个电源域内的IP，通常按相同的方式由 **同一个硬件模块 [PMIC](https://zhida.zhihu.com/search?content_id=272740691&content_type=Article&match_order=1&q=PMIC&zhida_source=entity) 供电** ，电压一样并且电源管理例如 **休眠唤醒一致** 。

> 为什么有设备电源管理还需要power domain划分？  
> 对每个设备电源管理 **太细化了** ，会造成额外的开销。通常几个设备可以 **一块进行管理更加的方便** ，例如一个子系统，要么全工作要么全关闭，不会子系统内的某个设备单独工作。这时候为了简化管理工作就需要划分出来一个domain。SOC上众多电源域组成了一个 [电源域树](https://zhida.zhihu.com/search?content_id=272740691&content_type=Article&match_order=1&q=%E7%94%B5%E6%BA%90%E5%9F%9F%E6%A0%91&zhida_source=entity) ，他们之间存在着相互的约束关系，子电源域打开前，需要父电源域打开，父电源域下所有子电源域关闭，父电源域才能关闭。

**Domain** 这个词一般在权限管理中经常遇到，用于 **隔离** ， **Domain内共进退** 。

虽然电源域的好处多多，却不是越多越好，因为划分电源域是 **需要成本** 的（需要在PMU中使用模拟电路完成，包括金钱成本和空间成本）。因此，大多数系统会根据功能，设置有限的几个电源域，例如： **CPU core（1、2、3…）；GPU；NAND；DDR；USB；Display；Codec等等** 。

这种设计引出一个问题：存在多个模块共用一个电源域的情况。因而要求在对模块power on/off的时候，考虑power共用的情况：只要一个模块工作，就要power on； **直到所有模块停止工作，才能power off** 。

## 1\. 框架介绍

![](https://pic1.zhimg.com/v2-f2ca569b05b729ef15005f3d7ad60204_1440w.jpg)

Kernel的 **[PM domain framework](https://zhida.zhihu.com/search?content_id=272740691&content_type=Article&match_order=1&q=PM+domain+framework&zhida_source=entity)** （位于drivers/base/power/domain.c中），提供了管理和使用系统power domain的统一方法：

- 对底层power domain硬件的操作
- 对power domain hw的开启操作，包括 **开钟、上电、解复位、解除电源隔离等** 操作的功能封装；
- 对power domain hw的关闭操作，包括 **关钟、断电、复位、做电源隔** 离等操作的功能封装；
- 内部逻辑实现
- 通过 **dts描述** power domain框架的设备节点，并描述每个power domain节点。提供出一个power domain framework的设备节点，及每个power domain子设备的节点，并指定power-domain-ccell = <1>，这样可以通过power domain framework的设备及power domain的编号查找具体的power domain；
- 实现dts解析逻辑，获取power domain的配置信息，并通过初始化函数对每个power domain进行初始化，所有的power domain统一的放在一个全局链表中，将power domain下所有的设备，放到其下的一个设备链表中；
- 为 [runtime pm](https://zhida.zhihu.com/search?content_id=272740691&content_type=Article&match_order=1&q=runtime+pm&zhida_source=entity) 、系统休眠唤醒等框架，注册相应的 **回调函数** ，并实现具体的回调函数对应的power domain的开关函数；
- 上层使用power domain的上游驱动、框架及debug fs
- linux系统的runtime power manager 框架通过提供runtime\_pm\_get\_xxx/runtime\_pm\_put\_xxx类接口给其他的drivers，对设备的开、关做引用计数，当引用计数从1->0时，会进一步调到power domain注册的runtime\_suspend回调，回调函数里会先调用设备的runtime\_suspend回调，然后判断power domain下的设备链表中所有的设备是否已经suspend，若已经suspend才真正关闭power domain。当引用计数从0->1时，会先调用到power domain使用的runtime\_resume回调，回调函数里会先调用power domain的开启操作，然后调用设备注册的runtime\_resume回调函数；
- 系统休眠唤醒在suspend\_noirq/resume\_noirq时会进行power domain的关闭与开启的操作；
- 使用power domain的上游驱动：power domain内部ip的驱动。比如， [dsp子系统](https://zhida.zhihu.com/search?content_id=272740691&content_type=Article&match_order=1&q=dsp%E5%AD%90%E7%B3%BB%E7%BB%9F&zhida_source=entity) power domain下面，有多个dsp核，每个dsp核对应一个power domain。这样，每个dsp核设备驱动都要关联到对应的dsp核power domain上，通过dsp核设备的dts里power-domains的属性引用（power domain framework的节点引用及具体power domain的编号），将dsp核设备与相应的power domain关联起来；
- 使用power domain的框架：runtime pm/系统休眠唤醒；

power domain也提供了一些 **debug fs文件节点** 供用户debug使用，主要就是/sys/kernel/debug/pm\_genpd/目录及power domain名字目录下的一些文件节点：

- pm\_genpd\_summary：打印所有的power domain、状态及下面所挂的设备状态
- power\_domain名字目录/current\_state：power domain当前的状态
- power\_domain名字目录/sub\_domains：power domain当前的子power domain有哪些
- power\_domain名字目录/idle\_states：power domain对应的所有idle状态及其off状态的时间
- power\_domain名字目录/active\_states：power domain处于on状态的时间
- power\_domain名字目录/total\_idle\_time：power domain所有idle状态的off时间总和
- power\_domain名字目录/devices：power domain下所挂的所有devices

相关数据结构：

![](https://picx.zhimg.com/v2-d7be930a713e833aeda5634dc097553f_1440w.jpg)

image.png

初始化流程（以scmi power domain的驱动框架为例）：

![](https://pic3.zhimg.com/v2-ab40b452bfc8cb67d31e39857d780558_1440w.jpg)

image.png

## 2\. 如何使用power domain

在dts中定义一个power domain节点，同时在驱动中注册该power domain即可

```
//DTS中定义power domain节点，这里以内核文档提供的例程  
 parent: power-controller@12340000 {   
    compatible = "foo,power-controller";  
    reg = <0x12340000 0x1000>;  
    #power-domain-cells = <1>;   //这里表明parent节点是一个power domain，也就是内核文档所形容的provider，parent管理它下面挂接着的其它模块，为它们提供电源  
  };  
  
 child: power-controller@12341000 {   
    compatible = "foo,power-controller";  
    reg = <0x12341000 0x1000>;  
    power-domains = <&parent 0>; //这里表明child节点是parent下面的一个模块，它使用parent提供的电源  
    #power-domain-cells = <1>;   
  };
```

从上面的dts语法中可以看出，一个系统的电源域从dts中可以很容易就看出来，#power-domain-cells声明该节点是一个power domain，power-domains = <&xxx x>表明该节点属于xxx电源域，那么系统中某个电源域下面有多少个模块就从dts中看有多少个节点引用了该电源域即可。

## 3\. provider

```
int pm_genpd_init(struct generic_pm_domain *genpd,  
    struct dev_power_governor *gov, bool is_off)  //初始化一个 generic_pm_domain 实例  
  
//下面两个接口都可以用来向内核注册一个power domian  
int of_genpd_add_provider_onecell(struct device_node *np,  
      struct genpd_onecell_data *data)       
int of_genpd_add_provider_simple(struct device_node *np,  
      struct generic_pm_domain *genpd)
```

**pm\_genpd\_init** 这个函数从注释可以看出它初始化了一个power domain实例，从入口参数结合具体的实现代码，可以很容易得到 struct **generic\_pm\_domain** 结构体就对应着一个power domain实例。

```
struct generic_pm_domain {  
 struct dev_pm_domain domain; /* PM domain operations */  
 const char *name;  
 atomic_t sd_count; /* Number of subdomains with power "on" */  
 enum gpd_status status; /* Current state of the domain */  
 unsigned int device_count; /* Number of devices */  
 unsigned int suspended_count; /* System suspend device counter */  
 unsigned int prepared_count; /* Suspend counter of prepared devices */  
 int (*power_off)(struct generic_pm_domain *domain); //驱动只要实现该函数即可  
 int (*power_on)(struct generic_pm_domain *domain);  //驱动只要实现该函数即可
```

真正需要驱动去赋值的成员只有两个，那就是int (\*power\_off)(struct generic\_pm\_domain \*domain); 与int (\*power\_on)(struct generic\_pm\_domain \*domain);，其它的power domain framework已经帮我们做好了，这里我们也可以猜到一个电源域的打开与关闭最终是通过驱动注册的这两个函数操作的，

当驱动得到一个power domain实例后，便可以调用of\_genpd\_add\_provider\_simple函数向内核注册一个power domain了，来进入该函数看看，做了哪些事情，看不太懂，但是从入口参数看，传进去了驱动实现的struct generic\_pm\_domain和power domain的node节点。后续这两个参数应该会有作用。

## 4\. Consumer

Cousumer可能是一个驱动程序或者sysfs，在驱动probe函数中调用dev\_pm\_domain\_attach

```
ret = dev_pm_domain_attach(_dev, true);  //将设备与电源域进行耦合
```
1. 驱动在probe的时候会调用dev\_pm\_domain\_attach函数检查设备是否属于power domain设备，如果是，则获取设备的power domain信息，从哪里获取信息？就是从前面power domain驱动调用of\_genpd\_add\_provider\_simple函数注册进来的信息。
2. 调用genpd\_add\_device函数，将设备添加到该power domain中，主要完成一些struct generic\_pm\_domain成员的赋值操作。
3. 最后最重要的就是调用dev\_pm\_domain\_set该函数，设置了struct device中的struct dev\_pm\_domain成员，该成员被赋值为struct generic\_pm\_domain中的struct dev\_pm\_domain成员。

## 参考：

1. [news.eeworld.com.cn/mp/](https://link.zhihu.com/?target=http%3A//news.eeworld.com.cn/mp/rrgeek/a144963.jspx)
2. [zhuanlan.zhihu.com/p/57](https://zhuanlan.zhihu.com/p/578780233)

> 后记  
> power domain在底层的处理通常需要PPU硬件的参与管理，可以控制这个电源域的时钟、电压、供电等属性，从而达到对电源和功耗的管理。

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言：申请转载，多谢！

后续会继续更新，纯干货分析，欢迎分享给朋友，欢迎点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-08 15:43・上海