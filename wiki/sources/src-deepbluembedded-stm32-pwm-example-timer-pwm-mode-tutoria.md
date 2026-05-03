---
doc_id: src-deepbluembedded-stm32-pwm-example-timer-pwm-mode-tutoria
title: "STM32 PWM Output Example Code (PWM Generation Tutorial)"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/deepbluembedded-stm32-pwm-example-timer-pwm-mode-tutoria.md
domain: tech/peripheral
created: 2026-05-02
updated: 2026-05-02
tags: [peripheral, pwm, stm32, timer]
---

# STM32 PWM Output Example Code (PWM Generation Tutorial)

## 来源

- **原始文件**: raw/tech/peripheral/deepbluembedded-stm32-pwm-example-timer-pwm-mode-tutoria.md
- **提取日期**: 2026-05-02

## Summary

本文系统讲解了STM32微控制器通过定时器模块生成PWM（脉冲宽度调制）信号的原理与实践。PWM是一种通过数字信号模拟模拟电压的技术，通过控制高电平脉冲宽度占整个周期的比例（占空比）来调节平均输出电压，广泛应用于LED亮度控制、电机调速、电源管理等场景。文章详细阐述了PWM的三个核心参数：频率（由内部时钟、预分频器和自动重载寄存器ARR决定）、占空比（由捕获/比较寄存器CCRx控制）和分辨率（由ARR值决定的离散等级数）。STM32定时器支持多种PWM模式，包括边沿对齐模式（上计数/下计数）和中心对齐模式。文章提供了基于HAL库的代码示例，演示了如何配置定时器为PWM模式并控制LED调光，帮助开发者快速掌握STM32 PWM的实际应用。

## Key Points

### PWM核心参数

| 参数 | 定义 | 控制寄存器 | 公式 |
|------|------|------------|------|
| 频率（Frequency） | PWM信号高低电平切换速度 | ARR、Prescaler | FPWM = FCLK / ((ARR+1) × (PSC+1)) |
| 占空比（Duty Cycle） | 高电平时间占整个周期的比例 | CCRx | Duty = (CCRx / ARR) × 100% |
| 分辨率（Resolution） | 占空比的离散等级数 | ARR | 分辨率 = log₂(ARR+1) bits |

### PWM分辨率与频率的权衡

- **分辨率越高** → 占空比控制越精细（如16位=65536级）
- **频率越高** → 分辨率越低（二者成反比）
- **关键约束**：在固定时钟频率下，无法同时获得高频率和高分辨率

### STM32 PWM工作模式

| 模式 | 说明 | 应用场景 |
|------|------|----------|
| PWM模式1 | CNT < CCRx时输出高电平 | 常规PWM输出 |
| PWM模式2 | CNT < CCRx时输出低电平 | 反向PWM逻辑 |
| 边沿对齐（上计数） | 计数器向上计数，溢出重置 | 标准PWM应用 |
| 边沿对齐（下计数） | 计数器向下计数 | 特殊时序需求 |
| 中心对齐 | 计数器先上后下，在中心匹配 | 电机控制、三相逆变器 |

### 定时器通道特性

- 单个STM32定时器通常有**4个通道**
- 各通道可独立生成PWM，**占空比不同**
- 所有通道共享**相同频率**，且同步
- 输出极性可编程（高电平有效/低电平有效）
- 支持互补PWM输出（用于半桥/全桥驱动）

### HAL库关键配置

| 配置项 | HAL函数/寄存器位 |
|--------|------------------|
| PWM模式选择 | `OCxM`位（110=模式1，111=模式2） |
| 预装载使能 | `OCxPE`位 |
| 自动重载预装载 | `ARPE`位 |
| 输出极性 | `CCxP`位 |
| 中心对齐模式 | `CMS`位（TIMx_CR1寄存器） |

## Key Quotes

> "Pulse Width Modulation (PWM) is a technique for generating a continuous HIGH/LOW alternating digital signal and programmatically controlling its pulse width and frequency."

> "The duty cycle is usually expressed as a percentage value because it's a ratio between two-time quantities. And it directly affects the PWM's total average voltage that most devices respond to."

> "A higher PWM resolution is always a desirable thing to have. However, it's always in inverse proportion to the PWM's frequency. The higher the PWM frequency you choose, the lower the PWM resolution becomes."

> "The PWM signal's frequency is determined by the internal clock, the Prescaler, and the ARRx register. And its duty cycle is defined by the channel CCRx register value."

## Related Pages

- [[pwm]] — PWM 脉冲宽度调制技术
- [[stm32]] — STM32 微控制器
- [[timer]] — 定时器与计数器
- [[motor-control]] — 电机控制应用

## 开放问题

- 高频PWM在电机控制中的EMI抑制策略
- 多通道PWM同步与相位控制的实现细节