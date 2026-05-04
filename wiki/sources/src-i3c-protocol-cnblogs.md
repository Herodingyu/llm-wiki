---
doc_id: src-i3c-protocol-cnblogs
title: I3C协议详解
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/I3C-protocol-cnblogs.md
domain: tech/peripheral
created: 2026-05-04
updated: 2026-05-04
tags: [peripheral]
---

## Summary

> 来源: 博客园 (www.cnblogs.com/linhaostudy) > 原URL: https://www.cnblogs.com/linhaostudy/p/19625228 > 收集时间: 2026-05-01

## Key Points

### 1. 一、简述
I3C（Improved Inter Integrated Circuit）升级版的集成电路总线，同样两根总线：SDA和SCL。I3C接口致力于改善I2C的性能，并提供向后兼容，即兼容I2C。 名词解释：

### 2. 二、连接方式
SDR模式是I3C总线上的默认通讯模式，也是从Current Master向Slave传输私有消息的主要模式。I3C SDR模式与传统的I2C协议非常相似，因此I3C与许多I2C设备可以并存。 如何区分是I2C的数据包还是I3C的：

### 3. 三、通讯协议


### 4. 1、SDR动态分配地址
- I3C可以为所有的I3C从设备动态分配7-bit address - 在I3C从设备中会有两个standardized characteristics register和内部的48-bit临时ID去协助此过程

### 5. 2、主设备发送的地址
- 发送静态地址：持有该地址的I2C从设备响应 - 发送7位的0x7E：此地址为广播地址，所有I3C从设备都会响应，所有I2C从设备都不会响应 - 发送动态地址：持有该地址的I3C从设备响应 I3C Slave设备不需知道自身处在I2C总线上或是I3C总线上。如果其自身有一个I2C静态地址，那么它可以一直使用这个地址，直到被赋予一个动态地址。一旦被赋予了动态地址，它就必须作为一个I3C Slave

## Evidence

- Source: [原始文章](raw/tech/peripheral/I3C-protocol-cnblogs.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/I3C-protocol-cnblogs.md)
