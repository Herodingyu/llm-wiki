---
doc_id: src-soc启动流程
title: SOC启动流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/SOC启动流程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文从芯片底层基础（CMOS晶体管、逻辑门、CPU性能指标）到系统级启动流程，全面介绍了ARM SOC的完整启动过程。文章首先阐述了芯片功耗来源（动态/静态功耗）、CPU性能提升手段（频率、流水线、超标量、超线程、多核），以及SRAM与DRAM的区别。随后详细描述了基于Qemu virt平台的ARMv8启动链：BL1（BootROM）→BL2→BL31（Secure Monitor）→BL32（OP-TEE）→BL33（U-Boot）→Linux内核→用户态初始化，涵盖各阶段的运行环境、核心职责及异常等级切换。

## Key Points

### 1. 芯片基础
- **功耗来源**：动态功耗（晶体管翻转）+ 静态功耗（漏电）
- **性能提升**：频率↑、流水线、超标量、超线程、多核架构
- **存储层次**：SRAM（速度快、成本高、无需刷新）vs DRAM（速度慢、成本低、需动态刷新）

### 2. ARMv8 异常等级
| 等级 | 运行代码 |
|------|----------|
| EL0 | 应用程序 |
| EL1 | 操作系统内核 |
| EL2 | Hypervisor（虚拟化） |
| EL3 | Secure Monitor（安全监控） |

### 3. 启动流程详解
- **BL1（BootROM）**：芯片固化代码，EL3运行，系统最早启动的信任根
- **BL2**：SRAM运行，初始化DDR，加载后续固件
- **BL31**：Secure Monitor，提供安全服务，管理安全/非安全世界切换
- **BL32（OP-TEE）**：可选，运行可信执行环境
- **BL33（U-Boot）**：加载内核、ramdisk、设备树
- **Linux**：初始化完成后启动init进程，加载根文件系统

### 4. 启动环境示例
- 平台：Qemu virt machine（ARMv8 Cortex-A53）
- 固件：ATF-2.9.0、u-boot.2021.1、Linux内核

## Key Quotes

> "目标：做个明白人"

> "天下大事，必作于细; 天下难事，必作于易。"

> "BL1存储在ROM中，芯片出厂时固化在芯片中，无法更改。类似PC上的BIOS。它也是安全启动的信任根。"

## Evidence

- Source: [原始文章](raw/tech/bsp/SOC启动流程.md) [[../../raw/tech/bsp/SOC启动流程.md|原始文章]]

## Open Questions

- 不同厂商（高通、联发科、华为）BootROM的具体实现差异
- 安全启动信任链的验证机制细节

## Related Links

- [原始文章](raw/tech/bsp/SOC启动流程.md) [[../../raw/tech/bsp/SOC启动流程.md|原始文章]]
