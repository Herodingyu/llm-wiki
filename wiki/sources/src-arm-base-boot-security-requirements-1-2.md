---
doc_id: src-arm-base-boot-security-requirements-1-2
title: ARM：Base Boot Security Requirements 1.2
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/ARM：Base Boot Security Requirements 1.2.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, arm, security, secure-boot]
---

## Summary

本文介绍了ARM Base Boot Security Requirements 1.2规范的核心内容，这是ARM针对其处理器产品制定的基础启动安全要求标准。规范从密码身份验证、安全启动、安全存储、安全更新、安全外设接口五个维度，定义了基于ARM的产品在启动阶段必须满足的安全基线要求。核心目标是确保系统从启动开始即处于受控状态，防止未经授权的访问、篡改和恶意启动，构建从硬件到软件的信任根。

## Key Points

### 1. 密码身份验证
- **要求**：产品必须实现密码身份验证机制，确保只有授权用户可访问和启动
- **实现方式**：密码输入、生物识别技术、多因素认证等
- **强度要求**：认证机制需足够强，能抵御各种攻击和破解尝试

### 2. 安全启动（Secure Boot）
- **验证对象**：Bootloader、内核映像、其他启动软件
- **验证手段**：数字签名、哈希校验等安全技术
- **硬件配置验证**：确保系统在启动时处于受控状态
- **信任链**：从硬件根信任开始，逐级验证软件完整性

### 3. 安全存储
- **加密存储**：固件、操作系统、用户数据必须加密存储
- **访问控制**：防止未经授权的访问、修改或删除
- **完整性保护**：确保数据在存储期间不被篡改
- **安全覆盖**：系统升级或维修时，旧版本软件需被安全覆盖或删除

### 4. 安全更新
- **授权验证**：仅允许经过授权的更新安装和运行
- **完整性校验**：使用数字签名、加密等技术验证更新包
- **内置机制**：产品需具备内置的安全更新机制
- **数据保护**：更新过程中确保数据完整性和机密性

### 5. 安全外设接口
- **通信加密**：与外设接口的所有通信需加密或使用安全协议
- **设备授权**：仅允许经过授权的外部设备与产品通信
- **数据保护**：防止外设中数据的未经授权访问、修改或删除

### 6. 其他最佳实践
- 使用最新的安全标准和协议
- 定期进行安全漏洞评估和修复
- 实施严格的数据备份和恢复策略

## Key Quotes

> "Base Boot Security Requirements 1.2要求产品必须实现安全启动机制。这包括验证引导加载程序（Bootloader）、内核映像和其他启动软件的完整性和真实性。"

> "产品应使用加密算法和技术来保护数据的完整性和机密性，并采取措施防止未经授权的访问、修改或删除。"

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/ARM：Base Boot Security Requirements 1.2.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/ARM：Base Boot Security Requirements 1.2.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/ARM：Base Boot Security Requirements 1.2.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/ARM：Base Boot Security Requirements 1.2.md|原始文章]]
