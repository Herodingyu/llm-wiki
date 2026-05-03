---
doc_id: src-一文聊聊linux-kernel的加密子系统-crypto-subsystem
title: 一文聊聊Linux Kernel的加密子系统【Crypto Subsystem】
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文聊聊Linux Kernel的加密子系统【Crypto Subsystem】.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

4 人赞同了该文章 大家好！我是安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

## Key Points

### 1. PREFACE
Linux密码学算法可分成两层 - User space layer实作 - Kernel space layer实作 在user space上想要使用密码学算法，只要安装并且执行 [openssl](https://zhida.zhihu.com/search?content_id=233331271&content_type=Article&match_order=1&q=openssl&zh

### 2. 1\. Kernel space （Kernel Space Cryptographic Implementation）
在Kernel space密码学算法实作上，主要分成软件以及硬件运算 - 软件运算（Software calculation） 由CPU进行密码学算法运算，不需额外硬件，但很耗费CPU性能.Linux Kernel原始码位于 [crypto subsystem](https://zhida.zhihu.com/search?content_id=233331271&content_type=Art

### 3. 2\. Crypto API–User space interface
主要的功能是提供界面，让user space可存取kernel space.目前主流为 [cryptodev](https://zhida.zhihu.com/search?content_id=233331271&content_type=Article&match_order=1&q=cryptodev&zhida_source=entity) 以及 [af\_alg](https://zhi

### 4. 3\. User space密码学函式库（Cryptography libraries）\[7\]
以下为较常见的User space密码学函式库\[19\]， - OpenSSL - [wolfSSL](https://zhida.zhihu.com/search?content_id=233331271&content_type=Article&match_order=1&q=wolfSSL&zhida_source=entity)

### 5. PART ONE--Crypto Subsystem of Linux Kernel
介绍由应用层所发出的crypto（cryptography）request，透过system call将request传送到Linux kernel端，并经由crypto subsystem将request转发给硬件算法引擎（hardware crypto engine）的流程。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文聊聊Linux Kernel的加密子系统【Crypto Subsystem】.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文聊聊Linux Kernel的加密子系统【Crypto Subsystem】.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文聊聊Linux Kernel的加密子系统【Crypto Subsystem】.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文聊聊Linux Kernel的加密子系统【Crypto Subsystem】.md|原始文章]]
