---
doc_id: src-arm-trusted-firmware分析
title: ARM Trusted Firmware分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/arm-trusted-firmware分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, atf, arm, secure-boot, firmware]
---

## Summary

本文深入分析了ARM Trusted Firmware（ATF）v1.3的代码实现，基于AArch64架构。文章从ATF的整体架构出发，详细解析了安全启动相关的核心模块：auth_common（认证数据结构）、crypto_mod（密码学校验框架）、img_parser_mod（镜像解析框架）。ATF实现了一个可信引导过程，通过多级验证（BL1→BL2→BL31→BL32→BL33）建立信任链，并为操作系统提供SMC调用服务。核心在于理解ATF如何通过模块化的软件框架实现镜像的认证、校验和加载，确保系统启动的安全性。

## Key Points

### 1. ATF整体架构
- **可信引导**：多级验证，每级验证下一级镜像的完整性和真实性
- **SMC服务**：为操作系统提供安全监控调用服务
- **代码位置**：GitHub - ARM-software/arm-trusted-firmware
- **版本**：基于v1.3分析

### 2. auth_common模块
- **功能**：声明认证相关的公共数据结构
- **核心结构**：
  - `auth_method_desc_s`：描述认证方式
  - `auth_param_desc_t`：认证参数（类型 + 数据）
- **辅助宏**：
  - `AUTH_PARAM_TYPE_DESC`：快速定义类型
  - `AUTH_PARAM_DATA_DESC`：快速定义数据

### 3. crypto_mod模块
- **定位**：密码学框架，非具体实现
- **功能**：校验哈希和签名
- **核心结构**：`crypto_lib_desc_t`
  - `init`：初始化方法
  - `verify_signature`：签名验证
  - `verify_hash`：哈希验证
- **注册宏**：`REGISTER_CRYPTO_LIB`用于注册具体的密码学库实现

### 4. img_parser_mod模块
- **定位**：镜像解析框架，非具体实现
- **功能**：校验镜像完整性、从镜像中提取内容
- **镜像类型**：
  - `IMG_RAW`：二进制镜像
  - `IMG_PLAT`：平台特定镜像
  - `IMG_CERT`：证书镜像
  - `IMG_BL1/BL2/BL31/BL32/BL33`：各级bootloader镜像

### 5. 安全启动流程
- **信任链**：BL1（Boot ROM，根信任）→ BL2 → BL31 → BL32 → BL33
- **验证机制**：每级加载前验证下一级镜像的数字签名和哈希
- **失败处理**：验证失败则停止启动，防止恶意代码执行

## Key Quotes

> "ARM Trusted Firmware实现了一个可信引导过程，并给操作系统提供运行环境（SMC调用服务）。"

> "引导过程分为多步，每一步为一个独立的程序。上一步负责验证下一步的程序，并把控制权交给下一级程序。"

> "此模块主要实现一个框架，并非具体实现。主要用于校验哈希和签名。"

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/arm-trusted-firmware分析.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/arm-trusted-firmware分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/arm-trusted-firmware分析.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/arm-trusted-firmware分析.md|原始文章]]
