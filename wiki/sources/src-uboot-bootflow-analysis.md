---
doc_id: src-uboot-bootflow-analysis
title: U-Boot 启动流程分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/超详细【Uboot驱动开发】（二）uboot启动流程分析.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, uboot, bootloader, bootflow]
---

## Summary

本文深入分析了 U-Boot BL2 阶段的启动流程，从链接脚本 `u-boot.lds` 的入口函数 `_start` 开始，经过 `board_init_f` 板级前置初始化、`relocate_code` 重定向、`board_init_r` 板级后置初始化，最终到达 `main_loop` 主循环。详细讲解了每个阶段的关键代码和初始化序列。

## Key Points

### 1. 启动阶段划分
- **BL1 (SPL)**: 基础配置和设备初始化，搬运 U-Boot 到内存
- **BL2 (U-Boot)**: 初始化外部设备，引导 Kernel 启动

### 2. 链接脚本与入口
- `u-boot.lds` 中 `ENTRY(_start)` 指定入口
- `_start` 定义在 `arch/arm/lib/vectors.S`
- `.text` 段包含异常向量表和启动函数

### 3. board_init_f 前置初始化
- 调用 `init_sequence_f` 初始化序列
- 包括：串口、定时器、设备树、DM 驱动模型等
- 末尾执行多个 `reloc_xxx` 函数实现重定向

### 4. relocate_code 重定向
- **为什么**: U-Boot 存储在只读存储器，需要拷贝到 DDR；为 Kernel 腾空间
- **步骤**: 空间划分 → 计算偏移 → relocate global_data → relocate U-Boot → 修改变量 label → relocate 中断向量表
- `setup_reloc` 用于查看重定向后的地址（方便仿真）

### 5. board_init_r 后置初始化
- 调用 `init_sequence_r` 初始化序列
- 包括：initr_dm (DM 模型)、initr_mmc (MMC 驱动) 等
- 最终执行 `run_main_loop`

### 6. main_loop 主循环
- `bootdelay_process`: 加载延时处理，获取 bootcmd
- `autoboot_command`: 判断是否有按键按下，决定执行 bootcmd 或进入 cli
- `cli_loop`: 命令行交互模式（死循环）

## Evidence

```c
// board_init_f 核心代码
void board_init_f(ulong boot_flags) {
    gd->flags = boot_flags;
    if (initcall_run_list(init_sequence_f))
        hang();
}

// main_loop 核心代码
void main_loop(void) {
    s = bootdelay_process();
    autoboot_command(s);
    cli_loop();
}
```

## Key Quotes

> "打开图片，结合文档、图片、代码进行理解！"

> "setup\_reloc——重定向地址查看（仿真有关）"

> "记得对照文章开始的执行流程图哦！"

## Open Questions

- BL1 (SPL) 阶段的详细启动流程
- 不同架构（ARMv7/ARMv8/RISC-V）的启动差异

## Related Pages

- [[u-boot]]
- [[bootloader]]
- [[soc-boot]]
- [[uboot-dm]]
