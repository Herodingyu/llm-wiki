---
doc_id: dma
title: DMA
page_type: concept
related_sources:
  - src-deepbluembedded-how-to-receive-spi-with-stm32-dma-interr
  - src-arxiv-html-250808396v1
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, peripheral, system-architecture]
---

# DMA

## 定义

DMA（Direct Memory Access，直接内存访问）是一种允许外设直接与系统内存进行数据传输而无需 CPU 介入的机制。DMA 控制器接管总线控制权，在内存和外设之间直接搬运数据，从而释放 CPU 去执行其他任务，大幅提升系统效率和数据吞吐量。

## 技术细节

核心优势：

- **减轻 CPU 负担**：数据传输期间 CPU 可执行计算任务或进入低功耗模式
- **提高吞吐量**：专用硬件控制器可实现比 CPU 轮询更高的传输速率
- **精确时序**：适合对时序敏感的外设（如音频、高速 ADC、视频）

工作模式：
- **外设到内存**：如 ADC 采样数据直接存入内存缓冲区
- **内存到外设**：如从内存缓冲区直接输出到 DAC 或显示屏
- **内存到内存**：如快速内存拷贝、图像数据搬移

关键概念：
- **通道**：DMA 控制器通常支持多个独立通道，每个通道服务一个外设
- **突发传输（Burst）**：一次请求传输多个数据单元，减少总线仲裁开销
- **FIFO**：部分 DMA 控制器内置 FIFO 以平滑数据流
- **循环模式**：自动重复传输，适合连续数据采集（如音频流）
- **中断**：传输完成或发生错误时通知 CPU

常见应用：
- SPI/I2C/UART 的高速数据收发
- ADC 连续采样
- 显示屏帧缓冲区更新
- 存储器（Flash/SD卡）读写
- 音视频数据流处理

## 相关来源

- [[src-deepbluembedded-how-to-receive-spi-with-stm32-dma-interr]] — STM32 SPI + DMA 中断接收实现
- [[src-arxiv-html-250808396v1]] — DMA 相关的学术研究

## 相关概念

- [[spi]] — 常与 DMA 配合使用实现高速数据传输
- [[i2c]] — DMA 可加速 I2C 批量数据传输
- [[uart]] — DMA 实现 UART 高效收发

## 相关实体

- [[qualcomm]] — SoC 中集成 DMA 控制器
- [[mediatek]] — 提供 DMA 支持的 SoC 平台
