---
doc_id: src-聊聊soc启动-四-atf-bl31启动流程
title: 聊聊SOC启动（四） ATF BL31启动流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（四） ATF BL31启动流程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944) 19 人赞同了该文章 本文基于以下软硬件假定：

## Key Points

### 1. １　BL31启动流程
与bl1和bl2不同，bl31包含两部分功能，在启动时作为启动流程的一部分，执行软硬件初始化以及启动bl32和bl33镜像。在系统启动完成后，将继续驻留于系统中，并处理来自其它异常等级的smc异常，以及其它需要路由到EL3处理的中断等。因此bl31启动流程主要包含以下工作：

### 2. ２　bl31基础初始化


### 3. ２.1　参数保存
``` mov    x20, x0 mov    x21, x1 mov    x22, x2 mov    x23, x3 ``` 与bl2相同，将bl2传入的参数从caller寄存器保存到callee寄存器中

### 4. ２.２　el3\_entrypoint\_common函数
该函数在bl1中已经详细介绍过了，但bl31对其的调用方式还是与bl1有所不同的。让我们看下bl31中的调用： ``` el3_entrypoint_common                    \

### 5. ３　bl31参数设置


## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（四） ATF BL31启动流程.md) [[../../raw/tech/bsp/聊聊SOC启动（四） ATF BL31启动流程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（四） ATF BL31启动流程.md) [[../../raw/tech/bsp/聊聊SOC启动（四） ATF BL31启动流程.md|原始文章]]
