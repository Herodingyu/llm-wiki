---
doc_id: src-i3c-mipi-specifications-i3c-sensor-specification
title: "MIPI I3C Sensor Specification"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/I3C-mipi-specifications-i3c-sensor-specification.md
domain: tech/peripheral
created: 2026-05-02
updated: 2026-05-02
tags: [peripheral, i3c, mipi, sensor, specification]
---

# MIPI I3C Sensor Specification

## 来源

- **原始文件**: raw/tech/peripheral/I3C-mipi-specifications-i3c-sensor-specification.md
- **提取日期**: 2026-05-02

## Summary

MIPI I3C Sensor Specification是MIPI Alliance制定的I3C传感器子规范，定义了在I3C总线上连接和配置传感器的标准化方法。该规范在MIPI I3C Basic/Full协议基础上，为传感器设备提供了统一的命令集、寄存器映射、中断定义和功耗管理标准。I3C Sensor Specification的目标是消除不同传感器厂商之间的接口差异，使SoC开发者能够使用一致的软件接口与各种传感器通信，从而大幅降低软件开发复杂度和加速产品上市时间。规范涵盖了运动传感器（加速度计、陀螺仪、磁力计）、环境传感器（温度、湿度、气压、光强）和生物传感器等多种类型，定义了标准化的传感器数据格式、配置流程和事件报告机制。该规范是I3C生态系统建设的关键组成部分，推动了I3C在移动设备、可穿戴设备和IoT领域的广泛采用。

## Key Points

### I3C Sensor Specification范围

| 方面 | 定义内容 |
|------|----------|
| 传感器命令集 | 标准化的读取/配置命令 |
| 寄存器映射 | 统一的传感器寄存器访问方式 |
| 中断定义 | 标准化的传感器事件类型 |
| 功耗管理 | 统一的低功耗模式和行为 |
| 数据格式 | 标准化的传感器数据表示 |

### 传感器类别

1. **运动传感器（Motion Sensors）**
   - 加速度计（Accelerometer）
   - 陀螺仪（Gyroscope）
   - 磁力计（Magnetometer）
   - 六轴/九轴组合传感器

2. **环境传感器（Environmental Sensors）**
   - 温度传感器
   - 湿度传感器
   - 气压传感器
   - 环境光传感器

3. **生物传感器（Biometric Sensors）**
   - 心率传感器
   - 血氧传感器
   - 皮肤温度传感器

4. **位置传感器（Position Sensors）**
   - 接近传感器
   - 手势识别传感器
   - 霍尔传感器

### 标准化命令集

| 命令类别 | 示例命令 | 功能 |
|----------|----------|------|
| 配置命令 | SET_CONFIG | 设置传感器工作模式 |
| 数据命令 | READ_DATA | 读取传感器数据 |
| 状态命令 | GET_STATUS | 获取传感器状态 |
| 中断命令 | SET_INT_CONFIG | 配置中断条件 |
| 校准命令 | SET_CALIB | 设置校准参数 |

### 功耗管理标准

1. **工作模式定义**
   - 活动模式（Active）：全速数据采集
   - 低功耗模式（Low Power）：降低采样率
   - 睡眠模式（Sleep）：保持配置，暂停采集
   - 深度睡眠（Deep Sleep）：最小功耗状态

2. **状态转换**
   - 标准化状态转换流程
   - 转换时间和功耗规格
   - 唤醒源配置

### 对开发者的价值

| 优势 | 说明 |
|------|------|
| 软件复用 | 统一API适配多种传感器 |
| 开发加速 | 减少传感器适配工作量 |
| 生态丰富 | 鼓励更多厂商提供兼容传感器 |
| 质量提升 | 经过标准组织验证的接口 |

## Key Quotes

> "MIPI I3C Sensor Specification defines standardized methods for connecting and configuring sensors on the I3C bus."

> "The specification aims to eliminate interface differences between sensor vendors, enabling SoC developers to use consistent software interfaces."

> "Standardized sensor commands, register maps, and power management reduce software complexity and accelerate time-to-market."

## Related Pages

- [[i3c]] — I3C 协议核心特性
- [[mipi-alliance]] — MIPI Alliance 规范组织
- [[sensor]] — 传感器技术
- [[sensor-hub]] — 传感器中枢架构

## 开放问题

- I3C Sensor Specification与I2C传感器传统生态的过渡策略
- 规范对新型传感器（如毫米波雷达、LiDAR）的扩展支持
- 与Android Sensors HAL等软件框架的对接细节