---
title: "ARM ATF入门-安全固件软件介绍和代码运行"
source: "https://zhuanlan.zhihu.com/p/2025976579067581443"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "大家都知道硬件之上是软件，本公众号主要介绍“ OS与AUTOSAR”，那么除了这两种类型的软件，是否还有别的软件？本文以ARM SOC硬件为例，“打破砂锅，问到底”，来看看还有哪些软件我们没接触到，在OS之下和SOC硬件…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

5 人赞同了该文章

![](https://picx.zhimg.com/v2-c19208de9a345232fcda4af570663929_1440w.jpg)

大家都知道硬件之上是软件，本公众号主要介绍“ **OS与AUTOSAR** ”，那么除了这两种类型的软件，是否还有别的软件？本文以 **[ARM SOC](https://zhida.zhihu.com/search?content_id=272872354&content_type=Article&match_order=1&q=ARM+SOC&zhida_source=entity) 硬件** 为例，“ **打破砂锅，问到底** ”，来看看还有哪些软件我们没接触到，在 **OS之下和SOC硬件之上** 的，各种卖给我们底层软件的厂商（一般都是SOC芯片原厂）所掩盖的 **核心技术** ，另外结合开源代码进行理解。

1. **1.OS之下，SOC硬件之上有什么软件？**
![](https://pic2.zhimg.com/v2-2dd4a541ac4264e4081ad74e204a3a89_1440w.jpg)

我们在定位OS的问题的时候突然一个 [SMC指令](https://zhida.zhihu.com/search?content_id=272872354&content_type=Article&match_order=1&q=SMC%E6%8C%87%E4%BB%A4&zhida_source=entity) 之后的 **代码找不到了** ，代码不在OS里面也不在 [u-boot](https://zhida.zhihu.com/search?content_id=272872354&content_type=Article&match_order=1&q=u-boot&zhida_source=entity) 里面，到底在哪里，之后的运行又是什么，带着这个问题，我们“ **打破砂锅问到底** ”，看看到底怎么回事。

在之前的文章 [AUTOSAR入门-汽车电子构架演进(四) 未来已来](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484085%26idx%3D1%26sn%3Da11d53ff5d9832ae65a7a2aa37773dfc%26chksm%3Dfa528491cd250d874fdba2c9509a9aa03db619d41e37eb8040021b135c1e5f24b93c3f318897%26scene%3D21%23wechat_redirect) ，有一个 [NXP](https://zhida.zhihu.com/search?content_id=272872354&content_type=Article&match_order=1&q=NXP&zhida_source=entity) 的 **汽车软件方案图** ，可以同时支持AP和BP，很经典，我们回顾下：

![](https://picx.zhimg.com/v2-3e2de340cac254c5a5c3d1615a8f877d_1440w.jpg)

可以看到标识的是 **Firmware** （固件），我们首先会想到这就像电脑里面的 **BIOS** ，焊在电脑主板上的一个存储芯片，开机启动的时候，CPU寻址就会去执行里面的代码。那么这个东西的确是个软件啊， **有软件就有代码** ，有代码就有开源的，来一起 **盘它** 。

NXP的图，以 **功能** 为核心是给 **客户** 看的，掩盖了其使用 **ARM技术** 的细节，也就是软件实现的细节，并不能直接反映ARM软件的框架。然后重新起个高大上的模块名字， **好忽悠** 啊，我们直接来看ARM的 **特权级** （重要：本文以下都是针对Arm A核）：

![](https://pic3.zhimg.com/v2-6a098646e70f0be31faaaab0f257ef32_1440w.jpg)

这个图了解ARM的都太熟悉了，EL（exception level）就是 **异常等级** ，为什么会有异常等级，那就是特权（privilege），不同的软件有不同的特权， **EL0** 的特权最小，只能运行App， **[EL3](https://zhida.zhihu.com/search?content_id=272872354&content_type=Article&match_order=1&q=EL3&zhida_source=entity)** 的特权是最大的，也就是说对所有硬件的访问权限也是最大的。

ARMv8分为Secure  
World和 [Non-Secure World](https://zhida.zhihu.com/search?content_id=272872354&content_type=Article&match_order=1&q=Non-Secure+World&zhida_source=entity) （Normal  
World），四种异常级别从高到低分别为EL3，EL2，EL1，EL0。

1. EL0：非安全态的 **Apps** ，安全态的Trusted Apps，EL0是无特权模式，所有APP应用都在EL0。
2. EL1：非安全态的Normal world **OS** ，安全态的Trusted OS ，EL1是一个特权模式，能够执行一些特权指令，用于运行各类 **操作系统（例如Linux、FreeRTOS、TEE等）。**
3. EL2： **[Hypervisor](https://zhida.zhihu.com/search?content_id=272872354&content_type=Article&match_order=1&q=Hypervisor&zhida_source=entity)** 虚拟层
4. EL3：Secure Monitor，Arm trusted firmware **安全固件** ，EL3具有最高管理权限，是一个微型的 **runtime系统** ，为OS提供服务，负责安全监测和Secure World和Normal World之间的切换。

关于ARM体系结构的基础知识可以自己找资料看看。OS下面的软件有Hypervisor和Secure  
monitor。 **Hypervisor** 是虚拟机，后续有机会了介绍下，本文聚焦到 **[Secure monitor](https://zhida.zhihu.com/search?content_id=272872354&content_type=Article&match_order=1&q=Secure+monitor&zhida_source=entity)** 。

Secure monitor到底是什么，如下图中红框中：

![](https://pic1.zhimg.com/v2-25a9162fb5f1073f5e15b5afabb325b6_1440w.jpg)

其中有 **U-Boot** 大家都比较熟悉，是一个 **bootloader** ， bootloader程序会先初始化 DDR等外设，然后将 Linux内核从 flash(NAND NOR FLASH SD MMC等 )拷贝到 DDR中，最后启动 Linux内核。后续有文章再详细介绍。

这里我们看BL1、BL2、BL31、BL32、BL33是什么东西，下面介绍下ATF的概念：

**ATF** ：Arm Trusted  
Firmware（ **ARM安全固件** ），运行在EL3异常级别，ATF为Armv7-A 和 Armv8-A提供了一些安全可信固件。具体包括上面说的： **ATF= BL1、BL2、BL31、BL32、BL33** ，其中BL33有就是U-Boot。都运行在EL3模式。具体为：

**BL1** ：也叫 **bootrom** ，rom的意思就是只读的，具有最高的执行权限EL3，在 CPU 出厂时就被 **写死** 了。为什么要写死，这里有一个安全驱动概念（ **Secure Boot** ）。CPU上电启动的时候，加载镜像的顺序为BL1 -》 BL2 -》 BL31 -》 BL32 -》BL33（uboot）-》OS（Linux），但是如果其中的 **一个镜像被换掉** 了怎么办？这里不是说网络攻击换掉，就是物理上拿到电路板，然后把存储SD卡拔掉换了自己的OS，那不是 **想干啥就干啥** ，完全控制了硬件设备，俗称“ **越狱** ”。答案就是没一个镜像进行签名校验。

例如BL33加载OS，需要 **OS** 镜像算出hash利用 **私钥加密** ，然后 **BL31** 在加载OS的时候会读取这个加密的Hash，利用自己的 **公钥解密** ，解密后的hash是对的就进行加载。那么这么一级一级按照加密向前传递，那第一个 **根BL1** 如果可以在SD卡上伪造，那校验就没用了。所以BL1需要 **只读** ，并且作为只读硬件直接搞进到CPU里面，你从板子上也拆不下来，更替换不了。因为要写死到CPU内部，所以独立出来了，也是其由来的原因。

**BL2** ：BL2在flash中的一段可信安全启动代码，主要完成一些平台相关的初始化，比如对ddr的初始化等。因为BL31和BL32是一个 **runtime** ，也就是上电后一直运行的程序，那么需要加载到 **内存** 里面，需要先 **初始化内存ddr** ，BL2就干这个事情的。所谓的Loder。

**BL31** ：作为EL3最后的安全堡垒，它不像BL1和BL2是一次性运行的。如它的runtime名字暗示的那样，它通过 **SMC指令** 为Non-Secure **OS** 持续提供设计安全的服务，在Secure World和Non-Secure World之间进行切换。是对硬件最基础的抽象，对OS提供服务。例如一个EL3级别的特权指令，比如关机、休眠等OS是 **无权处理** 的，就会交给BL31来继续操作硬件处理。

**BL32** ：是所谓的 **secure os** ，运行在Secure mode。在ARM平台下是ARM 家的 Trusted Execution Environment（ **TEE** ）实现。 **[OP-TEE](https://zhida.zhihu.com/search?content_id=272872354&content_type=Article&match_order=1&q=OP-TEE&zhida_source=entity)** 是基于ARM  
[TrustZone](https://zhida.zhihu.com/search?content_id=272872354&content_type=Article&match_order=1&q=TrustZone&zhida_source=entity) 硬件架构所实现的软件Secure OS。

一般在BL32会运行 **OPTee OS + 安全app** ，它是一个可信安全的OS运行在EL1并在EL0启动可信任APP（如指纹信息，移动支付的密码等），并在Trust OS运行完成后通过SMC指令返回BL31，BL31切换到Non-Seucre World继续执行BL33。关于OPTEE和Secure mode及TurstZone的机制，有机会再写一个文章介绍。

**BL33：** 这里就是Normal Wrold了，运行的都是非安全固件，也就是我们常见的UEFI firmware或者 **u-boot** ，也可能是直接启动Linux kernel。

启动BL1，BL2，BL31，BL32则是一个完整的 **ATF信任链建立流程** （ARM Trusted Firmware），像常见的PSCI（Power State Coordination Interface）功能则是在ATF的BL31上实现。对基本概念有认识了后，你就知道OS之下还有的这些软件通常称为 **ATF** ，其启动流程如下：

![](https://pica.zhimg.com/v2-001bff9962a1987fb7ffdbe7b6c80f14_1440w.jpg)

详细为：

![](https://pic1.zhimg.com/v2-fe2eff00a407e29090b3c52082013cc8_1440w.jpg)

**2\. ATF代码下载编译运行**

**2.1 ATF代码下载编译**

ATF代码下载：

```
git clone https://github.com/ARM-software/arm-trusted-firmware.git
ATF代码编译：
make CROSS_COMPILE=aarch64-linux-gnu- PLAT=qemu DEBUG=1 all
```
![](https://pic1.zhimg.com/v2-e66e4bc87fac33b31661407663e6ed66_1440w.jpg)

编译完成后在arm-trusted-firmware/build/qemu/debug目录下生成 **bl1.bin、bl2.bin、bl31.bin** 。

ATF的BL33使用的u-boot，代码下载：

```
git clone https://source.denx.de/u-boot/u-boot.git
编译：
cd u-boot
export ARCH=arm64
export CROSS_COMPILE=aarch64-linux-gnu-
make qemu_arm64_defconfig
make -j8
```

编译完成后在当前目录下生成 **u-boot.bin** 。

**2.2 qemu运行ATF**

首先需要qemu，执行

```
qemu-system-aarch64 –version
```

看下系统是否安装过，如果没安装过，需要安装：

```
git clone https://git.qemu.org/git/qemu.git
cd qemu
./configure --target-list=aarch64-softmmu --prefix=
make -j8
sudo make install
```

有了qemu，然后新建一个run目录，把各个镜像软连接进来：

```
mkdir run
cd run
ln -s ~/arm/arm-trusted-firmware/build/qemu/debug/bl1.bin bl1.bin
ln -s ~/arm/arm-trusted-firmware/build/qemu/debug/bl2.bin bl2.bin
ln -s ~/arm/arm-trusted-firmware/build/qemu/debug/bl31.bin bl31.bin
ln -s ~/arm/u-boot/u-boot.bin bl33.bin
```

在run目录执行命令：

```
qemu-system-aarch64 -nographic -machine virt,secure=on \
-cpu cortex-a53 \
-smp 2 -m 2048 \
-d guest_errors,unimp \
-bios ./bl1.bin \
-semihosting-config enable=on,target=native
```
![](https://pic3.zhimg.com/v2-6ebb733f7891f6b0e77a26f481e81bc0_1440w.jpg)

可以看到u-boot已经启动了，我们输入u-boot支持的 **version命令** 会有输出。

这里主要分析ATF，qemu只加载了ATF包括u-boot。如果想一块加载Linux可以参考： [zhuanlan.zhihu.com/p/52](https://zhuanlan.zhihu.com/p/521196386)

**后记：**

公众号不像CSDN、知乎等博客，特别专业详细的 **跟文档一样** 也不适合，主要能 **拓展下知识面** ，又有核心的 **干货** ，可以自己展开学习，所以还是尽量按照自己的一些理解，口语化概括描述，再加上代码。代码的解释后续有机会了会更新，本文涉及的编译环境搭建也可以加微信群交流，可以加我微信 **thatway1989** ，备注 **进群** 。一块讨论搭环境、汽车软件、操作系统等开源软件知识。

“ **啥都懂一点** ， **啥都不精通** ，

**干啥都能干** ， **干啥啥不是** ，

**专业入门劝退** ， **堪称程序员杂家** ”。

后续会继续更新，纯干货分析，无广告，不打赏，欢迎分享给朋友，欢迎评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-10 17:01・上海