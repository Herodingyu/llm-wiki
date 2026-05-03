---
title: "聊聊SOC启动（六） uboot启动流程二"
source: "https://zhuanlan.zhihu.com/p/520087511"
author:
  - "[[lgjjeff]]"
published:
created: 2026-05-03
description: "本文基于以下软硬件假定： 架构：AARCH64 软件：Uboot 2021.10-rc1 1 Uboot支持的主要特性 uboot在初始化完成后会为用户提供一个命令行交互接口，用户可通过该接口执行uboot定义的命令，以用于查看系统状态，设置…"
tags:
  - "clippings"
---
[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944)

TrustZone 等 12 人赞同了该文章

本文基于以下软硬件假定：

架构：AARCH64

软件：Uboot 2021.10-rc1

## 1　Uboot支持的主要特性

　　uboot在初始化完成后会为用户提供一个命令行交互接口，用户可通过该接口执行uboot定义的命令，以用于查看系统状态，设置 [环境变量](https://zhida.zhihu.com/search?content_id=203706975&content_type=Article&match_order=1&q=%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F&zhida_source=entity) 和系统参数等。为了方便对硬件和驱动的管理，uboot还引入了类似linux内核的 [设备树](https://zhida.zhihu.com/search?content_id=203706975&content_type=Article&match_order=1&q=%E8%AE%BE%E5%A4%87%E6%A0%91&zhida_source=entity) 和驱动模型特性。当然，为了增加系统的可配置性、可调试性以及可跟踪性等，它还支持环境变量、log管理、bootstage统计以及简单的ftrace等功能。下面我们将对这些特性做一简单的介绍

### １.1　设备树

　　设备树是一种通过dts文件来描述SOC属性，通过将设备的具体配置信息与驱动分离，以达到利用一份代码适配多款设备的机制。dts文件包含了一系列层次化结构的节点和属性，它可以通过dtc [编译器](https://zhida.zhihu.com/search?content_id=203706975&content_type=Article&match_order=1&q=%E7%BC%96%E8%AF%91%E5%99%A8&zhida_source=entity) 编译成适合设备解析的 [二进制](https://zhida.zhihu.com/search?content_id=203706975&content_type=Article&match_order=1&q=%E4%BA%8C%E8%BF%9B%E5%88%B6&zhida_source=entity) dtb文件。uboot设备树的使用包含以下流程：为目标板添加dts文件、选择一个运行时使用的dtb文件、使能设备树。以下为详细介绍：  
（1）如何为目标板添加一个dts文件

　　在arch/<arch>/dts目录下，添加一个xxx.dts文件，该文件可以从内核拷贝，或者在uboot dts目录下选择一个其它目标板的dts为基础，再根据实际需求进行修改。修改完成后，在arch/arm/dts/Makefile中为其添加编译选项：

```
dtb-$(CONFIG_yyy) +=xxx.dtb
```

其中yyy为使用该dts的目标板

（2）如何为目标板选择dts文件

　　uboot的设备树文件位于arch/<arch>/dts目录下，可通过以下选项为目标板选择一个默认的dts文件：

```
CONFIG_DEFAULT_DEVICE_TREE="xxx”
```

　　这是因为与内核不一样，uboot最终的镜像会和dtb打包在一个 [镜像文件](https://zhida.zhihu.com/search?content_id=203706975&content_type=Article&match_order=1&q=%E9%95%9C%E5%83%8F%E6%96%87%E4%BB%B6&zhida_source=entity) 中，因此在编译流程中就需要知道最终被使用的dtb。关于uboot镜像与dtb之间的关系将在后面详细介绍

（3）通过编译命令指定dts

　　有时在编译时希望使用一个不是默认指定的dts，则可以通过在编译命令中添加DEVICE\_TREE=zzz方式指定新的dts文件，其示例如下：

```
make DEVICE_TREE=zzz
```

（4）如何使能设备树

　　通过配置CONFIG\_OF\_CONTROL选项即可使能设备树的支持

uboot与dtb可以有以下几种打包组合方式：  
（1）若定义了CONFIG\_OF\_EMBED选项，则在链接时会为dtb指定一个以\_\_dtb\_dt\_begin开头的单独的段，dtb的内容将被直接链接到uboot.bin镜像中。官方建议这种方式只在开发和调试阶段使用，而不要用于生产阶段

（2）若定义了CONFIG\_OF\_SEPARATE选项，dtb将会被编译为u-boot.dtb文件，而uboot原始镜像被编译为u-boot-nodtb.bin文件，并通过以下命令将它们连接为最终的uboot.bin文件：

```
cat u-boot-nodtb.bin u-boot.dtb >uboot.bin
```

### １.2　驱动模型DM

　　Uboot驱动模型与linux的设备模型比较类似，利用它可以将设备与驱动分离。对上可以为同一类设备提供统一的操作接口，对下可以为驱动提供标准的注册接口，从而提高代码的 [可重用性](https://zhida.zhihu.com/search?content_id=203706975&content_type=Article&match_order=1&q=%E5%8F%AF%E9%87%8D%E7%94%A8%E6%80%A7&zhida_source=entity) 和可移植性。同时，驱动模型通过树形结构组织uboot中的所有设备，为系统对设备的统一管理提供了方便。

### １.2.1　驱动模型的结构

　　驱动模型主要用于管理系统中的驱动和设备，uboot为它们提供了以下描述结构体：

（1）driver结构体

　　driver结构体用于表示一个驱动，其定义如下:

```
struct driver {
    char *name;
    enum uclass_id id;
    const struct udevice_id *of_match;
    int (*bind)(struct udevice *dev);
    int (*probe)(struct udevice *dev);
    int (*remove)(struct udevice *dev);
    int (*unbind)(struct udevice *dev);
    int (*of_to_plat)(struct udevice *dev);
    int (*child_post_bind)(struct udevice *dev);
    int (*child_pre_probe)(struct udevice *dev);
    int (*child_post_remove)(struct udevice *dev);
    int priv_auto;
    int plat_auto;
    int per_child_auto;
    int per_child_plat_auto;
    const void *ops;    /* driver-specific operations */
    uint32_t flags;
#if CONFIG_IS_ENABLED(ACPIGEN)
    struct acpi_ops *acpi_ops;
#endif
}
```

　　驱动可以通过以下接口注册到系统中：

```
#define U_BOOT_DRIVER(__name)                        \
    ll_entry_declare(struct driver, __name, driver)
其中ll_entry_declare的定义如下：
#define ll_entry_declare(_type, _name, _list)                \
    _type _u_boot_list_2_##_list##_2_##_name __aligned(4)        \
            __attribute__((unused))                \
            __section(".u_boot_list_2_"#_list"_2_"#_name)
```

　　即其会定义一个struct driver 类型的\_u\_boot\_list\_2\_driver\_2\_#\_name变量，该变量在链接时需要被放在.u\_boot\_list\_2\_driver\_2\_#\_name段中。我们再看下这些section在链接脚本中是如何存放的，以下为armv8架构链接脚本arch/arm/cpu/armv8/u-boot.lds中的定义。

```
.u_boot_list : {
    KEEP(*(SORT(.u_boot_list*)));
}
```

　　从定义可看到这些以.u\_boot\_list 开头的section都会被保存在一起，且它们会按照section的名字排序后再保存。这主要是为了便于遍历这些结构体，如我们需要遍历所有已经注册的driver，则可通过以下代码获取driver结构体的起始地址和总的driver数量。

```
struct driver *drv =
            ll_entry_start(struct driver, driver);         （1-1）
int n_ents = ll_entry_count(struct driver, driver);                    （1-2）
```

（1-1）获取已注册driver的起始地址

（1-2）获取已注册driver的数量

　　其中ll\_entry\_start和ll\_entry\_coun的定义如下：

```
#define ll_entry_start(_type, _list)                    \
({                                    \
    static char start[0] __aligned(CONFIG_LINKER_LIST_ALIGN)    \
        __attribute__((unused))                    \
        __section(".u_boot_list_2_"#_list"_1");            \              （1-3）
    (_type *)&start;                        \
})

#define ll_entry_end(_type, _list)                    \
({                                    \
    static char end[0] __aligned(4) __attribute__((unused))        \
        __section(".u_boot_list_2_"#_list"_3");            \               （1-4）
    (_type *)&end;                            \
})

#define ll_entry_count(_type, _list)                    \
    ({                                \
        _type *start = ll_entry_start(_type, _list);        \               
        _type *end = ll_entry_end(_type, _list);        \                   
        unsigned int _ll_result = end - start;            \               （1-5）
        _ll_result;                        \
    })
```

（1-3）定义一个.u\_boot\_list\_2\_"#\_list"\_1的段，若需要遍历driver，则该段的名字为.u\_boot\_list\_2\_driver\_1，即它位于所有实际driver section之前的位置

（1-4）定义一个.u\_boot\_list\_2\_"#\_list"\_3的段，若需要遍历driver，则该段的名字为.u\_boot\_list\_2\_driver\_3，即它位于所有实际driver section之后的位置

（1-5）通过以上两个标号就可以很方便地获取驱动的起止地址和计算已注册驱动的总数

　　最后我们给出.u\_boot\_list\_2类型section在内存中的布局图：

![](https://pic2.zhimg.com/v2-d3cb78ec4f2ae91e5b395416e5d1cf21_1440w.jpg)

（2）uclass\_driver结构体

　　uclass\_driver结构体用于表示一个uclass驱动，其定义如下：

```
struct uclass_driver {
    const char *name;
    enum uclass_id id;
    int (*post_bind)(struct udevice *dev);
    int (*pre_unbind)(struct udevice *dev);
    int (*pre_probe)(struct udevice *dev);
    int (*post_probe)(struct udevice *dev);
    int (*pre_remove)(struct udevice *dev);
    int (*child_post_bind)(struct udevice *dev);
    int (*child_pre_probe)(struct udevice *dev);
    int (*child_post_probe)(struct udevice *dev);
    int (*init)(struct uclass *class);
    int (*destroy)(struct uclass *class);
    int priv_auto;
    int per_device_auto;
    int per_device_plat_auto;
    int per_child_auto;
    int per_child_plat_auto;
    uint32_t flags;
};
```

　　其注册和遍历方式与driver完全相同，只是结构体类型和section名有所不同，以下为其定义：

```
#define UCLASS_DRIVER(__name)                        \
    ll_entry_declare(struct uclass_driver, __name, uclass_driver)
```

（3）udevice结构体

　　udevice在驱动模型中用于表示一个与驱动绑定的设备，其定义如下：

```
struct udevice {
    const struct driver *driver;
    const char *name;
    void *plat_;
    void *parent_plat_;
    void *uclass_plat_;
    ulong driver_data;
    struct udevice *parent;
    void *priv_;
    struct uclass *uclass;
    void *uclass_priv_;
    void *parent_priv_;
    struct list_head uclass_node;
    struct list_head child_head;
    struct list_head sibling_node;
#if !CONFIG_IS_ENABLED(OF_PLATDATA_RT)
    u32 flags_;
#endif
    int seq_;
#if !CONFIG_IS_ENABLED(OF_PLATDATA)
    ofnode node_;
#endif
#ifdef CONFIG_DEVRES
    struct list_head devres_head;
#endif
#if CONFIG_IS_ENABLED(DM_DMA)
    ulong dma_offset;
#endif
}
```

　　系统中所有的udevice结构体可以通过parent、child\_head和sibling\_node连接在一起，并且最终挂到gd的dm\_root节点上，这样我们就可以通过gd->dm\_root遍历所有的udevice设备。下图是udevice的连接关系，其中每个节点的parent指向其父节点，sibling指向其兄弟节点，而child指向子节点。

![](https://pic3.zhimg.com/v2-7933ae04bb373f2dd19dc0bd87e5b178_1440w.jpg)

　　由于每个udevice都属于一个uclass，因此除了被连接到gd->dm\_root链表之外，udevice还会被挂到uclass的链表中。它们之间的连接关系将在下面介绍uclass时给出。  
　　udevice是在驱动模型初始化流程中根据扫描到的设备动态创建的，在uboot中实际的设备可以通过以下两种方式定义：  
　　（3-1）devicetree方式：这种方式通过devicetree维护设备信息，uboot在驱动模型初始化时，通过解析设备树获取设备信息，并完成其与驱动等的绑定  
　　（3-2）硬 [编码方式](https://zhida.zhihu.com/search?content_id=203706975&content_type=Article&match_order=1&q=%E7%BC%96%E7%A0%81%E6%96%B9%E5%BC%8F&zhida_source=entity) ：这种方式可通过下面的宏定义一个设备：

```
#define U_BOOT_DRVINFO(__name)                        \
       ll_entry_declare(struct driver_info, __name, driver_info)
```

（4）uclass结构体

　　uclass用于表示一类具有相同功能的设备，从而可以为其抽象出统一的设备访问接口，方便其它模块对它的调用。以下为uclass的定义：

```
struct uclass {
    void *priv_;
    struct uclass_driver *uc_drv;
    struct list_head dev_head;
    struct list_head sibling_node;
}
```

　　uclass将所有属于该类的设备挂到其dev\_head链表上，同时系统中所有的uclass又会被挂到一张全局链表gd->uclass\_root上。其结构如下图：

![](https://pic1.zhimg.com/v2-952bbc5682420fabcab6ca4ec0a133b6_1440w.jpg)

### １.2.2　驱动模型的初始化

　　驱动模型初始化主要完成udevice、driver以及ucalss等之间的绑定关系，其主要包含以下部分：  
（1）udevice与driver的绑定

（2）udevice与uclass的绑定

（3）uclass与uclass\_driver的绑定

　　该流程通过dm\_init\_and\_scan函数实现，它会分别扫描由U\_BOOT\_DRVINFO以及devicetree定义的设备，为它们分配udevice结构体，并完成其与driver和uclass之间的绑定关系等操作。需要注意的是该函数在board\_init\_f和board\_init\_r中都会被调用，其中board\_init\_f主要是为了解析重定位前需要使用的设备节点，这种类型节点在devicetree中会增加u-boot,dm-pre-reloc属性。这块代码流程比较清晰，有兴趣的同学可以自己分析一下

### １.3　环境变量

　　环境变量可以为uboot提供在运行时动态配置参数的能力，如在命令行通过修改环境变量bootargs可以改变内核的启动参数。它以env=value格式存储，其中每条环境变量之间以’\\0’结尾。根据系统的配置参数，uboot在include/env\_default.h中为系统定义了一份默认的环境变量：

```
#ifdef DEFAULT_ENV_INSTANCE_EMBEDDED
env_t embedded_environment __UBOOT_ENV_SECTION__(environment) = {
#ifdef CONFIG_SYS_REDUNDAND_ENVIRONMENT
    1,        
#endif
    {
#elif defined(DEFAULT_ENV_INSTANCE_STATIC)
static char default_environment[] = {
#elif defined(DEFAULT_ENV_IS_RW)
uchar default_environment[] = {
#else
const uchar default_environment[] = {
#endif
#ifndef CONFIG_USE_DEFAULT_ENV_FILE
#ifdef    CONFIG_ENV_CALLBACK_LIST_DEFAULT
    ENV_CALLBACK_VAR "=" CONFIG_ENV_CALLBACK_LIST_DEFAULT "\0"
#endif
#ifdef    CONFIG_ENV_FLAGS_LIST_DEFAULT
    ENV_FLAGS_VAR "=" CONFIG_ENV_FLAGS_LIST_DEFAULT "\0"
#endif
#ifdef    CONFIG_USE_BOOTARGS
    "bootargs="    CONFIG_BOOTARGS            "\0"
#endif
#ifdef    CONFIG_BOOTCOMMAND
    "bootcmd="    CONFIG_BOOTCOMMAND        "\0"
#endif

…

#ifdef    CONFIG_EXTRA_ENV_SETTINGS
    CONFIG_EXTRA_ENV_SETTINGS
#endif
    "\0"
#else
#include "generated/defaultenv_autogenerated.h"
#endif
#ifdef DEFAULT_ENV_INSTANCE_EMBEDDED
    }
#endif
};
```

　　在该环境变量中，board可通过重新定义CONFIG\_EXTRA\_ENV\_SETTINGS的值设置其自身的默认环境变量，如对于qemu平台，其定义位于include/configs/qemu-arm.h：

```
#define CONFIG_EXTRA_ENV_SETTINGS \
    "fdt_high=0xffffffff\0" \
    "initrd_high=0xffffffff\0" \
    "fdt_addr=0x40000000\0" \
    "scriptaddr=0x40200000\0" \
    "pxefile_addr_r=0x40300000\0" \
    "kernel_addr_r=0x40400000\0" \
    "ramdisk_addr_r=0x44000000\0" \
        BOOTENV
```

　　环境变量被修改后可以保存到固定的存储介质上（如flash、mmc等），以便下一次启动后加载最新的值。Uboot通过U\_BOOT\_ENV\_LOCATION宏定义环境变量的存储位置，例如对于mmc其定义如下（env/mmc.c）：

```
U_BOOT_ENV_LOCATION(mmc) = {
    .location    = ENVL_MMC,
    ENV_NAME("MMC")
    .load        = env_mmc_load,
#ifndef CONFIG_SPL_BUILD
    .save        = env_save_ptr(env_mmc_save),
    .erase        = ENV_ERASE_PTR(env_mmc_erase)
#endif
}
```

　　环境变量在mmc中的具体存储位置可通过配置选项或devicetree设置，如对于mmc：

（1）devicetree方式可在/config节点中设置以下属性  
　　u-boot,mmc-env-partition：指定环境变量存储的分区，环境变量会被存储在在该分区的结尾处  
　　u-boot,mmc-env-offset：若未定义u-boot,mmc-env-partition属性，则该参数用于指定环境变量在mmc [裸设备](https://zhida.zhihu.com/search?content_id=203706975&content_type=Article&match_order=1&q=%E8%A3%B8%E8%AE%BE%E5%A4%87&zhida_source=entity) 上的偏移  
　　u-boot,mmc-env-offset-redundant：指定备份环境变量在mmc设备上的偏移

（2）通过配置参数设置  
　　CONFIG\_ENV\_OFFSET：与u-boot,mmc-env-offset含义相同  
　　CONFIG\_ENV\_OFFSET\_REDUND：与u-boot,mmc-env-offset-redundant含义相同

下面的选项用于配置环境变量的长度及其保存的设备：  
（1）CONFIG\_ENV\_SIZE：环境变量的最大长度

（2）CONFIG\_ENV\_IS\_IN\_XXX（如CONFIG\_ENV\_IS\_IN\_MMC）：环境变量保存的设备类型

（3）CONFIG\_SYS\_MMC\_ENV\_DEV：环境变量保存的设备编号

　　uboot对保存在固定介质中的环境变量会使用crc32校验数据的完整性，若数据被破坏了则会使用默认环境变量重新初始化环境变量的值

### １.4　命令行

　　uboot在初始化完成后可以通过按键进入命令行窗口，在该窗口可以执行像设置环境变量，下载镜像文件，启动内核等命令，这些命令的支持大大方便了uboot和内核启动相关流程的调试。uboot提供了很多内置命令，如md、mw、setenv、saveenv、tftpboot、bootm等，uboot提供了以下宏用于命令定义（include/command.h）：

（1）U\_BOOT\_CMD

　　它用于定义一个uboot命令，其定义如下：

```
#define U_BOOT_CMD(_name, _maxargs, _rep, _cmd, _usage, _help)        \
        U_BOOT_CMD_COMPLETE(_name, _maxargs, _rep, _cmd, _usage, _help, NULL)
```

其中参数含义如下:

\_name：命令名

\_maxargs：最多参数个数

\_rep：命令是否可重复。cmd\_rep回调会输出自身是否可重复（按下回车之后，上条被执行的命令再次被执行则是可重复的）

\_cmd：命令处理函数

\_usage：使用信息，执行help时显示的简短信息

\_help：帮助信息（执行help name时显示的详细使用信息）

（2）U\_BOOT\_CMD\_WITH\_SUBCMDS

　　它用于定义一个带子命令的uboot命令，子命令可以避免主命令处理函数中包含过多的逻辑，还可以为每个子命令可以定义自身的\_rep参数，以独立处理其是否可被重复执行的功能。  
　　以下为其定义：

```
#define U_BOOT_CMD_WITH_SUBCMDS(_name, _usage, _help, ...)        \
    U_BOOT_SUBCMDS(_name, __VA_ARGS__)                \
    U_BOOT_CMDREP_COMPLETE(_name, CONFIG_SYS_MAXARGS, do_##_name,    \
                   _usage, _help, complete_##_name)
```

　　其固定参数如下：

　　　　 \_name：主命令名

\_usage：使用信息，执行help时显示的简短信息

\_help：帮助信息（执行help name时显示的详细使用信息）

　　可变参数部分可用于定义子命令U\_BOOT\_SUBCMD\_MKENT，其定义如下：

```
#define U_BOOT_SUBCMD_MKENT(_name, _maxargs, _rep, _do_cmd)        \
    U_BOOT_SUBCMD_MKENT_COMPLETE(_name, _maxargs, _rep, _do_cmd,    \
                     NULL)
```

　　子命令的参数如下：

　　　　 \_name：子命令名

\_axargs：子命令的最大参数个数

\_rep：该子命令是否可重复执行

\_do\_cmd：子命令的命令处理函数

（3）以wdt命令为例（cmd/wdt.c），其定义了主命令wdt，并且定义了子命令list、dev、start等

```
static char wdt_help_text[] =
    "list - list watchdog devices\n"
    "wdt dev [<name>] - get/set current watchdog device\n"
    "wdt start <timeout ms> [flags] - start watchdog timer\n"
    "wdt stop - stop watchdog timer\n"
    "wdt reset - reset watchdog timer\n"
    "wdt expire [flags] - expire watchdog timer immediately\n";

U_BOOT_CMD_WITH_SUBCMDS(wdt, "Watchdog sub-system", wdt_help_text,
    U_BOOT_SUBCMD_MKENT(list, 1, 1, do_wdt_list),
    U_BOOT_SUBCMD_MKENT(dev, 2, 1, do_wdt_dev),
    U_BOOT_SUBCMD_MKENT(start, 3, 1, do_wdt_start),
    U_BOOT_SUBCMD_MKENT(stop, 1, 1, do_wdt_stop),
    U_BOOT_SUBCMD_MKENT(reset, 1, 1, do_wdt_reset),
    U_BOOT_SUBCMD_MKENT(expire, 2, 1, do_wdt_expire));
```

（4）若我们需要自定义一个命令，可参考如下流程（以test\_cmd命令为例）  
　　a 在cmd目录下创建一个源文件test\_cmd.c  
　　b 在该目录的Makefile中添加编译规则：

```
obj-$(CONFIG_CMD_TEST_CMD) += test_cmd.o
```

　　c 在该目录下的Kconfig文件中添加相应的配置项CONFIG\_CMD\_TEST\_CMD  
　　d 在test\_cmd.c中根据签名的命令定义宏添加命令，并实现其命令处理函数

## 2　Board\_init\_f和board\_init\_r函数流程

　　board\_init\_f和board\_init\_r的函数逻辑都比较清晰，下面我们只给出其调用流程图，而不再深入其细节了

### ２.１　board\_init\_f流程

　　board\_init\_f是uboot重定位前的流程，它包括一些基础模块的初始化和重定位相关的准备工作。以下为该函数在armv8架构下可能的执行流程，图中虚线框表示该流程是可配置的，实线框表示是必选的。

![](https://pic4.zhimg.com/v2-a520fe1e4f40c05375b078c05da8d85b_1440w.jpg)

### ２.２　board\_init\_r流程

　　board\_init\_r是uboot重定位后需要执行的流程，它包含基础模块、硬件驱动以及板级特性等的初始化，并最终通过run\_main\_loop启动os会进入命令行窗口。

![](https://picx.zhimg.com/v2-362f2c1baed4cff06fdcc892ca31f973_1440w.jpg)

编辑于 2022-07-21 15:10[告别 Excel VBA 困境！SpreadJS 助力金融证券开发者打造高性能 Web 系统](https://zhuanlan.zhihu.com/p/1984584311027033734)

[

在金融证券行业，Excel VBA 曾是数据处理、报表生成、行情计算的“刚需工具”——从交易明细统计到基金净值测算，从风控指标计算到审计底稿编制，无数业务流程依赖 VBA 实现自动化。但...

](https://zhuanlan.zhihu.com/p/1984584311027033734)