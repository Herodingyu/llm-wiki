---
doc_id: efuse
title: eFuse 与 OTP
page_type: concept
related_sources:
  - src-efuse-secure-boot
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, bsp, security]
---

# eFuse 与 OTP

## 定义

**eFuse（electronic fuse）**：电子保险丝，一次性可编程存储器。出厂时全为 1，写入 0 后不可恢复。

**OTP（One Time Programmable）**：反熔丝器件，一次性可编程存储器。出厂时为 0（未击穿），击穿后为 1。

## 对比

| | eFuse | OTP |
|---|---|---|
| **物理状态** | 默认导通（1） | 默认断开（0） |
| **编程后** | 烧断为 0 | 击穿为 1 |
| **成本** | 低（Foundry 提供） | 高（第三方 IP） |
| **面积** | 大 | 小 |
| **容量** | 小 | 大 |
| **安全性** | 低（显微镜下可见） | 高（显微镜下不可区分） |
| **功耗** | 较大 | 较小 |

## 应用场景

### eFuse
- 记录 OEM 版本信息
- 标识运行模式
- 存储安全启动密钥
- 芯片修复（冗余替换）

### OTP
- 高安全性密钥存储
- 大容量一次性数据
- 对安全要求极高的场景

## 安全启动中的应用

1. **密钥存储**：Secure Boot Key 存储在 eFuse/OTP 中
2. **版本控制**：防止降级攻击
3. **设备标识**：唯一设备 ID

## 相关来源

- [[src-efuse-secure-boot]] — eFuse 与安全启动
