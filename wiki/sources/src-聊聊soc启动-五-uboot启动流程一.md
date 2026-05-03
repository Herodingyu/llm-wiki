---
doc_id: src-聊聊soc启动-五-uboot启动流程一
title: 聊聊SOC启动（五） uboot启动流程一
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（五） uboot启动流程一.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文深入分析了U-Boot的启动流程，涵盖不带ATF和与ATF组合两种启动方式。U-Boot自身设计为支持最多spl、tpl、uboot三阶段的完整启动链。不带ATF时，典型流程为bootrom→spl（DDR初始化）→uboot；SRAM较小时引入tpl，流程变为bootrom→spl→bootrom→tpl→uboot。与ATF组合时，需从secure空间启动，通过secure monitor（BL31）管理安全/非安全世界切换，典型流程为SPL→BL31→OP-TEE（可选BL32）→U-Boot。文章还详细讲解了U-Boot初始化流程，包括异常向量表设置、主从CPU处理（spin table/psci方式）、_main函数内存规划、board_init_f_alloc_reserve、board_init_f_init_reserve，以及U-Boot重定位的原理和实现（位置无关代码、.rel.dyn修复、cache失效、平滑切换PC）。

## Key Points

### 1. U-Boot 启动流程概览

U-Boot作为通用嵌入式引导程序，支持多种处理器架构，其启动链设计为最多包含三个阶段：

| 阶段 | 名称 | 功能 | 典型场景 |
|------|------|------|----------|
| **SPL** | Secondary Program Loader | 基础模块和DDR初始化，加载下一级镜像 | 几乎所有场景 |
| **TPL** | Tertiary Program Loader | 镜像加载相关驱动，解决SRAM太小问题 | SRAM较小的系统 |
| **U-Boot** | 主引导程序 | 启动最终操作系统 | 所有场景 |

### 2. 不带ATF的启动方式

**典型精简流程（最常见）**：
```
bootrom → spl（init DDR + load uboot）→ uboot → OS
```

**带TPL的扩展流程**：
```
bootrom → spl（init DDR）→ bootrom → tpl（load and run uboot）→ uboot → OS
```

**极速启动流程（跳过U-Boot）**：
```
bootrom → spl → OS（直接启动操作系统）
```

**关键说明**：
- SPL需要被加载到SRAM中执行
- TPL将SPL功能进一步划分，减少单个镜像size
- TPL主体流程与SPL几乎相同，大多数系统不需要TPL

### 3. ATF与U-Boot组合启动

当系统需要支持secure和non-secure两种执行状态时：

**典型加载流程**：
```
SPL → BL1 → BL2 → BL31（Secure Monitor）→ [BL32（Trust OS，可选）] → BL33（U-Boot）
```

**关键特性**：
- 必须从secure空间开始启动
- BL31（secure monitor）负责管理normal OS对secure空间服务的请求处理
- BL32可选，不支持trust OS可裁剪
- BL2既可用ATF实现，也可用SPL代替

### 4. U-Boot 初始化流程（_main之前）

进入`_main`（位于`arch/arm/lib/crt0_64.S`）之前的初始化步骤：

1. **save_boot_params**：保存上一级镜像传入的参数
2. **PIE检查**：若支持PIE则检查代码段4K对齐
3. **pie_fixup**：重定位全局地址相关的`.rela.dyn`段
4. **reset_sctrl**：根据配置重设sctlr寄存器
5. **异常向量表设置**：U-Boot默认设置，SPL需配置`CONFIG_ARMV8_SPL_EXCEPTION_VECTORS`
6. **system counter频率**：最高异常等级时设置CPU system counter频率
7. **SMP使能**：设置S3_1_c15_c2_1使能CPU间数据一致性
8. **errata处理**：apply_core_errata处理CPU errata
9. **lowlevel_init**：平台相关底层初始化
10. **secondary CPU处理**：设置从CPU到特定状态，等待主CPU唤醒

### 5. 从CPU启动方式

| 方式 | 机制 | 负责组件 |
|------|------|----------|
| **PSCI** | 电源状态协调接口 | BL31处理 |
| **Spin Table** | 从CPU进入WFE睡眠，等待给定地址写入入口函数 | U-Boot处理 |

**Spin Table流程**：
1. 从CPU进入`wfe`睡眠模式
2. 被唤醒后读取`spin_table_cpu_release_addr`的值
3. 若内核未写入入口函数，继续睡眠
4. 否则跳转到入口处开始从CPU启动流程

### 6. U-Boot 重定位

**重定位前提**（位置无关代码技术）：
1. 编译时添加`-fpie`选项
2. 链接时添加`-pie`选项，产生`.rel.dyn`和`.dynsym`段fixup表
3. 链接脚本中添加段定义
4. 重定位过程中fixup数据

**重定位关键步骤**：
1. 获取新的栈指针地址并设置
2. 将新的gd地址设置到x18寄存器
3. 计算重定位偏移值，调整返回地址（lr）
4. 拷贝镜像到新地址
5. 修复`.rel.dyn`和`.dynsym`段数据
6. 根据当前异常等级读取sctlr寄存器
7. 若使能cache，失效已加载的内容
8. 恢复栈帧，`ret`跳转到新位置执行

**重定位对调试的影响**：
- 调试器默认通过链接地址查找符号表
- 重定位后运行地址与链接地址不一致
- 解决方案：使用`symbol-file`丢弃老符号表，用`add-symbol-file`加载到新地址

## Key Quotes

> uboot是通用的嵌入式系统引导程序，其可以支持包含arm在内的多种处理器架构，如mips、riscv、powerpc以及x86等。

> spl被称为secondary program loader，在启动链中一般由bootrom加载而作为第二级启动镜像（bl2），它主要用于完成一些基础模块和ddr的初始化，以及加载下一级镜像uboot。

> 若系统需要支持secure和non secure两种执行状态，则必须要从secure空间开始启动，且启动完成后需要通过secure monitor（bl31）完成normal os对secure空间服务相关请求的处理。

> 一般的启动流程会由spl初始化ddr，然后将uboot加载到ddr中运行。但这并不是必须的，uboot自身其实也可以作为bl1或bl2启动镜像，此时uboot最初的启动位置不是位于ddr中（如norflash）。由于norflash的执行速度比ddr要慢的多，因此在完成ddr初始化后就需要将其搬移到ddr中，并切换到新的位置继续执行，这个流程就叫做uboot的重定位。

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（五） uboot启动流程一.md) [[../../raw/tech/bsp/聊聊SOC启动（五） uboot启动流程一.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（五） uboot启动流程一.md) [[../../raw/tech/bsp/聊聊SOC启动（五） uboot启动流程一.md|原始文章]]
