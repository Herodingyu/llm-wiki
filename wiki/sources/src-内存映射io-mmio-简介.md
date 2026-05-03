---
doc_id: src-内存映射io-mmio-简介
title: 内存映射IO (MMIO) 简介
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/内存映射IO (MMIO) 简介.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · RDMA](https://www.zhihu.com/column/rdmatechnology) 72 人赞同了该文章 MMIO(Memory mapping [I/O](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/I%252FO/84718))即 [内存映射I/O](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/%25E5%2586%2585%25E5%25AD%2598%25E6%2598%25A0%25E5%25B

## Key Points

### 1. 基本概念
MMIO(Memory mapping I/O)即内存映射I/O，它是PCI规范的一部分，I/O设备被放置在内存空间而不是I/O空间。从处理器的角度看，内存映射I/O后系统设备访问起来和内存一样。这样访问AGP/PCI-E显卡上的帧缓存，BIOS，PCI设备就可以使用读写内存一样的汇编指令完成，简化了程序设计的难度和接口的复杂性。I/O作为CPU和外设交流的一个渠道，主要分为两种，一种是 [Por

### 2. PortIO和MMIO 的主要区别
1）前者不占用CPU的物理 [地址空间](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/%25E5%259C%25B0%25E5%259D%2580%25E7%25A9%25BA%25E9%2597%25B4/1423980) ，后者占有（这是对 [x86架构](https://link.zhihu.com/?targe

## Evidence

- Source: [原始文章](raw/tech/soc-pm/内存映射IO (MMIO) 简介.md) [[../../raw/tech/soc-pm/内存映射IO (MMIO) 简介.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/内存映射IO (MMIO) 简介.md) [[../../raw/tech/soc-pm/内存映射IO (MMIO) 简介.md|原始文章]]
