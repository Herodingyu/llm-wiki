---
title: "Linux input 子系统详解"
source: "https://zhuanlan.zhihu.com/p/405197103"
author:
  - "[[一口Linux《从零开始学ARM》作者，带你入门]]"
published:
created: 2026-05-02
description: "1.	模块概述1.1.相关资料和代码研究 drivers/input/ include/uapi/linux/input-event-codes.h 2.	模块功能linux核心的输入框架 3.	模块学习3.1.概述 Linux输入设备种类繁杂，常见的包括触摸屏、键盘、鼠标、摇杆等…"
tags:
  - "clippings"
---
[收录于 · 手把手教你Linux驱动入门](https://www.zhihu.com/column/c_1278634350209007616)

7 人赞同了该文章

**1\. 模块概述**

## 1.1.相关资料和代码研究

```
drivers/input/
include/uapi/linux/input-event-codes.h
```

## 2\. 模块功能

linux核心的输入框架

## 3\. 模块学习

## 3.1.概述

Linux输入设备种类繁杂，常见的包括触摸屏、键盘、鼠标、摇杆等；这些输入设备属于 [字符设备](https://zhida.zhihu.com/search?content_id=178173873&content_type=Article&match_order=1&q=%E5%AD%97%E7%AC%A6%E8%AE%BE%E5%A4%87&zhida_source=entity) ，而linux将这些设备的共同特性抽象出来，Linux input 子系统就产生了。

## 3.2.软件架构

输入子系统是由设备驱动层（input driver)、输入核心层（input core)、输入事件处理层（input event handle)组成，具体架构如图4.1所示：

![](https://pic2.zhimg.com/v2-3ada226d6aa020ee8b0867c19155c089_1440w.jpg)

- （1）input设备驱动层：负责具体的硬件设备，将底层的硬件输入转化为统一的事件形式，向input核心层和汇报； \*（2）input核心层：连接input设备驱动层与input事件处理层，向下提供驱动层的接口，向上提供事件处理层的接口； \*（3）input事件处理层：为不同硬件类型提供了用户访问以及处理接口，将硬件驱动层传来的事件报告给用户程序。

在input子系统中，每个事件的发生都使用事件（type）->子事件（code）->值（value） 所有的输入设备的主设备号都是13，input-core通过次设备来将输入设备进行分类，如0-31是游戏杆，32-63是鼠标（对应Mouse Handler)、64-95是事件设备（如触摸屏，对应Event Handler)。

Linux输入子系统支持的数据类型

| 时间类型 | 编码 | 含义 |
| --- | --- | --- |

定义的按键值

```
#define KEY_RESERVED           0
#define KEY_ESC                 1
#define KEY_1                   2
#define KEY_2                   3
#define KEY_3                   4
#define KEY_4                   5
#define KEY_5                   6
#define KEY_6                   7
#define KEY_7                   8
#define KEY_8                   9
#define KEY_9                   10
#define KEY_0                   11
...
```

## 3.3.数据结构

三个数据结构input\_dev，input\_handle，input\_handler之间的关系如图4.2、4.3所示

![](https://picx.zhimg.com/v2-667fefedfba177e8ae1e68f903b79b35_1440w.jpg)

![](https://picx.zhimg.com/v2-9c492b9ac17c04497393c1c11aa27257_1440w.jpg)

```
input_dev：是硬件驱动层，代表一个input设备。
input_handler：是事件处理层，代表一个事件处理器。
input_handle：属于核心层，代表一个配对的input设备与input事件处理器。
input_dev 通过全局的input_dev_list链接在一起，设备注册的时候完成这个操作。
```

input\_handler 通过全局的input\_handler\_list链接在一起。事件处理器注册的时候实现了这个操作（事件处理器一般内核自带，不需要我们来写）

input\_hande 没有一个全局的链表，它注册的时候将自己分别挂在了input\_dev 和 input\_handler 的h\_list上了。通过input\_dev 和input\_handler就可以找到input\_handle在设备注册和事件处理器，注册的时候都要进行配对工作，配对后就会实现链接。通过input\_handle也可以找到input\_dev和input\_handler。

我们可以看到，input\_device和input\_handler中都有一个h\_list,而input\_handle拥有指向input\_dev和input\_handler的指针，也就是说input\_handle是用来关联input\_dev和input\_handler的。

**那么为什么一个input\_device和input\_handler中拥有的是h\_list而不是一个handle呢？** 因为一个device可能对应多个handler,而一个handler也不能只处理一个device,比如说一个鼠标，它可以对应even handler，也可以对应mouse handler,因此当其注册时与系统中的handler进行匹配，就有可能产生两个实例，一个是 [evdev](https://zhida.zhihu.com/search?content_id=178173873&content_type=Article&match_order=1&q=evdev&zhida_source=entity),另一个是mousedev,而任何一个实例中都只有一个handle。 至于以何种方式来传递事件，就由用户程序打开哪个实例来决定。后面一个情况很容易理解，一个事件驱动不能只为一个甚至一种设备服务，系统中可能有多种设备都能使用这类handler,比如event handler就可以匹配所有的设备。在input子系统中，有8种事件驱动，每种事件驱动最多可以对应32个设备，因此dev实例总数最多可以达到256个

### 3.3.1. Input\_dev

输入设备

```
/* include/linux/input.h */
struct input_dev {
     const char *name;  /* 设备名称 */
     const char *phys;  /* 设备在系统中的路径 */
     const char *uniq;  /* 设备唯一id */
     struct input_id id;  /* input设备id号 */

     unsigned long propbit[BITS_TO_LONGS(INPUT_PROP_CNT)];

     unsigned long evbit[BITS_TO_LONGS(EV_CNT)];  /* 设备支持的事件类型，主要有EV_SYNC，EV_KEY，EV_KEY,EV_REL,EV_ABS等*/ 
unsigned long keybit[BITS_TO_LONGS(KEY_CNT)];  /* 按键所对应的位图 */
     unsigned long relbit[BITS_TO_LONGS(REL_CNT)];  /* 相对坐标对应位图 */
     unsigned long absbit[BITS_TO_LONGS(ABS_CNT)];  /* 决定左边对应位图 */
     unsigned long mscbit[BITS_TO_LONGS(MSC_CNT)];  /* 支持其他事件 */
     unsigned long ledbit[BITS_TO_LONGS(LED_CNT)];  /* 支持led事件 */
     unsigned long sndbit[BITS_TO_LONGS(SND_CNT)];  /* 支持声音事件 */
     unsigned long ffbit[BITS_TO_LONGS(FF_CNT)];  /* 支持受力事件 */
     unsigned long swbit[BITS_TO_LONGS(SW_CNT)];  /* 支持开关事件 */

     unsigned int hint_events_per_packet;  /*  平均事件数*/

     unsigned int keycodemax;  /* 支持最大按键数 */
     unsigned int keycodesize;  /* 每个键值字节数 */
     void *keycode;  /* 存储按键值的数组的首地址 */

     int (*setkeycode)(struct input_dev *dev,
                 const struct input_keymap_entry *ke, unsigned int *old_keycode);
     int (*getkeycode)(struct input_dev *dev, struct input_keymap_entry *ke);

     struct ff_device *ff;  /* 设备关联的反馈结构，如果设备支持 */

     unsigned int repeat_key;  /* 最近一次按键值，用于连击 */
     struct timer_list timer;  /* 自动连击计时器 */

     int rep[REP_CNT];  /* 自动连击参数 */

     struct input_mt *mt;  /* 多点触控区域 */

     struct input_absinfo *absinfo;  /* 存放绝对值坐标的相关参数数组 */

     unsigned long key[BITS_TO_LONGS(KEY_CNT)];  /* 反应设备当前的案件状态 */
     unsigned long led[BITS_TO_LONGS(LED_CNT)];  /* 反应设备当前的led状态 */
     unsigned long snd[BITS_TO_LONGS(SND_CNT)];  /* 反应设备当前的声音状态 */
     unsigned long sw[BITS_TO_LONGS(SW_CNT)];  /* 反应设备当前的开关状态 */

     int (*open)(struct input_dev *dev);  /* 第一次打开设备时调用，初始化设备用 */
     void (*close)(struct input_dev *dev);  /* 最后一个应用程序释放设备事件，关闭设备 */
     int (*flush)(struct input_dev *dev, struct file *file); /* 用于处理传递设备的事件 */
int (*event)(struct input_dev *dev, unsigned int type, unsigned int code,          int value);  /* 事件处理函数，主要是接收用户下发的命令，如点亮led */

     struct input_handle __rcu *grab;  /* 当前占有设备的input_handle */

     spinlock_t event_lock;  /* 事件锁 */
     struct mutex mutex;  /* 互斥体 */

     unsigned int users;  /* 打开该设备的用户数量（input_handle） */
     bool going_away;  /* 标记正在销毁的设备 */

     struct device dev;  /* 一般设备 */

     struct list_head h_list;  /* 设备所支持的input handle */
     struct list_head node;  /* 用于将此input_dev连接到input_dev_list */

     unsigned int num_vals;  /* 当前帧中排队的值数 */
     unsigned int max_vals;  /*  队列最大的帧数*/
     struct input_value *vals;  /*  当前帧中排队的数组*/

     bool devres_managed; /* 表示设备被devres 框架管理，不需要明确取消和释放*/
};
```

### 3.3.2. Input\_handler

处理具体的输入事件的具体函数

```
/* include/linux/input.h */
struct input_handler {

     void *private;  /* 存放handle数据 */

void (*event)(struct input_handle *handle, unsigned int type, unsigned  int code, int value);
     void (*events)(struct input_handle *handle,
             const struct input_value *vals, unsigned int count);
bool (*filter)(struct input_handle *handle, unsigned int type, unsigned int code, int value);
     bool (*match)(struct input_handler *handler, struct input_dev *dev);
int (*connect)(struct input_handler *handler, struct input_dev *dev, const  struct input_device_id *id);
     void (*disconnect)(struct input_handle *handle);
     void (*start)(struct input_handle *handle);

     bool legacy_minors;
     int minor;
     const char *name;  /* 名字 */

     const struct input_device_id *id_table;  /* input_dev匹配用的id */

struct list_head h_list; /* 用于链接和handler相关的handle，input_dev与input_handler配对之后就会生成一个input_handle结构 */
     struct list_head node;  /* 用于将该handler链入input_handler_list，链接所有注册到内核的所有注册到内核的事件处理器 */
};
```

### 3.3.3. Input\_handle

连接输入设备和处理函数

```
/* include/linux/input.h */
struct input_handle {
     void *private;  /* 数据指针 */

     int open;  /* 打开标志，每个input_handle 打开后才能操作 */
     const char *name;  /* 设备名称 */

     struct input_dev *dev;  /* 指向所属的input_dev */
     struct input_handler *handler;  /* 指向所属的input_handler */

     struct list_head d_node;  /* 用于链入所指向的input_dev的handle链表 */
     struct list_head h_node;  /* 用于链入所指向的input_handler的handle链表 */
};
```

### 3.3.4. Evdev

字符设备事件

```
/* drivers/input/evdev.c */
struct evdev {
     int open;    /* 设备被打开的计数 */
     struct input_handle handle;  /* 关联的input_handle */ 
     wait_queue_head_t wait;  /* 等待队列，当前进程读取设备，没有事件产生时，
进程就会sleep */
     struct evdev_client __rcu *grab;  /* event响应 */
struct list_head client_list;  /* evdev_client链表，说明evdev设备可以处理多个 evdev _client，可以有多个进程访问evdev设备 */
     spinlock_t client_lock;
     struct mutex mutex;
     struct device dev;
     struct cdev cdev;
     bool exist;   /* 设备存在判断 */
};
```

### 3.3.5. evdev\_client

字符设备事件响应

```
/* drivers/input/evdev.c */
struct evdev_client {
     unsigned int head;  /* 动态索引，每加入一个event到buffer中，head++ */
     unsigned int tail;  /* 动态索引，每取出一个buffer中到event，tail++ */
     unsigned int packet_head;  /* 数据包头部 */
     spinlock_t buffer_lock;  
     struct fasync_struct *fasync;  /* 异步通知函数 */
     struct evdev *evdev;  
     struct list_head node;  /* evdev_client链表项 */
     int clkid;
     unsigned int bufsize;
     struct input_event buffer[];  /* 用来存放input_dev事件缓冲区 */
};
```

### 3.3.6. Evdev\_handler

evdev\_handler事件处理函数

```
/* drivers/input/input.c */
static struct input_handler evdev_handler = {
     .event  = evdev_event,   /* 事件处理函数， */  
     .events = evdev_events,  /* 事件处理函数， */
     .connect = evdev_connect, /* 连接函数，将事件处理和输入设备联系起来 */
     .disconnect = evdev_disconnect,  /* 断开该链接 */
     .legacy_minors = true,
     .minor  = EVDEV_MINOR_BASE,
     .name  = "evdev", /* handler名称 */
     .id_table = evdev_ids, /* 断开该链接 */
};
```

### 3.3.7. input\_event

标准按键编码信息

```
/* drivers/input/evdev.c */
struct input_event {                                                            
    struct timeval time;   /* 事件发生的时间  */                                
    __u16 type;             /* 事件类型 */                                      
    __u16 code;             /* 事件码 */                                        
    __s32 value;            /* 事件值 */                                        
};
```

### 3.3.8. input\_id

和input输入设备相关的id信息

```
/* include/uapi/linux/input.h */
struct input_id {  
    __u16 bustype;  /* 总线类型 */  
    __u16 vendor;  /* 生产厂商 */  
    __u16 product;  /* 产品类型 */ 
    __u16 version;  /* 版本 */
 };
```

### 3.3.9. input\_device\_id

```
/* include/uapi/linux/input.h */
struct input_device_id {

     kernel_ulong_t flags;

     __u16 bustype;  /* 总线类型 */
     __u16 vendor;  /* 生产厂商 */
     __u16 product;  /* 产品类型 */
     __u16 version;  /* 版本 */

     kernel_ulong_t evbit[INPUT_DEVICE_ID_EV_MAX / BITS_PER_LONG + 1];
     kernel_ulong_t keybit[INPUT_DEVICE_ID_KEY_MAX / BITS_PER_LONG + 1];
     kernel_ulong_t relbit[INPUT_DEVICE_ID_REL_MAX / BITS_PER_LONG + 1];
     kernel_ulong_t absbit[INPUT_DEVICE_ID_ABS_MAX / BITS_PER_LONG + 1];
     kernel_ulong_t mscbit[INPUT_DEVICE_ID_MSC_MAX / BITS_PER_LONG + 1];
     kernel_ulong_t ledbit[INPUT_DEVICE_ID_LED_MAX / BITS_PER_LONG + 1];
     kernel_ulong_t sndbit[INPUT_DEVICE_ID_SND_MAX / BITS_PER_LONG + 1];
     kernel_ulong_t ffbit[INPUT_DEVICE_ID_FF_MAX / BITS_PER_LONG + 1];
     kernel_ulong_t swbit[INPUT_DEVICE_ID_SW_MAX / BITS_PER_LONG + 1];
     kernel_ulong_t propbit[INPUT_DEVICE_ID_PROP_MAX / BITS_PER_LONG + 1];

     kernel_ulong_t driver_info;
};
```

### 3.3.10. input\_even

输入事件的传递已input\_event为基本单位

```
struct input_event {
 struct timeval time; //时间戳
     __u16 type; //事件总类型
     __u16 code; //事件子类型
     __s32 value; //事件值
};
```

## 3.4. Linux input 子系统关键流程

核心层，执行的时候会注册设备号，然后在handler层注册input\_handler，也就是evdev\_handler会注册到核心层维护的链表中。

然后进行硬件初始化获取数据，而且需要将设备注册到链表中。注册进来就就会遍历input\_handler\_list链表，找到对应的handler，匹配成功后会调用connect方法。connect分配evdev，evdev就记录了input\_handler和input\_device之间的关系，同时创建设备节点，还会注册cdev从而可以让应用调用。

当应用程序调用open，read等接口的时候就会调用input\_handler层实现的xxx\_open，那么open就会分配好evdev\_client，最终在input\_dev层上报数据的时候会自动调用input\_handler，input\_handler就会调用events填充上报的数据到缓冲区client，此时如果没有唤醒队列的话应用read的时候会阻塞，而唤醒队列后最终使用copy\_to\_user来给应用数据。 设备驱动程序上报事件的函数有：

```
input_report_key //上报按键事件
input_report_rel //上报相对坐标事件
input_report_abs //上报绝对坐标事件
input_report_ff_status
input_report_switch
input_sync //上报完成后需要调用这些函数来通知系统处理完整事件 
input_mt_sync //上报完成后需要调用这些函数来通知系统处理完整事件
```

这些函数其实是input\_event函数的封装，调用的都是input\_event函数，在输入设备驱动(input\_dev)中，一般通过轮询或 [中断方式](https://zhida.zhihu.com/search?content_id=178173873&content_type=Article&match_order=1&q=%E4%B8%AD%E6%96%AD%E6%96%B9%E5%BC%8F&zhida_source=entity) 获取输入事件的原始值（raw value)，经过处理后再使用input\_event()函数上报；核心层将事件数据（type、code、value)打包、分发至事件处理器；调用关系为：input\_event->input\_handle\_event->input\_pass\_values，这一函数都在input.c实现。

### 3.4.1. Input 设备注册流程

输入设备注册过程如图4.3所示

![](https://picx.zhimg.com/v2-6a57036f8f860ab4783f68f2f6ae4b51_1440w.jpg)

### 3.4.2. 连接设备流程

连接设备流程如图4.4所示

![](https://pic2.zhimg.com/v2-b8cd1c4f1b97fc8be003c0ef05ed3b37_1440w.jpg)

### 3.4.3. 事件上报流程

事件上报流程如图4.5所示

![](https://pic2.zhimg.com/v2-dbb1de4bc5bb040a3255ab28fd3c0895_1440w.jpg)

### 3.4.4. 数据读取流程

数据读取流程如图4.6所示

![](https://pica.zhimg.com/v2-5f928e7caa781dac5da2b1abc509a972_1440w.jpg)

## 3.5.关键函数解析

### 3.5.1. input\_init

input子系统使用subsys\_initcall宏修饰input\_init()函数在内核启动阶段被调用。input\_init()函数在内核启动阶段被调用。input\_init()函数的主要工作是：在sys [文件系统](https://zhida.zhihu.com/search?content_id=178173873&content_type=Article&match_order=1&q=%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F&zhida_source=entity) 下创建一个设备类（/sys/class/input），调用register\_chrdev()函数注册input设备。

```
/* drivers/input/input.c */
static int __init input_init(void)
{
     int err;

     err = class_register(&input_class);  /* 注册类，放在sys/class下 */  
     if (err) {
          pr_err("unable to register input_dev class\n");
          return err;
     }

     err = input_proc_init();  /* 在proc目录下建立相关目录 */
     if (err)
          goto fail1;

     err = register_chrdev_region(MKDEV(INPUT_MAJOR, 0),
        INPUT_MAX_CHAR_DEVICES, "input");  /* 注册字符设备编号，INPUT_MAJOR   永远是13 */  
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

### 3.5.2. Input\_register\_device

```
/* drivers/input/input.c */
int input_register_device(struct input_dev *dev)
{
    struct atomic_t  input_no = ATOMIC_INIT(0);
     struct input_devres *devres = NULL;
     struct input_handler *handler;
     unsigned int packet_size;
     const char *path;
     int error;

     if (dev->devres_managed) {
          devres = devres_alloc(devm_input_device_unregister,
                  sizeof(*devres), GFP_KERNEL);
      if (!devres)
           return -ENOMEM;

      devres->input = dev;
 }

     /* 每个input_device都会产生EV_SYN/SYN_REPORT时间，所以就放在一起设置 */
     __set_bit(EV_SYN, dev->evbit);

     /* KEY_RESERVED is not supposed to be transmitted to userspace. */
     __clear_bit(KEY_RESERVED, dev->keybit);

     /* 没有设置的位，确保被清零 */
     input_cleanse_bitmasks(dev);
     /*  */
     packet_size = input_estimate_events_per_packet(dev);
     if (dev->hint_events_per_packet < packet_size)
           dev->hint_events_per_packet = packet_size;

     dev->max_vals = dev->hint_events_per_packet + 2;
     dev->vals = kcalloc(dev->max_vals, sizeof(*dev->vals), GFP_KERNEL);
     if (!dev->vals) {
          error = -ENOMEM;
          goto err_devres_free;
     }

    /* 如果延时周期是程序预先设定的，那么是由驱动自动处理，主要是为了处理重复按键 */
     init_timer(&dev->timer);
     if (!dev->rep[REP_DELAY] && !dev->rep[REP_PERIOD]) {
          dev->timer.data = (long) dev;
          dev->timer.function = input_repeat_key;
          dev->rep[REP_DELAY] = 250;
          dev->rep[REP_PERIOD] = 33;
      }

     if (!dev->getkeycode)  /* 获取按键值 */
          dev->getkeycode = input_default_getkeycode;

     if (!dev->setkeycode)  /* 设置按键值 */
          dev->setkeycode = input_default_setkeycode;

     error = device_add(&dev->dev);  /* 将dev注册到sys */
     if (error)
          goto err_free_vals;

     path = kobject_get_path(&dev->dev.kobj, GFP_KERNEL);
     pr_info("%s as %s\n",
      dev->name ? dev->name : "Unspecified device", path ? path : "N/A");
     kfree(path);

     error = mutex_lock_interruptible(&input_mutex);
     if (error)
          goto err_device_del;

     list_add_tail(&dev->node, &input_dev_list);  /* 将新的dev放入链表中 */
/* 遍历input_handler_list链表中的所有input_handler，是否支持这个新input_dev ；
若两者支持，便进行连接 */
     list_for_each_entry(handler, &input_handler_list, node)
      input_attach_handler(dev, handler); 

     input_wakeup_procfs_readers();

     mutex_unlock(&input_mutex);

     if (dev->devres_managed) {
      dev_dbg(dev->dev.parent, "%s: registering %s with devres.\n",
           __func__, dev_name(&dev->dev));
      devres_add(dev->dev.parent, devres);
  }
 return 0;

err_device_del:
     device_del(&dev->dev);
err_free_vals:
     kfree(dev->vals);
     dev->vals = NULL;
err_devres_free:
     devres_free(devres);
     return error;
}
EXPORT_SYMBOL(input_register_device);
```

input\_dev\_list和input\_handler\_list是全局的一个 [链表](https://zhida.zhihu.com/search?content_id=178173873&content_type=Article&match_order=11&q=%E9%93%BE%E8%A1%A8&zhida_source=entity)

```
static LIST_HEAD(input_dev_list);
static LIST_HEAD(input_handler_list);
```

list\_for\_each\_entry是一个宏，展开如下 获取input\_handler\_list的每一项和input\_dev匹配，通过for循环遍历.

```
for (handler = list_first_entry(input_handler_list, &handler, node); 
     &handler->node != (input_handler_list);     
     &handler = list_next_entry(&handler, node))

     input_attach_handler(dev, handler);
```

list\_first\_entry 获得第一个列表元素 list\_next\_entry 获得下一个列表元素

### 3.5.3. input\_register\_handle

注册一个handle，链接input\_handler和input\_dev的h\_list

```
/* drivers/input/input.c */
int input_register_handle(struct input_handle *handle)
{
     struct input_handler *handler = handle->handler;
     struct input_dev *dev = handle->dev;
     int error;

     error = mutex_lock_interruptible(&dev->mutex);
     if (error)
         return error;
    
     if (handler->filter)
          list_add_rcu(&handle->d_node, &dev->h_list);
     else
         list_add_tail_rcu(&handle->d_node, &dev->h_list);
/* 将handle的d_node，链接到其相关的input_dev的h_list链表中  */

     mutex_unlock(&dev->mutex);

     list_add_tail_rcu(&handle->h_node, &handler->h_list);
/* 将handle的h_node，链接到其相关的input_handler的h_list链表中 */

     if (handler->start)
          handler->start(handle);

 return 0;
}
EXPORT_SYMBOL(input_register_handle);
```

### 3.5.4. input\_register\_handler

注册一个事件，进行匹配设备和事件的绑定

```
/* drivers/input/input.c */
int input_register_handler(struct input_handler *handler)
{
     struct input_dev *dev;
     int error;

     error = mutex_lock_interruptible(&input_mutex);
     if (error)
          return error;

    INIT_LIST_HEAD(&handler->h_list);

     list_add_tail(&handler->node, &input_handler_list);  /* 连接到input_handler_list链表中 */
/* 遍历input_dev_list，配对 input_dev 和 handler */
     list_for_each_entry(dev, &input_dev_list, node)
      input_attach_handler(dev, handler);  /* event节点加入列表 */

     input_wakeup_procfs_readers();

     mutex_unlock(&input_mutex);
     return 0;
}
EXPORT_SYMBOL(input_register_handler);
```

### 3.5.5. evdev\_connect

事件处理器evdev，生成一个新的evdev设备，连接input核心， [回调函数](https://zhida.zhihu.com/search?content_id=178173873&content_type=Article&match_order=1&q=%E5%9B%9E%E8%B0%83%E5%87%BD%E6%95%B0&zhida_source=entity) 。

```
/* drivers/input/evdev.c */
static int evdev_connect(struct input_handler *handler, struct input_dev *dev,
    const struct input_device_id *id)
{
     struct evdev *evdev;
     int minor;
     int dev_no;
     int error;
    /* 获取次设备号，从evdev_table中找到一个未使用的最小的数组项，最大值32 */
     minor = input_get_new_minor(EVDEV_MINOR_BASE, EVDEV_MINORS, true);
     if (minor < 0) {
          error = minor;
          pr_err("failed to reserve new minor: %d\n", error);
          return error;
     }
    /* 分配空间 */
     evdev = kzalloc(sizeof(struct evdev), GFP_KERNEL);
     if (!evdev) {
          error = -ENOMEM;
          goto err_free_minor;
     }
/* 初始化client_list链表头，代表多少应用读写这个设备 */
     INIT_LIST_HEAD(&evdev->client_list);    
     spin_lock_init(&evdev->client_lock);  /* 加锁 */ 
     mutex_init(&evdev->mutex);  /*  */
init_waitqueue_head(&evdev->wait);  /* 初始化等待队列，当evdev没有数据可读时，就 在 该队列上睡眠 */
     evdev->exist = true;  /* 设备存在 */

     dev_no = minor;
 
     if (dev_no < EVDEV_MINOR_BASE + EVDEV_MINORS)
          dev_no -= EVDEV_MINOR_BASE;
     dev_set_name(&evdev->dev, "event%d", dev_no);  /* 设置设备名为eventX */

     evdev->handle.dev = input_get_device(dev);  /* 获取设备 */
     evdev->handle.name = dev_name(&evdev->dev);  /* 设备名称 */
     evdev->handle.handler = handler;  /* handler绑定 */  
     evdev->handle.private = evdev;  /* evdev数据指向 */

     evdev->dev.devt = MKDEV(INPUT_MAJOR, minor);  /* sysfs下的设备号 */
     evdev->dev.class = &input_class;  /* 将input_class作为设备类 */
     evdev->dev.parent = &dev->dev;  /* input_dev作为evdev的父设备 */
     evdev->dev.release = evdev_free;  /* 释放函数 */
     device_initialize(&evdev->dev);  /* 初始化设备 */
        /* 注册一个handle处理事件 */
     error = input_register_handle(&evdev->handle); if (error)
          goto err_free_evdev;

     cdev_init(&evdev->cdev, &evdev_fops);  /* 字符设备初始化 */

     error = cdev_device_add(&evdev->cdev, &evdev->dev);  /* 添加字符设备 */
     if (error)
          goto err_cleanup_evdev;

     return 0;

err_cleanup_evdev:
     evdev_cleanup(evdev);
err_unregister_handle:
     input_unregister_handle(&evdev->handle);
err_free_evdev:
     put_device(&evdev->dev);
err_free_minor:
     input_free_minor(minor);
     return error;
}
```
- （1）是在保存区驱动设备名字，比如下图（键盘驱动）event1：因为没有设置设备号，默认从小到大排序，其中event0是表示 [input子系统](https://zhida.zhihu.com/search?content_id=178173873&content_type=Article&match_order=4&q=input%E5%AD%90%E7%B3%BB%E7%BB%9F&zhida_source=entity) ，所以键盘驱动名字就是event1。
- （2）是保存驱动设备的主次设备号，其中主设备号INPUT\_MAJOR=13，次设备号=EVSEV\_MINOR\_BASE+ [驱动程序](https://zhida.zhihu.com/search?content_id=178173873&content_type=Article&match_order=2&q=%E9%A9%B1%E5%8A%A8%E7%A8%8B%E5%BA%8F&zhida_source=entity) 本身设备号。
- （3）会在/sys/class/input类下创建驱动设备event%d，比如键盘驱动event1
- （4）最终进入input\_register\_handler()函数来注册handle。

### 3.5.6. input\_attach\_handler

设备匹配具体实现

```
/* drivers/input/input.c */
static int input_attach_handler(struct input_dev *dev, struct input_handler *handler)  
{  
    const struct input_device_id *id;  
    int error;  

/* blacklist是handler该忽略input设备类型 */    
    if (handler->blacklist && input_match_device(handler->blacklist, dev))  
        return -ENODEV;  
        id = input_match_device(handler->id_table, dev);  
    /* 这个是主要的配对函数，匹配handler和device的ID */
    if (!id)  
        return -ENODEV;  
  
    error = handler->connect(handler, dev, id);  
    /* 配对成功调用handler的connect函数，这个函数在事件处理器中定义，主要生成一个input_handle结构，并初始化，还生成一个事件处理器相关的设备结构 */
    if (error && error != -ENODEV)  
        printk(KERN_ERR  
            "input: failed to attach handler %s to device %s, "  
            "error: %d\n",  
            handler->name, kobject_name(&dev->dev.kobj), error);  
        /* 出错处理 */  
    return error;  
 }
```

### 3.5.7. input\_match\_device

比较input\_dev中的id和handler支持的id，存放在handler中的id\_table。

```
/* drivers/input/input.c */
static const struct input_device_id *input_match_device(struct input_handler *handler, struct input_dev *dev)
{
     const struct input_device_id *id;
    /* 遍历id_table的id匹配 */
     for (id = handler->id_table; id->flags || id->driver_info; id++) {
          if (input_match_device_id(dev, id) &&
              (!handler->match || handler->match(handler, dev))) {
               return id;
          }
      }

     return NULL;
}
```

### 3.5.8. input\_allocate\_device

初始化input\_dev设备

```
/* drivers/input/evdev.c */
struct input_dev *input_allocate_device(void)
{
     static atomic_t input_no = ATOMIC_INIT(-1);
     struct input_dev *dev;
/* 遍历id_table的id匹配 */
     dev = kzalloc(sizeof(*dev), GFP_KERNEL);
     if (dev) {
          dev->dev.type = &input_dev_type;
          dev->dev.class = &input_class;
          device_initialize(&dev->dev);
          mutex_init(&dev->mutex);
          spin_lock_init(&dev->event_lock);
          timer_setup(&dev->timer, NULL, 0);
          INIT_LIST_HEAD(&dev->h_list);
          INIT_LIST_HEAD(&dev->node);

           dev_set_name(&dev->dev, "input%lu",
        (unsigned long)atomic_inc_return(&input_no));

  __module_get(THIS_MODULE);
 }

 return dev;
}
EXPORT_SYMBOL(input_allocate_device);
```

### 3.5.9. input\_event

调用input\_handle\_event进行事件处理 dev是上报事件的设备，type是事件总类型，code是事件子类型，value是事件值。

```
/* drivers/input/input.c */
void (struct input_dev *dev, unsigned int type, unsigned int code, int value)
{
     unsigned long flags;
    /* 判断输入事件是否支持该设备 */
     if (is_event_supported(type, dev->evbit, EV_MAX)) {
spin_lock_irqsave(&dev->event_lock, flags);  /* 事件加锁 */
          input_handle_event(dev, type, code, value); /* 发送事件调用input_pass_values */
          spin_unlock_irqrestore(&dev->event_lock, flags);
     }
}EXPORT_SYMBOL(input_event);
```

### 3.5.10. input\_handle\_event

按键上报的处理函数

```
/* drivers/input/input.c */
static void input_handle_event(struct input_dev *dev,
          unsigned int type, unsigned int code, int value)
{   /* 处理事件 */
     int disposition = input_get_disposition(dev, type, code, &value);
/* 处理EV_SYN事件 */
     if (disposition != INPUT_IGNORE_EVENT && type != EV_SYN)
          add_input_randomness(type, code, value);
/* 一些特殊事件需要对dev也上报，比如led */
     if ((disposition & INPUT_PASS_TO_DEVICE) && dev->event)
          dev->event(dev, type, code, value);

     if (!dev->vals)
          return;
    /* 向上层handler汇报事件 */
     if (disposition & INPUT_PASS_TO_HANDLERS) {
          struct input_value *v;

          if (disposition & INPUT_SLOT) {
               v = &dev->vals[dev->num_vals++];
               v->type = EV_ABS;
               v->code = ABS_MT_SLOT;
               v->value = dev->mt->slot;
          }
/* 缓存event事件 */
          v = &dev->vals[dev->num_vals++];
          v->type = type;
          v->code = code;
          v->value = value;
     }
    /* 向上层handler汇报事件，刷新缓冲区，上报event事件 */
     if (disposition & INPUT_FLUSH) {
          if (dev->num_vals >= 2)
               input_pass_values(dev, dev->vals, dev->num_vals);
          dev->num_vals = 0;
       /* 缓冲的时间超过上限，也进行上报处理 */
     } else if (dev->num_vals >= dev->max_vals - 2) {
          dev->vals[dev->num_vals++] = input_value_sync;
          input_pass_values(dev, dev->vals, dev->num_vals);/* 上报event事件 */
          dev->num_vals = 0;
     }
}
```

| 描述符宏定义 | 值 | 功能 |
| --- | --- | --- |

### 3.5.11. input\_get\_disposition

获取input事件类型

```
/* drivers/input/input.c */
static int input_get_disposition(struct input_dev *dev,
     unsigned int type, unsigned int code, int *pval)
{
     int disposition = INPUT_IGNORE_EVENT;  /* 定义初始变量，如果没有更新，最后忽略 */
     int value = *pval;
     /* 处理各类事件 */
     switch (type) {
/* 同步事件 */
         case EV_SYN:
             switch (code) {
             case SYN_CONFIG:
                  disposition = INPUT_PASS_TO_ALL;
                  break;

              case SYN_REPORT:
                    disposition = INPUT_PASS_TO_HANDLERS | INPUT_FLUSH;
                    break;
              case SYN_MT_REPORT:
                    disposition = INPUT_PASS_TO_HANDLERS;
                    break;
      }
      break;

     case EV_KEY:
        /* 判断是否支持该键，同时判断按键状态是否改变 */
         if (is_event_supported(code, dev->keybit, KEY_MAX)) {
if (value == 2) {
                    disposition = INPUT_PASS_TO_HANDLERS;
                    break;
               }
/* 判断value是否改变 */
          if (!!test_bit(code, dev->key) != !!value) {
                __change_bit(code, dev->key);  /* 按位取反 */
                disposition = INPUT_PASS_TO_HANDLERS;
          }
      }
      break;

     case EV_SW:
      if (is_event_supported(code, dev->swbit, SW_MAX) &&
          !!test_bit(code, dev->sw) != !!value) {

           __change_bit(code, dev->sw);
             disposition = INPUT_PASS_TO_HANDLERS;
      }
      break;

     case EV_ABS:
          if (is_event_supported(code, dev->absbit, ABS_MAX))
               disposition = input_handle_abs_event(dev, code, &value);

           break;

     case EV_REL:
          if (is_event_supported(code, dev->relbit, REL_MAX) && value)
                 disposition = INPUT_PASS_TO_HANDLERS;

           break;

     case EV_MSC:
          if (is_event_supported(code, dev->mscbit, MSC_MAX))
               disposition = INPUT_PASS_TO_ALL;

          break;

     case EV_LED:
          if (is_event_supported(code, dev->ledbit, LED_MAX) &&
              !!test_bit(code, dev->led) != !!value) {

              __change_bit(code, dev->led);
             disposition = INPUT_PASS_TO_ALL;
         }
         break;

      case EV_SND:
           if (is_event_supported(code, dev->sndbit, SND_MAX)) {
                 if (!!test_bit(code, dev->snd) != !!value)
                      __change_bit(code, dev->snd);
                 disposition = INPUT_PASS_TO_ALL;
          }
          break;

      case EV_REP:
           if (code <= REP_MAX && value >= 0 && dev->rep[code] != value) {
                dev->rep[code] = value;
                disposition = INPUT_PASS_TO_ALL;
           }
         break;

     case EV_FF:
      if (value >= 0)
          disposition = INPUT_PASS_TO_ALL;
         break;

     case EV_PWR:
          disposition = INPUT_PASS_TO_ALL;
          break;
     }

     *pval = value;
     return disposition;
}
```

### 3.5.12. input\_pass\_event

调用input\_pass\_values

```
/* drivers/input/input.c */
static void input_pass_event(struct input_dev *dev,
        unsigned int type, unsigned int code, int value)
{
     struct input_value vals[] = { { type, code, value } };

     input_pass_values(dev, vals, ARRAY_SIZE(vals));  /* 调用input_pass_values */
}
```

### 3.5.13. input\_pass\_values

上报事件的处理

```
/* drivers/input/input.c */
static void input_pass_values(struct input_dev *dev,
         struct input_value *vals, unsigned int count)
{
     struct input_handle *handle;
     struct input_value *v;

     if (!count)
          return;

     rcu_read_lock();
    /* grab是强制为input device绑定的handler ，如果存在就直接调用 */
     handle = rcu_dereference(dev->grab);
     if (handle) {
          count = input_to_handler(handle, vals, count);
     } else {
    /* 如果device绑定具体的handle，则遍历这个dev上的所有handle，向应用层open过的发送信息 */  
          list_for_each_entry_rcu(handle, &dev->h_list, d_node)
           if (handle->open) {
                count = input_to_handler(handle, vals, count);
                if (!count)
                     break;
          }
     }

     rcu_read_unlock();

     /* 按键事件自动回复 */
     if (test_bit(EV_REP, dev->evbit) && test_bit(EV_KEY, dev->evbit)) {
          for (v = vals; v != vals + count; v++) {
               if (v->type == EV_KEY && v->value != 2) {
                    if (v->value)
                         input_start_autorepeat(dev, v->code);
                    else
                         input_stop_autorepeat(dev);
               }
          }
     }
}
```

函数最终就会调用到handler->event,对事件进行处理。

### 3.5.14. input\_to\_handler

```
/* drivers/input/input.c */
static unsigned int input_to_handler(struct input_handle *handle,
   struct input_value *vals, unsigned int count)
{
     struct input_handler *handler = handle->handler;
     struct input_value *end = vals;
     struct input_value *v;

     if (handler->filter) {
          for (v = vals; v != vals + count; v++) {
               if (handler->filter(handle, v->type, v->code, v->value))
                    continue;
               if (end != v)
                    *end = *v;
               end++;
          }
          count = end - vals;
     }

     if (!count)
          return 0;

     if (handler->events)
          handler->events(handle, vals, count);
     else if (handler->event)
          for (v = vals; v != vals + count; v++)
               handler->event(handle, v->type, v->code, v->value);

     return count;
}
```

### 3.5.15. evdev\_events

事件处理函数

```
/* drivers/input/evdev.c */
static void evdev_events(struct input_handle *handle,
        const struct input_value *vals, unsigned int count)
{
     struct evdev *evdev = handle->private;
     struct evdev_client *client;
     ktime_t time_mono, time_real;
       /* 获取时间信息 */
     time_meno = ktime_get();
     time_real = ktime_sub(time_mono, ktime_get_monotonic_offset());

     rcu_read_lock();

     client = rcu_dereference(evdev->grab);
 /* 如果该evdev有个专用的client，那么就将事件发给它，如果发送给它，如果该evdev不存在专用的 cliect，那就把该事件发送给evdev上client_list链表上所有的client */
     if (client)
          evdev_pass_values(client, vals, count, ev_time);   /* 打包数据 */
     else
          list_for_each_entry_rcu(client, &evdev->client_list, node)
   evdev_pass_values(client, vals, count, ev_time);

 rcu_read_unlock();
}
```

### 3.5.16. evdev\_pass\_values

填充event数据。

```
/* drivers/input/evdev.c */
static void evdev_pass_values(struct evdev_client *client,
         const struct input_value *vals, unsigned int count, ktime_t *ev_time)
{
     struct evdev *evdev = client->evdev; 
     const struct input_value *v;
     struct input_event event;
     struct timespec64 ts;
     bool wakeup = false;

     if (client->revoked)
          return;

     ts = ktime_to_timespec64(ev_time[client->clk_type]); /* 获取时间戳 */
     event.input_event_sec = ts.tv_sec;
     event.input_event_usec = ts.tv_nsec / NSEC_PER_USEC;

     /* 中断禁止, 获取锁 */
    spin_lock(&client->buffer_lock);
    /* 多个数据 */
     for (v = vals; v != vals + count; v++) {
          if (__evdev_is_filtered(client, v->type, v->code))
                continue;

          if (v->type == EV_SYN && v->code == SYN_REPORT) {
               /* drop empty SYN_REPORT */
               if (client->packet_head == client->head)
                      continue;
               wakeup = true;
          }
        /* 数据重新封装为event对象 */
          event.type = v->type;
          event.code = v->code;
          event.value = v->value;
          __pass_event(client, &event);// 在里面做消息传递
     }

     spin_unlock(&client->buffer_lock);
      /* 唤醒队列 */
     if (wakeup)
          wake_up_interruptible(&evdev->wait);
}
```

### 3.5.17. \_\_pass\_event

设备驱动上报事件并不是直接传递给用户空间的，在通用事件处理器(evdev)中，事件被缓冲存在缓冲区中。\_\_pass\_event函数里会将input\_event放到client结构结构体的 [环形缓冲区](https://zhida.zhihu.com/search?content_id=178173873&content_type=Article&match_order=1&q=%E7%8E%AF%E5%BD%A2%E7%BC%93%E5%86%B2%E5%8C%BA&zhida_source=entity) 里，即evdev\_client结构体的buffer,用户程序通过read()函数从环形缓冲区中获取input\_event事件。

```
/* drivers/input/evdev.c */
static void __pass_event(struct evdev_client *client,
    const struct input_event *event)
{
     client->buffer[client->head++] = *event; /*将事件赋值给客户端的input_event缓冲区*/
     client->head &= client->bufsize - 1; /*对头head自增指向下一个元素空间 */

    /*当队头head与队尾tail相等时，说明缓冲区已满 */
     if (unlikely(client->head == client->tail)) {
          /*
           * This effectively "drops" all unconsumed events, leaving
           * EV_SYN/SYN_DROPPED plus the newest event in the queue.
          */
          client->tail = (client->head - 2) & (client->bufsize - 1);
client->buffer[client->tail].input_event_sec = event->input_event_sec;
          client->buffer[client->tail].input_event_usec = event->input_event_usec;
          client->buffer[client->tail].type = EV_SYN;
          client->buffer[client->tail].code = SYN_DROPPED;
          client->buffer[client->tail].value = 0;
client->packet_head = client->tail;
     }
      /* 当遇到EV_SYN/ SYN_REPORT同步事件时，packet_head移动到对头head位置*/
     if (event->type == EV_SYN && event->code == SYN_REPORT) {
          client->packet_head = client->head;
          kill_fasync(&client->fasync, SIGIO, POLL_IN);
static int evdev_connect(struct input_handler *handler, struct input_dev *dev,
    const struct input_device_id *id)
{
     struct evdev *evdev;
     int minor;
     int dev_no;
     int error;

     minor = input_get_new_minor(EVDEV_MINOR_BASE, EVDEV_MINORS, true);
     if (minor < 0) {
          error = minor;
          pr_err("failed to reserve new minor: %d\n", error);
          return error;
     }

     evdev = kzalloc(sizeof(struct evdev), GFP_KERNEL);
     if (!evdev) {
          error = -ENOMEM;
          goto err_free_minor;
     }

     INIT_LIST_HEAD(&evdev->client_list);
     spin_lock_init(&evdev->client_lock);
     mutex_init(&evdev->mutex);
     init_waitqueue_head(&evdev->wait);
     evdev->exist = true;

     dev_no = minor;
     /* Normalize device number if it falls into legacy range */
     if (dev_no < EVDEV_MINOR_BASE + EVDEV_MINORS)
          dev_no -= EVDEV_MINOR_BASE;

/*这里我们能看到最终生成的设备文件，例如event0、event1等待
     dev_set_name(&evdev->dev, "event%d", dev_no); 

     evdev->handle.dev = input_get_device(dev);
     evdev->handle.name = dev_name(&evdev->dev);
     evdev->handle.handler = handler;
     evdev->handle.private = evdev;

    /*在设备驱动视图/sys/class/input/和/sys/devices/目录下产生eventx设备，最终依event机制和mdev在/dev目录生成对应的设备文件*/
     evdev->dev.devt = MKDEV(INPUT_MAJOR, minor);
     evdev->dev.class = &input_class;
     evdev->dev.parent = &dev->dev;
     evdev->dev.release = evdev_free;
     device_initialize(&evdev->dev);

     error = input_register_handle(&evdev->handle);
     if (error)
          goto err_free_evdev;

     cdev_init(&evdev->cdev, &evdev_fops);
     evdev->cdev.kobj.parent = &evdev->dev.kobj;
     error = cdev_add(&evdev->cdev, evdev->dev.devt, 1);
     if (error)
          goto err_unregister_handle;

     error = device_add(&evdev->dev);
     if (error)
          goto err_cleanup_evdev;

     return 0;

err_cleanup_evdev:
     evdev_cleanup(evdev);
err_unregister_handle:
     input_unregister_handle(&evdev->handle);
err_free_evdev:
     put_device(&evdev->dev);
err_free_minor:
     input_free_minor(minor);

     return error;
}
     }
}
```

### 3.5.18. evdev\_connect

创建一个新的evdev 设备

### 3.5.19. input\_proc\_init

创建对应的目录结构

```
/* drivers/input/input.c */
static int __init input_proc_init(void)
{
     struct proc_dir_entry *entry;
/* 在/proc/bus目录下创建input */
     proc_bus_input_dir = proc_mkdir("bus/input", NULL);
     if (!proc_bus_input_dir)
          return -ENOMEM;
/* 在/proc/bus/input目录下创建devices文件 */
     entry = proc_create("devices", 0, proc_bus_input_dir, &input_devices_fileops);
     if (!entry)
          goto fail1;
/* 在/proc/bus/input目录下创建handlers文件 */
     entry = proc_create("handlers", 0, proc_bus_input_dir, &input_handlers_fileops);
     if (!entry)
          goto fail2;

     return 0;
fail2: 
remove_proc_entry("devices", proc_bus_input_dir);
fail1: 
remove_proc_entry("bus/input", NULL);
     return -ENOMEM;
}
```

### 3.5.20. input\_set\_capability

设置输入设备可以上报哪些事件，需要注意一次只能设置一个事件，如果设备上报多个事件，需要重复调用

```
/* drivers/input/input.c */
void input_set_capability(struct input_dev *dev, unsigned int type, unsigned int code)
{
     switch (type) {
         case EV_KEY:
          __set_bit(code, dev->keybit);
          break;

         case EV_REL:
          __set_bit(code, dev->relbit);
          break;

         case EV_ABS:
          input_alloc_absinfo(dev);
          if (!dev->absinfo)
               return;

          __set_bit(code, dev->absbit);
          break;

         case EV_MSC:
          __set_bit(code, dev->mscbit);
          break;

        case EV_SW:
         __set_bit(code, dev->swbit);
         break;

         case EV_LED:
          __set_bit(code, dev->ledbit);
          break;

         case EV_SND:
          __set_bit(code, dev->sndbit);
          break;

        case EV_FF:
         __set_bit(code, dev->ffbit);
         break;

       case EV_PWR:
        /* do nothing */
        break;

     default:
      pr_err("%s: unknown type %u (code %u)\n", __func__, type, code);
      dump_stack();
      return;
 }

     __set_bit(type, dev->evbit);
}
EXPORT_SYMBOL(input_set_capability);
```

### 3.5.21. evdev\_read

读取event数据

```
static ssize_t evdev_read(struct file *file, char __user *buffer,
     size_t count, loff_t *ppos)
{
     struct evdev_client *client = file->private_data;
     struct evdev *evdev = client->evdev;
     struct input_event event;
     size_t read = 0;
     int error;

     if (count != 0 && count < input_event_size())
          return -EINVAL;

     for (;;) {
          if (!evdev->exist || client->revoked)
                return -ENODEV;
/* client的环形缓冲区中没有数据并且是非阻塞的，那么返回-EAGAIN，也就是try again */
          if (client->packet_head == client->tail &&(file->f_flags & O_NONBLOCK))
                return -EAGAIN;

         /*
          * count == 0 is special - no IO is done but we check
          * for error conditions (see above).
          */
          if (count == 0)
               break;
/* 如果获得了数据，就取出来 */
          while (read + input_event_size() <= count &&
              evdev_fetch_next_event(client, &event)) {
/* 传给用户 */
          if (input_event_to_user(buffer + read, &event))
               return -EFAULT;

            read += input_event_size();
    }

      if (read)
           break;
/* 如果没有数据，并且是阻塞的，则在等待队列上等待 */
      if (!(file->f_flags & O_NONBLOCK)) {
           error = wait_event_interruptible(evdev->wait,
             client->packet_head != client->tail || !evdev->exist || client->revoked);
       if (error)
            return error;
      }
 }

 return read;
}
```

如果read进行进入休眠状态，则会被evdev\_event函数唤醒

## 4\. 模块测试

## 4.1.测试概述

应用有两条路径，如下所示 /sys/class/input

```
console:/sys/class/input # ls
event0 event1 event2 input0 input1 input2 mice
```

/dev/input

```
console:/dev/input # ls
event0 event1 event2 mice
```

查看设备信息

```
$ cat /proc/bus/input/devices
I: Bus=0000 Vendor=0000 Product=0000 Version=0000
N: Name="lombo-ir"
P: Phys=lombo-ir/input0
S: Sysfs=/devices/platform/4014800.ir/rc/rc0/input0
U: Uniq=
H: Handlers=event0
B: PROP=0
B: EV=100013
B: KEY=1 0 0 0 0 0 0 0 1680 0 0 ffc
B: MSC=10
```

event节点里面存放的数据都是没有经过处理的原始数据流。cat 对应的eventX节点就可以查看输入的数据。

```
$ cat event0
```

## 4.2.应用测试

```
#include <stdio.h>
#include <stdlib.h>
#include <sys/ioctl.h>
#include <sys/time.h>
#include <sys/types.h>
#include <fcntl.h>
#include <unistd.h>
#include <errno.h>
#include <time.h>
#include <linux/input.h>

int main(void)
{
    int ret;
    int fd;

    struct input-event value;

    fd = open("/dev/input/event1", O_RDWR);
    if (fd < 0) {
         printf("open event1 failed %d\n", fd);
         return 0;
    }

    while(1) {
          ret = read(fd, &value, sizeof(value));
          if (ret < 0)
               printf("read failed\n");
  
          printf("input type:%d code:%d value:%d\n", value.type,
               value.code, value.value);
     }
    return 0;
}
```

发布于 2021-08-30 22:45[有没有最近进大厂（华为、小米）的嵌入式软件实习岗位的大佬，请教一下需要什么条件才可以进?](https://www.zhihu.com/question/1922344120271217432/answer/1929590046408835316)

[你好啊，这里是汉码未来，为一个十二年的老牌机构，我们接触过不少成功拿到华为、小米嵌入式软件实习 offer 的学员，对他们的上岸经验很熟悉，这就来给你说说关键条件。https://www.zh...](https://www.zhihu.com/question/1922344120271217432/answer/1929590046408835316)