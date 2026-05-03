---
doc_id: src-一文看懂gicv3
title: 一文看懂GICv3
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/一文看懂GICv3.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 中断系统](https://www.zhihu.com/column/c_1513125306935898112) 67 人赞同了该文章 由于SOC中外设及与其相关的中断数量众多，且各中断又有多种不同的配置方式，为了减轻CPU的负担，现代处理器中断的配置和管理一般都通过 [中断控制器](https://zhida.zhihu.com/search?content_id=203717196&content_type=Article&match_order=1&q=%E4%B8%AD%E6%96%AD%E6%8E%A7%E5%88%B6%E5%99%A8&zhida_source=e

## Key Points

### 1. 1　GIC基本功能


### 2. １.1　GICv3概述
由于SOC中外设及与其相关的中断数量众多，且各中断又有多种不同的配置方式，为了减轻CPU的负担，现代处理器中断的配置和管理一般都通过 [中断控制器](https://zhida.zhihu.com/search?content_id=203717196&content_type=Article&match_order=1&q=%E4%B8%AD%E6%96%AD%E6%8E%A7%E5%88%B6

### 3. １.2　GICv3组件
为了实现中断的配置、接收、仲裁和路由功能，GICv3设计了如图2所示的不同组件，它包含了SPI、 [PPI](https://zhida.zhihu.com/search?content_id=203717196&content_type=Article&match_order=1&q=PPI&zhida_source=entity) 、 [SGI](https://zhida.zhihu.com

### 4. １.3　GICv3的中断属性
在GICv3中，不同中断类型具有不同的中断号范围，其定义如下： | 中断类型 | 中断号 | 说明 | | --- | --- | --- | | SGI | 0 - 15 |  | | PPI | 16 – 31 |  |

### 5. １.4　GICv3的中断生命周期
当中断配置完成后中断即可被触发，GIC中断的触发和处理流程如下： ![](https://pica.zhimg.com/v2-e30e67c11a7a6797a308487af5bebdd4_1440w.jpg)

## Evidence

- Source: [原始文章](raw/tech/bsp/一文看懂GICv3.md) [[../../raw/tech/bsp/一文看懂GICv3.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/一文看懂GICv3.md) [[../../raw/tech/bsp/一文看懂GICv3.md|原始文章]]
