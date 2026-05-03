---
doc_id: src-atf入门-3bl2启动流程分析
title: ATF入门-3：BL2启动流程分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/ATF入门-3BL2启动流程分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, atf, bl2, secure-boot, arm]
---

## Summary

本文深入分析了ATF BL2（Trusted Boot Firmware）的启动流程。BL2承担加载后续固件（BL31、BL32/OP-TEE、BL33/U-Boot）的关键职责，并在Secure Boot中对所有固件进行校验，防止篡改。文章详细解析了BL2的入口函数`bl2_entrypoint`的执行流程：参数保存、异常向量设置、sctlr_el1寄存器配置、C运行时环境初始化、以及`bl2_main`加载BL3x系列镜像并通过SMC调用将执行权交给BL31。重点阐述了BL2与BL1的设计分离原因（ROM成本、驱动适配、安全考虑），以及S-EL1运行模式下的初始化细节。

## Key Points

### 1. BL2定位与功能
- **职责**：加载BL31、BL32（OP-TEE）、BL33（U-Boot）等后续固件
- **安全角色**：Secure Boot核心，对所有固件进行签名校验
- **运行等级**：可运行于EL3或S-EL1（ARMv8通常S-EL1）
- **内存需求**：需要初始化DDR，因为加载的镜像可能较大

### 2. BL2与BL1分离的设计原因
- **ROM成本**：BL1写死在芯片ROM中，体积需最小化
- **驱动适配**：BL1驱动越少越好，避免适配不同厂家硬件
- **安全考虑**：BL2加载完固件后不再运行，减少被攻击面
- **功能分离**：BL1负责根信任验证，BL2负责加载搬运

### 3. 入口函数 bl2_entrypoint
- **文件**：`bl2/aarch64/bl2_entrypoint.S`
- **运行模式**：S-EL1（Secure EL1）
- **执行流程**：
  1. 保存x0-x3参数到x20-x23（callee-saved寄存器）
  2. 设置异常向量表（`early_exceptions`）
  3. 配置sctlr_el1（Cache、对齐等属性）
  4. 刷新D-Cache，初始化BL2栈
  5. 调用`bl2_setup`进行平台设置
  6. 调用`bl2_main`加载BL3x镜像

### 4. bl2_main 核心工作
- **加载镜像**：将BL31、BL32、BL33加载到RAM
- **安全校验**：对每个镜像进行数字签名和哈希验证
- **参数准备**：为下一级准备启动参数
- **SMC调用**：通过SMC进入BL1指定的handler
- **跳转执行**：将CPU执行权交给BL31

### 5. 异常处理
- **早期异常**：`early_exceptions`仅打印异常信息并panic
- **严重错误**：未定义指令、空指针等触发SError/External Abort
- **安全策略**：捕获异常并将系统置于安全状态

### 6. 寄存器约定
- **caller-saved**：x0-x18，子函数可随意使用
- **callee-saved**：x19-x30，子函数需保存并恢复
- **参数传递**：BL1→BL2通过x0-x3传递，BL2需先保存

## Key Quotes

> "BL2承担起了加载其他固件（bl31、bl32（optee-os）和bl33（uboot））的功能，并在secure boot中占据了重要角色，主要是对这些固件进行校验，防止被篡改。"

> "BL1的初衷就是ROM写死在芯片里面，用于校验外部固件用的，只要完成这个功能其他的都不重要。"

> "BL2的主要工作就是加载BL3x系列镜像，然后通过SMC进入BL1进而跳转到BL31运行。"

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-3BL2启动流程分析.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-3BL2启动流程分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/ATF入门-3BL2启动流程分析.md) [[../../raw/tech/bsp/芯片底软及固件/ATF入门-3BL2启动流程分析.md|原始文章]]
