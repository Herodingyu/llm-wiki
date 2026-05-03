---
doc_id: src-tee中的scmi服务与scp固件
title: TEE中的SCMI服务与SCP固件
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE中的SCMI服务与SCP固件.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

3 人赞同了该文章 大家好！我是不知名的安全工程师Hkcoco！ 欢迎大家关注我的微信公众号：TrustZone | CSDN：Hkcoco

## Key Points

### 1. 什么是SCMI
SCMI（System Control and Management Interface）是一种标准化的系统控制和管理接口，旨在提高跨平台设备管理的效率和可移植性。SCMI通过定义一组命令、消息和数据结构，为操作系统、虚拟机、固件和硬件提供一个通用的通信接口。

### 2. SCMI server in TEE
SCMI server in TEE的作用是提供系统管理接口（System Management Interface，简称SMI），用于管理硬件组件和系统操作。它允许安全操作系统与硬件进行交互，执行各种管理任务，例如电源管理、性能优化、时钟控制、传感器数据采集等。

### 3. SCMI服务在哪里运行？
![](https://picx.zhimg.com/v2-fed7eb8abb1e5625092dc40629f9d487_1440w.jpg)

### 4. SCMI server in OP-TEE
- ● 传输层 - ○ OP-TEE共享内存 - ○ OP-TEE调用命令 - ● 支持每个通道多条消息 - ○ 目前最多有8封待处理邮件 - ○ 消息按顺序处理 - ● 支持多个通道 - ○ 每个传输通道一个OP-TEE会话

### 5. SCMI的学习资料
SCMI的学习资料包括协议版本、接口初始化、命令和消息、响应或通知、传输协议和SCMI应用案例，下面详细展开说说。 - SCMI协议版本和功能集：SCMI协议版本和功能集是SCMI学习资料的重要组成部分，每个版本都有不同的命令、消息和数据结构，并支持不同的设备功能。因此，要了解SCMI协议版本和功能集，并根据设备的需求选择合适的版本和功能集。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE中的SCMI服务与SCP固件.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE中的SCMI服务与SCP固件.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE中的SCMI服务与SCP固件.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/TEE中的SCMI服务与SCP固件.md|原始文章]]
