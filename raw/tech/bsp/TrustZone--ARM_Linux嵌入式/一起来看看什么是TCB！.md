---
title: "一起来看看什么是TCB！"
source: "https://zhuanlan.zhihu.com/p/653411584"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco 获取更多精彩内容哦！！！ Hi ALL！ AcronymTC（Trusted Computing）可信计算（Trusted Computing，简称TC）是一…"
tags:
  - "clippings"
---
4 人赞同了该文章

---

大家好！我是不知名的安全工程师Hkcoco！

欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

获取更多精彩内容哦！！！

---

Hi ALL！

## Acronym

- TC（ [Trusted Computing](https://zhida.zhihu.com/search?content_id=233331297&content_type=Article&match_order=1&q=Trusted+Computing&zhida_source=entity) ）可信计算（Trusted Computing，简称TC）是一项由TCG(可信计算组)推动和开发的技术。
- TPM（Trusted Platform Module）可信平台模块，是一种植于计算机内部为计算机提供可信根的芯片。该芯片的规格由可信计算组（Trusted Computing Group）来制定。
- TCM（ [trusted cryptography module](https://zhida.zhihu.com/search?content_id=233331297&content_type=Article&match_order=1&q=trusted+cryptography+module&zhida_source=entity) ）可信密码模块， 是可信计算平台的硬件模块，为可信计算平台提供密码运算功能，具有受保护的存储空间，是我国国内研究，与TPM对应。
- TPCM（Trusted Platform Control Module）可信平台控制模块，让可信平台模块具有对平台资源进行控制的功能。
- TSS（TCG Software Stack）可信软件栈，是可信计算平台上TPM的支撑软件。TSS的主要作用是为操作系统和应用软件提供使用TPM的接口。
- TNC（ [Trusted Network Connect](https://zhida.zhihu.com/search?content_id=233331297&content_type=Article&match_order=1&q=Trusted+Network+Connect&zhida_source=entity) ）可信网络连接技术，用来实现平台到网络的可信扩展，以确保网络的可信。

## Preface

最近在逛红帽论坛的时候看到了一个Lily Sterman提了一个概念 [TCB](https://zhida.zhihu.com/search?content_id=233331297&content_type=Article&match_order=1&q=TCB&zhida_source=entity) ，这个是我第一次接触到，在进一步学习大佬博客的时候，发现对于安全可信一些新的认识和看法，很精彩，于是这里做一篇中文的学习笔记，与君共赏。

## 什么是TCB？

在计算机系统的世界里，一个系统或组件被“trusted”意味着什么？为什么这很重要？在这篇文章中，我们将概述什么是可信计算基础（TCB），并为如何评估TCB的安全性提供一个框架。

我们还将更深入地了解“trusted”在这种情况下的含义。

尽管名称上有一些相似之处， **但可信计算库（TCB）并不像可信平台模块（TPM）那样指代特定的芯片或规范** 。系统的可信计算基础TCB是安全体系结构中的一个术语，指的是 **对建立和维护特定系统的安全性至关重要的所有系统组件。**

具有安全属性的系统将具有TCB， **并且TCB中包含的组件可能因系统而异** 。因此，任何关心系统安全性的计算机系统工作人员都应该能够对TCB和特定TCB提供的安全保证进行推理。

让我们更仔细地研究可信计算库中的各个术语。

TCB中的组件被称为Base，因为它们是系统安全性的基础。

它们是一个计算基础，因为上下文是一个计算机系统。

但是“可信”这个词呢？这是否意味着TCB中的组件是安全的？我们将在下文中看到，尽管“信任”一词通常具有含义，但情况并非如此。

Trusted Computing Base所扮演角色的一个更准确、更具描述性的名称可能是 **Powerful Computing Base** ，或者可能是 **Security-Critical Computing Base** 。

## Trusted!= secure

也许最令人惊讶的是，“可信任”的系统组件不一定是安全的或可信任的。

在正常用法中，“可信”通常意味着某事或某人是可靠的、真实的或值得信任的。

在计算机安全的上下文中， **“可信”只是指对系统范围内的安全至关重要** 。

**请注意，这个定义并没有说明受信任组件是否能够抵御任何攻击，只是说它在系统的安全性中发挥着不可或缺的作用。**

---

**这句话真的，让我身体仿佛吹过了一阵微风**

---

由于受信任组件的关键安全角色，我们必须将所有这些组件结合起来，为系统提供预期的安全属性。

**这意味着，如果任何受信任的组件未能按预期运行，系统可能会受到损害。**

这就是为什么计算机系统 **中任何受信任的组件都应该需要额外的审查** ：我们怎么能知道这个组件值得我们信任呢？

## 如何验证TCB的信任

在安全方面， **可信度尽可能植根于形式验证或加密测量，这可以从数学上证明系统或其组件的行为符合预期。**

密码学之所以强大，是因为它以一种可以外部检查或审计的方式提供了这种证明，而不必相信别人的话，即系统是安全的。

例如， [Keylime](https://zhida.zhihu.com/search?content_id=233331297&content_type=Article&match_order=1&q=Keylime&zhida_source=entity) 是一个由 [Red Hat](https://zhida.zhihu.com/search?content_id=233331297&content_type=Article&match_order=1&q=Red+Hat&zhida_source=entity) 首席技术官办公室的开发人员参与的CNCF项目，它根据已知的良好列表检查远程机器的加密测量结果，以确定系统是否被篡改。

这允许远程方（如云场景中的租户）验证机器的状态，而不是相信云提供商的基础设施没有受到损害。对于敏感数据或应用程序，此功能可能至关重要。

（加密的算法的意义）

**然而，并不是所有的组件或状态都适用于加密测量** 。为了建立这些组件的可信度，还有下一个最佳选项，例如可审计性。

**开源代码的许多好处之一是它的可审计性** ——一个广泛的感兴趣的社区可以检查开源代码中的错误或恶意行为。

**证明可信度的另一个重要方法是篡改证据** 。 **检测篡改的难度向堆栈顶部增加** ，并进一步远离硬件。

**出于这个原因，许多旨在更安全的系统都包含了硬件信任根，例如可信平台模块（TPM）。**

为了可信，TCB应该通过只包括具有可测量性、可审计性或篡改证据等特性的组件来证明其安全性。

在大多数现实世界的场景中，任何TCB都只能部分实现这一目标：一些系统组件，例如CPU，始终对安全至关重要（因此包含在TCB中），但目前无法以有意义的方式进行测量或审计。

尽管存在这种限制，TCB仍然可以通过展示尽可能多的组件的这些特性，在更安全的一端着陆。

## 复杂性增加了风险

考虑到攻击面的概念，大型复杂的TCB将更难安全、审计或完全测量。

一个理想的TCB是小而简单的，同时仍然能够为系统提供必要的安全保障。

在良好的安全体系结构中，在TCB中包含任何组件都必须有充分的理由，因为添加的每个组件都会成为添加的单个故障点。

在设计一个旨在更安全的系统时，要问的一些相关问题包括：

- 这个组件能够提供的安全属性是否超过了添加它带来的风险？
- 该组件是否有必要包含在TCB中？
- 或者另一个组件是否可以提供这些相同的属性？

也许与直觉相反，系统中不受信任的组件越多，其攻击面就越小。

如果某个组件不受信任， **则它已从维护系统安全的关键路径中删除** ，因此我们不必担心它对系统安全保障的影响。

甚至可以说，不受信任的组件“预计”会受到损害：从系统的角度来看，它们的损害是可以接受的，因为它们不能有意义地改变系统的预期安全保证。

哈哈哈，这个角度还是蛮有意思的。

例如，可信执行环境（TEE），如 [Intel SGX](https://zhida.zhihu.com/search?content_id=233331297&content_type=Article&match_order=1&q=Intel+SGX&zhida_source=entity) 或 [AMD SEV](https://zhida.zhihu.com/search?content_id=233331297&content_type=Article&match_order=1&q=AMD+SEV&zhida_source=entity) ，是特定CPU上可用的受保护内存区域，

应用程序可以在其中运行，而底层主机（系统管理程序、内核等）无法更改或检查应用程序。

这种运行时加密将主机从应用程序的TCB中删除——恶意或受损害的主机将不再影响应用程序或其数据的机密性或完整性。

**主机现在可以被称为不受信任，因为它的行为对应用程序的安全性不再至关重要。**

我想这里我暂时把其当作REE侧的东西对于我在TEE侧的计算不影响，即使外面是坏蛋，理论设计上也不允许你拿到我的隐私的东西。

## Always verify

标记为“trusted”的系统组件应持怀疑态度，直到它们显示出安全属性，如可测量性或可审计性。

理想情况下， **加密测量或对组件按预期运行的正式验证应该由这些组件来证明** 。

在设计更安全的系统时， **TCB应尽可能小，以减少攻击面。**

## Brief Summary

一种想法是，在正常使用中， **受信任的实体是你可以信任的实体（无论你是否需要）** 。

在技术环境中，受信任的系统组件是您必须信任的组件（无论您是否可以信任，或是否应该信任）。

> 本文使用 [Zhihu On VSCode](https://zhuanlan.zhihu.com/p/106057556) 创作并发布

发布于 2023-08-31 07:56・四川[PMP备考最全攻略：如何一举拿下3A](https://zhuanlan.zhihu.com/p/667061875)

[

PMP备考经历我的PMP备考之旅，简直就是一场冒险故事。要说备考PMP，这篇文章绝对是宝贵的参考，文字简洁明了，直击要害...

](https://zhuanlan.zhihu.com/p/667061875)