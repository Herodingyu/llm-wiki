---
title: "电源管理入门-11Regulator驱动"
source: "https://zhuanlan.zhihu.com/p/2022623591565371291"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "上一篇讲了OPP，里面包含了电压和频率，那么电压具体控制驱动就是regulator驱动，频率就是clock驱动，我们分两节介绍。 1. Regulator驱动是什么？Regulator是Linux系统中电源管理的基础设施之一，用于稳压电源的管…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

3 人赞同了该文章

![](https://pic1.zhimg.com/v2-cca9a00bc1e68b163ca31cfd9ca29244_1440w.jpg)

上一篇讲了OPP，里面包含了电压和频率，那么电压具体控制驱动就是regulator驱动，频率就是clock驱动，我们分两节介绍。

## 1\. Regulator驱动是什么？

Regulator是Linux系统中电源管理的基础设施之一，用于稳压电源的管理，是各种驱动子系统中设置 电压的标准接口。前面介绍的CPUFreq驱动就经常使用它来设定电压。分为voltage regulator(电压调节器)和current(电流调节器)。一般电源管理芯片(Power Management IC)中会包含一个甚至多个regulator。

而Regulator则可以管理系统中的供电单元，即稳压器（Low Dropout Regulator，LDO，即低压差线性 稳压器），并提供获取和设置这些供电单元电压的接口。一般在ARM电路板上，各个稳压器和设备会形 成一个 [Regulator树形结构](https://zhida.zhihu.com/search?content_id=272340135&content_type=Article&match_order=1&q=Regulator%E6%A0%91%E5%BD%A2%E7%BB%93%E6%9E%84&zhida_source=entity) ，

![](https://pica.zhimg.com/v2-78e9b4c40802ed7058a776d42fafe5f6_1440w.jpg)

> Regulator的作用是什么？  
> 通常的作用是给电子设备供电。大多数regulator可以启用(enable)和禁用(disable)其输出，同时也可以控制其输出电压(voltage)和电流(current)。

![](https://pica.zhimg.com/v2-2fb39e5900e550d3e912d8640ee866d4_1440w.jpg)

从上图可以看出，input power会经过 regulator 转化为output power，regulator可以做如下的约束:

- Voltage control: 限制输出的电压
- Current limiting: 限制最大输出电流
- Power switch: 可以控制电压enable/disable

> Power Domain  
> 电源域由稳压器、开关或其他电源域的输出电源提供其输入电源的电子电路。电源Regulator可能位于一个或多个开关后面，例如：

```
Regulator -+-> Switch-1 -+-> Switch-2 --> [Consumer A]
           |             |
           |             +-> [Consumer B], [Consumer C]
           |
           +-> [Consumer D], [Consumer E]
```

这是一个稳压器和三个电源域：

```
Domain 1: Switch-1, Consumers D & E.
Domain 2: Switch-2, Consumers B & C.
Domain 3: Consumer A.
```

> Regulator电压设计时的约束：  
> 稳压器级别：这由稳压器硬件操作参数定义，并在稳压器数据表中指定，例如：\`\`\` 电压输出范围为 800mV -> 3500mV 稳压器电流输出限制为 20mA @ 5V，但为 10mA @ 10V  
>   
> 功率域级别：这是由内核级板初始化代码在软件中定义的。它用于将功率域限制在特定的功率范围内，例如：Domain-2 电压为 1400mV -> 1600mV  
>   
> Consumer级别：这是由Consumer驱动程序动态设置电压或电流限制级别定义的。例如 消费类背光驱动器要求将电流从 5mA 增加到 10mA，以增加 LCD 亮度。

## 2\. Regulator框架介绍

![](https://pic3.zhimg.com/v2-612dbb2c88795bdf5c8dfc36df1e633c_1440w.jpg)

Linux [regulator framework](https://zhida.zhihu.com/search?content_id=272340135&content_type=Article&match_order=1&q=regulator+framework&zhida_source=entity) 的主要目的：

- 提供标准的内核接口，控制系统的voltage/current regulators，并提供相应的开关、大小设置的机制。
- 在系统运行的过程中，根据具体的需要动态改变regulators的输出，从而达到省电的目的。
- 在系统中如果配错regulator是比较危险的，可能会造成硬件器件的损坏。因此，需要在regulator framework中对电流或者电压的大小做限定，并且不能被ragulator的consumer或者provider更改。

## 2.1 regulator consumer

regulator consumer抽象出regulator设备（struct regulator），并提供regulator操作相关的接口。包括：regulator\_get/regulator\_put/regulator\_enable/regulator\_disable/ regulator\_set\_voltage/regulator\_get\_voltage等。

## 2.2 regulator core

regulator core负责上述 [regulator driver](https://zhida.zhihu.com/search?content_id=272340135&content_type=Article&match_order=1&q=regulator+driver&zhida_source=entity) /consumer/machine逻辑的具体实现，对底层的硬件进行封装，并提供接口给内核中其他的consumer（使用当前regulator设备的驱动）提供操作接口，并以sysfs的形式，向用户空间提供接口。

## 2.3 regulator driver

regulator driver指的是regulator设备的驱动，主要包含如下结构：

1）使用struct regulator\_desc，描述regulator的静态信息，包括：名字、supply regulator的名字、中断号、操作函数集（struct regulator\_ops）、使用regmap时相应的寄存器即bitmap等。

2）使用struct regulator\_config，描述regulator的动态信息（所谓的动态信息，体现在struct regulator\_config变量都是局部变量，因此不会永久保存），包括struct regulator\_init\_data指针、设备指针、enable gpio等。

3）提供regulator的注册接口（regulator\_register/devm\_regulator\_register），该接口接受描述该regulator的两个变量的指针：struct regulator\_desc和struct regulator\_config，并分配一个新的数据结构（struct regulator\_dev，从设备的角度描述regulator），并把静态指针（struct regulator\_desc）和动态指针（struct regulator\_config）提供的信息保存在其中。

4）regulator driver以struct regulator\_dev（代表设备）指针为对象，对regulator进行后续的操作。

![](https://pic1.zhimg.com/v2-8a70e17e349e6d0a7efff8b6ae004e2a_1440w.jpg)

## 3\. DTS配置文件及初始化

![](https://pic2.zhimg.com/v2-e9848b949b3d896138074bd87caafdb9_1440w.jpg)

例如：arch/arm/boot/dts/100ask\_imx6ull\_qemu.dts中

```
regulators {
    compatible = "simple-bus";
    #address-cells = <1>;
    #size-cells = <0>;

    reg_can_3v3: regulator@0 {
            compatible = "regulator-fixed";
            reg = <0>;
            regulator-name = "can-3v3";
            regulator-min-microvolt = <3300000>;
            regulator-max-microvolt = <3300000>;
            /*gpios = <&gpio_spi 3 GPIO_ACTIVE_LOW>;*/
    };
```

subsys\_initcall(regulator\_fixed\_voltage\_init); //系统启动时候执行

\--》platform\_driver\_register(&regulator\_fixed\_voltage\_driver);

```
static struct platform_driver regulator_fixed_voltage_driver = {
        .probe                = reg_fixed_voltage_probe,
        .driver                = {
                .name                = "reg-fixed-voltage",
                .of_match_table = of_match_ptr(fixed_of_match),
                .pm = &reg_fixed_voltage_pm_ops,
        },
};
```

reg\_fixed\_voltage\_probe --》devm\_regulator\_register(&pdev->dev, &drvdata->desc, &cfg); --》rdev = regulator\_register(regulator\_desc, config);

regulator\_ops指针ops是对这个稳压器硬件操作的封装，其中包含获取、设置电压等的成员函数

```
//稳压器硬件操作的封装，其中包含获取、设置电压等
struct regulator_ops {
        /* enumerate supported voltages */
        int (*list_voltage) (struct regulator_dev *, unsigned selector);

        /* get/set regulator voltage */
        int (*set_voltage) (struct regulator_dev *, int min_uV, int max_uV,
                            unsigned *selector);
        int (*map_voltage)(struct regulator_dev *, int min_uV, int max_uV);
        int (*set_voltage_sel) (struct regulator_dev *, unsigned selector);
        int (*get_voltage) (struct regulator_dev *);
        int (*get_voltage_sel) (struct regulator_dev *);

        /* get/set regulator current  */
        int (*set_current_limit) (struct regulator_dev *,
                                 int min_uA, int max_uA);
        int (*get_current_limit) (struct regulator_dev *);

        int (*set_input_current_limit) (struct regulator_dev *, int lim_uA);
        int (*set_over_current_protection) (struct regulator_dev *);
        int (*set_active_discharge) (struct regulator_dev *, bool enable);

        /* enable/disable regulator */
        int (*enable) (struct regulator_dev *);
        int (*disable) (struct regulator_dev *);
        int (*is_enabled) (struct regulator_dev *);

        /* get/set regulator operating mode (defined in consumer.h) */
        int (*set_mode) (struct regulator_dev *, unsigned int mode);
        unsigned int (*get_mode) (struct regulator_dev *);

        /* Time taken to enable or set voltage on the regulator */
        int (*enable_time) (struct regulator_dev *);
        int (*set_ramp_delay) (struct regulator_dev *, int ramp_delay);
        int (*set_voltage_time) (struct regulator_dev *, int old_uV,
                                 int new_uV);
        int (*set_voltage_time_sel) (struct regulator_dev *,
                                     unsigned int old_selector,
                                     unsigned int new_selector);

        int (*set_soft_start) (struct regulator_dev *);

        /* report regulator status ... most other accessors report
         * control inputs, this reports results of combining inputs
         * from Linux (and other sources) with the actual load.
         * returns REGULATOR_STATUS_* or negative errno.
         */
        int (*get_status)(struct regulator_dev *);

        /* get most efficient regulator operating mode for load */
        unsigned int (*get_optimum_mode) (struct regulator_dev *, int input_uV,
                                          int output_uV, int load_uA);
        /* set the load on the regulator */
        int (*set_load)(struct regulator_dev *, int load_uA);

        /* control and report on bypass mode */
        int (*set_bypass)(struct regulator_dev *dev, bool enable);
        int (*get_bypass)(struct regulator_dev *dev, bool *enable);

        /* the operations below are for configuration of regulator state when
         * its parent PMIC enters a global STANDBY/HIBERNATE state */

        /* set regulator suspend voltage */
        int (*set_suspend_voltage) (struct regulator_dev *, int uV);

        /* enable/disable regulator in suspend state */
        int (*set_suspend_enable) (struct regulator_dev *);
        int (*set_suspend_disable) (struct regulator_dev *);

        /* set regulator suspend operating mode (defined in consumer.h) */
        int (*set_suspend_mode) (struct regulator_dev *, unsigned int mode);

        int (*set_pull_down) (struct regulator_dev *);
};
```

## 4\. 运行时调用

调压前要先获取regulator handle，然后利用regulator\_set\_voltage进行调压

![](https://picx.zhimg.com/v2-cc35f5d3d4dac50f5df21adda53f78ad_1440w.jpg)

## 5\. Consumer API

## 5.1 Consumer Regulator Access (static & dynamic drivers)

消费者驱动程序可以通过调用regulator\_get访问其供应调节器：

`regulator = regulator_get(dev, "Vcc");`

消费者传入其结构设备指针和电源 ID。然后内核通过查询特定于机器的查找表找到正确的调节器。如果查找成功，则此调用将返回一个指向提供此使用者的结构调节器的指针。

要释放调节器，消费者驱动程序应调用:

`regulator_put(regulator);`

消费者可以由多个调节器供电，例如 具有模拟和数字电源的编解码器消费者:

```
digital = regulator_get(dev, "Vcc");  /* digital core */
analog = regulator_get(dev, "Avdd");  /* analog */
```

调节器访问函数regulator\_get() 和regulator\_put() 通常会分别在您的设备驱动程序probe() 和remove() 中调用。

## 5.2 Regulator Output Enable & Disable (static & dynamic drivers)

消费者可以通过调用regulator\_enable启用调节器：

`int regulator_enable(regulator);`

在调用regulator\_enabled() 之前，电源可能已经启用。如果消费者共享调节器或调节器先前已由引导加载程序或内核板初始化代码启用，则可能会发生这种情况。消费者可以通过调用regulator\_is\_enabled判断是否启用了调节器：

`int regulator_is_enabled(regulator);`

当调节器启用时，这将返回大于零。消费者可以在不再需要时通过调用禁用其供应：

`int regulator_disable(regulator);`

如果它与其他消费者共享，这可能不会禁用供应。仅当启用的参考计数为零时，才会禁用调节器。最后，在紧急情况下可以强制禁用调节器:

`int regulator_force_disable(regulator);`

这将立即强制关闭稳压器输出。所有消费者都将断电。

## 5.3 Regulator Voltage Control & Status (dynamic drivers)

一些消费类驱动器需要能够动态改变其电源电压以匹配系统工作点。例如 CPUfreq 驱动程序可以随频率调整电压以节省电量，SD 驱动程序可能需要选择正确的卡电压等。

消费者可以通过调用来控制他们的电源电压:

`int regulator_set_voltage(regulator, min_uV, max_uV);`

其中 min\_uV 和 max\_uV 是以微伏为单位的最小和最大可接受电压。这可以在调节器启用或禁用时调用。如果在已启用regulator时调用，则电压会立即更改，否则电压配置会更改，并且在下一次启用稳压器时会物理设置电压。调节器配置的电压输出可以通过调用找到：

`int regulator_get_voltage(regulator);`

无论调节器是启用还是禁用，get\_voltage() 都将返回配置的输出电压，并且不应用于确定调节器输出状态。然而，这可以与 is\_enabled() 结合使用来确定稳压器物理输出电压。

## 5.4 Regulator Current Limit Control & Status (dynamic drivers)

一些消费类驱动程序需要能够动态更改其电源电流限制以匹配系统工作点。例如 LCD 背光驱动程序可以更改电流限制以改变背光亮度，USB 驱动程序可能希望在供电时将限制设置为 500mA。消费者可以通过调用来控制他们的电源电流限制:

`int regulator_set_current_limit(regulator, min_uA, max_uA);`

其中 min\_uA 和 max\_uA 是以微安为单位的最小和最大可接受电流限制。

这可以在调节器启用或禁用时调用。如果在已启用电流限制时调用，则电流限制会立即更改，否则电流限制配置会更改，并且在下一次启用调节器时会设置电流限制。

通过调用可以找到调节器电流限制：

`int regulator_get_current_limit(regulator);`

无论调节器是启用还是禁用，get\_current\_limit() 都将返回电流限制，并且不应用于确定调节器电流负载。

## 5.5 Regulator Operating Mode Control & Status (dynamic drivers)

一些消费者可以通过改变其电源调节器的工作模式来进一步节省系统功率，以便在消费者工作状态发生变化时提高效率。例如 消费者驱动程序空闲，随后消耗较少的电流.调节器操作模式可以间接或直接改变。

间接操作模式控制 消费者驱动程序可以通过以下调用请求更改其电源调节器操作模式：

`int regulator_set_load(struct regulator *regulator, int load_uA);`这将导致core重新计算调节器上的总负载（基于其所有消费者）并更改操作模式（如果必要和允许）以最佳匹配当前操作负载。load\_uA 值可以从消费者的数据表中确定。例如 大多数数据表都有表格显示在某些情况下消耗的最大电流。大多数消费者将使用间接操作模式控制，因为他们不了解调节器或调节器是否与其他消费者共享

直接操作模式控制 定制或紧密耦合的驱动器可能希望根据其工作点直接控制调节器的工作模式, 这可以通过调用：

int regulator\_set\_mode(struct regulator \*regulator, unsigned int mode); unsigned int regulator\_get\_mode(struct regulator \*regulator); 直接模式将仅由了解有关调节器且不与其他消费者共享调节器的消费者使用

## 5.6 Regulator Events

监管机构可以将外部事件通知消费者, 在监管机构压力或故障条件下，消费者可能会收到事件。消费者调用以下接口注册感兴趣的事件：

int regulator\_register\_notifier(struct regulator \*regulator, struct notifier\_block \*nb); 消费者调用以下接口反注册感兴趣的事件：

int regulator\_unregister\_notifier(struct regulator \*regulator, struct notifier\_block \*nb); 监管机构使用内核通知程序框架向感兴趣的消费者发送事件。

## 5.7 Regulator Direct Register Access

某些类型的电源管理硬件或固件被设计为需要对调节器进行低级硬件访问，而无需内核参与,此类设备的示例有：

带有压控振荡器和控制逻辑的时钟源，可通过 I2C 改变电源电压，以实现所需的输出时钟速率 热管理固件，可发出任意 I2C 事务以在过热条件下执行系统断电 要设置这样的设备/固件，需要为其配置各种参数，例如调节器的 I2C 地址、各种调节器寄存器的地址等。监管者框架提供了以下查询这些详细信息的帮助程序。

特定于总线的详细信息，例如 I2C 地址或传输速率，由 regmap 框架处理。要获取监管机构的 regmap（如果支持），请使用：

struct regmap \*regulator\_get\_regmap(struct regulator \*regulator); 要获取稳压器电压选择器寄存器的硬件寄存器偏移量和位掩码，请使用：

int regulator\_get\_hardware\_vsel\_register(struct regulator \*regulator, unsigned \*vsel\_reg, unsigned \*vsel\_mask); 要将调节器框架电压选择器代码（由调节器列表电压使用）转换为可直接写入电压选择器寄存器的特定于硬件的电压选择器，请使用：

int regulator\_list\_hardware\_vsel(struct regulator \*regulator, unsigned selector);

## 6\. Driver Interface

驱动程序可以通过调用以下接口注册Regulator：struct regulator\_dev \*regulator\_register(struct regulator\_desc \*regulator\_desc, const struct regulator\_config \*config); 这会将regulator的能力和操作注册到regulator核心。注销接口如下：void regulator\_unregister(struct regulator\_dev \*rdev);

调节器可以通过调用以下方式向消费者驱动程序发送事件（例如过热、欠压等）：int regulator\_notifier\_call\_chain(struct regulator\_dev \*rdev, unsigned long event, void \*data)

最后来个大图：

![](https://pic4.zhimg.com/v2-920fbae2cdb518f0e0945cba63c0ee29_1440w.jpg)

## 参考

1. [zhuanlan.zhihu.com/p/56](https://zhuanlan.zhihu.com/p/565532795)
2. [carlyleliu.github.io/20](https://link.zhihu.com/?target=https%3A//carlyleliu.github.io/2020/Linux%25E9%25A9%25B1%25E5%258A%25A8%25E4%25B9%258BRegulator%25E5%25AD%2590%25E7%25B3%25BB%25E7%25BB%259F/)

> 后记：  
> 电源管理的很多机制都是这种三层：consumer关注于提供使用接口，只通过名字就可以获取dev结构体进行控制。provider专注于驱动的具体实现，就是怎么去操作寄存器，需要开发者自己编写。然后core层就是一层抽象由linux kernel去编写后就不用动了，大家也不用了解其实现，相当于一个HAL层，这个HAL层规定好要实现什么结构体定义或者函数ops定义，driver去填写就可以。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位自己有博客公众号的留言：申请转载，多谢！

后续会继续更新，纯干货分析，欢迎分享给朋友，欢迎点赞、收藏、在看、划线和评论交流以！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-01 10:42・上海[25届ic设计怎么上岸？流片项目能否加分？](https://zhuanlan.zhihu.com/p/11108167739)

[

今年的IC就业非常卷？ \[图片\] 同学们，行情变了，时代变了。 最直接的反馈来源于高校和企业——现在有更多的双非院...

](https://zhuanlan.zhihu.com/p/11108167739)