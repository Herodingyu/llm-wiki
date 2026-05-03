---
doc_id: src-hack-uboot
title: Hack U-Boot
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Hack Uboot.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, uboot, security, embedded, uart]
---

## Summary

本文从硬件安全评估角度分析了U-Boot引导加载程序的攻击面。U-Boot作为嵌入式设备中最流行的bootloader，支持多种处理器架构（PowerPC、ARM、MIPS）和丰富的功能（网络、USB、文件系统等）。文章详细阐述了通过暴露的U-Boot Shell进行攻击的方法：利用UART接口获取Shell访问权限，通过内存读写操作转储/修改固件，以及利用网络功能（TFTP等）加载恶意固件。核心在于理解U-Boot的SPL/TPL启动机制、命令行接口功能，以及如何通过UART调试接口绕过安全限制获取设备控制权。

## Key Points

### 1. U-Boot 概述
- **全称**：Universal Boot Loader（通用引导加载程序）
- **支持架构**：PowerPC、ARM、MIPS等
- **启动介质**：SD卡、SATA硬盘、NOR Flash、NAND Flash等
- **功能特性**：网络支持、USB协议栈、RAM磁盘加载、多种文件系统（FAT32、ext2/3/4）
- **命令行**：提供"简单"命令行和"hush" shell两种CLI

### 2. 启动流程
```
CPU启动 → Boot ROM → SPL加载 → U-Boot初始化 → OS加载 → OS初始化
```
- **SPL（Secondary Program Loader）**：二级程序加载器，由芯片ROM加载到SRAM，负责加载主U-Boot到RAM
- **TPL（Tertiary Program Loader）**：三级程序加载器，适用于资源极度受限的系统（极少使用）

### 3. 攻击面：暴露的U-Boot Shell
**通过UART获取Shell：**
- **UART识别**：使用万用表找GND，逻辑分析仪找TX（测量波特率），RX为第三个引脚
- **波特率配置**：需匹配设备的波特率、数据位、校验位、停止位
- **常见波特率**：9600、115200等
- **工具**：Hydrabus、任何TTL接收器

**Shell能力：**
- 内存读写（md/mw命令）
- Flash转储和修改
- 加载替代固件
- 网络操作（TFTP下载/上传）

### 4. 固件提取方法
- **直接读取Flash**：使用`nand read`、`sf read`等命令
- **网络传输**：通过TFTP将固件发送到远程服务器
- **串口传输**：通过`loadb`（Kermit协议）或`loads`（S-Record）

### 5. 安全加固建议
- 禁用U-Boot Shell或设置密码保护
- 禁用不必要的网络功能
- 保护UART调试接口（物理遮挡或移除）
- 启用Secure Boot验证固件签名

## Key Quotes

> "U-Boot，即通用引导加载程序，是一种用于基于PowerPC、ARM、MIPS等处理器的嵌入式板卡的引导程序。"

> "暴露的U-Boot Shell允许用户读取和写入内存中的数据。实现这一功能的方法多种多样，复杂程度不一。"

> "SPL是一个小型的二进制文件，由U-Boot源代码生成，目的是适应SRAM并加载主U-Boot到系统RAM中。"

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Hack Uboot.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Hack Uboot.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Hack Uboot.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Hack Uboot.md|原始文章]]
