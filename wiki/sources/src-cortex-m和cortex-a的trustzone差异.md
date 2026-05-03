---
doc_id: src-cortex-m和cortex-a的trustzone差异
title: Cortex M和Cortex A的TrustZone差异
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Cortex-M和Cortex-A的TrustZone差异.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

1 人赞同了该文章 大家好！我是不知名的 [安全工程师](https://zhida.zhihu.com/search?content_id=233424185&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E5%B7%A5%E7%A8%8B%E5%B8%88&zhida_source=entity) Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

## Key Points

### 1. 共同点
Arm在2003年的Armv6开始就开始引入TrustZone，到Armv7-A和Armv8-A把 [trustzone](https://zhida.zhihu.com/search?content_id=233424185&content_type=Article&match_order=1&q=trustzone&zhida_source=entity) 作为架构的可选的安全扩展。虽然Tru

### 2. 差异点
Cortex-A 和Cortex-M的TrustZone在设计思想上是一样的，CPU都有两个安全状态，并且系统上的资源划分为安全资源和非安全资源，在非安全状态下只能访问非安全资源，在安全状态下能否访问所有的资源。但是M系列和A系列架构本身就存在差异，那么TrustZone从具体实现角度来看也存在差异，并且M系列资源比较有限和需要实时响应，在安全的具体设计时也不一样。例如在A系列两个状态的切换只能通

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Cortex-M和Cortex-A的TrustZone差异.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Cortex-M和Cortex-A的TrustZone差异.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Cortex-M和Cortex-A的TrustZone差异.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Cortex-M和Cortex-A的TrustZone差异.md|原始文章]]
