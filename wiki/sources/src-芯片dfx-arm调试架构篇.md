---
doc_id: src-芯片dfx-arm调试架构篇
title: 【芯片DFX】Arm调试架构篇
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【芯片DFX】Arm调试架构篇.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 17 人赞同了该文章 - **[【芯片DFX】万字长文带你搞懂JTAG的门门道道](https://link.zhihu.com/?target=https%3A//mp.weixin.qq.com/s%3F__biz%3DMzUyOTY5NzkwNg%3D%3D%26mid%3D2247487624%26idx%3D1%26sn%3Dc173bf77ce731be0c655dd7c3be37e18%26chksm%3Dfa5c4d95cd2bc48

## Key Points

### 1. Perface
调试是软件开发的一个重要组成部分，通常是最消耗时间的（也因此非常昂贵）。错误可以是很难察觉、重现和修复的，而且也难以预料解决一个缺陷需要多长的时间。 在产品交付给客户后，解决问题的成本显著增加。在很多情况下，一个产品的销售只有一个很小的时间窗口，如果产品晚了，它可能错过市场的机会。因此，对于任何开发人员， **系统所提供的调试工具是要考虑的一个重要因素。**

### 2. ARM调试硬件
Cortex-A系列处理器提供的 **硬件功能可以使调试工具提供可以明显提高处理器控制活动** 和 **非入侵性地收集大量的有关程序执行数据的水平** 。我们可以将硬件的功能分为两类： **入侵性和非入侵性** 。

### 3. ARM跟踪硬件
**非侵入性调试（在ARM文档中通常称为跟踪）可以在执行时观察处理器的行为** ，它可以记录内存访问的执行（包括地址和数据），并生成一个程序运行的跟踪，查看外设访问，堆和栈访问以及变量的改变。 对于许多实时体统，\*\*不能使用入侵性调试的方法。\*\*例如，考虑一个引擎管理系统， **也许能够在特定的地方停止处理器，但引擎将继续运行** ，所以将无法做有用的调试，即使是在不太繁重的实时要求环境中

### 4. 调试监视器
ARM架构为外部调试器提供了多种访问的功能，这些功能模块也可用于处理器的代码，即所谓的调试监视器，它驻留在目标系统。 监视系统是比较便宜的，因为它们可能并不需要额外的硬件。然而，它们需要占用系统的存储器空间，而且 **只有当目标系统本身实际运行时才能使用。**

### 5. 调试Linux应用程序
Linux是一个多任务的操作系统， **其每一个进程都有自己的进程地址空间，并完成私有页表的映射，这会让调试一些问题比较麻烦。** 我们可以大致定义两个不同的调试Linux系统所使用的方法。 - （1）Linux应用程序，通常使用运行在目标上的 **GDB调试服务器与主计算机通信来进行调试** ，通常通过以太网。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【芯片DFX】Arm调试架构篇.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【芯片DFX】Arm调试架构篇.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【芯片DFX】Arm调试架构篇.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【芯片DFX】Arm调试架构篇.md|原始文章]]
