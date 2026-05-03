---
doc_id: src-聊聊soc启动-五-uboot启动流程一
title: 聊聊SOC启动（五） uboot启动流程一
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（五） uboot启动流程一.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944) 43 人赞同了该文章 本文基于以下软硬件假定：

## Key Points

### 1. 1　Uboot总体流程
回顾下我们前面介绍的 [atf](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=atf&zhida_source=entity) ，其基本启动流程为： [BL1](https://zhida.zhihu.com/search?content_id=203700954&

### 2. １.1　不带atf启动
spl被称为secondary program loader，在启动链中一般由bootrom加载而作为第二级启动镜像（bl2），它主要用于完成一些基础模块和ddr的初始化，以及加载下一级镜像uboot。由于spl需要被加载到sram中执行，对于有些sram size比较小的系统，可能无法放入整个spl镜像，tpl即是为了解决该问题引入的。加入了tpl之后，可将spl的功能进一步划分为两部分，如sp

### 3. １.2　Atf与uboot组合方式启动
若系统需要支持secure和non secure两种执行状态，则必须要从secure空间开始启动，且启动完成后需要通过 [secure monitor](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=secure+monitor&zhida_source=entity

### 4. ２　uboot初始化
除了一些通过编译选项区分的部分，以及board\_init\_f和board\_init\_r函数的具体实现以外，uboot与spl的初始化流程完全相同。spl初始化流程在另一篇文章<spl启动分析>中已经做了较详细的介绍，其链接如下：

### 5. ２.1　从cpu处理流程
smp系统只有主cpu执行完整的启动流程，其它从cpu在启动初期需要被设置到一个特定的状态。，待主cpu将系统启动完成后，再唤醒从cpu从给定地址处执行。armv8的从cpu启动包含 [psci](https://zhida.zhihu.com/search?content_id=203700954&content_type=Article&match_order=1&q=psci&zhida_s

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（五） uboot启动流程一.md) [[../../raw/tech/bsp/聊聊SOC启动（五） uboot启动流程一.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（五） uboot启动流程一.md) [[../../raw/tech/bsp/聊聊SOC启动（五） uboot启动流程一.md|原始文章]]
