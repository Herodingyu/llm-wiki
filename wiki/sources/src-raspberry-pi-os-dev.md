---
doc_id: src-raspberry-pi-os-dev
title: 在树莓派上动手写一个小 OS
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/综合能力训练：在树莓派上动手写一个小OS（1）：实验前准备.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, os, raspberry-pi, armv8, education]
---

## Summary

本文介绍了在树莓派上从零开始写一个小 OS（BenOS）的实验准备。参考 MIT xv6 和清华大学 ucore OS 的教学思路，通过 24 个实验分三个阶段（入门动手篇、进阶挑战篇、高手完善篇）逐步引导实现。硬件平台为树莓派 3B/4B（ARMv8/aarch64），软件模拟平台为 QEMU 4.2。

## Key Points

### 1. 实验目标
- 从零开始动手写一个小 OS（BenOS）
- 理解操作系统核心功能：启动、内存管理、进程管理等
- 参考 MIT xv6 和清华 ucore OS

### 2. 实验设备
- **硬件**: 树莓派 3B 或 4B
- **软件模拟**: QEMU 4.2
- **架构**: ARMv8（aarch64）
- **开发主机**: Ubuntu Linux 20.04
- **配件**: MicroSD 卡、USB 转串口线、J-Link 仿真器（可选）

### 3. 参考手册
- ARM Architecture Reference Manual, ARMv8, v8.4
- BCM2837 ARM Peripherals v2.1（树莓派 3B）
- BCM2711 ARM Peripherals v1（树莓派 4B）

### 4. 实验阶段
| 阶段 | 实验数 | 内容 |
|------|--------|------|
| 入门动手篇 | 5 | ARM64 架构、OS 启动、中断、进程管理 |
| 进阶挑战篇 | 12 | 物理内存管理、虚拟内存、缺页异常、进程调度 |
| 高手完善篇 | 7 | 完善 OS，增加使用价值 |

### 5. 开发流程
1. 在 Ubuntu 主机编写并编译代码
2. 在 QEMU 虚拟机上调试运行
3. 装载到树莓派上运行（可选）

### 6. 串口配置
- 地线（黑色）→ GPIO 第 6 引脚
- RXD（白色）→ GPIO 第 8 引脚
- TXD（绿色）→ GPIO 第 10 引脚

## Evidence

- 树莓派支持 40 个 GPIO 引脚
- QEMU 可模拟树莓派绝大部分硬件
- 无树莓派时可在 QEMU 上完成所有实验

## Key Quotes

> "本文节选自《奔跑吧linux内核 入门篇》第二版第16章"

> "动手写一个小OS会让我们对计算机底层技术有更深的理解，我们对操作系统中核心功能（比如系统启动、内存管理、进程管理等）的理解也会更深刻。本章介绍了24小实验来引导读者在树莓派上从零开始实现一个小OS，我们把这个OS命名为BenOS"

> "### 16.1.2 配置串口线

要在树莓派上运行BenOS实验代码，我们需要一根USB转串口线，这样在系统启动时便可通过串口输出信息来协助调试。读者可从网上商店购买USB转串口线，图16.1所示是某个厂商售卖的一款USB转串口线。串口一般有3根线。另外，串口还有一根额外的电源线（可选）"

> "树莓派4B采用的是博通BCM2711芯片，BCM2711芯片在BCM2837芯片的基础上做了如下改进"

## Open Questions

- 操作系统内核最小化实现的关键技术
- ARMv8 异常级别与系统调用的实现

## Related Pages

- [[os-development]]
- [[raspberry-pi]]
- [[armv8]]
- [[qemu]]
- [[xv6]]
