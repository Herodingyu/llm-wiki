---
doc_id: src-efuse-secure-boot
title: eFuse 与安全启动
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/【NVMEM子系统】一、Efuse介绍及安全启动浅析.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, efuse, secure-boot, otp, security]
---

## Summary

本文介绍了 eFuse（电子保险丝）和 OTP（一次性可编程存储器）的基本概念，以及它们在安全启动（Secure Boot）中的应用。eFuse 和 OTP 都是一次性可编程器件，用于记录 OEM 版本信息、运行模式等。安全启动的目的是限制消费者对产品的关键系统进行读写、调试，保护商业机密和知识产权。文章还介绍了 CPU 内部安全机制（bootROM、iRAM、eFuse）和安全启动的信任链。

## Key Points

### 1. eFuse
- **全称**: electronic fuse（电子保险丝）
- **特性**: 一次性可编程存储器
- **出厂状态**: 所有比特为 1
- **写入**: 写入 0 后不可恢复（烧死）
- **用途**: 记录 OEM 版本信息、运行模式、安全启动密钥

### 2. OTP
- **全称**: One Time Programmable
- **特性**: 反熔丝器件，一次性可编程
- **出厂状态**: 逻辑 0（未击穿）
- **写入**: 击穿后逻辑变为 1
- **与 eFuse 相反**: 物理状态和逻辑状态相反

### 3. eFuse vs OTP
| | eFuse | OTP |
|---|---|---|
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
- **bootROM**: 集成在 CPU 芯片中的 ROM，存放启动程序，不可修改
- **iRAM**: 内置小容量 RAM（16KB-64KB），用于 bootROM 堆栈和 FSBL 执行
- **eFuse**: 存储安全启动密钥、版本信息

### 6. 安全启动流程
```
上电 → bootROM 执行 → 加载 Secure Boot Key → 从存储介质加载 FSBL
→ 验证 FSBL 签名 → 跳转执行 FSBL
```

## Evidence

- eFuse 编程位可通过电子显微镜看到
- OTP 在显微镜下无法区分编程位和未编程位
- bootROM 出厂烧录，不可修改

## Open Questions

- 安全启动的信任链完整实现
- eFuse 在芯片生命周期管理中的应用

## Related Pages

- [[secure-boot]]
- [[efuse]]
- [[otp]]
- [[bootrom]]
