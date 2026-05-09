---
doc_id: src-soc-2-浅谈互联子系统
title: SoC（2）：浅谈互联子系统
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/SoC（2）：浅谈互联子系统.md
domain: tech/soc-pm
created: 2026-05-09
updated: 2026-05-09
tags: [soc-pm]
---

## Summary

!\[cover\_image\](https://mmbiz.qpic.cn/mmbiz\_jpg/g68z8egLoSq5ibQ0 PzQbiaicRgv7iak8T0p8 XibJACDXL2068mQN6tc1C8ua1OOnHStxdkficVPGRmxmkiamUgOicx3t4xwYpLnoG8lvRdHnCphf5OY/0?wx\_fmt=jpeg) Original  alltowine  alltowine  [芯片系统成长记](javascript:void\(0\);) *2026年5月6日 19:11* * 湖北 * 在小说阅读器读本章

## Key Points

### 1. 一、为什么 SoC 需要互联？
先回到最基本的问题：  SoC 内部到底在发生什么？ 本质上只有一件事：  多个计算、存储和外设模块，在共享数据和状态。 CPU 要从 Flash 或 DDR 取指令； CPU 要读写 SRAM； DMA 要把外设数据搬到内存；

### 2. 二、互联子系统的核心矛盾：连接越多，复杂度越高
如果只有一个 CPU 和一个 SRAM，事情很简单，一根简单总线就够了。  CPU 发地址，SRAM 返回数据  。但现实 SoC 不是这样。一个稍复杂的 SoC 可能同时有： 多个 CPU 核； 一个或多个 DMA； 图像处理单元； AI 加速器； 显示控制器； 视频编解码器； DDR 控制器； 片上 SRAM； Flash 控制器； 大量低速外设。

### 3. 三、第一种互联：总线，最简单的共享道路
总线是最容易理解的互联方式。可以把它想象成一条公共道路。多个主设备和多个从设备都接在这条路上。某一时刻通常只有一个主设备获得使用权，然后发起读写访问。 总线的优点非常明显： 结构简单； 面积小； 协议容易理解；

### 4. 四、第二种互联：交叉矩阵，让多个访问并行发生
交叉矩阵可以理解成一个“交通枢纽”。它不是一条共享道路，  而是尝试在多个主设备和多个从设备之间建立多条可并行的路径  。如果 CPU 正在访问 SRAM，而 DMA 正在访问 DDR，只要目标不同、资源不冲突，交叉矩阵就可以让它们同时进行。

### 5. 五、第三种互联：NoC，让 SoC 进入片上网络时代
当 SoC 继续变大，模块越来越多，传统总线和交叉矩阵都会遇到扩展性问题。这时就出现了 NoC，也就是 Network on Chip，片上网络。 NoC 的思想很直观：  既然芯片里有很多模块，那就不要再把通信看成一根线，而要看成一个网络。  每个 IP 通过网络接口接入片上网络，数据被封装成事务或数据包，在路由节点之间转发，最终到达目标模块。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/SoC（2）：浅谈互联子系统.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/SoC（2）：浅谈互联子系统.md)
