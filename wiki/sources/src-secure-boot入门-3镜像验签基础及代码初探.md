---
doc_id: src-secure-boot入门-3镜像验签基础及代码初探
title: Secure boot入门 3镜像验签基础及代码初探
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/Secure boot入门-3镜像验签基础及代码初探.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 3 人赞同了该文章 ![](https://pic4.zhimg.com/v2-db17c3c71cb25e4284e260715efd1601_1440w.jpg)

## Key Points

### 1. 1\. 验签基础知识


### 2. 1.1 整体流程
**安全引导（ [Secure Boot](https://zhida.zhihu.com/search?content_id=272990960&content_type=Article&match_order=1&q=Secure+Boot&zhida_source=entity) ）** 功能是指在系统的整个启动过程中，使用 **链式验证电子签名** 的方式来验证系统中重要镜像文件的可靠性，

### 3. 1.2 算法介绍
**消息摘要算法** 是通过单向散列函数，将一段消息的内容转换为另一段 **固定长度消息的过程** ，而被其计算后生成的消息称为 **hash值** ，它具有以下特征： 1. 任意长度的输入消息都会输出 **固定长度的hash值**

### 4. 1.3 数字证书
网络上为了 **防止公钥被某个节点替换** ，使用数字证书 **对发送者的公钥做认证** 。数字证书格式遵循ITUTX.509标准，其基于ASN.1编码， [X509证书](https://zhida.zhihu.com/search?content_id=272990960&content_type=Article&match_order=1&q=X509%E8%AF%81%E4%B9%A6&z

### 5. 2\. ATF中的验签基础


## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/Secure boot入门-3镜像验签基础及代码初探.md) [[../../raw/tech/bsp/芯片底软及固件/Secure boot入门-3镜像验签基础及代码初探.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/Secure boot入门-3镜像验签基础及代码初探.md) [[../../raw/tech/bsp/芯片底软及固件/Secure boot入门-3镜像验签基础及代码初探.md|原始文章]]
