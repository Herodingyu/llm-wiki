---
doc_id: src-聊聊soc启动-六-uboot启动流程二
title: 聊聊SOC启动（六） uboot启动流程二
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（六） uboot启动流程二.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944) TrustZone 等 12 人赞同了该文章 本文基于以下软硬件假定：

## Key Points

### 1. 1　Uboot支持的主要特性
uboot在初始化完成后会为用户提供一个命令行交互接口，用户可通过该接口执行uboot定义的命令，以用于查看系统状态，设置 [环境变量](https://zhida.zhihu.com/search?content_id=203706975&content_type=Article&match_order=1&q=%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F&zhida

### 2. １.1　设备树
设备树是一种通过dts文件来描述SOC属性，通过将设备的具体配置信息与驱动分离，以达到利用一份代码适配多款设备的机制。dts文件包含了一系列层次化结构的节点和属性，它可以通过dtc [编译器](https://zhida.zhihu.com/search?content_id=203706975&content_type=Article&match_order=1&q=%E7%BC%96%E8%A

### 3. １.2　驱动模型DM
Uboot驱动模型与linux的设备模型比较类似，利用它可以将设备与驱动分离。对上可以为同一类设备提供统一的操作接口，对下可以为驱动提供标准的注册接口，从而提高代码的 [可重用性](https://zhida.zhihu.com/search?content_id=203706975&content_type=Article&match_order=1&q=%E5%8F%AF%E9%87%8D%E

### 4. １.2.1　驱动模型的结构
驱动模型主要用于管理系统中的驱动和设备，uboot为它们提供了以下描述结构体： （1）driver结构体 driver结构体用于表示一个驱动，其定义如下: ``` struct driver { char *name;

### 5. １.2.2　驱动模型的初始化
驱动模型初始化主要完成udevice、driver以及ucalss等之间的绑定关系，其主要包含以下部分： （1）udevice与driver的绑定 （2）udevice与uclass的绑定 （3）uclass与uclass\_driver的绑定

## Key Quotes

> "设备树是一种通过dts文件来描述SOC属性，通过将设备的具体配置信息与驱动分离，以达到利用一份代码适配多款设备的机制。"

> "Uboot驱动模型与linux的设备模型比较类似，利用它可以将设备与驱动分离。"

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（六） uboot启动流程二.md) [[../../raw/tech/bsp/聊聊SOC启动（六） uboot启动流程二.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（六） uboot启动流程二.md) [[../../raw/tech/bsp/聊聊SOC启动（六） uboot启动流程二.md|原始文章]]
