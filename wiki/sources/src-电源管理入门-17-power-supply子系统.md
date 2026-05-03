---
doc_id: src-电源管理入门-17-power-supply子系统
title: 电源管理入门 17 Power supply子系统
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-17 Power supply子系统.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 3 人赞同了该文章 ![](https://pic3.zhimg.com/v2-b950c65f993e28783490b83977496ff2_1440w.jpg)

## Key Points

### 1. 1\. Power supply框架都做些什么
这里我们以 **安卓** 为例： ![](https://pic2.zhimg.com/v2-5abef5d6f703af386280533a68998cb3_1440w.jpg) - **APP 层：** 该部分属于 **电量上报** 的最后的环节。其主要工作是：监听系统广播并对 UI 作出相应更新，包括电池电量百分比，充电状态，低电提醒，led 指示灯，异常提醒等。

### 2. 2\. 相关数据结构和接口


### 3. 2.1 数据结构
struct power\_supply：用于抽象 **PSY设备** ``` /* include/linux/power_supply.h */ struct power_supply { const struct power_supply_desc *desc;    //PSY描述符

### 4. 2.2 接口
power\_supply\_core.c主要负责设备 **状态变化逻辑** ，power\_supply\_sysfs.c主要负责文件节点相关逻辑。 **power\_supply\_changed** ：在驱动中 **检测到硬件状态发生变化** ，会通过该函数调度起psy中的 **changed\_work** 。该工作队列负责发送notifier（内核内不同模块之间）和通过uevent进行c

### 5. 3\. 充电驱动
![](https://pic3.zhimg.com/v2-ee90caa8ebfb6e0fd7525fdcfedca8e0_1440w.jpg) - Charge Manger、 [Fuel Gauge](https://zhida.zhihu.com/search?content_id=272732550&content_type=Article&match_order=1&q=Fuel+Ga

## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-17 Power supply子系统.md) [[../../raw/tech/bsp/电源管理/电源管理入门-17 Power supply子系统.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-17 Power supply子系统.md) [[../../raw/tech/bsp/电源管理/电源管理入门-17 Power supply子系统.md|原始文章]]
