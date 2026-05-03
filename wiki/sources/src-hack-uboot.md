---
doc_id: src-hack-uboot
title: printenv
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Hack Uboot.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 11 人赞同了该文章 **在硬件评估过程中，经常会遇到采用 [U-Boot](https://zhida.zhihu.com/search?content_id=249077745&content_type=Article&match_order=1&q=U-Boot&zhida_source=entity) 的设备。本文旨在阐述U-Boot是什么，从攻击角度来看它为何如此吸引人，以及这种流行的引导程序所关联的攻击面。**

## Key Points

### 1. U-Boot 特性
U-Boot，即通用引导加载程序（Universal Boot Loader），是一种用于基于PowerPC、ARM、MIPS等处理器的嵌入式板卡的引导程序，它可以被安装在启动ROM中，用于初始化和测试硬件，或下载和运行应用程序代码(1)。所有支持的设备都可以作为ROM使用：SD卡、SATA硬盘、NOR闪存、NAND闪存等。U-Boot提供了许多功能，如网络支持、USB协议栈支持、加载RAM磁盘等

### 2. 使用暴露的U-Boot Shell
暴露的U-Boot Shell允许用户读取和写入内存中的数据。实现这一功能的方法多种多样，复杂程度不一。通过这些方法，用户可以转储闪存内存，对其进行修改，然后重新上传，或者仅仅加载另一个固件。这些操作可以通过 [UART](https://zhida.zhihu.com/search?content_id=249077745&content_type=Article&match_order=1&q

### 3. UART与未受保护的Shell
下一步是将每个引脚连接到接收器： ![](https://pic2.zhimg.com/v2-4e030634f947abd5e7faaeb753a9f8e3_1440w.jpg) 最后，连接所有引脚。在本文中，我们将使用 [Hydrabus](https://zhida.zhihu.com/search?content_id=249077745&content_type=Article&matc

### 4. Booting kernel from Legacy Image at 80600000 ...
Image Name:   Linux-3.10.14__isvp_turkey_1.0__ Image Type:   MIPS Linux Kernel Image (lzma compressed)

### 5. 使用U-Boot提取固件
在进入Shell之前，重要的是要理解为什么我们想要从U-Boot提取或写入数据。事实上，在某些情况下，闪存并不容易被访问： - 引脚不可访问。 - 引脚可访问，但必须进行拆焊（闪存为SoC供电，并且没有可访问的复位引脚）。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Hack Uboot.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Hack Uboot.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Hack Uboot.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Hack Uboot.md|原始文章]]
