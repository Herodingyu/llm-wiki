---
title: "SMP多核启动（二）：PSCI"
source: "https://zhuanlan.zhihu.com/p/670208932"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "前言前面我们知道了SMP多核启动有两种方式，上一篇讲了spin-table。 但是因为这个玩意只能启动从核，功能太单一了。现在社区几乎很少使用spin-table这种方式， 取而代之的是psci，他不仅可以启动从处理器，还可以…"
tags:
  - "clippings"
---
[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770)

11 人赞同了该文章

## 前言

前面我们知道了 [SMP多核启动](https://zhida.zhihu.com/search?content_id=237065670&content_type=Article&match_order=1&q=SMP%E5%A4%9A%E6%A0%B8%E5%90%AF%E5%8A%A8&zhida_source=entity) 有两种方式，上一篇讲了spin-table。 **但是因为这个玩意只能启动从核，功能太单一了。**

现在社区几乎很少使用spin-table这种方式， **取而代之的是 [psci](https://zhida.zhihu.com/search?content_id=237065670&content_type=Article&match_order=1&q=psci&zhida_source=entity) ，他不仅可以启动从处理器，还可以关闭，挂起等其他核操作** ，现在基本上arm64平台上使用多核启动方式都是psci。

## 1、psci感性认识

psci是arm提供的一套电源管理接口，当前一共包含0.1、0.2和1.0三个版本。它可被用于以下场景： （1）cpu的idle管理

（2）cpu hotplug以及secondary cpu启动

（3）系统shutdown和reset

首先，我们先来看下设备树ｃｐｕ节点对ｐｓｃｉ的支持：

```
arch/arm64/boot/dts/xxx.dtsi:
  cpu0: cpu@0 {
                        device_type = "cpu";
                        compatible = "arm,ａrmv8";
                        reg = <0x0>;
                        enable-method = "psci";
          
                };

  psci {
                compatible = "arm,psci";
                method = "smc";
               cpu_suspend = <0xC4000001>;
                cpu_off = <0x84000002>;
                cpu_on = <0xC4000003>;
        };
```

psci节点的详细说明可以参考内核文档：Documentation/devicetree/bindings/arm/psci.txt

从这个我们可以获得什么信息呢？

可以看到现在enable-method 属性已经是psci，说明使用的多核启动方式是psci,

下面还有psci节点，用于psci驱动使用，method用于说明调用psci功能使用什么指令，可选有两个smc和hvc。

其实smc, hvc和svc都是从低运行级别向高运行级别请求服务的指令，我们最常用的就是svc指令了，这是实现系统调用的指令。

高级别的运行级别会根据传递过来的参数来决定提供什么样的服务。

smc是用于陷入el3（安全）,

hvc用于陷入el2（虚拟化, 虚拟化场景中一般通过hvc指令陷入el2来请求唤醒vcpu）, svc用于陷入el1（系统）。

**这里只讲解smc陷入el3启动多核的情况。**

## 2 psci 基础概念知识

下面我们将按照电源管理拓扑结构（ [power domain](https://zhida.zhihu.com/search?content_id=237065670&content_type=Article&match_order=1&q=power+domain&zhida_source=entity) ）、电源状态（ [power state](https://zhida.zhihu.com/search?content_id=237065670&content_type=Article&match_order=1&q=power+state&zhida_source=entity) ）以及armv8安全扩展几个方面介绍psci的一些基础知识

## 1　power domain

我们前面已经介绍过cpu的拓扑结构，如aarch64架构下每块soc可能会包含多个cluster，而每个cluster又包含多个core，它们共同组成了层次化的拓扑结构。如以下为一块包含2个cluster，每个cluster包含四个core的soc：

![](https://pic3.zhimg.com/v2-02d5aab80e518e6e9c8c9c04fc8b10c8_1440w.jpg)

**由于其中每个core以及每个cluster的电源都可以独立地执行开关操作** ，因此若core0 – core3的电源都关闭了，则cluster 0的电源也可以被关闭以降低功耗。

若core0 – core3中的任一个core需要上电，则显然cluster 0需要先上电。为了更好地进行层次化电源管理，psci在电源管理流程中将以上这些组件都抽象为power domain。如以下为上例的power domain层次结构：

![](https://pic2.zhimg.com/v2-b93f062ffabe09ba1fd670d0e93f39d3_1440w.jpg)

其中system level用于管理整个系统的电源，cluster level用于管理某个特定cluster的电源，而core level用于管理一个单独core的电源。

## 2　power state

由于aarch64架构有多种不用的电源状态，不同电源状态的功耗和唤醒延迟不同。

如standby状态会关闭power domain的clock，但并不关闭电源。 **因此它虽然消除了门电路翻转引起的动态功耗，但依然存在漏电流等引起的静态功耗。故其功耗相对较大** ，但相应地唤醒延迟就比较低。

而对于power down状态，会断开对应power domain的电源，因此其不仅消除了动态功耗，还消除了静态功耗，相应地其唤醒延迟就比较高了。

psci一共为power domain定义了四种power state：

- （1）run：电源和时钟都打开，该domain正常工作
- （2）standby：关闭时钟，但电源处于打开状态。其寄存器状态得到保存，打开时钟后就可继续运行。功耗相对较大，但唤醒延迟较低。arm执行wfi或wfe指令会进入该状态。
- （3）retention：它将core的状态，包括调试设置都保存在低功耗结构中，并使其部分关闭。其状态在从低功耗变为运行时能自动恢复。从操作系统角度看，除了进入方法、延迟等有区别外，其它都与standby相同。它的功耗和唤醒延迟都介于standby和power down之间。
- （4）power down：关闭时钟和电源。power domain掉电后，所有状态都丢失，上电以后软件必须重新恢复其状态。它的功耗最低，但唤醒延迟也相应地最高。

---

（这里我很好奇怎么和linux的s3、s4对应的。当时测试s3的时候，对应的是suspend。这里的对于cpu的有off、on、suspend三种，我觉得这里应该就是对于的standby，因为有wfi或wfe这些指令。那s4就是CPU off了？可以看一下这个有点认识，突然想到psci里面的状态是对于的cpu为对象，但是linux的电源管理应该是对整个设备。）

可以看一下这个文章： **[s1s2s3S4S5的含义待机、休眠、睡眠的区别](https://link.zhihu.com/?target=https%3A//wenku.baidu.com/view/fe626a20b868a98271fe910ef12d2af90242a898.html%3F_wkts_%3D1668612718743%26bdQuery%3DS3%25E5%2592%258CS4%25E6%2598%25AFpower%2Bdown%25E8%25BF%2598%25E6%2598%25AFretention)**

---

显然，power state的睡眠程度从run到power down逐步加深。而高层级power domain的power state不应低于低层级power domain。

如以上例子中core 0 – core 2都为power down状态，而core 3为standby状态，则cluster 0不能为retention或power down状态。同样若cluster 0为standby状态，而cluster 1为run状态，则整个系统必须为run状态。

为了达到上述约束，不同power domain之间的power state具有以下关系：

![](https://picx.zhimg.com/v2-3fbfb2c265ec77f018d874616a9a5dfd_1440w.jpg)

这里解释了psci那个源码文档里电源树的概念。

psci实现了父leve与子level之间的电源关系协调，如cluster 0中最后一个core被设置为power down状态后，psci就会将该cluster也设置为power donw状态。若其某一个core被设置为run状态，则psci会先将其对应cluster的状态设置为run，然后再设置对应core的电源状态，这也是psci名字的由来（power state coordinate interface）

## 3　armv8的安全扩展

为了增强arm架构的安全性，aarch64一共实现了secure和non-secure两种安全状态。通过一系列硬件扩展，在cpu执行状态、总线、内存、外设、中断、tlb、cache等方面都实现了两种状态之间的隔离。

在这种机制下，secure空间的程序可以访问所有secure和non-secure的资源，而non-secure空间的程序只能访问non-secure资源，却不能访问secure资源。从而可以将一些安全关键的资源放到secure空间，以增强其安全性。

为此aarch64实现了4个异常等级，其中EL3工作在secure空间，而EL0 – EL2既可以工作于secure空间，又可以工作于non-secure空间。不同异常等级及不同secure状态的模式下可运行不同类型软件。

如secure EL1和El0用于运行trust os内核及其用户态程序，non-secure EL1和El0用于运行普通操作系统内核（如linux）及其用户态程序，EL2用于运行虚拟机的hypervisor。而EL3运行 [secure monitor](https://zhida.zhihu.com/search?content_id=237065670&content_type=Article&match_order=1&q=secure+monitor&zhida_source=entity) 程序（通常为 [bl31](https://zhida.zhihu.com/search?content_id=237065670&content_type=Article&match_order=1&q=bl31&zhida_source=entity) ），其功能为执行secure和non secure状态切换、消息转发以及提供类似psci等secure空间服务。以下为其示意图：

![](https://pica.zhimg.com/v2-f2922dd6a9d5e9682b6ccbbc3f1cf07c_1440w.jpg)

psci是工作于non secure EL1（linux内核）和EL3（bl31）之间的一组电源管理接口，其目的是 **让linux实现具体的电源管理策略** ，而 **由bl31管理底层硬件相关的操作** 。 **从而将cpu电源控制这种影响系统安全的控制权限放到安全等级更高的层级中，从而提升系统的整体安全性。**

那么psci如何从EL1调用EL3的服务呢？其实它和系统调用是类似的，只是系统调用是用户态程序陷入操作系统内核，而psci是从操作系统内核陷入secure monitor。armv8提供了一条smc异常指令，内核只需要提供合适的参数后，触发该指令即可通过异常的方式进入secure monitor。（SMC调用，这个在ATF专栏有介绍）

## 3、psci软件架构

由于psci是由linux内核调用bl31中的安全服务，实现cpu电源管理功能的。因此其软件架构包含三个部分： （1）内核与bl31之间的调用接口规范

（2）内核中的架构

（3）bl31中的架构

## 1　psci接口规范

psci规定了linux内核调用bl31中电源管理相关服务的接口规范，它包含实现以下功能所需的接口： （1）cpu idle管理

（2）向系统动态添加或从系统动态移除cpu，通常称为hotplug

（3）secondary cpu启动

（4）系统的shutdown和reset

psci接口规定了命令对应的function\_id、接口的输入参数以及返回值。 其中输入参数可通过x0 – x7寄存器传递，而返回值通过x0 – x4寄存器传递。

如secondary cpu启动或cpu hotplug时可调用cpu\_on接口，为一个cpu执行上电操作。该接口的格式如下： （1）function\_id：0xc400 0003

（2）输入参数：使用mpidr值表示的target cpu id

cpu启动入口的物理地址

context id，该值用于表示本次调用上下文相关的信息

（3）返回值：可以为success、invalid\_parameter、invalid\_address、already\_on、on\_pending或internal\_failure

有了以下这些接口的详细定义，内核和bl31就只需按照该接口的规定，独立开发psci相关功能。从而避免了它们之间的耦合，简化了开发复杂度。

## 2　内核中的psci架构

内核psci软件架构包含psci驱动和每个cpu的 [cpu\_ops](https://zhida.zhihu.com/search?content_id=237065670&content_type=Article&match_order=1&q=cpu_ops&zhida_source=entity) 回调函数实现两部分。

其中psci驱动实现了驱动初始化和psci相关接口实现功能，而cpu\_ops回调函数最终也会调用psci驱动的接口。

### 2.1　psci驱动

首先我们看一下devicetree中的配置：

```
psci {
        compatible = "arm,psci-0.2";  （1）
        method = "smc";               （2）
     }
```

（1）用于指定psci版本

（2）根据该psci由bl31处理还是hypervisor处理，可以指定其对应的陷入方式。若由bl31处理为smc，若由hypervisor处理则为hvc

驱动流程主要是与bl31通信，以确认其是否支持给定的psci版本，以及相关psci操作函数的实现，其流程如下：

![](https://pic4.zhimg.com/v2-6141ff39acf73a1743b4377072259847_1440w.jpg)

其主要工作即为psci设置相关的回调函数，该函数定义如下：

```
static void __init psci_0_2_set_functions(void)
{
    …
    psci_ops = (struct psci_operations){
        .get_version = psci_0_2_get_version,
        .cpu_suspend = psci_0_2_cpu_suspend,
        .cpu_off = psci_0_2_cpu_off,
        .cpu_on = psci_0_2_cpu_on,
        .migrate = psci_0_2_migrate,
        .affinity_info = psci_affinity_info,
        .migrate_info_type = psci_migrate_info_type,
    };                                                   （1）

    register_restart_handler(&psci_sys_reset_nb);        （2）
    pm_power_off = psci_sys_poweroff;                    （3）
}
```

（1）为psci\_ops设置相应的回调函数

（2）为psci模块设置系统重启时的通知函数

（3）将系统的power\_off函数指向相应的psci接口

### 2.2　cpu\_ops接口

驱动初始化完成后，cpu的cpu\_ops就可以调用这些回调实现psci功能的调用。如下所示，当devicetree中cpu的enable-method设置为psci时，该cpu的cpu\_ops将指向cpu\_psci\_ops。

```
cpu0: cpu@0 {
    ...
    enable-method = "psci";
    …
}
```

其中cpu\_psci\_ops的定义如下：

```
const struct cpu_operations cpu_psci_ops = {
    .name        = "psci",
    .cpu_init    = cpu_psci_cpu_init,
    .cpu_prepare    = cpu_psci_cpu_prepare,
    .cpu_boot    = cpu_psci_cpu_boot,
#ifdef CONFIG_HOTPLUG_CPU
    .cpu_can_disable = cpu_psci_cpu_can_disable,
    .cpu_disable    = cpu_psci_cpu_disable,
    .cpu_die    = cpu_psci_cpu_die,
    .cpu_kill    = cpu_psci_cpu_kill,
#endif
}
```

如启动cpu的接口为cpu\_psci\_cpu\_boot，它会通过以下流程最终调用psci驱动中的psci\_ops函数：

```
static int cpu_psci_cpu_boot(unsigned int cpu)
{
    phys_addr_t pa_secondary_entry = __pa_symbol(function_nocfi(secondary_entry));
    int err = psci_ops.cpu_on(cpu_logical_map(cpu), pa_secondary_entry);
    if (err)
        pr_err("failed to boot CPU%d (%d)\n", cpu, err);

    return err;
}
```

## 3　bl31中的psci架构

bl31为内核提供了一系列运行时服务，psci作为其标准运行时服务的一部分，通过宏DECLARE\_RT\_SVC注册到系统中。其相应的定义如下：

```
DECLARE_RT_SVC(
        std_svc,

        OEN_STD_START,
        OEN_STD_END,
        SMC_TYPE_FAST,
        std_svc_setup,
        std_svc_smc_handler
)
```

其中std\_svc\_setup会在bl31启动流程中被调用，以用于初始化该服务相关的配置。而std\_svc\_smc\_handler为其smc异常处理函数，当内核通过psci接口调用相关服务时，最终将由该函数执行实际的处理流程。

![](https://pica.zhimg.com/v2-e40eeeaddf7dea230d5c39dd23c33fe8_1440w.jpg)

上图为psci初始化相关的流程，它主要包含内容： （1）前面我们已经介绍过power domain相关的背景，即psci需要协调不同层级的power domain状态，因此其必须要了解系统的power domain配置情况。以上流程中红色虚线框的部分主要就是用于初始化系统的power domain拓扑及其状态

（2）由于psci在执行电源相关接口时，最终需要操作实际的硬件。而它们是与架构相关的，因此其操作函数最终需要注册到平台相关的回调中。plat\_setup\_psci\_ops即用于注册特定平台的psci\_ops回调，其格式如下：

```
typedef struct plat_psci_ops {
    void (*cpu_standby)(plat_local_state_t cpu_state);
    int (*pwr_domain_on)(u_register_t mpidr);
    void (*pwr_domain_off)(const psci_power_state_t *target_state);
    void (*pwr_domain_suspend_pwrdown_early)(
                const psci_power_state_t *target_state);
    void (*pwr_domain_suspend)(const psci_power_state_t *target_state);
    void (*pwr_domain_on_finish)(const psci_power_state_t *target_state);
    void (*pwr_domain_on_finish_late)(
                const psci_power_state_t *target_state);
    void (*pwr_domain_suspend_finish)(
                const psci_power_state_t *target_state);
    void __dead2 (*pwr_domain_pwr_down_wfi)(
                const psci_power_state_t *target_state);
    void __dead2 (*system_off)(void);
    void __dead2 (*system_reset)(void);
    int (*validate_power_state)(unsigned int power_state,
                    psci_power_state_t *req_state);
    int (*validate_ns_entrypoint)(uintptr_t ns_entrypoint);
    void (*get_sys_suspend_power_state)(
                    psci_power_state_t *req_state);
    int (*get_pwr_lvl_state_idx)(plat_local_state_t pwr_domain_state,
                    int pwrlvl);
    int (*translate_power_state_by_mpidr)(u_register_t mpidr,
                    unsigned int power_state,
                    psci_power_state_t *output_state);
    int (*get_node_hw_state)(u_register_t mpidr, unsigned int power_level);
    int (*mem_protect_chk)(uintptr_t base, u_register_t length);
    int (*read_mem_protect)(int *val);
    int (*write_mem_protect)(int val);
    int (*system_reset2)(int is_vendor,
                int reset_type, u_register_t cookie);
}
```

最后我们再看一下psci操作相应的异常处理流程：

![](https://pic2.zhimg.com/v2-a00a760f9d3c6819e4066bd7b4bcf90d_1440w.jpg)

即其会根据function id的值，分别执行相应的电源管理服务，如启动cpu时会调用psci\_cpu\_on函数，重启系统时会调用psci\_system\_rest函数等。

## 3、secondary cpu启动

由于psci方式启动secondary cpu的流程，除了其所执行的cpu\_ops不同之外，其它流程与spin-table方式是相同的，因此我们这里只给出执行流程图，详细分析可以参考上篇博文。其中以下流程执行secondary cpu启动相关的一些初始化工作：

![](https://pic2.zhimg.com/v2-f511571cc1972d792576cf20c461eeb9_1440w.jpg)

在初始化完成且hotplug线程创建完成后，就可通过以下流程唤醒cpu hotplug线程：

![](https://pic3.zhimg.com/v2-ba0c42e59b20e5b5ff523d8f9a70138e_1440w.jpg)

此后hotplug线程将调用psci回调函数，并最终触发smc异常进入bl31：

![](https://picx.zhimg.com/v2-118f9cda62237d5baf4d6ee8430f2e07_1440w.jpg)

bl31接收到该异常后执行std\_svc\_smc\_handler处理函数，并最终调用平台相关的电源管理接口，完成cpu的上电工作，以下为其执行流程：

![](https://picx.zhimg.com/v2-bf596cf98707c0a290130f8358137a6f_1440w.jpg)

平台相关回调函数pwr\_domain\_on将为secondary cpu设置入口函数，然后为其上电使该cpu跳转到内核入口secondary\_entry处开始执行。以下为其内核启动流程：

![](https://pica.zhimg.com/v2-8368ec9c609a68720b6b00fdc7d0d8b8_1440w.jpg)

在这里插入图片描述

到这里其实就结束了，不得不说这个前辈的文章是真的写的逻辑清晰，收获颇多。

## 小结

最后结合代码再走一遍

## 1、std\_svc\_setup　（主要关注设置psci操作集）--有服务

```
std_svc_setup  //services/std_svc/std_svc_setup.c
->psci_setup //lib/psci/psci_setup.c
 ->plat_setup_psci_ops   //设置平台的ｐｓｃｉ操作    调用平台的plat_setup_psci_ops函数去设置ｐｓｃｉ操作 ｅｇ:qemu平台
  ->*psci_ops = &plat_qemu_psci_pm_ops;
   208 static const plat_psci_ops_t plat_qemu_psci_pm_ops = {
    209         .cpu_standby = qemu_cpu_standby,
    210         .pwr_domain_on = qemu_pwr_domain_on,
    211         .pwr_domain_off = qemu_pwr_domain_off, 
    212         .pwr_domain_suspend = qemu_pwr_domain_suspend,
    213         .pwr_domain_on_finish = qemu_pwr_domain_on_finish,
    214         .pwr_domain_suspend_finish = qemu_pwr_domain_suspend_finish,
    215         .system_off = qemu_system_off,
    216         .system_reset = qemu_system_reset, 
    217         .validate_power_state = qemu_validate_power_state,
    218         .validate_ns_entrypoint = qemu_validate_ns_entrypoint
    219 };
```

在遍历每一个注册的运行时服务的时候，会导致std\_svc\_setup调用，其中会做psci操作集的设置，操作集中我们可以看到对核电源的管理的接口如：核上电，下电，挂起等，我们主要关注上电.pwr\_domain\_on = qemu\_pwr\_domain\_on,这个接口当我们主处理器boot从处理器的时候会用到。

## 2、运行时服务触发和处理--来请求

smc指令触发进入el3异常向量表：

```
runtime_exceptions  //ｅｌ3的异常向量表
－>sync_exception_aarch64
->handle_sync_exception
->smc_handler64
->   ¦* Populate the parameters for the SMC handler.
          ¦* We already have x0-x4 in place. x5 will point to a cookie (not used
          ¦* now). x6 will point to the context structure (SP_EL3) and x7 will
          ¦* contain flags we need to pass to the handler Hence save x5-x7.
          ¦*
          ¦* Note: x4 only needs to be preserved for AArch32 callers but we do it
          ¦*       for AArch64 callers as well for convenience
       ¦*/
         stp     x4, x5, [sp, #CTX_GPREGS_OFFSET + CTX_GPREG_X4]  //保存x4－ｘ7到栈
         stp     x6, x7, [sp, #CTX_GPREGS_OFFSET + CTX_GPREG_X6]

       /* Save rest of the gpregs and sp_el0*/
         save_x18_to_x29_sp_el0

       mov     x5, xzr  //x5清零
       mov     x6, sp //ｓｐ保存在x6

       /* Get the unique owning entity number */ //获得唯一的入口编号
         ubfx    x16, x0, #FUNCID_OEN_SHIFT, #FUNCID_OEN_WIDTH
         ubfx    x15, x0, #FUNCID_TYPE_SHIFT, #FUNCID_TYPE_WIDTH
         orr     x16, x16, x15, lsl #FUNCID_OEN_WIDTH

         adr     x11, (__RT_SVC_DESCS_START__ + RT_SVC_DESC_HANDLE)

       /* Load descriptor index from array of indices */
         adr     x14, rt_svc_descs_indices  //获得服务描述 标识数组
         ldrb    w15, [x14, x16] //根据唯一的入口编号 找到处理函数的 地址
       /*
       ¦* Restore the saved C runtime stack value which will become the new
       ¦* SP_EL0 i.e. EL3 runtime stack. It was saved in the 'cpu_context'
       ¦* structure prior to the last ERET from EL3.
       ¦*/
         ldr     x12, [x6, #CTX_EL3STATE_OFFSET + CTX_RUNTIME_SP]

       /*
       ¦* Any index greater than 127 is invalid. Check bit 7 for
       ¦* a valid index
       ¦*/
         tbnz    w15, 7, smc_unknown

       /* Switch to SP_EL0 */
         msr     spsel, #0  
  
          /*
          ¦* Get the descriptor using the index
          ¦* x11 = (base + off), x15 = index
          ¦*
          ¦* handler = (base + off) + (index << log2(size))
       ¦*/
       lsl     w10, w15, #RT_SVC_SIZE_LOG2
         ldr     x15, [x11, w10, uxtw]

       /*
       ¦* Save the SPSR_EL3, ELR_EL3, & SCR_EL3 in case there is a world
       ¦* switch during SMC handling.
       ¦* TODO: Revisit if all system registers can be saved later.
       ¦*/
   mrs     x16, spsr_el3 //spsr_el3保存在x16
    mrs     x17, elr_el3 //elr_el3保存在x17
   mrs     x18, scr_el3  //scr_el3保存在x18
         stp     x16, x17, [x6, #CTX_EL3STATE_OFFSET + CTX_SPSR_EL3]  /  x16, x17/保存在栈
       str     x18, [x6, #CTX_EL3STATE_OFFSET + CTX_SCR_EL3] //x18保存到栈

       /* Copy SCR_EL3.NS bit to the flag to indicate caller's security */
         bfi     x7, x18, #0, #1

       mov     sp, x12 

       /*
       ¦* Call the Secure Monitor Call handler and then drop directly into
       ¦* el3_exit() which will program any remaining architectural state
       ¦* prior to issuing the ERET to the desired lower EL.
       ¦*/
#if DEBUG
         cbz     x15, rt_svc_fw_critical_error
#endif
         blr     x15  //跳转到处理函数

         b       el3_exit  //从ｅｌ3退出  会ｅｒｅｔ 回到ｅｌ1 （后面会讲到）
```

## 3、找到对应handler--请求匹配处理函数

上面其实主要的是找到服务例程，然后跳转执行 下面是跳转的处理函数：

```
std_svc_smc_handler  //services/std_svc/std_svc_setup.c
->ret = psci_smc_handler(smc_fid, x1, x2, x3, x4,
                  ¦   cookie, handle, flags)
                  ...
 480         } else {
481                 /* 64-bit PSCI function */
  482 
  483                 switch (smc_fid) {
  484                 case PSCI_CPU_SUSPEND_AARCH64:
  485                         ret = (u_register_t)
  486                                 psci_cpu_suspend((unsigned int)x1, x2, x3);
  487                         break;
  488 
  489                 case PSCI_CPU_ON_AARCH64:
  490                         ret = (u_register_t)psci_cpu_on(x1, x2, x3);
  491                         break;
  492 
...
}
```

## 4、处理函数干活

处理函数根据funid来决定服务,可以看到PSCI\_CPU\_ON\_AARCH64为0xc4000003，这正是设备树中填写的cpu\_on属性的ｉｄ，会委托psci\_cpu\_on来执行核上电任务。 下面分析是重点：！！！

```
->psci_cpu_on()  //lib/psci/psci_main.c
 ->psci_validate_entry_point()  //验证入口地址有效性并  保存入口点到一个结构ｅｐ中
 ->psci_cpu_on_start(target_cpu, &ep)   //ep入口地址
  ->psci_plat_pm_ops->pwr_domain_on(target_cpu)
   ->qemu_pwr_domain_on  //实现核上电（平台实现）
  /* Store the re-entry information for the non-secure world. */
  ->cm_init_context_by_index()  //重点： 会通过cpu的编号找到 ｃｐｕ上下文（cpu_context_t），存在ｃpu寄存器的值，异常返回的时候写写到对应的寄存器中，然后eret,旧返回到了ｅｌ1！！！
   ->cm_setup_context()  //设置ｃｐｕ上下文
     -> write_ctx_reg(state, CTX_SCR_EL3, scr_el3);  //lib/el3_runtime/aarch64/context_mgmt.c
              write_ctx_reg(state, CTX_ELR_EL3, ep->pc);  //注： 异常返回时执行此地址  于是完成了ｃｐｕ的启动！！！
              write_ctx_reg(state, CTX_SPSR_EL3, ep->spsr);
```

**psci\_cpu\_on主要完成开核的工作** ，然后会设置一些异常返回后寄存器的值（ｅｇ:从el1 -> el3 -> el1），重点关注 ep->pc写到cpu\_context结构的CTX\_ELR\_EL3偏移处（从处理器启动后会从这个地址取指执行）。

实际上， **所有的从处理器启动后都会从bl31\_warm\_entrypoint开始执行** ，在plat\_setup\_psci\_ops中会设置（每个平台都有自己的启动地址寄存器，通过写这个寄存器来获得上电后执行的指令地址）。

大致说一下：主处理器通过smc进入el3请求开核服务，atf中会响应这种请求， **通过平台的开核操作来启动从处理器并且设置从处理的一些寄存器ｅｇ:scr\_el3、spsr\_el3、elr\_el3，然后主处理器，恢复现场，eret再次回到el1**,

而处理器开核之后会从bl31\_warm\_entrypoint开始执行，最后通过el3\_exit返回到el1的elr\_el3设置的地址。

分析到这atf的分析到此为止，atf中主要是响应内核的snc的请求，然后做开核处理，也就是实际的开核动作，但是从处理器最后还是要回到内核中执行，下面分析内核的处理：注意流程如下：

## 5、开核返回-EL1 启动从处理器

```
init/main.c
start_kernel
->boot_cpu_init   //引导ｃｐｕ初始化  设置引导ｃｐｕ的位掩码 online active present possible都为true
->setup_arch   // arch/arm64/kernel/setup.c
->  if (acpi_disabled)  //不支持ａｃｐｉ
                  psci_dt_init();     //drivers/firmware/psci.c（psci主要文件） psci初始化 解析设备树 寻找ｐｓｃｉ匹配的节点
          else
                  psci_acpi_init();   //acpi中允许使用ｐｓｃｉ情况
->rest_init
->kernel_init
->kernel_init_freeable
->smp_prepare_cpus  //准备ｃｐｕ       对于每个可能的ｃｐｕ １. cpu_ops[cpu]->cpu_prepare(cpu)    2.set_cpu_present(cpu, true) ｃｐｕ处于present状态
->do_pre_smp_initcalls   //多核启动之前的调用initcall回调
->smp_init  //smp初始化  kernel/smp.c   会启动其他从处理器
```

我们主要关注两个函数：psci\_dt\_init和smp\_init psci\_dt\_init是解析设备树，设置操作函数， **smp\_init用于启动从处理器。**

```
->psci_dt_init() //drivers/firmware/psci.c：
 ->init_fn()
  ->psci_0_1_init() //设备树中compatible = "arm,psci"为例
   ->get_set_conduit_method() //根据设备树method属性设置 invoke_psci_fn = __invoke_psci_fn_smc;  （method="smc"）
       -> invoke_psci_fn = __invoke_psci_fn_smc
   ->   if (!of_property_read_u32(np, "cpu_on", &id)) {
       651                 psci_function_id[PSCI_FN_CPU_ON] = id;
       652                 psci_ops.cpu_on = psci_cpu_on;  //设置ｐｓｃｉ操作的开核接口
       653         }
    ->psci_cpu_on()
     ->invoke_psci_fn()
      ->__invoke_psci_fn_smc()
        -> arm_smccc_smc(function_id, arg0, arg1, arg2, 0, 0, 0, 0, &res)  //这个时候x0=function_id  x1=arg0, x2=arg1, x3arg2,...
         ->__arm_smccc_smc()
          ->SMCCC   smc //arch/arm64/kernel/smccc-call.S
            ->    20         .macro SMCCC instr
                21         .cfi_startproc
                22         \instr  #0   //即是ｓｍｃ #0  陷入到ｅｌ3
                23         ldr     x4, [sp]
                24         stp     x0, x1, [x4, #ARM_SMCCC_RES_X0_OFFS]
                25         stp     x2, x3, [x4, #ARM_SMCCC_RES_X2_OFFS]
                26         ldr     x4, [sp, #8]
                27         cbz     x4, 1f /* no quirk structure */
                28         ldr     x9, [x4, #ARM_SMCCC_QUIRK_ID_OFFS]
                29         cmp     x9, #ARM_SMCCC_QUIRK_QCOM_A6
                30         b.ne    1f
                31         str     x6, [x4, ARM_SMCCC_QUIRK_STATE_OFFS]
                32 1:      ret
                33         .cfi_endproc
                34         .endm
```

最终通过22行　陷入了el3中。(这是因为安全所以还需要到ATF中启动) **smp\_init函数做从处理器启动：**

```
start_kernel
->arch_call_rest_init
 ->rest_init
  ->kernel_init,
   ->kernel_init_freeable
    ->smp_prepare_cpus  //arch/arm64/kernel/smp.c
     ->smp_init  //kernel/smp.c  (这是从处理器启动的函数)
      ->cpu_up
       ->do_cpu_up
        ->_cpu_up
         ->cpuhp_up_callbacks
          ->cpuhp_invoke_callback
          ->cpuhp_hp_states[CPUHP_BRINGUP_CPU]
           ->bringup_cpu
            ->__cpu_up  //arch/arm64/kernel/smp.c
             ->boot_secondary
              ->cpu_ops[cpu]->cpu_boot(cpu)
               ->cpu_psci_ops.cpu_boot
                ->cpu_psci_cpu_boot   //arch/arm64/kernel/psci.c
                 46 static int cpu_psci_cpu_boot(unsigned int cpu)
                   47 { 
                   48         int err = psci_ops.cpu_on(cpu_logical_map(cpu), __pa_symbol(secondary_entry));
                   49         if (err)
                   50                 pr_err("failed to boot CPU%d (%d)\n", cpu, err);
                   51   
                   52         return err;
                   53 }
```

**启动从处理的时候最终调用到psci的cpu操作集的cpu\_psci\_cpu\_boot函数** ，会调用上面的psci\_cpu\_on，最终调用smc，传递第一个参数为cpu的ｉｄ标识启动哪个cpu，第二个参数为从处理器启动后进入内核执行的地址secondary\_entry（这是个物理地址）。

所以综上，最后smc调用时传递的参数为arm\_smccc\_smc(0xC4000003, cpuid, secondary\_entry, arg2, 0, 0, 0, 0, &res)。 这样陷入el3之后，就可以启动对应的从处理器， **最终从处理器回到内核（el3->el1）,执行secondary\_entry处指令** ，从处理器启动完成。

可以发现psci的方式启动从处理器的方式相当复杂，这里面涉及到了el1到安全的el3的跳转，而且涉及到大量的函数回调，很容易绕晕。

（其实为了安全，所以启动从核开核这个操作必须在EL3，开了以后，就可以会EL1，因为已经在EL3给你了准确安全的启动位置了。）

![](https://pica.zhimg.com/v2-0a513e8191faf10aaa6ee3d0c4ab4bce_1440w.jpg)

## 6、从处理器启动EL1做了什么？

其实这里就和spin-table比较相似了

无论是spin-table还是psci，从处理器启动进入内核之后都会执行secondary\_startup：

```
719 secondary_startup:
720         /*
721         ¦* Common entry point for secondary CPUs.
722         ¦*/
723         bl      __cpu_secondary_check52bitva
724         bl      __cpu_setup                     // initialise processor
725         adrp    x1, swapper_pg_dir   //设置内核主页表
726         bl      __enable_mmu  //使能ｍｍｕ
727         ldr     x8, =__secondary_switched
728         br      x8
729 ENDPROC(secondary_startup)

||
\/

731 __secondary_switched:
--732         adr_l   x5, vectors      //设置从处理器的异常向量表
--733         msr     vbar_el1, x5
--734         isb      //指令同步屏障 保证屏障前面的指令执行完
  735 
--736         adr_l   x0, secondary_data //获得主处理器传递过来的从处理器数据
--737         ldr     x1, [x0, #CPU_BOOT_STACK]       // get secondary_data.stack  获得栈地址
  738         mov     sp, x1  //设置到从处理器的ｓｐ
--739         ldr     x2, [x0, #CPU_BOOT_TASK]  //获得从处理器的ｔｓｋ  ｉｄｌｅ进程的ｔｓｋ结构，
--740         msr     sp_el0, x2 //保存在sp_el0      arm64使用sp_el0保存当前进程的ｔｓｋ结构
  741         mov     x29, #0  //ｆｐ清０
  742         mov     x30, #0  //ｌｒ清０
--743         b       secondary_start_kernel //跳转到ｃ程序  继续执行从处理器初始化
  744 ENDPROC(__secondary_switched)
```

\_\_cpu\_up中设置了secondary\_data结构中的一些成员：

```
arch/arm64/kernel/smp.c：

112 int __cpu_up(unsigned int cpu, struct task_struct *idle)
   113 {
   114         int ret;
   115         long status;
   116 
   117         /*
   118         ¦* We need to tell the secondary core where to find its stack and the
   119         ¦* page tables.
   120         ¦*/
   121         secondary_data.task = idle;  //执行的进程描述符
   122         secondary_data.stack = task_stack_page(idle) + THREAD_SIZE; //栈地址   THREAD_SIZE＝１６ｋ
   123         update_cpu_boot_status(CPU_MMU_OFF);
   124         __flush_dcache_area(&secondary_data, sizeof(secondary_data));
   125 
   126         /*
   127         ¦* Now bring the CPU into our world.
   128         ¦*/
   129         ret = boot_secondary(cpu, idle);
```

跳转到secondary\_start\_kernel这个Ｃ函数继续执行初始化：

```
183 /*
   184  * This is the secondary CPU boot entry.  We're using this CPUs
   185  * idle thread stack, but a set of temporary page tables.
   186  */
   187 asmlinkage notrace void secondary_start_kernel(void)
   188 {
   189         u64 mpidr = read_cpuid_mpidr() & MPIDR_HWID_BITMASK;
   190         struct mm_struct *mm = &init_mm;
   191         unsigned int cpu;
   192 
   193         cpu = task_cpu(current);
   194         set_my_cpu_offset(per_cpu_offset(cpu));
   195 
   196         /*
   197         ¦* All kernel threads share the same mm context; grab a
   198         ¦* reference and switch to it.
   199         ¦*/
   200         mmgrab(mm); //init_mm的引用计数加１ 
   201         current->active_mm = mm; //设置ｉｄｌｅ借用的ｍｍ结构
   202 
   203         /*
   204         ¦* TTBR0 is only used for the identity mapping at this stage. Make it
   205         ¦* point to zero page to avoid speculatively fetching new entries.
   206         ¦*/
   207         cpu_uninstall_idmap();
   208 
   209         preempt_disable(); //禁止内核抢占
   210         trace_hardirqs_off();
   211 
   212         /*
   213         ¦* If the system has established the capabilities, make sure
   214         ¦* this CPU ticks all of those. If it doesn't, the CPU will
   215         ¦* fail to come online.
   216         ¦*/
   217         check_local_cpu_capabilities();
 218 
   219         if (cpu_ops[cpu]->cpu_postboot)
   220                 cpu_ops[cpu]->cpu_postboot();
   221 
   222         /*
   223         ¦* Log the CPU info before it is marked online and might get read.
   224         ¦*/
   225         cpuinfo_store_cpu(); //存储ｃｐｕ信息
   226 
   227         /*
   228         ¦* Enable GIC and timers.
   229         ¦*/
   230         notify_cpu_starting(cpu); //使能ｇｉｃ和ｔｉｍｅｒ
   231 
   232         store_cpu_topology(cpu); //保存ｃｐｕ拓扑
   233         numa_add_cpu(cpu); ///ｎｕｍａ添加ｃｐｕ
   234 
   235         /*
   236         ¦* OK, now it's safe to let the boot CPU continue.  Wait for
   237         ¦* the CPU migration code to notice that the CPU is online
   238         ¦* before we continue.
   239         ¦*/
   240         pr_info("CPU%u: Booted secondary processor 0x%010lx [0x%08x]\n",
   241                                         ¦cpu, (unsigned long)mpidr,
   242                                         ¦read_cpuid_id());  //打印内核ｌｏｇ
   243         update_cpu_boot_status(CPU_BOOT_SUCCESS);
   244         set_cpu_online(cpu, true);  //设置ｃｐｕ状态为ｏｎｌｉｎｅ
   245         complete(&cpu_running); //唤醒主处理器的 完成等待函数，继续启动下一个从处理器  
   246 
   247         local_daif_restore(DAIF_PROCCTX);  //从处理器继续往下执行
248 
   249         /*
   250         ¦* OK, it's off to the idle thread for us
   251         ¦*/
   252         cpu_startup_entry(CPUHP_AP_ONLINE_IDLE); //ｉｄｌｅ进程进入ｉｄｌｅ状态
   253 }
```

实际上，可以看的当从处理器启动到内核的时候，他们也需要设置异常向量表，设置mmu等，然后执行各自的idle进程（这些都是一些处理器强相关的初始化代码，一些通用的初始化都已经被主处理器初始化完），当cpu负载均衡的时候会放置一些进程到这些从处理器，然后进程就可以再这些从处理器上欢快的运行。

写到这里，关于arm64平台的多核启动已经介绍完成，可以发现里面还是会涉及到很多细节，源码散落在uboot，atf，kernel等源码目录中，多核启动并不是很神秘，都是需要告诉从处理器从那个地方开始取值执行，然后从处理器进入内核后需要自身做一些必要的初始化，就进入idle状态等待有任务来调度.

arm64平台使用psci更为广泛。

## 参考文章

> 值得反复阅读。

发布于 2023-12-04 08:44・新加坡[PMP报考条件有哪些，对学历要求严吗？](https://www.zhihu.com/question/271584178/answer/3324137339)

[

有很多人想考PMP，却不知道自己能不能报考。为了帮大家节省时间，我就专门出了这篇PMP扫盲贴，让你一分钟了解PMP的报考条件。一、学历要求首先，让我们看看学历方面的要求：1.本科...

](https://www.zhihu.com/question/271584178/answer/3324137339)