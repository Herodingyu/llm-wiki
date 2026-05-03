---
doc_id: src-efuse-secure-boot
title: eFuse 与安全启动
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/【NVMEM子系统】一、Efuse介绍及安全启动浅析.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-03
tags: [bsp, efuse, secure-boot, otp, security]
---

## Summary

本文深入介绍了 eFuse（电子保险丝）和 OTP（一次性可编程存储器）的基本概念、物理特性及其在安全启动（Secure Boot）中的核心应用。eFuse 和 OTP 均属于一次性可编程器件，用于记录 OEM 版本信息、运行模式及安全启动密钥。文章详细对比了 eFuse 与 OTP 在成本、面积、容量、安全性等方面的差异，并系统阐述了安全启动的信任链建立过程：从 bootROM 加载 Secure Boot Key，到验证 FSBL 签名，最终跳转执行。安全启动的核心假设是将消费者视为潜在攻击者，通过硬件级保护确保商业机密和知识产权安全。

## Key Points

### 1. eFuse 特性
| 属性 | 说明 |
|------|------|
| 全称 | electronic fuse（电子保险丝） |
| 类型 | 一次性可编程存储器 |
| 出厂状态 | 所有比特为 1（导通） |
| 写入特性 | 写入 0 后不可恢复（烧死） |
| 主要用途 | 记录 OEM 版本信息、运行模式、安全启动密钥 |

### 2. OTP 特性
| 属性 | 说明 |
|------|------|
| 全称 | One Time Programmable |
| 类型 | 反熔丝器件 |
| 出厂状态 | 逻辑 0（未击穿/断开） |
| 写入特性 | 击穿后逻辑变为 1 |
| 特点 | 与 eFuse 物理状态和逻辑状态相反 |

### 3. eFuse vs OTP 对比
| 对比项 | eFuse | OTP |
|--------|-------|-----|
| 成本 | 低（Foundry 提供） | 高（第三方 IP） |
| 面积 | 大 | 小 |
| 容量 | 小 | 大 |
| 安全性 | 低（显微镜下可见） | 高（显微镜下不可区分） |
| 默认状态 | 导通（1） | 断开（0） |
| 功耗 | 较大 | 较小 |

### 4. 安全启动（Secure Boot）
- **目的**: 限制消费者能力，防止对关键系统读写、调试
- **假设**: 消费者是攻击者
- **常见攻击**: 刷机、绕过支付平台、复制数字产品
- **安全上限**: 攻击成本需十万美元以上

### 5. CPU 内部安全机制
| 组件 | 功能 |
|------|------|
| bootROM | 集成在 CPU 芯片中的 ROM，存放启动程序，不可修改 |
| iRAM | 内置小容量 RAM（16KB-64KB），用于 bootROM 堆栈和 FSBL 执行 |
| eFuse | 存储安全启动密钥、版本信息 |
| Security Engine | 负责加密解密，包含多个密钥槽（Keyslots） |

### 6. 安全启动信任链
```
上电 → bootROM 执行 → 加载 Secure Boot Key → 从存储介质加载 FSBL
→ 验证 FSBL 签名和根证书 Hash → 跳转执行 FSBL
```

## Evidence

- eFuse 编程位可通过电子显微镜看到
- OTP 在显微镜下无法区分编程位和未编程位
- bootROM 出厂烧录，不可修改

## Open Questions

- 安全启动的信任链完整实现
- eFuse 在芯片生命周期管理中的应用

## Key Quotes

> "一般 `OEM` 从 `CPU` 厂商购买芯片后，一般都要烧写 `eFuse` ，用于标识自己公司的版本信息，运行模式等相关信息。"

> "同时，由于其 **一次性编程** 的特性，我们又将其用在 `Secure Boot` 安全启动中。"

> "上面我们也了解过了， `efuse` 主要用于记录一些 `OEM` 的产品信息，并且也会用于安全启动，那么安全启动是什么，为什么要做安全启动？"

> "之所以成为 `eFuse` ，因为其原理像电子保险丝一样， `CPU` 出厂后，这片 `eFuse` 空间内所有比特全为1，如果向一位比特写入0，那么就彻底烧死这个比特了"

> "`OTP(One Time Programmable)` 是反熔丝的一种器件，就是说，当 `OTP` 存储单元未击穿时，它的逻辑状态为 `0` ；当击穿时，它的逻辑状态为 `1`"

## Related Pages

- [[secure-boot]]
- [[efuse]]
- [[otp]]
- [[bootrom]]
