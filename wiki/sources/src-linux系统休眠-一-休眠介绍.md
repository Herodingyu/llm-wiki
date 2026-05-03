---
doc_id: src-linux系统休眠-一-休眠介绍
title: Linux系统休眠（一）休眠介绍
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/linux系统休眠（一）休眠介绍.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp, linux, power-management, suspend, aarch64]
---

## Summary

本文基于AARCH64架构和Linux内核5.14.0-rc5，系统介绍了Linux系统休眠（Suspend）机制。文章从日常使用的休眠场景出发，详细解析了四种休眠方式（freeze、standby、mem、disk）的特点和适用场景，阐述了休眠的核心任务（保存CPU和设备上下文），以及完整的休眠唤醒流程。核心在于理解休眠的本质是保存系统运行状态并进入低功耗模式，唤醒时通过保存的状态恢复执行，涉及进程冻结、设备挂起、中断关闭、CPU挂起等多个阶段。

## Key Points

### 1. 休眠的基本概念
- **目的**：降低功耗，暂停工作后可恢复先前状态
- **本质**：保存系统当前运行状态 → 进入低功耗模式 → 唤醒时恢复状态
- **vs 关机**：休眠需要保存/恢复上下文，流程更复杂

### 2. 四种休眠方式（由浅到深）

| 方式 | 名称 | 功耗 | 唤醒延迟 | 特点 |
|------|------|------|----------|------|
| **freeze** | Suspend to Idle | 较高 | 最小 | 冻结进程，挂起设备，CPU进入idle状态 |
| **standby** | Suspend to Standby | 中等 | 较小 | freeze + 移除secondary CPU，primary CPU进入standby |
| **mem** | Suspend to RAM | 较低 | 较大 | CPU上下文保存到内存，CPU断电，DDR自刷新 |
| **disk** | Suspend to Disk (Hibernate) | 最低 | 最大 | 上下文保存到磁盘，所有硬件断电 |

- **检查支持**：`cat /sys/power/state`
- **一般支持**：freeze和mem必支持，standby和disk可选

### 3. 休眠的主要任务
**保存上下文：**
- **CPU上下文**：进程上下文、中断上下文、全局控制寄存器（如sctlr_elx）
- **设备上下文**：各设备的配置信息和运行状态
- **框架机制**：内核提供统一框架，设备驱动实现各自的回调函数

### 4. 休眠唤醒总体流程
```
冻结进程 → 挂起设备 → 关闭中断 → 挂起secondary CPU → 挂起primary CPU → 休眠
唤醒：恢复primary CPU → 恢复secondary CPU → 开启中断 → 恢复设备 → 恢复进程
```

**平台回调函数：**
- `platform_s2idle_ops`：freeze方式回调
- `platform_suspend_ops`：其他方式回调
- 包含begin/prepare/prepare_late/wake/restore/finish等阶段

**设备回调函数：**
- `dev_pm_ops`：prepare/suspend/suspend_late/resume/resume_early/complete

### 5. Power Domain管理
- **aon domain**：一般休眠中保持供电（支持唤醒）
- **hibernate**：整个系统断电（包括aon domain），从磁盘恢复

## Key Quotes

> "休眠的本质是保存系统当前的运行状态，然后将其设置为一个低功耗模式。"

> "睡的越深功耗越低，相应的唤醒延迟越大，睡的越浅功耗越高，而其唤醒延迟也越小。"

> "系统休眠不仅需要考虑保存cpu相关的上下文，还需要保存设备相关的上下文。"

## Evidence

- Source: [原始文章](raw/tech/bsp/linux系统休眠（一）休眠介绍.md) [[../../raw/tech/bsp/linux系统休眠（一）休眠介绍.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/linux系统休眠（一）休眠介绍.md) [[../../raw/tech/bsp/linux系统休眠（一）休眠介绍.md|原始文章]]
