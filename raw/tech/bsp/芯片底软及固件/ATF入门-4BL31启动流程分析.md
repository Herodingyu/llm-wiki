---
title: "ATF入门-4BL31启动流程分析"
source: "https://zhuanlan.zhihu.com/p/2025983597237028579"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "之前的文章 电源管理入门-1关机重启详解中第四章：4. ATF Bl31中的处理，其实已经把BL31最主要的内容介绍过一遍了。可见 知识的边界就是另外一种新知识，求知的路漫漫，需要我们：处处留心皆学问。本文从更高的一…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

3 人赞同了该文章

![](https://pica.zhimg.com/v2-8fb77377dee4f5a917058f9b42b8ff6e_1440w.jpg)

之前的文章 [电源管理入门-1关机重启详解](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484601%26idx%3D1%26sn%3D4b3e42481f74110d0b5a21e01d95a09d%26chksm%3Dfa52829dcd250b8ba7a691a91759498a2a862510833856e7f07ef2c9315f15c72f8f88413812%26scene%3D21%23wechat_redirect) 中第四章： **4\. ATF Bl31中的处理** ，其实已经把 [BL31](https://zhida.zhihu.com/search?content_id=272874688&content_type=Article&match_order=1&q=BL31&zhida_source=entity) 最主要的内容介绍过一遍了。

可见 **知识的边界就是另外一种新知识** ，求知的路漫漫，需要我们： **处处留心皆学问** 。本文从更高的一些角度再来审视下BL31和其启动流程。

## 1\. BL31简介

![](https://pic3.zhimg.com/v2-11899ace58aed142d10f1f035fdd9ab4_1440w.jpg)

bl31包含两部分功能，

1. 在启动时作为 **启动流程** 的一部分，执行软硬件初始化以及启动bl32和bl33镜像。
2. 在系统启动完成后，将 **继续驻留于系统中作为runtime** ，并处理来自其它异常等级的 **[smc](https://zhida.zhihu.com/search?content_id=272874688&content_type=Article&match_order=1&q=smc&zhida_source=entity) 异常** ，以及其它需要路由到 [EL3](https://zhida.zhihu.com/search?content_id=272874688&content_type=Article&match_order=1&q=EL3&zhida_source=entity) 处理的 **中断** 等。

> 为什么需要BL31？  
> 系统启动后运行做业务的时候，EL1运行的Linux，EL0运行的应用，那么 **EL3也需要一个运行时** 来处理EL3级别的指令。  
>   
> 为什么BL31不放入BL2，BL2直接做EL3运行时？

1. **干的活不一样** ，BL2是加载固件的，BL31是提供运行时服务的，合起来放运行时比较大。功能不同分开时，不同的厂商可以对这两部分分开定制，组合使用，更加的灵活。
2. BL2加载固件的代码对安全非常重要，最好 **一次运行就不能继续运行了** ，在运行时黑客可能跳转执行。
3. BL2可能是S-EL1 **不是EL3级别**

bl31启动流程主要包含以下工作：（1）cpu初始化

（2）c运行时环境初始化

（3）基本硬件初始化，如 [gic](https://zhida.zhihu.com/search?content_id=272874688&content_type=Article&match_order=1&q=gic&zhida_source=entity) ，串口，timer等

（4）页表创建和cache使能

（5）启动后级镜像的准备以及新镜像的跳转

（6）若bl31支持el3中断，则需要初始化中断处理框架

（7）运行时不同secure状态的smc处理，以及异常等级切换上下文的初始化

（8）用于处理smc命令的运行时服务注册

## 2\. 代码分析

![](https://pic1.zhimg.com/v2-af6e4acc71b026727d9b497bb64f755a_1440w.jpg)

## 2.1 bl31\_entrypoint

通过 **bl31.ld.S** 文件可知， bl31的入口函数是： **bl31\_entrypoint** 函数，该函数的内容如下：

```
func bl31_entrypoint
    /* ---------------------------------------------------------------
     * Stash the previous bootloader arguments x0 - x3 for later use.
     * ---------------------------------------------------------------
     */
    mov    x20, x0
    mov    x21, x1
    mov    x22, x2
    mov    x23, x3 //保存参数

 #if !RESET_TO_BL31 //复位从BL1冷启动
    el3_entrypoint_common                    \
        _init_sctlr=0                    \不初始化系统控制寄存器。
        _warm_boot_mailbox=0                \不使用warm boot mailbox
        _secondary_cold_boot=0                \不执行二级冷启动。
        _init_memory=0                    \不初始化内存。
        _init_c_runtime=1                \
        _exception_vectors=runtime_exceptions        \\runtime_exceptions为el3 runtime software的异常向量表，内容定义在bl31/aarch64/runtime_exceptions.S文件中
        _pie_fixup_size=BL31_LIMIT - BL31_BASE
#else //复位从BL31热启动
        el3_entrypoint_common                    \
        _init_sctlr=1                    \
        _warm_boot_mailbox=!PROGRAMMABLE_RESET_ADDRESS    \
        _secondary_cold_boot=!COLD_BOOT_SINGLE_CPU    \
        _init_memory=1                    \
        _init_c_runtime=1                \
        _exception_vectors=runtime_exceptions        \
        _pie_fixup_size=BL31_LIMIT - BL31_BASE
#endif
    mov    x0, x20
    mov    x1, x21
    mov    x2, x22
    mov    x3, x23
    bl    bl31_setup //平台架构相关的初始化设置

    bl    bl31_main //跳转到bl31_main函数，执行该阶段需要的主要操作

    adrp    x0, __DATA_START__
    add    x0, x0, :lo12:__DATA_START__
    adrp    x1, __DATA_END__
    add    x1, x1, :lo12:__DATA_END__
    sub    x1, x1, x0
    bl    clean_dcache_range

    adrp    x0, __BSS_START__
    add    x0, x0, :lo12:__BSS_START__
    adrp    x1, __BSS_END__
    add    x1, x1, :lo12:__BSS_END__
    sub    x1, x1, x0
    bl    clean_dcache_range

    b    el3_exit //执行完成将跳转到bl33中执行，即执行bootloader
endfunc bl31_entrypoint
```

根据是否设置了 **RESET\_TO\_BL31** ，确定ATF的两种启动方式即冷启动还是热启动：

1. **冷启动** ：从BL1开始启动。此时由于bl1已经执行过el3\_entrypoint\_common函数，系统基本配置都已经设置完成。因此像设置sctlr寄存器、热启动跳转处理、secondary cpu处理，以及内存初始化流程在bl1中都已经完成，bl31中就可以跳过它们了。

RESET\_TO\_BL31是由编译脚本决定的，默认不打开。

1. **热启动** ：支持从bl31开始启动的基础是armv8支持动态设置cpu的重启地址，armv8架构提供了 [RVBAR](https://zhida.zhihu.com/search?content_id=272874688&content_type=Article&match_order=1&q=RVBAR&zhida_source=entity) （reset vector base address register）寄存器用于设置reset时cpu的启动位置。该寄存器一共有三个：RVBAR\_EL1、RVBAR\_EL2和RVBAR\_EL3，根据系统实现的最高异常等级确定使用哪一个。我们知道armv8重启总是从最高异常等级开始执行，因此我们只需要设置最高异常等级的RVBAR寄存器即可。由于bl31运行在el3下，故若我们需要支持启动从bl31开始，就可通过将地址设置到 **RVBAR\_EL3** 寄存器实现。

若启动从bl31开始，则由于它是 **第一级启动镜像** ，因此el3\_entrypoint\_common需要 **从头设置系统状态** ，因此该函数中的sctlr寄存器、启动跳转处理、secondary cpu处理，以及内存初始化流程等都需要执行。

虽然el3\_entrypoint\_common需要做的工作有点多，但这种方式直接跳过了bl1和bl2两级启动流程，相比于第一种方式其启动 **速度要更快** ，这也是它的最大优势。

最后这种方式将参数保存 **寄存器x20 – x23的值清零** 也非常好理解，因为此时bl31是启动的第一级镜像，自然就没有前级镜像传递的参数，此时将这些值清零可避免后面参数解析时出现问题

## 2.2 bl31\_setup

```
void bl31_setup(u_register_t arg0, u_register_t arg1, u_register_t arg2,
        u_register_t arg3)
{
    /* Perform early platform-specific setup */
    bl31_early_platform_setup2(arg0, arg1, arg2, arg3);

    /* Perform late platform-specific setup */
    bl31_plat_arch_setup();
}
```

plat/qemu/common/ **qemu\_bl31\_setup.c** 中

```
void bl31_early_platform_setup2(u_register_t arg0, u_register_t arg1,
                u_register_t arg2, u_register_t arg3)
{
    qemu_console_init(); //控制台初始化

    bl_params_t *params_from_bl2 = (bl_params_t *)arg0;//获取arg0传入的镜像描述参数指针

    bl_params_node_t *bl_params = params_from_bl2->head;//获取镜像链表头节点

    while (bl_params) {//遍历镜像链表
        if (bl_params->image_id == BL32_IMAGE_ID)
            bl32_image_ep_info = *bl_params->ep_info;//若该链表中含有bl32镜像描述符，则将其ep_info保存到全局变量

        if (bl_params->image_id == BL33_IMAGE_ID)
            bl33_image_ep_info = *bl_params->ep_info;//多该链表中含有bl33镜像描述符，同样将其ep_info保存到全局变量

        bl_params = bl_params->next_params_info;
    }

    if (!bl33_image_ep_info.pc)//校验bl33镜像的入口地址
        panic();
}
```

**bl31\_plat\_arch\_setup** 函数用于为bl31相关内存创建页表，并使能MMU和dcache

```
void bl31_plat_arch_setup(void)
{
    const mmap_region_t bl_regions[] = {
        MAP_BL31_TOTAL,
        MAP_BL31_RO,
        {0}
    };

    setup_page_tables(bl_regions, plat_qemu_get_mmap());

    enable_mmu_el3(0);
}
```

## 2.3 bl31\_main

该函数主要完成必要 **初始化操作** ，配置EL3中的各种smc操作，以便在后续顺利响应在CA和TA中产生的smc操作

![](https://pic1.zhimg.com/v2-3beb70b63169e373982e16bdae3b75d0_1440w.jpg)

```
void bl31_main(void)
{
    NOTICE("BL31: %s\n", version_string);
    NOTICE("BL31: %s\n", build_message);
 
    bl31_platform_setup();    //初始化相关驱动，时钟等

    bl31_lib_init();    //用于执行bl31软件中相关全局变量的初始化
#if EL3_EXCEPTION_HANDLING
    INFO("BL31: Initialising Exception Handling Framework\n");
    ehf_init();
#endif

    INFO("BL31: Initializing runtime services\n");
    runtime_svc_init();    //初始化el3中的service，通过在编译时指定特定的section来确定哪些service会被作为el3 service
 
/* 如果注册了TEE OS支持，在调用完成run_service_init之后会使用TEE OS的入口函数初始化bl32_init变量，然后执行对应的Init函数，以OP-TEE为例，bl32_init将会被初始化成opteed_init，到此将会执行 opteed_init函数来进入OP-TEE OS的Image，当OP-TEE image OS执行完了image后，将会产生一个TEESMC_OPTEED_RETURN_ENTRY_DONE的smc来通过bl31已经完成了OP-TEE的初始化*/
    if (bl32_init) {
        INFO("BL31: Initializing BL32\n");
        (*bl32_init)();
    }

    bl31_prepare_next_image_entry();        //准备跳转到bl33，在执行runtime_service的时候会存在一个spd service，该在service的init函数中将会去执行bl32的image完成TEE OS初始化
 
    console_flush();
 
    bl31_plat_runtime_setup();
}
```

### 2.3.1 bl31\_platform\_setup:

（1）初始化 **gic** ，包括gic的distributor，redistributor，cpu interface等的初始化。

（2）初始化qemu平台的 **gpio** ，即为其设置gpio基地址和操作相关的回调函数

### 2.3.2 ehf\_init

ehf初始化流程主要就是设置group 0的路由方式，并为其设置一个总的中断处理函数。

```
void __init ehf_init(void)
{
    unsigned int flags = 0;
    int ret __unused;
    …
    set_interrupt_rm_flag(flags, NON_SECURE);
    set_interrupt_rm_flag(flags, SECURE); //计算中断路由相关的flag

    ret = register_interrupt_type_handler(INTR_TYPE_EL3,
            ehf_el3_interrupt_handler, flags);//设置EL3类型（group 0）中断的中断路由方式和bl31总的中断处理函数
}
```

ehf用于 **初始化el3中断处理** 相关的功能。在 **gicv3** 中中断被分为三个group：group0、secure group1和non secure group 1，它们根据scr\_el3的irq和fiq位配置不同可分别 **路由到不同的异常等级处理** 。Ehf用于处理group0中断，这种中断总是以fiq形式触发，通过设置scr\_el3将其路由到el3处理就可以在bl31中处理这种类型中断了。

bl31中断处理函数 **ehf\_el3\_interrupt\_handler** 会由异常向量表处理流程调用，它会继续根据中断优先级调用实际每个优先级对应的处理函数。中断优先级对应处理函数的注册流程分为以下共有两步，以下是中断注册流程的示例：

```
ehf_pri_desc_t plat_exceptions[] = {
#if RAS_EXTENSION
    EHF_PRI_DESC(PLAT_PRI_BITS, PLAT_RAS_PRI),
#endif
#if SDEI_SUPPORT
    EHF_PRI_DESC(PLAT_PRI_BITS, PLAT_SDEI_CRITICAL_PRI),
    EHF_PRI_DESC(PLAT_PRI_BITS, PLAT_SDEI_NORMAL_PRI),
#endif
#if SPM_MM
    EHF_PRI_DESC(PLAT_PRI_BITS, PLAT_SP_PRI),
#endif
#ifdef PLAT_EHF_DESC
    PLAT_EHF_DESC,
#endif
};

EHF_REGISTER_PRIORITIES(plat_exceptions, ARRAY_SIZE(plat_exceptions), PLAT_PRI_BITS);
```

上面的例子中注册了 **RAS、SDEI等中断** ，并为它们分配了 **不同的优先级** ，但是此时只是为中断处理函数占了一个位，而并未实际定义。它们实际上要在驱动中通过ehf\_register\_priority\_handler注册。如对于sdei，其注册流程如下：

```
void sdei_init(void)
{
    …
    ehf_register_priority_handler(PLAT_SDEI_CRITICAL_PRI,
            sdei_intr_handler);
    ehf_register_priority_handler(PLAT_SDEI_NORMAL_PRI,
            sdei_intr_handler);
}
```

当 **ehf\_register\_priority\_handler** 注册完成后，理论上bl31就可以接收和处理el3中断了。但是实际上bl31正在执行时，PSTATE的irq和fiq中断掩码都是被mask掉的，即el3中断只有在cpu运行于低于EL3异常等级的时候才能真正被触发和处理.

### 2.3.3 runtime\_svc\_init

该函数主要用来建立 **smc索引表** 并执行EL3中提供的 **service的初始化** 操作。

Arm为它们的使用场景定义了一系列的规范，分别用于处理类型不同的任务，如cpu电源管理规范 **PSCI** 、代理non secure world **处理中断** 的软件事件代理规范 **SDEI** ，以及用于trust os相关调用的 **[SPD](https://zhida.zhihu.com/search?content_id=272874688&content_type=Article&match_order=1&q=SPD&zhida_source=entity)** 等。

runtime\_svc\_init()主要对注册的服务进行有限性验证，调用各自服务的初始化函数 **init()** ，以及将不同SMC OEN转换到注册服务ID。

```
void runtime_svc_init(void)
{
/*判定rt_svc_descs段中的是否超出MAX_RT_SVCS条*/
    assert((RT_SVC_DESCS_END >= RT_SVC_DESCS_START) &&
            (RT_SVC_DECS_NUM < MAX_RT_SVCS));
 
    /* If no runtime services are implemented then simply bail out */
    if (RT_SVC_DECS_NUM == 0)
        return;
 
    /* Initialise internal variables to invalid state */
/* 初始化 t_svc_descs_indices数组中的数据成-1，表示当前所有的service无效*/
    memset(rt_svc_descs_indices, -1, sizeof(rt_svc_descs_indices));
 
/* 获取第一条EL3 service在RAM中的起始地址，通过获取RT_SVC_DESCS_START的值来确定，该值在链接文件中有定义 */
    rt_svc_descs = (rt_svc_desc_t *) RT_SVC_DESCS_START;
 
/* 遍历整个rt_svc_des段，将其call type与rt_svc_descs_indices中的index建立对应关系 */
    for (index = 0; index < RT_SVC_DECS_NUM; index++) {
        rt_svc_desc_t *service = &rt_svc_descs[index];
 

/* 判定在编译的时候注册的service是否有效 */
        rc = validate_rt_svc_desc(service);
 
/* 执行当前service的init的操作 */
        if (service->init) {
            rc = service->init();
            if (rc) {
                ERROR("Error initializing runtime service %s\n",
                        service->name);
                continue;
            }
        }
 
/* 根据该service的call type以及start oen来确定一个唯一的index,并且将该service中支持的所有的call type生成的唯一表示映射到同一个index中 */
        start_idx = get_unique_oen(rt_svc_descs[index].start_oen,
                service->call_type);
        assert(start_idx < MAX_RT_SVCS);
        end_idx = get_unique_oen(rt_svc_descs[index].end_oen,
                service->call_type);
        assert(end_idx < MAX_RT_SVCS);
        for (; start_idx <= end_idx; start_idx++)
            rt_svc_descs_indices[start_idx] = index;
    }
}
```

（1）获取rt\_svc\_descs段的起始地址RT\_SVC\_DESCS\_START

（2）遍历该段中所有已注册rt\_svc\_desc\_t结构体相应的运行时服务

（3）校验运行时服务有效性

（4）调用该服务对应的初始化回调，该回调函数是在DECLARE\_RT\_SVC注册宏中通过参数\_setup传入的

## 2.4 运行时服务

### 2.4.1 SMC指令

![](https://picx.zhimg.com/v2-c62248f1e1589eed0170d92497c54a13_1440w.jpg)

ARM官网文档： [developer.arm.com/docum](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/den0028/a/)

> 什么是SCM？  
> Secure Monitor Call causes an exception to EL3.

[SMCCC](https://zhida.zhihu.com/search?content_id=272874688&content_type=Article&match_order=1&q=SMCCC&zhida_source=entity) 定义了每个 **SMC请求功能的ID** 以及入参和返回值。

SMCCC定义了每个运行服务框架的SMC功能ID、OEN(Owning Entity Numbers)、Fast和Standard调用、SMC32和SMC64调用转换。

需要优先实现的功能有：

- **Standard** 服务调用：
- **Secure-EL1 Payload** Dispatcher service：如果存在TOS或者S.EL1 Payload，则需要EL3 Secure Monitor负责切换NS.EL1/2和S.EL1。Secure Monitor和S.EL1 Payload之间接口被称为SPD(S.EL1 Payload Dispatcher)。ATF还提供了TSP(Test S.EL1 Payload)和TSPD。
- **CPU特有服务** ：提供CPU特有的的功能服务。

include/lib/smccc.h中定义了SMC功能ID：

```
/*******************************************************************************
 * Owning entity number definitions inside the function id as per the SMC
 * calling convention
 ******************************************************************************/
#define OEN_ARM_START            U(0)
#define OEN_ARM_END            U(0)
#define OEN_CPU_START            U(1)
#define OEN_CPU_END            U(1)
#define OEN_SIP_START            U(2)
#define OEN_SIP_END            U(2)
#define OEN_OEM_START            U(3)
#define OEN_OEM_END            U(3)
#define OEN_STD_START            U(4)    /* Standard Service Calls */
#define OEN_STD_END            U(4)
#define OEN_STD_HYP_START        U(5)    /* Standard Hypervisor Service calls */
#define OEN_STD_HYP_END            U(5)
#define OEN_VEN_HYP_START        U(6)    /* Vendor Hypervisor Service calls */
#define OEN_VEN_HYP_END            U(6)
#define OEN_TAP_START            U(48)    /* Trusted Applications */
#define OEN_TAP_END            U(49)
#define OEN_TOS_START            U(50)    /* Trusted OS */
#define OEN_TOS_END            U(63)
#define OEN_LIMIT            U(64)
```
![](https://pic3.zhimg.com/v2-9ea8fa6e4b6bf3ae10a0f76f3887804a_1440w.jpg)

MAX\_RT\_SVCS为128，是因为OEN有64个，SMC类型有Standard和Fast两种类型，所以一共有128种。rt\_svc\_descs\_indices\[\]一共有 **128个** 。

### 2.4.2 DECLARE\_RT\_SVC

**DECLARE\_RT\_SVC** ()用于注册一个运行服务，指定服务名称、OEN范围、服务类型(SMC\_TYPE\_FAST/SMC\_TYPE\_STD)、初始化和调用函数。

通过DECLARE\_RT\_SVC()注册的每个服务都会在ELF的 **rt\_svc\_descs** 段中存在，\_\_RT\_SVC\_DESCS\_START\_\_和\_\_RT\_SVC\_DESCS\_END\_\_是此段的起始结束地址，并可以通过地址范围计算服务数量RT\_SVC\_DECS\_NUM。

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
- start\_oen：该service的起始内部number
- end.oen: 该service的末尾number
- call\_type: 调用的smc的类型
- name: 该service的名字
- init: 该service在执行之前需要被执行的初始化操作
- handle: 当触发了call type的调用时调用的handle该请求的函数

该接口定义了一个结构体 **\_\_svc\_desc\_ ## \_name** ，并将其放到了一个特殊的段rt\_svc\_descs中。这段的定义位于链接脚本头文件include/common/bl\_common.ld.h中，其定义如下：

```
#define RT_SVC_DESCS                                    \
        . = ALIGN(STRUCT_ALIGN);                        \
        __RT_SVC_DESCS_START__ = .;                     \
        KEEP(*(rt_svc_descs))                           \
        __RT_SVC_DESCS_END__ = .;
```

即这些被注册的运行时服务结构体都被保存到以\_\_RT\_SVC\_DESCS\_START\_\_开头，\_\_RT\_SVC\_DESCS\_END\_\_结尾的rt\_svc\_descs段中

所以上面runtime\_svc\_init（）函数里面只需要遍历这段地址就可以了。

### 2.4.3 SMC处理

当EL3 Firmware接收到一个SMC时， **SMC功能ID** 通过W0传递到EL3 Firmware。这是根据寄存位宽和W0进行检查，如果两者不匹配则返回错误。

其中Bit\[31\]和bits\[29:24\]共7bit组成一个0~127范围数值，在rt\_svc\_descs\_indices\[\]所对应具体的软件服务rt\_svc\_descs\[\]索引。

进而调用具体软件服务的handle()函数：

```
uintptr_t handle_runtime_svc(uint32_t smc_fid,
                 void *cookie,
                 void *handle,
                 unsigned int flags)
{
    u_register_t x1, x2, x3, x4;
    int index, idx;
    const rt_svc_desc_t *rt_svc_descs;

    assert(handle);
    idx = get_unique_oen_from_smc_fid(smc_fid);
    assert(idx >= 0 && idx < MAX_RT_SVCS);

    index = rt_svc_descs_indices[idx];---------------------将从x0寄存器中读取的Standard/Fast和OWN组合的idx，找到Runtime Service的index。
    if (index < 0 || index >= RT_SVC_DECS_NUM)
        SMC_RET1(handle, SMC_UNK);

    rt_svc_descs = (rt_svc_desc_t *) RT_SVC_DESCS_START;---Runtime Service起始地址。

    get_smc_params_from_ctx(handle, x1, x2, x3, x4);-------获取x1/x2/x3/x4寄存器。

    return rt_svc_descs[index].handle(smc_fid, x1, x2, x3, x4, cookie,
                        handle, flags);--------------------调用具体Runtime Service的handle()函数。
}
```

## 2.5 PSCI

![](https://pic4.zhimg.com/v2-2522b7556a90cd18019df55a049f0f99_1440w.jpg)

官网文档： [developer.arm.com/docum](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/den0022/c/) PSCI功能作为Standard service一部分，由std\_svc\_smc\_handler()处理。

### 2.5.1 注册

```
DECLARE_RT_SVC(
        std_svc,

        OEN_STD_START,
        OEN_STD_END,
        SMC_TYPE_FAST,
        std_svc_setup,
        std_svc_smc_handler-----------------------------对于Fast类型Standard服务调用，主要是进行PSCI处理。
);

uintptr_t std_svc_smc_handler(uint32_t smc_fid,
                 u_register_t x1,
                 u_register_t x2,
                 u_register_t x3,
                 u_register_t x4,
                 void *cookie,
                 void *handle,
                 u_register_t flags)
{
    /*
     * Dispatch PSCI calls to PSCI SMC handler and return its return
     * value
     */
    if (is_psci_fid(smc_fid)) {
        uint64_t ret;
...

        ret = psci_smc_handler(smc_fid, x1, x2, x3, x4,
            cookie, handle, flags);---------------------首先判断是否是Fast类型，然后交给psci_smc_handler()进行处理。
...
        SMC_RET1(handle, ret);
    }
...
}

u_register_t psci_smc_handler(uint32_t smc_fid,
              u_register_t x1,
              u_register_t x2,
              u_register_t x3,
              u_register_t x4,
              void *cookie,
              void *handle,
              u_register_t flags)
{
    if (is_caller_secure(flags))
        return SMC_UNK;

    /* Check the fid against the capabilities */
    if (!(psci_caps & define_psci_cap(smc_fid)))
        return SMC_UNK;

    if (((smc_fid >> FUNCID_CC_SHIFT) & FUNCID_CC_MASK) == SMC_32) {
...
    } else {---------------------------------------------这里以64系统为例。
        /* 64-bit PSCI function */

        switch (smc_fid) {
        case PSCI_CPU_SUSPEND_AARCH64:
            return psci_cpu_suspend(x1, x2, x3);

        case PSCI_CPU_ON_AARCH64:-----------------------PSCI_CPU_ON_AARCH64为0xc4000003，bit[31]=1：Fast Call、bit[30]=1：SMC64、bits[29:24]=000100：Starndard service、bits[15:0]=0000 0011：内部定义序号。
            return psci_cpu_on(x1, x2, x3);

          case PSCI_AFFINITY_INFO_AARCH64:                          return psci_affinity_info(x1, x2);
                  case PSCI_MIG_AARCH64:                      return psci_migrate(x1);
                  case PSCI_MIG_INFO_UP_CPU_AARCH64:                          return psci_migrate_info_up_cpu();
                  case PSCI_NODE_HW_STATE_AARCH64:                          return psci_node_hw_state(x1, x2);
                  case PSCI_SYSTEM_SUSPEND_AARCH64:                          return psci_system_suspend(x1, x2);
  #if ENABLE_PSCI_STAT                  case PSCI_STAT_RESIDENCY_AARCH64:                          return psci_stat_residency(x1, x2);
                  case PSCI_STAT_COUNT_AARCH64:                          return psci_stat_count(x1, x2);  #endif
        default:
            break;
        }
    }

    WARN("Unimplemented PSCI Call: 0x%x \n", smc_fid);
    return SMC_UNK;
}
```

### 2.5.2 PSCI服务

```
/*******************************************************************************
 * Defines for runtime services function ids
 ******************************************************************************/
#define PSCI_VERSION            U(0x84000000)
#define PSCI_CPU_SUSPEND_AARCH32    U(0x84000001)
#define PSCI_CPU_SUSPEND_AARCH64    U(0xc4000001)
#define PSCI_CPU_OFF            U(0x84000002)
#define PSCI_CPU_ON_AARCH32        U(0x84000003)
#define PSCI_CPU_ON_AARCH64        U(0xc4000003)
#define PSCI_AFFINITY_INFO_AARCH32    U(0x84000004)
#define PSCI_AFFINITY_INFO_AARCH64    U(0xc4000004)
#define PSCI_MIG_AARCH32        U(0x84000005)
#define PSCI_MIG_AARCH64        U(0xc4000005)
#define PSCI_MIG_INFO_TYPE        U(0x84000006)
#define PSCI_MIG_INFO_UP_CPU_AARCH32    U(0x84000007)
#define PSCI_MIG_INFO_UP_CPU_AARCH64    U(0xc4000007)
#define PSCI_SYSTEM_OFF            U(0x84000008)
#define PSCI_SYSTEM_RESET        U(0x84000009)
#define PSCI_FEATURES            U(0x8400000A)
#define PSCI_NODE_HW_STATE_AARCH32    U(0x8400000d)
#define PSCI_NODE_HW_STATE_AARCH64    U(0xc400000d)
#define PSCI_SYSTEM_SUSPEND_AARCH32    U(0x8400000E)
#define PSCI_SYSTEM_SUSPEND_AARCH64    U(0xc400000E)
#define PSCI_SET_SUSPEND_MODE        U(0x8400000F)
#define PSCI_STAT_RESIDENCY_AARCH32    U(0x84000010)
#define PSCI_STAT_RESIDENCY_AARCH64    U(0xc4000010)
#define PSCI_STAT_COUNT_AARCH32        U(0x84000011)
#define PSCI_STAT_COUNT_AARCH64        U(0xc4000011)
#define PSCI_SYSTEM_RESET2_AARCH32    U(0x84000012)
#define PSCI_SYSTEM_RESET2_AARCH64    U(0xc4000012)
#define PSCI_MEM_PROTECT        U(0x84000013)
#define PSCI_MEM_CHK_RANGE_AARCH32    U(0x84000014)
#define PSCI_MEM_CHK_RANGE_AARCH64    U(0xc4000014)
```

## 2.6 OP-TEE

**Bl32** 主要用于运行 **trust os** ，它主要用来 **保护用户的敏感数据** （如密码、指纹、人脸等），以及与其相关的功能模块，如加解密算法，ta的加载与执行，secure storage等。各个厂家的trust os实现都有所不同，但基本思路是类似的，下面分析中涉及到具体的trust os时，我们将选取开源框架optee为例。

### 2.6.1 OPTEE接口

optee注册了 **Fast和Standard** 两种调用类型，Fast类型需要使用opteed\_setup()进行初始化。两种类型共用opteed\_smc\_handler()进行smc处理。

```
/* Define an OPTEED runtime service descriptor for fast SMC calls */
DECLARE_RT_SVC(
    opteed_fast,

    OEN_TOS_START,
    OEN_TOS_END,
    SMC_TYPE_FAST,
    opteed_setup,
    opteed_smc_handler
);

/* Define an OPTEED runtime service descriptor for standard SMC calls */
DECLARE_RT_SVC(
    opteed_std,

    OEN_TOS_START,
    OEN_TOS_END,
    SMC_TYPE_STD,
    NULL,
    opteed_smc_handler
);
```

### 2.6.2 bl31跳转到OP-TEE

实现从bl31到OP-TEE的跳转是通过执行 **opteed\_setup** 函数来实现的，该函数在执行runtime\_svc\_int中对各service做service->init()函数来实现，而OPTEE这个service就是通过DECALARE\_RT\_SVC被注册到tr\_svc\_descs段中，代码存在services/spd/opteed/opteed\_main.c文件中，内容如下：

```
/* Define an OPTEED runtime service descriptor for yielding SMC calls */
DECLARE_RT_SVC(
    opteed_std,

    OEN_TOS_START,
    OEN_TOS_END,
    SMC_TYPE_YIELD,
    NULL,
    opteed_smc_handler
);
```

在ATF BL31启动过程中，runtime\_svc\_init()会调用opteed\_setup()来完成optee的启动。

```
opteed_setup

    optee_ep_info = bl31_plat_get_next_image_ep_info(SECURE); //获取BL32即optee os镜像信息。

    opteed_init_optee_ep_state //初始化安全CPU的smc上下文，存放于opteed_sp_context[]中。
    bl31_register_bl32_init(&opteed_init); //bl32_init指向opteed_init()，在bl31_main()中被调用。
```

**opteed\_init** ()从镜像中获取optee os的入口点，并初始化好ATF和optee切换的上下文，然后进入optee并等待返回结果。

```
opteed_init
     optee_entry_point = bl31_plat_get_next_image_ep_info(SECURE); //获取optee os镜像信息。
     cm_init_my_context(optee_entry_point); //设置当前CPU进入安全状态的上下文。
     rc = opteed_synchronous_sp_entry(optee_ctx); //启动optee os，并等待OPTEE_ENTRY_DONE返回结果
     
opteed_synchronous_sp_entry
    cm_el1_sysregs_context_restore(SECURE); //从optee_ctx->cpu_ctx中恢复S.EL1相关寄存器。
    cm_set_next_eret_context(SECURE); //保存从S.EL1返回需要的上下文。

    rc = opteed_enter_sp(&optee_ctx->c_rt_ctx); //将安全CPU保存的状态恢复到optee_ctx->c_rt_ctx中，并跳转到opteed os执行。

func opteed_enter_sp
    /* Make space for the registers that we're going to save */
    mov    x3, sp
    str    x3, [x0, #0]
    sub    sp, sp, #OPTEED_C_RT_CTX_SIZE

    /* Save callee-saved registers on to the stack */
    stp    x19, x20, [sp, #OPTEED_C_RT_CTX_X19]
    stp    x21, x22, [sp, #OPTEED_C_RT_CTX_X21]
    stp    x23, x24, [sp, #OPTEED_C_RT_CTX_X23]
    stp    x25, x26, [sp, #OPTEED_C_RT_CTX_X25]
    stp    x27, x28, [sp, #OPTEED_C_RT_CTX_X27]
    stp    x29, x30, [sp, #OPTEED_C_RT_CTX_X29]

    /* ---------------------------------------------
     * Everything is setup now. el3_exit() will
     * use the secure context to restore to the
     * general purpose and EL3 system registers to
     * ERET into OPTEE.
     * ---------------------------------------------
     */
    b    el3_exit //使用配置好的安全上下文，退出EL3进入OPTEE。
endfunc opteed_enter_sp
```

optee的bl32启动函数为 **opteed\_init** ，它的流程与我们先前bl1启动bl2的跳转方式类似，其流程图如下：

![](https://pic2.zhimg.com/v2-d24f90d13b7517afc35eb9c7127881bf_1440w.jpg)

它先获取先前保存的secure镜像ep信息（即 **bl32的ep信息** ），然后用其初始化异常等级切换的上下文，设置secure el1的系统寄存器，spsr\_el3和elr\_el3等。然后调用opteed\_enter\_sp函数跳转到bl32。

这里有个问题，bl31除了启动bl32后，还需要继续启动bl33，因此 **bl32启动完成后还需要跳转回bl31并继续执行bl33启动流程** 。由于bl32在secure EL1执行，其同步进入bl31只能使用smc方式，因此需要在smc处理流程中跳转到原先的断点处。Armv8中c语言的lr寄存器为x30，因此若我们在跳转之前保存x30及运行上下文，然后再smc处理流程中恢复这些上下文即可以实现恢复断点处执行了。以下为opteed\_enter\_sp函数的上下文保存流程：

```
func opteed_enter_sp
    mov    x3, sp
    str    x3, [x0, #0]
    sub    sp, sp, #OPTEED_C_RT_CTX_SIZE

    stp    x19, x20, [sp, #OPTEED_C_RT_CTX_X19]
    stp    x21, x22, [sp, #OPTEED_C_RT_CTX_X21]
    stp    x23, x24, [sp, #OPTEED_C_RT_CTX_X23]
    stp    x25, x26, [sp, #OPTEED_C_RT_CTX_X25]
    stp    x27, x28, [sp, #OPTEED_C_RT_CTX_X27]
    stp    x29, x30, [sp, #OPTEED_C_RT_CTX_X29]

    b    el3_exit
endfunc opteed_enter_sp
```

在该函数中上下文会被保存到全局变量 **opteed\_sp\_context** 中，optee初始化完成后返回smc处理的流程如下（services/spd/opteed/opteed\_main.c）：

```
uintptr_t opteed_smc_handler(…)
{
optee_context_t *optee_ctx = &opteed_sp_context[linear_id];
    …
    switch (smc_fid) {
    case TEESMC_OPTEED_RETURN_ENTRY_DONE:                             （1）
        assert(optee_vector_table == NULL);
        optee_vector_table = (optee_vectors_t *) x1;
        …
        opteed_synchronous_sp_exit(optee_ctx, x1);                 （2）
        break;
    …
    }
}
```

（1）表明本次smc调用是bl32启动完成后返回

（2）调用该函数恢复进入bl32之前保存的上下文，返回断点处继续执行。该函数的定义如下：

```
func opteed_exit_sp
    mov    sp, x0                                                                  （1）

    ldp    x19, x20, [x0, #(OPTEED_C_RT_CTX_X19 - OPTEED_C_RT_CTX_SIZE)]
    ldp    x21, x22, [x0, #(OPTEED_C_RT_CTX_X21 - OPTEED_C_RT_CTX_SIZE)]
    ldp    x23, x24, [x0, #(OPTEED_C_RT_CTX_X23 - OPTEED_C_RT_CTX_SIZE)]
    ldp    x25, x26, [x0, #(OPTEED_C_RT_CTX_X25 - OPTEED_C_RT_CTX_SIZE)]
    ldp    x27, x28, [x0, #(OPTEED_C_RT_CTX_X27 - OPTEED_C_RT_CTX_SIZE)]
    ldp    x29, x30, [x0, #(OPTEED_C_RT_CTX_X29 - OPTEED_C_RT_CTX_SIZE)]            （2）

    mov    x0, x1
    ret                                                                              （3）
endfunc opteed_exit_sp
```

（1）恢复进入bl32之前保存在context中的栈

（2）恢复进入bl32之前保存的callee寄存器

（3）返回断点处继续执行，兜兜转转一圈，我们好不容易又返回到bl31\_main函数了

最后，用一张图来描述以上整个流程：

![](https://pic4.zhimg.com/v2-97ce0ce58838dc48b4a474cb8dcb53ef_1440w.jpg)

### 2.6.3 OP-TEE的SPD

BL31中处理OP-TEE安全请求分发入口函数是opteed\_smc\_handler()。

```
uint64_t opteed_smc_handler(uint32_t smc_fid,
             uint64_t x1,
             uint64_t x2,
             uint64_t x3,
             uint64_t x4,
             void *cookie,
             void *handle,
             uint64_t flags)
{
    cpu_context_t *ns_cpu_context;
    uint32_t linear_id = plat_my_core_pos();
    optee_context_t *optee_ctx = &opteed_sp_context[linear_id];//获取当前CPU保存的optee上下文。
    uint64_t rc;

    if (is_caller_non_secure(flags)) {
        cm_el1_sysregs_context_save(NON_SECURE);

        if (GET_SMC_TYPE(smc_fid) == SMC_TYPE_FAST) {
            cm_set_elr_el3(SECURE, (uint64_t)
                    &optee_vectors->fast_smc_entry);
        } else {
            cm_set_elr_el3(SECURE, (uint64_t)
                    &optee_vectors->std_smc_entry);
        }

        cm_el1_sysregs_context_restore(SECURE);
        cm_set_next_eret_context(SECURE);

        write_ctx_reg(get_gpregs_ctx(&optee_ctx->cpu_ctx),
                  CTX_GPREG_X4,
                  read_ctx_reg(get_gpregs_ctx(handle),
                       CTX_GPREG_X4));
        write_ctx_reg(get_gpregs_ctx(&optee_ctx->cpu_ctx),
                  CTX_GPREG_X5,
                  read_ctx_reg(get_gpregs_ctx(handle),
                       CTX_GPREG_X5));
        write_ctx_reg(get_gpregs_ctx(&optee_ctx->cpu_ctx),
                  CTX_GPREG_X6,
                  read_ctx_reg(get_gpregs_ctx(handle),
                       CTX_GPREG_X6));
        /* Propagate hypervisor client ID */
        write_ctx_reg(get_gpregs_ctx(&optee_ctx->cpu_ctx),
                  CTX_GPREG_X7,
                  read_ctx_reg(get_gpregs_ctx(handle),
                       CTX_GPREG_X7));

        SMC_RET4(&optee_ctx->cpu_ctx, smc_fid, x1, x2, x3);
    }

    switch (smc_fid) {
    case TEESMC_OPTEED_RETURN_ENTRY_DONE://optee冷启动初始化完成后返回。
        assert(optee_vectors == NULL);
        optee_vectors = (optee_vectors_t *) x1;

        if (optee_vectors) {
            set_optee_pstate(optee_ctx->state, OPTEE_PSTATE_ON);

            psci_register_spd_pm_hook(&opteed_pm);

            flags = 0;
            set_interrupt_rm_flag(flags, NON_SECURE);
            rc = register_interrupt_type_handler(INTR_TYPE_S_EL1,
                        opteed_sel1_interrupt_handler,
                        flags);
            if (rc)
                panic();
        }
        opteed_synchronous_sp_exit(optee_ctx, x1);//从optee中返回。

    case TEESMC_OPTEED_RETURN_ON_DONE://表示optee由cpu_on导致的启动完成,0标识成功，其他失败。
    case TEESMC_OPTEED_RETURN_RESUME_DONE://表示optee从cpu_suspend导致的休眠中唤醒完成；0表示成功，其他失败。
    case TEESMC_OPTEED_RETURN_OFF_DONE://下面分表表示optee对cpu_off/cpu_suspend/system_off/system_reset的响应结果；0表示成功，其他表示失败。其中system_off和system_reset无返回参数。
    case TEESMC_OPTEED_RETURN_SUSPEND_DONE:
    case TEESMC_OPTEED_RETURN_SYSTEM_OFF_DONE:
    case TEESMC_OPTEED_RETURN_SYSTEM_RESET_DONE:
        opteed_synchronous_sp_exit(optee_ctx, x1);

    case TEESMC_OPTEED_RETURN_CALL_DONE://optee处理完smc之后，需要返回普通世界，x1-x4返回参数。
        assert(handle == cm_get_context(SECURE));
        cm_el1_sysregs_context_save(SECURE);

        /* Get a reference to the non-secure context */
        ns_cpu_context = cm_get_context(NON_SECURE);
        assert(ns_cpu_context);

        /* Restore non-secure state */
        cm_el1_sysregs_context_restore(NON_SECURE);
        cm_set_next_eret_context(NON_SECURE);

        SMC_RET4(ns_cpu_context, x1, x2, x3, x4);

    case TEESMC_OPTEED_RETURN_FIQ_DONE://optee处理完fiq中断后，需要返回普通世界。
        ns_cpu_context = cm_get_context(NON_SECURE);
        assert(ns_cpu_context);

        cm_el1_sysregs_context_restore(NON_SECURE);
        cm_set_next_eret_context(NON_SECURE);

        SMC_RET0((uint64_t) ns_cpu_context);

    default:
        panic();
    }
}

void opteed_synchronous_sp_exit(optee_context_t *optee_ctx, uint64_t ret)
{
    assert(optee_ctx != NULL);
    /* Save the Secure EL1 system register context */
    assert(cm_get_context(SECURE) == &optee_ctx->cpu_ctx);
    cm_el1_sysregs_context_save(SECURE);//保存S.EL1下optee系统寄存器保存到cpu_context[SECURE]中。

    assert(optee_ctx->c_rt_ctx != 0);
    opteed_exit_sp(optee_ctx->c_rt_ctx, ret);//恢复optee_enter_sp()保存的C运行环境上下文。

    /* Should never reach here */
    assert(0);
}
```

## 2.7 el3\_exit启动bl33

**bl33启动流程** 与前面各级镜像启动流程，类似，也是根据 **ep\_info** 设置bl33的上下文、入口地址和参数，然后跳转到入口执行。大家有兴趣可以自行根据代码分析一下，这里不再赘述。atf启动流程总算走完了，接下来我们将跳转到bl33（uboot）的世界，一切的准备都是为了uboot启动kernel。

参考：

> 后记：  
> 这篇写的是 **又臭又长** ，不过要是研究ATF的还算是个宝。有时候研究启动流程好像只是一个 **表面的入门** ，很多硬核知识还是需要去学习 **ARM手册** ，进行融会贯通，这也是这个文章缺乏的，还是 **不够系统** 。有机会了直接介绍ARM的知识，一起学习。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-04-10 17:09・上海[最近火爆全网的Treeow树新风T2 pro究竟好不好用？不吹不黑，博主真实测评，告诉你到底值不值得入！](https://zhuanlan.zhihu.com/p/1954496558595806923)

[

家有孕妇孩子，真的要引起足够的重视！ 甲醛中毒导致身体不好的案例层出不穷，前段时间也是很多宝子在后台私信问我，有没有自用款空气净化器推荐，我也是知无不言言无不尽，把我家用的T...

](https://zhuanlan.zhihu.com/p/1954496558595806923)