---
doc_id: src-ai系统-25芯片低速外设
title: AI系统 25芯片低速外设
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-25芯片低速外设.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 4 人赞同了该文章 ![](https://pic2.zhimg.com/v2-f240b65be9ad1b2e9be074ba382f2227_1440w.jpg)

## Key Points

### 1. 1\. I2C
这里找了一个I2C的 **IP开源设计** ，参考： [forum.digikey.com/t/i2c](https://link.zhihu.com/?target=https%3A//forum.digikey.com/t/i2c-master-vhdl/12797)

### 2. 2\. UART
这里使用ARM的UART IP： **PL011** 进行说明，参考： [developer.arm.com/docum](https://link.zhihu.com/?target=https%3A//developer.arm.com/documentation/ddi0183/g/%3Flang%3Den)

### 3. 3\. PGIO
![](https://pic4.zhimg.com/v2-4d7cd9246dfa1f27c23678bc605f981f_1440w.jpg) AXI GPIO IP 旨在为 AXI-Lite 接口提供通用输入/输出接口（ **GPIO** ），并且可以将设备配置为 **单通道或双通道** ，每个通道的宽度是可以独立配置。

### 4. 4\. SPI
![](https://pic4.zhimg.com/v2-baa0ee520bde0eb823306f8d77858d7f_1440w.jpg) SPI，即 **串行外设接口（Serial Peripheral Interface）** 是一种同步串行通信协议，适用于 **短距离通信** 。该协议自 Motorola 公司于 20 世纪 80 年代提出至今，已经广泛应用在嵌入式系统当中，成为许多

### 5. 5\. QSPI
![](https://pic4.zhimg.com/v2-95c54fc3c741ef696b6ddf1d29b81939_1440w.jpg) **SPI Flash控制器（以下简称“QSPI”）** 主要实现两类功能，一是与Flash设备进行 **数据交互** ，二是对Flash设备进行 **管理和查询** 。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-25芯片低速外设.md) [[../../raw/tech/soc-pm/AI系统/AI系统-25芯片低速外设.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-25芯片低速外设.md) [[../../raw/tech/soc-pm/AI系统/AI系统-25芯片低速外设.md|原始文章]]
