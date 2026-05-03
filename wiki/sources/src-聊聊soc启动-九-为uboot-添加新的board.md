---
doc_id: src-聊聊soc启动-九-为uboot-添加新的board
title: add boot stage info to fdt
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（九） 为uboot 添加新的board.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944) 12 人赞同了该文章 本文基于以下软硬件假定：

## Key Points

### 1. 1　Uboot代码层次
uboot需要支持众多的硬件，并且具有良好的可扩展性、可移植性和可维护性，因此必须要有一个设计良好的代码架构。代码架构的设计总是与软硬件架构密不可分的，在硬件层面嵌入式系统的核心一般包括以下层次： （1）目标板：它包含了系统运行所需的所有组件，如 [SOC芯片](https://zhida.zhihu.com/search?content_id=203925272&content_type=Art

### 2. ２　如何添加board


### 3. ２.1　添加board的基本步骤
当我们开始一个全新的项目时，总是希望能先让系统能运行起来，然后再在此基础上为其添加更多的feature，这个只包含能让系统运行所需模块的系统，叫做最小系统。cpu能正常运行包含以下几个条件： （1）具有合适的电源和时钟

### 4. ２.2　test board添加示例
接下来我们将自定义一款目标板test，该board以armv8架构的 [qemu虚拟机](https://zhida.zhihu.com/search?content_id=203925272&content_type=Article&match_order=1&q=qemu%E8%99%9A%E6%8B%9F%E6%9C%BA&zhida_source=entity) virt machine作

### 5. ２.2.1　添加target配置选项
（1）在arch/arm/Kconfig的board select菜单下新增如下的TARGET\_TESTBOARD配置选项： ``` config TARGET_TESTBOARD bool "Qemu test board"

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（九） 为uboot 添加新的board.md) [[../../raw/tech/bsp/聊聊SOC启动（九） 为uboot 添加新的board.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（九） 为uboot 添加新的board.md) [[../../raw/tech/bsp/聊聊SOC启动（九） 为uboot 添加新的board.md|原始文章]]
