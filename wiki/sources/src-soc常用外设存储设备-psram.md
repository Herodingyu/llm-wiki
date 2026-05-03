---
doc_id: src-soc常用外设存储设备-psram
title: SoC常用外设存储设备  PSRAM
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/SoC常用外设存储设备--PSRAM.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

33 人赞同了该文章 ``` 【重要提示】：本文内容为自创内容，如需转发，请注明出处。

## Key Points

### 1. PSRAM
``` 【重要提示】：本文内容为自创内容，如需转发，请注明出处。 ```

### 2. 前言
PSRAM作为常用的一种外设存储设备，所具有的优点使其广泛被应用。本文先介绍常用的存储器简单介绍各自特点，在原理章节对psram的工作原理进行详细介绍。 对于常用的存储器可以简单分类如下： 1、数据易失性存储器，如 [DRAM](https://zhida.zhihu.com/search?content_id=188590224&content_type=Article&match_order=

### 3. 原理
psram目前支持的标准有JEDEC JESD251A(Profile 2.0)、HyperRAM、 [Xccela standards](https://zhida.zhihu.com/search?content_id=188590224&content_type=Article&match_order=1&q=Xccela+standards&zhida_source=entity) ，本节

### 4. 操作
**memory array读操作：** 读操作时序参见下图： 备注： 1、 DQS在指令INST、地址锁定后被初始化为0，在第一个上升沿出指示第一个1byte有效数据，可以支持断续； 2、 读指令INST为0x00/20；

## Evidence

- Source: [原始文章](raw/tech/dram/SoC常用外设存储设备--PSRAM.md) [[../../raw/tech/dram/SoC常用外设存储设备--PSRAM.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/SoC常用外设存储设备--PSRAM.md) [[../../raw/tech/dram/SoC常用外设存储设备--PSRAM.md|原始文章]]
