---
doc_id: src-soc-1-浅谈外设子系统
title: SoC（1）：浅谈外设子系统
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/SoC（1）浅谈外设子系统.md
domain: tech/soc-pm
created: 2026-05-09
updated: 2026-05-09
tags: [soc-pm]
---

## Summary

!\[cover\_image\](https://mmbiz.qpic.cn/sz\_mmbiz\_jpg/g68z8egLoSqAHXxFp3SHGsjbrN37VG9ahRP2YU7U3UFNlviasvTpDdKUeteLrYQ0SY7ooDOWaUJc1 NhQwyVaWRWmkmHrePWiabvWomcXn09LA/0?wx\_fmt=jpeg) Original  alltowine  alltowine  [芯片系统成长记](javascript:void\(0\);) *2026年5月6日 17:40* * 湖北 * 在小说阅读器读本章

## Key Points

### 1. 一、SoC 为什么需要外设？
我们先不从 UART、SPI 这些名词开始，而从一个最基本的问题开始： 一个芯片要完成任务，最少需要什么？ 答案大概是三类能力： 第一，  计算能力  。比如 CPU、DSP、NPU 负责处理数据。 第二，  存储能力  。比如 SRAM、Flash、DDR 负责保存代码、数据和状态。

### 2. 二、外部世界很慢，但系统内部很快
理解外设设计，先要理解一个矛盾： SoC 内部追求高带宽、低延迟、高并发；而外部设备往往低速、异步、不确定。 CPU 可能运行在 GHz 级别，片上总线可能是几十位、上百位宽，DDR 传输带宽也很高。但一个 I2C 传感器可能只有几百 kHz，一个 UART 串口可能只是几 Mbps，一个机械按键甚至以“毫秒”为单位变化。这就带来几个问题：

### 3. 三、外设子系统通常包含什么？
从系统设计角度看，一个外设子系统通常包含四类东西：

### 4. 1\. 外设控制器
这是真正实现协议和功能的模块，例如 UART 控制器、SPI 控制器、I2C 控制器、USB 控制器、Ethernet MAC、SD/MMC 控制器、GPIO 控制器、Timer、PWM 等。它们负责把软件的配置转换成真实的引脚波形或数据传输行为。比如 SPI 控制器会根据寄存器配置决定：

### 5. 2\. 寄存器接口
CPU 通常不是直接“操作外设电路”，而是通过读写寄存器来控制外设。 比如软件想通过 UART 发送一个字节，本质上可能只是： 把波特率写入配置寄存器； 把数据写入发送数据寄存器； 等待状态寄存器显示发送完成；

## Evidence

- Source: [原始文章](raw/tech/soc-pm/SoC（1）浅谈外设子系统.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/SoC（1）浅谈外设子系统.md)
