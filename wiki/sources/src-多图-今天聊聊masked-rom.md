---
doc_id: src-多图-今天聊聊masked-rom
title: 多图！今天聊聊Masked ROM
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/多图！今天聊聊Masked ROM.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · SoC知识百宝箱](https://www.zhihu.com/column/c_1892355985563169100) 3 人赞同了该文章 Hi，早！

## Key Points

### 1. 成本与灵活性的妥协
掩模ROM的主要优势在于其低成本。由于数据是在芯片制造时直接嵌入的，所以不需要额外的编程步骤或设备，这大大简化了生产过程并减少了生产成本。然而，这种技术也带来了一些限制。一旦芯片被制造出来，其存储的数据就无法更改，这意味着掩模ROM在程序灵活性上做出了妥协。因此，它们最适合那些不需要更改或升级固件的应用程序，比如 [嵌入式系统](https://zhida.zhihu.com/search?con

### 2. 视频游戏卡带中的应用
在视频游戏领域，掩模ROM也被广泛使用，尤其是在早期的游戏卡带中，如任天堂的NES（Nintendo Entertainment System）游戏卡。这些游戏卡通常包含一块或多块掩模ROM芯片，如你提到的MCM6570（尽管这是一个虚构的型号，用于说明概念，实际产品可能有所不同）。这些芯片直接存储了游戏的数据和程序，游戏主机可以直接读取这些数据，而无需通过复杂的图像处理或解码过程。这种方式简化了

### 3. 直接读取的优势
掩模ROM芯片直接读取的优势在于其高速性和直接性。由于数据是直接以物理电路的形式存储在芯片上的，因此访问这些数据时不需要任何中间解码或转换步骤。这使得游戏或其他应用程序能够更快地启动和运行，同时也减少了出错的可能性。此外，由于掩模ROM的制造成本较低，这也使得基于掩模ROM的游戏卡带能够以较低的价格提供给消费者。

### 4. 逻辑门


### 5. NOR
![](https://picx.zhimg.com/v2-510debe767c8b1f4a9712c56fe9953ff_1440w.jpg) 上图：NOR结构示例示意图。版权所有2005年Sergei P. Skorobogatov，经授权使用

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/多图！今天聊聊Masked ROM.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/多图！今天聊聊Masked ROM.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/多图！今天聊聊Masked ROM.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/多图！今天聊聊Masked ROM.md|原始文章]]
