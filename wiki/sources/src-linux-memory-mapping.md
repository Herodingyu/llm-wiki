---
doc_id: src-linux-memory-mapping
title: Linux 内核内存映射
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/了解Linux内核内存映射（二）.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, memory, iommu, ioremap]
---

## Summary

本文介绍了 Linux 内核中的内存映射机制，包括 I/O 映射方式（I/O-mapped）和内存映射方式（Memory-mapped）。重点讲解了 ARM/PowerPC 等 RISC 架构的统一编址方式，以及 x86 的独立 I/O 地址空间。详细分析了内存映射的两个步骤：虚拟内存空间申请（request_mem_region）和 I/O 地址映射（ioremap/ioremap_nocache）。

## Key Points

### 1. I/O 映射方式对比
| 方式 | 架构 | 特点 |
|------|------|------|
| I/O-mapped | x86 | 独立 I/O 地址空间，使用 IN/OUT 指令 |
| Memory-mapped | ARM、PowerPC | 统一编址，使用内存访问指令 |

### 2. 内存映射步骤
**a. 申请虚拟内存空间**
```c
struct resource *request_mem_region(unsigned long start, unsigned long len, char *name);
void release_mem_region(unsigned long start, unsigned long len);
```
- 从 3G~4G 内核虚拟地址空间申请
- 可通过 `/proc/iomem` 查看设备内存范围

**b. I/O 地址映射**
```c
void *__ioremap(unsigned long phys_addr, unsigned long size, unsigned long flags);
void *ioremap(unsigned long phys_addr, unsigned long size);
void __iomem *ioremap_nocache(unsigned long phys_addr, unsigned long size);
```
- 将 I/O 物理地址映射到内核虚拟地址空间
- ioremap 依赖 __ioremap，flags=0
- 按页整页映射

### 3. 访问映射后的寄存器
- 映射成功后，ioaddr 为虚拟地址起始
- `ioaddr + 0`: 第一个寄存器
- `ioaddr + 4`: 第二个寄存器（每个占 4 字节）
- 以此类推

## Evidence

- x86 使用 IN/OUT 指令访问 I/O 端口
- ARM/PowerPC 使用普通内存指令访问 I/O
- ioremap 按页映射，即使只映射 1 字节也会映射整页

## Open Questions

- ioremap 与 devm_ioremap_resource 的区别和使用场景
- 设备树（Device Tree）如何简化内存映射配置

## Related Pages

- [[ioremap]]
- [[memory-mapping]]
- [[device-tree]]
- [[linux-device-driver]]
