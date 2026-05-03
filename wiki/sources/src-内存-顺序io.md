---
doc_id: src-内存-顺序io
title: 内存  顺序IO
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/内存  顺序IO.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文从磁盘物理结构（盘片、磁头、磁道、扇区）出发，深入解析了磁盘IO的性能瓶颈和优化原理。磁盘读写三步骤（寻道3-15ms、旋转延迟2-4ms、数据传输）中，前两者是主要性能消耗。文章对比了随机IO和顺序IO的巨大性能差异，重点介绍了操作系统PageCache机制（预读和回写）如何提升磁盘读写效率——预读利用局部性原理提前加载连续数据，回写通过异步延迟写入减少磁盘操作。顺序IO借助PageCache可实现接近内存的读写速度，是随机写入的6000倍。最后以Kafka和RocketMQ为例，展示了消息队列如何利用磁盘顺序IO实现高性能持久化存储。

## Key Points

### 1. 磁盘物理结构与读写原理
- **组成部件**：磁盘盘片、传动手臂、读写磁头、主轴马达
- **读写三步骤**：
  1. **寻道**（Seek）：移动磁头到正确磁道，耗时3-15ms
  2. **旋转延迟**（Rotation）：盘片旋转到目标扇区，7200rpm约4.17ms
  3. **数据传输**：传输读写数据，通常可忽略
- **性能瓶颈**：主要消耗在寻道和旋转延迟上

### 2. 随机IO vs 顺序IO
| 类型 | 特点 | 性能 |
|------|------|------|
| **顺序IO** | 连续数据读写，减少寻道和旋转 | 接近内存速度 |
| **随机IO** | 分散数据读写，频繁寻道 | 效率很低 |

### 3. PageCache 机制
- **定义**：操作系统用一部分内存缓存磁盘数据，加速文件读写
- **预读（Read-ahead）**：加载数据时顺便加载后续连续页面，利用局部性原理
- **回写（Write-back）**：数据先写入PageCache，由pdflush/bdi_writeback异步同步到磁盘
- **代价**：占用实际内存空间，异步写入有数据丢失风险

### 4. 顺序IO的应用案例
- **Kafka**：利用顺序写持久化消息，官网宣称"文件系统性能比想象中快得多"
- **RocketMQ**：参考Kafka设计，同样使用顺序写进行消息持久化
- **性能数据**：操作系统优化后的顺序读写速度可达随机写入的6000倍

## Key Quotes

> "磁盘的读写性能消耗主要花在寻道和旋转延迟上。"

> "顺序IO就是利用了PageCache实现的，由于大大降低了寻道和旋转延迟时间，其速度几乎接近于内存的读写速度。"

> "随机IO由于需要不断的进行寻道和旋转，效率很低。"

> "操作系统对顺序读写做了优化，其速度可以达到随机写入的6000倍，甚至比内存的随机读写还快。"

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/内存  顺序IO.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/内存  顺序IO.md|原始文章]]

## Open Questions

- SSD环境下随机IO性能提升后，顺序IO的优势是否仍然显著
- PageCache大小调优与不同应用场景（数据库、日志、消息队列）的平衡策略

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/内存  顺序IO.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/内存  顺序IO.md|原始文章]]
