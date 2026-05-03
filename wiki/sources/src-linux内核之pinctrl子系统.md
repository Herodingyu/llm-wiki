---
doc_id: src-linux内核之pinctrl子系统
title: Linux内核之pinctrl子系统
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/Linux内核之pinctrl子系统.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

## Summary

[收录于 · Linux内核源码分析学习](https://www.zhihu.com/column/c_1413593014497759232) 27 人赞同了该文章 众所周知，ARM SoC提供了十分丰富的硬件接口，而接口物理上的表现就是一个个的pin(或者叫做pad, finger等)。为了实现丰富的硬件功能，SoC的pin需要实现复用功能，即单独的pin需要提供不同功能，例如，pin0既可以作为GPIO，可以也用于i2c的SCL，通过pin相关的复用寄存器来切换不同的功能。除此之外，软件还可以通过寄存器配置pin相关的电气特性，例如，上拉/下拉、驱动能力、开漏等。

## Key Points

### 1. 软件框架
对于不同的SoC，其对于pin管理方式可能不同，所以软件上对于pin的配置方式可能存在较大的差异。对此，pinctrl子系统"求同存异"，将pin的管理方式进行了抽象，形成pinctrl-core抽象层，将具体SoC的pin controler隔离出去，形成pinctrl-driver抽象层，pinctrl-core和pinctrl-driver通过抽象接口进行通信。对于pinctrl-core的

### 2. pinctrl-core
pinctrl-core抽象层主要的功能就是提供三种服务： 1. 为SoC pin controler drvier提供底层通信接口的能力； 2. 为Driver提供访问pin的能力，即driver配置pin复用能、配置引脚的电气特性；

### 3. pinctrl-driver
pinctrl-driver主要为pinctrl-core提供pin的操作能力。对于具体的pinctrl-controler每个SoC的管理方式可能不同，对应到pinctrl-driver上，其实现方式可能会略有不同，但是，所有pinctrl-driver都是为了同一达到同一个目标，那就是把系统所有的pin信息以及对于pin的控制接口实例化成pinctrl\_desc，并将pinctrl\_des

### 4. pinctrl-client
具体到使用系统pin资源的设备驱动程序，pinctrl-core主要提供为其提供两种能力：隶属于本设备的所有pin的function的配置能力和GPIO子系统对于GPIO的配置能力； pinctrl-driver 中描述了pinctrl相关的DTS关于function和group的配置，对于具体的设备如何使用这些配置信息呢？还是以一个具体设备的DTS配置为例说明问题，DTS配置如下：

## Evidence

- Source: [原始文章](raw/tech/peripheral/Linux内核之pinctrl子系统.md) [[../../raw/tech/peripheral/Linux内核之pinctrl子系统.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/Linux内核之pinctrl子系统.md) [[../../raw/tech/peripheral/Linux内核之pinctrl子系统.md|原始文章]]
