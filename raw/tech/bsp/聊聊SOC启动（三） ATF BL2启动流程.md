---
title: "聊聊SOC启动（三） ATF BL2启动流程"
source: "https://zhuanlan.zhihu.com/p/520048433"
author:
  - "[[lgjjeff]]"
published:
created: 2026-05-03
description: "本文基于以下软硬件假定： 架构：AARCH6464 软件：ATF V2.5 1 BL2启动流程 Bl2的启动流程与bl1类似，主要区别是bl2的初始化流程比bl1更简单，但其可能需要加载更多的镜像，如bl31、bl32和bl33。由于bl2可以运行于e…"
tags:
  - "clippings"
---
[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944)

13 人赞同了该文章

本文基于以下软硬件假定：

架构：AARCH6464

软件： [ATF V2.5](https://zhida.zhihu.com/search?content_id=203698239&content_type=Article&match_order=1&q=ATF+V2.5&zhida_source=entity)

## 1　BL2启动流程

　　Bl2的启动流程与 [bl1](https://zhida.zhihu.com/search?content_id=203698239&content_type=Article&match_order=1&q=bl1&zhida_source=entity) 类似，主要区别是bl2的初始化流程比bl1更简单，但其可能需要加载更多的镜像，如 [bl31](https://zhida.zhihu.com/search?content_id=203698239&content_type=Article&match_order=1&q=bl31&zhida_source=entity) 、 [bl32](https://zhida.zhihu.com/search?content_id=203698239&content_type=Article&match_order=1&q=bl32&zhida_source=entity) 和 [bl33](https://zhida.zhihu.com/search?content_id=203698239&content_type=Article&match_order=1&q=bl33&zhida_source=entity) 。由于bl2可以运行于el3或 [s-el1](https://zhida.zhihu.com/search?content_id=203698239&content_type=Article&match_order=1&q=s-el1&zhida_source=entity) ，它们的入口函数和处理流程都有所区别，为了简化分析我们选取比较常见的s-el1方式，以下为其总体执行流程：

![](https://pic1.zhimg.com/v2-25700200f32a0c003ee61a5d64a26f04_1440w.jpg)

下面将以上流程分为bl2基础初始化、bl2参数设置、bl2镜像加载和下一阶段镜像跳转这几部分，并分别介绍

## ２　bl2基础初始化

### ２.1　保存参数

其代码流程如下：

```
mov    x20, x0
mov    x21, x1
mov    x22, x2
mov    x23, x3
```

　　bl1虽然定义了x0 – x7寄存器用于向bl2传递参数，但bl2实际使用的只有x0 - x3四个寄存器，因此其实际传参的数量不能超过四个。在armv8过程调用中，x0 – 18是caller saved寄存器，x19 – x30是callee saved寄存器。所谓caller saved寄存器就是在子函数过程调用中，若这些寄存器的内容需要保存，则由函数调用方来保存它们，子程序可以随意使用这些寄存器，而无须在调用完成后恢复它们的值。而callee寄存器则相反，子程序若需要使用这些寄存器，则必须要先保存它们的原始值，然后调用完成后恢复它们。

　　由于bl1的参数位于caller寄存器中，因此需要将其保存到callee寄存器中，以确保后面的子程序调用不会篡改这些寄存器的值。

### ２.２　异常设置

　　其代码流程如下：

```
adr    x0, early_exceptions
msr    vbar_el1, x0
```

　　该流程用于设置el1的 [异常向量表](https://zhida.zhihu.com/search?content_id=203698239&content_type=Article&match_order=1&q=%E5%BC%82%E5%B8%B8%E5%90%91%E9%87%8F%E8%A1%A8&zhida_source=entity) 基地址，其定义位于common/aarch64/early\_exceptions.S中。从其定义可知，bl2捕获到异常后不会对其做实际处理，而只是打印出异常相关的信息，然后将系统设置为panic状态。

　　异常向量表设置完成后，bl2将使能serror和external abort异常，显然这些异常一般意味着系统出现了像未定义指令、空指针等严重错误，因此需要捕获并将将系统设置为安全状态。其代码流程如下：

```
msr    daifclr, #DAIF_ABT_BIT
```

### ２.３　设置sctlr\_el1寄存器

　　该流程主要用于使能指令cache、对齐检查和栈对齐检查特性，其代码流程如下：

```
mov    x1, #(SCTLR_I_BIT | SCTLR_A_BIT | SCTLR_SA_BIT)
mrs    x0, sctlr_el1
orr    x0, x0, x1
bic    x0, x0, #SCTLR_DSSBS_BIT
msr    sctlr_el1, x0
```

### ２.４　C运行时环境准备

　　C运行时环境需要清空bss段内存，并为其设置运行时栈，其流程与bl1相同，可参考bl1启动流程

## ３　Bl2平台设置

　　它主要执行参数处理和平台初始化流程，后面的分析我们仍然以 [qemu平台](https://zhida.zhihu.com/search?content_id=203698239&content_type=Article&match_order=1&q=qemu%E5%B9%B3%E5%8F%B0&zhida_source=entity) 为例。参数处理流程如下（plat/qemu/common/qemu\_bl2\_setup.c）：

```
meminfo_t *mem_layout = (void *)arg1;                （1）
    qemu_console_init();                         （2）
bl2_tzram_layout = *mem_layout;                      （3）
plat_qemu_io_setup();                                （4）
```

（1）从x1参数中获取bl2的内存layout信息

（2）初始化串口控制台

（3）设置bl2的内存layout信息

（4）初始化qemu的storage加载驱动

　　qemu平台初始化主要是为bl2内存建立MMU页表，并启动MMU和dcache，其主要目的是加快后面镜像加载的速度。其代码如下：

```
QEMU_CONFIGURE_BL2_MMU(bl2_tzram_layout.total_base,
              bl2_tzram_layout.total_size,
              BL_CODE_BASE, BL_CODE_END,
              BL_RO_DATA_BASE, BL_RO_DATA_END,
              BL_COHERENT_RAM_BASE, BL_COHERENT_RAM_END);
```

## 4　Bl2镜像加载

### ４.１　镜像加载前流程

（1）bl2\_arch\_setup

aarch64架构下使能fp和simd寄存器访问权限，其代码如下：

```
write_cpacr(CPACR_EL1_FPEN(CPACR_EL1_FP_TRAP_NONE));
```

（2）auth\_mod\_init

该流程用于初始化 [secure boot模块](https://zhida.zhihu.com/search?content_id=203698239&content_type=Article&match_order=1&q=secure+boot%E6%A8%A1%E5%9D%97&zhida_source=entity) ，与bl1中相同

### ４.２　镜像加载流程

Bl2需要加载的镜像信息由平台定义，对于qemu平台其定义位于plat/qemu/common/qemu\_bl2\_mem\_params\_desc.c中，以下代码选取了其在aarch64架构下只加载bl31和bl33的典型配置：

```
static bl_mem_params_node_t bl2_mem_params_descs[] = {
#ifdef __aarch64__
    { .image_id = BL31_IMAGE_ID,

      SET_STATIC_PARAM_HEAD(ep_info, PARAM_EP, VERSION_2,
                entry_point_info_t,
                SECURE | EXECUTABLE | EP_FIRST_EXE),
      .ep_info.pc = BL31_BASE,
      .ep_info.spsr = SPSR_64(MODE_EL3, MODE_SP_ELX,
                  DISABLE_ALL_EXCEPTIONS),
# if DEBUG
      .ep_info.args.arg1 = QEMU_BL31_PLAT_PARAM_VAL,
# endif
      SET_STATIC_PARAM_HEAD(image_info, PARAM_EP, VERSION_2, image_info_t,
                IMAGE_ATTRIB_PLAT_SETUP),
      .image_info.image_base = BL31_BASE,
      .image_info.image_max_size = BL31_LIMIT - BL31_BASE,

# ifdef QEMU_LOAD_BL32
      .next_handoff_image_id = BL32_IMAGE_ID,
# else
      .next_handoff_image_id = BL33_IMAGE_ID,
# endif
    },
#endif /* __aarch64__ */
    { .image_id = BL33_IMAGE_ID,
      SET_STATIC_PARAM_HEAD(ep_info, PARAM_EP, VERSION_2,
                entry_point_info_t, NON_SECURE | EXECUTABLE),
# ifdef PRELOADED_BL33_BASE
      .ep_info.pc = PRELOADED_BL33_BASE,

      SET_STATIC_PARAM_HEAD(image_info, PARAM_EP, VERSION_2, image_info_t,
                IMAGE_ATTRIB_SKIP_LOADING),
# else /* PRELOADED_BL33_BASE */
      .ep_info.pc = NS_IMAGE_OFFSET,

      SET_STATIC_PARAM_HEAD(image_info, PARAM_EP, VERSION_2, image_info_t,
                0),
      .image_info.image_base = NS_IMAGE_OFFSET,
      .image_info.image_max_size = NS_IMAGE_MAX_SIZE,
# endif /* !PRELOADED_BL33_BASE */

      .next_handoff_image_id = INVALID_IMAGE_ID,
    }
};
```

　　该结构与bl1的镜像描述结构体比较类似，只是多了下一阶段镜像id，以及加载参数链表节点信息。该结构体定义完成后需要通过以下接口注册到系统中：

```
REGISTER_BL_IMAGE_DESCS(bl2_mem_params_descs)
```

　　在启动阶段，可通过plat\_get\_bl\_image\_load\_info获取以上镜像加载信息，此后启动代码将遍历这些接在信息，并分别执行以下流程分别加载和处理这些镜像  
（1）bl2\_platform\_setup  
　　该函数用于bl2平台相关的设置，如security设置，timer设置以及dtb设置等

（2）bl2\_plat\_handle\_pre\_image\_load  
　　镜像加载前平台可以执行一些其特定的流程

（3）load\_auth\_image  
　　该接口用于实际的镜像加载流程，其与bl1的镜像加载流程完全一样

（4）bl2\_plat\_handle\_post\_image\_load  
　　该接口用于设置镜像加载相关信息，qemu平台代码如下（plat/qemu/common/qemu\_bl2\_setup.c）：

```
static int qemu_bl2_handle_post_image_load(unsigned int image_id)
{
    int err = 0;
    bl_mem_params_node_t *bl_mem_params = get_bl_mem_params_node(image_id);
    …
    switch (image_id) {
    case BL32_IMAGE_ID:
        …                                                                              （a）
    case BL33_IMAGE_ID:
#if ARM_LINUX_KERNEL_AS_BL33
        bl_mem_params->ep_info.args.arg0 =
            (u_register_t)ARM_PRELOADED_DTB_BASE;
        bl_mem_params->ep_info.args.arg1 = 0U;
        bl_mem_params->ep_info.args.arg2 = 0U;
        bl_mem_params->ep_info.args.arg3 = 0U;                                   （b）
#else
        bl_mem_params->ep_info.args.arg0 = 0xffff & read_mpidr();                （c）
#endif
        bl_mem_params->ep_info.spsr = qemu_get_spsr_for_bl33_entry();            （d）
        break;
    default:
        break;
    }

    return err;
}
```

a bl32用于加载trust os，在启动流程中不是必须的，此处暂时不讨论

b 若由bl2直接启动linux，则设置linux的启动参数。我们知道armv8架构的linux启动参数都是通过dtb传递的，因 此这里将dtb地址设置为其启动参数

c 对于其它类型的bl33（如uboot），则将当前处理器的affinity信息作为其启动参数

d 设置bl33的spsr

### ４.２　参数设置流程

　　bl2可能会加载bl31、bl32、bl33镜像，因此其需要将这些被加载镜像的信息传给下一阶段。Bl2通过链表方式来组织这些参数，其中每一级镜像是链表的一个节点，其具体结构如下图所示：

![](https://picx.zhimg.com/v2-c64875b7efed307d43f5ca21ee536b33_1440w.jpg)

　　回顾一下第一篇总体流程中<启动阶段>部分，bl2若运行在S-EL1下，则镜像加载完成并准备好参数后，需要通过 [smc异常](https://zhida.zhihu.com/search?content_id=203698239&content_type=Article&match_order=1&q=smc%E5%BC%82%E5%B8%B8&zhida_source=entity) 再次进入bl1，由bl1的smc处理函数来执行实际的镜像切换流程。在执行smc命令之前，我们需要为其设置好参数，上面的bl\_params->head->ep\_info会设置为smc的调用参数，同时bl\_params还需要被设置为第一级镜像的arg0参数，即在启动第一级镜像（如bl31）时，通过其x0寄存器传给它的也是bl\_params指针，从而使bl31可以继续启动其后的镜像。

　　由于bl\_params位于sram内存中，而bl2开启了dcache，因此在跳转到smc之前，需要将这部分数据从cache刷到sram中。最后我们就可以调用下面的smc指令返回bl1le:

```
smc(BL1_SMC_RUN_IMAGE, (unsigned long)next_bl_ep_info, 0, 0, 0, 0, 0, 0);
```

## ５　bl1代理运行下一级镜像

　　bl1的smc处理流程如下：

```
vector_entry SynchronousExceptionA64                
smc_handler64
```

　　其中smc\_handler64会判断bl2传入的命令，若命令为BL1\_SMC\_RUN\_IMAGE，则从x1寄存器中获取下一阶段镜像的ep\_info，执行上下文切换的准备，并最终跳转到下一阶段镜像的入口执行。其代码流程如下：

```
func smc_handler64
    mov    x30, #BL1_SMC_RUN_IMAGE
    cmp    x30, x0                                                               
    b.ne    smc_handler                                                          （1）

    mrs    x30, scr_el3
    tst    x30, #SCR_NS_BIT                                                     （2）
    b.ne    unexpected_sync_exception

    ldr    x30, [sp, #CTX_EL3STATE_OFFSET + CTX_RUNTIME_SP]
    msr    spsel, #MODE_SP_EL0
    mov    sp, x30                                                               （3）

    mov    x20, x1                                                               （4）

    mov    x0, x20
    bl    bl1_print_next_bl_ep_info                                             （5）

    ldp    x0, x1, [x20, #ENTRY_POINT_INFO_PC_OFFSET]                         
    msr    elr_el3, x0
    msr    spsr_el3, x1                                                           （6）
    ubfx    x0, x1, #MODE_EL_SHIFT, #2
    cmp    x0, #MODE_EL3                                                        　（7）
    b.ne    unexpected_sync_exception
    …
    mov    x0, x20
    bl    bl1_plat_prepare_exit                                                  （8）

    ldp    x6, x7, [x20, #(ENTRY_POINT_INFO_ARGS_OFFSET + 0x30)]
    ldp    x4, x5, [x20, #(ENTRY_POINT_INFO_ARGS_OFFSET + 0x20)]
    ldp    x2, x3, [x20, #(ENTRY_POINT_INFO_ARGS_OFFSET + 0x10)]
    ldp    x0, x1, [x20, #(ENTRY_POINT_INFO_ARGS_OFFSET + 0x0)]                   （9）
    exception_return                                                               （10）
endfunc smc_handler64
```

（1）判断通过x0寄存器传入的smc命令是否为BL1\_SMC\_RUN\_IMAGE，若不是则执行smc\_handler，否则继续执行下面的镜像跳转流程

（2）判断scr\_el3的secure位是否为0。该值表示EL0 – EL2等级的secure状态，因此实际指的是smc跳转之前的执行状态。所以该值为0就表示smc跳转前bl2执行在secure状态，否则表示bl2执行在non secure状态。在atf架构中，为了系统的安全性bl2必须要运行在secure状态（因为通常在bl2需要执行一些secure相关的设置，如tzasc，tzma，tzpc等）

（3）从sp\_el3栈中获取先前el3\_exit流程中保存的运行时栈的值，将其恢复回sp\_el0，并将栈指针切换回sp\_el0

（4）获取smc指令通过x1寄存器传入的next\_bl\_ep\_info参数

（5）打印参数信息

（6）从next\_bl\_ep\_info参数中获取bl1的入口地址和spsr寄存器值，分别将其设置到elr\_el3和spsr\_el3，为跳转到下一阶段镜像做准备

（7）判断下一阶段镜像是否运行于el3，若不是则出错

（8）平台相关的跳转前自定义流程，该函数默认什么都不做

（9）通过x0 – x7设置跳转参数，在bl2中只向arg0设置了bl\_params指针这一个参数，因此bl2传给bl31的参数为描述镜像信息的bl\_params指针

（10）通过eret跳转到下一阶段镜像入口函数处执行

编辑于 2022-07-21 15:08[怎样才能入门abaqus？](https://www.zhihu.com/question/339109690/answer/3556391531)

[

abaqus只是一个软件，学好它的目的当然是掌握仿真分析能力，软件操作不是目的，而是手段。要做好仿真分析，必须具备一定的基础知识：良好的力学基础、理解基本的工程力学概念，有限元...

](https://www.zhihu.com/question/339109690/answer/3556391531)