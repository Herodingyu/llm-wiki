---
doc_id: src-uefi代码是由谁加载的-老狼-的回答
title: UEFI代码是由谁加载的？   老狼 的回答
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/UEFI代码是由谁加载的？ - 老狼 的回答.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文解答了UEFI代码加载来源的问题，并系统梳理了从CPU上电到操作系统启动的完整流程。简单情况下UEFI由主板BIOS固件加载，但Intel Boot Guard的引入使流程更复杂。文章详细描述了CPU从固定地址（Intel为FFxxxxxx，ARM多为0地址）取指令、初始化硬件、UEFI读取硬盘EFI分区、加载OS引导程序（如Linux的GRUB）、最终启动操作系统的全过程。同时澄清了UEFI执行环境（固件）与UEFI应用（磁盘上的efi文件）的区别。

## Key Points

### 1. UEFI 加载来源
- **简单答案**：UEFI由主板BIOS固件加载
- **复杂因素**：Intel Boot Guard引入额外安全验证层
- **区分概念**：
  - UEFI执行环境 = 固化在主板上的固件
  - UEFI应用 = 磁盘EFI分区上的efi文件（OS Loader）

### 2. 系统启动流程
1. **CPU上电**：从固定地址取第一条指令（初始化汇编代码，无需堆栈）
2. **硬件初始化**：初始化内存、USB、显卡、硬盘等
3. **UEFI固件**：将cache作为临时堆栈，程序搬运到内存
4. **读取EFI分区**：UEFI支持文件系统级访问，不关心具体扇区
5. **加载引导程序**：启动EFI分区中的OS引导程序（Linux: GRUB）
6. **启动操作系统**：引导程序加载内核，OS接管硬件

### 3. UEFI 相比传统BIOS的优势
- **文件系统支持**：直接读取文件，不受MBR 512字节限制
- **灵活性**：引导程序可放在任意分区
- **兼容性**：支持更大硬盘、更快启动、安全启动

### 4. ARM vs x86 启动差异
| 特性 | x86 (Intel) | ARM |
|------|-------------|-----|
| 启动地址 | FFxxxxxx | 0地址 |
| 固件 | UEFI/BIOS | U-Boot |
| 分区表 | GPT/MBR | 设备树 |

## Key Quotes

> "UEFI是个统称，按照问题来看，可以划分为UEFI执行环境，和在磁盘上的作为OS Loader的UEFI App。"

> "App由UEFI环境来加载，UEFI环境就是所谓的BIOS，通常固化在主板上。"

> "简单说磁盘上你看到的efi文件仅仅是整个uefi引导的最后阶段。在这之前固化在主板上的uefi固件已经跑很多东西了。"

## Evidence

- Source: [原始文章](raw/tech/bsp/UEFI代码是由谁加载的？ - 老狼 的回答.md) [[../../raw/tech/bsp/UEFI代码是由谁加载的？ - 老狼 的回答.md|原始文章]]

## Open Questions

- Intel Boot Guard的具体验证流程和密钥管理
- ARM服务器平台UEFI固件的标准化现状

## Related Links

- [原始文章](raw/tech/bsp/UEFI代码是由谁加载的？ - 老狼 的回答.md) [[../../raw/tech/bsp/UEFI代码是由谁加载的？ - 老狼 的回答.md|原始文章]]
