---
doc_id: src-ai系统-22ai芯片存储介绍
title: AI系统 22AI芯片存储介绍
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-22AI芯片存储介绍.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) ![](https://pic2.zhimg.com/v2-37f16d2eb6926798181b0128694c7123_1440w.jpg) AI运算需要大量的数据要处理，而是超级大的模型算法也需要进行存储，对整个系统存储提出来了更高的要求，具体就是：更大，更快，更小，更省电等，既要还要。

## Key Points

### 1. 1\. 存储基础知识
![](https://pica.zhimg.com/v2-0ffca879d54aba255e464dc7da042f64_1440w.jpg)

### 2. 1.1 DDR和LPDDR及HBM
![](https://pic3.zhimg.com/v2-586822b844f9dce50e54456556904a6c_1440w.jpg) **DDR 全称 Double Data Rate** （双倍速率同步动态随机存储器），严格的来讲，DDR 应该叫 **DDR SDRAM** ，它是一种 **易失性存储器** 。虽然JEDEC于2018年宣布正式发布DDR5标准，但实际上最终的规范到

### 3. 1.2 NAND FLASH和Nor FLASH
![](https://pic1.zhimg.com/v2-2db9b15ac8863eb7f7b7555afb7b124c_1440w.jpg) - **NAND型闪存** 是一种非易失性存储器，适用于大容量数据存储。NAND Flash通过 **串行访问** 模式进行读写操作，具有较快的写入速度和更高的密度。

### 4. 1.2.1 NAND Flash
**NAND Flash** 存储器具有容量较大，改写速度快等优点，适用于大量数据的存储，因而在业界得到了越来越广泛的应用，如闪存盘、固态硬盘、 [eMMC](https://zhida.zhihu.com/search?content_id=272190736&content_type=Article&match_order=1&q=eMMC&zhida_source=entity) 、UFS

### 5. 1.2.2 Nor Flash
特点: 1. 读取速度快，适合代码执行（如 **固件和BIOS** ）。 2. 擦除速度相对较慢，擦除操作以块为单位进行。 3. 擦除单元较大（通常为128KB或更大）。 应用: NOR Flash以其高可靠性和 **直接执行代码** 的能力而著称，允许应用程序直接在flash闪存中运行。常用于需要快速读取的场景，如嵌入式系统的固件存储。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-22AI芯片存储介绍.md) [[../../raw/tech/soc-pm/AI系统/AI系统-22AI芯片存储介绍.md|原始文章]]

## Key Quotes

> "DDR 全称 Double Data Rate"

> "服务器、云计算、网络、笔记本电脑、台式机和消费类应用"

> "HBM（High Bandwidth Memory"

> "总线flash，SPI flash"

> "总线Flash和SPI flash区别"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-22AI芯片存储介绍.md) [[../../raw/tech/soc-pm/AI系统/AI系统-22AI芯片存储介绍.md|原始文章]]
