---
doc_id: src-从硬件架构与软件架构看trustzone-v2-0
title: 从硬件架构与软件架构看TrustZone V2.0
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/从硬件架构与软件架构看TrustZone-V2.0.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

18 人赞同了该文章 大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

## Key Points

### 1. 前言
之前写过一篇 [【从硬件架构与软件架构看TrustZone】](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s/LMkV4VnE2hz7R2SATId4Tw) ，当时忘记在CSDN发布了，最近又看到了这篇文章，感觉里面有一些东西是我文章里面不具备的，尤其是关于内存部分。

### 2. 1\. TrustZone介绍


### 3. 1.1 安全背景
在介绍TrustZone前有必要简单回顾下目前的一些安全手段。 CPU通过内存映射手段给每个进程营造一个单独的地址空间来隔离多个进程的代 码和数据，通过内核空间和用户空间不同的特权级来隔离操作系统和用户进程的代码和数据。 **但由于内存中的代码和数据都是明文，容易被同处于内存中的其它应用偷窥，因此出现了扩展的安全模块，应用将加密数据送往安全模块，由安全模块处理完后再返回结果给相应的应用。**

### 4. 1.2 TrustZone
TrustZone是ARM针对消费电子设备设计的一种硬件架构，其目的是为消费电子产品构建一个安全框架来抵御各种可能的攻击。 TrustZone在概念上将SoC的硬件和软件资源划分为安全(Secure World)和非安全(Normal World)两个世界，所有需要保密的操作在安全世界执行（ **如指纹识别、密码处理、数据加解密、安全认证等** ），其余操作在非安全世界执行（如用户操作系统、各种应

### 5. SOC如何支持TrustZone？
设计上，TrustZone并不是采用一刀切的方式让每个芯片厂家都使用同样的实现。总体上以AMBA3 AXI总线为基础，针对不同的应用场景设计了各种安全组件，芯片厂商根据具体的安全需求，选择不同的安全组件来构建他们的TrustZone实现。 其中主要的组件有：

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/从硬件架构与软件架构看TrustZone-V2.0.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/从硬件架构与软件架构看TrustZone-V2.0.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/从硬件架构与软件架构看TrustZone-V2.0.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/从硬件架构与软件架构看TrustZone-V2.0.md|原始文章]]
