---
doc_id: src-deepbluembedded-how-to-receive-spi-with-stm32-dma-interr
title: "How To Receive SPI Data With STM32 DMA / Interrupt / Polling Modes"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/deepbluembedded-how-to-receive-spi-with-stm32-dma-interr.md
domain: tech/peripheral
created: 2026-05-02
updated: 2026-05-02
tags: [peripheral, spi, dma, stm32]
---

# How To Receive SPI Data With STM32 DMA / Interrupt / Polling Modes

## 来源

- **原始文件**: raw/tech/peripheral/deepbluembedded-how-to-receive-spi-with-stm32-dma-interr.md
- **提取日期**: 2026-05-02

## Summary

本文详细介绍了在STM32微控制器上配置SPI外设作为从设备（Slave）接收数据的三种模式：轮询（Polling）、中断（Interrupt）和DMA（Direct Memory Access）。教程基于STM32 HAL库，通过三个实验项目（LAB 55-57）逐步演示了每种模式的配置方法、代码实现和适用场景。作为发送端的主设备（Master）支持五种数据传输方案：轮询发送、中断发送、DMA发送、定时器中断周期性发送以及定时器+DMA无CPU干预发送。文章深入分析了各模式的优缺点：轮询模式简单易实现但CPU占用率高；中断模式提高了效率但在高速大数据量场景下可能因频繁中断导致CPU负载过高；DMA模式最为高效，可实现SPI全速传输且几乎不占用CPU资源，是大数据量传输的首选方案。

## Key Points

### SPI从设备接收三种模式对比

| 模式 | 特点 | CPU占用 | 适用场景 |
|------|------|---------|----------|
| 轮询（Polling） | 阻塞式代码，等待当前字节传输完成 | 高（忙等待） | 小数据量、调试、简单应用 |
| 中断（Interrupt） | 非阻塞，传输完成中断触发 | 中等 | 中等数据量、响应及时性要求 |
| DMA | 直接内存访问，CPU不参与数据传输 | 极低 | 大批量数据、高速传输 |

### SPI主设备发送五种方案

1. **轮询发送**：使用`HAL_SPI_Transmit()`，最简单但CPU忙等待
2. **中断发送**：使用`HAL_SPI_Transmit_IT()`，释放部分CPU时间
3. **DMA发送**：使用`HAL_SPI_Transmit_DMA()`，最高效，全速传输
4. **定时器中断周期性发送**：通过定时器溢出中断控制发送速率，适合低速采样
5. **定时器+DMA发送**：DMA由定时器触发，无需CPU干预，可实现精确采样率控制

### 各模式代码示例

| 模式 | 核心HAL函数 |
|------|-------------|
| 轮询发送 | `HAL_SPI_Transmit(&hspi1, TX_Data, sizeof(TX_Data), timeout)` |
| 中断发送 | `HAL_SPI_Transmit_IT(&hspi1, TX_Data, sizeof(TX_Data))` |
| 中断接收 | `HAL_SPI_Receive_IT(&hspi1, RX_Data, sizeof(RX_Data))` |
| DMA发送 | `HAL_SPI_Transmit_DMA(&hspi1, TX_Data, sizeof(TX_Data))` |
| DMA接收 | `HAL_SPI_Receive_DMA(&hspi1, RX_Data, sizeof(RX_Data))` |

### 性能与选型建议

- **小数据量/调试**：优先使用轮询模式，代码简单直观
- **中等数据量**：中断模式，平衡效率与复杂度
- **大数据量/高速**：DMA模式，避免CPU成为瓶颈
- **定时敏感**：定时器+DMA组合，实现确定性采样率
- **注意**：高速SPI大批量数据通过中断接收可能导致CPU被频繁中断占用

## Key Quotes

> "Using the DMA unit not only will make the SPI going at full speed on both sides of communication, but it will also free the CPU from doing the data transfers from memory to peripheral."

> "The Polling method is a blocking piece of code that waits for the current byte to be completely transmitted then it sends the next and so on. This method is the easiest to implement and the most time-consuming for the CPU."

> "A major problem with interrupts is that we can't expect when it'd arrive or during which task. That can potentially screw up the timing behavior of the system, especially with an extremely fast communication bus like SPI."

> "The DMA unit is responsible for data transfer operations and it gets triggered on-time by the timer overflow signal. You can change the timer period anytime during the code runtime and achieve any sampling rate you want."

## Related Pages

- [[spi]] — SPI 接口工作原理
- [[dma]] — DMA 直接内存访问机制
- [[i2c]] — 另一种常见外设总线
- [[uart]] — 异步串行通信协议

## 开放问题

- 在高速SPI场景下DMA与CPU缓存一致性问题
- 多从机配置下的SPI DMA管理策略
