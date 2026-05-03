---
title: "devicetree和启动参数解析流程"
source: "https://zhuanlan.zhihu.com/p/523158458"
author:
  - "[[lgjjeff]]"
published:
created: 2026-05-03
description: "本文基于以下软硬件假定： 架构：AARCH64 内核版本：5.14.0-rc5 1 设备树解析概述 AARCH64架构下内核可以通过设备树或acpi方式获取设备信息，其中acpi主要用于服务器领域，而设备树用于嵌入式领域。在设备树方式中…"
tags:
  - "clippings"
---
[收录于 · 杂七杂八](https://www.zhihu.com/column/c_1532861349739077632)

11 人赞同了该文章

本文基于以下软硬件假定：

架构：AARCH64

内核版本：5.14.0-rc5

## 1　设备树解析概述

　　AARCH64架构下内核可以通过设备树或acpi方式获取设备信息，其中acpi主要用于服务器领域，而设备树用于嵌入式领域。在设备树方式中， [bootloader](https://zhida.zhihu.com/search?content_id=204389582&content_type=Article&match_order=1&q=bootloader&zhida_source=entity) 启动之前将设备树拷贝到内存中，并将地址通过 [x2寄存器](https://zhida.zhihu.com/search?content_id=204389582&content_type=Article&match_order=1&q=x2%E5%AF%84%E5%AD%98%E5%99%A8&zhida_source=entity) 传递给kernel，kernel启动时从设备树中读取启动参数和设备配置节点。

　　由于内存配置信息是由device tree传入的，而将device tree解析为device node的流程中需要为node和property分配内存。因此在device node创建之前需要先从device tree中解析出memory信息，故内核通过 [early\_init\_dt\_scan](https://zhida.zhihu.com/search?content_id=204389582&content_type=Article&match_order=1&q=early_init_dt_scan&zhida_source=entity) 接口实现了early的设备树信息扫描接口，以解析memory以及 [bootargs](https://zhida.zhihu.com/search?content_id=204389582&content_type=Article&match_order=1&q=bootargs&zhida_source=entity) 等一些启动早期需要使用的信息。

　　在memory节点解析完成并被加入 [memblock](https://zhida.zhihu.com/search?content_id=204389582&content_type=Article&match_order=1&q=memblock&zhida_source=entity) 之后，即可通过memblock为device node分配内存，从而可将完整的device tree信息解析到device node结构中。由于device node包含了设备树的所有节点以及它们之间的连接关系，因此此后内核就可以通过device node快速地索引设备节点。

## ２　early device tree 解析流程

　　在AARCH64架构下，early device tree解析流程如下图：

![](https://pic1.zhimg.com/v2-35f1ca2de1aac1bd63119769434f7e3c_1440w.jpg)

其主要包括：  
（1）解析chosen节点中的initrd、bootargs和rng-seed属性，其中initrd包含其地址和size信息，rng-seed作为随机数种子添加到内核的随机数池中  
（2）获取root节点的size-cells和address-cells值  
（3）遍历memory节点的内存region，并将合法的region加入memblock中。若设备树中含有hotplug属性，则在内存flag中加上hotplug标志，以标识该内存是可热插拔的

## ３　device node节点创建流程

　　内核通过 [unflatten\_device\_tree](https://zhida.zhihu.com/search?content_id=204389582&content_type=Article&match_order=1&q=unflatten_device_tree&zhida_source=entity) 接口解析device tree中的node和property信息，并为解析到的每个节点创建device node，以及将解析到的属性添加到对应node中。其主要流程如下图：

![](https://pic4.zhimg.com/v2-2f9b422c8838509804188a67f58284c1_1440w.jpg)

（1）\_\_unflatten\_device\_tree：解析设备树的所有节点和属性，根据解析到的信息创建和填充device node信息。device node通过父节点、子节点和兄弟节点三个指针来维护各节点之间的关系。如以下是一个含有六个节点的节点关系示意图：

![](https://pic4.zhimg.com/v2-71a0f1217361c2f065163c05a9cbbdeb_1440w.jpg)

（2）of\_alias\_scan：扫描device tree中的所有别名并填充别名信息，如名字，其对应的device node等。内核通过一个名为aliases\_lookup全局链表维护所有扫描到的别名  
（3）unittest\_unflatten\_overlay\_base：解析unit test的device tree overlay，其解析完成的root device node保存在overlay\_base\_root中，并被用于其后的device tree 测试流程。其目的是为了尽量模拟实际设备树的行为，以测试功能的正确性。该测试流程由late\_initcall(of\_unittest)完成

## ４　bootargs参数解析

### ４.1　bootargs参数配置

　　bootargs用于向内核传递启动参数，内核启动时解析这些参数并从特定的section中查找并执行参数处理函数，以实现对相关功能的配置。AARCH64架构的bootargs配置方式较灵活，主要有以下几种：  
（1）通过devicetree配置  
（2）通过内核配置选项配置  
（3）通过bootconfig方式配置

　　通过devicetree配置是使用较多的方式，若对于使用uboot引导的内核，它又可以有以下配置方法：  
（1）直接在devicetree的chosen节点中定义bootargs  
（2）在uboot代码中通过环境变量的方式定义默认的bootargs  
（3）通过uboot的命令行修改bootargs环境变量。其中后两种方式在启动内核之前，uboot都会将环境变量中的bootargs值设置到devicetree中

　　内核也可以通过CONFIG\_CMDLINE配置选项设置bootargs，由该选项指定的bootargs参数在内核启动时有三种处理方式：  
（1）若设置了CONFIG\_CMDLINE\_EXTEND选项，则将该参数拼接到由device tree中解析出的参数后面  
（2）若设置了CONFIG\_CMDLINE\_FORCE选项，则用该参数替换从device tree中解析出的参数  
（3）未设置以上两个选项，则在device tree未设置bootargs时将该参数作为默认的bootargs，否则丢弃该参数

　　bootconfig方式将启动参数以key=value的形式写到xbc（extra boot config）文件中，然后通过bootconfig工具将该文件追加到initrd的末尾，并随initrd一起被加载到内核。内核启动时通过bootconfig.c解析这些参数，并将其拼接到上面解析出参数的前面

### ４.２　early param参数解析

内核bootargs参数解析也包含两个阶段，eraly参数解析和常规参数解析。顾名思义，early参数解析位于常规参数解析之前，其流程如下：

![](https://pic4.zhimg.com/v2-89e9abe2e4d671caa8c2f4b79eff0489_1440w.jpg)

（1）遍历bootargs中的所有参数，并逐一处理  
（2）对特定参数判断其是属于kernel param类型还是setup类型参数  
（3）early参数解析中不处理kernel param参数，因此不会执行这个分支  
（4）该流程执行实际的early param解析，其代码如下：

```
static int __init do_early_param(char *param, char *val,
                 const char *unused, void *arg)
{
    const struct obs_kernel_param *p;

    for (p = __setup_start; p < __setup_end; p++) {
        if ((p->early && parameq(param, p->str)) ||
            (strcmp(param, "console") == 0 &&
             strcmp(p->str, "earlycon") == 0)
        ) {
            if (p->setup_func(val) != 0)
                pr_warn("Malformed early option '%s'\n", param);
        }
    }
    /* We accept everything at this stage. */
    return 0;
}
```

　　其会遍历setup section，查找与给定bootargs参数匹配且带有eraly标志，以及参数名为console或earlycon的entry，然后执行其对应的setup函数

### ４.３　常规参数解析

　　常规参数解析流程与early参数解析类似，也是通过调用parse args接口解析相关参数。其解析流程如下：

![](https://pic2.zhimg.com/v2-27f4351b872ec0cc5f1d375ea586181f_1440w.jpg)

　　由于带early标志的参数已经在early参数解析中处理，因此不需要再次处理。但其需要处理所有剩余的参数，参数匹配方式有两种：  
（1）内核通过setup方式注册的参数处理接口  
（2）内核通过kernel param方式注册的参数处理接口

### ４.４　kernel param注册

　　kernel param用于设置或获取模块的参数，其主要是向系统注册一个参数相关的变量，并提供获取和修改该变量的get和set回调函数。参数可以通过 [module\_param](https://zhida.zhihu.com/search?content_id=204389582&content_type=Article&match_order=1&q=module_param&zhida_source=entity) 或module\_param\_cb宏定义，其定义如下：

```
#define module_param(name, type, perm)                \
    module_param_named(name, name, type, perm)
```

其中参数含义如下：  
（1）name：参数名  
（2）type：参数类型  
（3）perm：由sysfs使用的权限

　　对于module param接口，使用内核定义的通用set和get方法操作该参数的值。而module\_param\_cb可以为用户提供自定义的set和get回调函数，其定义如下：

```
#define module_param_cb(name, ops, arg, perm)                      \
   __module_param_call(MODULE_PARAM_PREFIX, name, ops, arg, perm, -1, 0)
```

　　它们最终都会调用到以下所示的\_\_module\_param\_call宏，即定义并初始化一个struct kernel\_param结构，并将其链接到\_\_param section中。内核中定义的所有module param都会被链接进该section中，并保存在代码段\_\_start\_\_\_param到\_\_stop\_\_\_param之间的位置。

```
#define __module_param_call(prefix, name, ops, arg, perm, level, flags)    \
    /* Default value instead of permissions? */            \
    static const char __param_str_##name[] = prefix #name;        \
    static struct kernel_param __moduleparam_const __param_##name    \
    __used __section("__param")                    \
    __aligned(__alignof__(struct kernel_param))            \
    = { __param_str_##name, THIS_MODULE, ops,            \
        VERIFY_OCTAL_PERMISSIONS(perm), level, flags, { arg } }
```

　　上面的常规参数解析流程即是遍历\_\_start\_\_\_param和\_\_stop\_\_\_param之间的所有kernel param，并执行相应的set处理

### ４.５　setup接口注册

　　\_\_setup的原理与kernel param类似，也是通过定义并初始化一个链接到特殊段中的结构体，在内核启动处理常规参数解析时遍历该段中定义的entry，逐个与bootargs中解析到的参数比较，若找到匹配的entry则执行其相应的回调函数。

　　与kernel param不同的是，kernel param回调的目的是设置或获取一个变量的值，而\_\_setup宏的回调是可以任意定义的，它可以根据bootargs的输入参数执行用户自定义的操作。该宏的定义如下：

```
#define __setup_param(str, unique_id, fn, early)            \
    static const char __setup_str_##unique_id[] __initconst        \
        __aligned(1) = str;                     \
    static struct obs_kernel_param __setup_##unique_id        \
        __used __section(".init.setup")                \
        __aligned(__alignof__(struct obs_kernel_param))        \
        = { __setup_str_##unique_id, fn, early }

#define __setup(str, fn)                        \
    __setup_param(str, fn, fn, 0)
```

编辑于 2022-06-02 14:15[用它，免费搭建动态查询系统！](https://zhuanlan.zhihu.com/p/53423212)

[

有用户在后台私信小编，在Excel中如何实现动态查询管理。比如有两个表格，在表A中选择员工姓名，则可查看表B中该员...

](https://zhuanlan.zhihu.com/p/53423212)