---
doc_id: src-电源管理入门-13thermal-热管理
title: 电源管理入门 13Thermal 热管理
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-13Thermal 热管理.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 3 人赞同了该文章 ![](https://pic4.zhimg.com/v2-50968937fef83714cf90d4552571f7eb_1440w.jpg)

## Key Points

### 1. 1\. Linux中Thermal框架
在 [Linux 内核](https://zhida.zhihu.com/search?content_id=272340748&content_type=Article&match_order=1&q=+Linux+%E5%86%85%E6%A0%B8&zhida_source=entity) 中，Thermal 特指一套 **关于温控机制** 的驱动框架，其目的是为了防止 SoC 等硬件芯片因

### 2. 2\. sensor driver相关
这部分一般需要自己开发，例如rockchip平台上 ``` struct rockchip_thermal_sensor { struct rockchip_thermal_data *thermal;

### 3. 3\. governor
struct thermal\_governor：用来描述一个 governor（即 **温控策略** ） 信息。 内核目前有 **五种 governor** ： 1、power\_allocator：引⼊ PID（⽐例-积分-微分）控制，根据当前温度，动态给各 cooling device 分配 power，并将 power 转换为频率，从而达到 **根据温度限制频率** 的效果。

### 4. 4\. cooling device
嵌入式设备通过 **改变频率电压** ，来达到改变功耗的目的，cooling\_device提供了获取当前设备的温控状态以及设置等接口； ![](https://pica.zhimg.com/v2-c235d302784c4bc635d56241ded36b5c_1440w.jpg)

### 5. 5\. thermal zone
获取温度的设备：在 Thermal 框架中被抽象为 Thermal Zone Device; ``` struct thermal_zone_device { int id; char type[THERMAL_NAME_LENGTH];

## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-13Thermal 热管理.md) [[../../raw/tech/bsp/电源管理/电源管理入门-13Thermal 热管理.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-13Thermal 热管理.md) [[../../raw/tech/bsp/电源管理/电源管理入门-13Thermal 热管理.md|原始文章]]
