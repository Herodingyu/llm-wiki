---
title: "Linux pwm 子系统"
source: "https://zhuanlan.zhihu.com/p/493460609"
author:
  - "[[嵌入式系统开发嵌入式工程师，支持一对一付费指导，定制学习路线规划]]"
published:
created: 2026-05-02
description: "PWM 简介PWM：Pulse width modulation，脉冲宽度调制，在 IC 中，是使用定时器来实现。 PWM 多用于控制马达、LED、振动器等模拟器件。 PWM 参数： 周期 period 占空比 duty_cycle 极性 polarity 周期：单位为纳秒,…"
tags:
  - "clippings"
---
2 人赞同了该文章

### PWM 简介

PWM：Pulse width modulation， [脉冲宽度调制](https://zhida.zhihu.com/search?content_id=197789819&content_type=Article&match_order=1&q=%E8%84%89%E5%86%B2%E5%AE%BD%E5%BA%A6%E8%B0%83%E5%88%B6&zhida_source=entity) ，在 IC 中，是使用 [定时器](https://zhida.zhihu.com/search?content_id=197789819&content_type=Article&match_order=1&q=%E5%AE%9A%E6%97%B6%E5%99%A8&zhida_source=entity) 来实现。

PWM 多用于控制马达、LED、振动器等模拟器件。

PWM 参数：

```
周期 period
占空比 duty_cycle
极性 polarity 

周期：单位为纳秒,1000000000 ns = 1s
占空比：高低电平的占比
极性：以低电平为开启状态，还是以高电平为开启状态，一般为 normal，也就是高电平为开启状态（inversed、normal）
```

### PWM 软件分析

PWM 驱动比 I2C 等简单，可以理解为不用写，芯片厂商已经为 soc 写了 PWM 驱动，我们在使用过程中，只需要修改 [设备树](https://zhida.zhihu.com/search?content_id=197789819&content_type=Article&match_order=1&q=%E8%AE%BE%E5%A4%87%E6%A0%91&zhida_source=entity) ，写应用程序即可。

在 kernel 根目录输入 make menuconfig，打开 PWM 配置

```
-> Device Drivers
  -> Pulse-Width Modulation (PWM) Support
    -> <*> i.MX PWM support  //不同平台名字不同
```

Linux 内核提供了个 PWM 子系统框架，编写 PWM 驱动的时候一定要符合这个框架。PWM子系统的核心是 pwm\_chip 结构体，定义在文件 include/linux/pwm.h 中

```
struct pwm_chip {
 struct device *dev;
 const struct pwm_ops *ops;
 int base;
 unsigned int npwm;

 struct pwm_device * (*of_xlate)(struct pwm_chip *pc,
     const struct of_phandle_args *args);
 unsigned int of_pwm_n_cells;

 /* only used internally by the PWM framework */
 struct list_head list;
 struct pwm_device *pwms;
};
```

其中，pwm\_ops 结构体就是 PWM 外设的各种操作函数集合，编写 PWM 外设驱动的时候需要开发人员实现。

pwm\_ops 结构体也定义在 pwm.h 头文件中，定义如下：

```
struct pwm_ops {
 int (*request)(struct pwm_chip *chip, struct pwm_device *pwm);
 void (*free)(struct pwm_chip *chip, struct pwm_device *pwm);
 int (*capture)(struct pwm_chip *chip, struct pwm_device *pwm,
         struct pwm_capture *result, unsigned long timeout);
 int (*apply)(struct pwm_chip *chip, struct pwm_device *pwm,
       const struct pwm_state *state);
 void (*get_state)(struct pwm_chip *chip, struct pwm_device *pwm,
     struct pwm_state *state);
 struct module *owner;

 /* Only used by legacy drivers */
 int (*config)(struct pwm_chip *chip, struct pwm_device *pwm,
        int duty_ns, int period_ns);
 int (*set_polarity)(struct pwm_chip *chip, struct pwm_device *pwm,
       enum pwm_polarity polarity);
 int (*enable)(struct pwm_chip *chip, struct pwm_device *pwm);
 void (*disable)(struct pwm_chip *chip, struct pwm_device *pwm);
};
```

pwm\_ops 中的这些函数不一定全部实现，但是像 config、enable 和 disable 这些肯定是需要实现的，否则的话打开/关闭 PWM，设置 PWM 的占空比这些就没操作了。

向内核注册 pwm\_chip

```
int pwmchip_add(struct pwm_chip *chip)
```

从内核移除掉 pwm\_chip

```
int pwmchip_remove(struct pwm_chip *chip)
```

其他 pwm 相关 API，定义在 kernel/include/linux/pwm.h

```
struct pwm_device *pwm_request(int pwm_id, const char *label);
void pwm_free(struct pwm_device *pwm);
static inline int pwm_config(struct pwm_device *pwm, int duty_ns,int period_ns)
static inline int pwm_enable(struct pwm_device *pwm)
static inline void pwm_disable(struct pwm_device *pwm)
int pwm_capture(struct pwm_device *pwm, struct pwm_capture *result,unsigned long timeout);
static inline enum pwm_polarity pwm_get_polarity(const struct pwm_device *pwm)
```

调用流程

```
1、初始化
    pwm_request
    pwm_config
    pwm_set_polarity
    pwm_enable
    
2、修改占空比
    pwm_disable
    pwm_config
    pwm_enable

3、停止 pwm 信号输出
    pwm_disable
    pwm_free
```

### PWM 驱动测试

参考内核文档 Documentation/ABI/testing/sysfs-class-pwm 描述。

PWM 子系统的核心是 pwm\_chip 结构体，在 sys/class/pwm/ 下会显示内核注册了几个。

我们进入 pwmchip2，可以看到几个属性

![](https://pica.zhimg.com/v2-439dc72858c4517fb0e483db69637e40_1440w.jpg)

```
device 
export：导出 pwm 通道，使用前必须导出
npwm：PWM 控制器下共有几路 PWM 输出
power 
subsystem 
uevent 
unexport：取消导出 PWM 通道
```
1. 向 export 写 0，导出 pwm0
2. 向 enable 写 1 使能 pwm
3. 设置周期值，单位为 ns，比如 20KHz 频率的周期就是 50000ns
4. 设置 PWM3 的占空比：设置的一个周期的 ON 时间，也就是高电平时间，比如【20KHz 频率下 20%占空比】的 ON 时间就是 10000
![](https://pic2.zhimg.com/v2-64c6c5309d2cff13e58abd3125359707_1440w.jpg)

查看原理图，看是哪个 GPIO 口，然后使用示波器查看波形是否正确。

### 在其他外设上添加 PWM 功能

有时候我们需要在某个外设上添加 PWM 功能，比如，LCD 的背光控制就是 PWM 来完成的。

首先肯定是设备树描述，直接看 linux 内核里面关于 backlight(背光)的绑定文档，路径为Documentation/devicetree/bindings/video/backlight/pwm-backlight.txt，此文档描述了如何创建backlight 节点来使用 linux 内核自带的 pwm 背光驱动。

一般买了一块板子，该部分都是做好的，屏幕肯定是亮的，我们可以直接访问节点

```
/sys/devices/platform/backlight/
```
![](https://picx.zhimg.com/v2-bc776fef09c89c6f186166e8d23b15b1_1440w.jpg)

```
actual_brightness：当前亮度
bl_power 
brightness：当前亮度，可以 echo 写节点改变屏幕亮度
device 
max_brightness：最大亮度，一般是255
power 
subsystem 
type 
uevent
```

### 扩展

一些 IC 厂商的 PWM 控制器有多种工作模式：

![](https://pica.zhimg.com/v2-224c33d621aef80855f6ae82d5ede4c0_1440w.jpg)

发布于 2022-04-05 21:11[【2026最新净热一体机测评】不踩坑怎么选？即热好？VS储热好？多维度测评佳德净净热一体机，看看到底是“智商税”还是“真香”？](https://zhuanlan.zhihu.com/p/690174718)

[

❗前排声明：本文禁止任何形式洗稿、抄袭、搬运，违者必究 ❗原创文章，所涉及内容均为个人经验与实际感受出发大家好，我...

](https://zhuanlan.zhihu.com/p/690174718)