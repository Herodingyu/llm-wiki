---
doc_id: src-了解linux内核内存映射-二
title: 了解Linux内核内存映射（二）
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/了解Linux内核内存映射（二）.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

2 人赞同了该文章 **一. IO映射介绍** 设备 [驱动程序](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E9%A9%B1%E5%8A%A8%E7%A8%8B%E5%BA%8F&zhida_source=entity) 要直接访问外设或其接口卡上的 [物理电路](https://zhida.zhihu.com/search?content_id=207422841&content_type=Article&match_order=1&q=%E7%89%A

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/bsp/了解Linux内核内存映射（二）.md) [[../../raw/tech/bsp/了解Linux内核内存映射（二）.md|原始文章]]

## Key Quotes

> "a – I/O 映射方式（I/O-mapped）"

> "b – 内存映射方式（Memory-mapped）"

> "二. Memory-mapped"

> "（一）进程启动映射过程，并在虚拟地址空间中为映射创建虚拟映射区域"

> "（二）调用内核空间的系统调用函数mmap（不同于用户空间函数），实现文件物理地址和进程虚拟地址的一一映射关系"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/了解Linux内核内存映射（二）.md) [[../../raw/tech/bsp/了解Linux内核内存映射（二）.md|原始文章]]
