---
doc_id: acpi
title: ACPI（高级配置与电源接口）
page_type: concept
related_sources:
  - src-acpi-vs-devicetree
  - src-uefi-loader
  - src-arm-secure-boot-atf
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, bsp, firmware]
---

# ACPI（Advanced Configuration and Power Interface）

## 定义

ACPI 是一种开放标准，用于操作系统和固件之间的电源管理和硬件配置接口。它定义了硬件的抽象描述方式，使操作系统能够发现、配置和管理系统硬件，同时支持多种电源状态。

## 核心作用

1. **硬件抽象**：统一描述硬件差异
2. **电源管理**：定义系统电源状态（S0~S5）
3. **设备发现**：操作系统自动发现设备
4. **配置管理**：动态配置硬件资源

## ACPI 表

| 表 | 说明 |
|----|------|
| **RSDT/XSDT** | 根系统描述表指针 |
| **DSDT** | 差异化系统描述表，定义硬件配置 |
| **SSDT** | 辅助系统描述表，补充 DSDT |
| **FACP** | 固定 ACPI 描述表，电源管理 |
| **APIC** | 中断控制器描述 |
| **MCFG** | PCI 配置空间描述 |

## 电源状态

| 状态 | 名称 | 说明 |
|------|------|------|
| S0 | Working | 系统正常运行 |
| S1 | Sleeping | CPU 停止，RAM 刷新 |
| S3 | Suspend to RAM | 内存保持，其他断电 |
| S4 | Suspend to Disk | 所有断电，状态存磁盘 |
| S5 | Soft-Off | 软关机 |

## ACPI vs DeviceTree

| | ACPI | DeviceTree |
|---|---|---|
| **起源** | x86 PC | Open Firmware (PowerPC/SPARC) |
| **标准化** | UEFI 论坛 | 社区驱动 |
| **动态生成** | 通常由 BIOS/UEFI 动态生成 | 可静态编译或动态生成 |
| **适用场景** | 服务器、PC、ARM Server | 嵌入式、手机 |
| **生态** | x86 主流 | ARM 嵌入式主流 |

## ARM Server 选择 ACPI

1. **标准化需求**：服务器需要硬件和软件互操作性
2. **产品化**：各部件（CPU、板卡、OS）独立产品化
3. **BIOS 作用**：遮蔽硬件差异，提供统一界面
4. **ARM SystemReady**：SBBR 明确要求 ACPI

## 相关来源

- [[src-acpi-vs-devicetree]] — ARM Server 为什么用 ACPI
- [[src-uefi-loader]] — UEFI 与 ACPI 的关系
