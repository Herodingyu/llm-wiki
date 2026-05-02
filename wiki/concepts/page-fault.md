---
doc_id: page-fault
title: Page Fault（缺页异常）
page_type: concept
related_sources:
  - src-page-fault-handling
  - src-arm-linux-boot-process
  - src-memory-bandwidth-test
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, bsp, memory]
---

# Page Fault（缺页异常）

## 定义

Page Fault 是当程序访问的虚拟地址对应的页表项（PTE）不存在或权限不足时，由 MMU 触发的异常。操作系统通过处理 Page Fault 来实现按需分配（Demand Allocation）和按需调页（Demand Paging）。

## 处理流程

```
访问虚拟地址 → MMU 查页表 → PTE 无效 → 触发 Page Fault
→ 内核 __do_page_fault()
→ 判断地址合法性（VMA）
→ 判断权限
→ 分配物理页或从磁盘调入
→ 更新页表 → 恢复执行
```

## Page Fault 类型

### 1. 匿名页缺页（Anonymous Page）
- **触发**: `malloc()` / `mmap()` 后首次访问
- **处理**: `do_anonymous_page()`
- **机制**: 按需分配，只分配页表，不分配物理页

### 2. 文件页缺页（File-backed Page）
- **触发**: 访问被 swap 出去的页面，或首次访问文件映射
- **处理**: `do_fault()`
- **机制**: 从磁盘（page cache）调页到内存

### 3. 写时复制（Copy-on-Write）
- **触发**: 写只读共享页
- **处理**: `do_wp_page()`
- **机制**: 复制一份私有副本

### 4. 非法访问
- **触发**: 访问无效地址或越权访问
- **处理**: `bad_area()` → Segmentation Fault

## 地址合法性检查

```c
struct vm_area_struct *vma = find_vma(mm, address);
if (!vma) {
    // 地址不在任何 VMA 区间 → bad_area
}
if (vma->vm_start <= address) {
    // 合法地址 → 继续处理
}
```

## 性能影响

- **Minor Fault**: 只需分配物理页，较快
- **Major Fault**: 需要从磁盘读取，较慢
- **大量 Page Fault**: 可能导致性能瓶颈

## 优化手段

| 技术 | 说明 |
|------|------|
| 预读（Read-ahead） | 预测读取相邻页 |
| 大页（Huge Page） | 减少页表层级和 TLB miss |
| MADV_SEQUENTIAL | 提示顺序访问模式 |
| MADV_WILLNEED | 提示即将访问 |

## 相关来源

- [[src-page-fault-handling]] — Page Fault 处理机制详解
- [[src-arm-linux-boot-process]] — ARM Linux 启动与页表
