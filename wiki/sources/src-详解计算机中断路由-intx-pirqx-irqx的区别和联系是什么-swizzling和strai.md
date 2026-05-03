---
doc_id: src-详解计算机中断路由-intx-pirqx-irqx的区别和联系是什么-swizzling和strai
title: "详解计算机中断路由：INTx、PIRQx、IRQx的区别和联系是什么？Swizzling和Straight又是什么？PIC和APIC路由表怎么解读？"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/详解计算机中断路由：INTx、PIRQx、IRQx的区别和联系是什么？Swizzling和Straight又是什么？PIC和APIC路由表怎么解读？.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-04
tags: [peripheral, interrupt, pci, pcie, bios, routing]
---

# 详解计算机中断路由：INTx、PIRQx、IRQx的区别和联系是什么？Swizzling和Straight又是什么？PIC和APIC路由表怎么解读？

## 来源

- **原始文件**: raw/tech/peripheral/详解计算机中断路由：INTx、PIRQx、IRQx的区别和联系是什么？Swizzling和Straight又是什么？PIC和APIC路由表怎么解读？.md
- **提取日期**: 2026-05-03

## Summary

本文是知乎专栏「UEFI和BIOS探秘」发布的关于x86计算机中断路由机制的深入技术文章，由BIOS/UEFI领域专家撰写。中断体系和PCI/PCIe是现代计算机系统最重要的两大部分，二者的交集——PCI/PCIe设备中断的正确配置尤其是中断路由的准确汇报，是设备正常工作甚至主板启动的前提条件。文章系统梳理了INTx、PIRQx、IRQx、Vector等中断术语的区别与联系，详细解析了基于传统8259的PIC模式和新型APIC模式的不同处理方式，以及桥片内部设备与外部设备、PCI Slot与PCIe Slot在中断路由上的差异。核心内容包括三级两层映射关系（INTx→PIRQx→IRQx）、Intel桥片提供的极大灵活度内部路由配置、外部PCI设备的Swizzling交错机制、PCIe设备的Root Port软转换方式，并结合Intel Purley服务器开源代码进行了实际案例分析。尽管资料来源于2008年的Intel文档，但相关基本概念至今几乎未变，仍然适用于现代PCH甚至无南桥的SoC系统。

## Key Points

### 中断术语体系

| 术语 | 全称 | 作用范围 | 说明 |
|------|------|---------|------|
| INTx | Interrupt x | PCI设备 | PCI spec定义的4条中断请求线：INTA#、INTB#、INTC#、INTD# |
| PIRQx | PCI IRQ x | 南桥/ PCH | 南桥提供的8个PCI中断引脚：PIRQA#~PIRQH# |
| IRQx | Interrupt Request x | CPU/ 中断控制器 | 8259 PIC的15个中断请求线（级联后） |
| INTINx | Interrupt Input x | IO APIC | APIC模式下的中断入口，常见24个 |
| Vector | 中断向量 | CPU | 中断服务程序的入口索引 |

### PCI设备中断基础

- PCI spec为每个设备定义4条中断请求信号线：**INTA#、INTB#、INTC#、INTD#**
- 单功能设备必须使用INTA#
- 多功能设备各功能可任意连接至4条中断线
- 中断触发方式：**低电平触发**、**开漏线路**、**线与共享**
- 一个PCI Bus下可有31个设备，256个PCI Bus，仅4条中断线，必须进行中断共享

### 三级两层映射模型

中断从源头到CPU落地经历的核心映射过程：

```
PCI设备INTx → 南桥PIRQx → LPC中IRQx（或IO APIC的INTINx）
     ↑              ↑                ↑
   设备中断      桥片聚合        中断控制器
```

**第一层：INTx → PIRQx**
- 决定哪个设备的哪条INTx线连接到哪个PIRQx引脚
- 内部设备：通过IP/IR寄存器灵活配置
- 外部设备：通过Swizzling+Straight映射

**第二层：PIRQx → IRQx/INTINx**
- PIRQx通过LPCBR配置连接到具体的IRQx
- 或与IO APIC的INTINx固定一一对应（从16开始）
- 不能被配置到Legacy保留的IRQx上

### 桥片内部设备中断路由

Intel为桥片内部设备提供了**极大灵活度**的三级两层映射：

1. **INTx → PIRQx映射**
   - 每个设备的每个Func通过两组寄存器（IP和IR）配置
   - 例：LPC设备（D31:F0）通过D31IP选择INTx，通过D31IR映射到PIRQx
   - 几乎可以做任意映射组合

2. **PIRQx → IRQx映射**
   - 通过LPCBR寄存器自由调节
   - 黄色标记部分表示可配置的IRQx范围
   - 有限制：不能配置到Legacy保留IRQ

### 外部PCI设备与Swizzling

**问题背景**：
- 主板PCI扩展插槽的用户插入设备不可预知
- 需考虑平衡原则（避免单个PIRQ过载）和效率原则

**Swizzling交错机制**：
- 将所有插槽的INTA#~INTD#交错连接
- PCI SIG推荐连接方式：
  - Slot1 INTA# → Slot2 INTB# → Slot3 INTC# → Slot4 INTD#
- 这种**交错叫做Swizzling**
- Swizzling后的INTx再经过**Straight**（直接映射）变成PIRQx

**为什么需要Swizzling**：
- PCI设备绝大多数是单功能设备，仅使用INTA#
- 如果所有Slot的INTA#直接连到PIRQA，PIRQA会严重过载
- Swizzling将INTA#分散到不同PIRQx，实现负载均衡

### 外部PCIe设备中断路由

PCIe与PCI在中断路由上的差异：

| 特性 | PCI | PCIe |
|------|-----|------|
| 每链路设备数 | 多个 | 1个EP |
| 中断信号 | 物理线 | 虚拟信号（Message） |
| 典型中断 | INTA#~INTD# | 通常仅用INTA# |
| Swizzling位置 | 物理连接 | Root Port软转换 |

**PCIe Swizzling**：
- 每个PCIe链路下只有一个EP设备
- 该设备中断请求通常为INTA#
- 若所有链路采用Straight方式，PIRQA负担过重
- PCIe采取类似PCI Slot的Swizzling方式，但通过**PCIe Root Port的软转换**实现
- 经过Root Port的INTx Mapping Swizzling后，再通过Straight映射到PIRQx

### PIC vs APIC模式

| 特性 | PIC（8259） | APIC |
|------|------------|------|
| 架构 | 级联8259芯片 | Local APIC + IO APIC |
| IRQ数量 | 15个（级联后） | 24+个（每个IO APIC） |
| 触发方式 | 边沿/电平 | 消息 signaled |
| PIRQx映射 | → IRQx | → INTINx（固定对应） |
| 现代支持 | Legacy兼容 | 主流模式 |

### 实际代码案例分析

以Intel Purley服务器开源代码为例：

1. **PCH内部设备映射**：在代码中搜索D31IP和D31IR寄存器配置
2. **ACPI表验证**：对照ACPI table交叉验证中断路由配置
3. **PCIe Root Port Swizzling**：
   - 先映射INTx
   - 通过Straight规则映射到PIRQx
   - 再到IOAPIC的INTINx一一映射（从16开始）
   - 第一个IOAPIC的GSI与INTINx数字一致

## Key Quotes

> "中断体系和PCI/PCIe是现代计算机系统构成要件中最重要的两大部分。二者的交集：PCI/PCIe设备的中断，它的使能和正确配置，尤其是中断路由的正确汇报，是设备能够正常工作甚至是主板能够启动的前提条件。"

> "相关基本概念却几乎完全没有改变，还能适用于今天的系统。"

> "PCI spec为每个PCI设备定义了四个中断请求信号线，分别是INTA#，INTB#，INTC#和INTD#。"

> "经历了三级两层映射：INTx -> PIRQx -> IRQx。这个映射关系是中断路由的精髓。"

> "Intel为桥片中或者CPU中的设备，提供了最大程度的灵活度，方便整机厂商根据实际情况来平衡中断请求。三级两层映射关系都可以自由调节。"

> "这种交错叫做Swizzling，也就是上上图中的黄框部分。Swizzling交错之后的INTx，再经过Straight映射，即红框部分的直接映射方法变成PIRQx。"

## Related Pages

- [[interrupt]] — 中断系统原理
- [[pci]] — PCI 总线架构
- [[pcie]] — PCIe 高速串行总线
- [[bios]] — BIOS/UEFI 固件
- [[apic]] — 高级可编程中断控制器

## 开放问题

- CPU内部PCIe设备的INTx、PIRQx和IRQx映射关系如何确定
- 多路CPU平台中GSI大于24甚至上百的含义
- ARxx和AHxx在ACPI表中的区别
- 现代无南桥SoC架构中的中断路由变化
