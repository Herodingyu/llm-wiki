---
doc_id: src-ddr技术基础
title: DDR技术基础
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/DDR技术基础.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

本文是一篇广受欢迎的DDR技术基础科普文章（知乎320+赞同），系统介绍了DDR（Double Data Rate）内存技术的发展历程、核心原理和关键技术演进。文章从DRAM的基本概念出发，解释了同步DRAM（SDRAM）的诞生和DDR倍频技术的出现。通过形象的类比（如水管的粗细与流速），阐明了DRAM内部存储单元工作频率远低于接口频率的核心机制——预取（Prefetch）技术。文章还详细梳理了DDR系列（DDR2/DDR3/DDR4/DDR5）和衍生技术（LPDDR/GDDR/HBM）的发展脉络，说明了不同应用场景（PC/手机/显卡/服务器）对内存技术的差异化需求。此外，文章涵盖了LPDDR和GDDR的技术特点，以及DDR接口速度、位宽与总带宽的计算关系，为理解现代内存系统提供了全面的知识框架。

## Key Points

### 1. DRAM技术演进历史

| 时间节点 | 技术里程碑 | 说明 |
|----------|------------|------|
| 1993年 | SDRAM诞生 | 三星引入同步DRAM，与CPU外频同步，频率达133MHz |
| 2000年 | DDR技术出现 | 双边沿传输，接口速率大幅提升 |
| 2001年 | GDDR诞生 | 专为显卡设计的高带宽内存 |
| 2010年 | LPDDR出现 | 面向移动设备的低功耗DDR |

### 2. DDR核心原理：预取技术
- **内部频率低**：DRAM存储单元实际工作频率远低于接口频率（如接口1066M，内部仅133M）
- **预取机制**：接口宽度 > 内部阵列宽度，一次读取多个数据到缓冲器
- **形象类比**：粗水管内流速不快，但收窄出口后速度大幅提高
- **接口速度**：DDR3-1333表示单pin速率1333Mbit/s，128pin接口总带宽21.3GB/s

### 3. DDR系列技术对比

| 标准 | 主要特点 | 应用场景 |
|------|----------|----------|
| DDR2 | 4n预取，更低功耗 | 早期PC/笔记本 |
| DDR3 | 8n预取，Fly-by拓扑 | 主流PC/服务器 |
| DDR4 | POD端接，Bank Group | 高性能计算 |
| DDR5 | 双通道独立，更高频率 | 最新PC/数据中心 |

### 4. 衍生技术
- **LPDDR**：Low Power DDR，用于手机、平板、笔记本，强调低功耗
- **GDDR**：Graphics DDR，用于显卡，追求极致带宽
- **HBM**：High Bandwidth Memory，3D堆叠，用于AI/HPC加速器

### 5. 关键技术指标
- **接口速率**：单pin数据传输速率（Mbit/s）
- **位宽**：数据总线宽度（64bit、128bit、256bit等）
- **带宽计算**：带宽 = 接口速率 × 位宽 / 8（转换为字节）
- **延迟**：CL、tRCD、tRP等时序参数

## Evidence

- Source: [原始文章](raw/tech/dram/DDR技术基础.md) [[../../raw/tech/dram/DDR技术基础.md|原始文章]]

## Key Quotes

> "要讲LPDDR以及GDDR，都得先讲DRAM，因为前两者其实是DRAM技术的衍生品，只不过LPDDR主要应用于笔记本电脑、手机、平板等低功耗领域，GDDR主要应用于显卡领域"

> "现代化的DRAM技术从1993年才真正开始。这一年三星引入了SDRAM技术，也叫同步DRAM，这里的同步是指跟CPU的外频时钟同步，频率也飙升到133M。而DDR倍频技术从2000年才开始，应用于显卡的GDDR从2001年出现，应用于手机等移动设备的LPDDR 2010年才出现"

> "DDR接口的出现，带来了内存速度的大幅提高。下面这张图比较好的给出了DDR接口的演进历史，从DDR2->DDR3->DDR4等。解释下含义：DDR3-1333是说，DRAM接口单根pin的速度为1333Mbit/s，如果接口为128pin，那么DRAM接口速度可以达到21.3GB/s"

> "基于此，DRAM的内部存储操作速度难以大幅度改进。举个例子：即使DRAM接口pin做到了1066M，DRAM的存储单元其实并没有工作在1066M这么高的时钟下面，相反只有133M。快的只是接口而已"

> "就好像一个很粗的水管，里面的水流速其实并不快，但是只要我们把出口收窄，出口的水速就会大幅提高，远远高于水管内的水速"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/DDR技术基础.md) [[../../raw/tech/dram/DDR技术基础.md|原始文章]]
