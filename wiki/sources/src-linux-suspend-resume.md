---
doc_id: src-linux-suspend-resume
title: Linux 系统休眠唤醒
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/一文搞懂linux系统休眠唤醒.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, suspend, resume, power-management]
---

## Summary

本文详细介绍了 Linux 系统休眠唤醒机制。系统休眠能让系统在不需要工作时进入功耗极低的状态，唤醒时能快速恢复。Linux 提供 freeze、standby、STR（suspend to RAM）、STD（suspend to disk）四种休眠方式，通过 /sys/power/state 文件节点控制。休眠唤醒涉及 PM core 框架、device PM 框架、进程 freeze&thaw、wakeup source、设备 suspend&resume、syscore suspend&resume、DDR 自刷新等。

## Key Points

### 1. 休眠方式
| 方式 | 特点 |
|------|------|
| freeze | 冻结进程，挂起设备，CPU 进入 idle |
| standby | 移除 secondary CPU，primary CPU 进入 standby |
| mem (STR) | 保存 CPU 上下文到内存，CPU 断电，DDR 自刷新 |
| disk (STD/hibernate) | 保存上下文到磁盘，所有设备断电 |

### 2. 框架组成
- **Services**: Power manager service（wakelock 管理）+ 普通 app service
- **PM Core**: wakelock、wakeup_count、suspend 实现
- **PM Driver**: 设备驱动 suspend&resume、架构驱动低功耗操作

### 3. 休眠流程
```
echo mem > /sys/power/state
→ 冻结进程
→ 挂起设备（suspend）
→ 关闭中断
→ 挂起 secondary CPU
→ 挂起 primary CPU
→ 系统进入休眠
```

### 4. 唤醒流程
```
唤醒源触发（按键、RTC、USB 等）
→ 恢复 primary CPU
→ 恢复 secondary CPU
→ 恢复中断
→ 恢复设备（resume）
→ 解冻进程
→ 系统恢复运行
```

### 5. 调用链
- `echo mem > /sys/power/state`
- `state_store()` → `pm_suspend()` → `enter_state()`
- `suspend_devices_and_enter()` → `platform_suspend_enter()`

## Evidence

- 查看支持休眠方式：`cat /sys/power/state`
- Ubuntu 支持 freeze、standby、mem、disk
- QEMU ARM64 支持 freeze、mem

## Open Questions

- 不同架构（ARM/x86）休眠实现的差异
- 唤醒源（wakeup source）的配置和管理

## Related Pages

- [[suspend-resume]]
- [[power-management]]
- [[wakeup-source]]
- [[pm-core]]
