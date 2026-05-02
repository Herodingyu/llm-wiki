---
title: "Linux leds 子系统"
source: "https://zhuanlan.zhihu.com/p/493078866"
author:
  - "[[嵌入式系统开发嵌入式工程师，支持一对一付费指导，定制学习路线规划]]"
published:
created: 2026-05-02
description: "前言什么叫做驱动框架? 内核中驱动部分维护者针对每个种类的驱动设计一套成熟的、标准的、典型的驱动实现，并把不同厂家的同类硬件驱动中相同的部分抽出来自己实现好，再把不同部分留出接口给具体的驱动开发工程师…"
tags:
  - "clippings"
---
2 人赞同了该文章

### 前言

什么叫做驱动框架?

内核中驱动部分维护者针对每个种类的驱动设计一套成熟的、标准的、典型的驱动实现，并把不同厂家的同类硬件驱动中相同的部分抽出来自己实现好，再把不同部分留出接口给具体的驱动开发工程师来实现，这就叫驱动框架。即标准化的驱动实现,统一管理系统资源,维护系统稳定。

### 概述

led [子系统](https://zhida.zhihu.com/search?content_id=197704797&content_type=Article&match_order=1&q=%E5%AD%90%E7%B3%BB%E7%BB%9F&zhida_source=entity) 驱动框架:

所有 led 共性:

1. 有和用户通信的设备节点
2. 亮和灭

不同点:

1. 有的led可能是接在gpio管脚上,不同的led有不同的gpio来控制
2. 有的led可能由其他的芯片来控制(节约cpu的pin,或者为了控制led的电流等)
3. 可以设置亮度
4. 可以闪烁 所以 Linux 中 led 子系统驱动框架把把所有 led 的共性给实现了,把不同的地方留给驱动工程师去做。

led 子系统核心文件:

```
driver/leds/led-class.c
driver/leds/led-core.c
driver/leds/led-triggers.c
include/linux/leds.h
```

辅助文件(根据需求)

```
driver/leds/trigger/ledtrig-backlight.c
driver/leds/trigger/ledtrig-camera.c
driver/leds/trigger/ledtrig-cpu.c
driver/leds/trigger/ledtrig-default-on.c
driver/leds/trigger/ledtrig-gpio.c
driver/leds/trigger/ledtrig-heartbeat.c
driver/leds/trigger/ledtrig-ide-disk.c
driver/leds/trigger/ledtrig-multi-control.c
driver/leds/trigger/ledtrig-oneshot.c
driver/leds/trigger/ledtrig-timer.c
driver/leds/trigger/ledtrig-transient.c
```

led子系统相关描述可在内核源码 Documentation/leds/leds-class.txt 了解。

led子系统是一个简单的 linux子系统 ，在目录 /sys/class/leds 下展示该子系统设备，每个设备都有自己的属性

![](https://pica.zhimg.com/v2-e41deb9a57b19c8a87e46218204c8338_1440w.jpg)

```
brightness：当前亮度
device
max_brightness：最大亮度（比如255）
power
subsystem
trigger：触发方式，比如闪烁
uevent
```

kernel/include/linux/leds.h

```
enum led_brightness {
 LED_OFF  = 0,    //全暗
 LED_HALF = 127,  //一半亮度
 LED_FULL = 255,  //最大亮度
};
```

### 代码框架分析

led-class.c(led子系统框架的入口) 和 led-core.c

led\_classdev 代表 led 的实例：

```
struct led_classdev {
 const char  *name;//名字
 enum led_brightness  brightness;//亮度
 enum led_brightness  max_brightness;//最大亮度
 int    flags;

 /* Lower 16 bits reflect status */
#define LED_SUSPENDED  (1 << 0)
 /* Upper 16 bits reflect control information */
#define LED_CORE_SUSPENDRESUME (1 << 16)
#define LED_BLINK_ONESHOT (1 << 17)
#define LED_BLINK_ONESHOT_STOP (1 << 18)
#define LED_BLINK_INVERT (1 << 19)
#define LED_SYSFS_DISABLE (1 << 20)
#define SET_BRIGHTNESS_ASYNC (1 << 21)
#define SET_BRIGHTNESS_SYNC (1 << 22)
#define LED_DEV_CAP_FLASH (1 << 23)

//设置亮度API
 void  (*brightness_set)(struct led_classdev *led_cdev,enum led_brightness brightness);
 int  (*brightness_set_sync)(struct led_classdev *led_cdev,enum led_brightness brightness);
          
//获取亮度API
 enum led_brightness (*brightness_get)(struct led_classdev *led_cdev);

//闪烁时点亮和熄灭的时间设置
 int  (*blink_set)(struct led_classdev *led_cdev,unsigned long *delay_on,unsigned long *delay_off);

 struct device  *dev;
 const struct attribute_group **groups;

//leds-list的node
 struct list_head  node;
//默认trigger的名字
 const char  *default_trigger;
//闪烁的开关时间
 unsigned long   blink_delay_on, blink_delay_off;
//闪烁的定时器链表
 struct timer_list  blink_timer;
//闪烁的亮度
 int    blink_brightness;
 void   (*flash_resume)(struct led_classdev *led_cdev);

 struct work_struct set_brightness_work;
 int   delayed_set_value;

#ifdef CONFIG_LEDS_TRIGGERS
//trigger的锁
 struct rw_semaphore  trigger_lock;
//led的trigger
 struct led_trigger *trigger;
//trigger的链表
 struct list_head  trig_list;
//trigger的数据
 void   *trigger_data;
 bool   activated;
#endif
 struct mutex  led_access;
};
```

led\_trigger 结构：

```
struct led_trigger {
 /* Trigger Properties */
 const char  *name;
 void  (*activate)(struct led_classdev *led_cdev);
 void  (*deactivate)(struct led_classdev *led_cdev);

 /* LEDs under control by this trigger (for simple triggers) */
 rwlock_t   leddev_list_lock;
 struct list_head  led_cdevs;

 /* Link to next registered trigger */
 struct list_head  next_trig;
};
```

trigger 是控制 LED 类设备的算法，这个 [算法](https://zhida.zhihu.com/search?content_id=197704797&content_type=Article&match_order=2&q=%E7%AE%97%E6%B3%95&zhida_source=entity) 决定着 LED 什么时候亮什么时候暗。LED trigger 类设备可以是现实的硬件设备，比如 IDE 硬盘，也可以是系统心跳等事件。

1、点亮LED

```
echo 255 > /sys/class/leds/led1/brightness
cat /sys/class/leds/led1/brightness
cat /sys/class/leds/led1/max_brightness
```

2、闪烁

```
cat /sys/class/leds/led1/trigger

分析：会看到trigger_list里面的trigger_list：
[none] mmc0 mmc1 mmc2 timer
其中的timer这个trigger是ledtrig-timer.c中模块初始化的时候注册进去的

echo timer > /sys/class/leds/led1/trigger
这一句会调用
led_trigger_store()->
   led_trigger_set()->
     trigger->activate(led_cdev);
从而调用ledtrig-timer.c文件里的timer_trig_activate()，
在/sys/class/leds/led1/下创建delay_on、delay_off两个文件

echo 100 > /sys/class/leds/led1/delay_on
echo 200 > /sys/class/leds/led1/delay_off
这样会闪烁，亮100ms灭200ms
```

3、关闭LED

```
echo 0 > /sys/class/leds/led1/delay_on
或
echo 0 > /sys/class/leds/led1/brightness
```

发布于 2022-04-04 20:34[大厂！RAG知识库问答系统架构搭建（0-1）](https://zhuanlan.zhihu.com/p/1985752467212895306)

[

本期给大家带来大厂rag知识库系统构建案例参考～ \[图片\] RAG 技术架构主要由索引（Indexing）、检索（Retrieval）和生成（Gene...

](https://zhuanlan.zhihu.com/p/1985752467212895306)