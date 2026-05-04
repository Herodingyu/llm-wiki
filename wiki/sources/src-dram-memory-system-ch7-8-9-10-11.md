---
doc_id: src-dram-memory-system-ch7-8-9-10-11
title: "内存系统---DRAM（7/8/9/10/11章）"
page_type: source_note
raw_paths:
  - "../../raw/tech/dram/内存系统---DRAM（7891011章）.md"
source_url: "https://mp.weixin.qq.com/s/BBcoPbAbWSSn9Vcz9OT7Hg"
author: "[[Lzing]]"
date_created: 2026-05-04
date_modified: 2026-05-04
description: "系统的介绍了DRAM的基础知识，对于理解计算机体系结构中内存系统/层次的设计非常有用"
---

# 内存系统---DRAM（7/8/9/10/11章）

- **原始文章**: [原始文章](../../raw/tech/dram/内存系统---DRAM（7891011章）.md)
- **作者**: [[Lzing]]
- **来源**: https://mp.weixin.qq.com/s/BBcoPbAbWSSn9Vcz9OT7Hg

---

## 摘要

本文系统的介绍了DRAM的基础知识，涵盖DRAM概述、内部结构与操作、架构演进（FPM/EDO/BEDO/SDRAM/DDR）、接口修改（RDRAM/DDR）以及针对延时的结构修改（VCDRAM/ESDRAM）。内容对于理解计算机体系结构中内存系统/层次的设计非常有用。

## 关键要点

1. **DRAM基础结构**: 使用1T1C（1晶体管+1电容）存储1-bit，电容必须定期刷新。以x8 DRAM为例，有8个内存阵列同时工作，列位宽为8。

2. **DRAM组织层次**: 从高到低为DIMM → Rank → Bank → Array。Rank和Bank级提供的并发性可以提供高带宽服务。

3. **DRAM读写流程**: MC充当联络员，通过RAS（row-address strobe）激活page，通过CAS（column-address strobe）访问具体bit。读取时需要先将差分放大器precharge到中间值。

4. **架构演进路径**: 异步DRAM → FPM（保持打开状态）→ EDO（锁存器输出）→ BEDO（burst概念）→ SDRAM（时钟驱动）→ DDR（双边沿传输）。

5. **DDR原理**: 通过在时钟上升沿和下降沿同时传输数据，使带宽翻倍。使用N位预取来表示内部数据位宽和接口总线位宽的比例。

6. **RDRAM特点**: 总线窄，不使用专用的地址/控制/数据接口，而是共用一组bus。先传输地址/控制包，然后传输数据包。

7. **VCDRAM**: 增加了SRAM Cache来存放更大的数据，且该SRAM可以显式被MC控制，针对延时优化。

8. **ESDRAM**: 在column mux之前增加了latch，大小与DRAM page相同，可以更好的重叠activity。

## 关键引用

- "DRAM使用一个晶体管+电容的组合来存储1-bit，其电容必须定期刷新。"
- "Rank和Bank级提供的并发性可以提供高带宽服务。"
- "DDR通过同时在上升沿/下降沿传输数据来使得带宽翻倍。"
- "RDRAM与传统DRAM结构不同，其总线要窄的多，并且不使用专用的地址/控制/数据控制接口，而是共用一组bus。"

## 技术细节

### DRAM组织结构
- DIMM（双列直插内存模块）: 系统级独立单元
- Rank: DIMM上的独立Bank集合
- Bank: 独立的激活/预充电/读数据单元
- Array: 具体的存储阵列

### 信号接口
- JEDEC风格: data, address, control, chip-select分离
- Chip select用于控制Rank级的并行
- 地址位宽限制导致有时需要使用数据bus传输地址

### 时序参数
- RAS: row-address strobe，激活page
- CAS: column-address strobe，访问具体bit
- Precharge: 将差分放大器充到中间值
- 地址译码: row/col地址分别传输

## 相关页面

- [[../concepts/dram.md|DRAM]]
- [[../concepts/ddr.md|DDR]]
- [[../concepts/memory-controller.md|Memory Controller]]
- [[../concepts/memory-hierarchy.md|内存层次结构]]
