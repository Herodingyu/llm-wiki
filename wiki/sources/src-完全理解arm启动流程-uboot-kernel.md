---
doc_id: src-完全理解arm启动流程-uboot-kernel
title: ifdef CONFIG_AUTOBOOT_KEYED
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/完全理解ARM启动流程：Uboot-Kernel.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 417 人赞同了该文章 > 内容共计5W+字数，但是我还是很多地方说的不够尽兴。那么有机会的话下次聊！

## Key Points

### 1. 前言
[bootloader](https://zhida.zhihu.com/search?content_id=241047213&content_type=Article&match_order=1&q=bootloader&zhida_source=entity) 是系统上电后最初加载运行的代码。它提供了处理器上电复位后最开始需要执行的初始化代码。

### 2. Bootloader介绍
**Bootloader的定义** ：Bootloader是在操作系统运行之前执行的一小段程序，通过这一小段程序，我们可以 **初始化硬件设备** 、 **建立内存空间的映射表** ，从而建立适当的系统软硬件环境，为最终调用操作系统内核做好准备。

### 3. Bootloader的启动方式
Bootloader的启动方式主要有网络启动方式、磁盘启动方式和Flash启动方式，当然还可以有其他启动方式，例如：MMC等。

### 4. 1、网络启动方式
![动图封面](https://picx.zhimg.com/v2-092c0e4c44c3478c2d48910ef3e61793_b.jpg) 图1 Bootloader网络启动方式示意图 如图1所示，里面主机和目标板，他们中间通过网络来连接，首先目标板的DHCP/BIOS通过BOOTP服务来为Bootloader分配IP地址，配置网络参数，这样才能支持网络传输功能。

### 5. 2、磁盘启动方式
这种方式主要是用在台式机和服务器上的，这些计算机都使用BIOS引导，并且使用磁盘作为存储介质，这里面两个重要的用来启动linux的有LILO和GRUB，这里就不再具体说明了。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/完全理解ARM启动流程：Uboot-Kernel.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/完全理解ARM启动流程：Uboot-Kernel.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/完全理解ARM启动流程：Uboot-Kernel.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/完全理解ARM启动流程：Uboot-Kernel.md|原始文章]]
