---
doc_id: src-信息安全基础-初识public-key
title: 信息安全基础：初识Public Key
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/信息安全基础：初识Public Key.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

2 人赞同了该文章 大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

## Key Points

### 1. PerFace
随着车联网的快速发展，给车主带来便利的同时，也带来了潜在隐患。 - 便利的一面：无钥匙进入、远程启动、远程升级（OTA，Over-the-Air ）、远程诊断等等； - 隐患的一面：敏感个人信息泄露、车辆被远程黑客操控等等。

### 2. 1、什么是Public Key
Public Key，俗称"公钥"，相对于 [私钥](https://zhida.zhihu.com/search?content_id=234719006&content_type=Article&match_order=1&q=%E7%A7%81%E9%92%A5&zhida_source=entity) （Private Key）**,公钥可用来验证对应私钥的签名，即："验签"** 。公钥可

### 3. （一）SHA256、RSA2048作用
- RSA-2048：非对称成加密算法，发送方和接收方均各有一组公钥和私钥key。因存在幂运算，非对称加密算法计算速度远低于AES-256等算法（对称算法，加密速度快，适用于大量数据加密）。非对称算法适用于小量数据加密，eg：Public key加密。

### 4. 2、Public Key何时写入及存储
> $2E服务是指根据标识符写入数据服务（WriteDataByIdentifier），它允许诊断仪将相关信息写入到数据标识符（DID）规定的 [ECU](https://zhida.zhihu.com/search?content_id=234719006&content_type=Article&match_order=1&q=ECU&zhida_source=entity) 内部位置。

### 5. 3、拓展思考
既然公钥是软件信息认证的基础，那么公钥的合法性势必需要先行确认，即：如何知道写入芯片内的公钥没有被篡改呢？ 答： **通过写入的公钥与服务器握手。因为服务器存有私钥，同时，配对的公钥又是服务器给的，只要两者可以有效握手，即可说明公钥的有效性** 。 **在产线端，通过$2E服务写入（第一次写公钥），因为此阶段，车辆未连接网络，公钥被篡改的可能性微乎其微** 。如果通过OTA进行软件更新时， **车

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/信息安全基础：初识Public Key.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/信息安全基础：初识Public Key.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/信息安全基础：初识Public Key.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/信息安全基础：初识Public Key.md|原始文章]]
