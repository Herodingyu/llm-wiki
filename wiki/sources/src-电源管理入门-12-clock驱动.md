---
doc_id: src-电源管理入门-12-clock驱动
title: 电源管理入门 12 clock驱动
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-12 clock驱动.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 9 人赞同了该文章 ![](https://pic2.zhimg.com/v2-aefd3dfb8925c86c046e25d5b1d257d7_1440w.jpg)

## Key Points

### 1. 1\. clock驱动构架
![](https://picx.zhimg.com/v2-282b97f853fbb083cf2d8bf7da8c17e1_1440w.jpg) Linux的时钟子系统由 **[CCF](https://zhida.zhihu.com/search?content_id=272340598&content_type=Article&match_order=1&q=CCF&zhida_source

### 2. 1.2 clock consumer介绍
时钟的使用者，clock子系统向consumer的提供通用的时钟API接口，使其可以屏蔽底层硬件差异。提供给consumer操作的 **API** 如下： ``` struct clk *clk_get(struct device *dev, const char *id);

### 3. 2\. Clock Provider
根据 clock 的特点，clock framework 将 clock 分为 **fixed rate、gate、devider、mux、fixed factor、composite** 六类。 ![](https://pic2.zhimg.com/v2-c89daf756b86bee692c40a01938fb539_1440w.jpg)

### 4. 2.1 数据结构表示
上面六类本质上都属于clock device，内核把这些 clock HW block 的特性抽取出来，用 struct clk\_hw 来表示，具体如下： ``` struct clk_hw { //指向CCF模块中对应 clock device 实例

### 5. 2.2 clock provider注册初始化
clock驱动在时钟子系统中属于provider，provider是时钟的提供者，即具体的clock驱动。 **clock驱动在Linux刚启动的时候就要完成，比 `initcall` 都要早期，因此clock驱动是在内核中进行实现。**

## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-12 clock驱动.md) [[../../raw/tech/bsp/电源管理/电源管理入门-12 clock驱动.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-12 clock驱动.md) [[../../raw/tech/bsp/电源管理/电源管理入门-12 clock驱动.md|原始文章]]
