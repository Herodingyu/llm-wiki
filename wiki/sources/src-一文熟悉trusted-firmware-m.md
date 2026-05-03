---
doc_id: src-一文熟悉trusted-firmware-m
title: 一文熟悉Trusted Firmware M
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文熟悉Trusted Firmware-M.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

6 人赞同了该文章 大家好！我是安全工程师Hkcoco！ 欢迎大家关注我的微信公众号： [TrustZone](https://zhida.zhihu.com/search?content_id=232947795&content_type=Article&match_order=1&q=TrustZone&zhida_source=entity) | CSDN：Hkcoco

## Key Points

### 1. 前言
最近有位朋友私信说相看一篇关于TFM的博客，于是今天乘着一个人的七夕节，来满足一下这位朋友，话不多说开始吧。 [Trusted Firmware](https://zhida.zhihu.com/search?content_id=232947795&content_type=Article&match_order=1&q=Trusted+Firmware&zhida_source=entity)

### 2. 概要


### 3. 架构
首先先来看Trusted Firmware-M的构架： ![](https://pic4.zhimg.com/v2-8187c08ba1027816102ee94aec8b9763_1440w.jpg)

### 4. 栗子
SPE主要是提供需要安全保护的服务，例如固件更新、加解密； 而NSPE则是一般使用者执行应用程序的环境。 如果在NSPE中执行的应用程序使用到secure层级的服务，则需要透过特定API来呼叫（这个概念类似操作系统的user-space和kernel-space会透过system call来沟通），这样可以限制NSPE的操作权限，避免重要机密资源外泄。

### 5. 安全启动-Secure Boot
除了NSPE和SPE两个环境的沟通流程之外，secure boot也是Trusted Firmware很重要的设计环节。 Secure boot最主要的目的就是防止系统使用到恶意的固件程序或操作系统，在开机流程中，boot code会先透过密码学（cryptography）算法验证是否为可信任的的程序，如果验证成功即会开始执行，否则中止流程。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文熟悉Trusted Firmware-M.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文熟悉Trusted Firmware-M.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文熟悉Trusted Firmware-M.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文熟悉Trusted Firmware-M.md|原始文章]]
