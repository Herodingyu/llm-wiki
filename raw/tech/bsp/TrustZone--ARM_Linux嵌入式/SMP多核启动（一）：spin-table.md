---
title: "SMP多核启动（一）：spin-table"
source: "https://zhuanlan.zhihu.com/p/670209027"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "前言看这篇文章，你必备的一些前置知识有如下 1、ATF启动流程2、PSCI电源管理的概念3、设备树如果没有，可以去我的专栏目录下逛逛，会有所收获。 1、SMP是什么？SMP 英文为Symmetric Multi-Processing ，是对称多…"
tags:
  - "clippings"
---
[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770)

6 人赞同了该文章

## 前言

看这篇文章，你必备的一些前置知识有如下

如果没有，可以去我的专栏目录下逛逛，会有所收获。

## 1、SMP是什么？

SMP 英文为Symmetric Multi-Processing ，是对称多处理结构的简称，是指在一个计算机上汇集了一组处理器（多CPU），各CPU之间共享内存子系统以及总线结构，一个服务器系统可以同时运行多个处理器，并共享内存和其他的主机资源。

[CMP](https://zhida.zhihu.com/search?content_id=237065695&content_type=Article&match_order=1&q=CMP&zhida_source=entity) 英文为Chip multiprocessors，指的是单芯片多处理器，也指多核心。其思想是将大规模并行处理器中的SMP集成到同一芯片内，各个处理器并行执行不同的进程。

（1）CPU数：独立的中央处理单元，体现在主板上就是有多少个CPU槽位

（2）CPU核心数（CPU cores）：在每一个CPU上，都可能有多核（core）,每个核中都有独立的ALU，FPU，Cache等组件，可以理解为CPU的物理核数。（我们常说4核8线程中的核），指物理上存在的物体。

（3）CPU线程数（processor逻辑核）：一种逻辑上的概念，并非真实存在的物体，只是为了更好地描述CPU的运作能力。简单地说，就是模拟出的CPU核心数。

不过在这里我们这里指的是多个单核CPU组合到一起，每个核都有自己的一套寄存器。

```
一个系统存在多个CPU，成本会更高和管理也更困难。多核算是轻量级的SMP，物理上多核CPU还是封装成一个CPU，但是在CPU内部具有多个CPU的核心部件，可以同时运行多个线程/进程。但是需要CPU核心之间要共享资源，比如缓存。

对程序员来说，它们之间的区别很小，大多数情况可以不做区分。我们在嵌入式开发中，大部分都是用的多核CPU。
```

这里我们就把这个SMP启动转换成多核CPU启动。

## 2、启动方式

```
程序为何可以在多个cpu上并发执行：他们有各自独立的一套寄存器，如：程序计数器pc,栈指针寄存器sp,通用寄存器等，可以独自 取指、译码、执行，当然内存和外设资源是共享的，多核环境下当访问临界区 资源一般 自旋锁来防止竞态发生。

soc启动的一般会从片内的rom， 也叫bootrom开始执行第一条指令，这个地址是系统默认的启动地址，会在bootrom中由芯片厂家固化一段启动代码来加载启动bootloader到片内的sram,启动完成后的bootloader除了做一些硬件初始化之外做的最重要的事情是初始化ddr,因为sram的空间比较小所以需要初始化拥有大内存 ddr,最后会从网络/usb下载 或从存储设备分区上加载内核到ddr某个地址，为内核传递参数之后，然后bootloader就完成了它的使命，跳转到内核，就进入了操作系统内核的世界。

bootloader将系统的控制权交给内核之后，他首先会进行处理器架构相关初始化部分，如设置异常向量表，初始化mmu（之后内核就从物理地址空间进入了虚拟地址空间的世界，一切是那么的虚无缥缈，又是那么的恰到好处）等等，然后会清bss段，设置sp之后跳转到C语言部分进行更加复杂通用的初始化，其中会进行内存方面的初始化，调度器初始化，文件系统等内核基础组件 初始化工作，随后会进行关键的从处理器的引导过程，然后是各种实质性的设备驱动的初始化，最后 创建系统的第一个用户进程init后进入用户空间执行用户进程宣誓内核初始化完成，可以进程正常的调度执行。

系统初始化阶段大多数都是主处理器做初始化工作，所有不用考虑处理器并发情况，一旦从处理器被bingup起来，调度器和各自的运行队列准备就绪，多个任务就会均衡到各个处理器，开始了并发的世界，一切是那么的神奇。
```

soc在启动阶段除了一些特殊情况外（如为了加快启动速度，在bl2阶段通过并行加载方式同时加载bl31、bl32和bl33镜像），一般都没有并行化需求。因此只需要一个cpu执行启动流程即可，这个cpu被称为primary cpu，而其它的cpu则统一被称为secondary cpu。为了防止secondary cpu在启动阶段的执行，它们在启动时必须要被设置为一个特定的状态。（有时候为了增加启动速度，必须对时间敏感的设备，就可能启动的时候整个从核并行跑一些任务）

当primary cpu完成操作系统初始化，调度系统开始工作后，就可以通过一定的机制启动secondary cpu。显然secondary cpu不再需要执行启动流程代码，而只需直接跳转到内核中执行即可。

主流程启动初始化一般来说都是主核在干的，当系统完成了初始化后就开始启动从核。　 这就像在启动的大门，只有主核让你过了，其他的先在门外等着。当cpu0启动到kernel后，就会去门口，把它们的门禁卡给它们，卡上就写的它们的目的地班级是哪里。如果没有这个门禁卡的cpu，说明地址为0，就继续在原地等着。

**故其启动的关键是如何将内核入口地址告知secondary cpu，以使其能跳转到正确的执行位置。**

aarch64架构实现了两种不同的启动方式， **[spin-table](https://zhida.zhihu.com/search?content_id=237065695&content_type=Article&match_order=1&q=spin-table&zhida_source=entity) 和 [psci](https://zhida.zhihu.com/search?content_id=237065695&content_type=Article&match_order=1&q=psci&zhida_source=entity) 。**

其中spin-table方式非常简单，但其只能被用于secondary cpu启动，功能比较单一。

随着aarch64架构电源管理需求的增加（如cpu热插拔、cpu idle等），arm设计了一套标准的电源管理接口协议psci。该协议可以支持所有cpu相关的电源管理接口，而且由于电源相关操作是系统的关键功能，为了防止其被攻击，该协议将底层相关的实现都放到了secure空间，从而可提高系统的安全性。

## 2.1 spin-table

spin-table启动流程的示意图如下：

![](https://pic3.zhimg.com/v2-da8d67094ce6982c44d527e73053e702_1440w.jpg)

芯片上电后primary cpu开始执行启动流程，而secondary cpu则将自身设置为WFE睡眠状态，并且为内核准备了一块内存，用于填写secondary cpu的入口地址。

uboot负责将这块内存的地址写入devicetree中，当内核初始化完成，需要启动secondary cpu时，就将其内核入口地址写到那块内存中，然后唤醒cpu。

secondary cpu被唤醒后，检查该内存的内容，确认内核已经向其写入了启动地址，就跳转到该地址执行启动流程。

### 2.1.1 secondary cpu初始化状态设置

uboot启动时，secondary cpu会通过以下流程进入wfe状态（arch/arm/cpu/armv8/start.S）：

```
#if defined(CONFIG_ARMV8_SPIN_TABLE) && !defined(CONFIG_SPL_BUILD)
    branch_if_master x0, x1, master_cpu                  （1）
    b    spin_table_secondary_jump                    （2）
    …
master_cpu:                                                  （3）
    bl    _main
```

（1）若当前cpu为primary cpu，则跳转到step 3，继续执行启动流程。其中cpu id是通过mpidr区分的，而启动流程中哪个cpu作为primary cpu可以任意指定。当指定完成后，此处就可以根据其身份确定相应的执行流程

（2）若当前cpu为slave cpu，则执行spin流程。它是由spin\_table\_secondary\_jump函数实现的（arch/arm/cpu/armv8/start.S）。以下为其代码实现：

```
ENTRY(spin_table_secondary_jump)
.globl spin_table_reserve_begin
spin_table_reserve_begin:
0:    wfe                                           （1）
    ldr    x0, spin_table_cpu_release_addr       （2）
    cbz    x0, 0b                                （3）
    br    x0                                    （4）
.globl spin_table_cpu_release_addr                    （5）
    .align    3
spin_table_cpu_release_addr:
    .quad    0
.globl spin_table_reserve_end
spin_table_reserve_end:
ENDPROC(spin_table_secondary_jump)
```

（1）secondary cpu当前没有事情要做，因此执行wfe指令进入睡眠模式，以降低功耗

（2）spin\_table\_cpu\_release\_addr将由uboot传递给内核，根据step 5的定义可知，其长度为8个字节，在64位系统中正好可以保存一个指针。而它的内容在启动时会被初始化为0，当内核初始化完成后，在启动secondary cpu之前，会在uboot中将其入口地址写到该位置，并唤醒它

（3）当secondary cpu从wfe状态唤醒后，会校验内核是否在spin\_table\_cpu\_release\_addr处填写了它的启动入口。若未填写，则其会继续进入wfe状态

（4）若内核填入了启动地址，则其直接跳转到该地址开始执行内核初始化流程

### 2.1.2 spin\_table\_cpu\_release\_addr的传递

由于在armv8架构下， **uboot只能通过devicetree向内核传递参数信息** ，因此当其开启了CONFIG\_ARMV8\_SPIN\_TABLE配置选项后，就需要在适当的时候将该值写入devicetree中。

我们知道uboot一般通过bootm命令启动操作系统（aarch64支持的booti命令，其底层实现与bootm相同），因此在bootm中会执行一系列启动前的准备工作，其中就包括将spin-table地写入devicetree的工作。以下其执行流程图：

![](https://pic3.zhimg.com/v2-13bce50b1802a42433f6425566e05924_1440w.jpg)

spin\_table\_update\_dt的代码实现如下：

```
int spin_table_update_dt(void *fdt)
{
    …
    unsigned long rsv_addr = (unsigned long)&spin_table_reserve_begin;   
    unsigned long rsv_size = &spin_table_reserve_end -
                        &spin_table_reserve_begin;                 （1）

    cpus_offset = fdt_path_offset(fdt, "/cpus");                                       （2）
    if (cpus_offset < 0)
        return -ENODEV;

    for (offset = fdt_first_subnode(fdt, cpus_offset);                    
         offset >= 0;
         offset = fdt_next_subnode(fdt, offset)) {
        prop = fdt_getprop(fdt, offset, "device_type", NULL);
        if (!prop || strcmp(prop, "cpu"))
            continue;
        prop = fdt_getprop(fdt, offset, "enable-method", NULL);                    （3）
        if (!prop || strcmp(prop, "spin-table"))
            return 0;
    }

    for (offset = fdt_first_subnode(fdt, cpus_offset);
         offset >= 0;
         offset = fdt_next_subnode(fdt, offset)) {
        prop = fdt_getprop(fdt, offset, "device_type", NULL);
        if (!prop || strcmp(prop, "cpu"))
            continue;

        ret = fdt_setprop_u64(fdt, offset, "cpu-release-addr",
                (unsigned long)&spin_table_cpu_release_addr);              （4）
        if (ret)
            return -ENOSPC;
    }

    ret = fdt_add_mem_rsv(fdt, rsv_addr, rsv_size);                                    （5）
    …
}
```

（1）获取其起始地址和长度

（2）从devicetree中获取cpus节点

（3）遍历该节点的所有cpu子节点，并校验其enable-method是否为spin-table。若不是所有cpu的都该类型，则不设置

（4）若所有cpu的enable-method都为spin-table，则将该参数设置到cpu-release-addr属性中

（5）由于这段地址有特殊用途，内核的内存管理系统不能将其分配给其它模块。因此，需要将其添加到保留内存中

### 2.1.3 启动secondary cpu

内核在启动secondary cpu之前当然需要为其准备好执行环境，因为内核中cpu最终都将由调度器管理，故此时调度子系统应该要初始化完成。

同时cpu启动完成转交给调度器之前，并没有实际的业务进程，而我们知道内核中cpu在空闲时会执行idle进程。因此，在其启动之前需要为每个cpu初始化一个idle进程。

另外，由于将一个cpu通过热插拔方式移除后，再次启动该cpu的流程，与secondary cpu的启动流程是相同的，因此内核复用了cpu hotplug框架用于启动secondary cpu。

而内核为每个cpu都分配了一个独立的hotplug线程，用于执行本cpu相关的热插拔流程。为此，内核通过以下流程执行secondary cpu启动操作：

![](https://pic4.zhimg.com/v2-50062d70eaaad486611f8b300e57d29b_1440w.jpg)

在这里插入图片描述

### idle进程初始化

以下代码为每个非boot cpu分配一个idle进程

```
void __init idle_threads_init(void)
{
    …
    boot_cpu = smp_processor_id();
    for_each_possible_cpu(cpu) {                 （1）
        if (cpu != boot_cpu)
            idle_init(cpu);              （2）
    }
}
```

（1）遍历系统中所有的possible cpu

（2）若该cpu为secondary cpu，则为其初始化一个idle进程

### hotplug线程初始化

以下代码为每个cpu初始化一个hotplug线程

```
void __init cpuhp_threads_init(void)
{
    BUG_ON(smpboot_register_percpu_thread(&cpuhp_threads));
    kthread_unpark(this_cpu_read(cpuhp_state.thread));
}
```

其中线程的描述结构体定义如下：

```
static struct smp_hotplug_thread cpuhp_threads = {
    .store            = &cpuhp_state.thread,               （1）
    .create            = &cpuhp_create,                     （2）
    .thread_should_run    = cpuhp_should_run,                  （3）
    .thread_fn        = cpuhp_thread_fun,                  （4）
    .thread_comm        = "cpuhp/%u",                        （5）
    .selfparking        = true,                              （6）
}
```

（1）用于保存cpu上的task struct指针

（2）线程创建时调用的回调

（3）该回调用于获取线程是否需要退出标志

（4）cpu hotplug主函数，执行实际的hotplug操作

（5）该线程的线程名

（6）用于设置线程创建完成后，是否将其设置为park状态

### hotplug回调线程唤醒

内核使用以下流程唤醒特定cpu的hotplug线程，用于执行实际的cpu启动流程：

![](https://pica.zhimg.com/v2-5c6f45234e982b88840b91b0819e21f8_1440w.jpg)

　由于cpu启动时需要与一系列模块交互以执行相应的准备工作，为此内核为其定义了一组hotplug状态，用于表示cpu在启动或关闭时分别需要执行的流程。以下为个阶段状态定义示例（由于该数组较长，故只截了一小段）：

```
static struct cpuhp_step cpuhp_hp_states[] = {
    [CPUHP_OFFLINE] = {
        .name            = "offline",
        .startup.single        = NULL,
        .teardown.single    = NULL,
    },
    …
    [CPUHP_BRINGUP_CPU] = {
        .name            = "cpu:bringup",
        .startup.single        = bringup_cpu,
        .teardown.single    = finish_cpu,
        .cant_stop        = true,
        }
　　　　…
    [CPUHP_ONLINE] = {
        .name            = "online",
        .startup.single        = NULL,
        .teardown.single    = NULL,
    },
}
```

以上每个阶段都可包含startup.single和teardown.single两个回调函数，分别表示cpu启动和关闭时需要执行的流程。其中在cpu启动时，将会从CPUHP\_OFFLINE状态开始，依次执行各个阶段的startup.single回调函数。其中CPUHP\_BRINGUP\_CPU及之前的阶段都在secondary cpu启动之前执行。

而CPUHP\_BRINGUP\_CPU阶段的回调函数bringup\_cpu，会实际触发secondary cpu的启动流程。它将通过cpu\_ops接口调用spin-table函数，启动secondary cpu，并等待其启动完成。

当secondary cpu启动完成后，将唤醒hotplug线程，其将继续执行CPUHP\_BRINGUP\_CPU之后阶段相关的回调函数。

### cpu操作函数

cpu\_ops函数由bringup\_cpu调用，以触发secondary cpu启动。它是根据设备树中解析出的enable-method属性确定的。

```
int __init init_cpu_ops(int cpu)
{
    const char *enable_method = cpu_read_enable_method(cpu);   （1）
            …
    cpu_ops[cpu] = cpu_get_ops(enable_method);                 （2）
        …
}
```

（1）获取该cpu enable-method属性的值

（2）根据其enable-method获取其对应的cpu\_ops回调

其中spin-table启动方式的回调如下：

```
const struct cpu_operations smp_spin_table_ops = {
    .name        = "spin-table",
    .cpu_init    = smp_spin_table_cpu_init,
    .cpu_prepare    = smp_spin_table_cpu_prepare,
    .cpu_boot    = smp_spin_table_cpu_boot,
}
```

### 触发secondary cpu启动

以上流程都准备完成后，触发secondary cpu启动就非常简单了。只需调用其cpu\_ops回调函数，向其对应的spin\_table\_cpu\_release\_addr位置写入secondary cpu入口地址即可。以下为其调用流程：

![](https://pica.zhimg.com/v2-c7e41bfc54e89b9be50fe1ba17207450_1440w.jpg)

在这里插入图片描述

其中smp\_spin\_table\_cpu\_boot的实现如下：

```
static int smp_spin_table_cpu_boot(unsigned int cpu)
{
    write_pen_release(cpu_logical_map(cpu));    （1）
    sev();                                      （2）

    return 0;
}
```

（1）向给定地址写入内核entry

（2）通过sev指令唤醒secondary cpu启动

此后，该线程将等待cpu启动完成，并在完成后将其设置为online状态

### secondary cpu执行流程

aarch64架构secondary cpu的内核入口函数为secondary\_entry（arch/arm64/kernel/head.S），以下为其执行主流程：

![](https://pic1.zhimg.com/v2-7ad62075b24437e6b7cbd2b9b0306c7e_1440w.jpg)

由于其底层相关初始化流程与primary cpu类似，因此此处不再介绍。我们这里主要看一下它是如何通过secondary\_start\_kernel启动idle线程的：

```
asmlinkage notrace void secondary_start_kernel(void)
{
    struct mm_struct *mm = &init_mm;                          
    …
    current->active_mm = mm;                               （1）

    cpu_uninstall_idmap();                                 （2）
    …
    ops = get_cpu_ops(cpu);
    if (ops->cpu_postboot)
        ops->cpu_postboot();                           （3）
    …
    set_cpu_online(cpu, true);                             （4）
    complete(&cpu_running);                                （5）
    …
    cpu_startup_entry(CPUHP_AP_ONLINE_IDLE);               （6）
}
```

（1）由于内核线程并没有用于地址空间，因此其active\_mm通常指向上一个用户进程的地址空间。而cpu初始化时，由于之前并没有运行过用户进程，因此将其初始化为init\_mm

（2）idmap地址映射仅仅是用于mmu使能时地址空间的平滑切换，在mmu使能完成后已经没有作用。更进一步，由于idmap页表所使用的ttbr0\_elx页表基地址寄存器，正常情况下是用于用户空间页表的，在调度器接管该cpu之前也必须要将其归还给用户空间

（3）执行cpu\_postboot回调

（4）由secondary cpu已经启动成功，故将其设置为online状态

（5）唤醒cpu hotplug线程

（6）让cpu执行idle线程，其代码实现如下：

```
void cpu_startup_entry(enum cpuhp_state state)
{
    arch_cpu_idle_prepare();
    cpuhp_online_idle(state);
    while (1)
        do_idle();
}
```

至此，cpu已经启动完成，并开始执行idle线程了。最后当然是要通知调度器，将该cpu的管理权限移交给调度器了。它是通过cpu hotplug的以下回调实现的：

```
static struct cpuhp_step cpuhp_hp_states[] = {
　　…
　　[CPUHP_AP_SCHED_STARTING] = {
        .name            = "sched:starting",
        .startup.single        = sched_cpu_starting,
        .teardown.single    = sched_cpu_dying,
　　}
　　…
}
```

以下为该函数的实现：

```
int sched_cpu_starting(unsigned int cpu)
{
　　…
　　sched_rq_cpu_starting(cpu);        （1）
　　sched_tick_start(cpu);             （2）
　　…
}
```

（1）用于初始化负载均衡相关参数，此后该cpu就可以在其后的负载均衡流程中拉取进程

（2）tick时钟是内核调度器的脉搏，启动了该时钟之后，cpu就会在时钟中断中执行调度操作，从而让cpu参与到系统的调度流程中

**到这里我们就知道了spin-table这个流程。不得不说前辈对这个逻辑理解很清楚，这个内容的参考链接在文末，欢迎大家点击原文链接点赞。**

### 小结

整个图来看看

![](https://pic1.zhimg.com/v2-48774504a18e86be4e4fb8aec6eb7e5e_1440w.jpg)

最后这里补充一下一个使用自旋表作为启动方式的平台设备树cpu节点：

```
arch/arm64/boot/dts/xxx.dtsi:

   cpu@0 {
                        device_type = "cpu";
                        compatible = "arm,armv8";
                        reg = <0x0 0x000>;
                        enable-method = "spin-table";
                        cpu-release-addr = <0x1 0x0000fff8>;
                };
```

spin-table方式的多核启动方式，顾名思义在于自旋，主处理器和从处理器上电都会启动，主处理器执行uboot畅通无阻，从处理器在spin\_table\_secondary\_jump处wfe睡眠，主处理器通过修改设备树的cpu节点的cpu-release-addr属性为spin\_table\_cpu\_release\_addr，这是从处理器的释放地址所在的地方。

主处理器进入内核后，会通过smp\_prepare\_cpus函数调用spin-table 对应的cpu操作集的cpu\_prepare方法从而在smp\_spin\_table\_cpu\_prepare函数中设置从处理器的释放地址为secondary\_holding\_pen这个内核函数，然后通过sev指令唤醒从处理器，从处理器继续从secondary\_holding\_pen开始执行（从处理器来到了内核的世界），发现secondary\_holding\_pen\_release不是自己的处理编号，然后通过wfe继续睡眠。

当主处理器完成了大多数的内核组件的初始化之后，调用smp\_init来来开始真正的启动从处理器，最终调用spin-table 对应的cpu操作集的cpu\_boot方法从而在smp\_spin\_table\_cpu\_boot将需要启动的处理器的编号写入secondary\_holding\_pen\_release中，然后再次sev指令唤醒从处理器，从处理器得以继续执行（设置自己异常向量表，初始化mmu等）。

最终在idle线程中执行wfi睡眠。其他从处理器也是同样的方式启动起来，同样最后进入各种idle进程执行wfi睡眠，主处理器继续往下进行内核初始化，直到启动init进程，后面多个处理器都被启动起来，都可以调度进程，多进程还会被均衡到多核。

### 问题

- 1、 而启动流程中哪个cpu作为primary cpu可以任意指定？primary cpu如何任意指定的？

> 启动的 **汇编代码中会通过cpu的affinity值** 获取当前cpu的id，然后将自身cpu id与指定cpu id进行比较，以确定当前cpu是否是primary cpu

- 2、cpu hotplug对于spintable是必须的吗？

> spintable启动方式不支持cpu hotplug，只是在secondary 启动时复用了hotplug相同的流程，这部分代码默认是会被编译到内核中的

---

但是spin-table方式非常简单，但其只能被用于secondary cpu启动，功能比较单一。

随着aarch64架构电源管理需求的增加（如cpu热插拔、cpu idle等），arm设计了一套标准的电源管理接口协议psci。

该协议可以支持所有cpu相关的电源管理接口，而且由于电源相关操作是系统的关键功能，为了防止其被攻击，该协议将底层相关的实现都放到了secure空间，从而可提高系统的安全性。

> 下一篇看看psci

## 参考链接

两篇真的讲的很好的链接

发布于 2023-12-04 08:44・新加坡[PMP培训机构哪家强？10家PMP培训机构全盘对比](https://zhuanlan.zhihu.com/p/659971532)

[

收集了市面上比较常见的10家PMP培训机构的基本信息，做了一次PMP培训机构情况测评，PMP报班选择看这一篇就够了...

](https://zhuanlan.zhihu.com/p/659971532)