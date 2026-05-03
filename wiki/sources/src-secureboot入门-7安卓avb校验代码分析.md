---
doc_id: src-secureboot入门-7安卓avb校验代码分析
title: bin2header工具我在AVB系列博客中"AVB中将公钥转换成字符数组头文件的实现"有介绍
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/secureboot入门-7安卓AVB校验代码分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 4 人赞同了该文章 ![](https://pic1.zhimg.com/v2-014ab654d106d72dadd03b8c985371b2_1440w.jpg)

## Key Points

### 1. 1\. 启动流程基础


### 2. 1.1 uboot启动状态机
![](https://pica.zhimg.com/v2-44c1fef1b1c17f4d284c64b080740d20_1440w.jpg) - 设备应搜索所有 **A/B插槽** ，直到找到有效的操作系统进行引导。在 `LOCKED` 状态下被拒绝的插槽可能 `在UNLOCKED` 状态下不被拒绝（例如，当 `UNLOCKED` 可以使用任何密钥并且允许回滚索引失败时），因此用于选择插槽的

### 3. 1.2 avbtool和libavb
`avbtool` 主要用来生成 `vbmeta.img` ，它是验证启动的顶级对象。这个映像将被烧录到 `vbmeta` 分区（如果使用A/B分区，则为 `vbmeta_a` 或 `vbmeta_b` ）而且被设计的尽可能的小（用于带外更新 *out-of-band update* ）。 `vbmeta` 映像使用密钥签名，映像中包含用于验证 `boot.img` ， `system.img`

### 4. 2\. uboot中avb代码分析


### 5. 2.1 uboot中AVB开关
首先AVB的起点是 **在uboot** 里面，直接看代码里面的帮助文件：doc/android/avb2.rst ``` The following options must be enabled::

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/secureboot入门-7安卓AVB校验代码分析.md) [[../../raw/tech/bsp/芯片底软及固件/secureboot入门-7安卓AVB校验代码分析.md|原始文章]]

## Key Quotes

> "android AVB2.0学习总结"

> "可移植性(Portability)："

> "avb\_slot\_verify"

> "load\_and\_verify\_vbmeta"

> "read\_from\_partition"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/secureboot入门-7安卓AVB校验代码分析.md) [[../../raw/tech/bsp/芯片底软及固件/secureboot入门-7安卓AVB校验代码分析.md|原始文章]]
