---
doc_id: src-内存系列三-内存初始化浅析
title: 内存系列三：内存初始化浅析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/内存系列三：内存初始化浅析.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) 566 人赞同了该文章 > 本篇承接上两篇文章，继续介绍 [DDR内存](https://zhida.zhihu.com/search?content_id=2742206&content_type=Article&match_order=1&q=DDR%E5%86%85%E5%AD%98&zhida_source=entity) 在 [固件](https://zhida.zhihu.com/search?content_id=2742206&content_type=Arti

## Key Points

### 1. 内存初始化
小张开门见山，直奔主题：“内存硬件结构这么复杂，我平时写程序怎么从来都没有用过，是不是操作系统把什么寻址啊、延迟啊都自己搞定了？”。“这就不对了，操作系统对内存的了解只到了 [段页管理](https://zhida.zhihu.com/search?content_id=2742206&content_type=Article&match_order=1&q=%E6%AE%B5%E9%A1%B5%

### 2. 其他
滔滔不绝讲了半天，心想这些够小张喝一壶了吧。我满意的喝了口咖啡，没想到小张从口袋里拿出来个A4纸，上面密密麻麻好多问题。好小子，前面装傻，在这里等着我呢。没关系，兵来将挡，水来土掩，尽管放马过来吧！ **1。如何得到源码**

### 3. 尾声
时间不早了，我也该和小张告别了，希望这三次的介绍能让小张有所收获。 **BIOS培训云课堂** ： 内存系列其他文章： 欢迎大家关注本专栏和用微信扫描下方二维码加入微信公众号"UEFIBlog"，在那里有最新的文章。同时欢迎大家给本专栏和公众号投稿！

## Evidence

- Source: [原始文章](raw/tech/dram/内存系列三：内存初始化浅析.md) [[../../raw/tech/dram/内存系列三：内存初始化浅析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/内存系列三：内存初始化浅析.md) [[../../raw/tech/dram/内存系列三：内存初始化浅析.md|原始文章]]
