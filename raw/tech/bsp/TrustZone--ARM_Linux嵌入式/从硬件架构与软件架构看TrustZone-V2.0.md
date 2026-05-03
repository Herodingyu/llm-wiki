---
title: "从硬件架构与软件架构看TrustZone-V2.0"
source: "https://zhuanlan.zhihu.com/p/653838241"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！ 前言之前写过一篇 【从硬件架构与软件架构看TrustZone】，当时忘记在CSDN发布了，最近…"
tags:
  - "clippings"
---
18 人赞同了该文章

---

大家好！我是不知名的安全工程师Hkcoco！

欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

获取更多精彩内容哦！！！

---

## 前言

之前写过一篇 [【从硬件架构与软件架构看TrustZone】](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s/LMkV4VnE2hz7R2SATId4Tw) ，当时忘记在CSDN发布了，最近又看到了这篇文章，感觉里面有一些东西是我文章里面不具备的，尤其是关于内存部分。

因此这里转载收藏一下，大家阅读本文之前记得先阅读 [【从硬件架构与软件架构看TrustZone】](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s/LMkV4VnE2hz7R2SATId4Tw) ，收获会更多哦。

## 1\. TrustZone介绍

## 1.1 安全背景

在介绍TrustZone前有必要简单回顾下目前的一些安全手段。

CPU通过内存映射手段给每个进程营造一个单独的地址空间来隔离多个进程的代 码和数据，通过内核空间和用户空间不同的特权级来隔离操作系统和用户进程的代码和数据。 **但由于内存中的代码和数据都是明文，容易被同处于内存中的其它应用偷窥，因此出现了扩展的安全模块，应用将加密数据送往安全模块，由安全模块处理完后再返回结果给相应的应用。**

很多消费电子设备都使用扩展的安全模块来确保数据安全，目前常见的方式有：

- 外部挂接硬件安全模块 数据的处理交由外部的安全模块实现，这些模块能够保护自己的资源和密钥等数据的安全，如SIM卡、各种智能卡或连接到外部的硬件加解密模块等，但其同主芯片的通信线路暴露在外部，容易被监听破解。另外，通信的速率比较低。
- 内部集成硬件安全模块 将外部安全模块的功能集成到芯片内，因此一个芯片上至少有两个核：一个普通核和一个安全核。优点是核与核之间的通信在芯片内部实现，不再暴露在外面。缺点是核之间的通信速度仍然较低，而且单独的安全核性能有限，还会会占用SoC面积，成本较高。

## 1.2 TrustZone

TrustZone是ARM针对消费电子设备设计的一种硬件架构，其目的是为消费电子产品构建一个安全框架来抵御各种可能的攻击。

TrustZone在概念上将SoC的硬件和软件资源划分为安全(Secure World)和非安全(Normal World)两个世界，所有需要保密的操作在安全世界执行（ **如指纹识别、密码处理、数据加解密、安全认证等** ），其余操作在非安全世界执行（如用户操作系统、各种应用程序等）。

### SOC如何支持TrustZone？

设计上，TrustZone并不是采用一刀切的方式让每个芯片厂家都使用同样的实现。总体上以AMBA3 AXI总线为基础，针对不同的应用场景设计了各种安全组件，芯片厂商根据具体的安全需求，选择不同的安全组件来构建他们的TrustZone实现。 其中主要的组件有：

- 必选组件
	- AMBA3 AXI总线，安全机制的基础设施
		- 虚拟化的ARM Core，虚拟安全和非安全核
		- TZPC (TrustZone Protection Controller)，根据需要控制外设的安全特性
		- [TZASC](https://zhida.zhihu.com/search?content_id=233425918&content_type=Article&match_order=1&q=TZASC&zhida_source=entity) (TrustZone Address Space Controller)，对内存进行安全和非安全区域划分和保护
- 可选组件
	- [TZMA](https://zhida.zhihu.com/search?content_id=233425918&content_type=Article&match_order=1&q=TZMA&zhida_source=entity) (TrustZone Memory Adapter)，片上ROM或RAM安全区域和非安全区域的划分和保护
		- AXI-to-APB bridge，桥接APB总线，配合TZPC使APB总线外设支持TrustZone安全特性

除了以上列出的组件外，还有诸如 Level 2 Cache Controller, DMA Controller, Generic Interrupt Controller等。

逻辑上，安全世界中，安全系统的OS提供统一的服务，针对不同的安全需求加载不同的安全应用TA(Trusted Application)。 例如：针对某具体DRM的TA，针对DTCP-IP的TA，针对HDCP 2.0验证的TA等。

![](https://pica.zhimg.com/v2-531c86c1b4ba950eebf5ed1666eb590c_1440w.jpg)

图1. ARM官网对TrustZone介绍的应用示意图

图中左边蓝色部分Rich OS Application Environment(REE)表示用户操作环境，可以运行各种应用，例如电视或手机的用户操作系统，图中右边绿色部分Trusted Execution Envrionment(TEE)表示系统的安全环境，运行Trusted OS，在此基础上执行可信任应用，包括身份验证、授权管理、DRM认证等，这部分隐藏在用户界面背后，独立于用户操作环境，为用户操作环境提供安全服务。
```
可信执行环境（TEE, Trusted Execution Environment）是Global Platform（GP）提出的概念。对应于TEE还有一个REE(Rich Execution Environment)概念，分别对应于安全世界(Secure World)和非安全世界(Non-secure World, Normal World)。

GlobalPlatform（GP）是跨行业的国际标准组织，致力于开发、制定并发布安全芯片的技术标准，以促进多应用产业环境的管理 及其安全、可互操作的业务部署。目标是创建一个标准化的基础架构, 加快安全应用程序及其关联资源的部署，如数据和密钥，同时保护安全应用程序及其关联资源免受软件方面的攻击。
```

## 2\. TrustZone原理和及设计

以下主要从TrustZone的系统架构，处理器架构(包括处理器模型、内存模型和中断模型)和安全隔离机制来介绍TrustZone的设计和工作原理。

## 2.1 系统架构

### AMBA3 AXI system bus

AMBA3 AXI(AMBA3 Advanced eXtensible Interface)系统总线作为TrustZone的基础架构设施，提供了安全世界和非安全世界的隔离机制，确保非安全核只能访问非安全世界的系统资源，而安全核能访问所有资源，因此安全世界的资源不会被非安全世界（或普通世界）所访问。 设计上，TrustZone 在系统总线上针对每一个信道的读写增加了一个额外的控制信号位，这个控制位叫做Non-Secure或者NS位，是AMBA3 AXI总线针对TrustZone作出的最重要、最核心的扩展设计。 这个控制信号针对读和写分别叫做ARPORT\[1\]和AWPORT\[1\]：

- （1）ARPROT\[1\]: 用于读操作(Read transaction), 低表示Secure, 高表示Non-Secure
- （2）AWPROT\[1\]: 用于写操作(Write transaction), 低表示Secure，高表示Non-Secure

总线上的所有主设备(master)在发起新的操作(transaction)时会设置这些信号，总线或从设备(slave)上解析模块会对主设备发起的信号进行辨识，来确保主设备发起的操作在安全上没有违规。

例如：硬件设计上，所有非安全世界的主设备（Non-Secure masters）在操作时必须将信号的NS位置高，而NS位置高又使得其无法访问总线上安全世界的从设备（Secure Slaves），简单来说就是对非安全世界主设备发出的地址信号进行解码时在安全世界中找不到对应的从设备，从而导致操作失败。

```
NS控制信号在AMBA3 AXI总线规范中定义。可以将其看作为原有地址的扩展位，如果原有32为寻址，增加NS可以看成是33位寻址，其中一半的32位物理寻址位于安全世界，另一半32位物理寻址位于非安全世界。
```

当然，非安全世界的主设备尝试访问安全世界的从设备会引发访问错误，可能是SLVERR(slave error)或者DECERR(decode error)，具体的错误依赖于其访问外设的设计或系统总线的配置。

### AMBA3 APB peripheral bus

在TrustZone出现前，ARM的外设基于AMBA2 APB (Advanced Peripheral Bus)总线协议，但是APB总线上不存在类似AXI总线上的NS控制位。为了兼容已经存在的APB总线设计，AMBA3规范中包含了AXI-to-APB bridge组件，这样就确保基于AMBA2 APB的外设同AMBA3 AXI的系统兼容。AXI-to-APB bridge负责管理APB总线设备的安全事宜，其会拒绝不合理的安全请求，保证这些请求不会被转发到相应的外设。

例如：新一代的芯片可以通过增加AXI-to-APB bridge组件来沿用上一代芯片的设计来使其外围设备可以支持TrustZone。

## 2.2 处理器架构

处理器架构上，TrustZone将每个物理核虚拟为两个核，一个非安全核（Non-secure Core, NS Core），运行非安全世界的代码；和另一个安全核（Secure Core），运行安全世界的代码。

两个虚拟的核以基于时间片的方式运行，根据需要实时占用物理核，并通过 [Monitor Mode](https://zhida.zhihu.com/search?content_id=233425918&content_type=Article&match_order=1&q=Monitor+Mode&zhida_source=entity) 在安全世界和非安全世界之间切换，类似同一CPU下的多应用程序环境，不同的是多应用程序环境下操作系统实现的是进程间切换，而Trustzone下的Monitor Mode实现了同一CPU上两个操作系统间的切换。

![](https://picx.zhimg.com/v2-c7b3b85b98b9fb57ce7f095e51653bd3_1440w.jpg)

图2. ARM内核中实现安全扩展的模式

ARM体系结构支持多处理器设计，一个集群中有一到四个处理器。集群中的处理器可以配置为以对称多处理（SMP）模式或非对称多处理（AMP）模式执行。

当处理器在SMP模式下执行时，集群的Snoop控制单元（SCU）将透明地在一级数据缓存中保持在SMP处理器之间共享的数据一致。当处理器以AMP模式执行时，如果需要，执行软件必须手动保持内存一致性。

图3中，系统有4个物理核，每个又分为两个虚拟核（安全核和非安全核）的情况：

![](https://pic3.zhimg.com/v2-1fff5a32f5984f3faf9a364aa49f0620_1440w.jpg)

图3. 多核处理器上的安全核和非安全核

### 2.2.1 系统运行模式的切换

基于TrustZone的系统有三种状态，安全世界、非安全世界和用于二者切换的Monitor Mode。

- 1、协处理器 [CP15](https://zhida.zhihu.com/search?content_id=233425918&content_type=Article&match_order=1&q=CP15&zhida_source=entity) 的寄存器SCR(Secure Configuration Register)有一个NS位用于指示当前处理器位于哪一个世界，该寄存器在非安全世界是不能访问的。
- 2、当CPU处于Monitor Mode时，无论NS位是0还是1，处理器都是在安全世界运行代码。因此Monitor Mode下总是安全世界，但如果此时NS为1，访问CP15的其它寄存器获取到的是其在非安全世界的值。
![](https://pic3.zhimg.com/v2-7de156698611871e54e999a58497f59e_1440w.jpg)

图4. SCR\_EL3寄存器

#### 1\. 非安全世界到Monitor模式的切换

处理器从非安全世界进入Monitor Mode的操作由系统严格控制，而且所有这些操作在Monitor Mode看来都属于异常。

从非安全世界到Monitor Mode的操作可通过以下方式触发：

- 软件执行SMC (Secure Monitor Call)指令 SMC是一个特殊指令，类似于软件中断指令（SWI），通过它来进入mointor模式
- 硬件异常机制的一个子集（换而言之，并非所有硬件异常都可以触发进入Monitor Mode），包括：
	- ♦ IRQ
		- ♦ FIQ
		- ♦ external Data Abort
		- ♦ external Prefetch Abort
- （1）外部中止预取指令外部中止和数据中止，外部中止是访问存储系统时发生，但不被MMU所检测到异常，通常发生在普通世界访问安全世界资源时发生。
- （2）中断，包括FIQ，IRQ。 其中第一种进入monitor模式是无条件的，后面两种情况依赖于SCR寄存器相关配置
	- ＊EA，=0，表示发生外部中止时处理器进入中止模式，=1,表示发生外部中止时处理器进入monitor模式。
		- ＊IRQ，=0，表示发生IRQ时处理器进入中止模式，=1,表示发生IRQ时处理器进入monitor模式。
		- ＊FIQ，=0，表示发生FIQ时处理器进入中止模式，=1,表示发生FIQ时处理器进入monitor模式。

从下面小框框得知：除了软件调用SMC，还有外部各种异常都可以进入monitor模式，不过这些异常需要配置才能使用:

![](https://pic3.zhimg.com/v2-f4fd8f9181df71283a0d87d208c18a28_1440w.jpg)

非安全世界到Monitor模式的切换

#### 2\. Monitor Mode

Monitor Mode内执行的代码依赖于具体的实现，其功能类似于进程切换，不同的是这里是不同模式间CPU状态切换。

通常而言，monitor模式中的代码是做两个虚拟核之间切换时的上下文备份和恢复，软件在Monitor Mode下先保存当前世界的状态，然后恢复下一个世界的状态，操作完成后以从异常返回的方式开始运行下一个世界的代码。

#### 3\. 为什么安全模式和非安全模式不能直接切换？

**非安全世界无权访问CP15的SCR寄存器，所以无法通过设置NS来直接切换到安全世界，只能先转换到Monitor Mode，再到安全世界。**

```
ARM CP15协处理器中引入一个安全配置寄存器（SCR），该寄存器中有一个NS位，NS位表明当前处理器所处的安全状态：0代表安全态，1代表非安全态。安全配置寄存器中的NS位是TrustZone对系统所做的关键扩展，该NS位不仅可以影响CPU内核和内存子系统，还可以影响片内外设的工作。
```

如果软件运行在安全世界(非Monitor Mode)下，通过将CP15的NS位置1，安全世界可以直接跳转到非安全世界，由于此时CPU的流水线和寄存器还遗留了安全世界的数据和设置，非安全模式下的应用可以获取到这些数据，会有极大的安全风险。因此，只建议在Monitor Mode下通过设置NS位来切换到非安全模式。

综上， **安全世界和非安全世界不存在直接的切换，所有切换操作都通过Monitor Mode来执行** 。最简单的情况是，当普通世界的用户模式需要获取安全世界的服务时，首先需要进入到普通世界的特权模式，在该模式下调用SMC， **处理器将进入到monitor模式，monitor模式备份普通世界的上下文** ，然后进入到安全世界的特权模式，此时的运行环境是安全世界的执行环境，此后进入到安全世界的用户模式，执行相应的安全服务。 这里把安全世界的用户模式和特权模式分离，是因为通常特权模式中的执行环境是系统级别的，而用户模式的安全服务是应用级别的，两者的提供者通常是不同的。下图是软件架构的展示。也就是说， **安全世界的执行环境要管理用户模式的服务和应用，并给它们提供编程接口。**

![](https://pic1.zhimg.com/v2-967d689e0e99d451490c5e445ffbf6ac_1440w.jpg)

图5. 安全世界和非安全世界之间的切换方式

### 2.2.2 保护L1内存

#### MMU

```
当CPU访问一个虚拟地址时，这个虚地址被送到MMU翻译，硬件首先把它和TLB中的所有条目同时(并行地)进行比较，如果它的虚页号在TLB中，并且访问没有违反保护位，它的页面会直接从TLB中取出而不去访问页表，从而提高地址转换的效率。
```

对于L1内存，也需要做与两个世界对应的划分，这样，对于有TrustZone的处理器也有两个虚拟的MMU，使得每个世界都有自己本地的转换表，来控制地址映射(两个世界都有一份TTBR0、TTBR1、TTBCR寄存器，因此就会对应两个MMU表)。实际上，转换表的描述里面有一个NS域，对于NS的虚拟核，它会忽略这一位。而对于安全虚拟核，无论NS为0或者1，都可以访问转换表，这也使得安全虚拟核可以访问任何内存。对于TLB而言，TLB的tag可以记录当前的表是哪个世界的（这个不是ARM强制的，即各芯片厂商可以自己另外定义），从而让两个世界的TLB能够共存，这也使得世界之间的切换更加快速，而不用去刷TLB记录。同样的，对于cache，也扩展了一位tag来记录安全状态，从而也使得世界切换时不用刷cache。

尽管MMU有两套，但TBL缓存硬件上只有一套，因此TBL对于两个世界来说是共享的，其通过NS位来标志其每一项具体属于哪一个世界。这样在两个世界间进行切换时不再需要重新刷新TLB，提高执行效率。

```
对于TLB共享并不是硬性规定的，部分芯片在两个世界间切换时可能通过硬件部分或全部刷新TLB。
```

#### Cache

```
cpu和内存之间的缓存机制，用于提高访问速率
```

同TLB类似，硬件上两个世界共享一套Cache，具体的Cache数据属于哪一个世界也由其NS位指定，在世界间切换也不需要刷新Cache。

### 2.2.3 中断

基于TrustZone的处理器有三套异常向量表：

- 一套用于非安全世界，
- 一套用于安全世界，
- 还有一套用于Monitor模式。 复位时，安全世界的中断向量表由处理器的输入信号VINITHI决定，如果未断言，则为0x00000000；如果未断言，则为0xFFFF0000。非安全世界和Monitor模式的中断向量表的基地址未定义，使用前应由软件设置。注意：通过在CP15控制寄存器中设置V位，可以在运行时启用或禁用高向量的使用。如果设置了V位，则始终从0xFFFF0000开始的表中获取处理器异常，而不管VBAR中存储的值如何。V位值的分组，使得安全世界和正常世界向量表能够独立配置。

与前几代的ARM处理器不同的是，这三套中断向量表的基地址在运行时可以通过CP15的寄存器VBAR(Vector Base Address Register)进行修改。

默认情况下，IRQ和FIQ异常发生后系统直接进入Monitor模式，由于IRQ是绝大多数环境下最常见的中断源，因此ARM建议配置IRQ作为非安全世界的中断源，FIQ作为安全世界的中断源。这样配置有两个优点：

- 当处理器运行在非安全世界时，IRQ直接进入非安全世界的处理函数；如果处理器运行在安全世界，当IRQ发生时，会先进入到Monitor模式，然后跳到非安全世界的IRQ处理函数执行
- 仅将FIQ配置为安全世界的中断源，而IRQ保持不变，现有代码仅需做少量修改就可以满足

将IRQ设置为非安全世界的中断源时系统IRQ的切换见图5：

![](https://pica.zhimg.com/v2-b9b265e978bc603f7ef586186aa91aaa_1440w.jpg)

图6. IRQ作为非安全世界的中断源

## 2.3 隔离机制

除了CPU执行时实行安全世界和非安全世界的隔离外，AMBA3 AXI总线提供了外设隔离的基础。

### 2.3.1 基于AXI总线，内存，片内静态RAM ROM是如何隔离的？

TrustZone通过两个设备来保障物理内存的安全

- 一个是TrustZone地址空间控制器 TZASC (TrustZone Address Space Controller) TZASC可以把外部DDR分成多个区域，每个区域可以单独配置为安全或非安全区域，非安全世界的代码和应用只能访问非安全区域。使用TZASC的主要目的就是AXI的从设备分区为几个安全设备，防止非安全事物访问安全设备。ARM的DMC本身不支持创建安全，非安全区，为此需要连接到TZASC上。(注：ZASC只用来支持存储映射设备，不能用于块设备，比如NAND FLASH)
- 一个是TrustZone存储适配器TZMA (TrustZone Memory Adapter) TZMA可以把片上ROM和SRAM隔离出安全和非安全区域。TZMA最大可以将片上存储的低2MB配置为安全区域，其余部分配置为非安全区域。大小划分上，片上安全区域可以在芯片出厂前设置为固定大小，或运行时通过TZPC动态配置。TZMA使用上有些限制，其不适用于外部内存划分，而且也只能配置一个安全区域。

### 2.3.2 基于AXI总线，外设是如何隔离的？

外设上，基于APB总线的设备不支持AXI总线的NS控制信号，所以AXI到APB总线需要AXI-to-APB bridge设备连接，除此之外，还需要TZPC (TrustZone Protection Controller) 来向APB总线上的设备提供类似AXI上的NS控制信号。

由于TZPC可以在运行时动态设置，这就决定了外设的安全特性是动态变化的，例如键盘平时可以作为非安全的输入设备，在输入密码时可以配置为安全设备，只允许安全世界访问。

![](https://pic4.zhimg.com/v2-e50909f8facae44d721a0813ace710c7_1440w.jpg)

图7. 系统内存和外设隔离机制示意图

此图来源于网上，实际上TZPC还连接到片内的ROM/RAM设备上，用于配置片上存储的安全区域。

另外：cache和内存为了支持trustzone安全策略，需要做些扩展。

- cache的tag都增加了NS位，用于标识这一行的安全状态，NS＝0这一行处于安全状态，NS＝1这一行处于非安全状态；
- MMU的TLB的tag增加NSTID位，功能与NS一样；

## 2.4 安全启动

AMBA3 AXI总线机制隔离出安全世界和非安全世界，但这是系统启动之后的事情。如何确保系统本身是安全的呢？这就涉及到系统启动的过程。

系统上电复位后，先从安全世界开始执行。安全世界会对非安全世界的bootloader进行验证，确保非安全世界执行的代码经过授权而没有被篡改过。然后非安全世界的bootloader会加载非安全世界的OS，完成整个系统的启动。

在非安全系统的bootloader加载OS时，仍然需要安全世界对OS的代码进行验证，确保没有被篡改。

![](https://pic3.zhimg.com/v2-866f1351404899c828789e6563f3d1d2_1440w.jpg)

图8. 典型的TruestZone芯片启动流程

整个启动流程跟目前博通平台的安全启动原理基本一致，上电后安全芯片先启动，然后校验主芯片的bootloader，接下来bootloader提交系统的OS和文件系统给BSP进行校验，通过后加载主系统，确保主系统是安全的。

从上电复位开始的整个启动过程中，下一级的安全基于上一级的验证，最终依赖于芯片内置的OTP和安全硬件，逐级的验证构成了整个系统的信任链。信任链中的某一个环节被破坏，都会导致整个系统不安全。

## 3\. 各家TrustZone实现

基于安全考虑，各家TrustZone都实行闭源，关于其实现细节的介绍都较少。

网上能找到少许关于高通方案上TrustZone的介绍：

- 安全世界 QSEE (Qualcomm Secure Execution Environment)
- 非安全世界 HLOS (High Level OS)

整个系统的架构如图8：

![](https://picx.zhimg.com/v2-d0513d959041d494351775f0ffc5b8fb_1440w.jpg)

图8. 高通QSEE系统架构图

## 4\. TrustZone开源项目

- [Arm Trusted Firmware](https://zhida.zhihu.com/search?content_id=233425918&content_type=Article&match_order=1&q=Arm+Trusted+Firmware&zhida_source=entity) 基于ARMv8-A应用处理器，ARM官方提供了一个开源参考实现BL31。 [github.com/ARM-software](https://link.zhihu.com/?target=https%3A//github.com/ARM-software/arm-trusted-firmware)
- Openvirtualization 带有一些商业属性的开源项目，部分TEE实现只有商业版支持 [openvirtualization.org/](https://link.zhihu.com/?target=http%3A//www.openvirtualization.org/)
- Op-Tee Linaro 推出的开源TEE [github.com/OP-TEE](https://link.zhihu.com/?target=https%3A//github.com/OP-TEE)

转载自： [cnblogs.com/jianhua1992](https://link.zhihu.com/?target=https%3A//www.cnblogs.com/jianhua1992/p/16852777.html)

> 本文使用 [Zhihu On VSCode](https://zhuanlan.zhihu.com/p/106057556) 创作并发布

发布于 2023-09-01 23:45・四川[企业建站需要注意什么?](https://www.zhihu.com/question/620687941/answer/3207923299)

[企业建站不只是单纯为了展示，更重要的是引流获客。那么在网站建设的时候就要考虑到网站引流获客的功能，要通过哪些功能来帮助我们增加客户的询盘量。其次，网站开发最好是中澳一家靠...](https://www.zhihu.com/question/620687941/answer/3207923299)