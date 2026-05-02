---
title: "聊聊SOC启动（一） armv8启动总体流程"
source: "https://zhuanlan.zhihu.com/p/519995589"
author:
  - "[[lgjjeff]]"
published:
created: 2026-05-02
description: "１ 为什么需要引导程序 在遥远的单片机时代，嵌入式设备功能比较单一，每个设备只需要执行一件简单的任务，因此在系统初始化完成后，程序就运行在一个大循环中，此时，系统启动流程和功能代码并没有很严格的区分。…"
tags:
  - "clippings"
---
[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944)

TrustZone 等 213 人赞同了该文章

**１　为什么需要引导程序**

　　在遥远的单片机时代，嵌入式设备功能比较单一，每个设备只需要执行一件简单的任务，因此在系统初始化完成后，程序就运行在一个大循环中，此时，系统启动流程和功能代码并没有很严格的区分。  
　　随着CPU处理能力和芯片制造工艺的不断提升，高性能芯片逐渐演进成了 [SOC](https://zhida.zhihu.com/search?content_id=203686428&content_type=Article&match_order=1&q=SOC&zhida_source=entity) ，单颗芯片上除了CPU外还会集成大量不同功能的IP核，如中断控制器、DSP、GPU、总线控制器、视频处理和编码模块、以及电源管理模块等。为了更好地管理这些软硬件资源，以及为上层用户提供统一的服务和接口，SOC上一般都需要运行操作系统。系统引导程序主要功能就是初始化系统的软硬件状态，为操作系统提供一个合适的软硬件环境，以及加载和启动操作系统映像。

**２　软硬件假定**  
　　为了更好地描述启动流程的细节，后面的章节我们将选取一种主流的硬件平台和软件框架做讨论。硬件平台选用qemu的 [virt machine](https://zhida.zhihu.com/search?content_id=203686428&content_type=Article&match_order=1&q=virt+machine&zhida_source=entity) 平台，其主要硬件配置如下：  
（1）cpu为armv8架构的 [cortex-a53](https://zhida.zhihu.com/search?content_id=203686428&content_type=Article&match_order=1&q=cortex-a53&zhida_source=entity) 核  
（2）中断控制器为 [gicv3](https://zhida.zhihu.com/search?content_id=203686428&content_type=Article&match_order=1&q=gicv3&zhida_source=entity)  
（3）ROM空间128k  
（4）SRAM空间384k  
（5）DDR内存空间3G  
（6）支持semihosting半主机模式  
　　选用qemu是因为其是一种硬件模拟器，可以通过软件模拟的方式实现不同硬件平台的功能，如可以在X86主机上模拟armv8架构的硬件，从而可以在不需要target硬件的情况下进行相关功能的调试。qemu调试环境的搭建可参考以下的链接：  
[lgjjeff：从零开始搭建qemu调试环境](https://zhuanlan.zhihu.com/p/521196386)  
　　其软件架构如下：  
（1）初始启动流程使用arm ATF  
（2）内核启动流程使用 [uboot](https://zhida.zhihu.com/search?content_id=203686428&content_type=Article&match_order=1&q=uboot&zhida_source=entity)  
（3）内核为linux

## ３　启动阶段

　　Armv8的启动流程包含多个阶段，典型地有BL1、BL2、BL31、BL32、BL33，根据需求的不同，这些阶段可以适当地裁剪或添加。为了方便描述，后面我们的讨论将基于以上这些官方定义的标准阶段，它们的源码会被编译成独立的启动镜像，并被保存到特定的存储介质中。由于一般的存储介质（如spi flash、nand flash、emmc、ssd等）都不支持代码的直接执行，因此需要在启动时先将镜像加载到可直接执行代码的存储介质，如SRAM或DDR中，然后运行相关代码。其典型的加载流程如下：

![](https://pic2.zhimg.com/v2-f2e94fbf7d3a938befbeba6b4b00b3f5_1440w.jpg)

1. BL1是启动的第一阶段，该镜像必须要存储在可直接执行的介质中。若芯片支持XIP启动方式，其可被存储在片外可直接执行的介质中（如norflash）。若不支持XIP，则需要存储在芯片的片内ROM中，此时在芯片出厂后该部分代码就将被固化，后续再也不能被修改和升级。若芯片要支持安全启动，则需要将bootrom作为启动时的信任根，此时除调试阶段外，SOC必须禁用XIP。关于安全启动我们将在后面专门介绍
2. BL2镜像由BL1加载，此时DDR还没有被初始化，因此它需要被加载到片内的SRAM中执行，一般在这个阶段会完成DDR的初始化，因此后面的镜像都可以被加载到DDR中。从上图可知，BL31、BL32和BL33都是由BL2加载的，其中BL31和BL32是可选的，若系统不支持 [TRUST OS](https://zhida.zhihu.com/search?content_id=203686428&content_type=Article&match_order=1&q=TRUST+OS&zhida_source=entity) ，则可去掉BL32，若不支持 [EL3](https://zhida.zhihu.com/search?content_id=203686428&content_type=Article&match_order=1&q=EL3&zhida_source=entity) 异常等级及 [secure monitor](https://zhida.zhihu.com/search?content_id=203686428&content_type=Article&match_order=1&q=secure+monitor&zhida_source=entity) ，则可去掉BL31
3. BL33一般指uboot，一般通过它最终启动操作系统内核  
	Armv8架构典型的启动流程如下：
![](https://pic3.zhimg.com/v2-5c74d4f169bd756a5efdd81fa5647276_1440w.jpg)

　　以上流程中我们假定系统支持的最高异常等级为EL3，且支持secure monitor和TRUST OS，同时BL2运行在secure EL1，BL33运行在non secure EL1或non secure EL2状态  
（1）由于armv8架构规定，arm核复位后默认会进入当前系统支持的最高异常等级，因此BL1运行在EL3，它执行完成后会通过异常返回ERET的方式跳转到BL2  
（2 - 3）BL2执行完成后需要跳转到BL31，由于BL31运行在EL3异常等级，而BL2根据需求不同可能运行于secure EL1或EL3。当BL2运行于EL3时可直接通过ERET方式跳转到BL31中，但若其运行在secure EL1时，则只能通过smc异常触发进入EL3异常等级。  
　　显然，此时BL31由于尚未设置其自身的smc异常处理程序而无法直接处理该异常，因此，为了完成跳转流程，BL1需要先代理该异常的处理。因此BL1在退出之前先设置smc异常处理函数，BL2触发smc启动BL31时，BL1捕获该异常并根据BL2传入的参数设置BL31的入口地址和系统初始状态，并通过ERET跳转到BL31的入口地址处执行  
（4）BL32阶段会运行TRUST OS，它运行于secure EL1异常等级，BL31可根据其镜像加载信息设置入口地址以及其它状态，并完成跳转  
（5 - 6）BL32加载完成后将通过SMC返回到BL31，然后由BL31跳转到non secure EL1或non secure EL2以执行BL33

## ４　重要寄存器介绍

　　除了硬件默认设置的寄存器值之外，其它寄存器都需要在系统启动时初始化，有些重要的寄存器在系统启动流程中会影响系统的运行行为，因此下面对它们做一简单介绍。 由于armv8很多寄存器都为不同异常等级提供了对应的bank定义，而其含义比较类似，为了方便介绍，后面介绍中我们都以EL3等级下的定义为例：

### 4.1　SCTLR\_EL3寄存器

　　该寄存器是系统控制寄存器，用于提供系统顶级的状态控制信息，其定义如下图：

![](https://pic2.zhimg.com/v2-c0f50b1a9511b899a99643d13dff04cf_1440w.jpg)

其每个bit的含义可参考armv8参考手册，下面简单介绍一些该寄存器的重要控制位：  
（1）M\[0\]：用于设置系统是否使能EL3下的MMU，若其为1使能MMU，否则禁止MMU  
（2）A\[1\]：用于设置是否使能El3下的对齐检查，若其为1使能对齐检查，否则进制对齐检查  
（3）C\[2\]：用于设置EL3下的数据cache，若其为1使能数据cache，否则禁止数据cache  
（4）I\[12\]：用于设置EL3下的指令cache，若其为1使能指令cache，否则禁止指令cache  
（5）WXN\[19\]：用于设置EL3下写权限内存是否不可执行，若其为1则含有写权限的内存不具有执行权限，否则没有副作用  
（6）EE\[25\]：用于设置EL3的大小端，若其为0数据为小端格式，否则为大端格式

### 4.2　SCR\_EL3寄存器

　　该寄存器用于设置secure相关的属性，且在其它异常等级下不存在bank值，而是用于控制全局状态的。 因此在不同异常等级切换之前，需要先将该寄存器的值设置为目标异常等级所需的值，如从EL3切换到non secure EL1，则需要将其设置为non secure EL1相关的配置。寄存器的定义如下：

![](https://pic3.zhimg.com/v2-eab0fa7c4de7d2235afa1d1a344f5f4e_1440w.jpg)

其重要的bit位如下：  
（1）NS\[0\]：设置EL0 - EL2的secure状态，若其为0表示secure状态，为1表示non secure状态  
（2）IRQ\[1\]：用于设置irq中断路由，当其为1时，irq中断都被路由到EL3处理，当其为0时，若当前运行在EL3下irq中断不触发，否则irq中断路由到当前运行的异常等级，而不路由到EL3  
（3）FIQ\[2\]：用于设置fiq中断路由，当其为1时，fiq中断都被路由到EL3处理，当其为0时，若当前运行在EL3下fiq中断不触发，否则fiq中断路由到当前运行的异常等级，而不路由到EL3  
（4）EA\[3\]：用于设置外部abort和serror路由，当其为1时，外部abort和serror都被路由到EL3处理，当其为0时，若当前运行在EL3下serror不触发，外部abort路由到EL3，否则外部abort和seeror都路由到当前运行的异常等级，而不路由到EL3  
（5）SMD\[7\]：用于设置是否禁用smc异常，若其为1禁用smc，否则使能smc  
（6）HCE\[8\]：用于设置是否禁用hvc异常，若其为1使能hvc，否则禁用hvc  
（7）ST\[11\]：用于设置secure EL1是否将counter的secure timer寄存器访问路由到EL3。若其为1，secure EL1访问counter的secure timer寄存器将会路由到EL3，否则该bit被忽略  
（8）TWI\[12\]：用于设置EL0 – EL2执行WFI时是否陷入EL3。若其为1则任何WFI操作都会陷入EL3，否则该bit被忽略  
（9）TWE\[13\]：用于设置EL0 – EL2执行WFE时是否陷入EL3。若其为1则任何WFE操作都会陷入EL3，否则该bit被忽略

### 4.3　SP\_EL0和SP\_EL3寄存器

　　Armv8包含SP\_EL0和SP\_ELx两种栈指针寄存器，其中SP\_ELx包含SP\_EL1 – SP\_EL3三个bank寄存器。SP\_ELx寄存器为异常栈指针寄存器，即cpu进入异常后将会切到捕获该异常对应EL的SP\_ELx寄存器，如陷入smc异常时栈指针寄存器将会切换到SP\_ELx。SP\_EL0可以被任何异常等级使用，因此在EL1 – EL3中除了异常处理流程外，执行其它代码逻辑时一般都会切换为SP\_EL0栈指针。

### 4.4　SPSR\_EL3和ELR\_EL3寄存器

　　通过中断或异常陷入EL3时，陷入异常之前的PSTATE寄存器将会被保存到SPSR\_EL3寄存器中，当异常处理完成后通过ERET指令返回断点处继续执行之前，将用该寄存器的值恢复PSTATE的值。ELR\_EL3与SPSR\_EL3类似，指示在异常陷入之前该寄存器将用于保存返回地址，异常处理完成后则将该返回地址恢复到PC中。

## ５　镜像跳转方式

　　前面我们聊到镜像跳转时可能需要使用到ERET或SMC指令，下面我们再看下跳转时的细节

### ５.1　Smc异常处理流程

　　smc是armv8支持的异常跳转指令，它用于程序从EL1或EL2跳转到EL3异常等级。其跳转流程如下：

![](https://picx.zhimg.com/v2-93aa12073ce6037b5ba0a6306c2d2953_1440w.jpg)

　　以atf的BL1 smc处理流程为例，EL1调用者通过smc指令陷入到EL3异常，此后CPU将跳转到EL3异常向量表的vector\_entry SynchronousExceptionA64入口处，该函数解析esr\_el3寄存器的异常原因，若其为smc异常，就跳转到smc处理函数smc\_handler64中。smc\_handler64解析通过x0 – x7寄存器传入的参数获取smc命令类型，执行特定的命令处理函数，并通过寄存器x0 – x4返回处理结果。对于异常向量表跳转入口选择原则可参考以下博文：  
[lgjjeff：armv8中断路由机制](https://zhuanlan.zhihu.com/p/520207211)

### ５.2　ERET跳转流程

　　ERET指令用于从异常处理流程中返回，在介绍异常返回流程之前，我们先看一下armv8异常跳转的流程。Armv8触发异常或中断后硬件将会执行以下操作：  
（1）将PSTATE寄存器的内容保存到SPSR\_ELx中，其中x表示异常进入的异常等级，如smc异常将会陷入EL3，因此相应的寄存器就为SPSR\_EL3  
（2）将异常处理完成后需要返回的地址保存在ELR\_ELx中  
（3）设置中断和异常掩码DAIF，以关闭所有中断和异常  
（4）若异常是同步异常或SError中断，异常状态信息将被保存在ESR\_ELx中，该信息可用于分析异常发生的原因  
（5）若异常为指令异常、数据异常或对齐错误等，则触发异常对应的内存地址将被保存到FAR\_ELx寄存器中  
（6）栈指针切换为目标异常等级的栈指针寄存器SP\_ELx  
（7）程序跳转到对应的异常处理入口，执行异常处理程序  
　　在异常执行完成后，可通过ERET指令返回被异常中断程序的断点处继续执行，该指令将使硬件执行以下操作：  
（1）用SPSR\_ELx寄存器的内容恢复PSTATE寄存器  
（2）用ELR\_ELx寄存器的内容恢复PC值  
　　从以上流程可以看到，执行ERET指令后程序的执行流将由SPSR\_ELx和ELR\_ELx决定。因此，我们在执行镜像之间的跳转，只要在ERET之前将ELR\_ELx设置为待跳转镜像的入口地址，并设置正确的SPSR\_ELx即可完成

## ６　内存规划

### ６.1　内存规划原则

　　嵌入式系统的内存一般包含ROM、SRAM和DDR，其中ROM和SRAM位于SOC片内，DDR位于芯片外部。它们的特点如下：  
（1）ROM中的内容断电后不会消失，不仅可用于代码执行，还可以用于镜像存储，但其只有只读权限  
（2）SRAM和DDR中的内容在断电后都会消失，因此只能被用于代码的动态执行，而不能用于镜像存储  
（3）ROM和SRAM都是直接连接总线上，系统上电后即可直接执行。而DDR需要通过DDR phy和DDR controller连接到总线上，因此使用之前必须要先对其执行初始化操作  
　　根据上述各种内存的特点和前面镜像加载启动流程的需求，在内存规划中我们需要考虑以下几个问题：  
（1）由于BL1需要固化到ROM中，且是系统最先执行的，因此ROM地址需要被映射到cpu的重启地址处  
（2）由于ROM是只读的，BL1镜像除了代码段和只读数据段之外还包含可读写数据段，这部分数据在BL1启动时需要从ROM重定位到SRAM中  
（3）由于BL1被固化在ROM中，芯片出产后就不能更改，因此DDR初始化代码不能集成到BL1中。故BL2需要被加载到SRAM中执行，且在BL2中执行DDR初始化流程  
（4）BL2之后的其它镜像既可以运行于SRAM中，也可以运行于DDR中  
（5）从前面的镜像启动流程可知，若BL2运行于secure EL1下，当其执行完成后，需要通过smc再次陷入BL1去执行BL31流程，因此BL2和BL1的地址不能有重叠  
（6）BL31除了执行启动流程外，在系统运行过程中还会以secure monitor的方式驻留，为normal空间的smc异常提供服务历程，以及为normal os和trust os之间提供消息转发、中断路由转发等功能。因此，BL31镜像需要永久驻留内存，在系统启动完成后不能被回收  
（7）与BL31类似，BL32在启动后需要驻留内存为系统提供安全相关服务，因此为其所分配的内存也不能被回收（8）除此之外，BL1、BL2和BL33（一般为uboot）的内存在系统启动完成后都可以被释放给操作系统使用

### ６.2　qemu virt平台内存规划示例

根据以上内存规划原则，qemu virt machine各启动阶段的内存规划如下：

| 类型 | 起始地址 | 结束地址 | 长度 | 是否secure内存 | 作用 |
| --- | --- | --- | --- | --- | --- |
| ROM | 0x00000000 | 0x00020000 | 128k | Yes | BL1（bootrom） |
| SRAM | 0x0e04e000 | 0x0e060000 | 72k | Yes | Bl1（rw data） |
| SRAM | 0x0e000000 | 0x0e001000 | 4k | Yes | Shared ram |
| SRAM | 0x0e01b000 | 0x0e040000 | 148k | Yes | BL2 |
| SRAM | 0x0e040000 | 0x0e060000 | 128k | Yes | BL31 |
| SRAM | 0x0e001000 | 0x0e040000 | 252k | YES | BL32 |
| DDR | 0x60000000 | 0x100000000 | 2.5G | NO | BL33 |

编辑于 2022-10-11 16:07[嵌入式系统](https://www.zhihu.com/topic/19565752)[PMP与ACP的区别是什么？](https://www.zhihu.com/question/331059454/answer/3261178135)

[

先考PMP会好一点。原因：PMP作为ACP的跳板拿到PMP证书后，你会发现考ACP的难度相对会小很多。这是因为PM...

](https://www.zhihu.com/question/331059454/answer/3261178135)