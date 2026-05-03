---
title: "聊聊SOC启动（十） 内核启动先导知识"
source: "https://zhuanlan.zhihu.com/p/522195519"
author:
  - "[[lgjjeff]]"
published:
created: 2026-05-03
description: "本文基于以下软硬件假定： 架构：AARCH64 内核版本：5.14.0-rc51 问题引出 经过漫漫征途终于进入内核大门了，现在内核将愉快地从第一条指令开始执行。但在开始内核之旅前，还是有必要再看下系统进入内核之前的状态…"
tags:
  - "clippings"
---
[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944)

18 人赞同了该文章

本文基于以下软硬件假定：  
架构：AARCH64  
内核版本：5.14.0-rc5

## 1　问题引出

　　经过漫漫征途终于进入内核大门了，现在内核将愉快地从第一条指令开始执行。但在开始内核之旅前，还是有必要再看下系统进入内核之前的状态。我们知道 [uboot](https://zhida.zhihu.com/search?content_id=204175776&content_type=Article&match_order=1&q=uboot&zhida_source=entity) 的最后一步是把内核拷贝到内存，并将cpu设置为如下状态：  
（1） [MMU](https://zhida.zhihu.com/search?content_id=204175776&content_type=Article&match_order=1&q=MMU&zhida_source=entity) 处于关闭状态  
（2） [数据cache](https://zhida.zhihu.com/search?content_id=204175776&content_type=Article&match_order=1&q=%E6%95%B0%E6%8D%AEcache&zhida_source=entity) 处于关闭状态，指令cache可以是关闭或者打开的  
（3）将dtb的地址存放到x0寄存器中  
（4）通过 [armv8](https://zhida.zhihu.com/search?content_id=204175776&content_type=Article&match_order=1&q=armv8&zhida_source=entity) \_switch\_to\_el2函数跳转到内核入口地址执行

　　由于刚进入内核时页表还没有建立，此时系统运行在实模式，且ARM8数据cache的开启需要依赖于MMU，因此显然在启动内核前需要关闭MMU和数据cache。

　　我们知道armv8一共有四个异常等级，正常情况下内核应该运行在EL1，但是由于ARMv8支持虚拟化。对于 [type 2 hypervisor](https://zhida.zhihu.com/search?content_id=204175776&content_type=Article&match_order=1&q=type+2+hypervisor&zhida_source=entity) ，其guest OS运行在EL1，若host OS也运行在EL1，则其架构如下：

![](https://pic1.zhimg.com/v2-b2d2a887f16ad9bb06e6dd65774b908e_1440w.jpg)

　　此时host os与guest os都运行在EL1，而hypervisor作为host os的一部分运行在EL2，由于host os与hypervisor运行在不同的异常等级，它们之间需要通过异常进行交互。这需要异常等级切换，以及上下文的保存和恢复，显然会带来比较大的开销。为了提高虚拟化效率，arm在armv8.1之后的架构增加了对 [vhe](https://zhida.zhihu.com/search?content_id=204175776&content_type=Article&match_order=1&q=vhe&zhida_source=entity) 的支持，以允许host os运行在EL2。此时系统架构将变为以下方式：

![](https://pic2.zhimg.com/v2-d597781620fec6addadcead370180353_1440w.jpg)

　　由于host os与hypervisor都运行在EL2，因此减少了上述开销。但是host os本身与普通os并没有两样，默认被设计为工作于EL1中，如其通过sctlr\_el1访问系统控制寄存器，通过vbar\_el1访问向量表基地址寄存器等。若host os运行在EL2，则需要将这些寄存器的访问操作重定向到其对应的xxx\_el2寄存器，arm架构在硬件层面提供了寄存器重定向特性，但是os也需要做相应的适配，如使能HCR\_EL2.E2H以开启vhe支持，使能HCR\_EL2.TGE以将本来被路由到EL1的异常路由到EL2等。此后，host os就可以马照跑，舞照跳，所有的操作与运行于EL1时相同，根本无需关心自己实际上是运行于哪个EL

　　uboot加载内核时会将内核拷贝到内存的低地址处（如0x40000000），然后直接跳转到该物理地址处运行。但实际上程序运行依赖于链接脚本中定义的虚拟地址，若代码不是地址无关的，则加载地址必须要与链接地址一致才能正确运行。我们再来看一下arm64架构链接脚本中内核起始地址的定义（arch/arm64/kernel/vmlinu.lds.S）：

```
OUTPUT_ARCH(aarch64)
ENTRY(_text)
…
SECTIONS
{
    …
    . = KIMAGE_VADDR;

    .head.text : {
        _text = .;
        HEAD_TEXT
    }
    …
}
```

　　即内核入口函数\_text的链接地址为KIMAGE\_VADDR，从下图内核虚拟地址空间布局可以看到，该地址为0xffff80000fffffff，显然与uboot的加载地址不同。因此为了内核能正常启动，其开头部分的代码必须要支持位置无关特性。

![](https://pic3.zhimg.com/v2-18900db9ce7b4d5b6a7cf5243158f6c6_1440w.jpg)

　　由于位置无关代码不能直接访问全局变量的地址，除非编译阶段指定了pie选项，否则在编码方面会有诸多限制。因此内核启动后自然希望能尽快切换到正常执行模式，这就需要在启动早期就为内核运行所需的代码段、栈、数据段等部分内存建立初始化页表，从而使其运行地址与链接地址匹配。

## ２　内核执行的异常等级

### ２.1　内核启动时的异常等级

　　除了必须支持EL0和EL1以外，arm可以灵活地配置是否支持EL2和EL3。为了讨论方便，我们假定讨论的系统支持所有EL0 – EL3异常等级，且启动流程为bl1 bl2 bl31 bl32 uboot linux。以下为其典型流程图：

![](https://pica.zhimg.com/v2-70e1b5789da916769c3be6a657f14782_1440w.jpg)

　　Arm规定cpu以系统支持的最高异常等级开始启动，因此bl1运行于EL3，Bl2根据需求可运行于S-EL1或EL3，BL31需要执行secure monitor功能，故只能运行于EL3。BL32主要用于支持trust os，其必须执行在S-EL1和S-EL0下

### ２.1.1　Uboot的执行异常等级

　　由于uboot（bl33）由bl31启动，因此其异常等级也由bl31确定。我们以qemu平台为例，atf获取bl33异常等级的流程如下：

![](https://pic4.zhimg.com/v2-cc6b8087bad9c179fe1a0347ba68b69b_1440w.jpg)

　　以下为其实际获取流程的定义：

```
static inline uint64_t el_implemented(unsigned int el)
{
    if (el > 3U) {
        return EL_IMPL_NONE;
    } else {
        unsigned int shift = ID_AA64PFR0_EL1_SHIFT * el;                    

        return (read_id_aa64pfr0_el1() >> shift) & ID_AA64PFR0_ELX_MASK;    （1）
    }
}

static uint32_t qemu_get_spsr_for_bl33_entry(void)
{
    …
    mode = (el_implemented(2) != EL_IMPL_NONE) ? MODE_EL2 : MODE_EL1;           （2）
    spsr = SPSR_64(mode, MODE_SP_ELX, DISABLE_ALL_EXCEPTIONS);                  （3）
    …
}
```

（1）该函数通过过读取id\_aa64pfr0\_el1寄存器判断是否支持给定的异常等级，该寄存器的定义如下：

![](https://pic3.zhimg.com/v2-3c959e000db3ffeee4acc0c4e91b1fce_1440w.jpg)

　　即判断寄存器中给定异常等级对应的字段是否被设置，若其被设置则cpu支持该异常等级，否则不支持  
（2）若cpu支持EL2，则uboot从EL2启动，否则从EL1启动  
（3）将启动模式设置到non secure上下文的spsr成员中，该上下文在退出bl31之前会被设置到实际的寄存器中

### ２.1.２　内核启动异常等级的确定

　　uboot本身作为firmware支持运行在EL1 – EL3的任一等级，但内核只能运行于EL 1或EL2。因此在进入内核之前，uboot需要根据实际情况切换到对应的异常等级。  
　　加载完内核后，它会通过 [boot\_jump\_linux](https://zhida.zhihu.com/search?content_id=204175776&content_type=Article&match_order=1&q=boot_jump_linux&zhida_source=entity) 执行实际的切换流程，其中aarch64架构流程如下：

```
static void boot_jump_linux(bootm_headers_t *images, int flag)
{
    …
#ifdef CONFIG_ARMV8_SWITCH_TO_EL1
        printf("switch to EL1 AARCH64\n");
        armv8_switch_to_el2((u64)images->ft_addr, 0, 0, 0,
                    (u64)switch_to_el1, ES_TO_AARCH64);          （1）
#else
        if ((IH_ARCH_DEFAULT == IH_ARCH_ARM64) &&
            (images->os.arch == IH_ARCH_ARM)) {
            printf("switch to EL2 AARCH32\n");
            armv8_switch_to_el2(0, (u64)gd->bd->bi_arch_number,
                        (u64)images->ft_addr, 0,
                        (u64)images->ep,
                        ES_TO_AARCH32);                       （2）
        } else {
            printf("switch to EL2 AARCH64\n");
            armv8_switch_to_el2((u64)images->ft_addr, 0, 0, 0,
                        images->ep,
                        ES_TO_AARCH64);                       （3）
        }
#endif
…
}
```

　　armv8\_to\_el2会获取cpu的当前异常等级，并根据该值确定内核的运行等级。若配置了CONFIG\_ARMV8\_SWITCH\_TO\_EL1强制从EL1启动，则不管当前运行在那个EL下，都切换到EL1再启动内核。若当前在EL3下执行，则需要切换到EL2再启动内核。否则，内核将跟随uboot的EL。其关系可表示为下表：

| 当前异常等级 | CONFIG\_ARMV8\_SWITCH\_TO\_EL1的值 | 内核异常等级 |
| --- | --- | --- |
| EL1 | yes | EL1 |
| EL1 | no | El1 |
| EL2 | yes | EL1 |
| EL2 | no | El2 |
| EL3 | yes | EL1 |
| EL3 | no | EL2 |

下面是其代码实现，不感兴趣的同学直接跳过即可：  
（1）通过配置参数CONFIG\_ARMV8\_SWITCH\_TO\_EL1强制内核在EL1下运行。在该流程中armv8\_switch\_to\_el2先跳转到switch\_to\_el1函数，然后由switch\_to\_el1执行实际的异常等级切换和内核启  
（2）若os需要运行于aarch32状态，则传入对应参数  
（3）若os需要运行于aarch64状态，则传入对应参数。由于现在的主流架构是aarch64，故后面涉及架构相关的代码我们都只关注aarch64相关的分支

　　armv8\_switch\_to\_el2的流程如下：

```
ENTRY(armv8_switch_to_el2)
    switch_el x6, 1f, 0f, 0f            （a）
0:
    cmp x5, #ES_TO_AARCH64   
    b.eq 2f                              
    bl armv8_el2_to_aarch32
2:
    br x4                               （b）
1:    armv8_switch_to_el2_m x4, x5, x6    （c）
ENDPROC(armv8_switch_to_el2)
```

　　它根据当前运行的异常等级，确定需要执行的分支。由于uboot可以执行在EL1、EL2或EL3下，因此这里对其分别执行不同的处理。通过下面switch\_el的定义，可知当前运行异常等级不同时，其跳转分支分别如下：

| 当前异常等级 | 跳转标签 |
| --- | --- |
| EL1 | 0 |
| EL2 | 0 |
| EL3 | 1 |

```
.macro    switch_el, xreg, el3_label, el2_label, el1_label
    mrs    \xreg, CurrentEL
    cmp    \xreg, 0xc
    b.eq    \el3_label
    cmp    \xreg, 0x8
    b.eq    \el2_label
    cmp    \xreg, 0x4
    b.eq    \el1_label
.endm
```

（a）当前异常等级为EL3时，通过armv8\_switch\_to\_el2\_m切换到EL2并启动内核。当前异常等级为EL1或EL2，根据内核运行状态是aarch32还是aarch64，先切换cpu状态，然后跳转到参数给定的入口函数  
（b）若未定义CONFIG\_ARMV8\_SWITCH\_TO\_EL1，则该函数会直接跳转到内核入口函数处启动内核，此时内核的异常等级与uboot当前运行的异常等级相同。若定义了CONFIG\_ARMV8\_SWITCH\_TO\_EL1，则会跳转到switch\_to\_el1接口，cpu先切换到EL1，然后再启动内核  
（c）将异常等级由EL3切换到EL2，然后启动内核

### ２.２　内核运行时的异常等级

　　uboot可能以EL1或EL2方式启动内核，上一章的讨论中我们知道内核要工作在EL2需要vhe的支持。因此若内核以EL2启动，则必须要进一步处理以确定其是运行于El2的vhe模式，还是降级到EL1。以下是其代码实现：

```
SYM_FUNC_START(init_kernel_el)
    mrs    x0, CurrentEL
    cmp    x0, #CurrentEL_EL2
    b.eq    init_el2                                     （1）

SYM_INNER_LABEL(init_el1, SYM_L_LOCAL)
    mov_q    x0, INIT_SCTLR_EL1_MMU_OFF
    msr    sctlr_el1, x0                                （2）
    isb
    mov_q    x0, INIT_PSTATE_EL1
    msr    spsr_el1, x0
    msr    elr_el1, lr                                  （3）
    mov    w0, #BOOT_CPU_MODE_EL1                       （4）
    eret                                                 （5）

SYM_INNER_LABEL(init_el2, SYM_L_LOCAL)
    mov_q    x0, HCR_HOST_NVHE_FLAGS
    msr    hcr_el2, x0                                  （6）
    isb

    init_el2_state                                       （7）

    adr_l    x0, __hyp_stub_vectors
    msr    vbar_el2, x0                                 （8）
    isb

    mrs    x0, hcr_el2
    and    x0, x0, #HCR_E2H
    cbz    x0, 1f                                       （9）

    mov_q    x0, INIT_SCTLR_EL1_MMU_OFF
    msr_s    SYS_SCTLR_EL12, x0                           （10）

    mov    x0, #INIT_PSTATE_EL2
    msr    spsr_el1, x0                                         
    adr    x0, __cpu_stick_to_vhe                               
    msr    elr_el1, x0                                  （11）
    eret

1:
    mov_q    x0, INIT_SCTLR_EL1_MMU_OFF
    msr    sctlr_el1, x0

    msr    elr_el2, lr
    mov    w0, #BOOT_CPU_MODE_EL2
    eret

__cpu_stick_to_vhe:
    mov    x0, #HVC_VHE_RESTART
    hvc    #0
    mov    x0, #BOOT_CPU_MODE_EL2
    ret
SYM_FUNC_END(init_kernel_el)
```

（1）获取当前运行的异常等级，若其为EL1则直接进入init\_el1处理，否则进入init\_el2  
（2 - 5）用于初始化EL1的执行状态，如sctlr\_el1、spsr\_el1，并通过eret将spsr\_el1的设置到PSATE中，以及执行函数返回  
（6）初始化hcr\_el2寄存器的值，该寄存器用于配置hypervisor的属性。如E2H字段用于开关对vhe的支持，TGE字段确定需要被路由到EL1的异常是否被路由到EL2等  
（7）这个宏用于初始化el2的状态，其定义如下：

```
.macro init_el2_state
        __init_el2_sctlr
        __init_el2_timers
        __init_el2_debug
        __init_el2_lor
        __init_el2_stage2
        __init_el2_gicv3
        __init_el2_hstr
        __init_el2_nvhe_idregs
        __init_el2_nvhe_cptr
        __init_el2_nvhe_sve
        __init_el2_fgt
        __init_el2_nvhe_prepare_eret
.endm
```

　　这里我们重点看一下\_\_init\_el2\_nvhe\_prepare\_eret，该宏会将spsr中的下一异常等级设置为EL1，即执行eret之后cpu将会切换到EL1状态。以下为该宏的定义：

```
.macro __init_el2_nvhe_prepare_eret
    mov    x0, #INIT_PSTATE_EL1
    msr    spsr_el2, x0
.endm

#define INIT_PSTATE_EL1 \
        (PSR_D_BIT | PSR_A_BIT | PSR_I_BIT | PSR_F_BIT | PSR_MODE_EL1h)
```

（8）为el2设置一个stub处理函数，设置完成后el2将能够使用该函数处理hvc异常调用了  
（9）HCR\_EL2.E2H位用于指示是否开启了vhe特性，若没有开启则跳转到标号1处，将cpu跳转回EL1  
（10）使能了vhe之后，直接访问el1的系统寄存器会被重定向到对应的el2寄存器，而hypervisor有时需要访问实际的el1寄存器。因此armv8架构对其做了扩展，使能vhe时若需要访问el1寄存器，则可通过访问xxx\_el12实现  
（11）此时host运行在el2中，对el1寄存器的操作将转换为对应的el2寄存器。因此当前虽然运行于EL2，但设置spsr\_el1和elr\_el1就相当于设置spsr\_el2和elr\_el2。由下面INIT\_PSTATE\_EL2的定义可知，通过eret异常返回之后，cpu依然工作于el2 handler模式

```
#define INIT_PSTATE_EL2 \
        (PSR_D_BIT | PSR_A_BIT | PSR_I_BIT | PSR_F_BIT | PSR_MODE_EL2h)
```

　　但在返回主函数之前，它需要通过\_\_cpu\_stick\_to\_vhe的hvc指令陷入hypervisor的stub handler中对vhe进行初始化

下表为以上内容的小结：

| 内核启动EL | 是否使能VHE | 内核运行EL |
| --- | --- | --- |
| EL1 | NA | EL1 |
| EL2 | no | EL1 |
| EL2 | yes | EL2 |

## ３　内核启动内存管理

### ３.1　地址无关代码

　　由于内核链接地址与uboot实际跳转的入口地址不同，在其刚启动时pc地址为uboot跳转的入口地址。此时cpu可以从该地址获取到第一条指令，此后pc可以通过自增方式依次取指。  
　　由于在内核的链接过程中指定了代码和数据链接后的虚拟地址，即在内核链接完成后，其每个符号的虚拟地址都已经确定，也就是某条指令（当然也包括PC指针指向的指令）和其它符号的相对偏移也已经确定。  
　　因此跳转指令可以通过pc+ offset的相对寻址方式计算跳转地址。内存访问操作也可用与跳转指令类似的方式计算地址。如下图要获取符号A的地址，则可通过PC + offset得到：

![](https://pic4.zhimg.com/v2-55987d11864176cff3510f38ec0d6449_1440w.jpg)

　　当然这种内存操作方式需要指令集的支持，armv8中就有相应的指令可以实现该功能，它们是adr和adrp指令，其说明如下图。由于adr指令编码中的立即数一共占21位（immlo 2位加上immhi 19位），因此其相对于PC的最大地址偏移为前后1M。而adrp指令是以4k为单位的，故其寻址范围达到了前后4G，但每个地址都需要4k对齐。      　　  
　　由其格式ADR（ADRP） <Xd> <label>可知，我们只需要给出某个符号，它就自动可以根据PC值计算该符号的地址，并存放到Xd寄存器中。由于是通过相对偏移来计算的，故该指令还有一个特点。就是若PC中存放的是物理地址，则计算得到的符号地址也是物理地址，反之，若PC中存放的是虚拟地址，则计算得到的符号地址也是虚拟地址，这一特性在后面我们的分析中也会被用到。

![](https://picx.zhimg.com/v2-1b0b7fd09ee9ea74e46fc1aef6ed5d49_1440w.jpg)

![](https://pic1.zhimg.com/v2-a06ee52a37feaf572f7a0feb7fa7db44_1440w.jpg)

### ３.２　内核如何发现内存

　　uboot的最后一步是把内核拷贝到内存，然后跳转到其入口地址处执行。因此在内核启动时其自身就已经位于内存中，但是此时内核还并不知道物理内存的具体信息，如内存的size，bank信息等，实际上它们位于dtb的memory节点中，故只有等到内核解析完dtb的相关信息后，才能了解物理内存的完整信息。      　　  
　　下图为其中一个dts中的例子，在该例子中内存只有一个bank，起始物理地址0x80000000，内存size为0x80000000。

```
memory@80000000 {
    device_type = "memory";
    reg = <0x00000000 0x80000000 0 0x80000000>;
};
```

　　系统解析dtb并初始化内存模块的代码流程如下：

![](https://pic3.zhimg.com/v2-331fd8fd9a899db634d32042c751e7a6_1440w.jpg)

### ３.３　Arm64的虚拟地址空间

　　我们知道在32位系统中虚拟地址空间被分为了两部分，一般的配置下是0 - 3G会分给用户虚拟地址空间，3G - 4G会被分给内核虚拟地址空间。由于内核只有1G虚拟地址空间，因此内核对它进行了划分，低于896M的空间用于直接映射，而其若要访问高于896M的高端内存时，就需要在3G + 896M到4G之间的为其找一块虚拟地址以建立页表。由于该段虚拟地址被逻辑划分成了几个部分，因此高端映射也可以有几种不同的方式，比如可以为临时映射，访问完成后再解除映射以释放虚拟地址空间，也可以为永久映射等，具体的不再展开了。      　　

　　对于arm64，由于其是64位架构，无论是用户空间还是内核空间都含有足够大的虚拟地址范围，故所有的内核地址都能够直接映射到内核的虚拟地址空间上，也就没有必要再保留高端内存了。在实际的应用中，arm64也不会用满所有64位的地址，当前最高会使用52位虚拟地址，也可以配置为48位，42位，39位等。为了论述方便，后面在涉及到arm64虚拟地址时，都以48位地址和4k页大小为例。      　　

　　在arm64中若使用48位的虚拟地址时，则内核空间和用户空间的地址分配如下图，其中lower VA会被用作用户空间，upper VA会被用作内核空间，大小分别为256TB。

![](https://pic2.zhimg.com/v2-da6866601a6a2ca2c5f062064c2533b3_1440w.jpg)

### ３.４　虚拟地址与物理地址的映射关系

　　arm64支持3 - 5级页表，其中五级页表包含PGD，P4D，PUD，PMD，PTE，四级页表不含有P4D，三级页表则不含有P4D和PUD，其余与五级页表相同，为了描述方便，后面的分析中我们都以比较常见的四级页表为例。

　　由于页表描述符的长度为8字节，因此当页size为4k时，若要将pgd的所有entry存到一个页中，则它可以包含4096/8项（即2^9）pgd描述符，因此pgd最多包含虚拟地址的9位，同样的，PUD，PMD和PTE也最多包含虚拟地址的9位。故在48位虚拟地址，4k页大小情况下，4级页表的划分如下图：

![](https://pic1.zhimg.com/v2-b6381f7f155da0f1b381cbb028791ca4_1440w.jpg)

　　根据以上划分，PGD里的每一项都指向一个PUD的基地址，PUD中的每一项都指向一个PMD的基地址，PMD的每一项都指向PTE的基地址，而PTE中的每一项都指向一个物理地址页的基地址。虚拟地址的39 - 47位可以确定其在PGD表中的位置，30 - 38位决定在PUD中的位置，依次类推。      　　

　　因此，只要知道虚拟地址和PGD的基地址，就可以通过页表找到其所在的物理地址页，而虚拟地址的低12位偏移则就是该地址在物理页中的偏移。对arm64架构，EL1中有两个寄存器TTBR0\_EL1和TTBR1\_EL1来保存PGD的地址。如下图所示，当我们创建好了页表，然后将PGD的基地址存入TTBRx\_EL1后，CPU就已经知道了如何进行虚拟地址和物理地址的转换规则。此后，我们只要通过设置SCTRL寄存器的M位就可以使能MMU，运行到虚拟地址空间了。

![](https://pic2.zhimg.com/v2-a2abb673dbbe0b5e08ef20522c532d49_1440w.jpg)

　　前面我们说过arm64在EL1模式下有两个PGD基地址寄存器TTBR0\_EL1和TTBR1\_EL1，它们的作用是什么呢？我们知道虚拟地址分为内核空间和用户空间，其中内核空间的第63位为1，而用户空间的第 63位为0，故通过判断虚拟地址的第63位就可以知道该地址是属于内核空间还是属于用户空间。所以arm64将用户空间页表PGD的基地址存放在TTBR0\_EL1中，而将内核空间页表PGD的基地址存放在TTBR1\_EL1中。当MMU进行虚拟地址到物理地址转换时，会首先判断第63位，若其是用户空间地址，则使用TTBR0\_EL1指向的页表，否则使用TTBR1\_EL1的页表。     

　　当然，这里其实也有例外，在建立初始页表的create\_page\_tables函数中，idmap段的代码虽然属于内核空间，但在创建idmap页表时，其实是映射到低地址虚拟地址空间的。原因是包含arm64在内的现代处理器会采用流水线结构，且具有分支预测，乱序执行等特性，因此在MMU开启时，除了PC中的开启MMU指令以外，其后需要执行的某些指令虽然尚未进入PC，但已经完成了取指或译码等操作。而在它们取指的时候还是MMU off的状态，因此其地址还是物理地址。     

　　为了解决这个问题，内核采用了一种比较巧妙的做法。即将MMU开启相关的代码单独放到一个叫做idmap的段中，然后为该段单独建立一个页表，该页表的特点是其虚拟地址等于物理地址，因此在MMU使能的过程中其后面被取指或译码的指令虚拟地址和物理地址的值是一样的，从而解决了MMU使能切换时地址可能不匹配的问题。我们知道uboot会把内核拷贝到ram的较低地址处，因此它的物理地址会位于0x0000 0000 0000 0000 到0x0000 ffff ffff ffff之间，即其虚拟地址也位于这一区间，故这个页表的pgd基地址会被放入ttbr0\_el1中。     

　　当然在create\_page\_tables中除了为idmap创建页表以外，还需要为整个内核image创建页表，以使内核在MMU使能后代码能够正确被执行。这部分的虚拟地址被定义为0xffff 0000 0000 0000到0xffff ffff ffff ffff之间，因此它的页表pgd基地址会被放在ttbr1\_el1中。显然idmap段也是内核image的一部分，因此该部分内容会被映射两次，对于该段的物理地址可以通过两个页表中任一对应的虚拟地址访问，MMU会根据虚拟地址的最高位是否为1来确定使用哪一个页表来进行地址转换。

### ３.５　create\_page\_tables创建页表的特点

　　create\_page\_tables函数一共创建了两个页表idmap和init\_pg\_dir，页表描述符保存在bss段之后的位置，其中每级页表占用一个页的空间。假设采用我们上面描述的四级页表，则参考该页表结构（我们这里再贴出以方便查看），由于level 1页表只占一个页，故level 0页表实际上只有一个entry是有效的，同理，level 1和level 2页表也只有一个entry有效。因此它实际能够建立的映射空间范围为2^n \* page\_size，其中n为3级页表的位数，page\_size为页大小，当页大小为4k，三级页表9位时，它能映射的内存为2M。

![](https://pic2.zhimg.com/v2-a2abb673dbbe0b5e08ef20522c532d49_1440w.jpg)

　　显然这个空间太小了，因此在arm64中，当页大小为4k时建立idmap和init\_pg\_dir页表时会使能section maps机制。其原理就是将页表的级数设为比实际配置值少一级，将最后一级页表取消。以上面的配置为例，则level 3 table会被取消，故此时页表能映射的地址空间范围为2M \* 2^n，其中n为2级页表的位数，在4k页表中其值为9，所以在这种情况下能够映射的地址范围为1G，该范围对于初始化阶段各个部分的映射一般就足够了

编辑于 2022-06-01 09:01[产品专员跳槽产品经理，考 PMP 还是NPDP?](https://zhuanlan.zhihu.com/p/684252638)

[如果你是一名产品专员，想要跳槽成为一名产品经理，到底应该考 PMP 还是 NPDP 呢？ \[图片\] 我个人的建议是：先考 PMP。至于为...](https://zhuanlan.zhihu.com/p/684252638)