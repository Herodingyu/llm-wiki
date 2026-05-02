---
doc_id: src-acpi-vs-devicetree
title: ARM Server 为什么用 ACPI？ACPI vs DeviceTree
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/为什么ARM Server要用ACPI？ACPI vs DeviceTree.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, acpi, devicetree, arm-server, uefi]
---

## Summary

本文解释了为什么 ARM 服务器使用 UEFI+ACPI 而非 uboot+DeviceTree 模式。核心原因在于服务器市场需要硬件和软件的互操作性，而嵌入式产品是高度定制化产品。ACPI 提供了硬件抽象表述，使操作系统和各种板卡、软件可以跨平台运行。DeviceTree 虽然在嵌入式系统中表现良好，但在服务器市场中无法满足标准化、产品化、互操作的需求。

## Key Points

### 1. 嵌入式 vs 服务器产品
| | 嵌入式（手机） | 服务器 |
|---|---|---|
| 客户 | 终端消费者 | 云服务厂商、企业 IT |
| 定制化 | 高度定制 | 追求兼容性 |
| 互操作性 | 弱 | 强 |
| 固件模式 | uboot + DeviceTree | UEFI + ACPI |

### 2. 为什么服务器需要 ACPI
- **标准化需求**: 服务器采用生态圈模式，各部件来自不同厂商
- **互操作性**: 操作系统、板卡、软件需要在不同主板上运行
- **BIOS 作用**: 遮蔽硬件区别，提供统一界面
- **ACPI**: 硬件抽象表述，让 OS 无需关心具体硬件差异

### 3. DeviceTree 简介
- **起源**: Open Firmware（PowerPC、SPARC）
- **DTS**: 文本格式的设备树源文件
- **DTB**: 编译后的二进制设备树 blob
- **特点**: 树状描述系统设备组织和继承关系

### 4. ACPI 优势
- 标准化、产品化
- 操作系统单独产品化
- PCIe 板卡单独产品化
- 各种硬件和软件产品可在不同主板上运行

### 5. ARM SystemReady
- **IR 标准**: 面向嵌入式，推荐 DeviceTree
- **SBBR**: 面向服务器，明确要求 ACPI

## Evidence

- 手机不能互刷不同厂商固件
- 服务器主板 BIOS 定制起关键作用
- UEFI 标准化使其更适合服务器和 PC

## Open Questions

- ACPI 表（DSDT、SSDT）的生成和维护
- RISC-V 服务器是否也会采用 ACPI

## Related Pages

- [[acpi]]
- [[devicetree]]
- [[uefi]]
- [[arm-server]]
