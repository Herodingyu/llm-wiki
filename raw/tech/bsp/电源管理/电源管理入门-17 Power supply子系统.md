---
title: "电源管理入门-17 Power supply子系统"
source: "https://zhuanlan.zhihu.com/p/2025212946301593432"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "对于 便携设备来说，电源管理更加的重要，因为电池电量有限，容易电量焦虑。除了省电管理外，还需要对电池进行监控管理和充放电管理，这样保护好电池和系统，能用的更久。1. Power supply框架都做些什么这里我们以…"
tags:
  - "clippings"
---
[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679)

3 人赞同了该文章

![](https://pic3.zhimg.com/v2-b950c65f993e28783490b83977496ff2_1440w.jpg)

对于 **便携设备** 来说，电源管理更加的重要，因为 **电池电量有限** ，容易 **电量焦虑。** 除了省电管理外，还需要对 **电池** 进行 **监控管理** 和 **充放电管理** ，这样保护好电池和系统，能用的更久。

## 1\. Power supply框架都做些什么

这里我们以 **安卓** 为例：

![](https://pic2.zhimg.com/v2-5abef5d6f703af386280533a68998cb3_1440w.jpg)

- **APP 层：** 该部分属于 **电量上报** 的最后的环节。其主要工作是：监听系统广播并对 UI 作出相应更新，包括电池电量百分比，充电状态，低电提醒，led 指示灯，异常提醒等。
- **FrameWork 层：** 本层的 [Battery 服务](https://zhida.zhihu.com/search?content_id=272732550&content_type=Article&match_order=1&q=Battery+%E6%9C%8D%E5%8A%A1&zhida_source=entity) 使用 Java 代码写成，运行在 FrameWork 中的 **SystemServer** 进程。该系统服务的主要作用是：监听电池信息变化消息，并将该消息以系统广播的形式转发至 Android 系统中各处。
- **Native 层：Healthd 守护进程** 属于 Android Native 层的一个系统服务，负责接受 Kernel Driver 层上报的 uevent 事件，对电池信息和充电状态实时监控。
- **Kernel 层：** 本层属于电池的驱动部分，由 Charger-manager 驱动、充电 IC 驱动、Fuel 驱动构成， **负责与硬件交互** ，注册 Power supply 属性，并生成 uevent 上报 Native 层。包含充电状态管理、电量统计与更新。

**关机充电**  
关机充电是单独启动的一个 **linux 应用** ，通过系统调用直接 **读取 [sysfs](https://zhida.zhihu.com/search?content_id=272732550&content_type=Article&match_order=1&q=sysfs&zhida_source=entity)** 来获取电池信息，init 进程会根据启动模式来启动 charge 服务，不会启动 android 相关进程。

我们这里只关注kernel层：

![](https://pic4.zhimg.com/v2-3be23fd252fe26e59c41ab8272742831_1440w.jpg)

**power supply framework** 在kernel/drivers/power/下。内核抽象出来power supply子系统为驱动提供了统一的框架。功能包括：

1.抽象PSY设备的共性，向用户空间提供统一的API

2.为底层PSY驱动的编写，提供简单、统一的方式。同事封装并实现公共逻辑。

**power supply class** 位于drivers/power/目录中，主要由3部分组成（可参考下图的软件架构）：

1）power supply core，用于抽象核心数据结构、 **实现公共逻** 辑。位于drivers/power/power\_supply\_core.c中。

2）power supply sysfs，实现 **sysfs以及uevent** 功能。位于drivers/power/power\_supply\_sysfs.c中。

3）power supply leds，基于linux led class，提供PSY设备状态指示的通用实现。位于drivers/power/power\_suppply\_leds.c中。

最后，驱动工程师可以基于power supply class，实现具体的PSY drivers，主要处理平台相关、硬件相关的逻辑。这些drivers都位于drivers/power/目录下。

## 2\. 相关数据结构和接口

## 2.1 数据结构

struct power\_supply：用于抽象 **PSY设备**

```
/* include/linux/power_supply.h */
struct power_supply {
    const struct power_supply_desc *desc;    //PSY描述符

    char **supplied_to;
    size_t num_supplicants;

    char **supplied_from;
    size_t num_supplies;
    struct device_node *of_node;

    /* Driver private data */
    void *drv_data;

    /* private */
    struct device dev;
    struct work_struct changed_work;
    struct delayed_work deferred_register_work;
    spinlock_t changed_lock;
    bool changed;
    bool initialized;
    bool removing;
    atomic_t use_cnt;
#ifdef CONFIG_THERMAL
    struct thermal_zone_device *tzd;
    struct thermal_cooling_device *tcd;
#endif

#ifdef CONFIG_LEDS_TRIGGERS
    struct led_trigger *charging_full_trig;
    char *charging_full_trig_name;
    struct led_trigger *charging_trig;
    char *charging_trig_name;
    struct led_trigger *full_trig;
    char *full_trig_name;
    struct led_trigger *online_trig;
    char *online_trig_name;
    struct led_trigger *charging_blink_full_solid_trig;
    char *charging_blink_full_solid_trig_name;
#endif
};
```

struct power\_supply\_desc：该描述符定义了psy的属性

```
/* Description of power supply */
struct power_supply_desc {
    const char *name;                        //PSY name
    enum power_supply_type type;            //PSY类型
    enum power_supply_usb_type *usb_types;    //usb类型
    size_t num_usb_types;                    //usb类型个数
    enum power_supply_property *properties;    //该PSY具有的属性列表
    size_t num_properties;                    //属性的个数

    /*
     * Functions for drivers implementing power supply class.
     * These shouldn't be called directly by other drivers for accessing
     * this power supply. Instead use power_supply_*() functions (for
     * example power_supply_get_property()).
     */
    int (*get_property)(struct power_supply *psy,    //用于获取psy属性的回调函数
                enum power_supply_property psp,
                union power_supply_propval *val);
    int (*set_property)(struct power_supply *psy,    //用于设置psy属性的回调函数
                enum power_supply_property psp,
                const union power_supply_propval *val);
    /*
     * property_is_writeable() will be called during registration
     * of power supply. If this happens during device probe then it must
     * not access internal data of device (because probe did not end).
     */
    int (*property_is_writeable)(struct power_supply *psy,    //返回指定的属性值是否可写（用于sysfs）
                     enum power_supply_property psp);
    void (*external_power_changed)(struct power_supply *psy);    //当一个PSY设备存在并且属性发生改变时，power supply core会调用该回调函数，通知PSY driver，以便让它做出相应的处理
    void (*set_charged)(struct power_supply *psy);

    /*
     * Set if thermal zone should not be created for this power supply.
     * For example for virtual supplies forwarding calls to actual
     * sensors or other supplies.
     */
    bool no_thermal;
    /* For APM emulation, think legacy userspace. */
    int use_for_apm;
};
```

power\_supply\_battery\_info：管理静态电池参数的推荐结构

## 2.2 接口

power\_supply\_core.c主要负责设备 **状态变化逻辑** ，power\_supply\_sysfs.c主要负责文件节点相关逻辑。

**power\_supply\_changed** ：在驱动中 **检测到硬件状态发生变化** ，会通过该函数调度起psy中的 **changed\_work** 。该工作队列负责发送notifier（内核内不同模块之间）和通过uevent进行change上报。

```
void power_supply_changed(struct power_supply *psy)
{
    unsigned long flags;

    dev_dbg(&psy->dev, "%s\n", __func__);

    spin_lock_irqsave(&psy->changed_lock, flags);
    psy->changed = true;
    pm_stay_awake(&psy->dev);
    spin_unlock_irqrestore(&psy->changed_lock, flags);
    schedule_work(&psy->changed_work);
}
EXPORT_SYMBOL_GPL(power_supply_changed);
```

**power\_supply\_register** ：通过调用 **\_\_power\_supply\_register** 负责注册一个psy设备，一般在设备驱动的probe流程中调用

**power\_supply\_get\_by\_name** ：通过名字获取PSY指针

**power\_supply\_put** ：释放获取到的PSY指针，与power\_supply\_get\_by\_name成对使用

## 3\. 充电驱动

![](https://pic3.zhimg.com/v2-ee90caa8ebfb6e0fd7525fdcfedca8e0_1440w.jpg)

- Charge Manger、 [Fuel Gauge](https://zhida.zhihu.com/search?content_id=272732550&content_type=Article&match_order=1&q=Fuel+Gauge&zhida_source=entity) 、Charge IC，这三部分作为独立的设备驱动均注册到 Power-supply 中，每一个设备为单独的 PSY。PSY 之间可以通过 power supply 属性相互访问。
- fuel-gauge 跟 charge-ic是服务于 charge-manger，charge-manger 不需要了解硬件细节，仅通过获取相应功能的 PSY 设备实例，通过这个 PSY 的属性获取相应信息。

## 3.1 Charger Manager

Charger Manager 是 **充电的控制策略层** ，主要负责：

- 修复并更新电量百分比。
- 充电流程管理(charging，notcharging，discharging，full 充电状态转换管理)。
- 安全管理(Ovp，Health，Charge Time out)。
- 温控管理（Jeita 功能，thermal 限流）。
- 电池电量显示策略（充放电曲线）。
- 电池容量管理（容量自学习功能）。

Charger Manager 以“battery”名字注册至 Power Supply 架构，会读写 Fuel Gauge 和 [Charger IC](https://zhida.zhihu.com/search?content_id=272732550&content_type=Article&match_order=1&q=Charger+IC&zhida_source=entity) 的 Power supply 属性。

```
charger-manager {
    compatible = "charger-manager";
    cm-name = "battery";
    cm-poll-mode = <2>; //”_cm_monitor”轮询模式
    cm-poll-interval = <15000>;//”_cm_monitor”轮询时间间隔
    cm-battery-stat = <2>;//电池在位检测方法，电压法

    cm-fullbatt-vchkdrop-ms = <30000>;//充满电后，检查复充条件的周期
    cm-fullbatt-vchkdrop-volt = <84000>;//满电后复充电压条件
    cm-fullbatt-voltage = <4350000>;//软件满电电压判断阈值，必须配置
    cm-fullbatt-current = <120000>;;//软件满电电流判断阈值，必须配置
    cm-fullbatt-capacity = <100>;//电池满电时百分比

    cm-num-chargers = <1>;//charger ic数量
    //cm-chargers = "sc2721_charger";
    cm-chargers = "fan54015_charger";//charger ic名字
    cm-fuel-gauge = "sc27xx-fgu";//fgu名字

    /* in deci centigrade */
    cm-battery-cold = <200>;
    cm-battery-cold-in-minus;
    cm-battery-hot = <800>;
    cm-battery-temp-diff = <100>;

    /* Allow charging for 6hr */
    cm-charging-max = <36000000>;
    /* recovery charging after stop charging 45min */
    cm-discharging-max = <2700000>;

    /* the interval to feed charger watchdog */
    cm-wdt-interval = <0>;

    /* drop voltage in microVolts to allow shutdown */
    cm-shutdown-voltage = <3470000>;//低电关机电压

    /* when 99% of the time is exceeded, it will be forced to 100% */
    cm-tickle-time-out = <1500>;

    /* how much time to allow capacity change */
    cm-one-cap-time = <60>;//允许电量增加1%最快时间

    /* when the safe charging voltage is exceeded, stop charging */
    cm-charge-voltage-max = <6500000>;//充电器过压保护电压阈值
    /* drop voltage in microVolts to restart charging */
    cm-charge-voltage-drop = <700000>;//复充电压条件
    //Jeita 温控策略
    cm-jeita-temp-table = <1000 1030 700000 4200000>,   //不同温度范围内的充电电流和充电截止电压
                    <1150 1180 2000000 4400000>,                   //默认最大充电电流为2A
                    <1450 1420 2000000 4400000>,                   //充电电压为4.35V
                    <1600 1570 700000 4200000>;

    regulator@0 {
            cm-regulator-name = "vddgen0";
            cable@0 {
                    cm-cable-name = "USB";
                    extcon = <&extcon_gpio>;
            };
    };
};
```

**充电温控策略说明**

| 电池温度T(℃) | 充电电流 ICC(mA) | 充电截止电压 VEOC(mV) |
| --- | --- | --- |
| T≤0 | 700 | 4200 |
| 0<T<15 | 2000 | 4400 |
| 15≤T<45 | 2000 | 4400 |
| 45≤T<60 | 700 | 4200 |
| T≥60 | 0 | 4200 |

```
bat: battery {
    compatible = "simple-battery";
    charge-full-design-microamp-hours = <3900000>;//电池容量uAh
    charge-term-current-microamp = <200000>;//截止充电电流
    constant_charge_voltage_max_microvolt = <4400000>;//截止充电电压
    factory-internal-resistance-micro-ohms = <115000>;//电池内阻
    voltage-min-design-microvolt = <3561000>;    //Vocv低报警电压

    //电池容量 – 温度补偿表
    capacity-temp-table = <60 100>, <40 100>, <25 100>, <0 100>, <(-10) 80>;
    //电池内阻值 – 温度补偿表
    resistance-temp-table = <60 60>, <40 70>, <25 100>, <0 328>, <(-20) 887>;
};
```

## 3.2 Fuel Gauge

**PMIC部分** 主要负责：

- 库伦计电量积分
- 充电器类型获取
- 电池在位检测
- 开机电压管理
- 内阻 – 温度，容量 – 温度等补偿算法

sc27xx\_fuel\_gauge 以“sc27xx-fgu”名字注册至 Power supply 架构，提供属性给 Charger Manager 读写。

```
pmic_fgu: fgu@a00 {
    compatible = "sprd,sc27xx-fgu", "sprd,sc2731-fgu";
    reg = <0xa00>;
    bat-detect-gpio = <&pmic_eic 9 0>;
    nvmem-cell-names = "fgu_calib";
    nvmem-cells = <&fgu_calib>;
    io-channels = <&pmic_adc 0>, <&pmic_adc 14>, <&pmic_adc 16>;
    io-channel-names = "bat-temp", "charge-vol", "charger-cur";
    interrupt-parent = <&sc2721_pmic>;
    interrupts = <3 IRQ_TYPE_LEVEL_HIGH>;
    monitored-battery = <&bat>;
    sprd,calib-resistance-real = <20000>;    //库仑计芯片真实采样电阻
    sprd,calib-resistance-spec = <20000>;    //库仑计芯片规格电阻
};
```

## 3.3 Charger IC

**Charger IC** 主要负责以下具体内容：

- 打开/关闭充电
- 设置充电电流
- 设置截止充电电压点
- 打开/关闭 OTG

以 Fan54015 为例，将“fan54015\_charger”名字注册至 Power supply 架构。提供属性给 Charger Manager读写。

```
&i2c3 {
   status = "okay";
   clock-frequency = <400000>;

   fan54015_chg: charger@6a {
           compatible = "fairchild,fan54015_chg";
           reg = <0x6a>;
           phys = <&hsphy>;
           monitored-battery = <&bat>;
           extcon = <&extcon_gpio>;
           vddvbus:otg-vbus {
                   regulator-name = "vddvbus";
           };
   };
};
```

## 4\. 怎样基于power supply class编写PSY driver

最后从PSY driver的角度，说明一下怎么基于power supply class编写驱动：

（1）根据 **硬件spec** ，确定PSY设备具备哪些特性，并把他们和enum power\_supply\_property对应。

（2）根据实际情况，实现这些properties的get/set接口。

（3）定义一个struct power\_supply 变量，并初始化必要字段后，调用power\_supply\_register或者power\_supply\_register\_no\_ws，将其注册到kernel中。

（4）根据实际情况，启动设备属性变化的监控逻辑，例如中断，轮询等，并在发生改变时，调用power\_supply\_changed，通知power suopply core。

power supply子系统的引入 以市面上一款常见的的平板方案来看一看，进入平板的sys/class/power\_supply/目录下

![](https://picx.zhimg.com/v2-a0e95957f29aa8f9e8ccca40962c630b_1440w.jpg)

可以看到这里有 **三个\*\*\*\*PSY设备，分别对应USB充电器DC充电器** ，和电池。

进入battery目录下，发现下面有各种各样的属性，另外两个atc260x-usb 、atc260x-wall目录下分别也是这样。

![](https://pic2.zhimg.com/v2-26668162233e8f9d95db6c31e229c17b_1440w.jpg)

然后在内核中找到对应的代码，进行学习，然后仿制一个出来就可以。以 **battery驱动为例** 来分析。

在相关的函数上打点断点，然后就可以学习了。

## 参考资料：

1. [blog.csdn.net/Numeral\_L](https://link.zhihu.com/?target=https%3A//blog.csdn.net/Numeral_Life/article/details/124244654)
2. [blog.csdn.net/weixin\_46](https://link.zhihu.com/?target=https%3A//blog.csdn.net/weixin_46376201/article/details/125201962)

> 后记：  
> Linux内核博大精深，里面的机制太多了，不调试或者工作涉及根本学不精。可以了解了解概念和数据结构。遇到了先调试，必须知道了再去查资料研究，学不完，根本学不完。。。

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言：申请转载，多谢！

后续会继续更新，纯干货分析，欢迎分享给朋友，欢迎点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-08 15:39・上海[【案例】设备管理数字化：全流程巡检系统方案](https://zhuanlan.zhihu.com/p/1980240207933637567)

[

一、用户背景用户涵盖大型商业体、物业、厂房等机构，核心业务涉及各类设备的日常运维管理，需高频开展设备巡检、维修记录...

](https://zhuanlan.zhihu.com/p/1980240207933637567)