---
title: "uboot入门-1简介和运行"
source: "https://zhuanlan.zhihu.com/p/2025983871934632717"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "接触 嵌入式linux的朋友估计都听说过，在内核启动前有一个uboot，一个新的板子可能还需要移植uboot，其还挺神秘。不过又可能听研究linux的人说，uboot太简单了，像一个玩具系统。这估计就是内行外行的差距：会了不…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

4 人赞同了该文章

![](https://picx.zhimg.com/v2-145c85312cddffd95c7f06296cc3ba05_1440w.jpg)

接触 **嵌入式linux** 的朋友估计都听说过，在内核启动前有一个 **[uboot](https://zhida.zhihu.com/search?content_id=272874767&content_type=Article&match_order=1&q=uboot&zhida_source=entity)** ，一个新的板子可能还需要移植uboot，其还挺神秘。不过又可能听研究linux的人说，uboot太简单了，像一个 **玩具系统** 。这估计就是内行外行的差距： **会了不难，难了不会** 。

趁着我们搭建的 [qemu](https://zhida.zhihu.com/search?content_id=272874767&content_type=Article&match_order=1&q=qemu&zhida_source=entity) 源码系统： [ATF入门-1qmeu搭建ARM全套源码学习环境](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485508%26idx%3D1%26sn%3D99c019e8d4efddef614115d61bdfbffb%26chksm%3Dfa528e60cd2507766d08588aaed93f67c51fe6c77d502bebf8f6b429b2236c24d42d947e0108%26scene%3D21%23wechat_redirect) ，来一探其源码。

## 1\. uboot简介

## 1.1 简介

> 什么是boot？  
> 在计算机领域中，"boot"被用来表示计算机系统的启动过程，即将计算机从关机状态转换为可运行操作系统的状态。  
> 计算机的启动过程涉及一系列步骤，其中包括硬件初始化、加载引导程序和操作系统等。当计算机通电或重启时，它会首先执行一些基本的硬件初始化操作，例如检测和配置内存、外围设备等。然后，计算机会加载引导程序（Bootloader），这是一个特殊的软件，负责启动操作系统。  
> 引导程序的主要任务是将操作系统加载到计算机的内存中，并将控制权交给操作系统，使其能够开始执行。引导程序通常存储在计算机的固件中，例如 [BIOS](https://zhida.zhihu.com/search?content_id=272874767&content_type=Article&match_order=1&q=BIOS&zhida_source=entity) （基本输入/输出系统）或 [UEFI](https://zhida.zhihu.com/search?content_id=272874767&content_type=Article&match_order=1&q=UEFI&zhida_source=entity) （统一可扩展固件接口）。引导程序还可以提供其他功能，如设备驱动程序加载、启动参数设置等。  
> 因此，"boot"一词在计算机领域中用来表示整个启动过程，它涉及从关机状态开始，逐步加载和配置系统组件，最终使得计算机能够运行操作系统并进入可用状态。  
>   
> 什么是 [U-Boot](https://zhida.zhihu.com/search?content_id=272874767&content_type=Article&match_order=1&q=U-Boot&zhida_source=entity) ？  
> u-boot全称 Universal Boot Loader，是遵循GPL条款的开放源码项目，U-Boot的作用是系统引导。

1. 支持多种OS：Linux、NetBSD, VxWorks, QNX, RTEMS, ARTOS, LynxOS, android等
2. 支持多种指令集处理器：MIPS、 x86、ARM、NIOS、XScale、PowerPC等

德国大神Magnus Damm（马格努斯 达姆）发起的一个项目，这个项目后面被 **[Wolfgang Denk](https://zhida.zhihu.com/search?content_id=272874767&content_type=Article&match_order=1&q=Wolfgang+Denk&zhida_source=entity)** （沃尔夫冈 登克）转移到了 [SourceFore.net](https://link.zhihu.com/?target=http%3A//SourceFore.net) 上来了，但是 [SourceForge.net](https://link.zhihu.com/?target=http%3A//SourceForge.net) 上不允许以数字来开头的项目命名名称，所以改名为 [PPCBoot](https://zhida.zhihu.com/search?content_id=272874767&content_type=Article&match_order=1&q=PPCBoot&zhida_source=entity) 。PPCBoot 在 2000 年 7 月 19 日 第一次被公开发布出来了；其实， Uboot 从 FADSROM、8xxROM、PPCBOOT逐步发展演化而来的。这期间被很多人使用，甚至被许多Soc厂商支持，这更加推动了 Uboot的广泛使用了。最终，Uboot经过多年发展，已经成为业内 [bootloader](https://zhida.zhihu.com/search?content_id=272874767&content_type=Article&match_order=1&q=bootloader&zhida_source=entity) （引导程序）标准了，而且现在大部分的嵌入式设备都会默认使用 Uboot 来作为 **bootloader** 了。

可以说正是因为其开源开放，得到了发展，这里也要感谢开源软件的兴起。不幸的是Wolfgang Denk 2022年66岁就挂了，看来干这个活也挺累的，虽然计算机技术比较新，但是最早一批的开拓者还是慢慢的离开了我们。我们或许也在这条路上。

扯点别的， **今天的技术未来是否过时了** ，是否还有用。拉长时间来看估计肯定是会被抛弃的，就像本文写的uboot，但是这其实是一个 **先有鸡还是先有鸡蛋** 的问题。用几天的技术造了电脑， **电脑用来造组成电脑的更先进的技术来替换自己** ，这就形成了 **进化** 。看似新技术跟旧技术没有关系，但是 **没有一个时代另一个时代也不会凭空到来** 。

## 1.2 uboot的作用

首先uboot可以说是一个 **裸机程序** ，提到裸机程序直觉就是可以 **验证功能** ，所以uboot提供了强大的 **命令行** ，支持了各种硬件相关的驱动程序，所以先跑起来uboot很重要。

然后就是一些功能不方便kernel去做的，比如升级就更加的高效。因为uboot里面去操作FLASH等有更高的效率

若设置了 u-boot 启动时 **等待任意键输入几秒** ，若有输入，则退出自启动模式而进入命令行模式。

- `help` ：显示所有命令及其说明；
- `help 命令` ：显示 `命令` 详细的使用说明；
- `pri` ：查看所有环境变量，包括开机等待任意输入的时延（秒）、串口波特率（baudrate）、本地 IP 地址（ipaddr）、tftp 服务器端的 IP 地址（serverip）、自启动命令字符串（bootcmd，一般不用动）等等；
- `setenv <环境变量> <要设置的值>` ：修改某一个环境变量为要设置的值， `要设置的值` 若是字符串则要加双引号；
- `saveenv` ：将当前所有设置过的环境变量保存，掉电不丢失；
- `reset` ：复位；
- `dhcp` ：执行 DHCP 服务，获取 IP 地址，验证网络功能；
- `setenv my` ：恢复系统的所有环境变量为默认，即使之前用户重设的环境变量都恢复默认；
- `protext on/off 0~10000` ：对 Nor Flash 区域 \[0x0 ~ 0x10000\] 设置为写保护或取消写保护；
- `movi` ：对 EMMC 进行操作；
- `run bootcmd` ：，执行 bootcmd ，其是一个环境变量，为一段字符串形式的命令；上电后 u-boot 若处于自启动模式最后执行则执行的多条命令，默认为 `下载内核、设备树和运行内核的多个命令` ，可以根据需要增加命令，以分号分隔。
- `boadinfo` ：查询板子信息命令
- `内存操作命令` ：内存操作命令md读，mw写，nm修改内存值，mm也是写但是会自增地址，cp拷贝，cmp对比内存值

网络操作命令：

![](https://pic1.zhimg.com/v2-08a764c6a8670a01f292b26c138f289e_1440w.jpg)

首先就是一些网络相关的变量，这些变量可以使用setenv去设置。

- ping命令：验证网络通路
- dhcp命令：获取IP
- nfs命令：网络文件系统操作命令，例如：nfs 80800000 192.168.1.253:/home/zuozhongkai/linux/nfs/zImage，来将 zImage 下载到开发板 DRAM 的 0X80800000 地址处
- tftp命令：也可以下载bin文件，例如：tftp 80800000 zImage，则把远端tftp服务文件夹中zImage文件下载到开发板 DRAM 的 0X80800000 地址处
- mmc命令：操作EMMC和SD卡
![](https://pic3.zhimg.com/v2-36f0dee899eb55b1acd3de361854ea2e_1440w.jpg)

- fat格式文件操作：fatinfo、fatls、fstype、fatload 和 fatwrite
- ext格式文件命令：ext2load、ext2ls、ext4load、ext4ls 和 ext4write
- nand命令
- boot命令：bootz用于启动 zImage 镜像文件，bootm用于启动 uImage 镜像文件，boot 会读取环境变量 bootcmd 来启动 Linux 系统
- reset：重启
- go：跳转到某地址运行
- run：执行环境变量，例如：run bootcmd
- mtest：内存读写测试命令

## 1.3 启动方式

> uboot跟ATF的关系？  
> Atf是arm为了增强系统安全性引入，ATF里面的 [BL33](https://zhida.zhihu.com/search?content_id=272874767&content_type=Article&match_order=1&q=BL33&zhida_source=entity) 的一种实现就是uboot。如果抛弃安全启动，那么可以不允许ATF，只允许uboot之前就启动kernel也是可以的。

不带ATF启动：spl被称为 **secondary program loader** ，在启动链中一般由bootrom加载而作为第二级启动镜像（bl2），它主要用于完成一些基础模块和ddr的初始化，以及加载下一级镜像uboot。由于spl需要被加载到sram中执行，对于有些sram size比较小的系统，可能无法放入整个spl镜像，tpl即是为了解决该问题引入的。加入了tpl之后，可将spl的功能进一步划分为两部分，如spl包含ddr初始化相关代码，而tpl包含镜像加载相关驱动，从而减少spl镜像的size。此时启动流程可被设计为如下方式：

**bootrom --> spl（init ddr） --> bootrom --> tpl（load and run uboot）--> uboot**

![](https://pic3.zhimg.com/v2-2dc71da84a9636ed757f82a155ce275a_1440w.jpg)

简化1： [SPL](https://zhida.zhihu.com/search?content_id=272874767&content_type=Article&match_order=1&q=SPL&zhida_source=entity) 完成ddr初始化后，还需要跳回Bootrom，因为Bootrom有镜像加载驱动，由bootrom完成tpl的加载（类似atf中bl2加载完成后跳转回bl1），并由tpl完成最终uboot的加载。这里可以去掉TPL，集成到SPL里面。

![](https://pic1.zhimg.com/v2-8c77208b1e9d6c4a2addec47ee647196_1440w.jpg)

上面是 **最常见的uboot启动方式** ，对于有些启动速度要求较高的场景，还可以简化。

简化2：直接SPL加载kernel，不使用uboot了。

![](https://pic4.zhimg.com/v2-12332914d0466cf8ba9ce2fab7aa6bd5_1440w.jpg)

> 关于SPL启动uboot，这里我们不展开说明了，可以参考： [zhuanlan.zhihu.com/p/52](https://zhuanlan.zhihu.com/p/520189611)

使用ATF加载uboot启动：

![](https://pic4.zhimg.com/v2-3fca2b5fd2ceafc4f54f10855e403897_1440w.jpg)

典型情况下bl33为uboot，而bl2既可以使用atf实现，也可以用spl代替。

## 2\. 代码介绍

![](https://pic2.zhimg.com/v2-9e09bfb05643d017a750a2ed638810a9_1440w.jpg)

一般移植U-BOOT会修改绿色部分的代码，U-BOOT中各目录间也是有层次结构的，虽然这种分法不是绝对的，但是在移植过程中可以提供一些指导意义。

对功能分层如下：

![](https://pic2.zhimg.com/v2-2927108b5e5f15fd07619d2110d621a9_1440w.jpg)

arch：各种架构的启动初始化流程代码，链接脚本等均在此目录对应的架构中存放；board：包含了大部分厂商的board初始化代码，基本平台化相关的代码都在对应的board目录中，早期的一些board代码在arch/xxx/xxx-mach中，现在基本不会放在arch目录下面了；cmd：包含了大量实用的u-boot命令的实现，比如md，cp，cmp，tftp，fastboot，ext4load等命令的实现，我们也可以在此处添加自己实现的命令；common：包含了u-boot的核心初始化代码，包括board\_f，board\_r，spl等一系列代码；configs：包含了所有board的配置文件，可直接使用；drivers：大量驱动代码的存放处；dts：编译生成dtb，内嵌dtb到u-boot的编译规则定义目录；env：环境变量功能实现代码；fs：文件系统读写功能的实现，里面包含了各类文件系统的实现；include：所有公用头文件的存放路径；lib：大量通用功能实现，提供给各个模块使用；net：网络相关功能的实现；scripts：编译，配置文件的脚本文件存放处；tools：测试和实用工具的实现，比如mkimage的实现代码在此处；

## 3\. 编译运行

![](https://picx.zhimg.com/v2-52685e2ee332b247317796e3ea0c484d_1440w.jpg)

如上图中，运行的时候 **打印了编译时间** ，DRAM是使用内存大小，IN OUT这些是使用的串口信息。串口使用的pl011大家调试过串口的，对这个串口IP应该都比较熟悉。

参考 [ATF入门-1qmeu搭建ARM全套源码学习环境](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485508%26idx%3D1%26sn%3D99c019e8d4efddef614115d61bdfbffb%26chksm%3Dfa528e60cd2507766d08588aaed93f67c51fe6c77d502bebf8f6b429b2236c24d42d947e0108%26scene%3D21%23wechat_redirect) ，我们的代码， **只编译uboot** ，在build目录下面使用命令：

```
make u-boot
make -f qemu_v8.mk run-only
```

如果想看到完整的编译过程，可以执行如下命令：

```
make u-boot V=1
```
![](https://picx.zhimg.com/v2-3b8ef4a71d1aa23b448cf74309f76475_1440w.jpg)

## 3.1 qemu\_v8.mk

optee/build/ **qemu\_v8.mk** 中

```
################################################################################
# U-Boot
################################################################################
ifeq ($(XEN_BOOT),y)
UBOOT_DEFCONFIG_FILES := $(UBOOT_PATH)/configs/qemu_arm64_defconfig        \
             $(ROOT)/build/kconfigs/u-boot_xen_qemu_v8.conf
else
UBOOT_DEFCONFIG_FILES := $(UBOOT_PATH)/configs/qemu_arm64_defconfig        \
             $(ROOT)/build/kconfigs/u-boot_qemu_v8.conf
endif

UBOOT_COMMON_FLAGS ?= CROSS_COMPILE=$(CROSS_COMPILE_NS_KERNEL)

$(UBOOT_PATH)/.config: $(UBOOT_DEFCONFIG_FILES)
    cd $(UBOOT_PATH) && \
                scripts/kconfig/merge_config.sh $(UBOOT_DEFCONFIG_FILES)

.PHONY: u-boot-defconfig
u-boot-defconfig: $(UBOOT_PATH)/.config

.PHONY: u-boot
u-boot: u-boot-defconfig
    $(MAKE) -C $(UBOOT_PATH) $(UBOOT_COMMON_FLAGS)

.PHONY: u-boot-clean
u-boot-clean:
    $(MAKE) -C $(UBOOT_PATH) $(UBOOT_COMMON_FLAGS) distclean
```

**u-boot-defconfig** 是uboot根目录下的.config，.config从$(UBOOT\_PATH)/configs/qemu\_arm64\_defconfig里面来

然后就是编译CROSS\_COMPILE=$(CROSS\_COMPILE\_NS\_KERNEL)，也就是：toolchains/aarch64/bin/aarch64-linux-gnu-

u-boot使用了同Linux一样的编译配置方式，即使用kbuild系统来管理整体代码的配置和编译，通过defconfig来定制各种不同厂商的芯片bootloader二进制程序。  
编译只需要注意通过环境变量或者命令行参数的方式引入一个交叉编译工具即 **CROSS\_COMPILE** 。

## 3.2 qemu\_arm64\_defconfig

![](https://pic1.zhimg.com/v2-0daf65349e0abe7471b7e0e13bc3b328_1440w.jpg)

我们使用configs/ **qemu\_arm64\_defconfig** 去覆盖编译时根目录默认的.config文件，但是我们如果执行make menuconfig就可以去修改，修改后.config发生了变化。但是如果我们想去覆盖configs/ **qemu\_arm64\_defconfig** 就需要手动复制。一个好的方法是执行如下命令：

```
make savedefconfig
```

build/kconfigs/ **u-boot\_qemu\_v8.conf** 里面则是设置了一些全局变量：

```
CONFIG_SYS_TEXT_BASE=0x60000000
CONFIG_BOOTCOMMAND="setenv kernel_addr_r 0x42200000 && setenv ramdisk_addr_r 0x45000000 && load hostfs - ${kernel_addr_r} uImage && load     hostfs - ${ramdisk_addr_r} rootfs.cpio.uboot &&  setenv bootargs console=ttyAMA0,115200 earlyprintk=serial,ttyAMA0,115200 root=/dev/ram &    & bootm ${kernel_addr_r} ${ramdisk_addr_r} ${fdt_addr}"
CONFIG_SEMIHOSTING=y
```

这个跟scripts/kconfig/ **merge\_config.sh** 脚本配合使用生成.config使用。

我们来修改下 **qemu\_arm64\_defconfig** ，例如修改uboot命令行的等待时间，添加如下代码：

```
CONFIG_BOOTDELAY=10
```
![](https://picx.zhimg.com/v2-3aa4f82a5c4864ee81a06907a9ed5abb_1440w.jpg)

## 3.3 Makefile

进入正题，uboot的Makefile里面

```
else ifneq (,$(findstring $(MK_ARCH), "aarch64" "armv8l"))
  export HOST_ARCH=$(HOST_ARCH_AARCH64)
```

.config里面

```
CONFIG_SYS_ARCH="arm"
CONFIG_SYS_CPU="armv8"
CONFIG_SYS_VENDOR="emulation"
CONFIG_SYS_BOARD="qemu-arm"
CONFIG_SYS_CONFIG_NAME="qemu-arm"
```

**CONFIG\_SYS\_BOARD** ="qemu-arm" 定义板级信息，这个跟include/configs/ **qemu-arm.h** 头文件

```
/* Physical memory map */
#define CFG_SYS_SDRAM_BASE        0x40000000
```
![](https://pic3.zhimg.com/v2-ea2ab8618af0188a0476b684cacd1a56_1440w.jpg)

编译的东西估计有点多，篇幅有限，下一篇再介绍。

> 后记：  
> 写ATF的时候，感觉顺着要介绍下uboot，没想到 **uboot是个巨大的工程** ，涉及的东西太多，新启动一个专题，预计需要5篇以上的文章来介绍了，感觉 **学不完，根本学不完** 。  
> 有时感觉学某个东西感觉 **疲倦了，感觉太多** ，首先还是要 **从代码出发** 更有意思一些。其次新手一般是必须要花一些时间去慢慢研究的，不然大致的看也看不明白，甚至可以 **不用一次学完** ，只学习uboot的一个地方，比如命令行实现，有时间了可以继续研究，没时间就先学工作中别的方面有用的。 **等过几年成为老手** 了，对很多东西例如uboot里面的一些命令见别人用过，再 **去系统学** ，当然这时也没必要追求研究每一行代码，只是 **面面俱到** 就可以，B站找个培训班的视频系统学一遍，例如正点原子左盟主的视频，首先就是扫盲，到这个程度基本工作够用了，算别人眼中的高手了，然后就看工作中的造化了，如果工作内容就是负责uboot的那干几年也是专家了。总之需要 **根据自己的需求去学到一定的深度，追求完美可能也会害了自己** 。  
> 伴随着学的东西越多，工作时间越长， **会的东西可能越成一种围城** ，例如干嵌入式的，linux应用、内核、驱动、固件、单片机，各种终端、网络设备等，这些底层技术学的越多，你 **再去找工作的时候基本还是这个方向** ，但是你想找 **风口** 上的工作安全、芯片、AI等又没经验 **不降薪找不来** ，这山望着那山高。笔者是不鼓励换方向的，但是可以找 **有交叉点的技术** ，例如 **嵌入式AI** 方面，通用是做驱动，做NPU、ISP驱动就是工资高，即是嵌入式又是AI沾边的东西。  
> 一句话送给大家： **既要努力深耕本行业技术，又要努力寻找服务风口的交叉方向进行破局。** 别人吃肉那是命，自己能喝口汤应该就满足了。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-10 17:10・上海[准备入行嵌入式，本身是计算机科班出身，兄弟们来给点意见？](https://www.zhihu.com/question/660012297/answer/3558676314)

[

兄弟，我也是计科专业的，当时大三的时候去实习，找了很多单位都没有成功，自己认为在大学里学的还可以，但是在找实习的时候就感受到压力了，在面试过程中，我发现企业所关注的不仅仅...

](https://www.zhihu.com/question/660012297/answer/3558676314)