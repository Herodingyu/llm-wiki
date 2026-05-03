---
title: "聊聊SOC启动（五） uboot启动流程一"
source: "https://zhuanlan.zhihu.com/p/520060653"
author:
  - "[[lgjjeff]]"
published:
created: 2026-05-03
description: "本文基于以下软硬件假定： 架构：AARCH64 软件：Uboot 2021.10-rc1 1 Uboot总体流程 回顾下我们前面介绍的atf，其基本启动流程为：BL1 – BL2 – BL31 – BL32 – BL33（uboot），即在bl32启动完成后再启动uboot，…"
tags:
  - "clippings"
---
[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944)

43 人赞同了该文章

本文基于以下软硬件假定：

架构：AARCH64

软件： [Uboot](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=Uboot&zhida_source=entity) 2021.10-rc1

## 1　Uboot总体流程

　　回顾下我们前面介绍的 [atf](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=atf&zhida_source=entity) ，其基本启动流程为： [BL1](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=BL1&zhida_source=entity) – [BL2](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=BL2&zhida_source=entity) – [BL31](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=BL31&zhida_source=entity) – [BL32](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=BL32&zhida_source=entity) – [BL33](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=BL33&zhida_source=entity) （uboot），即在bl32启动完成后再启动uboot，uboot作为启动链中作为最后一级镜像，用于启动最终的os。Atf是arm为了增强系统安全性引入，只支持armv7和 [armv8](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=armv8&zhida_source=entity) 架构的可信固件。而uboot是通用的嵌入式系统引导程序，其可以支持包含arm在内的多种处理器架构，如mips、riscv、powerpc以及x86等，且其历史比atf更加久远。因此默认情况下uboot并不需要与atf共同启动，而其自身就被设计为支持完整的多级启动链，该启动链被设计为最多可包含 [spl](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=spl&zhida_source=entity) 、 [tpl](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=tpl&zhida_source=entity) 和uboot三个阶段。接下来我们通过一些典型启动流程，来看下这些阶段的一些组合关系吧

### １.1　不带atf启动

　　spl被称为secondary program loader，在启动链中一般由bootrom加载而作为第二级启动镜像（bl2），它主要用于完成一些基础模块和ddr的初始化，以及加载下一级镜像uboot。由于spl需要被加载到sram中执行，对于有些sram size比较小的系统，可能无法放入整个spl镜像，tpl即是为了解决该问题引入的。加入了tpl之后，可将spl的功能进一步划分为两部分，如spl包含ddr初始化相关代码，而tpl包含镜像加载相关驱动，从而减少spl镜像的size。此时启动流程可被设计为如下方式：  
bootrom --> spl（init ddr） --> bootrom --> tpl（load and run uboot）--> uboot

　　其示意图如下：

![](https://pic2.zhimg.com/v2-9ee0c9ef3adefce104515225177b8d83_1440w.jpg)

　　在此流程中，spl主要完成ddr初始化，由于其不带有镜像加载相关的驱动，因此执行完成后需要跳转回bootrom，由bootrom完成tpl的加载（类似atf中bl2加载完成后跳转回bl1），并由tpl完成最终uboot的加载。由于tpl的主体流程与spl几乎相同，且大多数系统并不需要tpl，故接下来我们的讨论将主要围绕spl和uboot这两个阶段

　　若不需要支持tpl，则uboot的典型启动流程可精简为如下方式（这也是uboot最常见的运行方式）：

![](https://pic2.zhimg.com/v2-c02324c3b86e040e2b91a01e6edbab2f_1440w.jpg)

　　当然，对于有些启动速度要求较高的场景，还可以进一步简化其启动流程。如可将其设计为下面这种跳过uboot，直接通过spl启动操作系统的方式，此时其启动流程如下：

![](https://pic3.zhimg.com/v2-2e53980a8627c9c44924c648e9c03abe_1440w.jpg)

### １.2　Atf与uboot组合方式启动

　　若系统需要支持secure和non secure两种执行状态，则必须要从secure空间开始启动，且启动完成后需要通过 [secure monitor](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=secure+monitor&zhida_source=entity) （bl31）完成normal os对secure空间服务相关请求的处理。 这时atf将非常方便地帮助我们达成这一目的，这也是第一篇中我们已经介绍过的启动方式，以下我们重新贴一下其加载和启动流程图：  
（1）atf启动uboot的典型镜像加载流程

![](https://pic3.zhimg.com/v2-2773a88b31737ca4ccf550603bc768ce_1440w.jpg)

（2）atf启动uboot的典型镜像跳转流程

![](https://pic4.zhimg.com/v2-6718c261f7c742ccc9efed936a337fe9_1440w.jpg)

　　在以上流程中bl32是可选的，若不支持trust os则可裁剪掉该流程。典型情况下bl33为uboot，而bl2既可以使用atf实现，也可以用spl代替

## ２　uboot初始化

　　除了一些通过编译选项区分的部分，以及board\_init\_f和board\_init\_r函数的具体实现以外，uboot与spl的初始化流程完全相同。spl初始化流程在另一篇文章<spl启动分析>中已经做了较详细的介绍，其链接如下：

[lgjjeff：聊聊SOC启动（七） SPL启动分析](https://zhuanlan.zhihu.com/p/520189611)

　　故文本将主要介绍uboot特有部分的内容，其它代码只做简要分析。按照惯例，我们还是先给出uboot的初始化流程图：

![](https://pic1.zhimg.com/v2-0f35d83de670823a2b2cf151fd501d9a_1440w.jpg)

　　该流程主要包含了以下部分：  
（1）save\_boot\_params保存上一级镜像传入的参数，该函数由平台自行定义

（2）若支持pie则检查代码段是否为4k对齐（因为由于指令集中操作数长度的限制，adr等类型指令的寻址范围是需要4k对齐的）

（3）pie\_fixup为pie重定位全局地址相关的.rela.dyn段内容

（4）reset\_sctrl根据配置确定是否重设sctlr寄存器

（5）为uboot设置 [异常向量表](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=%E5%BC%82%E5%B8%B8%E5%90%91%E9%87%8F%E8%A1%A8&zhida_source=entity) 。spl和uboot异常向量表设置有以下不同：

　　a spl在设置了配置选项CONFIG\_ARMV8\_SPL\_EXCEPTION\_VECTORS，则会为其设置异常向量表，否则不为其设置异常向量表  
　　b uboot默认情况就会设置异常向量表

　　armv8的异常向量表格式如下：

![](https://pic3.zhimg.com/v2-8cdce26b8aeaa70ab6e216ba24d66002_1440w.jpg)

　　即根据中断触发时cpu正在运行的异常等级、使用的栈寄存器类型以及运行状态，armv8会跳转到不同的中断向量。由于spl和uboot在启动流程中不会执行比当前更低异常等级的代码，因此只需要实现当前异常等级下的8个异常向量即可。其对应的向量表定义在arch/arm/cpu/armv8/exceptions.S中。

　　由于根据不同的配置，spl或uboot可运行在el1 – el3异常等级下，因此需要根据当前实际的异常等级来选择异常向量表基地址寄存器

（6）若配置了COUNTER\_FREQUENCY选项，则根据当前正在运行的异常等级，确定是否要设置cpu的system counter的频率。由于system counter的频率是所有异常等级共享的，为了确保该频率不被随意修改，因此约定只有运行于最高异常等级时才允许修改该寄存器

（7）若设置了配置选项CONFIG\_ARMV8\_SET\_SMPEN，则设置S3\_1\_c15\_c2\_1以使能cpu之间的数据一致性

（8）apply\_core\_errata用于处理cpu的errata

（9）lowlevel\_init流程可参考spl启动分析

（10）secondary cpu处理流程将在2.1节中介绍

（11）\_main的定义位于arch/arm/lib/crt0\_64.S，其流程见2.2节

### ２.1　从cpu处理流程

　　smp系统只有主cpu执行完整的启动流程，其它从cpu在启动初期需要被设置到一个特定的状态。，待主cpu将系统启动完成后，再唤醒从cpu从给定地址处执行。armv8的从cpu启动包含 [psci](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=psci&zhida_source=entity) 和 [spintable](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=spintable&zhida_source=entity) 两种方式，其中psci方式需要由bl31处理，我们将在后面再专门介绍。此处我们看下uboot对spintable方式是如何处理的，以下是其源码：

```
#if defined(CONFIG_ARMV8_SPIN_TABLE) && !defined(CONFIG_SPL_BUILD)          （1）
    branch_if_master x0, x1, master_cpu                                 （2）
    b    spin_table_secondary_jump                                   （3）
#elif defined(CONFIG_ARMV8_MULTIENTRY)                                      （4）
    branch_if_master x0, x1, master_cpu                                 （5）
slave_cpu:                                                                     
    wfe                                                                 （6）
    ldr    x1, =CPU_RELEASE_ADDR                                       （7）
    ldr    x0, [x1]
    cbz    x0, slave_cpu                                               （8）
    br    x0                                                          （9）
#endif 
master_cpu:                                                                   
    bl    _main
```

（1）若当前从cpu为spin table启动方式，且当前执行的是uboot时。则从cpu将通过wfe进入自旋状态，并等待内核向给定地址填入其启动入口函数，该流程如下：

```
ENTRY(spin_table_secondary_jump)
.globl spin_table_reserve_begin
spin_table_reserve_begin:
0:      wfe                                                  （a）
        ldr     x0, spin_table_cpu_release_addr              （b）
        cbz     x0, 0b                                       （c）
        br      x0                                           （d）
.globl spin_table_cpu_release_addr                             
        .align  3
spin_table_cpu_release_addr:                                 （e）
        .quad   0
.globl spin_table_reserve_end
spin_table_reserve_end:
ENDPROC(spin_table_secondary_jump)
```

　　a 从cpu进入wfe睡眠模式  
　　b 若该cpu被唤醒，则读取spin\_table\_cpu\_release\_addr的值  
　　c 若内核未向该地址写入其启动的入口函数，则继续返回睡眠  
　　d 否则，跳转到读取到的入口处开始从cpu的启动流程  
　　e 定义保存从cpu入口函数的内存地址，该地址在uboot启动时会被填入设备树spintable节点的属性中。内核启动从cpu时，则通过向解析到地址写入入口函数，并唤醒secondary cpu，从而完成其启动

（2）若当前cpu为主cpu，继续执行冷启动流程

（3）若当前cpu为从cpu，则进入step 1的spin模式

（4）若未配置spintable，则从cpu需要spin在一个系统预先定义的地址上，并等待uboot在合适的时机向该地址填入入口函数

（5）若当前cpu为主cpu，则继续执行冷启动流程

（6 - 9）该流程与spintable方式类似，也是cpu通过wfe进入睡眠模式，并在唤醒后查询给定地址的值是否已被填入。若被填入则跳转到入口函数开始执行，否则继续进入睡眠模式

### ２.２　\_main流程分析

### ２.２.1　uboot重定位前的GD及内存规划

　　在进入c语言之前，我们需要为其准备好运行环境，以及做好内存规划，这其中除了栈和堆内存之外，还需要为gd结构体分配内存空间。gd是uboot中的一个global\_data类型全局变量，该变量包含了很多全局相关的参数，为各模块之间参数的传递和共享提供了方便。由于该变量在跳转到c流程之前就需要准备好，此时堆管理器尚未被初始化，所以其内存需要通过手工管理方式分配。以下为uboot内存规划相关代码：

```
#if defined(CONFIG_TPL_BUILD) && defined(CONFIG_TPL_NEEDS_SEPARATE_STACK)
    ldr    x0, =(CONFIG_TPL_STACK)
#elif defined(CONFIG_SPL_BUILD) && defined(CONFIG_SPL_STACK)
    ldr    x0, =(CONFIG_SPL_STACK)
#elif defined(CONFIG_INIT_SP_RELATIVE)
#if CONFIG_POSITION_INDEPENDENT
    adrp    x0, __bss_start
    add    x0, x0, #:lo12:__bss_start
#else
    adr    x0, __bss_start
#endif
    add    x0, x0, #CONFIG_SYS_INIT_SP_BSS_OFFSET
#else
    ldr    x0, =(CONFIG_SYS_INIT_SP_ADDR)                         （1）
#endif
    bic    sp, x0, #0xf                                           （2）
    mov    x0, sp                                                  
    bl    board_init_f_alloc_reserve                             （3）
    mov    sp, x0                                                 （4）
    mov    x18, x0                                                （5）
    bl    board_init_f_init_reserve                              （6）
```

（1）以上部分根据不同的配置情况获取uboot的初始栈地址

（2）为了遵循ABI规范，栈地址需要16字节对齐，该指令将地址做对齐以后设置到栈指针寄存器中，以为系统设置运行栈

（3）该函数为gd和early malloc分配内存，其代码如下：

```
ulong board_init_f_alloc_reserve(ulong top)
{
#if CONFIG_VAL(SYS_MALLOC_F_LEN)
        top -= CONFIG_VAL(SYS_MALLOC_F_LEN);                         （a）
#endif
        top = rounddown(top-sizeof(struct global_data), 16);         （b）
        return top;
}
```

　　a 为早期堆管理器预留内存  
　　b 为gd预留内存

（4）将预留后的内存地址设置为新的栈地址，此时各部分的地址如下：

![](https://picx.zhimg.com/v2-6696adae1af8ede21c14cdc97fa0d16f_1440w.jpg)

（5）将gd地址保存到x18寄存器中，其可用被于后续gd指针的获取

（6）该流程主要用于初始化gd，和设置early malloc的堆管理器基地址，其代码如下：

```
void board_init_f_init_reserve(ulong base)
{
        struct global_data *gd_ptr;

        gd_ptr = (struct global_data *)base;
        memset(gd_ptr, '\0', sizeof(*gd));                                       （a）
#if !defined(CONFIG_ARM)
        arch_setup_gd(gd_ptr);                                                   （b）
#endif
        if (CONFIG_IS_ENABLED(SYS_REPORT_STACK_F_USAGE))
                board_init_f_init_stack_protection_addr(base);                   （c）
        base += roundup(sizeof(struct global_data), 16);                               
#if CONFIG_VAL(SYS_MALLOC_F_LEN)
        gd->malloc_base = base;                                                  （d）
#endif
        if (CONFIG_IS_ENABLED(SYS_REPORT_STACK_F_USAGE))
                board_init_f_init_stack_protection();                            （e）
}
```

　　a 获取gd指针，并清空gd结构体内存

　　b 该函数用于非arm架构的gd指针获取，armv8架构则通过前面设置的x18寄存器获取gd指针，其定义如下（arch/arm/include/asm/global\_data.h

）：

```
#ifdef CONFIG_ARM64
#define DECLARE_GLOBAL_DATA_PTR         register volatile gd_t *gd asm ("x18")
#else
#define DECLARE_GLOBAL_DATA_PTR         register volatile gd_t *gd asm ("r9")
#endif
```

　　c 该函数用于获取该栈溢出检测的地址

　　d 设置early malloc的基地址

　　e 初始化栈溢出检测的canary值，该值被设置为SYS\_STACK\_F\_CHECK\_BYTE

### ２.２.２　uboot重定位

　　一般的启动流程会由spl初始化ddr，然后将uboot加载到ddr中运行。但这并不是必须的，uboot自身其实也可以作为bl1或bl2启动镜像，此时uboot最初的启动位置不是位于ddr中（如norflash）。由于norflash的执行速度比ddr要慢的多，因此在完成ddr初始化后就需要将其搬移到ddr中，并切换到新的位置继续执行，这个流程就叫做uboot的重定位

### ２.２.2.1　重定位的前提

　　uboot重定位依赖于位置无关代码技术，因此需要在编译和重定位时添加以下支持：  
（1）编译时添加-fpie选项

（2）在链接时添加-pie选项，它使得链接器会产生.rel.dyn和.dynsym段的fixup表。

（3）链接脚本中添加.rel.dyn和.dynsym段定义，并为重定位代码访问这些段的数据提供符号信息

（4）在重定位过程中需要根据新的地址fixup.rel.dyn和.dynsym段的数据

### ２.２.2.２　重定位基本流程

　　由于内核需要从内存的低地址开始运行，为了防止内核三件套（kernel、dtb和ramdisk）的加载地址与uboot运行地址重叠，因此uboot的重定位地址需要被设置到内存顶端附近。同时我们还需要为一些特定模块预留一些内存空间（比如页表空间、framebuffer等），下图就是uboot规划的重定位后内存布局：

![](https://pica.zhimg.com/v2-8ddc7a66dcfb0c660c63323425c17cce_1440w.jpg)

　　该图中橙色部分都是需要执行重定位操作的，如uboot的代码段、数据段，以及gd、设备树等，它们都是在board\_init\_r阶段还需要使用的。对于gd和dtb等纯数据的重定位，只需要将数据拷贝到新的地址，并将其基地址指针切换到新地址即可。但对于代码段的重定位我们还需要考虑以下问题：  
（1）位置无关代码需要调整.rel.dyn和.dynsym段

（2）栈指针需要切换到新的位置

（3）重定位完成后如何完成pc的平滑切换

　　以下是armv8代码重定位准备相关的源码，其位于arch/arm/lib/crt0\_64.S中：

```
#if !defined(CONFIG_SPL_BUILD)
    ldr    x0, [x18, #GD_START_ADDR_SP]                         （1）
    bic    sp, x0, #0xf                                         （2）
    ldr    x18, [x18, #GD_NEW_GD]                               （3）
    adr    lr, relocation_return                                （4）
#if CONFIG_POSITION_INDEPENDENT                            
    adrp    x0, _start    
    add    x0, x0, #:lo12:_start
    ldr    x9, _TEXT_BASE
    sub    x9, x9, x0
    add    lr, lr, x9                                            （5）
#if defined(CONFIG_SYS_RELOC_GD_ENV_ADDR)
    ldr    x0, [x18, #GD_ENV_ADDR]
    add    x0, x0, x9
    str    x0, [x18, #GD_ENV_ADDR]                               （6）
#endif
#endif
    ldr    x9, [x18, #GD_RELOC_OFF]
    add    lr, lr, x9                                            （7）
    ldr    x0, [x18, #GD_RELOCADDR]
    b    relocate_code                                         （8）
relocation_return:
```

（1）获取新的栈指针地址

（2）设置新的栈

（3）将新的gd地址设置到x18，以将gd切换到新的位置

（4）将重定位返回位置加载到lr中，在重定位流程中，这个地址将会被调整到新代码段的对应位置处。并在重定位完成后跳转到该地址处执行，从而完成代码从老位置到新位置的切换

（5）若定义了位置无关选项CONFIG\_POSITION\_INDEPENDENT，则计算其偏移值，并用该偏移值调整lr的值

（6）若定义了环境变量重定位选项CONFIG\_SYS\_RELOC\_GD\_ENV\_ADDR，则将环境变量的地址调整到新的位置

（7）根据重定位偏移调整lr的位置

（8）进入实际的代码重定位流程

　　armv8的代码重定位流程位于arch/arm/lib/relocate\_64.S中，其代码如下：

```
ENTRY(relocate_code)
    stp    x29, x30, [sp, #-32]!
    mov    x29, sp
    str    x0, [sp, #16]                           （1）

    adrp    x1, __image_copy_start
    add    x1, x1, :lo12:__image_copy_start         
    subs    x9, x0, x1                             
    b.eq    relocate_done                            （2）
    ldr    x1, _TEXT_BASE    
    subs    x9, x0, x1                              （3）

    adrp    x1, __image_copy_start    
    add    x1, x1, :lo12:__image_copy_start
    adrp    x2, __image_copy_end
    add    x2, x2, :lo12:__image_copy_end          （4）
copy_loop:                                              （5）
    ldp    x10, x11, [x1], #16
    stp    x10, x11, [x0], #16
    cmp    x1, x2
    b.lo    copy_loop          
    str    x0, [sp, #24]                           （6）

    adrp    x2, __rel_dyn_start                    （7）
    add    x2, x2, :lo12:__rel_dyn_start    
    adrp    x3, __rel_dyn_end    
    add    x3, x3, :lo12:__rel_dyn_end
fixloop:
    ldp    x0, x1, [x2], #16
    ldr    x4, [x2], #8
    and    x1, x1, #0xffffffff
    cmp    x1, #R_AARCH64_RELATIVE
    bne    fixnext

    add    x0, x0, x9
    add    x4, x4, x9
    str    x4, [x0]
fixnext:
    cmp    x2, x3
    b.lo    fixloop

relocate_done:
    switch_el x1, 3f, 2f, 1f                       （8）
    bl    hang
3:    mrs    x0, sctlr_el3
    b    0f
2:    mrs    x0, sctlr_el2
    b    0f
1:    mrs    x0, sctlr_el1
0:    tbz    w0, #2, 5f                             （9）
    tbz    w0, #12, 4f                            （10）
    ic    iallu    
    isb    sy
4:    ldp    x0, x1, [sp, #16]
    bl    __asm_flush_dcache_range
    bl     __asm_flush_l3_dcache
5:    ldp    x29, x30, [sp],#32                     （11）
    Ret                                            （12）
ENDPROC(relocate_code)
```

（1）构造一个栈帧，该栈帧中包含lr寄存器x30，fp寄存器x29和函数入参x0，其中x0为重定位的起始目的地址，该流程之后栈帧的内容如下：

![](https://pic3.zhimg.com/v2-30bf3b2b8c9823df24702d0f21974e34_1440w.jpg)

（2）计算镜像运行地址与目的地址的偏移，若它们相等，则显然无须执行重定位，可直接跳过该流程

（3）计算镜像链接地址与目的地址的偏移

（4）读取镜像运行地址的起始地址和结束地址

（5）从运行地址处将镜像拷贝到重定位目的地址处

（6）将重定位结束地址入栈，入栈后栈帧的内容如下：

![](https://pic2.zhimg.com/v2-eb4db7d57cf39502beb621fdcf58ddf9_1440w.jpg)

（7）位置无关代码相关处理

（8）根据当前执行的异常等级，跳转到对应的位置以读取sctlr寄存器的内容

（9 - 10）由于重定位后pc将会跳转到新的位置执行，因此若使能了cache，显然重定位之前已加载到cache中的指令还是老的地址，此时若直接跳转则cache中的内容是错误的。因此必须要失效掉cache中已经加载的内容

（11）从栈帧中恢复x29和x30（lr）的内容。现在已经万事俱备，只欠东风了，我们只要通过ret命令跳转到新地址执行即可

（12）经过慢慢长途，让我们在新的位置愉快地继续奔跑吧

### ２.２.2.3　重定位对调试的影响

　　我们知道调试器默认情况下会通过链接地址查找符号表，但在代码重定位后其运行地址就与链接地址不一致了，此时若不做调整则调试器将无法使用符号表。下面我们以qemu下调试uboot为例，介绍如何解决该问题。

（1）qemu启动uboot

```
qemu-system-aarch64 \
     -M  virt \
     -cpu cortex-a53 \
     -smp 2 \
     -m 2048M \
     -kernel ~/work/u-boot/u-boot \
         -nographic -s -S
```

（2）启动gdb调试器

```
aarch64-linux-gnu-gdb ~/work/u-boot/u-boot
```

（3）远程连接上uboot

```
target remote :1234
```

（4）丢弃老的符号表

```
symbol-file
```

（5）将符号表添加到重定位后的位置处，假设其地址为0xbff8a000，则命令如下：

```
add-symbol-file u-boot 0xbff8a000
```

（6）此后可以按正常方式继续调试，如设置断点，读取符号的值等

（7）若不知道uboot的重定位地址，则可以在reloc地址计算完成之后的位置设置断点，并在该断点处读取relocaddr。其方式如下：

　　a 设置断点

```
b setup_reloc
```

　　b 继续运行直到断点被触发，然后从gd中读取relocaddr的值

```
(gdb) p /x gd->relocaddr
$2 = 0xbff8a000
```

　　c 按前面步骤丢弃老的符号表并将符号表加载到新地址0xbff8a000处

　　d 设置重定位后的断点，并继续执行

编辑于 2022-07-21 15:10[嵌入式系统](https://www.zhihu.com/topic/19565752)[低代码工具有哪些？——全面解析市场格局与活字格核心优势](https://zhuanlan.zhihu.com/p/1985280066503071161)

[

一、低代码开发平台市场概况近年来，随着数字化转型加速，低代码开发平台成为企业降本增效的重要工具。低代码开发通过可视化界面和模型驱动逻辑，大幅降低了应用开发的技术门槛，让业...

](https://zhuanlan.zhihu.com/p/1985280066503071161)