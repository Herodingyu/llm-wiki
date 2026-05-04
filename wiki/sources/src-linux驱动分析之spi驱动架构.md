---
doc_id: src-linux驱动分析之spi驱动架构
title: Linux驱动分析之SPI驱动架构
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/Linux驱动分析之SPI驱动架构.md
domain: tech/peripheral
created: 2026-05-04
updated: 2026-05-04
tags: [peripheral]
---

## Summary

[收录于 · Linux驱动开发](https://www.zhihu.com/column/c_1134495265657528320) 4 人赞同了该文章 **主要由三部分组成：**

## Key Points

### 1. SPI体系结构
**主要由三部分组成：** **(1) SPI核心** **(2) SPI控制器驱动** **(3) SPI设备驱动** **基本和I2C的架构差不多**

### 2. 重要结构体
**内核版本：3.7.6** - **spi\_master** ```c //SPI控制器 struct spi_master { struct device  dev; struct list_head list; //控制器链表

### 3. API函数
```c //分配一个spi_master struct spi_master *spi_alloc_master(struct device *dev, unsigned size) //注册和注销spi_master

## Evidence

- Source: [原始文章](raw/tech/peripheral/Linux驱动分析之SPI驱动架构.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/Linux驱动分析之SPI驱动架构.md)
