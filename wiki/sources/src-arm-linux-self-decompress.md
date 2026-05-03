---
doc_id: src-arm-linux-self-decompress
title: ARM Linux 自解压过程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/ARM Linux 启动时的自解压过程.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, arm, linux, kernel, decompress]
---

## Summary

本文详细介绍了 ARM Linux 压缩内核（zImage）的自解压过程。压缩内核可以节省 50% 以上的存储空间，且解压速度通常比从存储介质传输未压缩镜像更快。文章分析了 Bootloader 传递参数（r0=0, r1=Machine ID, r2=ATAG/DTB 指针）、zImage 解压代码的执行流程、物理内存起始地址的计算、页表的临时设置、附加 DTB 的处理、解压后的内存布局调整，以及最终跳转到未压缩内核的完整过程。

## Key Points

### 1. 压缩内核的优势
- **节省空间**: vmlinux 11.8MB → zImage 4.8MB（节省 50%+）
- **加载更快**: 解压时间通常比传输未压缩镜像短（尤其是 NAND Flash）

### 2. Bootloader 传递参数
- r0 = 0
- r1 = Machine ID（设备树内核中忽略）
- r2 = ATAG 指针 或 DTB 指针
- 运行状态：MMU disabled、Cache disabled、中断 disabled

### 3. 解压流程
1. **确定物理内存起始地址**
   - `CONFIG_AUTO_ZRELADDR`: PC 按 128MB 对齐
   - 计算 `zreladdr = 物理内存起始 + TEXT_OFFSET`
   - TEXT_OFFSET 通常为 0x8000（32KB）

2. **设置临时页表**
   - 映射解压前后的内存区域
   - 目的：使能 Cache，加速解压
   - 不是用于虚拟内存，仅用于 Cache

3. **检查附加 DTB**
   - `CONFIG_ARM_APPENDED_DTB`: 编译时 cat foo.dtb >> zImage
   - DTB 以幻数 0xD00DFEED 标识
   - `CONFIG_ARM_ATAG_DTB_COMPAT`: 用 ATAG 扩充 DTB

4. **处理内存重叠**
   - 若解压后内核覆盖压缩内核
   - 将压缩内核复制到解压后内核结束位置
   - 跳转到新位置重新执行

5. **解压执行**
   - 调用 `decompress_kernel()` → `do_decompress()` → `__decompress()`
   - 支持多种压缩格式：gzip、lzo、lzma、xz、lz4

6. **跳转到内核**
   - `__enter_kernel`: 恢复 r0=0, r1=Machine ID, r2=ATAG/DTB
   - PC = 物理内存起始 + TEXT_OFFSET
   - 进入 `stext()` 开始内核初始化

## Evidence

```c
// AUTO_ZRELADDR 计算
mov r4, pc
and r4, r4, #0xf8000000
add r4, r4, #TEXT_OFFSET

// 解压调用
mov r0, r4          // kernel execution address
mov r1, sp          // malloc space
add r2, sp, #0x10000  // 64k max
mov r3, r7          // architecture ID
bl decompress_kernel
```

## Key Quotes

> "1、节省存放内核的闪存或其他存储介质的空间。"

## Open Questions

- 不同压缩格式的性能对比（解压速度 vs 压缩率）
- 高通平台 TEXT_OFFSET 扩展到 0x00208000 的原因

## Related Pages

- [[linux-boot]]
- [[arm]]
- [[zimage]]
- [[device-tree]]
