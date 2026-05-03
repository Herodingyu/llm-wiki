---
title: "聊聊SOC启动（七） SPL启动分析"
source: "https://zhuanlan.zhihu.com/p/520189611"
author:
  - "[[lgjjeff]]"
published:
created: 2026-05-03
description: "1 spl简介 典型的uboot启动流程通常包含三个阶段，bootrom（或xip）--> spl --> uboot。其中bootrom的特点如下： （1）其存储介质需要具有片上执行能力 因为在系统初始化时，cpu只能访问可以直接寻址的存…"
tags:
  - "clippings"
---
[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944)

32 人赞同了该文章

## 1　spl简介

　　典型的 [uboot](https://zhida.zhihu.com/search?content_id=203729759&content_type=Article&match_order=1&q=uboot&zhida_source=entity) 启动流程通常包含三个阶段， [bootrom](https://zhida.zhihu.com/search?content_id=203729759&content_type=Article&match_order=1&q=bootrom&zhida_source=entity) （或xip）--> spl --> uboot。其中bootrom的特点如下：  
（1）其存储介质需要具有片上执行能力        
　　因为在系统初始化时，cpu只能访问可以直接寻址的存储器，如ROM。而像SPI FLASH或NAND FLASH等外部存储器，都需要相应的驱动才可以访问，故在启动的最初阶段cpu无法访问。因此cpu执行的第一级启动镜像一般都是产商固化在SOC内部存储器（通常为ROM）上的。

（2）它的主要功能是加载并执行BL２镜像        
　　BL２镜像会被加载到固定的位置执行，这个位置一般为芯片内部的 [SRAM](https://zhida.zhihu.com/search?content_id=203729759&content_type=Article&match_order=1&q=SRAM&zhida_source=entity) 。由于SRAM的size较小，故BL2（在uboot中就是 [SPL](https://zhida.zhihu.com/search?content_id=203729759&content_type=Article&match_order=1&q=SPL&zhida_source=entity) ）的size也不能太大。对于为什么不将它加载到DDR中运行，我的理解是DDR在使用之前必须要先进行初始化，而对于每个不同的产品设计，DDR的选型都是不一样的，且DDR初始化的代码和配置参数需要占用比较大的空间。故在bootrom中无法实现普适的DDR初始化代码，这也是需要将uboot分为SPL和uboot两个阶段的原因。

（3）它决定了BL２的启动方式        
　　由于BL２是由bootrom加载的，故具体支持从哪些存储器上启动BL2取决于bootrom的支持情况。SOC都会在芯片手册中列出其所支持的启动方式，若支持从多种存储介质启动，则一般可以通过拨码开关控制具体从何处启动。      

　　在uboot中BL２就是SPL（Secondary Program Loader），本文主要介绍它的执行流程，在介绍与具体架构相关的内容时，则都以 [armv8](https://zhida.zhihu.com/search?content_id=203729759&content_type=Article&match_order=1&q=armv8&zhida_source=entity) 为例。以下为spl的主要功能：  
（1）设置cpu的状态，如cache，mmu，大小端设置等  
（2）准备c语言的执行环境，它包括设置栈指针和清空BSS段的内容  
（3）为GD分配内存空间  
（4）初始化RAM，并将BL2的代码拷贝到RAM中执行

### 2　入口函数在哪里之SPL链接脚本简要分析

     对于任何一个程序，我们首先需要找到其入口函数，对于应用程序，程序的入口函数为main（）函数，而对于SPL这样的裸机程序，其入口函数实际上是在链接时指定的。我们打开armv8的SPL链接脚本arch/arm/cpu/armv8/u-boot-spl.lds，它的内容如下：

```
MEMORY { .sram : ORIGIN = CONFIG_SPL_TEXT_BASE,
        LENGTH = CONFIG_SPL_MAX_SIZE }
MEMORY { .sdram : ORIGIN = CONFIG_SPL_BSS_START_ADDR,
        LENGTH = CONFIG_SPL_BSS_MAX_SIZE }

OUTPUT_FORMAT("elf64-littleaarch64", "elf64-littleaarch64", "elf64-littleaarch64")
OUTPUT_ARCH(aarch64)
ENTRY(_start)
SECTIONS
{
    .text : {
        . = ALIGN(8);
        *(.__image_copy_start)
        CPUDIR/start.o (.text*)
        *(.text*)
    } >.sram

    .rodata : {
        . = ALIGN(8);
        *(SORT_BY_ALIGNMENT(SORT_BY_NAME(.rodata*)))
    } >.sram

    .data : {
        . = ALIGN(8);
        *(.data*)
    } >.sram

    .u_boot_list : {
        . = ALIGN(8);
        KEEP(*(SORT(.u_boot_list*)));
    } >.sram

    .image_copy_end : {
        . = ALIGN(8);
        *(.__image_copy_end)
    } >.sram

    .end : {
        . = ALIGN(8);
        *(.__end)
    } >.sram

    _image_binary_end = .;

    .bss_start (NOLOAD) : {
        . = ALIGN(8);
        KEEP(*(.__bss_start));
    } >.sdram

    .bss (NOLOAD) : {
        *(.bss*)
         . = ALIGN(8);
    } >.sdram

    .bss_end (NOLOAD) : {
        KEEP(*(.__bss_end));
    } >.sdram

    /DISCARD/ : { *(.dynsym) }
    /DISCARD/ : { *(.dynstr*) }
    /DISCARD/ : { *(.dynamic*) }
    /DISCARD/ : { *(.plt*) }
    /DISCARD/ : { *(.interp*) }
    /DISCARD/ : { *(.gnu*) }
}
```

    以上链接脚本中首先是两个MEMORY的语句，它的作用是描述目标平台上的内存位置和长度，可以用它来描述哪些内存位置可以被链接器使用，哪些位置不能被链接器使用。定义了它们以后，就可以把各个SECTION分配到相应的区域中，链接器会根据区域设置SECTION的地址，当其超过了该区域的size时，链接器就会发出警告信息。MEMORY的链接语法如下，其中NAME指定了该区域的名字，可以自己定义，ATTR指定了该区域的属性，如RWX等。ORIGIN指定了该区域的起始地址，LENGTH指定了该区域的长度。

```
MEMORY
  {
    NAME [(ATTR)] : ORIGIN = ORIGIN, LENGTH = LEN
    ...
  }
```

    本链接脚本中定义了两个内存块，第一个位于SRAM中，它的起始地址由ORIGIN指定，块长度由LENGTH指定。第二个是位于 [SDRAM](https://zhida.zhihu.com/search?content_id=203729759&content_type=Article&match_order=1&q=SDRAM&zhida_source=entity) 中的块，起始地址和长度也分别由其ORIGIN和LENGTH指定。由于在默认情况下各个段是允许使用所有的内存地址的，而上面我们也说了SPL实际上会被加载到SRAM中执行，因此这里在链接脚本里规定了各个段的存放位置。从上面脚本可见，除了BSS段被放到了SDRAM中，其余的段都被放到了SRAM中。     接下来的OUTPUT\_FORMAT指定了目标文件的格式，如这里为aarch64架构，小端的 [ELF格式](https://zhida.zhihu.com/search?content_id=203729759&content_type=Article&match_order=1&q=ELF%E6%A0%BC%E5%BC%8F&zhida_source=entity) 。ELF格式会在目标文件的最开始添加一个ELF头，用于操作系统识别该文件的相关信息，但是SPL是在裸机上执行的，若含有这个头信息，CPU其实并不认识它。若不做进一步处理，链接完的程序就不能被cpu执行，故在Makefile中会有个去掉ELF头的操作，它的定义如下（位于scripts/makefile.spl）:

```
quiet_cmd_objcopy = OBJCOPY $@
cmd_objcopy = $(OBJCOPY) $(OBJCOPYFLAGS) $(OBJCOPYFLAGS_$(@F)) $< $@

OBJCOPYFLAGS_$(SPL_BIN)-nodtb.bin = $(SPL_OBJCFLAGS) -O binary \
        $(if $(CONFIG_SPL_X86_16BIT_INIT),-R .start16 -R .resetvec)

$(obj)/$(SPL_BIN)-nodtb.bin: $(obj)/$(SPL_BIN) FORCE
    $(call if_changed,objcopy)
```

    以上makefile中$(SPL\_BIN)的值定义为u-boot-spl，它的意思为若依赖有变化，则执行cmd\_objcopy操作，将u-boot-spl通过cross compile的objcopy工具转换为u-boot-spl-nodtb.bin，我们可以看到objcopy的参数中含有-O binary，即它会将源文件转换为纯二进制文件，从而实现了将ELF头去掉的目的。       
　　OUTPUT\_ARCH也是链接脚本的关键字，它指定了运行平台的架构。接下来主角出现了，ENTRY函数就是用来指定整个目标程序入口点的，这里它指定了\_start为SPL的入口点，后面我们的代码分析也由此开始。       
　　接下来就是各个段的定义，段实际上就是目标文件中内容的组织形式，我们的目标程序会由很多段组成，如代码段，数据段，BSS段等。我们知道代码段主要包含指令相关的部分，数据段中会包含已初始化的全局变量和局部静态变量，BSS段会包含未初始化的全局变量和局部静态变量。其余还有如rodata段，字符串表段，调试相关的段，重定位段等等。链接脚本实际上就是将各个目标文件中相同的段给放到了一起（这里可能不够准确，如上图所示，其实哪些段放在哪些位置都是由SECTION中各个段的定义确定的，但一般都是相同的段会被链接到一起），然后通过地址重定位调整符号的引用地址，以使其绑定到正确的位置。       
　　那么，将相同的段放在一起有什么好处呢。我们知道代码段包含的是程序指令，它在程序的运行过程中是不需要修改任何内容的，因此在加载到内存后可以将该段内存的属性设置为只读。而数据段的内容在程序中是可以修改的，因此它的内存属性可以设置为可读可写。对于bss段，由于它们的值都是0，所以在链接的时候就可以做一个优化，在最终的目标文件中并不需要为其分配实际的空间，而只是为其提供一个占位符，因此可以减少目标文件的size。将各个相同的段放到一起后，则在内存分配时为代码段分配一块只读的内存，数据段分配一块读写的内存等就可以 了，否则，由于该文件包含大量的.o文件，而每个.o文件又都包含自己的代码段，数据段等，在内存分配时就需要对每个.o文件的每个段单独处理，因此会造成系统中存在大量不同的段，也会造成内存浪费等。

### ３　SPL 代码分析1(Start.S)

    armv8架构下的SPL入口函数位于arch/arm/cpu/armv8/start.S文件的\_start，它的定义如下：

```
.globl  _start
_start:
#ifdef CONFIG_ENABLE_ARM_SOC_BOOT0_HOOK
/*
 * Various SoCs need something special and SoC-specific up front in
 * order to boot, allow them to set that in their boot0.h file and then
 * use it here.
 */
#include <asm/arch/boot0.h>
#else
    b   reset
#endif
```

    它有两种情况，一种是某些平台会定义自己特殊的启动代码，此处我们看通用的情况，即else的分支中，它直接跳转到了reset处。它的定义如下：

```
reset:
    /* Allow the board to save important registers */
    b   save_boot_params
.globl  save_boot_params_ret
save_boot_params_ret:

#ifdef CONFIG_SYS_RESET_SCTRL
    # 操作sctrl的值，以配置相关设置
    bl reset_sctrl
#endif
```

    此处也是一处跳转指令，它会跳转到save\_boot\_params处，它的定义如下：

```
WEAK(save_boot_params)
    b   save_boot_params_ret    /* back to my caller */
ENDPROC(save_boot_params)
```

    我们看到它的前面加了WEAK关键字，该关键字标识其是一个弱符号，用法为若其它的地方定义了同名的函数或全局变量，则会使用重定义的值，否则就使用WEAK标号中的定义。实际上它是一个很有用的特性，如我们可以为某个函数定义一个默认的定义，并将其用WEAK关键字修饰，当调用该函数的用户希望其使用自己定义的特殊实现时，就可以在其它的文件中重新定义一个非WEAK的同名函数，此时链接器链接时就会链接新的定义，而自动忽略掉用WEAK修饰的定义，从而可以实现函数功能的扩展，或者用于一些debug操作等。此处我们只看默认定义，它什么也不做，继续跳转回了原来的位置save\_boot\_params\_ret。     

　　其后根据是否配置了CONFIG\_SYS\_RESET\_SCTRL参数决定是否执行reset\_sctrl的内容。我们看下它的实现如下：

```
#ifdef CONFIG_SYS_RESET_SCTRL
reset_sctrl:
    switch_el x1, 3f, 2f, 1f
3:
    mrs x0, sctlr_el3
    b   0f
2:
    mrs x0, sctlr_el2
    b   0f
1:
    mrs x0, sctlr_el1

0:
    ldr x1, =0xfdfffffa
    and x0, x0, x1

    switch_el x1, 6f, 5f, 4f
6:
    msr sctlr_el3, x0
    b   7f
5:
    msr sctlr_el2, x0
    b   7f
4:
    msr sctlr_el1, x0

7:
    dsb sy
    isb
    b   __asm_invalidate_tlb_all
    ret
#endif
```

    它首先调用switch\_el 函数，该函数的定义位于arch/arm/include/asm/macro.h，我们先看下它的功能。  　　  
（1）mrs是arm读取系统寄存器内容的指令，此处它会读取 [CurrentEL](https://zhida.zhihu.com/search?content_id=203729759&content_type=Article&match_order=1&q=CurrentEL&zhida_source=entity) 寄存器的值，该寄存器存放了cpu当前所处的异常等级。在armv8中，一共有四个异常等级EL0 - EL3， 随着数字的增大，其特权等级也相应更高，一般EL0用于实现应用层程序，它也是一个非特权等级，EL1用于实现操作系统层的功能，EL2层用于虚拟层，即在armv8上，通过引入该层实现了硬件对虚拟机级别的多操作系统支持，EL3层用于secure功能，即它可以实现在secure world和非secure world之间的切换。     

　（2）它将读到的值与0xc比较，该比较指令会根据比较结果设置NZCV标志位。若他们的值相等，则会设置Z标志位     

　（3）根据Z标志位判断寄存器的值是否等于0xc，若相等则跳转到el3\_label，即第二个参数处，否则继续比较，根据相应的值跳转到不同分支。

```
/*
 * Branch according to exception level
 */
.macro  switch_el, xreg, el3_label, el2_label, el1_label
    mrs \xreg, CurrentEL                                                (1)
    cmp \xreg, 0xc                                                      (2)
    b.eq    \el3_label                                                  (3)
    cmp \xreg, 0x8
    b.eq    \el2_label
    cmp \xreg, 0x4
    b.eq    \el1_label
.endm
```

　　armv8手册中对CurrentEL寄存器的定义如下图，它占用寄存器的2-3位，即EL0的值为0，EL1的值为4，EL2的值为8，EL3的值为12。因此上面代码的意思就是根据CPU的当前EL等级，分别跳转到不同的标号处执行。

![](https://pic1.zhimg.com/v2-9472ae05fca25358e45066677a73ea06_1440w.jpg)

　　我们再回到reset\_sctrl的内容，它含有0 - 7一共8个标号，为了描述方便，后面涉及到EL的分支时，我们都以EL1为例描述。在标号1处会将stlr\_el1的内容读到x0寄存器，然后将立即数0xfdfffffa加载到x1寄存器，并将x0和x1执行位与操作，即它会清除sctlr\_el1的bit0，bit2和bit24。sctlr\_el1及各bit的定义如下图，从中可以看到bit0用于关MMU，bit2用于关cache，bit24用于选择大小端。接下来的switch\_el继续根据当前异常等级选择不同的分支，在EL1时会执行标号4，该操作即是将修改好的值写回到sctlr\_el1寄存器中。

![](https://pic4.zhimg.com/v2-bf268c44fb7c9eec188d95a378adecc3_1440w.jpg)

![](https://pic4.zhimg.com/v2-9a8668559cf93ddae412f54ca3ffd671_1440w.jpg)

![](https://pic4.zhimg.com/v2-94cd02da8bb263265073dd6ebde24051_1440w.jpg)

![](https://picx.zhimg.com/v2-78b2159fb2afd185151e50696c8b4845_1440w.jpg)

　　后面是两个内存屏障的操作，内存屏障主要用于同步内存的访问顺序，其中dsb是数据内存屏障，isb是指令内存屏障。接下来将执行\_\_asm\_invalidate\_tlb\_all，它定义在arch/arm/cpu/armv8/tlb.S中，代码如下：

```
ENTRY(__asm_invalidate_tlb_all)
    switch_el x9, 3f, 2f, 1f
3:  tlbi    alle3
    dsb sy
    isb
    b   0f
2:  tlbi    alle2
    dsb sy
    isb
    b   0f
1:  tlbi    vmalle1
    dsb sy
    isb
0:
    ret
ENDPROC(__asm_invalidate_tlb_all)
```

　　首先根据当前的el等级跳转到不同的标号，我们还是看EL1的情况，它执行了一条tlbi指令，用于失效tlb中的内容，然后执行了两条内存屏障操作并返回。tlb是物理地址和虚拟地址转换表的高速缓存，因为页表是存放在内存中的，若没有tlb则每次虚拟地址到物理地址的转换都需要通过访问内存来获取转换信息，显然这个速度是非常缓慢的，因此在内存和cpu之间添加了一个tlb缓存，用于存储最近的一些内存转换信息，以加速对虚拟地址的操作。与cache的情况类似，tlb的内容也可能和实际的页表出现不一致，如在页表建立之前，tlb中的内容其实都是无效数据，还有在进程上下文切换时，由于每个进程的页表是独立的，因此tlb中的内容也将会不一致，因此，在这些操作中都需要将老的tlb内容失效掉以防出现数据不一致的问题。     

　　代码返回到reset\_sctrl之后的位置，接下来会设置异常向量表，并disable trap的功能，代码如下：

```
adr x0, vectors
    switch_el x1, 3f, 2f, 1f
3:  msr vbar_el3, x0
    mrs x0, scr_el3
    orr x0, x0, #0xf            /* SCR_EL3.NS|IRQ|FIQ|EA */
    msr scr_el3, x0
    msr cptr_el3, xzr           /* Enable FP/SIMD */
#ifdef COUNTER_FREQUENCY
    ldr x0, =COUNTER_FREQUENCY
    msr cntfrq_el0, x0          /* Initialize CNTFRQ */
#endif
    b   0f
2:  msr vbar_el2, x0
    mov x0, #0x33ff
    msr cptr_el2, x0            /* Enable FP/SIMD */
    b   0f
1:  msr vbar_el1, x0
    mov x0, #3 << 20
    msr cpacr_el1, x0           /* Enable FP/SIMD */
0:
```

　　首先将vectors变量的值加载到x0寄存器中，vectors定义在arch/arm/cpu/armv8/exceptions.S中，代码如下，即其定义了cpu的异常向量表。对于arm处理器，在发生异常时就会跳转到预先定义好的异常向量表处执行，比如若发生了外部中断，中断控制器GICvx会设置irq中断线引起cpu的irq异常，此时cpu就会跳转到异常向量表中irq相关项的偏移处执行该条指令，如此处的b \_do\_bad\_irq。       
　　cpu是如何知道自己将要跳转到哪里的呢？这就是接下来代码所做的工作了。我们回到上面的代码中，当异常向量表的首地址vectors被加载到x0寄存器之后，就根据当前的异常等级跳转到相应标号处执行，在EL1时会将x0的值写入系统寄存器vbar\_el1中，

```
.align  11
    .globl  vectors
vectors:
    .align  7
    b   _do_bad_sync    /* Current EL Synchronous Thread */

    .align  7
    b   _do_bad_irq /* Current EL IRQ Thread */

    .align  7
    b   _do_bad_fiq /* Current EL FIQ Thread */

    .align  7
    b   _do_bad_error   /* Current EL Error Thread */

    .align  7
    b   _do_sync    /* Current EL Synchronous Handler */

    .align  7
    b   _do_irq     /* Current EL IRQ Handler */

    .align  7
    b   _do_fiq     /* Current EL FIQ Handler */

    .align  7
    b   _do_error   /* Current EL Error Handler */

_do_bad_sync:
    exception_entry
    bl  do_bad_sync
    b   exception_exit

_do_bad_irq:
    exception_entry
    bl  do_bad_irq
    b   exception_exit

_do_bad_fiq:
    exception_entry
    bl  do_bad_fiq
    b   exception_exit
    ...
```

　　vbar\_el1寄存器的定义如图 ，该寄存器用来保存vector的基地址，因此cpu发生异常后就可以根据保存在该寄存器中的地址值找到相应的异常向量表了。

![](https://pic2.zhimg.com/v2-dcd7e4b8ee991f9b97858549bb931411_1440w.jpg)

　　接下来将立即数3左移20位后写入cpacr\_el1中，该寄存器及其bit20/bit21的定义如下，设置这两位会关闭在EL0和EL1中SVE，SIMD和FP指令的trap功能。

![](https://picx.zhimg.com/v2-2ff99bcb253b86429b3257dd70856add_1440w.jpg)

![](https://pic2.zhimg.com/v2-f970701f8057721372c3b9009bec53a7_1440w.jpg)

　　其后的代码如下，CONFIG\_ARMV8\_SET\_SMPEN中的内容不影响总体流程，我们不做进一步分析，apply\_core\_errata只有在a-57核上才会执行，主要是fix一些问题，具体的我也没有研究过。

```
#ifdef CONFIG_ARMV8_SET_SMPEN
    switch_el x1, 3f, 1f, 1f
3:
    mrs     x0, S3_1_c15_c2_1               /* cpuectlr_el1 */
    orr     x0, x0, #0x40
    msr     S3_1_c15_c2_1, x0
1:
#endif

    /* Apply ARM core specific erratas */
    bl  apply_core_errata

    /*
     * Cache/BPB/TLB Invalidate
     * i-cache is invalidated before enabled in icache_enable()
     * tlb is invalidated before mmu is enabled in dcache_enable()
     * d-cache is invalidated before enabled in dcache_enable()
     */

    /* Processor specific initialization */
    bl  lowlevel_init
```

　　然后代码会执行lowlevel\_init，它在start.s和lowlevel\_init.S中都有定义，其中start.s中定义为weak类型，其代码如下。而lowlevel\_init.S中是强符号定义，我们再看arch/arm/cpu/armv8/Makefile，其中有一句obj-$(CONFIG\_ARCH\_SUNXI) += lowlevel\_init.o，即只有在SUNXI架构下才会使用该定义，其余架构下都是使用如下的weak定义的函数。

```
WEAK(lowlevel_init)
    mov x29, lr         /* Save LR */                      （1）

#if defined(CONFIG_GICV2) || defined(CONFIG_GICV3)
    branch_if_slave x0, 1f                                 （2）
    ldr x0, =GICD_BASE                                     （3）
    bl  gic_init_secure                                    （4）
1:
#if defined(CONFIG_GICV3)
    ldr x0, =GICR_BASE                                     （5）
    bl  gic_init_secure_percpu                             （6）
#elif defined(CONFIG_GICV2)
    ldr x0, =GICD_BASE                                     （7）
    ldr x1, =GICC_BASE                                     （8）
    bl  gic_init_secure_percpu
#endif
#endif

#ifdef CONFIG_ARMV8_MULTIENTRY                             （9）
    branch_if_master x0, x1, 2f

    /*
     * Slave should wait for master clearing spin table.
     * This sync prevent salves observing incorrect
     * value of spin table and jumping to wrong place.
     */
#if defined(CONFIG_GICV2) || defined(CONFIG_GICV3)
#ifdef CONFIG_GICV2
    ldr x0, =GICC_BASE
#endif
    bl  gic_wait_for_interrupt
#endif

    /*
     * All slaves will enter EL2 and optionally EL1.
     */
    adr x4, lowlevel_in_el2
    ldr x5, =ES_TO_AARCH64
    bl  armv8_switch_to_el2

lowlevel_in_el2:
#ifdef CONFIG_ARMV8_SWITCH_TO_EL1
    adr x4, lowlevel_in_el1
    ldr x5, =ES_TO_AARCH64
    bl  armv8_switch_to_el1

lowlevel_in_el1:
#endif

#endif /* CONFIG_ARMV8_MULTIENTRY */

2:
    mov lr, x29         /* Restore LR */                     （10）
    ret
ENDPROC(lowlevel_init)
```

（1）该函数首先将链接寄存器的值lr保存到x29中，然后根据中断控制器的型号分别处理。假设我们系统中的中断控制器为GICV3，则会执行第二步。       
（2）branch\_if\_slave 定义在rch/arm/include/asm/macro.h中，代码如下。它会读取控制寄存器mpidr\_el1的值，然后测试它的相应字段，以确定其是否slave。mpidr\_el1寄存器用于在多处理器系统中标识不同的处理器，此处就是通过对该值的判断来确定当前处理器是否为master的。为了介绍方便，后面我们都假设当前cpu为master。       
（3）若当前cpu为master，则先将GICD\_BASE的基地址加载到x0寄存器中       
（4）跳转到gic\_init\_secure宏中， 该宏的定义位于arm/lib/gic\_64.S中，它的作用是为了初始化中断控制器gic。我们知道arm处理器的外设中断是通过irq和fiq中断线触发的，实际上在arm和外设之间还有一个处理中断的设备GIC，外设中断线连接到GIC上，当其中断线触发中断时GIC就会接收到中断事件，然后它根据配置情况将该中断分发给cpu，此时cpu才进入irq或fiq异常处理中断。       
（5）和（6）设置GIC对每个cpu相关的配置       
（9）arm的多处理器相关的设置，主要是slave cpu和master cpu同步相关的操作      
（10）恢复前面保存的lr值，并返回

```
.macro  branch_if_slave, xreg, slave_label
#ifdef CONFIG_ARMV8_MULTIENTRY
    /* NOTE: MPIDR handling will be erroneous on multi-cluster machines */
    mrs \xreg, mpidr_el1
    tst \xreg, #0xff        /* Test Affinity 0 */
    b.ne    \slave_label
    lsr \xreg, \xreg, #8
    tst \xreg, #0xff        /* Test Affinity 1 */
    b.ne    \slave_label
    lsr \xreg, \xreg, #8
    tst \xreg, #0xff        /* Test Affinity 2 */
    b.ne    \slave_label
    lsr \xreg, \xreg, #16
    tst \xreg, #0xff        /* Test Affinity 3 */
    b.ne    \slave_label
#endif
.endm
```

    接下来就是start.S中的最后一段代码如下：

```
#if defined(CONFIG_ARMV8_SPIN_TABLE) && !defined(CONFIG_SPL_BUILD)          （1）
    branch_if_master x0, x1, master_cpu
    b   spin_table_secondary_jump
    /* never return */
#elif defined(CONFIG_ARMV8_MULTIENTRY)                                      （2）
    branch_if_master x0, x1, master_cpu

    /*
     * Slave CPUs
     */
slave_cpu:
    wfe
    ldr x1, =CPU_RELEASE_ADDR
    ldr x0, [x1]
    cbz x0, slave_cpu
    br  x0          /* branch to the given address */
#endif /* CONFIG_ARMV8_MULTIENTRY */
master_cpu:                                                                （3）
    bl  _main
```

（1）它只有在非spl时才执行。       
（2）它只有在多处理器时才执行，若当前cpu为master，则直接跳到（3），否则若为slave cpu，则执行wfe（wait for event）指令，该指令会让cpu休眠进入低功耗模式，此后该cpu将不再活动，直到SEV或SEVL指令唤醒它为止。因此，此后将只有master cpu会执行，而其它的cpu都进入休眠模式了。       
（3）跳转到\_main处执行，该函数的定义位于arch/arm/lib/crt0\_64.S中。它主要是初始化c语言的执行环境，crt的意思即为c run time。

### ４　SPL 代码分析2(CRT0\_64.S)

    \_main的代码如下：

```
ENTRY(_main)

/*
 * Set up initial C runtime environment and call board_init_f(0).
 */
#if defined(CONFIG_TPL_BUILD) && defined(CONFIG_TPL_NEEDS_SEPARATE_STACK)      （1）
    ldr x0, =(CONFIG_TPL_STACK)
#elif defined(CONFIG_SPL_BUILD) && defined(CONFIG_SPL_STACK)                   
    ldr x0, =(CONFIG_SPL_STACK)
#else
    ldr x0, =(CONFIG_SYS_INIT_SP_ADDR)                                         
#endif
    bic sp, x0, #0xf    /* 16-byte alignment for ABI compliance */             （2）
    mov x0, sp                                                                 （3）
    bl  board_init_f_alloc_reserve                                             （4）
    mov sp, x0                                                                 （5）
    /* set up gd here, outside any C code */
    mov x18, x0                                                                （6）
    bl  board_init_f_init_reserve                                              （7）

    mov x0, #0                                                                 （8）
    bl  board_init_f                                                           （9）

#if !defined(CONFIG_SPL_BUILD)                                                 （10）
/*
 * Set up intermediate environment (new sp and gd) and call
 * relocate_code(addr_moni). Trick here is that we'll return
 * 'here' but relocated.
 */
    ldr x0, [x18, #GD_START_ADDR_SP]    /* x0 <- gd->start_addr_sp */
    bic sp, x0, #0xf    /* 16-byte alignment for ABI compliance */
    ldr x18, [x18, #GD_BD]      /* x18 <- gd->bd */
    sub x18, x18, #GD_SIZE      /* new GD is below bd */

    adr lr, relocation_return
    ldr x9, [x18, #GD_RELOC_OFF]    /* x9 <- gd->reloc_off */
    add lr, lr, x9  /* new return address after relocation */
    ldr x0, [x18, #GD_RELOCADDR]    /* x0 <- gd->relocaddr */
    b   relocate_code

relocation_return:

/*
 * Set up final (full) environment
 */
    bl  c_runtime_cpu_setup     /* still call old routine */
#endif /* !CONFIG_SPL_BUILD */
#if defined(CONFIG_SPL_BUILD)                                               （11）
    bl  spl_relocate_stack_gd           /* may return NULL */               （12）
    /*
     * Perform 'sp = (x0 != NULL) ? x0 : sp' while working
     * around the constraint that conditional moves can not
     * have 'sp' as an operand
     */
    mov x1, sp                                                              （13）
    cmp x0, #0                                                              （14）
    csel    x0, x0, x1, ne                                                  （15）
    mov sp, x0                                                              （16）
#endif

/*
 * Clear BSS section
 */
    ldr x0, =__bss_start        /* this is auto-relocated! */               （17）
    ldr x1, =__bss_end          /* this is auto-relocated! */
clear_loop:                                                                 （18）
    str xzr, [x0], #8                                                       （19）
    cmp x0, x1                                                              （20）
    b.lo    clear_loop                                                      （21）

    /* call board_init_r(gd_t *id, ulong dest_addr) */
    mov x0, x18             /* gd_t */                                      （22）
    ldr x1, [x18, #GD_RELOCADDR]    /* dest_addr */                         （23）
    b   board_init_r            /* PC relative jump */                      （24）

    /* NOTREACHED - board_init_r() does not return */

ENDPROC(_main)
```

（1）将配置文件中设置的栈指针地址加载到x0寄存器中，在spl中应该是CONFIG\_SPL\_STACK的值，它一般位于include/configs/xxx中。       
（2）将x0寄存器中的值清除低4位，使其16字节对齐，然后将它存入栈指针寄存器sp中，在armv8中栈指针寄存器为x31。       
（3）由于sp中的值是做过对齐操作的，因此将其保存到x0中作为函数传参，在armv8中x0 - x7寄存器可以用于函数传参，其中x0为第一个参数。       
（4）调用board\_init\_f\_alloc\_reserve函数，它定义在common/init/board\_init.c中，代码如下。即若定义了early malloc功能，则为malloc预留一些内存，其中top就是通过x0传入的参数，由于栈是向低地址伸展的，因此将高地址留给early malloc，只需要将栈地址往下移即可。在保留过之后，继续将新的指针做16字节对齐。该函数是一个c语言实现，由于c语言需要栈的支持，而上面的第二步已经设置了栈指针，因此调用该函数不会有问题。

```
ulong board_init_f_alloc_reserve(ulong top)
{
    /* Reserve early malloc arena */
#if CONFIG_VAL(SYS_MALLOC_F_LEN)
    top -= CONFIG_VAL(SYS_MALLOC_F_LEN);
#endif
    /* LAST : reserve GD (rounded up to a multiple of 16 bytes) */
    top = rounddown(top-sizeof(struct global_data), 16);

    return top;
}
```

（5）将新的指针地址保存到SP中，以更新栈指针       
（6）将x0的值暂存到x18中，以腾出x0寄存器。由于栈是向低地址伸展，而步骤7介绍的gd是向高地址伸展的，因此它是栈顶指针，同时也是gd的基地址。因此，后续若需要使用gd，则可以直接从x18寄存器中取得它的指针。       
（7）board\_init\_f\_init\_reserve也是定义在common/init/board\_init.c中，代码如下。base参数由x0传入，即当前的栈指针，将它作为gd的基地址，然后将gd到gd + sizeof（gd）之间的地址分配给global data并清空该段内存。将base指针更新为(align 16)(gd + sizeof（gd）)的位置。       
　　我们知道，若前面保留了early malloc地址，则gd就被分配到early malloc的最低地址处，否则它会被分配到以sp为基地址的位置，因此若定义了early malloc，则需要更新malloc指针。因此这步的主要工作是在early malloc区域或者sp以上的区域为gd保留并清空一段内存空间，若是从early malloc中分配的，则随之更新malloc指针，更新后的内存布局如下图所示。

![](https://pic4.zhimg.com/v2-2ef2a0f74cd49375e74f2997f3250613_1440w.jpg)

```
void board_init_f_init_reserve(ulong base)
{
    struct global_data *gd_ptr;

    /*
     * clear GD entirely and set it up.
     * Use gd_ptr, as gd may not be properly set yet.
     */

    gd_ptr = (struct global_data *)base;
    /* zero the area */
    memset(gd_ptr, '\0', sizeof(*gd));
    /* set GD unless architecture did it already */
#if !defined(CONFIG_ARM)
    arch_setup_gd(gd_ptr);
#endif
    /* next alloc will be higher by one GD plus 16-byte alignment */
    base += roundup(sizeof(struct global_data), 16);

    /*
     * record early malloc arena start.
     * Use gd as it is now properly set for all architectures.
     */

#if CONFIG_VAL(SYS_MALLOC_F_LEN)
    /* go down one 'early malloc arena' */
    gd->malloc_base = base;
    /* next alloc will be higher by one 'early malloc arena' size */
    base += CONFIG_VAL(SYS_MALLOC_F_LEN);
#endif
}
```

（8）将立即数0放入x0寄存器，作为参数传给board\_init\_f函数       
（9）执行board\_init\_f函数，该函数的定义在arch/arm/lib/spl.c中，代码如下：

```
void __weak board_init_f(ulong dummy)
{
}
```

    该函数是一个空函数，但也带有\_\_weak关键字。与我们上面分析的一样，它是一个弱函数，因此各平台可以根据自己的实际需求对其进行重定义。我们选取位于arch/arm/cpu/armv8/fsl-layerscape/spl.c中的定义为例，代码如下：

```
void board_init_f(ulong dummy)
{
    /* Clear global data */
    memset((void *)gd, 0, sizeof(gd_t));                                   （a）
    board_early_init_f();                                                  （b）
    timer_init();                                                          （c）
#ifdef CONFIG_ARCH_LS2080A                                                 （d）
    env_init();
#endif
    get_clocks();                                                          （e）

    preloader_console_init();                                              （f）

#ifdef CONFIG_SPL_I2C_SUPPORT                                              （g）
    i2c_init_all();
#endif
    dram_init();                                                           （h）
}
```

    该函数主要做一些board基本功能相关的初始化。如清空gd内存，定时器的初始化，获取系统时钟，总线时钟频率，console的初始化以及ddr的初始化等。下面对各步骤做一简要介绍：       
　（a）清空gd的内存。其中gd的定义位于arch/arm/include/asm/global\_data.h中，它会从x18寄存器中获取gd指针，具体代码比较简单，这里不贴了。       
　（b）这个函数是每个board特定的一些初始化操作。       
　（c）定时器的初始化，对于fsl-layerscape平台其定义位于arch/arm/cpu/armv8/fsl-layerscape/cpu.c中，感兴趣的同学可以自行参阅。       
　（d）与特定的配置相关       
　（e）获取时钟频率，该函数的定义位于arch/arm/cpu/armv8/fsl-layerscape/fsl\_lsch2\_speed.c（fsl\_lsch3\_speed.c）中，它的主要功能是获取处理器0的cpu时钟频率，总线时钟频率和ddr时钟频率等。  
　（f）该函数用于初始化串口，其定义位于common/spl/spl.c中，代码如下。它首先根据配置信息设置串口的波特率，然后调用serial\_init函数初始化串口，初始化完成后串口就可以输出信息了，此时设置gd的have\_console标志，后续的代码可以通过判断该标志来确定当前串口是否可用，最后若设置了相关配置，则打印一些spl相关的信息。

```
void preloader_console_init(void)
{
    gd->baudrate = CONFIG_BAUDRATE;

    serial_init();      /* serial communications setup */

    gd->have_console = 1;

#if CONFIG_IS_ENABLED(BANNER_PRINT)
    puts("\nU-Boot " SPL_TPL_NAME " " PLAIN_VERSION " (" U_BOOT_DATE " - "
         U_BOOT_TIME " " U_BOOT_TZ ")\n");
#endif
#ifdef CONFIG_SPL_DISPLAY_PRINT
    spl_display_print();
#endif
}
```

　（g）与特定配置相关，不做介绍。       
　（h）ddr相关的初始化，对于fsl-layerscape平台会获取dram的size，并将其存放到gd->ram\_size中       
　　回到\_main中，步骤（10）是uboo重定位流程，其在SPL时不执行，故此处对其不做分析。因为start.s和crt0\_64.s都是spl和uboot共用的，故相关函数只是通过相应的宏定义来控制代码的执行流程。       
（12）spl\_relocate\_stack\_gd，该函数定义在common/spl/spl.c中。前面我们说过spl一般是运行在sram中，且此时的栈和gd数据都存放在sram中。但是现在ddr已经初始化完成，这时ddr已经可用，我们可以将其栈和gd重定位到ddr中。重定位的主要过程就是将栈指针，gd指针，malloc指针等设置到位于ddr中的新地址处，然后将老的gd数据等拷贝到新地址处。       
（13）-（16）注释写的很清楚，将x0和立即数0比较，若其不等于0（NULL），则将sp设置为等于x0，否则保持原来的值不变，即根据上面步骤（12）的结果来确定是否更新栈指针。       
（17）-（21）将bss段的内容清空。其中bss段的起始地址bss\_start 和结束地址bss\_end定义在spl的链接脚本arch/arm/cpu/armv8/u-boot-spl.lds中。其中循环的执行步骤为：       
　　str xzr, \[x0\], #8 ：xzr为0寄存器（x zero register），任何读该寄存器的操作都会返回0,。因此这条指令的含义是将0写入x0寄存器中内容为地址的内存中，然后x0 = x0 + 8.。由于xzr是64位寄存器，因此每次可以操作8个字节。       
　　cmp x0, x1：比较x0和x1寄存器的内容，用来判断循环的退出条件      
　　b.lo clear\_loop：实际执行判断，当x0小于x1，即若未执行到bss段的结束地址（\_\_bss\_end）时，继续跳转到clear\_loop标号处执行循环，否则结束循环。       
（22）该操作将gd指针放入x0寄存器中，以作为参数传给board\_init\_r函数。       
（23）将x18 + GD\_RELOCADDR地址的内容加载到x1中       
（14）调用board\_init\_r函数，此处跳转命令为b，而不是bl，因此它不会再返回。board\_init\_r定义在common/spl/spl.c中，主要作用是进行一些必要的初始化工作，然后根据相关的配置情况，加载并启动下一阶段的镜像（一般为uboot）。由于该部分代码逻辑比较清晰，此处不再过多赘述。       
　　至此，spl相关的代码分析基本完成了。由于很多地方都是个人的一些理解，故难免会有偏差或者错误之处，对于表述不正确的内容敬请指正，多谢。

编辑于 2022-07-25 20:52[PMP3A通关秘笈！速收藏！内含PMP培训机构推荐](https://zhuanlan.zhihu.com/p/668188601)

[

今天我想和大家分享一下我的PMP上岸经验，这些是我整理的最重要的干货，希望能帮到正在备考的你们。 \[图片\] 1、...

](https://zhuanlan.zhihu.com/p/668188601)