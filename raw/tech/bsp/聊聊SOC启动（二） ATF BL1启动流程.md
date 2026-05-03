---
title: "聊聊SOC启动（二） ATF BL1启动流程"
source: "https://zhuanlan.zhihu.com/p/520039243"
author:
  - "[[lgjjeff]]"
published:
created: 2026-05-03
description: "本文基于以下软硬件假定： 架构：AARCH6464 软件：ATF V2.51 BL1启动流程 BL1是系统启动的第一阶段，其主要目的是初始化系统环境和启动第二阶段镜像BL2。话不多说，让我们通过下图看看其总体流程： 由上图可知，其…"
tags:
  - "clippings"
---
[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944)

33 人赞同了该文章

本文基于以下软硬件假定：  
架构：AARCH6464  
软件： [ATF V2.5](https://zhida.zhihu.com/search?content_id=203696211&content_type=Article&match_order=1&q=ATF+V2.5&zhida_source=entity)

## 1　BL1启动流程

　　BL1是系统启动的第一阶段，其主要目的是初始化系统环境和启动第二阶段镜像 [BL2](https://zhida.zhihu.com/search?content_id=203696211&content_type=Article&match_order=1&q=BL2&zhida_source=entity) 。话不多说，让我们通过下图看看其总体流程：

![](https://picx.zhimg.com/v2-09eeb1eb0f69d6d1b99dd0a808070265_1440w.jpg)

　　由上图可知，其入口函数为bl1\_entrypoint，它是由bl1/ bl1.ld.S通过ENTRY标号定义的：

```
OUTPUT_FORMAT(PLATFORM_LINKER_FORMAT)
OUTPUT_ARCH(PLATFORM_LINKER_ARCH)
ENTRY(bl1_entrypoint)
```

　　它先初始化EL3环境，执行平台相关的初始化流程，然后加载下一阶段镜像、为其准备合适的参数，最后跳转到下一阶段镜像入口处运行。由于bl1的流程比较简单，接下来我们直接进入各个环节的具体实现吧。

（1）el3\_entrypoint\_common  
　　该函数是所有在EL3下执行镜像共享的，如BL1和BL31都会通过该函数初始化系统状态。该函数主要初始化系统的初始状态，执行一些必要的fixup操作，以及初始化c运行时环境和设置运行时的栈指针，为后续代码跳转到c语言执行准备条件

（2）bl\_setup  
　　该函数主要执行一些平台相关的操作，如对于qemu平台会执行串口初始化、内存布局配置、MMU设置和data cache使能操作

（3）bl\_main  
　　该函数主要用于bl2镜像加载以及跳转前的准备流程，如获取镜像参数、加载镜像内容、安全启动验签、bl2镜像跳转准备以及world switch上下文初始化等

（4）el3\_exit  
　　该流程执行实际的上下文切换流程，包括保存当前EL3上下文以及跳转到bl2入口地址执行等。接下来我们将对以上流程进行更加详细的分析  
　　除了由硬件提供默认值的寄存器外，其它寄存器的值都处于不确定状态，因此在启动流程的初始阶段必须要先初始化这些寄存器，以将系统带到一个确定的运行状态。接下来需要设置cpu的异常处理程序和c运行时环境，为代码跳转到c语言做准备。最后，则需要加载BL2镜像，准备下一阶段启动所需的参数和跳转设置，并最终跳转到BL2的入口函数中执行。

## ２　el3\_entrypoint\_common流程分析

　　该宏由所有需要在EL3下执行的镜像共享，如BL1和BL31都会入口处调用该函数，只是传入的参数有所区别。其主要完成的功能如下：  
（1）初始化sctlr\_el3寄存器，以初始化系统控制参数  
（2）判断当前启动方式是冷启动还是热启动，并执行相应的处理  
（3） [pie](https://zhida.zhihu.com/search?content_id=203696211&content_type=Article&match_order=1&q=pie&zhida_source=entity) 相关的处理  
（4）设置异常向量表  
（5）特定cpu相关的reset处理  
（6）架构相关el3的初始化  
（7）冷启动时secondary cpu的处理  
（8）c运行环境初始化  
（9）初始化运行栈

### ２.1　sctlr\_el3初始化

其代码流程如下：

```
.if \_init_sctlr
        mov_imm    x0, (SCTLR_RESET_VAL & ~(SCTLR_EE_BIT | SCTLR_WXN_BIT \
                | SCTLR_SA_BIT | SCTLR_A_BIT | SCTLR_DSSBS_BIT))
        msr    sctlr_el3, x0
        isb
    .endif
```

（1）sctlr\_el3是EL3异常等级的控制寄存器，它控制了一些系统的重要行为，因此必须要在起始阶段就将其初始化到确定的状态  
（2）这里主要设置了系统大小端（SCTLR\_EE\_BIT）、禁用了对齐错误（SCTLR\_A\_BIT）和栈对齐错误（SCTLR\_SA\_BIT）检查，以及禁止可写内存的执行权限（SCTLR\_WXN\_BIT）等  
　　而其它的值都沿用SCTLR\_RESET\_VAL的定义

### ２.２　冷热启动处理

其代码如下：

```
.if \_warm_boot_mailbox
    bl    plat_get_my_entrypoint
    cbz    x0, do_cold_boot
    br    x0

do_cold_boot:
.endif
```

　　冷启动和热启动的最大区别就是冷启动需要执行完整的系统初始化流程，而热启动因为在启动前保存了相关状态，因此可以跳过这些阶段，从而加快启动速度。因此，这段代码就很好理解了，它先通过plat\_get\_my\_entrypoint从特定平台获取热启动地址，若地址获取成功，则直接跳转到该地址执行热启动流程。若地址获取失败，该函数会返回0，此时表明本次启动是冷启动，因此急需执行冷启动流程

### ２.３　pie处理

　　我们知道代码执行过程中可能需要跳转到某个位置，或者操作某个地址的数据，而在二进制代码中这些位置都需要通过地址来表示。因此，对于普通程序我们需要将其加载到与链接地址相同的位置执行，否则这些寻址操作就会失败。pie（地址无关可执行文件）就是为了解决该问题的，它的基本思路如下：  
（1）程序中的函数调用和数据读写，若其可以转换为相对寻址的，则将其用相对寻址方式替换绝对地址。如armv8的adr指令，通过pc + offset的方式寻址，即以pc值为基地址，以offset为偏移量，从而计算得到新的地址。当然，这种寻址方式有一定的限制，如跳转范围有限等

（2）若该地址不能转换为相对寻址，则将其放到一个独立的段global descriptor table（ [GDT](https://zhida.zhihu.com/search?content_id=203696211&content_type=Article&match_order=1&q=GDT&zhida_source=entity) ）中，并在镜像启动时通过实际加载地址调整这些地址值

因此，pie的实现需要编译和加载的共同配合完成，在构建时添加如下编译选项：  
（1）编译时添加选项-fpie  
（2）链接时添加选项-pie

在加载时需要对GDT表中的内容进行调整，这部分代码即是用于这一目的，其代码如下：

```
pie_fixup:
        ldr    x0, =pie_fixup
        and    x0, x0, #~(PAGE_SIZE_MASK)
        mov_imm    x1, \_pie_fixup_size
        add    x1, x1, x0
        bl    fixup_gdt_reloc
```

具体的重定位流程位于fixup\_gdt\_reloc函数中，各位可以自行分析

### ２.４　设置异常向量表

　　这部分代码比较简单，就是将bl1的异常向量表设置到el3的向量表基地址寄存器中，其代码如下：

```
adr    x0, \_exception_vectors
    msr    vbar_el3, x0
```

　　bl1异常向量表的定义位于bl1/aarch64/bl1\_exceptions.S，从该异常向量表的定义我们可看到bl1只支持SMC异常的处理，其它的异常都是不合法的

### ２.５　reset\_handler

　　该函数用于执行特定cpu相关的reset处理函数，这些处理函数在定义时会被放到一个特殊的段中，在执行reset\_handler函数时就从该段中查找操作函数的函数指针，并执行相应的回调函数。以 [cortex-a53](https://zhida.zhihu.com/search?content_id=203696211&content_type=Article&match_order=1&q=cortex-a53&zhida_source=entity) 为例，其cpu ops的定义流程如下：

```
lib/cpus/aarch64/cortex_a53.S：
declare_cpu_ops cortex_a53, CORTEX_A53_MIDR, \
    cortex_a53_reset_func, \
    cortex_a53_core_pwr_dwn, \
    cortex_a53_cluster_pwr_dwn

include/lib/cpus/aarch64/cpu_macros.S：
.macro declare_cpu_ops _name:req, _midr:req, _resetfunc:req, \
        _power_down_ops:vararg
        declare_cpu_ops_base \_name, \_midr, \_resetfunc, 0, 0, 0, \
            \_power_down_ops
.endm

include/lib/cpus/aarch64/cpu_macros.S：
.macro declare_cpu_ops_base _name:req, _midr:req, _resetfunc:req, \
                _extra1:req, _extra2:req, _e_handler:req, _power_down_ops:vararg
        .section cpu_ops, "a"
        .align 3
        .type cpu_ops_\_name, %object
        .quad \_midr
#if defined(IMAGE_AT_EL3)
        .quad \_resetfunc
#endif
        .quad \_extra1
        .quad \_extra2
        .quad \_e_handler
…
.endm
```

　　其中cpu\_ops段的地址定义在链接脚本头文件include/common/bl\_common.ld.h中，即其位于\_\_CPU\_OPS\_START\_\_到\_\_CPU\_OPS\_END\_\_之间。

```
#define CPU_OPS                                         \
        . = ALIGN(STRUCT_ALIGN);                       \
        __CPU_OPS_START__ = .;                          \
        KEEP(*(cpu_ops))                                  \
        __CPU_OPS_END__ = .;
```

　　reset\_handler的流程比较简单，就是查找\_\_CPU\_OPS\_START\_\_到\_\_CPU\_OPS\_END\_\_之间的cpu\_ops结构体，并调用其reset\_func回调函数，具体流程不再赘述。对于cortex-a53 平台，其reset函数定义如下，该流程主要是执行一些cpu相关的errata操作，以及使能SMP位（lib/cpus/aarch64/cortex\_a53.S）。

```
func cortex_a53_reset_func
        mov     x19, x30
        bl      cpu_get_rev_var
        mov     x18, x0
#if ERRATA_A53_826319
        mov     x0, x18
        bl      errata_a53_826319_wa
#endif
#if ERRATA_A53_836870
        mov     x0, x18
        bl      a53_disable_non_temporal_hint
#endif
#if ERRATA_A53_855873
        mov     x0, x18
        bl      errata_a53_855873_wa
#endif
        mrs     x0, CORTEX_A53_ECTLR_EL1
        orr     x0, x0, #CORTEX_A53_ECTLR_SMP_BIT
        msr     CORTEX_A53_ECTLR_EL1, x0
        isb
        ret     x19
endfunc cortex_a53_reset_func
```

### ２.６　架构相关el3的初始化

　　该流程主要执行一些系统寄存器相关的配置，以设置系统的状态。其aarch64架构流程如下（include/arch/aarch64/el3\_common\_macro.S）：

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

（2）secure寄存器相关设置，主要用于设置某些操作是否路由到EL3执行，如设置SCR\_EA\_BIT会将所有异常等级下的external abort和serror异常路由到EL3处理，清除SCR\_TWE\_BIT则不会使得低于EL3等级的WFE指令不会路由到EL3处理。其它位的含义基本类似，具体定义可查看armv8 spec

（3）它用于使能指针签名特性PAC。由于armv8虚拟地址没有完全使用，如对于48位虚拟地址，其高16位是空闲的，完全可以用于存储一些其它信息。因此arm支持了指针签名技术，它通过密钥和签名算法对指针进行签名，并将截断后的签名保存到虚拟地址的高位，在使用该指针时则对高签名进行验证，以确保其没有被篡改。它主要是用来保护栈中数据的安全性，防御ROP/JOP攻击。

（4）mdcr\_el3寄存器用于设置debug和performance monitor相关的功能

（5）用于设置performance monitor配置，如一些性能事件计数器的行为

（6）用于使能serror异常，此后bl1将能接收serror异常，并处理smc调用

（7）设置一些特定事件是否要陷入EL3

（8）设置DIT特性，若使能了DIT，则DIT相关的指令执行时间与数据不相关。由于侧信道攻击可以利用某些敏感指令（如加解密指令）执行时间、功耗等的不同，来推测出数据内容，因此猜测该功能是用于防止侧信道攻击的

### ２.７　secondary cpu的处理

　　由于启动代码不支持并发，因此在smp系统中只有一个cpu（primary cpu）执行启动流程，而其它cpu（secondary cpu）需要将自身设置为一个安全的状态，待primary cpu启动完成后再通过spintable或psci等方式来启动它们。其流程如下：

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

### ２.８　内存初始化

该函数执行平台相关的内存初始化函数platform\_mem\_init

### ２.９　c运行环境初始化

　　c语言运行需要依赖于bss段和栈，因此在跳转到c函数之前需要下设置它们。而且由于bl1的镜像一般被烧写在rom中，因此需要将其可写数据段从rom重定位到ram中。以下为其主要代码实现：

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

### ２.10　运行栈设置

　　C语言的函数调用返回地址，上层栈指针地址，局部变量以及参数传递都可能需要用到栈。本函数通过设置运行时栈指针为跳转到c语言执行做最后的准备，其代码如下：

```
msr    spsel, #0                                           （1）
        bl    plat_set_my_stack                   （2）
#if STACK_PROTECTOR_ENABLED
    .if \_init_c_runtime
    bl    update_stack_protector_canary               （3）
    .endif
#endif
```

（1）使用sp\_el0作为栈指针寄存器

（2）设置运行时栈，该函数会获取一个定义好的栈指针，并将其设置到当前栈指针寄存器sp中

（3）在栈顶设置一个canary值，用于检测栈溢出

## 3　bl\_setup流程分析

### ３.1　bl1\_early\_platform\_setup函数

　　以qemu平台的实现为例，其代码如下：

```
void bl1_early_platform_setup(void)
{
    qemu_console_init();                                   （1）
        bl1_tzram_layout.total_base = BL_RAM_BASE;             （2）
    bl1_tzram_layout.total_size = BL_RAM_SIZE;
}
```

（1）控制台初始化

（2）设置secure sram内存的地址范围

### ３.２　bl1\_plat\_arch\_setup函数

　　以qemu平台为例，其代码如下：

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

　　该函数用于为所有bl1需要访问的地址建立MMU页表，并且使能dcache。bl1中物理地址和虚拟地址映射的地址值是相等的，之所以要开启MMU主要是为了开启dcache，以加快后面BL2镜像加载的速度

## ４　bl\_main流程分析

### ４.1　bl1的架构设置

　　bl1的aarch64架构设置函数如下：

```
void bl1_arch_setup(void)
{
        write_scr_el3(read_scr_el3() | SCR_RW_BIT);
}
```

　　该函数的作用为将下一个异常等级的执行状态设置为aarch64

### ４.２　secure boot初始化

　　secure boot用于校验镜像的合法性，它通常需要一个包含镜像签名信息的镜像头。签名信息可在打包时完成，一般包括计算镜像的hash值，然后使用非对称算法（如RSA或ECDSA）对该hash值执行签名操作，并将签名信息保存到镜像头中。在系统启动时，需要校验该签名是否合法，若不合法表明镜像被破坏或被替换了，因此系统需要停止启动流程。

　　auth\_mod\_init函数用于初始化签名验证所需的模块，其代码如下：

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

### ４.３　bl1的平台初始化

　　qemu平台的初始化实现接口如下：

```
void bl1_platform_setup(void)
{
    plat_qemu_io_setup();
}
```

　　该函数用于初始化qemu可能使用的镜像加载驱动初始化

### ４.４　获取下一阶段镜像id

　　Bl1的下一阶段镜像通常为BL2，以下是通用的镜像id获取函数：

```
unsigned int bl1_plat_get_next_image_id(void)
{
        return BL2_IMAGE_ID;
}
```

### ４.５　bl2镜像加载

　　镜像加载流程包含了镜像从storage中的加载以及镜像合法性验签两部分，由于secure boot计划在后面专门花一篇文章来介绍，因此这里只介绍镜像的加载流程。其代码主要流程如下：

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
　　在atf中，镜像描述信息主要包含镜像id、镜像加载器使用的信息image\_info和镜像跳转时使用的信息ep\_info，其结构如下：

![](https://pic3.zhimg.com/v2-357e36a7b57d627760542f0380a2094e_1440w.jpg)

　　bl1\_plat\_get\_image\_desc用于获取bl2镜像的信息

（2）加载之前的处理  
　　它由平台函数bl1\_plat\_handle\_pre\_image\_load处理，qemu平台未对其做任何处理

（3）从storage中加载镜像  
　　它会根据先前获取到的bl2镜像描述信息，从storage中将镜像数据加载到给定地址上。qemu支持fip和semihosting类型的加载方式

（4）加载之后的处理  
　　它主要用于设置bl1向bl2传递的参数，上面结构体中的args即用于该目的，它一共包括8个参数，在bl1跳转到bl2之前会分别被设置到x0 – x7寄存器中。bl1只需通过x1寄存器向bl2传送其可用的secure内存region即可。以下为其代码主体流程：

```
image_desc = bl1_plat_get_image_desc(BL2_IMAGE_ID);
ep_info = &image_desc->ep_info;                                           （a）
bl1_secram_layout = bl1_plat_sec_mem_layout();                            （b）
bl2_secram_layout = (meminfo_t *) bl1_secram_layout->total_base;
bl1_calc_bl2_mem_layout(bl1_secram_layout, bl2_secram_layout);            （c）
ep_info->args.arg1 = (uintptr_t)bl2_secram_layout;                        （d）
```

a 获取bl2的ep信息  
b 获取bl1的secure内存region  
c 将总的内存减去bl1已使用的sram内存，作为bl2的可用内存  
d 将bl2的可用内存信息保存到参数传递信息中

### ４.６　下一阶段镜像启动准备流程

　　在atf中定义了一个异常等级切换相关的cpu context结构体，该结构体包含了切换时所需的所有的信息，如gp寄存器的值，el1、el2系统寄存器以及el3状态的值等。由于armv8包含secure和non secure两种安全状态，因此在el3中为这两种状态分别保留了一份独立的上下文信息，我们在执行上下文切换准备工作时，实际上就是填充对应security状态的结构体内容。以下是该结构体的定义：

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

　　bl1\_prepare\_next\_image的主要工作就是初始化primary cpu的cpu\_context上下文，并填充该结构体的相关信息，其主要流程如下：

```
desc = bl1_plat_get_image_desc(image_id);
next_bl_ep = &desc->ep_info;                                                              （1）
security_state = GET_SECURITY_STATE(next_bl_ep->h.attr);                                  （2）

if (cm_get_context(security_state) == NULL)
    cm_set_context(&bl1_cpu_context[security_state], security_state);                 （3）

if ((security_state != SECURE) && (el_implemented(2) != EL_IMPL_NONE)) {                  （4）
    mode = MODE_EL2;
}
next_bl_ep->spsr = (uint32_t)SPSR_64((uint64_t) mode,
    (uint64_t)MODE_SP_ELX, DISABLE_ALL_EXCEPTIONS);                                   （5）

bl1_plat_set_ep_info(image_id, next_bl_ep);
cm_init_my_context(next_bl_ep);                                                           （6）
cm_prepare_el3_exit(security_state);                                                      （7）
desc->state = IMAGE_STATE_EXECUTED;
```

（1）获取bl2的ep信息

（2）从bl2的ep信息中获取其security状态

（3）若context内存未分配，则为其分配内存

（4）默认的下一阶段镜像异常等级为其支持的最高等级，即若支持el2，则下一异常等级为EL2

（5）计算spsr的值，即异常等级为step 4计算的值，栈指针使用sp\_elx，关闭所有DAIF异常

（6）该函数为待切换异常等级初始化上下文，如scr\_el3，scr\_el3，pc，spsr以及参数传递寄存器x0 – x7的值

（7）将context中参数设置到实际的寄存器中

### ４.7　console\_flush函数

在退出bl1之前将串口中的数据全部刷新掉

## ５　el3\_exit流程分析

　　该函数执行实际的异常等级切换流程，包括设置scr\_el3，spsr\_el3，elr\_el3寄存器，以及执行eret指令跳转到elr\_el3设定的bl2入口函数处执行。其定义如下：

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

编辑于 2022-10-11 17:14[请问自学模拟ic可不可以就业？](https://www.zhihu.com/question/664530063/answer/118531964764)

[

不能先浅谈一下模拟IC设计方向的技能要求。模拟ic设计工程师需要根据芯片要求采用合适的电路结构，定义具体器件参数，然后通过EDA工具仿真，调整电路参数。所以模拟电路（包括放大器...

](https://www.zhihu.com/question/664530063/answer/118531964764)