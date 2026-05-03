---
doc_id: src-内存系统-dram-ddr-与memory-controller-之二
title: 内存系统：DRAM, DDR 与Memory Controller 之二
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/内存系统：DRAM, DDR 与Memory Controller-之二.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · 现代计算机](https://www.zhihu.com/column/modern-computing) 134 人赞同了该文章 昨天写了“之一”，评论区明白人写的评论很精彩。

## Key Points

### 1. DRAM的组织结构
“之一”中讲的DRAM arrays实际上的名字应该叫array, 而DRAM array应该叫subarray，而且subarray之下还由MAT组成。 以上内容是“之一”评论区指出的，这个我确实不知道，今天查了一下确实如此。网上找到了篇资料，这里就不帖图了， [niladrish.org/pubs/hpca](https://link.zhihu.com/?target=http%3A//ni

### 2. DRAM的访问延时
一条访存指令发到内存控制器，它的访存延时是存在不同的可能性的。 1. row buffer hit 就是说数据已经在row buffer中，这时延时主要来自于从row buffer到把数据放在数据总线上的时延，这个过程需要大约20ns的时间。（可能是比较旧的数据了，欢迎评论区发出挑战）

### 3. OpenPage Policy和Close Page Policy
DRAM访问有两种模式，一个Open Page 一个是Close Page。前者在完成一次访存后保留row buffer的内容，如果下一个访存命令恰好也在同一个row上，就会row buffer hit，节省访问时间，但如果后一个访问地址不在同一个row上，就可row buffer conflict，增加了访存时间。后者在完成一次访存后立即执行prechage命令，即将row buffer的内容写

### 4. 地址映射策略
CPU给的一个访存指令中的地址可能是32位数，或是48位数。 现代CPU访存当然不是按字节访问的，而是按 [cache line](https://zhida.zhihu.com/search?content_id=5581056&content_type=Article&match_order=1&q=cache+line&zhida_source=entity) 访问或双cache line访

### 5. DDR接口
后面是DDR相关的内容了， DDR规范中即涉及DRAM本质，双涉及内存条的设计规范。

## Evidence

- Source: [原始文章](raw/tech/dram/内存系统：DRAM, DDR 与Memory Controller-之二.md) [[../../raw/tech/dram/内存系统：DRAM, DDR 与Memory Controller-之二.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/内存系统：DRAM, DDR 与Memory Controller-之二.md) [[../../raw/tech/dram/内存系统：DRAM, DDR 与Memory Controller-之二.md|原始文章]]
