---
doc_id: src-arm-secure-boot-atf
title: ARM 安全启动 — ATF/TF-A 及与 UEFI 的互动
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/ARM的安全启动—ATFTF-A以及它与UEFI的互动.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, arm, secure-boot, atf, uefi]
---

## Summary

本文系统介绍了 ARM 的安全启动方案 ATF（ARM Trusted Firmware）/TF-A，及其与 UEFI 的互动。ATF 在 Armv8 中引入了 EL0-EL3 四个特权级，建立了从启动到运行时的完整信任链。详细分析了 BL1（Trusted Boot ROM）、BL2（Trusted Boot Firmware）、BL31（EL3 Runtime Firmware）、BL32（OP-TEE OS）、BL33（UEFI/u-boot）各阶段的启动流程和职责。重点对比了 ARM ATF 与 x86 Boot Guard、TZ 与 Intel SGX 的对应关系，以及 NXP 2160A 平台的具体实现。

## Key Points

### 1. ATF 与 TrustZone 的区别
- **TrustZone (TZ)**: 对应 Intel SGX，在 CPU 和内存中划分 Secure/Non-Secure 空间
- **ATF**: 是 Intel Boot Guard + 特权级 + 提高版 TZ 的混合体
- ATF 包含 TZ 的 Secure/Non-Secure 空间，同时划分 EL0-EL3 四个特权级

### 2. 特权级划分
- EL0: 应用层
- EL1: OS 内核
- EL2: Hypervisor（虚拟化）
- EL3: Secure Monitor（最高特权级）
- 高 EL → 低 EL: ERET 指令
- 低 EL → 高 EL: 异常（Exception）

### 3. ATF 启动流程
```
BL1 (EL3, ROM) → BL2 (EL3, Flash) → BL31 (EL3, Runtime) → BL32 (S-EL1, OP-TEE) → BL33 (NS-EL2, UEFI)
```

### 4. 各阶段职责
- **BL1**: 建立 Trusted SRAM、异常向量、串口；验证 BL2 签名；跳转
- **BL2**: 初始化硬件（包括 DDR）；加载 BL31/BL32/BL33；验签跳转
- **BL31**: EL3 Runtime，通过 SMC 为 Non-Secure 提供安全服务
- **BL32**: OP-TEE OS（S-EL1）+ 安全应用（S-EL0）
- **BL33**: UEFI（NS-EL2）或 u-boot，最终启动 OS

### 5. 与 x86 的对比
- ARM BL2 初始化硬件（类似 x86 BIOS/PEI/FSP）
- UEFI 在 ARM 中运行在 NS-EL2（Non-Trusted）
- 信任链：BL1 验签 BL2 → BL2 验签 BL31 → BL31 验签 BL32 → BL31 验签 BL33 → UEFI Secure Boot 验签 OS

### 6. NXP 2160A 实现
- 开源 ATF 代码，提供硬件初始化
- BL2 中初始化 DDR4（不含 Training 过程）
- 支持 UEFI 和 u-boot 两种路径
- UEFI 从 PrePI 直接进入 PEI 后期阶段

## Evidence

- ATF 源码: https://github.com/ARM-software/arm-trusted-firmware
- NXP ATF: https://source.codeaurora.org/external/qoriq/qoriq-components/atf
- OP-TEE: https://www.op-tee.org/
- ARM System Ready 计划支持 NXP 2160A

## Key Quotes

> "BL2：Trusted Boot Firmware"

> "BL31：EL3 Runtime Firmware"

## Open Questions

- ARM 服务器（鲲鹏、飞腾、Graviton）的安全启动差异
- ATF 与 UEFI Secure Boot 的衔接细节

## Related Pages

- [[secure-boot]]
- [[atf]]
- [[trustzone]]
- [[uefi]]
- [[op-tee]]
