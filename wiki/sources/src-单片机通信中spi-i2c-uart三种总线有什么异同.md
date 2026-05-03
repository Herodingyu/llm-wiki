---
doc_id: src-单片机通信中spi-i2c-uart三种总线有什么异同
title: 单片机通信中SPI、I2C、UART三种总线有什么异同
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/单片机通信中SPI、I2C、UART三种总线有什么异同.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

## Summary

[收录于 · 智能&节能汽车技术](https://www.zhihu.com/column/c_1596885984758706176) 546 人赞同了该文章 朋友们，如果对您有帮助，别光收藏，顺手点个赞呗！ヾ(≧∇≦谢谢≧∇≦)ノ

## Key Points

### 1. 发布12小时以后，收藏30+，点赞2，收藏点赞比达到了惊人的15，再创历史新高。
朋友们，如果对您有帮助，别光收藏，顺手点个赞呗！ヾ(≧∇≦谢谢≧∇≦)ノ ………………更新线………………

### 2. 基本概念
通信按基本分类可分为并行通信和串行通信。按照信号的传输方向可以分为单工通信、半双工通信、全双工通信。 ![](https://pica.zhimg.com/v2-876971418681badeffebe771c1a93b2c_1440w.jpg)

### 3. UART通信总线
**UART是一通用串行异步通信总线。该总线有两条数据线可以实现全双工的发送和接收，常用于单片机与单片机或外部辅助设备之间的通信。** UART发送数据时先发低位后发高位。当总线处于空闲状态时，线路保持高电平。以发送数据0x96为例，发送数据前会先发一个0，让总线从高电平变成低电平，提醒数据接收方做好准备，然后依次从低位到高位发送八位数据。传输完成后，会发一个1，让总线重新回到高电平。

### 4. I2C通信总线
I2C是一种两线式、串行、半双工同步通信总线，可以挂载多个参与通信的器件，常用于板内通讯，比如单片机与外围芯片之间短距离、低速的信号传输。 ![](https://pic4.zhimg.com/v2-171917b80eaa1917d86610880d15058f_1440w.jpg)

### 5. SPI通信总线
SPI串行外围设备接口对，是一种高速全双工同步通信总线。常用于单片机和EEPROM、FLASH、实时时钟、数字信号处理器等器件的通信。他主要是主从方式通信，通常只有一个主机和数个从机。 SPI总线有四根线。

## Evidence

- Source: [原始文章](raw/tech/peripheral/单片机通信中SPI、I2C、UART三种总线有什么异同.md) [[../../raw/tech/peripheral/单片机通信中SPI、I2C、UART三种总线有什么异同.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/单片机通信中SPI、I2C、UART三种总线有什么异同.md) [[../../raw/tech/peripheral/单片机通信中SPI、I2C、UART三种总线有什么异同.md|原始文章]]
