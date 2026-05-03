---
doc_id: src-kinibi-tee-的可信环境及相关漏洞与利用方法
title: KINIBI TEE 的可信环境及相关漏洞与利用方法
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/KINIBI TEE 的可信环境及相关漏洞与利用方法.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, tee, kinibi, security, trustzone, exploitation]
---

## Summary

本文深入分析了Trustonic的Kinibi TEE（可信执行环境）实现及其安全漏洞利用方法。Kinibi主要用于联发科（Mediatek）和三星Exynos SoC，由微内核（MTK）、运行时管理器（RTM）、驱动程序和McLib库组成。文章详细解析了Kinibi的架构组件、可信应用（TA）的MCLF二进制格式、内存布局，以及三星Galaxy S8+中SEM TA的缓冲区溢出漏洞利用过程。核心在于理解TEE系统的安全边界、TA与REE的通信机制（SMC/共享内存），以及由于缺乏ASLR/PIE等安全强化措施导致的漏洞利用可行性。

## Key Points

### 1. TEE与TrustZone概述
- **TEE**：可信执行环境，运行在安全状态的EL1，用于硬件密码/密钥、DRM、移动支付、生物识别等
- **REE**：Rich Execution Environment，如Android/Linux，运行在Non-Secure世界
- **通信方式**：REE通过SMC（Secure Monitor Call）特权指令与TEE通信
- **内存隔离**：TrustZone使用NS（Non-Secure）标志标记内存，正常区域代码只能访问NS内存

### 2. 移动端主要TEE实现
| 实现 | 厂商/平台 | 特点 |
|------|-----------|------|
| **QSEE/QTEE** | 高通SoC | 高通自有实现 |
| **TrustedCore** | 华为 | 华为自有实现 |
| **Kinibi** | Trustonic/Mediatek/Exynos | 本文分析对象 |
| **OP-TEE** | 开源 | 可在QEMU和开发板运行 |

### 3. Kinibi架构组件
- **微内核（MTK）**：运行在安全EL1，提供系统调用，强制任务隔离，执行抢占式调度
- **运行时管理器（RTM）**：管理REE客户端与TA之间的会话，负责TA的签名验证和加载
- **驱动程序**：运行在安全EL0，可访问更多系统功能（映射其他任务内存、物理内存、执行SMC）
- **McLib**：应用程序/驱动程序使用的库
- **运行模式**：仅Aarch32模式

### 4. 可信应用（TA）分析
- **存储位置**：三星手机上位于`/vendor/app/mcRegistry/`和`/system/app/mcRegistry/`
- **文件格式**：MCLF（Mobicore Load Format），开源头文件定义
- **内存布局**：
  - mcLib映射到固定地址（Galaxy S8/S9为0x07d00000）
  - 共享缓冲区（tci）映射到0x00100000或0x00300000
  - 新共享内存映射在0x00200000 + map_id*0x00100000
- **TA执行流程**：初始化 → 检查共享缓冲区大小 → 主循环 → `tlApiWaitNotification`等待消息 → 处理 → `tlApiNotify`通知REE

### 5. 漏洞利用案例
- **漏洞类型**：SEM TA中0x1B命令处理程序的基于堆栈的缓冲区溢出
- **影响设备**：三星Galaxy S8+（G955FXXU2CRED/G955FXXU3CRGH）
- **根本原因**：缺乏ASLR/PIE等安全强化措施
- **修复措施**：修补缓冲区溢出漏洞，启用堆栈cookie

## Key Quotes

> "TEE操作系统比传统的终端应用运行环境(REE)简单得多，对逆向工程来说也是一件有趣的事情。"

> "即使TEE系统专门用于安全操作，操作系统也没有ASLR/PIE那样的安全强化，这使得利用可信应用中的漏洞变得非常容易。"

> "可信应用和驱动程序都是签名的二进制文件，但没有加密，可以很容易地进行分析。"

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/KINIBI TEE 的可信环境及相关漏洞与利用方法.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/KINIBI TEE 的可信环境及相关漏洞与利用方法.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/KINIBI TEE 的可信环境及相关漏洞与利用方法.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/KINIBI TEE 的可信环境及相关漏洞与利用方法.md|原始文章]]
