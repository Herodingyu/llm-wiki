---
doc_id: src-page-fault时发生了什么
title: Page Fault时发生了什么
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/page fault时发生了什么.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, linux, memory, page-fault, kernel, x86]
---

## Summary

本文深入解析了Linux系统中Page Fault（缺页异常）的处理机制。当进程或内核通过页表PTE访问物理页面时，如果无法访问正确地址，将触发page fault。文章区分了内核空间和用户空间的处理流程，重点阐述了用户空间page fault的多种场景：匿名页（anonymous page）的按需分配（demand allocation）、page cache的按需调页（demand paging）、以及被swap out页面的swap in操作。核心在于理解Linux内存管理的懒分配策略——内存申请时并不立即分配物理页，而是等到实际访问触发page fault时才进行分配，从而提高内存使用效率。

## Key Points

### 1. Page Fault 基本概念
- **触发条件**：进程/内核通过PTE访问物理页面时，地址无效或权限不足
- **处理入口**：`__do_page_fault()`（x86代码位于`/arch/x86/mm/fault.c`）
- **区分处理**：内核空间（`do_kern_addr_fault`）vs 用户空间（`do_user_addr_fault`）

### 2. 内核空间 Page Fault
- **特点**：内核页面使用频繁，通常不会被换出（unlikely路径）
- **处理流程**：`do_kern_addr_fault() → vmalloc_fault()`
- **主要原因**：vmalloc区域的地址映射问题

### 3. 用户空间 Page Fault 处理流程
```
do_user_addr_fault()
    → handle_mm_fault()
        → handle_pte_fault()
```

**地址合法性检查：**
- 通过`find_vma()`查找地址是否落在进程的VMA区间内
- 合法地址（good area）：落在VMA内且权限正确
- 非法地址（bad area）：触发segmentation fault

### 4. 三种主要 Page Fault 场景

**场景一：匿名页（Anonymous Page）**
- **触发**：malloc/mmap/brk申请内存后首次访问
- **机制**：Demand Allocation（按需分配）
- **函数**：`do_anonymous_page()`
- **特点**：内核仅在vma中记录信息，不立即分配物理页

**场景二：Page Cache**
- **触发**：访问被回收的text/code段或writeback后的data段
- **机制**：Demand Paging（按需调页）
- **函数**：`do_fault()`
- **特点**：从外部存储介质将页面内容调回内存

**场景三：Swap Out 页面**
- **触发**：PTE存在但Present位为0（之前被swap out）
- **机制**：Swap In
- **函数**：`do_swap_page()`
- **特点**：PTE存储的是swap area中slot编号，而非物理页号

### 5. PTE 状态判断
```c
if (!vmf->pte) {
    // PTE不存在
    if (vma_is_anonymous(vmf->vma))
        return do_anonymous_page(vmf);  // 匿名页
    else
        return do_fault(vmf);            // page cache
}

if (!pte_present(vmf->orig_pte))
    return do_swap_page(vmf);            // swap in
```

## Key Quotes

> "在Linux中，进程和内核都是通过页表PTE访问一个物理页面的，如果无法访问到正确的地址，将产生page fault。"

> "对于anonymous page，用户空间使用malloc()进行内存申请时，内核并不会立刻为其分配物理内存，而只是记录vma信息。"

> "只有当内存被真正使用，触发page fault，才会真正分配物理页面和对应的页表项，即demand allocation。"

## Evidence

- Source: [原始文章](raw/tech/bsp/page fault时发生了什么.md) [[../../raw/tech/bsp/page fault时发生了什么.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/page fault时发生了什么.md) [[../../raw/tech/bsp/page fault时发生了什么.md|原始文章]]
