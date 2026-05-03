---
doc_id: src-内存是怎么映射到物理地址空间的-内存是连续分布的吗
title: 内存是怎么映射到物理地址空间的？内存是连续分布的吗？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/内存是怎么映射到物理地址空间的？内存是连续分布的吗？.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

本文深入解析了x86系统中内存如何映射到物理地址空间，以及内存在物理上是否连续分布的问题。一个典型的物理地址空间中，只有部分区域是真正的DRAM内存，其余被MMIO（Memory-Mapped I/O）占用。内存被划分为Low DRAM（4GB以下）和High DRAM（4GB以上），而Low DRAM的最高地址称为TOLUD（Top of Low Usable DRAM）。BIOS并不会将所有内存都报告给操作系统，而是预留一部分给核显、ME（Management Engine）和SMM（System Management Mode）等功能。现代内存系统引入多通道后，为了充分发挥多通道并行优势、避免数据局部性导致的通道利用率不均，BIOS默认开启了Interleaving（交织），将连续的数据分散到多个通道上，因此内存在物理地址空间上不再连续分布。BIOS作为内存分配的主导者，掌握着完整的物理地址到内存单元的映射关系，可以从任意物理地址反推出Channel、DIMM、Rank、Bank、Row、Column等具体位置。

## Key Points

### 1. 物理地址空间布局

| 区域 | 地址范围 | 用途 |
|------|----------|------|
| Low MMIO | 0 - 640KB / 1MB-4GB | 设备寄存器、显存、BIOS等 |
| Low DRAM | 640KB-1MB / 1MB-TOLUD | 可用内存（部分被预留） |
| High DRAM | 4GB以上 | 扩展内存 |
| High MMIO | 预留区域 | PCI设备、固件等 |

- **关键概念**：TOLUD（Top of Low Usable DRAM）
- **预留区域**：核显、ME、SMM等使用部分Low DRAM

### 2. Low DRAM和High DRAM
- **Low DRAM**：4GB以下内存区域
  - TOLUD定义Low DRAM最高地址
  - BIOS预留部分给系统功能
- **High DRAM**：4GB以上内存区域
  - 通过内存重映射（Memory Remapping）访问
  - 64位系统可支持TB级内存

### 3. MMIO（Memory-Mapped I/O）
- **Low MMIO**：传统设备、BIOS、显存等
- **High MMIO**：PCIe设备、高端显卡等
- **特点**：CPU通过内存访问指令与设备通信

### 4. Interleaving（内存交织）
- **目的**：充分利用多通道带宽，避免局部性导致的不均衡
- **原理**：连续地址分散到不同Channel/DIMM
- **结果**：物理地址不再连续对应单一内存条
- **配置**：BIOS默认开启，可手动关闭（不推荐）

### 5. 物理地址到内存单元映射
BIOS可从物理地址反推：
```
Channel # ; DIMM # ; Rank # ; Bank # ; Row # ; Column #
```

| 层级 | 映射关系 | 决定因素 |
|------|----------|----------|
| Channel | 地址低位bits | Interleave配置 |
| DIMM | Channel内分配 | 插槽配置 |
| Rank | DIMM内选择 | CS信号 |
| Bank | Rank内选择 | Bank地址bits |
| Row | Bank内选择 | Row地址bits |
| Column | Row内选择 | Column地址bits |

### 6. 内存不连续的原因
1. **MMIO占用**：设备和固件占用地址空间
2. **Interleaving**：多通道数据分散
3. **预留区域**：系统功能预留
4. **重映射**：High DRAM通过重映射访问

## Key Quotes

> "其中只有灰色部分是真正的内存，其余都是MMIO。"

> "BIOS也并不是把这些都报告给操作系统，而是要在里面划分出一部分给核显、ME和SMM等功能。"

> "现代内存系统在引入多通道后，为了规避数据的局部性对多通道性能的影响，BIOS基本缺省全部开启了Interleaving。"

> "过去美好的DIMM 0和DIMM 1挨个连续分配的日子一去不复返了。"

> "BIOS实际上一手导演的内存的分配，它当然可以从任何物理地址反推回内存的单元地址。"

## Evidence

- Source: [原始文章](raw/tech/dram/内存是怎么映射到物理地址空间的？内存是连续分布的吗？.md) [[../../raw/tech/dram/内存是怎么映射到物理地址空间的？内存是连续分布的吗？.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/内存是怎么映射到物理地址空间的？内存是连续分布的吗？.md) [[../../raw/tech/dram/内存是怎么映射到物理地址空间的？内存是连续分布的吗？.md|原始文章]]
