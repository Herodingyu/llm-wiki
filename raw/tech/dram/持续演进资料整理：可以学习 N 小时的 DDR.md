---
title: "[持续演进]资料整理：可以学习 N 小时的 DDR"
source: "https://zhuanlan.zhihu.com/p/595979882"
author:
  - "[[LogicJitterGibbsICer && 业余FPGAer]]"
published:
created: 2026-05-02
description: "一起随笔者学习 DDR/LPDDR 吧写在前面本文收录文章的作者如下，感谢你们的分享与奉献！ 老狼 //BIOSNrush //OS电子小白菜 //嵌入式执笔存心 //Memory 从业者折腾总监IT奶爸 //Platform Architecture一只豌豆象-CSD…"
tags:
  - "clippings"
---
[收录于 · 存储的故事](https://www.zhihu.com/column/c_1296231240622690304)

丑八怪55 等 287 人赞同了该文章

目录

> 一起随笔者学习 DDR/LPDDR 吧

## 写在前面

本文收录文章的作者如下，感谢你们的分享与奉献！

- [老狼](https://www.zhihu.com/people/mikewolfwoo) //BIOS
- [Nrush](https://www.zhihu.com/people/nrush-72) //OS
- [电子小白菜](https://www.zhihu.com/people/jiang-hu-xiao-bai-cai-77) //嵌入式
- [执笔存心](https://www.zhihu.com/people/yu-liu-feng-99-12) //Memory 从业者
- [折腾总监](https://www.zhihu.com/people/da-mo-gu-zhou-92)
- [IT奶爸](https://www.zhihu.com/people/wo-shi-yu-36-26) // [Platform Architecture](https://zhida.zhihu.com/search?content_id=220573084&content_type=Article&match_order=1&q=Platform+Architecture&zhida_source=entity)
- [一只豌豆象-CSDN博客](https://link.zhihu.com/?target=https%3A//blog.csdn.net/2301_77080582)
- [LogicJitterGibbs](https://www.zhihu.com/people/ljgibbs) //SoC 集成
- [lingo](https://www.zhihu.com/people/lingo-20-38) //FPGA
- [一博科技-高速先生](https://www.zhihu.com/org/yi-bo-ke-ji-gao-su-xian-sheng) / [一博科技](https://www.zhihu.com/people/edadoc) // DDR PCB 设计与 SI 分析优化
- [棉花糖one](https://www.zhihu.com/people/mian-hua-tang-one-49)
- [now](https://www.zhihu.com/people/now-88-1)
- [Shannon](https://www.zhihu.com/people/shannon_du)

以上排名不分前后，这个列表可能会稍有延迟，没有列全所有作者信息，会尽快更新。

## 0 专栏

[存储的故事](https://www.zhihu.com/column/c_1296231240622690304)

知乎专栏 《存储的故事》：用 0 和 1 记录这世界的漫漫长夜。

## 1 DDR 原理与协议

### DDR 原理介绍与科普

- **知乎优秀答主老狼专栏内存系列文章，硬件/BIOS 工程师视角：**

[老狼：内存系列一：快速读懂内存条标签](https://zhuanlan.zhihu.com/p/26255460)

[老狼：内存系列二：深入理解硬件原理](https://zhuanlan.zhihu.com/p/26327347)

[老狼：内存系列三：内存初始化浅析](https://zhuanlan.zhihu.com/p/26387396)

[老狼：内存频率是怎么算出来的？2133MHz这么奇怪的数字是怎么来的？](https://zhuanlan.zhihu.com/p/69253210)

[老狼：DDR3 vs DDR4? 为什么说内存是个很傻的设备？DDR5在哪里？](https://zhuanlan.zhihu.com/p/62234511)

更多文章： [老狼：专栏文章索引](https://zhuanlan.zhihu.com/p/35786702)

- **协议视角的 DDR 介绍系列文章：**

[LogicJitterGibbs：译文：DDR4 - Initialization, Training and Calibration](https://zhuanlan.zhihu.com/p/261747940)

[LogicJitterGibbs：译文： DDR4 SDRAM - Understanding the Basics（上）](https://zhuanlan.zhihu.com/p/262052220)

[LogicJitterGibbs：译文： DDR4 SDRAM - Understanding the Basics（下）](https://zhuanlan.zhihu.com/p/263080272)

- **不同工程师视角的 DDR 基础知识总结&介绍：**

[Nrush：DDR基础](https://zhuanlan.zhihu.com/p/627566068) // Linux 内核工程师

[电子小白菜：DDR基础知识总结](https://zhuanlan.zhihu.com/p/113297027) //嵌入式工程师视角

[IT奶爸：聊一聊DDR（1）-DDR5基本介绍](https://zhuanlan.zhihu.com/p/593120754) // 服务器/CPU 平台架构工程师视角

[执笔存心：DRAM](https://zhuanlan.zhihu.com/p/676313032) // Memory 设计工程师视角，包括了 DRAM 电路、工艺和制造方面的见解

- **从基础原理出发的 DDR 介绍系列文章：**

[折腾总监：DDR 探密一：从电容鼓到 DDR，内存技术进化史](https://zhuanlan.zhihu.com/p/663690992)

[折腾总监：DDR 探密二：深入剖析 DRAM 芯片的存储原理](https://zhuanlan.zhihu.com/p/663697786)

[折腾总监：DDR 探密三：DDR 多芯片组织形式](https://zhuanlan.zhihu.com/p/663703249)

- **DDR 原理的书籍**

[LogicJitterGibbs：\[译文\] DRAM Circuit Design: A Tutorial 前言与目录](https://zhuanlan.zhihu.com/p/642368502)

### DDR 协议介绍

[老狼：DDR5有什么新特性？是不是该等它再升级电脑呢？](https://zhuanlan.zhihu.com/p/71923585)

### DDR 协议学习

[LogicJitterGibbs：DDR 学习时间 (Part B - 1)：DRAM 刷新](https://zhuanlan.zhihu.com/p/343262874)

[LogicJitterGibbs：DDR 学习时间 (Part B - 2)：DRAM 自刷新](https://zhuanlan.zhihu.com/p/346528173)

[LogicJitterGibbs：DDR 学习时间 (Part B - 3)：Write Leveling](https://zhuanlan.zhihu.com/p/348360737)

[LogicJitterGibbs：DDR 学习时间 (Part B - 4)：DRAM 上电与复位初始化](https://zhuanlan.zhihu.com/p/466895590)

[LogicJitterGibbs：DDR 学习时间 (Part B - 5)：DRAM 颗粒容量规格](https://zhuanlan.zhihu.com/p/602691824)

[LogicJitterGibbs：DDR 学习时间 (Part B - 6)：DRAM ZQ 校正](https://zhuanlan.zhihu.com/p/688796282)

[LogicJitterGibbs：DDR 学习时间 (Part B - 7)：Gear-dwon Mode](https://zhuanlan.zhihu.com/p/798966553)

[LogicJitterGibbs：DDR 学习时间 (Part B - 8)：DRAM DBI 特性](https://zhuanlan.zhihu.com/p/832276681)

[LogicJitterGibbs：译文：DDR4 SDRAM - Understanding Timing Parameters](https://zhuanlan.zhihu.com/p/268347945)

[执笔存心：JEDEC DDR4学习笔记](https://zhuanlan.zhihu.com/p/676316128)

### DDR 协议翻译

[LogicJitterGibbs：\[转载\] JESD79-4 DDR4 协议翻译](https://zhuanlan.zhihu.com/p/679063811)

### DDR 电路结构

[执笔存心：DRAM微缩与结构演化](https://zhuanlan.zhihu.com/p/688584429)

[执笔存心：DRAM Sense Amplifier (SA) 电路基本原理](https://zhuanlan.zhihu.com/p/704931070)

[棉花糖one：DRAM ZQ校准个人理解](https://zhuanlan.zhihu.com/p/718845300)

### DDR 功耗

[LogicJitterGibbs：DDR 学习时间 (Part A - 2)：学习 Micron DDR4 TN-40-07： DDR4 功耗估算 (1)](https://zhuanlan.zhihu.com/p/668881841)

[LogicJitterGibbs：DDR 学习时间 (Part A - 2)：学习 Micron DDR4 TN-40-07： DDR4 功耗估算 (2) 完](https://zhuanlan.zhihu.com/p/671112521)

### DDR 某些特性细究

\[PPR\] [老狼：内存的容错设计是怎样的？内存容量比你看到的更大！](https://zhuanlan.zhihu.com/p/60594428)

\[PPR\] [老狼：内存对抗损坏的坚实堡垒：封装后修复（PPR）是什么？](https://zhuanlan.zhihu.com/p/424346934)

\[刷新\] [老狼：内存不刷新了会怎么样？为什么会变成黑白条而不是全黑？](https://zhuanlan.zhihu.com/p/259854765)

### DDR 与 LPDDR

[LogicJitterGibbs：DDR 学习时间 (Part A - 3)：翻译 Micron DDR TN-46-15： 低功耗与标准 DDR SDRAM 对比](https://zhuanlan.zhihu.com/p/682723236)

[老狼：手机中的LPDDR为什么不能替代电脑里的DDR？谁速度更快？](https://zhuanlan.zhihu.com/p/259866605)

### DDR 与 HBM 以及 GDDR

[老狼：GDDR6 vs DDR4 vs HBM2?为什么CPU还不用GDDR？异构内存的未来在哪里？](https://zhuanlan.zhihu.com/p/83935084)

## 2 DDR 系统

### DDR 系统仿真

[LogicJitterGibbs：DDR 学习时间 (Part Z - 1)：芯片设计中的 DDR 模型杂谈](https://zhuanlan.zhihu.com/p/397260462)

[LogicJitterGibbs：DDR 学习时间 (Part S - 1)：运行 Micron DDR3 仿真模型](https://zhuanlan.zhihu.com/p/691165787)

### DDR 调试与测试

[LogicJitterGibbs：DDR 学习时间 (Part D - 1)：\[TL\]DDR调试与兼容性验证系列讲座(一)](https://zhuanlan.zhihu.com/p/401232961)

[LogicJitterGibbs：DDR 学习时间 (Part D - 2)：\[TL\]DDR调试与兼容性验证系列讲座(二)](https://zhuanlan.zhihu.com/p/601175129)

[LPDDR4 JEDEC标准测试实例解析--写操作](https://link.zhihu.com/?target=https%3A//blog.csdn.net/2301_77080582/article/details/131580174)

[LPDDR4 JEDEC标准测试实例解析--读操作](https://link.zhihu.com/?target=https%3A//blog.csdn.net/2301_77080582/article/details/131594021)

[LPDDR4 JEDEC标准测试实例解析--地址总线写操作](https://link.zhihu.com/?target=https%3A//blog.csdn.net/2301_77080582/article/details/131594200)

### DDR 性能分析与调优

- **系统/平台架构视角，选取这系列 DDR 介绍文章中系统性能相关的文章**

[IT奶爸：聊一聊DDR（7）—— 内存交织（memory interleaving）](https://zhuanlan.zhihu.com/p/646850159)

[IT奶爸：聊一聊DDR（7）—— Turnaround时间和对性能的影响](https://zhuanlan.zhihu.com/p/624930884)

[IT奶爸：聊一聊DDR（6）—— 性能测试](https://zhuanlan.zhihu.com/p/605759715) 、

[老狼：双通道、四通道内存对游戏重要吗？](https://zhuanlan.zhihu.com/p/40601422)

### DDR 内存条

[老狼：如何用好你的高端内存条？什么是XMP？](https://zhuanlan.zhihu.com/p/34225626)

[老狼：看图识内存](https://zhuanlan.zhihu.com/p/108058770)

[老狼：DDR5 vs DDR4：I3C和I2C相较提高了什么？为什么必须升级到I3C？](https://zhuanlan.zhihu.com/p/421387137)

[老狼：DDR5来了，它长什么样？外观上有哪些特征？是不是该上船了？](https://zhuanlan.zhihu.com/p/419611831)

[老狼：选择内存条的必备知识：x16内存条为什么这么慢？2R和1R重要吗？](https://zhuanlan.zhihu.com/p/388207347)

[老狼：服务器最大内存是多少？制约因素有些什么呢？](https://zhuanlan.zhihu.com/p/60830925)

[老狼：内存条应该怎么插？为什么要从远端插起？不遵循为啥还可以work？有啥副作用？](https://zhuanlan.zhihu.com/p/54517790)

[老狼：单根内存条的极限容量是多少？内存条上的2R X 8代表了什么意思？](https://zhuanlan.zhihu.com/p/61754372)

[Shannon：DDR5内存全家照](https://zhuanlan.zhihu.com/p/675768122)

### DDR 系统地址映射

[老狼：内存是怎么映射到物理地址空间的？内存是连续分布的吗？](https://zhuanlan.zhihu.com/p/66288943)

### DDR 系统功耗

[老狼：电脑内存占用满会比占用率很低时更加费电吗？](https://zhuanlan.zhihu.com/p/47860703)

### DDR 与内存安全

[老狼：内存不刷新会怎样？内存的物理攻击和旁路攻击](https://zhuanlan.zhihu.com/p/64454974)

### BIOS 中的 DDR 相关代码

[老狼：内存为什么要Training? 内存初始化代码为什么是BIOS中的另类？](https://zhuanlan.zhihu.com/p/107898009)

## 3 DDR 控制器/PHY 实现

这节收录 DDR 控制器、物理层（PHY）以及相关 IP 实现（包括 FPGA 上的 DDR IP）。以及控制器和物理层间的 DFI 协议学习。

### DDR 控制器与物理层间的 DFI 协议学习

[LogicJitterGibbs：DDR 学习时间 (Part C - 1)：DFI 协议简介、演进和协议下载](https://zhuanlan.zhihu.com/p/668915189)

[LogicJitterGibbs：DDR 学习时间 (Part C - 2)：DFI 5.1 协议学习 目录](https://zhuanlan.zhihu.com/p/671137465)

[LogicJitterGibbs：DDR 学习时间 (Part C - 3)：DFI 协议功能 - DFI PHY 与 DFI 时钟频率比](https://zhuanlan.zhihu.com/p/682379992)

[LogicJitterGibbs：DDR 学习时间 (Part C - 4)：DFI 协议功能 - 初始化](https://zhuanlan.zhihu.com/p/687541219)

[LogicJitterGibbs：DDR 学习时间 (Part C - 5)：DFI 架构](https://zhuanlan.zhihu.com/p/690055351)

[LogicJitterGibbs：DDR 学习时间 (Part C - 6)：DFI 协议功能-MC 停止 DRAM 时钟](https://zhuanlan.zhihu.com/p/692417614)

[LogicJitterGibbs：DDR 学习时间 (Part C - 9)：DFI 协议功能- LPDDR4 多通道模式](https://zhuanlan.zhihu.com/p/704892930)

### DDR 相关数字 IP 实现

[LogicJitterGibbs：DDR 学习时间 (Part A - 1)：一篇 2002 年的 DDR 控制器设计硕士论文](https://zhuanlan.zhihu.com/p/336521142)

[LogicJitterGibbs：一图了解 DDR IP 主要厂商](https://zhuanlan.zhihu.com/p/263906867)

[LogicJitterGibbs：DDR 学习时间 (Part I - OS1)：DDR IP 开源实现 DDR5 PHY 数据通路](https://zhuanlan.zhihu.com/p/690878167)

[LogicJitterGibbs：DDR 学习时间 (Part I - OS2)：DDR 开源实现 高云 GW2A FPGA 的 DDR3 低延迟控制器](https://zhuanlan.zhihu.com/p/690952204)

[now：搞DDR，你是可以看看我的这篇笔记](https://zhuanlan.zhihu.com/p/711689353) //DDR PHY 篇

**FPGA DDR IP 应用**

[lingo：详细讲解Xilinx DDR3 的MIG IP生成步骤及参数含义](https://zhuanlan.zhihu.com/p/683811463)

[lingo：将Xilinx DDR3 MIG IP核的APP接口封装成FIFO接口（含源码）](https://zhuanlan.zhihu.com/p/684824467)

[lingo：Xilinx DDR3的MIG IP信号分析及仿真和上板测试](https://zhuanlan.zhihu.com/p/683811042)

**DDR 相关模拟 IP 实现**

[一种数字delayline的设计方案](https://link.zhihu.com/?target=https%3A//aijishu.com/a/1060000000263418) 原作者：七点班车；原载于：IC小迷弟 公众号

**DDR IP 物理实现**

[LogicJitterGibbs：DDR 学习时间 (Part A - 5)：DDR IP 硬化 - 概览和建议](https://zhuanlan.zhihu.com/p/718829662)

## 4 DDR 工艺、制造与封装

[执笔存心：DRAM工艺流程](https://zhuanlan.zhihu.com/p/682725142)

## 5 DDR 系统 PCB 设计与 SI 分析优化

### 5.1 DDR 相关 PCB 设计

[一博科技：DDR3布线设计要点总结](https://zhuanlan.zhihu.com/p/24610141)

### 5.2 DDR SI 分析优化

[一博科技：几张图让你轻松理解DDR的串扰](https://zhuanlan.zhihu.com/p/46473215)

[一博科技-高速先生：端接电阻没选对，DDR颗粒白费？](https://zhuanlan.zhihu.com/p/685207495)

[LogicJitterGibbs：DDR 学习时间 (Part A - 6)：DDR4 板级设计和信号完整性验证面临的挑战 Ⅰ](https://zhuanlan.zhihu.com/p/828973807)

## 5 其他 DDR 相关文章/学习资源

[LogicJitterGibbs：DDR 学习时间 (Part M - 2)：Synopsys DDR 相关技术白皮书与 IP 技术公告合集](https://zhuanlan.zhihu.com/p/682723675)

**DDR 新闻简报**

[LogicJitterGibbs：\[202408\] DDR 八月新闻简报](https://zhuanlan.zhihu.com/p/717648712)

编辑于 2024-10-05 23:32・上海[DRAM](https://www.zhihu.com/topic/19792706)[日本SGU项目37所日本大学参与，相较于传统留学途径有哪些优势？](https://zhuanlan.zhihu.com/p/623149927)

[

【概述：什么是SGU项目？】 \[图片\] 2008年， 日本为了推动本国大学与国际顶级院校的交流与合作，另外也为了提...

](https://zhuanlan.zhihu.com/p/623149927)