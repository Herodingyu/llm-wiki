---
title: "ATF入门-3BL1启动流程分析"
source: "https://zhuanlan.zhihu.com/p/2025982946989851116"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "BL1涉及很多的底层技术，本篇总结了很多，但是总感觉还是冰山一角，只能勉强算入门。估计想成为高手需要对着英文寄存器手册和汇编代码，结合手头的工作，一遍一遍的分析才可以。BL1毕竟是一个单独的系统，一篇文章…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

5 人赞同了该文章

![](https://pic1.zhimg.com/v2-9975f1f6c4dba9407522814e94b7c21e_1440w.jpg)

**BL1** 涉及很多的 **底层技术** ，本篇总结了很多，但是总感觉还是 **冰山一角** ，只能勉强算入门。估计想成为高手需要对着 **英文寄存器手册** 和 **汇编代码** ，结合 **手头的工作** ， **一遍一遍的分析** 才可以。

BL1毕竟是一个单独的系统，一篇文章也只是介绍，一个好的方法就是一遍一遍的去看源码，发现不懂的 **问问AI或者查查手册** 。第一次学这个，也就是 **走马观花** 先感受下。毕竟太底层的技术，代码基本都汇编，估计只 **ARM芯片原厂** 自己用，其他人也不需要知道，也没太多资料去说明。

## 1\. BL1主要功能

![](https://pica.zhimg.com/v2-bf0162d45c7b6c92bcac8238971bc7a6_1440w.jpg)

BL1就是 **[bootrom](https://zhida.zhihu.com/search?content_id=272874444&content_type=Article&match_order=1&q=bootrom&zhida_source=entity)** ，bootrom的地址就是CPU **上电复位后执行的第一条指令** 地址，这个是写死的。

- BL1是系统启动的第一阶段，其主要目的是初始化CPU，设定 [异常向量](https://zhida.zhihu.com/search?content_id=272874444&content_type=Article&match_order=1&q=%E5%BC%82%E5%B8%B8%E5%90%91%E9%87%8F&zhida_source=entity) ，将bl2的image加载到安全RAM中，然后跳转到bl2中进行执行。
- bl2中将会去加载bl31和bl32以及bl33 完整的一个启动流程如下：
![](https://pica.zhimg.com/v2-2af34b63030f251abf6d805cbeddd938_1440w.jpg)

BL1位于ROM中，在 [EL3](https://zhida.zhihu.com/search?content_id=272874444&content_type=Article&match_order=1&q=EL3&zhida_source=entity) 下从reset vector处开始运行。BL1做的工作主要有：

- **决定启动路径** ：冷启动还是热启动。
- **架构初始化** ：异常向量、CPU复位处理函数配置、控制寄存器设置(SCRLR\_EL3/SCR\_EL3/CPTR\_EL3/DAIF)
- **平台初始化** ：使能 [Trusted Watchdog](https://zhida.zhihu.com/search?content_id=272874444&content_type=Article&match_order=1&q=Trusted+Watchdog&zhida_source=entity) 、初始化控制台、配置硬件一致性互联、配置 [MMU](https://zhida.zhihu.com/search?content_id=272874444&content_type=Article&match_order=1&q=MMU&zhida_source=entity) 、初始化相关存储设备。
- **固件更新处理**
- **BL2镜像加载和执行** ：
- BL1输出“Booting Trusted Firmware"。
- BL1加载BL2到SRAM；如果SRAM不够或者BL2镜像错误，输出“Failed to load BL2 firmware.”。
- BL1切换到Secure EL1并将执行权交给BL2.

## 2\. 代码分析

![](https://pic1.zhimg.com/v2-3220f4c648e9582486bffa0ed1d150b4_1440w.jpg)

## 2.1 BL1代码初探

![](https://pic4.zhimg.com/v2-486a9f2704ac2c462f6c55fdc2984567_1440w.jpg)

![](https://pic2.zhimg.com/v2-0b840d0f9ad8e2ad1868ad66bbcb587f_1440w.jpg)

上图是我们 **qemu运行的BL1代码的打印** ，那我们看代码从哪里执行，需要从链接文件里面找ENTRY，在bl1/ bl1.ld.S中。关于编译链接可以参考之前写的一个文章： [os内核入门-linux0.11编译介绍](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247483735%26idx%3D1%26sn%3Dd01ef5edabd95e70b8ec3551c07be260%26chksm%3Dfa528773cd250e65e9a62c9ea31f656804cb0540e349bb342bc13cb01aff98aef54a61e0d593%26scene%3D21%23wechat_redirect) 或者看看《 **程序员的自我修养** 》

```
OUTPUT_FORMAT(PLATFORM_LINKER_FORMAT)
OUTPUT_ARCH(PLATFORM_LINKER_ARCH)
ENTRY(bl1_entrypoint)
```

**bl1\_entrypoint** 是系统启动后首先执行的代码，当然其是用汇编写的，以aarch64为例，其定义在bl1/aarch64/bl1\_entrypoint.S中，

```
func bl1_entrypoint

    el3_entrypoint_common                    \
        _init_sctlr=1                    \
        _warm_boot_mailbox=!PROGRAMMABLE_RESET_ADDRESS    \
        _secondary_cold_boot=!COLD_BOOT_SINGLE_CPU    \
        _init_memory=1                    \
        _init_c_runtime=1                \
        _exception_vectors=bl1_exceptions        \
        _pie_fixup_size=0

    bl    bl1_setup

    bl    bl1_main

#if ENABLE_RME
    b    bl1_run_bl2_in_root
#else
    b    el3_exit

endfunc bl1_entrypoint
```
- **el3\_entrypoint\_common** ：该函数是所有在EL3下执行镜像共享的，如BL1和BL31都会通过该函数初始化系统状态。该函数主要初始化系统的初始状态，执行一些必要的fixup操作，以及初始化c运行时环境和设置运行时的栈指针，为后续代码跳转到c语言执行准备条件
- **bl1\_setup** ：该函数主要执行一些平台相关的操作，如对于qemu平台会执行串口初始化、内存布局配置、MMU设置和data cache使能操作
- **bl1\_main** ：该函数主要用于bl2镜像加载以及跳转前的准备流程，如获取镜像参数、加载镜像内容、安全启动验签、bl2镜像跳转准备以及world switch上下文初始化等
- **el3\_exit** ：该流程执行实际的上下文切换流程，包括保存当前EL3上下文以及跳转到bl2入口地址执行等

整体上：除了由硬件提供默认值的寄存器外，其它 **寄存器的值都处于不确定状态** ，因此在启动流程的初始阶段必须要先初始化这些寄存器，以将系统带到一个确定的运行状态。接下来需要设置 **cpu的异常处理程序和c运行时环境** ，为代码跳转到c语言做准备。最后，则需要加载BL2镜像，准备下一阶段启动所需的参数和跳转设置，并最终跳转到 **BL2的入口函数中执行** 。

## 2.2 el3\_entrypoint\_common

el3\_entrypoint\_common函数的实现是 **汇编语言** ，在include/arch/aarch64/el3\_common\_macros.S中定义，参数定义如下：

- **\_init\_sctlr** ：初始化异常等级的控制寄存器
- **\_warm\_boot\_mailbox** ：检查当前是属于冷启动还是热启动(power on or reset)
- **\_secondary\_cold\_boot**: 确定当前的CPU是主CPU还是从属CPU
- **\_init\_memory** ：是否需要初始化memory
- **\_init\_c\_runtime**: 是否需要初始化C语言的执行环境
- **\_exception\_vectors**: [异常向量表](https://zhida.zhihu.com/search?content_id=272874444&content_type=Article&match_order=1&q=%E5%BC%82%E5%B8%B8%E5%90%91%E9%87%8F%E8%A1%A8&zhida_source=entity) 地址

该宏由所有需要在EL3下执行的镜像共享，如 **BL1和BL31** 都会入口处调用该函数，只是传入的参数有所区别。其主要完成的功能如下：（1）初始化sctlr\_el3寄存器，以初始化系统控制参数（2）判断当前启动方式是冷启动还是热启动，并执行相应的处理（3）pie相关的处理（4）设置异常向量表（5）特定cpu相关的reset处理（6）架构相关el3的初始化（7）冷启动时secondary cpu的处理（8）c运行环境初始化（9）初始化运行栈

**el3\_entrypoint\_common** 的汇编的实现，代码非常的长，里面有很多详细的英文解释，用到了可以自己看看。这里找一下中断的说说。

```
.macro el3_entrypoint_common                    \
    _init_sctlr, _warm_boot_mailbox, _secondary_cold_boot,    \
    _init_memory, _init_c_runtime, _exception_vectors,    \
    _pie_fixup_size

.if \_init_sctlr //异常等级的控制寄存器设置
    
    .if \_warm_boot_mailbox //根据当前平台的entrypoint判断是冷启动还是热启动。
    bl    plat_get_my_entrypoint
    cbz    x0, do_cold_boot //0是冷启动，执行do_cold_boot。非零则跳转entrypoint执行
    br    x0

adr    x0, \_exception_vectors //初始化异常向量表
msr    vbar_el3, x0
isb
   
bl    reset_handler //冷启动时执行

el3_arch_init_common //架构相关的el3的初始化

.if \_secondary_cold_boot //判断是主CPU还是从CPU
    
.if \_init_memory //初始化内存
    bl    platform_mem_init

    bl plat_set_my_stack //设定堆栈
.if \_init_c_runtime //初始化C执行环境
```

### 2.2.1 EL3异常等级的控制寄存器

```
.if _init_sctlr
        mov_imm    x0, (SCTLR_RESET_VAL & ~(SCTLR_EE_BIT | SCTLR_WXN_BIT \
                | SCTLR_SA_BIT | SCTLR_A_BIT | SCTLR_DSSBS_BIT))
        msr    sctlr_el3, x0
        isb
    .endif
```

（1） **sctlr\_el3** 是EL3 **异常等级的控制寄存器** ，它控制了一些系统的重要行为，因此必须要在起始阶段就将其初始化到确定的状态（2）这里主要设置了系统大小端（SCTLR\_EE\_BIT）、禁用了对齐错误（SCTLR\_A\_BIT）和栈对齐错误（SCTLR\_SA\_BIT）检查，以及禁止可写内存的执行权限（SCTLR\_WXN\_BIT）等　　而其它的值都沿用SCTLR\_RESET\_VAL的定义

EL3异常等级的控制寄存器（ **SCTLR\_EL3** ）定义如下：

![](https://pic2.zhimg.com/v2-1744a69c3a39d46a1282b09a9c3f820f_1440w.jpg)

- M\[0\]：用于设置系统是否使能EL3下的MMU，若其为1使能MMU，否则禁止MMU；
- A\[1\]：用于设置是否使能El3下的对齐检查，若其为1使能对齐检查，否则进制对齐检查；
- C\[2\]：用于设置EL3下的数据cache，若其为1使能数据cache，否则禁止数据cache；
- I\[12\]：用于设置EL3下的指令cache，若其为1使能指令cache，否则禁止指令cache；
- WXN\[19\]：用于设置EL3下写权限内存是否不可执行，若其为1则含有写权限的内存不具有执行权限，否则没有副作用；
- EE\[25\]：用于设置EL3的大小端，若其为0数据为小端格式，否则为大端格式；

### 2.2.2 冷热启动

关于热启动和冷启动，热启动需要到 **entrypoint** 执行，这个entrypoint是上次运行赋值的，存在于一个 **内存地址** 里面。

**冷启动和热启动** 的最大区别就是冷启动需要执行完整的系统初始化流程，而热启动因为在启动前保存了相关状态，因此可以跳过这些阶段，从而加快启动速度。因此，这段代码就很好理解了，它先通过plat\_get\_my\_entrypoint从特定平台获取热启动地址，若地址获取成功，则直接跳转到该地址执行热启动流程。若地址获取失败，该函数会返回0，此时表明本次启动是冷启动，因此急需执行冷启动流程

![](https://pic4.zhimg.com/v2-bd6a68fecb729d1fa9a73e720260ba99_1440w.jpg)

### 2.2.3 pie处理

代码执行过程中可能需要 **跳转到某个位置** ，或者操作某个地址的数据，而在二进制代码中这些位置都需要通过地址来表示。因此，对于普通程序我们需要将其 **加载** 到与 **链接地址** 相同的位置执行，否则这些寻址操作就会失败。pie（地址无关可执行文件）就是为了解决该问题的，它的基本思路如下：  
（1）程序中的函数调用和数据读写，若其可以转换为相对寻址的，则将其用相对寻址方式替换绝对地址。如armv8的adr指令，通过 **pc + offset** 的方式寻址，即以pc值为基地址，以offset为偏移量，从而计算得到新的地址。当然，这种寻址方式有一定的限制，如跳转范围有限等

（2）若该地址不能转换为相对寻址，则将其放到一个独立的段 **global descriptor table** （GDT）中，并在镜像启动时通过实际加载地址调整这些地址值

因此，pie的实现需要编译和加载的共同配合完成，在构建时添加如下编译选项：  
（1）编译时添加选项 **\-fpie** （2）链接时添加选项-pie

在加载时需要对GDT表中的内容进行调整，这部分代码即是用于这一目的，其代码如下：

```
pie_fixup:
        ldr    x0, =pie_fixup
        and    x0, x0, #~(PAGE_SIZE_MASK)
        mov_imm    x1, _pie_fixup_size
        add    x1, x1, x0
        bl    fixup_gdt_reloc
```

具体的重定位流程位于fixup\_gdt\_reloc函数中，可以自行分析。

### 2.2.4 异常向量表

异常向量表bl1/aarch64/bl1\_exceptions.S中如下：

```
vector_base bl1_vector_table
    b    bl1_entrypoint
    b    report_exception    /* Undef */
    b    bl1_aarch32_smc_handler    /* SMC call */
    b    report_prefetch_abort    /* Prefetch abort */
    b    report_data_abort    /* Data abort */
    b    report_exception    /* Reserved */
    b    report_exception    /* IRQ */
    b    report_exception    /* FIQ */
```

里面BL1只支持SMC，其他都是非法的。

smc调用 **bl1\_aarch32\_smc\_handler** 在bl1/aarch32/bl1\_exceptions.S中定义

```
func bl1_aarch32_smc_handler
    /* On SMC entry, \`sp\` points to \`smc_ctx_t\`. Save \`lr\`. */
    str    lr, [sp, #SMC_CTX_LR_MON]

    mov    lr, #BL1_SMC_RUN_IMAGE //仅支持BL1_SMC_RUN_IMAGE SMC调用；其他调用触发report_exception。
    cmp    lr, r0
    bne    smc_handler

    ldcopr  r8, SCR
    tst    r8, #SCR_NS_BIT //如果处于非安全状态，则触发report_exception。
    blne    report_exception
...

    add    r8, r8, #ENTRY_POINT_INFO_ARGS_OFFSET
    ldm    r8, {r0, r1, r2, r3} //执行跳转到BL31
    exception_return
endfunc bl1_aarch32_smc_handler
```

上面的汇编代码里面有很详细的英文解释，可以自己翻译看看。

### 2.2.5 reset\_handler

**reset\_handler** 的流程就是查找\_\_CPU\_OPS\_START\_\_到\_\_CPU\_OPS\_END\_\_之间的 **cpu\_ops结构体** ，并调用其reset\_func回调函数，具体流程不再赘述。对于cortex-a53 平台，其reset函数定义如下，该流程主要是执行一些cpu相关的errata操作，以及使能SMP位（lib/cpus/aarch64/cortex\_a53.S）。

### 2.2.6 架构相关el3的初始化

该流程主要执行一些系统 **寄存器相关的配置** ，以设置系统的状态。其aarch64架构流程如下（include/arch/aarch64/el3\_common\_macro.S）：

```
.macro el3_arch_init_common
    mov    x1, #(SCTLR_I_BIT | SCTLR_A_BIT | SCTLR_SA_BIT)                           （1）
    mrs    x0, sctlr_el3
    orr    x0, x0, x1
    msr    sctlr_el3, x0
    isb

#ifdef IMAGE_BL31
    bl    init_cpu_data_ptr
#endif /* IMAGE_BL31 */
    mov_imm    x0, ((SCR_RESET_VAL | SCR_EA_BIT | SCR_SIF_BIT) \
            & ~(SCR_TWE_BIT | SCR_TWI_BIT | SCR_SMD_BIT))                      （2）
#if CTX_INCLUDE_PAUTH_REGS
    orr    x0, x0, #(SCR_API_BIT | SCR_APK_BIT)                                       （3）
#endif
    msr    scr_el3, x0
        mov_imm    x0, ((MDCR_EL3_RESET_VAL | MDCR_SDD_BIT | \
              MDCR_SPD32(MDCR_SPD32_DISABLE) | MDCR_SCCD_BIT | \
              MDCR_MCCD_BIT) & ~(MDCR_SPME_BIT | MDCR_TDOSA_BIT | \
              MDCR_TDA_BIT | MDCR_TPM_BIT))                                         （4）

    msr    mdcr_el3, x0
    mov_imm    x0, ((PMCR_EL0_RESET_VAL | PMCR_EL0_LP_BIT | \
              PMCR_EL0_LC_BIT | PMCR_EL0_DP_BIT) & \
            ~(PMCR_EL0_X_BIT | PMCR_EL0_D_BIT))                                     （5）

    msr    pmcr_el0, x0
        msr    daifclr, #DAIF_ABT_BIT                                              （6）
    mov_imm x0, (CPTR_EL3_RESET_VAL & ~(TCPAC_BIT | TTA_BIT | TFP_BIT))                 （7）         
    msr    cptr_el3, x0

    mrs    x0, id_aa64pfr0_el1
    ubfx    x0, x0, #ID_AA64PFR0_DIT_SHIFT, #ID_AA64PFR0_DIT_LENGTH                     （8）
    cmp    x0, #ID_AA64PFR0_DIT_SUPPORTED
    bne    1f
    mov    x0, #DIT_BIT
    msr    DIT, x0
1:
    .endm
```

（1）使能指令cache、对齐错误和栈对齐错误检查

（2）secure寄存器相关设置，主要用于设置某些操作是否路由到EL3执行，如设置SCR\_EA\_BIT会将所有异常等级下的external abort和 [serror异常](https://zhida.zhihu.com/search?content_id=272874444&content_type=Article&match_order=1&q=serror%E5%BC%82%E5%B8%B8&zhida_source=entity) 路由到EL3处理，清除SCR\_TWE\_BIT则不会使得低于EL3等级的WFE指令不会路由到EL3处理。其它位的含义基本类似，具体定义可查看armv8 spec

（3）它用于使能指针签名特性PAC。由于armv8虚拟地址没有完全使用，如对于48位虚拟地址，其高16位是空闲的，完全可以用于存储一些其它信息。因此arm支持了指针签名技术，它通过密钥和签名算法对指针进行签名，并将截断后的签名保存到虚拟地址的高位，在使用该指针时则对高签名进行验证，以确保其没有被篡改。它主要是用来保护栈中数据的安全性，防御ROP/JOP攻击。

（4）mdcr\_el3寄存器用于设置debug和performance monitor相关的功能

（5）用于设置performance monitor配置，如一些性能事件计数器的行为

（6）用于使能serror异常，此后bl1将能接收serror异常，并处理smc调用

（7）设置一些特定事件是否要陷入EL3

（8）设置DIT特性，若使能了DIT，则DIT相关的指令执行时间与数据不相关。由于侧信道攻击可以利用某些敏感指令（如加解密指令）执行时间、功耗等的不同，来推测出数据内容，因此猜测该功能是用于防止侧信道攻击的

**scr\_el3**:该寄存器用于 **设置secure相关的属性** ，且在其它异常等级下不存在bank值，而是用于控制全局状态的。因此在不同异常等级切换之前，需要先将该寄存器的值设置为目标异常等级所需的值，如从EL3切换到non secure EL1，则需要将其设置为non secure EL1相关的配置。寄存器的定义如下：

![](https://pic3.zhimg.com/v2-52209740e3df53154efd4a24e514f490_1440w.jpg)

- NS\[0\]：设置EL0 - EL2的secure状态，若其为0表示secure状态，为1表示non secure状态;
- IRQ\[1\]：用于设置irq中断路由，当其为1时，irq中断都被路由到EL3处理，当其为0时，若当前运行在EL3下irq中断不触发，否则irq中断路由到当前运行的异常等级，而不路由到EL3；
- FIQ\[2\]：用于设置fiq中断路由，当其为1时，fiq中断都被路由到EL3处理，当其为0时，若当前运行在EL3下fiq中断不触发，否则fiq中断路由到当前运行的异常等级，而不路由到EL3；
- EA\[3\]：用于设置外部abort和serror路由，当其为1时，外部abort和serror都被路由到EL3处理，当其为0时，若当前运行在EL3下serror不触发，外部abort路由到EL3，否则外部abort和seeror都路由到当前运行的异常等级，而不路由到EL3；
- SMD\[7\]：用于设置是否禁用smc异常，若其为1禁用smc，否则使能smc；
- HCE\[8\]：用于设置是否禁用hvc异常，若其为1使能hvc，否则禁用hvc；
- ST\[11\]：用于设置secure EL1是否将counter的 [secure timer寄存器](https://zhida.zhihu.com/search?content_id=272874444&content_type=Article&match_order=1&q=secure+timer%E5%AF%84%E5%AD%98%E5%99%A8&zhida_source=entity) 访问路由到EL3。若其为1，secure EL1访问counter的secure timer寄存器将会路由到EL3，否则该bit被忽略；
- TWI\[12\]：用于设置EL0 – EL2执行WFI时是否陷入EL3。若其为1则任何WFI操作都会陷入EL3，否则该bit被忽略；
- TWE\[13\]：用于设置EL0 – EL2执行WFE时是否陷入EL3。若其为1则任何WFE操作都会陷入EL3，否则该bit被忽略；

### 2.2.7 secondary cpu的处理

关于主CPU和从CPU，系统启动的时候 **在linux运行之前，都只运行一个主CPU** ，在linux中启动SMP后才启动从核。

所以启动代码ATF中不支持并发，因此在smp系统中只有一个cpu（primary cpu）执行启动流程，而其它cpu（secondary cpu）需要将自身设置为一个安全的状态，待primary cpu启动完成后再通过spintable或psci等方式来启动它们。其流程如下：

```
bl    plat_is_my_cpu_primary                                            （1）
        cbnz    w0, do_primary_cold_boot                （2）
            bl    plat_secondary_cold_boot_setup      （3）
        bl    el3_panic
    do_primary_cold_boot:
```

（1）当前cpu是否为primary cpu

（2）若其为primary cpu，继续执行cold boot流程

（3）若其为secondary cpu，执行平台定义的secondary cpu启动设置函数

### 2.2.8 内存初始化

该函数执行平台相关的内存初始化函数platform\_mem\_init

### 2.2.9 c运行环境初始化

c语言运行需要依赖于 **bss段和栈** ，因此在跳转到c函数之前需要下设置它们。而且由于bl1的镜像一般被烧写在rom中，因此需要将其可写数据段从rom重定位到ram中。以下为其主要代码实现：

```
adrp    x0, __RW_START__
        add    x0, x0, :lo12:__RW_START__                                    （1）
        adrp    x1, __RW_END__
        add    x1, x1, :lo12:__RW_END__
        sub    x1, x1, x0                                                    （2）
        bl    inv_dcache_range                                              （3）
        …
        adrp    x0, __BSS_START__
        add    x0, x0, :lo12:__BSS_START__
        adrp    x1, __BSS_END__
        add    x1, x1, :lo12:__BSS_END__
        sub    x1, x1, x0                                                                       
        bl    zeromem                                                        （4）
        …
#if defined(IMAGE_BL1) || (defined(IMAGE_BL2) && BL2_AT_EL3 && BL2_IN_XIP_MEM)
        adrp    x0, __DATA_RAM_START__
        add    x0, x0, :lo12:__DATA_RAM_START__                              
        adrp    x1, __DATA_ROM_START__
        add    x1, x1, :lo12:__DATA_ROM_START__                              
        adrp    x2, __DATA_RAM_END__
        add    x2, x2, :lo12:__DATA_RAM_END__                                
        sub    x2, x2, x0                                                       
        bl    memcpy16                                                        （5）
#endif
```

（1）计算数据段的起始地址，由于adrp指令加载的地址值会将低bit mask掉，使其4k对齐。因此需要加上其低12位的数据，以恢复其原始值

（2）计算该段地址的长度

（3）失效这段sram内存的dcache

（4）获取bss段的起止地址，并计算其长度，然后清零该段内存的数据

（5）获取bl1可读写数据段在rom中的地址，以及其将要被重定位的ram地址，计算数据长度，并执行重定位操作

### 2.2.10 运行栈设置

C语言的函数调用 **返回地址，上层栈指针地址，局部变量以及参数传递都可能需要用到栈** 。本函数通过设置运行时栈指针为跳转到c语言执行做最后的准备，其代码如下：

```
msr    spsel, #0                                           （1）
        bl    plat_set_my_stack                   （2）
#if STACK_PROTECTOR_ENABLED
    .if _init_c_runtime
    bl    update_stack_protector_canary               （3）
    .endif
#endif
```

（1）使用sp\_el0作为栈指针寄存器

（2）设置运行时栈，该函数会获取一个定义好的栈指针，并将其设置到当前栈指针寄存器sp中

（3）在栈顶设置一个canary值，用于检测栈溢出

## 2.3 bl1\_setup

```
void bl1_setup(void)
{
    /* Perform early platform-specific setup */
    bl1_early_platform_setup();

    /* Perform late platform-specific setup */
    bl1_plat_arch_setup();
```

**bl1\_early\_platform\_setup** ()该函数用来完成早期的初始化操作，主要包括memory, page table, 所需外围设备的初始化以及相关状态设定等；

```
void bl1_early_platform_setup(void)
{
    /* Initialize the console to provide early debug support */
    qemu_console_init();

    /* Allow BL1 to see the whole Trusted RAM */
    bl1_tzram_layout.total_base = BL_RAM_BASE;
    bl1_tzram_layout.total_size = BL_RAM_SIZE;
}
```

在qemu平台：

（1） **控制台初始化**

（2） **设置secure sram内存的地址范围**

bl1\_plat\_arch\_setup（）函数完成平台的初始化，以qemu平台为例，其代码如下：

```
void bl1_plat_arch_setup(void)
{
    QEMU_CONFIGURE_BL1_MMU(bl1_tzram_layout.total_base,
                bl1_tzram_layout.total_size,
                BL_CODE_BASE, BL1_CODE_END,
                BL1_RO_DATA_BASE, BL1_RO_DATA_END,
                BL_COHERENT_RAM_BASE, BL_COHERENT_RAM_END);
}
```

该函数用于为所有bl1需要访问的地址 **建立MMU页表** ，并且 **使能dcache** 。bl1中物理地址和虚拟地址映射的地址值是相等的，之所以要开启MMU主要是为了开启dcache，以加快后面BL2镜像加载的速度

## 2.4 bl1\_main

完成 **架构和平台特有初始化操作** ，然后 **加载BL2镜像并跳转执行** 。这个函数里面开始有了打印。

```
void bl1_main(void)
{
    /* Announce our arrival */
    NOTICE(FIRMWARE_WELCOME_STR);
    NOTICE("hello BL1: %s\n", version_string);
    NOTICE("BL1: %s\n", build_message);
    INFO("BL1: RAM %p - %p\n", (void *)BL1_RAM_BASE, (void *)BL1_RAM_LIMIT);

    bl1_arch_setup(); //设置下一个image的EL级别为aarch64
    crypto_mod_init();
    auth_mod_init(); //初始化安全模块和镜像解析模块

    bl1_plat_mboot_init();
    bl1_platform_setup();

    image_id = bl1_plat_get_next_image_id(); //获取下一级启动镜像的ID。

    if (image_id == BL2_IMAGE_ID)
        bl1_load_bl2(); //将BL2镜像加载到SRAM中
    else
        NOTICE("BL1-FWU: *******FWU Process Started*******\n");

    bl1_plat_mboot_finish();

    bl1_prepare_next_image(image_id); //获取bl2 image的描述信息，包括名字，ID，entry potin info等，并将这些信息保存到bl1_cpu_context的上下文中，为进入下一级镜像执行准备好上下文。

    console_flush(); //在退出bl1之前将串口中的数据全部刷新掉
}
```

### 2.4.1 secure boot初始化

secure boot用于 **校验镜像的合法性** ，它通常需要一个包含镜像签名信息的镜像头。签名信息可在打包时完成，一般包括计算镜像的hash值，然后使用非对称算法 **（如RSA或ECDSA）** 对该hash值执行签名操作，并将签名信息保存到镜像头中。在系统启动时，需要校验该签名是否合法，若不合法表明镜像被破坏或被替换了，因此系统需要停止启动流程。

**auth\_mod\_init** 函数用于初始化签名验证所需的模块，其代码如下：

```
void auth_mod_init(void)
{
    assert(cot_desc_ptr != NULL);
    crypto_mod_init();                       （1）
    img_parser_init();                        （2）
}
```

（1）初始化签名验证所需的密码库

（2）初始化获取镜像签名信息模块

### 2.4.2 bl1的平台初始化

qemu平台的初始化实现接口如下：

```
void bl1_platform_setup(void)
{
    plat_qemu_io_setup();
}
```

该函数用于初始化qemu可能使用的镜像加载驱动初始化

### 2.4.3 bl2镜像加载

bl1\_load\_bl2是 **镜像加载流程**

```
desc = bl1_plat_get_image_desc(BL2_IMAGE_ID);                                           （1）
info = &desc->image_info;
err = bl1_plat_handle_pre_image_load(BL2_IMAGE_ID);                                     （2）
if (err != 0) {
    ERROR("Failure in pre image load handling of BL2 (%d)\n", err);
    plat_error_handler(err);
}
err = load_auth_image(BL2_IMAGE_ID, info);                                              （3）
if (err != 0) {
    ERROR("Failed to load BL2 firmware.\n");
    plat_error_handler(err);
}
    err = bl1_plat_handle_post_image_load(BL2_IMAGE_ID);                            （4）
if (err != 0) {
    ERROR("Failure in post image load handling of BL2 (%d)\n", err);
    plat_error_handler(err);
}
```

它主要包含以下几部分内容：  
（1）获取待加载镜像描述信息  
在atf中，镜像描述信息主要包含 **镜像id、镜像加载器使用的信息image\_info和镜像跳转时使用的信息ep\_info** ，其结构如下：

![](https://pic2.zhimg.com/v2-dd7f16ef6c839de533115d8af5ad22cb_1440w.jpg)

bl1\_plat\_get\_image\_desc用于获取bl2镜像的信息

（2）加载之前的处理　　它由平台函数bl1\_plat\_handle\_pre\_image\_load处理，qemu平台未对其做任何处理

（3）从storage中加载镜像load\_auth\_image　　

它会根据先前获取到的bl2镜像描述信息，从storage中将镜像数据加载到给定地址上。qemu支持fip和semihosting类型的加载方式。具体的函数执行qemu平台下校验流程为：load\_auth\_image--》load\_auth\_image\_internal--》load\_image--》io\_dev\_init--》fip\_dev\_init

- plat\_get\_image\_source(image\_id, &backend\_dev\_handle,
- &backend\_image\_spec);
- io\_open(backend\_dev\_handle, backend\_image\_spec,
- &backend\_handle);
- io\_read(backend\_handle, (uintptr\_t)&header, sizeof(header),
- &bytes\_read);
- is\_valid\_header(&header)

（4）加载之后的处理　　它主要用于设置bl1向bl2传递的参数，上面结构体中的args即用于该目的，它一共包括8个参数，在bl1跳转到bl2之前会分别被设置到x0 – x7寄存器中。bl1只需通过x1寄存器向bl2传送其可用的secure内存region即可。以下为其代码主体流程：

```
image_desc = bl1_plat_get_image_desc(BL2_IMAGE_ID);
ep_info = &image_desc->ep_info;                                           （a）
bl1_secram_layout = bl1_plat_sec_mem_layout();                            （b）
bl2_secram_layout = (meminfo_t *) bl1_secram_layout->total_base;
bl1_calc_bl2_mem_layout(bl1_secram_layout, bl2_secram_layout);            （c）
ep_info->args.arg1 = (uintptr_t)bl2_secram_layout;                        （d）
```

a 获取bl2的ep信息b 获取bl1的secure内存regionc 将总的内存减去bl1已使用的sram内存，作为bl2的可用内存d 将bl2的可用内存信息保存到参数传递信息中

BL1在SoC芯片内部，BL2一般打包到了 **fip.bin** 中，并放入了 **eMMC** 中存储。

### 2.4.4 下一阶段镜像启动准备流程

BL2的image\_id的定义如下，由bl1\_plat\_get\_next\_image\_id（）函数获取

```
/* Trusted Boot Firmware BL2 */
#define BL2_IMAGE_ID            U(1)
```

**bl1\_prepare\_next\_image** （）bl1\_prepare\_next\_image的主要工作就是初始化 **primary cpu的cpu\_context上下文** ，并填充该结构体的相关信息，cpu的cpu\_context上下文如下：

```
typedef struct cpu_context {
    gp_regs_t gpregs_ctx;
    el3_state_t el3state_ctx;
    el1_sysregs_t el1_sysregs_ctx;
#if CTX_INCLUDE_EL2_REGS
    el2_sysregs_t el2_sysregs_ctx;
#endif
#if CTX_INCLUDE_FPREGS
    fp_regs_t fpregs_ctx;
#endif
    cve_2018_3639_t cve_2018_3639_ctx;
#if CTX_INCLUDE_PAUTH_REGS
    pauth_t pauth_ctx;
#endif
} cpu_context_t;
```

在atf中定义了一个异常等级切换相关的 **cpu context结构体** ，该结构体包含了切换时所需的所有的信息，如gp寄存器的值，el1、el2系统寄存器以及el3状态的值等。由于armv8包含secure和non secure两种安全状态，因此在el3中为这两种状态分别保留了一份独立的上下文信息，我们在执行上下文切换准备工作时，实际上就是填充对应security状态的结构体内容。

```
void bl1_prepare_next_image(unsigned int image_id)
{
    unsigned int security_state, mode = MODE32_svc;
    image_desc_t *desc;
    entry_point_info_t *next_bl_ep;

    /* Get the image descriptor. */
    desc = bl1_plat_get_image_desc(image_id);//获取镜像描述信息，包括入口地址、名字等等。

    /* Get the entry point info. */
    next_bl_ep = &desc->ep_info;

    /* Get the image security state. */
    security_state = GET_SECURITY_STATE(next_bl_ep->h.attr);//镜像是属于安全还是非安全镜像

    /* Prepare the SPSR for the next BL image. */
    if ((security_state != SECURE) && (GET_VIRT_EXT(read_id_pfr1()) != 0U)) {
        mode = MODE32_hyp;
    }

    next_bl_ep->spsr = SPSR_MODE32(mode, SPSR_T_ARM,
                SPSR_E_LITTLE, DISABLE_ALL_EXCEPTIONS);

    /* Allow platform to make change */
    bl1_plat_set_ep_info(image_id, next_bl_ep);

    /* Prepare the cpu context for the next BL image. */
    cm_init_my_context(next_bl_ep); /* 使用获取到的bl2 image的entrypoint info数据来初始化cpu context */
    cm_prepare_el3_exit(security_state); //为运行下一个镜像，EL3做好准备。
    cm_set_next_context(cm_get_context(security_state));

    /* Prepare the smc context for the next BL image. */
    smc_set_next_ctx(security_state);
    copy_cpu_ctx_to_smc_ctx(get_regs_ctx(cm_get_next_context()),
        smc_get_next_ctx());

    flush_smc_and_cpu_ctx();

    /* Indicate that image is in execution state. */
    desc->state = IMAGE_STATE_EXECUTED;

    print_entry_point_info(next_bl_ep);//打印下一级BL2的入口相关信息。下面即将el3_exit，退出EL3进入新的进项运行。
}
```

（1）获取bl2的ep信息

（2）从bl2的ep信息中获取其security状态

（3）若context内存未分配，则为其分配内存

（4）默认的下一阶段镜像异常等级为其支持的最高等级，即若支持el2，则下一异常等级为EL2

（5）计算spsr的值，即异常等级为step 4计算的值，栈指针使用sp\_elx，关闭所有DAIF异常

（6）该函数为待切换异常等级初始化上下文，如scr\_el3，scr\_el3，pc，spsr以及参数传递寄存器x0 – x7的值

（7）将context中参数设置到实际的寄存器中

## 2.5 el3\_exit流程分析

该函数执行实际的 **异常等级切换流程** ，包括设置scr\_el3，spsr\_el3，elr\_el3寄存器，以及执行eret指令跳转到elr\_el3设定的bl2入口函数处执行。其定义如下：

```
func el3_exit
    mov    x17, sp                                                                    （1）
    msr    spsel, #MODE_SP_ELX                                                        （2）
    str    x17, [sp, #CTX_EL3STATE_OFFSET + CTX_RUNTIME_SP]                           （3）

    ldr    x18, [sp, #CTX_EL3STATE_OFFSET + CTX_SCR_EL3]
    ldp    x16, x17, [sp, #CTX_EL3STATE_OFFSET + CTX_SPSR_EL3]                         （4）
    msr    scr_el3, x18
    msr    spsr_el3, x16
    msr    elr_el3, x17                                                                （5）

#if IMAGE_BL31
    ldp    x19, x20, [sp, #CTX_EL3STATE_OFFSET + CTX_CPTR_EL3]
    msr    cptr_el3, x19

    ands    x19, x19, #CPTR_EZ_BIT
    beq    sve_not_enabled

    isb
    msr    S3_6_C1_C2_0, x20 /* zcr_el3 */
sve_not_enabled:
#endif

#if IMAGE_BL31 && DYNAMIC_WORKAROUND_CVE_2018_3639
    ldr    x17, [sp, #CTX_CVE_2018_3639_OFFSET + CTX_CVE_2018_3639_DISABLE]
    cbz    x17, 1f
    blr    x17
1:
#endif
    restore_ptw_el1_sys_regs

    bl    restore_gp_pmcr_pauth_regs                                                   （6）
    ldr    x30, [sp, #CTX_GPREGS_OFFSET + CTX_GPREG_LR]

#if IMAGE_BL31 && RAS_EXTENSION
    esb
#else
    dsb    sy
#endif
#ifdef IMAGE_BL31
    str    xzr, [sp, #CTX_EL3STATE_OFFSET + CTX_IS_IN_EL3]
#endif
    exception_return                                                                      （7）
endfunc el3_exit
```

（1）将sp\_el0栈指针暂存到x17寄存器中

（2）将栈指针切换到sp\_el3，其中sp\_el3指向前面context的el3state\_ctx指针，即它被用于保存el3的上下文

（3）将sp\_el0的值保存的el3 context中

（4）从el3 context中加载scr\_el3、spsr\_el3和elr\_el3寄存器的值

（5）设置scr\_el3、spsr\_el3和elr\_el3寄存器

（6）恢复gp寄存器等寄存器的值

（7）执行eret指令，此后cpu将离开bl1跳转到bl2的入口处执行了

- eret指令会触发异常，会跳转到 **elr\_el3** 寄存器地址执行
- **SPSR** 寄存器的值就是跳转之后处理器的状态

## 参考：

- [zhuanlan.zhihu.com/p/52](https://zhuanlan.zhihu.com/p/520039243)
- [blog.csdn.net/shuaifeng](https://link.zhihu.com/?target=https%3A//blog.csdn.net/shuaifengyun/article/details/72468962)
- [cnblogs.com/arnoldlu/p/](https://link.zhihu.com/?target=https%3A//www.cnblogs.com/arnoldlu/p/14175126.html)

> 后记：  
> ATF底层代码的英文注释很丰富，有时候只看代码不去调试，其实还是一知半解的。可能看一遍只能 **走马观花** ，然后多看几遍，自己写一个笔记梳理下函数执行流程和功能，或者直接画一个图，让这个知识内化成自己的。  
> 文中有一些很难的知识，涉及到汇编和ARM的东西，笔者也是一知半解，但是可以从两个方法提高： **1.编译链接寻址的一些知识2.ARM的一些寄存器知识**  
> 人很多时候会 **忘记** 自己学会的很多东西，特别是技术方面的。最近有个笑话说：高考后的 **考生大睡3天，这3天是大脑在进行格式化，把学到的知识都还给学校** ，然后什么文韬武略都不记得了。我们的大脑很复杂，但是每个人的大脑中的知识又差异巨大，一些东西从大脑里面 **匆匆而过** ，可能没那么重要而让人忘记了，但是下一次再去学习就会发现学的很快了。可见大脑里面还是留下了一些重要的东西，只是需要一个东西去 **辅助激发** 。这个辅助工具就是我们的 **知识梳理** ：可以忘记，但是要用最快的速度再捡起来。俗称： **能力强，脑瓜子好使** 。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-04-10 17:07・上海[PMP与ACP的区别是什么？](https://www.zhihu.com/question/331059454/answer/3261178135)

[

先考PMP会好一点。原因：PMP作为ACP的跳板拿到PMP证书后，你会发现考ACP的难度相对会小很多。这是因为PM...

](https://www.zhihu.com/question/331059454/answer/3261178135)