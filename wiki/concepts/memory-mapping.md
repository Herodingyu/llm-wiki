---
doc_id: memory-mapping
title: 内存映射
page_type: concept
related_sources:
  - src-linux-memory-mapping
  - src-ioremap-why
  - src-arm-linux-boot-process
  - src-page-fault-handling
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, bsp, memory]
---

# 内存映射（Memory Mapping）

## 定义

内存映射是将物理地址空间映射到虚拟地址空间的过程，使 CPU 能够通过虚拟地址访问物理内存或设备寄存器。MMU（内存管理单元）负责虚拟地址到物理地址的转换。

## 两种映射方式

### I/O 映射（I/O-mapped）
- **架构**：x86
- **特点**：独立的 I/O 地址空间
- **访问指令**：IN/OUT

### 内存映射（Memory-mapped）
- **架构**：ARM、PowerPC、RISC-V
- **特点**：外设寄存器纳入统一地址空间
- **访问指令**：普通内存访问指令（LDR/STR）

## Linux 内核中的内存映射

### 申请虚拟内存空间
```c
struct resource *request_mem_region(unsigned long start, unsigned long len, char *name);
```

### I/O 地址映射
```c
void *ioremap(unsigned long phys_addr, unsigned long size);
void *ioremap_nocache(unsigned long phys_addr, unsigned long size);
```

### 设备树时代
```c
void __iomem *of_iomap(struct device_node *np, int index);
// 内部调用 ioremap()
```

## 为什么需要 ioremap

Linux 启用 MMU 后：
1. 内核操作的是虚拟地址
2. 无法直接访问物理地址
3. 直接访问物理地址 = 访问非法地址 → 内核崩溃
4. `ioremap()` 将物理地址映射为虚拟地址

## 映射后的访问

```c
void __iomem *base = ioremap(0x01C20800, 1024);
u32 val = readl(base + GPIO_DATA_OFFSET);
writel(val | BIT(0), base + GPIO_DATA_OFFSET);
```

## 页表映射

```
虚拟地址 → MMU → 页表 → 物理地址
```

### ARM Linux 启动时的 P2V 补丁
- 内核不知道自己加载到哪个物理地址
- 运行时计算 `PHYS_OFFSET - PAGE_OFFSET`
- 给 `__virt_to_phys()` / `__phys_to_virt()` 指令打补丁

## 相关来源

- [[src-linux-memory-mapping]] — Linux 内存映射详解
- [[src-ioremap-why]] — 为什么需要 ioremap
- [[src-page-fault-handling]] — 缺页异常处理
