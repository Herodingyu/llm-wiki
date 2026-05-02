---
doc_id: src-io-subsystem-overview
title: Linux IO 子系统全流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/IO子系统全流程介绍.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, io, block, filesystem]
---

## Summary

本文从系统调用到硬件磁盘，梳理了 Linux IO 子系统的主线流程。涵盖系统调用 → 文件系统 → buffer_head/iomap → bio → request → IO 调度器 → IO 软件调度队列(ctx) → IO 硬件调度队列(hctx) → SCSI 磁盘驱动的完整链路。重点分析了 sys_read/sys_write 的执行流程、磁盘访问模式（BUFFERED/DIRECT/DAX）、bio 机制、folio 概念、以及 page cache 的作用。

## Key Points

### 1. IO 子系统调用链
```
syscall → vfs → file_operations → fs → buffer_head/iomap → bio → request → io scheduler → ctx → hctx → scsi driver → disk
```

### 2. sys_read/sys_write 流程
**sys_read:**
1. 申请内存
2. 将磁盘内容读到内存
3. 将内存内容返回用户态

**sys_write:**
1. 申请内存
2. 将磁盘内容读到内存（修改前先读）
3. 将修改的数据写入内存
4. 回写进程定期刷盘（非实时）

### 3. 磁盘访问模式
| 模式 | 特点 |
|------|------|
| BUFFERED | 使用 page cache，避免耗时磁盘操作 |
| DIRECT | 实时写入磁盘，绕过 page cache |
| DAX | 直接访问（如 NOR flash），无需整块刷新 |

### 4. bio 机制
- 磁盘需要：sector 位置、sector 数目、page 地址、页内偏移
- sector 大小：512 字节（兼容历史）
- bio 是 IO 请求的基本单位

### 5. folio 概念
- Linux 5.19 引入的新概念
- folio = 连续内存，一个或多个 page 的集合
- `folio_alloc()` 调用 `alloc_pages(gfp, order)`
- 目前 folio cache 一般也是 4K
- 未来趋势：用 folio 替代 page

### 6. 调用链详情
```
SYSCALL_DEFINE3(read,...) → ksys_read → vfs_read → read_iter → xfs_file_read_iter
SYSCALL_DEFINE3(write,...) → ksys_write → vfs_write → new_sync_write → call_write_iter → write_iter → xfs_file_write_iter
```

## Evidence

- 代码基于 Linux kernel 5.19-rc5
- XFS 文件系统为例
- folio patch: 2020年12月提交

## Open Questions

- folio 与 page 的性能对比
- io_uring 对传统 IO 子系统的改进

## Related Pages

- [[io-subsystem]]
- [[block-layer]]
- [[page-cache]]
- [[bio]]
- [[filesystem]]
