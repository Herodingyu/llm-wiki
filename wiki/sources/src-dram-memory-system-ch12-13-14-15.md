---
doc_id: src-dram-memory-system-ch12-13-14-15
title: "内存系统---DRAM（part 2：12/13/14/15章）"
page_type: source_note
raw_paths:
  - "../../raw/tech/dram/内存系统---DRAM（part 2：12131415章）.md"
source_url: "https://mp.weixin.qq.com/s/Fv-kNZbFc4k8t01NmIbbRA"
author: "[[Lzing]]"
date_created: 2026-05-04
date_modified: 2026-05-04
description: "本部分先后介绍了近现代DRAM演进、DRAM控制器典型设计及策略、FB-DIMM以及内存系统的设计分析方法学"
---

# 内存系统---DRAM（part 2：12/13/14/15章）

- **原始文章**: [原始文章](../../raw/tech/dram/内存系统---DRAM（part 2：12131415章）.md)
- **作者**: [[Lzing]]
- **来源**: https://mp.weixin.qq.com/s/Fv-kNZbFc4k8t01NmIbbRA

---

## 摘要

本部分先后介绍了近现代DRAM演进、DRAM控制器典型设计及策略、FB-DIMM以及内存系统的设计分析方法学。涵盖了从早期异步DRAM到当代DDR5的完整演进路径，以及DRAM控制器的设计考量。

## 关键要点

1. **DRAM家族演化**: 沿着低成本/高带宽/低功耗三个方向不断发展。早期每bit成本是主要推动因素。

2. **历史DRAM设备**: 
   - Intel 1103 (1971): 第一个商业成功的DRAM，使用3T1C结构
   - 异步DRAM: 需要两个完整的row cycle来移出数据
   - FPM: 允许在两次CAS间保持打开状态，省掉RAS过程
   - EDO: 增加OE信号，将output buffer控制从CAS转交给OE
   - BEDO: 在EDO基础上增加burst概念

3. **当代DRAM设备**:
   - SDRAM: 同步接口、多bank、可编程
   - DDR: 数据总线速率是地址/命令总线两倍，使用N位预取
   - DDR2: 预取提高到4N
   - DDR3/DDR4/DDR5: 持续提高频率和带宽

4. **DRAM控制器设计**: 典型设计包括地址映射、调度策略、刷新管理、功耗管理等。

5. **FB-DIMM**: 使用串行接口（AMB芯片）连接内存模块，解决传统并行接口的信号完整性问题。

6. **设计分析方法学**: 包括性能建模、功耗分析、成本评估等方法。

## 关键引用

- "典型的DRAM家族和不同演化路径，随着不断发展，它们开始沿着低成本/高带宽/低功耗方向发展。"
- "SDRAM相比之间设备有三个重要的差异：同步接口、多bank、可编程。"
- "DDR的主要特点是允许以地址和命令总线两倍速率来运行数据总线。"
- "FB-DIMM使用串行接口（AMB芯片）连接内存模块，解决传统并行接口的信号完整性问题。"

## 技术细节

### DRAM演进时间线
- 1971: Intel 1103 (3T1C)
- 1980s: 异步DRAM
- 1990s: FPM/EDO/BEDO
- 1993: SDRAM (同步)
- 2000: DDR (双边沿)
- 2003: DDR2 (4N预取)
- 2007: DDR3 (8N预取)
- 2014: DDR4 (16N预取)
- 2020: DDR5 (32N预取)

### 关键技术差异
- **异步 vs 同步**: 异步需要完整row cycle，同步使用时钟驱动
- **预取(Prefetch)**: DDR使用2N，DDR2使用4N，DDR3使用8N，DDR4使用16N，DDR5使用32N
- **Bank数量**: SDRAM 4 bank，DDR2 4/8 bank，DDR4 16 bank，DDR5 32 bank

### FB-DIMM架构
- AMB (Advanced Memory Buffer): 串行-并行转换芯片
- 解决并行接口的引脚数量和信号完整性限制
- 增加延时但提高可扩展性

## 相关页面

- [[../concepts/dram.md|DRAM]]
- [[../concepts/ddr.md|DDR]]
- [[../concepts/memory-controller.md|Memory Controller]]
- [[../concepts/memory-hierarchy.md|内存层次结构]]
- [[../concepts/fb-dimm.md|FB-DIMM]]
