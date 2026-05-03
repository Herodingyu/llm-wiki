---
doc_id: src-嵌入式系统中-flash-中的程序代码必须搬到-ram-中运行吗-某人-的回答
title: 嵌入式系统中，FLASH 中的程序代码必须搬到 RAM 中运行吗？   某人 的回答
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/嵌入式系统中，FLASH 中的程序代码必须搬到 RAM 中运行吗？ - 某人 的回答.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

101 人赞同了该回答 能不能在Flash中直接运行程序代码，取决于Flash的访问特性。 [Flash存储器](https://zhida.zhihu.com/search?content_id=244209504&content_type=Answer&match_order=1&q=Flash%E5%AD%98%E5%82%A8%E5%99%A8&zhida_source=entity) 是按块组织的，在使用时也倾向于按块访问才更加高效。Flash类似于ROM一类的存储器，但它其实是可读可写的，不同于同样可读可写的RAM，它在写入数据时需要先将你所写位置所属的块擦除，不管你是不是只写几个

## Key Points

- (To be summarized)

## Evidence

- Source: [原始文章](raw/tech/bsp/嵌入式系统中，FLASH 中的程序代码必须搬到 RAM 中运行吗？ - 某人 的回答.md) [[../../raw/tech/bsp/嵌入式系统中，FLASH 中的程序代码必须搬到 RAM 中运行吗？ - 某人 的回答.md|原始文章]]

## Key Quotes

> "1、FLASH中的代码是如何得到运行的呢？比如PC指针是在哪里由谁设置的"

> "3、如果需要搬到RAM，那是片内还是片外有什么区别吗"

> "在片内的RAM性能会更好，但是容量一般不能做的太大"

> "4、如果用户存在FLASH的实际代码大小（比如1MB），超过了RAM的可用空间（比如512KB），那这个搬移过程是啥样的"

> "是可以分阶段加载执行的，但是对程序的组织会变得复杂，运行变得低效，如果出现了这种情况应该考虑更换硬件配置或者对程序优化裁剪"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/嵌入式系统中，FLASH 中的程序代码必须搬到 RAM 中运行吗？ - 某人 的回答.md) [[../../raw/tech/bsp/嵌入式系统中，FLASH 中的程序代码必须搬到 RAM 中运行吗？ - 某人 的回答.md|原始文章]]
