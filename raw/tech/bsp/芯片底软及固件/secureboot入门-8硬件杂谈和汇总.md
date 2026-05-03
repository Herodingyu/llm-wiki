---
title: "secureboot入门-8硬件杂谈和汇总"
source: "https://zhuanlan.zhihu.com/p/2027040420291453583"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "对于 安全有兴趣的，特别是安全启动，ARM相关的技术，怎么去学习？本Secureboot入门系列写到这里，也能入门一点，但是要好好学，一个好的资料就是系统的看一本领域内的好书，直接掀桌子给大家推荐：《手机安全和可…"
tags:
  - "clippings"
---
[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181)

2 人赞同了该文章

![](https://pic1.zhimg.com/v2-fd895fc7bc851988e6c3f655cceaa160_1440w.jpg)

对于 **安全** 有兴趣的，特别是 **安全启动** ， **ARM** 相关的技术， **怎么去学习？** 本Secureboot入门系列写到这里，也能入门一点，但是要好好学，一个好的资料就是系统的 **看一本领域内的好书** ，直接 **掀桌子** 给大家推荐：《手机安全和可信应用开发指南：TrustZone与 [OP-TEE](https://zhida.zhihu.com/search?content_id=273007326&content_type=Article&match_order=1&q=OP-TEE&zhida_source=entity) 技术详解》，有钱的可以买一本，没钱的加博主V见文末，给你分享学习下。这里汇总下之前的文章， **可以收藏学习** ：

1. [Secure boot入门-1基本概念和框架](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485718%26idx%3D1%26sn%3D5eaa65be761c68abbce3b6dea1a81296%26chksm%3Dfa528f32cd250624722ae7ff5a3699c20ef6b2b870eefa06025b569645cef00bf04d8b2381db%26scene%3D21%23wechat_redirect)
2. [Secure boot入门-2fip包加载image流程](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485733%26idx%3D1%26sn%3D762529eefa0bb7fcc1a2e65ccb6f821c%26chksm%3Dfa528f01cd250617415a963a61b16ae17eecaf54845aa603f796d447dc3d24c0af44f7673071%26scene%3D21%23wechat_redirect)
3. [Secure boot入门-3镜像验签基础及代码初探](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485767%26idx%3D1%26sn%3D11b4d08d1d42f446b316609bb61f9e32%26chksm%3Dfa528f63cd250675a2db9aa5ae4ad78af7f19b936c21075e2411c527fb2277faf38cb843144f%26scene%3D21%23wechat_redirect)
4. [Secure boot入门-4镜像验签代码分析](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485784%26idx%3D1%26sn%3Da95d9d7b37fa257012cc088fb484f674%26chksm%3Dfa528f7ccd25066a583c9ef44006545a62b3b109d1f40c8498380563e2846765ade21a0926e4%26scene%3D21%23wechat_redirect)
5. [secureboot入门-5镜像加密/签名/打包](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485838%26idx%3D1%26sn%3D6a76f373fd68e189b148565d2c178a60%26chksm%3Dfa528faacd2506bc5078298fea25916863cae6382525ef7bb232ce927c9f9ba214240fb1f7c0%26scene%3D21%23wechat_redirect)
6. [secureboot入门-6安卓AVB安全启动基础](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485870%26idx%3D1%26sn%3D7f358a70e5f8b616e1fd6f0c61681929%26chksm%3Dfa528f8acd25069cf8c2b5baa5381a0ea96ba2611f4eb7fcf779bc026fb76f35b4a7163c945a%26scene%3D21%23wechat_redirect)
7. [secureboot入门-7安卓AVB校验代码分析](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485885%26idx%3D1%26sn%3Dc976c08105c09814a5fbd189fc73d9ed%26chksm%3Dfa528f99cd25068f2fee0a08a8c40df1e3c665d0de4c26b8ad7efdc48f03be92c51789d2f2ce%26scene%3D21%23wechat_redirect)
8. secureboot入门-8硬件杂谈和汇总--本篇

进入本文正题，前面大多介绍了 **软件的启动流程** ，在加解密流程里面算是 **纯软件** 东西，例如ATF源码里面集成的 **[mbedtls](https://zhida.zhihu.com/search?content_id=273007326&content_type=Article&match_order=1&q=mbedtls&zhida_source=entity)** 库。

但是在 **软硬件结合** 的今天，需要 **耗时的软件硬件化** ，需要 **模块化的硬件软件化** ，从而满足更多的需求。这个 **加解密就非常耗时** ，特别是启动阶段，用户都在 **焦急的等待** ，而且软件也不如硬件安全啊，所以商用的项目基本都会把加解密这块 **用硬件来实现** ，而且是硬件的一个系统，例如 [HSM](https://zhida.zhihu.com/search?content_id=273007326&content_type=Article&match_order=1&q=HSM&zhida_source=entity) 。HSM里面会包含一系列自己的 **硬件模块** 来支撑安全的需求。

## 1\. 安全相关硬件

## 1.1 eFUSE

![](https://pica.zhimg.com/v2-339e51ccb97fa11a40f1c4f5862a3282_1440w.jpg)

所有支持 **[Secure Boot](https://zhida.zhihu.com/search?content_id=273007326&content_type=Article&match_order=1&q=Secure+Boot&zhida_source=entity)** 的 CPU 都会有一块很小的一次性编程储存模块，我们称之为 **FUSE** 或者 **eFUSE** ，因为它的工作原理跟现实中的保险丝类似：CPU 在出厂后，这块 eFUSE 空间内所有的比特都是 1，如果向一个比特烧写 0，就会彻底烧死这个比特，再也无法改变它的值，也就是再也回不去 1 了。

1. 一般 eFUSE 的大小在 **1KB** 左右，OEM 从 CPU 厂家购买了芯片，组装了产品后， **一般都要焼写 eFUSE 的内容，包括产品的运行模式：测试、开发、生产等** 。面向终端消费者的产品都会被焼写为 **生产模式** 。这个模式下 [bootROM](https://zhida.zhihu.com/search?content_id=273007326&content_type=Article&match_order=1&q=bootROM&zhida_source=entity) 会禁用很多权限，更大面积地限制用户的能力。
2. 另外一个很重要的焼写内容就是 **根密钥** 了。一般有两种根密钥：一个是加密解密用的 **对称密钥 Secure Boot Key** ，一般是 **AES 128** 的，每台设备都是随机生成不一样的；另一个是一个 **Secure Boot Signing Key 公钥** ，一般用的 **RSA** 或 **ECC** ，这个是每个 OEM 自己生成的，每台设备用的都一样，有些芯片会存公钥的 Hash 来减少 eFUSE 的空间使用。

只有 **Secure World** 才能访问 eFUSE 的寄存器。除了读写 eFUSE 的基础寄存器之外，还有一些控制寄存器可以 **禁止别的程序访问 eFUSE** ，来保护其中的密钥。因此 eFUSE 中的根密钥以及 bootROM 将作为 Secure Boot 的根信任。

## 1.2 PRMB

RPMB 是 " **Replay Protected Memory Block** " 的缩写，是一种用于安全存储和管理敏感数据的技术。它通常在安全芯片、可信执行环境（TEE）或其他安全硬件模块中实现，用于保护数据免受恶意攻击和未经授权的访问。

一般在emmc或者UFS里面的 **一块区域** ，系统不可以直接访问，需要通过TEE OS的接口访问。

## 2\. 硬件模块

## 2.1 硬件安全模块 (HSM)

在汽车行业中， **硬件安全模块 (HSM)** 用作专用加密设备，旨在增强汽车系统各个方面的安全性。部署 HSM 是为了保护敏感信息、促进安全通信并确保联网车辆内关键操作的完整性。它们提供强大的 **安全机制和密钥管理功能** ，以解决汽车行业面临的独特挑战，例如 **保护车辆间通信、保护固件更新以及确保可信软件执行** 。

![](https://pic2.zhimg.com/v2-0acec704104d5713782aaa633fbe7475_1440w.jpg)

HSM 在汽车中的主要应用：

1. **安全通信** ：HSM 可实现车辆内电子控制单元 (ECU) 之间的安全通信通道，确保数据传输的机密性、完整性和身份验证。这包括安全消息协议、安全远程访问和安全车辆到基础设施通信。
2. **固件更新** ：HSM 在确保汽车系统的无线 (OTA) 软件更新安全方面发挥着至关重要的作用。他们对固件更新进行身份验证，验证其完整性，并确保仅在车辆上安装受信任和授权的软件，从而防止未经授权的修改和潜在的漏洞。
3. **密钥管理** ：HSM 安全地存储用于各种目的的加密密钥，例如车辆访问、身份验证、加密和数字签名。它们保护这些密钥免遭未经授权的访问，并提供安全的密钥配置机制。
4. **加密服务** ，为应用程序提供加密原语，供应用程序中的高级安全栈使用；
5. **随机数服务** ，生成可用于各种安全协议的随机流；
6. **内存验证服务** ，允许应用程序在启动时（重启后）和运行时验证不同的内存区域；
7. **单频计数器服务** ，为应用程序提供一组可读且只能递增的单频计数器；
8. **安全时间服务** ，允许将安全嘀嗒（tick）的配置发信号给应用程序；
9. **网络服务** ，提供支持网络安全协议（IPsec、SSL/TLS）的加速。
10. **管理服务** ，安装、配置和测试HSE固件；
![](https://pica.zhimg.com/v2-b35a6154bd390e6d5775a9faa35aefd0_1440w.jpg)

![](https://picx.zhimg.com/v2-31ffd1c65494ba2c5e09a3d09707ed1f_1440w.jpg)

HSM的功能：

1. 管理Efuse、OTP
2. 支持摘要计算、证书验证、镜像加解密和解析等
3. 支持UART、SRAM、IO等硬件辅助模块
4. 支持核间通信（中断和共享内存）

HSM的启动：

1. 系统上电，HSM开始自检（验签启动自己HSM BootROM）
2. 通过OPSI FLASH加载启动HSM固件，并进行验签
3. 继续从OPSI FLASH加载启动其他imag，并进行验签，然后解复位
![](https://pica.zhimg.com/v2-3727546cca746f814b78a61eb685284c_1440w.jpg)

参考： [nxp.com.cn/docs/zh/prod](https://link.zhihu.com/?target=https%3A//www.nxp.com.cn/docs/zh/product-brief/HSEPB.pdf)

## 2.2 硬件安全加速引擎

![](https://pic4.zhimg.com/v2-0437ca547d32a9a5ee6bc87e6df19683_1440w.jpg)

这个硬件支持 **多种加密算法和随机数发生器** 。可以使用硬件安全加速模块进行 **验签和hash计算** 。由于使用了硬件，可以替代mbedtls软件计算库。

这里以STM32的安全硬件为例：

### 2.2.1 TRGN随机数产器

**随机数产器** ，True Random Generator。之所以是True，因为这个模块产生的随机数是以真正随机的物理噪声源为种子产生的。模拟商源，在线性反馈移位的作用下，产生32位的 随机数。

该模块直接挂在 **AHB总线** 上，有三个时钟源可选，供给该外设：HSI16，内部高速16M晶振；SYSCLK、系统时钟；PLLQ，锁相环分频输出。在不使用它时，可以关闭该模块以节省功耗。

![](https://picx.zhimg.com/v2-747cbd145d2ae2e0061b91f4c980b189_1440w.jpg)

**随机数** 被广泛用于 **加解密操作** 中，比如在验证对方身份时，使用挑战-应答模型，一方要产生一个随机数发送过去，作为challenge。在各种加密算法中，比如AES的密码分组链接模式里，最初一个密码块的生成，就 **需要一个随机数，作为初始向量参与** 。

### 2.2.2 AES加速器

![](https://pic1.zhimg.com/v2-9e0ee0add3de437df76bf077be742ed0_1440w.jpg)

STM32集成了 **AES加速器** 。密钥长度，128位和256位都支持。

支持的工作模式也很多：

加密模式有：ECB，电子密码本；CBC，密码分组链接；CTR，计数器模式。

可以同时产生消息认证码的模式有，GCM、CCM、GMAC

该模块已经过NIST（美国国标和技术研究院）的FIPS认证。G071上就有该IP。

### 2.2.3 Crypto对称加解密模块

![](https://pic1.zhimg.com/v2-798cf4c4629813c106844e4bc8fb53b0_1440w.jpg)

STM32芯片上，有些产品集成了刚才的AES，还有一些产品集成的是另外一种对称加解密模块，为了区别，名字叫做Crypto。

和AES模块差不多，只是还额外支持DES和TDES。该模块也是经过了NIST的FIPS认证。

### 2.2.4 哈希函数

![](https://pica.zhimg.com/v2-5a0fb69ef4f39906d7361a0b55fad4dc_1440w.jpg)

哈希函数是用来 **保证消息完整性** 的基础。

STM32有些产品也集成了硬件的哈希模块。G0上没有。

该模块支持的算法有MD5、SHA1，SHA2。

在消息的广义完整性方面，它支持HMAC模式。即双方的共享密钥参与的哈希操作。

### 2.2.5 PKA公钥加速器

![](https://pic1.zhimg.com/v2-411b118504d62039a9d76f1d9f9f8928_1440w.jpg)

PKA，public key accelerator。公钥加速器，即， **非对称密钥技术硬件加速模块** 。集成了PKA模块的STM32系列，目前有WB和L5。

PKA支持RSA和ECC的加密、解密、签名、验签、以及基于ECC的密钥交换算法ECDH；RSA和ECC的秘钥长度，可支持高达 3136位，和640位。

### 2.2.5 X-Cube-Crypto加解密库

基于主流的加解密算法，ST还提供了一个免费的安全包，X-Cube-Crypto， **支持主流的密码学操作：加密、哈希、消息认证、数据签名等。** 用户可以使用它来在自己的应用中提供数据保密性、完整性、对标识的认证等安全服务。

![](https://picx.zhimg.com/v2-a00869de229909eecff8abea338cc1a3_1440w.jpg)

在st官网任意页面的搜索框，输入标题里的软件包名称，就可以进入专门的下载页面。由于这个软件包是受ECCN 5D002管辖，需要大家使用自己在st官网的账户登陆后，填写申请，经审批后，方可获得临时的有效下载链接。

这个加解密安全包有两种实现方案，基于纯软件的，可以跑在任意STM32上，算法部分以库形式提供；对于带硬件加解密模块的系列，也提供硬件加速的实现。（硬件实现就不用调库了吗？）

库里的大多数算法，像AES、RSA、ECDSA、HMAC等，都经过CAVP的FIPS认证。基于它的应用开发，可以加速客户的安全认证过程。

### 2.2.5 Crypto library加解密软件库

加解密软件库 **Crypto library** ，由于支持纯软件实现，因此全系列的STM32都支持。

![](https://pica.zhimg.com/v2-9c5971f8c91aa4b544af292623f10108_1440w.jpg)

而从加解密硬件模块来看， **真随机数、两种对称加密模块，Hash、PKA** ，一眼看过去，五毒俱全的就是我们的L5了，不愧是STM32家族，安全实力的担当，配上从内核的trustzone架构，到全芯片系统的隔离。在F2、F4、F7、H7等高性能系列，也都集成了AES和Hash，但是使用方法和带隔离的L5还是有所不同。我会在后面推出的STM32L5线上课程系列来展开讨论。

参考： [stmcu.com.cn/ecosystem/](https://link.zhihu.com/?target=https%3A//www.stmcu.com.cn/ecosystem/app/information-security7)

## 3\. 信任链攻击思路

回顾我们前面定义的威胁模型，如果攻击者的目的是 **刷自定义 ROM** ，那至少要同时拿到 Normal World 和 Secure World 的 EL1 权限才能勉强让一个自定义 ROM 正常运作。如果攻击者的目的是破坏由 TrustZone 保护的 IAP 支付机制，或者 DRM 保护机制，则至少要拿到实现这些保护机制的 TA 的权限才行，也就是至少要拿到 **Secure World EL0 的权限** 。

目前我接触到的攻击思路，我基本上分为两类：Top Down 和 Bottom Up。

## 3.1 Top Down 攻击思路

所谓 Top Down，就是 **从最上层的程序，也就是最低级的权限一步步提权** ，每一次提权就获得更底层一点的权限，慢慢渗透到目标权限层。

一个特别适合了解 Top Down 的案例来自 Quarkslab 的 Breaking Samsung's ARM TrustZone\[1\] （PDF\[2\] & GitHub\[3\]）

![](https://pic1.zhimg.com/v2-078206b6bdd5ed74fba6dfb45966b4ae_1440w.jpg)

这个案例他们假设一开始只有 **Normal World 中 EL0** 的权限，但是可以自己写程序调用 TrustZone 的 Driver，通过 Driver → Android Kernel → **SMC** → Secure Monitor → Trusted OS Kernel → Trusted Application 这条线路调用 TA 的相关功能。他们逆向了 TA 的代码，找到了一处 **memcpy 越界漏洞** ，从而拿到了该 **TA 的 Secure World EL0 权限** 。

但是这个 TA 的权限有限，他们又通过 Trusted Application → System Call → Trusted OS → Secure Service 的线路调用同是 Secure World EL0，但是有更多 System Call 权限的一个 Secure Service。他们同样在这个 Secure Service 中找到了一处 memcpy 越界漏洞，从而拿到了 **更高权限的 Secure World EL0 执行权限** 。

然后他们发现这个 Secure Service 的其中一个 System Call 是一个 **任意地址 mmap--关键** ，而且没有任何限制。于是他们可以直接把 Secure Monitor 的物理地址直接 **mmap 到 Secure Service 的虚拟地址空间，然后直接改写 Secure Monitor 的代码** ，直接拿到 Secure Monitor 所在的 **Secure World EL3** 权限。基本上来说，拿到 EL3 权限，就已经可以做到任何想做的事情了。

Top Down 的思路需要在各个权限层都能找到漏洞进行利用，可以说难度非常大，而且所有这些都是基于 **软件上的漏洞** ，OEM 可以通过系统更新来进行修复。不过大部分厂家没有防回滚机制，所以攻击者可以通过降级刷机刷回一个有漏洞的版本，再进行提权。

一种 **防回滚** 的操作是每次重大安全更新都烧掉一个 eFUSE 比特，然后每个版本的固件都会检查当前烧掉的 eFUSE 比特数是否等于当前的版本号，如果大于的话会拒绝执行，如果小于的话会烧掉相应的比特。如果设备有防回滚机制，攻击者会尽量保持使用旧版固件，然后尽力阻止固件更新.

Top Down 的一种捷径是通过 Diff 分析对比更新前后固件的变化，找到安全更新修复的漏洞，然后进行利用。

## 3.2 Bottom Up 攻击思路

对应的，Bottom Up 就是直接找 **bootROM 的漏洞** 。因为 bootROM 是整个信任链的根基，拥有最高的执行权限，如果可以做到 Code Execution，那所有的 Secure Boot 保护措施都将形同虚设。而且因为 bootROM 是 **写死在 CPU 中** 的，连 OEM 都无法更改，所以一旦可以被利用，厂家将 **永远无法修复它** ，只能通过发售新的修复过的硬件来避免它。

一个最适合了解 Bottom Up 的案例是 Glitching the Switch\[4\]，这个漏洞几乎同时被好几个研究团队发现，称为 Fusée Gelée。

Nintendo Switch 使用的是 NVIDIA 的 Tegra X1 芯片，这款芯片的 bootROM 是不可读的，原理是在 bootROM 即将跳转到 FSBL 的时候，会通过一个 **专门的寄存器** ，改变 bootROM 的可读区间，使得大部分的 **bootROM 代码变得不可读** 。这个不论是开发设备还是消费产品都是如此。

所以他们攻击 bootROM 的第一步就是要 **dump 出来 bootROM 的代码** 。他们用了一种 Glitching 的手段来做到这一步。Glitching 的硬件原理在视频中有详细介绍，简单来说就是通过在非常精确的时间点，执行微秒级的 **电压骤变使得 bootROM** 在写那个可视性寄存器的时候出现错误，导致 bootROM 没有被不可视化，进而他们可以在一块开发板上用自己写的 FSBL 读取 bootROM 代码。

拿到 bootROM 之后他们根据芯片的数据手册和自己的实验，分析出各种寄存器的用途，然后对 bootROM 的 **USB 层进行逆向分析** 。最后他们发现了在一个叫做 RCM 的 USB 模式下，可以通过 **栈溢出拿到 bootROM 的执行权限** 。

拿到 bootROM 权限之后，他们就可以 **禁用掉 FSBL 的签名验证** ，相似的，Secure Boot 接下来的所有环节的签名验证都可以被禁用掉，那基本上就是想干什么都可以了。

## 4.其他启动模式

这些模式都会在 **出厂时通过efuse禁止** ，只是 **开发阶段使用** 。

## 4.1 XIP启动

**xip支持从ROM外启动** ，在调试的时候可以支持。但是在出厂后需要禁止XIP以保证系统的安全性。

**通过pin** 可以控制从XIP模式启动。可以通过efuse控制永久关闭XIP模式

## 4.2 安全恢复模式

1. 由 **pin引脚** 进行控制。
2. 如果 **升级失败** 会自动进入此模式。

一般的开发板都是通过拨码开关来决定从哪种存储介质启动。启动介质：emmc、nor flash、Nand flash

## 4.3 诊断和安全调试模式

诊断模式可以启动系统后，运行一些 **简单命令** ，例如内存访问等。

调试模式可以 **随意替换其他镜像，而不做校验** 。

## 5\. 安全启动总结

安全启动从功能上分：

1. **安全启动**
2. **安全升级**
3. **安全调试**

安全启动需要如下方面：

1. **ROT信任根** ：efuse或者OTP里面存储
2. **COT信任链**
3. **验证模块** ：加解密，镜像解析，附带硬件等
4. **签名和证书管理**
5. **启动时的硬件需求** ，例如DDR、SRAM、UART、电源等

固件更新：

1. 可以从QSPI Flash、UFS、SRAM、USB、SD、Eth、Uart等介质进行固件更新
2. 系统固件损坏时，在恢复模式可以进行替换
3. 支持AB分区，固件损坏时可以恢复
4. 支持OTA升级
5. 支持防回滚设置

安全调试：

1. 结合设备的生命周期，来管理权限，通过JTAG、Uart、USB、Eth等来进行调试
2. 支持通信中进行证书认证后打开Debug接口，例如JTAG等

参考：

1. [blog.csdn.net/lpwsw/art](https://link.zhihu.com/?target=https%3A//blog.csdn.net/lpwsw/article/details/123903397)
2. [bilibili.com/read/cv309](https://link.zhihu.com/?target=https%3A//www.bilibili.com/read/cv30970537/)

> 后记：  
>   
> secureboot入门系列告一段落，继续学习的可以看书《手机安全和可信应用开发指南：TrustZone与OP-TEE技术详解》，加V： **thatway1989，免费送** 。  
> 如果需要 **高质量高效学习** ，推荐周贺贺老师的课，还带课后辅导，联系博主有优惠，扫本文后面的码下单。

\[1\]Breaking Samsung's ARM TrustZone: [youtube.com/watch?](https://link.zhihu.com/?target=https%3A//www.youtube.com/watch%3Fv%3DuXH5LJGRwXI)

\[2\]PDF: [i.blackhat.com/USA-19/T](https://link.zhihu.com/?target=https%3A//i.blackhat.com/USA-19/Thursday/us-19-Peterlin-Breaking-Samsungs-ARM-TrustZone.pdf)

\[3\]GitHub: [github.com/quarkslab/sa](https://link.zhihu.com/?target=https%3A//github.com/quarkslab/samsung-trustzone-research)

\[4\]Glitching the Switch: [media.ccc.de/v/c4.openc](https://link.zhihu.com/?target=https%3A//media.ccc.de/v/c4.openchaos.2018.06.glitching-the-switch)

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、点赞、收藏、在看、划线和评论交流！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-04-13 15:09・上海[花小钱买时间，这才是高级的自我投资｜出门问问TicNote Lite青春版深度测评](https://zhuanlan.zhihu.com/p/1982043200047833276)

[

每天结束忙碌的工作后，我特想挤出些时间提升自我、丰富精神世界。但奈何总被各种琐事打乱节奏： 交了钱报名了线上课程，想认真记录知识点，可一边听老师讲解一边手写的笔记，不仅字迹...

](https://zhuanlan.zhihu.com/p/1982043200047833276)