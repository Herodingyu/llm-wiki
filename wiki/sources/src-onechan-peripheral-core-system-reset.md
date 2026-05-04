---
doc_id: src-onechan-peripheral-core-system-reset
title: "三类复位：外设复位、核复位与系统级复位"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/peripheral-core-system-reset-onechan.md
domain: tech/soc-pm
created: 2026-05-04
updated: 2026-05-04
tags: [soc-pm, reset, peripheral-reset, core-reset, system-reset, por, cortex-m, scb, aircr, hardfault, onechan]
---

# 三类复位：外设复位、核复位与系统级复位

## 来源

- **原始文件**: raw/tech/soc-pm/peripheral-core-system-reset-onechan.md
- **原文链接**: https://mp.weixin.qq.com/s/GNdptYjZeBQ6YSzR-_AVNw
- **来源平台**: 微信公众号「OneChan」
- **作者**: OneChan
- **提取日期**: 2026-05-04

## 文章类型

技术深度 / 芯片复位机制详解

## 核心主题

从 Cortex-M 内核硬件角度，彻底拆解外设复位、核复位、系统级复位三类复位的本质差异，含完整时序状态机和可直接使用的寄存器操作代码。

## 关键内容

### 三类复位对比

| 维度 | 外设复位 | 核复位 | 系统级复位 |
|------|---------|--------|-----------|
| 作用边界 | 单个外设 IP | 仅 CPU 核心内部 | 内核 + 全外设 + 总线 + 系统配置 |
| 寄存器影响 | 外设 CR/SR/FIFO 清零 | 内核寄存器、NVIC、流水线清零 | 全局外设 + 内核 + 时钟配置全部清零 |
| 代码上下文 | CPU 正常执行 | PC/SP 重置，程序从头执行 | 程序重头启动，RAM 随机化 |
| 时钟树 | 全局时钟不变 | 完全保留 | 高速时钟重置 |
| SRAM/Flash | 完整保留 | 完整保留 | SRAM 数据丢失 |
| 故障范围 | 单外设卡死 | 内核死循环、Fault | 全局总线异常、时钟错乱 |

### 与 POR 的边界区分
- **三类复位**：热复位，主电源不掉电，保留备份域
- **上电复位 POR**：冷启动，复位备份域、调试模块、熔丝配置

### 工程避坑口诀
- 外设卡死用局部，内核跑飞用核复，时钟乱、全局异常用系统复位

### 实战代码
- **外设复位**：`Peripheral_Reset(&RCC_APB1RSTR, RCC_APB1_UART2RST)`
- **核复位**：`Core_Only_Reset()` — 只触发核心域
- **系统级复位**：`System_Global_Reset()` — 触发芯片系统复位链路
- **HardFault 自动触发核复位**：兜底故障恢复方案

### 关键安全机制
- **AIRCR 密钥**：必须写入 0x5FA，否则复位位写入无效
- **复位延时**：外设复位必须加 NOP 延时，防止"复位未完成就写寄存器"导致硬件锁死

## 技术亮点

| 亮点 | 说明 |
|------|------|
| 时序状态机 | 外设/核/系统三级复位的硬件行为流转图 |
| 寄存器代码 | 可直接在 Cortex-M3/M4/M7 上运行的复位函数 |
| 故障兜底 | HardFault_Handler 自动触发核复位的工程实践 |
| 维度对比表 | 6 个关键维度的完整对比 |

## 质量评估

| 维度 | 评分 | 说明 |
|------|------|------|
| 技术深度 | ⭐⭐⭐⭐⭐ | 从硬件复位控制器到软件复位函数的完整链路 |
| 工程实用性 | ⭐⭐⭐⭐⭐ | 可直接使用的三类复位代码 |
| 系统性 | ⭐⭐⭐⭐⭐ | 定义 → 对比 → 代码 → 避坑口诀 |
| 可读性 | ⭐⭐⭐⭐ | 层次清晰，口诀易记 |

## 建议行动

- ✅ 创建 [[reset-types]] 概念词条
- ✅ 将三类复位代码纳入芯片启动代码模板
- ✅ 将 HardFault 自动核复位作为标准工程实践
- ✅ 创建 [[scb]] 概念词条（系统控制块）

## Related Pages

- [[reset-types]] — 复位类型概念词条（待创建）
- [[scb]] — 系统控制块（待创建）
- [[src-onechan-register-types-ro-rw-wo]] — 寄存器类型
- [[src-onechan-register-offset-alignment-stride]] — 寄存器偏移/对齐/Stride
- [[src-onechan-multicore-ipc]] — 多核 IPC
- [[src-onechan-bootrom-first-gate-of-chip-firmware]] — BootROM

## 开放问题

- 不同芯片厂商（STM32、NXP、英飞凌）的复位架构是否存在系统性差异？
- 车规芯片的复位安全机制（如英飞凌 SMU 复位监控）是否值得单独整理？
