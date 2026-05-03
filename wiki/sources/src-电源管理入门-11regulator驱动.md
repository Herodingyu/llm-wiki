---
doc_id: src-电源管理入门-11regulator驱动
title: 电源管理入门 11Regulator驱动
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-11Regulator驱动.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 3 人赞同了该文章 ![](https://pic1.zhimg.com/v2-cca9a00bc1e68b163ca31cfd9ca29244_1440w.jpg)

## Key Points

### 1. 1\. Regulator驱动是什么？
Regulator是Linux系统中电源管理的基础设施之一，用于稳压电源的管理，是各种驱动子系统中设置 电压的标准接口。前面介绍的CPUFreq驱动就经常使用它来设定电压。分为voltage regulator(电压调节器)和current(电流调节器)。一般电源管理芯片(Power Management IC)中会包含一个甚至多个regulator。

### 2. 2\. Regulator框架介绍
![](https://pic3.zhimg.com/v2-612dbb2c88795bdf5c8dfc36df1e633c_1440w.jpg) Linux [regulator framework](https://zhida.zhihu.com/search?content_id=272340135&content_type=Article&match_order=1&q=regulator

### 3. 2.1 regulator consumer
regulator consumer抽象出regulator设备（struct regulator），并提供regulator操作相关的接口。包括：regulator\_get/regulator\_put/regulator\_enable/regulator\_disable/ regulator\_set\_voltage/regulator\_get\_voltage等。

### 4. 2.2 regulator core
regulator core负责上述 [regulator driver](https://zhida.zhihu.com/search?content_id=272340135&content_type=Article&match_order=1&q=regulator+driver&zhida_source=entity) /consumer/machine逻辑的具体实现，对底层的硬件进行封装

### 5. 2.3 regulator driver
regulator driver指的是regulator设备的驱动，主要包含如下结构： 1）使用struct regulator\_desc，描述regulator的静态信息，包括：名字、supply regulator的名字、中断号、操作函数集（struct regulator\_ops）、使用regmap时相应的寄存器即bitmap等。

## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-11Regulator驱动.md) [[../../raw/tech/bsp/电源管理/电源管理入门-11Regulator驱动.md|原始文章]]

## Key Quotes

> "Regulator的作用是什么？"

> "通常的作用是给电子设备供电。大多数regulator可以启用(enable)和禁用(disable)其输出，同时也可以控制其输出电压(voltage)和电流(current)。"

> "电源域由稳压器、开关或其他电源域的输出电源提供其输入电源的电子电路。电源Regulator可能位于一个或多个开关后面，例如："

> "Regulator电压设计时的约束："

> "稳压器级别：这由稳压器硬件操作参数定义，并在稳压器数据表中指定，例如：\`\`\` 电压输出范围为 800mV -> 3500mV 稳压器电流输出限制为 20mA @ 5V，但为 10mA @ 10V"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-11Regulator驱动.md) [[../../raw/tech/bsp/电源管理/电源管理入门-11Regulator驱动.md|原始文章]]
