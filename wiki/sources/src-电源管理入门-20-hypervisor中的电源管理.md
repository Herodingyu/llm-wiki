---
doc_id: src-电源管理入门-20-hypervisor中的电源管理
title: 电源管理入门 20 Hypervisor中的电源管理
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/电源管理/电源管理入门-20 Hypervisor中的电源管理.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 1 人赞同了该文章 ![](https://picx.zhimg.com/v2-51ecd71177009c9ea4d74425a91daf45_1440w.jpg)

## Key Points

### 1. 1\. Hypervisor概念介绍
![](https://pica.zhimg.com/v2-345b6a172e239f553dd4b3017a645aea_1440w.jpg) **[虚拟机管理器](https://zhida.zhihu.com/search?content_id=272741227&content_type=Article&match_order=1&q=%E8%99%9A%E6%8B%9F%E6%9C%B

### 2. 2\. 汽车软件中的Hypervisor应用
![](https://pic3.zhimg.com/v2-520882cf26c01b47ad8278142311f190_1440w.jpg) **Hypervisor** 处于 SoC 硬件平台之上，将实体资源（如 CPU、内存、存储空间、网络适配器、外设等 ) 转换为 **虚拟资源** ，按需分配给每个虚拟机，允许它们独立地访问已授权的虚拟资源。Hypervisor 实现了 **硬件资源的

### 3. 3\. QNX Hypervisor
![](https://pic2.zhimg.com/v2-14868fd837cff59269821105e9449597_1440w.jpg) QNX Hypervisor是基于 **Type 1** 实时优先级的微内核管理程序，用于管理虚拟机。在QNX ® 虚拟机管理程序可以更容易地获得并通过从不同的客户机操作系统的非安全关键组分分离安全关键部件保持安全认证。QNX Hypervisor能够

### 4. 4\. Hypervisor中的多OS通信技术
![](https://pic1.zhimg.com/v2-004753ef14c1458bb6b8e15e80e1a1fc_1440w.jpg) Hypervisor中有很多技术，例如 **CPU 虚拟化和节能降耗技术** 、 **IO 设备虚拟化** 、 **实时性技术** 、 **安全和可靠性技术** 等，大家可以自己查资料去学习，特别是参考国内的minos，bao-hypervisor开源

### 5. 5\. 电源管理相关
例如司机不开车时 **对整车进行关机** ，那么这个命令如何在三个OS直接传递执行，这里必须有一个次序，并且有一个代理人。比如 **司机** （ **上帝** ）发送了一个指令给汽车，汽车里面的 **车控OS** 最先接收到指令（教皇），然后教皇下令给 **座舱OS** （ **大主教** ），大主教继续给 **智驾OS** （ **主教** ）传达命令，然后各自去完成指令。

## Evidence

- Source: [原始文章](raw/tech/bsp/电源管理/电源管理入门-20 Hypervisor中的电源管理.md) [[../../raw/tech/bsp/电源管理/电源管理入门-20 Hypervisor中的电源管理.md|原始文章]]

## Key Quotes

> "CPU、内存、存储空间、网络适配器、外设等"

> "硬件隔离、虚拟化隔离、容器隔离、进程隔离等"

> "集群+信息娱乐汽车系统，ECU整合，医疗设备，工业控制"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/电源管理/电源管理入门-20 Hypervisor中的电源管理.md) [[../../raw/tech/bsp/电源管理/电源管理入门-20 Hypervisor中的电源管理.md|原始文章]]
