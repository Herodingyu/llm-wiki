---
doc_id: src-ioremap-why
title: Linux 操作寄存器前为什么要 ioremap
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/今日面试题  Linux操作寄存器前为什么要ioremap.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-03
tags: [bsp, linux, ioremap, mmu]
---

## Summary

本文深入解答了 Linux 驱动开发中的经典问题：操作寄存器前为什么要 ioremap？核心原因在于 Linux 启用 MMU 后，内核中操作的都是虚拟地址，无法直接访问物理地址。直接访问物理地址会导致内核崩溃（Oops）。通过 ioremap() 将物理地址映射为虚拟地址后，内核通过页表映射正确访问物理寄存器。文章还介绍了 ARM Linux 设备树时代的替代方案 of_iomap()，并通过 Linux-4.14 + Allwinner/H3 的实验对比了使用 ioremap 和不使用 ioremap 的差异，最后简要分析了 ioremap() 的内核实现原理。

## Key Points

### 1. 为什么需要 ioremap
| 场景 | 结果 |
|------|------|
| 直接访问物理地址 | 访问非法地址，内核崩溃（Oops） |
| 使用 ioremap | 正确读取/写入寄存器 |

- Linux 启用 MMU 后，内核操作的是虚拟地址
- 内核无法直接访问物理地址
- 直接访问物理地址 = 访问非法地址 → 内核崩溃

### 2. ioremap 的作用
```
虚拟地址 → MMU 页表映射 → 物理地址
```
- 将物理地址映射为虚拟地址
- 内核通过返回的虚拟地址访问物理寄存器
- 原理与 vmalloc() 类似，但不需要分配物理页（目标地址是 IO memory，不是 RAM）

### 3. 设备树时代的替代方案
| 传统方式 | 设备树方式 |
|---------|-----------|
| `ioremap(phys_addr, size)` | `of_iomap(device_node, index)` |

- `of_iomap()` 内部仍调用 `ioremap()`
- 示例（clk-rk3288.c）：
```c
static void rk3288_clk_init(struct device_node *np) {
    rk3288_cru_base = of_iomap(np, 0);
}
```

### 4. 实验验证
| 条件 | 结果 |
|------|------|
| 使用 ioremap | 正常读取寄存器值（如 `reg[0] = 71227722`） |
| 不使用 ioremap | `Unable to handle kernel paging request at virtual address 01c20800` |

- **环境**: Linux-4.14 + Allwinner/H3
- **地址**: H3_GPIO_BASE = 0x01C20800

### 5. ioremap 实现原理
1. 相关检查
2. 分配 `vm_struct` 结构体（跟踪 vmalloc 区使用情况）
3. 初始化 `vm_struct`
4. 建立页表映射

## Evidence

```c
// 使用 ioremap
gpio_regs = ioremap(H3_GPIO_BASE, 1024);
printk("reg[%d] = %lx\n", i, gpio_regs[i]);

// 不使用 ioremap（会导致崩溃）
gpio_regs = (volatile unsigned long *)H3_GPIO_BASE;
```

## Open Questions

- ioremap_nocache 与 devm_ioremap_resource 的区别
- 64位系统中 ioremap 的实现差异

## Key Quotes

> "这里只考虑有 MMU 的芯片，Linux 为了实现进程虚拟地址空间，在启用 MMU 后，在内核中操作的都是虚拟地址，内核访问不到物理地址"

> "与 vmalloc() 不同的是，ioremap() 并不需要通过伙伴系统去分配物理页，因为ioremap() 要映射的目标地址是 io memory，不是物理内存 (RAM)"

> "Unable to handle kernel paging request at virtual address 01c20800"

## Related Pages

- [[ioremap]]
- [[mmu]]
- [[device-tree]]
- [[linux-device-driver]]
