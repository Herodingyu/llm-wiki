---
doc_id: power-management
title: 电源管理（Power Management）
page_type: concept
related_sources:
  - src-linux-power-management
  - src-linux-suspend-resume
  - src-linux-suspend-intro
  - src-arm-soc-bootflow-intro
related_entities: []
created: 2026-05-02
updated: 2026-05-02
tags: [concept, bsp, power]
---

# 电源管理（Power Management）

## 定义

电源管理是操作系统和硬件协同工作，在满足性能需求的前提下，通过各种技术手段降低系统功耗，延长电池续航，减少发热的机制集合。

## 核心理念

- **硬件设计决定功耗下限**
- **热设计决定功耗上限**
- **软件通过机制及策略逼近硬件下限**

## 电源管理层次

### 1. 系统级（System PM）
| 方式 | 状态 | 功耗 | 恢复时间 |
|------|------|------|----------|
| 运行 | 全速 | 高 | — |
| freeze | 冻结进程，CPU idle | 较高 | 最小 |
| standby | 移除 secondary CPU | 中等 | 小 |
| mem (STR) | CPU 断电，DDR 自刷新 | 低 | 中等 |
| disk (STD) | 所有设备断电 | 最低 | 大 |
| off | 关机 | 零 | 需重启 |

### 2. 设备级（Runtime PM）
- 设备不使用时进入低功耗
- 使用时快速恢复
- 基于 power domain 管理

### 3. CPU 级
| 技术 | 说明 |
|------|------|
| CPU Idle | 根据空闲时间选择 idle 等级 |
| CPU DVFS | 动态调整频率和电压 |
| CPU Hotplug | 动态插拔 CPU 核心 |

## Linux 电源管理框架

| 框架 | 功能 |
|------|------|
| Clock Framework | 时钟管理（pll/mux/div/gate） |
| Regulator Framework | 电压管理 |
| Power Domain Framework | 芯片 power domain 开关 |
| Reset Framework | 复位管理 |
| OPP Framework | 电压频率组合管理 |
| Runtime PM | 设备运行时电源管理 |
| PM QoS | 性能约束与功耗平衡 |

## 休眠唤醒流程

```
冻结进程 → 挂起设备 → 关闭中断
→ 挂起 secondary CPU → 挂起 primary CPU
→ 系统休眠

唤醒源触发 → 恢复 primary CPU
→ 恢复 secondary CPU → 恢复设备
→ 解冻进程 → 系统恢复
```

## 相关来源

- [[src-linux-power-management]] — 电源管理框架
- [[src-linux-suspend-resume]] — 系统休眠唤醒
- [[src-linux-suspend-intro]] — 休眠介绍
