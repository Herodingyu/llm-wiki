---
title: "如何使用OP-TEE进行可信软件开发"
source: "https://zhuanlan.zhihu.com/p/651478843"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！ 使用OP-TEE进行可信软件开发本博客旨在介绍可信执行环境（TEE）的概念，以及最终用户如…"
tags:
  - "clippings"
---
11 人赞同了该文章

---

大家好！我是不知名的安全工程师Hkcoco！

欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

获取更多精彩内容哦！！！

---

使用OP-TEE进行可信软件开发

本博客旨在介绍可信执行环境（TEE）的概念，以及最终用户如何利用开源软件安全部署需要处理机密信息的应用程序。

## 可信执行环境（TEE）概述

## 什么是TEE？TEE的好处是什么？

TEE提供了一个隔离的环境，以确保代码/数据的完整性和机密性。

运行Linux或Android的典型嵌入式系统在内核和用户空间包中都暴露出大量安全漏洞。

漏洞可能使攻击者能够访问敏感信息和/或插入恶意软件。

TEE增加了一个额外的安全层，TEE上运行的代码/数据不能从正常世界的操作系统（如Linux/Android）访问/篡改。

在TEE（安全世界）上运行的软件通常包括一个小型的面向安全的操作系统（例如：OP-TEE OS）以及可信的应用程序。

可信应用程序旨在处理机密信息，如信用卡PIN、私钥、客户数据、受DRM保护的媒体等，并向正常世界的OS提供服务，以在不损害机密信息的情况下使用机密信息。

![](https://pic2.zhimg.com/v2-07514df639cd412e689abfec29186113_1440w.jpg)

TEE环境

## TEE是如何实施的？

**TEE需要软件和硬件（内置于处理器中）支持。**

在硬件方面，基于ARM的处理器使用TrustZone技术实现TEE。TrustZone使单个物理处理器核心能够安全高效地执行来自正常世界（如Linux/Android等丰富操作系统）和安全世界（如OP-TEE等安全操作系统）的代码。

这允许高性能安全软件与正常世界的操作环境一起运行。TrustZone实现了基于“状态”的内存和IO保护。

即，当处理器在安全状态/上下文（安全世界）中运行时，它对系统有不同的看法，并且可以访问通常不能从非安全状态/语境（正常世界）访问的存储器/外围设备。

当更改当前运行的虚拟处理器时，两个虚拟处理器上下文通过监视器模式进行切换。

![](https://pic4.zhimg.com/v2-ba2efae3a870a83228aee8d09ec3efb5_1440w.jpg)

ARM TrustZone安全性的简化硬件视图

在软件方面，有一个正常世界的操作系统（例如：Linux、Android等）和一个安全世界的操作程序（例如：OP-TEE、Trusty、QSEE、SierraTEE等）都以特权模式运行。

类似地，在正常世界中有用户应用程序，在安全世界中有可信用户应用程序都以用户模式运行。

安全世界可信应用程序/OS旨在向正常世界的用户应用程序提供安全相关服务。

![](https://pic2.zhimg.com/v2-c4a625c45a91b694bfedfa7b4eb99e4d_1440w.jpg)

ARM TrustZone安全性的简化软件视图

## 选择您的安全世界操作系统

非营利组织Global Platform开发了TEE API和框架规范，以标准化TEE并避免碎片化。

TEE客户端、Core等有各种可用规范，规定了受信任的应用程序和安全世界操作系统之间的交互、与另一个受信任应用程序的受信任应用软件、与受信任应用应用程序的客户端应用软件等。

**这使最终用户无需更改其受信任的程序即可切换安全操作系统。**

在选择您的安全世界操作系统时，既有商业/专有选项，也有开源选项。

操作系统的选择取决于所需的功能和所需的支持级别， **但谨慎的做法是选择符合全球平台TEE规范的操作系统。**

## Open-source Portable TEE (OP-TEE)

OPTEE是TEE的一个开源实现。OP-TEE由

- [【安全世界操作系统（optee\_OS）】](https://link.zhihu.com/?target=https%3A//github.com/OP-TEE/optee_os)
- [【普通世界客户端（optee\_client）】](https://link.zhihu.com/?target=https%3A//github.com/OP-TEE/optee_client)
- [【测试套件（optee\_test/xtest）】](https://link.zhihu.com/?target=https%3A//github.com/OP-TEE/optee_test)
- Linux驱动程序组成。

操作系统和客户端具有BSD 2语言许可证，并且符合全球平台。

Linaro支持并积极维护的 [【平台/处理器】](https://link.zhihu.com/?target=https%3A//github.com/OP-TEE/optee_os%233-platforms-supported) 超过28个。以下是OP-TEE的软件体系结构图。

**产品开发团队负责开发运行在Linux上的客户端应用程序（CA）和运行在OP-TEE上的可信应用程序（TA）。**

CA使用TEE客户端API与TA通话，并从中获得安全服务。

CA和TA使用共享内存在彼此之间传递数据。

![](https://pic3.zhimg.com/v2-3d57eb694cb8728cbe859b249bb19490_1440w.jpg)

OP-TEE软件架构（图片来源：Linaro）

```
Linaro，一间非营利性质的开放源代码软件工程公司，主要的目标在于开发不同半导体公司系统单芯片（SoC）平台的共通软件，以促进消费者及厂商的福祉。

针对于各个成员推出的 ARM 系统单芯片（SoC），它开发了 ARM 开发工具、Linux 内核以及 Linux 发行版（包括 Android 及 Ubuntu）的主要自动建构系统。
```
![](https://pic1.zhimg.com/v2-29076487393aa53dc31fc531162ecffa_1440w.jpg)

Linaro

## 开始使用OP-TEE

假设您正在使用的SoC已经得到OP-TEE操作系统的支持，以下是构建软件的选项：

- 最低限度的OP-TEE构建系统：为了帮助启动运行OP-TEE，一些板维护人员（例如：Raspberry Pi 3和TI AM43xx/AM57xx）提供了一个最低限度的构建系统，可以生成所有所需的映像（引导程序、OP-TEE操作系统、Linux内核、OP-TEE客户端和最低限度的RFS）。
	- 参考生成和清单项目
- Yocto项目构建系统：在构建中包含meta-optie层，并将相关包添加到local.conf
- 手册：交叉编译和构建各个部分
	- 请参阅CI脚本。i.MX6/7平台的示例可在此处找到。

\*\*注意：\*\*通过在构建命令行中提供CFG\_=<y/n>，可以启用/禁用OP-TEE操作系统中的各种功能。

对于具有不同内存大小的自定义板，您可能需要调整平台配置文件中的安全（CFG\_TEE\_RAM\_START、CFG\_TA\_RAM\_START）和共享（CFG\_SHMEM\_START）内存位置。

一些平台还允许代码从内部SRAM（CFG\_WITH\_PAGER）运行。

![](https://pica.zhimg.com/v2-9cec22fc3b314d50e038971135661252_1440w.jpg)

示例OP-TEE内存映射

如果您使用的SoC不受支持，请联系您的SoC供应商或自行添加支持，联系OP-TEE维护人员，或寻求商业支持（Timesys、WindRiver…）。您还可以选择使用QEMU测试OP-TEE。

## 引导加载程序支持和引导流程

理想情况下，必须在引导过程中尽早加载OP-TEE二进制文件（在OP-TEE之前运行的引导加载程序中的漏洞可能会危及敏感数据）。

在典型的Linux引导（没有TEE）中，ROM引导加载程序加载/执行第一阶段引导加载程序（例如：SPL、MLO、SBL1、FSBL），

然后执行执行Linux内核的第二阶段引导加载器（例如：U-boot、LittleKernel），所有这些都来自安全的世界上下文。

在基于 [ARMv7](https://zhida.zhihu.com/search?content_id=232902423&content_type=Article&match_order=1&q=ARMv7&zhida_source=entity) 的处理器上，TEE的典型引导流程是：

- SPL加载OP-TEE和U-boot，跳到OP-TEE，一旦OP-TEE完成初始化， **它就会切换到非安全上下文并跳到U-boot。**
- OP-TEE代码将继续驻留在内存中，为Linux内核提供安全服务。
- 在基于 [ARMv8](https://zhida.zhihu.com/search?content_id=232902423&content_type=Article&match_order=1&q=ARMv8&zhida_source=entity) 的处理器上，TEE引导流程包括SPL加载 [【ARM Trusted firmware】](https://link.zhihu.com/?target=https%3A//github.com/ARM-software/arm-trusted-firmware) 以及OP-TEE和U-boot的额外步骤。

SPL跳到arm trusted firmware，该固件随后将控制权交给OP-TEE，而OP-TEE又在非安全上下文中跳到U-Boot。

在ARMv8平台上， **arm trusted firmware提供监控代码来管理安全和非安全世界之间的切换** ，而它内置于ARMv7平台的OP-TEE中。

**注意：** OP-TEE需要知道到非安全世界的跳转地址（例如：u-boot或内核加载地址）。这可以在构建时（CFG\_NS\_ENTRY\_ADDR）提供，或者SPL需要在跳到OP-TEE之前用加载地址配置ARM寄存器（r1）。

![](https://picx.zhimg.com/v2-940e858f79fb4584ea50840435388463_1440w.jpg)

使用TEE时的不同引导流程

## Linux支持

用于OP-TEE的Linux内核驱动程序可在内核4.12或更高版本中使用。如果您运行的是旧版本的内核，那么您将需要 [【备份端口补丁】](https://link.zhihu.com/?target=https%3A//lwn.net/Articles/716737/) 。您还需要按照以下步骤启用驱动程序：

- 在内核配置中设置CONFIG\_OPTEE=y
- 为OP-TEE添加设备树节点， [【如链接所示】](https://link.zhihu.com/?target=https%3A//github.com/nodeax/linux-at91/commit/6f4de47f0265d75a7d3a1335b5191d464d611ebe)
	- 或者，使用CFG\_DT=y编译OP-TEE操作系统可以在运行时修改dtb以添加所需的节点

## OP-TEE常见问题

一旦你运行了引导程序、Linux和OP-TEE操作系统，你可能会在自定义板上遇到问题。以下是了解和解决一些常见问题的指南：

- Imprecise aborts：通常在正常操作系统访问安全外围设备和/或内存时会出现这种情况。建议查看外围设备/内存区域的权限。
- Memory map conflicts：需要仔细检查OP-TEE OS和kernel/dtb/ramfs的加载地址和运行时地址，否则可能会导致内核试图将自己重新定位到OP-TEE运行时区域等问题。
- Clock setup：Linux内核禁用任何未使用的外围设备的时钟，但该外围设备可能被Linux不知道的安全世界操作系统使用。解决此问题的一种方法是将“clk\_ingnore\_unused”作为Linux内核引导参数的一部分。
- Resource conflict：如果外围设备同时被正常和安全世界代码访问，则没有可能导致冲突的锁定机制。在没有锁定机制的情况下，建议世界中只有一个拥有对资源的访问权，并且它向另一个世界提供服务以与资源交互。

## 受信任的应用程序（TA）

有许多可用于可信应用程序开发的教程，因此本博客将重点介绍宏观的概述。要开始编写CA和TA，请参阅 [【helloworld应用程序】](https://link.zhihu.com/?target=https%3A//github.com/linaro-swg/hello_world) 。

受信任的应用程序有两种类型：动态应用程序和伪/静态应用程序

- 动态应用程序位于普通世界文件系统（RFS）中，当Linux客户端应用程序想要使用它时，它会在运行时加载到安全世界用户空间。TA会被签名，OP\_TEE OS会在执行之前验证签名。
- Psuedo/Static应用程序通常作为OP-TEE内核的一部分构建，并在内核模式下运行。这些应用程序主要涉及提供涉及控制硬件的服务，这在用户空间中运行的动态应用程序中很难实现。

OP-TEE操作系统为TA提供了安全的数据存储设施。数据以加密/身份验证（AES-GCM）方式存储在Linux文件系统（/data/tee）上，或者存储在eMMC RPMB分区上。

## Real world example

**TEE可以通过用软件解决方案取代专用安全芯片（密钥存储或加密认证）来降低硬件成本。**

为了访问硬件功能，许多安全芯片为用户空间应用程序提供了 [OpenSSL引擎接口](https://zhida.zhihu.com/search?content_id=232902423&content_type=Article&match_order=1&q=OpenSSL%E5%BC%95%E6%93%8E%E6%8E%A5%E5%8F%A3&zhida_source=entity) 。

类似的模型可以通过开发TEE客户端应用程序作为OpenSSL引擎的一部分来与TA接口，从而最大限度地减少对用户空间应用程序的任何更改。

受信任的应用程序需要实现密钥管理和加密操作的处理程序。

OP-TEE OS包括 [libtomcrypt](https://zhida.zhihu.com/search?content_id=232902423&content_type=Article&match_order=1&q=libtomcrypt&zhida_source=entity) ，它提供各种对称/非对称/椭圆曲线密码功能。

因此，TA主要负责输入验证和调用适当的OP-TEE核心API。以下是实现相同功能的示例体系结构。

![](https://pic3.zhimg.com/v2-f27b80c3f9ef5cf91c966c072cc401c6_1440w.jpg)

TEE保护的加密操作的示例架构

## 安全考虑

在部署TEE之前，需要审查系统/平台级别的安全考虑因素。下面介绍了一些常见的问题：

- JTAG：在生产单元上，禁用JTAG或将JTAG限制为非安全访问，以确保无法通过JTAG访问/修改安全世界数据。
- 安全引导：为了确保只有经过身份验证的代码在设备上运行，必须建立安全引导和信任链。请参阅此【博客】了解更多详细信息。
- 权限审查：一些OP-TEE平台没有明确设置非安全世界的权限，默认允许访问所有外围设备/内存。 **此外，配置这些权限的寄存器也必须明确设置为仅安全访问，以防止正常世界代码更改权限** 。适当设置权限后， **使用Linux用户空间中的devmem2/memtool访问安全内存区域，并验证是否报告了总线错误。**
- 审查密钥的使用：安全存储取决于提供给OP-TEE操作系统的唯一硬件密钥。请参 [【阅此文档】](https://link.zhihu.com/?target=https%3A//optee.readthedocs.io/en/latest/architecture/secure_storage.html) ，以确保它针对您的平台进行了正确设置。

## 小结

使用TEE是一种相对便宜的方法，可以为设备添加额外的安全层。

利用TEE的开源软件的可用性使部署可信的应用程序变得容易。

除了额外的安全优势外，它还具有降低使用专用安全芯片/协处理器的平台硬件成本的潜力。

> 本文使用 [Zhihu On VSCode](https://zhuanlan.zhihu.com/p/106057556) 创作并发布

发布于 2023-08-22 00:50・四川[别被一夜暴富蒙蔽双眼！我亲测这个项目才是未来三五年的风口项目——虚拟服务电商，蓝海市场赚企业的钱！](https://zhuanlan.zhihu.com/p/13090353260)

[

一个普通人若要实现人生的翻转，创业往往是条值得考虑的道路，因为单纯依靠打工往往难以实现真正的逆袭。打工所得往往只是勉强维持生计的微薄薪资，难以迅速积累财富，实现人生的蜕变...

](https://zhuanlan.zhihu.com/p/13090353260)