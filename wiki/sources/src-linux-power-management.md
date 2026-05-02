---
doc_id: src-linux-power-management
title: Linux 电源管理框架
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/一文搞懂Linux电源管理（合集）.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, power-management, pm]
---

## Summary

本文系统介绍了 Linux 电源管理框架。从芯片低功耗机制（power domain、reset、clock、休眠唤醒、cpu idle、ddr 自刷新）到各个软件框架（clock framework、regulator framework、power domain framework、reset framework、opp framework、runtime pm、device dvfs、sleep、cpu idle、cpu dvfs、cpu hotplug、pm qos）。硬件设计决定功耗下限，热设计决定功耗上限，软件通过机制和策略逼近硬件下限。

## Key Points

### 1. 电源管理分类
- **系统不工作时**: 休眠（suspend）、关机（power off）、复位（reboot）
- **运行时不必要功耗**: runtime pm、dvfs、cpu hotplug、cpu idle、clock gate、power gate、reset
- **性能与功耗平衡**: pm qos

### 2. 硬件低功耗机制
- Power domain
- Reset
- Clock
- 系统休眠/唤醒
- CPU 低功耗
- DDR 自刷新

### 3. 软件框架
| 框架 | 功能 |
|------|------|
| Clock framework | 时钟管理（pll/mux/div/gate） |
| Regulator framework | 电压管理（pmic/corebuck） |
| Power domain framework | 芯片 power domain 开关 |
| Reset framework | 复位管理 |
| OPP framework | 电压频率组合管理 |
| Runtime PM | 设备运行时电源管理 |
| Device DVFS | 设备调频调压 |
| Sleep | 系统休眠唤醒 |
| CPU idle | CPU 空闲状态管理 |
| CPU DVFS | CPU 调频调压 |
| CPU hotplug | CPU 热插拔 |
| PM QoS | 性能约束与功耗平衡 |

### 4. 核心理念
- 硬件设计决定功耗下限
- 热设计决定功耗上限
- 软件通过机制及策略逼近硬件功耗下限

## Evidence

- PMIC 芯片控制各器件电压、电流大小及开关
- 外设支持低功耗模式或供电可开关
- 上层 service 协调各 service 进入休眠/唤醒

## Open Questions

- Runtime PM 与系统休眠的协作关系
- Android Doze 模式与 Linux 电源管理的结合

## Related Pages

- [[power-management]]
- [[runtime-pm]]
- [[dvfs]]
- [[cpu-idle]]
- [[suspend-resume]]
