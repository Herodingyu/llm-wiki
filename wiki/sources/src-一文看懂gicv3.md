---
doc_id: src-一文看懂gicv3
title: 一文看懂GICv3
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/一文看懂GICv3.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, gicv3, interrupt, arm]
---

## Summary

本文是GICv3（Generic Interrupt Controller v3）的全面技术指南，系统介绍了GICv3在SOC中的角色、架构组件、中断类型、属性配置、生命周期管理、编程模型及虚拟化支持。GICv3作为ARM Cortex-A/R处理器的中断控制器，通过Distributor、Redistributor、ITS和CPU Interface四大组件，管理SPI、PPI、SGI、LPI四种中断类型，支持中断分组（Group 0/Secure Group 1/Non-secure Group 1）、亲和性路由、虚拟中断注入等高级特性，是现代ARMv8 SOC中断系统的核心。

## Key Points

### 1. GICv3架构概述
- **定位**：ARM公司推出的中断控制器，配合Cortex-A和Cortex-R处理器使用
- **版本演进**：GICv1→GICv4，GICv3是ARMv8 SOC最广泛使用的版本
- **核心功能**：中断管理（配置、接收、仲裁、路由）、security支持、虚拟化支持
- **与CPU连接**：通过IRQ/FIQ信号线将中断发送给PE（Processing Element）

### 2. 四大硬件组件
| 组件 | 功能 | 寄存器接口类型 |
|------|------|---------------|
| **Distributor** | 全局中断配置、SPI/SGI路由仲裁 | 内存映射（GICD_*） |
| **Redistributor** | PPI/SGI配置、电源管理、LPI管理 | 内存映射（GICR_*） |
| **ITS** | 将device ID+event ID转换为LPI中断号 | 内存映射（GITS_*） |
| **CPU Interface** | 中断使能控制、优先级管理、应答/完成 | 系统寄存器（ICC_*） |

### 3. 四种中断类型
| 类型 | 范围 | 特点 |
|------|------|------|
| **SGI** | 0-15 | 软件生成，用于CPU间通信（如IPI） |
| **PPI** | 16-31 | 每个CPU私有，如定时器中断 |
| **SPI** | 32-1019 | 共享外设中断，可路由到任意CPU |
| **LPI** | 8192+ | 基于消息的中断（如PCIe MSI），需ITS转换 |

### 4. 中断关键属性
- **使能/失能**：GICD_ISENABLER/GICD_ICENABLER
- **触发方式**：边沿触发 vs 电平触发（GICD_ICFGR）
- **优先级**：8bit值，越小优先级越高（GICD_IPRIORITYR）
- **亲和性**：通过affinity值路由到特定CPU（GICD_IROUTER）
- **分组**：Group 0/Secure Group 1/Non-secure Group 1（GICD_IGROUPR/GICD_IGRPMODR）

### 5. 中断生命周期
- **Inactive**：未触发或已处理完成
- **Pending**：已触发，CPU未应答
- **Active**：CPU已应答，正在处理
- **Active and Pending**：已应答处理中，又有新触发
- **状态转换**：通过ICC_IAR应答→ICC_EOIR完成→ICC_DIR deactivate

### 6. 中断处理模型
- **Targeted Distribution**：指定目标PE（PPI、LPI默认，SPI可配置）
- **Targeted List**：多个PE独立接收（仅SGI）
- **1 of N**：路由到一组PE中的一个（仅SPI）

### 7. 虚拟化支持
- **虚拟中断类型**：虚拟Group 0（vFIQ）、虚拟Group 1（vIRQ）
- **List Register (LR)**：保存虚拟中断状态，数量由实现确定
- **中断注入**：Hypervisor将物理中断关联到vPE，或软件生成虚拟中断
- **维护中断**：Hypervisor管理LR资源、处理EOI等场景

### 8. LPI中断机制
- **基于消息**：外设向特定地址写消息触发，无需物理中断线
- **ITS转换**：Device Table→ITT→Collection Table→Redistributor
- **配置表**：LPI配置表（优先级/使能）、LPI pending表保存在内存中
- **特点**：仅支持Non-secure Group 1、仅边沿触发、无active状态

## Key Quotes

> "GIC是arm公司推出可与cortex-A和cortex-R处理器配合使用的中断控制器，当前一共有4个版本，分别为GICv1 – GICv4。"

> "GICv3为中断的security状态和虚拟化提供了支持。通过中断分组的方式其支持在不同的security状态下中断可以分别以FIQ或IRQ方式触发。"

> "LPI中断是一种基于消息的中断，外设不需要通过硬件中断线连接到GIC上，而可以向特定地址写入消息来触发中断。"

## Evidence

- Source: [原始文章](raw/tech/bsp/一文看懂GICv3.md) [[../../raw/tech/bsp/一文看懂GICv3.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/一文看懂GICv3.md) [[../../raw/tech/bsp/一文看懂GICv3.md|原始文章]]
