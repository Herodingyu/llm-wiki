---
doc_id: src-深入内存主存-解剖dram存储器
title: 深入内存主存：解剖DRAM存储器
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/深入内存主存：解剖DRAM存储器.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · 计算机体系结构](https://www.zhihu.com/column/c_1486713134764802048) 公园野鸭 等 571 人赞同了该文章 目录

## Key Points

### 1. 1、DRAM单元阵列
DRAM，全称为 Dynamic Random Access Memory ，中文名是“ **动态随机存取存储器** ”。所谓“动态”是和“静态”相对应的，芯片世界里还有一种 SRAM 静态随机存取存储器的存在。

### 2. 1.1、DRAM基本单元
所谓 DRAM ，是指图一所示的一个电路，为了和 DRAM 芯片相区分，本文把图一的电路称作一个 cell 。图中的 [CMOS 晶体管](https://zhida.zhihu.com/search?content_id=212910798&content_type=Article&match_order=1&q=CMOS+%E6%99%B6%E4%BD%93%E7%AE%A1&zhida_so

### 3. 1.2、cell阵列
一个 cell 只能存储一比特信息，即“ 0 ”和“ 1 ”， **为了存储大量信息，我们必须构建起 cell 阵列** 。cell 阵列的视觉图如图二。读者可能看不清图二中的小字，图二左侧的小字是“ word line ”，即字线；上面的小字是“ bit line ”，即位线。

### 4. 1.3、cell阵列的读取
cell 的读取依靠小电容充放电， **电容充放电导致位线产生电压波动，通过读取位线电压波动即可获取信息** 。小电容充放电所产生的电压波动是很微弱的，充放电所造成的电压波动的时间也是很短的，因此很难直接读取充放电信息，为此 cell 阵列的读取使用到了“ sense amplifier ”，即 **读出放大器** 。

### 5. 1.4、DRAM刷新
DRAM 叫做动态随机存储器，“动态”从何而来？前面说过，cell电容的电容值很小，存储电荷不多，无论是充电还是放电都很快， **而先进 CMOS 工艺有“电流泄漏”问题，因此即使不打开字线，cell 电容也会缓慢损失电荷，久而久之信息就丢失了** 。解决这个问题的办法是“刷新”电容，即根据电容的旧值重新向 cell 写入数据。因为要经常动态地 [刷新电容](https://zhida.zhihu

## Evidence

- Source: [原始文章](raw/tech/dram/深入内存主存：解剖DRAM存储器.md) [[../../raw/tech/dram/深入内存主存：解剖DRAM存储器.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/深入内存主存：解剖DRAM存储器.md) [[../../raw/tech/dram/深入内存主存：解剖DRAM存储器.md|原始文章]]
