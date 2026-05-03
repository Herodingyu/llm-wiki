---
doc_id: src-uboot-3链接脚本和第一阶段启动
title: uboot 3链接脚本和第一阶段启动
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/uboot-3链接脚本和第一阶段启动.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 4 人赞同了该文章 ![](https://pic2.zhimg.com/v2-a9613115e9b981c75503739563f06649_1440w.jpg)

## Key Points

### 1. 1\. 启动的两个过程简介
![](https://picx.zhimg.com/v2-6439845ae930ef7fabba423f894b9beb_1440w.jpg) UBoot其启动过程主要可以分为两个部分，Stage1和Stage2 。

### 2. 2\. u-boot的链接脚本
![](https://pic1.zhimg.com/v2-0e73d8f76e33bc587ab24bed89059f16_1440w.jpg) > 启动的入口怎么找？ > 这个肯定要从链接脚本里面找 **ENTRY(XXX)** ，在 [armv8](https://zhida.zhihu.com/search?content_id=272874928&content_type=Article

### 3. 2.1 u-boot.lds
``` /* SPDX-License-Identifier: GPL-2.0+ */ /* * (C) Copyright 2013 * David Feng <fenghua@phytium.com.cn>

### 4. 2.2 u-boot-spl.lds
此链接脚本是标准的 **spl链接脚本** ，还包含了u\_boot\_list段，如果对应自己board不需要命令行或者模块化驱动设备，只作为一个加载器则可以自定义更简略的链接脚本。 ``` MEMORY { .sram : ORIGIN = IMAGE_TEXT_BASE, ---------------------------------------- (1)

### 5. 3\. 第一阶段启动
![](https://picx.zhimg.com/v2-6439845ae930ef7fabba423f894b9beb_1440w.jpg)

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/uboot-3链接脚本和第一阶段启动.md) [[../../raw/tech/bsp/芯片底软及固件/uboot-3链接脚本和第一阶段启动.md|原始文章]]

## Key Quotes

> "save\_boot\_params"

> "system counter的频率"

> "gd是uboot中的一个global\_data类型全局变量"

> "board\_init\_f\_alloc\_reserve"

> "board\_init\_f\_init\_reserve"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/uboot-3链接脚本和第一阶段启动.md) [[../../raw/tech/bsp/芯片底软及固件/uboot-3链接脚本和第一阶段启动.md|原始文章]]
