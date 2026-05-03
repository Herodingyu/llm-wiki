---
title: "【芯片DFX】万子长文和你一起探索Arm调试架构"
source: "https://zhuanlan.zhihu.com/p/671255288"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "这是一篇关于CoreSight很重磅的文章，来自知乎：高抛低吸莱斯利。 文章相信会解决你关于Coresight很多的疑惑，在阅读之前由衷的建议先去看以下基础文章，再去展开本文的阅读会让你更有收获。 排版也是个麻烦事！！…"
tags:
  - "clippings"
---
[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770)

81 人赞同了该文章

> 这是一篇关于CoreSight很重磅的文章，来自知乎：高抛低吸莱斯利。  
>   
> 文章相信会解决你关于Coresight很多的疑惑，在阅读之前由衷的建议先去看以下基础文章，再去展开本文的阅读会让你更有收获。  
> 排版也是个麻烦事！！！请点赞~关注~

- **[【芯片DFX】万字长文带你搞懂JTAG的门门道道](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247487624%26idx%3D1%26sn%3Dc173bf77ce731be0c655dd7c3be37e18%26chksm%3Dfa5c4d95cd2bc4838058a093d7b5297d32ac19a727cac75923b4a679063baf4b0bd137c6c45f%26token%3D331536624%26lang%3Dzh_CN%23rd)**
- **[【芯片DFX】ARM：CoreSight、ETM、PTM、ITM、HTM、ETB等常用术语解析](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247486840%26idx%3D1%26sn%3Da1d11f95e7f04126e0aa10f307ec42aa%26chksm%3Dfa5c5065cd2bd973932d647f8ee629b35fdc919f0b0c9d495a12b8256d68fc9027f6f92866ad%26token%3D331536624%26lang%3Dzh_CN%23rd)**
- **[【芯片DFX】Coresight架构——原名：来跟着前辈看看coresight](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247487072%26idx%3D1%26sn%3Df678e7cf45fb61b392673a1e50c4770d%26chksm%3Dfa5c537dcd2bda6ba1ae02fcdf563e6549d4d7fc99f1e7d213b6f6ad423a0bfb34c292c485b0%26token%3D331536624%26lang%3Dzh_CN%23rd)**
- **[【芯片DFX】Coresight的寄存器](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247487155%26idx%3D1%26sn%3D65bd33420bf25f22d6f8c847a9e0453b%26chksm%3Dfa5c53aecd2bdab8373dd5d7188e86e68f83fe7f1282d2f267823e855134d08543d617b1560c%26token%3D331536624%26lang%3Dzh_CN%23rd)**
- **[【芯片DFX】Coresight-APB，ATB总线](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247487155%26idx%3D2%26sn%3D3553464be133446745690ea64f3ab509%26chksm%3Dfa5c53aecd2bdab883bf11356ffc7420788d9f40572a57cabc04e2402d43518241a7fb35f0a7%26token%3D331536624%26lang%3Dzh_CN%23rd)**
- **[【芯片DFX】Coresight-Power requestor](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247487252%26idx%3D1%26sn%3Dd8a59efa6187b9d9ebffa0e4dc6c984b%26chksm%3Dfa5c5209cd2bdb1f36e1db6e06e1466e37c822f3bd8262041a9f643ca50d010f550d4dc6255e%26token%3D331536624%26lang%3Dzh_CN%23rd)**
- **[【芯片DFX】Coresight-channel interface](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247487252%26idx%3D2%26sn%3D444df437895502841e2cfeb60d4f2289%26chksm%3Dfa5c5209cd2bdb1fe952fe833e1707ea9745b28ba09e1dea708218bcdd0eda637753c08e6e07%26token%3D331536624%26lang%3Dzh_CN%23rd)**
- **[【芯片DFX】Coresight-coresight的两大功能](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247487252%26idx%3D3%26sn%3Db498ba45f5e65fee33d1fd823c69d252%26chksm%3Dfa5c5209cd2bdb1f449309bde0d3e4a03c42827145a1a3e9134db91340bbdc214443a97564f9%26token%3D331536624%26lang%3Dzh_CN%23rd)**
- **[【芯片DFX】Coresight-Rom Table](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247487252%26idx%3D4%26sn%3D4927877af443305c6bd9db3b053eaece%26chksm%3Dfa5c5209cd2bdb1f70911028a5eb49188d91cf70d562d20ab89900e7da7a83e92c1b487fa915%26token%3D331536624%26lang%3Dzh_CN%23rd)**
- **[【芯片DFX】Coresight-Soc 400套件](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247487252%26idx%3D5%26sn%3De856c6a10c3c5bbd0024559bd77b158e%26chksm%3Dfa5c5209cd2bdb1f09f8f0689a0b4ede0c7d389abf308064df257b7dbc8e2222924b9791e4ff%26token%3D331536624%26lang%3Dzh_CN%23rd)**

> 那么上车吧！

## Glossary

| Term | Meaning |
| --- | --- |
| ADI | Arm Debug Interface |
| AON | Always-ON |
| AP | Access Port |
| ARM | Architectural Reference Manual |
| BPU | BreakPoint Unit |
| CTI | Cross Trigger Interface |
| DAP | Debug Access Port |
| DP | Debug Port |
| DWT | Data Watchpoint and Trace |
| ED | External Debug |
| ETM | Embedded Trace Macrocell |
| ETE | Embedded Trace Extension |
| PPU | Power Policy Unit |
| SCP | System Control Processor |
| TRM | Technical Reference Manual |

## Perface

Arm对debug架构的定义分散在三个文档中：

- Arm ARM\[1\]作为指令集手册， **对处理器内部的debug/trace功能进行了定义** ，这也是debug调试架构的基石
- Coresight\[2\] 架构定义了与Arm处理器相兼容 **的debug/trace行为** ， **本质上是Arm架构中debug feature的外延**
- ADI\[3\]架构定义了 **Arm-based SoC与外部的物理连接（JTAG/SWD）规** 范

> ADI—Arm Debug Interface  
>   
> Coresight这个名字的含义意在给用户提供一种对内核的可见性（visibility）。  
>   
> 包括Arm自己的旧版设计套件 [RealView](https://zhida.zhihu.com/search?content_id=237297848&content_type=Article&match_order=1&q=RealView&zhida_source=entity) ，以及RISC-V阵营的 [Sifive Insight](https://zhida.zhihu.com/search?content_id=237297848&content_type=Article&match_order=1&q=Sifive+Insight&zhida_source=entity) 都表达了同样的含义

熟悉这三个文档的读者会觉得这三者看起来分工明确，能够很好地达成在SoC中构建一个统一的Arm-style debug infrastructure的目的。

然而站在一个初学者的角度，这种分散的架构可能让人摸不着头脑。

特别是，在制订一个独立于Arm ARM的debug文档的前提下，Arm提出了两个而不是一个统一的文档在直觉上令人费解。

再考虑到Coresight与ADI的架构文档有着一定篇幅的重复，以及两者混乱的兼容关系，

这种费解只会进一步加深。这个局面在一定程度上是由于Coresight与ADI的在历史上的出现顺序决定的。

要明确的一点是，Coresight的出现是为了 **解决首先在ARM11被引入的多核架构调试的问题。**

在此之前，由Arm架构定义的debug feature已经足够应付单核调试场景， **届时的debug interface是完全基于JTAG scan chain的做法** 。也就是说， **ADI在Coresight没有问世之前就已经存在。**

当Coresight出现之后，Arm为了 **做到使ADI做到向前兼容** ，没有将其简单地合并进Coresight。

这样一来，ADI在架构上就 **兼容** 了新兴的多核Coresight架构与ARM7, ARM9那些所谓的legacy scan chain-based（非Coresight）架构。

**前者使用ADI中的MEM-AP访问** ， **后者则使用JTAG-AP访问** ，这也ADI文档中AP拓扑结构图的含义之一。

![](https://pic1.zhimg.com/v2-4401c91bf9dece81cf5898944a28771a_1440w.jpg)

Figure 0-1 DAP topology in ADI

> 原来是这个原因！

**反过来，Coresight架构的范畴是包含了一个符合ADI架构的DAP实现在内的。**

即，Coresight架构规定必须使用ADI complaint的port对其组件进行调试，而ADI架构则表明ADI架构的实现不一定是用来调试Coresight组件。

下面以一个简化SoC中的debug function框图来表明Arm ARM/Coresight/ADI这三种架构在一个真实系统中的所负责的范围，以及它们之间的关系。

![](https://picx.zhimg.com/v2-85ff49fb4474caa744ce44351d919007_1440w.jpg)

Figure 0-2 Debug architecture in a real system

> 橙色是AD define

如图注所示，这张示意图中的三种主要颜色分别代表了三种架构定义的实现。

Core内的debug/trace unit function是由Arm ARM定义的， **如debug breakpoint/watchpoint或是ETM/ETE的实现** ，但它们在图中的特殊标记表明它们\*\*具备Coresight所定义的一系列寄存器（PIDx/CIDx）\*\*来支持Coresight系统的topology detection。

另一类用拼接色来表示的则是表明两种架构中都对该部件有相关的描述。

对于CTI在不同的地方有不同的着色方案，我想表达的是，CTI本身虽然是一种模块化、可复用的设计，但具体的使用方法却是与被部署的设计息息相关的。

例如在A Core中，它一般会被配置为debug request/restart等几个固定的事件。

而在非Arm架构的Processing Unit中，则需要设计者自行将感兴趣的信号与其连接。

这也是为什么图中Heterogeneous Cluster的CTI与Arm ARM无关。刚刚有讲到，上图中的部件均是架构的具体实现。

对应Arm的产品线，我们可以认为Coresight架构的实现是Coresight SoC系列IP，而ADI架构的实现则是DP/AP（也被包含在Coresight SoC中）。

**也就是图中虚线框起来的部分，都属于Coresight SoC组件的范畴** ，这个package往往与core一起license给客户——对应地，core是Arm架构的实现。

Arm架构中的debug feature与处理器无论在结构还是行为上都有着耦合关系，而Coresight & ADI更像是从一个个给定的function unit逆向出来的架构。

本文接下来分别在Arm debug feature以及Coresight & ADI这两个层面中来讨论一些我觉得值得注意的或是曾经困扰过我的问题。

## 1 Arm Debug Feature

## 1.1 debug register interface

**各种形式的debug的最终目的都是获取core的状态，控制core的行为。**

这都是通过对core内的 **debug register进行读写** 来实现的。

因此首先讨论debug register interface，主要回答两个问题：

- 这些register是如何被访问的？
- 可以被谁访问？

对于硬件工程师来说，直觉上首先会想到core内的相关寄存器需要能够被外部调试器访问，Arm称之为external debug interface，这是通过调试器控制DAP向core发起APB transfer来实现的。

**由于调试器此时访问的并不是内存区域** ，因此 **需要一个机制来获取debug register的地址** ， **这个机制就是ROM Table。**

ROM Table存放组件地址的字段是一组只读的寄存器堆， **每个entry保存着一个\[x:12\]的地址用以指向某一个组件。**

即每一个组件占用4KB的地址空间， **这个地址空间是用来存放这个组件的寄存器的。**

core内每一个具有 external debug interface 的unit，如debug/trace/pmu等，都分别作为一个组件被索引。

下面以访问一个DynamIQ Cluster内的Cortex-A core为例来说明这种机制：

![](https://pic4.zhimg.com/v2-087890d1f3b96f7c29f54883fb383331_1440w.jpg)

Figure 1-1 Debug components in DynamIQ Cluster

图中， **与DP相连接的ROM Table称为DP ROM** ，它一般处于地址0x0的位置，用以发现系统中 **的MEM-APs** 。

针对访问Cluster的这条通路（对于A core一般使用APB-AP）， **会另有一个Cluster level ROM Table** ，它的地址等于它所在的APB-AP基地址+0 offset， **用以发现这个APB-AP子系统内的debug资源** 。

上图是一个简化的示意，在实际的A core SoC中，从DP ROM到最终的Cluster level ROM Table中可能有更多的嵌套，下图是一个来自Arm Corstone SSE-710 Subsystem\[4\]的例子：

![](https://pic4.zhimg.com/v2-9ec46c19a649e63206abc8f1b1429175_1440w.jpg)

Figure 1-2 ROM table structure of SSE-710

我将图1-1中DP ROM，APB-AP和Cluster level ROM Table所对应的位置在上中进行了标注。

SSE-710中的"Host"代指AP (Application Processor)。 从DP到Host CPU这条通路上，与图1-1相比，多出Host ROM和EXTDBGROM。

Host ROM在指向Cluster level ROM Table之外，还可以指向AP subsystem中的Coresight组件（大致是图0-2虚线框中的绿色部分）；

EXTDBGROM则是在DP ROM和MEM-APs中间插了一级，使DP ROM除了可以指向MEM-APs之外，还可以指向GPIO或APBCOM（与secure debug相关，下文介绍）。

Arm core的TRM中会给出external debug memory map。以A53\[5\]为例，它在MPcore配置下最多有4个core：

![](https://pic2.zhimg.com/v2-aac58d62908287bbc0cd2dc9f9a4c621_1440w.jpg)

Figure 1-3 Cortex-A53 external debug memory map

接下来讨论debug register的另一种接口。考虑对图1-1做一个简单的补充：从interconnect出一个APB口绕回APB-AP所访问的子系统的入口，如下图。

![](https://pic2.zhimg.com/v2-a05c9acca017c487beb8af10581e33ad_1440w.jpg)

Figure 1-4 Debug components in DynamIQ Cluster

这种路由为core提供了对某个子系（也可以扩展到整个SoC）内debug资源的可见性， **Arm称之为 memory-mapped interface。**

本质上这种接口 **只是复用了external debug interface** ，对于debug register本身并没有增加额外的接口。

**通过将external debug memory map映射到系统的memory map中，core可以在不依赖外部调试器的情况下访问这些debug register。**

观察集成了A53的Juno SoC\[6\]的memory map，可以看到从0x2300\_0000地址开始与A53的external debug memory map是对的上的，一点小区别是Juno SoC在A53 reserve区域插了一些Coresight组件进去。

![](https://pic2.zhimg.com/v2-e73d3779acb8c9bb0f83f100dc50715f_1440w.jpg)

Figure 1-5 Arm Juno SoC memory map

external debug memory map在硬件层面对on-chip debug提供了支持，而在实际的on-chip debug中，Arm更强调（区别于external debug的）另一种调试模型，即self-hosted debug。

这个模型在下一小节将进行单独讨论，此处阐述它对debug register interface产生的影响——引入了第三种接口，一般称为 system register interface，即系统寄存器接口。

系统寄存器是提供Arm架构功能的具象实体，通过专用指令进行访问。 **system register interface 为software debugger访问debug资源提供了更便捷的路径** ，考虑到debug register的敏感性，大部分具备系统寄存器接口的debug register都 **要求EL1及其以上的特权级别** 。

因此此处的"software debugger"一般 **也代指内核层面的debug agent** ，如linux gdb.

## 1.2 self-hosted debug

如上文所述，self-hosted debug是Arm架构定义的两种调试模型之一。

这两种模型并不是面对同一需求可以互相替换的不同选择，它们一般被认为使用在不同的场景中：

### 1-external debug

external debug 主要被使用在bare metal的调试场景中，用于硬件debug或是软件的bring-up。

使用external debug需要将芯片通过IO连接到 **一个debug probe** (JLink/DSTREAM)，进而连接到一台Host主机，以运行在主机上的开发环境作为debugger。

> "Bare metal"的调试场景通常指的是一种无虚拟化或无操作系统的调试环境。在这种环境中，调试工具可以直接访问硬件资源，如内存、处理器和输入/输出设备等，以进行更接近实际的调试。  
>   
> 在Bare metal调试场景中，调试器可以直接与硬件交互，无需通过虚拟化层或操作系统进行转换。这使得调试过程更加高效，并且可以更好地模拟实际运行环境中的硬件行为。  
>   
> Bare metal调试通常用于嵌入式系统开发、低级硬件调试、驱动程序开发等领域。在这种环境中，开发人员可以直接访问硬件资源，对系统进行底层调试和优化，以确保系统在真实环境中的稳定性和性能。  
>   
> 需要注意的是，Bare metal调试需要特殊的硬件和软件工具，如JTAG调试器、串口调试器等，以便访问和控制硬件资源。同时，由于Bare metal调试需要直接与硬件交互，因此需要一定的技术知识和经验，以避免不正确的操作导致硬件损坏或系统不稳定。

### 2-self-hosted deug

self-hosted deug 主要被使用在已经部署OS的系统中， **用于软件debug** 。使用self-hosted deug无需构建芯片与外部的连接，以内核/exception handler作为debugger。

包括我在内的硬件工程师普遍对前者更熟悉一些，因为我们在一款芯片的开发周期中处于比较「靠左」的位置。

当SoC被OEM集成时，极有可能不会留出JTAG接口（有些开发板甚至都没有），因此使软件开发者在不借助debug probe的情况下进行on-chip debug是必要的。

需要注意这里所说的on-chip debug并不代表不需要借助任何外部设备。Arm在介绍self-hosted debug时常以基于gdb的remote debug为例\[7\]，如下图。

![](https://pic1.zhimg.com/v2-3ba9690ad7b7f8f685349944827b29d4_1440w.jpg)

Figure 1-6 Self-hosted debug model

在这种情况下，除了被调试的debug target外，还需要一台额外的host主机来协助调试工作。

---

两种调试模型 **最本质的差异在于debug event** （如一次breakpoint match）触发后的不同行为：

- 在external debug模型下，core会 **进入halt状态** ，将控制权交给external debugger，后者此时可以通过DCC寄存器获取core的内部状态；

> 通过DCC寄存器进行调试，可以修改架构寄存器的状态、读写memory等。DCC是调试通信通道（debug communication channel）的简称，它允许PE（处理器单元）与外部调试器进行通信。在调试状态下，调试器使用ITR（指令传递寄存器）通过外部调试接口将指令传递给PE，使其执行指令。使用通过ITR执行的指令，调试器可以读写架构寄存器，例如通用目的寄存器、系统寄存器和浮点寄存器，也可以读写memory。

- 而在self-hosted deug模型下， **core会上报异常并陷入对应的EL级别进行异常处理。**

在debug exception routing上，Arm定义了多种细分模型：

- Application debugging：EL0 exception trap to EL1 debugger
- Kernel debugging：EL0/EL1 exception trap to EL1 debugger
- OS debugging：EL0/EL1 exception trap to EL2 debugger
- Hypervisor debugging：EL0/EL1/EL2 exception trap to EL2 debugger

据我所知，基于gdb的两种remote调试方法，即host gdb+target gdbserver（如图1-6）和host gdb+target kgdb可以分别对应上Application debugging和Kernel debugging这两种模型。

其中，gdbserver作为用户态程序，通过内核的ptrace接口陷入内核；而kgdb本身运行在内核态，具备直接调试内核代码的能力。

kgdb在2.6.25之后被合并进内核，并且需要架构的支持。

我们以self-hosted debug模型下的单步调试机制为例，简单追溯一下kgdb与Arm架构代码之间的层次关系。

与external debug类似，Arm ARM中也给self-hosted debug的单步调试画了一张状态机的图，即下面的图1-7。

MDSCR\_EL1.SS是单步调试的全局使能，而PSTATE.SS是一个状态位。从图中可以看出的是，当core正在处于（由一个debug event，比如breakpoint，触发的）debug exception中时，可以通过设置MDSCR\_EL1.SS和PSTATE.SS都为1来让core在退出exception时进入单步调试，并在执行完一条指令后并重新触发debug exception，这就完成了一次单步调试。

Arm架构中在external debug和self-hosted debug两种模型下都提供单步调试机制，对于一次单步调试过程，两种机制对比如下：

> **对于software step：** PE in exception -> 配置software step -> exception return -> 执行一条指令 -> software step exception -> re-enty exception  
>   
> **对于halting step：** PE in halt state -> 配置halting step -> exit halt state -> 执行一条指令 -> halting step debug event -> re-entry halt state

![](https://pic1.zhimg.com/v2-3c978876769437306eef27ad537e87e2_1440w.jpg)

Figure 1-7 Software step state machine

对应地，来看linux kernel的实现。先给出一张总体关系图：

![](https://picx.zhimg.com/v2-70957d709d3476288439c2d9e39eba39_1440w.jpg)

kernel/debug 目录下存放着不区分架构的gdb顶层（底层？）实现。

kernel/debug/gdbstub.c 文件中的gdb\_serial\_stub()函数提供了remote gdb通信中command/packet（c for continue, s for step, etc.）的处理功能，这里的场景是调试停在某处并等待用户在终端输入命令， **实际上对应上段中core处于debug exception的状态。**

对s命令的处理，gdb\_serial\_stub() 会调用架构定义的kgdb\_arch\_handle\_exception() 函数，因此这个函数会来到 arch/arm/kernel 目录下。

kgdb\_arch\_handle\_exception() 主要做了两件事来完成s命令：

一是利用kgdb\_arch\_update\_addr() 尝试 **从命令packet中获取数据来更新PC，这里看注释很容易产生一个误解，PC不是在exception entry时复制到ELR吗，怎么反过来了呢？**

这是由于注释中提到的PC指的是内核堆栈中的处理器状态，而不是硬件意义上的PC寄存器，这里的linux regs实际上是pt\_regs这个struct。

所以此处的意图是通过更改pt\_regs.pc来更改ELR中的内容，并在exception return时跳到ELR指定的地址，对应了单步调试状态机中 "Programs the ELR\_ELx..." 这一步。

但对于单步调试来说，一般情况下并不会改写PC。

接下来来到函数的第二部分，即调用kernel\_enable\_single\_step() 来使能单步调试。

通过单步调试状态机可以看出，使能的过程是通过访问system register来实现的，因此这一步是架构定义的。

这个函数的实现在同目录的另一个文件debug-monitors.c中。kernel\_enable\_single\_step() 的实现就比较明了了，即把MDSCR.SS和PSTATE.SS（即SPSR.SS）都设为1，使得core能从一个inactive的exception中return到active-not-pending的状态。

至于那个enable\_debug\_monitors() 的功能，目前看起来不明所以，这个以后研究明白再来补上。

## 1.3 debug over powerdown

有些读者可能会对图1-4中的拓扑产生疑惑，什么是DebugBlock？

它实际上是一个独立于cpu cluster的功能单元， **这种将部分debug功能从cluster中分离出去的做法随着DynamIQ开始使用** ，目的是更好地支持debug over powerdown. 那么，何谓「更好地支持」？

前序版本中的debug架构有什么题？这是这一小节主要讨论的问题。

![](https://pic2.zhimg.com/v2-a05c9acca017c487beb8af10581e33ad_1440w.jpg)

Figure 1-4 Debug components in DynamIQ Cluster

早在Arm ARM v7-A的debug章节中，就已经出现对powerdown support的介绍。

它的含义并不是在core powerdown时进行调试——这是无论如何也做不到的——而是 **可以支持对具备电源关断能力的软件（or，运行在具备电源关断能力的OS上的软件）的调试。**

所谓「支持」指的是 **保存一些关键debug register的内容** ， **如与上下电过程相关的控制位或是供外部debugger识别用的信息。**

这些信息的丢失将使断电前后的debug设置不一致，\*\*亦或是使在断电时使外部debugger丢失与cpu的连接，\*\*从而打断一个完整的调试过程。

由于OSPM对power domain所采取的行动往往是脱离调试者的控制的，如果不具备powerdown support， **难免会出现在未达到调试目的之前就被powerdown频繁地打断调试过程的情况。**

> 并不是所有debug register都需要做powerdown的保存。对于那些不会参与到上下电流程中的信息，依赖于OS Save and Restore过程来保证不会丢失。

v7-A通过区分core power domain和debug power domain来实现这种支持，下图中的Core domain Vdd和Debug domain Vdd示意了这种区分，需要保存的寄存器被放置在Debug power domain。

同时由于两个domain可以被分别gating，容易想到可以通过debug domain请求core domain上电，三个加粗的信号与这一机制相关。

![](https://pic4.zhimg.com/v2-352ef45de39b18b934599002443068cd_1440w.jpg)

Figure 1-9 Recommended power domain split between core and debug power domains

这种解决方式看起来万事大吉，以至于到早期的v8-A中仍在沿用，那为什么会搞出DebugBlock这个东西呢？Arm并没有对此给出过解释，在此我仅根据公开资料做一些推测。

Arm Community有一篇关于Juno SoC的博客\[8\]，第一部分讲的是debugger连接不稳定的问题。

Juno是采用A72/A57+A53的配置，属于我所说的「早期的v8-A」，查阅它们的TRM，可以发现是均支持独立的debug power domain的。那为什么还会发生这个问题呢？

这个博客提了一句，这个问题与linaro 14.10中cpuidle enable有关。cpuidle是OSPM中的一个概念，即OS将没有任务的cpu置入低功耗状态，对应到硬件power control实现，可能有retention/powerdown等不同的处理方式。

而在2014年前后，cluster idling\[9\]被正式合并到linux的power management中。所谓cluster idling，就是指传统cpuidle对arm big.LITTLE拓扑的一次修正，使其能够在一个cluster内所有core都idle后有机会将cluster idle.

然而，对于一个包含cores+L2/3 cache+misc. (debug for example) 的cluster模型，虽然cluster内的一些逻辑可能在硬件实现角度可以单独power gating，但OSPM在调控过程中未必有与之相匹配的粒度。

对于Juno SoC而言，我认为cluster idling可能直接导致了它设计在cluster内部的debug power domain随着cluster进入idle一起掉电，从而导致了前面所说的问题。

因此DebugBlock出现了。它算不上是多大的改动，因为里面的东西还是那些，只不过在hierarchy上完全脱离cluster. 像A55 TRM中描述的：

> It allows you to put the DebugBlock in a separate power domain and place it physically with other CoreSight logic in the SoC, rather than close to the cluster.

当然，TRM中也提到：

> If the DebugBlock is in the same power domain as the core, then debug over powerdown is not supported.

从这里也可以看出，Powerdown support并不是必须的。这个feature总体的思路就是v7-A中划分power domain的那一套，当这种划分出了某种问题时，就变换一个方式再次使这种划分成为可能。

## 2 Coresight & ADI

由于大部分Coresight & ADI的定义都能在Coresight SoC中找到对应的实例参考，所以首先对它进行背景介绍。

Arm目前提供两个版本的Coresight SoC，分别是400系列和600系列。

它们分别代表对 **不同版本的Coresight & ADI架构的实现** ：

- SoC-400实现了Coresight v2以及ADI v5.2
- SoC-600则实现了Coresight v3以及ADI v6.

| Year | Coresight SoC | Coresight arch | ADI arch |  |  |  |  |  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2012 | SoC-400 (r1p0) | v2.0 | v5.2 |  |  |  |  |  |  |
| 2017 | SoC-600 | v3.0 | v6.0 |  |  |  |  |  |  |

Arm core本身同样需要兼容Coresight & ADI架构。与SoC-600同时更新Coresight v3以及ADI v6不同，ADIv6在Arm core中的兼容会更晚些，直到v9-A时才开始。

需要注意，没有兼容ADIv6仅仅代表这些core在设计时没有兼容ADIv6中某些新型拓扑，但SoC-600是向后兼容的，可以结合任意Arm core进行设计。

| Year | A-series core | Coresight arch | ADI arch |
| --- | --- | --- | --- |
| 2016 | A73 | v2.0 | v5.2 |
| 2017 | A75/A55 | v3.0 | v5.2 |
| 2018 | A76 | v3.0 | v5.2 |
| 2019 | A77 | v3.0 | v5.2 |
| 2020 | A78 | v3.0 | v5.2 |
| 2021 | A710/510 | v3.0 | v6.0 |

## 2.1 DAP topology

所谓的DAP拓扑指的 **就是DP和一个或多个AP如何组成DAP** ，以及DAP如何接入cpu subsystem。ADIv6给DAP拓扑带来了一些细微但可能影响较大的变化，本小节主要聚焦于这些变化

一些关于Coresight SoC-600的新闻稿\[10\]上声称，这个套件的发布带来了「下一代」调试解决方案。

结合下面这张图，我们了解到，所谓的「下一代」调试，指的是不依赖于传统JTAG/SWD接口（复用functional ports如图中的PCIe/USB）就能使debugger接入调试系统的能力。

![](https://pica.zhimg.com/v2-d04ecea4528bda353a943826039c979c_1440w.jpg)

Figure 2-1 Coresight SoC-600

然而，如果翻开SoC-600或是ADIv6的TRM，会发现找不到任何为适配新端口所设计的新组件—— **新架构目前只是对DP/AP的结构进行了调整** ，为不依赖JTAG/SWD调试端口的调试提供了系统支持。

参考ADIv6中的这段话：

> ADIv6 permits debug links other than JTAG or SWD to access the AP layer, so that multiple different links can be used to access debug functionality.

"A1.3 The debug link" 这一节对ADIv6的改进做了概述。debug link本身是个新词，代指不局限于DP的，更广义的物理接口与协议层的实现。

A1.3的第一句话就提到，debug link提供了对AP的memory-mapped视角——这与ADIv5.2的设计不完全一致，我们首先来看ADIv5.2中DP to AP的访问方式。

DP如何访问AP，本质上取决于AP的programmer's model，也就是AP寄存器的设计。通过C2.5节的这个表格我们得知，ADIv5.2中的AP（即APv1）寄存器处在一个8bit宽的地址空间中。

![](https://pic4.zhimg.com/v2-e81084a9dbcff565816b8622bb64f72b_1440w.jpg)

Figure 2-2 MEM-AP programmer's model in ADIv5.2

ADIv5.2 DP（DPv2）通过SELECT.APBANKSEL\[7:4\]位结合一次APACC request的A\[3:2\]位，对这个8bit地址空间内的寄存器进行寻址。

同时，SELECT寄存器的高位APSEL\[31:24\]用来选择不同的AP。下图给出了这套访问机制的示意。图中高亮的部分共同构成了DP发出的地址。

![](https://pica.zhimg.com/v2-90684c0b00dac2c5a920fa29c5844d4c_1440w.jpg)

Figure 2-3 Structure of an ADIv6 implementation

通过上图可以看出，对于一个DP+多个AP的系统，需要一个APSEL decoder作为中间层。这个中间层在Coresight SoC-400中也有实际的ip与其对应，即DAPBUS interconnect，下图是它的信号连接图。

Slave port这一侧dapcaddrs\[15:2\]的位宽刚好等于APSEL+APBANKSEL+A的宽度；master port一侧dapcaddrm\[7:2\]的位宽则是APBANKSEL+A的宽度。

![](https://pic1.zhimg.com/v2-d2b416a64f93aec58eda6df17005574c_1440w.jpg)

Figure 2-4 Interface of DAPBUS

接下来对照着看ADIv6的访问方式。在同样的章节位置，我们看到APv2的寄存器分布在一个4KB的地址空间内。如果你继续往下翻，会看到0xF00开始的Coresight寄存器段。

这看起来非常熟悉——在ADIv6中，AP是作为一个debug/coresight component被看待的，这就解释了上文中「debug link提供了对AP的memory-mapped视角」的含义。

同时，本着Coresight架构中对coresight components的发现原则，一个与AP所在层级并列的ROM table需要被提供，并指向这些AP。你可以在图2-1中发现这个ROM table，这在ADIv5.2的系统中是不存在的。

![](https://pic4.zhimg.com/v2-92912d1940adae02faa5167291f9111f_1440w.jpg)

Figure 2-5 MEM-AP programmer's model in ADIv6

ADIv6 DP ( DPv3 ) 将SELECT和SELECT1两个寄存器的ADDR位拼接形成一个\[63:4\]的地址高位，再结合APACC request的A\[3:2\]位形成最终的地址，这里图就省略了，与2-3类似。对于ADIv6兼容的系统，Arm提供的DAP拓扑是DP+APBIC+AP。

APBIC相比于DAPBUS的一个显著区别是支持最多4个slave port，也就是在DP这一侧允许更多的agent连接，这使得其他agent可以使用与external debug完全相同的视角来访问所有AP。

下图示意了两种DAP拓扑的区别，其中SoC-600绕回了一个interconnect的访问端口作为另一个debug agent。

![](https://pic2.zhimg.com/v2-aa4ab8612579bbd901134b39acc861fd_1440w.jpg)

Figure 2-6 Comparison between SoC-400 Series and SoC-600

PS：使用Coresight SoC-400的系统同样支持将interconnect绕回，只不过需要绕到AP下级的位置，无法访问这个DAP中的其他AP（以及其他AP所连接的子系统），会比较像图1-4中的样子。

## 2.2 power control

在图1-9中，已经可以看到一点debug power control的线索，其主要实现方式是将DP/AP寄存器的某些位作为power request信号输出到power controller。

除了简单的上下电请求外，debug power control还可以指示power controller进入emulated powerdown，这是一种通过关停时钟或者声明复位来代替真正电源关断的电源模式。

总体来说，debug power control从最低限度上保证调试工作能够独立地正确完成，即不用借助其他请求电源的渠道。

至于为什么是最低限度，参考debug over powerdown那一小节提到的Juno errata. 从层次上看，debug power control有两级，本文中给这两级分别命名为 DP power control 和 Granular power control。

其中DP power control是ADI文档中用了一定篇幅所描述的，某种程度上是「正统的」power control机制。

ADI在这里对系统的power domain作出三级划分，即：

- Always-on power domain
- System power domain
- Debug power domain

System/Debug power domain可以粗略地与图1-9中的core/debug power doamain进行对应。

DP寄存器的CTRL/STAT\[31:28\]代表了两对握手信号：

CxxxPWRUPREQ/ACK. 这两对握手信号与直接或（通过SCP）间接地与PPU相连接，达到通过DP进行power control的目的。

ACK信号由PPU返回，每一对信号都遵循基本的四相握手，如下图，debugger需要结合REQ/ACK两个信号的状态来判断目标power domain的状态。

由于DP能够达成对System/Debug power domain的power control，可以想到，DP本身一定是处于更高级的power domain中——一般情况下摆放在AON doamin。

![](https://pica.zhimg.com/v2-d3435ee06a17453468e4237de998f60e_1440w.jpg)

Figure 2-7 Powerup request and acknowledgement timing

在一个多核系统中，system power domain会进一步切分，使每个核的电源可以独立的关断或开启。

在这种模型下，debug power control也理应能够对此进行利用，这就引入了Granular power control. 在Coresight v3 & ADIv6之前，这种机制以一个独立的power requestor的形式实现；在新的架构中，Granular power control被整合进了ROM table，下面分别进行介绍。

在Coresight v2的附录中，可以找到power requestor这一章节。这个power requestor作为一个coresight component，拥有一个4KB的地址空间，其中两个32-bit的寄存器CDBGPWRUPREQ和CDBGPWRUPACK分别构成对最多32个power domain的power req/ack。

通过寄存器名字我们就能知道，此处power control的机制与DP处的是一模一样的，在一些手册中甚至两处信号的名字都完全一样，这也是容易给人造成困惑的地方。

在SoC-400中，有一个具象的Granular Power Requester (GPR) 模块与power requestor这个模型对应。在拓扑上，这个GPR应该挂在MEM-AP后级。然而，据我了解，GPR在Arm的产品中很少出现，我只在一些Cortex-M core based subsystem中找到了它们。

在下图中的SSE-200\[11\]是一个基于双核M33的子系统，它使用位于PD\_DEBUG domain的GPR产生用于控制两个CPU domain的power control信号。

![](https://pic2.zhimg.com/v2-5f8ad78ceaed8793425dda5613adcbb5_1440w.jpg)

Figure 2-8 Power system of SSE-200

> 注：图中的power domain模型与前面介绍的v7-A power domai模型存在差异。  
>   
> M core的结构比较简单和扁平，M arch中也不存在external debug的概念，PD\_CPUDBG中摆放的是BPU、DWT等unit。  
>   
> 对于A core而言，在存在独立的debug power domain时，对于每一个core，PD\_DEBUG面对的会是一个单独的PD\_CPUCORE ( 即没有PD\_CPUDBG )

关于GPR较少出现的原因，我有一个猜想：GPR可能只在多核M core的系统中有用武之地。

这是由于对于A core而言，Arm从v7.1 debug开始，就在DBGPRCR这个debug register中添加了COREPURQ这个bit，驱动external debug interface上的DBGPWRUPREQ信号，用以请求power。

所以，对于一个实现了debug power domain的A core系统，DBGPRCR.COREPURQ就可以用来充当Granular power control的作用，免去了额外引入GPR的必要。

当然，或许Arm觉得这个机制放在ED register里也不算太好，以至于它在ADIv6中采取GPR放进了ROM table的做法，并在v8-A的EDPRCR (ED mapping of DBGPRCR) 中删除了COREPURQ这个bit。

![](https://pica.zhimg.com/v2-243bd2699c73532d6ccce08a96ba62d0_1440w.jpg)

Figure 2-9 DBGPRCR bit field

将GPR合并进ROM table，这里的潜台词是修改ROM table的格式使其能够起到GPR的作用。这也就是我们在Coresight v3 & ADIv6中能看到两个版本的ROM table的原因。Arm将它们分别称为class 0x1和class 0x9。

实际上class 0x1就对应老版本中的ROM table，单纯用来做topology detection；而class 0x9就是新架构中能够进行power control的ROM table。

对比两种ROM table的entry信息如下（左0x1，右0x9，省略了一部分），可以看出0x9主要是多出了"Power and reset control"的字段，这两部分功能实际上都是DP功能的下放。

但由于我发现Arm在产品中并没有把reset control实现到ROM table中，大多还只使用DP来请求reset，所以这部分暂时按下不表。

![](https://pic3.zhimg.com/v2-f7faaeae10ee7be4f636766f7cafdd78_1440w.jpg)

Figure 2-10 ROM table entries of class 0x1/0x9

这里主要会用到的就是DBGPCR/DBGPSR，此处的范围和含义是最多对32个power domain进行granular power control， 一般这个N就等同于Cluster内core的数量。

对于每一组寄存器，DBGPCR基本上就等同于GPR中的CDBGPWRUPREQ寄存器，用来驱动同名信号，而DBGPSR与CDBGPWRUPACK却略有差异。

根据下图中DBGPSR.PS这个bit field的描述可以看到，Coresight提供了两种不同的获取目标power domain状态的方式，这两种方式下的invalid state都是0b00，而valid state为0b01或0b11。

![](https://pic3.zhimg.com/v2-65f1da4e3564e90f4272dfd8da29b6d8_1440w.jpg)

Figure 2-11 DBGPSR bit field

0b11的方式与之前通过req & ack来决定power state的方式相同（上图时序图中的DBGPCR.PS应为DBGPSR.PS），这种情况下还是需要PPU返回CDBGPWRUPACK信号来驱动PS位；

而在0b01的方式中，PS位被要求能够独立反映power state，所以使用CDBGPWRUPACK就不再合适，而是需要将当前core power domain的上电情况直接反馈给PS位。

但据我能想到的实现这种机制的方式，反而会比0b11更复杂些，暂时没参透Arm的意图。

## 2.3 secure debug

**现代架构完善的debug机制提供了内核的高度可见性** ，这对于开发者来说是一件利器，但同样给恶意访问提供了便利。

Arm架构中提供了 **一组authentication信号用来对debug功能进行限制** ，最初有4个，它们的简称与含义分别是：

- DBGEN：invasive debug enable
- SPIDEN：secure invasive debug enable
- NIDEN：non-invasive debug enable
- SPNIDEN：secure non-invasive debug enable

其中invasive debug一般就代指external debug，而non-invasive一般有trace或profiling等。

在v8.4-A及后续架构中，Arm取消了对non-invasive debug单独的控制，即不实现后两个信号。

对于core而言，authentication信号是从顶层输入的，Arm ARM并没有规范这些信号的产生机制，只是直接拿过来用而已。

这容易让人产生困惑，本以为涉及到authentication会是一套复杂的流程，结果只给出这么几个使能位，不禁让人追问：

- 这些使能的源头是哪里呢？
- 是SoC中的寄存器，还是SoC的顶层？
- 它们该如何配置，怎样保证配置过程是安全的？
- 如果可以随意配置，那authentication的意义何在？

好在，Coresight对authentication信号的配置做了一些简短但有意义的解释：

它提供了三种配置信号的方法，分别是：

- 设置成固定值，Tied LOW/HIGH
- 一次性可编程，即OTP
- 通过"custom authentication module"来驱动authentication 信号

OTP的方法引入了产品的生命周期的概念，在不同的周期中应用不同的使能策略。Arm建议在产品的开发阶段，可以使能所有的debug功能；在产品上市时，关闭secure debug。

当然OTP本质上与第一种方法差不多，只是固定值来的早一点或晚一点，还是会存在一些问题：Tied HIGH会使authentication信号失去意义，Tied LOW产生的问题在这篇论文\[12\]的VI.A小节中阐述的比较全面。

最后这种按需改变的方法提供了最大的灵活性，在保证配置过程的安全性的前提下应是最优解。

但这个"custom module"该怎么做，Coresight文档浅尝辄止，只是说了一句：

> ARM recommends using a challenge-response mechanism that is based on an on-chip random number generator or a hardware key unique to that device.

然而，我们可以在Arm的一些reference design中看到它具体是怎么做的。仍以SSE-710为例，Arm在其中设计了一个secure enclave，这是一个安全子系统，包含一个M内核以及一些私有的组件和外设。

这里主要讨论它的Lifecycle States (LCS) 和Security Control Bits (SCB) 这两个组件。

> secure enclave的概念早在配备指纹识别的iPhone 5s的Apple A7芯片中就被提出，专门用来存放用户的生物识别信息，与AP进行物理隔离。enclave，飞地，指隶属于某一行政区管辖但不与本区毗连的土地。  
>   
> 这个词透露出的含义是secure信息是「secure王国」在SoC中的一块飞地，这些信息属于它的提供者，或是更广义上的的authorized agent，而不是任意一个AP开发者。

SCB看起来就是一组系统控制寄存器，它的值直接驱动着SSE-710中包含Host CPU在内的authentication信号。

LCS从名字就能够看出来是与刚刚提到的产品生命周期有关，SSE-710定义了4个lifecycle states，并通过一个单向的状态机来表征系统当前的lifecycle state。

这4个lifecycle states分别是：

- Chip Manufacture
- Device Manufacture
- Secure Enable
- Return Merchandise Authorization

SCB的赋值机制会受到当当前lifecycle state的影响。Chip/Device Manufacture应该分别对应fabless/OEM的设计或制造阶段，SSE-710对此期间的SCB值没有具体规定；

Secure Enable对应的应该是产品上市阶段，这时SCB的authentication输出被规定为默认为0，但是可以通过secure enclave进行修改。

当然了，修改不是任意的，正如前面提到的，Arm规定用户必须通过一个"challenge-response"的过程来获取控制secure enclave的权限。

这样的机制保证了只有被授权的用户才能通过检查，使能debug并进一步访问相关资源。

最后这个RMA应该对应的是产品到了生命周期的终点，Arm对此期间的SCB值也没有规定，因此不是我们讨论的重点。

**我们进一步来具象Secure Enclave与SoC通信的模型** ：

- 「请求debug功能的agent」需要给系统secure enclave发送一个「身份信息」，
- secure enclave通过验证身份信息认定这个agent是合法的之后，允许其对secure enclave进行正常访问。

这实际上是一个所谓证书注入（Certificate Injection）的过程。证书即是debug agent的身份信息，这里的debug agent代指external debugger。

但到目前为止，我们 **还没有谈及debugger是如何与secure enclave进行交互的，这涉及到了Arm的一个独立ip：Coresight SDC-600。**

SDC即Secure Debug Channel，它兼容现有的debug interface架构，提供了从DAP到secure enclave的通路。

下面这张图展示了大概的拓扑，但有些组件的名称与我们在SSE-710中看到的不太一样。图中的Cryptoisland实际上就对应SSE-710中的secure enclave，DCU (Debug Control Unit) 就对应SCB。

因此，下图所描述的流程大致是：

- debugger通过SDC-600将其证书注入到Cryptoisland中，
- 后者调用Cryptocell对证书进行验证，
- 并在通过验证后使能DAP与Host system的通路，
- 使得debug资源能被正常访问。
![](https://pic1.zhimg.com/v2-feebf98e6b144d0ebad8fedc93734c2c_1440w.jpg)

Figure 2-12 Coresight SDC-600

下面这张图展示了SDC-600的组件应如何接入一个SoC-600 based的系统。其中，Serving Agent代指一个可以检查证书的单位，在我们讨论的系统中它实际就是Secure Enclave。

可以看到Serving Agent发出的authentication信号送到了SoC-600的诸多组件中，这里最重要的是送给AP的几条通路。

AP的CSW (Control Status Word) 寄存器有SDeviceEn和DeviceEn两个bit，分别用来控制secure/non-secure下的AP使能。

那么显然将Serving Agent发出的SPIDEN和DBGEN分别接到这两个地方就能够达到通过authentication信号控制debug通路开关的目的。

![](https://pic2.zhimg.com/v2-47d878eef54aee9a4d0822d7a3df4df5_1440w.jpg)

Figure 2-13 SDC-600 block diagram for ADIv6

最后需要说明，上图忽略了Serving Agent将authentication信号送到core的通路，实际上这才是这一小节一开始所讨论的，或者说在Arm ARM中authentication信号的来源。

## 3 Reference

- **[Arm Architecture Reference Manual for A-profile architecture](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/ddi0487/ja/%3Flang%3Den)**
- **[Arm CoreSight Architecture Specification v3.0](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/ihi0029/f/%3Flang%3Den)**
- **[Arm Debug Interface Architecture Specification ADIv6.0](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/ihi0074/d/%3Flang%3Den)**
- **[Arm Corstone SSE-710 Subsystem Technical Reference Manual](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/102342/0000/%3Flang%3Den)**
- **[Arm Cortex-A53 MPCore Processor Technical Reference Manual](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/ddi0500/j/%3Flang%3Den)**
- **[Juno r2 ARM Development Platform SoC Technical Reference Manual](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/ddi0515/f/%3Flang%3Den)**
- **[Learn the architecture - Before debugging on Armv8-A](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/102408/0100/%3Flang%3Den)**
- **[Common issues using DS-5 with Juno](https://link.zhihu.com/?target=https%3A//community.arm.com/oss-platforms/w/docs/544/common-issues-using-ds-5-with-juno)**
- **[Linux Kernel Power Management (PM) Framework for ARM 64-bit Processors](https://link.zhihu.com/?target=https%3A//events.static.linuxfound.org/sites/events/files/slides/lp-linuxcon14.pdf)**
- **[ARM 推出 CoreSight SoC-600，实现下一代调试和跟踪](https://link.zhihu.com/?target=https%3A//community.arm.com/management/archive/cn/b/blog/posts/coresight-soc600-next-generation-trace-debug)**
- **[Arm CoreLink SSE-200 Subsystem for Embedded Technical Reference Manual](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/101104/0200/%3Flang%3Den)**
- **[Understanding the Security of ARM Debugging Features](https://link.zhihu.com/?target=https%3A//ieeexplore.ieee.org/document/8835394)**

> 无论如何，这都是一篇很不错的文章。后续希望有机会能研究一下Coresight的Verilog实现，以及怎么和ARM做IP授权形式。  
>   
> 无论如何，周末快乐！

发布于 2023-12-09 09:20・新加坡[DFX](https://www.zhihu.com/topic/20654101)[软考可以自学吗？](https://zhuanlan.zhihu.com/p/687086820)

[

一、自学软考的挑战与条件自学软考虽然是一种可行的方式，但并不适合每个人。尽管自学似乎是一种经济节省的选择，但是自学...

](https://zhuanlan.zhihu.com/p/687086820)