---
doc_id: src-聊聊soc启动-四-atf-bl31启动流程
title: 聊聊SOC启动（四） ATF BL31启动流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（四） ATF BL31启动流程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文基于AARCH64架构和ATF V2.5，深入分析了ATF BL31阶段的完整启动流程。BL31是TrustZone启动流程中的关键组件，具有双重角色：启动阶段负责初始化软硬件并加载BL32（Trust OS）和BL33（U-Boot）；系统运行阶段作为EL3安全监控器驻留，处理SMC异常和EL3中断。文章详细讲解了BL31的基础初始化流程（参数保存、`el3_entrypoint_common`的两种调用模式——默认从BL1启动和`RESET_TO_BL31`快速启动），参数设置与解析（`bl31_early_platform_setup2`解析BL2传入的镜像描述链表，`bl31_plat_arch_setup`创建页表并使能MMU），平台相关初始化（GIC、GPIO），EL3中断处理框架（ehf）的初始化与优先级管理，运行时服务注册机制（通过`DECLARE_RT_SVC`宏和`runtime_svc_init`遍历初始化），以及BL32（以OP-TEE为例）和BL33的启动流程（上下文保存/恢复、SMC返回机制）。

## Key Points

### 1. BL31启动流程概览

BL31承担双重职责：

| 阶段 | 职责 |
|------|------|
| 启动阶段 | 执行软硬件初始化，启动BL32和BL33 |
| 运行阶段 | 驻留EL3，处理SMC异常和EL3中断 |

**主要工作清单**：
1. CPU初始化
2. C运行时环境初始化
3. 基本硬件初始化（GIC、串口、timer）
4. 页表创建和cache使能
5. 后级镜像准备及跳转
6. EL3中断处理框架初始化（可选）
7. SMC处理和异常等级切换上下文初始化
8. 运行时服务注册

### 2. el3_entrypoint_common的两种模式

#### 模式一：从BL1启动（默认）

```c
el3_entrypoint_common
    _init_sctlr=0              // BL1已初始化
    _warm_boot_mailbox=0       // BL1已处理
    _secondary_cold_boot=0     // BL1已处理
    _init_memory=0             // BL1已初始化
    _init_c_runtime=1
    _exception_vectors=runtime_exceptions
```

#### 模式二：RESET_TO_BL31（快速启动）

```c
el3_entrypoint_common
    _init_sctlr=1              // 需要初始化
    _warm_boot_mailbox=!PROGRAMMABLE_RESET_ADDRESS
    _secondary_cold_boot=!COLD_BOOT_SINGLE_CPU
    _init_memory=1             // 需要初始化
    _init_c_runtime=1
    _exception_vectors=runtime_exceptions
```

**快速启动原理**：通过设置`RVBAR_EL3`寄存器，使CPU reset直接从BL3入口执行，跳过BL1/BL2两级流程。

### 3. 参数解析与平台初始化

#### 3.1 bl31_early_platform_setup2

解析BL2传入的镜像描述链表（`bl_params_t`），提取：
- `BL32_IMAGE_ID` → `bl32_image_ep_info`
- `BL33_IMAGE_ID` → `bl33_image_ep_info`

#### 3.2 bl31_plat_arch_setup

为BL31相关内存创建页表并使能MMU：
```c
qemu_configure_mmu_el3(BL31_BASE, (BL31_END - BL31_BASE),
    BL_CODE_BASE, BL_CODE_END,
    BL_RO_DATA_BASE, BL_RO_DATA_END,
    BL_COHERENT_RAM_BASE, BL_COHERENT_RAM_END);
```

### 4. EL3中断处理（ehf）

GICv3中断分组：

| Group | 路由目标 | ehf处理 |
|-------|---------|---------|
| Group 0 | 总是FIQ，路由到EL3 | 是（通过ehf） |
| Secure Group 1 | 由SCR_EL3配置 | 否 |
| Non-secure Group 1 | 由SCR_EL3配置 | 否 |

**中断优先级注册**：
1. 平台定义优先级数组（`plat_exceptions`）
2. 通过`EHF_REGISTER_PRIORITIES`注册
3. 驱动中通过`ehf_register_priority_handler`绑定实际处理函数

**重要限制**：BL31执行时PSTATE的IRQ/FIQ被mask，EL3中断只在CPU运行低于EL3时才可触发。

### 5. 运行时服务注册

#### 5.1 注册机制

通过`DECLARE_RT_SVC`宏将服务描述符放入`rt_svc_descs`段：
```c
#define DECLARE_RT_SVC(_name, _start, _end, _type, _setup, _smch) \
    static const rt_svc_desc_t __svc_desc_##_name \
        __section("rt_svc_descs") __used = { \
        .start_oen = (_start), .end_oen = (_end), \
        .call_type = (_type), .name = #_name, \
        .init = (_setup), .handle = (_smch) \
    }
```

#### 5.2 初始化流程

`runtime_svc_init`遍历`rt_svc_descs`段：
1. 获取段起始地址`RT_SVC_DESCS_START`
2. 校验每个服务描述符
3. 调用`init`回调初始化

**标准服务**：PSCI（电源管理）、SDEI（软件事件代理）、SPD（Trust OS代理）。

### 6. BL32启动与返回机制

以OP-TEE为例的启动流程：
1. `DECLARE_RT_SVC`注册`opteed_setup`
2. `opteed_setup`调用`bl31_register_bl32_init(&opteed_init)`
3. `opteed_init`准备上下文（系统寄存器、SPSR_EL3、ELR_EL3）
4. `opteed_enter_sp`保存上下文（x19-x30、sp）到`opteed_sp_context`
5. 跳转到BL32（Secure EL1）

**返回机制**：BL32通过SMC返回，`opteed_smc_handler`收到`TEESMC_OPTEED_RETURN_ENTRY_DONE`后：
1. 保存OP-TEE向量表地址
2. 调用`opteed_synchronous_sp_exit`恢复上下文
3. 返回断点继续执行BL33启动

## Key Quotes

> "与bl1和bl2不同，bl31包含两部分功能，在启动时作为启动流程的一部分，执行软硬件初始化以及启动bl32和bl33镜像。"

> "若启动从bl31开始，则由于它是第一级启动镜像，因此el3_entrypoint_common需要从头设置系统状态。"

> "bl31在系统初始化完成后还需要驻留系统，并处理来自低异常等级的smc异常，其异常处理流程被称为运行时服务。"

> "当ehf_register_priority_handler注册完成后，理论上bl31就可以接收和处理el3中断了。"

> "它先获取先前保存的secure镜像ep信息，然后用其初始化异常等级切换的上下文，设置secure el1的系统寄存器，spsr_el3和elr_el3等。"

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（四） ATF BL31启动流程.md) [[../../raw/tech/bsp/聊聊SOC启动（四） ATF BL31启动流程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（四） ATF BL31启动流程.md) [[../../raw/tech/bsp/聊聊SOC启动（四） ATF BL31启动流程.md|原始文章]]
