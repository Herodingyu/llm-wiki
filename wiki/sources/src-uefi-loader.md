---
doc_id: src-uefi-loader
title: UEFI 代码加载机制
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/UEFI代码是由谁加载的？ - 老狼 的回答.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, uefi, bios, bootloader]
---

## Summary

本文回答了"UEFI 代码是由谁加载的"这个问题。UEFI（现代 BIOS）固化在主板上的 Flash 中，CPU 加电后从固定地址（Intel 为 FFxxxxxx，ARM 为 0 地址）取指令执行。UEFI 首先用汇编代码做简单初始化（此时没有堆栈），然后用 Cache 作为临时堆栈，初始化内存后将代码搬运到内存中，最后初始化各种硬件（USB、显卡、硬盘等）。启动操作系统时，UEFI 读取硬盘的 EFI 分区，加载操作系统引导程序（如 Linux 的 GRUB），再由引导程序加载操作系统。

## Key Points

### 1. UEFI 与 BIOS 的关系
- UEFI 就是现代的 BIOS
- 固化在主板上的 8MB Flash 中
- 硬盘上有 EFI 分区，存放引导程序（如 GRUB）

### 2. CPU 启动过程
- Intel CPU: 从 FFxxxxxx 地址取指令
- ARM CPU: 大部分从 0 地址取指令
- 这段代码是汇编（因为此时没有堆栈，C 语言需要堆栈）

### 3. UEFI 初始化流程
1. 汇编代码做简单初始化
2. 用 Cache 作为临时堆栈
3. 初始化内存（DDR）
4. 将 UEFI 代码搬运到内存
5. 初始化各种硬件（USB、显卡、硬盘等）

### 4. 启动操作系统
1. UEFI 读取硬盘 EFI 分区
2. 加载操作系统引导程序（Linux: GRUB，Windows: 自有引导程序）
3. 引导程序加载操作系统

### 5. MBR vs EFI 分区
- **MBR**: 传统引导，引导程序必须在第一个 512 字节分区
- **EFI**: 现代引导，支持文件系统，引导程序可放在任意位置
- EFI 分区解决了 MBR 分区损坏后无法引导的问题

## Evidence

- UEFI 是个统称：包括 UEFI 执行环境和磁盘上的 UEFI App（OS Loader）
- UEFI App 由 UEFI 环境（BIOS）加载
- 磁盘上的 efi 文件只是 UEFI 引导的最后阶段

## Key Quotes

> "---
title: "UEFI代码是由谁加载的"

> "开机 用简单的语言来描述就是，电脑按下开机键之后做了什么"

> "也就是说，CPU每次启动都会从固定的地址取指令来初始化CPU，然后初始化整个硬件设备"

> "App 由UEFI环境来加载，UEFI环境就是所谓的BIOS，通常固化在主板上"

> "简单说磁盘上你看到的efi文件仅仅是整个uefi引导的最后阶段。在这之前固化在主板上的uefi固件已经跑很多东西了"

## Open Questions

- Boot Guard 对 UEFI 加载流程的影响
- ARM 服务器上 UEFI 与 ATF 的协作关系

## Related Pages

- [[uefi]]
- [[bios]]
- [[bootloader]]
- [[secure-boot]]
