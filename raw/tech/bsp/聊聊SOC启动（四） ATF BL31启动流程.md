---
title: "聊聊SOC启动（四） ATF BL31启动流程"
source: "https://zhuanlan.zhihu.com/p/520052961"
author:
  - "[[lgjjeff]]"
published:
created: 2026-05-03
description: "本文基于以下软硬件假定： 架构：AARCH64 软件：ATF V2.5 １ BL31启动流程 与bl1和bl2不同，bl31包含两部分功能，在启动时作为启动流程的一部分，执行软硬件初始化以及启动bl32和bl33镜像。在系统启动完成后，将继…"
tags:
  - "clippings"
---
[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944)

19 人赞同了该文章

本文基于以下软硬件假定：

架构：AARCH64

软件： [ATF V2.5](https://zhida.zhihu.com/search?content_id=203699238&content_type=Article&match_order=1&q=ATF+V2.5&zhida_source=entity)

## １　BL31启动流程

　　与bl1和bl2不同，bl31包含两部分功能，在启动时作为启动流程的一部分，执行软硬件初始化以及启动bl32和bl33镜像。在系统启动完成后，将继续驻留于系统中，并处理来自其它异常等级的smc异常，以及其它需要路由到EL3处理的中断等。因此bl31启动流程主要包含以下工作：  
（1）cpu初始化

（2）c运行时环境初始化

（3）基本硬件初始化，如gic，串口，timer等

（4）页表创建和cache使能

（5）启动后级镜像的准备以及新镜像的跳转

（6）若bl31支持el3中断，则需要初始化中断处理框架

（7）运行时不同secure状态的smc处理，以及异常等级切换上下文的初始化

（8）用于处理smc命令的运行时服务注册

　　闲话少说，惯例上图：

![](https://pica.zhimg.com/v2-0ee7da4528d581cc42b0d7a639b3ee1e_1440w.jpg)

## ２　bl31基础初始化

### ２.1　参数保存

```
mov    x20, x0
mov    x21, x1
mov    x22, x2
mov    x23, x3
```

　　与bl2相同，将bl2传入的参数从caller寄存器保存到callee寄存器中

### ２.２　el3\_entrypoint\_common函数

　　该函数在bl1中已经详细介绍过了，但bl31对其的调用方式还是与bl1有所不同的。让我们看下bl31中的调用：

```
#if !RESET_TO_BL31
    el3_entrypoint_common                    \
        _init_sctlr=0                    \
        _warm_boot_mailbox=0                \
        _secondary_cold_boot=0                \
        _init_memory=0                    \
        _init_c_runtime=1                \
        _exception_vectors=runtime_exceptions        \
        _pie_fixup_size=BL31_LIMIT - BL31_BASE
#else
        el3_entrypoint_common                    \
        _init_sctlr=1                    \
        _warm_boot_mailbox=!PROGRAMMABLE_RESET_ADDRESS    \
        _secondary_cold_boot=!COLD_BOOT_SINGLE_CPU    \
        _init_memory=1                    \
        _init_c_runtime=1                \
        _exception_vectors=runtime_exceptions        \
        _pie_fixup_size=BL31_LIMIT - BL31_BASE
    mov    x20, 0
    mov    x21, 0
    mov    x22, 0
    mov    x23, 0
#endif
```

　　由上面的代码可知，根据是否设置了RESET\_TO\_BL31，该函数有两套不同的调用参数。这是因为atf支持两种启动方式：  
（1）启动从bl1开始执行，这是atf默认的启动方式。此时由于bl1已经执行过el3\_entrypoint\_common函数，系统基本配置都已经设置完成。因此像设置sctlr寄存器、热启动跳转处理、secondary cpu处理，以及内存初始化流程在bl1中都已经完成，bl31中就可以跳过它们了

（2）支持从bl31开始启动的基础是armv8支持动态设置cpu的重启地址，armv8架构提供了RVBAR（reset vector base address register）寄存器用于设置reset时cpu的启动位置。该寄存器一共有三个：RVBAR\_EL1、RVBAR\_EL2和 [RVBAR\_EL3](https://zhida.zhihu.com/search?content_id=203699238&content_type=Article&match_order=1&q=RVBAR_EL3&zhida_source=entity) ，根据系统实现的最高异常等级确定使用哪一个。我们知道armv8重启总是从最高异常等级开始执行，因此我们只需要设置最高异常等级的RVBAR寄存器即可。由于bl31运行在el3下，故若我们需要支持启动从bl31开始，就可通过将地址设置到RVBAR\_EL3寄存器实现。

　　若启动从bl31开始，则由于它是第一级启动镜像，因此el3\_entrypoint\_common需要从头设置系统状态，因此该函数中的sctlr寄存器、启动跳转处理、secondary cpu处理，以及内存初始化流程等都需要执行。

　　虽然el3\_entrypoint\_common需要做的工作有点多，但这种方式直接跳过了bl1和bl2两级启动流程，相比于第一种方式其启动速度要更快，这也是它的最大优势。

　　最后这种方式将参数保存寄存器x20 – x23的值清零也非常好理解，因为此时bl31是启动的第一级镜像，自然就没有前级镜像传递的参数，此时将这些值清零可避免后面参数解析时出现问题

## ３　bl31参数设置

### ３.１　bl31\_early\_platform\_setup2

　　该函数先初始化qemu控制台，然后解析bl2传入的镜像描述链表参数，并将解析到的bl32和bl33镜像ep\_info保存到全局变量中。其主要流程如下：

```
qemu_console_init();                                                     （1）
bl_params_t *params_from_bl2 = (bl_params_t *)arg0;                      （2）
    …
bl_params_node_t *bl_params = params_from_bl2->head;                      （3）
    while (bl_params) {                                               （4）
    if (bl_params->image_id == BL32_IMAGE_ID) {
        bl32_image_ep_info = *bl_params->ep_info;                 （5）
    }

    if (bl_params->image_id == BL33_IMAGE_ID){
        bl33_image_ep_info = *bl_params->ep_info;                  （6）
    }

    bl_params = bl_params->next_params_info;
}
if (!bl33_image_ep_info.pc)                                                 （7）
    panic();
```

（1）控制台初始化

（2）获取arg0传入的镜像描述参数指针

（3）获取镜像链表头节点

（4）遍历镜像链表

（5）若该链表中含有bl32镜像描述符，则将其ep\_info保存到全局变量

（6）多该链表中含有bl33镜像描述符，同样将其ep\_info保存到全局变量

（7）校验bl33镜像的入口地址

### ３.２　bl31\_plat\_arch\_setup

该函数用于为bl31相关内存创建页表，并使能MMU和dcache，其代码如下：

void bl31\_plat\_arch\_setup(void)

{

qemu\_configure\_mmu\_el3(BL31\_BASE, (BL31\_END - BL31\_BASE),

BL\_CODE\_BASE, BL\_CODE\_END,

BL\_RO\_DATA\_BASE, BL\_RO\_DATA\_END,

BL\_COHERENT\_RAM\_BASE, BL\_COHERENT\_RAM\_END);

}

## ４　bl31主处理函数

### ４.１　bl31\_platform\_setup

该函数是平台相关的，qemu平台的实现如下：

```
void bl31_platform_setup(void)
{
    plat_qemu_gic_init();                （1）
    qemu_gpio_init();                    （2）
}
```

（1）初始化gic，包括gic的distributor，redistributor，cpu interface等的初始化。关于bl31 gic和中断处理的详细流程，可参考以下博文：  
[blog.csdn.net/lgjjeff/a](https://link.zhihu.com/?target=https%3A//blog.csdn.net/lgjjeff/article/details/122402214%3Fspm%3D1001.2014.3001.5502)

（2）初始化qemu平台的gpio，即为其设置gpio基地址和操作相关的回调函数

### ４.2　ehf初始化

　　ehf用于初始化el3中断处理相关的功能。在gicv3中中断被分为三个group：group0、secure group1和non secure group 1，它们根据scr\_el3的irq和fiq位配置不同可分别路由到不同的异常等级处理。Ehf用于处理group0中断，这种中断总是以fiq形式触发，通过设置scr\_el3将其路由到el3处理就可以在bl31中处理这种类型中断了。关于中断路由原理，可参考：  
[blog.csdn.net/lgjjeff/a](https://link.zhihu.com/?target=https%3A//blog.csdn.net/lgjjeff/article/details/110729661%3Fspm%3D1001.2014.3001.5502)

　　ehf初始化流程主要就是设置group 0的路由方式，并为其设置一个总的中断处理函数。其主要流程如下：

```
void __init ehf_init(void)
{
    unsigned int flags = 0;
    int ret __unused;
    …
    set_interrupt_rm_flag(flags, NON_SECURE);
    set_interrupt_rm_flag(flags, SECURE);                              （1）

    ret = register_interrupt_type_handler(INTR_TYPE_EL3,
            ehf_el3_interrupt_handler, flags);                 （2）
    assert(ret == 0);
}
```

（1）计算中断路由相关的flag

（2）设置EL3类型（group 0）中断的中断路由方式和bl31总的中断处理函数

　　bl31中断处理函数ehf\_el3\_interrupt\_handler会由异常向量表处理流程调用，它会继续根据中断优先级调用实际每个优先级对应的处理函数。中断优先级对应处理函数的注册流程分为以下共有两步，以下是中断注册流程的示例：

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

　　上面的例子中注册了RAS、SDEI等中断，并为它们分配了不同的优先级，但是此时只是为中断处理函数占了一个位，而并未实际定义。它们实际上要在驱动中通过ehf\_register\_priority\_handler注册。如对于sdei，其注册流程如下：

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

　　当ehf\_register\_priority\_handler注册完成后，理论上bl31就可以接收和处理el3中断了。但是实际上bl31正在执行时，PSTATE的irq和fiq中断掩码都是被mask掉的，即el3中断只有在cpu运行于低于EL3异常等级的时候才能真正被触发和处理

### ４.３　运行时服务初始化

　　前面我们提到bl31在系统初始化完成后还需要驻留系统，并处理来自低异常等级的smc异常，其异常处理流程被称为运行时服务。Arm为它们的使用场景定义了一系列的规范，分别用于处理类型不同的任务，如cpu电源管理规范PSCI、代理non secure world处理中断的软件事件代理规范SDEI，以及用于trust os相关调用的SPD等。显然这些服务被使用之前，其服务处理函数需要先注册到bl31中，运行时服务初始化流程即是用于该目的。

　　在分析运行时服务初始化流程之前，我们先看下其注册方式。以下是其注册接口DECLARE\_RT\_SVC的定义：

```
#define DECLARE_RT_SVC(_name, _start, _end, _type, _setup, _smch)    \
    static const rt_svc_desc_t __svc_desc_ ## _name            \                 （1）
        __section("rt_svc_descs") __used = {            \                 （2）
            .start_oen = (_start),                \
            .end_oen = (_end),                \
            .call_type = (_type),                \
            .name = #_name,                    \
            .init = (_setup),                \
            .handle = (_smch)                \
        }
```

　　该接口定义了一个结构体\_\_svc\_desc\_ ## \_name，并将其放到了一个特殊的段rt\_svc\_descs中。这段的定义位于链接脚本头文件include/common/bl\_common.ld.h中，其定义如下：

```
#define RT_SVC_DESCS                                    \
        . = ALIGN(STRUCT_ALIGN);                        \
        __RT_SVC_DESCS_START__ = .;                     \
        KEEP(*(rt_svc_descs))                           \
        __RT_SVC_DESCS_END__ = .;
```

　　即这些被注册的运行时服务结构体都被保存到以\_\_RT\_SVC\_DESCS\_START\_\_开头，\_\_RT\_SVC\_DESCS\_END\_\_结尾的rt\_svc\_descs段中，其数据可表示为如下结构：

![](https://pic4.zhimg.com/v2-e79091d13ce890018cc43ccce32fd6b9_1440w.jpg)

　　因此若需要获取这些结构体指针，只需遍历这段地址就可以了。运行时服务初始化函数 [runtime\_svc\_init](https://zhida.zhihu.com/search?content_id=203699238&content_type=Article&match_order=1&q=runtime_svc_init&zhida_source=entity) 流即是如此，其定义如下：

```
void __init runtime_svc_init(void)
{
    …
    rt_svc_descs = (rt_svc_desc_t *) RT_SVC_DESCS_START;                 （1）
    for (index = 0U; index < RT_SVC_DECS_NUM; index++) {                 （2）
        rt_svc_desc_t *service = &rt_svc_descs[index];

            rc = validate_rt_svc_desc(service);                  （3）
        if (rc != 0) {
            ERROR("Invalid runtime service descriptor %p\n",
                (void *) service);
            panic();
        }

        if (service->init != NULL) {            
            rc = service->init();                                 （4）
            if (rc != 0) {
                ERROR("Error initializing runtime service %s\n",
                        service->name);
                continue;
            }
        }
        …
    }
}
```

（1）获取rt\_svc\_descs段的起始地址RT\_SVC\_DESCS\_START

（2）遍历该段中所有已注册rt\_svc\_desc\_t结构体相应的运行时服务

（3）校验运行时服务有效性

（4）调用该服务对应的初始化回调，该回调函数是在DECLARE\_RT\_SVC注册宏中通过参数\_setup传入的

### ４.4　启动bl32

　　Bl32主要用于运行trust os，它主要用来保护用户的敏感数据（如密码、指纹、人脸等），以及与其相关的功能模块，如加解密算法，ta的加载与执行，secure storage等。各个厂家的trust os实现都有所不同，但基本思路是类似的，下面分析中涉及到具体的trust os时，我们将选取开源框架optee为例。

　　启动流程中bl32运行流程如下：

```
if (bl32_init != NULL) {
    INFO("BL31: Initializing BL32\n");

    int32_t rc = (*bl32_init)();

    if (rc == 0)
        WARN("BL31: BL32 initialization failed\n");
}
```

　　它首先判断bl32\_init是否已注册，若已注册则通过调用该函数执行实际的bl32运行流程。我们先看下optee架构下bl32\_init注册流程（services/spd/opteed）：

```
DECLARE_RT_SVC(
    opteed_fast,

    OEN_TOS_START,
    OEN_TOS_END,
    SMC_TYPE_FAST,
    opteed_setup,                                                 （1）
    opteed_smc_handler
);

static int32_t opteed_setup(void)
{
    …
    bl31_register_bl32_init(&opteed_init)                          （2）
    return 0;
}

void bl31_register_bl32_init(int32_t (*func)(void))
{
    bl32_init = func;                                              （3）
}
```

（1）通过DECLARE\_RT\_SVC设置optee的初始化回调opteed\_setup

（2）将opteed\_init函数注册为bl32的启动函数

（3）实际的回调注册

　　因此optee的bl32启动函数为opteed\_init，它的流程与我们先前bl1启动bl2的跳转方式类似，其流程图如下：

![](https://picx.zhimg.com/v2-622daed4ea58443b6858afab167d66c1_1440w.jpg)

　　它先获取先前保存的secure镜像ep信息（即bl32的ep信息），然后用其初始化异常等级切换的上下文，设置secure el1的系统寄存器，spsr\_el3和elr\_el3等。然后调用opteed\_enter\_sp函数跳转到bl32。这里有个问题，bl31除了启动bl32后，还需要继续启动bl33，因此bl32启动完成后还需要跳转回bl31并继续执行bl33启动流程。由于bl32在secure EL1执行，其同步进入bl31只能使用smc方式，因此需要在smc处理流程中跳转到原先的断点处。Armv8中c语言的lr寄存器为x30，因此若我们在跳转之前保存x30及运行上下文，然后再smc处理流程中恢复这些上下文即可以实现恢复断点处执行了。以下为opteed\_enter\_sp函数的上下文保存流程：

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

　　在该函数中上下文会被保存到全局变量opteed\_sp\_context中，optee初始化完成后返回smc处理的流程如下（services/spd/opteed/opteed\_main.c）：

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

![](https://pic2.zhimg.com/v2-a52f6d41e14d64132f076d2c5519a645_1440w.jpg)

### ４.4　启动bl33

　　bl33启动流程与前面各级镜像启动流程，类似，也是根据ep\_info设置bl33的上下文、入口地址和参数，然后跳转到入口执行。大家有兴趣可以自行根据代码分析一下，这里不再赘述。好了，atf启动流程总算走完了，接下来我们将跳转到bl33（uboot）的世界，一切的准备都是为了uboot启动kernel那一刻的美好，enjoy！

编辑于 2022-10-12 13:41[数字ic流片经历重要吗？](https://www.zhihu.com/question/615647413/answer/3201092393)

[

是重要的，尤其对新人众所周知，放眼今天整个IC公司招聘最看重什么？无疑是项目经验了。面试问的最多的是什么？是有项目...

](https://www.zhihu.com/question/615647413/answer/3201092393)