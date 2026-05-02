---
doc_id: pwm
title: PWM
page_type: concept
related_sources:
  - src-deepbluembedded-stm32-pwm-example-timer-pwm-mode-tutoria
  - src-kinet-ic-display-power-led-backlight-drivers-ics
  - src-asianda-top-10-mini-led-driver-chip-manufacturer
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, peripheral, power-control]
---

# PWM

## 定义

PWM（Pulse Width Modulation，脉宽调制）是一种通过快速开关数字信号并调节占空比来模拟模拟电压输出的技术。PWM 在嵌入式系统、电源管理、电机控制和 LED 调光等领域有着极其广泛的应用，是数字系统控制模拟世界的核心手段之一。

## 技术细节

核心原理：

- **占空比（Duty Cycle）**：高电平时间占整个周期的比例，0%~100%
- **有效电压**：负载接收到的平均电压 ≈ 峰值电压 × 占空比
- **频率**：PWM 周期重复的频率，需远高于负载响应速度以避免闪烁或抖动

关键参数：
- **频率选择**：LED 调光通常 > 100 Hz（避免肉眼可见闪烁），电机控制通常 > 20 kHz（避免音频噪声）
- **分辨率**：占空比调节的精细程度（如 8 位 = 256 级，10 位 = 1024 级）
- **极性**：正逻辑（高电平有效）或负逻辑（低电平有效）

应用场景：
- **LED 调光**：通过调节占空比控制 LED 亮度
- **电机调速**：控制直流电机转速
- **电源管理**：DC-DC 转换器（Buck/Boost）的核心控制机制
- **音频 DAC**：通过低通滤波将 PWM 转换为模拟音频信号
- **舵机控制**：标准 50 Hz PWM，0.5ms~2.5ms 脉宽对应角度

在显示领域的应用：
- LED 背光驱动广泛使用 PWM 调光
- 局部调光（Local Dimming）通过 PWM 独立控制各分区亮度
- Mini LED 驱动中 PWM 与 AM 驱动并存

## 相关来源

- [[src-deepbluembedded-stm32-pwm-example-timer-pwm-mode-tutoria]] — STM32 PWM 定时器模式教程
- [[src-kinet-ic-display-power-led-backlight-drivers-ics]] — LED 背光驱动 IC 中的 PWM 应用
- [[src-asianda-top-10-mini-led-driver-chip-manufacturer]] — Mini LED 驱动芯片的 PWM 调光技术

## 相关概念

- [[local-dimming]] — PWM 是实现局部调光的核心技术
- [[mini-led]] — Mini LED 背光广泛使用 PWM 驱动
- [[led-driver]] — LED 驱动器集成 PWM 控制功能
- [[spi]] — 通过 SPI 配置 LED 驱动器的 PWM 参数

## 相关实体

- [[renesas]] — LED 背光驱动中的 PWM 应用
- [[mediatek]] — SoC 中集成 PWM 控制器
