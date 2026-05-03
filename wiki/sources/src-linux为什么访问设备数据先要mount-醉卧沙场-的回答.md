---
doc_id: src-linux为什么访问设备数据先要mount-醉卧沙场-的回答
title: dd if=/dev/sdb4 of=/tmp/test bs=4M count=2
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/linux为什么访问设备数据先要mount - 醉卧沙场 的回答.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

根目录下的/dev/目录文件负责所有的硬件设备文件。 当U盘插入Linux后，系统也确实会给U盘分配一个目录文件(比如：sdb4),位于/dev/sd…[收录于 · 谈谈计算机，说说文件系统](https://www.zhihu.com/column/zorrolang) 2012 人赞同了该回答 ![](https://picx.zhimg.com/v2-ba649e8e359deddccc0aa539fae01633.jpg?source=7e7ef6e2&needBackground=1)

## Key Points

### 1. linux为什么访问设备数据先要mount?
根目录下的/dev/目录文件负责所有的硬件设备文件。 当U盘插入Linux后，系统也确实会给U盘分配一个目录文件(比如：sdb4),位于/dev/sd…[收录于 · 谈谈计算机，说说文件系统](https://www.zhihu.com/column/zorrolang)

## Evidence

- Source: [原始文章](raw/tech/bsp/linux为什么访问设备数据先要mount - 醉卧沙场 的回答.md) [[../../raw/tech/bsp/linux为什么访问设备数据先要mount - 醉卧沙场 的回答.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/linux为什么访问设备数据先要mount - 醉卧沙场 的回答.md) [[../../raw/tech/bsp/linux为什么访问设备数据先要mount - 醉卧沙场 的回答.md|原始文章]]
