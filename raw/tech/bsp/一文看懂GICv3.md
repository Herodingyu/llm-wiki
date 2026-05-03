---
title: "一文看懂GICv3"
source: "https://zhuanlan.zhihu.com/p/520133301"
author:
  - "[[lgjjeff]]"
published:
created: 2026-05-03
description: "1 GIC基本功能１.1 GICv3概述 由于SOC中外设及与其相关的中断数量众多，且各中断又有多种不同的配置方式，为了减轻CPU的负担，现代处理器中断的配置和管理一般都通过中断控制器实现。 GIC是arm公司推出可与cortex-…"
tags:
  - "clippings"
---
[收录于 · 中断系统](https://www.zhihu.com/column/c_1513125306935898112)

67 人赞同了该文章

## 1　GIC基本功能

### １.1　GICv3概述

　　由于SOC中外设及与其相关的中断数量众多，且各中断又有多种不同的配置方式，为了减轻CPU的负担，现代处理器中断的配置和管理一般都通过 [中断控制器](https://zhida.zhihu.com/search?content_id=203717196&content_type=Article&match_order=1&q=%E4%B8%AD%E6%96%AD%E6%8E%A7%E5%88%B6%E5%99%A8&zhida_source=entity) 实现。

　　GIC是arm公司推出可与cortex-A和cortex-R处理器配合使用的中断控制器，当前一共有4个版本，分别为GICv1 – GIv4。GICv3是基于armv8的SOC设计中应用较为广泛的一种中断控制器，GICv4与GICv3的功能基本相同，只是为了提高虚拟化的性能，增加了直接注入虚拟中断的能力。

![](https://picx.zhimg.com/v2-f606f9b2ac38cd732ee513f95198050d_1440w.jpg)

图1 SOC中GICv3的连接关系图

　　图1是GICv3在SOC中的连接关系图，它为CPU处理所有连接到其上的中断。包括管理所有的中断源、中断行为、中断分组以及中断路由方式等，同时还提供相应的寄存器接口用于软件对这些行为的控制。

　　外设或软件触发中断后，GICv3根据中断配置信息，将其路由到特定cpu的IRQ或FIQ中断线上。CPU接收到中断后执行必要的上下文保存后，跳转到中断异常入口，并执行相应的中断处理流程。

### １.2　GICv3组件

　　为了实现中断的配置、接收、仲裁和路由功能，GICv3设计了如图2所示的不同组件，它包含了SPI、 [PPI](https://zhida.zhihu.com/search?content_id=203717196&content_type=Article&match_order=1&q=PPI&zhida_source=entity) 、 [SGI](https://zhida.zhihu.com/search?content_id=203717196&content_type=Article&match_order=1&q=SGI&zhida_source=entity) 和 [LPI](https://zhida.zhihu.com/search?content_id=203717196&content_type=Article&match_order=1&q=LPI&zhida_source=entity) 四种中断类型，以及distributor、redistributor、 [ITS](https://zhida.zhihu.com/search?content_id=203717196&content_type=Article&match_order=1&q=ITS&zhida_source=entity) 和cpu interface四大组件。

![](https://pic2.zhimg.com/v2-556c8e3c64f64b6cbc672de26171ec1f_1440w.jpg)

图2 GICv3逻辑框图

其中各中断类型的特点如下：  
１ SPI中断（shared peripheral interrupt）  
　　该类型中断不与特定的cpu绑定，可以根据affinity配置被路由到任意cpu或一组特定的cpu上。如一般的外设中断都是通过SPI方式连接的。

2 PPI中断（private peripheral interrupt）  
　　该类型中断是每个处理器私有的，即一个特定的中断只会被路由到特定的处理器上。且其同一个中断号在每个处理器上都可以有不同的中断，如对于一个拥有两个PE的smp系统，中断号16的PPI中断可以分别被注册为PE0和PE1的私有中断，它们可以被独立触发并被特定的PE独立处理。

3 SGI中断（software generated interrupt）  
　　该类型中断并没有实际的物理连线，而是由软件通过写寄存器方式触发，它只支持边沿触发。通常用于处理器之间的通信，如linux内核电源管理模块中调用的ipi中断就是通过SGI实现的

4 LPI中断（Locality-specific Peripheral Interrupt）  
　　该类型中断是一种基于消息的中断，外设不需要通过硬件中断线连接到GIC上， 而可以向特定地址写入消息来触发中断。典型的应用为PCIe的MSI和MSI-X中断。  
　　LPI中断有一些其特有的属性，如只支持non secure group1分组、只支持边沿触发、可以选择使用或不使用ITS路由，以及没有active状态，也不需要显式的deactivation操作。

### １.3　GICv3的中断属性

　　在GICv3中，不同中断类型具有不同的中断号范围，其定义如下：

| 中断类型 | 中断号 | 说明 |
| --- | --- | --- |
| SGI | 0 - 15 |  |
| PPI | 16 – 31 |  |
| SPI | 32 - 1019 |  |
| 特殊中断号 | 1020 - 1023 |  |
| 保留中断号 | 1024 - 1055 |  |
| 扩展PPI | 1056 -1119 | GICv3.1版本后才支持 |
| 保留中断号 | 1120 - 4095 |  |
| 扩展SPI | 4096 - 5119 | GICv3.1版本后才支持 |
| 保留中断号 | 5120 - 8191 |  |
| LPI | 8192 - | 最大支持的中断号由实现确定 |

　　由中断号标识的中断具有不同的属性，这些属性可以通过配置GICv3的寄存器实现。如常见属性的配置选项如下：

| 属性 | 可配置值 | 说明 |
| --- | --- | --- |
| 中断使能 | 使能、失能 |  |
| 触发方式 | 边沿触发、电平触发 |  |
| 优先级 | 最小32个，最大256个 |  |
| 亲和性 | 根据affinity值设置 |  |
| 中断分组 | Group0、secure group1、non-secure group1 |  |

### １.4　GICv3的中断生命周期

　　当中断配置完成后中断即可被触发，GIC中断的触发和处理流程如下：

![](https://pica.zhimg.com/v2-e30e67c11a7a6797a308487af5bebdd4_1440w.jpg)

图3 中断处理流程

　　中断由外设或软件触发以后，distributor和redistributor将根据中断的分组、优先级等配置信息将其分发到特定的cpu interface，并以irq或fiq的方式发送给对应的PE。此时中断处于pending状态，PE上的软件可以通过读取ICC\_IAR0\_ [EL1](https://zhida.zhihu.com/search?content_id=203717196&content_type=Article&match_order=1&q=EL1&zhida_source=entity) / ICC\_IAR1\_EL1寄存器应答该中断，中断被应答后将会变为active状态。中断处理完成后，软件可以写寄存器ICC\_EOIR0\_EL1 / ICC\_EOIR1\_EL1以执行中断的优先级下降和deactive操作。中断deactive之后，将会变为inactive状态。  
　　实际上除了上面的情形之外，当中断被应答之后且未处理完成之前，可能还会再次被触发，此时其会处于active and pending状态。其处理状态机如下图：

![](https://picx.zhimg.com/v2-d45c3b3530750ede54011a9f40016175_1440w.jpg)

图4 中断状态机转换关系图

各个中断状态的含义如下：  
（1） inactive  
　　　中断未被触发，或者已经被cpu处理完成了

（2）pending  
　　　中断已经被硬件触发或软件产生（SGI），但cpu还没有应答中断

（3）active  
　　　cpu已经应答并正在处理中断

（4）active and pending  
　　　cpu已经应答中断并正在处理中断，此时又有新的中断被触发了

### １.5　GICv3的其它功能

　　GICv3为中断的security状态和虚拟化提供了支持。通过中断分组的方式其支持在不同的security状态下中断可以分别以FIQ或IRQ方式触发。与运行在 [EL2](https://zhida.zhihu.com/search?content_id=203717196&content_type=Article&match_order=1&q=EL2&zhida_source=entity) 下的hypervisor配合，GICv3还为vPE提供了虚拟中断管理功能。

　　在多处理器系统中，GICv3还根据中断路由方式的不同支持以下三种中断处理模型：

| 中断处理模型 | 特点 |
| --- | --- |
| targeted distribution模型 | 该模型下中断触发时只有指定的target PE会接收到中断1 所有的PPI、LPI都采用该模型2 在GICD\_IROUTER<n>.Interrupt\_Routing\_Mode配置为0时，SPI也采用该模型 |
| targeted list模型 | 该模型下多个PE可以独立接收到中断，当一个PE应答中断后，只有该PE自身的中断pending状态被清除，而其它PE上的中断除非被该PE应答，否则依然会处于pending状态。1 该模型只能被用于SGI中断类型 |
| 1 of N模型 | 中断可以被路由到一组PE上，但只会被发送到其中的一个PE上。1 该模型只能被用于SPI中断类型 |

### １.6　GICv3的编程模型

　　GIC可被分为几个不同的组件，且每个组件都会支持一个或多个编程接口，这些接口又可分为内存映射型寄存器接口和系统寄存器接口两类。其中 [Distributor](https://zhida.zhihu.com/search?content_id=203717196&content_type=Article&match_order=1&q=Distributor&zhida_source=entity) 、 [Redistributor](https://zhida.zhihu.com/search?content_id=203717196&content_type=Article&match_order=1&q=Redistributor&zhida_source=entity) 和ITS为内存映射型寄存器接口，而CPU interface则是系统寄存器接口。在GICv3中不同组件的寄存器都以特定的前缀命名，各组件的命名可参考下图5：

![](https://pic4.zhimg.com/v2-8fefe2bc40c71e2fab7ed1089c318eb5_1440w.jpg)

图5 GIC各组件寄存器命名

## 2　GIC-v3组件介绍

### 2.1　Distributor组件

Distributor主要包含两部分功能：  
（1）作为编程接口可以通过GICD寄存器，对中断控制器的一些全局属性以及SPI类型中断的属性进行配置  
（2）中断触发时根据寄存器设定的中断分组、优先级以及亲和性等配置，将SPI和SGI中断路由到特定的redistributor和cpu interface上

以下将分别描述Distributor可以执行的重要中断属性设置。

### 2.1.1　中断使能配置

　　GICv3可以设置特定中断号对应的中断是否被使能，若未设置使能状态则该中断不会被发送到CPU interface。中断的使能可以通过GICD\_ISENABLER<n>寄存器设置（n为0 - 32），中断的失能可以使用GICD\_ICENABLER<n>寄存器设置，这两个寄存器都为32 bit寄存器，每个中断使用一个bit控制其使能 / 失能状态。其寄存器定义如下：

![](https://pic3.zhimg.com/v2-1e0804f5a67ef71e754822c3b8a2c0ba_1440w.jpg)

![](https://pica.zhimg.com/v2-d8175b8a05e928b478417987a70ea9a0_1440w.jpg)

### 2.1.2　中断触发方式配置

　　中断的触发方式可分为边沿触发（上升沿、下降沿）和电平触发（高电平、低电平），两种触发方式的行为有所不同。

| 触发方式 | 特点 |
| --- | --- |
| 边沿触发 | 在检测到上升沿或下降沿后触发中断，此后中断会一直处于触发状态，直到软件应答该中断为止 |
| 电平触发 | 在检测到特定电平后触发中断，电平变化或软件应答都能deassert该中断 |

　　SPI的中断触发方式可用GICD\_ICFGR<n>寄存器设置（n为0 - 63），它是一个32bit寄存器，用两个bit表示一个中断的触发方式，其中bit0为保留位，bit1位0表示电平触发，为1表示边沿触发。其寄存器定义如下：

![](https://pic4.zhimg.com/v2-cc7c481d78d6af1c7c0bc5e76152aa1d_1440w.jpg)

### 2.1.3　中断优先级配置

　　GICv3的中断优先级可用一个8bit的值表示，因此最多可包含256个优先级，实际的优先级数目是由实现确定的，含有两个security状态的系统最少需要32个中断优先级，含有一个security状态的系统最少需要16个中断优先级。GICv3的中断优先级值越小，则优先级越高。中断优先级的取值范围如下图：

![](https://picx.zhimg.com/v2-71f92e0296a93053918c4496c1df3281_1440w.jpg)

　　在smp系统中每个PE可以支持不同的优先级bit，其可以通过ICC\_CTLR\_EL1.PRIbits和ICC\_CTLR\_ [EL3](https://zhida.zhihu.com/search?content_id=203717196&content_type=Article&match_order=1&q=EL3&zhida_source=entity).PRIbits获取。  
　　GICv3会确保unmasked且已使能的最高优先级pending中断会被发送给目标PE，但若有多个相同优先级的中断处于pending状态，则哪个中断被发送是由实现确定的。  
　　GICv3还可以将中断优先级分组，以将其分为组优先级和子优先级。当组优先级相等的中断正在处理时，即使有子优先级更高的中断被触发也不会发生中断抢占。若多个组优先级相等的中断都处于待处理的pending状态，则子优先级更高的中断会被优先处理。寄存器ICC\_BPR0\_EL1、ICC\_BPR1\_EL1用于设置优先级分组。  
　　GICv3中断优先级可以通过GICD\_IPRIORITYR<n>寄存器设置(n为0 - 254)，它是一个32bit的寄存器，其定义如下：

![](https://pic4.zhimg.com/v2-411570fa96793e06c0f74eed641ecb89_1440w.jpg)

　　当前active中断的优先级可通过ICC\_RPR\_EL1 、ICC\_AP0R<n>\_EL1（group 0）或ICC\_AP1R<n>\_EL1（group 1）寄存器读取，ICC\_RPR\_EL1寄存器的定义如下：

![](https://pic4.zhimg.com/v2-57e7fe072b1f14c2dbab7ab860fc579f_1440w.jpg)

　　该寄存器返回的优先级为当前PE上处于active状态中断的组优先级。

ICC\_AP0R<n>\_EL1寄存器定的义如下：

![](https://pica.zhimg.com/v2-ed47925b68f615c65e1b23564ab4e50e_1440w.jpg)

### 2.1.4　中断亲和性配置

　　SPI类型中断使用affinity值和路由模式信息来配置中断的亲和性，ARMv8中affinity层次结构的定义如下图，其可被配置为4个或3个affinity等级，对于每个PE可通过读MPIDR寄存器获取其对应的affinity值。

![](https://picx.zhimg.com/v2-93b29a26114991d4c8bf9adbb5232b61_1440w.jpg)

图6 armv8的affinity层次结构

　　SPI的中断亲和性可通过GICD\_CTRL的ARE\_S、ARE\_NS和GICD\_IROUTER<n>寄存器配置，其中GICD\_CTRL的ARE\_S、ARE\_NS分别用于使能secure和non secure状态下亲和性路由功能。在相应使能位设置后，实际的中断路由模式由以下GICD\_IROUTER<n>寄存器设置（n为32 - 1019）：

![](https://pic2.zhimg.com/v2-faede6a2be2ebac5062c5fe23bf65f53_1440w.jpg)

其中bit 31用于设置中断路由模式，其取值如下：  
0：该中断被路由到aff0 – aff3指定的PE上  
1：该中断可被路由到partition node上的任意PE上

### 2.1.5　中断分组配置

　　为了支持ARMv8异常模型和security模型的中断处理，GICv3引入了中断分组机制。GICv3的中断可以分为以下三个group：

| 中断group | 中断处理方式 |
| --- | --- |
| Group0中断 | 该中断应该被EL3处理 |
| Secure group1中断 | 该中断应该被secure EL1或secure EL2（使用secure虚拟化）处理 |
| Non secure group1中断 | 该中断应该被non secure EL1或non secure EL2（使用non secure虚拟化）处理 |

　　GICv3可以触发两种中断信号IRQ和FIQ，对中断分组的目的就是使不同group的中断，在不同状态下可分别被路由到IRQ或FIQ上，在AARCH64状态下，中断的路由方式如下：

![](https://picx.zhimg.com/v2-6435fa25746a8102e0fb2d1c923fc1d9_1440w.jpg)

　　SPI中断group可通过GICD\_IGROUPR<n>和GICD\_IGRPMODR<n>寄存器配置（n为0 - 31），PPI和SGI的中断group可通过GICR\_IGROUPR0和GICR\_IGRPMODR0寄存器配置。下面以SPI的配置为例，GICD\_IGROUPR<n>是32bit寄存器，其与GICD\_CTRL.DS配合，每个bit用于控制一个中断的group。其寄存器定义如下：

![](https://pic1.zhimg.com/v2-62b1c44d387b948a6ce7a160212532b6_1440w.jpg)

| GICD\_IGROUPR对应bit值 | GICD\_CTRL.DS值 | 中断分组 |
| --- | --- | --- |
| 0 | 0 | Secure中断 |
| 0 | 1 | Group 0中断 |
| 1 | 0 | Non secure group 1中断 |
| 1 | 1 | Group 1中断 |

　　GICD\_IGRPMODR<n>寄存器也是每个bit控制一个中断，且当GICD\_CTRL.DS等于0时，其与GICD\_IGROUPR<n>共同用于确定一个中断的group类型，其组合方式如下：

![](https://pic2.zhimg.com/v2-9a23abfaeefdee4a1e510e5fa857411f_1440w.jpg)

　　GICv3只能将中断以IRQ或FIQ信号的方式转发给CPU，要达到上表所示的不同group中断能被特定异常等级处理，还需要CPU的配合。在armv8中SCR\_EL3寄存器是用于控制security相关配置的，其各bit的定义如下图：

![](https://pic3.zhimg.com/v2-000839a4f0306bea4ff8e5b1c9dcb5d6_1440w.jpg)

其中IRQ和FIQ用于配置中断触发时会被路由到CPU的哪个异常等级和security状态，它们的定义如下：

![](https://pic3.zhimg.com/v2-91555cd9778e7f1552881897802cad36_1440w.jpg)

（1）若将FIQ位配置为0，且当前执行状态低于EL3时，则FIQ不会被路由到EL3，而路由到第一个可以处理该中断的异常等级FEL  
（2）若将FIQ配置为1，则运行于任何执行状态时，FIQ都会被路由到EL3

而IRQ的配置方式与FIQ类似。综合上面分析，结合GIC和CPU的配置，ARMv8的中断将有以下几种路由方式：

1 secure EL1中断  
（1）当前执行在secure EL1，则触发方式为IRQ  
　　由于secure EL1中断需要在secure EL1中处理，故只要将SCR.IRQ设置为0即可将它路由到FEL  
（2）当前执行在non secure EL1，则触发方式为FIQ  
　　同样，由于它需要被secure EL1处理，而EL3具有中断转发功能，因此可以将中断先路由到EL3，然后由EL3转发给secure EL1。故可以将SCR.FIQ设置为1  
（3）当前执行在EL3，则触发方式为FIQ  
　　此时，FIQ需要被设置为1，中断被路由到EL3，然后转发给secure EL1

2 non secure EL1中断  
（1）当前执行在secure EL1，则触发方式为FIQ  
　　由于中断希望被non secure EL1处理，因此中断可以先路由到EL3，然后转发到non secure EL1。因此SCR.FIQ设置为1  
（2）当前执行在non secure EL1，则触发方式为IRQ  
　　此时，中断被当前EL处理即可，故SCR.IRQ需设置为0  
（3）当前执行在EL3，则触发方式为FIQ  
　　此时，FIQ需要被设置为1，中断被路由到EL3，然后转发给non secure EL1

3 EL3中断  
（1）当前执行在secure EL1，则触发方式为FIQ  
　　将SCR.FIQ设置为1，以使中断路由到EL3  
（2）当前执行在non secure EL1，则触发方式为FIQ  
　　将SCR.FIQ设置为1，以使中断路由到EL3  
（3）当前执行在EL3，则触发方式为FIQ  
　　将SCR.FIQ设置为1，以使中断路由到EL3

　　根据上面的几种情况，即可知道异常等级切换时只要将SCR.FIQ和SCR.IRQ值按下表设置，及可正确地配置中断路由关系：

| 异常等级 | SCR.IRQ | SCR.FIQ |
| --- | --- | --- |
| Secure EL1 | 0 | 1 |
| Non secure EL1 | 0 | 1 |
| EL3 | 1 | 1 |

### 2.1.6　中断控制器的security支持

　　ARMv8支持四个异常等级和两种security状态。GICv3各中断分组可以独立控制是否使能，也可以控制non secure状态下是否可以访问group 0中断的寄存器。它是通过GICD\_CTRL寄存器控制的，其寄存器定义如下：

![](https://pica.zhimg.com/v2-39b772e11264fe05736bd1baa0baf61e_1440w.jpg)

　　其中EnableGrp0、EnableGrp1NS和EnableGrp1S分别用于控制group0、non secure group1和secure group1中断的使能。DS用于控制non secure状态是否能访问group0中断的寄存器，以及中断是否能支持两个secure状态，当DS值为0时GICv3支持两个security状态以及三个中断group，当DS值为0时GICv3只支持一个security状态以及最多两个中断group。

### 2.1.7　中断状态控制

　　GICv3支持通过软件控制中断的状态，如将某个中断设置为pending状态、active状态或清除其pending、active状态。它可以通过配置以下几个寄存器实现：

| 寄存器 | 功能 |
| --- | --- |
| GICD\_SETSPI\_NSR | 设置特定的non secure中断的pending状态，若该中断当前为inactive状态，则转换为pending状态。若当前为pending状态，则转换为pending and active状态 |
| GICD\_CLRSPI\_NSR | 清除特定non secure中断的pending状态 |
| GICD\_SETSPI\_SR | 设置特定的secure中断的pending状态，若该中断当前为inactive状态，则转换为pending状态。若当前为pending状态，则转换为pending and active状态 |
| GICD\_CLRSPI\_SR | 清除特定secure中断的pending状态 |
| GICD\_ISPENDR<n> | 设置一个或一组中断为pending状态，若该中断当前为inactive状态，则转换为pending状态。若当前为pending状态，则转换为pending and active状态。该寄存器的每一个bit代表一个中断号 |
| GICD\_ICPENDR<n> | 清除一个或一组中断为pending状态，该寄存器的每一个bit代表一个中断号 |
| GICD\_ISACTIVER<n> | 设置一个或一组中断为active状态，若该中断当前不处于active状态，则转换为active状态。若当前为active状态，则该操作被忽略。该寄存器的每一个bit代表一个中断号 |
| GICD\_ICACTIVER<n> | 清除一个或一组中断为active状态，该寄存器的每一个bit代表一个中断号 |

其寄存器的定义分别如下：

![](https://pic2.zhimg.com/v2-da298c0f65848eac06c763740eb675e5_1440w.jpg)

![](https://pic2.zhimg.com/v2-944c4bc29cd7014b8f39980247da0279_1440w.jpg)

![](https://pic2.zhimg.com/v2-93acd901b9fa6a56b197617c30067b13_1440w.jpg)

![](https://pic1.zhimg.com/v2-658df97e6fdbf52054b21d2b68d26b7a_1440w.jpg)

![](https://picx.zhimg.com/v2-c940f277725d47078bb171b0845b09d5_1440w.jpg)

![](https://pic3.zhimg.com/v2-d834cba08929d090a09a1866f3302876_1440w.jpg)

![](https://pic2.zhimg.com/v2-5f6a215eac86ed3bdccbf6d2bccca0a5_1440w.jpg)

![](https://pic3.zhimg.com/v2-d7410de60294eb657d395d539bb9b2ca_1440w.jpg)

### 2.2　Redistributor组件

Redistributor位于Distributor和CPU interface之间，它也包含如下两部分功能：

（1）作为编程接口可以通过GICR寄存器，对PPI和SGI类型中断的属性进行配置，以设定其中断触发类型、中断使能以及中断优先级等配置。同时，其还包含了电源管理、LPI中断管理功能

（2）将最高优先级的pending中断发送到其对应的CPU interface上  
　　与SPI中断属性在distributor中不同，PPI和SGI的中断属性设置位于redistributor中。如中断使能、优先级、触发方式、分组一种中断状态转换等，由于这些设置除了寄存器不同之外，与SPI的设置方式类似，因此这部分寄存器只选取少部分做示例说明。

### 2.2.1　最高优先级pending中断发生改变的条件

（1）先前的最高优先级中断已经被应答

（2）先前的最高优先级中断被更高优先级中断抢占

（3）先前最高优先级中断被移除

（4）中断使能状态被修改

（5）该PE不再处理中断，如进入睡眠状态等

### 2.2.2　PPI和SGI的中断使能配置

　　PPI和SGI中断的使能可以通过GICR\_ISENABLER0寄存器设置，中断的失能可以使用GICR\_ICENABLER0寄存器设置，这两个寄存器都为32 bit寄存器，每个中断使用一个bit控制其使能 / 失能状态。其寄存器定义如下：

![](https://pica.zhimg.com/v2-1cc66b313b075635d7c4491a45b6606a_1440w.jpg)

![](https://pic1.zhimg.com/v2-74067ed8f7d835160e8559d08fcf2778_1440w.jpg)

### 2.2.3　PPI和SGI的中断优先级配置

　　PPI和SGI的中断优先级可通过GICR\_IPRIORITYR<n>设置（n为0 - 7），其寄存器定义如下：

![](https://picx.zhimg.com/v2-beb9a85ddecb295237a9368b31718d85_1440w.jpg)

### 2.2.4　LPI管理功能

　　由于LPI支持的中断数量较多，若这些中断的配置寄存器都使用GIC内部寄存器则需要的寄存器空间很大，因此GICv3通过将其配置信息保存在内存的方式以节约寄存器空间使用。这些表包括LPI配置表、LPI pending状态表、虚拟LPI配置表和虚拟LPI状态表。在GIC初始化时需要为这些配置表分配内存，并将内存基地址设置到相应寄存器，从而将该段内存的管理转交给GICv3。其寄存器定义分别如下：

![](https://pic3.zhimg.com/v2-b05aec7e112a0ca616ca159c861f1acc_1440w.jpg)

![](https://pic1.zhimg.com/v2-e8cd54169ae4d9491555180657a8855a_1440w.jpg)

![](https://pic1.zhimg.com/v2-dddf07e0804cc95936a49ac713291da6_1440w.jpg)

![](https://pica.zhimg.com/v2-7805243bdb4c57437e54c6fb594de31c_1440w.jpg)

　　以上定义中物理地址需要执行一定的对齐操作，其它的bit会被用于定义一些该段内存属性信息，如cache，share的属性等。

　　除了设置配置表基地址外，Redistributor还实现了改变LPI中断状态的寄存器，如设置LPI pending状态和清除LPI pending状态寄存器，其定义如下：

![](https://pic1.zhimg.com/v2-4477ab3c927b25d910fe76be93153b0e_1440w.jpg)

![](https://pic3.zhimg.com/v2-b0bbf9790a3c712ebfffb139260ae37a_1440w.jpg)

### 2.2.5　电源管理功能

　　在GICv3中CPU interface和PE必须位于同一个power domain，而redistributor不需要跟它们处于同一个power domain。因此，在CPU interface和PE电源关闭且GIC处于上电的情况下（distributor、redistributor、ITS），则GIC需要维护与该PE之间接口的状态。它可以通过如下流程完成：

（1）在CPU和PE下电之前，软件需要将redistributor和cpu interface之间的接口设置为静默（quiescent）模式。它可以通过将GICR\_WAKER.ProcessorSleep设置为1实现。并且轮询GICR\_WAKER.ChildrenAsleep的状态，当该值也被设置为1时设置完成。

（2）在CPU和PE上电之后，软件需要将GICR\_WAKER.ProcessorSleep设置为0，且轮询GICR\_WAKER.ChildrenAsleep的状态，直到该值为0时推出静默模式。

　　相应的寄存器定义如下：

![](https://pic3.zhimg.com/v2-1a11f9fa90f14eb813c73e37053c2108_1440w.jpg)

### 2.3　CPU interface组件

　　CPU interface可用于物理中断、虚拟中断处理，以及可为hypervisor提供虚拟机控制接口。包括SGI中断产生、PPI、SGI的优先级设置，最高pending优先级读取以及应答、deactivate、完成操作执行等。

### 2.3.1　中断使能配置

CPU interface可以使能或关闭某一group中断，在CPU interface中一共有三个寄存器用于配置中断的使能：

（1）ICC\_IGRPEN0\_EL1：它用于控制是否使能group 0中断

![](https://pica.zhimg.com/v2-e3cf16544489ad743c1090800550e596_1440w.jpg)

（2）ICC\_IGRPEN1\_EL3：它用于控制group 1中断的使能，其中bit 0用于控制non secure group 0的使能，bit 1用于控制secure group 1的使能

![](https://picx.zhimg.com/v2-a13abce791760908316e3072daf5aef9_1440w.jpg)

（3）ICC\_IGRPEN1\_EL1：它用于控制当前secure状态下group 1中断使能。该寄存器其实只是ICC\_IGRPEN1\_EL3寄存器的别名，即在non secure状态下其与ICC\_IGRPEN1\_EL3的bit 0等价，在secure状态下其与ICC\_IGRPEN1\_EL3的bit 1等价。

![](https://pic1.zhimg.com/v2-eb4aed50411927feda43f2be6bd8105a_1440w.jpg)

### 2.3.2　中断的状态转换

　　中断的状态转换包括中断应答、中断deactivate以及中断完成操作。其中中断应答通过读取ICC\_IAR0\_EL1（group 0）和ICC\_IAR1\_EL1（group 1）寄存器完成，寄存器定义如下：

![](https://pica.zhimg.com/v2-496c7759e5c477f3019344512e509838_1440w.jpg)

　　中断的deactivate可通过向寄存器ICC\_DIR\_EL1写入中断ID完成。其寄存器定义如下：

![](https://pic3.zhimg.com/v2-f93ffb5868d541993ed604a7e6877e94_1440w.jpg)

　　只有当前异常等级和security状态下的EOImode为1时，才需要执行deactivate操作。否则只要执行完成操作即可。中断完成操作通过向寄存器ICC\_EOIR0\_EL1（group 0）或ICC\_EOIR1\_EL1（group 1）写入中断ID实现，该操作之后CPU将又可以响应新的中断。

![](https://pic2.zhimg.com/v2-382564ac48249c6b0f934b9f42397b07_1440w.jpg)

### 2.3.3　最高优先级pending中断获取

　　当前PE上最高优先级pending中断可分别通过读取ICC\_HPPIR0和ICC\_HPPIR1寄存器获取。其中ICC\_HPPIR0的寄存器定义如下：

![](https://picx.zhimg.com/v2-0c1f2e9ceca847dc1042f32cee646fb5_1440w.jpg)

### 2.3.4　SGI中断产生

　　SGI是由软件通过写CPU interface寄存器触发的，其需要设置的内容包括中断号，中断需要被发送的目的PE。根据不同的security状态和中断group其可分别通过ICC\_SGI0R\_EL1、ICC\_SGI1R\_EL1和 ICC\_ASGI1R\_EL1寄存器产生，其对应关系如下表：

| 寄存器 | 中断类型 |
| --- | --- |
| ICC\_SGI0R\_EL1 | Secure group 0中断 |
| ICC\_SGI1R\_EL1 | 当前security状态的group 1中断 |
| ICC\_ASGI1R\_EL1 | 非当前security状态的group 1中断 |

　　这三个寄存器的定义类似，以ICC\_SGI0R\_EL1为例其定义如下：

![](https://pica.zhimg.com/v2-2c9cc9f0e73b5fc2aae3c709c709f10c_1440w.jpg)

　　其中IRM指定中断路由模型，当其为0时中断被路由到affinity指定的PE list上，否则会被发送给系统中除自身之外的其他PE。TargetList指定中断将要被发送的PE组，它与aff0的定义相匹配。

### 2.4　ITS组件

　　ITS的作用是将一个来自device的输入eventID转换为LPI中断号，并确定该中断将被发送的目的PE。它通过device table、interrupt translate table、collection table和vPE table这几张转换表实现中断号的转换。这些表的关系如下图：

![](https://pic3.zhimg.com/v2-e3d25b5f4e2ddff35564f8eb33f247be_1440w.jpg)

### 2.4.1　Device table

　　Device table提供了一组device table entry（DTE），其中每个DTE为指向特定deviceID相关的中断转换表（ITT）基地址。其转换关系如下：

![](https://pic4.zhimg.com/v2-cfa3730cfc1903acf1e15ce6a92a83b1_1440w.jpg)

### 2.4.2　中断转换表

　　每个连接到ITS上且含有多个event的设备，都拥有一张ITT表。对于物理中断和虚拟中断ITE分别提供了两种类型的映射，对于物理中断其映射关系如下：  
（1）eventID到中断ID的映射

（2）eventID到ICID的映射，其中ICID又指向collection表

对于虚拟中断其映射关系如下：  
（1）eventID到虚拟中断ID的映射

（2）eventID到vPE表的映射，vPE表包含了虚拟PE number（vPEID）

### 2.4.3　Collection表

　　Collection表提供了ICID到目的redistributor寄存器基地址的映射。对于每个ITS只有一个collection表，它可被保存在寄存器或内存中。CT entry的定义如下：

![](https://pic3.zhimg.com/v2-6db5747f786b4ef38379e9af7f3a471a_1440w.jpg)

### 2.4.4　vPE表

　　vPE表提供了vPEID到目的redistributor和虚拟LPI pending表基地址之间的映射。它提供了ITS中所有相关vPE的信息，其定义如下：

![](https://pic4.zhimg.com/v2-bb405797bf26436df7033a97cf7a87dd_1440w.jpg)

### 2.4.5　ITS命令接口

　　ITS使用命令队列的方式处理相关命令，命令队列的结构如下图：

![](https://pic4.zhimg.com/v2-1f07a3d760e12cb788d56b90213f34bf_1440w.jpg)

　　如图所示它是通过三个寄存器GITS\_CBASER、GITS\_CREADR和GITS\_CWRITER控制队列运行的。其中寄存器GITS\_CBASER用于指定ITS命令队列基地址的物理地址，寄存器GITS\_CWRITER由软件控制用于向命令队列中断写入ITS命令，GITS\_CREADR由ITS控制读取并处理队列中的命令。该队列是循环缓冲区，因此当读写指针达到队列尾后可回绕回队列头继续执行相应操作。

## 3　虚拟中断处理

GICv3提供了对虚拟化的支持，在虚拟化环境中虚拟机可以支持以下特性：  
（1）vPE可以被配置为接收虚拟group 0中断和虚拟group 1中断

（2）虚拟group 0中断使用vFIQ信号发送给non secure 1的vPE

（3）虚拟group 1中断使用vIRQ信号发送给non secure 1的vPE

（4）vPE可以像处理物理中断一样处理虚拟中断

　　中断虚拟化需要GICv3和hypervisor上的软件共同配合。支持虚拟化之后，EL3或EL2将物理中断配置为路由到EL2，EL2上的hypervisor捕获到中断以后根据中断的类型，分别执行不同的处理。这些中断包含以下两类：  
（1）本身就发送给hypervisor的中断。这类中断如由系统产生的中断、或维护虚拟机的中断。它们由虚拟机按照普通的物理中断处理即可。

（2）需要被发送给vPE的中断。虚拟机接收到这种类型中断后，若接收中断的vPE正在运行，则会通过GICv3将其按照虚拟中断的方式注入到特定vPE的list register中。否则虚拟机将中断信息暂存到内存中，并在合适的时机执行实际的虚拟中断注入。虚拟中断注入包括将特定vPE的虚拟中断ID设置为pending状态，并设置与其相关的物理中断信息

### 3.1　虚拟中断的注入和处理

　　虚拟中断注入后，GICv3将会选择list register中最高优先级的pending虚拟中断，并以vIRQ或vFIQ的形式发送给vPE，此后vPE就可以将其使用与物理中断相同的方式处理，包括应答中断、优先级降低以及deactivate操作等。若虚拟中断与物理中断关联，则当其处理完成后，相应的物理中断也会被deactivate。

　　由于list register的数量有限，为了确保vPE接收到的是最高优先级的pending中断。虚拟机需要为每个vPE维护一个pending中断优先级列表，并且其优先级最高的一组pending中断会被注入到list register中。若pending中断超过list register的数量，虚拟机将剩余的pending中断信息保存在内存中，并在此后按优先级顺序恢复注入到list register中。List register相当于所有active、pending中断的cache。

### 3.2　虚拟中断类型

Hypervisor的虚拟机维护中断包含以下几种类型：  
（1）当list register中不含有pending中断时，发出中断信号以允许hypervisor向其load pending中断。或当list寄存器为空或将为空时，发出中断以允许hypervisor向其load保存在内存中的pending中断

（2）当接收到一个不再list register中的中断的EOI命令时（该中断信息可能被保存在内存中），向hypervisor发出中断

（3）enable和disable虚拟中断group，需要向hypervisor发送中断以可能需要改变list register的内容

由于list register保存了部分vPE的上下文，因此当虚拟机将一个vPE切换为另一个vPE时，也需要切换相应list register的内容。

### 3.3　虚拟中断与物理中断的关联

Hypervisor可以向vPE注入两种类型的中断：  
（1）与物理中断关联的虚拟中断，如某一个由特定VM拥有的外设中断。  
（2）由hypervisor通过软件产生，而与物理中断无关的虚拟中断，如hypervisor用于模拟虚拟外设的中断。

为了支持以上两种模式，GIC list register支持与物理中断关联的虚拟中断。  
（1）hypervisor配置ICC\_CTRL\_EL1.EOImode = 1  
（2）当vPE相关的物理中断被发送到PE时，由hypervisor接收并应答，此时物理中断处于active状态。  
（3）hypervisor将虚拟中断插入目的vPE的pending中断列表。若hypervisor希望执行该中断的优先级下降，则执行一个EOI操作，但不要deactivate该中断  
（4）当该虚拟中断能够被vPE处理时，hypervisor将该pending中断写到LR寄存器中，并且将ICH\_LR<n>\_EL2.HW设置为1，以表示该虚拟中断是与物理中断关联的。此时，与其关联的物理中断ID也会被保存在相同的list register中  
（5）vPE运行并处理该虚拟中断，当vPE处理完成该中断后，deactivate虚拟中断后，物理中断也会被deactivate。

## 4　LPI中断处理

LPI是基于消息的中断，它可以有两种触发方式：  
（1）使用ITS将device ID和event ID转换为LPI的中断ID  
（2）通过写GICR\_SETLPIR寄存器直接将LPI中断号转发到redistributor上

下面分别是包含ITS和不包含ITS的LPI系统架构图：

![](https://pic2.zhimg.com/v2-4134a6ccb7ae98e9f2255aacb9cc90f7_1440w.jpg)

![](https://pic2.zhimg.com/v2-13954353669f167096a91bcc991d8ead_1440w.jpg)

### 4.1　LPI配置表

若一个redistributor含有对LPI的支持，则其需要包含以下两张LPI中断信息表：  
（1）LPI配置表：该表用于配置LPI中断的优先级和使能位。它由redistributor的GICR\_PROPBASER寄存器指定。其每个中断号在表中的定义如下：

![](https://picx.zhimg.com/v2-7fdd8bdb48e5b49c2aec18ecc3966965_1440w.jpg)

（2）LPI pending表：该表用于指示LPI中断的pending中断号。它由redistributor的GICR\_PENDBASER寄存器指定

　　这两张表的size取决于系统支持的LPI中断数量，它由GICR\_PROPBASER.IDBits域指定

GICv4提供了对虚拟LPI的支持，其也提供了两张类似的表GICR\_VPROPBASER和GICR\_VPENDBASER，以支持虚拟LPI中断的配置和pending状态管理

编辑于 2022-07-21 15:11[三部门发文+新政解读：ODI备案如何助力企业成功出海【成功案例】](https://zhuanlan.zhihu.com/p/1987171790427006383)

[

2025年末，北京一家科技公司正式收到了其香港子公司项目的ODI备案批复。随着一纸文书落地， 一笔10万元人民币的资金，通过官方认可的合规渠道，有序汇往香港。这看似平常的跨境调动，...

](https://zhuanlan.zhihu.com/p/1987171790427006383)