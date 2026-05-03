---
doc_id: src-arm攒机指南-架构篇
title: ARM攒机指南 架构篇
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-架构篇.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · ARM攒机指南](https://www.zhihu.com/column/c_70349842) 捋顺了芯片的基础知识，现在终于可以开始攒机了。 首先，我们跑去 [ARM](https://zhida.zhihu.com/search?content_id=5135771&content_type=Article&match_order=1&q=ARM&zhida_source=entity) ，问它有没有现成的系统。ARM说有啊， [A73](https://zhida.zhihu.com/search?content_id=5135771&content_type=Arti

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-架构篇.md) [[../../raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-架构篇.md|原始文章]]

## Key Quotes

> "以下数据经过修改，并不是真实数据。"

> "这里的缓存大小是可以配置的，面积越大，性能收益其实是递减的，可以根据需要自行选取"

> "路径上还有DMC和PHY的延迟，也是将近15ns，20cycle，这部分挺难降低。如果实现Trustzone，还要加上DMC和CCI之间的TZC400延迟，还会再多几个cycle。至于DDR颗粒间的延迟（行选择，命令和预充电），可以通过准确的DMC预测和调度来减少，稍后再讲"

> "A53是顺序执行的，读取数据支持miss-under-miss，没有A73上槽位的设计，就不具体分析了"

> "4K显示模块需要4096x2160x4(Bytes)x60(帧)x4（图层）的输入，未压缩，共需要8GB/s的带宽，压缩后可能可以做到5GB/s。这还都是单向输入的，没有计算反馈给其他模块的"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-架构篇.md) [[../../raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-架构篇.md|原始文章]]
