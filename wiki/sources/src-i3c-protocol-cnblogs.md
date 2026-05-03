---
doc_id: src-i3c-protocol-cnblogs
title: "I3C协议详解"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/I3C-protocol-cnblogs.md
domain: tech/peripheral
created: 2026-05-02
updated: 2026-05-02
tags: [peripheral, i3c, i2c, protocol]
---

# I3C协议详解

## 来源

- **原始文件**: raw/tech/peripheral/I3C-protocol-cnblogs.md
- **提取日期**: 2026-05-02

## Summary

本文深入解析了MIPI I3C协议的通信机制，重点介绍了SDR（Single Data Rate）动态地址分配流程、HDR（High Data Rate）高速模式的工作原理，以及与I2C设备在混合总线中的共存策略。I3C最初为移动设备多传感器场景设计，旨在解决I2C和SPI在传感器数量增加时的性能瓶颈。文章详细阐述了I3C SDR模式作为默认通信模式与I2C的高度相似性，以及如何通过BCR（Bus Characteristic Register）和DCR（Device Characteristic Register）辅助动态地址分配。同时介绍了三种总线请求类型：带内中断（IBI）、Secondary Master请求和热接入（Hot-Join）请求。对于嵌入式开发者而言，理解I3C的地址仲裁、CCC（Common Command Code）命令处理和HDR模式切换机制是正确使用该协议的关键。

## Key Points

### I3C设计目标与定位

| 方面 | I2C/SPI局限 | I3C解决方案 |
|------|-------------|-------------|
| 传感器数量 | I2C地址有限，SPI需大量片选线 | 动态寻址支持更多设备 |
| 速度需求 | I2C 400K-3.4M，SPI布线复杂 | SDR 12.5M，HDR 100M |
| 功耗管理 | I2C开漏持续耗电，SPI静态功耗高 | 推挽+低功耗模式 |
| 中断处理 | I2C需轮询或额外INT线 | 带内中断，减少引脚 |

### SDR模式通信基础

- **默认模式**：I3C总线默认工作在SDR模式
- **I2C兼容**：SDR时序与传统I2C高度相似
- **混合总线**：可同时挂载I2C和I3C设备
- **区分机制**：I2C设备忽略I3C数据包；I2C低通滤波器阻止I3C高速时钟

### 动态地址分配（DAA）流程

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | 发送ENTDAA广播 | 启动动态地址分配流程 |
| 2 | 从设备响应 | 使用48-bit PID参与仲裁 |
| 3 | 地址分配 | 主设备为获胜设备分配7-bit动态地址 |
| 4 | 重复 | 直至所有设备分配完成 |

**关键寄存器**：
- **BCR**：描述设备在DAA和CCC中的角色和功能
- **DCR**：描述设备类型（加速计、陀螺仪等）
- **PID**：48-bit唯一临时标识符

### 从设备请求类型

| 请求类型 | 地址头特征 | 功能说明 |
|----------|------------|----------|
| 带内中断（IBI） | RnW=1，动态地址 | 请求主设备介入处理 |
| Secondary Master | RnW=0 | 请求成为总线主设备 |
| 热接入（Hot-Join） | 0x02特殊地址 | 总线运行时加入 |

**仲裁规则**：多设备同时请求时，地址最小者获胜

### HDR模式切换

- **进入HDR**：通过ENTHDR CCC命令
- **设备响应**：支持HDR的设备进入HDR模式；不支持的设备启动HDR退出监测器
- **退出HDR**：发送退出模式或STOP条件
- **HDR类型**：DDR（双沿）、TSP（三元脉冲）、TSL（三元电平）

### 混合总线设计要点

1. **电压兼容性**：确保I2C和I3C设备工作电压匹配
2. **速度限制**：与I2C设备通信时限制在I2C支持的速度
3. **地址规划**：预留I2C静态地址空间
4. **上拉电阻**：SDA/SCL需要适当的上拉电阻
5. **滤波器**：I2C设备内部低通滤波器自然隔离I3C高速信号

## Key Quotes

> "I3C最初的设计目的是为移动设备创建一个能够使用多个传感器的单一接口。"

> "I3C SDR模式与传统的I2C协议非常相似，因此I3C与许多I2C设备可以并存。"

> "I3C Slave设备在被赋予动态地址之前，只能以I2C设备的方式工作。"

> "从设备可以向主设备发送三种请求：In-Band中断请求、Secondary Master请求、热接入请求。"

## Related Pages

- [[i3c]] — I3C 协议核心特性
- [[i2c]] — I2C 兼容协议
- [[mipi-alliance]] — MIPI I3C 规范
- [[linux-driver]] — Linux I3C 子系统

## 开放问题

- 混合总线中I2C设备对I3C HDR模式的干扰机制
- 大规模I3C网络中的DAA性能优化