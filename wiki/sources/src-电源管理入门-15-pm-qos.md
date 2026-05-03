---
doc_id: src-电源管理入门-15-pm-qos
title: 电源管理入门 15 PM QoS
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-15 PM QoS.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 3 人赞同了该文章 ![](https://pic3.zhimg.com/v2-40fecae8f2084113acd94f2d156263ba_1440w.jpg)

## Key Points

### 1. 1\. 系统框架介绍


### 2. 1.1 功耗控制可能影响用户体验的一些痛点
![](https://pica.zhimg.com/v2-12f958e700d06e484fbc49bf24cf862c_1440w.jpg) 而且功耗管理会引入对 **性能的缺点** ，主要两方面：

### 3. 1.2 QoS框架
![](https://pic4.zhimg.com/v2-5cf5df730160220d207bdb963c7e1a17_1440w.jpg) PM QOS使用 **constraint（约束）** 作为指标，用于各模块对PM的诉求及限制。当前系统的指标主要有两类，分别对应两个PM QOS framework。

### 4. 2\. 用户空间操作流程
![](https://pic2.zhimg.com/v2-38d5d34c146e050b8d42f77c422e062f_1440w.jpg)

### 5. 2.2 用户空间数据结构和API
``` struct pm_qos_object { struct pm_qos_constraints *constraints; struct miscdevice pm_qos_power_miscdev;

## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-15 PM QoS.md) [[../../raw/tech/bsp/电源管理/电源管理入门-15 PM QoS.md|原始文章]]

## Key Quotes

> "吞吐量（Throughput）减少"

> "对其他模块的影响就类比为服务的质量"

> "target\_value、default\_value"

> "pm\_qos\_add\_request"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-15 PM QoS.md) [[../../raw/tech/bsp/电源管理/电源管理入门-15 PM QoS.md|原始文章]]
