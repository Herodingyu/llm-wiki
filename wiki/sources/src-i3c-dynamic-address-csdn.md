---
doc_id: src-i3c-dynamic-address-csdn
title: "I3C协议详解（含动态地址分配实战）"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/I3C-dynamic-address-csdn.md
domain: tech/peripheral
created: 2026-05-02
updated: 2026-05-02
tags: [peripheral, i3c, linux, driver]
---

# I3C协议详解（含动态地址分配实战）

## 来源

- **原始文件**: raw/tech/peripheral/I3C-dynamic-address-csdn.md
- **提取日期**: 2026-05-02

## Summary

本文深入解析了MIPI I3C协议的通信机制，重点介绍了动态地址分配（DAA）流程和带内中断（IBI）特性，并提供了基于Linux内核的实战代码示例。I3C最初设计目标是为移动设备创建一个能够管理多个传感器的单一接口。随着现代移动设备传感器数量增加和性能要求提升，I2C和SPI已接近其能力极限。I3C在保留SDA和SCL两根总线的同时，实现了向后兼容I2C。文章详细阐述了I3C SDR模式下的通信协议：主设备通过广播地址0x7E与所有I3C从设备通信，通过静态地址与I2C从设备通信，通过动态地址与已分配地址的I3C从设备通信。从设备在被赋予动态地址前以I2C模式工作，但支持响应广播和CCC命令。文章还介绍了I3C从设备可向主设备发送的三种请求：带内中断、Secondary Master请求和热接入请求，并提供了Linux I3C子系统的核心API使用示例。

## Key Points

### I3C核心术语

| 缩写 | 全称 | 说明 |
|------|------|------|
| SDR | Single Data Rate | 单一数据传输模式（默认模式） |
| HDR | High Data Rate | 高速数据传输模式 |
| Main Master | 主主设备 | 当前配置为I3C总线的主设备 |
| Secondary Master | 次主设备 | 可作为主设备但当前配置为从设备 |
| Current Master | 当前主设备 | 此时此刻行使主设备职能的设备 |

### I3C与I2C共存机制

- **I2C数据包**：I3C从设备会忽略发往I2C设备的数据包
- **I3C数据包**：I2C从设备通常检测不到，因为其低通滤波器阻止I3C较高时钟频率
- **兼容性原理**：SDR模式时序与传统I2C协议非常相似

### 动态地址分配（DAA）

| 要素 | 说明 |
|------|------|
| 地址长度 | 7-bit动态地址 |
| 辅助标识 | 48-bit临时ID（PID） |
| BCR寄存器 | 描述设备在DAA和CCC中的角色和功能 |
| DCR寄存器 | 描述设备类型（加速计、陀螺仪等） |
| I2C兼容 | 传统I2C设备提供Legacy Virtual Register |

### 主设备发送的地址类型

| 地址类型 | 值 | 响应设备 |
|----------|-----|----------|
| 静态地址 | 7-bit | 持有该地址的I2C从设备 |
| 广播地址 | 0x7E | 所有I3C从设备响应，I2C不响应 |
| 动态地址 | 7-bit | 持有该地址的I3C从设备 |

### 从设备三种请求类型

1. **带内中断请求（IBI）**
   - 使用RnW=1的设备动态地址
   - 等同于额外中断总线请求Master介入
   - 多设备同时中断时，地址最小者获得仲裁

2. **Secondary Master请求**
   - 使用RnW=0的地址头
   - 仅标记支持此功能的设备可请求

3. **热接入请求（Hot-Join）**
   - 使用特殊地址0x02
   - 仅在I3C总线可操作状态下发出

### 协议对比

| 特性 | UART | SPI | I2C | I3C |
|------|------|-----|-----|-----|
| 通信方式 | 全双工异步 | 全双工同步 | 半双工同步 | 同步 |
| 信号线 | RX、TX、GND | SDO、SDI、SCLK、SS | SDA、SCL | SDA、SCL |
| 从属选择 | 无从属关系 | 片选信号 | 静态地址 | 动态/广播地址 |
| 速率 | 最大115200bps | 最高几Mbps | 400K-1Mbps | SDR 4/8.8M，HDR 20M+ |

### Linux I3C核心API

| API函数 | 功能 |
|---------|------|
| `i3c_device_do_priv_xfers()` | 执行私有传输 |
| `i3c_master_setda()` | 设置动态地址 |
| `i3c_master_defslvs()` | 定义从设备列表 |

## Key Quotes

> "I3C最初的设计目的是为移动设备创建一个能够使用多个传感器的单一接口。"

> "I3C SDR模式与传统的I2C协议非常相似，因此I3C与许多I2C设备可以并存。"

> "当地址头是个可仲裁的地址时，从设备可以向主设备发送三种请求：In-Band中断请求、Secondary Master请求、热接入请求。"

> "I3C Slave设备在被赋予动态地址之前，只能以I2C设备的方式工作，但添加了响应I3C广播协议和处理CCC命令的特性。"

## Related Pages

- [[i3c]] — I3C 协议核心特性
- [[i2c]] — I2C 兼容协议
- [[linux-driver]] — Linux I3C 子系统驱动
- [[mipi-alliance]] — MIPI I3C 规范

## 开放问题

- Linux I3C子系统与厂商私有扩展的兼容性
- 动态地址分配在复杂总线拓扑中的可靠性