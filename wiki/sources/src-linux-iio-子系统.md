---
doc_id: src-linux-iio-子系统
title: Linux iio 子系统
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/Linux iio 子系统.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

## Summary

1 人赞同了该文章 工业场合里面也有大量的 [模拟量](https://zhida.zhihu.com/search?content_id=194032776&content_type=Article&match_order=1&q=%E6%A8%A1%E6%8B%9F%E9%87%8F&zhida_source=entity) 和数字量之间的转换，也就是我们常说的 ADC 和 DAC。而且随着手机、物联网、工业物联网和 [可穿戴设备](https://zhida.zhihu.com/search?content_id=194032776&content_type=Article&match_

## Key Points

### 1. 1、IIO 子系统简介
IIO 全称是 Industrial I/O，翻译过来就是工业 I/O，大家不要看到“工业”两个字就觉得 IIO 是只用于工业领域的。大家一般在搜索 IIO 子系统的时候，会发现大多数讲的都是 ADC，这是因为 IIO 就是为 ADC 类传感器准备的，当然了 DAC 也是可以的。大家常用的陀螺仪、加速度计、电压/ [电流测量](https://zhida.zhihu.com/search?cont

### 2. 2、IIO 驱动框架创建
分析 IIO 子系统的时候大家应该看出了，IIO 框架主要用于 ADC 类的传感器，比如陀螺仪、加速度计、磁力计、光强度计等，这些 [传感器](https://zhida.zhihu.com/search?content_id=194032776&content_type=Article&match_order=15&q=%E4%BC%A0%E6%84%9F%E5%99%A8&zhida_sour

### 3. 使能内核 IIO 相关配置
Linux 内核默认使能了 IIO 子系统，但是有一些 IIO 模块没有选择上，这样会导致我们编译 驱动的时候会提示某些 API 函数不存在，需要使能的项目如下： ``` -> Device Drivers

## Evidence

- Source: [原始文章](raw/tech/peripheral/Linux iio 子系统.md) [[../../raw/tech/peripheral/Linux iio 子系统.md|原始文章]]

## Key Quotes

> "因此，当你使用的传感器本质是 ADC 或 DAC 器件的时候，可以优先考虑使用 IIO 驱动框架"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/Linux iio 子系统.md) [[../../raw/tech/peripheral/Linux iio 子系统.md|原始文章]]
