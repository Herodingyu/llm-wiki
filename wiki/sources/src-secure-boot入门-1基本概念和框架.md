---
doc_id: src-secure-boot入门-1基本概念和框架
title: Secure Boot入门-1：基本概念和框架
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/Secure boot入门-1基本概念和框架.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, secure-boot, atf, encryption, rsa, trust-chain]
---

## Summary

本文介绍了Secure Boot（安全启动）的基本概念和框架，以及支撑其安全性的加密算法基础。Secure Boot的核心目的是防止固件被篡改和非法刷机，保护商业利益和知识产权。文章详细解析了ARM ATF启动流程中的信任链建立机制（BL1→BL2→BL31→BL32→BL33→OS），每一级都对下一级进行签名校验。同时阐述了两种核心加密算法：消息摘要算法（SHA-256/512等，用于完整性校验）和非对称加密算法RSA（用于数字签名验证）。核心在于理解信任链+加密算法双要素如何构建从硬件到OS的安全启动体系。

## Key Points

### 1. Secure Boot 目的
- **表面**：防止黑客篡改系统、窃取数据
- **实际**：商业利益——防止水货、非法升级、二次加工、破坏产品
- **核心目标**：防止刷机篡改程序
- **本质**：建立从ROM到OS的固件加载信任链

### 2. 信任链建立（ARM ATF）
```
BL1 (BootROM) → BL2 → BL31 → BL32 (TEE) → BL33 (U-Boot) → OS (Linux)
```
- **每一级**：验证下一级的签名，发现改动则终止启动
- **BL1（BootROM）**：写死在CPU内部，不可替换，作为根信任
- **验签流程**：镜像算hash → 私钥加密hash → 公钥解密验证

### 3. 消息摘要算法（完整性校验）
- **目的**：防止数据篡改，保证数据完整性
- **原理**：根据消息内容计算固定长度的摘要（数字指纹）
- **特点**：
  - 不可逆：无法从摘要反推原文
  - 抗碰撞：不同明文产生相同摘要的概率极低
  - 相同明文必定产生相同摘要
- **常用算法**：MD5、SHA-128、SHA-256、SHA-512
- **Secure Boot应用**：验证固件bin文件是否被篡改

### 4. 非对称加密算法 - RSA
- **对称加密**：加密解密使用相同密钥（如AES），密钥传递困难
- **非对称加密**：公钥加密，私钥解密，公私钥成对存在
- **RSA特点**：
  - 1977年由Rivest、Shamir、Adleman设计
  - 密钥越长越安全：1024位基本安全，2048位极其安全
  - 目前公开破解最长768位
- **数字签名流程**：
  1. 发送方用私钥对消息摘要加密（签名）
  2. 接收方用公钥解密验证摘要
  3. 对比摘要确认消息完整性和来源

### 5. Secure Boot 双要素
```
Secure Boot = 信任链（逐级验证） + 加解密算法（签名验证）
```
- **信任链**：确保每一级固件都来自可信来源
- **加密算法**：确保验证过程本身不可伪造

## Key Quotes

> "Secure boot说是为了防止黑客篡改系统，窃取你的数据。但是更重要的原因是商业利益。"

> "整体来说需要关注两件事：1. 怎么从ROM开始构建image的信任链？2. 使用什么加解密算法校验不会被破解？"

> "这种算法非常可靠，密钥越长，它就越难破解。1024位的RSA密钥基本安全，2048位的密钥极其安全。"

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/Secure boot入门-1基本概念和框架.md) [[../../raw/tech/bsp/芯片底软及固件/Secure boot入门-1基本概念和框架.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/Secure boot入门-1基本概念和框架.md) [[../../raw/tech/bsp/芯片底软及固件/Secure boot入门-1基本概念和框架.md|原始文章]]
