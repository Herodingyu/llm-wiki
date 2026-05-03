---
doc_id: src-寄存器的速度为何比内存更快-psubunwell-的回答
title: 寄存器的速度为何比内存更快？   psubunwell 的回答
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/寄存器的速度为何比内存更快？ - psubunwell 的回答.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

30 人赞同了该回答 我只是上过VLSI这门课，不敢说很懂。只不过刚刚看到题目后翻了一下Weste & Harris的CMOS VLSI Design教材，发现了一个上面答者没有注意到的词：外围电路（peripheral circuitry）？ 我一开始是看了题主的题目，显然，题目的内存指的是DRAM的话，显然比Register慢太多了，因为Register是用FF来存取信息的，DRAM是用 [电容](https://zhida.zhihu.com/search?content_id=27646989&content_type=Answer&match_order=1&q=%E7%94%B5%

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/dram/寄存器的速度为何比内存更快？ - psubunwell 的回答.md) [[../../raw/tech/dram/寄存器的速度为何比内存更快？ - psubunwell 的回答.md|原始文章]]

## Key Quotes

> "注意，SRAM的功能本来也可以由FF实现，但是！"

> "*CMOS VLSI Design*, Weste & Harris"

> "但是举一反三地问自己一下：Register的速度为何比Cache（SRAM）更快？还是因为两者先天速度么？Register是DFF做的，SRAM都是6T Cell做的，都是利用触发或锁存来存取数据，貌似速度上先天差不多？（这个我也不是很确定。。）是否有其他因素呢"

> "Register由FF组成。因为Register数量很小，相对的读写操作外围电路（peripheral circuitry）占大头，所以外围电路要尽量简单。FF虽然面积很大（2个Latch，约30颗MOS），但换来的正好是外围电路的简单！再加上速度要快快快！因此Register要选择用FF"

> "锁存器（Latch）。锁存器是电平敏感的，一般来讲作为构成寄存器（register）一部分出现。在时序电路中不会单独出现，不然容易引起时序错误"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/寄存器的速度为何比内存更快？ - psubunwell 的回答.md) [[../../raw/tech/dram/寄存器的速度为何比内存更快？ - psubunwell 的回答.md|原始文章]]
