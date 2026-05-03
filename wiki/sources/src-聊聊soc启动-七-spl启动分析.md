---
doc_id: src-聊聊soc启动-七-spl启动分析
title: 聊聊SOC启动（七） SPL启动分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（七） SPL启动分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944) 32 人赞同了该文章 典型的 [uboot](https://zhida.zhihu.com/search?content_id=203729759&content_type=Article&match_order=1&q=uboot&zhida_source=entity) 启动流程通常包含三个阶段， [bootrom](https://zhida.zhihu.com/search?content_id=203729759&content_type=Article

## Key Points

### 1. 1　spl简介
典型的 [uboot](https://zhida.zhihu.com/search?content_id=203729759&content_type=Article&match_order=1&q=uboot&zhida_source=entity) 启动流程通常包含三个阶段， [bootrom](https://zhida.zhihu.com/search?content_id=203729

### 2. 2　入口函数在哪里之SPL链接脚本简要分析
对于任何一个程序，我们首先需要找到其入口函数，对于应用程序，程序的入口函数为main（）函数，而对于SPL这样的裸机程序，其入口函数实际上是在链接时指定的。我们打开armv8的SPL链接脚本arch/arm/cpu/armv8/u-boot-spl.lds，它的内容如下：

### 3. ３　SPL 代码分析1(Start.S)
armv8架构下的SPL入口函数位于arch/arm/cpu/armv8/start.S文件的\_start，它的定义如下： ``` .globl  _start _start: /* * Various SoCs need something special and SoC-specific up front in

### 4. ４　SPL 代码分析2(CRT0\_64.S)
\_main的代码如下： ``` ENTRY(_main) /* * Set up initial C runtime environment and call board_init_f(0). */

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（七） SPL启动分析.md) [[../../raw/tech/bsp/聊聊SOC启动（七） SPL启动分析.md|原始文章]]

## Key Quotes

> "（3）它决定了BL２的启动方式        
　　由于BL２是由bootrom加载的，故具体支持从哪些存储器上启动BL2取决于bootrom的支持情况。SOC都会在芯片手册中列出其所支持的启动方式，若支持从多种存储介质启动，则一般可以通过拨码开关控制具体从何处启动"

> "OUTPUT\_ARCH也是链接脚本的关键字，它指定了运行平台的架构。接下来主角出现了，ENTRY函数就是用来指定整个目标程序入口点的，这里它指定了\_start为SPL的入口点，后面我们的代码分析也由此开始"

> "（2）它将读到的值与0xc比较，该比较指令会根据比较结果设置NZCV标志位。若他们的值相等，则会设置Z标志位     

　（3）根据Z标志位判断寄存器的值是否等于0xc，若相等则跳转到el3\_label，即第二个参数处，否则继续比较，根据相应的值跳转到不同分支"

> "（3）跳转到\_main处执行，该函数的定义位于arch/arm/lib/crt0\_64.S中。它主要是初始化c语言的执行环境，crt的意思即为c run time"

> "（2）将x0寄存器中的值清除低4位，使其16字节对齐，然后将它存入栈指针寄存器sp中，在armv8中栈指针寄存器为x31"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（七） SPL启动分析.md) [[../../raw/tech/bsp/聊聊SOC启动（七） SPL启动分析.md|原始文章]]
