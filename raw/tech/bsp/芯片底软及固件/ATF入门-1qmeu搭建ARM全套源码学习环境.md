---
title: "ATF入门-1qmeu搭建ARM全套源码学习环境"
source: "https://zhuanlan.zhihu.com/p/2025982257538561912"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "之前写过一篇ATF入门的文章： ARM ATF入门-安全固件软件介绍和代码运行。里面介绍 qemu运行ATF，但是总感觉缺了点什么，直到最近又找到一个非常牛逼的开源代码，堪称王炸，你想学习的ARM软件技术都在这套源码里面…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

4 人赞同了该文章

![](https://pic1.zhimg.com/v2-d5c63189472111947a4b04b75af39714_1440w.jpg)

之前写过一篇ATF入门的文章： [ARM ATF入门-安全固件软件介绍和代码运行](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484384%26idx%3D1%26sn%3Dc6a2c66b967a28f8f46430263bad7df6%26chksm%3Dfa5285c4cd250cd27a333f15bfcef80e8a8f92ac9afe8ac766f93e75a0dbc7500de2d4df0eff%26scene%3D21%23wechat_redirect) 。

里面介绍 **qemu运行ATF** ，但是总感觉 **缺了点什么** ，直到最近又找到一个非常牛逼的开源代码， **堪称王炸** ，你想学习的ARM软件技术都在这套源码里面，可以 **qemu** 运行起来从 **[BL1](https://zhida.zhihu.com/search?content_id=272874207&content_type=Article&match_order=1&q=BL1&zhida_source=entity) 、 [BL2](https://zhida.zhihu.com/search?content_id=272874207&content_type=Article&match_order=1&q=BL2&zhida_source=entity) 、 [BL31](https://zhida.zhihu.com/search?content_id=272874207&content_type=Article&match_order=1&q=BL31&zhida_source=entity) 、 [uboot](https://zhida.zhihu.com/search?content_id=272874207&content_type=Article&match_order=1&q=uboot&zhida_source=entity) 、optee、SCP、 [linux](https://zhida.zhihu.com/search?content_id=272874207&content_type=Article&match_order=1&q=linux&zhida_source=entity)** 等。

口说无凭，直接上图，源码下载目录下来如下：

![](https://pic2.zhimg.com/v2-21c57b3138d12aa1ddb2e935118cfed7_1440w.jpg)

> 那么这套源码可以做什么呢？  
> 可以说很多培训班、卖课的都在讲这些东西， **ARM嵌入式最核心** 的一些知识都在这些源码里面，简直就是 **宝藏等待大家去挖掘** ，当你运行起来的时候怎么不兴奋， **快来推荐给朋友吧** 。

## 1\. 源码下载编译运行

![](https://pic3.zhimg.com/v2-d008bb645ebba81e1b1a31a5e8750018_1440w.jpg)

## 1.1 源码下载

```
mkdir -p optee
cd optee
repo init -u https://github.com/OP-TEE/manifest.git -m qemu_v8.xml
repo sync -j4 --no-clone-bundle
```

源码目录介绍：

```
build/ - 不同平台的makefile及kconfig
buildroot/ - 一款编译工具
edk2/ - 遵循UEFI标准的bootloader源码
linux/ - linux kernel源码
mbedtls/ - 开源的ssl/tls加密组件，轻量级
optee_benchmark/ - open-tee项目基准框架的源码
optee_client/ - open-tee项目的非安全侧源码
optee_examples/ - open-tee中使用的示例CA和TA源码
optee_os/ - open-tee项目的os源码
optee_test/ - 测试套件xtest源码
out/ - 存储编译生成用于烧录的image，如bl1.bin, bl2.bin等
out-br/ - 存放buildroot工具编译生成的文件
qemu/ - qemu源码
.repo/ - repo工程
soc_term/ - 监听qemu、非安全终端、安全终端三个端口，正确将log重定向至对应的终端
toolchains/ - 包含编译所需的工具链
trusted-firmware-a/ - atf源码
```

那么这个 **源码从何而来** ？那必须是 **老外开源** 的啊，我们学习ATF首先就是 **官网** ：

**[trustedfirmware.org](https://link.zhihu.com/?target=https%3A//www.trustedfirmware.org)**

![](https://pic4.zhimg.com/v2-a77cc94a2a4aab34c55e1df3455a02db_1440w.jpg)

> **Trusted Firmware-A 项目为 Armv7-A 和 Armv8-A 类处理器提供了安全世界软件的参考实现。**  
> **OP-TEE 是一种可信执行环境 (TEE)，旨在与使用 [TrustZone](https://zhida.zhihu.com/search?content_id=272874207&content_type=Article&match_order=1&q=TrustZone&zhida_source=entity) 技术的 Arm；Cortex-A 内核上运行的非安全 Linux 内核配套使用。OP-TEE 实现了 TEE 内部核心 API v1.1.x（这是向可信应用程序公开的 API）和 TEE 客户端 API v1.0（这是描述如何与 TEE 通信的 API）。这些 API 在 GlobalPlatform API 规范中定义。**

里面关于optee的介绍里面，就是大名鼎鼎的： **OP-TEE documentation** ，给出了这份源码： **[optee.readthedocs.io/en](https://link.zhihu.com/?target=https%3A//optee.readthedocs.io/en/latest/building/index.html)**

![](https://pic3.zhimg.com/v2-5e8b4c3bd8ea25d7536320fa154f8d98_1440w.jpg)

> 这里给大家找到了 **学习资料的源头** ，又是无穷的宝藏，  
> 如果工作是做这方面的就慢慢研究吧，平时 **找方案找依据** 也可以来这里，你与高手的差距可能就是这些， **学习二手的资料干不过学习一手的，一手的干不过写这些资料的人** ，专业的就是专业的，需要死磕走向专业。

一些代码下载过程中可能遇到的问题：

1. 下载代码需要 **repo工具** ，没有的可以自己下载一个
```
$ mkdir ~/bin
$ vim ~/.bashrc
    export PATH=~/bin:$PATH
$ source ~/.bashrc
$ curl https://storage.googleapis.com/git-repo-downloads/repo > ~/bin/repo
$ chmod a+x ~/bin/repo
```
1. 源码下载过程中需要能访问 **github** ，并且网络比较好，因为下载的文件比较大。如果下载出问题可以去网上找找解决办法。我的环境还比较顺利，看网上其他人出现了各种问题，一些参考：
- [blingblingxuanxuan.github.io](https://link.zhihu.com/?target=https%3A//blingblingxuanxuan.github.io/2020/12/20/qemuv8-optee/)
- [icyshuai.blog.csdn.net/](https://link.zhihu.com/?target=https%3A//icyshuai.blog.csdn.net/article/details/71499619)
- [bilibili.com/video/av55](https://link.zhihu.com/?target=https%3A//www.bilibili.com/video/av55057371/) （视频教学搭建环境）
- [blog.csdn.net/zheng\_wul](https://link.zhihu.com/?target=https%3A//blog.csdn.net/zheng_wuling/article/details/128230891)
- [blog.csdn.net/weixin\_42](https://link.zhihu.com/?target=https%3A//blog.csdn.net/weixin_42135087/article/details/115704166)
- [blog.csdn.net/sinat\_223](https://link.zhihu.com/?target=https%3A//blog.csdn.net/sinat_22338935/article/details/131490902)

## 1.2 源码编译

首先需要安装 **编译依赖的工具** ：

```
$ sudo dpkg --add-architecture i386
$ sudo apt-get update

$ sudo apt-get install android-tools-adb android-tools-fastboot autoconf \
        automake bc bison build-essential ccache cscope curl device-tree-compiler \
        expect flex ftp-upload gdisk iasl libattr1-dev libcap-dev \
        libfdt-dev libftdi-dev libglib2.0-dev libhidapi-dev libncurses5-dev \
        libpixman-1-dev libssl-dev libtool make \
        mtools netcat python-crypto python3-crypto python-pyelftools \
        python3-pycryptodome python3-pyelftools python-serial python3-serial \
        rsync unzip uuid-dev xdg-utils xterm xz-utils zlib1g-dev
```

编译过程：

```
$ cd ~/optee/build
$ make -j2 toolchains
$ make -j4
# 或者，将编译输出重定向到log中，方便编译出问题了定位
$ make 2>&1 | tee build.log
```

## 1.3 源码运行

```
$ cd ~/optee/build
$ make run
指定版本运行
$ make -f qemu_v8.mk run-only
```
![](https://pic1.zhimg.com/v2-5191aaad5898dbc45154aff9de92394c_1440w.jpg)

执行完后，一共会有 **三个窗口** ：

1. **qemu** ，默认运行开启了gdb，去掉的话可以自己改makefile，所以继续运行需要输入c
2. **非安全世界** ，就是linux了，需要输入root登录，就进入了linux的shell
3. **安全世界** ，就是OP-TEE OS了
![](https://pic3.zhimg.com/v2-f1deba879c0ac85f588ca74b84c86a8c_1440w.jpg)

在qemu窗口中执行 **`c`** ，可以看到BL1到Linux的运行打印：

![](https://pic3.zhimg.com/v2-31937bcd12ff0fedf8bfc17cc2d00f98_1440w.jpg)

然后就可以在linux中可以执行 `xtest` 进行测试，这样optee里面也会有对应的测试打印。

```
# xtest
```
![](https://pica.zhimg.com/v2-d64900cf8f632ec3bb2fe5c4dd6ee4ec_1440w.jpg)

![](https://pic2.zhimg.com/v2-2b526e8f7be4252c0cdd8af0c8fc37b7_1440w.jpg)

Anyone else？就问你吊不吊？

## 2\. 前情回顾

主要回顾下之前ATF文章： [ARM ATF入门-安全固件软件介绍和代码运行](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484384%26idx%3D1%26sn%3Dc6a2c66b967a28f8f46430263bad7df6%26chksm%3Dfa5285c4cd250cd27a333f15bfcef80e8a8f92ac9afe8ac766f93e75a0dbc7500de2d4df0eff%26scene%3D21%23wechat_redirect) 的基础知识， **很有价值** ，帮助大家理解。

对于安全这个需要从 **手机** 说起，主要还是 **开源的安卓系统** ，因为开源所以 **安全问题非常严重** ，主要有几个方面：

1. **安全世界和非安全世界的区分**
2. **安全启动，防止替换bin文件**

## 2.1 安全世界

![](https://pic4.zhimg.com/v2-35e1afba8c51cba8385bb13a5841b849_1440w.jpg)

ARMv8分为Secure World和Non-Secure World（Normal World），四种异常级别从高到低分别为EL3，EL2，EL1，EL0。

1. **EL0** ：非安全态的 **Apps** ，安全态的Trusted Apps，EL0是无特权模式，所有APP应用都在EL0。
2. **EL1** ：非安全态的Normal world **OS** ，安全态的Trusted OS ，EL1是一个特权模式，能够执行一些特权指令，用于运行各类 **操作系统（例如Linux、FreeRTOS、TEE等）。**
3. **EL2** ： **Hypervisor** 虚拟层
4. **EL3** ：Secure Monitor，Arm trusted firmware **安全固件** ，EL3具有最高管理权限，是一个微型的 **runtime系统** ，为OS提供服务，负责安全监测和Secure World和Normal World之间的切换。

TEE就属于EL3里面的安全世界，linux是非安全世界，所以一些地址区域linux应用是无法访问的，因为linux应用不可控，可能有用户甚至黑客的程序。但是TEE里面的应用是固定死的，只提供固定的接口，所以比较安全。

> 增强安全的绝招：  
> 只提供 **有限的API接口供应用调用** ，只完成单一的功能，怎么完成对应用来说是黑盒。相对于应用可以访问所有的地址、操作所有的功能，可以大大收敛可控范围，有限的API，你就弄不死我了。

google规定在android 7.0之后要求厂商必须使用TEE来保护用户的生物特征数据（指纹，虹膜等）。从硬件技术上ARM公司提出了 **trustzone技术** 来实现。

![](https://pic1.zhimg.com/v2-355661cb80c55de0fe3c9c9361332fca_1440w.jpg)

ARM在AXI系统总线上添加了一根额外的安全总线，称为 **NS位** ，并将cortex分为两种状态：secure world, non-secure world, 并添加了一种叫做monitor的模式，cortex根据NS的值来判定当前指令操作是需要安全操作还是非安全操作，并结合自身是属于secure world状态还是non-secure状态来判定是否需要执行当前的指令操作。而cortex的secure world和non-secure world状态之间的切换由monitor来完成，最近由于ATF（arm trusted firmware）的给出，cortex的状态切换操作都是在ATF中完成。当cortex处于secure world状态时，cortex会去执行TEE(Trusted execute enviorment) OS部分的代码，当cortex处于non-secure world状态时，cortex回去执行linux kernel部分的代码。而linux kernel是无法访问TEE部分所以资源，只能通过特定的TA(Trust Application)和CA(Client Application)来访问TEE部分特定的资源。

## 2.1 安全启动

安全启动，为了这个可谓在 **ATF里面操碎了心** ，各种分层的流程。

![](https://pic1.zhimg.com/v2-42765bb93e60290618142afb313a9278_1440w.jpg)

> 为什么需要分这么多BL1 BL2 BL31 BL32 BL33，需要这么多吗？--答案是需要

**ATF** ：Arm Trusted Firmware（ **ARM安全固件** ），运行在EL3异常级别，ATF为Armv7-A 和 Armv8-A提供了一些安全可信固件。具体包括上面说的： **ATF= BL1、BL2、BL31、BL32、BL33** ，其中BL33有就是U-Boot。都运行在EL3模式。具体为：

**BL1** ：也叫 **bootrom** ，rom的意思就是只读的，具有最高的执行权限EL3，在 CPU 出厂时就被 **写死** 了。为什么要写死，这里有一个安全驱动概念（ **Secure Boot** ）。CPU上电启动的时候，加载镜像的顺序为BL1 -》 BL2 -》 BL31 -》 BL32 -》BL33（uboot）-》OS（Linux），但是如果 **其中的一个镜像被换掉了怎么办** ？这里不是说网络攻击换掉，就是物理上拿到电路板，然后把存储SD卡拔掉换了自己的OS，那不是 **想干啥就干啥** ，完全控制了硬件设备，俗称“ **越狱** ”。答案就是每一个镜像进行签名校验。

例如BL33加载OS，需要 **OS** 镜像算出hash利用 **私钥加密** ，然后 **BL31** 在加载OS的时候会读取这个加密的Hash，利用自己的 **公钥解密** ，解密后的hash是对的就进行加载。那么这么一级一级按照加密向前传递，那第一个 **根BL1** 如果可以在SD卡上伪造，那校验就没用了。所以BL1需要 **只读** ，并且作为只读硬件直接搞进到CPU里面，你从板子上也拆不下来，更替换不了。因为要写死到SoC芯片内部，所以独立出来了，也是其由来的原因。

**BL2** ：BL2在flash中的一段可信安全启动代码，主要完成一些平台相关的初始化，比如对ddr的初始化等。因为BL31和BL32是一个 **runtime** ，也就是上电后一直运行的程序，那么需要加载到 **内存** 里面，需要先 **初始化内存ddr** ，BL2就干这个事情的。所谓的Loder。

**BL31** ：作为EL3最后的安全堡垒，它不像BL1和BL2是一次性运行的。如它的runtime名字暗示的那样，它通过 **SMC指令** 为Non-Secure **OS** 持续提供设计安全的服务，在Secure World和Non-Secure World之间进行切换。是对硬件最基础的抽象，对OS提供服务。例如一个EL3级别的特权指令，比如关机、休眠等OS是 **无权处理** 的，就会交给BL31来继续操作硬件处理。

**BL32** ：是所谓的 **secure os** ，运行在Secure mode。在ARM平台下是ARM 家的 Trusted Execution Environment（ **TEE** ）实现。 **OP-TEE** 是基于ARM TrustZone硬件架构所实现的软件Secure OS。

一般在BL32会运行 **OPTee OS + 安全app** ，它是一个可信安全的OS运行在EL1并在EL0启动可信任APP（如指纹信息，移动支付的密码等），并在Trust OS运行完成后通过SMC指令返回BL31，BL31切换到Non-Seucre World继续执行BL33。关于OPTEE和Secure mode及TurstZone的机制，有机会再写一个文章介绍。

**BL33：** 这里就是Normal Wrold了，运行的都是非安全固件，也就是我们常见的UEFI firmware或者 **u-boot** ，也可能是直接启动Linux kernel。

启动BL1，BL2，BL31，BL32则是一个完整的 **ATF信任链建立流程** （ARM Trusted Firmware），像常见的PSCI（Power State Coordination Interface）功能则是在ATF的BL31上实现。对基本概念有认识了后，你就知道OS之下还有的这些软件通常称为 **ATF** ，其启动流程如下：

![](https://pica.zhimg.com/v2-acd4adc608f5d2a8cf2a0b3c64d88f96_1440w.jpg)

## 3\. ARM学习

![](https://pic4.zhimg.com/v2-ca6c476f1853a072729b0e1ce5f410f7_1440w.jpg)

上图这个可 **不是广告** ，只是给大家看下 **卖课的价钱** ，CSDN里面：

[edu.csdn.net/lecturer/6](https://link.zhihu.com/?target=https%3A//edu.csdn.net/lecturer/6964) 。

**周贺贺老师** 应该讲的非常好，我最早接触是从微信公众号“ **ARM精选** ”和“ **TEE课程** ”里面经常推荐课程

![](https://pic1.zhimg.com/v2-742ca66578cb34154ff7457d5980367e_1440w.jpg)

![](https://pic1.zhimg.com/v2-fb4ea7e80ecbf2a26bb88a99e1248b40_1440w.jpg)

就看这个 **课程列表** 就 **很专业，很强大** ，bilibili上面还有周贺贺老师的 **试听视频** ： [space.bilibili.com/4828](https://link.zhihu.com/?target=https%3A//space.bilibili.com/482877928)

![](https://pica.zhimg.com/v2-32e82d94f9ec1ca41bf96d0952d38b84_1440w.jpg)

如果你想高效学习，又不差钱 **可以去报名** 。

但是我说这些，还是想说我的 **免费分享很值钱** ，如果是屌丝程序员，或者只 **薅羊毛** 的可以关注本公众号接下来的文章，有句话说： **书非借不能读也** ，那可能就有： **课程非收费不能学也** 。

本公众号这里 **只有免费的学习资源** ，对比收费的只能说是 **丐中丐** 。三五十万的宝马处处是缺点，但是 **十几万的宝马都是优点** ，凑合学学，在实践中学也能成为高手。

> 后记：  
> 关于ARM ATF安全相关的知识点非常多，后续计划写一系列这方面的文章，让大家 **免费零成本学习高深的技术** 。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-04-10 17:04・上海