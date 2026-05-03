---
title: "ATF入门-3BL2启动流程分析"
source: "https://zhuanlan.zhihu.com/p/2025983195858903915"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "BL2承担起了加载其他固件（bl31、bl32（optee-os）和bl33（uboot））的功能，并在secure boot中占据了重要角色，主要是对这些固件进行校验，防止被篡改。本文直接从 代码进行分析，并结合qemu运行代码调试，写了挺…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

2 人赞同了该文章

![](https://pic3.zhimg.com/v2-2a557c3a46c4c6fb6a7458e373443f2e_1440w.jpg)

**[BL2](https://zhida.zhihu.com/search?content_id=272874528&content_type=Article&match_order=1&q=BL2&zhida_source=entity)** 承担起了 **加载其他固件** （ [bl31](https://zhida.zhihu.com/search?content_id=272874528&content_type=Article&match_order=1&q=bl31&zhida_source=entity) 、 [bl32](https://zhida.zhihu.com/search?content_id=272874528&content_type=Article&match_order=1&q=bl32&zhida_source=entity) （ [optee-os](https://zhida.zhihu.com/search?content_id=272874528&content_type=Article&match_order=1&q=optee-os&zhida_source=entity) ）和 [bl33](https://zhida.zhihu.com/search?content_id=272874528&content_type=Article&match_order=1&q=bl33&zhida_source=entity) （ [uboot](https://zhida.zhihu.com/search?content_id=272874528&content_type=Article&match_order=1&q=uboot&zhida_source=entity) ））的功能，并在 **[secure boot](https://zhida.zhihu.com/search?content_id=272874528&content_type=Article&match_order=1&q=secure+boot&zhida_source=entity)** 中占据了重要角色，主要是对这些固件进行 **校验** ，防止被篡改。

本文直接从 **代码** 进行分析，并结合 **[qemu](https://zhida.zhihu.com/search?content_id=272874528&content_type=Article&match_order=1&q=qemu&zhida_source=entity) 运行代码调试** ，写了挺多，但是具体到细节里面还是差很远，并且在实际工作中还需要做一些安全的 **方案** ，希望对大家有所帮助。

## 1\. BL2简介

![](https://pic3.zhimg.com/v2-bfa8c01176a030550f94d432dc449e20_1440w.jpg)

Bl2的启动流程与bl1类似，主要区别是

- bl2的 **初始化** 流程比bl1更简单，
- 但其可能需要加载 **更多的镜像** ，如bl31、bl32和bl33。
- 由于bl2可以运行于 [el3](https://zhida.zhihu.com/search?content_id=272874528&content_type=Article&match_order=1&q=el3&zhida_source=entity) 或 [s-el1](https://zhida.zhihu.com/search?content_id=272874528&content_type=Article&match_order=1&q=s-el1&zhida_source=entity) ，它们的入口函数和处理流程都有所区别。使能了 **[RME](https://zhida.zhihu.com/search?content_id=272874528&content_type=Article&match_order=1&q=RME&zhida_source=entity)** 则BL2运行在el3模式，否则BL2运行在s-el1模式。在 [armv8](https://zhida.zhihu.com/search?content_id=272874528&content_type=Article&match_order=1&q=armv8&zhida_source=entity) 架构上，BL2一般运行在s-el1模式。为了简化分析我们选取比较常见的 **s-el1方式** 。
- BL2进行存在于RAM，BL2加载的镜像可能存在于DDR，所以要 **初始化DDR**

> BL2跟BL1的功能这么像，为什么BL2不能被BL1替代？

1. BL1的初衷就是ROM写死在芯片里面，用于校验外部固件用的，只要完成这个功能其他的都不重要。而要完成别的东西，那么bin文件的体积就会增大，在SoC里面的存储是非常贵的
2. BL1里面的驱动需要越少越好，因为是驱动就涉及到适配不同厂家，ROM都写死了就不能适配了，出厂支持什么就是是什么，这是不能接受的

综上，BL1未完成的加载搬运其他固件的任务就交给BL2了。这样的设计还挺精妙的。  
”

## 2\. 代码分析

![](https://pic2.zhimg.com/v2-cb9447eebedcfcf7e7bcbc9d720f9829_1440w.jpg)

- BL2的主要工作就是加载BL3x系列镜像，然后通过 **SMC** 进入BL1进而跳转到BL31运行。
- **bl2\_entrypoint** （）是BL2的入口，前半部分主要进行一系列初始化工作，然后通过 **[bl2\_main](https://zhida.zhihu.com/search?content_id=272874528&content_type=Article&match_order=1&q=bl2_main&zhida_source=entity)** ()加载BL3x镜像到RAM中，最后通过SMC调用执行BL1中指定的smc handler将CPU执行权交给BL31。

## 2.1 bl2\_entrypoint

bl2/aarch64/ **bl2\_entrypoint.S** 中是s-el1模式对应的代码。

```
func bl2_entrypoint
    mov    x20, x0
    mov    x21, x1
    mov    x22, x2
    mov    x23, x3 //参数保存

    adr    x0, early_exceptions
    msr    vbar_el1, x0 //设定异常向量。

    msr    sctlr_el1, x0 //配置cache、内存对齐等属性。
    bl    inv_dcache_range //将BL2的__RW_START__和__RW_END__之间的内存刷回DDR中。
    bl plat_set_my_stack //初始化bl2运行的栈
    
    mov    x0, x20
    mov    x1, x21
    mov    x2, x22
    mov    x3, x23
    bl    bl2_setup //参数回归后使用
    bl    bl2_main //跳转到BL2主函数执行，该函数加载BL3x镜像，并通过SMC调用BL1指定SMC函数将CPU执行权交给BL31。
```

### 2.1.1 参数保存

bl1虽然定义了x0 – x7寄存器用于向bl2传递参数，但bl2实际使用的 **只有x0 - x3四个寄存器** ，因此其实际传参的数量不能超过四个。在BL2中x0 - x3四个寄存器 **在bl2\_setup函数里面需要用** 。但是之前需要执行其他函数就需要 **先保存下，防止丢失** ，mov x20, x0 就是把x0的值放入x20。

在armv8过程调用中，x0 – 18是caller saved寄存器，x19 – x30是callee saved寄存器。

> 

1. 所谓caller saved寄存器就是在子函数过程调用中，若这些寄存器的内容需要保存，则由函数调用方来保存它们，子程序可以随意使用这些寄存器，而无须在调用完成后恢复它们的值。
2. 而callee寄存器则相反，子程序若需要使用这些寄存器，则必须要先保存它们的原始值，然后调用完成后恢复它们。

”

由于bl1的参数位于caller寄存器中，因此需要将其保存到callee寄存器中，以确保后面的子程序调用不会篡改这些寄存器的值。

### 2.1.2 异常向量设置

**early\_exceptions** 在common/aarch64/early\_exceptions.S中定义，从其定义可知，bl2捕获到异常后不会对其做实际处理，而只是 **打印出异常相关的信息** ，然后将系统设置为panic状态。

**异常向量表** 设置完成后，bl2将使能serror和external abort异常，显然这些异常一般意味着系统出现了像未定义指令、空指针等严重错误，因此需要捕获并将将系统设置为安全状态。其代码流程如下：

```
msr    daifclr, #DAIF_ABT_BIT
```

### 2.1.3 设置sctlr\_el1寄存器

该流程主要用于 **使能指令cache、对齐检查和栈对齐检查特性** ，其代码流程如下：

```
mov    x1, #(SCTLR_I_BIT | SCTLR_A_BIT | SCTLR_SA_BIT)
mrs    x0, sctlr_el1
orr    x0, x0, x1
bic    x0, x0, #SCTLR_DSSBS_BIT
msr    sctlr_el1, x0
```

### 2.1.4 C运行时环境准备

C运行时环境需要 **清空bss段内存** ，并为其设置运行时栈，其流程与bl1相同，可参考bl1启动流程

## 2.2 bl2\_setup

它主要执行 **参数处理和平台初始化流程** ，

```
void bl2_setup(u_register_t arg0, u_register_t arg1, u_register_t arg2,
           u_register_t arg3)
{
    /* Perform early platform-specific setup */
    bl2_early_platform_setup2(arg0, arg1, arg2, arg3);

    /* Perform late platform-specific setup */
    bl2_plat_arch_setup();
```

**bl2\_early\_platform\_setup2** 里面可以看到BL1传入的4个参数了。后面的分析我们仍然以qemu平台为例。参数处理流程如下（plat/qemu/common/qemu\_bl2\_setup.c）：

```
void bl2_early_platform_setup2(u_register_t arg0, u_register_t arg1,
                   u_register_t arg2, u_register_t arg3)
{
    meminfo_t *mem_layout = (void *)arg1;

    /* Initialize the console to provide early debug support */
    qemu_console_init();

    /* Setup the BL2 memory layout */
    bl2_tzram_layout = *mem_layout;

    plat_qemu_io_setup();
}
```

（1）从x1参数中获取bl2的内存layout信息

（2）初始化串口控制台

（3）设置bl2的内存layout信息

（4）初始化qemu的storage加载驱动

**bl2\_plat\_arch\_setup** ()中

```
void bl2_plat_arch_setup(void)
{
    const mmap_region_t bl_regions[] = {
        MAP_BL2_TOTAL,
        MAP_BL2_RO,
#if USE_COHERENT_MEM
        MAP_BL_COHERENT_RAM,
#endif
        {0}
    };

    setup_page_tables(bl_regions, plat_qemu_get_mmap());
#ifdef __aarch64__
    enable_mmu_el1(0);
#else
    enable_mmu_svc_mon(0);
#endif
}
```

qemu平台初始化主要是为 **bl2内存建立MMU页表** ，并启动MMU和dcache，其主要目的是加快后面镜像加载的速度。

## 2.3 bl2\_main

```
void bl2_main(void)
{
    NOTICE("BL2: %s\n", version_string);
    NOTICE("BL2: %s\n", build_message);

    /* Perform remaining generic architectural setup in S-EL1 */
    bl2_arch_setup();
#if TRUSTED_BOARD_BOOT
    /* Initialize authentication module */
    auth_mod_init(); //初始化image验证模块
#endif /* TRUSTED_BOARD_BOOT */

    /* Load the subsequent bootloader images. */
    next_bl_ep_info = bl2_load_images(); //加载bl3x image到RAM中并返回bl31的入口地址

#ifdef AARCH32
    disable_mmu_icache_secure();
#endif /* AARCH32 */

    smc(BL1_SMC_RUN_IMAGE, (unsigned long)next_bl_ep_info, 0, 0, 0, 0, 0, 0); //发起SMC异常启动BL31镜像，交给BL1 bl1_aarch32_smc_handler处理。
```

bl2\_arch\_setup()函数，aarch64架构下使能fp和simd寄存器访问权限，其代码如下：

```
write_cpacr(CPACR_EL1_FPEN(CPACR_EL1_FP_TRAP_NONE));
```

## 2.4 bl2\_load\_images

![](https://pic1.zhimg.com/v2-c64951d9f235e9398ac5d9df50eb7de0_1440w.jpg)

一般镜像都放在 **fip包** 里面，但是这套代码如上图， **直接使用了bin文件** 。

该函数用来加载bl3x的image到RAM中，返回一个具有image入口信息的变量。smc handle根据该变量跳转到bl31进行执行。

```
entry_point_info_t *bl2_load_images(void)
{
    bl_params_t *bl2_to_next_bl_params;
    bl_load_info_t *bl2_load_info;
    const bl_load_info_node_t *bl2_node_info;
    int plat_setup_done = 0;
    int err;

    /*
     * Get information about the images to load.
     */
    bl2_load_info = plat_get_bl_image_load_info(); //获取待加载镜像BL3x或SCP_EL2信息，然后遍历处理。
    assert(bl2_load_info);
    assert(bl2_load_info->head);
    assert(bl2_load_info->h.type == PARAM_BL_LOAD_INFO);
    assert(bl2_load_info->h.version >= VERSION_2);
    bl2_node_info = bl2_load_info->head; // bl2_node_info指向镜像第一个对象。

    while (bl2_node_info) { //循环遍历bl2_mem_params_descs成员并加载处理。
        /*
         * Perform platform setup before loading the image,
         * if indicated in the image attributes AND if NOT
         * already done before.
         */
        if (bl2_node_info->image_info->h.attr & IMAGE_ATTRIB_PLAT_SETUP) { //确定加载前是否需要进行特定平台初始化。
            if (plat_setup_done) {
                WARN("BL2: Platform setup already done!!\n");
            } else {
                INFO("BL2: Doing platform setup\n");
                bl2_platform_setup(); //bl2平台相关的设置，如security设置，timer设置以及dtb设置
                plat_setup_done = 1;
            }
        }
        
        err = bl2_plat_handle_pre_image_load(bl2_node_info->image_id); //镜像加载前平台可以执行一些其特定的流程
        if (err != 0) {
                ERROR("BL2: Failure in pre image load handling (%i)\n", err);
                plat_error_handler(err);
        }

        if (!(bl2_node_info->image_info->h.attr & IMAGE_ATTRIB_SKIP_LOADING)) { //确定是否需要跳过加载到RAM步骤；如否，则进行验证并加载。
            INFO("BL2: Loading image id %d\n", bl2_node_info->image_id);
            err = load_auth_image(bl2_node_info->image_id,
                bl2_node_info->image_info); //将镜像加载到RAM，然后进行验证。此过程跟BL1一样
            if (err) {
                ERROR("BL2: Failed to load image (%i)\n", err);
                plat_error_handler(err);
            }
        } else {
            INFO("BL2: Skip loading image id %d\n", bl2_node_info->image_id);
        }

        /* Allow platform to handle image information. */
        err = bl2_plat_handle_post_image_load(bl2_node_info->image_id); //修改特定镜像的加载信息。
        if (err) {
            ERROR("BL2: Failure in post image load handling (%i)\n", err);
            plat_error_handler(err);
        }

        /* Go to next image */
        bl2_node_info = bl2_node_info->next_load_info; //循环加载下一个镜像。
    }

    /*
     * Get information to pass to the next image.
     */
    bl2_to_next_bl_params = plat_get_next_bl_params(); //获取下一个执行镜像入口信息，属性为EXECUTABLE和EP_FIRST_EXE，也即BL31。
    assert(bl2_to_next_bl_params);
    assert(bl2_to_next_bl_params->head);
    assert(bl2_to_next_bl_params->h.type == PARAM_BL_PARAMS);
    assert(bl2_to_next_bl_params->h.version >= VERSION_2);

    /* Flush the parameters to be passed to next image */
    plat_flush_next_bl_params(); //将bl_mem_params_desc_ptr数据刷到DDR中，后面即将通过SMC跳转到BL1启动BL31，保持数据一致性。

    return bl2_to_next_bl_params->head->ep_info;
}
```

### 2.4.1 镜像信息

**bl2\_mem\_params\_descs** 定义了BL2需要加载镜像的信息，对于qemu平台其定义位于plat/qemu/common/qemu\_bl2\_mem\_params\_desc.c中

通过 **REGISTER\_BL\_IMAGE\_DESCS** ()将其和bl\_mem\_params\_desc\_ptr关联，并获取需要加载镜像数目bl\_mem\_params\_desc\_num。

```
static bl_mem_params_node_t bl2_mem_params_descs[] = {
#ifdef SCP_BL2_BASE
    /* Fill SCP_BL2 related information if it exists */
    {
        .image_id = SCP_BL2_IMAGE_ID,
 
        SET_STATIC_PARAM_HEAD(ep_info, PARAM_IMAGE_BINARY,
            VERSION_2, entry_point_info_t, SECURE | NON_EXECUTABLE),
 
        SET_STATIC_PARAM_HEAD(image_info, PARAM_IMAGE_BINARY,
            VERSION_2, image_info_t, 0),
        .image_info.image_base = SCP_BL2_BASE,
        .image_info.image_max_size = PLAT_CSS_MAX_SCP_BL2_SIZE,
 
        .next_handoff_image_id = INVALID_IMAGE_ID,
    },
#endif /* SCP_BL2_BASE */
 
#ifdef EL3_PAYLOAD_BASE
    /* Fill EL3 payload related information (BL31 is EL3 payload)*/
    {
        .image_id = BL31_IMAGE_ID,
 
        SET_STATIC_PARAM_HEAD(ep_info, PARAM_EP,
            VERSION_2, entry_point_info_t,
            SECURE | EXECUTABLE | EP_FIRST_EXE),
        .ep_info.pc = EL3_PAYLOAD_BASE,
        .ep_info.spsr = SPSR_64(MODE_EL3, MODE_SP_ELX,
            DISABLE_ALL_EXCEPTIONS),
 
        SET_STATIC_PARAM_HEAD(image_info, PARAM_EP,
            VERSION_2, image_info_t,
            IMAGE_ATTRIB_PLAT_SETUP | IMAGE_ATTRIB_SKIP_LOADING),
 
        .next_handoff_image_id = INVALID_IMAGE_ID,
    },
 
#else /* EL3_PAYLOAD_BASE */
 
    /* Fill BL31 related information */
    {
        .image_id = BL31_IMAGE_ID,
 
        SET_STATIC_PARAM_HEAD(ep_info, PARAM_EP,
            VERSION_2, entry_point_info_t,
            SECURE | EXECUTABLE | EP_FIRST_EXE),
        .ep_info.pc = BL31_BASE,
        .ep_info.spsr = SPSR_64(MODE_EL3, MODE_SP_ELX,
            DISABLE_ALL_EXCEPTIONS),
#if DEBUG
        .ep_info.args.arg1 = ARM_BL31_PLAT_PARAM_VAL,
#endif
 
        SET_STATIC_PARAM_HEAD(image_info, PARAM_EP,
            VERSION_2, image_info_t, IMAGE_ATTRIB_PLAT_SETUP),
        .image_info.image_base = BL31_BASE,
        .image_info.image_max_size = BL31_LIMIT - BL31_BASE,
 
# ifdef BL32_BASE
        .next_handoff_image_id = BL32_IMAGE_ID,
# else
        .next_handoff_image_id = BL33_IMAGE_ID,
# endif
    },
 
# ifdef BL32_BASE
    /* Fill BL32 related information */
    {
        .image_id = BL32_IMAGE_ID,
 
        SET_STATIC_PARAM_HEAD(ep_info, PARAM_EP,
            VERSION_2, entry_point_info_t, SECURE | EXECUTABLE),
        .ep_info.pc = BL32_BASE,
 
        SET_STATIC_PARAM_HEAD(image_info, PARAM_EP,
            VERSION_2, image_info_t, 0),
        .image_info.image_base = BL32_BASE,
        .image_info.image_max_size = BL32_LIMIT - BL32_BASE,
 
        .next_handoff_image_id = BL33_IMAGE_ID,
    },
# endif /* BL32_BASE */
 
    /* Fill BL33 related information */
    {
        .image_id = BL33_IMAGE_ID,
        SET_STATIC_PARAM_HEAD(ep_info, PARAM_EP,
            VERSION_2, entry_point_info_t, NON_SECURE | EXECUTABLE),
# ifdef PRELOADED_BL33_BASE
        .ep_info.pc = PRELOADED_BL33_BASE,
 
        SET_STATIC_PARAM_HEAD(image_info, PARAM_EP,
            VERSION_2, image_info_t, IMAGE_ATTRIB_SKIP_LOADING),
# else
        .ep_info.pc = PLAT_ARM_NS_IMAGE_OFFSET,
 
        SET_STATIC_PARAM_HEAD(image_info, PARAM_EP,
            VERSION_2, image_info_t, 0),
        .image_info.image_base = PLAT_ARM_NS_IMAGE_OFFSET,
        .image_info.image_max_size = ARM_DRAM1_SIZE,
# endif /* PRELOADED_BL33_BASE */
 
        .next_handoff_image_id = INVALID_IMAGE_ID,
    }
#endif /* EL3_PAYLOAD_BASE */
};
```

在该变量中规定了SCP\_BL2， EL3\_payload, bl32, bl33 image的相关信息，例如：

- image的入口地址信息：ep\_info
- image在RAM中的基地址：image\_base
- image的基本信息：image\_info
- image的ID值：image\_id

### 2.4.2 bl2\_plat\_handle\_post\_image\_load（）

该接口用于 **设置镜像加载相关信息** ，qemu平台代码如下（plat/qemu/common/qemu\_bl2\_setup.c）：

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
1. bl32用于加载trust os，在启动流程中不是必须的，此处暂时不讨论
2. 若由bl2直接启动linux，则设置linux的启动参数。我们知道armv8架构的linux启动参数都是通过dtb传递的，因 此这里将dtb地址设置为其启动参数
3. 对于其它类型的bl33（如uboot），则将当前处理器的affinity信息作为其启动参数
4. 设置bl33的spsr

### 2.4.3 smc到BL31

bl2可能会加载bl31、bl32、bl33镜像，因此其需要将这些被加载镜像的信息传给下一阶段。Bl2通过 **链表** 方式来组织这些参数，其中每一级镜像是链表的一个节点，其具体结构如下图所示：

![](https://pic3.zhimg.com/v2-15d35ff43c025a1ef5dc4b8c98edf2c2_1440w.jpg)

bl2若运行在S-EL1下，则镜像加载完成并准备好参数后，需要通过 **smc异常再次进入bl1** ，由bl1的smc处理函数来执行实际的镜像切换流程。

在执行smc命令之前，我们需要为 **其设置好参数** ，上面的bl\_params->head->ep\_info会设置为smc的调用参数，同时bl\_params还需要被设置为第一级镜像的arg0参数，即在启动第一级镜像（如bl31）时，通过其x0寄存器传给它的也是bl\_params指针，从而使bl31可以继续启动其后的镜像。

由于 **bl\_params** 位于sram内存中，而bl2开启了dcache，因此在跳转到smc之前，需要将这部分数据从cache刷到sram中。最后我们就可以调用下面的smc指令返回bl1le:

```
smc(BL1_SMC_RUN_IMAGE, (unsigned long)next_bl_ep_info, 0, 0, 0, 0, 0, 0);
```

## 2.5 smc\_handler64

smc处理流程如下：

```
vector_entry SynchronousExceptionA64                
smc_handler64
```

其中smc\_handler64会判断 **bl2传入的命令** ，若命令为 **BL1\_SMC\_RUN\_IMAGE** ，则从x1寄存器中获取下一阶段镜像的 **ep\_info** ，执行上下文切换的准备，并最终跳转到下一阶段镜像的入口执行。其代码流程如下：

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

## 3\. 实战调试

![](https://picx.zhimg.com/v2-993f87f8f8f9f534b01b62304d4cd0df_1440w.jpg)

BL31的运行地址在 **0xe0a0000** 。那么就是BL2把BL31.bin加载到了这个地址。

![](https://pica.zhimg.com/v2-850028f7556490d5b258bb306cc61fea_1440w.jpg)

**id 3** 对应的就是 **BL31** ， **bl2\_load\_images** （）函数会循环加载bin文件固件，从这里看起。

## 3.1 问题1：image的列表放在哪里？

bl2\_load\_info = **plat\_get\_bl\_image\_load\_info** ();  
会获取列表 **get\_bl\_load\_info\_from\_mem\_params\_desc**

```
for (; index < bl_mem_params_desc_num; index++) {

    /* Populate the image information */
    bl_node_info->image_id = bl_mem_params_desc_ptr[index].image_id;
    bl_node_info->image_info = &bl_mem_params_desc_ptr[index].image_info;
```

bl\_mem\_params\_desc\_ptr变量的定义地方：

```
#define REGISTER_BL_IMAGE_DESCS(_img_desc)                \
    bl_mem_params_node_t *bl_mem_params_desc_ptr = &_img_desc[0];    \
    unsigned int bl_mem_params_desc_num = ARRAY_SIZE(_img_desc);
    
REGISTER_BL_IMAGE_DESCS(bl2_mem_params_descs)
```

bl2\_mem\_params\_descs中就是列表了：

```
static bl_mem_params_node_t bl2_mem_params_descs[] = {
#ifdef EL3_PAYLOAD_BASE
ddd
...
#else
fff
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
```

判断EL3\_PAYLOAD\_BASE这个 **宏有没有定义** ，有一个好办法就是 **代码里面加乱码进行编译** 。例如上面我们加了ddd和fff，进行编译：

![](https://pic2.zhimg.com/v2-dbbd8ac38c755a3d3b3fbb171368c0d1_1440w.jpg)

**报错了fff** ，则证明这个宏没定义。 **奇巧淫技，哈哈** 。

.ep\_info.pc = BL31\_BASE, **BL31\_BASE** 就是 **0xe0a0000** ，其是代码里面写死的，内存进行了统一的规划。

包括系统程序状态寄存器（SPSR），这些寄存器用于在异常进入和退出时保存和恢复处理器的状态。

1. **.ep\_info.spsr**: 这似乎是一个结构体（可能是某种异常处理或上下文切换相关的结构体）的成员，名为 `spsr` ，该结构体可能被命名为 `ep_info` 。这个成员用于存储SPSR的值。
2. **SPSR\_64(...)**: 这似乎是一个宏或内联函数，用于构建64位的SPSR值。ARMv8是64位架构，所以这里使用 `64` 来指定我们正在处理的是64位版本的SPSR。
3. **MODE\_EL3**: 这表示处理器应该被设置到异常级别3（EL3）。在ARMv8中，EL3通常用于最高级别的安全监视器（Secure Monitor）或安全世界（Secure World）中的信任根（Root of Trust）。
4. **MODE\_SP\_ELX**: 这通常用于指定栈指针（SP）的EL级别。 `ELX` 是一个占位符，表示它可以是任何EL级别（EL0、EL1、EL2或EL3）。但是，由于我们已经指定了MODE\_EL3，所以这里的 `SP_ELX` 很可能意味着栈指针也应该是EL3级别的。
5. **DISABLE\_ALL\_EXCEPTIONS**: 这表示应该禁用所有异常。在处理器状态寄存器中，有一些位用于控制哪些异常是启用的，哪些是被禁用的。通过设置这些位为适当的值，我们可以确保在处理器处于特定模式时不会响应某些异常。

## 3.2 问题2 加载bin文件前做什么？

```
SET_STATIC_PARAM_HEAD(image_info, PARAM_EP, VERSION_2, image_info_t,
                        IMAGE_ATTRIB_PLAT_SETUP),
```

**IMAGE\_ATTRIB\_PLAT\_SETUP** 定义了这个就可以在加载bin文件前进行一些初始化操作，例如安全设置等。

```
if (bl2_node_info->image_info->h.attr & IMAGE_ATTRIB_PLAT_SETUP) { //确定加载前是否需要进行特定平台初始化。
    if (plat_setup_done) {
        WARN("BL2: Platform setup already done!!\n");
    } else {
        INFO("BL2: Doing platform setup\n");
        bl2_platform_setup(); //bl2平台相关的设置，如security设置，timer设置以及dtb设置
```

由于这个是对每个image都进行了一遍，最好是根据 **image id** 进行区别处理。

## 3.3 问题2：固件bin文件在哪里？

![](https://pic1.zhimg.com/v2-c64951d9f235e9398ac5d9df50eb7de0_1440w.jpg)

例如 **bl31.bin** 就在上图我们编译出来的地方，qemu运行的这个代码目前不使用fip包，直接加载了bl31.bin

load\_image-》 **plat\_get\_image\_source** (image\_id, &dev\_handle, &image\_spec);  
用于 **获取固件的信息** ，

- **image\_spec** 就是我们找到的 **bin文件存放地址**
- **dev\_handle** 就是存放介质驱动提供的 **ops操作函数** ，里面有打开读写等操作，这算是一个POSIX接口

plat/qemu/common/qemu\_io\_storage.c中定义了plat\_get\_image\_source

```
*policy = get_io_policy(image_id);

    [BL31_IMAGE_ID] = {
        &fip_dev_handle,
        (uintptr_t)&bl31_uuid_spec,
        open_fip
    },
```

open\_fip进行校验会失败。关于fip包这里不多说明，大体就是所有的bin文件打包成一个fip.bin然后进行安全校验。

```
result = policy->check(policy->image_spec);
if (result == 0) {
    *image_spec = policy->image_spec;
    *dev_handle = *(policy->dev_handle);
} else {
    INFO("Trying alternative IO\n");
    result = get_alt_image_source(image_id, dev_handle, image_spec);
}
```

get\_alt\_image\_source寻找替代的bin文件

```
get_io_file_spec(image_id);--》sh_file_spec[image_id];

    [BL31_IMAGE_ID] = {
        .path = BL31_IMAGE_NAME,
        .mode = FOPEN_MODE_RB
    },

#define BL31_IMAGE_NAME "bl31.bin"
```

参考：

1.[icyshuai.blog.csdn.net/](https://link.zhihu.com/?target=https%3A//icyshuai.blog.csdn.net/article/details/72470044)

2.[zhuanlan.zhihu.com/p/52](https://zhuanlan.zhihu.com/p/520048433)

3.[cnblogs.com/arnoldlu/p/](https://link.zhihu.com/?target=https%3A//www.cnblogs.com/arnoldlu/p/14175126.html)

> 后记：  
> 单纯的 **看代码学习概念估计非常的枯燥** ，如果追求速度反而是走马观花，所以研究这些代码是 **需要一些时间进行调试** 的。在实际的工作中，可能BL2这一个固件就是一个人在大厂里面打的 **一个螺丝** ，是需要全投入一直干的，那可能光BL2就干一两年，才能完全的透彻。总之： **纸上得来终觉浅，唯有实践出真知** 。  
> ”

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-04-10 17:08・上海[芯片设计需要学什么课程？](https://zhuanlan.zhihu.com/p/607903779)

[

芯片设计需要学的课程有Verilog、VHDL、SpinalHDL、Myhdl，还有SystemVerilog/S...

](https://zhuanlan.zhihu.com/p/607903779)