---
doc_id: src-arm-scp入门-简介和代码下载编译
title: ARM SCP入门 简介和代码下载编译
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/ARM SCP入门-简介和代码下载编译.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 3 人赞同了该文章 ![](https://pic2.zhimg.com/v2-0b5dcc27e122643c87165f1ee3b6eb21_1440w.jpg)

## Key Points

### 1. 1\. ARM PCSA规范
![](https://pic3.zhimg.com/v2-aed692604c0b8fe200812f598ea53b9a_1440w.jpg) 上图所示是一个典型的SoC，里面除了CPU还有各种其他处理器。之前介绍的 [ARM ATF入门-安全固件软件介绍和代码运行](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__

### 2. 2\. SCP简介
![](https://picx.zhimg.com/v2-7655cdd123f8c897ae7b3db5158b8397_1440w.jpg) PCSA 定义了 **系统控制处理器** (SCP) 的概念，一般是一个硬件模块，例如 [cortex-M4](https://zhida.zhihu.com/search?content_id=272741614&content_type=Artic

### 3. 3\. 电源管理软件协议栈
![](https://pic4.zhimg.com/v2-69290ceda3a06993855e7267b4347241_1440w.jpg) **用户层：** 首先用户发起的一些操作，通过用户空间的各service处理，会经过内核提供的sysfs，操作cpu hotplug、device

### 4. 4\. 电压域和电源域划分
为了更好地对电进行控制，ARM划分了两个电相关的概念： **电源域** （power domain）和 **电压域** （voltage domain）。 **电压域** 指使用同一个电压源的模块合集，如果几个模块使用相同的电压源，就认为这几个模块属于同一个电压域。 **电源域** 指的是在同一个电压域内，共享相同电源开关逻辑的模块合集。即在同一个电源域的模块被相同的电源开关逻辑控制，同时上、下电

### 5. 5\. SCP代码下载编译和功能介绍
![](https://pic2.zhimg.com/v2-5b01bfd115284aed6fcadba807fcd507_1440w.jpg) 官方开源代码路径： [github.com/ARM-software](https://link.zhihu.com/?target=https%3A//github.com/ARM-software/SCP-firmware) ，代码下载：

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/ARM SCP入门-简介和代码下载编译.md) [[../../raw/tech/bsp/芯片底软及固件/ARM SCP入门-简介和代码下载编译.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/ARM SCP入门-简介和代码下载编译.md) [[../../raw/tech/bsp/芯片底软及固件/ARM SCP入门-简介和代码下载编译.md|原始文章]]
