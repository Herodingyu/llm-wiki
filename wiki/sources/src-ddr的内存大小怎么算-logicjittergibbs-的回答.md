---
doc_id: src-ddr的内存大小怎么算-logicjittergibbs-的回答
title: ddr的内存大小怎么算   LogicJitterGibbs 的回答
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/ddr的内存大小怎么算 - LogicJitterGibbs 的回答.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

41 人赞同了该回答 ![](https://pic1.zhimg.com/50/v2-e15a172ccaa3e5a9b4a7fef04c00da46_720w.jpg?source=2c26e567) 本期我们将基于 DDR4 讨论 DRAM 的颗粒容量规格。 基于 JESD79-4B / 2.8 节 本系列连载于 OpenIC SIG，除了 DDR 学习时间专栏外，OICG 目前正在陆续上线 HDLBits 中文导学的优化版本，欢迎关注/支持/加入我们 DDR 学习时间 - OpenIC SIG 开源数字IC技术分享 导言 DDR4 协议标准中规定了几种 DRAM 颗粒 的容量规格，这些

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/dram/ddr的内存大小怎么算 - LogicJitterGibbs 的回答.md) [[../../raw/tech/dram/ddr的内存大小怎么算 - LogicJitterGibbs 的回答.md|原始文章]]

## Key Quotes

> "选址数量 (M) 行数量 列数量 BG 数量 每个 BG 中 BA 数量 512 32768 1024 256 16384 地址所属的行、列、BA 以及 BG 的寻址是通过对应的地址线寻址得到，所以不同位宽的颗粒地址线的数目也不同"

> "行地址线数目 列地址线数目 BA 地址线数目 BG 地址线数目 15 10 14 由于行列地址线是分时复用的，以 x4 位宽为例，行列共享 A0-A14 地址线中的 A0-A9，所以 x4 位宽总地址数量为 15 (A) + 2 (BA) + 2 (BG) = 19"

> "这里我们看到使用小位宽颗粒虽然能够拼接更多颗粒，提供更大的系统容量，但是所需要的地址线较 x8 和 x16 的颗粒也更多。这是更大系统容量的代价，或者说是系统容量与地址线数量的折中考量（ trade-off）"

> "最后，我们在前文中使用 4b x 512M 来描述一个 x4 颗粒，这是从颗粒位宽 x 地址数量的角度出发。协议中的称呼为 512Mb x 4，个人觉得两种称呼都可使用吧，笔者自己平时也没特别在意"

> "DDP 颗粒 最后讨论一种容量比较特别的颗粒，也是最近工作中遇到的。事情是这样的，客户提问说 SoC 能不能支持一种 4GB 的 DDR4 颗粒。阅读完本文的读者知道，DDR4 最大只有 16Gb（2GB）的颗粒，哪来的单颗 4GB 颗粒"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/ddr的内存大小怎么算 - LogicJitterGibbs 的回答.md) [[../../raw/tech/dram/ddr的内存大小怎么算 - LogicJitterGibbs 的回答.md|原始文章]]
