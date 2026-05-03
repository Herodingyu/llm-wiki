---
doc_id: src-电源管理入门-4子系统reset
title: 电源管理入门 4子系统reset
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-4子系统reset.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 2 人赞同了该文章 ![](https://pic2.zhimg.com/v2-6a294be9bb3215fa02aace442eef7c8d_1440w.jpg)

## Key Points

### 1. 1\. 简介
![](https://pic4.zhimg.com/v2-57b85d6ec057aeb5e2ace1aa4b05f775_1440w.jpg) 复杂SoC内部有很多具有独立功能的硬件模块，例如CPU cores、GPU cores、USB控制器、MMC控制器、等等，出于功耗、稳定性等方面的考虑，有些SoC在内部为这些硬件模块设计了复位信号（reset signals），软件可通过寄存器（一般1

### 2. 2\. consumer-驱动软件
![](https://pic4.zhimg.com/v2-ab1f9704d3713893cd1d3f07be340af7_1440w.jpg) 对于硬件驱动来的需求来说，就是复位某个硬件，在驱动代码里面可以通过硬件的名字进行复位，这个名字对应设置放在了 [dts文件](https://zhida.zhihu.com/search?content_id=272281338&content_typ

### 3. 3\. provider-reset驱动
![](https://pic2.zhimg.com/v2-d7c63edbbe12cd0b9bbc581d4afdd36b_1440w.jpg)

### 4. 3.1 整体介绍
reset驱动是一个独立驱动，为其他驱动提供硬件复位的服务。首先在dts里面设置.compatible这样驱动就可以加载了，如下定义了rst驱动： ``` rst: reset-controller {

### 5. 3.2 reset复位API说明
devm\_reset\_control\_get ``` struct reset_control *devm_reset_control_get(struct device *dev, const char *id)

## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-4子系统reset.md) [[../../raw/tech/bsp/电源管理/电源管理入门-4子系统reset.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-4子系统reset.md) [[../../raw/tech/bsp/电源管理/电源管理入门-4子系统reset.md|原始文章]]
