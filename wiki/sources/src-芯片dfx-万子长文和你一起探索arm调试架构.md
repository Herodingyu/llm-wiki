---
doc_id: src-芯片dfx-万子长文和你一起探索arm调试架构
title: 【芯片DFX】万子长文和你一起探索Arm调试架构
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【芯片DFX】万子长文和你一起探索Arm调试架构.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · ARM/Linux嵌入式](https://www.zhihu.com/column/c_1892354515245703770) 81 人赞同了该文章 > 这是一篇关于CoreSight很重磅的文章，来自知乎：高抛低吸莱斯利。

## Key Points

### 1. Glossary
| Term | Meaning | | --- | --- | | ADI | Arm Debug Interface | | AON | Always-ON | | AP | Access Port |

### 2. Perface
Arm对debug架构的定义分散在三个文档中： - Arm ARM\[1\]作为指令集手册， **对处理器内部的debug/trace功能进行了定义** ，这也是debug调试架构的基石 - Coresight\[2\] 架构定义了与Arm处理器相兼容 **的debug/trace行为** ， **本质上是Arm架构中debug feature的外延**

### 3. 1 Arm Debug Feature


### 4. 1.1 debug register interface
**各种形式的debug的最终目的都是获取core的状态，控制core的行为。** 这都是通过对core内的 **debug register进行读写** 来实现的。 因此首先讨论debug register interface，主要回答两个问题：

### 5. 1.2 self-hosted debug
如上文所述，self-hosted debug是Arm架构定义的两种调试模型之一。 这两种模型并不是面对同一需求可以互相替换的不同选择，它们一般被认为使用在不同的场景中：

## Evidence

- Source: [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【芯片DFX】万子长文和你一起探索Arm调试架构.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【芯片DFX】万子长文和你一起探索Arm调试架构.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【芯片DFX】万子长文和你一起探索Arm调试架构.md) [[../../raw/tech/bsp/TrustZone--ARM_Linux嵌入式/【芯片DFX】万子长文和你一起探索Arm调试架构.md|原始文章]]
