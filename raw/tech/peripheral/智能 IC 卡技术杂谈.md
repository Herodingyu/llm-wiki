---
title: "智能 IC 卡技术杂谈"
source: "https://zhuanlan.zhihu.com/p/427769694"
author:
  - "[[HankUinIO.com 电子技术实验室]]"
published:
created: 2026-05-02
description: "集成电路卡又称为 IC 卡（Integrated Circuit Card），是一种内嵌有集成电路的塑料标签或卡片，其集成电路当中包含有 8 位或者 32 位的微控制单元 MCU、只读存储器 ROM、电可擦只读存储器 EEPROM（按字节操作）或…"
tags:
  - "clippings"
---
[收录于 · 成都IT圈](https://www.zhihu.com/column/chengdu)

34 人赞同了该文章

目录

**[集成电路卡](https://zhida.zhihu.com/search?content_id=183189434&content_type=Article&match_order=1&q=%E9%9B%86%E6%88%90%E7%94%B5%E8%B7%AF%E5%8D%A1&zhida_source=entity)** 又称为 **IC 卡** （Integrated Circuit Card），是一种内嵌有集成电路的塑料 `标签` 或 `卡片` ，其集成电路当中包含有 `8` 位或者 `32` 位的 **[微控制单元](https://zhida.zhihu.com/search?content_id=183189434&content_type=Article&match_order=1&q=%E5%BE%AE%E6%8E%A7%E5%88%B6%E5%8D%95%E5%85%83&zhida_source=entity)** MCU、 **[只读存储器](https://zhida.zhihu.com/search?content_id=183189434&content_type=Article&match_order=1&q=%E5%8F%AA%E8%AF%BB%E5%AD%98%E5%82%A8%E5%99%A8&zhida_source=entity)** ROM、 **[电可擦只读存储器](https://zhida.zhihu.com/search?content_id=183189434&content_type=Article&match_order=1&q=%E7%94%B5%E5%8F%AF%E6%93%A6%E5%8F%AA%E8%AF%BB%E5%AD%98%E5%82%A8%E5%99%A8&zhida_source=entity)** EEPROM（按字节操作）或者 **[闪速存储器](https://zhida.zhihu.com/search?content_id=183189434&content_type=Article&match_order=1&q=%E9%97%AA%E9%80%9F%E5%AD%98%E5%82%A8%E5%99%A8&zhida_source=entity)** Flash（按扇区操作）、 **随机访问存储器** RAM，以及固化在只读存储器 ROM 当中的 **[片内操作系统](https://zhida.zhihu.com/search?content_id=183189434&content_type=Article&match_order=1&q=%E7%89%87%E5%86%85%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F&zhida_source=entity)** （COS，Chip Operating System），并且通常内置有 `DES` 、 `RSA` 、 `国密 SMx` 、 `SSF` 等 [加解密算法](https://zhida.zhihu.com/search?content_id=183189434&content_type=Article&match_order=1&q=%E5%8A%A0%E8%A7%A3%E5%AF%86%E7%AE%97%E6%B3%95&zhida_source=entity) 。

![](https://pic4.zhimg.com/v2-8024321ee3529de970d9f1e1c49442a1_1440w.jpg)

目前市场上主流的 IC 卡芯片有 **[恩智浦 NXP](https://link.zhihu.com/?target=https%3A//www.mifare.net/en/)** 的 **Mifare** 系列、 **[英飞凌 Infineon](https://link.zhihu.com/?target=https%3A//www.infineon.com/cms/cn/product/security-smart-card-solutions/)** 的 **SL** 系列、、 **[复旦微电子](https://link.zhihu.com/?target=http%3A//www.fmsh.com/7e67a741-a1ed-718d-15e3-83bdb6ecf4fa/)** 的 **FM** 系列， **[华大半导体](https://link.zhihu.com/?target=http%3A//www.hed.com.cn/CN/WebPage_51_77.aspx)** 的 **SHC** 和 **CIU** 系列除此之外，还有 **[华虹集成电路](https://link.zhihu.com/?target=http%3A//www.shhic.com/products.aspx)** 的 **SHC** 系列，以及 **[大唐微电子](https://link.zhihu.com/?target=https%3A//www.datang.com/productservice/ps1/list1.html)** 的 **DMT** 系列， **[紫光国微](https://link.zhihu.com/?target=https%3A//www.gosinoic.com/index.php%3Ff%3Dlists%26catid%3D10)** 的 **THD** 系列。这些芯片主要遵循 **[《ISO/IEC 7816》](https://zhida.zhihu.com/search?content_id=183189434&content_type=Article&match_order=1&q=%E3%80%8AISO%2FIEC+7816%E3%80%8B&zhida_source=entity)** 和 **[《ISO/IEC 14443 TypeA》](https://zhida.zhihu.com/search?content_id=183189434&content_type=Article&match_order=1&q=%E3%80%8AISO%2FIEC+14443+TypeA%E3%80%8B&zhida_source=entity)** 两部协议规范，本文主要介绍了笔者在日常工作当中，经常接触到的各类智能卡相关的技术与规范。

**如果觉得本文对你有所帮助，欢迎三连 `点赞` 、 `收藏` 、 `加关注` ，如果需要阅读带有书签和 LaTex 公式的完整版本，可以进入点击下面链接查阅笔者** [GitHub](https://link.zhihu.com/?target=https%3A//uinika.gitee.io/) **博客原文：**

![](https://pica.zhimg.com/v2-32c7f181890f509d1094d2b69ab2526a_1440w.jpg)

## 接触 & 非接触 & 双界面卡

接照用途和构成，可以将 IC 卡划分为 **存储卡** （Memory Card）和带有 CPU 的 **智能卡** （Smart Card）。

- **接触式卡** ：IC 芯片封装在 PVC 塑料里面，但是触点外露，需要与卡槽产生物理接触才能读写数据；
- **非接触式卡** ：IC 芯片依然被封装在 PVC 塑料当中，但是通过内置的线圈感应读写卡设备上的电磁波，从而实现非接触式的读写数据；
- **双界面卡** ：集 `接触式` 与 `非接触式` 接口为一体的单芯片智能卡，两种接口共享着相同的微控制器、操作系统、EEPROM；
![动图封面](https://pic2.zhimg.com/v2-0c7dc542241db56c6a0a6f3d591adfdd_b.jpg)

> **注意** ：许多 IC 卡芯片的数据手册当中， `读写卡设备` 通常被称为 **邻近耦合装置** （ **PCD** ，Proximity Coupling Device），而 `IC 卡片` 本身则通常被称为 **感应卡** （ **PICC** ，Proximity Card）。

## ISO/IEC 7816

**ISO/IEC 7816** 是一种标准化的接触式智能卡通信协议，主要用于读写 **接触式** 的集成电路卡，该协议由如下 14 个部分组成：

- **[ISO7816-1](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/14732.html)** ：物理特性；
- **[ISO7816-2](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/14733.html)** ：触点的尺寸与位置；
- **[ISO7816-3](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/38770.html)** ：电子接口与传输协议；
- **[ISO7816-4](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/77180.html)** ：用于交换的组织、安全、命令，即定义了如何使用 **应用程序标识符** 检索卡片中的应用程序，并且执行相关的检索操作；
- **[ISO7816-5](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/34259.html)** ：应用提供商注册，即通过对 **应用程序标识符** 进行国际注册，从而授予其唯一性；
- **[ISO7816-6](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/64598.html)** ：交换用行业间数据元素；
- **[ISO7816-7](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/28869.html)** ：用于结构化卡片查询语言（SCQL，Structured Card Query Language）的行业间指令 ；
- **[ISO7816-8](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/66092.html)** ：安全操作的命令与机制；
- **[ISO7816-9](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/67802.html)** ：卡片管理相关的指令；
- **[ISO7816-10](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/30558.html)** ：电子信号与同步卡的应答复位；
- **[ISO7816-11](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/67799.html)** ：采用生物特征识别的方法，来进行个人身份验证；
- **[ISO7816-12](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/40604.html)** ：USB 电气接口及操作过程；
- **[ISO7816-13](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/40605.html)** ：多应用环境下的应用管理命令；
- **[ISO7816-15](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/65250.html)** ：密码信息应用，即加密信息的通用语法和格式，以及在适当时共享此信息的机制

其中， **ISO/IEC 7816-4** 里面定义了 **应用协议数据单元** （APDU，Application Protocol Data Unit）相关的内容，包括接口上交换的 `命令-响应` 对的内容、检索 IC 卡里数据元素和数据对象的方法、通过历史字节的结构与内容来描述 IC 卡的工作特性、IC 卡当中程序和数据的结构、访问 IC 卡里文件和数据的方法、定义 IC 卡内文件与数据访问权限的安全体系结构、用于识别与定位 IC 卡当中应用的方法与机制、安全消息传递的方式、访问 IC 卡内置的处理算法；

> **注意** ：国际标准化组织并未提供标号为《ISO 7816-14》的技术规范；

## ISO/IEC 14443

**ISO/IEC 14443** 定义了 **Type A** 和 **Type B** 两种 IC 卡类型，它们均工作在 `13.56MHz` 无线频率，两者的主要区别在于调制方式、编码方案（协议第 2 部分）、协议初始化过程（协议第 3 部分）三个方面，但是都共同采用了协议第 4 部分定义的传输协议，该协议主要由如下 4 个部分组成：

- **[ISO/IEC 14443-1](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/73596.html)** ：物理特性；
- **[ISO/IEC 14443-2](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/82757.html)** ：射频电源以及信号接口；
- **[ISO/IEC 14443-3](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/76566.html)** ：初始化和防撞；
- **[ISO/IEC 14443-4](https://link.zhihu.com/?target=https%3A//www.iso.org/standard/76562.html)** ：传输协议；

`读写卡装置` 与 IC 卡之间的无线通信频率为 `13.56MHz` ，当 `读写卡装置` 对 IC 卡进行读写操作时，所发出的信号主要由 2 部分叠加组成：

1. **电源信号** ：是一组由 `读写卡装置` 向 IC 卡发送的固定频率电磁波，卡片内置 **LC 串联谐振电路** 的频率与 `读写卡装置` 发射的频率相同，在电磁波的激励下这个 LC 电路产生共振，让卡片内置的电容充满电荷，同时另一端连接的单向导通 **电子泵** 会将这些电荷传送至另一个电容进行存储，当累积电荷达到 `2V` 时，该电容就可以作为电源为卡片进行供电；
2. **指令与数据信号** ：用于 `读写卡装置` 指挥 IC 芯片完成数据的读取、修改、储存等操作，并且返回响应信号给 `读写卡装置` ，从而完成一次读写操作过程；

ISO/IEC 14443 可以具体划分为由恩智浦（NXP）等公司提出的 **Type A** ，以及由意法半导体（ST）等公司提出的 **Type B** 两种标准，两者的区别主要体现在 **IC 卡** 与 `读写卡装置` 之间的通讯调制方式：

1. **Type A 标准** ：表示数据 `1` 时，信号会出现 `0.2 ~ 0.3` 微秒的间隔；而当表示数据 `0` 时，信号可能有间隙也可能没有，这与前后的信息相关；这种方式优点在于信息区别明显，受干扰的机会少，反应速度快，不容易误操作；缺点在于当需要为 IC 卡提供更高的工作电压时，传输的电量有可能会出现波动；
2. **Type B 标准** ：表达数据 `1` 的信号幅度更大，而数据 `0` 的信号幅度更小，该方式的优点在于可以持续不断的传递信号，不会出现能量波动的情况；缺点在于数据区别不够明显，相对更容易受到外界干扰；

## Mifare 1 卡

恩智浦半导体于 1994 年 推出的 [Mifare Classic 系列](https://link.zhihu.com/?target=https%3A//www.nxp.com/products/rfid-nfc/mifare-hf/mifare-classic%3AMC_41863) 也被称为 **Mifare 1** ，即俗称的 **M1 卡** 。其工作频率为 `13.56MHZ` ，符合 **ISO 14443 Type A** 非接触式射频卡规范，虽然其采用的私有算法 **CRYPTO1** 已经遭到破解，但是由于目前国内市场上存在着大量与其相兼容的国产芯片（例如复旦微电子的 **[FM11RF08](https://link.zhihu.com/?target=http%3A//www.fmsh.com/7e67a741-a1ed-718d-15e3-83bdb6ecf4fa/)** 芯片），所以并不妨碍其被广泛使用在安全等级要求较低的场合。

![](https://pic1.zhimg.com/v2-93efd9a85ff52fcf15692a3ac7fd9842_1440w.jpg)

- **标准 M1 卡** ：第 `0` 扇区不可以进行修改，其它扇区则可以反复进行擦写；
- **UID 卡** ：所有区块都可以被重复擦写，可以重复修改卡片 ID ，并且响应后门指令（克隆卡会被使用后门指令检测到）；
- **CUID 卡** ：所有区块都可以被重复擦写，同样可以重复修改卡片 ID ，但是不会响应后门指令（避免克隆卡被后门指令检测）；
- **FUID 卡** ： `0` 区块只能够被写入一次，然后变为 M1 卡，在 CUID 复无效的情况下，或许可以绕开反克隆设备；

标准 Mifare 1 卡的 EEPROM 被划分为 **16** 个 **扇区** （Sectors），其中每个扇区由 **4** 个 **数据块** （Blocks）组成，每个数据块拥有 **16** 个 **字节** （Bytes）：

![](https://picx.zhimg.com/v2-8c07529169736013c051290c4471188b_1440w.jpg)

1. **厂商信息** （Manufacturer Block）：第 **0** 扇区的 **块 0** ，用于存放厂商的 32 位序列号，已经固化，只可读不可修改；
2. **数据块** （Data Blocks）：用于保存数据，可以直接读写，以特殊数据格式表示时，可以进行初始化赋值、加减值、读取值；
3. **扇区模块** （Value Blocks）：每个扇区的 **块 3** ，存放的是该扇区的密码 **A** （6 bytes）、存取控制（4 bytes）、密码 **B** （6 bytes）；
![](https://pic4.zhimg.com/v2-83ea07280a698762d9ae413214ba99cb_1440w.jpg)

1. **复位应答** （Request Standard/All）：上电复位之后，IC 卡使用 **应答请求码** （ **ATQA** ，Answer To Qequest）响应 `请求 REQA` 或 `唤醒 WUPA` 的指令；
2. **防碰撞循环** （Anticollision Loop）：当存在多张 IC 卡在读写卡装置的周围时，为了防止发生冲突与碰撞，需要从多张 IC 卡当中选择一张作为处理对象，而未选中的 IC 卡则会处于空闲模式，以等待下一步被选择，这个过程当中会返回一个被选中的 IC 卡序列号；
3. **选择 IC 卡** （Select Card）： 选择当前被选中的 IC 卡序列号，此时 IC 卡会返回一个 **选择确认码** （ **SAK** ，Select AcKnowledge）；
4. **三次互相确认** （Three Pass Authentication）：选定待处理的 IC 卡之后，读写卡装置开始确定当前所要访问的扇区号，并且对该扇区的密码进行校验，在经过三次互相确认之后，就可以通过加密的信号进行通信；而当选择另一个扇区时，则必须重新进行扇区的密码校验；

当 `IC 卡` 与 `读写卡装置` 完成上述认证过程之后，就可以执行如下操作步骤：

- **读写块** （Read/Write Block）：读写一个块当中的数据；
- **加减法** （Decrement/Increment）：对块当中的内容执行加减法，并将结果保存在 **内部传输缓冲区** ；
- **恢复** （Restore）：将一个块的内容移动至 `内部传输缓冲区` ；
- **传输** （Transfer）：将 `内部传输缓冲区` 的内容写入到一个 **数据块** ；
- **停止** （Halt）：将卡片置于暂停工作状态；

## 应用协议数据单元 APDU

应用协议数据单元（ **APDU** ，Application Protocol Data Unit）是卡片和外部应用之间的通信报文协议，其格式标准被定义在 **ISO7816-4** 当中，具体可以被划分为 **命令** 和 **响应** 两种类型：

- **命令 APDU** 由 `读写卡装置` 发送到 `智能卡` ，其中包含一个必选的 4 字节头部 `CLA + INS + P1 + P2` 以及 `0 ~ 255` 字节的数据；
- **响应 APDU** 由 `智能卡` 返回给 `读写卡装置` ，其中包含有必选的 2 字节状态字和 `0 ~ 255` 字节的数据；

下面表格展示了一个 APDU **命令-响应对** （Command-Response Pair），即 **命令 APDU** 和 **响应 APDU** ：

![](https://pic1.zhimg.com/v2-d34d6b9d6132ac9629ba82a7eb46aba2_1440w.jpg)

## 安全单元 SE

**安全元件** （ **SE** ，Secure Element）也称安全芯片，主要由安全硬件和软件两部分组成，硬件部分包括安全的运行环境、存储、算法、接口等；软件部分则提供安全的交互机制，确保 SE 与上位机之间命令与数据的交互安全。基于 SE 对数据进行安全处理，可以实现设备的身份认证、数据传输加密、敏感信息保护等功能。

伴随近年 5G 逐步组网商用，物联网在迎来较快发展的同时，安全问题日益突出，物联网的安全需求主要存在于如下四个方面：

1. 硬件设备的唯一标识符；
2. 硬件设备端与云服务端的双向身份认证；
3. 数据的加密传输；
4. 远程 OTA 的安全升级；

基于嵌入式安全元件 SE 提供的安全存储与运算环境，就可以为物联网设备运营者提供一个安全可信任的 **根** ，然后再由运营者发行 SE 当中的设备 ID 以及证书密钥等，结合云端的安全服务，从而形成一套完整的物联网安全方案。

## 智能卡操作系统 COS

**卡片操作系统** （ **COS** ，Card Operating System）紧密围绕着其所服务的智能卡特点而研发，设计时会紧密结合智能卡内置存储器的分区情况，并且遵循 ISO/IEC 7816 或者 ISO/IEC 14443 等国际标准，主要用于控制智能卡与外界的信息交换，管理智能卡当中的存储器，并且在智能卡内部完成各种命令的处理。由于目前主要解决的是如何处理与响应外部命令的问题，并不会涉及到共享和并发的管理，所以其本质上更加接近于监控程序，而非一个完整的操作系统。

> **注意** ： **[Java Card™](https://link.zhihu.com/?target=https%3A//www.oracle.com/java/java-card.html)** 目前已经成为 COS 事实上的工业标准，其以 Java 虚拟机作为基础，通过更为安全的方式来执行 Java Applet，并且支持多应用动态下载，具有平台无关、高安全性、高可靠性、一卡多用等特点。

## ARM SecurCore SC300

[ARM SecurCore](https://link.zhihu.com/?target=https%3A//developer.arm.com/ip-products/processors/securcore) 是一系列专门为高性能、大容量智能卡与嵌入式安全产品而设计的芯片内核架构，目前主要有如下两款：

- **ARM SecurCore SC000** ：针对 **超大容量** 的智能卡和嵌入式安全应用，内置了 **ARM Cortex-M0** 微控制器内核，功率较小，封装面积较小；
![](https://picx.zhimg.com/v2-a63db6993feb547e190c25d7afe9107f_1440w.jpg)

- **ARM SecurCore SC300** ：针对 **高性能** 的智能卡和嵌入式安全应，内置了 **ARM Cortex-M3** 微控制器内核，功率较大，封装面积较大；；
![](https://pic2.zhimg.com/v2-ca38fb755632894b3fc1cd662a2e1673_1440w.jpg)

## EMV 与 PBOC 银行卡标准

**EMV** （Europay MasterCard Visa）标准是由全球三大银行卡组织 **欧陆卡** （Europay）、 **万事达卡** （MasterCard）和 **维萨卡** （Visa）共同发起制定的银行卡技术标准，是基于 IC 卡的金融支付标准，目前已经成为全球公认的统一标准。其中，接触式卡片以 **ISO/IEC 7816** 作为标准，而 **非接触式卡片** 则主要以 **ISO/IEC 14443** 作为标准。

**中国人民银行** （PBOC，People's Bank of China）于 2013 年正式颁布《中国金融集成电路 IC 卡规范》 `V3.0` 版本，类似上面的介绍的 EMV，也属于一种 **金融集成电路智能卡** 感应端与接收端的规范标准。并且接触式卡片同样以 **ISO/IEC 7816** 作为标准，而 **非接触式卡片** 则主要以 **ISO/IEC 14443** 作为标准。

- 第 **1** 部分：《总则》；
- 第 **3** 部分：《与应用无关的 IC 卡与终端接口规范》；
- 第 **4** 部分：《借记贷记应用规范》；
- 第 **5** 部分：《借记贷记应用卡片规范》；
- 第 **6** 部分：《借记贷记应用终端规范》；
- 第 **7** 部分：《借记贷记应用安全规范》；
- 第 **8** 部分：《与应用无关的非接触式规范》；
- 第 **10** 部分：《借记贷记应用个人化指南》；
- 第 **12** 部分：《非接触式 IC 卡支付规范》；
- 第 **13** 部分：《基于借记贷记应用的小额支付规范》；
- 第 **14** 部分：《非接触式 IC 卡小额支付扩展应用规范》；
- 第 **15** 部分：《电子现金双币支付应用规范》；
- 第 **16** 部分：《IC 卡互联网终端规范》；
- 第 **18** 部分：《基于安全芯片的线上支付技术规范》；

> **更多我所制作的 UINIO 系列开源硬件，可以直接访问下面的链接地址来获取，包括全套原理图与 PCB 布线文件，以及相关的数据手册：**

![](https://picx.zhimg.com/v2-c9f1405a9fc72ba2a0418450e80c0077_1440w.jpg)

> **答主在成都的 IT 行业工作近十余年，经常会在自己的** **[电子技术博客 UinIO.com](https://link.zhihu.com/?target=http%3A//www.uinio.com)** **当中分享一些产业与技术相关的文章， [赠人玫瑰](https://www.zhihu.com/search?q=%E8%B5%A0%E4%BA%BA%E7%8E%AB%E7%91%B0&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A2370772997%7D) ，手有余香，大家的【点赞、收藏、加关注】将会是我持续写作的最大动力。**

![](https://pica.zhimg.com/v2-94f658834fa854d1f09253ec549ef200_1440w.jpg)

[所属专栏 · 2024-11-14 01:41 更新](https://zhuanlan.zhihu.com/chengdu)

[![](https://pic1.zhimg.com/v2-329673c5ac4ab99ed5a7c2977ebf47b7_720w.jpg?source=172ae18b)](https://zhuanlan.zhihu.com/chengdu)

[成都IT圈](https://zhuanlan.zhihu.com/chengdu)

[

Hank

365 篇内容 · 15566 赞同

](https://zhuanlan.zhihu.com/chengdu)

[

最热内容 ·

都说计算机今年炸了，究竟炸到什么程度呢?

](https://zhuanlan.zhihu.com/chengdu)

编辑于 2023-06-07 17:55・北京[物联网](https://www.zhihu.com/topic/19551271)[香港公司+银行公户=跨境王炸！轻松解决海外收款和结汇难题！](https://zhuanlan.zhihu.com/p/1938924996882863725)

[

在跨境电商蓬勃发展的当下，越来越多的卖家面临个人账户收款的合规困境。而香港公司银行账户凭借其跨境结算高效、多币种适配、支付智能、资金自由、线上服务便捷、税收优惠以及金融服...

](https://zhuanlan.zhihu.com/p/1938924996882863725)