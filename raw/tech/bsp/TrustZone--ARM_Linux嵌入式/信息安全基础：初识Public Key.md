---
title: "信息安全基础：初识Public Key"
source: "https://zhuanlan.zhihu.com/p/659658263"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！ PerFace随着车联网的快速发展，给车主带来便利的同时，也带来了潜在隐患。 便利的一面…"
tags:
  - "clippings"
---
2 人赞同了该文章

---

大家好！我是不知名的安全工程师Hkcoco！

欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

获取更多精彩内容哦！！！

---

## PerFace

随着车联网的快速发展，给车主带来便利的同时，也带来了潜在隐患。

- 便利的一面：无钥匙进入、远程启动、远程升级（OTA，Over-the-Air ）、远程诊断等等；
- 隐患的一面：敏感个人信息泄露、车辆被远程黑客操控等等。

大家可能觉得车辆被黑客操控等事件远不可及，但是，这种事件真实存在，大家可以通过关键字“Yandex Taxi 黑客攻击”检索一下相关新闻。2022年，黑客通过俄罗斯叫车软件Yandex Taxi，将所有可预约的车辆呼叫至莫斯科，导致当地交通挤塞。再说敏感个人信息泄露的问题，引用《汽车整车信息安全技术要求》对“敏感个人信息”的描述：

**“一旦泄露或者非法使用，可能导致车主、驾驶人、乘车人、车外人员等受到歧视或者人身、财产安全受到严重危害的个人信息，包括车辆行踪轨迹、音频、视频、图像和生物识别特征等信息。”**

所以，提高车辆信息安全的问题，迫在眉睫。在立法方面，欧盟等西方国家已经出台 [ISO 21434](https://zhida.zhihu.com/search?content_id=234719006&content_type=Article&match_order=1&q=ISO+21434&zhida_source=entity) 、 [WP29](https://zhida.zhihu.com/search?content_id=234719006&content_type=Article&match_order=1&q=WP29&zhida_source=entity) 等相关法规，国内，《汽车整车信息安全技术要求》也已经处于送审状态。所以，作为汽车人，我们又怎能不嗅到信息安全的重要性呢？

“万丈高楼平地起，一砖一瓦皆根基”，本文，从信息安全的一个关键词" [Public Key](https://zhida.zhihu.com/search?content_id=234719006&content_type=Article&match_order=1&q=Public+Key&zhida_source=entity) "聊起，讨论如下内容：

- 什么是Public Key
- Public Key何时写入及存储

## 1、什么是Public Key

Public Key，俗称"公钥"，相对于 [私钥](https://zhida.zhihu.com/search?content_id=234719006&content_type=Article&match_order=1&q=%E7%A7%81%E9%92%A5&zhida_source=entity) （Private Key）**,公钥可用来验证对应私钥的签名，即："验签"** 。公钥可以发送给第三方使用， **而私钥只能节点自身或者信任中心（Trust Center）保管，不能让第三方知道** 。

工程开发中，Public Key又分为 [Development Public Key](https://zhida.zhihu.com/search?content_id=234719006&content_type=Article&match_order=1&q=Development+Public+Key&zhida_source=entity) （开发公钥）和 [Product Public Key](https://zhida.zhihu.com/search?content_id=234719006&content_type=Article&match_order=1&q=Product+Public+Key&zhida_source=entity) （产品公钥）。

- Development Public Key：在软件开发阶段所使用的公钥称为开发公钥。
- Product Public Key：当应用软件开发完成， **需要释放到产线（EOL，End Of Line）刷写应用软件前，需要提前写入公钥** ，公钥仅写入一次，不可修改。有些需求中， **将其视为验证应用软件的可信任根或者可信锚（Trust Anchor）。**

Development Public Key和Product Public Key本质上没有太大区别，均可以传播，只是一个在软件开发阶段使用，一个在软件释放到产线时使用。

既然Public Key的主要作用是验签，那就不得不提签名算法（Signing Method），工程上， **常用 [SHA256](https://zhida.zhihu.com/search?content_id=234719006&content_type=Article&match_order=1&q=SHA256&zhida_source=entity) 、 [RSA2048](https://zhida.zhihu.com/search?content_id=234719006&content_type=Article&match_order=1&q=RSA2048&zhida_source=entity) 组合进行签名操作。**

## （一）SHA256、RSA2048作用

- RSA-2048：非对称成加密算法，发送方和接收方均各有一组公钥和私钥key。因存在幂运算，非对称加密算法计算速度远低于AES-256等算法（对称算法，加密速度快，适用于大量数据加密）。非对称算法适用于小量数据加密，eg：Public key加密。
- SHA-256：安全Hash（哈希）算法，主要用于数据完整性（Integrity）验证。功能与CRC类似，相比于CRC的完整性校验，SHA-256的完整性验证更可靠。

所以，RSA-2048用于小量数据（eg：签名信息、公钥等）非对称加密，SHA-256用于数据完整性校验。

关于这两个算法，在前文 [【《信息安全（下）：软件认证（Authentication）》】](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyNDU4NTc1NQ%3D%3D%26mid%3D2247490586%26idx%3D1%26sn%3D2be4a4463af77a9e06b1d5e8234e2a32%26chksm%3Dfa2a426ecd5dcb7887cc052269b0a3aac3519e833fc3345629d8337529ccff8f4245fdd9ed6b%26scene%3D21%23wechat_redirect) 已经聊过。

## 2、Public Key何时写入及存储

> $2E服务是指根据标识符写入数据服务（WriteDataByIdentifier），它允许诊断仪将相关信息写入到数据标识符（DID）规定的 [ECU](https://zhida.zhihu.com/search?content_id=234719006&content_type=Article&match_order=1&q=ECU&zhida_source=entity) 内部位置。
> 
> 在执行此服务之前，ECU必须通过安全访问服务（$27）使其解锁。诊断仪的请求包含一个2字节的DID和一个带有要写入数据的dataRecord。通过本服务写入的DID数值应立即保存结果至EEPROM，由于EEPROM写入时间较长，因此需要注意，必须要在完成全部EEPROM操作后，才能给出最终响应，若无法在规定时间内给出最终响应，应该启用增强型定时参数（NRC78）。

Public Key可以通过$2E（Write Data By Identifier service）写入ECU。可是，Public Key何时写入到ECU中呢？由于Public Key的主要作用是验证（Verify）软件块（Software Part），一般来说， **Public Key需要在刷写App、Cal等程序之前写入，以便于验证软件块有效性。**

> ECU（电子控制单元）是现代汽车的重要组成部分，相当于汽车的“大脑”。ECU控制汽车的大多数电子系统和燃油系统，控制车辆运行。每个系统都由各自的ECU进行控制，通过 [CAN总线](https://zhida.zhihu.com/search?content_id=234719006&content_type=Article&match_order=1&q=CAN%E6%80%BB%E7%BA%BF&zhida_source=entity) 进行数据通信。ECU通常安装在汽车内部，通过接收传感器信号来控制执行器动作，从而实现车辆的各种功能，如发动机控制、变速控制、车身电子稳定系统等。
> 
> 随着汽车技术的发展，ECU的数量和复杂度也在不断增加。现代汽车可能拥有多达80个ECU，这些ECU之间通过CAN、LIN、FlexRay和MOST等总线系统进行通信。随着电子和软件在车辆中的增加，ECU的数量预计将继续增长。

**既然Public Key是验证其它信息的基础，那么就需要Public Key存储在一块重要区域** ，eg：HSM NVM。同时，确保此区域不能被修改，工程上，常常要求Public Key（这里指产品公钥）刷写到OTP（One-Time-Programmable）区域，即：只能进行一次编程，以防公钥写入后的非法篡改。

> HSM（硬件安全模块）和NVM（非易失性存储器）都是信息安全领域的重要组件。 HSM提供了一个离散的“安全隔区”，可以在其中执行加密操作。这些外设通常包含大量可重新编程的NVM，如EEPROM或闪存，用于在安全隔区内存储机密信息，以防止恶意攻击或意外泄露。这些器件是主机控制器的从属外设，可用于各种应用。 在一些特定应用中，比如汽车安全领域，一些制造商开发了安全硬件扩展（SHE）规范，定义了可以集成到芯片组中的极简HSM。SHE架构已被专为汽车市场设计的安全芯片组广泛采用。在这种架构中，SHE被实现为具有基于高级加密标准（AES）算法的加密功能的状态机，并包含足够的NVM来存储所需的密钥和计数器。

这就意味着： **控制器在产线刷写一次公钥（Product Public Key），此公钥伴随此产品终身，以后的App等程序升级中，依然使用它，示意如下：**

![](https://pic3.zhimg.com/v2-8b9478a3fe47c221cecc6cf3b8ee7bd8_1440w.jpg)

VBT（Verification Block Table），用于存储其它软件块的Hash Value。

\*\*所以，当程序进行验证的时候，首先验证VBT的Hash Value（也称为根哈希，Root Hash）是否有效。\*\*如果Root Hash有效，则认为VBT中存储的其它模块Hash Value可信，之后通过算法（eg：SHA-256）计算出对应软件块的哈希值进行完整性校验。关于VBT格式以及可以参考前文 [《信息安全（上）：软件认证（Authentication）》](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyNDU4NTc1NQ%3D%3D%26mid%3D2247490561%26idx%3D1%26sn%3Dcd3ad56c4d24b4474dd0e1cb2bb10a6a%26chksm%3Dfa2a4275cd5dcb63436b8f45ba9ad3d25b296bdbc246829456b1ea63625e817d02ff8e6014fe%26scene%3D21%23wechat_redirect) 。

**补充信息：**

- VBT的哈希值（Root Hash Value）通过私钥进行非对称加密，生成数字签名（Digital Signatures）发送给ECU，ECU使用公钥对数字签名解密，算出Root Hash Value #1，同时，ECU通过VBT的起始地址和长度计算Root Hash Value #2，如果Root Hash Value #1 == Root Hash Value #2，则Root Hash验证通过。
- 数字签名：验证信息来源和完整性的技术，使用私钥（Private Key）对目标数据进行加密，生成数字签名，再用公钥进行验证。

## 3、拓展思考

既然公钥是软件信息认证的基础，那么公钥的合法性势必需要先行确认，即：如何知道写入芯片内的公钥没有被篡改呢？

答： **通过写入的公钥与服务器握手。因为服务器存有私钥，同时，配对的公钥又是服务器给的，只要两者可以有效握手，即可说明公钥的有效性** 。 **在产线端，通过$2E服务写入（第一次写公钥），因为此阶段，车辆未连接网络，公钥被篡改的可能性微乎其微** 。如果通过OTA进行软件更新时， **车辆连接网络的情况下，需要使用公钥与服务器握手（公钥已写过）** ，以此验证公钥的合法性。其实，不管是产线、OTA还是售后4S店，应用软件更新过程中有软件完整性和兼容性验证步骤，如果公钥验证失败，需要有公钥非法性提示。

## 参考文献

[【原文链接】](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s/fVkcB5nitlZpiaCo3_M45Q)

> 本文使用 [Zhihu On VSCode](https://zhuanlan.zhihu.com/p/106057556) 创作并发布

发布于 2023-10-05 20:11・四川[WAIC观察：AI能源挑战的解法，是“以AI治AI”？](https://zhuanlan.zhihu.com/p/1932042546021893341)

[

编前语：WAIC作为全球“顶流”AI盛会，越发炙手可热。有幸，施耐德电气也参与其中——我们不仅提供算力时代的电力解决方案，...

](https://zhuanlan.zhihu.com/p/1932042546021893341)