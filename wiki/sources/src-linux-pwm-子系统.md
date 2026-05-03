---
doc_id: src-linux-pwm-子系统
title: Linux pwm 子系统
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/Linux pwm 子系统.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

## Summary

2 人赞同了该文章 PWM：Pulse width modulation， [脉冲宽度调制](https://zhida.zhihu.com/search?content_id=197789819&content_type=Article&match_order=1&q=%E8%84%89%E5%86%B2%E5%AE%BD%E5%BA%A6%E8%B0%83%E5%88%B6&zhida_source=entity) ，在 IC 中，是使用 [定时器](https://zhida.zhihu.com/search?content_id=197789819&content_type=Artic

## Key Points

### 1. PWM 简介
PWM：Pulse width modulation， [脉冲宽度调制](https://zhida.zhihu.com/search?content_id=197789819&content_type=Article&match_order=1&q=%E8%84%89%E5%86%B2%E5%AE%BD%E5%BA%A6%E8%B0%83%E5%88%B6&zhida_source=entity

### 2. PWM 软件分析
PWM 驱动比 I2C 等简单，可以理解为不用写，芯片厂商已经为 soc 写了 PWM 驱动，我们在使用过程中，只需要修改 [设备树](https://zhida.zhihu.com/search?content_id=197789819&content_type=Article&match_order=1&q=%E8%AE%BE%E5%A4%87%E6%A0%91&zhida_source=en

### 3. PWM 驱动测试
参考内核文档 Documentation/ABI/testing/sysfs-class-pwm 描述。 PWM 子系统的核心是 pwm\_chip 结构体，在 sys/class/pwm/ 下会显示内核注册了几个。

### 4. 在其他外设上添加 PWM 功能
有时候我们需要在某个外设上添加 PWM 功能，比如，LCD 的背光控制就是 PWM 来完成的。 首先肯定是设备树描述，直接看 linux 内核里面关于 backlight(背光)的绑定文档，路径为Documentation/devicetree/bindings/video/backlight/pwm-backlight.txt，此文档描述了如何创建backlight 节点来使用 linux 内核

### 5. 扩展
一些 IC 厂商的 PWM 控制器有多种工作模式： ![](https://pica.zhimg.com/v2-224c33d621aef80855f6ae82d5ede4c0_1440w.jpg) 发布于 2022-04-05 21:11[【2026最新净热一体机测评】不踩坑怎么选？即热好？VS储热好？多维度测评佳德净净热一体机，看看到底是“智商税”还是“真香”？](https://zhuanl

## Evidence

- Source: [原始文章](raw/tech/peripheral/Linux pwm 子系统.md) [[../../raw/tech/peripheral/Linux pwm 子系统.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/Linux pwm 子系统.md) [[../../raw/tech/peripheral/Linux pwm 子系统.md|原始文章]]
