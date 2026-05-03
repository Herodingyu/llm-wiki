---
doc_id: src-uboot入门-1简介和运行
title: U-Boot
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/uboot入门-1简介和运行.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 4 人赞同了该文章 ![](https://picx.zhimg.com/v2-145c85312cddffd95c7f06296cc3ba05_1440w.jpg)

## Key Points

### 1. 1\. uboot简介


### 2. 1.1 简介
> 什么是boot？ > 在计算机领域中，"boot"被用来表示计算机系统的启动过程，即将计算机从关机状态转换为可运行操作系统的状态。 > 计算机的启动过程涉及一系列步骤，其中包括硬件初始化、加载引导程序和操作系统等。当计算机通电或重启时，它会首先执行一些基本的硬件初始化操作，例如检测和配置内存、外围设备等。然后，计算机会加载引导程序（Bootloader），这是一个特殊的软件，负责启动操作系统。

### 3. 1.2 uboot的作用
首先uboot可以说是一个 **裸机程序** ，提到裸机程序直觉就是可以 **验证功能** ，所以uboot提供了强大的 **命令行** ，支持了各种硬件相关的驱动程序，所以先跑起来uboot很重要。

### 4. 1.3 启动方式
> uboot跟ATF的关系？ > Atf是arm为了增强系统安全性引入，ATF里面的 [BL33](https://zhida.zhihu.com/search?content_id=272874767&content_type=Article&match_order=1&q=BL33&zhida_source=entity) 的一种实现就是uboot。如果抛弃安全启动，那么可以不允许ATF，只

### 5. 2\. 代码介绍
![](https://pic2.zhimg.com/v2-9e09bfb05643d017a750a2ed638810a9_1440w.jpg) 一般移植U-BOOT会修改绿色部分的代码，U-BOOT中各目录间也是有层次结构的，虽然这种分法不是绝对的，但是在移植过程中可以提供一些指导意义。

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/uboot入门-1简介和运行.md) [[../../raw/tech/bsp/芯片底软及固件/uboot入门-1简介和运行.md|原始文章]]

## Key Quotes

> "电脑用来造组成电脑的更先进的技术来替换自己"

> "没有一个时代另一个时代也不会凭空到来"

> "secondary program loader"

> "bootrom --> spl（init ddr） --> bootrom --> tpl（load and run uboot）--> uboot"

> "u-boot-defconfig"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/uboot入门-1简介和运行.md) [[../../raw/tech/bsp/芯片底软及固件/uboot入门-1简介和运行.md|原始文章]]
