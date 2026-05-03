---
doc_id: src-uboot入门-4命令行和驱动管理
title: # Device Tree Control
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/芯片底软及固件/uboot入门-4命令行和驱动管理.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 芯片底软及固件](https://www.zhihu.com/column/c_2025981427003527181) 2 人赞同了该文章 ![](https://pica.zhimg.com/v2-62427bb1c742ff9b332a4d9d29550d7c_1440w.jpg)

## Key Points

### 1. 1\. 命令行
![](https://picx.zhimg.com/v2-321f4ff011d8d88fbc4262ad758dd5cd_1440w.jpg) 先回顾下之前的启动过程： 1. ENTRY(\_start)（arch/arm/lib/ **vectors.S** ）

### 2. 1.1 main\_loop到进入命令行
![](https://pic3.zhimg.com/v2-b608a40cd77f60a8b952578312e4d1b6_1440w.jpg) **board\_init\_r** 里面执行函数的数组最后一个元素就是 **run\_main\_loop** ，然后调用 **main\_loop** ，这里开始已经全是C语言函数了。这里我们从命令行打印开始看下，搜索： **Hit any key

### 3. 1.2 进入命令行
**abortboot** （）函数 **检测是否有手动输入** ，就进入命令行，这里有个倒计时：CONFIG\_BOOTDELAY中定义 ``` include/generated/autoconf.h

### 4. 1.3 添加或打开命令行
首先uboot支持了很多命令，但是不是默认就打开的，例如smc命令，在cmd/smccc.c中 ``` U_BOOT_CMD( smc,    9,        2,    do_call, "Issue a Secure Monitor Call",

### 5. 2.1 设备树
调试过linux驱动的都清楚，linux驱动的配置文件和开关都是 **dts设备树** 里面，可以参考之前的文章： [Linux驱动入门-设备树DTS](https://link.zhihu.com/?target=http%3A//mp.weixin.qq.com/s%3F__biz%3DMzUzMDMwNTg2Nw%3D%3D%26mid%3D2247484526%26idx%3D1%26sn

## Evidence

- Source: [原始文章](raw/tech/bsp/芯片底软及固件/uboot入门-4命令行和驱动管理.md) [[../../raw/tech/bsp/芯片底软及固件/uboot入门-4命令行和驱动管理.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/芯片底软及固件/uboot入门-4命令行和驱动管理.md) [[../../raw/tech/bsp/芯片底软及固件/uboot入门-4命令行和驱动管理.md|原始文章]]
