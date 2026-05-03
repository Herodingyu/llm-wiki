---
doc_id: src-系统启动-3w字理清uboot如何跳转kernel-uboot与linux交界
title: 【系统启动】3W字理清UBoot如何跳转Kernel—uboot与linux交界
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【系统启动】3W字理清UBoot如何跳转Kernel—uboot与linux交界.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 52 人赞同了该文章 - 不知道你是否有这种感觉，就是学习了Uboot，学习了kernel，学习了安卓。 **但是有时候总感觉是各自孤立的，将三者连续不起来？**

## Key Points

### 1. Perface
- 不知道你是否有这种感觉，就是学习了Uboot，学习了kernel，学习了安卓。 **但是有时候总感觉是各自孤立的，将三者连续不起来？** - 不知道你是否在做启动方案的时候，在宏观上知道了整个启动链路流程，但是却在汪洋的代码中迷了路？

### 2. 宏观-Linux内核是怎么被引导加载启动的？


### 3. 说明一
首先我们知道 **kernel的镜像最开始是压缩的zImage格式的存在** ，然后Uboot有工具mkimage把其转换为uImage。 什么？不知道？好，那我先给你整两幅图瞅瞅，你就知道了！ ![](https://pic4.zhimg.com/v2-558c6554ab701221865fe9838934ac01_1440w.jpg)

### 4. 说明二
zImage内核镜像下载到开发板之后，可以使用u-boot的go命令进行直接跳转，这个时候内核直接解压启动。 但是此时的内核无法挂载文件系统，因为 **go命令没有将内核需要的相关启动参数从u-boot中传递给内核** 。

### 5. 说明三
**在前面我们曾经分析过Uboot的启动流程，两个阶段** 。 程序最终执行common/main.c中的 [main\_loop](https://zhida.zhihu.com/search?content_id=236930367&content_type=Article&match_order=1&q=main_loop&zhida_source=entity) 。在此之前都是进行一些初始

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【系统启动】3W字理清UBoot如何跳转Kernel—uboot与linux交界.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【系统启动】3W字理清UBoot如何跳转Kernel—uboot与linux交界.md|原始文章]]

## Key Quotes

> "但是有时候总感觉是各自孤立的，将三者连续不起来？"

> "怎么从UBoot跳转到Kernel"

> "kernel的镜像最开始是压缩的zImage格式的存在"

> "那这个uImage被加载到哪里呢？"

> "go命令没有将内核需要的相关启动参数从u-boot中传递给内核"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【系统启动】3W字理清UBoot如何跳转Kernel—uboot与linux交界.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【系统启动】3W字理清UBoot如何跳转Kernel—uboot与linux交界.md|原始文章]]
