---
doc_id: src-soc-bootflow-detailed
title: SOC 启动流程详解（Qemu + ATF + U-Boot + Linux）
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/SOC启动流程.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, soc, bootflow, atf, qemu]
---

## Summary

本文以 qemu virt 平台（ARMv8）为例，详细阐述了 SOC 芯片从上电到 Linux 启动的完整流程。涵盖芯片的基本组成（CMOS、晶体管、SRAM/DRAM）、ARMv8 特权级、以及各启动阶段（BL1→BL2→BL31→BL32→BL33→Linux）的详细代码分析。重点分析了 ATF 中 SMC 异常处理、BL2 到 BL31 的跳转机制、BL31 的 runtime service 初始化、OP-TEE 的启动流程、U-Boot 的重定位和 main_loop，以及 Linux 内核的汇编初始化和 start_kernel 流程。

## Key Points

### 1. 芯片基础
- **CMOS**: 互补型金属氧化物半导体，由 PMOS/NMOS 组成
- **SRAM**: 结构复杂、速度快、不需刷新（用于寄存器、cache）
- **DRAM**: 结构简单、成本低、需动态刷新
- **线宽越小** → 工作电压越低 → 开关速度越快 → 频率越高

### 2. CPU 性能提升手段
- 提高频率（与线宽相关）
- 流水线（指令宽度、cache、MMU、TLB、分支预测、乱序执行）
- 超标量（多个执行单元并行）
- 超线程（一个核中某些部件有多份，OS 看来像两个核）
- 多核（集成 NPU/GPU 等专用域架构）

### 3. ARMv8 启动阶段
```
BL1(bootrom) → BL2 → BL31 → BL32(optee) → BL33(u-boot) → linux → init → rootfs
```

### 4. BL1（BootROM）
- 固化在 ROM 中，芯片出厂即固化，无法更改
- 运行在 EL3，是安全启动的信任根
- 初始化 EL3 环境、串口，加载 BL2
- 通过 ERET 跳转到 BL2

### 5. BL2 → BL31 跳转
- BL2 运行在 EL1，BL31 运行在 EL3
- 从低级别到高级别只能通过 SMC 调用
- BL1 代理 SMC 异常，设置 BL31 入口地址到 ELR_EL3
- 执行 ERET 进入 BL31

### 6. BL31 Runtime Service
- 初始化 GICv3 和 runtime service（SMC 调用服务）
- `runtime_svc_descs` 通过 `DECLARE_RT_SVC` 声明
- 包括 `arm_arch_svc` 和 `std_svc`

### 7. OP-TEE（BL32）
- 运行在 S-EL1
- 通过 `opteed_init` 注册初始化函数
- 启动流程：`opteed_init` → `opteed_init_with_entry_point` → `opteed_synchronous_sp_entry` → `el3_exit`
- OP-TEE 启动完成后通过 SMC 返回 BL31

### 8. U-Boot（BL33）
- AARCH64 入口 `_start`（`arch/arm/cpu/armv8/start.S`）
- `_main` 函数（`arch/arm/lib/crt0_64.S`）:
  - 设置 C 运行时环境
  - 分配 gd 和 early malloc 内存
  - 调用 `board_init_f`
  - 设置重定位返回地址
  - 调用 `relocate_code`
- `board_init_r` → `init_sequence_r` → `main_loop`

### 9. Linux 启动
- 汇编初始化：启动参数保存、创建页表、初始化 CPU 状态、C 环境初始化
- `start_kernel`: 大量 Linux 环境初始化
- 创建 0 号 init 进程
- 加载根文件系统，切换到用户态
- 执行 init 程序（busybox/systemd/android init）

## Evidence

- qemu virt 平台: ARMv8, ATF-2.9.0, u-boot.2021.1
- BL1 的 SMC 处理代码位于 `bl1/aarch64/bl1_exceptions.S`
- OP-TEE 入口位于 `core/arch/arm/kernel/entry_a64.S`
- U-Boot 重定位代码位于 `arch/arm/lib/relocate_64.S`

## Key Quotes

> "1.1 疑问：1）芯片的功耗怎么来的？（动态功耗-晶体管翻转，静态功耗-漏电功耗） 2）CPU的设计宗旨是能又好又快的干活，怎么设计才能达到…"
tags:
  - "clippings"
---
不坠青云之志 等 224 人赞同了该文章

目录

目标：做个明白人

## 1\"

> "- 流水线（指令宽度，cache, MMU, TLB, 分支预测，乱序执行， 通过这些方法让流水线满负荷工作），将一条指令分成多个阶段执行，从而达到一个时钟完成一条指令。这也有利于提高CPU的主频"

> "- 芯片上电后运行在EL3级别，所以BL1也是运行在EL3级别"

> "runtime\_svc.c->runtime\_svc\_init函数:

主要是初始化SMC调用时的处理函数，rt\_svc\_descs通过 DECLARE\_RT\_SVC声明，并链接到RT\_SVC\_DESCS\_START和RT\_SVC\_DESCS\_END范围内"

> "当前qemu平台上会有两个rt\_svc\_descs, 分别是arm\_arch\_svc和std\_svc"

## Open Questions

- 实际芯片（非 qemu）与 qemu 平台的启动差异
- 多核启动时 secondary CPU 的初始化流程
- MMU 开启时流水线的处理（物理地址和虚拟地址映射）

## Related Pages

- [[soc-boot]]
- [[armv8]]
- [[atf]]
- [[op-tee]]
- [[u-boot]]
- [[linux-boot]]
