---
doc_id: src-聊聊soc启动-九-为uboot-添加新的board
title: add boot stage info to fdt
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（九） 为uboot 添加新的board.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文详细介绍了在U-Boot中添加新board的完整流程。首先阐述了U-Boot的代码层次架构（arch/cpu/board三级结构），与嵌入式系统硬件层次（目标板/SOC/处理器架构/CPU型号）一一对应。然后讲解了添加board的5个基本步骤，包括创建board目录、添加Kconfig/Makefile、定义配置项、添加头文件/defconfig、实现必要接口。最后以qemu virt machine（armv8架构）为例，完整演示了添加名为"mars/test"的自定义目标板的全过程，涵盖target配置选项、config头文件、dtb文件、board文件、defconfig配置文件的编写，以及spl semihosting启动支持的实现。

## Key Points

### 1. U-Boot 代码层次架构

U-Boot代码设计与硬件层次一一对应：

| 硬件层次 | U-Boot代码目录 | 说明 |
|----------|---------------|------|
| **处理器架构** | `arch/` | 如arm、mips、riscv等体系结构相关代码 |
| **CPU型号** | `arch/cpu/` | 特定CPU代码，如cortex-a53、a72 |
| **SOC** | `arch/cpu/<soc>/` | 芯片公司基于CPU架构设计的专用芯片 |
| **目标板** | `board/` | 包含系统运行所需所有组件的完整电路板 |

**设计原则**：添加新board时主要工作集中在board相关代码，arch和cpu代码通常可直接复用。

### 2. 最小系统运行条件

CPU能正常运行的基本条件：
1. 具有合适的电源和时钟
2. 程序代码被加载到合适的位置，CPU能够正常获取指令
3. 具有CPU用于数据操作的可读写内存
4. CPU被release reset

额外需求：
- 支持中断的系统：需要中断控制器
- 操作系统：需要timer定时器驱动进程切换

### 3. 添加Board的5个基本步骤

1. **创建board目录**：在`board/`目录下为新board添加目录
2. **添加编译系统配置**：为新目录添加`Kconfig`配置选项和`Makefile`编译选项
3. **定义配置项**：在`Kconfig`中定义配置项并添加支持的特性（CPU架构、型号等）
4. **添加配置文件**：增加配置相关头文件（`include/configs/`）和编译所需的`defconfig`文件
5. **实现接口**：在board目录下添加适当文件并实现必要接口

### 4. 关键配置选项说明

| 配置项 | 作用 | 影响路径 |
|--------|------|----------|
| `CONFIG_SYS_CPU` | 指定CPU | `arch/<arch>/cpu/<cpu>/` |
| `CONFIG_SYS_SOC` | 指定SOC | `arch/<arch>/cpu/<cpu>/<soc>/` |
| `CONFIG_SYS_VENDOR` | 指定厂商 | `board/<vendor>/common/`和`board/<vendor>/<board>/` |
| `CONFIG_SYS_BOARD` | 指定board | `board/<board>/`（若有vendor则为`board/<vendor>/<board>/`） |
| `CONFIG_SYS_CONFIG_NAME` | 指定目标 | `include/configs/<target>.h` |

### 5. 示例：QEMU Test Board (mars/test)

以armv8架构qemu virt machine为例，自定义目标板配置：

**Kconfig配置**（`arch/arm/Kconfig`）：
- 添加`TARGET_TESTBOARD`配置选项
- 选择`ARM64`、`DM`、`DM_SERIAL`、`PL01X_SERIAL`等
- 添加SPL支持相关选项

**Config头文件**（`include/configs/testboard.h`）：
- 定义SDRAM基地址（`0x40000000`）
- 配置初始化栈地址、加载地址、malloc长度
- 定义PL01x串口端口和时钟
- 设置U-boot启动地址、bootcmd命令序列
- 配置SPL相关参数（最大尺寸、栈地址等）

**Board文件**（`board/mars/test/testboard.c`）：
- 实现MMU内存映射（Flash、外设、RAM、PCI-E区域）
- 实现`board_init()`、`dram_init()`、`dram_init_banksize()`
- 实现`board_fdt_blob_setup()`获取QEMU生成的DTB
- 实现SPL boot设备选择（semihosting）

**SPL Semihosting支持**：
- 导出`smh_load_file`函数
- 修改`do_smhload`仅uboot编译
- 添加`BOOT_DEVICE_SEMIHOSTING`枚举
- 实现`spl_sh_load_image`加载u-boot.bin

## Key Quotes

> uboot需要支持众多的硬件，并且具有良好的可扩展性、可移植性和可维护性，因此必须要有一个设计良好的代码架构。代码架构的设计总是与软硬件架构密不可分的。

> 当我们开始一个全新的项目时，总是希望能先让系统能运行起来，然后再在此基础上为其添加更多的feature，这个只包含能让系统运行所需模块的系统，叫做最小系统。

> 一般cpu型号和处理器架构数量相对较少，如对于arm架构来说一般就是arm官方发布的这些型号。而soc型号就要多一些，它主要是各芯片公司基于特定cpu架构以及其它ip模块，设计的专用或通用芯片。最后就是以soc芯片为核心设计的目标板了。

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（九） 为uboot 添加新的board.md) [[../../raw/tech/bsp/聊聊SOC启动（九） 为uboot 添加新的board.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（九） 为uboot 添加新的board.md) [[../../raw/tech/bsp/聊聊SOC启动（九） 为uboot 添加新的board.md|原始文章]]
