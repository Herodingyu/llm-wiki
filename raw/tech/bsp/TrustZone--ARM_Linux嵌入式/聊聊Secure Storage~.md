---
title: "聊聊Secure Storage~"
source: "https://zhuanlan.zhihu.com/p/939027754"
author:
  - "[[TrustZone​​​海思技术有限公司 员工]]"
published:
created: 2026-05-03
description: "1. 安全存储的定义与重要性2. SoC存储设备1. SoC中的存储设备2. 存储设备的用途3. 存储设备的安全问题 3. 解决措施1. NVM存储单元2. 防物理攻击的保护机制3. 片外保护机制4. 访问计数器和防回滚机制5. 数据加密和…"
tags:
  - "clippings"
---
[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770)

3 人赞同了该文章

- [1\. 安全存储的定义与重要性](https://zhuanlan.zhihu.com/write)
- [2\. SoC存储设备](https://zhuanlan.zhihu.com/write)
- [1\. SoC中的存储设备](https://zhuanlan.zhihu.com/write)
	- [2\. 存储设备的用途](https://zhuanlan.zhihu.com/write)
	- [3\. 存储设备的安全问题](https://zhuanlan.zhihu.com/write)
- [3\. 解决措施](https://zhuanlan.zhihu.com/write)
- [1\. NVM存储单元](https://zhuanlan.zhihu.com/write)
	- [2\. 防物理攻击的保护机制](https://zhuanlan.zhihu.com/write)
	- [3\. 片外保护机制](https://zhuanlan.zhihu.com/write)
	- [4\. 访问计数器和防回滚机制](https://zhuanlan.zhihu.com/write)
	- [5\. 数据加密和加扰机制](https://zhuanlan.zhihu.com/write)

在数字化时代，数据安全是企业和个人关注的焦点。安全存储作为保护数据的第一道防线，其重要性不言而喻。安全存储不仅仅是安全内存的子集，它涵盖了更广泛的存储设备和解决方案，以确保数据在存储、处理和传输过程中的安全性。

## 1\. 安全存储的定义与重要性

安全存储是指在硬件和软件层面上采取一系列措施，以防止未授权访问、数据泄露、篡改或破坏的一种存储技术。它包括了数据加密、访问控制、完整性校验等多种安全机制，旨在为数据提供一个安全的存储环境。安全存储的核心技术包括数据加密和认证授权管理技术，通过将文件变为乱码（加密）存储，并在使用时还原（解密），既保证了安全，又能够方便地使用数据。

## 2\. SoC存储设备

系统级芯片（SoC）通常集成了多种存储设备，以满足不同的性能和安全需求。这些存储设备包括：

### 1\. SoC中的存储设备

- **NVM（非易失性存储器）** ：如NOR Flash和NAND Flash，用于存储固件和配置数据。
- **[DRAM](https://zhida.zhihu.com/search?content_id=249117520&content_type=Article&match_order=1&q=DRAM&zhida_source=entity) （动态随机存取存储器）** ：用于临时存储正在处理的数据。
- **[PSRAM](https://zhida.zhihu.com/search?content_id=249117520&content_type=Article&match_order=1&q=PSRAM&zhida_source=entity) （伪静态随机存取存储器）** ：一种高速的非易失性存储器，用于缓存和临时存储。
- **[eMMC](https://zhida.zhihu.com/search?content_id=249117520&content_type=Article&match_order=1&q=eMMC&zhida_source=entity) （嵌入式多媒体卡）** ：一种集成了控制器的NAND Flash，用于大容量数据存储。

### 2\. 存储设备的用途

- **NVM** ：存储固件和配置信息，这些信息在系统启动和运行时至关重要。
- **DRAM** ：作为系统的主内存，用于存储正在处理的数据和程序。
- **PSRAM** ：提供高速缓存，提高数据处理速度。
- **eMMC** ：用于存储大量的多媒体数据和用户文件。

### 3\. 存储设备的安全问题

- **NVM** ：可能面临固件篡改、密钥泄露等安全威胁。
- **DRAM** ：由于其易失性，容易在断电后丢失数据，且可能被未授权访问。
- **PSRAM** ：虽然速度快，但同样面临数据泄露和篡改的风险。
- **eMMC** ：由于其大容量特性，更容易成为攻击者的目标，数据泄露的风险更高。

## 3\. 解决措施

为了应对这些安全问题，SoC设计者和开发者采取了一系列措施来增强存储设备的安全性。

### 1\. NVM存储单元

SoC应集成NVM存储单元，用于存储密钥和安全配置信息。这些存储单元应设计为只读或写入后不可更改，以防止未授权的修改。

### 2\. 防物理攻击的保护机制

存储密钥的一次性可编程（OTP）存储器应具备防物理攻击的保护机制，如使用防逆向的antifuse技术或将密钥加密后存储，以防止通过物理手段获取密钥。例如，NXP的某些芯片就具有物理攻击防护功能，能够抵御侵入式和半侵入式攻击。

### 3\. 片外保护机制

对于与外部设备对接的存储器，应实施片外保护机制，如使用加密通信协议，确保数据在传输过程中的安全性。例如，可以通过构建一个多协助enclave的分布式系统，向系统广播计数器值，通过分布式系统的同步协议来保证协助enclave计数器值安全。

### 4\. 访问计数器和防回滚机制

SoC应提供非易失性计数器（NV Counter）来记录对敏感数据的访问次数，结合防回滚机制，防止攻击者通过重置计数器来绕过安全检查。例如， [SGX counters](https://zhida.zhihu.com/search?content_id=249117520&content_type=Article&match_order=1&q=SGX+counters&zhida_source=entity) 通过引入可信的平台服务enclave（ [PSE](https://zhida.zhihu.com/search?content_id=249117520&content_type=Article&match_order=1&q=PSE&zhida_source=entity) ）来为本地的其他普通enclave程序提供计数器服务，然后将PSE的记录的不同enclave的计数器值将保存在本地非易失性存储器。

### 5\. 数据加密和加扰机制

对于DRAM和PSRAM等易失性存储器，应提供数据加密或加扰机制，确保即使在物理访问的情况下，数据也无法被轻易读取或篡改。数据加扰不同于加密，更多地关注于数据在传输或存储过程中的可靠性和稳定性。加扰通常是可逆的，且加扰和解扰过程使用相同或者容易推导的算法。

通过这些措施，SoC的存储设备能够为数据提供一个更加安全的存储环境，从而保护用户的数据免受各种安全威胁。安全存储是数据安全的基石，随着技术的发展，我们有理由相信，未来的安全存储技术将更加成熟和可靠。

发布于 2024-10-11 20:32・四川[大厂！RAG知识库问答系统架构搭建（0-1）](https://zhuanlan.zhihu.com/p/1985752467212895306)

[

本期给大家带来大厂rag知识库系统构建案例参考～ \[图片\] RAG 技术架构主要由索引（Indexing）、检索（Retrieval）和生成（Gene...

](https://zhuanlan.zhihu.com/p/1985752467212895306)