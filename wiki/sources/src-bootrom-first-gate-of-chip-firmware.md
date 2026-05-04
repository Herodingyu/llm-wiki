---
doc_id: src-bootrom-first-gate-of-chip-firmware
title: BootROM：芯片固件的第一道城门
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/bootrom-first-gate-of-chip-firmware.md
domain: tech/bsp
created: 2026-05-04
updated: 2026-05-04
tags: [bsp]
---

## Summary

> 来源：微信公众号「OneChan」 > 原文链接：https://mp.weixin.qq.com/s/oHcD8ugZnJ5cnKtTcn7aoA > 记录时间：2026-05-04

## Key Points

### 1. 核心观点
BootROM 不是一段简单的启动代码，而是**数字乌托邦的城门**，是芯片全生命周期的**信任根（Root of Trust, RoT）**。它被永久固化在掩膜 ROM 里，永远不会被篡改、被覆盖、被跑飞。

### 2. BootROM 的四层安全承诺


### 3. 第一层：保证系统永远有可恢复的"安全退路"
- 内置不可关闭的下载通道（UART/USB/SPI/I2C） - 无论用户固件损坏到什么程度，按住 BOOT 引脚重新上电即可进入下载模式 - **反面案例**：某 IoT 芯片的 BootROM 把下载通道做成了可被用户固件永久关闭的功能，OTA 升级失败后全部变成砖头，损失上亿

### 4. 第二层：保证系统启动的信任链，杜绝恶意代码入侵
- BootROM 是**根信任锚（Root of Trust）** - 用 OTP 区域里的根公钥验证用户固件的数字签名 - **反面案例**：某车规域控制器的 BootROM 只验证镜像头部，攻击者修改几个字节即可绕过签名验证，导致几十万辆汽车召回，整改成本超 10 亿

### 5. 第三层：保证系统启动的硬件环境是确定的、可靠的
- 初始化系统时钟（RC → PLL） - 初始化片内 SRAM、总线矩阵、Flash 控制器、电源管理单元 - **反面案例**：某 Cortex-M4 MCU 的 PLL 初始化代码没有考虑低温下 RC 时钟的频偏，-40℃ 下 PLL 锁定失败导致 HardFault

## Evidence

- Source: [原始文章](raw/tech/bsp/bootrom-first-gate-of-chip-firmware.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/bootrom-first-gate-of-chip-firmware.md)
