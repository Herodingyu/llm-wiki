---
doc_id: src-io子系统全流程介绍
title: IO子系统全流程介绍
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/IO子系统全流程介绍.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, linux, io, kernel, filesystem, block]
---

## Summary

本文基于Linux Kernel 5.19-rc5，从系统调用到硬件磁盘完整梳理了Linux IO子系统的主线流程。文章通过一个简单C语言文件的open/read/write/close操作，深入解析了IO请求在用户态到内核态的完整处理链路：syscall → VFS → 文件系统（xfs） → iomap → folio/page cache → bio → request → IO调度器 → 软件调度队列(ctx) → 硬件调度队列(hctx) → SCSI磁盘驱动。核心在于理解Linux如何将用户视角的连续文件映射到物理上不连续的内存和磁盘块，以及bio机制如何桥接文件系统与块设备驱动。

## Key Points

### 1. IO系统调用流程
**sys_read/write 调用链：**
```
syscall → ksys_read/write → vfs_read/write → file_operations → xfs_file_read/write_iter → iomap → bio → request → scsi
```

**两种写模式：**
- **BUFFERED（默认）**：数据写入page cache，由回写进程定期刷盘
- **DIRECT**：绕过page cache，直接读写磁盘
- **DAX**：直接访问（适用于NOR Flash等可直接地址访问的存储）

### 2. 核心数据结构

**folio（2020年引入）：**
- 一段连续内存，一个或多个page的集合
- 本质调用`alloc_pages(gfp, order)`，目前多为4K
- 未来趋势替代page概念

**bio（Block IO）：**
- 描述一段连续磁盘空间到不连续内存的映射
- `bio_vec`数组：每个元素描述一段连续mem空间（不超过一个folio）
- 关键字段：
  - `bi_sector`：磁盘起始扇区
  - `bi_size`：总大小
  - `bv_page`：folio的head page
  - `bv_offset`：folio内部偏移
  - `bv_len`：映射长度

### 3. 三层映射关系
```
用户视角：连续的文件（file offset → size）
    ↓ 文件系统转换
内核视角：不连续的folio（folio地址 + 页内偏移）
    ↓ bio映射
磁盘视角：不连续的sector（sector ID + sector数目）
```

### 4. 磁盘访问单元
- **sector（扇区）**：512字节（历史兼容）
- **机械硬盘**：由扇区组成
- **固态硬盘**：由存储页组成
- **所需信息**：sector位置、sector数目、folio地址、页内偏移

### 5. Page Cache机制
- **读优化**：若数据已在page cache，直接读取内存避免磁盘IO
- **写优化**：sys_write仅写入page cache，由回写进程异步刷盘
- **回写策略**：定期唤醒回写进程，将脏页写入磁盘

## Key Quotes

> "kernel给用户营造的视角是一个地址连续的file，但是实际文件数据存储在mem和disk上却是不连续的。"

> "sys_write并没有写磁盘的操作，而是把这个操作交给了定期开启的回写进程。"

> "磁盘驱动只有拿到sector位置、sector数目、page(folio)地址、page(folio)页内偏移才能将数据写入或者写出。"

## Evidence

- Source: [原始文章](raw/tech/bsp/IO子系统全流程介绍.md) [[../../raw/tech/bsp/IO子系统全流程介绍.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/IO子系统全流程介绍.md) [[../../raw/tech/bsp/IO子系统全流程介绍.md|原始文章]]
