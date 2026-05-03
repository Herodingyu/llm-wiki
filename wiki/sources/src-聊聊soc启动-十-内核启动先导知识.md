---
doc_id: src-聊聊soc启动-十-内核启动先导知识
title: 聊聊SOC启动（十） 内核启动先导知识
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（十） 内核启动先导知识.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文基于AARCH64架构和Linux内核5.14.0-rc5，详细介绍了内核启动前的关键准备工作。文章首先阐述了U-Boot将控制权移交给内核时的系统状态：MMU和数据Cache关闭、dtb地址存于x0寄存器、通过`armv8_switch_to_el2`跳转执行。随后深入分析了内核执行的异常等级选择机制，包括U-Boot的EL确定方式（通过ID_AA64PFR0_EL1判断）、内核启动EL的决策逻辑（CONFIG_ARMV8_SWITCH_TO_EL1配置影响），以及运行时VHE模式的处理。最后详细探讨了内核启动阶段的内存管理基础，涵盖位置无关代码(adr/adrp指令)、内存发现机制（dtb memory节点解析）、ARM64虚拟地址空间布局（48位地址、256TB用户/内核空间），以及初始化页表创建的关键细节（idmap映射、TTBR0/TTBR1双页表、section maps机制）。

## Key Points

### 1. 内核启动前的系统状态

U-Boot移交控制权时CPU状态：

| 状态项 | 值/说明 |
|--------|---------|
| MMU | 关闭（页表未建立，运行实模式） |
| 数据Cache | 关闭（依赖MMU） |
| 指令Cache | 可关闭或打开 |
| x0寄存器 | dtb物理地址 |
| 跳转方式 | `armv8_switch_to_el2` |

**关键问题**：内核链接地址（`KIMAGE_VADDR = 0xffff80000fffffff`）与U-Boot加载地址不同，因此启动代码必须支持位置无关特性。

### 2. 内核执行的异常等级

#### 2.1 异常等级确定流程

| 当前EL | CONFIG_ARMV8_SWITCH_TO_EL1 | 内核运行EL |
|--------|---------------------------|-----------|
| EL1 | yes | EL1 |
| EL1 | no | EL1 |
| EL2 | yes | EL1 |
| EL2 | no | EL2 |
| EL3 | yes | EL1 |
| EL3 | no | EL2 |

**U-Boot EL确定**：通过读取`ID_AA64PFR0_EL1`寄存器判断是否支持EL2，支持则从EL2启动，否则从EL1启动。

#### 2.2 内核运行时VHE处理

内核进入时的`init_kernel_el`逻辑：

| 启动EL | VHE使能 | 最终运行EL |
|--------|---------|-----------|
| EL1 | N/A | EL1 |
| EL2 | no | 降级到EL1 |
| EL2 | yes | 保持EL2（Host OS模式） |

**VHE优势**：Host OS与Hypervisor同处EL2，减少异常等级切换开销。通过`HCR_EL2.E2H`使能，EL1寄存器访问自动重定向到EL2对应寄存器。

### 3. 内核启动内存管理

#### 3.1 位置无关代码

ARM64通过`adr`和`adrp`指令实现PC相对寻址：
- `adr`：±1MB范围，用于局部跳转
- `adrp`：±4GB范围，4K对齐，用于全局符号寻址

**特性**：PC存物理地址则计算得物理地址，存虚拟地址则计算得虚拟地址。

#### 3.2 内存发现

内核从dtb的`memory`节点获取物理内存信息：
```dts
memory@80000000 {
    device_type = "memory";
    reg = <0x00000000 0x80000000 0 0x80000000>;
};
```

#### 3.3 ARM64虚拟地址空间

48位地址配置（4K页）：
- 用户空间：0x0000_0000_0000_0000 - 0x0000_FFFF_FFFF_FFFF（256TB）
- 内核空间：0xFFFF_0000_0000_0000 - 0xFFFF_FFFF_FFFF_FFFF（256TB）

#### 3.4 页表与MMU使能

| 寄存器 | 用途 |
|--------|------|
| TTBR0_EL1 | 用户空间页表PGD基地址 |
| TTBR1_EL1 | 内核空间页表PGD基地址 |
| SCTLR_EL1.M | MMU使能位 |

**idmap机制**：MMU开启代码单独放到idmap段，建立虚拟地址=物理地址的映射，解决MMU使能切换时流水线已取指指令的地址不匹配问题。

#### 3.5 create_page_tables特点

- 创建两个页表：idmap（identity map）和init_pg_dir
- 页表描述符保存在bss段之后
- 默认4级页表只能映射2MB，通过section maps机制（减少一级页表）扩展到1GB

## Key Quotes

> "由于刚进入内核时页表还没有建立，此时系统运行在实模式，且ARM8数据cache的开启需要依赖于MMU，因此显然在启动内核前需要关闭MMU和数据cache。"

> "若host os运行在EL2，则需要将这些寄存器的访问操作重定向到其对应的xxx_el2寄存器，arm架构在硬件层面提供了寄存器重定向特性。"

> "只要知道虚拟地址和PGD的基地址，就可以通过页表找到其所在的物理地址页，而虚拟地址的低12位偏移则就是该地址在物理页中的偏移。"

> "内核采用了一种比较巧妙的做法。即将MMU开启相关的代码单独放到一个叫做idmap的段中，然后为该段单独建立一个页表，该页表的特点是其虚拟地址等于物理地址。"

> "当页大小为4k时建立idmap和init_pg_dir页表时会使能section maps机制。其原理就是将页表的级数设为比实际配置值少一级。"

## Evidence

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（十） 内核启动先导知识.md) [[../../raw/tech/bsp/聊聊SOC启动（十） 内核启动先导知识.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（十） 内核启动先导知识.md) [[../../raw/tech/bsp/聊聊SOC启动（十） 内核启动先导知识.md|原始文章]]
