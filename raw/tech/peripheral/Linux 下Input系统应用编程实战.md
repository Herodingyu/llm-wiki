---
title: "Linux 下Input系统应用编程实战"
source: "https://zhuanlan.zhihu.com/p/67294119"
author:
  - "[[韦东山嵌入式关注公众号: 百问科技，学习更多嵌入式干货]]"
published:
created: 2026-05-02
description: "作者：杨源鑫(也是我们的校园代理) 经授权转载于公众号嵌入式开发圈，有些许修改。什么是input子系统？不管是什么操作系统，都有一个程序用于管理各种输入设备，哪些是输入设备？比如，电脑键盘、鼠标，智能手机上…"
tags:
  - "clippings"
---
[收录于 · 韦东山嵌入式Linux](https://www.zhihu.com/column/c_118891916)

5 人赞同了该文章

> 作者：杨源鑫(也是我们的校园代理)  
> 经授权转载于公众号 [嵌入式开发](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=%E5%B5%8C%E5%85%A5%E5%BC%8F%E5%BC%80%E5%8F%91&zhida_source=entity) 圈，有些许修改。

什么是 [input子系统](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=input%E5%AD%90%E7%B3%BB%E7%BB%9F&zhida_source=entity) ？不管是什么操作系统，都有一个程序用于管理各种输入设备，哪些是输入设备？比如，电脑键盘、鼠标，智能手机上的触摸屏，按键。都是输入设备。那么 [操作系统](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=2&q=%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F&zhida_source=entity) 怎么管理这些输入设备？这里以最常用的Linux操作系统进行讲解。

在Linux [内核](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=%E5%86%85%E6%A0%B8&zhida_source=entity) 中，有非常多用于管理诸多设备的子系统，比如显示系统，输入子系统， [音频子系统](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=%E9%9F%B3%E9%A2%91%E5%AD%90%E7%B3%BB%E7%BB%9F&zhida_source=entity) ，电源管理子系统，时钟管理子系统等等，本节我们重点关注输入子系统。

[输入子系统](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=3&q=%E8%BE%93%E5%85%A5%E5%AD%90%E7%B3%BB%E7%BB%9F&zhida_source=entity) 是在内核里实现，因为设备经常要通过特定的硬件接口被访问 (例如 [串口](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=%E4%B8%B2%E5%8F%A3&zhida_source=entity) ， ps/2， usb等等 )，这些硬件接口由内核保护和管理。内核给用户导出一套固定的与硬件无关的 input API，供用户空间程序使用。

在Linux input子系统中，分三块进行管理，分别是： input core(输入系统核心层)， drivers(输入系统驱动层)和 event handlers(输入系统事件层)，可能你感觉太抽象，看下图4-5-9就清楚了。

![](https://picx.zhimg.com/v2-a51d12dd1c23a26820c6d9f669e28625_1440w.jpg)

先从应用程序角度认识input子系统，我们可以从以下这个文件看到对应的设备。

打开Linux终端，输入命令cat /proc/bus/input/devices可以看到类似下面的内容。

```c
I: Bus=0003 Vendor=046d Product=c018 Version=0111
N: Name=" USB Optical Mouse"
P: Phys=usb-0000:00:1d.1-2/input0
S: Sysfs=/class/input/input24
U: Uniq=
H: Handlers=mouse1 event2
B: EV=7
B: KEY=70000 0 0 0 0 0 0 0 0
B: REL=103
```

这些devices主要是用来描述注册在input子系统的设备文件，可能有鼠标，键盘，触摸屏，重力传感器， [温度传感器](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=%E6%B8%A9%E5%BA%A6%E4%BC%A0%E6%84%9F%E5%99%A8&zhida_source=entity) 等等，写驱动的时候，通过内核提供的input设备注册设备相关的接口后，这些信息都会保存到对应的文件里。

那么，input子系统如何描述输入设备呢？

Linux系统为我们提供了这个输入系统操作相关的 [头文件](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=%E5%A4%B4%E6%96%87%E4%BB%B6&zhida_source=entity):

#include <linux/input.h>

在这个文件中，可以找到这个结构体:

```c
//用于描述一个输入事件
struct input_event {
    struct timeval time;
    __u16 type;
    __u16 code;
    __s32 value;
};
```

在这里我们看到input\_event结构体中还嵌套了另一个结构体struct timeval time;

先解读struct timeval time，它在time.h中定义如下

```c
struct timeval
{
__time_t tv_sec;        /* Seconds. */
__suseconds_t tv_usec;    /*Microseconds. */
};
```

其中，tv\_sec为Epoch到创建struct timeval时的秒数，tv\_usec为 [微秒数](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=%E5%BE%AE%E7%A7%92%E6%95%B0&zhida_source=entity) ，即秒后面的零头。

type域是被报告事件的类型，例如，一个 key press或者 button press， relative motion(比如移动鼠标 )或者 absolute motion(比如移动游戏杆 )；

code域告诉你是哪一个key或者 [坐标轴](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=%E5%9D%90%E6%A0%87%E8%BD%B4&zhida_source=entity) 在被操作；

value域告诉你设备现在的状态或者运动情况是什么。

最主要的事件有以下三种: 相对事件(例如鼠标)，绝对事件(例如触摸屏)， [键盘事件](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=%E9%94%AE%E7%9B%98%E4%BA%8B%E4%BB%B6&zhida_source=entity) 。

例如鼠标，我们在移动鼠标的时候鼠标就是一个相对事件，所以type的类型也就是底层上报给用户的事件为相对事件类型，code表示的就是相对于鼠标当前的位置的X或者Y的坐标，value也就是相对于当前的位置偏移了多少。

事件类型(type)在input.h分类如下：

```c
/*
  * Event types
  */
 #define EV_SYN            0x00     //同步事件,就是将结果上报给系统的过程
 #define EV_KEY            0x01     //按键事件
 #define EV_REL            0x02     //相对事件
 #define EV_ABS            0x03     //绝对事件
 本节，我们来实现一个input控制鼠标的应用程序。所以还会用到以下事件：
 /*
 * Relative axes
 */
//在这里，我们暂时只会用REL_X和REL_Y这两个参数
#define REL_X            0x00    //相对X坐标
#define REL_Y            0x01    //相对Y坐标
```

我们可以使用 [cat命令](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=cat%E5%91%BD%E4%BB%A4&zhida_source=entity) 来测试当前的鼠标事件到底属于哪一个事件节点，如图4-5-10所示：

![](https://picx.zhimg.com/v2-f1f99a248707a3c8545af7bcf1482847_1440w.jpg)

只需切换到/dev/input，找到对应的事件节点，再使用cat eventx(事件节点)，然后移动鼠标就可以看到数据打印啦，但是这些数据我们显然是看不懂的，不过可以使用测试程序将鼠标的值读出来。

接下来，我们写个程序mouse.c来看看如何读取鼠标事件，

```c
#include <stdio.h>
 #include <linux/input.h>
 #include <unistd.h>
 #include <stdlib.h>
 #include <fcntl.h>
 /*
 struct input_event {
         struct timeval time;
         __u16 type;
        __u16 code;
        __s32 value;
};
*/
/*
Event types
#define EV_SYN                  0x00
#define EV_KEY                  0x01
#define EV_REL                  0x02
#define EV_ABS                  0x03
*/
/*
 Relative axes
#define REL_X                   0x00
#define REL_Y                   0x01
#define REL_Z                   0x02
#define REL_MAX                 0x0f
#define REL_CNT                 (REL_MAX+1)
*/
//event8  mouse
//event9  keyboard
int main(void)
{
    //1、定义一个结构体变量用来描述input事件
    struct input_event event_mouse ;
    //2、打开input设备的事件节点我的电脑对应的鼠标事件的节点是event3
//读者的电脑的设备节点可能和我的不一样，可以使用cat命令去获取，然后
//不断尝试
    int fd = open("/dev/input/event4",O_RDWR);
    int value ;
    int type ;
    int buffer[10]={0};
    if(-1 == fd){
        printf("open mouse event fair!\n");
        return -1 ;
    }   
    while(1){
        //3、读事件
       read(fd ,&event_mouse ,sizeof(event_mouse));
        //4、判断事件类型，并打印键码
        switch(event_mouse.type){
            //同步事件
            case EV_SYN:
                printf("sync!\n");
                 break ;
            case EV_REL:
            //鼠标事件，XY相对位移
            //code表示相对位移X或者Y，当判断是X时，打印X的相对位移value
            //当判断是Y时，打印Y的相对位移value
            if(event_mouse.code == REL_X){ 
                 printf("event_mouse.code_X:%d\n",event_mouse.code);    
                 printf("event_mouse.value_X:%d\n",event_mouse.value);  
            }
            if(event_mouse.code == REL_Y){
                 printf("event_mouse.code_Y:%d\n",event_mouse.code);    
                printf("event_mouse.value_Y:%d\n",event_mouse.value);  
           }
            defalut:
           break ;
       }
    }   
    return 0 ;
}
```

运行结果，如图4-5-11所示。

![](https://pica.zhimg.com/v2-070b5ba5766dfb0e5063ddd1fbc941ce_1440w.jpg)

当我们不断移动鼠标的时候，这些值将会被打印出来。

请思考一个问题，既然我们移动鼠标能够打印数值，那能不能够写一个程序控制鼠标自动移动呢？肯定可以，下面我们写个程序让鼠标自己画一个正方形，上代码:

```c
#include <stdio.h>
 #include <linux/input.h>
 #include <unistd.h>
 #include <stdlib.h>
 #include <fcntl.h>
 
 //event8  mouse
 //event9  keyboard
 int main(void)
{
    //1、定义一个结构体变量用来描述input事件
    struct input_event event_mouse ;
   //2、打开input设备的事件节点  我的电脑鼠标事件的节点是event3
    int fd = open("/dev/input/event3",O_RDWR);
    int value ;
    int type ;
    int i ;
    int buffer[10]={0};
    if(-1 == fd){
        printf("open mouse event fair!\n");
        return -1 ;
    }   
    while(1){
        //3、写事件
        for(i = 0 ; i < 20 ; i++){
           event_mouse.type = EV_REL ; 
           event_mouse.code = REL_X ;
           event_mouse.value = i ;  
           write(fd,&event_mouse,sizeof(event_mouse));         
           event_mouse.code = 0 ;
           event_mouse.value = 0;
           event_mouse.type = EV_SYN ;
           write(fd,&event_mouse,sizeof(event_mouse));         
           usleep(50000);
        }
        for(i = 0 ; i < 20 ; i++){
           event_mouse.type = EV_REL ; 
           event_mouse.code = REL_Y ;
           event_mouse.value = i ;  
           write(fd,&event_mouse,sizeof(event_mouse));         
           event_mouse.code = 0 ; 
           event_mouse.value = 0 ;
           event_mouse.type = EV_SYN ;
           write(fd,&event_mouse,sizeof(event_mouse));         
           usleep(50000);
        }
        for(i = 0 ; i > -20 ; i--){
           event_mouse.type = EV_REL ; 
           event_mouse.code = REL_X ;
           event_mouse.value = i ;  
           write(fd,&event_mouse,sizeof(event_mouse));         
           event_mouse.code = 0 ;
           event_mouse.value = 0;
           event_mouse.type = EV_SYN ;
           write(fd,&event_mouse,sizeof(event_mouse));         
           usleep(50000);
        }
        for(i = 0 ; i > -20 ; i--){
           event_mouse.type = EV_REL ; 
           event_mouse.code = REL_Y ;
           event_mouse.value = i ;  
           write(fd,&event_mouse,sizeof(event_mouse));         
           event_mouse.code = 0 ; 
           event_mouse.value = 0 ;
           event_mouse.type = EV_SYN ;
           write(fd,&event_mouse,sizeof(event_mouse));         
           usleep(50000);
        }

    }   
    return 0 ;
}
```

执行效果请读者自行验证。

接下来我们再写一个案例：在Tiny4412平台上获取电容屏的 [坐标值](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=%E5%9D%90%E6%A0%87%E5%80%BC&zhida_source=entity) 。

触摸屏上报坐标值的事件属于绝对事件，也就是，触摸的坐标点X和Y会在屏幕的分辨率范围内上报一个绝对的坐标(X,Y)。

那么上报对于的类型(type)如下：EV\_ABS

对于的code如下：

绝对于X：

ABS\_MT\_POSITION\_X

绝对于Y：

ABS\_MT\_POSITION\_Y

我用了一个程序获取了屏幕的分辨率，得知分辨率宽为480，高为800。

首先，写这个程序时，我通过adb进到Android根目录，然后用getevent -p查到触摸屏的事件节点为event0, 同时也知道触摸屏是一个绝对事件，如下:

![](https://picx.zhimg.com/v2-c46c1e1084fcad1f261447f4bc1ce171_1440w.jpg)

接下来，我在Android5.0的 [源代码](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=%E6%BA%90%E4%BB%A3%E7%A0%81&zhida_source=entity) external目录下创建了如下目录：Getft5x0x\_Test

该目录下有如下两个文件文件:

Android.mk和Get\_ft5x0x\_tp.c

(1) [先看Android.mk](https://link.zhihu.com/?target=http%3A//xn--android-4b9kr02z.mk/)

```c
LOCAL_PATH := $(call my-dir)
 include $(CLEAR_VARS)
 LOCAL_MODULE_TAGS := eng
 LOCAL_SHARED_LIBRARIES += libcutils libutils
 #LOCAL_STATIC_LIBRARIES += libz libstdc++ libpng libvtpng
 LOCAL_STATIC_LIBRARIES += libz libstdc++ libpng
 
 LOCAL_SRC_FILES := Get_ft5x0x_tp.c
 LOCAL_MODULE := ft5x0x_tp
 include $(BUILD_EXECUTABLE)
```

(2)Get\_ft5x0x\_tp.c

```c
#include <ctype.h>
#include <errno.h>
#include <fcntl.h>
#include <getopt.h>
#include <limits.h>
#include <linux/input.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <time.h>
#include <unistd.h>
#include <dirent.h>
#include <inttypes.h>
#include <errno.h>
//ft5x0x_ts触摸屏事件初始化
18int touch_fd = -1 ;
19int ft5x0x_ts__init(void)
{
    touch_fd = open("/dev/input/event0", O_RDONLY);
    if (touch_fd < 0)
    {
        printf("open /dev/input/event0 failed\n");
        return -1;
    }
    return 0;
}

//获取ft5x0x_ts触摸屏上的坐标点
int Get_ft5x0x_ts_postion(int *x, int *y)
{
    int touch_ret = -1 ;    
    //1、定义一个结构体变量用来描述ft5x0x触摸屏事件  
    struct input_event ft5x0x_ts ;  

    //2、读事件  
    touch_ret = read(touch_fd ,&ft5x0x_ts ,sizeof(ft5x0x_ts));  
    if(touch_ret < 0){
    printf("read touch fair!\n");
    }
    //3、判断事件类型
    switch(ft5x0x_ts.type)
    {  
    case EV_SYN:  
             break ;  
        case EV_ABS:  
             if(ft5x0x_ts.code == ABS_MT_POSITION_X){   
        *x = ft5x0x_ts.value ;
            }  
             if(ft5x0x_ts.code == ABS_MT_POSITION_Y){  
        *y = ft5x0x_ts.value ;
             }  
        defalut:  
        break ;  
    }         
    return 0;
}

int main(int argc, char **argv)
{
    int tp_ret ;
    int ft5x0x_x = 0;
    int ft5x0x_y = 0; 
    tp_ret = ft5x0x_ts__init();
    if(-1 == tp_ret){
    printf("tp init fair!\n");
    return -1 ;
    }
    printf("tp init success!\n");
    while(1)
    {    //获取屏幕上的绝对坐标点
     Get_ft5x0x_ts_postion(&ft5x0x_x,&ft5x0x_y);
     printf("ft5x0x_x:%d     ft5x0x_y:%d\n",ft5x0x_x,ft5x0x_y);
     usleep(100);
    }    
    return 0;
}
```

编写完Android.mk和C程序后，切换到Android的根目录，用以下命令编译Get\_ft5x0x\_tp.c

(使用mmm命令之前一定要先执行source和lunch这两个步骤）

```c
root@morixinguan:/work/android-5.0.2# source build/envsetup.sh 
including device/samsung/manta/vendorsetup.sh
including device/moto/shamu/vendorsetup.sh
including device/friendly-arm/tiny4412/vendorsetup.sh
including device/generic/mini-emulator-x86_64/vendorsetup.sh
including device/generic/mini-emulator-armv7-a-neon/vendorsetup.sh
including device/generic/mini-emulator-mips/vendorsetup.sh
including device/generic/mini-emulator-arm64/vendorsetup.sh
including device/generic/mini-emulator-x86/vendorsetup.sh
including device/asus/deb/vendorsetup.sh
including device/asus/fugu/vendorsetup.sh
including device/asus/grouper/vendorsetup.sh
including device/asus/tilapia/vendorsetup.sh
including device/asus/flo/vendorsetup.sh
including device/lge/hammerhead/vendorsetup.sh
including device/lge/mako/vendorsetup.sh
including sdk/bash_completion/adb.bash
root@morixinguan:/work/android-5.0.2# lunch 

You're building on Linux

Lunch menu... pick a combo:
     . aosp_arm-eng
     . aosp_arm64-eng
     . aosp_mips-eng
     . aosp_mips64-eng
     . aosp_x86-eng
     . aosp_x86_64-eng
     . aosp_manta-userdebug
     . aosp_shamu-userdebug
     . full_tiny4412-userdebug
     . full_tiny4412-eng
     . mini_emulator_x86_64-userdebug
     . m_e_arm-userdebug
     . mini_emulator_mips-userdebug
     . mini_emulator_arm64-userdebug
     . mini_emulator_x86-userdebug
     . aosp_deb-userdebug
     . full_fugu-userdebug
     . aosp_fugu-userdebug
     . aosp_grouper-userdebug
     . aosp_tilapia-userdebug
     . aosp_flo-userdebug
     . aosp_hammerhead-userdebug
     . aosp_mako-userdebug

Which would you like? [aosp_arm-eng] 20

============================================
PLATFORM_VERSION_CODENAME=REL
PLATFORM_VERSION=5.0.2
TARGET_PRODUCT=aosp_tilapia
TARGET_BUILD_VARIANT=userdebug
TARGET_BUILD_TYPE=release
TARGET_BUILD_APPS=
TARGET_ARCH=arm
TARGET_ARCH_VARIANT=armv7-a-neon
TARGET_CPU_VARIANT=cortex-a9
TARGET_2ND_ARCH=
TARGET_2ND_ARCH_VARIANT=
TARGET_2ND_CPU_VARIANT=
HOST_ARCH=x86_64
HOST_OS=linux
HOST_OS_EXTRA=Linux-4.8.0-46-generic-x86_64-with-Ubuntu-16.04-xenial
HOST_BUILD_TYPE=release
BUILD_ID=LRX22G
OUT_DIR=out
====================

root@morixinguan:/work/android-5.0.2#
```

接下来，编译程序:

```c
mmm external/Getft5x0x_Test/
```

然后我们看到以下显示:

![](https://pic1.zhimg.com/v2-758c792f5a571b7e491093b0fca97440_1440w.jpg)

这个二进制生成的 [绝对路径](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=%E7%BB%9D%E5%AF%B9%E8%B7%AF%E5%BE%84&zhida_source=entity) 是out目录, 我们需要ft5x0x\_tp文件，这个名字就是上面Android.mk里面对应的:

```c
LOCAL_MODULE := ft5x0x_tp
```

Install: out/target/product/tiny4412/system/bin/ft5x0x\_tp  
将这个文件拷贝到当前目录:

```c
cp out/target/product/tiny4412/system/bin/ft5x0x_tp .
```

然后，用USB线连接tiny4412开发板，再用adb命令将ft5x0x\_tp push到system/bin/目录下，这个目录是Android的 [根文件系统](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=%E6%A0%B9%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F&zhida_source=entity) 下的一个命令，很多命令都在这个目录下。

（若没有安装adb，可以 [apt-get](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=apt-get&zhida_source=entity) install adb 进行安装)

adb push完毕以后，再adb shell切换到根目录下

执行ft5x0x\_tp.bin，然后触摸触摸屏，这样，坐标值就打印出来了。

![](https://pic4.zhimg.com/v2-e6ae38f80ee95ae126d9b3cff833da3d_1440w.jpg)

ps： [韦东山](https://zhida.zhihu.com/search?content_id=103083088&content_type=Article&match_order=1&q=%E9%9F%A6%E4%B8%9C%E5%B1%B1&zhida_source=entity) 2期视频对输入子系统的驱动编写以及机制讲解的很清楚，有需要的可以看看

```
--END--
```

关注公众号百问科技(ID：baiwenkeji）第一时间阅读嵌入式干货。  
技术交流加个人威信13266630429，验证：知乎

[所属专栏 · 2025-12-25 17:53 更新](https://zhuanlan.zhihu.com/c_118891916)

[![](https://picx.zhimg.com/v2-ede5849e82d5d2ac99d74873da4371d3_720w.jpg?source=172ae18b)](https://zhuanlan.zhihu.com/c_118891916)

[韦东山嵌入式Linux](https://zhuanlan.zhihu.com/c_118891916)

[

韦东山嵌入式

234 篇内容 · 12802 赞同

](https://zhuanlan.zhihu.com/c_118891916)

[

最热内容 ·

【2020/5.29开庭】韦东山：闲鱼与盗版更配，坚决打击盗版，起诉到底绝不和解！

](https://zhuanlan.zhihu.com/c_118891916)

发布于 2019-05-28 16:54[嵌入式开发](https://www.zhihu.com/topic/19610823)[大学没怎么学，此法自学Java7个月，可以找到12K左右的工作](https://zhuanlan.zhihu.com/p/355711546)

[

我是一个二本院校，专业是机械工程，当时以为考上了大学就可以高枕无忧放开了玩，可以说我整个大学期间都是打游戏过来的。到了大四才发现，同学们都陆续去找了实习，有的做机械工作，...

](https://zhuanlan.zhihu.com/p/355711546)