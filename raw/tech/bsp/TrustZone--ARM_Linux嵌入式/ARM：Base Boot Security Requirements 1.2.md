---
title: "ARM：Base Boot Security Requirements 1.2"
source: "https://zhuanlan.zhihu.com/p/654308687"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！ ARM的Base Boot Security Requirements 1.2内容： 密码身份验证：为了确保只有授权的用…"
tags:
  - "clippings"
---
[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770)

---

大家好！我是不知名的 [安全工程师](https://zhida.zhihu.com/search?content_id=233530452&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E5%B7%A5%E7%A8%8B%E5%B8%88&zhida_source=entity) Hkcoco！

欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

获取更多精彩内容哦！！！

---

ARM的Base Boot Security Requirements 1.2内容：

- 密码身份验证：为了确保只有授权的用户可以访问和启动基于ARM的产品，Base Boot Security Requirements 1.2强烈要求产品实现密码身份验证机制。该机制可以包括输入密码、使用 [生物识别技术](https://zhida.zhihu.com/search?content_id=233530452&content_type=Article&match_order=1&q=%E7%94%9F%E7%89%A9%E8%AF%86%E5%88%AB%E6%8A%80%E6%9C%AF&zhida_source=entity) 或其他身份验证方法来验证用户的身份，以防止未经授权的访问和启动。密码身份验证机制应当具有足够的强度和安全性，以抵御各种攻击和破解尝试。
- 安全启动：Base Boot Security Requirements 1.2要求产品必须实现安全启动机制。这包括验证 [引导加载程序](https://zhida.zhihu.com/search?content_id=233530452&content_type=Article&match_order=1&q=%E5%BC%95%E5%AF%BC%E5%8A%A0%E8%BD%BD%E7%A8%8B%E5%BA%8F&zhida_source=entity) （Bootloader）、内核映像和其他启动软件的完整性和真实性。在加载和运行这些软件之前，产品必须使用 [数字签名](https://zhida.zhihu.com/search?content_id=233530452&content_type=Article&match_order=1&q=%E6%95%B0%E5%AD%97%E7%AD%BE%E5%90%8D&zhida_source=entity) 、散列或其他安全技术来验证它们的来源和内容。安全启动机制还可以包括对 [硬件配置](https://zhida.zhihu.com/search?content_id=233530452&content_type=Article&match_order=1&q=%E7%A1%AC%E4%BB%B6%E9%85%8D%E7%BD%AE&zhida_source=entity) 的验证，以确保系统在启动时处于受控状态。
- [安全存储](https://zhida.zhihu.com/search?content_id=233530452&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E5%AD%98%E5%82%A8&zhida_source=entity) ：Base Boot Security Requirements 1.2要求产品必须实现安全存储机制。这包括对固件、操作系统和其他软件的加密存储和 [访问控制](https://zhida.zhihu.com/search?content_id=233530452&content_type=Article&match_order=1&q=%E8%AE%BF%E9%97%AE%E6%8E%A7%E5%88%B6&zhida_source=entity) 。产品应使用 [加密算法](https://zhida.zhihu.com/search?content_id=233530452&content_type=Article&match_order=1&q=%E5%8A%A0%E5%AF%86%E7%AE%97%E6%B3%95&zhida_source=entity) 和技术来保护数据的完整性和机密性，并采取措施防止未经授权的访问、修改或删除。此外，安全存储机制还应确保在系统升级或维修时，旧版本的软件可以被安全地覆盖或删除。
- 安全更新：Base Boot Security Requirements 1.2要求产品必须能够安全地更新固件和软件。这包括使用数字签名、加密或其他安全技术来确保只有经过授权的更新可以成功安装和运行。产品应具有内置的更新机制，并能够验证更新的完整性和真实性。安全更新机制还应确保在更新过程中数据的完整性和机密性，并防止任何未经授权的访问或修改。
- 安全 [外设接口](https://zhida.zhihu.com/search?content_id=233530452&content_type=Article&match_order=1&q=%E5%A4%96%E8%AE%BE%E6%8E%A5%E5%8F%A3&zhida_source=entity) ：Base Boot Security Requirements 1.2要求产品必须保护与外设接口的所有通信。这可以通过使用加密、 [安全协议](https://zhida.zhihu.com/search?content_id=233530452&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E5%8D%8F%E8%AE%AE&zhida_source=entity) 或其他安全技术来实现，以确保只有经过授权的 [外部设备](https://zhida.zhihu.com/search?content_id=233530452&content_type=Article&match_order=1&q=%E5%A4%96%E9%83%A8%E8%AE%BE%E5%A4%87&zhida_source=entity) 可以与产品进行通信。此外，产品还应采取措施防止未经授权的访问、修改或删除外设中的数据。

除了以上详细描述的方面，Base Boot Security Requirements 1.2还包括其他一些要求和 [最佳实践](https://zhida.zhihu.com/search?content_id=233530452&content_type=Article&match_order=1&q=%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5&zhida_source=entity) ，例如使用最新的安全标准和协议、定期进行 [安全漏洞](https://zhida.zhihu.com/search?content_id=233530452&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E6%BC%8F%E6%B4%9E&zhida_source=entity) 评估和修复、实施严格的数据备份和恢复策略等。这些要求旨在确保基于ARM的产品具有足够的安全性和稳定性，以保护用户的数据和系统的完整性。

> 本文使用 [Zhihu On VSCode](https://zhuanlan.zhihu.com/p/106057556) 创作并发布

发布于 2023-09-04 23:12・四川[30 岁 Java 仍在 "霸榜"：开发者凭什么还在为它熬夜？](https://zhuanlan.zhihu.com/p/1938208968003556959)

[

作为一名陪着 Java 走了小半辈子的开发者，敲下这个标题时，键盘都带着点温度。 1995 年诞生的 Java，这...

](https://zhuanlan.zhihu.com/p/1938208968003556959)