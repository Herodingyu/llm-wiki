---
title: "SOC启动流程"
source: "https://zhuanlan.zhihu.com/p/656665645"
author:
  - "[[nomoexc]]"
published:
created: 2026-05-02
description: "目标：做个明白人 1. 芯片漫谈天下大事，必作于细; 天下难事，必作于易。 1.1 疑问：1）芯片的功耗怎么来的？（动态功耗-晶体管翻转，静态功耗-漏电功耗） 2）CPU的设计宗旨是能又好又快的干活，怎么设计才能达到…"
tags:
  - "clippings"
---
不坠青云之志 等 224 人赞同了该文章

目录

目标：做个明白人

## 1\. 芯片漫谈

天下大事，必作于细; 天下难事，必作于易。

### 1.1 疑问：

1）芯片的功耗怎么来的？（ [动态功耗](https://zhida.zhihu.com/search?content_id=234054408&content_type=Article&match_order=1&q=%E5%8A%A8%E6%80%81%E5%8A%9F%E8%80%97&zhida_source=entity) -晶体管翻转， [静态功耗](https://zhida.zhihu.com/search?content_id=234054408&content_type=Article&match_order=1&q=%E9%9D%99%E6%80%81%E5%8A%9F%E8%80%97&zhida_source=entity) -漏电功耗）

2）CPU的设计宗旨是能又好又快的干活，怎么设计才能达到这个目的？（算法，编译器，指令集，微结构设计-（ [流水线](https://zhida.zhihu.com/search?content_id=234054408&content_type=Article&match_order=1&q=%E6%B5%81%E6%B0%B4%E7%BA%BF&zhida_source=entity) 、 [多发射](https://zhida.zhihu.com/search?content_id=234054408&content_type=Article&match_order=1&q=%E5%A4%9A%E5%8F%91%E5%B0%84&zhida_source=entity) 等）， [主频](https://zhida.zhihu.com/search?content_id=234054408&content_type=Article&match_order=1&q=%E4%B8%BB%E9%A2%91&zhida_source=entity) -（受微结构、电路设计和工艺影响））

3）做上层开发为啥也要对CPU组织架构有了解?

### 1.2 芯片分解：

SOC->ALU等功能模块->逻辑门（与非门，或门等）->晶体管(PMOS/NMOS)

![](https://picx.zhimg.com/v2-bd6e3d1568ff17916c3ed7ca9b3478d9_1440w.jpg)

芯片、模块、逻辑门、晶体管和器件

CMOS，互补型金属氧化物半导体电路(Complementary Metal-Oxide-Semiconductor)，

### 1.3 CMOS晶体管组成：

![](https://pica.zhimg.com/v2-28ff8d2eeeea0af1d9d4cf6a8a369c10_1440w.jpg)

PMOS/NMOS

![](https://pic2.zhimg.com/v2-e473613afd5439f67d9edd0992269fa3_1440w.jpg)

CMOS反相器

![](https://pic1.zhimg.com/v2-01b89995066a202abc2a018686271d1e_1440w.jpg)

![](https://picx.zhimg.com/v2-e27d2c9579c593642867b60043096be7_1440w.jpg)

线宽

晶体管开关->输出0和1->对电容充放电->有功耗

线宽越小->工作电压越低，开关速度越快->运行频率越高->CPU性能越高

### 1.4 CPU性能：

- 提高频率（与线宽有关，线宽越细，频率上限越高），频率越高，时钟周期越短，每秒执行的指令数越多。
- 流水线（指令宽度，cache, MMU, TLB, 分支预测，乱序执行， 通过这些方法让流水线满负荷工作），将一条指令分成多个阶段执行，从而达到一个时钟完成一条指令。这也有利于提高CPU的主频。
![](https://pic3.zhimg.com/v2-a0969628eb8001d7d9f116be0c11378a_1440w.jpg)

- **超标量** ，本质上是多个执行单元同时工作，有多条指令流水线同时工作，是将一个任务中的指令并行执行。指令间的相关性会制约其性能发挥。
- **超线程** ，一个CPU核中，某些部件有多份，其他的部件共用。在操作系统看来会是像两个核在工作。能同时执行多个任务。
- **多核** ， 特定域架构(如SOC中集成NPU/GPU等)的推动因素：1）单个核的频率越来越高，导致功耗越来越高；2）线宽更细，线排列更密，增大了电阻和电容从而导致连线延迟增大，这时晶体管的开关速度已不是频率提高的制约；3）存储器的速度增加，远远落后于CPU的运算速度，带来数据访问的瓶颈。

**超标量与超线程的对比：**

![](https://pica.zhimg.com/v2-344eecbedca9b6adbdce7043e2b8da72_1440w.jpg)

### 1.5 SRAM与DRAM

- SRAM: 结构复杂，成本高，访问速度快，不需要动态刷新。 因此寄存器，cache, 都用SRAM
- DRAM: 结构简单，成本低， 访问速度慢，需要动态刷新。
![](https://pic1.zhimg.com/v2-57e953207467c752cd58c0e293d0c60c_1440w.jpg)

## 2\. SOC上电后

### 2.1 环境：

[Qemu virt](https://zhida.zhihu.com/search?content_id=234054408&content_type=Article&match_order=1&q=Qemu+virt&zhida_source=entity) ， [ARMv8](https://zhida.zhihu.com/search?content_id=234054408&content_type=Article&match_order=1&q=ARMv8&zhida_source=entity), [ATF-2.9.0](https://zhida.zhihu.com/search?content_id=234054408&content_type=Article&match_order=1&q=ATF-2.9.0&zhida_source=entity), [u-boot.2021.1](https://zhida.zhihu.com/search?content_id=234054408&content_type=Article&match_order=1&q=u-boot.2021.1&zhida_source=entity), linux

### 2.2 ARMv8特权级：

![](https://pica.zhimg.com/v2-04f6ba4ec14e4756ffd66bab0d6f7d8c_1440w.jpg)

### 2.3 总体启动流程：

BL1（bootrom）->BL2->BL31->BL32(optee)->BL33(u-boot)->linux->启动init进程->加载根文件系统->切换到用户态->执行根文件系统中的init程序（ [busybox](https://zhida.zhihu.com/search?content_id=234054408&content_type=Article&match_order=1&q=busybox&zhida_source=entity) /systemv/ [systemd](https://zhida.zhihu.com/search?content_id=234054408&content_type=Article&match_order=1&q=systemd&zhida_source=entity) / [androird](https://zhida.zhihu.com/search?content_id=234054408&content_type=Article&match_order=1&q=androird&zhida_source=entity) 下的init）->执行初始化脚本(busybox下的inittab， android下的init.rc)

### 2.4 BL1:

- 存储在ROM中，芯片出厂时固化在芯片中，无法更改。类似PC上的BIOS。它也是安全启动的信任根。
- 芯片上电后运行在EL3级别，所以BL1也是运行在EL3级别。
- BL1主要初始化EL3环境，执行平台相关初始化(如初始化串口，然后可以通过串口打输出log)，加载BL2，准备跳转到BL2的相关参数并最终通过ERET跳转到BL2的入口。调用ERET前会设置。

### 2.5 BL2:

- 运行在EL1级别，DDR暂未初始化，因此BL2运行在SRAM中
- 加载BL31, BL32, BL33到DDR
- 通过SMC调用，进入BL1。 BL2运行在 EL1, 而BL31运行在EL3, 从低级别进入高级别只能通过SMC调用，无法通过ERET实现。BL2的SMC调用在bl2/bl2\_main.c文件的bl2\_main函数中：
![](https://pic2.zhimg.com/v2-cc886fd6de167fe41717072a28ac0b1d_1440w.jpg)

- BL1异常处理中，会在函数smc\_handler64中根据BL2传入的参数，进入到BL31执行。
![](https://pic4.zhimg.com/v2-ba8cb96aebb4ffb59aa6d44490781903_1440w.jpg)

在ARMv8触发SMC异常后，硬件会将PSTATE寄存器保存到SPSR\_EL3，将异常处理完成后要返回的地址保存到ELR\_EL3, 然后调用 ERET返回时，会将SPSR\_EL3恢复到PSTATE, 将ELR\_EL3恢复到PC。但我们这里在异常返回时是希望进入BL31执行，所以在smc\_handler64的处理中，会把BL31的入口地址放到ELR\_EL3中，这样执行ERET时就能进入到BL31里执行了。

```
func smc_handler64

    /* ----------------------------------------------
     * Detect if this is a RUN_IMAGE or other SMC.
     * ----------------------------------------------
     */
    mov    x30, #BL1_SMC_RUN_IMAGE
    cmp    x30, x0
    b.ne    smc_handler    /*bl2_main中SMC调用传递的第一个参数是BL1_SMC_RUN_IMAGE, 所以这里不会跳转*/

    /* ------------------------------------------------
     * Make sure only Secure world reaches here.
     * ------------------------------------------------
     */
    mrs    x30, scr_el3
    tst    x30, #SCR_NS_BIT
    b.ne    unexpected_sync_exception

    /* ----------------------------------------------
     * Handling RUN_IMAGE SMC. First switch back to
     * SP_EL0 for the C runtime stack.
     * ----------------------------------------------
     */
    ldr    x30, [sp, #CTX_EL3STATE_OFFSET + CTX_RUNTIME_SP]
    msr    spsel, #MODE_SP_EL0
    mov    sp, x30

    /* ---------------------------------------------------------------------
     * Pass EL3 control to next BL image.
     * Here it expects X1 with the address of a entry_point_info_t
     * structure describing the next BL image entrypoint.
     * ---------------------------------------------------------------------
     */
    mov    x20, x1 /*SMC调用的第二个参数传递的下一image入口信息*/

    mov    x0, x20
    bl    bl1_print_next_bl_ep_info

    ldp    x0, x1, [x20, #ENTRY_POINT_INFO_PC_OFFSET]
    msr    elr_el3, x0 /*BL31的入口地址*/
    msr    spsr_el3, x1 /*BL31执行环境的程序状态寄存器，跳转到BL31时CPU会用该寄存器的值初始化BL31运行环境下的PSTATE寄存器。*/
    ubfx    x0, x1, #MODE_EL_SHIFT, #2
    cmp    x0, #MODE_EL3
    b.ne    unexpected_sync_exception

    bl    disable_mmu_icache_el3
    tlbi    alle3
    dsb    ish /* ERET implies ISB, so it is not needed here */

#if SPIN_ON_BL1_EXIT
    bl    print_debug_loop_message
debug_loop:
    b    debug_loop
#endif

    mov    x0, x20
    bl    bl1_plat_prepare_exit

    ldp    x6, x7, [x20, #(ENTRY_POINT_INFO_ARGS_OFFSET + 0x30)]
    ldp    x4, x5, [x20, #(ENTRY_POINT_INFO_ARGS_OFFSET + 0x20)]
    ldp    x2, x3, [x20, #(ENTRY_POINT_INFO_ARGS_OFFSET + 0x10)]
    ldp    x0, x1, [x20, #(ENTRY_POINT_INFO_ARGS_OFFSET + 0x0)]
    exception_return
endfunc smc_handler64

/*****************************************************************************
 * This structure represents the superset of information needed while
 * switching exception levels. The only two mechanisms to do so are
 * ERET & SMC. Security state is indicated using bit zero of header
 * attribute
 * NOTE: BL1 expects entrypoint followed by spsr at an offset from the start
 * of this structure defined by the macro \`ENTRY_POINT_INFO_PC_OFFSET\` while
 * processing SMC to jump to BL31.
 *****************************************************************************/
typedef struct entry_point_info {
    param_header_t h;
    uintptr_t pc;
    uint32_t spsr;
#ifdef __aarch64__
    aapcs64_params_t args;
#else
    uintptr_t lr_svc;
    aapcs32_params_t args;
#endif
} entry_point_info_t;
```

### 2.6 BL31:

BL31会初始化GICv3及runtime service(SMC调用的服务)，并进入BL33(u-boot)执行。

runtime\_svc.c->runtime\_svc\_init函数:

主要是初始化SMC调用时的处理函数，rt\_svc\_descs通过 DECLARE\_RT\_SVC声明，并链接到RT\_SVC\_DESCS\_START和RT\_SVC\_DESCS\_END范围内. 当前qemu平台上会有两个rt\_svc\_descs, 分别是arm\_arch\_svc和std\_svc。 分别在services/arm\_arch\_svc/arm\_arch\_svc\_setup.c 和services/std\_svc/std\_svc\_setup.c中声明

### 2.7 BL32(optee):

我们在qemu平台上没有支持trust os，所以没有进入BL32，这里略过。如果支持BL32, 则BL31通过ERET进入BL32, BL32完成初始化后通过SMC调用回到BL31然后BL31再进入BL33.

如果支持optee，我们会在BL31中执行一个opteed的runtime service, 如下：

![](https://pic4.zhimg.com/v2-e1a5de566c0c292a1dd9237e63f12bf7_1440w.jpg)

其中opteed\_setup函数会在上述runtime\_svc.c->runtime\_svc\_init函数中被调用，在opteed\_setup中会注册opteed\_init函数，如下

![](https://pic3.zhimg.com/v2-3a05e6f75746dd28373c185cdc753822_1440w.jpg)

![](https://pic1.zhimg.com/v2-b80808da5867e2c1c7e472b6d9e7a364_1440w.jpg)

该函数会在bl31\_main函数中调用：

![](https://picx.zhimg.com/v2-1ac419cce7c77139e4eb187a04ac0413_1440w.jpg)

最终通过如下流程进入optee OS：

opteed\_init->opteed\_init\_with\_entry\_point->opteed\_synchronous\_sp\_entry->opteed\_enter\_sp->el3\_exit

el3\_exit会退出EL3到EL1并根据el3\_elr进入optee os的入口执行。optee os的入口定义如下：

![](https://pica.zhimg.com/v2-f049c8a3a08c6a6a6e29797be65d55c2_1440w.jpg)

![](https://picx.zhimg.com/v2-f282989824de04f50d80afec2ef56a65_1440w.jpg)

整个初始化函数代码如下 [optee\_os](https://link.zhihu.com/?target=https%3A//github.com/OP-TEE/optee_os/tree/master) / [core](https://link.zhihu.com/?target=https%3A//github.com/OP-TEE/optee_os/tree/master/core) / [arch](https://link.zhihu.com/?target=https%3A//github.com/OP-TEE/optee_os/tree/master/core/arch) / [arm](https://link.zhihu.com/?target=https%3A//github.com/OP-TEE/optee_os/tree/master/core/arch/arm) / [kernel](https://link.zhihu.com/?target=https%3A//github.com/OP-TEE/optee_os/tree/master/core/arch/arm/kernel) /entry\_a64.S

```
FUNC _start , :
    /*
     * Temporary copy of boot argument registers, will be passed to
     * boot_save_args() further down.
     */
    mov    x19, x0
    mov    x20, x1
    mov    x21, x2
    mov    x22, x3

    adr    x0, reset_vect_table
    msr    vbar_el1, x0
    isb

........  //中间大量代码略去

#ifdef CFG_CORE_FFA
    adr    x0, cpu_on_handler
    /*
     * Compensate for the virtual map offset since cpu_on_handler() is
     * called with MMU off.
     */
    ldr    x1, boot_mmu_config + CORE_MMU_CONFIG_MAP_OFFSET
    sub    x0, x0, x1
    bl    thread_spmc_register_secondary_ep
    b    thread_ffa_msg_wait
#else
    /*
     * Pass the vector address returned from main_init Compensate for
     * the virtual map offset since cpu_on_handler() is called with MMU
     * off.
     */
    ldr    x0, boot_mmu_config + CORE_MMU_CONFIG_MAP_OFFSET
    adr    x1, thread_vector_table
    sub    x1, x1, x0
    mov    x0, #TEESMC_OPTEED_RETURN_ENTRY_DONE
    smc    #0
    /* SMC should not return */
    panic_at_smc_return
#endif
END_FUNC _start
```

在\_start函数结束时，会通过smc调用，返回到BL31，同时会将TEESMC\_OPTEED\_RETURN\_ENTRY\_DONE放在x0寄存器中传递下去。前面提到的注册opteed的runtime service中会注册一个smc的handler，如下：

该函数中会处理TEESMC\_OPTEED\_RETURN\_ENTRY\_DONE参数：

![](https://pic1.zhimg.com/v2-e559c57b24782e4047bb801f6c851300_1440w.jpg)

在这个参数处理中会通过如下流程返回到bl31\_main函数中:

opteed\_synchronous\_sp\_exit->opteed\_exit\_sp

opteed\_exit\_sp函数如下：

![](https://pic3.zhimg.com/v2-8a5a016c9331b9f2a905c00bc9da4e0a_1440w.jpg)

该函数恢复opteed\_enter\_sp函数中保存的一些寄存器，其中x30即lr寄存器中保存的是调用opteed\_enter\_sp时的返回地址，这样通过ret指令就能按如下顺序返回到bl31\_main函数中：

opteed\_exit\_sp->opteed\_synchronous\_sp\_entry->opteed\_init\_with\_entry\_point->opteed\_init->bl31\_main.

接下来在bl31\_main中继续执行bl31\_prepare\_next\_image\_entry进入bl33（uboot）

### 2.8 BL33（u-boot）:

u-boot比较复杂，支持的功能也很丰富。但主要任务还是为内核运行准备环境参数等。然后加载内核并跳转到内核入口执行。更多学习内容可阅读其自带的README文件：

![](https://pic2.zhimg.com/v2-591a45d21ba4616e27e2f630c069ee2d_1440w.jpg)

AARCH64 u-boot的入口函数是 \_start，代码位于arch/arm/cpu/armv8/start.S中，在该函数中会做如下处理：

- 保存启动参数
- 进行位置无关代码处理
- sctrl寄存器处理
- 不同异常等级的vbar寄存器设置
- slave cpu 进入低功耗
- 主CPU进入\_main函数

\_main函数代码位于arch/arm/lib/crt0\_64.S, 该函数会做如下处理：

- 设置初始的C运行时环境(主要是设置sp)
- 调用board\_init\_f\_alloc\_reserve为gd和early malloc分配内存
- 调用board\_init\_f\_init\_reserve初始化gd和设置early malloc的堆管理器基地址
- 调用board\_init\_f进行板级的一系列初始化
- 设置重定位代码后的返回地址（lr寄存器的值）
- 调用relocate\_code进行代码重定位。

其中board\_init\_f函数位于 common/board\_f.c，函数如下：

![](https://pic4.zhimg.com/v2-3411a86e82552755b5b2808abfa414c3_1440w.jpg)

这里会通过init\_sequence\_f这个列表调用大量的初始化函数。

![](https://picx.zhimg.com/v2-23f6ed880e59a7f3f8a954ee586c571d_1440w.jpg)

在setup\_dest\_addr函数中会设置重定位的目标地址，并在setup\_reloc中做调整

![](https://pica.zhimg.com/v2-32cbb97b97be375715c8140be8749b10_1440w.jpg)

![](https://pic2.zhimg.com/v2-b185af1628c11b65095d9a9a40db7d39_1440w.jpg)

relocate\_code的代码位于 arch/arm/lib/relocate\_64.S, 主要会做如下处理：

- 创建一个栈帧
- 根据运行地址，重定位目标地址确定是否要进行代码重定位
- 根据重定位目标地址地址及链接地址计算偏移
- 进行代码重定位 -> 进行.rela.dyn段处理
- 根据当前异常等级设置sctlr寄存器
- 清理cache
- 通过ret指令跳转的新的地址(relocation\_return)执行

relocation\_return位于arch/arm/lib/crt0\_64.S, 主要做如下处理：

- 设置完整C运行环境
- 清BSS段
- 调用 board\_init\_r函数

board\_init\_r函数位于common/board\_r.c, 如下：

![](https://pic3.zhimg.com/v2-04ca5acef57e5b23eadb4edcb0b59eb2_1440w.jpg)

同样会通过init\_sequence\_r这个函数列表调用一系列初始化操作。 初始化的最后会进入main\_loop:

![](https://pic3.zhimg.com/v2-f750f4d167ed78b451a6556ff86561aa_1440w.jpg)

![](https://pica.zhimg.com/v2-1b4649a268a4d44e17ffc556e76006e2_1440w.jpg)

main\_loop函数位于common/main.c：

![](https://picx.zhimg.com/v2-0cfdafbdefb86e8e7de9453f2f5f94fd_1440w.jpg)

### 2.9 Linux:

Linux内核的启动流程很大，主要有前半段的汇编和后半段进入start\_kernel后的C语言部分

汇编初始化的部分包括：启动参数保存，创建页表，初始化CPU状态，C运行时环境初始化（使能MMU，设置异常向量表、栈、BSS段等。 C环境未初始化前不能访问变量及栈，不能调用C函数），然后跳转到start\_kernel执行。

start\_kernel又会进行大量的linux环境初始化，在初始化的最后会创建0号init进程。该进程开始时运行于内核态，会加载根文件系统，根文件系统加载成功后，切换到用户态继续运行。

然后从根文件系统中加载init程序（init进程加载init程序代码并执行，是两个概念），并执行该程序中的代码。这个init程序也是运行在init进程中。常见的init程序有busybox/systemV/systemD, android用的是自己开发的init程序。

这个init程序启动后根据init脚本的配置，执行大量的任务。在android中会执行init.rc脚本以启动大量的服务。

### 2.10 xx6上的差异：

xx6无BL2, BL1是自研，BL31用的是ATF提供的。因其支持的功能较多，如安全启动，待机，空片升级等，其复杂度远大于本文件介绍的基于qemu的流程，这里不详细说明。不过它们主要的流程原理基本一样。

### 2.11 系统启动时的多核处理：

![](https://pic4.zhimg.com/v2-81ca266c00972ca565bfbb70c58efd57_1440w.jpg)

典型的多核Linux启动过程

### 2.12 开MMU时的流水线怎么保证：

arm64会采用流水线结构，在MMU开启时，开启MMU指令之后几条指令已经进入流水线，且也已经完成了取指或译码等操作。而在它们取指的时候还是MMU off的状态，因此其地址还是物理地址。

为解决这个问题，内核中的做法是将这段开启MMU相关的代码的物理地址映射为相同的虚拟地址。

编辑于 2026-02-10 11:08・安徽[数字IC设计，学完verilog语法，还需要学习什么？](https://www.zhihu.com/question/412273145/answer/2161825805)

[

由于现阶段数字IC设计的方向很多，主要的有：CPU设计，GPU设计，MCU设计，音视频编解码设计，接口设计，手机芯...

](https://www.zhihu.com/question/412273145/answer/2161825805)