---
title: "ATF bl31中断分析"
source: "https://zhuanlan.zhihu.com/p/520161285"
author:
  - "[[lgjjeff]]"
published:
created: 2026-05-03
description: "ARM架构：ARMv8 GIC版本：GICv3、GICv4 软件版本：Arm trust firmware V2.5 1 Bl31中断功能概述 ATF在bl31中提供了GICv3驱动加载、bl31的中断处理、异常等级切换时中断路由信息配置以及GICv3相关的电源管理功能，…"
tags:
  - "clippings"
---
[收录于 · 中断系统](https://www.zhihu.com/column/c_1513125306935898112)

TrustZone 等 13 人赞同了该文章

[ARM架构](https://zhida.zhihu.com/search?content_id=203723383&content_type=Article&match_order=1&q=ARM%E6%9E%B6%E6%9E%84&zhida_source=entity) ：ARMv8

GIC版本： [GICv3](https://zhida.zhihu.com/search?content_id=203723383&content_type=Article&match_order=1&q=GICv3&zhida_source=entity) 、GICv4

软件版本： [Arm trust firmware](https://zhida.zhihu.com/search?content_id=203723383&content_type=Article&match_order=1&q=Arm+trust+firmware&zhida_source=entity) V2.5

## 1　Bl31中断功能概述

　　ATF在 [bl31](https://zhida.zhihu.com/search?content_id=203723383&content_type=Article&match_order=1&q=bl31&zhida_source=entity) 中提供了GICv3驱动加载、bl31的中断处理、异常等级切换时中断路由信息配置以及GICv3相关的电源管理功能，由于电源管理功能与中断处理流程关联不大，在本文中不做详细分析。下图为bl31中gic驱动和中断处理流程架构，其中平台相关部分代码都以arm common plat为例，如bl31 platform setup和gicv3 init是与平台相关的：

![](https://pic4.zhimg.com/v2-ff046609cae734dca0ceaa8204dffb2b_1440w.jpg)

　　GICv3驱动加载流程主要实现了 [distributor](https://zhida.zhihu.com/search?content_id=203723383&content_type=Article&match_order=1&q=distributor&zhida_source=entity) 、 [redistributor](https://zhida.zhihu.com/search?content_id=203723383&content_type=Article&match_order=1&q=redistributor&zhida_source=entity) 和 [cpu interface](https://zhida.zhihu.com/search?content_id=203723383&content_type=Article&match_order=1&q=cpu+interface&zhida_source=entity) 三大组件相关资源的初始化，所有SPI、PPI和SGI中断属性的默认参数设置，以及需要在bl31中注册的中断属性设置等功能。Bl31的中断处理实现了对路由到EL3的中断相关异常处理流程。异常等级切换时bl31负责设置cpu系统寄存器以配合GICv3实现将不同group的中断路由到正确的异常等级。

## ２　GICv3驱动加载流程

　　GICv3驱动加载流程由bl31启动流程调用，主要包含两部分， [GIC驱动初始化](https://zhida.zhihu.com/search?content_id=203723383&content_type=Article&match_order=1&q=GIC%E9%A9%B1%E5%8A%A8%E5%88%9D%E5%A7%8B%E5%8C%96&zhida_source=entity) 和 [GIC初始化](https://zhida.zhihu.com/search?content_id=203723383&content_type=Article&match_order=1&q=GIC%E5%88%9D%E5%A7%8B%E5%8C%96&zhida_source=entity) 。与上节相同，在代码分析中涉及到平台相关的代码时，统一都以arm common plat为例，如下面的arm\_bl31\_setup.c和arm\_gicv3.c。其中GIC驱动初始化流程如下：

![](https://pic3.zhimg.com/v2-568e2d7ff2ba6b99c1dba5021225fc6c_1440w.jpg)

其主要功能为解析GIC版本、支持的特性，以及初始化redistributor的寄存器基地址。以下为其详细流程：  
（1）输入参数校验  
（2）从distributor的pidr2寄存器读取GIC版本信息，若其为GICv4，则从typer寄存器中读取其是否支持直接注入LPI能力  
（3）读取distributor的控制寄存器，并解析相关字段判断其是否兼容GICv2 版本  
（4）初始化并填充CPU的redistributor寄存器基地址

　　GIC初始化包含了distributor、redistributor以及cpu interface的初始化。包括初始化系统中所有中断的默认配置，在GICv3中设置BL31中已注册中断的中断属性等。其中distributor和其所管理的SPI中断配置流程如下：

![](https://pica.zhimg.com/v2-ce08c9f070ed73c7e865cc0ef0ba161a_1440w.jpg)

（1）gicd\_clr\_ctlr：清除所有的中断group的使能位  
　　gicd\_set\_ctlr：设置secure和non secure空间的ARE位，以使能中断的affinity路由功能

（2）gicv3\_spis\_config\_defaults：将所有的spi中断属性配置为默认值。它包括：  
　　gicv3\_get\_spi\_limit：获取系统支持的最大spi中断数量  
　　gicd\_write\_igroupr：将中断初始化为non secure group 1类型  
　　gicd\_write\_ipriorityr：将中断优先级初始化为默认值  
　　gicd\_write\_icfgr：将中断触发方式初始化为电平触发

（3）gicv3\_secure\_spis\_config\_props：设置bl31中已配置中断的实际属性。其中已配置中断从gicv3\_driver\_data->interrupt\_props中获取，它是由每个plat定义并在初始化时通过arm\_bl31\_platform\_setup以结构体指针方式传给gic驱动的。因此，平台需要将bl31中的所有中断都写入interrupt\_props结构中。以下为其属性设置流程：  
　　gicd\_clr\_igroupr：将该中断设置为secure中断  
　　gicd\_set\_igrpmodr/gicd\_clr\_igrpmodr：将该中断设置为group 0或secure group 1  
　　gicd\_set\_icfgr：设置该中断实际的触发方式  
　　gicd\_set\_ipriorityr：设置该中断的优先级  
　　gicd\_write\_irouter：将该中断设置为路由到primary cpu  
　　gicd\_set\_isenabler：使能该中断

（4）gicd\_set\_ctlr：使能该中断对应的group  
　　Redistributor主要用于初始化sgi和ppi中断的配置。其初始化流程与distributor类似，也是先将所有中断配置初始化为默认值，然后读取平台已设置的bl31中的sgi和ppi中断信息，并将其配置到gicv3中。其主要流程如下，具体流程细节不再赘述：

![](https://picx.zhimg.com/v2-b8e9daa725759c2e8f157bb7dfbce0b7_1440w.jpg)

CPU interface的初始化流程如下：

![](https://pic2.zhimg.com/v2-6f7486233d1bab13ca60be48b4317d97_1440w.jpg)

（1）gicv3\_rdistif\_mark\_core\_awake：设置redistributor的电源管理接口，将其设置为wake状态。其包括以下流程：  
　　gicr\_read\_waker：读取并校验gicr\_waker的children asleep位  
　　gicr\_write\_waker：清除gicr\_waker的processorsleep位，以将接口设置为唤醒状态。  
　　gicr\_read\_waker：轮询读取gicr\_waker的children asleep位，以确保设置结果已生效。

（2）write\_icc\_sre\_el3：关闭irq、fiq bypass特性，以及寄存器映射和访问权限的设置  
read\_scr\_el3和write\_scr\_el3：通过SCR寄存器的secure控制bit，将当前系统状态切换为non secure状态，以设置下面的non secure寄存器  
　　write\_icc\_sre\_el2和write\_icc\_sre\_el1：设置non secure状态下el2和el1的sre寄存器，其寄存器定义与icc\_sre\_el3相同  
　　write\_scr\_el3：将当前系统状态切换回secure状态  
　　write\_icc\_sre\_el1：设置secure状态下el1的sre寄存器  
　　write\_icc\_pmr\_el1：初始化优先级mask值，该值用于mask掉一些低优先级的中断，只有当优先级高于该设定值的中断会被发送给PE。因此此处将其设置为最低中断优先级，即所有的中断都不会被mask  
　　write\_icc\_igrpen0\_el1：使能group 0中断  
　　write\_icc\_igrpen1\_el3：使能secure group 1中断

　　至此，bl31中的GIC初始化和中断配置已完成，此后若已配置完成的group 0和secure group 1中断发生后，GICv3将会处理并向合适的CPU发送中断信号。

## ３　Bl31中断处理流程

　　中断处理需要软件和硬件配合完成，GICv3根据中断分组情况以及系统当前运行的异常等级确定中断是以IRQ还是FIQ触发。CPU通过设置SCR\_EL3.IRQ和SCR\_EL3.FIQ确定IRQ和FIQ中断分别是被路由到当前异常等级还是被路由到EL3。若中断被路由到EL3，根据异常发生时系统所处的异常等级，使用的栈指针是SP\_EL0还是SP\_ELx（x> 0），以及使用的aarch32还是aarch64架构，在每个异常等级下都包含了四张异常等级表。以上具体的中断的路由规则可参考博文：armv8路由机制  
[blog.csdn.net/lgjjeff/a](https://link.zhihu.com/?target=https%3A//blog.csdn.net/lgjjeff/article/details/110729661%3Fspm%3D1001.2014.3001.5501)

　　bl31的异常向量表定义在runtime\_exceptions.S中，其与下图的定义一致。但在ATF中只实现了后面两种情形下的中断处理函数，即若当前系统运行在EL3下，则不允许异常发生。为简化讨论，我们只关注aarch64的情形，则实际上bl31只实现了下图中的第三种异常发生时中断的处理。

![](https://pica.zhimg.com/v2-d8741a772dc3c13ea80534730777225c_1440w.jpg)

　　这是因为除了系统启动时以外，其它情况下系统运行在bl31则表示其本身是由低异常等级以smc指令进入的，此时系统本身就运行在异常上下文。而系统返回所需要的elr\_el3和spsr\_el3都被保存在了sp\_el3栈中。在bl31中sp\_el3只用于保存寄存器等系统状态信息，且所有的参数的存储位置都是预定义好的。此时，若发生了irq或fiq中断则中断处理函数也会将它的elr\_el3和spsr\_el3保存到sp\_el3中，从而导致smc调用的返回信息被覆盖掉，从而使其无法返回。因此bl31中的异常处理函数是非重入的，bl31运行时当前PE处于关中断状态。当然，对于smp系统，由于每个PE的sp\_el3是独立的，因此其它PE还是可以响应中断的。

　　当系统运行在低异常等级时产生group 0中断，则可以通过以上第三张异常向量表跳转到bl31的aarch64异常处理函数，下面以FIQ为例说明其中断处理流程。

　　FIQ中断触发时，PE将异常发生时的PSTATE保存到SPSR\_EL3，将返回地址保存到ELR\_EL3（以上是由硬件完成的），然后跳转到异常向量表入口处执行中断处理流程。fiq\_aarch64函数主要由handle\_interrupt\_exception宏实现，该宏的定义如下：

```
.macro    handle_interrupt_exception label
    bl    save_gp_pmcr_pauth_regs                                         （1）

#if ENABLE_PAUTH
    /* Load and program APIAKey firmware key */
    bl    pauth_load_bl31_apiakey
#endif

    mrs    x0, spsr_el3
    mrs    x1, elr_el3
    stp    x0, x1, [sp, #CTX_EL3STATE_OFFSET + CTX_SPSR_EL3]                （2）

    /* Switch to the runtime stack i.e. SP_EL0 */
    ldr    x2, [sp, #CTX_EL3STATE_OFFSET + CTX_RUNTIME_SP]      　　　　　  （3）
    mov    x20, sp                                                  　　　  （4）
    msr    spsel, #MODE_SP_EL0                                     　　　　 （5）
    mov    sp, x2                                                    　　　 （6）

    bl    plat_ic_get_pending_interrupt_type                            　 （7）
    cmp    x0, #INTR_TYPE_INVAL
    b.eq    interrupt_exit_\label                                        　　（8）

    bl    get_interrupt_type_handler                                   　　（9）
    cbz    x0, interrupt_exit_\label                                     　 （10）
    mov    x21, x0                                                  　　　　（11）

    mov    x0, #INTR_ID_UNAVAILABLE

    /* Set the current security state in the 'flags' parameter */
    mrs    x2, scr_el3
    ubfx    x1, x2, #0, #1                                              　　（12）

    /* Restore the reference to the 'handle' i.e. SP_EL3 */
    mov    x2, x20                                                   　　　（13）

    /* x3 will point to a cookie (not used now) */
    mov    x3, xzr                                                 　　　　（14）

    /* Call the interrupt type handler */
    blr    x21                                                    　　　　　（15）

interrupt_exit_\label:                                              
    /* Return from exception, possibly in a different security state */
    b    el3_exit

    .endm
```

　　该函数主要实现了异常切换时的上下文保存，运行时栈的切换以及中断处理函数查询、参数设置和跳转功能。其详细流程如下：  
（1）将通用寄存器（x0 – x29以及sp\_el0），pmcr以及pauth寄存器保存到sp\_el3指定的el3栈中

（2）将spsr\_el3和elr\_el3保存到sp\_el3指定的el3栈中

（3）从el3栈中读取sp\_el0栈指针

（4）将sp\_el3栈指针暂存到x20寄存器中

（5）将当前的runtime栈切换为sp\_el0

（6）恢复sp\_el0栈的值

（7）读取当前中断的中断号，并根据中断号获取中断类型

（8）若中断类型为非法，则直接退出中断处理

（9）获取该中断类型对应的处理函数

（10）若获取处理函数失败，则直接退出中断处理

（11）将中断类型处理函数指针暂存到x21寄存器中

（12）设置中断处理函数的输入参数0和参数1

（13）将sp\_el3指针设置中断处理函数的输入参数2

（14）设置中断处理函数的输入参数3，该参数始终当前为0

（15）跳转到中断处理函数并执行实际的中断处理

　　在bl31中实际的中断处理函数有两类，group 0中断和secure group 1中断。group 0中断由 [exception handler framework](https://zhida.zhihu.com/search?content_id=203723383&content_type=Article&match_order=1&q=exception+handler+framework&zhida_source=entity) （ [ehf](https://zhida.zhihu.com/search?content_id=203723383&content_type=Article&match_order=1&q=ehf&zhida_source=entity) ）管理，该框架实现了对bl31中group 0中断的注册和管理，当前sdei框架使用了这种中断类型。而secure EL1中断一般是bl31为bl32接收并转发给bl32的，如optee在bl31中注册了一个secure el1中断处理函数 [opteed\_sel1\_interrupt\_handler](https://zhida.zhihu.com/search?content_id=203723383&content_type=Article&match_order=1&q=opteed_sel1_interrupt_handler&zhida_source=entity) ，该函数比较简单，只是执行了异常等级上下文切换，跳转到bl32的fiq异常处理入口，将中断处理转交给bl32。

　　ehf流程主要包括以下三部分：  
（1）向系统注册group 0中断处理函数，它是group 0中断处理的总入口函数。当中断发生时，该中断处理函数会被上面的bl31异常入口函数查询并调用。

（2）向系统提供一个与不同优先级绑定的特定中断处理函数注册接口。不同的驱动可以把自己的中断处理函数注册到ehf框架中。

（3）ehf中断处理函数执行中断应答，以及查询并处理特定优先级中断处理函数功能。其基本处理流程如下图：

![](https://pic1.zhimg.com/v2-d421b5b534c4e70882ef14e3e9f92664_1440w.jpg)

## ４　Bl31中断路由模型设置流程

　　ARMv8 security模型的设计原则是secure相关的资源必须由secure空间处理，而non secure相关的资源可以由secure空间或non secure空间处理。显然，group 0中断和secure group 1中断都是secure资源，不应该被路由到non secure空间中。

　　为了实现该目的GICv3和ARMv8架构共同设计了一套中断路由机制。即GICv3将中断分成了三个不同的group，group 0、non secure group 1和secure group 1。在aarch64架构且支持两种secure状态的系统中，它根据下图规则确定中断是以FIQ还是IRQ方式触发：

![](https://pic4.zhimg.com/v2-dd8cbde89eb5bb8f90d61f1d80097cb9_1440w.jpg)

　　而ARMv8也可以通过security控制寄存器SCR\_EL3中irq和fiq位的设置，确定中断是被路由到当前异常等级还是EL3，其中SCR寄存器的定义如下：

![](https://pic3.zhimg.com/v2-000839a4f0306bea4ff8e5b1c9dcb5d6_1440w.jpg)

IRQ和FIQ字段的规则如下：

![](https://pic3.zhimg.com/v2-91555cd9778e7f1552881897802cad36_1440w.jpg)

因此，在不考虑EL2的情况下，我们的需求如下：  
（1）PE当前运行于EL3下，IRQ和FIQ都被mask掉，此时中断不会触发到当前PE。  
（２）group 0中断，总是以FIQ触发，且不管当前运行在哪个异常等级都需要被路由到EL3下处理  
（３）secure EL1中断，在secure EL1下以IRQ触发，且被secure EL1处理。在non secure EL1下以FIQ触发，且需要被路由到EL3，由EL3转发给secure EL1处理  
（４）non secure EL1中断，在non secure EL1下以IRQ触发，且被路由到non secure EL1处理。在secure EL1中，以FIQ触发，且被路由到secure EL3，并转发给non secure EL1处理。

综上所述，在不同异常等级下的SCR\_EL3.IRQ和SCR\_EL3.FIQ需要设置为如下值：

| 异常等级 | 中断group | 触发类型 | SCR\_EL3.IRQ | SCR\_EL3.FIQ |
| --- | --- | --- | --- | --- |
| Non secure EL1 | Group 0 | FIQ | \- | 1 |
| Secure group 1 | FIQ | \- | 1 |
| Non secure group 1 | IRQ | 0 | \- |
| Secure EL1 | Group 0 | FIQ | \- | 1 |
| Secure group 1 | IRQ | 0 | \- |
| Non secure group 1 | FIQ | \- | 1 |
| EL3 | Group 0 | No | \- | \- |
| Secure group 1 | No | \- | \- |
| Non secure group 1 | No | \- | \- |

在bl31中该流程是通过set\_routing\_model函数完成的，该函数的主要流程如下：

![](https://pic1.zhimg.com/v2-1c36112154f66d77f943a3ec7da60396_1440w.jpg)

　　其主要工作就是按照上述描述的需求，计算不同类型中断所需设置的SCR\_EL3.IRQ和SCR\_EL3.FIQ的值，并分别暂存到secure和non secure空间上下文中。当执行实际的上下文切换操作时，切换函数读取对应secure状态的上下文信息，并设置到实际的寄存器中，以实现中断的正确路由

编辑于 2022-07-21 15:13[勒索病毒来势汹汹，如何以一套架构方案高效应对？](https://zhuanlan.zhihu.com/p/670505525)

[

勒索病毒攻击不再是危言耸听。前段时间，全球著名的网络犯罪组织 Lockbit 表示，他们成功利用勒索病毒入侵了中国工商银行美...

](https://zhuanlan.zhihu.com/p/670505525)