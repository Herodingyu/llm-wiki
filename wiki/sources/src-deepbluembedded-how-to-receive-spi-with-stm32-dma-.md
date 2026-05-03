---
doc_id: src-deepbluembedded-how-to-receive-spi-with-stm32-dma-
title: How To Receive SPI Data With STM32 DMA / Interrupt / Polling Modes
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/deepbluembedded-how-to-receive-spi-with-stm32-dma-interr.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

## Summary

> 来源: deepbluembedded.com > 原URL: https://deepbluembedded.com/how-to-receive-spi-with-stm32-dma-interrupt/ > 收集时间: 2026-05-01

## Key Points

### 1. How To Receive SPI Data With STM32 DMA / Interrupt / Polling Modes
by Khaled Magdy Previous Tutorial Tutorial 42 Next Tutorial How To Receive SPI Data With STM32 (DMA-Interrupt-Polling) Modes

### 2. Required Components For LABs
All the example code/LABs/projects in the course are going to be done using those boards below. Nucleo32-L432KC (ARM Cortex-M4 @ 80MHz)   or (eBay)

### 3. STM32 SPI Master Data Transmission
After configuring the SPI peripheral in master mode whether in CubeMX or by register-accessing, we can start transmitting data to slave SPI devices. There are some different schemes in order to achiev

### 4. 1- SPI Transmitter With Polling
The first method for sending a data buffer over the SPI bus is by using the Polling method which is a blocking piece of code that waits for the current byte to be completely transmitted then it sends

### 5. 2- SPI Transmitter With Interrupt
Next, we can use the interrupt signal to free-up some of the CPU time. So it does start the data transmission process and goes to handle other logic parts of the firmware until the transmission comple

## Evidence

- Source: [原始文章](raw/tech/peripheral/deepbluembedded-how-to-receive-spi-with-stm32-dma-interr.md) [[../../raw/tech/peripheral/deepbluembedded-how-to-receive-spi-with-stm32-dma-interr.md|原始文章]]

## Key Quotes

> "来源: deepbluembedded.com"

> "收集时间: 2026-05-01"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/deepbluembedded-how-to-receive-spi-with-stm32-dma-interr.md) [[../../raw/tech/peripheral/deepbluembedded-how-to-receive-spi-with-stm32-dma-interr.md|原始文章]]
