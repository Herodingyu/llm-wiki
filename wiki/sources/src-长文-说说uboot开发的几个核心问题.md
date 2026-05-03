---
doc_id: src-长文-说说uboot开发的几个核心问题
title: 【长文】说说UBOOT开发的几个核心问题
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/【长文】说说UBOOT开发的几个核心问题.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

本文是一篇面向嵌入式初学者的U-Boot入门长文，作者李壮从为什么需要U-Boot入手，系统讲解了U-Boot的核心概念和工作原理。文章首先对比了PC（BIOS启动）、嵌入式Linux（U-Boot启动）和Android系统的启动流程差异，明确了U-Boot作为通用bootloader的核心价值：初始化硬件、加载操作系统内核、提供系统级服务。随后介绍了U-Boot的发展历史（SourceForge开源项目）、版本命名规则（从u-boot1.3.4到u-boot-2010.06时间戳命名）和可移植性特点（源码级和板级两级移植）。文章重点讲解了U-Boot的工作原理，包括跨平台运行机制、生命周期管理（启动后无法返回）、以及.bin镜像的构成。在工作方式部分，详细介绍了shell命令行、环境变量体系，以及U-Boot对Flash和DDR的分区策略。最后系统梳理了常用命令（printenv/setenv/saveenv/ping/tftp/movi/bootm等）和环境变量（bootdelay/bootcmd/bootargs/ipaddr等）的使用方法。

## Key Points

### 1. 为什么需要U-Boot

#### 1.1 不同系统的启动对比

| 系统 | 启动组件 | 启动介质 | 内存初始化 |
|------|---------|---------|-----------|
| PC | BIOS | 预置在主板 | 上电时已初始化DDR |
| 嵌入式Linux | U-Boot | Flash（Nor/Nand/SD/eMMC） | U-Boot初始化DDR |
| Android | U-Boot + 两阶段 | Flash | U-Boot初始化DDR |

**PC启动流程**：BIOS（NorFlash）→ 初始化DDR → 初始化硬盘 → 从硬盘读取OS到DDR → 跳转执行OS

**嵌入式启动流程**：U-Boot（Flash）→ 初始化DDR → 初始化Flash → 从Flash读取OS到DDR → 跳转执行OS

#### 1.2 U-Boot的核心作用

1. **启动操作系统内核**：终极目标
2. **部署整个系统**：U-Boot、Kernel、rootfs等在Flash中的部署
3. **初始化硬件**：Flash、LCD、网卡等外设初始化
4. **提供人机交互**：命令行接口供调试和开发使用

### 2. U-Boot是什么

#### 2.1 基本信息

- **来源**：SourceForge开源项目，社区共同维护
- **定位**：通用bootloader（Universal Bootloader）
- **现状**：嵌入式行业事实标准，大部分SoC默认支持

#### 2.2 版本命名

| 旧命名 | 新命名 | 说明 |
|--------|--------|------|
| u-boot1.3.4 | u-boot-2010.06 | 时间戳命名更清晰 |

**核心架构稳定**：新版本主要增加对新芯片的支持，旧版本对新芯片可能不支持。

#### 2.3 可移植性

| 移植层级 | 含义 |
|---------|------|
| 源码级 | 不同SoC的底层汇编代码适配 |
| 板级 | 特定开发板的外设配置 |

**重要**：U-Boot的可移植性指源码可移植，而非二进制可移植。

### 3. U-Boot的工作原理

#### 3.1 核心能力

| 能力 | 说明 |
|------|------|
| 跨平台运行 | 针对不同启动介质（SD/NorFlash/NandFlash）适配 |
| 加载内核 | 准备启动参数，加载内核镜像到指定内存地址 |
| 系统部署 | 记录系统各组件在Flash中的位置 |
| 硬件初始化 | 初始化SoC内部模块和外设（LCD、网卡等） |

#### 3.2 生命周期

- **U-Boot是单任务程序**：启动后无法返回，执行内核后U-Boot自身被覆盖
- **与内核的区别**：执行U-Boot命令后可返回U-Boot；执行内核后无法返回
- **唯一出口**：启动操作系统内核

#### 3.3 uboot.bin构成

| 特性 | 说明 |
|------|------|
| 大小 | 180KB-400KB（远大于16KB，不可能全部写死） |
| 构成 | 多个.c/.h文件编译链接生成的二进制镜像 |
| 运行 | 被加载到内存后逐条指令执行 |

### 4. U-Boot工作方式

#### 4.1 Shell命令行

- U-Boot提供类似Linux终端的shell环境
- 命令集不同（如Linux有`ls`，U-Boot可能无）
- 通过`help+命令名`查询命令用法

#### 4.2 环境变量

**特性**：
- 类比Linux的全局变量
- 字符串格式显示
- 存储在Flash专用分区，掉电不丢失
- 启动时从Flash读取到DDR中运行

### 5. Flash与DDR分区

#### 5.1 Flash分区

| 分区 | 起始 | 大小 | 说明 |
|------|------|------|------|
| U-Boot | Flash起始 | 512KB-1MB | 必须完整保留 |
| 环境变量 | U-Boot后 | 32KB | 存储环境变量 |
| Kernel | 环境变量后 | 3MB-5MB | 内核镜像 |
| rootfs | Kernel后 | 剩余空间 | 根文件系统 |

**关键原则**：
- 分区头部起始、尾部结尾
- U-Boot在Flash头部，位置固定
- 分区大小由系统部署工程师自定义

#### 5.2 DDR分区注意事项

- DDR是动态内存，无固化分区概念
- 内核运行时会接管内存管理
- 加载内核到DDR时需避开U-Boot已占用的内存区域

### 6. 常用命令详解

| 命令 | 功能 | 示例 |
|------|------|------|
| `printenv`/`print` | 打印环境变量 | `print ipaddr` |
| `setenv`/`set` | 设置环境变量 | `set ipaddr 192.168.1.110` |
| `saveenv`/`save` | 保存环境变量到Flash | `saveenv` |
| `ping` | 测试网络连通性 | `ping 192.168.1.10` |
| `tftp` | 通过网络加载文件 | `tftp 0x30000000 zImage` |
| `movi`/`mmc` | SD/eMMC读写 | `movi read kernel 0x30008000` |
| `nand` | NandFlash读写 | - |
| `md` | 内存显示 | `md 0x30000000` |
| `mw` | 内存写入 | `mw 0x30000000 0x55` |
| `mm` | 内存修改 | `mm 0x30000000` |
| `bootm` | 启动内核（带参数） | `bootm 0x30008000` |
| `go` | 直接跳转执行 | `go 0x30008000` |

**bootm vs go**：
- `bootm`：完整的内核启动流程，解析镜像头、传递参数
- `go`：简单的PC跳转，不处理内核镜像格式

### 7. 关键环境变量

| 变量 | 含义 | 示例 |
|------|------|------|
| `bootdelay` | 自动启动倒计时（秒） | `set bootdelay 3` |
| `ipaddr` | 本机IP地址 | `set ipaddr 192.168.1.110` |
| `serverip` | TFTP服务器IP | `set serverip 192.168.1.10` |
| `gatewayip` | 网关地址 | - |
| `netmask` | 子网掩码 | - |
| `ethaddr` | MAC地址 | - |
| `bootcmd` | 自动启动命令 | `movi read kernel 30008000; bootm 30008000` |
| `bootargs` | 内核启动参数 | `console=ttySAC0,115200 root=/dev/mmcblk0p2 rw` |

**bootargs关键参数**：
- `console=ttySAC0,115200`：串口控制台
- `root=/dev/mmcblk0p2`：根文件系统位置
- `rw`：可读写
- `init=/linuxrc`：init进程路径
- `rootfstype=ext3`：文件系统类型

**环境变量修改流程**：
1. `set var value`：修改内存中的环境变量
2. `saveenv`：同步写入Flash（必须执行，否则掉电丢失）

## Key Quotes

> "uboot的最终目标是启动操作系统内核。"

> "嵌入式系统与PC机启动过程几乎没有差别，只是BIOS变成了uboot，硬盘变成了Flash。"

> "uboot是单任务程序，uboot启动时SoC就会单方面杀死uboot。"

> "uboot的生命期就是可以自动退出，uboot的唯一出口就是启动操作系统内核。"

> "修改环境变量一定要save，否则下次开机就没了。"

## Evidence

- Source: [原始文章](raw/tech/bsp/【长文】说说UBOOT开发的几个核心问题.md) [[../../raw/tech/bsp/【长文】说说UBOOT开发的几个核心问题.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/【长文】说说UBOOT开发的几个核心问题.md) [[../../raw/tech/bsp/【长文】说说UBOOT开发的几个核心问题.md|原始文章]]
