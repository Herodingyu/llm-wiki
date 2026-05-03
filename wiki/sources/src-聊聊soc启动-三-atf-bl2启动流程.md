---
doc_id: src-聊聊soc启动-三-atf-bl2启动流程
title: if DEBUG
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（三） ATF BL2启动流程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944) 13 人赞同了该文章 本文基于以下软硬件假定：

## Key Points

### 1. 1　BL2启动流程
Bl2的启动流程与 [bl1](https://zhida.zhihu.com/search?content_id=203698239&content_type=Article&match_order=1&q=bl1&zhida_source=entity) 类似，主要区别是bl2的初始化流程比bl1更简单，但其可能需要加载更多的镜像，如 [bl31](https://zhida.zhihu.co

### 2. ２　bl2基础初始化


### 3. ２.1　保存参数
其代码流程如下： ``` mov    x20, x0 mov    x21, x1 mov    x22, x2 mov    x23, x3 ``` bl1虽然定义了x0 – x7寄存器用于向bl2传递参数，但bl2实际使用的只有x0 - x3四个寄存器，因此其实际传参的数量不能超过四个。在armv8过程调用中，x0 – 18是caller saved寄存器，x19 – x30是callee

### 4. ２.２　异常设置
其代码流程如下： ``` adr    x0, early_exceptions msr    vbar_el1, x0 ``` 该流程用于设置el1的 [异常向量表](https://zhida.zhihu.com/search?content_id=203698239&content_type=Article&match_order=1&q=%E5%BC%82%E5%B8%B8%E5%90%9

### 5. ２.３　设置sctlr\_el1寄存器
该流程主要用于使能指令cache、对齐检查和栈对齐检查特性，其代码流程如下： ``` mov    x1, #(SCTLR_I_BIT | SCTLR_A_BIT | SCTLR_SA_BIT) mrs    x0, sctlr_el1

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（三） ATF BL2启动流程.md) [[../../raw/tech/bsp/聊聊SOC启动（三） ATF BL2启动流程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（三） ATF BL2启动流程.md) [[../../raw/tech/bsp/聊聊SOC启动（三） ATF BL2启动流程.md|原始文章]]
