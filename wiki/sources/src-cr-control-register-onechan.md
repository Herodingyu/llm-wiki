---
doc_id: src-cr-control-register-onechan
title: 控制寄存器 CR 的本质：软件定义硬件行为的"开关矩阵"
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/cr-control-register-onechan.md
domain: tech/soc-pm
created: 2026-05-04
updated: 2026-05-04
tags: [soc-pm]
---

## Summary

> 来源：微信公众号「OneChan」 > 原文链接：https://mp.weixin.qq.com/s/1pqqbEkEUXwdjceyP_RG0A > 记录时间：2026-05-04

## Key Points

### 1. 核心观点
CR 的本质是**软件与硬件之间预先约定的"指令集接口"**。硬件设计时，把所有可配置的行为、可触发的动作、可选择的工作模式，全部编码成 CR 中的位域。软件只需按照手册编码写入，硬件就会"无条件"执行对应的指令。

### 2. CR 的典型位域设计与语义分类


### 3. 1. 配置型位域：一次性设置，长期生效
- 可读可写（RW），硬件永远不会改变其值 - 通常在初始化阶段一次性配置 - 例如：波特率选择、数据位/停止位配置、时钟分频系数、DMA 通道使能、中断使能位

### 4. 2. 触发型位域：写 1 执行，自动清零
- 写 1 有效，写 0 无效 - 硬件执行完动作后自动清零 - 读取永远返回 0 - 手册通常标记为 "W1C" 或 "WO" - **绝对不能使用读-改-写（RMW）操作！** - 例如：软件复位位（SWRST）、发送启动位（TXSTART）、FIFO 清空位（FLUSH）

### 5. 3. 锁存型位域：写入后锁定，直到复位
- 只写一次（Write Once） - 写入后变为只读 - 只有系统复位才能解锁 - 例如：调试端口禁用位、Flash 写保护位、硬件看门狗锁定位

## Evidence

- Source: [原始文章](raw/tech/soc-pm/cr-control-register-onechan.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/cr-control-register-onechan.md)
