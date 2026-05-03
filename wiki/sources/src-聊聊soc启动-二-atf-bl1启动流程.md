---
doc_id: src-聊聊soc启动-二-atf-bl1启动流程
title: 聊聊SOC启动（二） ATF BL1启动流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（二） ATF BL1启动流程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, atf, bl1, boot, armv8]
---

## Summary

本文详细分析了ATF（ARM Trusted Firmware）BL1（Boot Loader stage 1）的完整启动流程，基于ARMv8架构和ATF V2.5。BL1作为系统启动的第一阶段，运行在EL3异常等级，主要完成系统环境初始化、平台相关设置、BL2镜像加载与验签、以及向BL2的跳转。文章从入口函数`bl1_entrypoint`开始，深入剖析了`el3_entrypoint_common`宏（系统寄存器初始化、冷热启动判断、PIE重定位、异常向量表设置、CPU reset处理、C运行环境准备）、`bl_setup`平台初始化、`bl_main`镜像加载流程（含Secure Boot验签）、以及最终的`el3_exit`异常等级切换机制。

## Key Points

### 1. BL1启动总体流程
- **入口**：`bl1_entrypoint`，由链接脚本`bl1.ld.S`通过`ENTRY`标号定义
- **核心流程**：初始化EL3环境 → 平台初始化 → 加载BL2镜像 → 准备跳转参数 → 跳转到BL2
- **四个主要阶段**：
  1. `el3_entrypoint_common`：EL3系统初始化
  2. `bl_setup`：平台相关设置（串口、内存、MMU）
  3. `bl_main`：BL2镜像加载与准备
  4. `el3_exit`：异常等级切换，跳转到BL2

### 2. el3_entrypoint_common 详解
该宏由BL1和BL31共享，完成EL3级系统初始化：
- **sctlr_el3初始化**：设置大小端、对齐检查、WXN（写执行Never）等系统控制参数
- **冷热启动处理**：通过`plat_get_my_entrypoint`判断，热启动直接跳转保存的状态，冷启动继续完整初始化
- **PIE处理**：地址无关可执行文件重定位，通过GDT表调整绝对地址引用
- **异常向量表设置**：将BL1异常向量表地址写入VBAR_EL3
- **reset_handler**：执行CPU相关的errata修复和SMP位使能
- **架构初始化**：配置SCR_EL3（security路由）、MDCR_EL3（debug）、PMCR_EL0（性能计数器）、CPTR_EL3（浮点/SIMD陷阱）等寄存器
- **secondary CPU处理**：非主CPU进入安全等待状态，由主CPU后续通过spintable或PSCI唤醒
- **C运行环境**：清空BSS段、数据段重定位（ROM→RAM）、设置运行时栈

### 3. bl_setup 平台初始化
- **early_platform_setup**：串口初始化、设置secure SRAM内存布局
- **plat_arch_setup**：建立MMU页表并启用MMU和D-cache（BL1中VA=PA，开启MMU主要为加速D-cache）

### 4. bl_main 镜像加载流程
- **bl1_arch_setup**：设置下一异常等级为AArch64（配置SCR_EL3.RW位）
- **Secure Boot初始化**：`auth_mod_init`初始化密码学库和镜像解析器，用于后续镜像签名验证
- **镜像加载**：`load_auth_image`从storage（如FIP、semihosting）加载BL2镜像，并进行合法性验签
- **参数准备**：计算BL2可用内存布局，通过`ep_info.args`设置x0-x7寄存器传递参数

### 5. el3_exit 异常等级切换
- 保存当前SP_EL0到上下文
- 切换栈指针到SP_EL3
- 从上下文加载SCR_EL3、SPSR_EL3、ELR_EL3
- 恢复通用寄存器
- 执行`eret`指令，CPU跳转到BL2入口地址（ELR_EL3设定）

## Key Quotes

> "BL1是系统启动的第一阶段，其主要目的是初始化系统环境和启动第二阶段镜像BL2。"

> "该宏由所有需要在EL3下执行的镜像共享，如BL1和BL31都会入口处调用该函数，只是传入的参数有所区别。"

> "bl1中物理地址和虚拟地址映射的地址值是相等的，之所以要开启MMU主要是为了开启dcache，以加快后面BL2镜像加载的速度。"

> "secure boot用于校验镜像的合法性，它通常需要一个包含镜像签名信息的镜像头。"

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（二） ATF BL1启动流程.md) [[../../raw/tech/bsp/聊聊SOC启动（二） ATF BL1启动流程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（二） ATF BL1启动流程.md) [[../../raw/tech/bsp/聊聊SOC启动（二） ATF BL1启动流程.md|原始文章]]
