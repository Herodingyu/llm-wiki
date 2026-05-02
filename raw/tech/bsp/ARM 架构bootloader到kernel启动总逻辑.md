---
title: "ARM 架构bootloader到kernel启动总逻辑"
source: "https://zhuanlan.zhihu.com/p/687868462"
author:
  - "[[向阳而生计算机系统软件，网络安全技术，嵌入式开发，内核驱动开发]]"
published:
created: 2026-05-02
description: "ARM架构中，EL0/EL1是必须实现，EL2/EL3是选配，ELx跟层级对应关系： EL0 -- appEL1 -- Linux kernel 、lkEL2 -- hypervisor（虚拟化）EL3 -- ARM trust firmware 、pre-loader若平台未实现EL3（atf），pre-loader…"
tags:
  - "clippings"
---
[收录于 · 计算机&通信技术](https://www.zhihu.com/column/c_1695749314725486593)

一口Linux 等 151 人赞同了该文章

[ARM架构](https://zhida.zhihu.com/search?content_id=240989902&content_type=Article&match_order=1&q=ARM%E6%9E%B6%E6%9E%84&zhida_source=entity) 中， [EL0](https://zhida.zhihu.com/search?content_id=240989902&content_type=Article&match_order=1&q=EL0&zhida_source=entity) / [EL1](https://zhida.zhihu.com/search?content_id=240989902&content_type=Article&match_order=1&q=EL1&zhida_source=entity) 是必须实现， [EL2](https://zhida.zhihu.com/search?content_id=240989902&content_type=Article&match_order=1&q=EL2&zhida_source=entity) / [EL3](https://zhida.zhihu.com/search?content_id=240989902&content_type=Article&match_order=1&q=EL3&zhida_source=entity) 是选配，ELx跟层级对应关系：

若平台未实现EL3（atf），pre-loader直接加载lk：

![](https://pica.zhimg.com/v2-5234565c41c9838a28f20a919593c0a0_1440w.jpg)

若平台实现EL3，则需要先加载完ATF再由ATF去加载lk：

![](https://picx.zhimg.com/v2-90846375cd28eddc19f5d535e8e94f9d_1440w.jpg)

bootloader 启动分两个阶段，一个是pre-loader加载lk（ [u-boot](https://zhida.zhihu.com/search?content_id=240989902&content_type=Article&match_order=1&q=u-boot&zhida_source=entity) ）阶段，另一个是lk加载kernel阶段。

**1-3：** 设备上电起来后，跳转到 [Boot ROM](https://zhida.zhihu.com/search?content_id=240989902&content_type=Article&match_order=1&q=Boot+ROM&zhida_source=entity) (不是flash)中的boot code中执行把pre-loader加载起到 [ISRAM](https://zhida.zhihu.com/search?content_id=240989902&content_type=Article&match_order=1&q=ISRAM&zhida_source=entity) ， 因为当前 [DRAM](https://zhida.zhihu.com/search?content_id=240989902&content_type=Article&match_order=1&q=DRAM&zhida_source=entity) （RAM分SRAM跟DRAM，SRAM是cache，DRAM是普通内存）还没有准备好，所以要先把pre-loader load到芯片内部的ISRAM（Internal SRAM)中。  
**4-6：** pre-loader初始化好DRAM后就将lk从flash（nand/emmc）中加载到DRAM中运行；

**7-8：** 解压bootimage成ramdisk跟kernel并载入DRAM中,初始化dtb；

**9-11：** lk跳转到kernl初始化, kernel初始化完成后fork出init进程， 然后拉起ramdisk中的init程序，进入用户空间初始化

发布于 2024-03-19 16:01・广东[Abaqus结构仿真双证班，保姆式小班教学，从0到1快速学会做仿真！](https://zhuanlan.zhihu.com/p/689280534)

[

2024结构仿真双证研修班招生简章为推动中国智造强国战略，仿真秀以“为行业选才育才”为宗旨，2022年正式成立仿真高研院开展仿真工程师职业培训。 截止目前 已经有超1500学员报名学...

](https://zhuanlan.zhihu.com/p/689280534)