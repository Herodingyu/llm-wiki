---
doc_id: src-详解计算机中断路由-intx-pirqx-irqx的区别和联系是什么-swizzling和strai
title: 详解计算机中断路由：INTx、PIRQx、IRQx的区别和联系是什么？Swizzling和Straight又是什么？PIC和APIC路由表怎么解读？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/详解计算机中断路由：INTx、PIRQx、IRQx的区别和联系是什么？Swizzling和Straight又是什么？PIC和APIC路由表怎么解读？.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) 130 人赞同了该文章 目录

## Key Points

### 1. INTx、PIRQx和IRQx
PCI spec为每个PCI设备定义了四个中断请求信号线，分别是 **INTA#，INTB#，INTC#和INTD#** ，如图： ![](https://pica.zhimg.com/v2-edbea7080b486a9dccf2791b787ae922_1440w.jpg)

### 2. 极大灵活度的内部设备中断路由
Intel为桥片中或者CPU中的设备，提供了最大程度的灵活度，方便整机厂商根据实际情况来平衡中断请求。三级两层映射关系都可以自由调节。我们一层层剥开来看，先看前端：INTx -> PIRQx的映射。 ![](https://pic3.zhimg.com/v2-2e956ba808d32a86d5b77d6e67b697c4_1440w.jpg)

### 3. 外部设备和Swizzling
PCI和PCIe的外部设备，包括固定连线和Slot扩展槽，在PCI和PCIe的Spec中有推荐中断路由，也在图中有所表示： ![](https://pica.zhimg.com/v2-3a10b2f0f3e91843b916da1093987b3e_1440w.jpg)

### 4. 外部PCI设备
对主板上的PCI扩展插槽，用户插入什么设备，插在哪个槽内都不能在出厂时确定。我们这里要尽量考虑平衡原则和效率原则。我们将所有插槽的INTA#~INTD#分成四组串联起来如何？这样离得最近的Slot 1高兴了，每个都是我优先！万一有个用户把重要的网卡插在slot 4，效率会严重下降。在充分考虑到PCI设备绝大多数都是单功能设备（仅使用INTA#信号，很少使用INTB#和INTC#信号，而INTD#信

### 5. 外部PCIe设备
PCIe的设备有一个PCI设备没有的问题，每个PCIe链路下只有一个EP（End Point）设备，这个设备的中断请求信号（当然是虚拟的）一般是INTA#，如果RC下面的所有链路都采用Straight方式，即INTA#都连接PIRQA，则PIRQA的负担过重。于是PCIe采取一种类似PCI Slot插槽Swizzling的方式，不过是经过 [PCIe Root Port](https://zhid

## Evidence

- Source: [原始文章](raw/tech/peripheral/详解计算机中断路由：INTx、PIRQx、IRQx的区别和联系是什么？Swizzling和Straight又是什么？PIC和APIC路由表怎么解读？.md) [[../../raw/tech/peripheral/详解计算机中断路由：INTx、PIRQx、IRQx的区别和联系是什么？Swizzling和Straight又是什么？PIC和APIC路由表怎么解读？.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/详解计算机中断路由：INTx、PIRQx、IRQx的区别和联系是什么？Swizzling和Straight又是什么？PIC和APIC路由表怎么解读？.md) [[../../raw/tech/peripheral/详解计算机中断路由：INTx、PIRQx、IRQx的区别和联系是什么？Swizzling和Straight又是什么？PIC和APIC路由表怎么解读？.md|原始文章]]
