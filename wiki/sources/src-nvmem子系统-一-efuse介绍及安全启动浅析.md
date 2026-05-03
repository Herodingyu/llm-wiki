---
doc_id: src-nvmem子系统-一-efuse介绍及安全启动浅析
title: 【NVMEM子系统】一、eFuse介绍及安全启动浅析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/【NVMEM子系统】一、Efuse介绍及安全启动浅析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, efuse, otp, secure-boot, nvmem, security]
---

## Summary

本文系统介绍了eFuse（电子保险丝）和OTP（一次性可编程存储器）的基本原理，以及它们在Secure Boot（安全启动）中的核心作用。eFuse和OTP都是一次性可编程存储器，但物理特性相反：eFuse默认全1，写入0后永久熔断；OTP默认0，击穿后变为1。文章详细对比了两者的成本、面积、安全性差异，并深入解析了Secure Boot的安全模型和CPU内部安全机制（BootROM、iRAM、eFuse、Security Engine、FSBL）。核心在于理解如何通过eFuse存储的根密钥建立从BootROM到OS的信任链，防止固件被篡改和非法刷机。

## Key Points

### 1. eFuse（电子保险丝）
- **原理**：类似电子保险丝，CPU出厂后全为1，写入0后永久烧死，不可恢复
- **用途**：记录OEM版本信息、运行模式、Secure Boot根密钥
- **特性**：一次性可编程，写入后不可逆

### 2. OTP（One Time Programmable）
- **原理**：反熔丝器件，未击穿时为0，击穿后为1
- **与eFuse对比**：

| 特性 | eFuse | OTP |
|------|-------|-----|
| **默认状态** | 1（导通） | 0（断开） |
| **成本** | 通常免费（Foundry提供） | 第三方IP，需付费 |
| **面积** | cell面积大，容量小 | cell面积小，容量大 |
| **安全性** | 可被电子显微镜读取 | 显微镜下无法区分编程位 |
| **功耗** | 较高 | 较低 |

### 3. Secure Boot 安全启动
- **目的**：防止消费者从软硬件层面对产品关键系统进行读写、调试，保护商业机密和知识产权
- **安全假设**：消费者即攻击者
- **防护对象**：刷机、绕过支付平台、复制数字产品、物理攻击（拆芯片、示波器监听）
- **安全上限**：攻击成本需在十万美元以上才认为安全

### 4. CPU内部安全机制

**BootROM：**
- CPU芯片内部ROM，出厂烧录，不可修改
- CPU上电后执行的第一条程序
- 初始化Secure Boot机制，加载Secure Boot Key
- 从存储介质加载并验证FSBL

**iRAM：**
- CPU内置小容量RAM（16KB-64KB）
- BootROM使用4KB作为堆栈
- FSBL直接加载到iRAM执行

**eFuse：**
- 存放根密钥：
  - **Secure Boot Key**：对称密钥（AES 128），每台设备随机生成
  - **Secure Boot Signing Key**：公钥（RSA/ECC），OEM生成，可存Hash节省空间

**Security Engine：**
- 专门负责加密解密的硬件模块
- 含多个密钥槽（Keyslots），支持DMA读写
- 功能：加密、解密、签名、HMAC、随机数生成

**FSBL（First Stage Bootloader）：**
- 初始化PCB板上其他硬件
- 给外部RAM映射内存空间
- 从外部存储加载、验证并执行后续启动程序

### 5. 根信任建立流程
1. CPU上电执行BootROM
2. 加载eFuse内容，判断是否生产模式
3. 生产模式下开启Secure Boot，加载Secure Boot Key到Security Engine
4. 从外部存储加载FSBL，验证数字签名和根证书Hash
5. 验证通过后执行FSBL

## Key Quotes

> "eFuse原理像电子保险丝一样，CPU出厂后全为1，写入0后彻底烧死，再也无法改变。"

> "安全启动的安全模型是建立在消费者是攻击者的假设之上。"

> "能成功攻破芯片安全机制的一次性投资成本至少需要在十万美元以上才可以认为是安全的。"

## Evidence

- Source: [原始文章](raw/tech/bsp/【NVMEM子系统】一、Efuse介绍及安全启动浅析.md) [[../../raw/tech/bsp/【NVMEM子系统】一、Efuse介绍及安全启动浅析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/【NVMEM子系统】一、Efuse介绍及安全启动浅析.md) [[../../raw/tech/bsp/【NVMEM子系统】一、Efuse介绍及安全启动浅析.md|原始文章]]
