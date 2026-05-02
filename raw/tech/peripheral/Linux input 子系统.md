---
title: "Linux input 子系统"
source: "https://zhuanlan.zhihu.com/p/491124963"
author:
  - "[[嵌入式系统开发嵌入式工程师，支持一对一付费指导，定制学习路线规划]]"
published:
created: 2026-05-02
description: "按键、鼠标、键盘、触摸屏等都属于输入(input)设备，Linux 内核为此专门做了一个叫做 input子系统的框架来处理输入事件。输入设备本质上还是字符设备，只是在此基础上套上了 input 框架，用户只需要负责上报输入事…"
tags:
  - "clippings"
---
2 人赞同了该文章

按键、鼠标、键盘、触摸屏等都属于输入(input)设备，Linux 内核为此专门做了一个叫做 [input子系统](https://zhida.zhihu.com/search?content_id=197270436&content_type=Article&match_order=1&q=input%E5%AD%90%E7%B3%BB%E7%BB%9F&zhida_source=entity) 的框架来处理输入事件。输入设备本质上还是 [字符设备](https://zhida.zhihu.com/search?content_id=197270436&content_type=Article&match_order=1&q=%E5%AD%97%E7%AC%A6%E8%AE%BE%E5%A4%87&zhida_source=entity) ，只是在此基础上套上了 input 框架，用户只需要负责上报输入事件，比如按键值、坐标等信息，input 核心层负责处理这些事件。

### input 子系统

### 1、input 子系统简介

input 就是输入的意思，因此 input 子系统就是管理输入的子系统，和 pinctrl 和 gpio 子系统一样，都是 Linux [内核](https://zhida.zhihu.com/search?content_id=197270436&content_type=Article&match_order=2&q=%E5%86%85%E6%A0%B8&zhida_source=entity) 针对某一类设备而创建的框架。比如按键输入、键盘、鼠标、触摸屏等等这些都属于输入设备，不同的输入设备所代表的含义不同，按键和键盘就是代表按键信息，鼠标和触摸屏代表坐标信息，因此在 [应用层](https://zhida.zhihu.com/search?content_id=197270436&content_type=Article&match_order=1&q=%E5%BA%94%E7%94%A8%E5%B1%82&zhida_source=entity) 的处理就不同，对于驱动编写者而言不需要去关心应用层的事情，我们只需要按照要求上报这些输入事件即可。为此 input 子系统分为 input 驱动层、input 核心层、input 事件处理层，最终给用户空间提供可访问的设备节点，input 子系统框 架如图所示：

![](https://pic1.zhimg.com/v2-b8a7ba8992ef4599e57ff2f067e9bdea_1440w.jpg)

左边就是最底层的具体设备，比如按键、USB 键盘/鼠标等，中间部分属于Linux 内核空间，分为驱动层、核心层和事件层，最右边的就是用户空间，所有的输入设备以文件的形式供用户应用程序使用。可以看出 input 子系统用到了我们前面讲解的驱动分层模型，我们编写 [驱动程序](https://zhida.zhihu.com/search?content_id=197270436&content_type=Article&match_order=1&q=%E9%A9%B1%E5%8A%A8%E7%A8%8B%E5%BA%8F&zhida_source=entity) 的时候只需要关注中间的驱动层、核心层和事件层，这三个层的分工如下：

[驱动层](https://zhida.zhihu.com/search?content_id=197270436&content_type=Article&match_order=4&q=%E9%A9%B1%E5%8A%A8%E5%B1%82&zhida_source=entity) ：输入设备的具体驱动程序，比如按键驱动程序，向 [内核层](https://zhida.zhihu.com/search?content_id=197270436&content_type=Article&match_order=1&q=%E5%86%85%E6%A0%B8%E5%B1%82&zhida_source=entity) 报告输入内容。

核心层：承上启下，为驱动层提供输入设备注册和操作接口。通知事件层对输入事件进行处理。

事件层：主要和用户空间进行交互。

### 2、input 驱动编写流程

input 核心层会向 Linux 内核注册一个字符设备，大家找到 drivers/input/input.c 这个文件，input.c 就是 input 输入子系统的核心层，此文件里面有如下所示代码：

```
struct class input_class = {
 .name = "input",
 .devnode = input_devnode,
};
......
static int __init input_init(void)
{
 int err;

 err = class_register(&input_class);
 if (err) {
  pr_err("unable to register input_dev class\n");
  return err;
 }

 err = input_proc_init();
 if (err)
  goto fail1;

 err = register_chrdev_region(MKDEV(INPUT_MAJOR, 0),INPUT_MAX_CHAR_DEVICES, "input");
 if (err) {
  pr_err("unable to register char major %d", INPUT_MAJOR);
  goto fail2;
 }

 return 0;

 fail2: input_proc_exit();
 fail1: class_unregister(&input_class);
 return err;
}
```

class\_register(&input\_class) 注册一个 input 类，这样系统启动以后就会在/sys/class 目录下有一个 input 子目录。

register\_chrdev\_region(MKDEV(INPUT\_MAJOR, 0),INPUT\_MAX\_CHAR\_DEVICES, "input");注册一个字符设备，主设备号为 INPUT\_MAJOR，INPUT\_MAJOR 定义在 include/uapi/linux/major.h 文件中，定义如下：

```
#define INPUT_MAJOR 13
```

因此，input 子系统的所有设备主设备号都为 13，我们在使用 input 子系统处理输入设备的时候就不需要去注册字符设备了，我们只需要向系统注册一个 input\_device 即可。

1、注册 input\_dev

在使用 input 子系统的时候我们只需要注册一个 input 设备即可，input\_dev [结构体](https://zhida.zhihu.com/search?content_id=197270436&content_type=Article&match_order=1&q=%E7%BB%93%E6%9E%84%E4%BD%93&zhida_source=entity) 表示 input设备，此结构体定义在 include/linux/input.h 文件中，定义如下(有省略)：

```
struct input_dev {
 const char *name;
 const char *phys;
 const char *uniq;
 struct input_id id;

 unsigned long propbit[BITS_TO_LONGS(INPUT_PROP_CNT)];

 unsigned long evbit[BITS_TO_LONGS(EV_CNT)]; /* 事件类型的位图 */
 unsigned long keybit[BITS_TO_LONGS(KEY_CNT)]; /* 按键值的位图 */
 unsigned long relbit[BITS_TO_LONGS(REL_CNT)]; /* 相对坐标的位图 */
 unsigned long absbit[BITS_TO_LONGS(ABS_CNT)]; /* 绝对坐标的位图 */
 unsigned long mscbit[BITS_TO_LONGS(MSC_CNT)]; /* 杂项事件的位图 */
 unsigned long ledbit[BITS_TO_LONGS(LED_CNT)]; /*LED 相关的位图 */
 unsigned long sndbit[BITS_TO_LONGS(SND_CNT)];/* sound 有关的位图 */
 unsigned long ffbit[BITS_TO_LONGS(FF_CNT)]; /* 压力反馈的位图 */
 unsigned long swbit[BITS_TO_LONGS(SW_CNT)]; /*开关状态的位图 */
 ......
 bool devres_managed;
};
```

evbit 表示输入事件类型，可选的事件类型定义在 include/uapi/linux/input.h 文件中，事件类型如下：

```
#define EV_SYN 0x00 /* 同步事件 */
#define EV_KEY 0x01 /* 按键事件 */
#define EV_REL 0x02 /* 相对坐标事件 */
#define EV_ABS 0x03 /* 绝对坐标事件 */
#define EV_MSC 0x04 /* 杂项(其他)事件 */
#define EV_SW 0x05 /* 开关事件 */
#define EV_LED 0x11 /* LED */
#define EV_SND 0x12 /* sound(声音) */
#define EV_REP 0x14 /* 重复事件*/
#define EV_FF 0x15 /* 压力事件 */
#define EV_PWR 0x16 /* 电源事件 */
#define EV_FF_STATUS 0x17 /* 压力状态事件 */
```

比如我们要使用到按键，那么就需要注册 EV\_KEY 事件，如果要使用连按功能的话还需要注册 EV\_REP 事件。

evbit、keybit、relbit 等等都是存放不同事件对应的值。比如要使用按键事件，因此要用到 keybit，keybit 就是按键事件使用的位图，Linux 内核定义了很多按键值，这些按键值定义在 include/uapi/linux/input.h 文件中，按键值如下：

```
#define KEY_RESERVED 0
#define KEY_ESC 1
#define KEY_1 2
#define KEY_2 3
#define KEY_3 4
#define KEY_4 5
#define KEY_5 6
#define KEY_6 7
#define KEY_7 8
#define KEY_8 9
#define KEY_9 10
#define KEY_0 11
......
#define BTN_TRIGGER_HAPPY39 0x2e6
#define BTN_TRIGGER_HAPPY40 0x2e7
```

我们可以将开发板上的按键值设置为示例代码中的任意一个。

申请 input\_dev

```
struct input_dev *input_allocate_device(void)
```

释放 input\_dev

```
void input_free_device(struct input_dev *dev)
```

初始化 input\_dev

```
int input_register_device(struct input_dev *dev)
```

注销 input\_dev

```
void input_unregister_device(struct input_dev *dev)
```

上面四个 API，两两成对使用。

综上所述，input\_dev 注册过程如下：

①、使用 input\_allocate\_device 函数申请一个 input\_dev。

②、初始化 input\_dev 的事件类型以及事件值。

③、使用 input\_register\_device 函数向 Linux 系统注册前面初始化好的 input\_dev。

④、卸载 input 驱动的时候需要先使用 input\_unregister\_device 函数注销掉注册的 input\_dev，然后使用 input\_free\_device 函数释放掉前面申请的 input\_dev。

input\_dev 注册过程示例代码如下所示：

```
struct input_dev *inputdev; /* input 结构体变量 */

/* 驱动入口函数 */
static int __init xxx_init(void)
{
 ......
 inputdev = input_allocate_device();/* 申请 input_dev*/
 inputdev->name = "test_inputdev"; /* 设置 input_dev 名字 */

 /*********第一种设置事件和事件值的方法***********/

 __set_bit(EV_KEY, inputdev->evbit);/* 设置产生按键事件*/
 __set_bit(EV_REP, inputdev->evbit);/* 重复事件*/
 __set_bit(KEY_0, inputdev->keybit);/*设置产生哪些按键值*/

 /************************************************/

 /*********第二种设置事件和事件值的方法***********/

 keyinputdev.inputdev->evbit[0] = BIT_MASK(EV_KEY) | BIT_MASK(EV_REP);
 keyinputdev.inputdev->keybit[BIT_WORD(KEY_0)] |= BIT_MASK(KEY_0);

 /************************************************/

 /*********第三种设置事件和事件值的方法***********/

 keyinputdev.inputdev->evbit[0] = BIT_MASK(EV_KEY) | BIT_MASK(EV_REP);
 input_set_capability(keyinputdev.inputdev, EV_KEY, KEY_0);

 /************************************************/

 /* 注册 input_dev */

 input_register_device(inputdev);
 ......
 return 0;
}

/* 驱动出口函数 */
static void __exit xxx_exit(void)
{
 input_unregister_device(inputdev);/* 注销 input_dev */
 input_free_device(inputdev);/* 删除 input_dev */
}
```

2、上报输入事件

当我们向 Linux 内核注册好 input\_dev 以后还不能高枕无忧的使用 input 设备，input 设备都是具有输入功能的，但是具体是什么样的输入值 Linux 内核是不知道的，我们需要获取到具体的输入值，或者说是输入事件，然后将输入事件上报给 Linux 内核。比如按键，我们需要在按键中断处理函数，或者消抖定时器中断函数中将按键值上报给 Linux 内核，这样 Linux 内核才能获取到正确的输入值。不同的事件，其上报事件的 API 函数不同，我们依次来看一下一些常用的事件上报 API 函数。

input\_event 函数，此函数用于上报指定的事件以及对应的值

```
void input_event(struct input_dev *dev,
                  unsigned int type,
                  unsigned int code,
                  int value)
```

input\_event 函数可以上报所有的事件类型和事件值，Linux 内核也提供了其他的针对具体事件的上报函数，这些函数其实都用到了 input\_event 函数。

比如上报按键所使用的 input\_report\_key 函数，此函数内容如下：

```
static inline void input_report_key(struct input_dev *dev,
                                unsigned int code, int value)
{
    input_event(dev, EV_KEY, code, !!value);
}
```

上报按键事件的话建议大家用 input\_report\_key 函数。

其他的事件上报函数，这些函数如下所示：

```
void input_report_rel(struct input_dev *dev, unsigned int code, int value)
void input_report_abs(struct input_dev *dev, unsigned int code, int value)
void input_report_ff_status(struct input_dev *dev, unsigned int code, int value)
void input_report_switch(struct input_dev *dev, unsigned int code, int value)
void input_mt_sync(struct input_dev *dev)
```

上报事件以后还需要使用 input\_sync 函数来告诉 Linux 内核 input 子系统上报结束，input\_sync 函数本质是上报一个同步事件，此 [函数原型](https://zhida.zhihu.com/search?content_id=197270436&content_type=Article&match_order=1&q=%E5%87%BD%E6%95%B0%E5%8E%9F%E5%9E%8B&zhida_source=entity) 如下所示：

```
void input_sync(struct input_dev *dev)
```

综上所述，按键的上报事件的参考代码如下所示：

```
/* 用于按键消抖的定时器服务函数 */
void timer_function(unsigned long arg)
{
 unsigned char value;

 value = gpio_get_value(keydesc->gpio); /* 读取 IO 值 */
 if(value == 0){         /* 按下按键 */
  /* 上报按键值 */
  input_report_key(inputdev, KEY_0, 1); /* 最后一个参数 1，按下 */
  input_sync(inputdev);      /* 同步事件 */
 } else {        /* 按键松开 */
  input_report_key(inputdev, KEY_0, 0); /* 最后一个参数 0，松开 */
  input_sync(inputdev);      /* 同步事件 */
 }
}
```

最后放一个驱动 demo，keyinput.c

```
#include <linux/types.h>
#include <linux/kernel.h>
#include <linux/delay.h>
#include <linux/ide.h>
#include <linux/init.h>
#include <linux/module.h>
#include <linux/errno.h>
#include <linux/gpio.h>
#include <linux/cdev.h>
#include <linux/device.h>
#include <linux/of.h>
#include <linux/of_address.h>
#include <linux/of_gpio.h>
#include <linux/input.h>
#include <linux/semaphore.h>
#include <linux/timer.h>
#include <linux/of_irq.h>
#include <linux/irq.h>
#include <asm/mach/map.h>
#include <asm/uaccess.h>
#include <asm/io.h>

#define KEYINPUT_CNT  1   /* 设备号个数  */
#define KEYINPUT_NAME  "keyinput" /* 名字   */
#define KEY0VALUE   0X01  /* KEY0按键值  */
#define INVAKEY    0XFF  /* 无效的按键值 */
#define KEY_NUM    1   /* 按键数量  */

/* 中断IO描述结构体 */
struct irq_keydesc {
 int gpio;        /* gpio */
 int irqnum;        /* 中断号     */
 unsigned char value;     /* 按键对应的键值 */
 char name[10];       /* 名字 */
 irqreturn_t (*handler)(int, void *); /* 中断服务函数 */
};

/* keyinput设备结构体 */
struct keyinput_dev{
 dev_t devid;   /* 设备号   */
 struct cdev cdev;  /* cdev  */
 struct class *class; /* 类   */
 struct device *device; /* 设备   */
 struct device_node *nd; /* 设备节点 */
 struct timer_list timer;/* 定义一个定时器*/
 struct irq_keydesc irqkeydesc[KEY_NUM]; /* 按键描述数组 */
 unsigned char curkeynum;    /* 当前的按键号 */
 struct input_dev *inputdev;  /* input结构体 */
};

struct keyinput_dev keyinputdev; /* key input设备 */

/* @description  : 中断服务函数，开启定时器，延时10ms，
 *         定时器用于按键消抖。
 * @param - irq  : 中断号 
 * @param - dev_id : 设备结构。
 * @return    : 中断执行结果
 */
static irqreturn_t key0_handler(int irq, void *dev_id)
{
 struct keyinput_dev *dev = (struct keyinput_dev *)dev_id;

 dev->curkeynum = 0;
 dev->timer.data = (volatile long)dev_id;
 mod_timer(&dev->timer, jiffies + msecs_to_jiffies(10)); /* 10ms定时 */
 return IRQ_RETVAL(IRQ_HANDLED);
}

/* @description : 定时器服务函数，用于按键消抖，定时器到了以后
 *      再次读取按键值，如果按键还是处于按下状态就表示按键有效。
 * @param - arg : 设备结构变量
 * @return   : 无
 */
void timer_function(unsigned long arg)
{
 unsigned char value;
 unsigned char num;
 struct irq_keydesc *keydesc;
 struct keyinput_dev *dev = (struct keyinput_dev *)arg;

 num = dev->curkeynum;
 keydesc = &dev->irqkeydesc[num];
 value = gpio_get_value(keydesc->gpio);  /* 读取IO值 */
 if(value == 0){       /* 按下按键 */
  /* 上报按键值 */
  //input_event(dev->inputdev, EV_KEY, keydesc->value, 1);
  input_report_key(dev->inputdev, keydesc->value, 1);/* 最后一个参数表示按下还是松开，1为按下，0为松开 */
  input_sync(dev->inputdev);
 } else {          /* 按键松开 */
  //input_event(dev->inputdev, EV_KEY, keydesc->value, 0);
  input_report_key(dev->inputdev, keydesc->value, 0);
  input_sync(dev->inputdev);
 } 
}

/*
 * @description : 按键IO初始化
 * @param   : 无
 * @return   : 无
 */
static int keyio_init(void)
{
 unsigned char i = 0;
 char name[10];
 int ret = 0;
 
 keyinputdev.nd = of_find_node_by_path("/key");
 if (keyinputdev.nd== NULL){
  printk("key node not find!\r\n");
  return -EINVAL;
 } 

 /* 提取GPIO */
 for (i = 0; i < KEY_NUM; i++) {
  keyinputdev.irqkeydesc[i].gpio = of_get_named_gpio(keyinputdev.nd ,"key-gpio", i);
  if (keyinputdev.irqkeydesc[i].gpio < 0) {
   printk("can't get key%d\r\n", i);
  }
 }
 
 /* 初始化key所使用的IO，并且设置成中断模式 */
 for (i = 0; i < KEY_NUM; i++) {
  memset(keyinputdev.irqkeydesc[i].name, 0, sizeof(name)); /* 缓冲区清零 */
  sprintf(keyinputdev.irqkeydesc[i].name, "KEY%d", i);  /* 组合名字 */
  gpio_request(keyinputdev.irqkeydesc[i].gpio, name);
  gpio_direction_input(keyinputdev.irqkeydesc[i].gpio); 
  keyinputdev.irqkeydesc[i].irqnum = irq_of_parse_and_map(keyinputdev.nd, i);
 }
 /* 申请中断 */
 keyinputdev.irqkeydesc[0].handler = key0_handler;
 keyinputdev.irqkeydesc[0].value = KEY_0;
 
 for (i = 0; i < KEY_NUM; i++) {
  ret = request_irq(keyinputdev.irqkeydesc[i].irqnum, keyinputdev.irqkeydesc[i].handler, 
                   IRQF_TRIGGER_FALLING|IRQF_TRIGGER_RISING, keyinputdev.irqkeydesc[i].name, &keyinputdev);
  if(ret < 0){
   printk("irq %d request failed!\r\n", keyinputdev.irqkeydesc[i].irqnum);
   return -EFAULT;
  }
 }

 /* 创建定时器 */
 init_timer(&keyinputdev.timer);
 keyinputdev.timer.function = timer_function;

 /* 申请input_dev */
 keyinputdev.inputdev = input_allocate_device();
 keyinputdev.inputdev->name = KEYINPUT_NAME;
#if 0
 /* 初始化input_dev，设置产生哪些事件 */
 __set_bit(EV_KEY, keyinputdev.inputdev->evbit); /* 设置产生按键事件          */
 __set_bit(EV_REP, keyinputdev.inputdev->evbit); /* 重复事件，比如按下去不放开，就会一直输出信息    */

 /* 初始化input_dev，设置产生哪些按键 */
 __set_bit(KEY_0, keyinputdev.inputdev->keybit); 
#endif

#if 0
 keyinputdev.inputdev->evbit[0] = BIT_MASK(EV_KEY) | BIT_MASK(EV_REP);
 keyinputdev.inputdev->keybit[BIT_WORD(KEY_0)] |= BIT_MASK(KEY_0);
#endif

 keyinputdev.inputdev->evbit[0] = BIT_MASK(EV_KEY) | BIT_MASK(EV_REP);
 input_set_capability(keyinputdev.inputdev, EV_KEY, KEY_0);

 /* 注册输入设备 */
 ret = input_register_device(keyinputdev.inputdev);
 if (ret) {
  printk("register input device failed!\r\n");
  return ret;
 }
 return 0;
}

/*
 * @description : 驱动入口函数
 * @param   : 无
 * @return   : 无
 */
static int __init keyinput_init(void)
{
 keyio_init();
 return 0;
}

/*
 * @description : 驱动出口函数
 * @param   : 无
 * @return   : 无
 */
static void __exit keyinput_exit(void)
{
 unsigned int i = 0;
 /* 删除定时器 */
 del_timer_sync(&keyinputdev.timer); /* 删除定时器 */
  
 /* 释放中断 */
 for (i = 0; i < KEY_NUM; i++) {
  free_irq(keyinputdev.irqkeydesc[i].irqnum, &keyinputdev);
 }
 /* 释放input_dev */
 input_unregister_device(keyinputdev.inputdev);
 input_free_device(keyinputdev.inputdev);
}

module_init(keyinput_init);
module_exit(keyinput_exit);
MODULE_LICENSE("GPL");
MODULE_AUTHOR("xxx");
```

编写测试 APP，keyinputApp.c

```
#include "stdio.h"
#include "unistd.h"
#include "sys/types.h"
#include "sys/stat.h"
#include "sys/ioctl.h"
#include "fcntl.h"
#include "stdlib.h"
#include "string.h"
#include <poll.h>
#include <sys/select.h>
#include <sys/time.h>
#include <signal.h>
#include <fcntl.h>
#include <linux/input.h>

/* 定义一个input_event变量，存放输入事件信息 */
static struct input_event inputevent;

/*
 * @description  : main主程序
 * @param - argc  : argv数组元素个数
 * @param - argv  : 具体参数
 * @return    : 0 成功;其他 失败
 */
int main(int argc, char *argv[])
{
 int fd;
 int err = 0;
 char *filename;

 filename = argv[1];

 if(argc != 2) {
  printf("Error Usage!\r\n");
  return -1;
 }

 fd = open(filename, O_RDWR);
 if (fd < 0) {
  printf("Can't open file %s\r\n", filename);
  return -1;
 }

 while (1) {
  err = read(fd, &inputevent, sizeof(inputevent));
  if (err > 0) { /* 读取数据成功 */
   switch (inputevent.type) {

    case EV_KEY:
     if (inputevent.code < BTN_MISC) { /* 键盘键值 */
      printf("key %d %s\r\n", inputevent.code, inputevent.value ? "press" : "release");
     } else {
      printf("button %d %s\r\n", inputevent.code, inputevent.value ? "press" : "release");
     }
     break;

    /* 其他类型的事件，自行处理 */
    case EV_REL:
     break;
    case EV_ABS:
     break;
    case EV_MSC:
     break;
    case EV_SW:
     break;
   }
  } else {
   printf("读取数据失败\r\n");
  }
 }
 return 0;
}
```

编辑于 2022-03-31 21:54[PMP百科全书-2024年超全版](https://zhuanlan.zhihu.com/p/676721837)

[

一、PMP是什么PMP（Project Management Professional）是一种专业的项目管理资格认...

](https://zhuanlan.zhihu.com/p/676721837)