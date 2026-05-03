---
doc_id: src-聊聊secure-storage
title: 聊聊Secure Storage~
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/聊聊Secure Storage~.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 3 人赞同了该文章 - [1\. 安全存储的定义与重要性](https://zhuanlan.zhihu.com/write)

## Key Points

### 1. 1\. 安全存储的定义与重要性
安全存储是指在硬件和软件层面上采取一系列措施，以防止未授权访问、数据泄露、篡改或破坏的一种存储技术。它包括了数据加密、访问控制、完整性校验等多种安全机制，旨在为数据提供一个安全的存储环境。安全存储的核心技术包括数据加密和认证授权管理技术，通过将文件变为乱码（加密）存储，并在使用时还原（解密），既保证了安全，又能够方便地使用数据。

### 2. 2\. SoC存储设备
系统级芯片（SoC）通常集成了多种存储设备，以满足不同的性能和安全需求。这些存储设备包括：

### 3. 1\. SoC中的存储设备
- **NVM（非易失性存储器）** ：如NOR Flash和NAND Flash，用于存储固件和配置数据。 - **[DRAM](https://zhida.zhihu.com/search?content_id=249117520&content_type=Article&match_order=1&q=DRAM&zhida_source=entity) （动态随机存取存储器）** ：用于临时

### 4. 2\. 存储设备的用途
- **NVM** ：存储固件和配置信息，这些信息在系统启动和运行时至关重要。 - **DRAM** ：作为系统的主内存，用于存储正在处理的数据和程序。 - **PSRAM** ：提供高速缓存，提高数据处理速度。

### 5. 3\. 存储设备的安全问题
- **NVM** ：可能面临固件篡改、密钥泄露等安全威胁。 - **DRAM** ：由于其易失性，容易在断电后丢失数据，且可能被未授权访问。 - **PSRAM** ：虽然速度快，但同样面临数据泄露和篡改的风险。

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/聊聊Secure Storage~.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/聊聊Secure Storage~.md|原始文章]]

## Key Quotes

> "数据加密和加扰机制

对于DRAM和PSRAM等易失性存储器，应提供数据加密或加扰机制，确保即使在物理访问的情况下，数据也无法被轻易读取或篡改。数据加扰不同于加密，更多地关注于数据在传输或存储过程中的可靠性和稳定性。加扰通常是可逆的，且加扰和解扰过程使用相同或者容易推导的算法"

> "通过这些措施，SoC的存储设备能够为数据提供一个更加安全的存储环境，从而保护用户的数据免受各种安全威胁。安全存储是数据安全的基石，随着技术的发展，我们有理由相信，未来的安全存储技术将更加成熟和可靠"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/聊聊Secure Storage~.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/聊聊Secure Storage~.md|原始文章]]
