---
doc_id: src-atf入门-2大软件模型和代码编译运行探究
title: ATF入门-2：大软件模型和代码编译运行探究
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/ATF入门-2大软件模型和代码编译运行探究.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, atf, arm, qemu, build]
---

## Summary

本文在QEMU环境搭建的基础上，深入探讨了ATF（ARM Trusted Firmware）的大软件模型和编译运行机制。文章首先阐述了ARM软件栈的整体框架（从EL3固件到EL0应用），异常等级切换模型（V字形切换），以及Secure Boot过程中各固件的异常等级分配。然后 practical 地介绍了如何修改ATF代码添加日志、控制日志级别、去掉GDB调试依赖、以及单独编译ATF模块。核心在于理解ATF在多异常等级环境中的运行机制和实际代码调试技巧。

## Key Points

### 1. 大软件模型
- **软件栈层次**：EL3（ATF）→ EL2（Hypervisor/UEFI）→ EL1（OS Kernel）→ EL0（Apps）
- **异常等级切换**：
  - 低EL→高EL：通过异常（中断、SMC等）
  - 高EL→低EL：通过ERET指令
  - 形成"V字形"切换模式
- **Secure Boot流程**：各固件运行在不同异常等级，通过异常跳转切换
- **地址空间**：64位上层可运行32位，但64位下层不能运行32位

### 2. 日志系统
- **日志级别**：NOTICE、INFO、VERBOSE等
- **控制宏**：LOG_LEVEL控制编译时日志级别
- **修改代码**：直接修改源代码添加NOTICE打印验证
- **调试技巧**：LOG_LEVEL >= LOG_LEVEL_INFO时INFO宏才会打印

### 3. 编译运行优化
- **去掉GDB**：修改qemu_v8.mk去掉gdb调试依赖，无需手动输入c
- **单独编译ATF**：
  ```bash
  # 全编（慢）
  make run
  
  # 只编译ATF
  make -f qemu_v8.mk arm-tf
  
  # 只运行
  make -f qemu_v8.mk run-only
  ```
- **编译输出**：out/目录生成bl1.bin、bl2.bin、bl31.bin等

### 4. 异常向量表
- **作用**：定义异常发生时的跳转地址
- **位置**：每个异常等级有独立的异常向量表（VBAR_ELx）
- **切换机制**：reset也可进行异常等级切换
- **warm reset**：EL3无high level时使用warm reset切换

### 5. U-Boot启动Kernel
- **典型流程**：U-Boot（EL2）→ SMC → BL31（EL3）→ ERET → Kernel（EL1）
- **参数传递**：通过寄存器传递设备树地址、启动参数等

## Key Quotes

> "异常等级跟固件挂钩就可以在个固件中间切换运行代码。"

> "按照之前的流程运行起来后，首先我们应该做点什么呢？那必须上手改改代码打点log小试身手啊。"

> "make run是全编，但是比较慢。比如我们只对atf关心，那么来一探究竟吧。"

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-2大软件模型和代码编译运行探究.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-2大软件模型和代码编译运行探究.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-2大软件模型和代码编译运行探究.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-2大软件模型和代码编译运行探究.md|原始文章]]
