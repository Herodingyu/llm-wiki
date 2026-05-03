---
title: "ATF启动（一）：整体启动流程"
source: "https://zhuanlan.zhihu.com/p/650745083"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "ATF启动（一）：整体启动流程大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！ 前言关于ATF启动这里先整个宏观的概念。 这个blog讲的很好…"
tags:
  - "clippings"
---
1 人赞同了该文章

大家好！我是不知名的安全工程师Hkcoco！

欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

获取更多精彩内容哦！！！

---

## 前言

关于ATF启动这里先整个宏观的概念。

这个blog讲的很好，就不重复写了，自己写还写不到这么清晰，图页很漂亮。

原文链接： [cnblogs.com/arnoldlu/p/](https://link.zhihu.com/?target=https%3A//www.cnblogs.com/arnoldlu/p/14175126.html)

## 启动正文

下图划分成不同EL，分别描述 [BL1](https://zhida.zhihu.com/search?content_id=232739465&content_type=Article&match_order=1&q=BL1&zhida_source=entity) 、 [BL2](https://zhida.zhihu.com/search?content_id=232739465&content_type=Article&match_order=1&q=BL2&zhida_source=entity) 、 [BL31](https://zhida.zhihu.com/search?content_id=232739465&content_type=Article&match_order=1&q=BL31&zhida_source=entity) 、 [BL32](https://zhida.zhihu.com/search?content_id=232739465&content_type=Article&match_order=1&q=BL32&zhida_source=entity) 、 [BL33](https://zhida.zhihu.com/search?content_id=232739465&content_type=Article&match_order=1&q=BL33&zhida_source=entity) 启动流程，以及 [PSCI](https://zhida.zhihu.com/search?content_id=232739465&content_type=Article&match_order=1&q=PSCI&zhida_source=entity) 、 [SP](https://zhida.zhihu.com/search?content_id=232739465&content_type=Article&match_order=1&q=SP&zhida_source=entity) 处理流程。

## 1\. 冷启动(Cold boot)流程及阶段划分

restart--冷启动 reset--热启动

ATF冷启动实现分为5个步骤：

- BL1 - AP Trusted ROM，一般为BootRom。
- BL2 - Trusted Boot Firmware，一般为Trusted Bootloader。
- BL31 - EL3 Runtime Firmware，一般为SML，管理SMC执行处理和中断，运行在secure monitor中。
- BL32 - [Secure-EL1 Payload](https://zhida.zhihu.com/search?content_id=232739465&content_type=Article&match_order=1&q=Secure-EL1+Payload&zhida_source=entity) ，一般为TEE OS Image。
- BL33 - Non-Trusted Firmware，一般为 [uboot](https://zhida.zhihu.com/search?content_id=232739465&content_type=Article&match_order=1&q=uboot&zhida_source=entity) 、 [linux kernel](https://zhida.zhihu.com/search?content_id=232739465&content_type=Article&match_order=1&q=linux+kernel&zhida_source=entity) 。

ATF输出BL1、BL2、BL31，提供BL32和BL33接口。 （我想提供的接口就是BL32和BL33的镜像可以是指定的，atf其实是一个启动框架，这其中包含的五个步骤，每个步骤你想要的内容，可以由厂商自己定义。）

启动流程如下：

![](https://picx.zhimg.com/v2-e78299d2735dc581e03b9f0a3deb5865_1440w.jpg)

在这里插入图片描述

### 1.1 BL1

BL1位于ROM中，在EL3下从reset vector处开始运行。（bootrom就是芯片上电运行的（chip-rom的作用就是跳转到bootrom））

BL1做的工作主要有：

- 决定启动路径：冷启动还是热启动。
- 架构初始化：异常向量、CPU复位处理函数配置、控制寄存器设置(SCRLR\_EL3/SCR\_EL3/CPTR\_EL3/DAIF)
- 平台初始化：使能Trusted Watchdog、初始化控制台、配置硬件一致性互联、配置MMU、初始化相关存储设备。
- 固件更新处理
- BL2镜像加载和执行：
	- BL1输出“Booting Trusted Firmware"。
		- BL1加载BL2到SRAM；如果SRAM不够或者BL2镜像错误，输出“Failed to load BL2 firmware.”。
		- BL1切换到Secure EL1并将执行权交给BL2.

## 1.2 BL2

BL2位于SRAM中，运行在Secure EL1主要工作有：

- 架构初始化：EL1/EL0使能浮点单元和ASMID。
- 平台初始化：控制台初始化、相关存储设备初始化、MMU、相关设备安全配置、
- SCP\_BL2：系统控制核镜像加载，单独核处理系统功耗、时钟、复位等控制。
- 加载BL31镜像：BL2将控制权交给BL1；BL1关闭MMU并关cache；BL1将控制权交给BL31。
- 加载BL32镜像：BL32运行在安全世界，BL2依赖BL31将控制权交给BL32。SPSR通过Secure-EL1 Payload Dispatcher进行初始化。
- 加载BL33镜像：BL2依赖BL31将控制权交给BL33。

## 1.3 BL31

BL31位于SRAM中，EL3模式。除了做架构初始化和平台初始化外，还做了如下工作：

- PSCI服务初始化，后续提供CPU功耗管理操作。
- BL32镜像运行初始化，处于Secure EL1模式。
- 初始化非安全EL2或EL1，跳转到BL33执行。
- 负责安全非安全世界切换。
- 进行安全服务请求的分发。
![](https://picx.zhimg.com/v2-084f5f8009449439651f06792806f089_1440w.jpg)

在这里插入图片描述

这两幅图真的不错，棒。

## 小结

**ATF将系统启动从最底层进行了完整的统一划分** ，将secure monitor的功能放到了bl31中进行，这样当系统完全启动之后，在CA或者TEE OS中触发了smc或者是其他的中断之后，首先是遍历注册到bl31中的对应的service来判定具体的handle， **这样可以对系统所有的关键smc或者是中断操作做统一的管理和分配** 。

在上述启动过程中，每个Image跳转到写一个image的方式各不相同，下面将列出启动过程中每个image跳转到下一个image的过程：

## 1\. bl1跳转到bl2执行

在bl1完成了bl2 image加载到RAM中的操作，中断向量表设定以及其他CPU相关设定之后，在bl1\_main函数中解析出bl2 image的描述信息，获取入口地址，并设定下一个阶段的cpu上下文，完成之后，调用el3\_exit函数实现bl1到bl2的跳转操作，进入到bl2中执行.

## 2.bl2跳转到bl31执行

在bl2中将会加载bl31, bl32, bl33的image到对应权限的RAM中， **并将该三个image的描述信息组成一个链表保存起来** ，以备bl31启动bl32和bl33使用在AACH64中，bl31位于EL3 runtime software，运行时的主要功能是管理smc指令的处理和中断的主力，运行在secure monitor状态中

**bl32一般为TEE OS image** ，本章节以 [OP-TEE](https://zhida.zhihu.com/search?content_id=232739465&content_type=Article&match_order=1&q=OP-TEE&zhida_source=entity) 为例进行说明

**bl33为非安全image，例如uboot, linux kernel等，当前该部分为bootloader部分的image，再由bootloader来启动linux kernel.**（所以不会这么久就是为了整个bootloader吧，应该是kernel吧）

**从bl2跳转到bl31是通过带入bl31的entry point info调用smc指令触发在bl1中设定的smc异常来通过cpu将全向交给bl31并跳转到bl31中执行。** （这个handle是再bl1配置的）

## 3.bl31跳转到bl32执行

在bl31中会执 **行runtime\_service\_inti操作，该函数会调用注册到EL3中所有service的init函数，** **其中有一个service就是为TEE服务，该service的init函数会将TEE OS的初始化函数赋值给bl32\_init变量** ，当所有的service执行完init后， **在bl31中会调用bl32\_init执行的函数来跳转到TEE OS的执行**

## 4.bl31跳转到bl33执行

当TEE\_OS image启动完成之后会触发 **一个ID为TEESMC\_OPTEED\_RETURN\_ENTRY\_DONE的smc调用来告知EL3 TEE OS image已经完成了初始化，然后将CPU的状态恢复到bl31\_init的位置继续执行。**

**bl31通过遍历在bl2中记录的image链表来找到需要执行的bl33的image。然后通过获取到bl33 image的镜像信息，设定下一个阶段的CPU上下文，退出el3然后进入到bl33 image的执行**

这一步对宏观的步骤有所认识，下一步对每个步骤的细节进行认识。

参考资料：

《手机安全和可信应用开发指南:TrustZone与OP-TEE技术详解 》 [cnblogs.com/arnoldlu/ca](https://link.zhihu.com/?target=https%3A//www.cnblogs.com/arnoldlu/category/1919344.html)

> 本文使用 [Zhihu On VSCode](https://zhuanlan.zhihu.com/p/106057556) 创作并发布

发布于 2023-08-18 00:27・四川[如何部署运维 K8s？我们整理了 3 份 Gartner 报告，得到这些建议](https://zhuanlan.zhihu.com/p/623130227)

[

本文为“Kubernetes 运维管理”系列内容。更多 Kubernetes 部署运维、管理平台选型评估等干货知识，欢迎阅读《IT 基础架构团...

](https://zhuanlan.zhihu.com/p/623130227)