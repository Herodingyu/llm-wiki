---
doc_id: src-armv8-bootflow-overview
title: ARMv8 启动总体流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（一） armv8启动总体流程.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-03
tags: [bsp, armv8, soc, bootflow, atf]
---

## Summary

本文以 qemu virt machine（ARMv8 Cortex-A53）为例，详细阐述了 ARMv8 SOC 的启动流程。系统引导程序的核心功能是初始化软硬件状态，为操作系统提供合适的运行环境。启动包含 BL1（BootROM）、BL2、BL31（Secure Monitor）、BL32（Trust OS）、BL33（U-Boot）等多个阶段。文章深入介绍了关键寄存器（SCTLR_EL3、SCR_EL3、SP_ELx、SPSR_EL3、ELR_EL3）的作用，以及 ERET 和 SMC 两种镜像跳转方式的详细流程。最后给出了 qemu virt 平台的内存规划示例，展示了 ROM、SRAM 和 DDR 的地址分配策略。

## Key Points

### 1. 启动阶段
| 阶段 | 存储位置 | 异常等级 | 功能 |
|------|---------|---------|------|
| BL1 | ROM（固化） | EL3 | 系统最先执行，作为信任根 |
| BL2 | SRAM | Secure EL1 或 EL3 | 完成 DDR 初始化 |
| BL31 | DDR（永久驻留） | EL3 | Secure Monitor，提供安全服务 |
| BL32 | DDR（永久驻留） | Secure EL1 | Trust OS（可选） |
| BL33 | DDR | Non-secure EL1/EL2 | 一般为 U-Boot，启动操作系统 |

### 2. 异常等级与启动阶段对应
- 复位后默认进入最高异常等级（EL3）
- BL1 运行在 EL3
- BL2 运行在 secure EL1 或 EL3
- BL31 运行在 EL3
- BL32 运行在 secure EL1
- BL33 运行在 non-secure EL1 或 EL2

### 3. 关键寄存器
| 寄存器 | 功能 |
|--------|------|
| SCTLR_EL3 | 系统控制寄存器（MMU、Cache、对齐检查） |
| SCR_EL3 | Secure 配置寄存器（NS、IRQ/FIQ 路由、SMC/HVC 控制） |
| SP_ELx | 异常栈指针寄存器 |
| SPSR_EL3 | 保存异常前的 PSTATE |
| ELR_EL3 | 保存异常返回地址 |

### 4. 镜像跳转方式
| 方式 | 用途 | 流程 |
|------|------|------|
| SMC | 从 EL1/EL2 跳转到 EL3 | 触发 secure monitor call |
| ERET | 从异常处理返回 | 恢复 SPSR_ELx 和 PC（ELR_ELx） |

### 5. 内存规划原则
- ROM 映射到 CPU 重启地址
- BL1 可读写数据重定位到 SRAM
- DDR 初始化代码放在 BL2
- BL31/BL32 需要永久驻留
- BL1/BL2/BL33 启动后可释放给 OS

## Evidence

| 类型 | 起始地址 | 结束地址 | 长度 | Secure |
|------|----------|----------|------|--------|
| ROM | 0x00000000 | 0x00020000 | 128k | Yes |
| SRAM | 0x0e04e000 | 0x0e060000 | 72k | Yes |
| SRAM | 0x0e000000 | 0x0e001000 | 4k | Yes |
| SRAM | 0x0e01b000 | 0x0e040000 | 148k | Yes |
| SRAM | 0x0e040000 | 0x0e060000 | 128k | Yes |
| DDR | 0x60000000 | 0x100000000 | 2.5G | No |

## Open Questions

- TrustZone 安全启动的详细实现
- 不同厂商（NXP、TI、STM）ATF 实现的差异

## Key Quotes

> "SP_ELx寄存器为异常栈指针寄存器，即cpu进入异常后将会切到捕获该异常对应EL的SP_ELx寄存器，如陷入smc异常时栈指针寄存器将会切换到SP_ELx"

> "（3）ROM和SRAM都是直接连接总线上，系统上电后即可直接执行"

> "系统引导程序主要功能就是初始化系统的软硬件状态，为操作系统提供一个合适的软硬件环境，以及加载和启动操作系统映像"

## Related Pages

- [[armv8]]
- [[soc-boot]]
- [[atf]]
- [[trustzone]]
- [[secure-boot]]
