---
title: "uboot-3链接脚本和第一阶段启动"
source: "https://zhuanlan.zhihu.com/p/2025984378291921529"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "本篇开始进入uboot启动的分析，先分析下 lds链接文件，然后就是从汇编语言开始进行启动分析。1. 启动的两个过程简介UBoot其启动过程主要可以分为两个部分，Stage1和Stage2 。 其中Stage1是用汇编语言实现的，主要…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

4 人赞同了该文章

![](https://pic2.zhimg.com/v2-a9613115e9b981c75503739563f06649_1440w.jpg)

本篇开始进入uboot启动的分析，先分析下 **[lds链接文件](https://zhida.zhihu.com/search?content_id=272874928&content_type=Article&match_order=1&q=lds%E9%93%BE%E6%8E%A5%E6%96%87%E4%BB%B6&zhida_source=entity)** ，然后就是从 **汇编语言** 开始进行启动分析。

## 1\. 启动的两个过程简介

![](https://picx.zhimg.com/v2-6439845ae930ef7fabba423f894b9beb_1440w.jpg)

UBoot其启动过程主要可以分为两个部分，Stage1和Stage2 。

其中Stage1是用汇编语言实现的，主要完成 **硬件资源的初始化** 。

而Stage2则是用C语言实现，主要完成 **内核程序的调用** 。这两个部分的主要执行流程如下：

**stage1** 包含以下步骤：

1. 硬件设备初始化
2. 为加载stage2准备RAM空间
3. 拷贝stage2的代码到RAM空间
4. 设置好堆栈
5. 跳转到stage2的C语言入口点

**stage2** 一般包括以下步骤：

1. 初始化本阶段要使用的硬件设备
2. 检测系统内存映射
3. 将kernel映射和根文件系统映射从Flash读到RAM空间中
4. 为内核设置启动参数
5. 调用内核

## 2\. u-boot的链接脚本

![](https://pic1.zhimg.com/v2-0e73d8f76e33bc587ab24bed89059f16_1440w.jpg)

> 启动的入口怎么找？  
> 这个肯定要从链接脚本里面找 **ENTRY(XXX)** ，在 [armv8](https://zhida.zhihu.com/search?content_id=272874928&content_type=Article&match_order=1&q=armv8&zhida_source=entity) 中，u-boot使用arch/arm/cpu/armv8/ **u-boot.lds** 进行链接。u-boot-spl和u-boot-tpl使用arch/arm/cpu/armv8/ [u-boot-spl.lds](https://zhida.zhihu.com/search?content_id=272874928&content_type=Article&match_order=1&q=u-boot-spl.lds&zhida_source=entity) 进行链接，因为每个board的情况可能不同，所以u-boot可以通过 **Kconfig** 来自定义u-boot-spl.lds和 [u-boot-tpl.lds](https://zhida.zhihu.com/search?content_id=272874928&content_type=Article&match_order=1&q=u-boot-tpl.lds&zhida_source=entity) 。

在进行源码分析之前，首先看看u-boot的 **链接脚本** ，通过链接脚本可以从整体了解一个u-boot的组成，并且可以在启动分析中知道某些逻辑是在完成什么工作。

## 2.1 u-boot.lds

```
/* SPDX-License-Identifier: GPL-2.0+ */
/*
 * (C) Copyright 2013
 * David Feng <fenghua@phytium.com.cn>
 *
 * (C) Copyright 2002
 * Gary Jennejohn, DENX Software Engineering, <garyj@denx.de>
 */

#include <config.h>
#include <asm/psci.h>

OUTPUT_FORMAT("elf64-littleaarch64", "elf64-littleaarch64", "elf64-littleaarch64")
OUTPUT_ARCH(aarch64)
ENTRY(_start) -------------------------------------------------------------------- (1)
/*
 *（1）首先定义了二进制程序的输出格式为"elf64-littleaarch64"，
 *    架构是"aarch64"，程序入口为"_start"符号；
 */
SECTIONS
{
#ifdef CONFIG_ARMV8_SECURE_BASE -------------------------------------------------- (2)
/*
 *（2）ARMV8_SECURE_BASE是u-boot对PSCI的支持，在定义时可以将PSCI的文本段，
 *    数据段，堆栈段重定向到指定的内存，而不是内嵌到u-boot中。
 *    不过一般厂商实现会使用atf方式使其与bootloader分离，这个功能不常用；
 */
    /DISCARD/ : { *(.rela._secure*) }
#endif
    . = 0x00000000; -------------------------------------------------------------- (3)
/*
 *（3）定义了程序链接的基地址，默认是0，通过配置CONFIG_SYS_TEXT_BASE可修改
 *    这个默认值。
 */
    . = ALIGN(8);
    .text :
    {
        *(.__image_copy_start) --------------------------------------------------- (4)
/*
 *（4）__image_copy_start和__image_copy_end用于定义需要重定向的段，
 *    u-boot是一个分为重定向前初始化和重定向后初始化的bootloader，
 *    所以此处会定义在完成重定向前初始化后需要搬运到ddr中数据的起始地址和结束地址；
 *
 *    大多数时候u-boot是运行在受限的sram或者只读的flash上，
 *    u-boot为了启动流程统一会在ddr未初始化和重定位之前不去访问全局变量，
 *    但是又为了保证u-boot能够正常读写全局变量，内存，调用各类驱动能力，
 *    所以u-boot将启动初始化分为了两个部分，重定向前初始化board_f和
 *    重定向后初始化board_r，在重定向之前完成一些必要初始化，
 *    包括可能的ddr初始化，然后通过__image_copy_start和__image_copy_end
 *    将u-boot搬运到ddr中，并在ddr中进行重定向后初始化，这个时候的u-boot就可以
 *    正常访问全局变量等信息了。
 * 
 *    如果想要在board_f过程中读写一些全局变量信息该怎么办呢？
 *    u-boot通过定义global_data（gd）来完成此功能，
 *    后续在分析到时会详细讲解实现方式。
 */
        CPUDIR/start.o (.text*) -------------------------------------------------- (5)
/*
 *（5）定义了链接程序的头部文本段，armv8就是
 *    arch/arm/cpu/armv8/start.S， 
 *    start.S中所有文本段将会链接到此段中并且段入口符号就是_start；
 */
    }

    /* This needs to come before *(.text*) */
    .efi_runtime : { ------------------------------------------------------------ (6)
/*
 *（6）在定义了efi运行时相关支持时才会出现使用的段，一般不用关心；
 */
        __efi_runtime_start = .;
        *(.text.efi_runtime*)
        *(.rodata.efi_runtime*)
        *(.data.efi_runtime*)
        __efi_runtime_stop = .;
    }

    .text_rest : ---------------------------------------------------------------- (7)
/*
 *（7）除了start.o，其他的所有文本段将会链接到此段中；
 */
    {
        *(.text*)
    }

#ifdef CONFIG_ARMV8_PSCI -------------------------------------------------------- (8)
/*
 *（8）同（2），是PSCI相关功能的支持，一般不会使用；
 */
    .__secure_start :
#ifndef CONFIG_ARMV8_SECURE_BASE
        ALIGN(CONSTANT(COMMONPAGESIZE))
#endif
    {
        KEEP(*(.__secure_start))
    }

#ifndef CONFIG_ARMV8_SECURE_BASE
#define CONFIG_ARMV8_SECURE_BASE
#define __ARMV8_PSCI_STACK_IN_RAM
#endif
    .secure_text CONFIG_ARMV8_SECURE_BASE :
        AT(ADDR(.__secure_start) + SIZEOF(.__secure_start))
    {
        *(._secure.text)
        . = ALIGN(8);
        __secure_svc_tbl_start = .;
        KEEP(*(._secure_svc_tbl_entries))
        __secure_svc_tbl_end = .;
    }

    .secure_data : AT(LOADADDR(.secure_text) + SIZEOF(.secure_text))
    {
        *(._secure.data)
    }

    .secure_stack ALIGN(ADDR(.secure_data) + SIZEOF(.secure_data),
                CONSTANT(COMMONPAGESIZE)) (NOLOAD) :
#ifdef __ARMV8_PSCI_STACK_IN_RAM
        AT(ADDR(.secure_stack))
#else
        AT(LOADADDR(.secure_data) + SIZEOF(.secure_data))
#endif
    {
        KEEP(*(.__secure_stack_start))

        . = . + CONFIG_ARMV8_PSCI_NR_CPUS * ARM_PSCI_STACK_SIZE;

        . = ALIGN(CONSTANT(COMMONPAGESIZE));

        KEEP(*(.__secure_stack_end))
    }

#ifndef __ARMV8_PSCI_STACK_IN_RAM
    . = LOADADDR(.secure_stack);
#endif

    .__secure_end : AT(ADDR(.__secure_end)) {
        KEEP(*(.__secure_end))
        LONG(0x1d1071c);    /* Must output something to reset LMA */
    }
#endif

    . = ALIGN(8);
    .rodata : { *(SORT_BY_ALIGNMENT(SORT_BY_NAME(.rodata*))) } ------------------- (9)
/*
 *（9）所有仅读数据将会在这个段中对齐排序存放好；
 */

    . = ALIGN(8);
    .data : { -------------------------------------------------------------------- (10)
/*
 *（10）所有数据段将会链接到此段中；
 */
        *(.data*)
    }

    . = ALIGN(8);

    . = .;

    . = ALIGN(8);
    .u_boot_list : { ------------------------------------------------------------- (11)
/*
 *（11）u_boot_list段定义了系统中当前支持的所有命令和设备驱动，此段把散落在各个文件中
 *     通过U_BOOT_CMD的一系列拓展宏定义的命令和U_BOOT_DRIVER的拓展宏定义的设备驱动收集到一起，
 *     并按照名字排序存放，以便后续在命令行快速检索到命令并执行和检测注册的设备和设备树匹配
 *     probe设备驱动初始化；（设备驱动的probe只在定义了dm模块化驱动时有效）
 */
        KEEP(*(SORT(.u_boot_list*)));
    }

    . = ALIGN(8);

    .efi_runtime_rel : {
                __efi_runtime_rel_start = .;
        *(.rel*.efi_runtime)
        *(.rel*.efi_runtime.*)
                __efi_runtime_rel_stop = .;
    }

    . = ALIGN(8);

    .image_copy_end :
    {
        *(.__image_copy_end)
    }

    . = ALIGN(8);

    .rel_dyn_start : -------------------------------------------------------- (12)
/*
 *（12）一般u-boot运行时是根据定义的基地址开始执行，如果加载地址和链接地址
 *     不一致则会出现不能执行u-boot的问题。通过一个
 *     配置CONFIG_POSITION_INDEPENDENT即可打开地址无关功能，
 *     此选项会在链接u-boot时添加-PIE参数。此参数会在u-boot ELF文件中
 *     生成rela*段，u-boot通过读取此段中表的相对地址值与实际运行时地址值
 *     依次遍历进行修复当前所有需要重定向地址，使其可以实现地址无关运行；
 *     即无论链接基地址如何定义，u-boot也可以在任意ram地址
 *     运行（一般需要满足最低4K或者64K地址对齐）；
 * 
 *     注意此功能只能在sram上实现，因为此功能会在运行时修改文本段数据段中的地址，
 *     如果此时运行在片上flash，则不能写flash，导致功能失效无法实现地址无关；
 */
    {
        *(.__rel_dyn_start)
    }

    .rela.dyn : {
        *(.rela*)
    }

    .rel_dyn_end :
    {
        *(.__rel_dyn_end)
    }

    _end = .;

    . = ALIGN(8);

    .bss_start : { -------------------------------------------------------- (13)
/*
 *（13）bbs段：存放程序中未初始化的全局数据和静态数据；
 */
        KEEP(*(.__bss_start));
    }

    .bss : {
        *(.bss*)
         . = ALIGN(8);
    }

    .bss_end : {
        KEEP(*(.__bss_end));
    }

    /DISCARD/ : { *(.dynsym) } -------------------------------------------- (14)
/*
 *（14）一些在链接时无用需要丢弃的段；
 */
    /DISCARD/ : { *(.dynstr*) }
    /DISCARD/ : { *(.dynamic*) }
    /DISCARD/ : { *(.plt*) }
    /DISCARD/ : { *(.interp*) }
    /DISCARD/ : { *(.gnu*) }

#ifdef CONFIG_LINUX_KERNEL_IMAGE_HEADER ----------------------------------- (15)
/*
 *（15）在efi加载时会很有用，主要在u-boot的二进制头部添加了一些头部信息，
 *     包括大小端，数据段文本段大小等，以便于efi相关的加载器读取信息，
 *     此头部信息来自于Linux arm64的Image的头部信息；该头部也不属于u-boot的
 *     一部分只是被附加上去的；
 */
#include "linux-kernel-image-header-vars.h"
#endif
}
```

\_start 在文件 arch/arm/lib/ **vectors.S** 中有定义

```
.globl _start
    .section ".vectors", "ax"
_start:
#ifdef CFG_SYS_DV_NOR_BOOT_CFG
    .word    CFG_SYS_DV_NOR_BOOT_CFG
#endif
    ARM_VECTORS
#endif /* !defined(CONFIG_ENABLE_ARM_SOC_BOOT0_HOOK) */

#if !CONFIG_IS_ENABLED(SYS_NO_VECTOR_TABLE)
    .globl  _reset
    .globl    _undefined_instruction //未定义的指令异常 0x4
    .globl    _software_interrupt // 软件中断异常 0x8
    .globl    _prefetch_abort
    .globl    _data_abort //数据异常
    .globl    _not_used
    .globl    _irq //中断IRQ异常 
    .globl    _fiq //快速中断FIQ异常
```

arch/arm/cpu/armv8/ **start.S** 中定义了reset

```
reset:
    /* Allow the board to save important registers */
    b    save_boot_params
.globl    save_boot_params_ret
save_boot_params_ret:
```

armv8的异常向量表格式如下：

![](https://pic4.zhimg.com/v2-204d14c00df4424888ee260586a1605f_1440w.jpg)

向量表定义在arch/arm/cpu/armv8/ **exceptions.S** 中

## 2.2 u-boot-spl.lds

此链接脚本是标准的 **spl链接脚本** ，还包含了u\_boot\_list段，如果对应自己board不需要命令行或者模块化驱动设备，只作为一个加载器则可以自定义更简略的链接脚本。

```
MEMORY { .sram : ORIGIN = IMAGE_TEXT_BASE, ---------------------------------------- (1)
/*
 *（1）>XXX 的形式可以将指定段放入XXX规定的内存中；一般u-boot-spl只有
 *    很小的可运行内存块，所以spl中会舍去大量不需要用的段只保留关键的
 *    文本段数据段等，并且通过>.sram的形式将不在ddr初始化前用到的段定义到sdram中，
 *    后续只需在完成ddr初始化后将这些段搬运到ddr中即可，而不需要额外的
 *    地址修复逻辑，如下：有一个sram 0x18000-0x19000，
 *    一个sdram 0x80000000 - 0x90000000，
 *    那么通过>.sram方式则map文件可能如下：
 *       0x18000 stext
 *       ...
 *       0x18100 sdata
 *       ...
 *       0x80000000 sbss
 *       ...
 */
        LENGTH = IMAGE_MAX_SIZE }
MEMORY { .sdram : ORIGIN = CONFIG_SPL_BSS_START_ADDR,
        LENGTH = CONFIG_SPL_BSS_MAX_SIZE }

OUTPUT_FORMAT("elf64-littleaarch64", "elf64-littleaarch64", "elf64-littleaarch64")
OUTPUT_ARCH(aarch64)
ENTRY(_start) -------------------------------------------------------------------- (2)
/*
 *（2）同u-boot.lds一致，共用一套逻辑入口_start；
 */
SECTIONS
{
    .text : {
        . = ALIGN(8);
        *(.__image_copy_start) -------------------------------------------------- (3)
/*
 *（3）同样的，如果spl需要重定向则会使用此段定义，大多数情况下spl中会用上重定向；
 */
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

#ifdef CONFIG_SPL_RECOVER_DATA_SECTION ---------------------------------------- (4)
/*
 *（4）SPL_RECOVER_DATA_SECTION段用于保存数据段数据，
 *    一些board在初始化时修改data段数据，并在后续某个阶段
 *    从此段中恢复data的原始数据；
 */
    .data_save : {
        *(.__data_save_start)
        . = SIZEOF(.data);
        *(.__data_save_end)
    } >.sram
#endif

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
    } >.sdram -------------------------------------------------------------- (5)
/*
 *（5）将bss段数据定义到>.sdram中，即可在初始化ddr后直接对此段地址清零
 *    即可使用全局未初始化变量，并且不会带来副作用。
 */

    .bss (NOLOAD) : {
        *(.bss*)
         . = ALIGN(8);
    } >.sdram

    .bss_end (NOLOAD) : {
        KEEP(*(.__bss_end));
    } >.sdram

    /DISCARD/ : { *(.rela*) }
    /DISCARD/ : { *(.dynsym) }
    /DISCARD/ : { *(.dynstr*) }
    /DISCARD/ : { *(.dynamic*) }
    /DISCARD/ : { *(.plt*) }
    /DISCARD/ : { *(.interp*) }
    /DISCARD/ : { *(.gnu*) }
}
```

从上述的链接脚本可以看出，armv8的u-boot的启动是从arch/arm/cpu/armv8/start.S中的\_start开始的，并在后续初始化中调用了很多链接脚本中定义的地址符号表。

## 3\. 第一阶段启动

![](https://picx.zhimg.com/v2-6439845ae930ef7fabba423f894b9beb_1440w.jpg)

## 3.1 armv8/start.S

arch/arm/cpu/armv8/start.S中定义了\_start

```
.globl    _start
_start:
#if defined(CONFIG_LINUX_KERNEL_IMAGE_HEADER)
#include <asm/boot0-linux-kernel-header.h>
#elif defined(CONFIG_ENABLE_ARM_SOC_BOOT0_HOOK)
/*
 * Various SoCs need something special and SoC-specific up front in
 * order to boot, allow them to set that in their boot0.h file and then
 * use it here.
 */
#include <asm/arch/boot0.h>
#else
    b    reset
#endif
```

\_start 开始的是 **中断向量表** ，在arch/arm/lib/ **vectors.S** 中定义。之后是跳转到 **reset** 开始执行。 reset如下：

```
reset:
    /* Allow the board to save important registers */
    b    save_boot_params
.globl    save_boot_params_ret
save_boot_params_ret:
```

**save\_boot\_params** 函数调用了save\_boot\_params\_ret 函数 先进行校验\_start地址是否4K对齐，然后继续执行pie\_fixup

```
pie_fixup:
    adr    x0, _start        /* x0 <- Runtime value of _start */
    ldr    x1, _TEXT_BASE        /* x1 <- Linked value of _start */
    subs    x9, x0, x1        /* x9 <- Run-vs-link offset */
    beq    pie_fixup_done
    adrp    x2, __rel_dyn_start     /* x2 <- Runtime &__rel_dyn_start */
    add     x2, x2, #:lo12:__rel_dyn_start
    adrp    x3, __rel_dyn_end       /* x3 <- Runtime &__rel_dyn_end */
    add     x3, x3, #:lo12:__rel_dyn_end
pie_fix_loop:
    ldp    x0, x1, [x2], #16    /* (x0, x1) <- (Link location, fixup) */
    ldr    x4, [x2], #8        /* x4 <- addend */
    cmp    w1, #1027        /* relative fixup? */
    bne    pie_skip_reloc
    /* relative fix: store addend plus offset at dest location */
    add    x0, x0, x9
    add    x4, x4, x9
    str    x4, [x0]
pie_skip_reloc:
    cmp    x2, x3
    b.lo    pie_fix_loop
pie_fixup_done:
    /* Apply ARM core specific erratas */
    bl    apply_core_errata

    /*
     * Cache/BPB/TLB Invalidate
     * i-cache is invalidated before enabled in icache_enable()
     * tlb is invalidated before mmu is enabled in dcache_enable()
     * d-cache is invalidated before enabled in dcache_enable()
     */

    /* Processor specific initialization */
    bl    lowlevel_init
        
#if defined(CONFIG_ARMV8_SPIN_TABLE) && !defined(CONFIG_SPL_BUILD)
    branch_if_master x0, master_cpu
    b    spin_table_secondary_jump
    /* never return */
#elif defined(CONFIG_ARMV8_MULTIENTRY)
    branch_if_master x0, master_cpu

    /*
     * Slave CPUs
     */
slave_cpu:
    wfe
    ldr    x1, =CPU_RELEASE_ADDR
    ldr    x0, [x1]
    cbz    x0, slave_cpu
    br    x0            /* branch to the given address */
#endif /* CONFIG_ARMV8_MULTIENTRY */
master_cpu:
    msr    SPSel, #1        /* make sure we use SP_ELx */
    bl    _main
```

**lowlevel\_init** 的定义：

```
WEAK(lowlevel_init)
    mov    x29, lr            /* Save LR */

#if defined(CONFIG_GICV2) || defined(CONFIG_GICV3)
    branch_if_slave x0, 1f
    ldr    x0, =GICD_BASE
    bl    gic_init_secure
1:
#if defined(CONFIG_GICV3)
    ldr    x0, =GICR_BASE
    bl    gic_init_secure_percpu
#elif defined(CONFIG_GICV2)
    ldr    x0, =GICD_BASE
    ldr    x1, =GICC_BASE
    bl    gic_init_secure_percpu
#endif
#endif
```

（1）该函数首先将链接寄存器的值lr保存到x29中，然后根据中断控制器的型号分别处理。假设我们系统中的中断控制器为GICV3，则会执行第二步。    （2）branch\_if\_slave 定义在rch/arm/include/asm/macro.h中，代码如下。它会读取控制寄存器mpidr\_el1的值，然后测试它的相应字段，以确定其是否slave。mpidr\_el1寄存器用于在多处理器系统中标识不同的处理器，此处就是通过对该值的判断来确定当前处理器是否为master的。为了介绍方便，后面我们都假设当前cpu为master。    （3）若当前cpu为master，则先将GICD\_BASE的基地址加载到x0寄存器中     （4）跳转到gic\_init\_secure宏中， 该宏的定义位于arm/lib/gic\_64.S中，它的作用是为了初始化中断控制器gic。我们知道arm处理器的外设中断是通过irq和fiq中断线触发的，实际上在arm和外设之间还有一个处理中断的设备GIC，外设中断线连接到GIC上，当其中断线触发中断时GIC就会接收到中断事件，然后它根据配置情况将该中断分发给cpu，此时cpu才进入irq或fiq异常处理中断。    （5）和（6）设置GIC对每个cpu相关的配置     （9）arm的多处理器相关的设置，主要是slave cpu和master cpu同步相关的操作    （10）恢复前面保存的lr值，并返回

reset总结如下：

（1）save\_boot\_params保存 **上一级镜像传入的参数** ，该函数由平台自行定义

（2）若支持pie则检查代码段是否为 **4k对齐** （因为由于指令集中操作数长度的限制，adr等类型指令的寻址范围是需要4k对齐的）

（3）pie\_fixup为pie **重定位全局地址** 相关的.rela.dyn段内容

（4）reset\_sctrl根据配置确定是否重设 **sctlr寄存器**

（5）为uboot设置 **异常向量表** 。spl和uboot异常向量表设置有以下不同：

（6）若配置了COUNTER\_FREQUENCY选项，则根据当前正在运行的异常等级，确定是否要设置cpu的 **system counter的频率** 。由于system counter的频率是所有异常等级共享的，为了确保该频率不被随意修改，因此约定只有运行于最高异常等级时才允许修改该寄存器

（7）若设置了配置选项CONFIG\_ARMV8\_SET\_SMPEN，则设置S3\_1\_c15\_c2\_1以使能cpu之间的数据一致性

（8）apply\_core\_errata用于处理cpu的errata

（9）lowlevel\_init流程可参考spl启动分析

（10）secondary cpu处理流程

（11）\_main的定义位于arch/arm/lib/crt0\_64.S

## 3.2 \_main

arch/arm/lib/crt0\_64.S中定义。

在进入c语言之前，我们需要为其 **准备好C语言运行环境** ，以及做好 **内存规划** ，这其中除了栈和堆内存之外，还需要为gd结构体分配内存空间。

**gd是uboot中的一个global\_data类型全局变量** ，该变量包含了很多全局相关的参数，为各模块之间参数的传递和共享提供了方便。由于该变量在跳转到c流程之前就需要准备好，此时堆管理器尚未被初始化，所以其内存需要通过手工管理方式分配。以下为uboot内存规划相关代码：

```
/*
 * Set up initial C runtime environment and call board_init_f(0).
 */
#if defined(CONFIG_TPL_BUILD) && defined(CONFIG_TPL_NEEDS_SEPARATE_STACK)
    ldr    x0, =(CONFIG_TPL_STACK)
#elif defined(CONFIG_SPL_BUILD) && defined(CONFIG_SPL_STACK)
    ldr    x0, =(CONFIG_SPL_STACK)
#elif defined(CONFIG_INIT_SP_RELATIVE)
#if CONFIG_POSITION_INDEPENDENT
    adrp    x0, __bss_start     /* x0 <- Runtime &__bss_start */
    add    x0, x0, #:lo12:__bss_start
#else
    adr    x0, __bss_start
#endif
    add    x0, x0, #CONFIG_SYS_INIT_SP_BSS_OFFSET
#else
    ldr    x0, =(SYS_INIT_SP_ADDR) //获取uboot的初始栈地址 
#endif
    bic    sp, x0, #0xf //为了遵循ABI规范，栈地址需要16字节对齐
    mov    x0, sp //读取 sp 到寄存器 x0 里面，作为下面函数的入参
    bl    board_init_f_alloc_reserve //gd和early malloc分配内存
    mov    sp, x0 //将预留后的内存地址设置为新的栈地址
    /* set up gd here, outside any C code */
    mov    x18, x0 //将gd地址保存到x18寄存器中
    bl    board_init_f_init_reserve //初始化gd，和设置early malloc的堆管理器基地址

#if defined(CONFIG_DEBUG_UART) && CONFIG_IS_ENABLED(SERIAL)
    bl    debug_uart_init
#endif

    mov    x0, #0
    bl    board_init_f
```

**board\_init\_f\_alloc\_reserve** 在common/init/board\_init.c中定义

```
ulong board_init_f_alloc_reserve(ulong top)
{
    /* Reserve early malloc arena */
#ifndef CFG_MALLOC_F_ADDR
#if CONFIG_VAL(SYS_MALLOC_F_LEN)
    top -= CONFIG_VAL(SYS_MALLOC_F_LEN); //为早期堆管理器预留内存
#endif
#endif
    /* LAST : reserve GD (rounded up to a multiple of 16 bytes) */
    top = rounddown(top-sizeof(struct global_data), 16); //为gd预留内存

    return top;
}
```

#define CONFIG\_SYS\_MALLOC\_F\_LEN 0x2000在 include/generated/autoconf.h 中定义，默认是8KB。函数的返回值是新的top值。预留后的地址如下图：

![](https://pic4.zhimg.com/v2-70ab2df68b34d47f50f7998bbfcc405f_1440w.jpg)

**board\_init\_f\_init\_reserve** 的定义如下：

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
    memset(gd_ptr, '\0', sizeof(*gd)); //初始化gd清零
    /* set GD unless architecture did it already */
#if !defined(CONFIG_ARM)
    arch_setup_gd(gd_ptr); //用于非arm架构的gd指针获取，armv8架构则通过前面设置的x18寄存器获取gd指针
#endif

    if (CONFIG_IS_ENABLED(SYS_REPORT_STACK_F_USAGE))
        board_init_f_init_stack_protection_addr(base);//用于获取该栈溢出检测的地址

    /* next alloc will be higher by one GD plus 16-byte alignment */
    base += roundup(sizeof(struct global_data), 16);

#if CONFIG_VAL(SYS_MALLOC_F_LEN)
    /* go down one 'early malloc arena' */
    gd->malloc_base = base;//设置early malloc的基地址
#endif

    if (CONFIG_IS_ENABLED(SYS_REPORT_STACK_F_USAGE))
        board_init_f_init_stack_protection(); //初始化栈溢出检测的canary值，该值被设置为SYS_STACK_F_CHECK_BYTE
}
```

board\_init\_f 函数，此函数定义在文件 common/board\_f.c 中，主要用来初始化 DDR，定时器，完成代码拷贝等等

**c\_runtime\_cpu\_setup**

```
ENTRY(c_runtime_cpu_setup)
#if defined(CONFIG_ARMV8_SPL_EXCEPTION_VECTORS) || !defined(CONFIG_SPL_BUILD)
    /* Relocate vBAR */
    adr    x0, vectors
    switch_el x1, 3f, 2f, 1f
3:    msr    vbar_el3, x0
    b    0f
2:    msr    vbar_el2, x0
    b    0f
1:    msr    vbar_el1, x0
0:
#endif
```

## 3.3 uboot重定位

一般的启动流程会由 **spl初始化ddr** ，然后将uboot加载到ddr中运行。但是uboot在norflash中就需要进行搬运到ddr中，从而加快运行速度。

重定位的前提：

uboot重定位依赖于位置无关代码技术，因此需要在编译和重定位时添加以下支持：（1）编译时添加-fpie选项

（2）在链接时添加-pie选项，它使得链接器会产生.rel.dyn和.dynsym段的fixup表。

（3）链接脚本中添加.rel.dyn和.dynsym段定义，并为重定位代码访问这些段的数据提供符号信息

（4）在重定位过程中需要根据新的地址fixup.rel.dyn和.dynsym段的数据

![](https://pic4.zhimg.com/v2-d9e960a8d86d699c909f2a952cb023b5_1440w.jpg)

内核需要从内存的低地址开始运行，为了防止 **内核三件套（kernel、dtb和ramdisk）** 的加载地址与uboot运行地址重叠，因此uboot的重定位地址需要被设置到 **内存顶端附近** 。同时我们还需要为一些特定模块预留一些内存空间（比如页表空间、framebuffer等），上图就是uboot规划的重定位后内存布局：

该图中橙色部分都是需要执行重定位操作的，如uboot的代码段、数据段，以及gd、设备树等，它们都是在board\_init\_r阶段还需要使用的。对于gd和dtb等纯数据的重定位，只需要将数据拷贝到新的地址，并将其基地址指针切换到新地址即可。但对于代码段的重定位我们还需要考虑以下问题：（1）位置无关代码需要调整.rel.dyn和.dynsym段

（2）栈指针需要切换到新的位置

（3）重定位完成后如何完成pc的平滑切换

```
#if !defined(CONFIG_SPL_BUILD)
    ldr    x0, [x18, #GD_START_ADDR_SP] //获取新的栈指针地址
    bic    sp, x0, #0xf         //设置新的栈
    ldr    x18, [x18, #GD_NEW_GD] //将新的gd地址设置到x18，以将gd切换到新的位置
    adr    lr, relocation_return //将重定位返回位置加载到lr中，在重定位流程中，这个地址将会被调整到新代码段的对应位置处。并在重定位完成后跳转到该地址处执行，从而完成代码从老位置到新位置的切换
#if CONFIG_POSITION_INDEPENDENT                            
    adrp    x0, _start    
    add    x0, x0, #:lo12:_start
    ldr    x9, _TEXT_BASE
    sub    x9, x9, x0
    add    lr, lr, x9 //若定义了位置无关选项CONFIG_POSITION_INDEPENDENT，则计算其偏移值，并用该偏移值调整lr的值
#if defined(CONFIG_SYS_RELOC_GD_ENV_ADDR)
    ldr    x0, [x18, #GD_ENV_ADDR]
    add    x0, x0, x9
    str    x0, [x18, #GD_ENV_ADDR]  //若定义了环境变量重定位选项CONFIG_SYS_RELOC_GD_ENV_ADDR，则将环境变量的地址调整到新的位置
#endif
#endif
    ldr    x9, [x18, #GD_RELOC_OFF]
    add    lr, lr, x9  //根据重定位偏移调整lr的位置
    ldr    x0, [x18, #GD_RELOCADDR]
    b    relocate_code   //进入实际的代码重定位流程
```

**relocate\_code** 在arch/arm/lib/relocate\_64.S中实现

```
ENTRY(relocate_code)
    stp    x29, x30, [sp, #-32]!
    mov    x29, sp
    str    x0, [sp, #16] //构造一个栈帧，该栈帧中包含lr寄存器x30，fp寄存器x29和函数入参x0，其中x0为重定位的起始目的地址

    adrp    x1, __image_copy_start
    add    x1, x1, :lo12:__image_copy_start         
    subs    x9, x0, x1                             
    b.eq    relocate_done//计算镜像运行地址与目的地址的偏移，若它们相等，则显然无须执行重定位，可直接跳过该流程
    ldr    x1, _TEXT_BASE    
    subs    x9, x0, x1 //计算镜像链接地址与目的地址的偏移

    adrp    x1, __image_copy_start    
    add    x1, x1, :lo12:__image_copy_start
    adrp    x2, __image_copy_end
    add    x2, x2, :lo12:__image_copy_end //读取镜像运行地址的起始地址和结束地址
copy_loop:    //从运行地址处将镜像拷贝到重定位目的地址处
    ldp    x10, x11, [x1], #16
    stp    x10, x11, [x0], #16
    cmp    x1, x2
    b.lo    copy_loop          
    str    x0, [sp, #24] //将重定位结束地址入栈

    adrp    x2, __rel_dyn_start //位置无关代码相关处理

relocate_done:
    switch_el x1, 3f, 2f, 1f //根据当前执行的异常等级，跳转到对应的位置以读取sctlr寄存器的内容
    bl    hang
3:    mrs    x0, sctlr_el3
    b    0f
2:    mrs    x0, sctlr_el2
    b    0f
1:    mrs    x0, sctlr_el1
0:    tbz    w0, #2, 5f                            
    tbz    w0, #12, 4f //由于重定位后pc将会跳转到新的位置执行，因此若使能了cache，显然重定位之前已加载到cache中的指令还是老的地址，此时若直接跳转则cache中的内容是错误的。因此必须要失效掉cache中已经加载的内容
    ic    iallu    
    isb    sy
4:    ldp    x0, x1, [sp, #16]
    bl    __asm_flush_dcache_range
    bl     __asm_flush_l3_dcache
5:    ldp    x29, x30, [sp],#32 //从栈帧中恢复x29和x30（lr）的内容。现在已经万事俱备，只欠东风了，我们只要通过ret命令跳转到新地址执行即可
    Ret
```

## 3.4 board\_init\_f 函数

\_main 中会调用 **board\_init\_f** 函数，board\_init\_f 函数主要有两个工作：

1. 初始化一系列 **外设** ，比如串口、定时器，或者打印一些消息等。
2. 初始化 **gd 的各个成员变量** ，uboot 会将自己重定位到 DRAM 最后面的地址区域，也就是将自己拷贝到 DRAM 最后面的内存区域中。这么做的目的是给 Linux 腾出空间，防止 Linuxkernel 覆盖掉 uboot，将 DRAM 前面的区域完整的空出来。

在拷贝之前肯定要给 uboot 各部分分配好内存位置和大小，比如 gd 应该存放到哪个位置，malloc 内存池应该存放到哪个位置等等。这些信息都保存在 gd 的成员变量中，因此要对 gd 的这些成员变量做初始化。最终形成一个完整的内存“分配图”，在后面重定位 uboot 的时候就会用到这个内存“分配图”。

```
void board_init_f(ulong boot_flags)
{
    gd->flags = boot_flags;
    gd->have_console = 0;

    if (initcall_run_list(init_sequence_f))
        hang();

#if !defined(CONFIG_ARM) && !defined(CONFIG_SANDBOX) && \
        !defined(CONFIG_EFI_APP) && !CONFIG_IS_ENABLED(X86_64) && \
        !defined(CONFIG_ARC)
    /* NOTREACHED - jump_to_copy() does not return */
    hang();
#endif
}
```

通过函数 **initcall\_run\_list** 来运行初始化序列 init\_sequence\_f 里面的一些列函数，init\_sequence\_f 里面包含了一系列的初始化函数，init\_sequence\_f 也是定义在文件common/board\_f.c 中

```
static const init_fnc_t init_sequence_f[] = {
    setup_mon_len,
    fdtdec_setup,
    trace_early_init,
    initf_malloc, //函数初始化 gd 中跟 malloc 有关的成员变量，比如 malloc_limit
    log_init,
    initf_bootstage,    /* uses its own timer, so does not need DM */
    event_init,
    bloblist_init,
    setup_spl_handoff,
    console_record_init,
    arch_fsp_init,
    arch_cpu_init,        /* basic arch cpu dependent setup */
    mach_cpu_init,        /* SoC/machine dependent CPU setup */
    initf_dm,
    board_early_init_f,
    /* get CPU and bus clocks according to the environment variable */
    get_clocks,        /* get CPU and bus clocks (etc.) */
    timer_init,        /* 初始化定时器 */
    board_postclk_init,
    env_init,        /* initialize environment */
    init_baud_rate,        /* 初始化波特率 */
    serial_init,        /* 初始化串口 */
    console_init_f,        /* stage 1 init of console */
    display_options,    /* 通过串口输出一些信息 */
    display_text_info,    /* 打印一些文本信息 */
    checkcpu,
    print_resetinfo,
    print_cpuinfo,        /* 于打印 CPU 信息 */
    embedded_dtb_select,
    show_board_info, //打印板子信息
    INIT_FUNC_WATCHDOG_INIT //初始化看门狗
    misc_init_f,
    INIT_FUNC_WATCHDOG_RESET //复位看门狗
    init_func_i2c, //初始化 I2C
    init_func_vid,
    announce_dram_init,
    dram_init,        /* configure available RAM banks */
    post_init_f,
    INIT_FUNC_WATCHDOG_RESET
    testdram,
    INIT_FUNC_WATCHDOG_RESET
    init_post,
    INIT_FUNC_WATCHDOG_RESET
    setup_dest_addr,
    fix_fdt,
    reserve_pram,
    reserve_round_4k, //gd->relocaddr 做 4KB 对 齐
    arch_reserve_mmu, //留出 MMU 的 TLB 表的位置
    reserve_video,
    reserve_trace,
    reserve_uboot, //留出重定位后的 uboot 所占用的内存区域
    reserve_malloc, //留出 malloc 区域
    reserve_board, //留出板子 bd 所占的内存区
    reserve_global_data, //保留出 gd_t 的内存区域
    reserve_fdt, //留出设备树相关的内存区域
    reserve_bootstage,
    reserve_bloblist,
    reserve_arch, //设置机器 ID
    reserve_stacks, //留出栈空间
    dram_init_banksize,
    show_dram_config, //显示 DRAM 的配置
    INIT_FUNC_WATCHDOG_RESET
    setup_bdinfo,
    display_new_sp, //显示新的 sp 位置
    INIT_FUNC_WATCHDOG_RESET
    reloc_fdt,
    reloc_bootstage,
    reloc_bloblist,
    setup_reloc, //设置 gd 的其他一些成员变量
    copy_uboot_to_ram,
    do_elf_reloc_fixups,
    clear_bss,
    cyclic_unregister_all,
    jump_to_copy,
    NULL,
};
```

重定位目的地址：setup\_dest\_addr

## 3.4 重定位向量表

函数 **relocate\_vectors** 用于重定位向量表，此函数定义在文件 relocate.S

```
WEAK(relocate_vectors)

#ifdef CONFIG_CPU_V7M
    /*
     * On ARMv7-M we only have to write the new vector address
     * to VTOR register.
     */
    ldr    r0, [r9, #GD_RELOCADDR]    /* r0 = gd->relocaddr */
    ldr    r1, =V7M_SCB_BASE
    str    r0, [r1, V7M_SCB_VTOR]
#else
#ifdef CONFIG_HAS_VBAR
    /*
     * If the ARM processor has the security extensions,
     * use VBAR to relocate the exception vectors.
     */
    ldr    r0, [r9, #GD_RELOCADDR]    /* r0 = gd->relocaddr */
    mcr     p15, 0, r0, c12, c0, 0  /* Set VBAR */
#else
    /*
     * Copy the relocated exception vectors to the
     * correct address
     * CP15 c1 V bit gives us the location of the vectors:
     * 0x00000000 or 0xFFFF0000.
     */
    ldr    r0, [r9, #GD_RELOCADDR]    /* r0 = gd->relocaddr */重定位后 uboot 的首地址，向量表肯定是从这个地址开始存放的
    mrc    p15, 0, r2, c1, c0, 0    /* V bit (bit[13]) in CP15 c1 */
    ands    r2, r2, #(1 << 13)
    ldreq    r1, =0x00000000        /* If V=0 */
    ldrne    r1, =0xFFFF0000        /* If V=1 */
    ldmia    r0!, {r2-r8,r10}
    stmia    r1!, {r2-r8,r10}
    ldmia    r0!, {r2-r8,r10}
    stmia    r1!, {r2-r8,r10}
#endif
#endif
    ret    lr

ENDPROC(relocate_vectors)
```

## 3.5 board\_init\_r

了 board\_init\_f 函数，在此函数里面会调用一系列的函数来初始化一些外设和 gd 的成员变量。但是 board\_init\_f 并没有初始化所有的外设，还需要 **做一些后续工作** ，这些后续工作就是由函数 board\_init\_r 来完成的，board\_init\_r 函数定义在文件common/board\_r.c中，代码如下：

```
void board_init_r(gd_t *new_gd, ulong dest_addr)
{
    gd->flags &= ~(GD_FLG_SERIAL_READY | GD_FLG_LOG_READY);

    if (CONFIG_IS_ENABLED(X86_64) && !IS_ENABLED(CONFIG_EFI_APP))
        arch_setup_gd(new_gd);

#if !defined(CONFIG_X86) && !defined(CONFIG_ARM) && !defined(CONFIG_ARM64)
    gd = new_gd;
#endif
    gd->flags &= ~GD_FLG_LOG_READY;

    if (IS_ENABLED(CONFIG_NEEDS_MANUAL_RELOC)) {
        for (int i = 0; i < ARRAY_SIZE(init_sequence_r); i++)
            MANUAL_RELOC(init_sequence_r[i]);
    }

    if (initcall_run_list(init_sequence_r)) //initcall_run_list 函数来执行初始化序列 init_sequence_r
        hang();

    /* NOTREACHED - run_main_loop() does not return */
    hang();
}
```

init\_sequence\_r 是一个函数集合，init\_sequence\_r 也定义在文件common/board\_r.c 中

```
static init_fnc_t init_sequence_r[] = {
    initr_trace, //初始化和调试跟踪有关的内容
    initr_reloc, //设置 gd->flags，标记重定位完成
    event_init,
    initr_caches, //初始化 cache，使能 cache
    initr_reloc_global_data, //初始化重定位后 gd 的一些成员变量
```
- initr\_console\_record 函数，初始化控制台相关的内容
- board\_init 函数，板级初始化
- initr\_serial 函数，初始化串口
- power\_init\_board 函数，初始化电源芯片
- initr\_nand 函数，初始化 NAND
- initr\_mmc 函数，初始化 EMMC
- initr\_env 函数，初始化环境变量
- initr\_secondary\_cpu 函数，初始化其他 CPU 核
- stdio\_add\_devices 函数，各种输入输出设备的初始化
- initr\_jumptable 函数，初始化跳转表
- interrupt\_init 函数，初始化中断
- initr\_enable\_interrupts 函数，使能中断
- initr\_ethaddr 函数，初始化网络地址
- board\_late\_init 函数，板子后续初始化
- initr\_net 函 数 ， 初 始 化 网 络 设 备

## 参考：

1. [bbs.huaweicloud.com/blo](https://link.zhihu.com/?target=https%3A//bbs.huaweicloud.com/blogs/363735)
2. 正点原子 uboot教程
3. [zhuanlan.zhihu.com/p/52](https://zhuanlan.zhihu.com/p/520060653)

> 后记：  
> 这篇写的有点云里雾里，可以留作有问题的时候来查询的内容吧，对于汇编语言可以借助AI：例如文心一言去帮我们解释代码，也不必要自己去系统的学一遍ARM汇编，要想继续深入研究还是需要去看ARM手册，也可以去看手册里面的操作来代码里面看哪里用了，怎么用的。  
> 越复杂难懂的东西，特别是很多特殊字符，一看就像外星文一样，那就需要多看几遍，一回生二回熟，十回你就是专家了。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

编辑于 2026-04-10 17:12・上海[自学5个月Java找到了9K的工作，我的方式值得大家借鉴](https://zhuanlan.zhihu.com/p/357175586)

[

我是去年9月22日才正式学习Java的，因为在国营单位工作了4年，在天津一个月工资只有5000块，而且看不到任何晋升的希望...

](https://zhuanlan.zhihu.com/p/357175586)