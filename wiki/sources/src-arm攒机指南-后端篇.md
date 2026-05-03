---
doc_id: src-arm攒机指南-后端篇
title: ARM攒机指南 后端篇
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-后端篇.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · ARM攒机指南](https://www.zhihu.com/column/c_70349842) 吴建明wujianming、LogicJitterGibbs 等 106 人赞同了该文章 工作中经常遇到和做市场和芯片同事讨论 [PPA](https://zhida.zhihu.com/search?content_id=5136617&content_type=Article&match_order=1&q=PPA&zhida_source=entity) 。这时，后端会拿出这样一个表格：

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-后端篇.md) [[../../raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-后端篇.md|原始文章]]

## Key Quotes

> "这一栏有两个频率，容易区分，就是不同的电压。在频率确定时，动态功耗是电压的2次方，这个大家都知道"

> "动态功耗和电压强相关。公式里面本身就是2次方，然后频率变化也和电压相关，在跨电压的时候就是三次方的关系了。所以别看1.0V只比0.72V高了39%，最终动态功耗可能是3倍。而频率高的时候，动态功耗占了绝大部分，所以电压不可小觑"

> "再看表格下两排，Logic Architecture和Memory。这个也容易理解，就是逻辑和内存，数字电路的两大模块分类。这个内存是片上静态内存，不是外面的DDR"

> "对于动态功耗，后端还可以定制晶体管的源极和漏极的长度，越窄的电流越大，漏电越高，相应的，最高频率就可以冲的更高。所以我们有时候还能看到uLVT C16，LVT C24之类的参数，这里的C就是指Channel Length"

> "逻辑和内存统称为Physical Library，物理库，它是根据工厂给的每个工艺节点的物理开发包（PDK）设计的，而Library是一个Fabless芯片公司能做到的最底层。能够定制自己的成熟物理库，是这家公司后端领先的标志之一"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-后端篇.md) [[../../raw/tech/soc-pm/ARM攒机指南/ARM攒机指南-后端篇.md|原始文章]]
