---
doc_id: src-聊聊soc启动-二-atf-bl1启动流程
title: 聊聊SOC启动（二） ATF BL1启动流程
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（二） ATF BL1启动流程.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944) 33 人赞同了该文章 本文基于以下软硬件假定：

## Key Points

### 1. 1　BL1启动流程
BL1是系统启动的第一阶段，其主要目的是初始化系统环境和启动第二阶段镜像 [BL2](https://zhida.zhihu.com/search?content_id=203696211&content_type=Article&match_order=1&q=BL2&zhida_source=entity) 。话不多说，让我们通过下图看看其总体流程：

### 2. ２　el3\_entrypoint\_common流程分析
该宏由所有需要在EL3下执行的镜像共享，如BL1和BL31都会入口处调用该函数，只是传入的参数有所区别。其主要完成的功能如下： （1）初始化sctlr\_el3寄存器，以初始化系统控制参数 （2）判断当前启动方式是冷启动还是热启动，并执行相应的处理

### 3. ２.1　sctlr\_el3初始化
其代码流程如下： ``` .if \_init_sctlr mov_imm    x0, (SCTLR_RESET_VAL & ~(SCTLR_EE_BIT | SCTLR_WXN_BIT \ | SCTLR_SA_BIT | SCTLR_A_BIT | SCTLR_DSSBS_BIT))

### 4. ２.２　冷热启动处理
其代码如下： ``` .if \_warm_boot_mailbox bl    plat_get_my_entrypoint cbz    x0, do_cold_boot br    x0 do_cold_boot:

### 5. ２.３　pie处理
我们知道代码执行过程中可能需要跳转到某个位置，或者操作某个地址的数据，而在二进制代码中这些位置都需要通过地址来表示。因此，对于普通程序我们需要将其加载到与链接地址相同的位置执行，否则这些寻址操作就会失败。pie（地址无关可执行文件）就是为了解决该问题的，它的基本思路如下：

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（二） ATF BL1启动流程.md) [[../../raw/tech/bsp/聊聊SOC启动（二） ATF BL1启动流程.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（二） ATF BL1启动流程.md) [[../../raw/tech/bsp/聊聊SOC启动（二） ATF BL1启动流程.md|原始文章]]
