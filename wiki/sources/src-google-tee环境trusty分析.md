---
doc_id: src-google-tee环境trusty分析
title: 工具链设置
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Google TEE环境trusty分析.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 3 人赞同了该文章 - [Trusty App](https://zhuanlan.zhihu.com/write)

## Key Points

### 1. 概要
**trusty** 是基于 [little kernel](https://zhida.zhihu.com/search?content_id=248607930&content_type=Article&match_order=1&q=little+kernel&zhida_source=entity) 开发的，关于little kernel的文章请参考我之前的文章【little kernel

### 2. LK初始化钩子
little kernel为了方便初始化过程，创造了一种初始化方法。 具体实现位于 `external/lk/include/lk/init.h` 、 `external/lk/top/init.c` 中

### 3. 初始化过程
系统把初始化过程分步，通过初始化等级描述，值越小越早执行。初始化等级通过枚举定于 ``` enum lk_init_level { LK_INIT_LEVEL_EARLIEST    = 1, LK_INIT_LEVEL_ARCH_EARLY     = 0x10000,

### 4. 初始化cpu
并把初始化钩子按要执行的处理器分类，类别通过枚举定义 ``` /* 处理器标示 */ enum lk_init_flags { LK_INIT_FLAG_PRIMARY_CPU     = 0x1,/* 主处理器 */

### 5. 钩子描述符
通过一个结构体记录钩子信息 ``` /* 钩子描述符 */ struct lk_init_struct { uint level;         /* 初始化顺序（数字越小执行越早） */ uint flags;         /* 指定此钩子函数由哪些cpu执行 */

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Google TEE环境trusty分析.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Google TEE环境trusty分析.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Google TEE环境trusty分析.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/Google TEE环境trusty分析.md|原始文章]]
