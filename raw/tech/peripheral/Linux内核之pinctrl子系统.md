---
title: "Linux内核之pinctrl子系统"
source: "https://zhuanlan.zhihu.com/p/400309588"
author:
  - "[[linux技术栈公众号 【CPP全栈架构师】 技术交流群739729163]]"
published:
created: 2026-05-02
description: "众所周知，ARM SoC提供了十分丰富的硬件接口，而接口物理上的表现就是一个个的pin(或者叫做pad, finger等)。为了实现丰富的硬件功能，SoC的pin需要实现复用功能，即单独的pin需要提供不同功能，例如，pin0既可以作…"
tags:
  - "clippings"
---
[收录于 · Linux内核源码分析学习](https://www.zhihu.com/column/c_1413593014497759232)

27 人赞同了该文章

众所周知，ARM SoC提供了十分丰富的硬件接口，而接口物理上的表现就是一个个的pin(或者叫做pad, finger等)。为了实现丰富的硬件功能，SoC的pin需要实现复用功能，即单独的pin需要提供不同功能，例如，pin0既可以作为GPIO，可以也用于i2c的SCL，通过pin相关的复用寄存器来切换不同的功能。除此之外，软件还可以通过寄存器配置pin相关的电气特性，例如，上拉/下拉、驱动能力、开漏等。

Linux kernel 3.0之前的内核，对于pin的功能配置都是通过目标板的配置文件(arch/arm/mach-\*)来初始化的，这种配置方式比较繁琐，十分容易出现问题(例如，pin的功能配置冲突)。所以，Linux kernel 3.0之后，实现了DT的板级配置信息管理机制，大大改善了对于pin的配置方式，随之一起实现的就是pinctrl子系统。

pinctrl子系统主要负责以下功能：

1. 枚举、命名通过板级 [DTS配置](https://zhida.zhihu.com/search?content_id=177087791&content_type=Article&match_order=1&q=DTS%E9%85%8D%E7%BD%AE&zhida_source=entity) 的所有pin；
2. 对于pin实现复用功能；
3. 配置pin的电器特性，例如，上拉/下拉、驱动能力、开漏等。；

可见，pinctrl子系统地位相当于kernel全局的pin管理中心，kernel中所有需要pin资源的驱动、子系统都需要通过pinctrl子系统来申请、配置、释放。可将对于pin的操作来说，pinctrl子系统十分重要的。

## 软件框架

对于不同的SoC，其对于pin管理方式可能不同，所以软件上对于pin的配置方式可能存在较大的差异。对此，pinctrl子系统"求同存异"，将pin的管理方式进行了抽象，形成pinctrl-core抽象层，将具体SoC的pin controler隔离出去，形成pinctrl-driver抽象层，pinctrl-core和pinctrl-driver通过抽象接口进行通信。对于pinctrl-core的back-end，即各个需要用到pin的驱动，pinctrl子系统将其抽象为pinctrl-client。

通过上面的软件抽象，pinctrl子系统可以很好的应对不同的SoC pin controler的管理需求，同样可以很好的为不同需要的驱动程序提供pin操作服务。下图简单示意一下pinctrl子系统的软件架构。

![](https://pic3.zhimg.com/v2-3d7759cad655d581afca70c88c0b1290_1440w.jpg)

通过观察pinctrl子系统的软件框架图，可以发现一个问题，那就是 [GPIO子系统](https://zhida.zhihu.com/search?content_id=177087791&content_type=Article&match_order=1&q=GPIO%E5%AD%90%E7%B3%BB%E7%BB%9F&zhida_source=entity) 与pinctrl子系统的关系。理论上，GPIO子系统作为pinctrl子系统的使用者，其地位应该和普通的设备驱动没有差别，但是由于以下原因导致GPIO子系统与pinctrl子系统的功能出现了耦合：

早在kernel 3.0之前，GPIO子系统就已经出现了，其功能也比较明确，就是管理pin的GPIO功能；  
pinctrl子系统以及 [DT机制](https://zhida.zhihu.com/search?content_id=177087791&content_type=Article&match_order=1&q=DT%E6%9C%BA%E5%88%B6&zhida_source=entity) 出现之后，由于GPIO管理的特殊性，并没有将GPIO子系统合并到pinctrl子系统中，而是在pinctrl子系统为GPIO子系统保留了特殊的访问通道，已达到GPIO子系统访问pin的需求。

### pinctrl-core

pinctrl-core抽象层主要的功能就是提供三种服务：

1. 为SoC pin controler drvier提供底层通信接口的能力；
2. 为Driver提供访问pin的能力，即driver配置pin复用能、配置引脚的电气特性；
3. 为GPIO子系统提供GPIO访问的能力；

对于第一种服务来说，其实，对于pinctrl-core抽象层，底层的pin存在方式以及如何对其配置，其完全不会去关心。那么，pinctrl-core如何完成对于pinctrl-driver的控制呢？其实很简单，pinctrl-core与pinctrl-driver是通过pin controller descriptor进行通信的。该结构定义如下：

```
/**
 * struct pinctrl_desc - pin controller descriptor, register this to pin
 * control subsystem
 * @name: name for the pin controller
 * @pins: an array of pin descriptors describing all the pins handled by
 *  this pin controller
 * @npins: number of descriptors in the array, usually just ARRAY_SIZE()
 *  of the pins field above
 * @pctlops: pin control operation vtable, to support global concepts like
 *  grouping of pins, this is optional.
 * @pmxops: pinmux operations vtable, if you support pinmuxing in your driver
 * @confops: pin config operations vtable, if you support pin configuration in
 *  your driver
 * @owner: module providing the pin controller, used for refcounting
 */
struct pinctrl_desc {

    /*pinctrl-driver属性*/
    const char *name;
    const struct pinctrl_pin_desc *pins;                                                                                                                                                                            
    unsigned int npins;

    /*pinctrl-drive抽象接口*/
    const struct pinctrl_ops *pctlops;
    const struct pinmux_ops  *pmxops;
    const struct pinconf_ops *confops;
    struct module *owner;
};
```

pinctrl\_desc其实对于pinctrl-driver的抽象，其包括了pinctrl-driver所有属性以及其具有的所有能力；这就是典型的面向对象编程的思想，pinctrl-core将pinctrl-driver抽象为pinctrl\_desc对象，具体到SoC pinctrl-driver便是该对象一个实例。pinctrl-core通过该实例完成对于系统中所有pin的操作。但是，具体到pinctrl-driver如何完成pin的相关操作，pinctrl-core其实是不关心的。这就将pinctrl-driver的管理的复杂性进行了隔离，与之通信的唯一方式就是预先定义好的抽象接口。这样，不管pinctrl-driver如何变化，只要是按照协议，实例化pinctrl\_desc,那么pinctrl-core就始终可以管理系统所有的pin。

其实，对于软件设计最为本质的目的就是消除复杂性，面向对象编程其实是一种很好的解决软件复杂性的思想。不管是何种软件，服务器程序也好、Web前端程序也好亦或是嵌入式驱动程序也好，其面对的问题其实是一样的，那么最终解决问题指导思想也是相似的。最终目的，就是编写出复杂度低，易于维护的软件。

### pinctrl-driver

pinctrl-driver主要为pinctrl-core提供pin的操作能力。对于具体的pinctrl-controler每个SoC的管理方式可能不同，对应到pinctrl-driver上，其实现方式可能会略有不同，但是，所有pinctrl-driver都是为了同一达到同一个目标，那就是把系统所有的pin信息以及对于pin的控制接口实例化成pinctrl\_desc，并将pinctrl\_desc注册到pinctrl-core中。

pinctrl-driver对于系统pin的管理是通过function和group实现的。下面解释一下function和group的概念，解释之前需要提供一下pinctrl的DTS描述

```
/ {  
pinctrl: pinctrl@ff770000 {
    compatible = "rockchip,rk3288-pinctrl";
    reg = <0xff770000 0x140>,
          <0xff770140 0x80>,
          <0xff7701c0 0x80>;
    reg-names = "base", "pull", "drv";
    #address-cells = <1>; 
    #size-cells = <1>; 
    ranges;

    gpio0: gpio0@ff750000 {
        compatible = "rockchip,rk3288-gpio-bank0";
        reg =   <0xff750000 0x100>,
            <0xff730084 0x0c>,
                <0xff730064 0x0c>,
            <0xff730070 0x0c>;
        reg-names = "base", "mux_bank0", "pull_bank0", "drv_bank0";
        interrupts = <GIC_SPI 81 IRQ_TYPE_LEVEL_HIGH>;
        clocks = <&clk_gates17 4>;

        gpio-controller;
        #gpio-cells = <2>; 

        interrupt-controller;
        #interrupt-cells = <2>; 
    };

    ......

    gpio0_i2c0 {
        i2c0_sda:i2c0-sda {
            rockchip,pins = <I2C0PMU_SDA>;
            rockchip,pull = <VALUE_PULL_DISABLE>;
            rockchip,drive = <VALUE_DRV_DEFAULT>;
            //rockchip,tristate = <VALUE_TRI_DEFAULT>;
        };

        i2c0_scl:i2c0-scl {
            rockchip,pins = <I2C0PMU_SCL>;
            rockchip,pull = <VALUE_PULL_DISABLE>;
            rockchip,drive = <VALUE_DRV_DEFAULT>;
            //rockchip,tristate = <VALUE_TRI_DEFAULT>;
        };

        i2c0_gpio: i2c0-gpio {
            rockchip,pins = <FUNC_TO_GPIO(I2C0PMU_SDA)>, <FUNC_TO_GPIO(I2C0PMU_SCL)>;
            rockchip,drive = <VALUE_DRV_DEFAULT>;
        };
    };
```

上面的dts来自于Rockchip 3288的pinctrl配置dts，下面通过该配置，介绍一下function和group的概念：

- group：所谓的group，如上dts中的i2c0\_sda:i2c0\_gpio，表示一组pins，这组pins统一表示了一种功能，比如，i2c需要两个pins表示，而spi需要四个引脚表示，而对于UART至少需要两个引脚表示。在定义pins的同时，还会提供对于每个pin的电气特性的配置，如，上下拉电阻、驱动能力等。
- function：所谓的function，如上dts中的gpio0\_i2c0，表示一当前这个pin所代表的的功能。每个function可以被一若干个group所引用，但是，对于每个独立的系统(BPS)，只有一个group所引用的pin的function有效，否则会引起pin的function冲突。比如，一个pin既可以作为普通的gpio，也可以作为i2c的sda，那么，一个BPS，这个pin只能代表一个function，即，要么作为普通的gpio，作为i2c的sda。

pinctrl-driver会在驱动的xxxx\_probe函数中，将DTS中所定义关于function和group的配置，转换为pinctrl\_desc中的数据属性，同时将pinctrl\_desc中的对于pin相关操作的回调函数pctlops、pmxops、confops进行初始化，然后将pinctr\_desc注册到pinctrl-core中。之后，pinctrl-driver所要做的工作就是静静的等待pinctrl-core的召唤。

至于，pinctrl-driver如何转化pin信息以及pinctrl\_desc的抽象接口的具体实现，每个SoC的具体实现各不相同，有兴趣的话可以参考具体的内核代码。

### pinctrl-client

具体到使用系统pin资源的设备驱动程序，pinctrl-core主要提供为其提供两种能力：隶属于本设备的所有pin的function的配置能力和GPIO子系统对于GPIO的配置能力；

pinctrl-driver 中描述了pinctrl相关的DTS关于function和group的配置，对于具体的设备如何使用这些配置信息呢？还是以一个具体设备的DTS配置为例说明问题，DTS配置如下：

```
i2c0: i2c@ff650000{                                                                                                                                                                                     
        compatible = "rockchip,rk30-i2c";
        reg = <0xff650000 0x1000>;
        interrupts = <GIC_SPI 60 IRQ_TYPE_LEVEL_HIGH>;
        #address-cells = <1>;
        #size-cells = <0>;
        pinctrl-names = "default", "gpio";
        pinctrl-0 = <&i2c0_sda &i2c0_scl>;
        pinctrl-1 = <&i2c0_gpio>;
        gpios = <&gpio0 GPIO_B7 GPIO_ACTIVE_LOW>,  <&gpio0 GPIO_C0 GPIO_ACTIVE_LOW>;
        clocks = <&clk_gates10 2>;
        rockchip,check-idle = <1>;
        status = "disabled";
    };
```

上面的是关于i2c0控制器的设备配置信息，我们关心的是下面的配置信息：

```
pinctrl-names = "default", "gpio";
pinctrl-0 = <&i2c0_sda &i2c0_scl>;
pinctrl-1 = <&i2c0_gpio>;
```

pinctrl-names表示i2c0控制器所处的两种状态，称为pin state, 即：default、gpio；其中，pinctrl-0对应于defaut状态下其关心的function和group，类似的，pinctrl-1对应于gpio状态下其关心的function和group。

pinctrl-names所列出的各个状态与系统电源管理模块的联系比较紧密，由于电源管理的需要，系统可能处于不同的工作状态，相应的设备驱动提供pins不同的工作状态，其目的为了降低系统整体功耗，达到省电的需求，这种需求在消费电子产品中尤为重要。

一般情况下，各个core-driver，例如i2c-core、spi-core会在调用设备驱动程序的probe初始化函数之前，将设备的工作状态设定为default状态。pinctrl-core的consumer.h文件(include/linux/pinctrl/consumer.h)文件提供了配置pin state的接口函数，其原型如下：

```
extern struct pinctrl * __must_check pinctrl_get(struct device *dev);
extern void pinctrl_put(struct pinctrl *p);
extern struct pinctrl_state * __must_check pinctrl_lookup_state(
                            struct pinctrl *p,
                            const char *name);
extern int pinctrl_select_state(struct pinctrl *p, struct pinctrl_state *s);

extern struct pinctrl * __must_check devm_pinctrl_get(struct device *dev);
extern void devm_pinctrl_put(struct pinctrl *p);

extern int pinctrl_pm_select_default_state(struct device *dev);
extern int pinctrl_pm_select_sleep_state(struct device *dev);
extern int pinctrl_pm_select_idle_state(struct device *dev);
```

对于普通的设备驱动程序来说，一般不会使用到上述的接口，在涉及到电源管理或者子系统驱动程序(i2c-core、spi-core)可能用到上述接口。后续文档(GPIO 子系统、i2c-core-drvier、spi-core-drive)会详细分析。

> 整理了 一些 Linux内核底层源码分析 学习资料、教学视频 免费分享有需要的可以自行添加学习交流群 [960994558](https://link.zhihu.com/?target=https%3A//jq.qq.com/%3F_wv%3D1027%26k%3Dbrzfc7hj)

![](https://pic1.zhimg.com/v2-7d5df1a88bb1ee676b7e1c805652832c_1440w.png)

发布于 2021-08-16 15:34[应届生想从事IC验证该从哪里开始学习？](https://www.zhihu.com/question/511182201/answer/2509445821)

[

IC验证该从哪里开始学习？建议在校期间就开始，搞IC验证工程师，有大学4年，研究生3年，这么长时间总不能全用来谈恋爱不是，要知道光IC验证平台就有6中以上，等你要毕业找工作了才...

](https://www.zhihu.com/question/511182201/answer/2509445821)