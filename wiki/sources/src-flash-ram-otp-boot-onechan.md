---
doc_id: src-flash-ram-otp-boot-onechan
title: Flash / RAM / OTP 启动方式的本质差异
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/flash-ram-otp-boot-onechan.md
domain: tech/soc-pm
created: 2026-05-04
updated: 2026-05-04
tags: [soc-pm]
---

## Summary

> 来源：微信公众号「OneChan」 > 原文链接：https://mp.weixin.qq.com/s/G_HTfFkQ99vp9SoOqRT_Qg > 记录时间：2026-05-04

## Key Points

### 1. 核心观点
三种启动方式的本质差异不是"从哪里启动"，而是： 1. **PC 指针最初指向哪里** 2. **这个地址背后的存储器有什么特性** CPU 根本不关心指令来自哪里，它只知道从 PC 指向的地址取指令。

### 2. Flash 启动


### 3. 本质
系统复位后，PC 直接指向 Flash 地址空间，CPU 从 Flash 中取指执行。

### 4. 两种完全不同的 Flash 启动模式
只有 **NOR Flash** 和部分高速 SPI Flash 支持。 - Flash 直接映射到 CPU 地址空间 - CPU 像访问 RAM 一样直接从 Flash 读取指令 - 代码不需要复制到 RAM

### 5. 核心特性
- 非易失性、可重复擦写、容量大、成本低 - 适用场景：绝大多数消费电子、工业控制、汽车电子

## Evidence

- Source: [原始文章](raw/tech/soc-pm/flash-ram-otp-boot-onechan.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/flash-ram-otp-boot-onechan.md)
