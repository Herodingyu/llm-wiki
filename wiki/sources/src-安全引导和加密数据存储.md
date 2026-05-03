---
doc_id: src-安全引导和加密数据存储
title: 安全引导和加密数据存储
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/安全引导和加密数据存储.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

1 人赞同了该文章 大家好！我是不知名的 [安全工程师](https://zhida.zhihu.com/search?content_id=233331290&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E5%B7%A5%E7%A8%8B%E5%B8%88&zhida_source=entity) Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

## Key Points

### 1. 前言
之前我们一起学习了怎么使用OPTEE与TrustZone进行可信应用的开发，今天我们来看看另外一个重要的方面：安全引导和加密 [数据存储](https://zhida.zhihu.com/search?content_id=233331290&content_type=Article&match_order=1&q=%E6%95%B0%E6%8D%AE%E5%AD%98%E5%82%A8&zhid

### 2. 什么是安全引导？
安全引导确保只有经过身份验证的软件才能在设备上运行，并通过在执行代码之前验证软件的数字签名来实现。 为了实现安全引导，需要处理器/SoC支持。根据我们的经验，一些具有现成文档的更安全的引导友好型处理器包括NXP i.MX/QorIQ Layerscape、Xilinx Zynq、Atmel SAMA5、TI Sitara和高通Snapdragon系列。

### 3. 保护知识产权和用户数据
虽然安全引导可以确保真实性， **但它不能保护设备不被伪造** ，也不能防 **止黑客离线从设备中提取用户/应用程序数据（即使用外部硬件机制读取非易失性存储器，如NAND、eMMC）。** **用户数据隐私和保护可能是合规性的要求，例如医疗设备上的HIPAA** 。如果需要数据 [保密性](https://zhida.zhihu.com/search?content_id=233331290&co

### 4. 识别要保护的组件
典型的基于Linux的系统具有以下组件： - 引导加载程序 - 内核， [设备树](https://zhida.zhihu.com/search?content_id=233331290&content_type=Article&match_order=1&q=%E8%AE%BE%E5%A4%87%E6%A0%91&zhida_source=entity)

### 5. 引导程序身份验证（BootRom）
引导程序身份验证是特定于处理器的。然而，高级别机制通常是相同的，它涉及： - 创建公钥/私钥对 - 计算引导加载程序镜像的 [哈希](https://zhida.zhihu.com/search?content_id=233331290&content_type=Article&match_order=1&q=%E5%93%88%E5%B8%8C&zhida_source=entity)

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/安全引导和加密数据存储.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/安全引导和加密数据存储.md|原始文章]]

## Key Quotes

> "一些TI Sitara处理器（AM335x）可能涉及TI对签名密钥和自定义零件号的工厂编程。"

> "止黑客离线从设备中提取用户/应用程序数据（即使用外部硬件机制读取非易失性存储器，如NAND、eMMC）。"

> "用户数据隐私和保护可能是合规性的要求，例如医疗设备上的HIPAA"

> "用于加密数据的密钥也需要受到保护"

> "将信任方案一直扩展到用户空间涉及建立信任链。"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/安全引导和加密数据存储.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/安全引导和加密数据存储.md|原始文章]]
