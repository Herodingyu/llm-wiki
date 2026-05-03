---
doc_id: src-系统启动-uboot启动流程源码分析
title: 【系统启动】uboot启动流程源码分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【系统启动】uboot启动流程源码分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 9 人赞同了该文章 最近做AVB校验，需要uboot到kernel的这个过程。这里再复习一下。

## Key Points

### 1. 1、BL1阶段
uboot的 **BL1阶段代码通常放在start.s文件中** ，用汇编语言实现，其主要代码功能如下： - （1） 指定uboot的入口。在链接脚本uboot.lds中指定uboot的入口为start.S中的\_start。

### 2. 2、BL2阶段
start\_armboot函数位于lib\_arm/board.c中，是C语言开始的函数，也是BL2阶段代码中C语言的 主函数，同时还是整个u-boot（armboot）的主函数，BL2阶段的主要功能如下：

### 3. 3、start\_armboot函数分析
start\_armboot函数的主要功能如下： - （1）遍历调用 **函数指针数组init\_sequence中的初始化函数** 依次遍历调用函数指针数组init\_sequence中的函数，如果有函数执行出错，则执行hang函数，打印出”### ERROR ### Please RESET the board ###”，进入死循环。

### 4. 4、main\_loop函数是做什么的？
start\_armboot最后进入死循环调用了main\_loop 函数； uboot的目的是启动内核，那么main\_loop一定会有 **设置启动参数** 和 **启动内核** 的实现； main\_loop()函数做的都是与具体平台无关的工作，主要包括初始化启动次数限制机制、设置软件版本号、打印启动信息、解析命令等。

### 5. 5、main\_loop()函数内容
``` void main_loop(void) { const char *s; bootstage_mark_name(BOOTSTAGE_ID_MAIN_LOOP, "main_loop"); if (IS_ENABLED(CONFIG_VERSION_VARIABLE))

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【系统启动】uboot启动流程源码分析.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【系统启动】uboot启动流程源码分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【系统启动】uboot启动流程源码分析.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【系统启动】uboot启动流程源码分析.md|原始文章]]
