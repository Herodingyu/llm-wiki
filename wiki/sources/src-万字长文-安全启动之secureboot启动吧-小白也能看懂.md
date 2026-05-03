---
doc_id: src-万字长文-安全启动之secureboot启动吧-小白也能看懂
title: 万字长文：安全启动之SecureBoot启动吧（小白也能看懂！）
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/万字长文：安全启动之SecureBoot启动吧（小白也能看懂！）.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

68 人赞同了该文章 大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号： [TrustZone](https://zhida.zhihu.com/search?content_id=232681591&content_type=Article&match_order=1&q=TrustZone&zhida_source=entity) | CSDN：Hkcoco

## Key Points

### 1. SecureBoot（安全启动）启动吧
大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号： [TrustZone](https://zhida.zhihu.com/search?content_id=232681591&content_type=Article&match_order=1&q=TrustZone&zhida_source=entity) | CSDN：Hkcoco

### 2. 前言
既然是小白也能看懂，那么在开篇之前我先解释两个概念，相关从业者可以跳过这两点： - 什么是ATF？ [ARM Trusted Firmware](https://zhida.zhihu.com/search?content_id=232681591&content_type=Article&match_order=1&q=ARM+Trusted+Firmware&zhida_source=enti

### 3. 1\. 冷启动(Cold boot)流程及阶段划分
restart--冷启动 reset--热启动 ATF冷启动实现分为5个步骤： - [BL1](https://zhida.zhihu.com/search?content_id=232681591&content_type=Article&match_order=1&q=BL1&zhida_source=entity) - AP Trusted ROM，一般为BootRom。

### 4. 1.1 BL1
BL1位于ROM中，在EL3下从reset vector处开始运行。（bootrom就是芯片上电运行的（chip-rom的作用就是跳转到bootrom）） BL1做的工作主要有： - 决定启动路径：冷启动还是热启动。

### 5. 1.2 BL2
BL2位于SRAM中，运行在Secure EL1主要工作有： - 架构初始化：EL1/EL0使能浮点单元和ASMID。 - 平台初始化：控制台初始化、相关存储设备初始化、MMU、相关设备安全配置、 - SCP\_BL2：系统控制核镜像加载，单独核处理系统功耗、时钟、复位等控制。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/万字长文：安全启动之SecureBoot启动吧（小白也能看懂！）.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/万字长文：安全启动之SecureBoot启动吧（小白也能看懂！）.md|原始文章]]

## Key Quotes

> "安全引导（Secure Boot）功能是指在系统的整个启动过程中"

> "Bootloader、Linux内核、TEE OS的启动都由ATF来加载和引导"

> "于保证系统的完整性，防止系统中重要镜像文件被破坏或替换"

> "加入安全引导功能中可阻止黑客通过替换TEE镜像文件的方式来窃取被TEE保护的重要资料"

> "当用户非法刷入其他厂商的ROM后手机无法正常启动"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/万字长文：安全启动之SecureBoot启动吧（小白也能看懂！）.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/万字长文：安全启动之SecureBoot启动吧（小白也能看懂！）.md|原始文章]]
