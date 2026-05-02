---
doc_id: src-page-fault-handling
title: Page Fault 处理机制
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/page fault时发生了什么.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, memory, page-fault, mmu]
---

## Summary

本文深入分析了 Linux 内核中的 page fault（缺页异常）处理机制。区分了内核空间和用户空间的 page fault 处理流程。用户空间的处理更为复杂，需要判断地址是否合法（是否在 VMA 区间内）、权限是否正确，然后分情况处理：PTE 不存在的匿名页（do_anonymous_page）和 page cache 页（do_fault），以及 PTE 存在的写时复制（do_wp_page）。

## Key Points

### 1. Page Fault 入口
```c
void __do_page_fault(...) {
    if (unlikely(fault_in_kernel_space(address)))
        do_kern_addr_fault(regs, hw_error_code, address);
    else
        do_user_addr_fault(regs, hw_error_code, address);
}
```

### 2. 内核空间 Page Fault
```
do_kern_addr_fault() → vmalloc_fault()
```
- 内核页面使用频繁，通常不会被换出
- 使用 `unlikely` 优化

### 3. 用户空间 Page Fault 处理流程
```
do_user_addr_fault() → handle_mm_fault() → handle_pte_fault()
```

### 4. 地址合法性检查
- 地址必须在进程的 VMA（Virtual Memory Area）区间内
- 访问权限必须正确（如只读区域不能写入）
- 非法访问 → segmentation fault

### 5. PTE 不存在的情况
**a. 匿名页（Anonymous Page）**
- malloc/mmap/brk 申请内存时，内核不立即分配物理页
- 首次使用时触发 page fault
- `do_anonymous_page()`: 按需分配（demand allocation）
- 适用于 heap、stack 等

**b. Page Cache**
- 内存回收后，text 段被 discard，data 段被 writeback
- 再次访问时触发 page fault
- `do_fault()`: 从外部存储调回（demand paging）

### 6. PTE 存在的情况
- **写时复制（Copy-on-Write）**: `do_wp_page()`
- 共享页面被写时，复制一份私有副本

## Evidence

- 代码位于 `arch/x86/mm/fault.c`
- `handle_pte_fault()` 区分匿名页和 page cache
- VMA 通过红黑树（rbtree）管理

## Open Questions

- 大页（Huge Page）的 page fault 处理差异
- ARM64 与 x86 在 page fault 处理上的架构差异

## Related Pages

- [[page-fault]]
- [[mmu]]
- [[virtual-memory]]
- [[demand-paging]]
