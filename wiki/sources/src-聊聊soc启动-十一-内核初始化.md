---
doc_id: src-聊聊soc启动-十一-内核初始化
title: 聊聊SOC启动（十一） 内核初始化
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（十一） 内核初始化.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文基于AARCH64架构和Linux内核5.14.0-rc5，深入分析了ARM64内核从入口到start_kernel的完整初始化流程。文章从`arch/arm64/kernel/head.S`的入口函数`primary_entry`开始，依次讲解了启动参数保存（`preserve_boot_args`将dtb地址保存到x21和全局变量）、异常等级初始化（`init_kernel_el`处理EL1/EL2切换和VHE模式）、启动模式记录（`set_cpu_boot_mode_flag`通过状态机数组检测所有CPU启动EL是否一致）、初始化页表创建（`__create_page_tables`建立idmap和init_pg_dir页表）、处理器状态设置（`__cpu_setup`配置TLB/CPACR/MAIR/TCR等关键寄存器），以及最终的C运行时环境初始化（`__primary_switch`使能MMU并跳转到`__primary_switched`，完成向量表设置、栈初始化、BSS清零、fdt映射等，最终调用`start_kernel`进入C语言世界）。

## Key Points

### 1. 内核入口函数 primary_entry

```asm
SYM_CODE_START(primary_entry)
    bl    preserve_boot_args        // 保存启动参数
    bl    init_kernel_el            // 异常等级初始化
    adrp  x23, __PHYS_OFFSET
    and   x23, x23, MIN_KIMG_ALIGN - 1
    bl    set_cpu_boot_mode_flag    // 设置启动模式
    bl    __create_page_tables      // 创建页表
    bl    __cpu_setup               // CPU初始化
    b     __primary_switch          // 使能MMU，进入C语言
SYM_CODE_END(primary_entry)
```

### 2. 启动参数保存

- dtb地址通过x0寄存器传入，保存到x21（callee寄存器）
- 同时保存到全局变量`boot_args`中（最多支持4个参数）
- **关键操作**：调用`dcache_inval_poc`失效boot_args对应cache line，防止bootloader残留数据导致cache一致性问题

### 3. 启动模式检测状态机

使用`__boot_cpu_mode`数组检测SMP系统中所有CPU是否以相同EL启动：

| EL | __boot_cpu_mode[0] | __boot_cpu_mode[1] |
|----|-------------------|-------------------|
| EL1 | el1 | el1 |
| EL2 | el2 | el2 |

**状态机原理**：只有所有CPU启动EL相同时，两个元素值才相同；否则不同，可用于检测启动异常。

### 4. 页表创建 __create_page_tables

创建两个关键页表：

| 页表 | 用途 | PGD基地址存放 |
|------|------|--------------|
| idmap_pg_dir | MMU使能代码的identity映射 | TTBR0_EL1 |
| init_pg_dir | 内核镜像的虚拟地址映射 | TTBR1_EL1 |

**idmap双重映射**：idmap段同时被映射到两个页表：
- 作为内核镜像一部分映射到高地址（init_pg_dir，TTBR1_EL1）
- 作为identity映射到低地址（idmap_pg_dir，TTBR0_EL1）

**虚拟地址<48位的处理**：增加extra映射层，扩展虚拟地址范围到48位。

### 5. CPU状态初始化 __cpu_setup

关键寄存器配置：

| 寄存器 | 配置内容 |
|--------|----------|
| TLBI | 失效TLB，清除bootloader残留 |
| CPACR_EL1 | 将EL0/EL1对SIMD/FP寄存器的访问陷入EL1 |
| MAIR_EL1 | 设置8组内存属性表（device/normal memory属性） |
| TCR_EL1 | 配置TTBR0/TTBR1属性、物理地址范围、翻译粒度 |

MAIR属性表示例：
- `0b0000_0000`：nGnRnE设备内存
- `0b0000_0100`：nGnRE设备内存
- `0b1111_1111`：Normal memory，Write-back缓存

### 6. C运行时环境初始化 __primary_switch → __primary_switched

| 步骤 | 操作 | 目的 |
|------|------|------|
| 1 | `__enable_mmu` | 使能MMU，切换到虚拟地址 |
| 2 | 设置`vbar_el1` | 安装异常向量表 |
| 3 | 初始化栈帧 | 设置swapper进程栈 |
| 4 | 保存`__fdt_pointer` | 将dtb地址保存到全局变量 |
| 5 | 计算`kimage_voffset` | 记录内核虚拟/物理地址差值 |
| 6 | `__pi_memset`清零BSS | 初始化未初始化数据段 |
| 7 | `early_fdt_map` | 通过fixmap为dtb建立页表 |
| 8 | `switch_to_vhe` | 再次尝试进入VHE模式 |
| 9 | `start_kernel` | 进入C语言初始化 |

## Key Quotes

> "armv8架构内核的入口函数位于arch/arm64/kernel/head.S，它是内核启动的起点。"

> "虽然armv8现在只使用了一个寄存器传递启动参数，但内核还是支持最多可传递四个参数。"

> "idmap是内核镜像中的一个段，其定义位于 arch/arm64/kernel/vmlinux.lds.S中。"

> "为了提高页表访问效率，需要为其增加一级tlb缓存。为了防止tlb中有bootloader遗留的脏数据，需要在启动mmu之前先失效其中的内容。"

> "终于看到我们熟悉的start_kernel，可以离开头疼的汇编了。"

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（十一） 内核初始化.md) [[../../raw/tech/bsp/聊聊SOC启动（十一） 内核初始化.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（十一） 内核初始化.md) [[../../raw/tech/bsp/聊聊SOC启动（十一） 内核初始化.md|原始文章]]
