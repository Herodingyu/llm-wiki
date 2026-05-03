---
doc_id: src-arm-atf入门-安全固件软件介绍和代码运行
title: ARM ATF入门-安全固件软件介绍和代码运行
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/ARM ATF入门-安全固件软件介绍和代码运行.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, atf, arm, secure-boot, firmware]
---

## Summary

本文以ARM SOC硬件为例，系统介绍了OS之下、SOC硬件之上的固件软件体系，重点解析ARM Trusted Firmware（ATF）的架构和启动流程。文章从ARMv8异常等级（EL0-EL3）和Secure/Non-Secure双世界视角出发，详细阐述了ATF各组件（BL1、BL2、BL31、BL32、BL33）的职责、安全启动的信任链建立机制、以及ATF代码的下载编译运行方法。核心在于理解ATF作为EL3特权级安全固件，如何通过SMC指令为Non-Secure OS提供安全服务，并在Secure World和Normal World之间进行切换。

## Key Points

### 1. OS之下的软件层次
- **EL0**：APP应用（无特权）
- **EL1**：操作系统（Linux、FreeRTOS、TEE等）
- **EL2**：Hypervisor虚拟层
- **EL3**：Secure Monitor（ATF安全固件），最高特权级

### 2. ATF组件详解
| 组件 | 名称 | 功能 | 特点 |
|------|------|------|------|
| **BL1** | Boot ROM | 最先执行，验证BL2 | 写死在CPU内部，只读，不可替换 |
| **BL2** | Trusted Boot Firmware | 平台初始化（DDR等） | 一次性运行，Loader角色 |
| **BL31** | EL3 Runtime Firmware | 安全服务、世界切换 | 持续运行，通过SMC为OS服务 |
| **BL32** | Secure-EL1 Payload | Trusted OS（如OP-TEE） | 运行在安全世界EL1 |
| **BL33** | Non-Trusted Firmware | U-Boot/UEFI/Linux | 非安全世界启动 |

### 3. 安全启动信任链
- 启动顺序：BL1 → BL2 → BL31 → BL32 → BL33 → OS
- 每级镜像加载前进行签名校验（Hash + 公私钥）
- BL1作为根信任，写死在CPU内部，防止物理替换攻击
- 防止"越狱"：任何镜像被替换都会导致校验失败

### 4. ATF代码编译运行
- **代码下载**：`git clone https://github.com/ARM-software/arm-trusted-firmware.git`
- **编译命令**：`make CROSS_COMPILE=aarch64-linux-gnu- PLAT=qemu DEBUG=1 all`
- **输出产物**：bl1.bin、bl2.bin、bl31.bin

### 5. BL31的核心作用
- 通过SMC指令接收Non-Secure OS的请求
- 处理EL3级别的特权操作（关机、休眠等）
- 实现PSCI（Power State Coordination Interface）
- 在Secure World和Normal World之间进行上下文切换

## Key Quotes

> "ATF为Armv7-A 和 Armv8-A提供了一些安全可信固件。"

> "BL1需要只读，并且作为只读硬件直接搞进到CPU里面，你从板子上也拆不下来，更替换不了。"

> "BL31不像BL1和BL2是一次性运行的。它通过SMC指令为Non-Secure OS持续提供设计安全的服务。"

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/ARM ATF入门-安全固件软件介绍和代码运行.md) [[../../raw/tech/bsp/芯片底软及固件/ARM ATF入门-安全固件软件介绍和代码运行.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/ARM ATF入门-安全固件软件介绍和代码运行.md) [[../../raw/tech/bsp/芯片底软及固件/ARM ATF入门-安全固件软件介绍和代码运行.md|原始文章]]
