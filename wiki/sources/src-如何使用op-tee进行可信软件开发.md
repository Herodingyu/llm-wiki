---
doc_id: src-如何使用op-tee进行可信软件开发
title: 如何使用OP TEE进行可信软件开发
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/如何使用OP-TEE进行可信软件开发.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文系统介绍了可信执行环境（TEE）的概念、实现原理以及如何利用OP-TEE进行可信软件开发。TEE通过硬件隔离（ARM TrustZone）创建安全世界，保护敏感代码和数据的完整性与机密性，防止来自正常世界（Linux/Android）的攻击。文章详细讲解了OP-TEE的开源软件架构（optee_os/optee_client/optee_test/Linux驱动）、启动流程（ARMv7/ARMv8差异）、构建系统选择、Linux内核支持、常见问题排查、可信应用程序（TA）开发模式，以及实际部署中的安全考虑（JTAG、安全引导、权限审查、密钥管理）。

## Key Points

### 1. TEE核心概念与价值

可信执行环境（TEE）提供了一个隔离的环境，确保代码/数据的完整性和机密性：

| 对比项 | 正常世界（Normal World） | 安全世界（Secure World） |
|--------|------------------------|------------------------|
| **操作系统** | Linux/Android等丰富OS | OP-TEE/Trusty/QSEE等安全OS |
| **运行模式** | 非安全状态 | 安全状态 |
| **访问权限** | 无法访问安全世界资源 | 可访问所有资源 |
| **应用场景** | 通用计算 | 处理机密信息（PIN、私钥、DRM等） |

**TEE的核心价值**：
- 防止正常世界OS的漏洞被利用访问敏感数据
- 可信应用程序（TA）处理信用卡PIN、私钥、客户数据、受DRM保护的媒体等
- 可用软件方案替代专用安全芯片，降低硬件成本

### 2. ARM TrustZone 硬件实现

TrustZone技术的关键特性：
- **单物理处理器双虚拟处理器**：安全高效地执行正常世界和安全世界代码
- **基于状态的内存和IO保护**：安全状态可访问通常不能从非安全状态访问的存储器/外围设备
- **Monitor模式切换**：两个虚拟处理器上下文通过监视器模式进行切换
- **软件视图**：正常世界OS和安全世界OS都以特权模式运行，各自有用户应用程序

### 3. OP-TEE 软件架构

OP-TEE是TEE的开源实现，由以下组件构成：

| 组件 | 功能 | 许可证 |
|------|------|--------|
| **optee_os** | 安全世界操作系统 | BSD 2-Clause |
| **optee_client** | 普通世界客户端 | BSD 2-Clause |
| **optee_test/xtest** | 测试套件 | BSD 2-Clause |
| **Linux驱动** | 内核支持 | GPL |

**软件交互模型**：
- 客户端应用程序（CA）使用TEE客户端API与可信应用程序（TA）通信
- CA和TA使用共享内存在彼此之间传递数据
- Linaro支持并积极维护超过28个平台/处理器

### 4. 启动流程差异

| 平台 | 启动流程 | 特点 |
|------|----------|------|
| **ARMv7** | SPL加载OP-TEE和U-boot → 跳到OP-TEE → OP-TEE初始化完成 → 切换到非安全上下文 → 跳到U-boot | OP-TEE内置Monitor代码 |
| **ARMv8** | SPL → ARM Trusted Firmware → OP-TEE → U-boot（非安全上下文） | ARM Trusted Firmware提供Monitor代码管理世界切换 |

### 5. 可信应用程序（TA）开发

| TA类型 | 位置 | 特点 |
|--------|------|------|
| **动态应用程序** | 普通世界文件系统（RFS） | 运行时加载到安全世界用户空间，需签名验证 |
| **伪/静态应用程序** | OP-TEE内核的一部分 | 内核模式运行，主要涉及硬件控制服务 |

**安全存储**：数据以AES-GCM加密/身份验证方式存储在Linux文件系统（/data/tee）或eMMC RPMB分区上。

### 6. 部署安全考虑

- **JTAG**：生产单元上禁用或限制为非安全访问
- **安全引导**：建立安全引导和信任链，确保只有经过身份验证的代码运行
- **权限审查**：明确设置非安全世界的权限，配置寄存器设为仅安全访问
- **密钥管理**：安全存储依赖于提供给OP-TEE的唯一硬件密钥

## Key Quotes

> TEE提供了一个隔离的环境，以确保代码/数据的完整性和机密性。运行Linux或Android的典型嵌入式系统在内核和用户空间包中都暴露出大量安全漏洞。

> TEE需要软件和硬件（内置于处理器中）支持。在硬件方面，基于ARM的处理器使用TrustZone技术实现TEE。TrustZone使单个物理处理器核心能够安全高效地执行来自正常世界和安全世界的代码。

> 非营利组织Global Platform开发了TEE API和框架规范，以标准化TEE并避免碎片化。这使最终用户无需更改其受信任的程序即可切换安全操作系统。

> 产品开发团队负责开发运行在Linux上的客户端应用程序（CA）和运行在OP-TEE上的可信应用程序（TA）。CA使用TEE客户端API与TA通话，并从中获得安全服务。

> TEE可以通过用软件解决方案取代专用安全芯片（密钥存储或加密认证）来降低硬件成本。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/如何使用OP-TEE进行可信软件开发.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/如何使用OP-TEE进行可信软件开发.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/如何使用OP-TEE进行可信软件开发.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/如何使用OP-TEE进行可信软件开发.md|原始文章]]
