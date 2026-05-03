---
doc_id: src-ai系统-29芯片电源管理之pmu
title: AI系统 29芯片电源管理之PMU
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-29芯片电源管理之PMU.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 2 人赞同了该文章 ![](https://pic1.zhimg.com/v2-d1f33d69fa1970e56aed33b472b8610c_1440w.jpg)

## Key Points

### 1. 1\. PMU介绍
![](https://pic4.zhimg.com/v2-0971050c45874f4b3fb5d0f2b8280cdf_1440w.jpg)

### 2. 1.1 PMU概念
**PMU** （电源管理芯片）是一种高度集成化的电源管理方案，它集成多路的 **[LDO](https://zhida.zhihu.com/search?content_id=272214618&content_type=Article&match_order=1&q=LDO&zhida_source=entity) 和 [DC-DC](https://zhida.zhihu.com/searc

### 3. 1.2 LDO及DC-DC
**LDO线性降压电路** ，通过电阻分压实现降压，工作过程中会将降下的电压转化为热量，因此当输入输出压差和负载电流越大，芯片 **发热会越明显** ，造成较大的能量损耗。目前高性能LDO通常采用电压驱动型P沟道MOSFET作为调整管，不仅可以将静态电流能做到微安级，输入输出电压降也可以做到100mV水平。

### 4. 1.3 PMU使用及趋势
PMU上电后系统进入 **待机状态** ，用户触发开机键后，系统首先按照开机顺序将对应的LDO、DC-DC电源打开。系统进入 **正常工作状态** ，在CPU电源供应正常后，输出复位信号给CPU，让CPU开始启动和工作，CPU会返回一个保持信号让PMU处于持续工作状态。关机时，CPU会给PMU信号，让PMU关闭进入关机状态。系统正常工作时，CPU还可以通过I2C接口对PMU的各个子模块进行控制，P

### 5. 1.4 底板PMIC芯片
**PMIC（Power Management Integrated Circuit）** 芯片是一种集成电路，主要用于 **电源管理和功耗管理** 。它在电子设备中起着关键的作用。PMIC芯片在电子设备中的作用是管理电源 **供电、监测和控制电池充电状态和电量、管理温度，并执行一些系统控制功能** ，以确保设备的稳定运行和有效管理功耗。电源管理通过一定的电路拓扑，将不同的电源输入转换成满足系统工

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-29芯片电源管理之PMU.md) [[../../raw/tech/soc-pm/AI系统/AI系统-29芯片电源管理之PMU.md|原始文章]]

## Key Quotes

> "一种就是传统的基础在A核附属的一个硬件模块，另外一种就是独立核和固件的SCP"

> "超载运行、满载运行、低速运行和低功耗运行；低功耗模式包括系统空闲模式、低功耗空闲模式、暂停模式和SNVS模式"

> "PMIC（Power Management Integrated Circuit）"

> "供电、监测和控制电池充电状态和电量、管理温度，并执行一些系统控制功能"

> "SoC内部的是PMU（跟CPU总线通信），SoC外部的是PMIC（跟CPU用I2C/SPI等通信）"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-29芯片电源管理之PMU.md) [[../../raw/tech/soc-pm/AI系统/AI系统-29芯片电源管理之PMU.md|原始文章]]
