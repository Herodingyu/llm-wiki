---
doc_id: src-内存-dram-的连续读写速度和随机读写速度是一样的吗-老狼-的回答
title: 内存（DRAM）的连续读写速度和随机读写速度是一样的吗？   老狼 的回答
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/内存（DRAM）的连续读写速度和随机读写速度是一样的吗？ - 老狼 的回答.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

如果像SSD一样，随机读写还是比连续读写慢，那么页式虚拟内存管理这层转换是不是会浪费很大的性能？而且即使没有页式内存管理，在BIOS层面上的“物理地址… 198 人赞同了该回答 ![](https://pica.zhimg.com/50/v2-80b0f87c58298441268afb02ad07baef_720w.jpg?source=2c26e567)

## Key Points

### 1. 内存（DRAM）的连续读写速度和随机读写速度是一样的吗？
如果像SSD一样，随机读写还是比连续读写慢，那么页式虚拟内存管理这层转换是不是会浪费很大的性能？而且即使没有页式内存管理，在BIOS层面上的“物理地址… 198 人赞同了该回答 ![](https://pica.zhimg.com/50/v2-80b0f87c58298441268afb02ad07baef_720w.jpg?source=2c26e567)

## Evidence

- Source: [原始文章](raw/tech/dram/内存（DRAM）的连续读写速度和随机读写速度是一样的吗？ - 老狼 的回答.md) [[../../raw/tech/dram/内存（DRAM）的连续读写速度和随机读写速度是一样的吗？ - 老狼 的回答.md|原始文章]]

## Key Quotes

> "---
title: "内存（DRAM）的连续读写速度和随机读写速度是一样的吗"

> "DRAM 随机读写是比连续读写要慢，我们来看实际的数据： AMD和Intel的差距不在本文范围内，我们暂且忽略。我们专注看第一条，就会发现： 按字节纯随机读取延迟 > 在一个page里面随机读取延迟 > 顺序连续读取延迟 这是为什么呢？我们分别来看看： 随机读取延迟为什么高"

> "不是说好内存是随机读取设备吗？为什么随机读取延迟还会高呢？这里有两个原因： Burst读取 和 Prefetcher"

> "我们知道内存条是有64个Bit的数据线:DQ0-DQ63，共8个字节。如果读取某个地方的数据，需要不少步骤（大致）： Precharge"

> "列有效 。RAS#高电平，CAS#低电平。意味着列地址有效，这时在A0-A13上传送的是列地址。没错，A0-A13是行列共用的，所以每个格子选择需要有1和2两步才能唯一确定"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/内存（DRAM）的连续读写速度和随机读写速度是一样的吗？ - 老狼 的回答.md) [[../../raw/tech/dram/内存（DRAM）的连续读写速度和随机读写速度是一样的吗？ - 老狼 的回答.md|原始文章]]
