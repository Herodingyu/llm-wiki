---
doc_id: src-kinibi-tee-的可信环境及相关漏洞与利用方法
title: KINIBI TEE 的可信环境及相关漏洞与利用方法
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/KINIBI TEE 的可信环境及相关漏洞与利用方法.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

1 人赞同了该文章 大家好！我是不知名的 [安全工程师](https://zhida.zhihu.com/search?content_id=233530479&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E5%B7%A5%E7%A8%8B%E5%B8%88&zhida_source=entity) Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

## Key Points

### 1. 前言
很多Android设备和 [嵌入式系统](https://zhida.zhihu.com/search?content_id=233530479&content_type=Article&match_order=1&q=%E5%B5%8C%E5%85%A5%E5%BC%8F%E7%B3%BB%E7%BB%9F&zhida_source=entity) 都使用TEE(Trusted Executio

### 2. TrustZone
在Trustzone [体系结构](https://zhida.zhihu.com/search?content_id=233530479&content_type=Article&match_order=1&q=%E4%BD%93%E7%B3%BB%E7%BB%93%E6%9E%84&zhida_source=entity) 中，TEE运行在安全状态的EL1异常级别。可以在此基础上加载可信的应用

### 3. Kinibi
Kinibi是由Trustonic(也称为T-Base或Mobicore)构建的TEE实现，主要用于Mediatek和ExynosSoC。Kinibi由多个组件组成： - [微内核](https://zhida.zhihu.com/search?content_id=233530479&content_type=Article&match_order=1&q=%E5%BE%AE%E5%86%85%

### 4. Trusted Applications（可信应用）
在大多数情况下，可信应用和驱动程序都是签名的二进制文件，但没有加密，可以很容易地进行分析。 **在三星手机上，这些二进制文件存储在/vendor/app/mcRegistry/和/system/app/mcRegistry/目录中。**

### 5. TA exploitation 101
即使TEE系统专门用于安全操作，操作系统也没有ASLR/PIE那样的安全强化，这使得利用可信应用中的漏洞变得非常容易。 三星在G955FXXU2CRED和G955FXXU3CRGH(Galaxy S8+)中修补了SEM TA(fffffffff0000000000000000000001b.tlbin)。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/KINIBI TEE 的可信环境及相关漏洞与利用方法.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/KINIBI TEE 的可信环境及相关漏洞与利用方法.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/KINIBI TEE 的可信环境及相关漏洞与利用方法.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/KINIBI TEE 的可信环境及相关漏洞与利用方法.md|原始文章]]
