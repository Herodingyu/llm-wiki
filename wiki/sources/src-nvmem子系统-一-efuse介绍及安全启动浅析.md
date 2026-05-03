---
doc_id: src-nvmem子系统-一-efuse介绍及安全启动浅析
title: 【NVMEM子系统】一、Efuse介绍及安全启动浅析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/【NVMEM子系统】一、Efuse介绍及安全启动浅析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

不坠青云之志 等 55 人赞同了该文章 目录 `eFuse(electronic fuse)` ：电子保险丝，熔丝性的一种器件，属于 **一次性可编程存储器** 。

## Key Points

### 1. 1、Efuse是什么
`eFuse(electronic fuse)` ：电子保险丝，熔丝性的一种器件，属于 **一次性可编程存储器** 。 之所以成为 `eFuse` ，因为其原理像电子保险丝一样， `CPU` 出厂后，这片 `eFuse` 空间内所有比特全为1，如果向一位比特写入0，那么就彻底烧死这个比特了，再也无法改变它的值，也就是再也回不去 1 了。

### 2. 2、OTP是什么
> 了解完 `eFuse` 后，我们就顺便了解一下 `OTP` `OTP(One Time Programmable)` 是反熔丝的一种器件，就是说，当 `OTP` 存储单元未击穿时，它的逻辑状态为 `0` ；当击穿时，它的逻辑状态为 `1` ，也属于 **一次性可编程存储器** 。

### 3. 3、什么是Secure Boot
> 上面我们也了解过了， `efuse` 主要用于记录一些 `OEM` 的产品信息，并且也会用于安全启动，那么安全启动是什么，为什么要做安全启动？ 安全启动 `Secure Boot` ，其主要目的是： **以限制消费者能力，防止消费者从软硬件层面，对产品的部分关键系统进行读写，调试等高级权限，达到对产品的商业保密，知识产权的保护。**

### 4. 4、CPU内部安全机制
![](https://pic4.zhimg.com/v2-d34291945629ea974d0254936616e541_1440w.jpg)

### 5. 4.1 bootROM
`BootROM` 是集成在 `CPU` 芯片的一个 `ROM` 空间，其主要用于存放一小段可执行程序，出厂的时候被烧录进去写死，不可修改。 `CPU` 在通电之后，执行的第一条程序就在 `BootROM` ，用于初始化 `Secure Boot` 安全机制，加载 `Secure Boot Key` 密钥，从 存储介质中加载并验证 **First Stage Bootloader（FSBL）**

## Evidence

- Source: [原始文章](raw/tech/bsp/【NVMEM子系统】一、Efuse介绍及安全启动浅析.md) [[../../raw/tech/bsp/【NVMEM子系统】一、Efuse介绍及安全启动浅析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/【NVMEM子系统】一、Efuse介绍及安全启动浅析.md) [[../../raw/tech/bsp/【NVMEM子系统】一、Efuse介绍及安全启动浅析.md|原始文章]]
