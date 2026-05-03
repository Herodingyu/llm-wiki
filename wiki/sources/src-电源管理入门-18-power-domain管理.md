---
doc_id: src-电源管理入门-18-power-domain管理
title: 电源管理入门 18 Power Domain管理
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-18 Power Domain管理.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 2 人赞同了该文章 ![](https://pic1.zhimg.com/v2-94169dffc9e4f61b6191844bfdf64c86_1440w.jpg)

## Key Points

### 1. 1\. 框架介绍
![](https://pic1.zhimg.com/v2-f2ca569b05b729ef15005f3d7ad60204_1440w.jpg) Kernel的 **[PM domain framework](https://zhida.zhihu.com/search?content_id=272740691&content_type=Article&match_order=1&q=PM+do

### 2. 2\. 如何使用power domain
在dts中定义一个power domain节点，同时在驱动中注册该power domain即可 ``` //DTS中定义power domain节点，这里以内核文档提供的例程 parent: power-controller@12340000 {

### 3. 3\. provider
``` int pm_genpd_init(struct generic_pm_domain *genpd, struct dev_power_governor *gov, bool is_off)  //初始化一个 generic_pm_domain 实例

### 4. 4\. Consumer
Cousumer可能是一个驱动程序或者sysfs，在驱动probe函数中调用dev\_pm\_domain\_attach ``` ret = dev_pm_domain_attach(_dev, true);  //将设备与电源域进行耦合

### 5. 参考：
1. [news.eeworld.com.cn/mp/](https://link.zhihu.com/?target=http%3A//news.eeworld.com.cn/mp/rrgeek/a144963.jspx)

## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-18 Power Domain管理.md) [[../../raw/tech/bsp/电源管理/电源管理入门-18 Power Domain管理.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-18 Power Domain管理.md) [[../../raw/tech/bsp/电源管理/电源管理入门-18 Power Domain管理.md|原始文章]]
