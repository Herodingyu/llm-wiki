---
doc_id: src-ioremap-why
title: Linux 操作寄存器前为什么要 ioremap
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/今日面试题  Linux操作寄存器前为什么要ioremap.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, ioremap, mmu]
---

## Summary

本文回答了 Linux 驱动开发中的常见问题：操作寄存器前为什么要 ioremap？核心原因是 Linux 启用 MMU 后，内核中操作的都是虚拟地址，无法直接访问物理地址。直接访问物理地址会导致内核崩溃。通过 ioremap() 将物理地址映射为虚拟地址后，内核通过页表映射正确访问物理寄存器。ARM Linux 引入设备树后，支持设备树的驱动改用 of_iomap()，内部仍调用 ioremap()。

## Key Points

### 1. 为什么需要 ioremap
- Linux 启用 MMU 后，内核操作的是虚拟地址
- 内核无法直接访问物理地址
- 直接访问物理地址 = 访问非法地址 → 内核崩溃

### 2. ioremap 的作用
```
虚拟地址 → MMU 页表映射 → 物理地址
```
- 将物理地址映射为虚拟地址
- 内核通过返回的虚拟地址访问物理寄存器

### 3. 设备树时代的替代方案
- 传统：`ioremap(phys_addr, size)`
- 设备树：`of_iomap(device_node, index)`
- `of_iomap()` 内部仍调用 `ioremap()`

```c
// 示例：clk-rk3288.c
static void rk3288_clk_init(struct device_node *np) {
    rk3288_cru_base = of_iomap(np, 0);
}
```

### 4. 实验验证
- 环境：Linux-4.14 + Allwinner/H3
- 地址：H3_GPIO_BASE = 0x01C20800
- 不 ioremap：访问非法地址，内核崩溃
- ioremap 后：正确读取寄存器值

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

## Related Pages

- [[ioremap]]
- [[mmu]]
- [[device-tree]]
- [[linux-device-driver]]
