---
doc_id: src-efuse-2
title: EFUSE 2
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/EFUSE 2.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · 芯片架构设计](https://www.zhihu.com/column/c_1877951126294372352) 42 人赞同了该文章 周五铜锅涮肉的时候被催更，趁着看球（亚洲杯 中国vs塔吉克斯坦）的间隙，继续把文章写完。本章全是10年EFUSE设计集成的干货，用在了若干代手机SOC芯片中，可能会有些枯燥，但可以真正用在芯片设计中。

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/EFUSE 2.md) [[../../raw/tech/soc-pm/EFUSE 2.md|原始文章]]

## Key Quotes

> "可以加入EFUSE重复编程保护工作，当EFSUE中的数据已经成1的时候，本次编程操作失效，上报异常中断

EFUSE在接口上和其它IO控制器类似，本质上都可以使用一个状态机控制EFUSE的所有管脚赋某个值完成一次特定的操作，这是最直观最容易理解且不容易出错的设计思路"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/EFUSE 2.md) [[../../raw/tech/soc-pm/EFUSE 2.md|原始文章]]
