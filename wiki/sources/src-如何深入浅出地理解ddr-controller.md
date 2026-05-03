---
doc_id: src-如何深入浅出地理解ddr-controller
title: 如何深入浅出地理解DDR Controller？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/如何深入浅出地理解DDR Controller？.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · 芯片验证](https://www.zhihu.com/column/c_1446608036219895808) LogicJitterGibbs、Trustintruth 等 122 人赞同了该文章 > 前言

## Key Points

### 1. 13.2 行缓冲区管理策略（Row-Buffer-Management Policy）
在现代 DRAM 器件中，感放大器（sense amplifiers）阵列也可充当提供临时数据存储的缓冲区。在本章中，管理感放大器操作的策略称为行缓冲区管理策略（row-buffer-management policies）。两种主要的行缓冲区管理策略是开页策略（open-page policy）和闭页策略（close-page policy），并且根据系统不同，可以使用不同的行缓冲区管理策略来优

### 2. 13.2.1 开页（Open-Page）行缓冲区管理策略
在通用 DRAM 器件中，往返于 DRAM 存储单元的数据访问是一个两步过程，要求分别发出“行激活（row activation）命令”和“列访问（column access）命令”。 [^1] 在内存访问序列具有高度时间和空间局部性的情况下，内存系统架构师和设计工程师可以通过将时间上和空间上相邻的内存访问引导至同一内存行来利用这种局部性。开页行缓冲区管理策略旨在通过保持感放大器处于打开状态并保留

### 3. 13.2.2 闭页（Close-Page）行缓冲区管理策略
与开页行缓冲区管理策略相反，闭页行缓冲区管理策略旨在偏向 **对内存中随机位置的访问** ，并以最佳方式支持具有低访问局部性的内存请求模式。开页策略及其密切相关的变体策略通常部署在为低处理器数量、通用计算机而设计的内存系统中。相对地，闭页策略通常部署在为高处理器数量的多处理器系统或专用嵌入式系统而设计的内存系统中。之所以在低处理器数量的平台上通常部署开页策略，而在处理器数量较大的平台上通常部署闭页

### 4. 13.2.3 混合（动态）行缓冲区管理策略
在现代 DRAM 内存控制器中，行缓冲区管理策略往往既不是严格的开页策略，也不是严格的闭页策略，而是两者的动态组合。也就是说，对行缓冲区管理策略的性能和功耗影响的分析表明，行缓冲区管理策略的最优性取决于内存请求序列的请求速率和访问局部性。为了支持那些其请求速率和访问局部性可能根据工作负载在运行时的动态行为而剧烈变化的内存请求序列，为通用计算而设计的 DRAM 内存控制器可以利用访问历史和定时器的组

### 5. 13.2.4 行缓冲区管理策略的性能影响
![](https://picx.zhimg.com/v2-fc2e5fe395130cf670bb58668e4898d3_1440w.jpg) 对行缓冲区管理策略的性能进行正式对比分析，需要对系统级排队延迟，以及内存访问序列中请求到达的局部性与速率进行深入分析。然而，可以通过分析内存读访问延迟，对不同策略的性能收益与权衡进行一阶近似。假设系统名义上处于空闲状态，闭页内存系统的读延迟简单为 **

## Evidence

- Source: [原始文章](raw/tech/dram/如何深入浅出地理解DDR Controller？.md) [[../../raw/tech/dram/如何深入浅出地理解DDR Controller？.md|原始文章]]

## Key Quotes

> "内存事务与 DRAM 命令排序方案"

> "行命中（row hit）的概率降低，而 BANK 冲突（bank conflict）的概率上升"

> "x⋅tCAS+(1−x)⋅(tRP+tRCD+tCAS)"

> "为相对较低请求速率的请求序列而设计的、对功耗敏感的内存系统"

> "大多数 store 命中在缓存里改脏位，不立即下沉到内存。  
> 回写触发由替换策略决定：脏行只有在被淘汰时才写回内存，淘汰顺序受组相联/冲突/容量压力影响，不一定与程序访问顺序一致，导致写回地址在时间上更“离散”。  
>"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/如何深入浅出地理解DDR Controller？.md) [[../../raw/tech/dram/如何深入浅出地理解DDR Controller？.md|原始文章]]
