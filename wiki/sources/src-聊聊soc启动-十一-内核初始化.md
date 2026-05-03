---
doc_id: src-聊聊soc启动-十一-内核初始化
title: 聊聊SOC启动（十一） 内核初始化
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/聊聊SOC启动（十一） 内核初始化.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片启动](https://www.zhihu.com/column/c_1513091402841554944) 23 人赞同了该文章 本文基于以下软硬件假定：

## Key Points

### 1. 1　内核入口函数
armv8架构内核的入口函数位于arch/arm64/kernel/head.S，它是内核启动的起点，其定义如下： ``` __HEAD efi_signature_nop            （1）

### 2. １.1　启动参数保存
armv8架构所有配置信息都位于 [dtb](https://zhida.zhihu.com/search?content_id=204352413&content_type=Article&match_order=1&q=dtb&zhida_source=entity) 中，因此bootloader只需要将dtb地址信息传给内核即可。内核启动后需要保存该参数，以给后面的模块使用，以下为其代码实现

### 3. １.2　异常等级初始化
异常等级初始化函数为init\_kernel\_el，其背景金额流程在上一篇中已经做了详细的介绍，这里不再重复

### 4. １.3　设置启动模式
它用于保存cpu启动时的异常等级，在smp系统中除了primary cpu之外，还存在若干的secondary cpu，而这些cpu应该以相同的异常等级启动。为了判断它们的启动EL是否相同，内核用一个如下所示的数组来记录系统cpu的启动模式，其定义如下：

### 5. 2　创建页表
上一篇已经分析过，在开启MMU前内核需要使用线性映射方式为 [idmap](https://zhida.zhihu.com/search?content_id=204352413&content_type=Article&match_order=1&q=idmap&zhida_source=entity) 段的地址创建identity map页表，并且为整个内核镜像创建init\_pg\_dir页

## Evidence

- Source: [原始文章](raw/tech/bsp/聊聊SOC启动（十一） 内核初始化.md) [[../../raw/tech/bsp/聊聊SOC启动（十一） 内核初始化.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/聊聊SOC启动（十一） 内核初始化.md) [[../../raw/tech/bsp/聊聊SOC启动（十一） 内核初始化.md|原始文章]]
