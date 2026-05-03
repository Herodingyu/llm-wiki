---
title: "聊聊SOC启动（十一） 内核初始化"
source: "https://zhuanlan.zhihu.com/p/522991248"
author:
  - "[[lgjjeff]]"
published:
created: 2026-05-03
description: "本文基于以下软硬件假定： 架构：AARCH64 内核版本：5.14.0-rc5	上一篇我们讨论了内核初始化时异常等级和页表创建相关的一些背景知识，除此之外自然也少不了启动三件套：参数保存、cpu系统寄存器初始化以及c语言运…"
tags:
  - "clippings"
---
[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944)

23 人赞同了该文章

本文基于以下软硬件假定：  
架构：AARCH64  
内核版本：5.14.0-rc5

上一篇我们讨论了内核初始化时异常等级和页表创建相关的一些背景知识，除此之外自然也少不了启动三件套：参数保存、cpu系统寄存器初始化以及c语言运行时环境准备。由于kaslr主要用于增强内核安全性，在启动流程中并不是必须的，因此在本篇我们先不介绍与该特性相关的流程。综上所述，内核初始化总体流程如下图：

![](https://picx.zhimg.com/v2-929adbec5e28d930b1b872f402fc48cb_1440w.jpg)

## 1　内核入口函数

　　armv8架构内核的入口函数位于arch/arm64/kernel/head.S，它是内核启动的起点，其定义如下：

```
__HEAD
    efi_signature_nop            （1）
    b    primary_entry            （2）
```

（1） [EFI](https://zhida.zhihu.com/search?content_id=204352413&content_type=Article&match_order=1&q=EFI&zhida_source=entity) 最先是由intel提出为了支持PC启动的一套标准固件接口，它主要用于服务器中。为了抢占服务器市场，armv8架构加入了对EFI的支持，一般的嵌入式系统不需要支持该接口  
（2）该函数是内核初始化的主流程，该函数定义如下：

```
SYM_CODE_START(primary_entry)
    bl    preserve_boot_args                （1）                    
    bl    init_kernel_el              （2）
    adrp    x23, __PHYS_OFFSET                
    and    x23, x23, MIN_KIMG_ALIGN - 1      （3）
    bl    set_cpu_boot_mode_flag            （4）
    bl    __create_page_tables              （5）
    bl    __cpu_setup              （6）
    b    __primary_switch                  （7）
SYM_CODE_END(primary_entry)
```

代码执行的主流程如下，它包括以下几部分：       
（1）保存uboot传入的启动参数       
（2）异常等级初始化       
（3）保存\_\_PHYS\_OFFSET的物理地址       
（4）设置启动模式      
（5）创建初始化页表       
（6）初始化处理器以为打开 [MMU](https://zhida.zhihu.com/search?content_id=204352413&content_type=Article&match_order=1&q=MMU&zhida_source=entity) 做准备       
（7）使能MMU，设置异常向量表，栈，BSS段等，然后跳转到C语言函数

### １.1　启动参数保存

　　armv8架构所有配置信息都位于 [dtb](https://zhida.zhihu.com/search?content_id=204352413&content_type=Article&match_order=1&q=dtb&zhida_source=entity) 中，因此bootloader只需要将dtb地址信息传给内核即可。内核启动后需要保存该参数，以给后面的模块使用，以下为其代码实现：

```
SYM_CODE_START_LOCAL(preserve_boot_args)
    mov    x21, x0                // x21=FDT                       （1）

    adr_l    x0, boot_args        // record the contents of                （2）
    stp    x21, x1, [x0]            // x0 .. x3 at kernel entry
    stp    x2, x3, [x0, #16]                                                （3）

    dmb    sy                // needed before dc ivac with             
                        // MMU off

    add    x1, x0, #0x20            // 4 x 8 bytes                      
    b    dcache_inval_poc        // tail call                      （4）
SYM_CODE_END(preserve_boot_args)
```

（1）将dtb地址保存到callee寄存器x21中，以腾出x0寄存器  
（2）获取保存启动参数的变量地址  
（3）虽然armv8现在只使用了一个寄存器传递启动参数，但内核还是支持最多可传递四个参数。该指令用于将参数保存到全局变量boot\_args中  
（4）失效boot\_args对应内存的cache。这是因为此时cache还未使能，若bootloader在cache中有残留数据，则当cache开启后cpu将使用cache中残留的数据，从而导致数据不一致问题

### １.2　异常等级初始化

　　异常等级初始化函数为init\_kernel\_el，其背景金额流程在上一篇中已经做了详细的介绍，这里不再重复

### １.3　设置启动模式

　　它用于保存cpu启动时的异常等级，在smp系统中除了primary cpu之外，还存在若干的secondary cpu，而这些cpu应该以相同的异常等级启动。为了判断它们的启动EL是否相同，内核用一个如下所示的数组来记录系统cpu的启动模式，其定义如下：

```
SYM_DATA_START(__boot_cpu_mode)
    .long    BOOT_CPU_MODE_EL2
    .long    BOOT_CPU_MODE_EL1
SYM_DATA_END(__boot_cpu_mode)
```

　　即当\_\_boot\_cpu\_mode\[0\]被初始为el2，\_\_boot\_cpu\_mode\[1\]初始为el1，cpu启动时会根据系统的启动EL修改该数组对应元素的值。其规则如下：  
（1）启动EL为EL1  
　　将\_\_boot\_cpu\_mode\[0\]修改为el1  
（2）启动EL为EL2  
　　将\_\_boot\_cpu\_mode\[1\]修改为el2

　　它实际上是实现了一个简单的状态机，只有所有cpu的启动EL相同时，\_\_boot\_cpu\_mode\[0\]和\_\_boot\_cpu\_mode\[1\]的值才相同，否则他们的值就不同。下面我们简单模拟一下状态机的运转：  
（1）假设有四个cpu都以EL1启动，则其状态转换表如下：

|  | Initial state | cpu0 boot | cpu1 boot | cpu1 boot | cpu1 boot |
| --- | --- | --- | --- | --- | --- |
| \_\_boot\_cpu\_mode\[0\] | el2 | el1 | el1 | el1 | el1 |
| \_\_boot\_cpu\_mode\[1\] | el1 | el1 | el1 | el1 | el1 |

（2）假设有四个cpu都以EL2启动，则其状态转换表如下：

|  | Initial state | cpu0 boot | cpu1 boot | cpu1 boot | cpu1 boot |
| --- | --- | --- | --- | --- | --- |
| \_\_boot\_cpu\_mode\[0\] | el2 | el2 | el2 | el2 | el2 |
| \_\_boot\_cpu\_mode\[1\] | el1 | el2 | el2 | el2 | el2 |

（3）假设有四个cpu都以EL1 – EL2 – EL2 – EL2启动，则其状态转换表如下：

|  | Initial state | cpu0 boot | cpu1 boot | cpu1 boot | cpu1 boot |
| --- | --- | --- | --- | --- | --- |
| \_\_boot\_cpu\_mode\[0\] | el1 | el1 | el1 | el1 | el1 |
| \_\_boot\_cpu\_mode\[1\] | el1 | el2 | el2 | el2 | el2 |

以下为该数组元素设置函数：

```
SYM_FUNC_START_LOCAL(set_cpu_boot_mode_flag)
    adr_l    x1, __boot_cpu_mode
    cmp    w0, #BOOT_CPU_MODE_EL2
    b.ne    1f
    add    x1, x1, #4
1:    str    w0, [x1]            // Save CPU boot mode
    dmb    sy
    dc    ivac, x1            // Invalidate potentially stale cache line
    ret
SYM_FUNC_END(set_cpu_boot_mode_flag)
```

## 2　创建页表

　　上一篇已经分析过，在开启MMU前内核需要使用线性映射方式为 [idmap](https://zhida.zhihu.com/search?content_id=204352413&content_type=Article&match_order=1&q=idmap&zhida_source=entity) 段的地址创建identity map页表，并且为整个内核镜像创建init\_pg\_dir页表。页表创建流程比较简单，其实就是根据虚拟地址的值，在各级页表中找到其对应的entry，然后将其指向对应的下一级页表。

　　内核镜像初始化页表创建流程如下：

```
SYM_FUNC_START_LOCAL(__create_page_tables)
    mov    x28, lr

    adrp    x0, init_pg_dir
    adrp    x1, init_pg_end
    bl    dcache_inval_poc                                              （1）

    adrp    x0, init_pg_dir
    adrp    x1, init_pg_end
    sub    x1, x1, x0
1:    stp    xzr, xzr, [x0], #16
    stp    xzr, xzr, [x0], #16
    stp    xzr, xzr, [x0], #16
    stp    xzr, xzr, [x0], #16
    subs    x1, x1, #64
    b.ne    1b                                                              （2）

    mov    x7, SWAPPER_MM_MMUFLAGS                                         （3）

    adrp    x0, idmap_pg_dir
    adrp    x3, __idmap_text_start        

#ifdef CONFIG_ARM64_VA_BITS_52
    mrs_s    x6, SYS_ID_AA64MMFR2_EL1
    and    x6, x6, #(0xf << ID_AA64MMFR2_LVA_SHIFT)
    mov    x5, #52
    cbnz    x6, 1f                                                           （4）
#endif
    mov    x5, #VA_BITS_MIN
1:
    adr_l    x6, vabits_actual
    str    x5, [x6]                                                          （5）
    dmb    sy
    dc    ivac, x6        

    adrp    x5, __idmap_text_end                                              （6）
    clz    x5, x5
    cmp    x5, TCR_T0SZ(VA_BITS_MIN)                 
    b.ge    1f                                                      （7）

    adr_l    x6, idmap_t0sz
    str    x5, [x6]                                                          （8）
    dmb    sy
    dc    ivac, x6        

#if (VA_BITS < 48)                                                                 （9）
#define EXTRA_SHIFT    (PGDIR_SHIFT + PAGE_SHIFT - 3)
#define EXTRA_PTRS    (1 << (PHYS_MASK_SHIFT - EXTRA_SHIFT))

#if VA_BITS != EXTRA_SHIFT
#error "Mismatch between VA_BITS and page size/number of translation levels"
#endif

    mov    x4, EXTRA_PTRS
    create_table_entry x0, x3, EXTRA_SHIFT, x4, x5, x6
#else
    mov    x4, #1 << (PHYS_MASK_SHIFT - PGDIR_SHIFT)
    str_l    x4, idmap_ptrs_per_pgd, x5
#endif
1:
    ldr_l    x4, idmap_ptrs_per_pgd
    adr_l    x6, __idmap_text_end                                              （10）

    map_memory x0, x1, x3, x6, x7, x3, x4, x10, x11, x12, x13, x14                （11）

    adrp    x0, init_pg_dir
    mov_q    x5, KIMAGE_VADDR    
    add    x5, x5, x23            
    mov    x4, PTRS_PER_PGD
    adrp    x6, _end            
    adrp    x3, _text            
    sub    x6, x6, x3            
    add    x6, x6, x5                                                           （12）    

    map_memory x0, x1, x5, x6, x7, x3, x4, x10, x11, x12, x13, x14                 （13）

    dmb    sy

    adrp    x0, idmap_pg_dir
    adrp    x1, idmap_pg_end
    bl    dcache_inval_poc

    adrp    x0, init_pg_dir
    adrp    x1, init_pg_end
    bl    dcache_inval_poc                                                         （14）

    ret    x28                                                      
SYM_FUNC_END(__create_page_tables)
```

（1 - 2）用于失效init页表pgd的cache及其数据  
（12 - 13）用于创建init页表，该流程很简单，就是将内核镜像映射到其链接脚本指定的虚拟地址处。  
（14）用于失效idmap页表和init页表pgd的cache  
（3 -11）用于创建idmap页表

　　idmap是内核镜像中的一个段，其定义位于 arch/arm64/kernel/vmlinux.lds.S中：

```
#define IDMAP_TEXT                  \
    . = ALIGN(SZ_4K);               \
    VMLINUX_SYMBOL(__idmap_text_start) = .;     \
    *(.idmap.text)                  \
    VMLINUX_SYMBOL(__idmap_text_end) = .;
```

　　即定义了一个以\_\_idmap\_text\_start开始，\_\_idmap\_text\_end结束的段，它会被放在vmlinux的代码段中。在内核初始化时它会作为内核镜像的一部分被映射到init页表中，此外还通过idmap页表再被单独映射一次。以下为其映射关系图：

![](https://pic4.zhimg.com/v2-b0783cc85907dfe11c9156a7e9b324ff_1440w.jpg)

　　从图中我们可以看到idmap映射的虚拟地址等于物理地址，因为armv8上物理地址是小于等于48位的，故其虚拟地址就位于0x0000 0000 0000 0000 到0xffff 0000 0000 0000之间，其pgd基地址也相应会被放到 [ttbr0\_el1](https://zhida.zhihu.com/search?content_id=204352413&content_type=Article&match_order=1&q=ttbr0_el1&zhida_source=entity) 寄存器中。同时，我们看到它作为kernel image的一部分还会被映射到0xffff 0000 0000 0000和0xffff ffff ffff ffff之间（这是armv8中内核地址的范围），这个映射关系由init页表映射实现，相应地其pgd的基地址会被放到 [ttbr1\_el1](https://zhida.zhihu.com/search?content_id=204352413&content_type=Article&match_order=1&q=ttbr1_el1&zhida_source=entity) 寄存器中。     

　　之所以需要idmap映射时因为现代处理器存在流水线，分支预测等功能，在MMU开启时，打开MMU指令执行时，其后的指令可能已经取指完成，且其地址还是物理地址。而MMU使能完成后，实际上系统已经运行于虚拟地址模式下，若不采取相应措施，此时这些已经取指完成的指令就会执行错误。故内核采用了将idmap映射的物理地址和虚拟地址设为相等，从而规避了以上问题。     

　　由于idmap的映射规则为虚拟地址等于物理地址，因此当虚拟地址小于48位，而物理地址为48位时，若idmap对应的物理地址位于较高地址空间（其值就可能大于2^n，其中n为虚拟地址位数），则按照该映射规则，就会导致映射失败。     

　　因此内核在虚拟地址小于48位时进行了一些特殊处理，在原先3级页表的基础上再增加一层extra映射，其作用是通过这层映射将虚拟地址范围扩展为48位

## 3　初始化cpu状态

　　虽然在异常初始化流程中已经设置了sctlr\_el1等系统控制寄存器，但在打开mmu前还需要其它一些准备工作。

　　mmu启动后内核将正式切换到虚拟内存模式，为了提高页表访问效率，需要为其增加一级tlb缓存。为了防止tlb中有bootloader遗留的脏数据，需要在启动mmu之前先失效其中的内容。

　　armv8内存可分为device memory和normal memory，它们又可以具有不同的属性，如device memory可配置不同的nGnRnE属性，以确定其访问内存时的行为。normal memory可以有不同的cache策略，如cache写回、cache写通或者non cache等。寄存器 [MAIR\_EL1](https://zhida.zhihu.com/search?content_id=204352413&content_type=Article&match_order=1&q=MAIR_EL1&zhida_source=entity) 用于设置内存属性表，它按八位一组分成了八组属性，其定义如下图：

![](https://pic1.zhimg.com/v2-b20d1751161dccf17689a2d92163897c_1440w.jpg)

![](https://pic4.zhimg.com/v2-19804ff0d203b6fa714c5acee6474b95_1440w.jpg)

　　我们可以向该寄存器预先设置几组属性表，其被设置成功以后，则在页表中就可以用一个3位\[0:2\]的索引值来获取这些属性中的某一个，该值是可以被存储在最后一级页表PTE的标志位中，并可被加载到TLB中

```
SYM_FUNC_START(__cpu_setup)
    tlbi    vmalle1                                                                        （1）    
    dsb    nsh

    mov    x1, #3 << 20
    msr    cpacr_el1, x1                                                                （2）        
    mov    x1, #1 << 12        
    msr    mdscr_el1, x1                                                            （3）
    isb                    
    enable_dbg                                                                        （4）            
    reset_pmuserenr_el0 x1                                                        （5）
    reset_amuserenr_el0 x1                                                            （6）

    mair    .req    x17
    tcr    .req    x16
    mov_q    mair, MAIR_EL1_SET                                             
    mov_q    tcr, TCR_TxSZ(VA_BITS) | TCR_CACHE_FLAGS | TCR_SMP_FLAGS | \
            TCR_TG_FLAGS | TCR_KASLR_FLAGS | TCR_ASID16 | \
            TCR_TBI0 | TCR_A1 | TCR_KASAN_SW_FLAGS                   
…
    tcr_clear_errata_bits tcr, x9, x5

#ifdef CONFIG_ARM64_VA_BITS_52
    ldr_l        x9, vabits_actual
    sub        x9, xzr, x9
    add        x9, x9, #64
    tcr_set_t1sz    tcr, x9
#else
    ldr_l        x9, idmap_t0sz
#endif
    tcr_set_t0sz    tcr, x9

    tcr_compute_pa_size tcr, #TCR_IPS_SHIFT, x5, x6
    …
    msr    mair_el1, mair                                         　　　　　　　　　　　 （7）                                 
    msr    tcr_el1, tcr                                            　　　　　　　　　　　（8）
    mov_q    x0, INIT_SCTLR_EL1_MMU_ON
    ret                    
    .unreq    mair
    .unreq    tcr
SYM_FUNC_END(__cpu_setup)
```

（1）失效tlb  
（2）将EL0和EL1下对SIMD和FP寄存器的访问陷入EL1  
（3）将EL0对debug communication channel寄存器的访问陷入到EL1  
（4）清除PSTATE的D位以使能debug  
（5）关闭EL0对性能测量单元PMU的访问  
（6）关闭EL0对行为测量单元AMU的访问  
（7）设置mair\_el1的内存属性表

　　如我们设置了六组属性，其中各属性值按2进制位表示如下：

```
0b0000 0000     
0b0000 0100     
0b0000 1100     
0b0100 0100     
0b1111 1111     
0b1011 1011
```

　　根据下面的属性定义我们就可以知道，0b0000 0000格式为0b0000 dd00，且dd的值为0b00，因此其表示nGnRnE设备内存的属性，0b0000 0100格式为0b0000 dd00，且dd的值为0b01，因此nGnRE设备内存的属性等，其余的属性依次类推   

（8）设置el1的控制寄存器tcr\_el1，寄存器的定义如下。它主要用于设置ttbr0，ttbr1相关的属性，物理地址范围等。该指令上面的代码主要是实现了一系列的计算，以配置该寄存器的值。我们在后图中简单贴出两个字段的定义，更多相关定义可以参考armv8技术手册。

![](https://pic4.zhimg.com/v2-0334946ce24432d2bc384a0ca7d64f7d_1440w.jpg)

## 4　C运行时环境初始化

　　\_\_primary\_switch主要用于设置c运行时环境，如使能MMU，设置异常向量表，栈，BSS段等，最后跳转到C语言函数start\_kernel     

　　该函数如下，我们暂且跳过与主流程关联较小的kaslr和内核重定向相关代码，然后再看这段代码就很简单了。

```
SYM_FUNC_START_LOCAL(__primary_switch)
…
    adrp    x1, init_pg_dir
    bl    __enable_mmu                 （1）
    …
    ldr    x8, =__primary_switched
    adrp    x0, __PHYS_OFFSET
    br    x8                            （2）
SYM_FUNC_END(__primary_switch)
```

（1）使能mmu  
（2）跳转到\_\_primary\_switched函数

　　\_\_primary\_switched函数的定义如下：

```
SYM_FUNC_START_LOCAL(__primary_switched)
    adr_l    x4, init_task
    init_cpu_task x4, x5, x6                       （1）

    adr_l    x8, vectors            
    msr    vbar_el1, x8                   （2）
    isb

    stp    x29, x30, [sp, #-16]!
    mov    x29, sp                                 

    str_l    x21, __fdt_pointer, x5                （3）               

    ldr_l    x4, kimage_vaddr        
    sub    x4, x4, x0            
    str_l    x4, kimage_voffset, x5                （4）

    adr_l    x0, __bss_start
    mov    x1, xzr
    adr_l    x2, __bss_stop
    sub    x2, x2, x0
    bl    __pi_memset                              （5）
    …
    mov    x0, x21                
    bl    early_fdt_map                     （6）    
    …
    bl    switch_to_vhe                     （7）
    ldp    x29, x30, [sp], #16
    bl    start_kernel                             （8）
    ASM_BUG()
SYM_FUNC_END(__primary_switched)
```

（1）该函数用于设置swapper进程的初始化栈帧  
（2）设置异常向量表  
（3）将fdt地址保存到全局变量\_\_fdt\_pointer中  
（4）计算内核虚拟地址与物理地址的差，并保存到全局变量kimage\_voffset中  
（5）清空bss段的内容  
（6）它会先初始化fixmap，然后通过fixmap为fdt建立页表  
（7）在回一下异常等级初始化流程，在该流程中会通过hcr\_el2.e2h判断是否会进入vhe模式，而这个标志是通过HCR\_HOST\_NVHE\_FLAGS初始化的。因此若该标志未设置e2h位，则即使系统支持vhe也不会实际进入该模式。因为vhe模式的优势，故内核在这里会再给一次进入该模式的机会  
（8）终于看到我们熟悉的start\_kernel，可以离开头疼的汇编了

## 5　后记

　　进入start kernel之后，内核将会继续初始化各子系统和模块，并最终通过启动init进程进入用户空间。内核运行的核心模块包括内存管理子系统、中断子系统、时间子系统。进程子系统等。由于各子系统的独立性相对较强，因此后续的内容将在各子系统中讨论

编辑于 2022-06-01 13:14[自学 Java 怎么入门？](https://www.zhihu.com/question/25255189/answer/1313021516)

[

玩Java多年的老司机带你上车全面系统学习Java，并且还能教你如何学习才能在今年拿到一份不错的offer。说到系统全面，就是以目前绝大部分公司招聘要求的知识内容为基准，毕竟我们学习...

](https://www.zhihu.com/question/25255189/answer/1313021516)