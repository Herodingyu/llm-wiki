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

本文是"内存系统：DRAM, DDR与Memory Controller"系列的第二篇（134赞同），深入探讨了DRAM组织结构、访问延迟机制、页面管理策略和地址映射等核心主题。文章首先澄清了DRAM的层级命名：arrays实际应称为array，而array应称为subarray，subarray之下还有MAT（Memory Array Tile）组成。然后详细分析了三种DRAM访问延迟场景：row buffer hit（约20ns）、empty row buffer（约40ns）和row buffer conflict（需要预充电+激活+读取）。文章对比了Open Page Policy和Close Page Policy两种页面管理策略的优劣：Open Page保留row buffer内容以利用局部性，Close Page立即预充电以减少冲突。在地址映射策略方面，文章解释了CPU发出的32/48位地址如何通过多种映射方案（如row::rank::bank::channel::column::blkoffset）转换为DRAM内部地址，并强调了不同系统采用不同映射策略，没有统一标准。

## Key Points

### 1. DRAM组织结构精确定义

| 层级 | 正确定义 | 说明 |
|------|----------|------|
| MAT | 最小存储阵列单元 | 包含行列解码器和sense amplifier |
| Subarray | 由多个MAT组成 | 传统误称为"array" |
| Array | 由多个subarray组成 | 传统误称为"arrays" |
| Bank | 包含独立row buffer的阵列组 | 可独立操作 |

### 2. DRAM访问延迟三种场景

| 场景 | 条件 | 延迟 | 原因 |
|------|------|------|------|
| Row Buffer Hit | 目标数据在当前row buffer中 | ~20ns | 只需从row buffer读取 |
| Empty Row Buffer | Row buffer为空 | ~40ns | 需要激活行+读取 |
| Row Buffer Conflict | 目标数据在不同row | ~60ns+ | 预充电+激活+读取 |

### 3. 页面管理策略对比

| 策略 | 操作 | 优势 | 劣势 | 适用场景 |
|------|------|------|------|----------|
| Open Page | 访问后保留row buffer | 利用局部性，hit时延迟低 | Conflict时延迟高 | 顺序访问、局部性好 |
| Close Page | 访问后立即预充电 | 减少conflict | 无法利用局部性 | 随机访问、局部性差 |

- **自适应策略**：根据访问模式动态切换

### 4. 地址映射策略
- **CPU地址**：32位或48位虚拟/物理地址
- **访问粒度**：按cache line（通常64B）或双cache line
- **映射目标**：分解为channel、DIMM、rank、bank、row、column

| 映射方案 | 格式 | 特点 |
|----------|------|------|
| 方案1 | row::rank::bank::channel::column::blkoffset | 行局部性好 |
| 方案2 | row::column::rank::bank::channel::blkoffset | 分散访问 |
| 其他 | 多种变体 | 无统一标准 |

- **设计考量**：并行度、局部性、冲突避免

### 5. DDR接口规范要点
- 同时涉及DRAM存储本质和内存条物理设计
- 规范定义了电气特性、时序参数、命令集
- 与DRAM内部组织架构密切相关

## Key Quotes

> "DRAM arrays实际上的名字应该叫array, 而DRAM array应该叫subarray，而且subarray之下还由MAT组成。"

> "row buffer hit就是说数据已经在row buffer中，这时延时主要来自于从row buffer到把数据放在数据总线上的时延，这个过程需要大约20ns的时间。"

> "Open Page Policy在完成一次访存后保留row buffer的内容，如果下一个访存命令恰好也在同一个row上，就会row buffer hit，节省访问时间。"

> "实际计算机中怎么映射呢？实际上没有标准的，有多种方法，比如说：row::rank::bank::channel::column::blkoffset 或 row::column::rank::bank::channel::blkoffset，都是比较常见的用法。"

## Evidence

- Source: [原始文章](raw/tech/dram/内存系统：DRAM, DDR 与Memory Controller-之二.md) [[../../raw/tech/dram/内存系统：DRAM, DDR 与Memory Controller-之二.md|原始文章]]

## Key Quotes

> "## DRAM的访问延时

一条访存指令发到内存控制器，它的访存延时是存在不同的可能性的"

> "row buffer hit 就是说数据已经在row buffer中，这时延时主要来自于从row buffer到把数据放在数据总线上的时延，这个过程需要大约20ns的时间。（可能是比较旧的数据了，欢迎评论区发出挑战）
2"

> "empty row buffer ，即row buffer是空的，访存延时除了从row buffer到数据总线时间，还包括从电容到sense amplifier再到row buffer的时序，需要的延时大约40ns"

> "## 地址映射策略

CPU给的一个访存指令中的地址可能是32位数，或是48位数"

> "实际计算机中怎么映射呢？实际上没有标准的，有多种方法，比如说：  
row::rank::bank::channel::column::blkoffset  
row::column::rank::bank::channel::blkoffset  
都是比较常见的用法"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/内存系统：DRAM, DDR 与Memory Controller-之二.md) [[../../raw/tech/dram/内存系统：DRAM, DDR 与Memory Controller-之二.md|原始文章]]
