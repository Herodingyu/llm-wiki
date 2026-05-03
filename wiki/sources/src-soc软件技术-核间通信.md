---
doc_id: src-soc软件技术-核间通信
title: SoC软件技术  核间通信
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/SoC软件技术--核间通信.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_2022261694877975679) 不坠青云之志 等 64 人赞同了该文章 ![](https://pic2.zhimg.com/v2-958be64956e479fba1cb2fc56564d8e7_1440w.jpg)

## Key Points

### 1. 1\. 数据放mailbox硬件实现
![](https://pic4.zhimg.com/v2-a48879fe639bc76d3838fed4725014df_1440w.jpg) 完全 **用硬件实现数据传输** 不使用共享内存，那么数据就需要放入硬件的 **data寄存器** 里面就可以了，然后触发对方的 **中断** 去接收处理。

### 2. 1.1 PL320硬件手册
这里以ARM一个经典的Mailbox硬件PL320为例进行说明，怎么样去拿到一手资料，那必须是ARM官网。 首先进入 **ARM官网： [developer.arm.com](https://link.zhihu.com/?target=https%3A//developer.arm.com)** 搜索 **PL320** ：

### 3. 1.2 PL320驱动（linux为例）
直接上 **github代码链接** ： [github.com/torvalds/lin](https://link.zhihu.com/?target=https%3A//github.com/torvalds/linux/blob/master/drivers/mailbox/pl320-ipc.c)

### 4. 2\. 数据放共享内存实现
参考之前的文章： [电源管理入门-5 arm-scmi和mailbox核间通信](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484716%26idx%3D2%26sn%3D5b68f1dd7fe42a7a8d293d462fb9f205%

### 5. 3\. 数据的软件协议格式


## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/SoC软件技术--核间通信.md) [[../../raw/tech/bsp/芯片底软及固件/SoC软件技术--核间通信.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/SoC软件技术--核间通信.md) [[../../raw/tech/bsp/芯片底软及固件/SoC软件技术--核间通信.md|原始文章]]
