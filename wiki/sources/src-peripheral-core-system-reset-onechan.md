---
doc_id: src-peripheral-core-system-reset-onechan
title: 三类复位：外设复位、核复位与系统级复位的本质差异
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/peripheral-core-system-reset-onechan.md
domain: tech/soc-pm
created: 2026-05-04
updated: 2026-05-04
tags: [soc-pm]
---

## Summary

> 来源：微信公众号「OneChan」 > 原文链接：https://mp.weixin.qq.com/s/GNdptYjZeBQ6YSzR-_AVNw > 记录时间：2026-05-04

## Key Points

### 1. 核心观点
复位的本质是：**硬件复位控制器向目标模块下发异步/同步清零信号，强制模块寄存器、状态机、流水线、缓存、锁存器回到芯片出厂默认上电初始态**。 三类复位的核心差异在于：**作用范围、电源/时钟关联性、寄存器影响域、流水线与上下文保留、复位触发源、故障隔离能力**。

### 2. 三类复位底层定义


### 3. 1. 外设复位（Peripheral Reset）
**本质**：最小粒度的局部模块复位，仅针对独立外设 IP 的本地状态机、控制寄存器、FIFO、中断锁存、硬件计数器做强制初始化。 **不触碰**：内核、总线矩阵、系统全局配置、内存、时钟根节点。 | 维度 | 表现 |

### 4. 2. 核复位（Core Reset / CPU Core Reset）
**本质**：CPU 内核域专属复位，只复位处理器核心内部硬件资源，**保留片上总线、全局外设、SRAM/Flash、系统控制寄存器、时钟树、电源配置**。 | 维度 | 表现 | |------|------|

### 5. 3. 系统级复位（System Reset）
**本质**：全域半完整复位，覆盖**内核 + 总线 + 全局外设 + 系统控制层**，是除备份电源域（BKP）、独立低速时钟（LSE）以外的大面积系统初始化。 | 维度 | 表现 | |------|------|

## Evidence

- Source: [原始文章](raw/tech/soc-pm/peripheral-core-system-reset-onechan.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/peripheral-core-system-reset-onechan.md)
