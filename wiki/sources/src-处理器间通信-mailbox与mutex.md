---
doc_id: src-处理器间通信-mailbox与mutex
title: 处理器间通信：MailBox与MUTEX
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/处理器间通信：MailBox与MUTEX.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

不坠青云之志 等 18 人赞同了该文章 大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

## Key Points

### 1. Perface
我们的许多解决方案都包含多个处理器，或者是硬核处理器，如Arm A9、A53或R5，软核如MicroBlaze、 [Arm Cortex-M1](https://zhida.zhihu.com/search?content_id=234136869&content_type=Article&match_order=1&q=Arm+Cortex-M1&zhida_source=entity) /M3

### 2. MailBox
我们检查了 [Vivado](https://zhida.zhihu.com/search?content_id=234136869&content_type=Article&match_order=1&q=Vivado&zhida_source=entity) 中实现处理器间通信（IPC）邮箱和互斥体所需的硬件构建。

### 3. MUTEX
![](https://pic1.zhimg.com/v2-a2c3d3f1d365ba9e6aa9e6d6e23d3ea8_1440w.jpg) 当我们的设备中有多个处理器时，多个处理器可能希望同时共享公共资源（例如内存或UART）。如果对这些资源的访问不受控制，它可能会迅速而容易地导致腐败。比如说串口打印，混淆在一起。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/处理器间通信：MailBox与MUTEX.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/处理器间通信：MailBox与MUTEX.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/处理器间通信：MailBox与MUTEX.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/处理器间通信：MailBox与MUTEX.md|原始文章]]
