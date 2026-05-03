---
title: "AI系统-27芯片信息安全之HSM"
source: "https://zhuanlan.zhihu.com/p/2021880941371507454"
author:
  - "[[thatway程序员]]"
published:
created: 2026-05-03
description: "之前的系列文章： secureboot入门-8硬件杂谈和汇总 中介绍了安全启动，安全启动的一个核心就是验签，为了加速验签就需要用硬件进行加速。SoC内部的安全模块主要有两个： 1. 信息安全HSM 2. 功能安全FSI 这个HSM加…"
tags:
  - "clippings"
---
[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810)

2 人赞同了该文章

![](https://pic4.zhimg.com/v2-d9172b44720f5b6f735c90841067b49b_1440w.jpg)

之前的系列文章： [secureboot入门-8硬件杂谈和汇总](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247485946%26idx%3D1%26sn%3Dd62044591f30bf851bd16870a656b94e%26chksm%3Dfa528fdecd2506c81d99a5c20d07bb4af30cb728c75fe24894b27ede7844940a4e450488f1a5%26scene%3D21%23wechat_redirect) 中介绍了 **安全启动** ，安全启动的一个核心就是 **验签** ，为了加速验签就需要 **用硬件进行加速** 。

SoC内部的安全模块主要有两个：

1\. 信息安全 [HSM](https://zhida.zhihu.com/search?content_id=272214305&content_type=Article&match_order=1&q=HSM&zhida_source=entity)

2\. 功能安全FSI

这个HSM加解密加速硬件可以是一个独立的系统 **（有OS固件）就像HSM** ，也可以只是一个驱动附属在linux里面例如 **[Crypto子系统](https://zhida.zhihu.com/search?content_id=272214305&content_type=Article&match_order=1&q=Crypto%E5%AD%90%E7%B3%BB%E7%BB%9F&zhida_source=entity)** 。其设计方案各有特点，本文将从 **芯片** 角度来进行介绍。

## 1\. HSM

![](https://picx.zhimg.com/v2-2ef89e63f1fa831d977d9cc61ebd0ff1_1440w.jpg)

## 1.1 HSM概念

**什么是HSM？**

**硬件安全模块** （英语：Hardware security module，缩写 **HSM** ）是一种用于保障和管理强认证系统所使用的数字密钥，并同时提供相关密码学操作的计算机硬件设备。硬件安全模块一般通过扩展卡或外部设备的形式直接连接到电脑或网络服务器。

HSM提供什么功能？硬件安全模块可在任何涉及到密钥的场景下使用。通常来说，这些密钥具有较高的价值，一旦泄露会导致严重的后果。

HSM提供 **篡改留证** （tamper evidence/proof）、 **篡改抵抗** （tamper evidence）两种方式的防篡改功能，前者设计使得篡改行为会留下痕迹，后者设计使得篡改行为会令HSM销毁密钥一类的受保护信息。每种HSM都会包括一个或多个安全 **协处理器** ，用于阻止篡改或总线探测。

许多HSM系统提供 **安全备份外部密钥的机制** 。密钥可以以数据包形式备份并存储在计算机磁盘或其他介质上，或安全的便携式设备（如智能卡或其他安全令牌）存储于外部。

由于HSM通常是 **公钥基础设施（PKI）** 或网路银行一类关键基础设施的一部分，一般会同时使用多个HSM以实现高可用性。一些HSM具备双电源、无需停机更换配件（如冷却风扇）等设计，以确保在数据中心等环境中的高可用性要求。

少数HSM可以让用户在其 **内部处理器上运行专门开发的模块** 。在一些场景下，这种设计相当实用，例如用户可以在这种安全、受控的环境下运行一些特殊的算法或者业务逻辑，哪怕攻击者获取了计算机的完全控制权限，存储在HSM（连接到计算机）中的程序也无法被提取或篡改。

**硬件安全模块的功能通常包括：**

- 板载密码学安全密钥生成
- 板载密码学安全密钥存储，至少是顶级和最敏感的密钥，通常称为主密钥
- 密钥管理
- 加密且敏感资料的使用
- 卸载（代办）应用程序服务器的对称与非对称加密计算。

HSM也用于数据库透明加密的密钥管理。

对于密钥在内的敏感信息，HSM同时提供逻辑层面与物理层面的保护，以防止未经授权的访问或者可能的入侵。

尽管HSM主要用于处理公钥密码学使用的密钥对（可能以数字证书的形式存在，如X.509格式证书），一些情况下也处理对称密码学使用的对称密钥或者任意类型的数据。

一些HSM系统也用作硬件密码学加速器。尽管此类HSM在对称密码学相关的运算性能上不如那些为对称密码学加速特化设计的硬件，但它们在进行公钥密码学操作时能大大减轻连接到的主机的CPU运算负荷。它们一般每秒能完成1~10,000次1024位RSA签名操作。由于自2010年起，NIST推荐选取2048位及以上的RSA密钥长度， 在更长密钥下保证速度就变得越来越重要了。对此，有些HSM已经支持同等安全程度仅需更短密钥的椭圆曲线密码学（ECC） 。

## 1.2 汽车中的HSM

![](https://picx.zhimg.com/v2-ae67ee83ff1646f696725427b726de65_1440w.jpg)

**HSM 在汽车中的主要应用：**

- **安全通信** ：HSM 可实现车辆内电子控制单元 (ECU) 之间的安全通信通道，确保数据传输的机密性、完整性和身份验证。这包括安全消息协议、安全远程访问和安全车辆到基础设施通信。
- **固件更新** ：HSM 在确保汽车系统的无线 (OTA) 软件更新安全方面发挥着至关重要的作用。他们对固件更新进行身份验证，验证其完整性，并确保仅在车辆上安装受信任和授权的软件，从而防止未经授权的修改和潜在的漏洞。
- **密钥管理** ：HSM 安全地存储用于各种目的的加密密钥，例如车辆访问、身份验证、加密和数字签名。它们保护这些密钥免遭未经授权的访问，并提供安全的密钥配置机制。

另外，其他的一些概念如下：

- **硬件安全模块 (HSM) ：Hardware Security Modules**
- **硬件安全引擎 (HSE) ：Hardware Security Engines**
- **安全硬件扩展 (SHE) ：Secure Hardware Extensions**
- **可信平台模块（ [TPM](https://zhida.zhihu.com/search?content_id=272214305&content_type=Article&match_order=1&q=TPM&zhida_source=entity) ）**
- **可信执行环境（ [TEE](https://zhida.zhihu.com/search?content_id=272214305&content_type=Article&match_order=1&q=TEE&zhida_source=entity) ）**
- **Crypto子系统**
- **Security系统**

HSM和SHE都侧重硬件加速验签，但是不是独立的固件，协助CPU完成秘钥任务。TPM侧重信任根的保存。TEE侧重跟linux切换安全环境运行后（此时相当于HSM）。Crypto侧重于linux的安全校验API驱动。Security系统侧重于应用的功能实现。

> 在芯片设计中， **HSM更多的是车控使用的** ，模块化很多固件硬件盒子。 **TEE的方案偏向强大的A核** ，也就是智驾座舱中的使用。关于三域融合，肯定是座舱或者智驾去吃掉车控的，也就是说HSM会慢慢消失被TEE所替代。当然HSM独立出来一个硬件盒子会更安全，但是费钱。

除硬件部分，HSM还应有相应固件及驱动，在汽车电子中广泛用到的 **[AUTOSAR](https://zhida.zhihu.com/search?content_id=272214305&content_type=Article&match_order=1&q=AUTOSAR&zhida_source=entity)** 也提供了接口。

![](https://picx.zhimg.com/v2-25afef56518b1fc53811ced90fbcc335_1440w.jpg)

上图展示了 **AUTOSAR中与安全相关的架构** ，从其中我们可以看出， **CSM** 是其分层设计的起点，是第一接口，CSM 通过Hardware Abstraction中 **Crypto Interface（CRYIF）访问Crypto Drivers** ，整个过程为Crypto Stack。通过框架的最底层，进行相关部件（如HSM）的访问，实现加解密操作。

![](https://picx.zhimg.com/v2-c09b2b019f1daaf1874740da8dd7f4ed_1440w.jpg)

HSM最相关的就是其 **Cryto软件栈** ，其中包括了 **Crypto Service Manager（CSM）、Crypto Interface（CryIf）和Crypto Driver（CryDrv）** 三部分。

**1\. CSM** 是其他软件模块调用加解密模块的第一接口。应用层SWC通过RTE访问CSM，而其他底层软件（BSW）或者复杂驱动（CDD）则可以直接调用CSM。同时CSM也负责安全相关任务的队列管理，即优先级管理。

**2\. CryIf** 是CSM往下调用的接口模块，每一个CryIf中的加密基元都会与CSM中的一个服务相对应。而且CryIf支持分发相关任务，进一步调用不同的驱动（软件和硬件，对称和非对称等）。

**3\. Crypto Driver** 是驱动模块，访问相关部件，实现加解密操作，例如访问加解密加速器或者真随机数生成器等。

**EVITA** 也定义了HSM的相关硬件规范，针对不同的安全硬件能力，分为Full HSM、Medium HSM和Light HSM。这个分类也被广泛应用于汽车网络信息安全领域。其关键信息总结如下表。

![](https://pic1.zhimg.com/v2-1e84e6cc193c463016ac9094faadda6c_1440w.jpg)

**Full和Medium** 的主要差别在于是否硬件支持非对称加密的加速。而Medium和Light主要差别在于是否有独立的计算存储资源以及是否具有随机数生成器。

参考：

1. [blog.csdn.net/ppyang395](https://link.zhihu.com/?target=https%3A//blog.csdn.net/ppyang395942297111/article/details/112647109)
2. [blog.csdn.net/weixin\_43](https://link.zhihu.com/?target=https%3A//blog.csdn.net/weixin_43586667/article/details/123548173)

## 1.3 HSM组成

HSM指 **Hardware Security Module** ，它是一种有自己独立的 **CPU** 、 **密码算法硬件加速器、独立Flash** 等，用于生成、存储和管理加密密钥，以及执行加密运算和安全操作。

HSM通常包含 **硬件隔离、加密芯片、随机数生成器** 等安全组件，能够提供高级的安全保护，防止密钥泄露和恶意攻击。

**英飞凌的AURIX** 广泛应用于汽车电子，这系列的芯片就集成了HSM。接下来我们以这系列的芯片为例，看看HSM的硬件实现。

![](https://picx.zhimg.com/v2-c674c3fd75c046d4ef3237b5c1ad9bf5_1440w.jpg)

可以看到HSM内含 -32位的 **ARM Cortex M处理器** ，CPU频率高达100MHz -特殊访问保护存储器 -启动闪存 BootRom，可用于支持安全启动（secure/ authentic boot） -AES128 对称算法的硬件加速器，对CMAC消息验证码的加解密速率在25MByte/s以上 -真随机数发生器（True Random Number Generator），可用于密钥随机生成，挑战应答校验机制等。

![](https://pica.zhimg.com/v2-c993345f01194cf3d0b885ee21654c10_1440w.jpg)

上图中，HSM通过 **系统外设总线（System Peripheral bus， SPB）与芯片的其他部分相连** 。其中存储软件程序和数据的PFlash和DFlash实际上与芯片的其他部件共用一块Flash，但是能通过TriCore的访问控制设置，来保护HSM所对应的Flash区域不被非法访问或篡改。安全密钥的存储就是在其中的DFlash里。

**Synopsys tRoot** ™ Fx 硬件安全模块 (HSM) 是一种灵活、高度可配置的硬件和软件解决方案，可提供可编程信任根以保护高价值嵌入式目标。它旨在快速轻松地集成到更大的系统环境中。

![](https://pic3.zhimg.com/v2-653e5773c912c2a5975810e2bc04cc94_1440w.jpg)

具有可编程信任根的 tRoot 硬件安全模块 (HSM) 使联网设备能够安全且唯一地识别和验证自身，从而为远程设备管理和服务部署创建安全通道。灵活的 tRoot Fx HSM 系列包括完全可编程且高度可配置的解决方案，使设计人员能够根据自己的确切需求调整 HSM，而预构建的 tRoot Vx HSM 系列则为完整的嵌入式安全解决方案提供了明确的安全边界。 [tRoot HSM](https://zhida.zhihu.com/search?content_id=272214305&content_type=Article&match_order=1&q=tRoot+HSM&zhida_source=entity) 通过加密加速提供强大的硬件强制保护，同时保持高水平的性能，并为设计人员提供选项，以创建具有最高效功率、尺寸和性能组合的解决方案。tRoot HSM 提供可信执行环境 (TEE) 来保护敏感信息和处理，并实现整个设备生命周期所需的安全关键功能，例如 **安全启动、存储、调试、防篡改和密钥管理** 。

参考：

1. [zh.wikipedia.org/wiki/](https://link.zhihu.com/?target=https%3A//zh.wikipedia.org/wiki/) 硬件安全模块
2. [aijishu.com/a/106000000](https://link.zhihu.com/?target=https%3A//aijishu.com/a/1060000000446166)
3. [blog.csdn.net/weixin\_43](https://link.zhihu.com/?target=https%3A//blog.csdn.net/weixin_43586667/article/details/123548173)
4. [synopsys.com/dw/ipdir.p](https://link.zhihu.com/?target=https%3A//www.synopsys.com/dw/ipdir.php%3Fds%3Dsecurity-troot-fx-hw-secure-module)

## 2\. Crypto

![](https://pica.zhimg.com/v2-ddcc952e4616fe6256c8277ca37dc246_1440w.jpg)

## 2.1 linux Crypto子系统

[Linux Crypto子系统](https://zhida.zhihu.com/search?content_id=272214305&content_type=Article&match_order=1&q=Linux+Crypto%E5%AD%90%E7%B3%BB%E7%BB%9F&zhida_source=entity) 是 **Linux内核中** 的一个模块化框架，用于提供各种 **加密和密码学功能** 。它为应用程序和其他内核组件提供了一组API和接口，使它们能够利用硬件和软件加密功能来执行各种密码学操作。

Linux Crypto子系统的主要目标是提供通用的密码学功能， **如对称加密、非对称加密、哈希函数、消息认证码等。它支持多种算法和协议，包括AES、DES、RSA、DSA、SHA、MD5等，以及各种密码学模式和协议，如CBC、ECB、CTR、GCM等。**

以下是Linux Crypto子系统的一些关键特性和组件：

1. **加密API** ：Linux Crypto子系统提供了一组API，使应用程序和其他内核组件能够方便地使用密码学功能。这些API包括加密转换API（crypto API）和随机数生成API（/dev/random和/dev/urandom）等。
2. **加密算法实现** ：Linux Crypto子系统内置了多种常见的加密算法的实现，包括对称加密算法（如AES、DES）、非对称加密算法（如RSA、DSA）、哈希函数（如SHA、MD5）等。它还支持硬件加速和加密加速卡等外部硬件设备。
3. **密钥管理** ：Linux Crypto子系统提供了密钥管理框架，用于生成、存储和管理密钥。它支持多种密钥类型和存储方式，并提供了密钥管理API，使应用程序能够方便地进行密钥的生成、导入和使用。
4. **加密设备** ：Linux Crypto子系统支持将加密功能作为一个独立的设备（crypto device）进行管理和访问。加密设备可以是软件实现的，也可以是硬件加速设备。通过加密设备，应用程序可以将加密操作交给专门的硬件模块来处理，从而提高性能和安全性。
5. **加密模块** ：Linux Crypto子系统允许第三方开发者开发和加载自定义的加密模块。这些模块可以提供额外的加密算法、哈希函数或其他密码学功能，以满足特定应用的需求。

Linux Crypto子系统在Linux内核中提供了一个统一的接口和框架，使应用程序和内核组件能够方便地使用密码学功能。它为Linux系统提供了强大的加密支持，可用于保护数据的机密性、完整性和认证性。

**对称加密算法：**

- AES (Advanced Encryption Standard)：支持不同的密钥长度，包括AES-128、AES-192和AES-256。
- DES (Data Encryption Standard)：支持DES和3DES算法。
- Blowfish：一种快速的对称加密算法。
- Twofish：一种高级的对称加密算法。

**非对称加密算法：**

- RSA (Rivest-Shamir-Adleman)：支持RSA密钥生成、加密和解密操作。
- DSA (Digital Signature Algorithm)：用于数字签名和验证。
- ECC (Elliptic Curve Cryptography)：支持椭圆曲线加密算法。

**哈希函数：**

- SHA (Secure Hash Algorithm)：包括SHA-1、SHA-256、SHA-512等变种。
- MD5 (Message Digest Algorithm 5)：一种广泛使用的哈希函数，但由于安全性问题，已不推荐用于加密应用。

**消息认证码：**

- HMAC (Hash-based Message Authentication Code)：结合哈希函数和密钥生成消息认证码。
- 随机数生成器：

**随机数：**

- /dev/random 和 /dev/urandom：Linux内核提供的随机数生成设备，用于生成高质量的随机数。

## 2.2 TEE

![](https://pic3.zhimg.com/v2-ae71df2f1c0380b22fa7d79d8df27ff2_1440w.jpg)

**TEE 可信执行环境** 是在车载零部件的开放系统 REE（Rich Execution Environment，例： **Linux、Android、AUTOSAR、RTOS** 等系统）上，创建一个 **可信的、独立的、物理隔离的执行空间** ，即隔离的安全屋。安全资产不出可信域，例如密钥证书、核心逻辑等安全资产，TEE 整体架构和提供的基础服务如下图。

TEE使用了ARM的 [TrustZone](https://zhida.zhihu.com/search?content_id=272214305&content_type=Article&match_order=1&q=TrustZone&zhida_source=entity) 技术，运行在A核上，跟Linux分时运行。HSM则是独立的硬件设备。

- 生态开放，易于扩展
- 应用安全：远程控车 / 充电桩 /OTA 加固等；
- 软件实现，降低成本
- 安全存储：业务证书密钥 / 隐私数据 / 重要数据等；
- 规范接口，易于移植
- 生物识别：指纹、人脸、声纹、视频等保护；
- 动态空间，按需提供
- 金融支付：支付应用 / 电子证明 / 区块链等；
- 基于硬件，限于硬件
- 其他业务：数字版权保护 / 可信 UI/ 设备认证 / 安全通信。

**安全基础能力TEE和HSM的建设思路**

1. 侧重于有性能需求的功能，使用 HSM，例：ADAS、SecOC 等。
2. 侧重于有扩展需求的功能，使用 TEE，例：智能座舱、TBOX、TLS、业务安全等。
3. TEE 目前主要用于性能较高 MPU 场景，例：智能座舱、中央计算单元、TBOX 等。
4. HSM 即可用于 MPU 又可用于 MCU，例：TBOX、车窗、车门、灯控、诊断功能等。
5. 主要零部件建议支持 HSM 和 TEE，例：TBOX、中央计算单元等。
6. 业务安全、隐私数据尽可能采用 TEE，例：远程控车、充电功能、生物识别等。
7. 主要零部件若不支持 HSM，建议支持 TEE 功能。

参考：

1. [blog.csdn.net/qq\_447105](https://link.zhihu.com/?target=https%3A//blog.csdn.net/qq_44710568/article/details/131939680)

## 3\. AI SoC中对安全的需求分析

![](https://pic2.zhimg.com/v2-8a6a96c8e65d90372986e29bb008d7b1_1440w.jpg)

**基础需求：加密，解密，签名，验签**

- 使用什么加解密算法，在secure boot场景下需要对镜像进行解密，验签，hash认证
- 在TEE中需要保存指纹、人脸、密码等信息都需要加密
- 对app中重要数据进行加解密，是否有DMA的需求
- 支持随机数的硬件生成
- OTP的支持

**其他外设：**

- mailbox通信支持
- CRU支持
- 总线例如AXI、APB等的支持
- GPIO、Timer等外设支持

**关于性能指标：**

1. 吞吐量：处理数据的速度，例如secure boot中快速算出hash，进行验签，时间非常重要，就需要大的吞吐量。
2. 硬件加速比：相对于软件使用CPU进行运行，性能提升了多少。高硬件加速比，才凸显HSM的优势。

一般来说AI SoC中主要是支撑算力、智能驾驶等业务， **可以不用选用带独立核和固件的HSM** ，可以直接使用ATF中的TEE就可以满足secureboot和加解密的需求。

> 后记：  
> 作为消费类电子产品，安全越来越重要，市场上也急缺安全类的开发人员。在SoC的设计上支持安全也是必备的需求，这方面技术还比较核心。其实在SoC里面也就是用谁家的IP选用问题。  
> 关于卖IP的公司，一般都比较大，大公司就有研发实力。其实感觉像常用的一些IP，不是顶级的性能应该也没多大门槛，毕竟这东西研究出来一个RTL就可以复用，A公司有，B公司招几个人也能有。所以卖IP的公司一般是核心的IP附带一些送的IP，俗称全家桶，关键还是得靠服务挣钱，例如后续的验证、软件、debug等内容。还有就是流片，这个基本欧美台控制了。

“啥都懂一点，啥都不精通，

干啥都能干，干啥啥不是，

专业入门劝退，堪称程序员杂家”。

欢迎各位有自己公众号的留言： **申请转载** ！

纯干货持续更新，欢迎 **分享给朋友** 、 **点赞、收藏、在看、划线和评论交流** ！

公众号：“那路谈OS与SoC嵌入式软件”，欢迎关注！

个人文章汇总： [thatway1989.github.io](https://link.zhihu.com/?target=https%3A//thatway1989.github.io)

发布于 2026-03-30 09:27・上海[MWC实战攻略：如何打破语言壁垒抢占先机？3s高效社交破冰、蹚平各种国际展会的神器推荐](https://zhuanlan.zhihu.com/p/29021741105)

[

MWC 向来是科技领域的焦点，前不久，我也是有幸刚刚参加了今年的MWC。 大会“Converge、Connect、Create“的主题和各品牌企业展现的最新的技术和产品，都让人切实地感受到了科技...

](https://zhuanlan.zhihu.com/p/29021741105)