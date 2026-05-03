---
doc_id: src-cpu运行功耗和什么相关-消耗的电能都去哪了
title: CPU运行功耗和什么相关？消耗的电能都去哪了？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/CPU运行功耗和什么相关？消耗的电能都去哪了？.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) 575 人赞同了该文章 很久很久以前，在邀请下，我收藏了一个问题：

## Key Points

### 1. CPU耗能的基本原理
我在这篇颇受欢迎的文章里面介绍过基本原理： 我们将CPU简单看作场效应晶体管 [FET](https://zhida.zhihu.com/search?content_id=6238136&content_type=Article&match_order=1&q=FET&zhida_source=entity) 的集合。这么多个FET随着每一次的翻转都在消耗者能量。一个FET的简单示意图如下：

### 2. 指令功耗
如果我们将CPU简单看作单核的，是不是运行while(1);就能让该CPU达到TDP呢？实际上并不会。每条指令所要调动的晶体管数目不同，而功耗是被调动晶体管功耗的总和。 《动物庄园》有一句话很经典：“所有动物生来平等 但有些动物比其他动物更平等”。是不是指令都是平等的呢？当然不是了，有些指令更平等！每条指令需要调动的晶体管数目有很大不同，一条新指令和已经在 [L1指令Cache](https://

### 3. 耗能和频率的关系
从图1中，也许你可以直观的看出，能耗和频率是正相关的。这个理解很正确，实际上能耗和频率成线性相关。能耗关系公示是(参考资料2)： ![](https://pic1.zhimg.com/v2-8e6a44f8e69f7925b63429b5d8643fec_1440w.jpg)

### 4. 其他因素
一个while(1);最多让某个内核占有率100%，其他内核呢？CPU近期的目标是提供越来越精细的电源管理策略。原来不跑的部分就让它闲着，后来改成它降频运行，接着改成不提供时钟信号，这样犹嫌不足。现在CPU的电源管理由 [PMC](https://zhida.zhihu.com/search?content_id=6238136&content_type=Article&match_order=1

### 5. 结论
拉拉杂杂的说了这许多，我们可以看出，while(1);并不会耗掉整个CPU的TDP。就算一个内核，它的耗能也不会达到该内核的能耗上线（现在都是 [Turbo Mode](https://zhida.zhihu.com/search?content_id=6238136&content_type=Article&match_order=1&q=Turbo+Mode&zhida_source=enti

## Evidence

- Source: [原始文章](raw/tech/soc-pm/CPU运行功耗和什么相关？消耗的电能都去哪了？.md) [[../../raw/tech/soc-pm/CPU运行功耗和什么相关？消耗的电能都去哪了？.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/CPU运行功耗和什么相关？消耗的电能都去哪了？.md) [[../../raw/tech/soc-pm/CPU运行功耗和什么相关？消耗的电能都去哪了？.md|原始文章]]
