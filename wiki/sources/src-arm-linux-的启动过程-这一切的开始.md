---
doc_id: src-arm-linux-的启动过程-这一切的开始
title: ARM Linux 的启动过程，这一切的开始
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/ARM Linux 的启动过程，这一切的开始.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · Linux内核品读](https://www.zhihu.com/column/c_1287649322201272320) 6 人赞同了该文章 大家好，我是老吴。

## Key Points

### 1. 这一切的开始
ARM Linux 内核在自解压并处理完设备树的更新后，会将程序计数器 pc 设置为 stext() 的 [物理地址](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E7%89%A9%E7%90%86%E5%9C%B0%E5%9D%80&zhida_source=e

### 2. 虚拟内存的划分
首先，让我们先弄清楚内核是在虚拟内存中哪个地址开始执行的。内核的虚拟内存基地址 (kernel RAM base) 由 PAGE\_OFFSET 决定，你可以对其进行配置。从名字上理解 PAGE\_OFFSET：first page of kernel RAM 在 [虚拟内存](https://zhida.zhihu.com/search?content_id=177134449&content_

### 3. 目前我们是在哪里运行？
我们继续查看 arch/arm/ [kernel](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=6&q=kernel&zhida_source=entity) /head.S 里的 stext()。

### 4. 给 P2V 打补丁 (Patching Physical to Virtual)
现在我们有了运行时应处于的虚拟 [内存地址](https://zhida.zhihu.com/search?content_id=177134449&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E5%9C%B0%E5%9D%80&zhida_source=entity) 和实际执行时的物理内存地址之间的偏移量 (PHYS\_OFF

## Evidence

- Source: [原始文章](raw/tech/bsp/ARM Linux 的启动过程，这一切的开始.md) [[../../raw/tech/bsp/ARM Linux 的启动过程，这一切的开始.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/ARM Linux 的启动过程，这一切的开始.md) [[../../raw/tech/bsp/ARM Linux 的启动过程，这一切的开始.md|原始文章]]
