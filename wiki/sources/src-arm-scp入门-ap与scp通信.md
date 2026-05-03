---
doc_id: src-arm-scp入门-ap与scp通信
title: ARM SCP入门-AP与SCP通信
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/ARM SCP入门-AP与SCP通信.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, scp, arm, power-management, scmi, psci]
---

## Summary

本文深入解析了ARM SoC中应用处理器（AP）与系统控制处理器（SCP）之间的通信机制。文章从SoC多核架构出发，阐述了当Linux需要执行特权级电源管理操作（如关机、休眠）时，如何通过SMC指令陷入EL3，经PSCI协议转换，最终通过SCMI协议与SCP通信的完整软件协议栈。核心在于理解SMC/HVC指令的安全调用机制、PSCI电源状态协调接口、以及SCMI系统控制与管理接口的分层协作关系。

## Key Points

### 1. 通信整体流程
```
用户进程 --sysfs--> 内核(EAS/IPA) --PSCI--> ATF(BL31) --SCMI--> SCP --LPI--> 功耗器件
```

### 2. SMC指令（Secure Monitor Call）
- **作用**：生成同步异常，由EL3的安全监视器代码处理
- **安全通道**：SMC指令用于进入安全世界（EL3），处理特权级操作
- **非安全通道**：直接通信（如mailbox）不经过SMC
- **HVC指令**：Hypervisor调用，由EL2的Hypervisor处理
- **调用约定**：参数和返回值通过寄存器传递（r0-r7）

### 3. PSCI协议（Power State Coordination Interface）
- **定义**：ARM电源管理标准接口，操作系统用于与监控软件通信
- **核心功能**：
  - CPU空闲管理（idle management）
  - CPU热插拔（hotplug）
  - 系统关机和复位（system off/reset）
- **不包含**：DVFS动态电压频率调整、设备级电源管理
- **函数标识**：0x84000000起始，如PSCI_SYSTEM_OFF = 0x84000008

### 4. SCMI协议（System Control and Management Interface）
- **定义**：AP与SCP之间的通信协议，标准化系统控制和管理接口
- **传输层**：基于mailbox共享内存或门铃中断
- **协议层**：定义消息格式、命令集、响应机制
- **覆盖功能**：电源域控制、时钟管理、传感器访问、性能域管理

### 5. 软件协议栈分层
| 层级 | 组件 | 职责 |
|------|------|------|
| **用户层** | 用户空间服务 | 通过sysfs操作cpu hotplug、device pm |
| **内核层** | EAS/IPA/CPUFreq | 负载感知、频率选择、热管理 |
| **ATF层** | BL31 + PSCI | 安全世界切换、PSCI协议处理 |
| **SCP层** | SCP固件 + SCMI | 最终控制sensor/clock/power domain |

### 6. 安全通道 vs 非安全通道
- **安全通道**：经过SMC→EL3→PSCI→SCMI，用于关机/休眠等特权操作
- **非安全通道**：直接通过mailbox/SCMI通信，用于常规查询
- **选择依据**：根据操作的安全级别和需求选择通道

## Key Quotes

> "当Linux想要关机或者休眠的时候，这涉及到整个系统电源状态的变化，为了安全性Linux内核没有权利去直接执行了，需要陷入到EL3等级去执行。"

> "SMC指令用于生成一个同步异常，该异常由运行在EL3中的安全监视器代码处理。"

> "用户进程 --sysfs--> 内核（EAS、IPA）--PSCI--> ATF --SCMI-->SCP --LPI--> 功耗输出器件"

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/ARM SCP入门-AP与SCP通信.md) [[../../raw/tech/bsp/芯片底软及固件/ARM SCP入门-AP与SCP通信.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/ARM SCP入门-AP与SCP通信.md) [[../../raw/tech/bsp/芯片底软及固件/ARM SCP入门-AP与SCP通信.md|原始文章]]
