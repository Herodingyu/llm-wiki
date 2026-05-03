---
doc_id: src-信息安全-软件认证-authentication
title: 信息安全：软件认证（Authentication）
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/信息安全：软件认证（Authentication）.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

1 人赞同了该文章 大家好！我是不知名的 [安全工程师](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E5%AE%89%E5%85%A8%E5%B7%A5%E7%A8%8B%E5%B8%88&zhida_source=entity) Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

## Key Points

### 1. Perface
近些年，汽车新势力的强势入局， [汽车行业](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=%E6%B1%BD%E8%BD%A6%E8%A1%8C%E4%B8%9A&zhida_source=entity) ，大有"百花齐放"的盛况。汽车行业的蓬勃发展，催生多种新技术

### 2. 在这里插入图片描述 Part One
**本文讨论第一个点：软件Part创建（Create SW Part）**

### 3. 1、Create SW Part
创建软件Part示意如下所示： ![](https://pica.zhimg.com/v2-765ac32cf2dbbfa5b8c11aa3891d27d8_1440w.jpg) 图片 一个Software Part可以包含多个Data Blocks。这里解释一下Software Part和Data Blocks。

### 4. 2、VBT
VBT里面放置的是什么呢？ 答：VBT就像一个清单列表（manifest），存储着Software Part里的每个Data Block信息，这些信息包括：起始地址、长度、 [Hash值](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order=1&q=Hash%E5%80%BC&zh

### 5. （一）VBT格式
VBT的格式如下所示： ![](https://pica.zhimg.com/v2-269ce1e32ebe704e44387140302a17e2_1440w.jpg) 图片 Hash value的长度与使用的 [Hash算法](https://zhida.zhihu.com/search?content_id=234746321&content_type=Article&match_order

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/信息安全：软件认证（Authentication）.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/信息安全：软件认证（Authentication）.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/信息安全：软件认证（Authentication）.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/信息安全：软件认证（Authentication）.md|原始文章]]
