---
title: "armv8中断路由机制"
source: "https://zhuanlan.zhihu.com/p/520207211"
author:
  - "[[lgjjeff]]"
published:
created: 2026-05-03
description: "1 概述 Armv8一共有四个异常等级EL0、EL1、EL2和EL3，又有两种security状态，secure和nonsecure。同时在EL1以上的异常等级下，还可以使用两个不同的栈指针SP_EL0和SP_ELx。在以上这些不同的执行状态下，中断都…"
tags:
  - "clippings"
---
[收录于 · 中断系统](https://www.zhihu.com/column/c_1513125306935898112)

37 人赞同了该文章

## 1　 概述

　　Armv8一共有四个异常等级 [EL0](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=EL0&zhida_source=entity) 、 [EL1](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=EL1&zhida_source=entity) 、 [EL2](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=EL2&zhida_source=entity) 和 [EL3](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=EL3&zhida_source=entity) ，又有两种security状态， [secure](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=secure&zhida_source=entity) 和 [nonsecure](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=nonsecure&zhida_source=entity) 。同时在EL1以上的异常等级下，还可以使用两个不同的栈指针 [SP\_EL0](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=SP_EL0&zhida_source=entity) 和 [SP\_ELx](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=SP_ELx&zhida_source=entity) 。在以上这些不同的执行状态下，中断都可能需要使用不同的处理方式，因此，中断的处理流程就变的比较复杂。为了理清它们的关系，故对其略作整理，以作备忘。由于EL2中断的处理流程与EL1中断类似。因此为了简化问题的描述，下文中将主要关注EL1、EL3的物理中断。同时由于SGI、PPI、SPI等中断类型，在中断处理流程中是类似的，因此我们将主要关注SPI的处理。     
  
　　为了实现以上目的，在硬件上需要cpu和gic的共同配合，在软件上，则需要切换执行状态时配置相应的控制寄存器，以使不同的中断类型路由到正确的执行状态下。

## ２　 GIC的配置

　　 [GICv3](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=GICv3&zhida_source=entity) 对security进行了扩展，可以将GIC配置为工作在两种secure状态或单一secure状态。它可以通过配置寄存器 [GICD\_CTRL.DS](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=GICD_CTRL.DS&zhida_source=entity) 实现：

| GICD\_CTRL.DS的值 | 支持的seure状态 | 支持的group类型 |
| --- | --- | --- |
| ０ | secure和non secure两种状态 | group0、secure group1、non secure group1 |
| １ | secure或non secure状态的一种 | group0、group1 |

　　从上表可以看到gicv3一共有三种中断group，对于SPI类型的中断，可以通过寄存器 [GICD\_IGROUPR](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=GICD_IGROUPR&zhida_source=entity) 和 [GICD\_IGRPMOD](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=GICD_IGRPMOD&zhida_source=entity) 配置其中断group。每种group中断都期望被下表特定的异常等级处理：

| group | 处理方式 |
| --- | --- |
| group0 | 在EL3中处理 |
| secure group1 | 在secure EL1或secure EL2中处理 |
| non secure group 1 | 在non secure EL1或non secure EL2中处理 |

　　gicv3可以触发两种中断信号irq和fiq，对中断分组的目的就是使不同group的中断在不同状态下可以被分别分发到irq或fiq，在aarch64状态下，中断的分发方式如下：

![](https://pic2.zhimg.com/v2-dee284a5bfa05fbfe106b5166d494861_1440w.jpg)

从上表可知：  
（1）group 0中断总是以FIQ方式触发  
（2）secure group 1中断根据cpu的当前执行状态确定触发方式。若当前执行状态为secure EL0 、EL1、EL2，以irq方式触发。否则，以fiq方式触发  
（3）non secure group 1中断，若当前执行状态为non secure EL0、EL1、EL2，以irq方式触发。否则，以fiq方式触发       
　　因此，gic对中断路由的支持可以总结为以下两点：  
（1）在中断配置时，根据中断希望被处理的异常等级不同，将其配置为三种不同的group  
（2）在中断被触发时，gic根据中断group配置和当前的系统执行状态，确定中断是以fiq还是irq的方式触发

## ３　 CPU的配置

　　GIC能做的只有中断是以哪种方式（fiq或irq）触发，若要达到不同group中断能被不同异常等级处理的目的，还需要cpu的配合才行。在 [armv8](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=armv8&zhida_source=entity) 中 [SCR\_EL3](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=SCR_EL3&zhida_source=entity) 寄存器是用于控制security相关配置的，其各bit的定义如下图：

![](https://pic1.zhimg.com/v2-56a375dbde7e5b4b75940cdf8da31faa_1440w.jpg)

其中irq和fiq用于配置中断触发时会被路由到cpu的哪个异常等级和security状态，它们的定义如下：

![](https://pic4.zhimg.com/v2-281e2ab7149c01b5c1259c668b153d33_1440w.jpg)

（1）若将FIQ位配置为0，且当前执行状态低于EL3时，则FIQ不会被路由到EL3，而路由到第一个可以处理该中断的异常等级FEL  
（2）若将FIQ配置为1，则运行于任何执行状态时，FIQ都会被路由到EL3

而irq的配置方式与fiq类似。综合上面分析，结合gic和cpu的配置，armv8的中断将有以下几种路由方式：  
3.1 secure EL1中断  
　（1）当前执行在secure EL1，则触发方式为irq       
　　　由于secure EL1中断需要在secure EL1中处理，故只要将scr.irq设置为0即可将它路由到FEL  
　（2）当前执行在non secure EL1，则触发方式为fiq       
　　　同样，由于它需要被secure EL1处理，而EL3具有中断转发功能，因此可以将中断先路由到EL3，然后由EL3转发给secure EL1。故可以将scr.fiq设置为1  
　（3）当前执行在EL3，则触发方式为fiq       
　　　此时，FIQ需要被设置为1，中断被路由到EL3，然后转发给secure EL1

3.2 non secure EL1中断  
　（1）当前执行在secure EL1，则触发方式为fiq       
　　　由于中断希望被non secure EL1处理，因此中断可以先路由到EL3，然后转发到non secure EL1。因此scr.fiq设置为1  
　（2）当前执行在non secure EL1，则触发方式为irq       
　　　此时，中断被当前EL处理即可，故scr.irq需设置为0  
　（3）当前执行在EL3，则触发方式为fiq       
　　　此时，FIQ需要被设置为1，中断被路由到EL3，然后转发给non secure EL1

3.3 EL3中断  
　（1）当前执行在secure EL1，则触发方式为fiq       
　　　将scr.fiq设置为1，以使中断路由到EL3  
　（2）当前执行在non secure EL1，则触发方式为fiq       
　　　将scr.fiq设置为1，以使中断路由到EL3  
　（3）当前执行在EL3，则触发方式为fiq       
　　　将scr.fiq设置为1，以使中断路由到EL3       
　　根据上面的几种情况，即可知道异常等级切换时只要将SCR.fiq和SCR.irq值按下表设置，及可正确地配置中断路由关系：

| 异常等级 | scr.irq | scr.fiq |
| --- | --- | --- |
| secure EL1 | ０ | １ |
| non secure EL1 | ０ | １ |
| EL3 | １ | １ |

## ４　异常向量表

　　armv8中除EL0以外，不同异常等拥有独立的异常向量表，它们的基地址被分别保存在 [VBAR\_EL1](https://zhida.zhihu.com/search?content_id=203733643&content_type=Article&match_order=1&q=VBAR_EL1&zhida_source=entity) 、VBAR\_EL2和VBAR\_EL3寄存器中。由于EL1和EL2的secure状态和non secure状态使用相同的寄存器，因此在进行secure状态切换时，需要重新设置VBAR\_EL1或VBAR\_EL2寄存器的内容。这也是中断能在各异常等级之间路由的基础。以下为vbar\_el1寄存器的定义：

![](https://pica.zhimg.com/v2-15b48975b2990d5ea6a47723e2b99b80_1440w.jpg)

    armv8的异常向量表定义如下：

![](https://picx.zhimg.com/v2-19e74a4991fe5d1b087738753011db85_1440w.jpg)

    从上图可以看到，每个异常等级下又有四张表，根据异常（中断）发生时的系统状态不同，异常将会跳转到不同的表中执行。  
（1）异常触发时，位于当前异常等级，且当前使用的栈指针为SP\_EL0，则使用第一张表  
（2）异常触发时，位于当前异常等级，且当前栈指针为SP\_ELx，则使用第二张表  
（3）当异常触发时，位于aarch64状态，且由低异常等级迁移到高异常等级，则使用第三张表  
（4）当异常触发时，位于aarch32状态，且由低异常等级迁移到高异常等级，则使用第四张表 以下为内核中的异常向量表定义（arch/arm64/kernel/entry.S）：

```
/*
 * Exception vectors.
 */
    .pushsection ".entry.text", "ax"

    .align    11
SYM_CODE_START(vectors)
    kernel_ventry    1, t, 64, sync        // Synchronous EL1t
    kernel_ventry    1, t, 64, irq        // IRQ EL1t
    kernel_ventry    1, t, 64, fiq        // FIQ EL1h
    kernel_ventry    1, t, 64, error        // Error EL1t

    kernel_ventry    1, h, 64, sync        // Synchronous EL1h
    kernel_ventry    1, h, 64, irq        // IRQ EL1h
    kernel_ventry    1, h, 64, fiq        // FIQ EL1h
    kernel_ventry    1, h, 64, error        // Error EL1h

    kernel_ventry    0, t, 64, sync        // Synchronous 64-bit EL0
    kernel_ventry    0, t, 64, irq        // IRQ 64-bit EL0
    kernel_ventry    0, t, 64, fiq        // FIQ 64-bit EL0
    kernel_ventry    0, t, 64, error        // Error 64-bit EL0

    kernel_ventry    0, t, 32, sync        // Synchronous 32-bit EL0
    kernel_ventry    0, t, 32, irq        // IRQ 32-bit EL0
    kernel_ventry    0, t, 32, fiq        // FIQ 32-bit EL0
    kernel_ventry    0, t, 32, error        // Error 32-bit EL0
SYM_CODE_END(vectors)
```

编辑于 2022-07-21 15:14[IC设计今年的行情，强烈建议ICer们做多手准备！](https://zhuanlan.zhihu.com/p/703094411)

[

很多微电子与集成电路专业的学生、初入IC职场的工程师，以及电子/机械大类专业的同学，在进入芯片设计行业时，都或多或少听说了参与流片的重要性。 但是却并不是很清楚——流片到底有多...

](https://zhuanlan.zhihu.com/p/703094411)