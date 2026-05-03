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

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-5 arm-scmi和mailbox核间通信.md) [[../../raw/tech/bsp/电源管理/电源管理入门-5 arm-scmi和mailbox核间通信.md|原始文章]]
