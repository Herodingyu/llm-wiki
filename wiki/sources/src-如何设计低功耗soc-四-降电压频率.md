---
doc_id: src-如何设计低功耗soc-四-降电压频率
title: 如何设计低功耗SOC（四，降电压频率）
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/如何设计低功耗SOC（四，降电压频率）.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · 聚沙成芯：如何造芯片](https://www.zhihu.com/column/c_1264903132552757248) Trustintruth 等 22 人赞同了该文章 这是这个系列 [桔里猫：如何设计低功耗SOC（一，综述）](https://zhuanlan.zhihu.com/p/158410142) 的第四章，这个英文名字是Frequency and voltage scaling。在边缘端低功耗情况下也是比较有效的方法。

## Key Points

### 1. 1、降电压频率的基本原理
这个在多电源域的时候就讲过。降电压是可以降 [动态功耗](https://zhida.zhihu.com/search?content_id=123478535&content_type=Article&match_order=1&q=%E5%8A%A8%E6%80%81%E5%8A%9F%E8%80%97&zhida_source=entity) 的。但是会增加延时。对于数字电路来讲，可以通过降

### 2. 2、降电压频率可以节省能量么？
那么你要问了，频率变低了，岂不是完成一个任务的时间变长了？事实上确实是这样的。 ![](https://pica.zhimg.com/v2-75add7e7a255ff81a30b0f6a300bf464_1440w.jpg)

### 3. 3\. DVFS是什么？
这个词可以说是非常容易出现了。Dynamic Voltage and Frequency Scaling。动态的电压频率调节。最常见的实现手段是用CPU来来调节电压和频率。典型的做法如下图。 ![](https://pic3.zhimg.com/v2-7f36a0dccd03614f48c7522e66d25ec2_1440w.jpg)

### 4. 4、总结
这个部分东西学术研究还是比较多的尤其DVFS的各种变种。但是实际产品中如果不是极致追求，不一定能用的到。以上！ 编辑于 2022-07-24 23:13[25届微电子应届生，就业如何选择？](https://www.zhihu.com/question/661861553/answer/128373577699)

## Evidence

- Source: [原始文章](raw/tech/soc-pm/如何设计低功耗SOC（四，降电压频率）.md) [[../../raw/tech/soc-pm/如何设计低功耗SOC（四，降电压频率）.md|原始文章]]

## Key Quotes

> "那么你要问了，频率变低了，岂不是完成一个任务的时间变长了？事实上确实是这样的"

> "这个词可以说是非常容易出现了。Dynamic Voltage and Frequency Scaling。动态的电压频率调节。最常见的实现手段是用CPU来来调节电压和频率。典型的做法如下图"

> "一般来讲，为了时序好处理，一种简单的办法是CPU的时钟只允许是总线的整数倍。然后接口出加上latch"

> "## 4、总结

这个部分东西学术研究还是比较多的尤其DVFS的各种变种。但是实际产品中如果不是极致追求，不一定能用的到。以上"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/如何设计低功耗SOC（四，降电压频率）.md) [[../../raw/tech/soc-pm/如何设计低功耗SOC（四，降电压频率）.md|原始文章]]
