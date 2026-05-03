---
title: "uboot入门-4命令行和驱动管理"
source: "https://zhuanlan.zhihu.com/p/2025984616545153591"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "本篇讲点大家最常用的 uboot命令行和驱动，干货满满，赶紧收藏阅读吧。1. 命令行先回顾下之前的启动过程： ENTRY(_start)（arch/arm/lib/vectors.S） vectors（arch/arm/cpu/armv8/exceptions.S） reset（arch/arm…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

2 人赞同了该文章

![](https://pica.zhimg.com/v2-62427bb1c742ff9b332a4d9d29550d7c_1440w.jpg)

本篇讲点大家最常用的 **uboot命令行** 和 **驱动** ， **干货满满** ，赶紧收藏阅读吧。

## 1\. 命令行

![](https://picx.zhimg.com/v2-321f4ff011d8d88fbc4262ad758dd5cd_1440w.jpg)

先回顾下之前的启动过程：

1. ENTRY(\_start)（arch/arm/lib/ **vectors.S** ）
2. vectors（arch/arm/cpu/ [armv8](https://zhida.zhihu.com/search?content_id=272874993&content_type=Article&match_order=1&q=armv8&zhida_source=entity) / **exceptions.S** ）
3. reset（arch/arm/cpu/armv8/ **start.S** ）
4. lowlevel\_init（arch/arm/cpu/armv8/ **start.S** ）
5. \_main（arch/arm/lib/ **crt0\_64.S** ）
6. [board\_init\_f](https://zhida.zhihu.com/search?content_id=272874993&content_type=Article&match_order=1&q=board_init_f&zhida_source=entity) \_alloc\_reserve（common/init/ **board\_init.c** ）
7. board\_init\_f（common/ **board\_f.c** ）
8. c\_runtime\_cpu\_setup（arch/arm/cpu/armv8/ **start.S** ）
9. [board\_init\_r](https://zhida.zhihu.com/search?content_id=272874993&content_type=Article&match_order=1&q=board_init_r&zhida_source=entity) （common/ **board\_r.c** ）
10. [run\_main\_loop](https://zhida.zhihu.com/search?content_id=272874993&content_type=Article&match_order=1&q=run_main_loop&zhida_source=entity) （common/ **board\_r.c** ）
11. main\_loop（common/ **main.c** ）

**board\_init\_f** 是uboot **重定位前** 的流程，它包括一些基础模块的初始化和重定位相关的准备工作。以下为该函数在 **armv8架构** 下可能的执行流程，图中虚线框表示该流程是 **可配置** 的，实线框表示是 **必选的** 。

![](https://pica.zhimg.com/v2-b4ee4f20ddd627a34c2a3f66f9fe963e_1440w.jpg)

**board\_init\_r** 是uboot **重定位后** 需要执行的流程，它包含基础模块、硬件驱动以及板级特性等的初始化，并最终通过 **run\_main\_loop** 启动os会进入 **命令行** 窗口。

![](https://pic3.zhimg.com/v2-741e0d9f64cf33f28844e0d457db4fd4_1440w.jpg)

## 1.1 main\_loop到进入命令行

![](https://pic3.zhimg.com/v2-b608a40cd77f60a8b952578312e4d1b6_1440w.jpg)

**board\_init\_r** 里面执行函数的数组最后一个元素就是 **run\_main\_loop** ，然后调用 **main\_loop** ，这里开始已经全是C语言函数了。这里我们从命令行打印开始看下，搜索： **Hit any key to stop autoboot** 可以找到 **abortboot\_single\_key** （）函数，调用顺序如下：

```
main_loop
    autoboot_command
        abortboot
            abortboot_single_key
```

main\_loop的定义如下

```
void main_loop(void)
{
    const char *s;

    bootstage_mark_name(BOOTSTAGE_ID_MAIN_LOOP, "main_loop"); //打印出启动进度

    if (IS_ENABLED(CONFIG_VERSION_VARIABLE))
        env_set("ver", version_string);  /* 设置版本号环境变量 */

    cli_init();

    if (IS_ENABLED(CONFIG_USE_PREBOOT))
        run_preboot_environment_command();

    if (IS_ENABLED(CONFIG_UPDATE_TFTP))
        update_tftp(0UL, NULL, NULL);

    if (IS_ENABLED(CONFIG_EFI_CAPSULE_ON_DISK_EARLY)) {
        /* efi_init_early() already called */
        if (efi_init_obj_list() == EFI_SUCCESS)
            efi_launch_capsules();
    }

    s = bootdelay_process();
    if (cli_process_fdt(&s))
        cli_secure_boot_cmd(s);

    autoboot_command(s);

    cli_loop();
    panic("No CLI available");
}
```

**autoboot\_command** (s);的入参是从bootdelay\_process获取的

```
void autoboot_command(const char *s)
{
    debug("### main_loop: bootcmd=\"%s\"\n", s ? s : "<UNDEFINED>");
```

这里遇到一个 **debug** 打印，我们知道printf是可以打印的，这个 **debug** 怎么能让打印呢？ 如下：

```
/* Show a message if DEBUG is defined in a file */
#define debug(fmt, args...)            \
    debug_cond(_DEBUG, fmt, ##args)
    
    
#ifdef DEBUG
#define _DEBUG    1
#else
#define _DEBUG    0
#endif
```

这里我们不使用DEBUG版本，可以直接修改：debug\_cond(**true**, fmt, ##args)之后编译执行如下：

```
make u-boot && make -f qemu_v8.mk run-only
```
![](https://pic4.zhimg.com/v2-7a9b9e28607f778adba5a4f479c13dc7_1440w.jpg)

可见这个bootcmd是一串命令，在 **autoboot\_command** （）函数中执行如下：

```
autoboot_command
    abortboot //手动输入中断执行命令
    run_command_list //如果没手动输入命令则执行变量s对应的命令，启动linux
```

## 1.2 进入命令行

**abortboot** （）函数 **检测是否有手动输入** ，就进入命令行，这里有个倒计时：CONFIG\_BOOTDELAY中定义

```
include/generated/autoconf.h
#define CONFIG_BOOTDELAY 10
```

这个是生成的，由config文件里面定义

```
configs/qemu_arm64_defconfig中
CONFIG_BOOTDELAY=10
```

如果手动输入了命令，则 **autoboot\_command** （）执行完返回，继续执行cli\_loop();

**cli\_loop** 函数是 uboot 的命令行处理函数，我们在 uboot 中输入各种命令，进行各种操作就是有 cli\_loop 来处理的，此函数定义在文件 common/cli.c 中

```
void cli_loop(void)
{
    bootstage_mark(BOOTSTAGE_ID_ENTER_CLI_LOOP);
#ifdef CONFIG_HUSH_PARSER
    parse_file_outer();
    /* This point is never reached */
    for (;;);
#elif defined(CONFIG_CMDLINE)
    cli_simple_loop();
#else
    printf("## U-Boot command line is disabled. Please enable CONFIG_CMDLINE\n");
#endif /*CONFIG_HUSH_PARSER*/
}
```

**parse\_file\_outer** 调用函数 parse\_stream\_outer，这个函数就是 [hush shell](https://zhida.zhihu.com/search?content_id=272874993&content_type=Article&match_order=1&q=hush+shell&zhida_source=entity) 的命令解释器，负责接收命令行输入，然后解析并执行相应的命令，函数 **parse\_stream\_outer** 定义在文件 common/cli\_hush.c中

```
static int parse_stream_outer(struct in_str *inp, int flag)
{
    do { //循环处理输入命令
        initialize_context(&ctx);
        update_ifs_map();
        rcode = parse_stream(&temp, &ctx, inp, //命令解析
                     flag & FLAG_CONT_ON_NEWLINE ? -1 : '\n');

        if (rcode != 1 && ctx.old_flag == 0) {
            done_word(&temp, &ctx);
            done_pipe(&ctx,PIPE_SEQ);

            run_list(ctx.list_head); //执行解析出来的命令
            code = run_list(ctx.list_head);
}
```

run\_list就不再分析了，里面的处理逻辑代码还是挺好。最后通过调用 **cmd\_process** 函数来处理命令。

```
enum command_ret_t cmd_process(int flag, int argc, char *const argv[],
                   int *repeatable, ulong *ticks)
{
    /* Look up command in command table */
    cmdtp = find_cmd(argv[0]);
    if (cmdtp == NULL) {
        printf("Unknown command '%s' - try 'help'\n", argv[0]);
        return 1;
    }

    /* found - check max args */
    if (argc > cmdtp->maxargs)
        rc = CMD_RET_USAGE;

#if defined(CONFIG_CMD_BOOTD)
    /* avoid "bootd" recursion */
    else if (cmdtp->cmd == do_bootd) {
        if (flag & CMD_FLAG_BOOTD) {
            puts("'bootd' recursion detected\n");
            rc = CMD_RET_FAILURE;
        } else {
            flag |= CMD_FLAG_BOOTD;
        }
    }
#endif

    /* If OK so far, then do the command */
    if (!rc) {
        int newrep;

        if (ticks)
            *ticks = get_timer(0);
        rc = cmd_call(cmdtp, flag, argc, argv, &newrep);
        if (ticks)
            *ticks = get_timer(*ticks);
        *repeatable &= newrep;
    }
    if (rc == CMD_RET_USAGE)
        rc = cmd_usage(cmdtp);
    return rc;
}
```

主要就是 **find\_cmd** 和 **cmd\_call** ，

```
find_cmd--》
    ll_entry_start--》__u_boot_list_2_"#_list"_1"
    find_cmd_tbl

cmd_call--》
        result = cmdtp->cmd_rep(cmdtp, flag, argc, argv, repeatable);
```

可见其从 **section段** 找到一个结构体，然后执行里面的回调函数：

```
struct cmd_tbl {
    char        *name;        /* Command Name            */
    int        maxargs;    /* maximum number of arguments    */
                    /*
                     * Same as ->cmd() except the command
                     * tells us if it can be repeated.
                     * Replaces the old ->repeatable field
                     * which was not able to make
                     * repeatable property different for
                     * the main command and sub-commands.
                     */
    int        (*cmd_rep)(struct cmd_tbl *cmd, int flags, int argc,
                   char *const argv[], int *repeatable);
                    /* Implementation function    */
    int        (*cmd)(struct cmd_tbl *cmd, int flags, int argc,
                   char *const argv[]);
    char        *usage;        /* Usage message    (short)    */
#ifdef    CONFIG_SYS_LONGHELP
    const char    *help;        /* Help  message    (long)    */
#endif
#ifdef CONFIG_AUTO_COMPLETE
    /* do auto completion on the arguments */
    int        (*complete)(int argc, char *const argv[],
                    char last_char, int maxv, char *cmdv[]);
#endif
};
```

那么这个section里面怎么定义命令行呢？答案就是 **U\_BOOT\_CMD** 宏，在include/command.h 中

```
#define U_BOOT_CMD(_name, _maxargs, _rep, _cmd, _usage, _help)        \
    U_BOOT_CMD_COMPLETE(_name, _maxargs, _rep, _cmd, _usage, _help, NULL)

//最后一个参数设置成 NULL 就 是 U_BOOT_CMD
#define U_BOOT_CMD_COMPLETE(_name, _maxargs, _rep, _cmd, _usage, _help, _comp) \
    ll_entry_declare(struct cmd_tbl, _name, cmd) =            \
        U_BOOT_CMD_MKENT_COMPLETE(_name, _maxargs, _rep, _cmd,    \
                        _usage, _help, _comp);
//数据类型声明
#define ll_entry_declare(_type, _name, _list)                \
    _type _u_boot_list_2_##_list##_2_##_name __aligned(4)        \
            __attribute__((unused))                \
            __section("__u_boot_list_2_"#_list"_2_"#_name)
//数据定义
#define U_BOOT_CMD_MKENT_COMPLETE(_name, _maxargs, _rep, _cmd,        \
                _usage, _help, _comp)            \
        { #_name, _maxargs,                    \
         _rep ? cmd_always_repeatable : cmd_never_repeatable,    \
         _cmd, _usage, _CMD_HELP(_help) _CMD_COMPLETE(_comp) }
```

我们以 **version命令** 为例，在cmd/version.c中

```
U_BOOT_CMD(
    version,    1,        1,    do_version,
    "print monitor, compiler and linker version",
    ""
);
```

可见命令行相关的代码都是 **cmd目录** 下。设 置 变 量 **\_u\_boot\_list\_2\_cmd\_2\_version** 存储 在.u\_boot\_list\_2\_cmd\_2\_version 段中。u-boot.lds 链接脚本中有一个名为“.u\_boot\_list”的段，所有.u\_boot\_list 开头的段都存放到.u\_boot.list 中

```
. = ALIGN(8);
__u_boot_list : {
        KEEP(*(SORT(__u_boot_list*)));
}
```

## 1.3 添加或打开命令行

首先uboot支持了很多命令，但是不是默认就打开的，例如smc命令，在cmd/smccc.c中

```
#ifdef CONFIG_CMD_SMC
U_BOOT_CMD(
    smc,    9,        2,    do_call,
    "Issue a Secure Monitor Call",
    "<fid> [arg1 ... arg6] [id]\n"
    "  - fid Function ID\n"
    "  - arg SMC arguments, passed to X1-X6 (default to zero)\n"
    "  - id  Secure OS ID / Session ID, passed to W7 (defaults to zero)\n"
);
#endif
```

**CONFIG\_CMD\_SMC** 需要在configs/ **qemu\_arm64\_defconfig** 中定义就可以了。那么我们想自己添加一个命令行：

1. configs/qemu\_arm64\_defconfig **添加宏控**
```
CONFIG_CMD_HELLO=y
```
1. cmd/Kconfig里面 **添加config定义**
```
config CMD_HELLO
    bool "hello"
    help
      hello support.
```
1. cmd/Makefile中包含上这个c函数的**.o文件**
```
obj-$(CONFIG_CMD_HELLO) += hello.o
```
1. cmd目录下新建一个hello.c里面利用 **U\_BOOT\_CMD注册命令** 和实现命令执行函数
```
#include <command.h>

int do_hello(int argc, char const *argv[])  
{  
    printf("thatway1989 HelloWorld\n");  
    return 0;  
}  
  
U_BOOT_CMD( 
    hello,  1,    1,  do_hello,  
    "hello -just for test uboot command",  
    "hello -hello help.................."  
)
```
![](https://pic3.zhimg.com/v2-19277ab6a9fb4fd1ac85a1a2fb6c8168_1440w.jpg)

2\. 驱动管理

![](https://picx.zhimg.com/v2-a031f24a94cb33803b8109b1f7c72df1_1440w.jpg)

为了方便对 **硬件和驱动** 的管理，uboot还引入了类似linux内核的 **设备树** 和 **驱动模型** 特性。

## 2.1 设备树

调试过linux驱动的都清楚，linux驱动的配置文件和开关都是 **dts设备树** 里面，可以参考之前的文章： [Linux驱动入门-设备树DTS](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484526%26idx%3D1%26sn%3Dc16b2018b02fd33166efc4e8d52f79af%26chksm%3Dfa52824acd250b5cb3db06b04bf012d303539430423f41e591f0eeb8f2db96c8349790803c90%26scene%3D21%23wechat_redirect)

> 设备树是一种通过 [dts文件](https://zhida.zhihu.com/search?content_id=272874993&content_type=Article&match_order=1&q=dts%E6%96%87%E4%BB%B6&zhida_source=entity) 来 **描述SOC属性** ，  
> 通过将设备的具体 **配置信息与驱动分离** ，以达到利用一份代码适配多款设备的机制。dts文件包含了一系列层次化结构的节点和属性，它可以通过 [dtc编译器](https://zhida.zhihu.com/search?content_id=272874993&content_type=Article&match_order=1&q=dtc%E7%BC%96%E8%AF%91%E5%99%A8&zhida_source=entity) 编译成适合设备解析的二进制 [dtb文件](https://zhida.zhihu.com/search?content_id=272874993&content_type=Article&match_order=1&q=dtb%E6%96%87%E4%BB%B6&zhida_source=entity) 。uboot设备树的使用包含以下流程：为目标板添加dts文件、选择一个运行时使用的dtb文件、使能设备树。

我们使用的代码，设备树在arch/arm/dts/ **qemu-arm64.dts** 中定义，现在没有用到所以是空的。configs/qemu\_arm64\_defconfig里面可以选择一个默认的dts文件：

```
CONFIG_DEFAULT_DEVICE_TREE="qemu-arm64"
```

uboot最终的镜像会和dtb打包在一个 **镜像文件** 中，因此在编译流程中就需要知道最终被使用的dtb。有时在编译时希望使用一个不是默认指定的dts，则可以通过在编译命令中添加 **DEVICE\_TREE** =XXX的方式指定新的dts文件.config中我们可以看到：

```
#
# Device Tree Control
#
CONFIG_OF_CONTROL=y
CONFIG_OF_REAL=y
# CONFIG_OF_LIVE is not set
CONFIG_OF_SEPARATE=y
# CONFIG_OF_EMBED is not set
CONFIG_OF_BOARD=y
CONFIG_OF_HAS_PRIOR_STAGE=y
CONFIG_OF_OMIT_DTB=y
CONFIG_DEVICE_TREE_INCLUDES=""
CONFIG_OF_LIST="qemu-arm64"
# CONFIG_MULTI_DTB_FIT is not set
CONFIG_OF_TAG_MIGRATE=y
# CONFIG_OF_DTB_PROPS_REMOVE is not set
```

通过配置 **CONFIG\_OF\_CONTROL** 选项即可使能设备树的支持 uboot与dtb可以有以下几种打包组合方式：

1. 若定义了CONFIG\_OF\_EMBED选项，则在链接时会为dtb指定一个以\_\_dtb\_dt\_begin开头的 **单独的段** ，dtb的内容将被直接链接到uboot.bin镜像中。官方建议这种方式只在开发和调试阶段使用，而不要用于生产阶段
2. 若定义了CONFIG\_OF\_SEPARATE选项，dtb将会被编译为 **u-boot.dtb文** 件，而uboot原始镜像被编译为u-boot-nodtb.bin文件，并通过以下命令将它们连接为最终的uboot.bin文件：
```
cat u-boot-nodtb.bin u-boot.dtb >uboot.bin
```

## 2.2 驱动模块

Uboot驱动模型与linux的设备模型比较类似，利用它可以将 **设备与驱动分离** 。对上可以为同一类设备提供统一的操作接口，对下可以为驱动提供标准的注册接口，从而提高代码的 **可重用性** 和 **可移植性** 。同时，驱动模型通过树形结构组织uboot中的所有设备，为系统对设备的统一管理提供了方便。

**driver结构体** 用于表示一个驱动，在include/dm/ **device.h** 中定义：

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
};
```

例如rk3399的dmc驱动，drivers/ram/rockchip/sdram\_rk3399.c

```
static const struct udevice_id rk3399_dmc_ids[] = {
    { .compatible = "rockchip,rk3399-dmc" },
    { }
};

U_BOOT_DRIVER(dmc_rk3399) = {
    .name = "rockchip_rk3399_dmc",
    .id = UCLASS_RAM,
    .of_match = rk3399_dmc_ids,
    .ops = &rk3399_dmc_ops,
#if defined(CONFIG_TPL_BUILD) || \
    (!defined(CONFIG_TPL) && defined(CONFIG_SPL_BUILD))
    .of_to_plat = rk3399_dmc_of_to_plat,
#endif
    .probe = rk3399_dmc_probe,
    .priv_auto    = sizeof(struct dram_info),
#if defined(CONFIG_TPL_BUILD) || \
    (!defined(CONFIG_TPL) && defined(CONFIG_SPL_BUILD))
    .plat_auto    = sizeof(struct rockchip_dmc_plat),
#endif
};
```

**U\_BOOT\_DRIVER宏** 就是声明驱动的，通过**.of\_match** 中的**.compatibl** e来找到dts中的配置项，另外驱动加载的时候会执行**.probe** 函数，驱动对外提供了**.ops** 操作函数

U\_BOOT\_DRIVER宏的定义如下：

```
#define U_BOOT_DRIVER(__name)                        \
    ll_entry_declare(struct driver, __name, driver)
        
#define ll_entry_declare(_type, _name, _list)                \
    _type _u_boot_list_2_##_list##_2_##_name __aligned(4)        \
            __attribute__((unused))                \
            __section("__u_boot_list_2_"#_list"_2_"#_name)
```

可见跟上面命令行的定义是一致的，都使用 **u-boot.lds 链接脚本** 中有一个名为“**.u\_boot\_list** ”的段。.u\_boot\_list\_2类型section在内存中的布局图：

![](https://pic3.zhimg.com/v2-5cbb28dd5ab998990ba7d402bd36fcaa_1440w.jpg)

对于 **class类型** 的驱动，使用宏 **UCLASS\_DRIVER** 。uclass用于表示一类具有相同功能的设备，从而可以为其抽象出统一的设备访问接口，方便其它模块对它的调用。

```
#define UCLASS_DRIVER(__name)                        \
    ll_entry_declare(struct uclass_driver, __name, uclass_driver)
        
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

每个 **udevice都属于一个uclass** ，使用宏UCLASS\_DRIVER定义。所有的udevice结构体可以通过parent、child\_head和sibling\_node连接在一起，并且最终挂到gd的dm\_root节点上，这样我们就可以通过 **gd->dm\_root遍历所有的udevice设备** 。下图是udevice的连接关系，其中每个节点的parent指向其父节点，sibling指向其兄弟节点，而child指向子节点。

![](https://pica.zhimg.com/v2-19e55c892244baeedf31961c230cc94c_1440w.jpg)

在uboot中实际的设备可以通过以下两种方式定义：

1. **devicetree方式** ：这种方式通过devicetree维护设备信息，uboot在驱动模型初始化时，通过解析设备树获取设备信息，并完成其与驱动等的绑定
2. **硬编码方式** ：这种方式可通过下面的宏定义一个设备：
```
#define U_BOOT_DRVINFO(__name)                        \
       ll_entry_declare(struct driver_info, __name, driver_info)
```

## 2.3 驱动初始化

驱动模型初始化主要完成 **udevice、driver以及ucalss** 等之间的绑定关系，其主要包含以下部分：

1. udevice与driver的绑定
2. udevice与uclass的绑定
3. uclass与uclass\_driver的绑定

该流程通过 **dm\_init\_and\_scan** 函数实现，它会分别扫描由U\_BOOT\_DRVINFO以及devicetree定义的设备，为它们分配udevice结构体，并完成其与driver和uclass之间的绑定关系等操作。

需要注意的是该函数在 **board\_init\_f** 和 **board\_init\_r** 中都会被调用，其中board\_init\_f主要是为了解析重定位前需要使用的设备节点，这种类型节点在devicetree中会增加u-boot,dm-pre-reloc属性。

> 后记：  
> uboot和linux整体上 **套路有点像** ，还有其他的一些OS，例如make menuconfig使用的Kconfig和configs/qemu\_arm64\_defconfig，还有目录定义，以及设备树、命令行等机制。  
> 估计是 **一个机制比较好大家都抄着用** ，对技术使用者来说 **用的越多接触一个新系统越容易上手** ，对于新手或许是调试打印全局查找大法，但是老手直接看目录或许都能找到源码在哪里，而这算是 **内功** ，多看多用就更有手感。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-13 11:17・上海[程序员有必要参加软考吗？](https://www.zhihu.com/question/429151322/answer/116054466729)

[

面对代码与证书的双重挑战当Bug如约而至的午夜，当需求变更如春风拂面般轻松地再次推迟了你的周末计划，你是否曾在IDE的幽光中思考：除了这一行行代码，我的职业生涯还能有什么别的...

](https://www.zhihu.com/question/429151322/answer/116054466729)