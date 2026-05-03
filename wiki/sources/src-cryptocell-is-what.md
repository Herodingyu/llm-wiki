---
doc_id: src-cryptocell-is-what
title: CryptoCell is What
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/CryptoCell is What.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, arm, cryptocell, security, encryption, fips]
---

## Summary

本文介绍了ARM CryptoCell安全IP产品系列，这是ARM针对性能系统推出的 comprehensive 安全解决方案。文章重点阐述了CryptoCell-713（高端）和CryptoCell-703（中国加密特化版）两款产品，它们为移动设备、DTV、STB等提供硬件级安全功能，包括内容保护、银行级加密、以及中国国密算法（SM2/3/4）支持。核心在于理解CryptoCell如何通过预先FIPS 140-2认证的安全子系统，帮助合作伙伴缩短产品上市时间、降低认证成本，并提供从硬件到软件的完整安全组件包。

## Key Points

### 1. CryptoCell产品概述
- **定位**：ARM针对性能系统的 comprehensive 安全IP
- **目标市场**：移动设备、DTV、STB、中国市场
- **核心组件**：硬件加密引擎、固件、软件适配层、工具、集成包
- **产品型号**：
  - **CryptoCell-713**：高端型号，全面安全功能
  - **CryptoCell-703**：中国加密特化版，增强现有安全方案

### 2. 主要安全功能
- **内容保护**：DRM（数字版权管理）
- **银行级安全**：支付、金融应用
- **中国国密支持**：SM2/3/4算法
- **机器学习/AI算法保护**
- **密钥管理**：安全密钥存储和使用

### 3. 中国加密标准合规
- **SM2/3/4支持**：CryptoCell-713和703均支持中国国密算法
- **中国DRM认证**：符合所有中国DRM认证要求，包括增强型内容保护
- **GM/T 0028-2014**：中国密码标准，相当于国际FIPS 140-2
- **市场策略**：CryptoCell-703允许合作伙伴瞄准中国市场而不放弃现有安全设计

### 4. FIPS 140-2认证
- **定义**：NIST（美国国家标准与技术研究所）制定的密码模块安全标准
- **覆盖范围**：
  - 敏感加密密钥处理（如磁盘加密密钥）
  - 允许的加密和验证算法（禁止弱算法）
- **Arm策略**：Arm通过FIPS 140-2认证流程，合作伙伴可直接获得预先认证
- **认证内容**：不仅是加密原语，还包括安全引导、认证调试、安全计时器等平台安全服务
- **优势**：削减多年工程工作，加速产品上市

### 5. 生态系统价值
- **SIP到OEM**：整个产业链可利用Arm的认证努力
- **成本节约**：避免重复认证工作
- **额外保证**：为客户提供行业最佳数据保护
- **灵活IP**：跨多种设备和业务领域（移动、DTV、STB、企业BYOD等）

## Key Quotes

> "Arm通过了FIPS 140-2认证流程，确保合作伙伴在开始自己的工程工作之前可以直接从Arm获得认证。"

> "有了Arm IP，合作伙伴不仅可以在硬件、软件和固件方面获得同类最佳的产品，还可以获得预先认证的安全子系统。"

> "CryptoCell-713和CryptoCell-703为需要中文加密功能（SM2/3/4）的日常使用案例提供高性能、节能、安全功能。"

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/CryptoCell is What.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/CryptoCell is What.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/CryptoCell is What.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/CryptoCell is What.md|原始文章]]
