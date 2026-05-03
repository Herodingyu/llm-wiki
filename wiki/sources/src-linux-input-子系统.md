---
doc_id: src-linux-input-子系统
title: Linux input 子系统
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/Linux input 子系统.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

## Summary

2 人赞同了该文章 按键、鼠标、键盘、触摸屏等都属于输入(input)设备，Linux 内核为此专门做了一个叫做 [input子系统](https://zhida.zhihu.com/search?content_id=197270436&content_type=Article&match_order=1&q=input%E5%AD%90%E7%B3%BB%E7%BB%9F&zhida_source=entity) 的框架来处理输入事件。输入设备本质上还是 [字符设备](https://zhida.zhihu.com/search?content_id=197270436&content_t

## Key Points

### 1. input 子系统


### 2. 1、input 子系统简介
input 就是输入的意思，因此 input 子系统就是管理输入的子系统，和 pinctrl 和 gpio 子系统一样，都是 Linux [内核](https://zhida.zhihu.com/search?content_id=197270436&content_type=Article&match_order=2&q=%E5%86%85%E6%A0%B8&zhida_source=entit

### 3. 2、input 驱动编写流程
input 核心层会向 Linux 内核注册一个字符设备，大家找到 drivers/input/input.c 这个文件，input.c 就是 input 输入子系统的核心层，此文件里面有如下所示代码：

## Evidence

- Source: [原始文章](raw/tech/peripheral/Linux input 子系统.md) [[../../raw/tech/peripheral/Linux input 子系统.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/Linux input 子系统.md) [[../../raw/tech/peripheral/Linux input 子系统.md|原始文章]]
