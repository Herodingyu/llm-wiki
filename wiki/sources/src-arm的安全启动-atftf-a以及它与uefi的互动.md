---
doc_id: src-arm的安全启动-atftf-a以及它与uefi的互动
title: ARM的安全启动—ATF/TF-A以及它与UEFI的互动
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/ARM的安全启动—ATFTF-A以及它与UEFI的互动.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, atf, arm, secure-boot, uefi]
---

## Summary

本文从ARM服务器市场发展趋势出发，深入解析了ARM Trusted Firmware（ATF/TF-A）与UEFI的互动关系。文章澄清了ATF与TrustZone（TZ）的区别：TZ是安全空间隔离技术（类似Intel SGX），而ATF是安全固件框架（包含Boot Guard、特权级划分和增强版TZ）。详细阐述了ATF的EL0-EL3四级特权模型、启动流程（BL1→BL2→BL31→BL33/UEFI→OS），以及ATF与UEFI在ARM服务器启动过程中的协作机制。核心在于理解ATF如何建立从硬件到OS的信任链，以及UEFI如何作为BL33在非安全世界运行。

## Key Points

### 1. ATF与TrustZone的区别
- **TrustZone（TZ）**：安全空间隔离技术，划分Secure/Non-Secure空间，类似Intel SGX
- **ATF/TF-A**：安全固件框架，包含Boot Guard、特权级划分、增强版TZ
- **TF-A vs TF-M**：TF-A用于Profile A（应用处理器），TF-M用于Profile M（微控制器）

### 2. ARMv8四级特权模型
| 异常等级 | 功能 | 安全状态 |
|---------|------|---------|
| **EL3** | Secure Monitor（必须实现） | 仅Secure |
| **EL2** | Hypervisor（可选） | NS/S |
| **EL1** | OS Kernel（必须实现） | NS/S |
| **EL0** | Applications（必须实现） | NS/S |

- **EL0/EL1**：必须实现，EL2/EL3可选
- **切换方式**：低EL→高EL通过异常，高EL→低EL通过ERET指令

### 3. ATF启动流程
```
BL1 (Boot ROM, EL3) → BL2 (Trusted Boot Firmware, EL3) → BL31 (EL3 Runtime) → BL33 (UEFI, EL2/EL1) → OS (EL1)
```

**BL1 - Trusted Boot ROM**
- 位于CPU内部ROM，一切信任根
- 建立Trusted SRAM、异常向量表、初始化串口
- 找到并验证BL2（验签CSF头）

**BL2 - Trusted Boot Firmware**
- 位于Flash上，作为外置Firmware
- 可信建立在BL1对其的验证上
- 初始化平台、加载验证后续镜像

**BL31 - EL3 Runtime Firmware**
- 持续运行，提供SMC服务
- 负责Secure/Non-Secure世界切换

**BL33 - Non-Trusted Firmware**
- 运行UEFI或U-Boot
- 在非安全世界执行

### 4. ATF与UEFI的互动
- **UEFI位置**：作为BL33运行在非安全世界（EL2或EL1）
- **通信方式**：通过SMC调用与EL3的BL31通信
- **启动路径**：BL31 → UEFI → OS
- **ARM System Ready**：ARM推出的认证计划，确保UEFI兼容性

### 5. 安全启动信任链
- **根信任**：BL1（Boot ROM，写死在CPU内部）
- **逐级验证**：每级验证下一级的数字签名和完整性
- **失败处理**：任何验证失败则停止启动

## Key Quotes

> "TF(Trusted Firmware)是ARM在Armv8引入的安全解决方案，为安全提供了整体解决方案。"

> "ATF带来最大的变化是信任链的建立（Trust Chain），整个启动过程包括从EL3到EL0的信任关系的打通。"

> "BL1是在CPU的ROM里而不是和BIOS在一起，是一切的信任根。"

## Evidence

- Source: [原始文章](raw/tech/bsp/ARM的安全启动—ATFTF-A以及它与UEFI的互动.md) [[../../raw/tech/bsp/ARM的安全启动—ATFTF-A以及它与UEFI的互动.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/ARM的安全启动—ATFTF-A以及它与UEFI的互动.md) [[../../raw/tech/bsp/ARM的安全启动—ATFTF-A以及它与UEFI的互动.md|原始文章]]
