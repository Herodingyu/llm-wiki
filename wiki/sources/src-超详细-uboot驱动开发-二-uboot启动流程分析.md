---
doc_id: src-超详细-uboot驱动开发-二-uboot启动流程分析
title: 超详细【Uboot驱动开发】（二）uboot启动流程分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/超详细【Uboot驱动开发】（二）uboot启动流程分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 超详细【Uboot驱动开发】](https://www.zhihu.com/column/c_1468303841838444544) 48 人赞同了该文章 目录

## Key Points

### 1. 二、uboot启动流程分析
![](https://pic2.zhimg.com/v2-40bc41435d997a170da793d5c95b6545_1440w.jpg) > 上一篇文章： [（一）uboot基础了解](https://zhuanlan.zhihu.com/p/460751954) 下一篇文章： [（三）Uboot驱动模型](https://zhuanlan.zhihu.com/p/460754843)

### 2. 2.1、程序执行流程图
我们先总体来看一下Uboot的执行步骤，这里以EMMC作为启动介质，进行分析！ 无论是哪种启动介质，基本流程都相似，我们这就往下看！ ![](https://pica.zhimg.com/v2-c15e4c022ff2b1cee1ba607b18108a22_1440w.jpg)

### 3. 2.2、u-boot.lds——Uboot的入口函数
`u-boot.lds` ：是uboot工程的链接脚本文件，对于工程的编译和链接有非常重要的作用，决定了uboot的组装，并且 `u-boot.lds` 链接文件中的 `ENTRY(_start)` 指定了uboot程序的入口地址。

### 4. 2.3、board\_init\_f——板级前置初始化
跟随上文的程序执行流程图，我们看 `board_init_f` 这个函数。其位于 `common/board_f.c` 。 ```c void board_init_f(ulong boot_flags)

### 5. 2.4、relocate\_code重定向
> 重定向技术，可以说也算是 `Uboot` 的一个重点了，也就是将 `uboot` 自身镜像拷贝到 `ddr` 上的另外一个位置的动作。

## Evidence

- Source: [原始文章](raw/tech/bsp/超详细【Uboot驱动开发】（二）uboot启动流程分析.md) [[../../raw/tech/bsp/超详细【Uboot驱动开发】（二）uboot启动流程分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/超详细【Uboot驱动开发】（二）uboot启动流程分析.md) [[../../raw/tech/bsp/超详细【Uboot驱动开发】（二）uboot启动流程分析.md|原始文章]]
