---
doc_id: src-soc-5-架构级低功耗设计
title: SoC（5）：架构级低功耗设计：真正省电的 SoC，不是“少干活”，而是“会干活”
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/SoC（5）架构级低功耗设计.md
domain: tech/soc-pm
created: 2026-05-09
updated: 2026-05-09
tags: [soc-pm]
---

## Summary

!\[cover\_image\](https://mmbiz.qpic.cn/sz\_mmbiz\_jpg/g68z8egLoSr4 IltWeQ4GSmkaRXy6eicen7qaNnXEBspNWusj4OTKV7mX1nfDIM0bicQOkeNaOKrBM3 ViaQ7BREVIy0yFJChKRRG0s0ibLiafPaHA/0?wx\_fmt=jpeg) Original  alltowine  alltowine  [芯片系统成长记](javascript:void\(0\);) *2026年5月8日 14:58* * 湖北 * 在小说阅读器读本章

## Key Points

### 1. 一、  怎么  最简单地理解  功耗
芯片为什么耗电？ 本质上主要有两类。 第一类是动态功耗。 电路中的信号从 0 变 1，或者从 1 变 0，每一次翻转都会消耗能量。翻转越频繁、频率越高、电压越高，动态功耗就越大。 第二类是静态功耗。 即使电路不工作，只要模块还通着电，晶体管也会有漏电流。就像家里的电器处于待机状态，虽然没真正使用，但仍然在耗电。

### 2. 二、处理器：别让“大马拉小车”
在 SoC 中，通常不只有 CPU，还可能有 GPU、DSP、NPU、ISP、MCU 等不同计算单元。 从架构级低功耗角度看，第一个原则是： 让合适的硬件干合适的活。 比如手机拍照后做人脸检测。 如果全部交给 CPU 做，CPU 要频繁跑高频，功耗自然高。

### 3. 三、存储：很多时候，搬数据比计算更费电
在 SoC 中，数据可能来自寄存器、Cache、片上 SRAM、SPM、外部 DRAM、Flash 等不同层次。 越靠近计算单元，访问越快，通常也越省电；越远，访问代价越高。 所以低功耗设计里有一个非常重要的思想：

### 4. 四、互连：不是所有模块都该走“高速公路”
SoC 中有很多模块：CPU、DMA、存储控制器、显示、音频、通信接口、传感器接口等。它们之间需要通过总线、交叉开关或 NoC 互连。 架构设计时，一个常见误区是： 所有模块都挂到一条高性能总线上。  这看起来简单，但不一定省电。

### 5. 五、外设：让系统“被叫醒”，而不是“一直等”
低功耗 SoC 里，很重要的一个思想是事件驱动。 比如智能手表平时不需要主 CPU 一直运行。 计步、心率、RTC、蓝牙低功耗模块可以处于低功耗状态，只有当传感器检测到事件时，再通过中断唤醒系统。  这比 CPU 一直轮询“有没有事情发生”要省电得多。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/SoC（5）架构级低功耗设计.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/SoC（5）架构级低功耗设计.md)
