---
doc_id: src-devicetree和启动参数解析流程
title: devicetree和启动参数解析流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/devicetree和启动参数解析流程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 杂七杂八](https://www.zhihu.com/column/c_1532861349739077632) 11 人赞同了该文章 本文基于以下软硬件假定：

## Key Points

### 1. 1　设备树解析概述
AARCH64架构下内核可以通过设备树或acpi方式获取设备信息，其中acpi主要用于服务器领域，而设备树用于嵌入式领域。在设备树方式中， [bootloader](https://zhida.zhihu.com/search?content_id=204389582&content_type=Article&match_order=1&q=bootloader&zhida_source=enti

### 2. ２　early device tree 解析流程
在AARCH64架构下，early device tree解析流程如下图： ![](https://pic1.zhimg.com/v2-35f1ca2de1aac1bd63119769434f7e3c_1440w.jpg)

### 3. ３　device node节点创建流程
内核通过 [unflatten\_device\_tree](https://zhida.zhihu.com/search?content_id=204389582&content_type=Article&match_order=1&q=unflatten_device_tree&zhida_source=entity) 接口解析device tree中的node和property信息，并为解析

### 4. ４　bootargs参数解析


### 5. ４.1　bootargs参数配置
bootargs用于向内核传递启动参数，内核启动时解析这些参数并从特定的section中查找并执行参数处理函数，以实现对相关功能的配置。AARCH64架构的bootargs配置方式较灵活，主要有以下几种：

## Evidence

- Source: [原始文章](raw/tech/bsp/devicetree和启动参数解析流程.md) [[../../raw/tech/bsp/devicetree和启动参数解析流程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/devicetree和启动参数解析流程.md) [[../../raw/tech/bsp/devicetree和启动参数解析流程.md|原始文章]]
