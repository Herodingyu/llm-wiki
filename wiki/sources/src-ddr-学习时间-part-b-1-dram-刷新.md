---
doc_id: src-ddr-学习时间-part-b-1-dram-刷新
title: DDR 学习时间 (Part B   1)：DRAM 刷新
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/DDR 学习时间 (Part B - 1)：DRAM 刷新.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · OpenIC 特别兴趣小组](https://www.zhihu.com/column/c_1029044037684183040) 118 人赞同了该文章 本期我们基于 [JESD-79](https://zhida.zhihu.com/search?content_id=164410070&content_type=Article&match_order=1&q=JESD-79&zhida_source=entity) 学习 DDR 的刷新及其刷新命令。

## Key Points

### 1. DRAM 基本结构
我们知道 DRAM 使用电容 **充电/未充电** 两个状态来分别表示二进制的 **1/0** 符号。 拿小学数学题中的常客——水池来打比方，电容是一个水池，晶体管是这个水池的阀门。 小明是一个记忆只有 7 秒的熊孩子，数字他统共就认识两个： 0 和 1。每次需要记下一个数字时，如果是 1 小明就用水装满池子( 1'b1 )，如果是 0 就把水全部放走（ 1‘b0 ）。非常不爱惜水资源，大家不要学

### 2. 不紧的阀门：漏电流
小明の记忆水池工作的关键在于有一个紧密不漏水的阀门。如果水池阀门漏水，那么小明面对一个干涸水池的时候，他是懵逼的：到底是本来没水（ 1‘b0 ），还是本来有水但是全流光了( 1'b1 )？ 不幸的是， DRAM 中的晶体管就是一个漏水的阀门。

### 3. DRAM 刷新
为了防止数据被破坏，为了使 DRAM 这一更廉价的存储介质可以得到普及，DRAM 设计中加入了动态刷新机制。 DRAM 刷新过程中，首先读取原本的数据，将电容的电平与参考电平进行比较，判断数据的 1/0 值后，再将原数据写回。写回的过程中将电容完全充满电荷（如果数据为 1），好比进行了一次充电操作。

### 4. DRAM 刷新命令
DRAM 刷新由控制器 (MC) 和 DRAM 颗粒内部电路共同实现。 MC 以发送刷新命令的方式通知 DRAM 颗粒进行刷新；DRAM 颗粒内部电路则负责进行刷新操作。这里我们重点来看 MC 侧的刷新命令发送部分。

### 5. DRAM 刷新时序参数
REF 不是一个持久性（persistent）命令，需要间隔一个平均周期循环发送，这个周期称为 [tREFI](https://zhida.zhihu.com/search?content_id=164410070&content_type=Article&match_order=1&q=tREFI&zhida_source=entity) 。tREFI 与 DRAM 容量密度和工作温度有关。

## Evidence

- Source: [原始文章](raw/tech/dram/DDR 学习时间 (Part B - 1)：DRAM 刷新.md) [[../../raw/tech/dram/DDR 学习时间 (Part B - 1)：DRAM 刷新.md|原始文章]]

## Key Quotes

> "H、L 标识的信号在该 DRAM 命令中必须为高或者低电平；"

> "X，V 标识的信号在该命令中都不起任何作用，可以为任何值。区别在于 V 表示信号可以为高电平或者低电平。X 更近一步，信号还可以为悬空值（float）。"

> "用 OP Code 等具体名称标识的信号是命令的一部分，它们的值用于表示命令的某个字段的值；"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/DDR 学习时间 (Part B - 1)：DRAM 刷新.md) [[../../raw/tech/dram/DDR 学习时间 (Part B - 1)：DRAM 刷新.md|原始文章]]
