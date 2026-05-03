---
doc_id: src-自动驾驶芯片入门-基础概念和架构
title: 自动驾驶芯片入门 基础概念和架构
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/自动驾驶芯片入门-基础概念和架构.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 2 人赞同了该文章 ![](https://pica.zhimg.com/v2-99ca937c9da4a69eb7846ee2eb465b3c_1440w.jpg)

## Key Points

### 1. 1\. ADAS介绍
![](https://picx.zhimg.com/v2-def8fec6f7f952a6a84ee66552a2c279_1440w.jpg) ADAS 全称 **Advanced Driving Assistance System** ，又称 **高级驾驶辅助系统** ，主要依靠包括视觉摄像头、毫米波雷达、计算平台的组合来实现自动驾驶辅助功能。

### 2. 1.1 ADAS功能分析
ADAS的功能主要有： **主动安全功能、舒适性辅助驾驶功能、泊车辅助功能和监督/无监督自动驾驶功能等。** ![](https://pica.zhimg.com/v2-fa85d082a41c8cc1d4782ea02894ae1e_1440w.jpg)

### 3. 1.2 ADAS系统构架
![](https://pic1.zhimg.com/v2-e14e1f1d2106e3a53d6dc95d36f2f84a_1440w.jpg) 1. **环境感知** ：感知系统依靠各种传感器（包括：摄像头、毫米波雷达、超声波雷达、激光雷达、高精地图/IMU/GPS等）来获取汽车所处环境信息和周边车辆、行人、交通信号灯和路标等信息，为汽车的综合决策提供数据支撑，解决“我在哪”的核心问题。

### 4. 1.3 ADAS传感器介绍
![](https://pica.zhimg.com/v2-f6cbf52054d8f18c68df2ce3b7c12022_1440w.jpg) 传感器是车辆感知系统收集环境信息、车辆自身状态信息和位置信息等的重要手段。自动驾驶车辆所配备的传感器可以分为三类：

### 5. 1.4 传感器布局
![](https://picx.zhimg.com/v2-31c2b0eaa2d0bba41f9948db4f97cc7f_1440w.jpg) - **前向ADAS系统** ：一般由单FCR，或者单FCM组成；当前主流配置是FCR+FCM组成的1R1V方案，能够支持到TJA/ICA的L2 ADAS（单车道驾驶辅助）。后续伴随视觉检测能力的提高，在L0-L2级ADAS/AD定位的车型上，有向单F

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/自动驾驶芯片入门-基础概念和架构.md) [[../../raw/tech/soc-pm/AI系统/自动驾驶芯片入门-基础概念和架构.md|原始文章]]

## Key Quotes

> "Advanced Driving Assistance System"

> "主动安全功能、舒适性辅助驾驶功能、泊车辅助功能和监督/无监督自动驾驶功能等。"

> "高通Snapdragon Ride，自动驾驶芯片：骁龙 Ride"

> "冯·诺依曼架构，其核心是存储程序/数据、串行顺序执行"

> "由大量运算单元组成的大规模并行计算架构"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/自动驾驶芯片入门-基础概念和架构.md) [[../../raw/tech/soc-pm/AI系统/自动驾驶芯片入门-基础概念和架构.md|原始文章]]
