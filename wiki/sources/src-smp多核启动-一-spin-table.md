---
doc_id: src-smp多核启动-一-spin-table
title: SMP多核启动（一）：spin table
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/SMP多核启动（一）：spin-table.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 6 人赞同了该文章 看这篇文章，你必备的一些前置知识有如下

## Key Points

### 1. 前言
看这篇文章，你必备的一些前置知识有如下 如果没有，可以去我的专栏目录下逛逛，会有所收获。

### 2. 1、SMP是什么？
SMP 英文为Symmetric Multi-Processing ，是对称多处理结构的简称，是指在一个计算机上汇集了一组处理器（多CPU），各CPU之间共享内存子系统以及总线结构，一个服务器系统可以同时运行多个处理器，并共享内存和其他的主机资源。

### 3. 2、启动方式
``` 程序为何可以在多个cpu上并发执行：他们有各自独立的一套寄存器，如：程序计数器pc,栈指针寄存器sp,通用寄存器等，可以独自 取指、译码、执行，当然内存和外设资源是共享的，多核环境下当访问临界区 资源一般 自旋锁来防止竞态发生。

### 4. 2.1 spin-table
spin-table启动流程的示意图如下： ![](https://pic3.zhimg.com/v2-da8d67094ce6982c44d527e73053e702_1440w.jpg) 芯片上电后primary cpu开始执行启动流程，而secondary cpu则将自身设置为WFE睡眠状态，并且为内核准备了一块内存，用于填写secondary cpu的入口地址。

### 5. 2.1.1 secondary cpu初始化状态设置
uboot启动时，secondary cpu会通过以下流程进入wfe状态（arch/arm/cpu/armv8/start.S）： ``` branch_if_master x0, x1, master_cpu                  （1）

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/SMP多核启动（一）：spin-table.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/SMP多核启动（一）：spin-table.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/SMP多核启动（一）：spin-table.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/SMP多核启动（一）：spin-table.md|原始文章]]
