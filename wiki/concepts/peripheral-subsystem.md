---
doc_id: peripheral-subsystem
title: 外设子系统（Peripheral Subsystem）
page_type: concept
related_sources:
  - src-onechan-soc-peripheral-subsystem
related_entities: []
created: 2026-05-09
updated: 2026-05-09
tags: [concept, soc, peripheral, uart, i2c, spi, gpio, dma]
---

# 外设子系统（Peripheral Subsystem）

## 定义

外设子系统是 SoC 连接外部世界的入口，负责与传感器、执行器、通信模块、存储设备等外部组件进行可靠、可控、可扩展的交互。没有外设子系统，CPU 只是芯片内部一个会执行指令的孤岛。

## 核心理念

- **外设不是边角料**：从系统角度看，外设是 SoC 的"感官和手脚"
- **分层设计**：低速外设（UART/I2C/SPI）与高速外设（USB/PCIe/Ethernet）走不同通路
- **事件驱动优于轮询**：让系统"被叫醒"而非"一直等"

## 外设分类

### 1. 通信接口
| 接口 | 速率 | 线数 | 典型应用 |
|------|------|------|---------|
| UART | < 1 Mbps | 2 | 调试、GPS、蓝牙模块 |
| I2C | < 3.4 Mbps | 2 | 传感器、EEPROM、PMIC |
| SPI | < 100 Mbps | 4 | Flash、显示屏、ADC |
| I3C | < 12.5 Mbps | 2 | 新一代传感器总线 |
| USB | 480 Mbps - 40 Gbps | 2-4 | 通用连接 |
| PCIe | 8 GT/s - 128 GT/s | 4-16 | 高速外设、显卡 |
| Ethernet | 10 Mbps - 400 Gbps | 4/8 | 网络通信 |

### 2. 控制接口
| 接口 | 功能 | 典型应用 |
|------|------|---------|
| GPIO | 通用输入输出 | 按键、LED、中断 |
| PWM | 脉宽调制 | 电机控制、背光调节 |
| Timer | 定时计数 | 系统时钟、延时、捕获 |
| ADC/DAC | 模数/数模转换 | 传感器采集、音频输出 |
| Watchdog | 看门狗 | 系统死锁恢复 |

### 3. 存储接口
| 接口 | 介质 | 典型应用 |
|------|------|---------|
| SDIO/eMMC | 闪存 | 系统存储、扩展卡 |
| SATA/NVMe | SSD | 大容量高速存储 |
| NOR Flash | 闪存 | Boot 代码存储 |

## 设计要点

### 中断管理
- 中断源识别与优先级仲裁
- 中断嵌套与尾链优化
- GPIO 中断消抖与滤波

### DMA 配合
- 外设与内存的零拷贝传输
- 环形缓冲区与双缓冲设计
- DMA 描述符链式管理

### 低功耗设计
- 外设时钟门控（Clock Gating）
- 事件唤醒机制（Event Wake-up）
- 低功耗总线（APB vs AHB vs AXI）

## 相关来源

- [[src-onechan-soc-peripheral-subsystem]] — SoC（1）：浅谈外设子系统

## 开放问题

- I3C 是否会完全替代 I2C + SPI 的组合？
- 车规芯片对外设的功能安全（ISO 26262）要求如何影响设计？
