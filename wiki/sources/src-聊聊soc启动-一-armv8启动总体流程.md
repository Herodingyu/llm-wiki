---
doc_id: src-聊聊soc启动-一-armv8启动总体流程
title: 聊聊SOC启动（一） armv8启动总体流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（一） armv8启动总体流程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944) TrustZone 等 213 人赞同了该文章 **１　为什么需要引导程序**

## Key Points

### 1. ３　启动阶段
Armv8的启动流程包含多个阶段，典型地有BL1、BL2、BL31、BL32、BL33，根据需求的不同，这些阶段可以适当地裁剪或添加。为了方便描述，后面我们的讨论将基于以上这些官方定义的标准阶段，它们的源码会被编译成独立的启动镜像，并被保存到特定的存储介质中。由于一般的存储介质（如spi flash、nand flash、emmc、ssd等）都不支持代码的直接执行，因此需要在启动时先将镜像加载到可

### 2. ４　重要寄存器介绍
除了硬件默认设置的寄存器值之外，其它寄存器都需要在系统启动时初始化，有些重要的寄存器在系统启动流程中会影响系统的运行行为，因此下面对它们做一简单介绍。 由于armv8很多寄存器都为不同异常等级提供了对应的bank定义，而其含义比较类似，为了方便介绍，后面介绍中我们都以EL3等级下的定义为例：

### 3. 4.1　SCTLR\_EL3寄存器
该寄存器是系统控制寄存器，用于提供系统顶级的状态控制信息，其定义如下图： ![](https://pic2.zhimg.com/v2-c0f50b1a9511b899a99643d13dff04cf_1440w.jpg)

### 4. 4.2　SCR\_EL3寄存器
该寄存器用于设置secure相关的属性，且在其它异常等级下不存在bank值，而是用于控制全局状态的。 因此在不同异常等级切换之前，需要先将该寄存器的值设置为目标异常等级所需的值，如从EL3切换到non secure EL1，则需要将其设置为non secure EL1相关的配置。寄存器的定义如下：

### 5. 4.3　SP\_EL0和SP\_EL3寄存器
Armv8包含SP\_EL0和SP\_ELx两种栈指针寄存器，其中SP\_ELx包含SP\_EL1 – SP\_EL3三个bank寄存器。SP\_ELx寄存器为异常栈指针寄存器，即cpu进入异常后将会切到捕获该异常对应EL的SP\_ELx寄存器，如陷入smc异常时栈指针寄存器将会切换到SP\_ELx。SP\_EL0可以被任何异常等级使用，因此在EL1 – EL3中除了异常处理流程外，执行其它代码逻

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（一） armv8启动总体流程.md) [[../../raw/tech/bsp/聊聊SOC启动（一） armv8启动总体流程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（一） armv8启动总体流程.md) [[../../raw/tech/bsp/聊聊SOC启动（一） armv8启动总体流程.md|原始文章]]
