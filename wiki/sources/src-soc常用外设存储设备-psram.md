---
doc_id: src-soc常用外设存储设备-psram
title: SoC常用外设存储设备  PSRAM
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/SoC常用外设存储设备--PSRAM.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

本文系统介绍了PSRAM（Pseudo Static RAM，伪静态随机存储器）作为SoC常用外设存储设备的工作原理和应用特点。PSRAM融合了SRAM的简单接口和DRAM的高密度特性，通过内部自刷新机制隐藏了DRAM的复杂性，对外呈现类似SRAM的静态接口。文章首先对常用存储器进行了分类对比，包括易失性存储器（SRAM、DRAM、PSRAM）和非易失性存储器（Flash、EEPROM）。然后深入讲解了PSRAM的三种主流标准：JEDEC JESD251A（Profile 2.0）、HyperRAM和Xccela standards，分析了各自的接口特点和适用场景。文章还详细介绍了PSRAM的读写操作时序，包括命令格式、地址传输、数据读取流程以及关键控制信号（CE#、CLK、DQS、INST）的行为规范。PSRAM因其低引脚数、低功耗、高集成度和简化的控制器设计，广泛应用于物联网设备、可穿戴设备、音频处理和工业控制等领域。

## Key Points

### 1. 存储器分类对比

| 类型 | 代表 | 特点 | 应用场景 |
|------|------|------|----------|
| 易失性 - SRAM | 标准SRAM | 速度快、功耗高、面积大 | 缓存、高速缓冲 |
| 易失性 - DRAM | DDR/LPDDR | 密度高、需要刷新、复杂 | 主内存 |
| 易失性 - PSRAM | 伪静态RAM | 接口简单、内部自刷新 | IoT、可穿戴设备 |
| 非易失性 - Flash | NOR/NAND | 掉电保持、擦写次数有限 | 代码存储、数据存储 |

### 2. PSRAM核心特点
- **伪静态接口**：对外类似SRAM，无需外部刷新控制
- **内部自刷新**：集成刷新控制器，自动管理DRAM阵列刷新
- **高密度**：采用DRAM单元，存储密度远高于SRAM
- **低引脚数**：通常8-16个数据引脚，简化PCB设计
- **低功耗**：适合电池供电设备

### 3. PSRAM主流标准

| 标准 | 接口类型 | 特点 | 速率 |
|------|----------|------|------|
| JEDEC JESD251A | 同步xSPI | 标准化接口，兼容性好 | Profile 2.0支持更高频率 |
| HyperRAM | 8引脚HyperBus | Cypress/Infineon主推 | 最高250MB/s |
| Xccela |  xSPI兼容 | 低延迟、低功耗 | 适合音频/显示应用 |

### 4. 读写操作时序
- **读操作**：
  - CE#拉低选中设备
  - CLK提供时钟，传输命令和地址
  - DQS在指令和地址锁定后初始化为0
  - 第一个上升沿指示第一个byte有效数据
  - 读指令INST为0x00/20
  - 支持断续读取（Burst模式）

- **关键时序要求**：
  - Phase1期间CE#保持高，CLK保持低
  - 命令、地址、数据严格按时钟边沿对齐

### 5. 应用场景
- **物联网设备**：传感器节点、智能家居控制器
- **可穿戴设备**：智能手表、健康监测设备
- **音频处理**：语音记录仪、音频播放器缓存
- **工业控制**：HMI显示缓冲、数据日志
- **汽车电子**：仪表盘显示、ADAS数据缓冲

## Key Quotes

> "PSRAM作为常用的一种外设存储设备，所具有的优点使其广泛被应用。"

> "PSRAM目前支持的标准有JEDEC JESD251A(Profile 2.0)、HyperRAM、Xccela standards。"

> "在phase1时间范围内，CE#必须保持为高，CLK必须为低。"

> "DQS在指令INST、地址锁定后被初始化为0，在第一个上升沿出指示第一个1byte有效数据。"
