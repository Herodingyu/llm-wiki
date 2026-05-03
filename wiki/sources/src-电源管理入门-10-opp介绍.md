---
doc_id: src-电源管理入门-10-opp介绍
title: 电源管理入门 10 OPP介绍
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-10 OPP介绍.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 1 人赞同了该文章 ![](https://pic3.zhimg.com/v2-1c2bd9fe957bd1d00aa2a6d54e9bb0ca_1440w.jpg)

## Key Points

### 1. 1\. 什么是OPP，怎么用？
> 在SoC内，某些domain可以运行在较低的频率和电压下，而其他domain可以运行在较高的频率和电压下，某个domain所支持的<频率，电压>对的集合被称为Operating Performance Point，缩写OPP。

### 2. 2\. 系统初始化加载OPP信息
``` DT_MACHINE_START --》imx6ul_init_late --》imx6ul_opp_init --》_of_add_opp_table_v1(dev); --》_opp_add_v1

### 3. 3\. 触发使用
例如输入命令： ``` echo 700000 > /sys/devices/system/cpu/cpu0/cpufreq/scaling_setspeed ``` \_\_ [cpufreq\_driver\_target](https://zhida.zhihu.com/search?content_id=272340012&content_type=Article&match_order=

### 4. 4\. API介绍
- dev\_pm\_opp\_add ：( WARNING: Do not use this function in interrupt context.) - 向指定的设备添加一个频率/电压（opp table）组合，频率和电压的单位分别是Hz和uV。

## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-10 OPP介绍.md) [[../../raw/tech/bsp/电源管理/电源管理入门-10 OPP介绍.md|原始文章]]

## Key Quotes

> "在SoC内，某些domain可以运行在较低的频率和电压下，而其他domain可以运行在较高的频率和电压下，某个domain所支持的<频率，电压>对的集合被称为Operating Performance Point，缩写OPP。"

> "Linux驱动的套路其实就是DTS里面有个compatible，然后内核启动的时候走各种平台设备初始化就会去寻找加载，然后变成链表结构体。在使用的时候：用户通过设备节点或者中断产生或者内核进程触发就可以运行。"

> "API介绍

- dev\_pm\_opp\_add ：( WARNING: Do not use this function in interrupt context.)
- 向指定的设备添加一个频率/电压（opp table）组合，频率和电压的单位分别是Hz和uV"

> "- dev\_pm\_opp\_enable：
- 用于使能指定的OPP，调用dev\_pm\_opp\_add添加进去的OPP，默认是enable的"

> "> 后记：  
> Linux驱动的套路其实就是DTS里面有个compatible，然后内核启动的时候走各种平台设备初始化就会去寻找加载，然后变成链表结构体。在使用的时候：用户通过设备节点或者中断产生或者内核进程触发就可以运行"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-10 OPP介绍.md) [[../../raw/tech/bsp/电源管理/电源管理入门-10 OPP介绍.md|原始文章]]
