---
doc_id: src-为什么arm-server要用acpi-acpi-vs-devicetree
title: 为什么ARM Server要用ACPI？ACPI vs DeviceTree
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/为什么ARM Server要用ACPI？ACPI vs DeviceTree.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文从嵌入式产品 vs 服务器产品的商业模式差异出发，深入解释了为什么ARM服务器必须采用UEFI+ACPI而非嵌入式领域常用的uboot+DeviceTree模式。核心原因在于服务器市场追求硬件和软件的互操作性、标准化和产品化，而ACPI不仅提供静态硬件抽象（类似DeviceTree），还通过AML（ACPI Machine Language）实现硬件行为的动态抽象，同时具备更强的电源管理功能和跨OS兼容性（支持Windows）。文章还回顾了DeviceTree的起源（Open Firmware）、DTS/DTB格式，以及Linux社区从抵触到拥抱ACPI的转变过程。

## Key Points

### 1. 嵌入式 vs 服务器产品差异
| 维度 | 嵌入式（手机） | 服务器 |
|------|---------------|--------|
| **客户** | 终端消费者 | 云服务厂商、企业IT |
| **定制化** | 高度定制，软硬件绑定 | 追求兼容性，部件来自不同厂商 |
| **互操作性** | 弱（不能互刷固件） | 强（OS、板卡、软件跨平台运行） |
| **固件模式** | uboot + DeviceTree | UEFI + ACPI |

### 2. DeviceTree 简介
- **起源**：Open Firmware（PowerPC、SPARC架构）
- **DTS**：文本格式的设备树源文件（类似C语言的.c文件）
- **DTB**：DTS编译后的二进制blob（类似.obj文件）
- **作用**：树状描述硬件设备组织和继承关系，解决ARM Linux代码膨胀问题
- **局限**：仅提供静态硬件抽象，无法实现动态行为

### 3. ACPI 四大优势
1. **动态抽象**：AML方法实现硬件行为的动态抽象（如RAS功能）
2. **电源管理**：提供全面的电源管理功能
3. **跨OS兼容**：一套抽象模型支持全部操作系统（包括Windows）
4. **生态标准**：x86服务器的主流标准，ARM服务器需兼容既有生态

### 4. ARM SystemReady 标准
- **IR标准**：面向嵌入式，推荐DeviceTree
- **SBBR**：面向服务器，明确要求ACPI

## Key Quotes

> "要通用和互操作，这就要标准化，各个部件也要各自产品化，而不能是整个产品是一个产品就好了。"

> "ACPI不但实现了硬件设备的静态抽象，还实现了硬件行为的动态抽象。"

> "服务器领域的UEFI+ACPI也将是ARM服务器的必然选择。"

> "BIOS起到了遮蔽硬件区别，提供统一界面的作用。"

## Evidence

- Source: [原始文章](raw/tech/bsp/为什么ARM Server要用ACPI？ACPI vs DeviceTree.md) [[../../raw/tech/bsp/为什么ARM Server要用ACPI？ACPI vs DeviceTree.md|原始文章]]

## Open Questions

- RISC-V服务器是否也会走向ACPI标准化
- 台式机和笔电这一"中间地带"的固件选择趋势

## Related Links

- [原始文章](raw/tech/bsp/为什么ARM Server要用ACPI？ACPI vs DeviceTree.md) [[../../raw/tech/bsp/为什么ARM Server要用ACPI？ACPI vs DeviceTree.md|原始文章]]
