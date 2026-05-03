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

本文从车联网信息安全背景出发，系统介绍了公钥（Public Key）在汽车电子安全体系中的核心作用。公钥用于验证私钥签名（验签），分为开发公钥（Development Public Key）和产品公钥（Product Public Key）。文章详细阐述了SHA256+RSA2048签名算法组合（SHA256负责数据完整性校验，RSA2048负责非对称加密）、公钥通过UDS $2E诊断服务写入ECU的流程、以及公钥在OTP（一次性可编程）区域或HSM NVM中的安全存储机制。最后讨论了公钥合法性验证策略：产线端离线首次写入（低风险）和OTA升级时与服务器在线握手验证。

## Key Points

### 1. 公钥基础概念
- **定义**：Public Key（公钥），相对于Private Key（私钥），用于验证对应私钥的签名（"验签"）
- **传播特性**：公钥可发送给第三方使用，私钥只能由节点自身或信任中心保管
- **分类**：
  - **Development Public Key**：软件开发阶段使用
  - **Product Public Key**：产线刷写前写入，作为验证应用软件的可信任根（Trust Anchor）

### 2. 签名算法组合：SHA256 + RSA2048
| 算法 | 作用 | 特点 |
|------|------|------|
| **SHA-256** | 数据完整性校验 | 安全Hash算法，比CRC更可靠 |
| **RSA-2048** | 非对称加密 | 适用于小量数据加密（签名信息、公钥等） |

- **分工**：RSA加密签名信息，SHA256验证数据完整性
- **性能**：非对称算法计算速度慢于AES等对称算法，不适合大量数据加密

### 3. 公钥写入与存储
- **写入方式**：通过UDS $2E（Write Data By Identifier）诊断服务写入ECU
- **写入时机**：刷写App、Cal等程序之前，用于验证软件块有效性
- **安全存储**：
  - **OTP区域**：One-Time-Programmable，只能编程一次，防止篡改
  - **HSM NVM**：硬件安全模块的非易失性存储器，提供"安全隔区"

### 4. 公钥验证流程
1. **产线端**：首次通过$2E服务写入（离线状态，篡改风险极低）
2. **OTA升级**：车辆联网，使用公钥与服务器握手验证（服务器存有配对私钥）
3. **VBT验证**：Verification Block Table存储各软件块Hash值，先验证Root Hash有效性

## Key Quotes

> "公钥可用来验证对应私钥的签名，即：'验签'。公钥可以发送给第三方使用，而私钥只能节点自身或者信任中心（Trust Center）保管，不能让第三方知道。"

> "将其视为验证应用软件的可信任根或者可信锚（Trust Anchor）。"

> "常用SHA256、RSA2048组合进行签名操作。"

> "通过写入的公钥与服务器握手。因为服务器存有私钥，同时，配对的公钥又是服务器给的，只要两者可以有效握手，即可说明公钥的有效性。"

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/信息安全基础：初识Public Key.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/信息安全基础：初识Public Key.md|原始文章]]

## Open Questions

- 公钥被泄露后的应急轮换机制
- 多层级公钥体系（根CA → 中间CA → 终端实体）在汽车电子中的实现

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/信息安全基础：初识Public Key.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/信息安全基础：初识Public Key.md|原始文章]]
