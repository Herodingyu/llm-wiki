---
doc_id: src-一文聊聊linux-kernel的加密子系统-crypto-subsystem
title: 一文聊聊Linux Kernel的加密子系统【Crypto Subsystem】
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文聊聊Linux Kernel的加密子系统【Crypto Subsystem】.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文深入解析了Linux Kernel Crypto Subsystem的架构与工作流程。Linux密码学算法分为user space（OpenSSL、wolfSSL、GnuTLS等）和kernel space两层，kernel space又分软件运算（CPU执行，crypto subsystem目录）和硬件加速（SoC crypto engine、TPM、Intel AES-NI等，drivers/crypto目录）。文章详细描述了crypto request从应用层经system call到kernel crypto subsystem，再通过算法抽象层转发到硬件算法引擎的完整流程，并对比了cryptodev（ioctl接口）和AF_ALG（netlink接口，推荐）两种user space访问方式。

## Key Points

### 1. 双层架构
| 层级 | 实现方式 | 代表组件 |
|------|----------|----------|
| **User space** | 密码学函式库 | OpenSSL、wolfSSL、GnuTLS |
| **Kernel space - 软件** | CPU运算 | crypto subsystem |
| **Kernel space - 硬件** | 硬件加速 | SoC crypto engine、TPM、Intel AES-NI |

### 2. Kernel Space 密码学实现
- **软件运算**：由CPU执行，无需额外硬件，但耗费CPU性能
- **硬件加速**：由专用硬件辅助运算（offloading），不耗费CPU性能
  - SoC Component：ARM SoC厂商集成的硬件加解密元件，位于drivers/crypto
  - TPM：高安全性硬件安全芯片，保护密钥与密码运算
  - Intel AES-NI：CPU指令级加速

### 3. User Space 接口对比
| 接口 | 类型 | 特点 |
|------|------|------|
| **CRYPTODEV** | ioctl | 需额外下载编译kernel module，OpenSSL早期支持 |
| **AF_ALG** | netlink | Linux 2.6.38+内置，OpenSSL 1.1.0+支持，**推荐** |

### 4. Crypto Subsystem 核心设计
- **算法抽象层**：允许厂商依据需求客制化硬件引擎实现
- **硬件引擎集成**：芯片厂商通过crypto subsystem将硬件算法引擎整合进Linux系统
- **流程**：应用层crypto request → system call → kernel crypto subsystem → 硬件算法引擎

### 5. OpenSSL 引擎配置
- Debian默认关闭AF_ALG和cryptodev选项
- 需下载源码，修改debian/rules，重新编译开启
- 开启后可透过engine存取kernel space密码学算法

## Key Quotes

> "Crypto subsystem是Linux系统中负责处理crypto request的子系统，除了包含流程控制机制之外，另一个重要特色就是提供算法实作的抽象层，让各家厂商能够依据需求去客制化实作方式。"

> "在硬件构架中加入用以加速特定算法运算效率的硬件算法引擎，并且透过crypto subsystem将驱动硬件算法引擎的流程整合进Linux系统中。"

> "个人认为新开发的程序可以考虑使用AF_ALG。毕竟AF_ALG在mainline Kernel中——稳定性，兼容性以及维护性都会比较好。"

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文聊聊Linux Kernel的加密子系统【Crypto Subsystem】.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文聊聊Linux Kernel的加密子系统【Crypto Subsystem】.md|原始文章]]

## Open Questions

- 硬件加密引擎与软件加密的性能对比评估方法
- 不同SoC厂商crypto engine的兼容性和标准化现状

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文聊聊Linux Kernel的加密子系统【Crypto Subsystem】.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/一文聊聊Linux Kernel的加密子系统【Crypto Subsystem】.md|原始文章]]
