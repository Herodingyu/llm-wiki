---
title: "uboot入门-5linux启动前夜"
source: "https://zhuanlan.zhihu.com/p/2026982393697906877"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "uboot不是 runtime运行时，它的使命就是加载运行Linux，之后生命周期就死亡了。我们在uboot命令行输入 boot，或者到命令行倒计时时不敲键盘进行中断，则默认去启动了linux，本文对这个过程进行下分析。1. boot过程…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

1 人赞同了该文章

![](https://pic4.zhimg.com/v2-f5139f4d5ea912a86b4b2a4cf736da01_1440w.jpg)

[uboot](https://zhida.zhihu.com/search?content_id=272990029&content_type=Article&match_order=1&q=uboot&zhida_source=entity) 不是 **runtime运行时** ，它的使命就是 **加载运行Linux** ，之后生命周期就 **死亡** 了。

我们在uboot命令行输入 **boot** ，或者到命令行倒计时时 **不敲键盘** 进行中断，则默认去启动了linux，本文对这个过程进行下分析。

## 1\. boot过程

![](https://pica.zhimg.com/v2-730151ad5c9b2ae662c2f02be5a3aa08_1440w.jpg)

## 1.1 boot命令

找一个命令定义，可以 **cmd目录** 搜索" **boot**, ",或者熟悉的去cmd目录下直接找，这里在 **cmd/bootm.c** 中

```
int do_bootd(struct cmd_tbl *cmdtp, int flag, int argc, char *const argv[])
{
    return run_command(env_get("bootcmd"), flag);
}

U_BOOT_CMD(
    boot,    1,    1,    do_bootd,
    "boot default, i.e., run 'bootcmd'",
    ""
);
```

这里可见其执行了环境变量' **bootcmd** '，我们在命令行打印如下：

![](https://pica.zhimg.com/v2-6db5a89aac540fb350315889cb1c4864_1440w.jpg)

可见跟 **main\_loop** 中打印出来是 **变量s** 是一样的，也就是说命令行输入boot跟命令行不中断继续执行是一致的，跟我们的猜想相符。

这串命令的最后执行了 **bootm**

```
U_BOOT_CMD(
    bootm,    CONFIG_SYS_MAXARGS,    1,    do_bootm,
    "boot application image from memory", bootm_help_text
);
```

**bootm** 的三个参数如下：

![](https://pic1.zhimg.com/v2-d88989e5c7a3d3eb26e6a159f5836bdc_1440w.jpg)

## 1.2 bootm命令

**do\_bootm--》do\_bootm\_states** （在boot/bootm.c中定义）主要流程包括根据镜像头 **获取镜像信息，解压镜像，以及启动操作系统** 。以下为其主要执行流程：

![](https://pica.zhimg.com/v2-2e5d17f874ecdf3ef0cefc6094dfb50c_1440w.jpg)

入参state的定义：

```
states = BOOTM_STATE_START | BOOTM_STATE_FINDOS | BOOTM_STATE_PRE_LOAD |
    BOOTM_STATE_FINDOTHER | BOOTM_STATE_LOADOS |
    BOOTM_STATE_OS_PREP | BOOTM_STATE_OS_FAKE_GO |
    BOOTM_STATE_OS_GO;
```

**根据state的定义执行相关的处理函数** 。

```
int do_bootm_states(struct cmd_tbl *cmdtp, int flag, int argc,
            char *const argv[], int states, struct bootm_headers *images,
            int boot_progress)
{
    if (states & BOOTM_STATE_START)
        ret = bootm_start(cmdtp, flag, argc, argv);

    if (!ret && (states & BOOTM_STATE_PRE_LOAD))
        ret = bootm_pre_load(cmdtp, flag, argc, argv);

    if (!ret && (states & BOOTM_STATE_FINDOS))
        ret = bootm_find_os(cmdtp, flag, argc, argv);

    if (!ret && (states & BOOTM_STATE_FINDOTHER))
        ret = bootm_find_other(cmdtp, flag, argc, argv);

    /* Load the OS */
    if (!ret && (states & BOOTM_STATE_LOADOS)) {
        iflag = bootm_disable_interrupts();//关闭中断
        ret = bootm_load_os(images, 0);
        if (ret && ret != BOOTM_ERR_OVERLAP)
            goto err;
        else if (ret == BOOTM_ERR_OVERLAP)
            ret = 0;
    }

    /* Relocate the ramdisk */
#ifdef CONFIG_SYS_BOOT_RAMDISK_HIGH
    if (!ret && (states & BOOTM_STATE_RAMDISK)) {
        ulong rd_len = images->rd_end - images->rd_start;

        ret = boot_ramdisk_high(&images->lmb, images->rd_start,
            rd_len, &images->initrd_start, &images->initrd_end);
        if (!ret) {
            env_set_hex("initrd_start", images->initrd_start);
            env_set_hex("initrd_end", images->initrd_end);
        }
    }
#endif
#if CONFIG_IS_ENABLED(OF_LIBFDT) && defined(CONFIG_LMB)
    if (!ret && (states & BOOTM_STATE_FDT)) {
        boot_fdt_add_mem_rsv_regions(&images->lmb, images->ft_addr);
        ret = boot_relocate_fdt(&images->lmb, &images->ft_addr,
                    &images->ft_len);
    }
#endif

    /* From now on, we need the OS boot function */
    if (ret)
        return ret;
    boot_fn = bootm_os_get_boot_func(images->os.os); //，参数 images->os.os 就是系统类型，根据这个系统类型来选择对应的启动函数，Linux 系统启动函数为 do_bootm_linux，boot_fn=do_bootm_linux，后面执行 boot_fn函数的地方实际上是执行的 do_bootm_linux 函数
        
    need_boot_fn = states & (BOOTM_STATE_OS_CMDLINE |
            BOOTM_STATE_OS_BD_T | BOOTM_STATE_OS_PREP |
            BOOTM_STATE_OS_FAKE_GO | BOOTM_STATE_OS_GO);
    if (boot_fn == NULL && need_boot_fn) {
        if (iflag)
            enable_interrupts();
        printf("ERROR: booting os '%s' (%d) is not supported\n",
               genimg_get_os_name(images->os.os), images->os.os);
        bootstage_error(BOOTSTAGE_ID_CHECK_BOOT_OS);
        return 1;
    }

    /* Call various other states that are not generally used */
    if (!ret && (states & BOOTM_STATE_OS_CMDLINE))
        ret = boot_fn(BOOTM_STATE_OS_CMDLINE, argc, argv, images);
    if (!ret && (states & BOOTM_STATE_OS_BD_T))
        ret = boot_fn(BOOTM_STATE_OS_BD_T, argc, argv, images);
    if (!ret && (states & BOOTM_STATE_OS_PREP)) {
        ret = bootm_process_cmdline_env(images->os.os == IH_OS_LINUX);
        if (ret) {
            printf("Cmdline setup failed (err=%d)\n", ret);
            ret = CMD_RET_FAILURE;
            goto err;
        }
        ret = boot_fn(BOOTM_STATE_OS_PREP, argc, argv, images);
    }

#ifdef CONFIG_TRACE
    /* Pretend to run the OS, then run a user command */
    if (!ret && (states & BOOTM_STATE_OS_FAKE_GO)) {
        char *cmd_list = env_get("fakegocmd");

        ret = boot_selected_os(argc, argv, BOOTM_STATE_OS_FAKE_GO,
                images, boot_fn);
        if (!ret && cmd_list)
            ret = run_command_list(cmd_list, -1, flag);
    }
#endif

    /* Check for unsupported subcommand. */
    if (ret) {
        printf("subcommand failed (err=%d)\n", ret);
        return ret;
    }

    /* Now run the OS! We hope this doesn't return */
    if (!ret && (states & BOOTM_STATE_OS_GO))
        ret = boot_selected_os(argc, argv, BOOTM_STATE_OS_GO,
                images, boot_fn); //启动linux内核

    /* Deal with any fallout */
err:
    if (iflag)
        enable_interrupts();

    if (ret == BOOTM_ERR_UNIMPLEMENTED)
        bootstage_error(BOOTSTAGE_ID_DECOMP_UNIMPL);
    else if (ret == BOOTM_ERR_RESET)
        do_reset(cmdtp, flag, argc, argv);

    return ret;
}
```

**bootm\_os\_get\_boot\_func** 来查找对应系统的启动函数 **boot\_fn** 在boot/bootm\_os.c中：

```
bootm_os_get_boot_func--》
    return boot_os[os];

static boot_os_fn *boot_os[] = {
    [IH_OS_U_BOOT] = do_bootm_standalone,
#ifdef CONFIG_BOOTM_LINUX
    [IH_OS_LINUX] = do_bootm_linux,
#endif
#ifdef CONFIG_BOOTM_NETBSD
    [IH_OS_NETBSD] = do_bootm_netbsd,
#endif
#ifdef CONFIG_BOOTM_RTEMS
    [IH_OS_RTEMS] = do_bootm_rtems,
#endif
#if defined(CONFIG_BOOTM_OSE)
    [IH_OS_OSE] = do_bootm_ose,
#endif
#if defined(CONFIG_BOOTM_PLAN9)
    [IH_OS_PLAN9] = do_bootm_plan9,
#endif
#if defined(CONFIG_BOOTM_VXWORKS) && \
    (defined(CONFIG_PPC) || defined(CONFIG_ARM) || defined(CONFIG_RISCV))
    [IH_OS_VXWORKS] = do_bootm_vxworks,
#endif
#if defined(CONFIG_CMD_ELF)
    [IH_OS_QNX] = do_bootm_qnxelf,
#endif
#ifdef CONFIG_INTEGRITY
    [IH_OS_INTEGRITY] = do_bootm_integrity,
#endif
#ifdef CONFIG_BOOTM_OPENRTOS
    [IH_OS_OPENRTOS] = do_bootm_openrtos,
#endif
#ifdef CONFIG_BOOTM_OPTEE
    [IH_OS_TEE] = do_bootm_tee,
#endif
#ifdef CONFIG_BOOTM_EFI
    [IH_OS_EFI] = do_bootm_efi,
#endif
};
```

**boot\_selected\_os** （）在boot/bootm\_os.c中定义：

```
int boot_selected_os(int argc, char *const argv[], int state,
             struct bootm_headers *images, boot_os_fn *boot_fn)
{
    arch_preboot_os();
    board_preboot_os();
    boot_fn(state, argc, argv, images); //启动内核

    return BOOTM_ERR_RESET;
}
```

## 1.3 do\_bootm\_linux

![](https://picx.zhimg.com/v2-6ec2302b893861e1f82409c9878e082b_1440w.jpg)

**boot\_fn=do\_bootm\_linux** 就是是最终启动 Linux 内核的函数。其调用 **[boot\_prep\_linux](https://zhida.zhihu.com/search?content_id=272990029&content_type=Article&match_order=1&q=boot_prep_linux&zhida_source=entity)** 来完成具体的处理过程。boot\_prep\_linux 主要用于处理环境变量bootargs， **bootargs** 保存着传递给 Linux kernel 的参数。

```
int do_bootm_linux(int flag, int argc, char *const argv[],
           struct bootm_headers *images)
{
    /* No need for those on ARM */
    if (flag & BOOTM_STATE_OS_BD_T || flag & BOOTM_STATE_OS_CMDLINE)
        return -1;

    if (flag & BOOTM_STATE_OS_PREP) {
        boot_prep_linux(images);
        return 0;
    }

    if (flag & (BOOTM_STATE_OS_GO | BOOTM_STATE_OS_FAKE_GO)) {
        boot_jump_linux(images, flag);
        return 0;
    }
    boot_prep_linux(images);
    boot_jump_linux(images, flag);
    return 0;
}
```

**boot\_jump\_linux**

```
static void boot_jump_linux(struct bootm_headers *images, int flag)
{
#ifdef CONFIG_ARM64
    void (*kernel_entry)(void *fdt_addr, void *res0, void *res1,
            void *res2);
    int fake = (flag & BOOTM_STATE_OS_FAKE_GO);

    kernel_entry = (void (*)(void *fdt_addr, void *res0, void *res1,
                void *res2))images->ep; //此函数是进入 Linux 内核的

    debug("## Transferring control to Linux (at address %lx)...\n",
        (ulong) kernel_entry);
    bootstage_mark(BOOTSTAGE_ID_RUN_OS);

    announce_and_cleanup(fake); //打印一些信息并做一些清理工作,例如打印了Starting Kernel ...

    if (CONFIG_IS_ENABLED(OF_LIBFDT) && images->ft_len)
        r2 = (unsigned long)images->ft_addr; //如果使用设备树的话，r2 应该是设备树的起始地址，而设备树地址保存在 images的 ftd_addr 成员变量中
    else
        r2 = gd->bd->bi_boot_params; //如果不使用设备树的话，r2 应该是 uboot 传递给 Linux 的参数起始地址，也就是环境变量 bootargs 的值，
               
        kernel_entry(0, machid, r2); //uboot真正进入linux内核了
```

kernel\_entry函数有三个参数： **zero，arch，params** ，第一个参数 zero 同样为 0；第二个参数为 **机器 ID** ；第三个参数 ATAGS 或者 **设备树(DTB)首地址** ，ATAGS 是传统的方法，用于传递一些命令行信息啥的，如果使用设备树的话就要传递设备树(DTB)。

函数 **kernel\_entry** 并不是 uboot 定义的，而是 Linux 内核定义的，Linux 内核镜像文件的第一行代码就是函数 kernel\_entry，而 **images->ep** 保存着 Linux内核镜像的起始地址，起始地址保存的正是 Linux 内核第一行代码！

## 2\. 镜像基础介绍

uboot主要用于启动操作系统，以armv8架构下的linux为例，其启动时需要包含 **kernel、dtb和rootfs** 三部分。

## 2.1 内核镜像

linux内核编译出来的原始内核文件 **vmlinux** ，在optee/linux目录中

![](https://pic1.zhimg.com/v2-b4473b7fcc77de082c69c65856fb5074_1440w.jpg)

vmlinux经过 **bojcopy** 去掉elf头文件生成的纯二进制文件

```
OBJCOPYFLAGS_Image := -O binary -R .note -R .note.gnu.build-id -R .comment –S   （1）
targets := Image Image.bz2 Image.gz Image.lz4 Image.lzma Image.lzo
$(obj)/Image: vmlinux FORCE                                                     
        $(call if_changed,objcopy)                                               （2）

$(obj)/Image.bz2: $(obj)/Image FORCE
        $(call if_changed,bzip2)                                                 （3）

$(obj)/Image.gz: $(obj)/Image FORCE
        $(call if_changed,gzip)                                                  （4）

$(obj)/Image.lz4: $(obj)/Image FORCE
        $(call if_changed,lz4)                                                   （5）

$(obj)/Image.lzma: $(obj)/Image FORCE
        $(call if_changed,lzma)                                                  （6）

$(obj)/Image.lzo: $(obj)/Image FORCE
        $(call if_changed,lzo)                                                   （7）
```

（1）objcopy命令使用的flag定义（2）以vmlinux为原始文件，通过objcopy命令制作Image镜像。其命令可扩展如下：

```
aarch64-linux-gnu-objcopy -O binary -R .note -R .note.gnu.build-id -R .comment -S vmlinux Image
```

该命令会执行以下操作：  
　a –O binary：将输出二进制镜像，即会去掉elf头  
　b –R.note：-R选项表示去掉镜像中指定的section，如这里会去掉.note、.note.gnu.build-id和.comment段  
　c –S：去掉符号表和重定位信息，它与-R选项的功能类似，都是为了减小镜像的size  
因此，执行该命令后生成的Image镜像是去掉elf头，去掉.note等无用的section，以及strip过的二进制镜像。它可以被uboot的 **booti命令** 直接启动。但若要使用bootm启动，则还需要将其进一步封装为后面介绍的uimage或bootimg镜像

（3 – 7）以 **Image** 为源文件，调用不同的压缩算法，对镜像进行压缩。若调用gzip命令，则可将其压缩为我们熟悉的zImage镜像。与Image一样，压缩后的镜像也是可以被booti直接启动，且经过封装以后可以被bootm启动的

## 2.2 dtb文件

**设备树** 是设备树 **dts源文件** 经过编译后生成的，其目标文件为二进制格式的 **dtb文件** 。其示例编译命令如下：

```
dtc -I dts -O dtb -o example.dtb example.dts
```

（1）–I：指定输入文件格式（2）–O：指定输出文件格式（3）–o：指定输出文件名

设备树还支持 **dtb overlay** 机制，即可以向设备提供一个基础dtb和多个dtbo镜像，并在启动前将它们merge为最终的dtb。

## 2.3 根文件系统

linux可以支持多种形式的 **根文件系统** ，如initrd、 [initramfs](https://zhida.zhihu.com/search?content_id=272990029&content_type=Article&match_order=1&q=initramfs&zhida_source=entity) 、基于磁盘的根文件系统等。站在启动镜像的角度看其实它们都是制作好的文件系统镜像，内核可以从特定的位置 **获取并挂载** 它们。以下是它们在启动时的基本特性：

（1）initrd  
它是一种 **内存文件系统** ，需要由bootloader预先加载到内存中，并将其内存地址传递给内核。如uboot将initrd加载到地址$initrd\_addr处，则bootm参数如下：

```
bootm  $kernel_addr  $initrd_addr  $fdt_addr
```

（2）initramfs  
　initramfs也是一种 **内存文件系统** ，但与initrd不同，它是与内核打包在一起的。因此不需要通过额外的参数

（3）磁盘rootfs  
**磁盘根文件系统** 会被刷写到 **flash、mmc或disk** 的分区中，在内核启动时可在bootargs添加下面格式的参数，以指定根文件系统的位置

```
root=/dev/xxx
```

因此，以上这些rootfs只有initrd是需要uboot独立加载的，故只有当rootfs为initrd时，uboot镜像打包流程才需要在镜像打包时为其单独考虑

关于uboot支持的镜像格式，可以参考： [zhuanlan.zhihu.com/p/52](https://zhuanlan.zhihu.com/p/520575102)

这里说下 **Fit uimage格式** ，这个跟 **secure boot** 相关。Fit uimage是使用devicetree语法来定义uimage镜像描述信息以及启动时的各种属性，这些信息被写入一个后缀名为its的源文件中。

以下是一个its文件的示例

```
/dts-v1/;

/ {
    description = "Various kernels, ramdisks and FDT blobs";
    #address-cells = <1>;

    images {
        kernel-1 {
            description = "vanilla-2.6.23";              （1）
            data = /incbin/("./vmlinux.bin.gz");         （2）
            type = "kernel";                             （3）
            arch = "ppc";                                （4）
            os = "linux";                                （5）
            compression = "gzip";                        （6）
            load = <00000000>;                           （7）
            entry = <00000000>;                          （8）
            hash-1 {
                algo = "md5";                        （9）
            };
            hash-2 {
                algo = "sha1";
            };
        };

        kernel-2 {
            description = "2.6.23-denx";
            data = /incbin/("./2.6.23-denx.bin.gz");
            type = "kernel";
            arch = "ppc";
            os = "linux";
            compression = "gzip";
            load = <00000000>;
            entry = <00000000>;
            hash-1 {
                algo = "sha1";
            };
        };

        kernel-3 {
            description = "2.4.25-denx";
            data = /incbin/("./2.4.25-denx.bin.gz");
            type = "kernel";
            arch = "ppc";
            os = "linux";
            compression = "gzip";
            load = <00000000>;
            entry = <00000000>;
            hash-1 {
                algo = "md5";
            };
        };

        ramdisk-1 {
            description = "eldk-4.2-ramdisk";
            data = /incbin/("./eldk-4.2-ramdisk");
            type = "ramdisk";
            arch = "ppc";
            os = "linux";
            compression = "gzip";
            load = <00000000>;
            entry = <00000000>;
            hash-1 {
                algo = "sha1";
            };
        };

        ramdisk-2 {
            description = "eldk-3.1-ramdisk";
            data = /incbin/("./eldk-3.1-ramdisk");
            type = "ramdisk";
            arch = "ppc";
            os = "linux";
            compression = "gzip";
            load = <00000000>;
            entry = <00000000>;
            hash-1 {
                algo = "crc32";
            };
        };

        fdt-1 {
            description = "tqm5200-fdt";
            data = /incbin/("./tqm5200.dtb");
            type = "flat_dt";
            arch = "ppc";
            compression = "none";
            hash-1 {
                algo = "crc32";
            };
        };

        fdt-2 {
            description = "tqm5200s-fdt";
            data = /incbin/("./tqm5200s.dtb");
            type = "flat_dt";
            arch = "ppc";
            compression = "none";
            load = <00700000>;
            hash-1 {
                algo = "sha1";
            };
        };

    };

    configurations {
        default = "config-1";

        config-1 {
            description = "tqm5200 vanilla-2.6.23 configuration";
            kernel = "kernel-1";
            ramdisk = "ramdisk-1";
            fdt = "fdt-1";
        };

        config-2 {
            description = "tqm5200s denx-2.6.23 configuration";
            kernel = "kernel-2";
            ramdisk = "ramdisk-1";
            fdt = "fdt-2";
        };

        config-3 {
            description = "tqm5200s denx-2.4.25 configuration";
            kernel = "kernel-3";
            ramdisk = "ramdisk-2";
        };
    };
};
```

它包含 **images** 和 **configurations** 两个顶级节点，

1. images指定该its文件会 **包含哪些镜像** ，以及这些镜像的属性信息。
2. configurations用于定义一系列 **镜像组合信息** ，如在本例中包含了config-1、config-2和config-3三种镜像组合方式。Its使用default属性指定启动时默认采用的配置信息，若启动时不希望使用默认配置，则可通过在启动参数中动态指定配置序号。下面我们通过kernel-1节点看下image属性的含义：

（1）镜像的描述信息（2）镜像文件的路径（3）镜像类型，如kernel、ramdisk或fdt（4）支持的架构（5）支持的操作系统（6）其使用的压缩算法（7）加载地址（8）运行地址（9）完整性校验使用的hash算法

configurations的属性比较简单，就是指定某个配置下使用哪一个kernel、dtb和ramdisk镜像。Fit image除了支持 **完整性校验** 外，还可支持 **hash算法 + 非对称算法的secure boot** 方案，如以下例子：

```
kernel {
            data = /incbin/("test-kernel.bin");
            type = "kernel_noload";
            arch = "sandbox";
            os = "linux";
            compression = "none";
            load = <0x4>;
            entry = <0x8>;
            kernel-version = <1>;
            signature {
                algo = "sha1,rsa2048";        （1）
                key-name-hint = "dev";       （2）
            };
        };
```

（1）指定sha1为secure boot签名使用的hash算法，rsa2048为其使用的签名算法（2）可能使用的验签密钥名

> 后记：  
> uboot写到这里启动完毕，但是感觉 **越写越复杂** ，那linux不得更复杂的吓人。看来掌握这些知识不是一蹴而就的， **嵌入式工程师** 也是 **需要时间去沉淀** 。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-04-13 11:18・上海[嵌入式培训是哪个机构比较好，达内怎样，华清又怎样？](https://www.zhihu.com/question/34561115/answer/3624555488)

[

作为一个培训机构出来的程序员，我对这个问题有很深的感触。2014年，我通过培训班找到了第一份程序员的工作。那个时候，IT行业正处于高速发展期，整体就业环境很好，虽然好工作不多，...

](https://www.zhihu.com/question/34561115/answer/3624555488)