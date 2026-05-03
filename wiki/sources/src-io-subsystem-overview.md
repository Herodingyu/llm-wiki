---
doc_id: src-io-subsystem-overview
title: Linux IO 子系统全流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/IO子系统全流程介绍.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-03
tags: [bsp, linux, io, block, filesystem]
---

## Summary

本文从系统调用到硬件磁盘，系统梳理了 Linux IO 子系统的完整链路。涵盖系统调用 → 文件系统 → buffer_head/iomap → bio → request → IO 调度器 → IO 软件调度队列(ctx) → IO 硬件调度队列(hctx) → SCSI 磁盘驱动的全过程。文章基于 Linux kernel 5.19-rc5，以 XFS 文件系统为例，深入分析了 sys_read/sys_write 的执行流程、磁盘访问模式（BUFFERED/DIRECT/DAX）、bio 机制、folio 概念（Linux 5.19 引入）、以及 page cache 的核心作用。对于理解 Linux 内核 IO 子系统的架构设计具有重要参考价值。

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

**关键注意**: sys_write 并没有直接写磁盘，而是交给定期开启的回写进程

### 3. 磁盘访问模式
| 模式 | 特点 | 应用场景 |
|------|------|---------|
| BUFFERED | 使用 page cache，避免耗时磁盘操作 | 普通文件读写 |
| DIRECT | 实时写入磁盘，绕过 page cache | 数据库等需要数据持久化 |
| DAX | 直接访问（如 NOR flash），无需整块刷新 | 持久内存设备 |

### 4. bio 机制
- 磁盘需要：sector 位置、sector 数目、page 地址、页内偏移
- sector 大小：512 字节（兼容历史）
- bio 是 IO 请求的基本单位
- `struct bio` 描述连续磁盘空间，`bio_vec` 描述连续内存空间

### 5. folio 概念（Linux 5.19+）
| 属性 | 说明 |
|------|------|
| 定义 | 连续内存，一个或多个 page 的集合 |
| 分配 | `folio_alloc()` 调用 `alloc_pages(gfp, order)` |
| 当前大小 | 一般 4K（与 page 相同） |
| 未来趋势 | 用 folio 替代 page |

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

## Key Quotes

> "前面提到过disk本质上属于一个块设备，如果对kernel设备驱动框架了解的同学可以明白，在scsi adapter driver代码的probe函数中会扫描所有的scsi devices"

> "但是有两点需要注意，sys_write并没有写磁盘的操作，而是把这个操作交给了定期开启的回写进程"

> "图中展示了一个8k的folio，同理我们也可以申请16K或者32K的folio，本质上是folio_alloc也是调用了alloc_pages(gfp, order)"

> "SYSCALL_DEFINE3(read,...) -> ksys_read -> vfs_read -> read_iter -> xfs_file_read_iter"

> "SYSCALL_DEFINE3(write,...) -> ksys_write -> vfs_write -> new_sync_write -> call_write_iter ->write_iter -> xfs_file_write_iter"

## Related Pages

- [[io-subsystem]]
- [[block-layer]]
- [[page-cache]]
- [[bio]]
- [[filesystem]]
