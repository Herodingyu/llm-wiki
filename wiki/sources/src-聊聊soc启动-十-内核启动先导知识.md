---
doc_id: src-聊聊soc启动-十-内核启动先导知识
title: 聊聊SOC启动（十） 内核启动先导知识
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（十） 内核启动先导知识.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944) 18 人赞同了该文章 本文基于以下软硬件假定：

## Key Points

### 1. 1　问题引出
经过漫漫征途终于进入内核大门了，现在内核将愉快地从第一条指令开始执行。但在开始内核之旅前，还是有必要再看下系统进入内核之前的状态。我们知道 [uboot](https://zhida.zhihu.com/search?content_id=204175776&content_type=Article&match_order=1&q=uboot&zhida_source=entity) 的最后一步是

### 2. ２　内核执行的异常等级


### 3. ２.1　内核启动时的异常等级
除了必须支持EL0和EL1以外，arm可以灵活地配置是否支持EL2和EL3。为了讨论方便，我们假定讨论的系统支持所有EL0 – EL3异常等级，且启动流程为bl1 bl2 bl31 bl32 uboot linux。以下为其典型流程图：

### 4. ２.1.1　Uboot的执行异常等级
由于uboot（bl33）由bl31启动，因此其异常等级也由bl31确定。我们以qemu平台为例，atf获取bl33异常等级的流程如下： ![](https://pic4.zhimg.com/v2-cc6b8087bad9c179fe1a0347ba68b69b_1440w.jpg)

### 5. ２.1.２　内核启动异常等级的确定
uboot本身作为firmware支持运行在EL1 – EL3的任一等级，但内核只能运行于EL 1或EL2。因此在进入内核之前，uboot需要根据实际情况切换到对应的异常等级。 加载完内核后，它会通过 [boot\_jump\_linux](https://zhida.zhihu.com/search?content_id=204175776&content_type=Article&match_

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（十） 内核启动先导知识.md) [[../../raw/tech/bsp/聊聊SOC启动（十） 内核启动先导知识.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（十） 内核启动先导知识.md) [[../../raw/tech/bsp/聊聊SOC启动（十） 内核启动先导知识.md|原始文章]]
