---
title: "【系统启动】Kernel怎么跳转到Android：linux与安卓的交界"
source: "https://zhuanlan.zhihu.com/p/669604193"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "上一篇写了Uboot怎么到Linux kernel，这一章来看看linux kernel怎么到Android的。 虽然是零零碎碎的学习了一些关于Linux的知识，但是对于这个部分基本上没有站在系统的角度去看过。1、前言kernel的启动主要分为两…"
tags:
  - "clippings"
---
[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770)

9 人赞同了该文章

上一篇写了Uboot怎么到Linux [kernel](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=1&q=kernel&zhida_source=entity) ，这一章来看看linux kernel怎么到Android的。

**虽然是零零碎碎的学习了一些关于Linux的知识** ，但是对于这个部分基本上没 **有站在系统的角度去看过。**

## 1、前言

kernel的启动主要分为两个阶段。

## 1、阶段一

从入口跳转到start\_kernel之前的阶段。

对应代码arch/arm/kernel/head.S中stext的实现：

```
ENTRY(stext)
```
- 这个阶段主要由 [汇编语言](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=1&q=%E6%B1%87%E7%BC%96%E8%AF%AD%E8%A8%80&zhida_source=entity) 实现。
- 这个阶段主要负责MMU打开之前的一些操作，以及打开MMU的操作。
- 由于这个阶段MMU还没有打开，并且kernel加载地址和连接地址并一致，所以需要使用位置无关设计。在运行过程中运行地址和加载地址一致（如果不明白的话建议先参考一下《\[kernel 启动流程\] 前篇——vmlinux.lds分析》）。

(上一篇从uboot到kernel的地方，讲了kernel启动后的几个阶段，停在 [start\_kernel](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=2&q=start_kernel&zhida_source=entity) 部分)

## 2、阶段二

**start\_kernel开始的阶段。**

## 2、正题-kernel-uboot

Android生在 [linux内核](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=1&q=linux%E5%86%85%E6%A0%B8&zhida_source=entity) 基础上，linux内核启动的最后一步，一定是启动的android的进程。

然后我们也知道了内核启动分为三个阶段，

- 第一二是运行head.S文件和head-common.S，
- 第三个阶段是允许第二是运行main.c文件。

对于ARM的处理器，内核第一个启动的文件是arc/arm/kernel下面的head.S文件。、

当然arc/arm/boot/compress下面 也有这个文件，这个文件和上面的文件略有不同，当要生成压缩的内核时zImage时， **启动的是后者** ， **后者与前者不同的是：它前面的代码是做自解压的，后面的代码都相同。**

我们这里这分析arc/arm/kernel下面的head.S文件。当head.S所作的工作完成后它会跳到init/目录下跌的 main.c的start\_kernel函数开始执行。

因为我们要研究的是过渡阶段，而不是整个启动流程。（后面会研究的。）这里直接看第三个--start\_kernel阶段。

```
asmlinkage void __init start_kernel(void)  
{  
       …………………….  
       ……………………..  
       printk(KERN_NOTICE);  
       printk(linux_banner);  
       setup_arch(&command_line);  
       setup_command_line(command_line);  
        
        
       parse_early_param();  
       parse_args("Booting kernel",static_command_line, __start___param,  
                __stop___param - __start___param,  
                &unknown_bootoption);  
……………………  
…………………………        
       init_IRQ();  
       pidhash_init();  
       init_timers();  
       hrtimers_init();  
       softirq_init();  
       timekeeping_init();  
       time_init();  
       profile_init();  
…………………………  
……………………………  
       console_init();  
………………………………  
………………………………  
       rest_init();  
}
```

从上面可以看出start\_kernel首先是打印内核信息，然后对bootloader传进来的一些参数进行处理，再接着执行各种各样的初始化，在这其中会初始化控制台。最后会调用rest\_init();

我们再来看 **rest\_init** ()函数

```
static void noinline __init_refok rest_init(void)  
    __releases(kernel_lock)  
{  
    int pid;  
  
    kernel_thread(kernel_init, NULL, CLONE_FS | CLONE_SIGHAND);  
    ............      
}
```

他启动了 **[kernel\_init](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=2&q=kernel_init&zhida_source=entity)** 这个函数，再来看kerne\_init函数

```
static int __init kernel_init(void * unused)  
{  
    ..............................  
  
    if (!ramdisk_execute_command)  
        ramdisk_execute_command = "/init";  
  
    if (sys_access((const char __user *) ramdisk_execute_command, 0) != 0) {  
        ramdisk_execute_command = NULL;  
        prepare_namespace();  
    }  
  
    /*  
     * Ok, we have completed the initial bootup, and  
     * we're essentially up and running. Get rid of the  
     * initmem segments and start the user-mode stuff..  
     */  
    init_post();  
    return 0;  
}
```

kernel\_init先调用了 **prepare\_namespace()**;然后调用了 **init\_post** 函数

```
void __init prepare_namespace(void)  
{  
    ..........................  
    mount_root();  
    .....................  
}
```

可以看出prepare\_namespace调用了 **mount\_root** 挂接 [根文件系统](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=1&q=%E6%A0%B9%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F&zhida_source=entity) 。接着kernel\_init再执行 **init\_post**

```
static int noinline init_post(void)  
{  
    .......................................  
    /*打开dev/console控制台，并设置为标准输入、输出*/  
          
    if (sys_open((const char __user *) "/dev/console", O_RDWR, 0) < 0)  
        printk(KERN_WARNING "Warning: unable to open an initial console.\n");  
  
    (void) sys_dup(0);  
    (void) sys_dup(0);  
  
    if (ramdisk_execute_command) {  
        run_init_process(ramdisk_execute_command);  
        printk(KERN_WARNING "Failed to execute %s\n",  
                ramdisk_execute_command);  
    }  
  
    /*  
     * We try each of these until one succeeds.  
     *  
     * The Bourne shell can be used instead of init if we are  
     * trying to recover a really broken machine.  
     */  
  
    //如果bootloader指定了init参数，则启动init参数指定的进程  
    if (execute_command) {  
        run_init_process(execute_command);  
        printk(KERN_WARNING "Failed to execute %s.  Attempting "  
                    "defaults...\n", execute_command);  
    }  
  
    //如果没有指定init参数，则分别带sbin、etc、bin目录下启动init进程  
    run_init_process("/sbin/init");  
    run_init_process("/etc/init");  
    run_init_process("/bin/init");  
    run_init_process("/bin/sh");  
  
    panic("No init found.  Try passing init= option to kernel.");  
}
```

注意上面的run\_init\_process的会等待init进程返回才往后面执行，所有它一旦找到一个init可执行的文件它将一去不复返。

综上，内核启动的过程大致为以下几步：

- 1.检查CPU和机器类型
- 2.进行 [堆栈](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=1&q=%E5%A0%86%E6%A0%88&zhida_source=entity) 、MMU等其他程序运行关键的东西进行初始化
- 3.打印内核信息
- 4.执行各种模块的初始化
- 5.挂接根文件系统
- 6.启动第一个init进程
- 7.android启动

## 说明一

**总结一个图：kernel 到android核心启动过程**

![](https://pica.zhimg.com/v2-e85a6144289b7c34ff06384360ed8610_1440w.jpg)

kernel镜像执行跳转到start\_kernel开始执行，在rest\_init会创建两个kernel 进程（线程），其分别是为kernel\_init 与kthreadd，创建完后系统通过init\_idle\_bootup\_task蜕化为 [idle进程](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=1&q=idle%E8%BF%9B%E7%A8%8B&zhida_source=entity) （cpu\_idle）。

![](https://pic2.zhimg.com/v2-73d724329afead2c52c35538e1c6bcc5_1440w.jpg)

调用kernel\_thread()创建1号内核线程, **该线程随后转向用户空间, 演变为init进程**

**调用kernel\_thread()创建kthreadd内核线程。**

- init\_idle\_bootup\_task()：当前0号进程init\_task最终会退化成idle进程，所以这里调用init\_idle\_bootup\_task()函数，让init\_task进程隶属到idle调度类中。即选择idle的调度相关函数。
- 调用cpu\_idle()，0号线程进入idle函数的循环，在该循环中会周期性地检查
- kernel\_init 中会执行/init（ramdisk\_execute\_command的值为"/init"）
![](https://pic4.zhimg.com/v2-ac4fe83b3b3d41e038e45f7781e7a769_1440w.jpg)

在这里插入图片描述

**/init 启动后执行/system/core/init/main.cpp 中main 方法，这里执行FirstStageMain()**

![](https://picx.zhimg.com/v2-abc76d30b7b43bf3fffeb550d48be829_1440w.jpg)

> **(看看这到了哪里？这到了咱们的的AVB那个地方啊)**

FirstStageMain()中通过execv 执行/system/bin/init，参数为selinux\_setup。这里init 跟/init 一样，因此再次执行init 镜像。

这里如果是重启到bootloader，会执行InstallRebootSignalHandlers

![](https://picx.zhimg.com/v2-9d42ed0d86a9c9fc012b56e2171d3781_1440w.jpg)

SetupSelinux 中再次执行init，这里会注册 [信号处理函数](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=1&q=%E4%BF%A1%E5%8F%B7%E5%A4%84%E7%90%86%E5%87%BD%E6%95%B0&zhida_source=entity)

从而参数second\_stage，执行SecondStageMain ，在这里解析.rc ，启动ueventd，并等待其启动完成。

![](https://pica.zhimg.com/v2-638a3be71a89e001983e8decc59eeb28_1440w.jpg)

init 镜像通过execv会执行两次，分别通过FirstStageMain和SecondStageMain执行。

![](https://pic4.zhimg.com/v2-e47eb6281e2d4aa2d6b03d0d64023ac3_1440w.jpg)

![](https://picx.zhimg.com/v2-55d97a782f3000001eda294cd9526201_1440w.jpg)

**Zygote是Android系统创建新进程的核心进程** ，

- 负责启动Dalvik [虚拟机](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=1&q=%E8%99%9A%E6%8B%9F%E6%9C%BA&zhida_source=entity) ，
- 加载一些必要的系统资源和系统类，
- 启动system\_server进程，
- 随后进入等待处理app应用请求。

> 到这里我们就暂时停下，别走远了。

## 芯片上电到Android

总结一下整个流程

- 第一步：手机开机后，引导芯片启动，引导芯片开始从固化在ROM里的预设代码执行，加载 [引导程序](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=1&q=%E5%BC%95%E5%AF%BC%E7%A8%8B%E5%BA%8F&zhida_source=entity) 到到RAM，bootloader检查RAM，初始化硬件参数等功能；
- 第二步：硬件等参数初始化完成后，进入到Kernel层，Kernel层主要加载一些硬件 [设备驱动](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=1&q=%E8%AE%BE%E5%A4%87%E9%A9%B1%E5%8A%A8&zhida_source=entity) ，初始化进程管理等操作。在Kernel中首先启动swapper进程（pid=0），用于初始化进程管理、内管管理、加载Driver等操作，再启动kthread进程(pid=2),这些linux系统的内核进程，kthread是所有内核进程的鼻祖；
- 第三步：Kernel层加载完毕后，硬件设备驱动与 [HAL层](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=1&q=HAL%E5%B1%82&zhida_source=entity) 进行交互。初始化进程管理等操作会启动INIT进程 ，这些在Native层中；
- 第四步：init进程(pid=1，init进程是所有进程的鼻祖，第一个启动)启动后，会启动adbd，logd等用户 [守护进程](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=1&q=%E5%AE%88%E6%8A%A4%E8%BF%9B%E7%A8%8B&zhida_source=entity) ，并且会启动servicemanager(binder服务管家)等重要服务，同时孵化出zygote进程，这里属于C++ Framework，代码为C++程序；
- 第五步：zygote进程是由init进程解析init.rc文件后fork生成，它会加载虚拟机，启动System Server(zygote孵化的第一个进程)；System Server负责启动和管理整个Java Framework，包含ActivityManager，WindowManager，PackageManager，PowerManager等服务；
- 第六步：zygote同时会启动相关的APP进程，它启动的第一个APP进程为Launcher，然后启动Email，SMS等进程，所有的APP进程都由zygote fork生成。

那么到这里我们就把整个系统的启动串联起来了从bootrom-bootloader-kernel。

当然真实的系统为了安全，比如说基于 [ARM框架](https://zhida.zhihu.com/search?content_id=236931312&content_type=Article&match_order=1&q=ARM%E6%A1%86%E6%9E%B6&zhida_source=entity) 的，那肯定不止这些步骤，但是大体上也是穿插在这个流程之中的。

这个跳转系列真的蛮有意思，持续做下去。感谢前辈们的优秀blog。

## 参考资料：

- [blog.csdn.net/yiranfeng](https://link.zhihu.com/?target=https%3A//blog.csdn.net/yiranfeng/article/details/103549394)
- [cnblogs.com/littleboy12](https://link.zhihu.com/?target=https%3A//www.cnblogs.com/littleboy123/p/13208179.html)
- [cnblogs.com/hzl6255/p/1](https://link.zhihu.com/?target=https%3A//www.cnblogs.com/hzl6255/p/12142762.html)
- [blog.csdn.net/lei7143/a](https://link.zhihu.com/?target=https%3A//blog.csdn.net/lei7143/article/details/114269707)
- [cnblogs.com/linucos/arc](https://link.zhihu.com/?target=https%3A//www.cnblogs.com/linucos/archive/2012/05/21/2511619.html)

发布于 2023-11-30 10:43・新加坡[AI大模型学习路线，带你6周成为大模型工程师！](https://zhuanlan.zhihu.com/p/1974154965015615369)

[

自学AI大模型需要扎实的基础知识、系统的学习路线和持续的实践与探索。希望这条学习路线能为新手小白们提供一个清晰的方向，...

](https://zhuanlan.zhihu.com/p/1974154965015615369)