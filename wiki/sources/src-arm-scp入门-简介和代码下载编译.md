---
doc_id: src-arm-scp入门-简介和代码下载编译
title: ARM SCP入门-简介和代码下载编译
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/ARM SCP入门-简介和代码下载编译.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, scp, arm, power-management, firmware]
---

## Summary

本文介绍了ARM SoC中的系统控制处理器（SCP, System Control Processor）概念，它是SoC中负责功耗和系统资源管理的"太上皇"级组件。文章从SoC集成化带来的资源争夺问题出发，阐述了ARM PCSA（Power Control System Architecture）规范，详细解析了SCP的硬件架构、提供的服务（系统初始化、电源管理、事件响应、系统感知）、安全优势，以及电源管理软件协议栈。SCP作为一个独立的Cortex-M系列微控制器，拥有独立的固件和硬件资源，负责从AP（应用处理器）中抽象出电源和系统管理任务，实现集中式功耗控制。

## Key Points

### 1. 为什么需要SCP
- **SoC复杂性**：现代SoC集成大量模块（ISP、DSP、GPU、NPU等），资源争夺严重
- **功耗管理复杂**：涉及时钟、电源域、传感器、事件等多方面协调
- **CPU无法统管**：某些场景（如休眠关机）CPU自身需要关闭，无法管理其他模块
- **SCP角色**：独立的系统控制处理器，拥有最高资源管理权限

### 2. ARM PCSA规范
- **全称**：Power Control System Architecture（功耗控制系统架构）
- **目的**：规范芯片功耗控制的逻辑实现，提供标准基础设施组件和方法
- **内容**：电压/电源/时钟划分、电源状态和模式、电源控制框架、低功耗Q-channel/P-channel接口

### 3. SCP架构与服务
- **硬件**：通常是Cortex-M4等微处理器 + 外围逻辑电路
- **独立性**：拥有私有内存、计时器、中断控制器、系统配置寄存器
- **核心服务**：
  1. **系统初始化**：上电复位、电源顺序控制、AP启动
  2. **OSPM定向操作**：电压变化、电源控制、时钟管理
  3. **事件响应**：计时器唤醒、GIC唤醒、调试访问、看门狗复位
  4. **系统感知**：共享资源协调、传感器监控、热保护、操作点优化

### 4. 电源域与电压域
- **电压域（Voltage Domain）**：使用同一个电压源的模块合集
- **电源域（Power Domain）**：同一个电压域内，共享相同电源开关逻辑的模块合集
- 关系：一个电压域可包含多个电源域，实现精细化电源控制

### 5. SCP安全优势
- 独立硬件模块 + 独立固件，内部资源不可被外界控制
- 控制公共资源（时钟、电源、传感器），具有高权限
- 配合安全引导，可作为可信软件模块

### 6. 代码编译
- **开源仓库**：`github.com/ARM-software/SCP-firmware`
- **编译**：`make PRODUCT=<platform> MODE=<mode>`
- **输出**：SCP固件二进制文件

## Key Quotes

> "在现代SoC芯片中CPU只能说是皇帝，掌握资源命脉的还得是太上皇SCP。"

> "SCP用于从应用程序处理器中抽象出电源和系统管理任务，配合操作系统的功耗管理软件或驱动，来完成顶层的功耗控制。"

> "由于其是一个独立的硬件模块和固件，其内部资源例如内存、外设不能够被外界控制，具有较高的权限。"

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/ARM SCP入门-简介和代码下载编译.md) [[../../raw/tech/bsp/芯片底软及固件/ARM SCP入门-简介和代码下载编译.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/ARM SCP入门-简介和代码下载编译.md) [[../../raw/tech/bsp/芯片底软及固件/ARM SCP入门-简介和代码下载编译.md|原始文章]]
