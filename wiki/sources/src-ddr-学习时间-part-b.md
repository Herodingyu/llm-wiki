---
doc_id: src-ddr-学习时间-part-b
title: DDR 学习时间 (Part B
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/DDR 学习时间 (Part B.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

本文详细解析了DDR4内存中的Gear-down模式技术原理。在DDR4标准中，命令/地址（CA）总线默认工作在1/2数据速率（1N模式），但在高频下（如DDR4-3200及以上），1600MHz的CA总线频率给控制器和DRAM带来了时序挑战。Gear-down模式通过将CA总线频率进一步降低到1/4数据速率（2N模式），使DRAM和控制器在更低的频率下运行命令控制逻辑，从而改善时序裕量、降低功耗并提高系统稳定性。文章深入讲解了Gear-down模式的工作原理、进入和退出流程，以及1N模式与2N模式的区别。该技术是DDR4高速运行时的重要优化手段，对于理解DDR4内存控制器设计和系统调优具有重要参考价值。

## Key Points

### 1. DDR4命令控制总线基础
- CA总线默认在DRAM时钟（CK）上升沿发送/接收命令
- 相对于双边沿采样的数据总线（DQ），CA总线速率为数据速率的1/2
- 例如DDR4-3200中，CA总线工作频率 = 3200/2 = 1600MHz

### 2. Gear-down模式原理

| 模式 | CA总线频率 | 适用场景 | 特点 |
|------|------------|----------|------|
| 1N模式 | 1/2数据速率 | DDR4-2933及以下 | 标准模式，时序裕量充足 |
| 2N模式 (Gear-down) | 1/4数据速率 | DDR4-3200及以上 | 降低CA频率，改善时序 |

- Gear-down模式下，DRAM和控制器CA逻辑运行在更低频率
- 一个命令在两个时钟周期内传输完成
- 改善高速下的时序裕量和信号完整性

### 3. 进入Gear-down模式
- **时机**：只能在初始化时或退出Self-refresh时进入
- **初始化流程**：
  1. 上电后默认工作在1N模式（1/2 data rate）
  2. 通过MR3寄存器设置Gear-down使能
  3. 重新锁定DLL并校准
  4. 进入2N模式运行

### 4. 退出Gear-down模式
- **正确方法**：先进入Self-refresh模式
- 在Self-refresh状态下修改MR3寄存器
- 退出Self-refresh后在新模式下运行
- 不能在工作状态下直接切换

### 5. 性能影响
- 命令延迟略有增加（2个时钟周期 vs 1个）
- 但时序裕量显著改善，系统更稳定
- 在超高速（DDR4-3600+）下是必要的配置
- 实际内存带宽影响微乎其微

### 6. 与Gear模式的关系

| 术语 | 含义 | 适用对象 |
|------|------|----------|
| Gear-down模式 | DDR4 CA总线降频 | DDR4 DRAM |
| Gear 1 | 内存控制器与内存同频 | Intel平台内存分频 |
| Gear 2 | 控制器频率为内存频率的一半 | Intel平台内存分频 |

## Evidence

- Source: [原始文章](raw/tech/dram/DDR 学习时间 (Part B.md) [[../../raw/tech/dram/DDR 学习时间 (Part B.md|原始文章]]

## Key Quotes

> "内存延迟Latency数值由85ns大幅度降低到68.8ns"

> "内存Read读取性能由37790MB/S提升到41528MB/S。"

> "Gear 1 means processor memory controller and memory speed are equal."

> "Gear 2 means pocessor memory controller operates at half the memory speed (such as CPU memory controller is at 1600MHz while memory speed is at 3200MHz when operating as Gear 2)."

> "For DDR4-2933 (or lower speed):"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/DDR 学习时间 (Part B.md) [[../../raw/tech/dram/DDR 学习时间 (Part B.md|原始文章]]
