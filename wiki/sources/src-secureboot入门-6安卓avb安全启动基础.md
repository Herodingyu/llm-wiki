---
doc_id: src-secureboot入门-6安卓avb安全启动基础
title: secureboot入门 6安卓AVB安全启动基础
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/secureboot入门-6安卓AVB安全启动基础.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 5 人赞同了该文章 ![](https://picx.zhimg.com/v2-d4fad3651db02648a67ad9a47debe037_1440w.jpg)

## Key Points

### 1. 1\. Android镜像基础


### 2. 1.1 分区介绍
![](https://pic4.zhimg.com/v2-a9137a3be2bf0cc0577b8efa1a53544b_1440w.jpg) - cache.img（缓存镜像）：用于 **存储系统或用户应用产生** 的临时数据。

### 3. 1.2 启动流程
![](https://pic2.zhimg.com/v2-ca5e42b4f9a546b67cf3fe1d8850a47d_1440w.jpg) **bootloader会从boot分区开始启动。**

### 4. Stage1:
``` 硬件设备初始化。为stage2的执行及随后内核的执行准备好基本的硬件环境 为加载stage2 准备ram空间。为了获得更好的执行速度，通常吧stage2加载到ram中执行 复制stage2的代码到ram中

### 5. Stage2：
``` 初始化本阶段要使用的硬件设备 检测系统内存映射 将内核映像和根文件系统映像从flash读到ram中 为内核设置启动参数 调用内核 ``` Kernel负责 **启动各个子系统** ，例如CPU调度子系统和内存管理子系统等等。

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/secureboot入门-6安卓AVB安全启动基础.md) [[../../raw/tech/bsp/芯片底软及固件/secureboot入门-6安卓AVB安全启动基础.md|原始文章]]

## Key Quotes

> "bootloader验证vbmeta的签名"

> "了Android系统主要的目录和文件"

> "尽管ramdisk.img需要放在Linux内核镜像（boot.img）中"

> "boot.img镜像文件，放到boot分区"

> "bootloader会从boot分区开始启动。"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/secureboot入门-6安卓AVB安全启动基础.md) [[../../raw/tech/bsp/芯片底软及固件/secureboot入门-6安卓AVB安全启动基础.md|原始文章]]
