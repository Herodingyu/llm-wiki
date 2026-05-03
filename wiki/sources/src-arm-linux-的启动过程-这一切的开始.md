---
doc_id: src-arm-linux-的启动过程-这一切的开始
title: ARM Linux 的启动过程，这一切的开始
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/ARM Linux 的启动过程，这一切的开始.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, linux, arm, boot, kernel]
---

## Summary

本文详细解析了ARM Linux内核在自解压后的启动过程，从物理内存中的stext()入口开始，直到能够在虚拟内存中执行C语言编写的通用内核代码。文章深入分析了arch/arm/kernel/head.S中的启动代码，包括虚拟内存划分（PAGE_OFFSET配置）、当前运行位置确定、物理到虚拟地址的转换（P2V patching）、MMU和缓存的启用、以及最终跳转到start_kernel()的完整流程。核心在于理解ARM Linux如何从原始的物理内存执行环境过渡到分页虚拟内存环境。

## Key Points

### 1. 启动入口 stext()
- **位置**：arch/arm/kernel/head.S
- **调用来源**：自解压代码（decompressor）
- **执行环境**：MMU = off，D-cache = off，I-cache = don't care
- **寄存器状态**：r0 = 0，r1 = machine nr，r2 = atags/dtb pointer
- **物理地址**：16MB倍数 + TEXT_OFFSET（32KB），如0x10008000

### 2. 虚拟内存划分
- **PAGE_OFFSET**：内核虚拟内存基地址，决定内核/用户空间划分
- **四种配置**：
  - VMSPLIT_1G：0x40000000（内核1GB/用户3GB）
  - VMSPLIT_2G：0x80000000（内核2GB/用户2GB）
  - VMSPLIT_3G_OPT：0xB0000000（内核3GB/用户1GB）
  - 默认：0xC0000000（内核1GB/用户3GB，最常见）
- **无MMU情况**：PAGE_OFFSET = PHYS_OFFSET，1:1映射（uClinux）

### 3. 当前运行位置确定
- **物理地址**：通过PC值和链接地址关系计算
- **虚拟地址**：由PAGE_OFFSET决定
- **偏移量**：PHYS_OFFSET = 物理地址 - 虚拟地址基地址
- **目标**：确定运行时物理地址和链接时虚拟地址的差异

### 4. P2V 补丁（Patching Physical to Virtual）
- **目的**：修复内核代码中的绝对地址引用，使其在虚拟地址空间正确运行
- **方法**：计算PHYS_OFFSET，遍历需要patch的代码位置
- **范围**：主要是汇编代码中的绝对地址加载指令
- **时机**：在启用MMU之前完成，确保跳转正确

### 5. MMU和缓存启用
- **页表准备**：建立初始页表，映射内核代码和数据
- **启用MMU**：设置TTBR0/TTBR1，打开MMU
- **缓存处理**：使能I-cache和D-cache，处理一致性
- **屏障指令**：确保流水线刷新，配置生效

### 6. 跳转到C代码
- **目标**：start_kernel()（init/main.c）
- **前提**：MMU已启用，虚拟内存环境就绪
- **后续**：进入通用的Linux内核初始化流程

## Key Quotes

> "ARM Linux 内核在自解压并处理完设备树的更新后，会将程序计数器 pc 设置为 stext() 的物理地址，这里是内核的代码段。"

> "PAGE_OFFSET，即 virtual memory split symbol，在其上方的地址处创建一个虚拟内存空间，供内核驻留。"

> "这 4 种不同大小的内核空间里，0xC0000000-0xFFFFFFFF 是迄今为止最常见的。这种方式下，内核有 1GB 的地址空间可供使用。"

## Evidence

- Source: [原始文章](raw/tech/bsp/ARM Linux 的启动过程，这一切的开始.md) [[../../raw/tech/bsp/ARM Linux 的启动过程，这一切的开始.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/ARM Linux 的启动过程，这一切的开始.md) [[../../raw/tech/bsp/ARM Linux 的启动过程，这一切的开始.md|原始文章]]
