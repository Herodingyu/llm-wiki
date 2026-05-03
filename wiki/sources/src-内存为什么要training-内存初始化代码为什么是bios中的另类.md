---
doc_id: src-内存为什么要training-内存初始化代码为什么是bios中的另类
title: 内存为什么要Training 内存初始化代码为什么是BIOS中的另类？
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/dram/内存为什么要Training 内存初始化代码为什么是BIOS中的另类？.md
domain: tech/dram
created: 2026-05-03
updated: 2026-05-03
tags: [dram]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) LogicJitterGibbs 等 293 人赞同了该文章 有人说 [BIOS](https://zhida.zhihu.com/search?content_id=112107980&content_type=Article&match_order=1&q=BIOS&zhida_source=entity) 程序就是按照硬件手册和根据用户选择填寄存器，几张表就能解决的事为什么要这许多程序呢？虽然数千个选择形成的组合爆炸让穷举表成为不可能，但它也道出了BIOS大部分程序的实质

## Key Points

### 1. 内存为什么要Training?
内存I/O部分频率越来越高，如此高的频率让小小的一点误差都会被放大。熟悉主板布线的同学应该知道高速信号布线的时钟约束十分严苛，一组高速信号在主板上拐个弯，内圈和外圈的走线长度会产生差距，尽管很小，低速信号没关系，但高速信号时钟约束就达不到，必须在相反的方向拐回来补偿一下。内存I/O频率上G的频率，让任何细小的误差都必须得到补偿，所以要在整个数据链路进行对齐和补偿。

### 2. 谁来进行Training？
这些步骤大部分是所有内存方案都要做的，包括焊在板子上的Solder Down方案和不同的内存控制器。关键是谁来执行这些步骤，谁来Training整个命令和数据链条。 有两种方案：In Band和OOB（Out Of Band）。大家经常在通信领域听到band概念，这里没有通信调制，还提band是怎么个意思呢？其实这种说法在silicon技术文档里面经常提到，这个所谓的band，是指CPU的计算资源

### 3. 结论
好了，我们回到原来的问题：为什么Intel的MRC代码量很大，而ARM和AMD则没有如此大量的Memory Training代码？相信同学们都已经有了答案。是的，Intel采用 [In Band training](https://zhida.zhihu.com/search?content_id=112107980&content_type=Article&match_order=1&q=In+

## Evidence

- Source: [原始文章](raw/tech/dram/内存为什么要Training 内存初始化代码为什么是BIOS中的另类？.md) [[../../raw/tech/dram/内存为什么要Training 内存初始化代码为什么是BIOS中的另类？.md|原始文章]]

## Key Quotes

> "当然不是，但和AI 模型的training之所以取名如此一样，都是为了通过实验来寻找可以解决问题的方案"

> "这些步骤大部分是所有内存方案都要做的，包括焊在板子上的Solder Down方案和不同的内存控制器。关键是谁来执行这些步骤，谁来Training整个命令和数据链条"

> "OOB training十分常见，比大家认为的常见更加常见。现在几乎所有高速通信线路都需要Training，包括但不限于PCIe、USB、SATA等等。而完成这个Training的并不是CPU，可以是MCU和DSP等"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/dram/内存为什么要Training 内存初始化代码为什么是BIOS中的另类？.md) [[../../raw/tech/dram/内存为什么要Training 内存初始化代码为什么是BIOS中的另类？.md|原始文章]]
