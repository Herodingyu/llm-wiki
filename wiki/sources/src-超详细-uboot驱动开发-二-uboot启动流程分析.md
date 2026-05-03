---
doc_id: src-超详细-uboot驱动开发-二-uboot启动流程分析
title: 超详细【Uboot驱动开发】（二）uboot启动流程分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/超详细【Uboot驱动开发】（二）uboot启动流程分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文详细分析了U-Boot BL2阶段（主U-Boot）的完整启动流程，以EMMC启动介质为例进行讲解。文章首先介绍了U-Boot启动的两个阶段：SPL（BL1阶段，负责基础配置和设备初始化，搬运U-Boot到内存）和U-Boot（BL2阶段，负责外设初始化和内核引导）。随后深入解析了从链接脚本`u-boot.lds`指定的入口函数`_start`开始，经过`board_init_f`板级前置初始化（执行`init_sequence_f`初始化序列，包括串口、定时器、设备树、DM驱动模型等），到`relocate_code`重定向（将U-Boot从Flash搬运到DDR高端地址，为内核腾空间），再到`board_init_r`板级后置初始化（执行`init_sequence_r`序列，初始化DM模型、MMC驱动等），最终到达`main_loop`主循环（处理bootdelay倒计时、执行bootcmd自动启动或进入cli_loop命令行交互）的完整执行链路。

## Key Points

### 1. U-Boot启动两阶段

| 阶段 | 名称 | 代码组成 | 职责 |
|------|------|---------|------|
| BL1 | SPL | 汇编 + 少量C | 开发板基础配置、设备初始化、搬运U-Boot到内存 |
| BL2 | U-Boot | 纯C语言 | 初始化外部设备、引导Kernel启动 |

### 2. 入口函数与链接脚本

`u-boot.lds`关键定义：
```ld
OUTPUT_FORMAT("elf32-littlearm", "elf32-littlearm", "elf32-littlearm")
OUTPUT_ARCH(arm)
ENTRY(_start)
SECTIONS
{
    . = 0x00000000;
    . = ALIGN(4);
    .text :
    {
        *(.__image_copy_start)        // 映像复制起始地址
        *(.vectors)                   // 异常向量表
        arch/arm/cpu/armv7/start.o (.text*)  // 启动函数
    }
    ......
}
```

- `ENTRY(_start)`：入口在`arch/arm/lib/vectors.S`
- `arch/arm/cpu/armv7/start.S`：定义主入口，最终调用`main`

### 3. board_init_f——板级前置初始化

```c
void board_init_f(ulong boot_flags)
{
    gd->flags = boot_flags;
    gd->have_console = 0;
    if (initcall_run_list(init_sequence_f))
        hang();
}
```

**init_sequence_f主要初始化项**：

| 函数 | 功能 |
|------|------|
| `setup_mon_len` | 设置monitor长度 |
| `log_init` | 日志系统初始化 |
| `arch_cpu_init` | 架构相关CPU初始化 |
| `env_init` | 环境变量初始化 |
| `reloc_fdt` | 设备树重定位 |
| `reloc_bootstage` | bootstage重定位 |
| `reloc_bloblist` | bloblist重定位 |
| `setup_reloc` | 计算重定位参数 |

### 4. relocate_code——重定向

#### 4.1 重定向原因

1. U-Boot存储在只读介质（ROM/Nor Flash），需拷贝到DDR才能完整运行
2. 为Kernel腾出DDR低地址空间，U-Boot重定向到高端地址

#### 4.2 重定向步骤

```asm
_main:
    bl  board_init_f          // (1)空间规划 (2)计算偏移 (3)reloc global_data
    ldr sp, [r9, #GD_START_ADDR_SP]
    ldr r9, [r9, #GD_BD]
    sub r9, r9, #GD_SIZE      // new GD地址
    adr lr, here
    ldr r0, [r9, #GD_RELOC_OFF]
    add lr, lr, r0            // 计算新空间返回地址
    ldr r0, [r9, #GD_RELOCADDR]
    b   relocate_code         // 搬运U-Boot到新地址
    bl  relocate_vectors      // 重定向中断向量表
```

| 步骤 | 操作 |
|------|------|
| 1 | `board_init_f`中进行空间划分、计算偏移、reloc旧global_data |
| 2 | 设置新sp和gd地址 |
| 3 | 计算新空间返回地址（lr + reloc_off） |
| 4 | `relocate_code`搬运U-Boot代码并修正全局变量标签 |
| 5 | `relocate_vectors`搬运中断向量表 |

#### 4.3 setup_reloc调试辅助

```c
gd->reloc_off = gd->relocaddr - (unsigned long)__image_copy_start;
```

打印`Relocating to %08lx`信息，方便仿真时定位正确内存空间。

### 5. board_init_r——板级后置初始化

```c
void board_init_r(gd_t *new_gd, ulong dest_addr)
{
    if (initcall_run_list(init_sequence_r))
        hang();
}
```

**init_sequence_r主要初始化项**：

| 函数 | 功能 |
|------|------|
| `initr_reloc` | 重定位相关初始化 |
| `initr_reloc_global_data` | global data重定位 |
| `board_init` | 板级初始化 |
| `initr_dm` | 设备模型（DM）初始化 |
| `initr_mmc` | MMC驱动初始化 |
| `run_main_loop` | 进入主循环 |

### 6. main_loop——U-Boot主循环

```c
void main_loop(void)
{
    env_set("ver", version_string);   // 设置版本环境变量
    cli_init();                        // CLI初始化
    run_preboot_environment_command(); // 预启动命令
    s = bootdelay_process();           // 启动延时处理
    autoboot_command(s);               // 自动启动命令
    cli_loop();                        // 命令行交互
}
```

#### 6.1 bootdelay_process

- 读取`bootdelay`环境变量（或`CONFIG_BOOTDELAY`）
- 支持设备树配置覆盖
- 返回`bootcmd`环境变量（正常启动）或`altbootcmd`（启动计数错误）

#### 6.2 autoboot_command

启动条件判断：
- `stored_bootdelay != -1`：启动延时有效
- `s`非空：`bootcmd`已定义
- `!abortboot(stored_bootdelay)`：无按键中断

满足条件则执行`run_command_list(s, -1, 0)`加载内核。

#### 6.3 cli_loop

```c
void cli_loop(void)
{
#ifdef CONFIG_HUSH_PARSER
    parse_file_outer();    // Hush shell解析
#elif defined(CONFIG_CMDLINE)
    cli_simple_loop();     // 简单命令行循环
#endif
}
```

## Key Quotes

> "同大多数的Bootloader一样，uboot的启动过程也分为BL1、BL2两个阶段，分别对应着 SPL 和 Uboot。"

> "重定向技术，可以说也算是 Uboot 的一个重点了，也就是将 uboot 自身镜像拷贝到 ddr 上的另外一个位置的动作。"

> "一般需要重定向的条件如下：uboot 存储在只读存储器上，需要将代码拷贝到 DDR 上；为 Kernel 腾空间，Kernel 一般会放在 DDR 的地段地址上。"

> "该函数为Uboot的最终执行函数，无论是加载kernel还是uboot的命令行体系，均由此实现。"

> "abortboot(stored_bootdelay) 主要用于判断是否有按键按下。如果按下，则不执行 bootcmd 命令，进入 cli_loop 命令行模式；如果不按下，则执行 bootcmd 命令，跳转到加载Linux启动。"

## Evidence

- Source: [原始文章](raw/tech/bsp/超详细【Uboot驱动开发】（二）uboot启动流程分析.md) [[../../raw/tech/bsp/超详细【Uboot驱动开发】（二）uboot启动流程分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/超详细【Uboot驱动开发】（二）uboot启动流程分析.md) [[../../raw/tech/bsp/超详细【Uboot驱动开发】（二）uboot启动流程分析.md|原始文章]]
