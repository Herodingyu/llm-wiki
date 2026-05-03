---
doc_id: src-基于jacinto-7-soc的ipc应用
title: 基于Jacinto 7 SoC的IPC应用
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/基于Jacinto 7 SoC的IPC应用.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

1 人赞同了该文章 大家好！我是不知名的 [安全工程师](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E5%B7%A5%E7%A8%8B%E5%B8%88&zhida_source=entity) Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

## Key Points

### 1. Perface
Jacinto 7 SoC是 [德州仪器](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E5%BE%B7%E5%B7%9E%E4%BB%AA%E5%99%A8&zhida_source=entity) （TI）的产品。德州仪器是一家全球知名的 [半导体](http

### 2. 特性
Jacinto 7 SoC在SoC上有多个不同的CPU，例如R5F、A72、C7x、C6x。运行在这些CPU上的软件需要相互协作并实现一个用例。协作方式称为处理器间通信或IPC。 **每个CPU和操作系统上都提供了IPC库，以允许更高级别的应用程序相互通信。**

### 3. RPMSG and VRING


### 4. RPMSG
**RPMSG是Linux和TI-RTOS使用的通用消息传递框架** 。RPMSG是一种基于端点的协议，服务器 [CPU](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=9&q=CPU&zhida_source=entity) 可以运行在专用端点上侦听传入消息的服务，而所有其

### 5. VRING
VRING是一对CPU之间的 [共享内存段](https://zhida.zhihu.com/search?content_id=234136851&content_type=Article&match_order=1&q=%E5%85%B1%E4%BA%AB%E5%86%85%E5%AD%98%E6%AE%B5&zhida_source=entity) ，它保存两个CPU之间传递的消息。消息从发

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/基于Jacinto 7 SoC的IPC应用.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/基于Jacinto 7 SoC的IPC应用.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/基于Jacinto 7 SoC的IPC应用.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/基于Jacinto 7 SoC的IPC应用.md|原始文章]]
