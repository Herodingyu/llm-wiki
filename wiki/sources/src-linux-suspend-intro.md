---
doc_id: src-linux-suspend-intro
title: Linux 系统休眠介绍
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/linux系统休眠（一）休眠介绍.md
domain: tech/bsp
created: 2026-05-02
updated: 2026-05-02
tags: [bsp, linux, suspend, power-management]
---

## Summary

本文基于 AARCH64 + Linux 5.14.0-rc5，介绍了 Linux 系统休眠的基本概念。系统休眠的本质是保存当前运行状态，设置低功耗模式，唤醒时恢复状态。休眠方式由浅到深：freeze（suspend to idle）、standby（suspend to standby）、mem（suspend to RAM）、disk（suspend to disk/hibernate）。文章还介绍了休眠的主要任务（保存 CPU 和设备上下文）和总体流程。

## Key Points

### 1. 休眠方式对比
| 方式 | 功耗 | 唤醒延迟 | 特点 |
|------|------|----------|------|
| freeze | 较高 | 最小 | 冻结进程，CPU idle |
| standby | 中等 | 小 | 移除 secondary CPU |
| mem (STR) | 低 | 中等 | CPU 断电，DDR 自刷新 |
| disk (STD) | 最低 | 大 | 所有设备断电，上下文存磁盘 |

### 2. 休眠本质
- 保存系统当前运行状态
- 设置低功耗模式
- 唤醒时通过保存的状态恢复系统

### 3. 休眠主要任务
**CPU 上下文**
- 进程上下文
- 中断上下文
- CPU 全局控制寄存器（如 sctlr_elx）

**设备上下文**
- 各设备自行实现
- 内核提供统一框架（回调函数）

### 4. 休眠总体流程
```
冻结进程 → 挂起设备 → 关闭中断
→ 挂起 secondary CPU → 挂起 primary CPU
→ 系统进入休眠
```

### 5. Platform 回调
```c
struct platform_s2idle_ops {
    int (*begin)(void);
    int (*prepare)(void);
    int (*prepare_late)(void);
    bool (*wake)(void);
    void (*restore_early)(void);
    void (*restore)(void);
    void (*end)(void);
};
```

### 6. 查看支持方式
```bash
cat /sys/power/state
# Ubuntu: freeze standby mem disk
# QEMU ARM64: freeze mem
```

## Evidence

- AARCH64 架构
- Linux 5.14.0-rc5
- Power domain 划分：aon domain 一般不休眠时不断电
- Hibernate 时包含 aon domain 在内的整个系统断电

## Open Questions

- SOC 上 power domain 的划分策略
- 休眠时 DDR 自刷新的实现细节

## Related Pages

- [[suspend-resume]]
- [[power-management]]
- [[cpu-idle]]
- [[ddr-self-refresh]]
