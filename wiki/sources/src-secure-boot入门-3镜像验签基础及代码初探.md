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

本文系统介绍了ARM安全启动（Secure Boot）的镜像验签基础知识。安全启动通过链式验证电子签名确保系统启动过程中各镜像文件的可靠性，符合ARM TBBR规范。文章详细阐述了从ChipRom到BL33的完整验签流程、消息摘要算法（SHA256/SHA512）和非对称密码算法（RSA）的原理、OTP/eFuse在安全密钥存储中的作用、以及镜像签名和验签的完整流程。

## Key Points

### 1. 安全启动整体流程
| 阶段 | 执行者 | 验证对象 |
|------|--------|----------|
| **ChipRom** | 固化代码 | BL1镜像 |
| **BL1** | AP Trusted ROM | BL2镜像 |
| **BL2** | Trusted Bootloader | BL31/BL32/BL33 |
| **BL31** | Secure Monitor | 后续镜像 |

- **信任根**: ChipRom固化在芯片中，用户无法修改
- **密钥存储**: RSA公钥或哈希值保存在OTP/eFuse中，只能写入一次
- **TBBR规范**: ARM官方的Trusted Board Boot Requirements规范

### 2. 核心算法
- **消息摘要算法**: SHA256/SHA512，固定长度输出、单向性、强抗碰撞性
- **非对称密码算法**: 私钥签名、公钥验签
- **镜像签名**: hash(image) → 私钥签名 → 生成签名值
- **镜像验签**: 公钥验签 → 校验hash值 → 验证完整性

### 3. OTP与eFuse
- **OTP**: 一次性可编程存储器，写入后不可更改
- **eFuse**: 电子熔丝，烧断后状态永久改变
- **用途**: 存储安全密钥、设备配置、启动模式选择

### 4. 数字证书
- **X.509 v3标准**: 自签名证书，无需CA验证
- **扩展字段**: 存储建立信任链所需的参数
- **安全性**: 由硬件保证，BootROM确保验证流程执行

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/Secure boot入门-3镜像验签基础及代码初探.md) [[../../raw/tech/bsp/芯片底软及固件/Secure boot入门-3镜像验签基础及代码初探.md|原始文章]]

## Key Quotes

> "Bootloader、Linux内核、TEE OS的启动都由ATF来加载和引导"

> "系统启动的地址只能是ChipRom"

> "One-Time Programmable Memor"

> "md5、sha1、sha256、sha512、sha3"

> "公钥的被替换成黑客自己的公钥，黑客用自己的私钥加密自己的镜像进行验签"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/Secure boot入门-3镜像验签基础及代码初探.md) [[../../raw/tech/bsp/芯片底软及固件/Secure boot入门-3镜像验签基础及代码初探.md|原始文章]]
