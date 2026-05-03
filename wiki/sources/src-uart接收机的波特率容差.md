---
doc_id: src-uart接收机的波特率容差
title: UART接收机的波特率容差
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/peripheral/UART接收机的波特率容差.md
domain: tech/peripheral
created: 2026-05-03
updated: 2026-05-03
tags: [peripheral]
---

## Summary

11 人赞同了该文章 一个背靠背的 [UART](https://zhida.zhihu.com/search?content_id=238515983&content_type=Article&match_order=1&q=UART&zhida_source=entity) 传输如下图所示，本文以 [FPGA](https://zhida.zhihu.com/search?content_id=238515983&content_type=Article&match_order=1&q=FPGA&zhida_source=entity) 逻辑设计工程师的角度来分析UART接收机的波特率容差

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/peripheral/UART接收机的波特率容差.md) [[../../raw/tech/peripheral/UART接收机的波特率容差.md|原始文章]]

## Key Quotes

> "接收波特率大于发送波特率（收快发慢）时"

> "2\. 接收波特率小于发送波特率（收慢发快）时"

> "综合来看，16倍的过采样倍率在UART接收机设计的工程实践中是一个很优化的选择"

> "UART的起始位和停止位并不用于发射机和接收机之间的信息传递，是为了实现信息传递而添加的必要冗余，甚至可以把UART的起始位和停止位理解为专为咱们逻辑工程师制定的"

> "UART的起始位和停止位是配套的，不是孤立的，是为了解决收/发机间异步工作引起的两个问题而制定的机制"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/peripheral/UART接收机的波特率容差.md) [[../../raw/tech/peripheral/UART接收机的波特率容差.md|原始文章]]
