---
doc_id: src-atf启动-一-整体启动流程
title: ATF启动（一）：整体启动流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/ATF启动（一）：整体启动流程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

1 人赞同了该文章 大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

## Key Points

### 1. 前言
关于ATF启动这里先整个宏观的概念。 这个blog讲的很好，就不重复写了，自己写还写不到这么清晰，图页很漂亮。 原文链接： [cnblogs.com/arnoldlu/p/](https://link.zhihu.com/?target=https%3A//www.cnblogs.com/arnoldlu/p/14175126.html)

### 2. 启动正文
下图划分成不同EL，分别描述 [BL1](https://zhida.zhihu.com/search?content_id=232739465&content_type=Article&match_order=1&q=BL1&zhida_source=entity) 、 [BL2](https://zhida.zhihu.com/search?content_id=232739465&conte

### 3. 1\. 冷启动(Cold boot)流程及阶段划分
restart--冷启动 reset--热启动 ATF冷启动实现分为5个步骤： - BL1 - AP Trusted ROM，一般为BootRom。 - BL2 - Trusted Boot Firmware，一般为Trusted Bootloader。

### 4. 1.1 BL1
BL1位于ROM中，在EL3下从reset vector处开始运行。（bootrom就是芯片上电运行的（chip-rom的作用就是跳转到bootrom）） BL1做的工作主要有： - 决定启动路径：冷启动还是热启动。

### 5. 1.2 BL2
BL2位于SRAM中，运行在Secure EL1主要工作有： - 架构初始化：EL1/EL0使能浮点单元和ASMID。 - 平台初始化：控制台初始化、相关存储设备初始化、MMU、相关设备安全配置、 - SCP\_BL2：系统控制核镜像加载，单独核处理系统功耗、时钟、复位等控制。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/ATF启动（一）：整体启动流程.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/ATF启动（一）：整体启动流程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/ATF启动（一）：整体启动流程.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/ATF启动（一）：整体启动流程.md|原始文章]]
