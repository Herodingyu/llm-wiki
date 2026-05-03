---
doc_id: src-认识smmu以及理理smmu与trustzone的联系
title: 认识SMMU以及理理SMMU与TrustZone的联系？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/认识SMMU以及理理SMMU与TrustZone的联系？.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

12 人赞同了该文章 大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号： [TrustZone](https://zhida.zhihu.com/search?content_id=232681481&content_type=Article&match_order=1&q=TrustZone&zhida_source=entity) | CSDN：Hkcoco

## Key Points

### 1. 一、SMMU？
最近看了两篇文章很精彩，这里来一起学习一下，链接放在了文末，感谢前辈的优秀文章。

### 2. 1-什么是SMMU？
**SMMU（system mmu),是I/O device与总线之间的地址转换桥。** 它在系统的位置如下图： ![](https://picx.zhimg.com/v2-587f25f547f84aa5861e14b436f205d9_1440w.jpg)

### 3. 2-为什么需要SMMU？
了解SMMU出现的背景，需要知道系统中的两个概念： [DMA](https://zhida.zhihu.com/search?content_id=232681481&content_type=Article&match_order=1&q=DMA&zhida_source=entity) 和 [虚拟化](https://zhida.zhihu.com/search?content_id=2326

### 4. 3-SMMU常用概念
- [StreamID](https://zhida.zhihu.com/search?content_id=232681481&content_type=Article&match_order=1&q=StreamID&zhida_source=entity) 一个平台上可以有多个SMMU设备，每个SMMU设备下面可能连接着多个Endpoint， 多个设备互相之间可能不会复用同一个页表，需要加以

### 5. 4-SMMU数据结构查找
SMMU翻译过程需要使用多种数据结构，如STE, CD， [PTW](https://zhida.zhihu.com/search?content_id=232681481&content_type=Article&match_order=1&q=PTW&zhida_source=entity) 等。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/认识SMMU以及理理SMMU与TrustZone的联系？.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/认识SMMU以及理理SMMU与TrustZone的联系？.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/认识SMMU以及理理SMMU与TrustZone的联系？.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/认识SMMU以及理理SMMU与TrustZone的联系？.md|原始文章]]
