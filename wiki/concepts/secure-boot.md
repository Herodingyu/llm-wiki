---
doc_id: secure-boot
title: Secure Boot
page_type: concept
related_sources:
  - src-arm-secure-boot-atf
  - src-efuse-secure-boot
  - src-soc-bootflow-detailed
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, bsp, security]
---

# Secure Boot（安全启动）

## 定义

Secure Boot 是一种安全机制，通过建立从系统上电到操作系统启动的信任链（Chain of Trust），确保每一阶段执行的代码都经过认证，防止未经授权或恶意代码在系统启动过程中运行。

## 安全模型

建立在"消费者是攻击者"的假设之上：
- 防止刷入自定义操作系统
- 绕过厂商封闭的支付平台
- 复制受保护的数字产品
- **安全上限**：攻击成本需十万美元以上

## 信任链（ARM）

```
BootROM (信任根) → BL1 → BL2 → BL31 → BL32 → BL33 → OS
   ↓               ↓     ↓      ↓      ↓      ↓     ↓
 固化             验签  验签   验签   验签   验签  Secure Boot
```

## 核心组件

### BootROM
- 集成在 CPU 芯片内部的 ROM
- 出厂时固化，不可修改
- 系统上电后执行的第一段代码
- 初始化安全机制，加载 Secure Boot Key

### eFuse / OTP
- **eFuse**：电子保险丝，一次性可编程，默认全 1，写 0 后不可恢复
- **OTP**：反熔丝器件，默认 0，击穿后为 1
- 存储安全启动密钥、版本信息、OEM 标识

### ATF (ARM Trusted Firmware)
- BL1：初始化 SRAM、串口，验证 BL2
- BL2：初始化硬件，验证 BL31/BL32/BL33
- BL31：EL3 Runtime，通过 SMC 提供安全服务
- BL32：OP-TEE OS（可选）

### UEFI Secure Boot
- BL33 之后的验签由 UEFI 负责
- 验证操作系统加载器和驱动签名

## 安全等级

| 等级 | 描述 |
|------|------|
| 基础 | 仅验证 Bootloader |
| 中级 | 验证 Bootloader + 内核 |
| 高级 | 验证 Bootloader + 内核 + 驱动 + 应用 |

## 相关概念

- [[atf]] — ARM 可信固件
- [[efuse]] — 电子保险丝
- [[bootloader]] — 启动加载器
- [[trustzone]] — ARM 安全扩展
