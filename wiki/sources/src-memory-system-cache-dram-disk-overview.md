---
doc_id: src-memory-system-cache-dram-disk-overview
title: "内存系统：cache、DRAM和disk---概述"
page_type: source_note
raw_paths:
  - "../../raw/tech/dram/内存系统：cache、DRAM和disk---概述.md"
source_url: "https://mp.weixin.qq.com/s/KHG4hbMQRp2v4pv_UZ5x3A"
author: "[[Lzing]]"
date_created: 2026-05-04
date_modified: 2026-05-04
description: "当今计算系统中，Memory扮演着非常重要的角色，而在当代存储系统中，内存层次无疑是其核心"
---

# 内存系统：cache、DRAM和disk---概述

- **原始文章**: [原始文章](../../raw/tech/dram/内存系统：cache、DRAM和disk---概述.md)
- **作者**: [[Lzing]]
- **来源**: https://mp.weixin.qq.com/s/KHG4hbMQRp2v4pv_UZ5x3A

---

## 摘要

当今计算系统中，Memory扮演着非常重要的角色，而在当代存储系统中，内存层次无疑是其核心。一个良好实现的层次可以同时实现最快组件的性能、最便宜组件的成本以及最高效组件的能效。本文介绍了内存层次的基本概念，包括Cache、DRAM和Disk三种主要存储技术，以及引用的局部性原理。

## 关键要点

1. **内存层次核心目标**: 同时实现最快组件的性能、最便宜组件的成本以及最高效组件的能效。

2. **局部性原理**: 
   - **时间局部性**: 如果你使用了某个数据，那么会倾向于再次使用
   - **空间局部性**: 如果你使用了某个数据，那么会倾向于使用其相邻数据

3. **三级存储结构**:
   - **Cache (SRAM)**: 低延时、高带宽、低功耗
   - **DRAM**: 相对大、相对快、相对便宜的随机访问
   - **Disk**: 超低成本提供持久性存储

4. **持久性存储需求**: 包括OS文件（boot程序、OS可执行文件、库和应用程序）、嵌入式系统镜像、配置信息等。

5. **DRAM作为主流操作存储的原因**:
   - 比非易失性技术速度更快
   - 支持无限次数写入
   - 工艺和逻辑器件相似，可使用类似材料和硅基工艺

6. **Cache实现方式**:
   - 硬件实现metadata（tag），自动查找hit/miss
   - 软件管理，显式指定读写位置

7. **系统性能瓶颈**: 当今系统中的真实性能损失不在于Cache/DRAM/Disk的某一个单独子系统，更多的是体现在系统间交互上。

## 关键引用

- "一个良好实现的层次可以同时实现最快组件的性能、最便宜组件的成本以及最高效组件的能效。"
- "计算机程序倾向于表现出一种可观察到的有规律的行为，适当利用该特性，就可以使用小内存来替换大内存。"
- "当今系统中的真实性能损失不在于Cache/DRAM/Disk的某一个单独子系统，更多的是体现在系统间交互上。"
- "DRAM是一个主流选择，因为DRAM要比各种非易失性技术速度更快，支持无限次数的写入，且工艺和逻辑器件非常相似。"

## 技术细节

### 存储技术对比

| 特性 | Cache (SRAM) | DRAM | Disk |
|------|-------------|------|------|
| 速度 | 最快 | 中等 | 最慢 |
| 成本 | 最高 | 中等 | 最低 |
| 容量 | 最小 | 中等 | 最大 |
| 功耗 | 低 | 中等 | 较高 |
| 易失性 | 易失 | 易失 | 非易失 |

### 非易失性存储技术
- **Disk**: 传统机械硬盘，面向块存储（512B）
- **Flash**: 支持word粒度读，block级别写
- **EEPROM**: 电可擦除可编程ROM
- **MRAM**: 磁性RAM（开发中）
- **FeRAM**: 铁电RAM（开发中）
- **PCRAM**: 相变RAM（开发中）

### Cache类型
- **硬件管理Cache**: 使用tag自动查找，对软件透明
- **Scratch-pad RAM**: 软件管理，显式控制，用于DSP和微处理器
- **Register file**: 按bit级索引，软件完全控制，最小功耗

## 相关页面

- [[../concepts/memory-hierarchy.md|内存层次结构]]
- [[../concepts/cache.md|Cache]]
- [[../concepts/dram.md|DRAM]]
- [[../concepts/disk.md|Disk]]
- [[../concepts/locality.md|局部性原理]]
- [[../concepts/sram.md|SRAM]]
