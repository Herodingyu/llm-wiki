---
doc_id: src-dd-disk-benchmark
title: 正确使用 dd 测试磁盘速度
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/确的使用dd进行磁盘读写速度测试.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, dd, disk, benchmark, performance]
---

## Summary

本文纠正了使用 dd 命令测试磁盘速度的常见误区。dd 默认显示的速度是写入内存缓冲区的速度，不是磁盘实际写入速度。文章介绍了四种测试方式，推荐使用 `conv=fdatasync` 参数进行写速度测试，`iflag=direct` 进行读速度测试。测试文件大小应远大于内存容量，以排除缓存影响。

## Key Points

### 1. 常见误区
```bash
# 错误：测试的是内存缓冲区写入速度
dd if=/dev/zero of=/test.iso bs=1024M count=1
```
- 数据先写入内存缓冲区
- 缓冲区满后才刷入硬盘
- 显示的速度不是磁盘实际速度

### 2. 四种测试方式对比
| 命令 | 说明 | 准确性 |
|------|------|--------|
| `dd if=/dev/zero of=test bs=1024M count=1` | 仅写入内存缓冲 | 低 |
| `dd ...; sync` | dd 完成后 sync | 低（sync 时 dd 已打印速度） |
| `dd ... conv=fdatasync` | 最后执行一次 sync | **高（推荐）** |
| `dd ... oflag=dsync` | 每次写入都 sync | 高但最慢（无写缓存） |

### 3. 推荐测试方法
**写速度测试：**
```bash
dd if=/dev/zero of=/test.iso bs=1024M count=1 conv=fdatasync
```

**读速度测试：**
```bash
dd if=/test.iso of=/dev/zero bs=1024M count=1 iflag=direct
```

### 4. 注意事项
- 测试文件大小应 **远大于内存容量**
- 排除 page cache 影响
- `conv=fdatasync` 在最后执行 sync，数据写入磁盘后才显示速度

## Evidence

- `fdatasync` 参数确保数据写入磁盘
- `direct` 参数绕过 page cache
- 默认 dd 测试的是内存写入速度

## Open Questions

- fio 工具与 dd 在磁盘测试中的优劣对比
- SSD 与 HDD 在 dd 测试中的差异

## Related Pages

- [[dd]]
- [[disk-benchmark]]
- [[performance-test]]
- [[page-cache]]
