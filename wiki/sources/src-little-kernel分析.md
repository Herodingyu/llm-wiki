---
doc_id: src-little-kernel分析
title: little kernel分析
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/little-kernel分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 2 人赞同了该文章 [little kernel](https://zhida.zhihu.com/search?content_id=248607990&content_type=Article&match_order=1&q=little+kernel&zhida_source=entity) 是一个基于线程的操作系统，是运行在 [AARCH32](https://zhida.zhihu.com/search?content_id=2486079

## Key Points

### 1. 1 简介
[little kernel](https://zhida.zhihu.com/search?content_id=248607990&content_type=Article&match_order=1&q=little+kernel&zhida_source=entity) 是一个基于线程的操作系统，是运行在 [AARCH32](https://zhida.zhihu.com/search?c

### 2. 2 源码获取
``` git clone git://codeaurora.org/kernel/lk.git git checkout -b mylk remotes/origin/master ```

### 3. 3 编译
安装编译器 sudo apt install gcc-arm-linux-gnueabi 设置工具链 export TOOLCHAIN\_PREFIX=arm-linux-gnueabi- 编译 make msm8916 EMMC\_BOOT=1

### 4. 4 运行流程
通过链接脚本arch/arm/system-onesegment.ld第4行ENTRY(\_start)，可以知道程序从\_start开始执行，\_start位于arch/arm/crt0.S中，此文件实现了异常向量表、堆栈初始化、数据段初始化（data、BSS）并把自己移动到合适的地址，最后跳转到 [kmain](https://zhida.zhihu.com/search?content_id

### 5. 4.1 crt0.S
``` .section ".text.boot" .globl _start /* * 异常向量 */ _start: b reset    //复位异常 b arm_undefined  //未定义指令异常

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/little-kernel分析.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/little-kernel分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/little-kernel分析.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/little-kernel分析.md|原始文章]]
