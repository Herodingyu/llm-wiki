---
doc_id: src-arm-linux-boot-process
title: ARM Linux 启动过程 — 从自解压到虚拟内存
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/ARM Linux 的启动过程，这一切的开始.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, arm, linux, kernel, boot]
---

## Summary

本文深入分析了 ARM Linux 内核在自解压后，如何在物理内存中执行自引导，直到能够在虚拟内存中执行 C 代码。重点讲解了内核虚拟内存的划分（PAGE_OFFSET）、运行时物理内存地址的动态计算（PHYS_OFFSET）、以及 P2V（Physical to Virtual）运行时补丁技术。通过分析 `arch/arm/kernel/head.S` 中的 `stext()` 函数，揭示了内核启动时的内存管理初始化过程。

## Key Points

### 1. 启动入口
- 自解压后，PC 设置为 `stext()` 的物理地址
- `stext()` 位于 `arch/arm/kernel/head.S`
- 链接脚本将 `.head.text` 段放在内核最开头
- 物理地址 = 16MB 倍数 + TEXT_OFFSET (32KB)，如 0x10008000

### 2. 虚拟内存划分
- **PAGE_OFFSET**: 内核虚拟内存基地址
- 四种划分方案：0x40000000、0x80000000、0xB0000000、0xC0000000
- 最常见：0xC0000000（内核 1GB，用户 3GB）
- 内核空间永久映射，用户空间上下文切换只需替换页表低半部分

### 3. 物理内存计算
- 内核不知道自己被加载到物理内存的哪个位置
- 通过 `adr` 指令获取 label 的运行时地址
- 运行时地址 - 链接地址 = PHYS_OFFSET - PAGE_OFFSET
- 从而推算出 PHYS_OFFSET（物理内存起始地址）

### 4. P2V 运行时补丁
- **目的**: 让同一个内核在不同内存配置的系统上启动，无需重新编译
- **原理**: `__virt_to_phys()` 和 `__phys_to_virt()` 通过加减偏移实现线性转换
- **实现**: 
  - 调用点被替换为内联汇编
  - 链接器将调用点放入 `.pv_table` section
  - 启动时遍历 `.pv_table`，给每条指令打补丁（写入 PHYS_OFFSET - PAGE_OFFSET）

```
PHY = VIRT + (PHYS_OFFSET – PAGE_OFFSET)
VIRT = PHY – (PHYS_OFFSET – PAGE_OFFSET)
```

### 5. 为什么不用变量存储偏移量？
- P2V 转换位于内核热数据路径上
- 更新页表、内核内存交叉引用对性能要求极高
- 直接指令补丁比内存加载更快

## Evidence

```c
// PAGE_OFFSET 配置
config PAGE_OFFSET
    default 0x40000000 if VMSPLIT_1G
    default 0x80000000 if VMSPLIT_2G
    default 0xB0000000 if VMSPLIT_3G_OPT
    default 0xC0000000

// P2V 函数
static inline unsigned long __virt_to_phys(unsigned long x) {
    unsigned long t;
    __pv_stub(x, t, "add");
    return t;
}
```

## Key Quotes

> "PAGE\_OFFSET，即 virtual memory split symbol，在其上方的地址处创建一个虚拟内存空间，供内核驻留"

## Open Questions

- LPAE（大物理地址扩展）对 P2V 补丁的影响
- ARM64（AARCH64）是否还使用 P2V 补丁技术

## Related Pages

- [[linux-boot]]
- [[armv8]]
- [[mmu]]
- [[virtual-memory]]
