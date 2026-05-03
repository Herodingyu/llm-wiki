---
doc_id: src-一文搞懂linux电源管理-合集
title: 一文搞懂Linux电源管理（合集）
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/一文搞懂Linux电源管理（合集）.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · linux功耗管理](https://www.zhihu.com/column/c_1589903721982472192) 78 人赞同了该文章 目录

## Key Points

### 1. 1， 介绍
万物运行遵循 [能量守恒定律](https://zhida.zhihu.com/search?content_id=217190538&content_type=Article&match_order=1&q=%E8%83%BD%E9%87%8F%E5%AE%88%E6%81%92%E5%AE%9A%E5%BE%8B&zhida_source=entity) ，因此，世界上并不存在永动机，一切运动

### 2. 2， 框架
![](https://pic3.zhimg.com/v2-a9d60176bbc44fdd4613610c2d857efc_1440w.jpg) linux功耗管理框架 功耗管理不仅是软件的逻辑，还需要硬件功能的支撑。硬件设计决定了功耗的下限，热设计决定了功耗的上限，而软件就是通过一些机制及策略将功耗尽可能逼近硬件功耗下限。

### 3. 3， 内核中各低功耗管理模块框架


### 4. 3.1 clock framework
详见文章《 [一文搞懂linux clock子系统 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/558783244) 》 ![](https://picx.zhimg.com/v2-746f6cf9fc2941792624887da8c07991_1440w.jpg)

### 5. 3.2 Regulator framework
详见文章《 [一文搞懂linux regulator子系统 - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/565532795) 》 ![](https://pic3.zhimg.com/v2-1bfae715afd9902baa119693cee5f6a2_1440w.jpg)

## Evidence

- Source: [原始文章](raw/tech/bsp/一文搞懂Linux电源管理（合集）.md) [[../../raw/tech/bsp/一文搞懂Linux电源管理（合集）.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/一文搞懂Linux电源管理（合集）.md) [[../../raw/tech/bsp/一文搞懂Linux电源管理（合集）.md|原始文章]]
