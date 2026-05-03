---
doc_id: src-电源管理入门-5-arm-scmi和mailbox核间通信
title: 电源管理入门 5 arm scmi和mailbox核间通信
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-5 arm-scmi和mailbox核间通信.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 3 人赞同了该文章 ![](https://pica.zhimg.com/v2-82644a755444a14a159bef3c819a968a_1440w.jpg)

## Key Points

### 1. 1\. 整体架构介绍
![](https://pic3.zhimg.com/v2-099965e13c45cd2a3c93bee6e75a64fc_1440w.jpg) Reset系统架构框图 上图以NPU子模块的服务为例子，Mailbox的硬件使用PL320，整体流程如下：

### 2. 2 Linux中reset模块
![](https://pic2.zhimg.com/v2-bc54eaeb6ea43b517843b1841105db83_1440w.jpg)

### 3. 2.1 Reset consumer
之前的文章电源管理入门-4子系统reset介绍了怎么使用Linux的reset子系统，这里我们就直接使用，需要在DTS中修改即可。 reset使用Linux自带的reset框架，假定consumer-firmware-npu这个驱动要使用NPU的reset，定义在DTS中有reset consumer的说明：consumer-firmware-npu。

### 4. 2.2 Reset provider
reset的provider是scmi-reset驱动，DTS中设置如下： ``` scmi_reset: protocol@16 { reg = <0x16>; }; ``` 代码位置在：drivers/reset/reset-scmi.c

### 5. 3\. Linux SCMI reset通信
![](https://pica.zhimg.com/v2-aae703f2c7b704ed9ded1559a898057e_1440w.jpg) 如上图中，Linux通过非安全通道跟SCP交互。

## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-5 arm-scmi和mailbox核间通信.md) [[../../raw/tech/bsp/电源管理/电源管理入门-5 arm-scmi和mailbox核间通信.md|原始文章]]

## Key Quotes

> "Mailbox是核间通信软硬件的统称。"

> "PL320带传输数据和中断功能，但是数据量比较小7\*32bit。对于新的SoC来说数据传输基本都使用共享内存，PL320自带的数据传输基本用不上了，所以其算过时了。新的MHU只保留了中断功能，并且是1对1的集成，核间通信时成对出现，用几个加几个更加的灵活，PL320是一次32个通道集成进SoC的，也可能浪费。"

> "我们以PL320为例，只使用其中断，数据还是通过共享内存传输，驱动跟MHU原理差不多。关于PL320，可以参考ARM官网的文档，后面会专门写一个核间通信的专题介绍下。"

> "本小节介绍比较详细，其实很多知识点都是相通的，例如SCMI、SCP、Mailbox、DTS这些东西，早晚都需要掌握，但是通过一个业务流程或者场景就可以学习到，本文就是一个了解这些知识的机会。"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-5 arm-scmi和mailbox核间通信.md) [[../../raw/tech/bsp/电源管理/电源管理入门-5 arm-scmi和mailbox核间通信.md|原始文章]]
