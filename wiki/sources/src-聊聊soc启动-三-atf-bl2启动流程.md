---
doc_id: src-聊聊soc启动-三-atf-bl2启动流程
title: 聊聊SOC启动（三） ATF BL2启动流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（三） ATF BL2启动流程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, atf, bl2, boot, armv8]
---

## Summary

本文详细分析了ATF BL2（Boot Loader stage 2）的启动流程。BL2作为启动链路的第二阶段，通常运行在S-EL1或EL3，负责加载后续更复杂的镜像（BL31、BL32、BL33）。文章从BL2入口开始，深入讲解了基础初始化（参数保存、异常向量表设置、系统控制寄存器配置）、平台初始化（内存布局、MMU、存储驱动）、镜像加载机制（通过镜像描述结构体注册和遍历加载BL31/BL33）、参数传递链路（通过bl_params链表组织），以及最终通过SMC调用返回BL1执行镜像切换的完整流程。

## Key Points

### 1. BL2启动总体流程
- **运行等级**：可运行于EL3或S-EL1（本文分析常见的S-EL1方式）
- **主要任务**：加载BL31（Secure Monitor）、可选BL32（Trust OS）、BL33（Non-secure OS如Linux/U-Boot）
- **核心流程**：基础初始化 → 平台设置 → 镜像加载 → 参数准备 → SMC返回BL1 → 跳转到BL31

### 2. BL2基础初始化
- **参数保存**：BL1通过x0-x3传递参数（x1为内存布局指针），BL2将其保存到callee-saved寄存器（x19-x22）
- **异常设置**：设置EL1异常向量表（`early_exceptions`），仅打印异常信息并panic；使能SError和External Abort捕获
- **sctlr_el1配置**：使能指令Cache、对齐检查、栈对齐检查
- **C运行环境**：清空BSS段、设置运行时栈（与BL1相同机制）

### 3. BL2平台设置
- **内存布局初始化**：从x1参数获取BL2可用内存范围
- **控制台初始化**：`qemu_console_init()`
- **存储驱动初始化**：`plat_qemu_io_setup()`
- **MMU配置**：建立BL2内存页表，启用MMU和D-cache（加速后续镜像加载）

### 4. 镜像加载机制
- **镜像描述结构**：`bl_mem_params_node_t`数组定义加载的镜像列表（BL31、BL33等）
- **链表组织**：通过`next_handoff_image_id`形成加载链路
- **注册宏**：`REGISTER_BL_IMAGE_DESCS(bl2_mem_params_descs)`将描述结构注册到系统
- **加载流程**：
  1. `bl2_platform_setup`：平台security、timer、dtb设置
  2. `bl2_plat_handle_pre_image_load`：加载前平台自定义操作
  3. `load_auth_image`：实际加载并验签镜像
  4. `bl2_plat_handle_post_image_load`：设置镜像启动参数

### 5. 参数传递与镜像切换
- **BL33参数设置**：
  - Linux启动：arg0设置为DTB基地址
  - U-Boot启动：arg0设置为当前CPU affinity信息（MPIDR）
- **bl_params链表**：组织所有加载镜像的ep_info，通过x0传递给下一级镜像
- **SMC返回BL1**：BL2执行`smc(BL1_SMC_RUN_IMAGE, next_bl_ep_info, ...)`返回EL3
- **BL1 SMC处理**：`smc_handler64`验证命令→恢复runtime栈→设置elr_el3/spsr_el3→通过eret跳转到BL31

## Key Quotes

> "Bl2的启动流程与bl1类似，主要区别是bl2的初始化流程比bl1更简单，但其可能需要加载更多的镜像，如bl31、bl32和bl33。"

> "bl1虽然定义了x0 – x7寄存器用于向bl2传递参数，但bl2实际使用的只有x0 - x3四个寄存器。"

> "bl2若运行在S-EL1下，则镜像加载完成并准备好参数后，需要通过smc异常再次进入bl1，由bl1的smc处理函数来执行实际的镜像切换流程。"

> "由于bl_params位于sram内存中，而bl2开启了dcache，因此在跳转到smc之前，需要将这部分数据从cache刷到sram中。"

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（三） ATF BL2启动流程.md) [[../../raw/tech/bsp/聊聊SOC启动（三） ATF BL2启动流程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（三） ATF BL2启动流程.md) [[../../raw/tech/bsp/聊聊SOC启动（三） ATF BL2启动流程.md|原始文章]]
