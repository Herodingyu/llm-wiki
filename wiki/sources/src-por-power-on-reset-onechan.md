---
doc_id: src-por-power-on-reset-onechan
title: POR 上电复位：数字世界的物理定律执行器
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/por-power-on-reset-onechan.md
domain: tech/soc-pm
created: 2026-05-09
updated: 2026-05-09
tags: [soc-pm]
---

## Summary

> 来源：微信公众号「OneChan」 > 原文链接：https://mp.weixin.qq.com/s/SALMTEy4q03o5icgEcIzuQ > 记录时间：2026-05-04

## Key Points

### 1. 核心观点
POR（Power-On Reset）不是一个简单的电源开关，而是**数字世界的"物理定律执行器"**。如果没有 POR，你的手机有 1% 的概率在上电的时候直接烧毁；你的汽车有万分之一的概率在启动的时候刹车失灵。

### 2. POR 的四层安全承诺


### 3. 第一层：保证系统不会被物理规律摧毁
防止闩锁效应（Latch-up）。CMOS 芯片内部存在寄生的 PNP 和 NPN 晶体管，形成可控硅结构。电源升降过程中若有大电流流过，会触发闩锁效应，导致电源和地之间形成低阻通路，几秒钟内烧毁芯片。

### 4. 第二层：保证系统不会进入不可恢复的锁死状态
数字电路有多种锁死状态：总线死锁、状态机死锁、时钟死锁（PLL 未锁定）。POR 强制所有状态机、总线、寄存器回到已知初始状态。 **案例**：某款 MCU 有万分之一的概率上电时 SPI 总线死锁，因为 SPI 控制器状态机有一个未定义状态。上电时寄存器随机到了这个状态，SPI 总线就会永远死锁。

### 5. 第三层：保证系统的初始状态是确定的
POR 只会复位有复位端的触发器。对于没有复位端的触发器或 SRAM，POR 释放后值完全随机。但合格的 POR 会保证所有对系统安全有影响的寄存器被强制设置到确定初始状态。 **安全漏洞案例**：某 IoT 芯片的加密引擎上电时密钥寄存器是随机值。系统在初始化密钥之前就收到加密请求，会用随机密钥加密数据。攻击者可通过发送大量加密请求获取随机数生成器状态，进而破解整个加密系统。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/por-power-on-reset-onechan.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/por-power-on-reset-onechan.md)
