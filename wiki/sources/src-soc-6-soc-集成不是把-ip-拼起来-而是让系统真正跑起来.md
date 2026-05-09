---
doc_id: src-soc-6-soc-集成不是把-ip-拼起来-而是让系统真正跑起来
title: SoC（6）：SoC 集成不是把 IP 拼起来，而是让系统真正跑起来
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/SoC（6）：SoC 集成不是把 IP 拼起来，而是让系统真正跑起来 .md
domain: tech/soc-pm
created: 2026-05-09
updated: 2026-05-09
tags: [soc-pm]
---

## Summary

!\[cover\_image\](https://mmbiz.qpic.cn/mmbiz\_jpg/g68z8egLoSplJTW2 Qd5niaRkO5iaN0g3eHVsSBuDfl6kVuh7LZT7gE76g5VFAMuV1efHOeKmxDopVusiajLqlOYDaSbqPicKU7a4 FzskWrpPsyg/0?wx\_fmt=jpeg) Original  alltowine  alltowine  [芯片系统成长记](javascript:void\(0\);) *2026年5月9日 09:35* * 湖北 * 在小说阅读器读本章

## Key Points

### 1. 一、为什么 SoC 集成这么难？
先回到最底层的问题。 SoC 里有什么？ 有负责计算的 CPU、GPU、DSP、NPU； 有负责存储的 Cache、SRAM、DRAM Controller、Flash Controller； 有负责连接的总线、交叉开关、NoC；

### 2. 二、模块化设计：先把边界定义清楚
为什么要模块化？ 因为 SoC 太复杂了，如果所有逻辑都揉在一起，后面根本无法维护、复用和验证。 模块化的本质是： 把复杂系统拆成一个个边界清晰、职责明确、接口稳定的模块。 比如一个 UART 模块，它不应该关心整个 SoC 的所有事情。它只需要做好几件事：

### 3. 三、IP 选择与维护：买来的 IP，不等于能直接用
SoC 集成里一个非常现实的问题是：很多模块不是自己从零写的，而是复用已有 IP，或者采购第三方 IP。比如 CPU Core、DDR Controller、USB、PCIe、MIPI、GPU、NPU 等，很多都是外部 IP。

### 4. 四、标准化设计：统一规则，才能降低复杂度
如果模块化解决的是“怎么拆”，那标准化解决的是“怎么连”。 SoC 里最怕每个模块都有自己的风格： 有的用 AXI； 有的用 AHB； 有的用 APB； 有的寄存器 32 位对齐； 有的 16 位对齐；

### 5. 五、转换桥：不同世界之间的翻译器
在 SoC 里，不同模块可能使用  不同协议、不同位宽、不同频率、不同电源域  。它们不能直接硬连，必须通过桥接模块转换。 常见的桥包括： AXI 转 APB； AXI 转 AHB； 异步时钟桥； 数据位宽转换桥；

## Evidence

- Source: [原始文章](raw/tech/soc-pm/SoC（6）：SoC 集成不是把 IP 拼起来，而是让系统真正跑起来 .md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/SoC（6）：SoC 集成不是把 IP 拼起来，而是让系统真正跑起来 .md)
