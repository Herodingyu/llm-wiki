---
doc_id: src-cross-team-debugging-onechan
title: 跨团队协同调试：破解"这不是我的问题"死循环
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/cross-team-debugging-onechan.md
domain: tech/soc-pm
created: 2026-05-09
updated: 2026-05-09
tags: [soc-pm]
---

## Summary

> 来源：微信公众号「OneChan」 > 原文链接：https://mp.weixin.qq.com/s/nY0UPj0MC91XoW2lS6MBNQ > 记录时间：2026-05-04

## Key Points

### 1. 核心问题
当问题真的出现时，如何运用**系统化的方法论和沟通艺术**，快速穿越指责，直抵根因，并化每一次危机为团队的共同财富？

### 2. "这不是我的问题"死循环的本质
跨团队调试中最耗时的不是技术问题，而是**责任边界模糊导致的心理防御机制**： - 硬件团队："仿真都通过了，肯定是软件配错了" - 软件团队："我按手册写的，肯定是硬件有 bug" - 验证团队："用例都过了，肯定是集成环境有问题"

### 3. 系统化调试方法论


### 4. 第一步：建立"问题共有"文化
**错误做法**："你们团队的 IP 有问题" **正确做法**："我们遇到了一个需要一起解决的问题" 关键转变： - 用"我们"代替"你们" - 用"现象"代替"错误" - 用"一起排查"代替"你们自查"

### 5. 第二步：创建单一事实源（Single Source of Truth）
所有团队共享同一个调试日志： ``` [时间戳] [团队] [现象] [已排查项] [下一步] 2026-05-04 14:32 HW 总线挂死 电源/时钟正常 排查复位时序 2026-05-04 14:45 SW 配置寄存器后挂死 地址/volatile已确认 排查解锁序列

## Evidence

- Source: [原始文章](raw/tech/soc-pm/cross-team-debugging-onechan.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/cross-team-debugging-onechan.md)
