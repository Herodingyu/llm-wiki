---
title: "万字长文：安全启动之SecureBoot启动吧（小白也能看懂！）"
source: "https://zhuanlan.zhihu.com/p/650483782"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "SecureBoot（安全启动）启动吧大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！ SecureBoot（安全启动）启动吧嗷呜嗷呜！！！ 本文干货满…"
tags:
  - "clippings"
---
68 人赞同了该文章

## SecureBoot（安全启动）启动吧

大家好！我是不知名的安全工程师Hkcoco！

欢迎大家关注我的微信公众号： [TrustZone](https://zhida.zhihu.com/search?content_id=232681591&content_type=Article&match_order=1&q=TrustZone&zhida_source=entity) | CSDN：Hkcoco

获取更多精彩内容哦！！！

---

SecureBoot（安全启动）启动吧嗷呜嗷呜！！！

本文干货满满，将从以下三个方面带你玩转安全启动（Secure Boot）

- 一、 安全引导的作用
- 二、 安全引导的原理
- 三、 ATF的启动过程框架
- 四、ATF的启动过程Code解析

## 前言

既然是小白也能看懂，那么在开篇之前我先解释两个概念，相关从业者可以跳过这两点：

- 什么是ATF？

[ARM Trusted Firmware](https://zhida.zhihu.com/search?content_id=232681591&content_type=Article&match_order=1&q=ARM+Trusted+Firmware&zhida_source=entity) 中的Trusted Firmware-A（简称TF-A）。TF-A是Trusted Firmware Project中的一个项目。

TF(Trusted Firmware)是ARM在Armv8引入的安全解决方案，为安全提供了整体解决方案。它包括启动和运行过程中的特权级划分，对Armv7中的TrustZone（TZ）进行了提高，补充了启动过程信任链的传导，细化了运行过程的特权级区间。

TF实际有两种Profile，对ARM Profile A的CPU应用TF-A，对ARM Profile M的CPU应用TF-M。我们一般接触的都是TF-A，又因为这个概念是ARM提出的，有时候也缩写做ATF（ARM Trusted Firmware），所以本文对ATF和TF-A不再做特殊说明，ATF也是TF-A。

- 什么是安全引导？

或者叫安全启动

**安全引导（Secure Boot）功能是指在系统的整个启动过程中** ，使用 **链式验证电子签名的方式** 来验证系统中重要镜像文件的可靠性，然后再加载镜像文件的引导过程。

安全引导功能可以保护二级厂商系统的独立性和完整性。在ARMv8架构中ARM提供了ARM可信固件（ATF）。

**Bootloader、Linux内核、TEE OS的启动都由ATF来加载和引导** 。对于ARMv8, Bootloader、Linux内核和TEE OS镜像文件 **的验签工作都是在ATF中完成** 的。本文将介绍安全引导功能的原理以及ATF的启动过程。

不过在开始详细启动流程时，我们先对ATF有个概要的认识。

## 1\. 冷启动(Cold boot)流程及阶段划分

restart--冷启动

reset--热启动

ATF冷启动实现分为5个步骤：

- [BL1](https://zhida.zhihu.com/search?content_id=232681591&content_type=Article&match_order=1&q=BL1&zhida_source=entity) - AP Trusted ROM，一般为BootRom。
- [BL2](https://zhida.zhihu.com/search?content_id=232681591&content_type=Article&match_order=1&q=BL2&zhida_source=entity) - Trusted Boot Firmware，一般为Trusted Bootloader。
- [BL31](https://zhida.zhihu.com/search?content_id=232681591&content_type=Article&match_order=1&q=BL31&zhida_source=entity) - EL3 Runtime Firmware，一般为SML，管理SMC执行处理和中断，运行在secure monitor中。
- [BL32](https://zhida.zhihu.com/search?content_id=232681591&content_type=Article&match_order=1&q=BL32&zhida_source=entity) - Secure-EL1 Payload，一般为TEE OS Image。
- [BL33](https://zhida.zhihu.com/search?content_id=232681591&content_type=Article&match_order=1&q=BL33&zhida_source=entity) - Non-Trusted Firmware，一般为uboot、linux kernel。

ATF输出BL1、BL2、BL31，提供BL32和BL33接口。

（我想提供的接口就是BL32和BL33的镜像可以是指定的，atf其实是一个启动框架，这其中包含的五个步骤，每个步骤你想要的内容，可以由厂商自己定义。）

启动流程如下：

![](https://picx.zhimg.com/v2-e78299d2735dc581e03b9f0a3deb5865_1440w.jpg)

在这里插入图片描述

### 1.1 BL1

BL1位于ROM中，在EL3下从reset vector处开始运行。（bootrom就是芯片上电运行的（chip-rom的作用就是跳转到bootrom））

BL1做的工作主要有：

- 决定启动路径：冷启动还是热启动。
- 架构初始化：异常向量、CPU复位处理函数配置、控制寄存器设置(SCRLR\_EL3/SCR\_EL3/CPTR\_EL3/DAIF)
- 平台初始化：使能Trusted Watchdog、初始化控制台、配置硬件一致性互联、配置MMU、初始化相关存储设备。
- 固件更新处理
- BL2镜像加载和执行：
- BL1输出“Booting Trusted Firmware"。
- BL1加载BL2到SRAM；如果SRAM不够或者BL2镜像错误，输出“Failed to load BL2 firmware.”。
- BL1切换到Secure EL1并将执行权交给BL2.

### 1.2 BL2

BL2位于SRAM中，运行在Secure EL1主要工作有：

- 架构初始化：EL1/EL0使能浮点单元和ASMID。
- 平台初始化：控制台初始化、相关存储设备初始化、MMU、相关设备安全配置、
- SCP\_BL2：系统控制核镜像加载，单独核处理系统功耗、时钟、复位等控制。
- 加载BL31镜像：BL2将控制权交给BL1；BL1关闭MMU并关cache；BL1将控制权交给BL31。
- 加载BL32镜像：BL32运行在安全世界，BL2依赖BL31将控制权交给BL32。SPSR通过Secure-EL1 Payload Dispatcher进行初始化。
- 加载BL33镜像：BL2依赖BL31将控制权交给BL33。

### 1.3 BL31

BL31位于SRAM中，EL3模式。除了做架构初始化和平台初始化外，还做了如下工作：

- PSCI服务初始化，后续提供CPU功耗管理操作。
- BL32镜像运行初始化，处于Secure EL1模式。
- 初始化非安全EL2或EL1，跳转到BL33执行。
- 负责安全非安全世界切换。
- 进行安全服务请求的分发。
![](https://picx.zhimg.com/v2-084f5f8009449439651f06792806f089_1440w.jpg)

在这里插入图片描述

这两幅图真的不错，棒。

## 一、 安全引导的作用

安全引导可用 **于保证系统的完整性，防止系统中重要镜像文件被破坏或替换** 。

一般情况下，安全引导需要保护

- 系统的BootLoader镜像文件、
- TEE镜像文件、
- Linux内核镜像文件、
- Recover镜像文件
- 以及在ARMv8中使用的ATF镜像文件。

将TEE镜像文件的加载操作 **加入安全引导功能中可阻止黑客通过替换TEE镜像文件的方式来窃取被TEE保护的重要资料** 。

当前使用ARM芯片的系统中大部分使能了安全引导功能，该功能对于用户的最直接感受就是， **当用户非法刷入其他厂商的ROM后手机无法正常启动** ，这是因为非法刷机将导致系统中的重要镜像文件被替换，系统在启动过程中对镜像文件的电子验签失败，如果BootLoader验证失败，则系统在进入BootLoader阶段之前就会挂死。

**（信任根这个词语此时有没有在你的脑子里包含）**

## 二、 安全引导的原理

安全引导功能的原理就是采用链式验签的方式启动系统，也就是在系统启动过程中，在加载下一个阶段的镜像之前都会对需要被加载的镜像文件进行电子验签，只有验签操作通过后，该镜像才能被加载到内存中，然后系统才会跳转到下一个阶段继续执行，整个验签链中的任何一环验签失败都会导致系统挂死， **系统启动过程中的第一级验签操作是由 [ChipRom](https://zhida.zhihu.com/search?content_id=232681591&content_type=Article&match_order=1&q=ChipRom&zhida_source=entity) 来完成的。**

**只要芯片一出厂，用户就无法修改固化在芯片中的这部分代码** ，因此无法通过修改第一级验签结果来关闭安全引导功能。

**而且验签操作使用的RSA公钥或者哈希值将会被保存在OTP/efuse中** ，该区域中的数据一般只有ChipRom和TEE能够读取且无法被修改。RSA公钥或者哈希值将会在产品出厂之前被写入到OTP/efuse中，而且不同厂商使用的密钥会不一样。

本质上也就是说Rom拿来校验后级第一部分的内容所用到的密钥是来自OTP里面，而这种是在出厂就确认好了的，无法修改的。ChipRom和OTP的配合让这个安全启动的最开始具备了灵活性和安全性兼顾。

**在谷歌的安全引导功能白皮书中提出了安全引导功能实现方案的设计建议** 。

谷歌建议将镜像文件的电子签名信息和验签使用的RSA公钥\*\*保存在电子证书中，\*\*系统在启动的过程中首先会验证电子证书的合法性，如果验证通过则需从电子证书中获取签名信息和RSA公钥，然后再利用它们对镜像文件进行验证。整个验证过程就是先验证证书，验证证书通过后再去验证镜像文件的合法性。

但是在实际实现过程中， **大多数芯片厂商是将签名信息与需要被验签的镜像文件打包在一起，而RSA公钥则会被打包到执行验证操作的镜像文件中** 。

（但是动态TA的事情）

不同厂商可能会对镜像文件进行加密操作，使保存在设备中的镜像文件都是以密文的形式存在。

在启动过程中， **首先会验证密文镜像文件的合法性然后再进行解密镜像文件的操作** ，这些都完成后才会将明文的镜像文件加载到内存中然后再执行跳转操作。

先验证，再解密，签名的是加密的文件哦。

## 2.1 ARMv7安全引导的过程

**对于安全引导功能的实现和验证过程各家芯片公司的方案都不一样** ，这是由该芯片的启动流程以及启动所需镜像文件来决定的， **但都会遵循链式验签启动的原则** 。

ARMv7架构并没有使用ATF，系统的启动流程与以前一样使用BootLoader来引导Linux内核和TEE OS。安全引导的启动流程如图下所示。

![](https://pic4.zhimg.com/v2-4f80a42fd19bba4b671727f4ad199eeb_1440w.jpg)

安全引导的启动流程

系统启动过程使用链式验签的方式进行引导，其中任何一环验签失败都会导致系统启动失败\*\*，为防止通过替换ramdisk来修改根文件系统中的内容，一般将ramdisk与Linux内核打包在同一个镜像文件中，\*\*而且该镜像文件需要待验签通过后才可被使用。

签名信息一般是对镜像文件的内容 **进行哈希计算获取摘要后再对该摘要使用RSA私钥进行电子签名来获得** ，验证时同样会计算需要被引导的镜像文件的摘要，然后使用该摘要、签名信息以及RSA公钥进行RSA算法的验证。这个就是对称的过程，加密签名，验签解密。

## 2.2 ARMv8安全引导的过程

ARMv8架构之后ARM提供了ATF, BootLoader、TEE镜像文件、Linux内核镜像文件、recovery镜像文件都是由ATF来进行引导和加载而不是由ChipRom来完成的。

**ChipRom只会去验证ATF中bl1的合法性** ，后续引导过程同样也是按照链式验签的方式进行，符合 [TBBR规范](https://zhida.zhihu.com/search?content_id=232681591&content_type=Article&match_order=1&q=TBBR%E8%A7%84%E8%8C%83&zhida_source=entity) 。读者可使用git命令从gitHub上获取ATF的所有源代在ARMv8架构中整个安全引导的流程如图下所示。

ARMv8的Secure Boot流程

ARMv8架构中引入了ATF， **同时在ATF中提供了安全引导的功能，BootLoader镜像、Linux内核、recovery镜像和TEE OS镜像文件的签名方式都由ATF决定** 。当然开发者也可以对ATF进行定制化，修改ATF中的验签过程，但是修改后的验签方案需要符合TBBR规范。

此时ATF不要和BL31搞混了哦。ATF是一个整个启动链路。

## 三、 ATF的启动过程

ATF的启动过程根据ARMv8的运行模式（AArch32/AArch64）会有所不同，但基本一致。

**在AArch32中是不会去加载bl31而是将EL3或者Monitor模式的运行代码保存在bl32中执行** 。在AArch64中，ATF的完整启动流程如图下所示。

![](https://pic2.zhimg.com/v2-80a6fab422fe706a15a636c98a74a78b_1440w.jpg)

AArch64模式的ATF启动流程

在上述启动过程中，从一个镜像跳转到另外一个镜像文件执行的方式各不相同，以下为镜像跳转的过程和方式说明。

## 1-概要流程

### 1\. bl1跳转到bl2执行

在bl1完成了将bl2镜像文件加载到RAM中的操作、中断向量表的设定以及其他CPU相关设定后，bl1\_main函数会解析出bl2镜像文件的描述信息，获取入口地址，并设定下一个阶段的cpu上下文。这些操作完成之后，调用el3\_exit函数来实现bl1到bl2的跳转，进入bl2中开始执行。

### 2\. bl2跳转到bl31执行

在bl2中将会加载bl31、bl32、bl33的镜像文件到对应权限的内存中，并将该三个镜像文件的描述信息组成一个链表保存起来，以备bl31启动bl32和bl33使用。在AArch64中，bl31为EL3的执行软件，其运行时的主要功能是对安全监控模式调用（smc）指令和中断处理，运行在ARM的Monitor模式中。

bl32一般为TEE OS镜像文件，本章以OP-TEE为例进行说明。

bl33为正常世界状态的镜像文件，例如uboot、EKD2等。当前该部分为BootLoader部分的镜像文件，再由BootLoader来启动Linux内核镜像。

从bl2跳转到bl31是通过带入bl31的入口点信息作为参数，然后调用安全监控模式调用指令，触发在bl1中设定的安全监控模式调用请求，该请求处理完成后会将中央处理器的执行权限交给bl31，并跳转到bl31中去执行。

### 3\. bl31跳转到bl32执行

在bl31中会执行runtime\_service\_inti函数，该函数会调用注册到EL3中所有服务的初始化函数，其中有一个服务项就是TEE服务，该服务项的初始化函数会将TEE OS的初始化函数赋值给bl32\_init变量，当所有服务项执行完初始化后，在bl31中会调用bl32\_init执行的函数来跳转到TEE OS中并开始执行TEE OS的启动。

### 4\. bl31跳转到bl33执行

当TEE-OS镜像启动完成后会触发一个ID为TEESMC\_OPTEED\_RETURN\_ENTRY\_DONE的安全监控模式调用，该调用是用来告知EL3 TEE OS镜像已经完成了初始化，然后将CPU的状态恢复到bl31\_init的位置继续执行。

bl31通过遍历在bl2中记录的所有镜像信息的链表来找到需要执行的bl33的镜像。然后通过获取到bl33镜像的信息，设定下一个阶段的CPU上下文，退出el3后进入到bl33镜像中开始执行。

## 2-code层面

### 1 ATF中bl1的启动

系统上电之后首先会运行ChipRom，之后会跳转到ATF的bl1中继续执行。bl1主要初始化CPU、设定异常向量、将bl2的镜像加载到安全RAM中，然后跳转到bl2中开始运行。

bl1的主要代码存放在bl1目录中，bl1的链接文件是bl1/bl1.ld.s文件，该文件指定bl1的入口函数是bl1\_entrypoint。

AArch32的该函数定义在bl1/aarch32/bl1\_entrypoint.S文件中，AArch64的该函数定义在bl1/aarch64/bl1\_entrypoint. S文件中。bl1的执行流程如图所示。

![](https://picx.zhimg.com/v2-f668227883956be88f89332f90df1a03_1440w.jpg)

bl1执行流程

#### 1\. bl1\_entrypoint函数说明

bl1\_entrypoint函数主要完成ARMv8架构中EL3执行环境的基础初始化、设定异常向量表、加载bl2的镜像文件到内存中并进行跳转到bl2继续执行。该函数的内容如下：

```
func bl1_entrypoint

/＊  EL3级别运行环境的初始化，该函数定义在include/common/aarch64/el3_common_macros.S文

件中＊/

    el3_entrypoint_common           \

        _set_endian=1               \

        _warm_boot_mailbox=! PROGRAMMABLE_RESET_ADDRESS           \

        _secondary_cold_boot=! COLD_BOOT_SINGLE_CPU                \

        _init_memory=1              \

        _init_c_runtime=1           \

        _exception_vectors=bl1_exceptions

    bl  bl1_early_platform_setup  //调用bl1_early_platform_setup函数完成底层初始化

    bl  bl1_plat_arch_setup        //调用bl1_plat_arch_setup完成平台初始化

    bl  bl1_main                     //调用bl1_main函数，初始化验证模块，加载下一阶段的

    image到RAM中

    b   el3_exit                     //调用el3_exit函数，跳转到下一个image(bl2)

endfunc bl1_entrypoint
```

el3\_entrypoint\_common函数执行时带入的参数包括大小端标识、属于冷启动还是重启操作、是否是从核的启动、是否需要进行内存初始化、是否需要建立C语言运行环境（栈初始化）、异常向量表地址注册等。

#### 2\. el3\_entrypoint\_common功能说明

该函数以宏的方式被定义， **主要用来完成EL3运行环境的设置和异常向量表的注册，代码内容和注释如下** ：

```
.macro el3_entrypoint_common                                          \

        _set_endian, _warm_boot_mailbox, _secondary_cold_boot,  \

        _init_memory, _init_c_runtime, _exception_vectors

    /＊ 通过sctlr寄存器设定大小端 ＊/

    .if \_set_endian

        mrs x0, sctlr_el3

        bic x0, x0, #SCTLR_EE_BIT

        msr sctlr_el3, x0

        isb

    .endif /＊ _set_endian ＊/

    /＊ 判定是否需要调用do_cold_boot流程 ＊/

    .if \_warm_boot_mailbox

        bl  plat_get_my_entrypoint

        cbz x0, do_cold_boot

        br  x0

    do_cold_boot:

    .endif /＊ _warm_boot_mailbox ＊/

    bl  reset_handler               //执行reset handle操作

    el3_arch_init_common \_exception_vectors //初始化异常向量

    /＊ 判定当前CPU是否是主CPU，如果是则执行主CPU的初始化 ＊/

    .if \_secondary_cold_boot

        //获取当前core的编号，判定当前是主核还是从核

        bl  plat_is_my_cpu_primary

        //如果是主核则调用do_primary_cold_boot执行主核启动

        cbnz     w0, do_primary_cold_boot

        bl  plat_secondary_cold_boot_setup   //如果是从核则执行从核的启动

        bl  el3_panic

    do_primary_cold_boot:

    .endif /＊ _secondary_cold_boot ＊/

    /＊ 初始化memory ＊/

    .if \_init_memory

        bl  platform_mem_init                  //初始化memory

    .endif /＊ _init_memory ＊/

    /＊ 初始化C语言的运行环境 ＊/

    .if \_init_c_runtime

#ifdef IMAGE_BL31

        adr x0, __RW_START__                   //获取内存RW的起始地址

        adr x1, __RW_END__                     //获取内存RW的末端地址

        sub x1, x1, x0                          //RW的长度

        bl  inv_dcache_range                   //无效数据cache

#endif /＊ IMAGE_BL31 ＊/

        ldr x0, =__BSS_START__                 //将BSS段内存的起始地址存放在x0中

        ldr x1, =__BSS_SIZE__                  //将BSS段内如的某段地址存放在x1中

        bl  zeromem                              //请扩BSS段内存

#if USE_COHERENT_MEM

        ldr x0, =__COHERENT_RAM_START__

        ldr x1, =__COHERENT_RAM_UNALIGNED_SIZE__

        bl  zeromem

#endif

#ifdef IMAGE_BL1

        ldr x0, =__DATA_RAM_START__           //获取bl1的数据段存放到RAM中的起始地址

        ldr x1, =__DATA_ROM_START__           //获取bl1中数据段在ROM中的起始地址

        ldr x2, =__DATA_SIZE__                 //获取bl1数据端的大小

        bl  memcpy16                            //将bl1的数据段复制到RAM中

#endif

    .endif /＊ _init_c_runtime ＊/

    msr spsel, #0

    bl  plat_set_my_stack                       //设定堆栈

#if STACK_PROTECTOR_ENABLED

    .if \_init_c_runtime

    bl  update_stack_protector_canary

    .endif /＊ _init_c_runtime ＊/

#endif

    .endm

#endif /＊ __EL3_COMMON_MACROS_S__ ＊/
```

el3\_entrypoint\_common函数主要完成C语言运行环境的搭建、异常向量表的注册、bl1镜像文件的复制、CPU安全运行环境的设定等。

#### 3\. bl1\_early\_platform\_setup函数

bl1\_early\_platform\_setup函数主要完成CPU中ARM核的早期初始化，包括内存、页表、外部设备以及ARM核状态的设定，其内容如下：

```
void bl1_early_platform_setup(void)

{

    /＊ 使能看门狗，初始化console，初始化memory ＊/

    arm_bl1_early_platform_setup();

    plat_arm_interconnect_init(); //初始化外部设备

    plat_arm_interconnect_enter_coherency(); //使能外部设备

}
```

#### 4\. bl\_main函数

bl\_main函数主要完成bl2镜像文件的加载和bl2运行环境的配置，如果使能了安全引导功能，则还需要对bl2镜像文件执行验签操作。该函数定义在/bl1/bl1\_main.c文件中，主要内容和注释如下：

```
void bl1_main(void)

{

    unsigned int image_id;

    print_errata_status();

#if DEBUG

    u_register_t val;

/＊ 确保MMU和cache使能 ＊/

#ifdef AARCH32

    val = read_sctlr();

#else

    val = read_sctlr_el3();

#endif

    assert(val & SCTLR_M_BIT);

    assert(val & SCTLR_C_BIT);

    assert(val & SCTLR_I_BIT);

    val = (read_ctr_el0() >> CTR_CWG_SHIFT) & CTR_CWG_MASK;

    if (val ! = 0)

        assert(CACHE_WRITEBACK_GRANULE == SIZE_FROM_LOG2_WORDS(val));

    else

        assert(CACHE_WRITEBACK_GRANULE ＜= MAX_CACHE_LINE_SIZE);

#endif

    bl1_arch_setup();               //设置bl2镜像运行时的EL级别

#if TRUSTED_BOARD_BOOT

    auth_mod_init();                //初始化image的验证模块

#endif /＊ TRUSTED_BOARD_BOOT ＊/

    bl1_platform_setup();          //平台相关设置，主要是IO的设置

    //获取下一个阶段image的ID值。默认返回值为BL2_IMAGE_ID

    image_id = bl1_plat_get_next_image_id();

    if (image_id == BL2_IMAGE_ID)

        bl1_load_bl2();             //将bl2 image加载到安全RAM中

      else

          NOTICE("BL1-FWU: ＊＊＊＊＊＊＊FWU Process Started＊＊＊＊＊＊＊\n");

      //获取bl2镜像的描述信息、包括名字、ID、entry point info等，并将这些信息保存到

      //bl1_cpu_context的上下文中

      bl1_prepare_next_image(image_id);

      console_flush();                //刷新console

  }
```

#### 5\. bl1\_prepare\_next\_image函数

bl1\_prepare\_next\_image函数用来获取bl2镜像的描述信息、bl2的入口地址信息、设定bl2的运行状态，以备跳转时使用，其内容和解释如下：

```
void bl1_prepare_next_image(unsigned int image_id)

{

    unsigned int security_state;

    image_desc_t ＊image_desc;

    entry_point_info_t ＊next_bl_ep;

    /＊ 获取bl2 image的描述信息，主要包括入口地址、名字等信息 ＊/

    image_desc = bl1_plat_get_image_desc(image_id);

    assert(image_desc);

    /＊ 获取image的入口地址信息 ＊/

    next_bl_ep = &image_desc->ep_info;

    //获取bl2 image的安全状态（判定该image是属于安全态的image的还是非安全态的image）

    security_state = GET_SECURITY_STATE(next_bl_ep->h.attr);

    /＊ 设定用于存放CPU context的变量 ＊/

    if (! cm_get_context(security_state))

        cm_set_context(&bl1_cpu_context[security_state], security_state);

    /＊ 为下个阶段的image准备好SPSR数据 ＊/

    if (security_state == SECURE) {

        next_bl_ep->spsr = SPSR_64(MODE_EL1, MODE_SP_ELX,

                DISABLE_ALL_EXCEPTIONS);

    } else {

        /＊ Use EL2 if supported else use EL1. ＊/

        if (read_id_aa64pfr0_el1() &

            (ID_AA64PFR0_ELX_MASK ＜＜ ID_AA64PFR0_EL2_SHIFT)) {

            next_bl_ep->spsr = SPSR_64(MODE_EL2, MODE_SP_ELX,

                DISABLE_ALL_EXCEPTIONS);

        } else {

            next_bl_ep->spsr = SPSR_64(MODE_EL1, MODE_SP_ELX,

                DISABLE_ALL_EXCEPTIONS);

        }

    }

    bl1_plat_set_ep_info(image_id, next_bl_ep);

    /＊ 使用获取到的bl2 image的entrypoint info数据来初始化cpu context ＊/

    cm_init_my_context(next_bl_ep);

    /＊ 为进入到下个EL级别做准备 ＊/

    cm_prepare_el3_exit(security_state);

    /＊ 设定image的执行状态 ＊/

    image_desc->state = IMAGE_STATE_EXECUTED;

    /＊ 打印出bl2 image的入口信息 ＊/

    print_entry_point_info(next_bl_ep);

}
```

### 2 ATF中bl2的启动

bl2镜像将为后续镜像的加载执行相关的初始化操作，主要是内存、MMU、串口以及EL3软件运行环境的设置，并且加载bl3x的镜像到内存中。

通过查看bl2.ld.S文件可发现，bl2镜像的入口函数是bl2\_entrypoint。该函数定义在bl2/aarch64/bl2\_entrypoint.S文件中。该阶段的执行流程如图所示。

![](https://pic1.zhimg.com/v2-918991fe5f9170b12843a6172f7613aa_1440w.jpg)

bl2执行流程

#### 1\. bl2\_entrypoint函数

**bl2\_entrypoint函数最终会触发安全监控模式调用（smc）** ，通知bl1将CPU的控制权限转交给bl31，然后执行bl31。

该函数会执行

- 平台相关的初始化、
- 获取存放bl3x镜像文件的结构体变量、
- 解析出bl31的入口地址等。

该函数的主要内容和注释如下：

```
func bl2_entrypoint

    mov x20, x1                      //获取可用安全内存的起始地址

    adr x0, early_exceptions       //设定异常向量

    msr vbar_el1, x0                //将异常向量表地址写入到VBAR寄存器中

    isb

    msr daifclr, #DAIF_ABT_BIT    //使能SErrot中断

    /＊ 使能指令cache、栈顶地址以及数据访问权限对齐检查 ＊/

    mov x1, #(SCTLR_I_BIT | SCTLR_A_BIT | SCTLR_SA_BIT)

    mrs x0, sctlr_el1

    orr x0, x0, x1

    msr sctlr_el1, x0

    isb

    /＊ 获取有效的RW内存以备bl2使用 ＊/

      adr x0, __RW_START__                   //获取RW内存的起始地址

      adr x1, __RW_END__                     //获取RW内存的末端地址

      sub x1, x1, x0                          //计算出RW内存的大小

      bl  inv_dcache_range                   //禁止数据cache

      ldr x0, =__BSS_START__                 //获取bl2中BSS段的起始地址

      ldr x1, =__BSS_SIZE__                  //获取bl2中BSS段的大小

      bl  zeromem                              //清空BSS段中的内容

  #if USE_COHERENT_MEM

      ldr x0, =__COHERENT_RAM_START__

      ldr x1, =__COHERENT_RAM_UNALIGNED_SIZE__

      bl  zeromem

  #endif

      bl  plat_set_my_stack                  //初始化bl2运行的栈

  #if STACK_PROTECTOR_ENABLED

      bl  update_stack_protector_canary    //更新栈保护区域数据

  #endif

      mov x0, x20

      bl  bl2_early_platform_setup          //设置平台相关

      bl  bl2_plat_arch_setup                //设置架构相关

      bl  bl2_main      //跳转到BL2的主要函数执行，从该函数中跳转到bl31以及bl32或者bl33

      no_ret plat_panic_handler

  endfunc bl2_entrypoint
```

在bl2\_entrypoint函数中， **完成bl2运行栈的初始化，配置完运行环境后** ，会调用 **bl2\_main函数来完成bl2对bl3x镜像的加载** ，而 **CPU控制权限的转移则是通过触发安全监控模式调用（smc）来实现。**

#### 2\. bl2\_main函数

bl2\_main函数完成了bl2阶段的主要操作，包括

- 对下一个阶段镜像文件的解析、
- 获取入口地址和镜像文件大小等信息，
- 然后对镜像文件进行验签和加载操作。
- 将bl31加载到内存中后会触发安全监控模式调用（smc）将CPU权限转交给bl31。

该函数的主要内容和相关注释如下：

```
**        void bl2_main(void)

        {

            entry_point_info_t ＊next_bl_ep_info;

            bl2_arch_setup();               //执行平台相关初始化

        #if TRUSTED_BOARD_BOOT

            /＊ Initialize authentication module ＊/

            auth_mod_init();                //初始化image验证模块

        #endif /＊ TRUSTED_BOARD_BOOT ＊/

            //加载bl3x image到RAM中并返回bl31的入口地址

            next_bl_ep_info = bl2_load_images();

        #ifdef AARCH32

            disable_mmu_icache_secure();  //禁止MMU的指令cache

        #endif /＊ AArch32 ＊/

            console_flush();                //刷新console操作

            /＊ 调用smc指令，触发在bl1中设定的smc异常中断处理函数，跳转到bl31 ＊/

              smc(BL1_SMC_RUN_IMAGE, (unsigned long)next_bl_ep_info, 0, 0, 0, 0,0, 0);

          }**
```

#### 3\. bl2\_load\_images函数

bl2\_load\_images函数完成将bl32和bl33的镜像文件加载到内存中并返回bl31镜像的入口地址， **最终在bl2\_main函数中通过触发安全监控模式调用（smc）跳转到bl31，并将CPU控制权限交给bl31。**

该函数的主要内容和注释如下：

```
entry_point_info_t ＊bl2_load_images(void)

{

    bl_params_t ＊bl2_to_next_bl_params;

    bl_load_info_t ＊bl2_load_info;

    const bl_load_info_node_t ＊bl2_node_info;

    int plat_setup_done = 0;

    int err;

    /＊ 获取bl3x image的加载和入口函数信息 ＊/

    bl2_load_info = plat_get_bl_image_load_info();

    /＊ 检查返回的bl2_load_info中的信息是否正确 ＊/

    assert(bl2_load_info);

    assert(bl2_load_info->head);

    assert(bl2_load_info->h.type == PARAM_BL_LOAD_INFO);

    assert(bl2_load_info->h.version >= VERSION_2);

    /＊  将bl2_load_info中的head变量的值赋值为bl2_node_info，即将bl31  image的入口信息

    传递给bl2_node_info变量 ＊/

    bl2_node_info = bl2_load_info->head;

    /＊ 进入loop循环 ＊/

    while (bl2_node_info) {

        /＊ 在加载特定的bl3x image到RAM之前先确定是否需要进行平台的初始化 ＊/

        if (bl2_node_info->image_info->h.attr & IMAGE_ATTRIB_PLAT_SETUP) {

            if (plat_setup_done) {

                WARN("BL2: Platform setup already done! ! \n");

            } else {

                INFO("BL2: Doing platform setup\n");

                bl2_platform_setup();

                plat_setup_done = 1;

            }

        }

        /＊ 对bl3x image进行电子验签，如果通过则执行加载操作 ＊/

        if (! (bl2_node_info->image_info->h.attr & IMAGE_ATTRIB_SKIP_LOADING)) {

            INFO("BL2: Loading image id %d\n", bl2_node_info->image_id);

            err = load_auth_image(bl2_node_info->image_id,

                bl2_node_info->image_info);

            if (err) {

                ERROR("BL2: Failed to load image (%i)\n", err);

                plat_error_handler(err);

            }

        } else {

            INFO("BL2: Skip loading image id %d\n", bl2_node_info->image_id);

        }

          /＊ 可以根据实际需要更改，通过给定image ID来更改image的加载信息 ＊/

          err = bl2_plat_handle_post_image_load(bl2_node_info->image_id);

          if (err) {

              ERROR("BL2: Failure in post image load handling (%i)\n", err);

              plat_error_handler(err);

          }

          bl2_node_info = bl2_node_info->next_load_info;

      }

      /＊  获取下一个执行的镜像的入口信息，并且将以后会被执行的镜像的入口信息组合成链表，通过判断

      image  des中的ep_info.h.attr的值是否为（EXECUTABLE|EP_FIRST_EX）来确定接下来第一个

      被执行的image＊/

      bl2_to_next_bl_params = plat_get_next_bl_params();

      assert(bl2_to_next_bl_params);

      assert(bl2_to_next_bl_params->head);

      assert(bl2_to_next_bl_params->h.type == PARAM_BL_PARAMS);

      assert(bl2_to_next_bl_params->h.version >= VERSION_2);

      plat_flush_next_bl_params();

      /＊ 返回下一个进入的镜像的入口信息，即bl31的入口信息 ＊/

      return bl2_to_next_bl_params->head->ep_info;

  }
```

#### 4\. bl3x镜像文件信息

ATF使用bl\_mem\_params\_node\_t结构体变量数组bl\_mem\_params\_desc\_ptr来保存bl3x镜像文件的信息。该结构体内容如下：

```
typedef struct bl_mem_params_node {

    unsigned int image_id;                   //镜像文件的id值

    image_info_t image_info;                 //镜像文件的信息

    entry_point_info_t ep_info;              //bl3x的入口地址信息

    unsigned int next_handoff_image_id;    //写一个阶段bl3x的id值

    bl_load_info_node_t load_node_mem;     //该镜像文件需要被保存在RAM中的信息

    bl_params_node_t params_node_mem;       //该镜像文件启动时所需参数在RAM中的信息

} bl_mem_params_node_t;
```

在bl2\_load\_images函数中通过调用plat\_get\_bl\_image\_load\_info函数来获取bl3x镜像文件的信息，ATF源代码中通过使用REGISTER\_BL\_IMAGE\_DESCS宏将事先定义好的bl2\_mem\_params\_descs变量中的数据保存到bl\_mem\_params\_desc\_ptr数组中，而bl2\_mem\_params\_descs中保存的就是所有bl3x镜像文件的基本信息，开发者可根据不同平台的实际情况修改bl2\_mem\_params\_descs变量中各镜像文件的信息。

#### 5\. bl2到bl31的跳转

在bl2\_main函数中最终会调用smc（BL1\_SMC\_RUN\_IMAGE,（unsigned long）next\_bl\_ep\_info,0,0,0,0,0,0）来触发一个类型为BL1\_SMC\_RUN\_IMAGE的安全监控模式调用。

安全监控模式调用的处理接口在bl1阶段时被指定，调用该函数时传入的command ID是BL1\_SMC\_RUN\_IMAGE，故执行该函数之后，系统将跳转到中断处理函数（smc\_handler64）继续执行。该函数定义在bl1/aarch64/bl1\_exception.S文件中。

该函数最终通过判定安全监控模式调用的类型（在bl2中将会发送类型为BL1\_SMC\_RUN\_IMAGE的smc）查看当前的安全监控模式调用是否是用于跳转，其内容如下：

```
func smc_handler64

    /＊ 判定触发smc操作时带入的参数是否为跳转执行image的操作 ＊/

    mov x30, #BL1_SMC_RUN_IMAGE   //将BL1_SMC_RUN_IMAGE的值保存到x30

    cmp x30, x0                      //比较x30与x0的值

    //如果x30与x0不同，则认为是普通类型的异常，进入smc_handler进行处理

    b.ne     smc_handler

    mrs x30, scr_el3                //获取scr寄存器的值

    tst x30, #SCR_NS_BIT           //比较scr寄存器中的NS bit与SCR_NS_BIT是否相等

    //如果当前NS bit为非安全位，则证明不合法，产生异常

    b.ne     unexpected_sync_exception

    //获取offset和sp的值

    ldr x30, [sp, #CTX_EL3STATE_OFFSET + CTX_RUNTIME_SP]

    msr spsel, #0                     //清空spsel中的值

    mov sp, x30                      //保存x30的值到sp寄存器，用于返回

    mov x20, x1                      //将x1中的数据保存到x20中

    mov x0, x20                      //将x20的数据保存到x0中

    bl  bl1_print_next_bl_ep_info //打印出bl3x镜像文件信息

    //传入参数和bl3x入口函数的PC指针

    ldp x0, x1, [x20, #ENTRY_POINT_INFO_PC_OFFSET]

    msr elr_el3, x0

    msr spsr_el3, x1

    ubfx     x0, x1, #MODE_EL_SHIFT, #2  //设定ARM核模式

    cmp x0, #MODE_EL3                      //比较x0寄存器中的值是否为MODE_EL3

    b.ne     unexpected_sync_exception   //如果x0中不是MODE_EL3，则产生异常

    bl  disable_mmu_icache_el3           //禁止MMU的指令cache

    tlbi     alle3

#if SPIN_ON_BL1_EXIT

    bl  print_debug_loop_message

debug_loop:

    b    debug_loop

#endif

    mov x0, x20

    bl  bl1_plat_prepare_exit/

    /＊ 设定返回参数 ＊/

    ldp x6, x7, [x20, #(ENTRY_POINT_INFO_ARGS_OFFSET + 0x30)]

    ldp x4, x5, [x20, #(ENTRY_POINT_INFO_ARGS_OFFSET + 0x20)]

    ldp x2, x3, [x20, #(ENTRY_POINT_INFO_ARGS_OFFSET + 0x10)]

    ldp x0, x1, [x20, #(ENTRY_POINT_INFO_ARGS_OFFSET + 0x0)]

    eret                              //跳转到bl3x执行

endfunc smc_handler64
```

**在此安全监控模式调用处理过程中会将ARM核的状态切到EL3运行，即bl31是运行在EL3中的。**

### 3 ATF中bl31的启动

在bl2中触发安全监控模式调用后会跳转到bl31中执行，bl31最主要的作用是 **建立EL3运行态的软件配置** ， **在该阶段会完成各种类型的安全监控模式调用ID的注册和对应的ARM核状态的切换** ，bl31运行在EL3。bl31的执行流程如图所示。

![](https://pic1.zhimg.com/v2-92d8741c5ecd872bb6daeadb6cd94314_1440w.jpg)

在这里插入图片描述

#### 1\. bl31\_entrypoint函数

通过bl31.ld.S文件可知，bl31的入口函数是bl31\_entrypoint。该函数的内容如下：

```
func bl31_entrypoint

/＊

el3初始化操作，该el3_entrypoint_common函数在上面已经介绍过，其中runtime_exceptions为

el3 runtime software的异常向量表，内容定义在bl31/aarch64/runtime_exceptions.S文件中

＊/

#if ! RESET_TO_BL31

    mov x20, x0

    mov x21, x1

    el3_entrypoint_common              \

        _set_endian=0                   \

        _warm_boot_mailbox=0          \

        _secondary_cold_boot=0        \

        _init_memory=0                  \

        _init_c_runtime=1              \

        _exception_vectors=runtime_exceptions

    mov x0, x20

    mov x1, x21

#else

    el3_entrypoint_common              \

        _set_endian=1                   \

        _warm_boot_mailbox=! PROGRAMMABLE_RESET_ADDRESS    \

          _secondary_cold_boot=! COLD_BOOT_SINGLE_CPU         \

          _init_memory=1                  \

          _init_c_runtime=1              \

          _exception_vectors=runtime_exceptions

      mov x0, 0

      mov x1, 0

  #endif /＊ RESET_TO_BL31 ＊/

      bl  bl31_early_platform_setup    //平台架构相关的初始化设置

      bl  bl31_plat_arch_setup          //执行AArch初始化

      bl  bl31_main                       //跳转到bl31_main函数，执行该阶段需要的主要操作

      adr x0, __DATA_START__             //获取REE镜像的DATA段的起始地址

      adr x1, __DATA_END__               //获取REE镜像的DATA段的末端地址

      sub x1, x1, x0                      //计算镜像文件的大小

      bl  clean_dcache_range             //清空数据cache

      adr x0, __BSS_START__              //获取BSS段的起始地址

      adr x1, __BSS_END__                //获取BSS端的末端地址

      sub x1, x1, x0                      //计算BSS段的长度

      bl  clean_dcache_range             //清空数据cache

      //执行完成将跳转到bl33中执行，即执行BootLoader

      b    el3_exit

  endfunc bl31_entrypoint
```

#### 2\. bl31\_main函数

该函数主要完成必要的初始化操作， **注册EL3中各种安全监控模式调用的处理函数** ，以便在启动完成后响应在REE侧和TEE侧产生的安全监控模式调用。该函数的内容如下：

```
void bl31_main(void)

{

    bl31_platform_setup();         //初始化相关驱动、时钟等

    bl31_lib_init();                //用于执行bl31软件中相关全局变量的初始化

    /＊初始化el3中的service，通过在编译时指定特定的section来确定哪些service会被作为el3

    service＊/

    runtime_svc_init();

    /＊  如果注册了TEE  OS支持，在调用完成run_service_init之后会使用TEE  OS的入口函数初

    始化bl32_init变量，然后执行对应的init函数，以OP-TEE为例，bl32_init将会被初始化成

    opteed_init，到此将会执行opteed_init函数来进入OP-TEE  OS的启动，当OP-TEE  OS启动完

    后，将会产生一个TEESMC_OPTEED_RETURN_ENTRY_DONE的smc异常，通知bl31已经完成了OP-

    TEE的启动＊/

    if (bl32_init) {

        INFO("BL31: Initializing BL32\n");

        (＊bl32_init)();

    }

    //准备跳转到bl33，在执行runtime_service时会运行一个spd service，该service的初始化

    函数将会去执行bl32的镜像来完成TEE OS初始化

    bl31_prepare_next_image_entry();

    console_flush();

    bl31_plat_runtime_setup();

}
```

runtime\_svc\_init函数会将各种安全监控模式调用的处理函数的指针注册到EL3中，

并通过service-＞init函数来进行初始化，将TEE OS镜像的入口函数赋值给bl32\_init，通过执行bl32\_init指向的函数进入到TEE OS的启动过程。

待TEE OS启动完成之后就会去查找bl33的镜像文件，即REE侧的镜像文件，开始进入REE侧镜像的启动。

#### 3\. runtime\_svc\_init函数

该函数主要用来建立安全监控模式调用处理函数的索引表，并执行EL3中提供的服务项的初始化操作，获取TEE OS的入口地址并赋值给bl32\_init变量，以备启动TEE OS。

而这些处理函数是通过DECLARE\_RT\_SVC宏定义被编译到镜像文件的rt\_svc\_descs段中的。

```
void runtime_svc_init(void)

{

    int rc = 0, index, start_idx, end_idx;

    /＊判定rt_svc_descs段中service条数的是否超出MAX_RT_SVCS条＊/

    assert((RT_SVC_DESCS_END >= RT_SVC_DESCS_START) &&

            (RT_SVC_DECS_NUM ＜ MAX_RT_SVCS));

    if (RT_SVC_DECS_NUM == 0)

        return;

    /＊ 初始化t_svc_descs_indices数组中的数据成-1，表示当前所有的service无效＊/

    memset(rt_svc_descs_indices, -1, sizeof(rt_svc_descs_indices));

    /＊  获取第一条EL3  service在RAM中的起始地址，通过获取RT_SVC_DESCS_START的值来确定，

    该值在链接文件中有定义 ＊/

    rt_svc_descs = (rt_svc_desc_t ＊) RT_SVC_DESCS_START;

    /＊  遍历整个rt_svc_des段，将其call  type与rt_svc_descs_indices中的index建立对应

    关系 ＊/

    for (index = 0; index ＜ RT_SVC_DECS_NUM; index++) {

    rt_svc_desc_t ＊service = &rt_svc_descs[index];

        /＊ 判定在编译时注册的service是否有效 ＊/

        rc = validate_rt_svc_desc(service);

        if (rc) {

            ERROR("Invalid runtime service descriptor %p\n",

                (void ＊) service);

            panic();

        }

        /＊ 执行当前service的init的操作 ＊/

        if (service->init) {

            rc = service->init();

            if (rc) {

            ERROR("Error initializing runtime service %s\n",

                          service->name);

                continue;

            }

        }

        /＊  根据该service的call  type以及start  oen来确定唯一的index，并且将该service

        中支持的所有call type生成唯一的标识映射到同一个index中 ＊/

        start_idx = get_unique_oen(rt_svc_descs[index].start_oen,

                service->call_type);

        assert(start_idx ＜ MAX_RT_SVCS);

          end_idx = get_unique_oen(rt_svc_descs[index].end_oen,

                  service->call_type);

          assert(end_idx ＜ MAX_RT_SVCS);

          for (; start_idx ＜= end_idx; start_idx++)

              rt_svc_descs_indices[start_idx] = index;

      }

  }
```

#### 4\. DECLARE\_RT\_SVC

该宏用来在编译时将EL3中的service编译进rt\_svc\_descs段中。该宏定义如下：

```
#define DECLARE_RT_SVC(_name, _start, _end, _type, _setup, _smch) \

    static const rt_svc_desc_t __svc_desc_ ## _name \

        __section("rt_svc_descs") __used = { \

            .start_oen = _start, \

            .end_oen = _end, \

            .call_type = _type, \

            .name = #_name, \

            .init = _setup, \

            .handle = _smch }
```

该宏中的各种参数说明如下：

- □ start\_oen：该service的起始内部编号；
- □ end.oen：该service的末尾编号；
- □ call\_type：调用的smc的类型；
- □ name：该service的名字；
- □ init：该service在执行之前需要被执行的初始化操作；
- □ handle：当触发了call type的调用时调用的处理该请求的函数。

### 4 ATF中bl32的启动

bl31中的runtime\_svc\_init函数会初始化OP-TEE对应的服务，通过调用该服务项的初始化函数来完成OP-TEE的启动。对于OP-TEE的服务项会通过DECLARE\_RT\_SVC宏在编译时被存放到rt\_svc\_des段中。

该段中的init成员会被初始化成opteed\_setup函数，由此开始进入到OP-TEE OS的启动。整个流程如图下所示。

![](https://pic2.zhimg.com/v2-ec43a80ae46220275f7811d7dfadb26b_1440w.jpg)

bl32执行流程

#### 1\. opteed\_setup函数

该函数是ATF启动OP-TEE的入口函数，该函数会

- 查找到OP-TEE镜像的信息、
- 检查OP-TEE的入口函数指针是否有效、
- 设置OP-TEE运行的上下文，
- 然后调用OP-TEE的入口函数，
- 开始执行OP-TEE的启动。

该函数的内容如下：

```
int32_t opteed_setup(void)

{

    entry_point_info_t ＊optee_ep_info;

    uint32_t linear_id;

    linear_id = plat_my_core_pos();  //获取当前core的ID

    /＊ 获取bl32(OP-TEE)镜像的描述信息 ＊/

    optee_ep_info = bl31_plat_get_next_image_ep_info(SECURE);

    if (! optee_ep_info) {

        WARN("No OPTEE provided by BL2 boot loader, Booting device"

            " without OPTEE initialization. SMC's destined for OPTEE"

            " will return SMC_UNK\n");

        return 1;

    }

    /＊ 检查OP-TEE镜像指定的PC地址是否有效 ＊/

    if (! optee_ep_info->pc)

        return 1;

    opteed_rw = OPTEE_AARCH64;

    /＊ 初始化OP-TEE运行时CPU的smc上下文 ＊/

    opteed_init_optee_ep_state(optee_ep_info,

                opteed_rw,

                optee_ep_info->pc,

                &opteed_sp_context[linear_id]);

    /＊ 使用opteed_init初始化bl32_init变量，以备在bl31中调用 ＊/

    bl31_register_bl32_init(&opteed_init);

    return 0;

}
```

#### 2\. opteed\_init函数

该函数的地址会被赋值给bl32\_init变量，在bl31\_main函数中会被调用，主要用来完成启动OP-TEE的设置。该函数内容如下：

```
static int32_t opteed_init(void)

{

    uint32_t linear_id = plat_my_core_pos();

    //获取core的执行上下文变量

    optee_context_t ＊optee_ctx = &opteed_sp_context[linear_id];

    entry_point_info_t ＊optee_entry_point;

    uint64_t rc;

    /＊ 获取OPTEE image的信息 ＊/

    optee_entry_point = bl31_plat_get_next_image_ep_info(SECURE);

    assert(optee_entry_point);

    /＊ 使用optee image的entry point信息初始化CPU的上下文 ＊/

    cm_init_my_context(optee_entry_point);

    /＊ 开始设置CPU参数，最终会调用opteed_enter_sp函数执行跳转到OP-TEE的操作 ＊/

    rc = opteed_synchronous_sp_entry(optee_ctx);

    assert(rc ! = 0);

    return rc;

}
```

### 5 REE侧镜像文件的启动

在bl31\_main中启动完TEE OS之后通过调用bl31\_prepare\_next\_image\_entry函数来获取下一个阶段需要被加载的镜像文件，即REE侧的镜像文件，并配置好REE侧镜像的运行环境。

bl31\_main执行完成之后会跳转到bl31\_entrypoint中继续执行，计算出需要被加载的镜像文件的数据段大小和起始地址并清空BSS端中的数据，从EL3进入到EL1-NS开始执行REE侧的代码。

## 3 ATF启动过程小结

ATF作为最底层固件，OP-TEE OS、BootLoader、Linux内核的加载都是由ATF来完成的，而且ATF实现了安全引导的功能。

bl31运行于EL3，待系统启动完成后，在REE侧或TEE侧触发的安全监控模式调用（smc）都会进入bl31中被处理。

OP-TEE启动完成后会返回一个包含用于处理各种类型的安全监控模式调用的函数指针结构体变量，该变量会被添加到bl31的handle中，用于处理REE侧触发的安全监控模式调用。

bl2启动时通过触发安全监控模式调用通知bl1将CPU控制权限交给bl31, bl31通过解析特定段中是否存在OP-TEE的入口函数指针来确定是否需要加载OP-TEE。

OP-TEE启动后会触发安全监控模式调用重新进入到bl31中继续执行。

bl31通过查询链表的方式获取下一个需要被加载REE侧的镜像文件，并设定好REE侧运行时CPU的状态和运行环境，然后退出EL3进入REE侧镜像文件的启动，一般第一个REE侧镜像文件为BootLoader, BootLoader会加载Linux内核。

各芯片厂商的实际实现方法也不一样，但都会遵循链式验签的原则，由于ARMv8中引入ATF，其已完成了大部分的验签功能的开发，芯片厂商只需进行相应的调整就能实现完整的安全引导功能。

## 参考资料

- 1、 [5ityx.com/cate100/11126](https://link.zhihu.com/?target=http%3A//www.5ityx.com/cate100/111266.html)
- 2、 [blog.csdn.net/weixin\_45](https://link.zhihu.com/?target=https%3A//blog.csdn.net/weixin_45264425/article/details/126643129)
- 3、 [blog.csdn.net/weixin\_45](https://link.zhihu.com/?target=https%3A//blog.csdn.net/weixin_45264425/article/details/126634498)
- 4、 [blog.csdn.net/weixin\_45](https://link.zhihu.com/?target=https%3A//blog.csdn.net/weixin_45264425/article/details/126634277)
- 5、《可信应用开发指南》
- 6、 [cnblogs.com/arnoldlu/p/](https://link.zhihu.com/?target=https%3A//www.cnblogs.com/arnoldlu/p/14332530.html)
- 7、 [github.com/ARM-software](https://link.zhihu.com/?target=https%3A//github.com/ARM-software/arm-trusted-firmware)
- 8、 [github.com/Xilinx/arm-t](https://link.zhihu.com/?target=https%3A//github.com/Xilinx/arm-trusted-firmware)
- 9、 [trustedfirmware-a.readthedocs.io](https://link.zhihu.com/?target=https%3A//trustedfirmware-a.readthedocs.io/en/latest/)

> 本文使用 [Zhihu On VSCode](https://zhuanlan.zhihu.com/p/106057556) 创作并发布

还没有人送礼物，鼓励一下作者吧

发布于 2023-08-16 21:32・四川[企业落地智能体（Agent）痛点与解决方案](https://zhuanlan.zhihu.com/p/1986898543521318378)

[

AI智能体的概念不用多说，简单理解是由“大脑+手”组成，“大脑”不单单指大模型，但核心一定是大模型，可以理解成具备分析思...

](https://zhuanlan.zhihu.com/p/1986898543521318378)