---
doc_id: src-soc-4-一文详解ai时代下的处理器子系统
title: SoC（4）：一文详解AI时代下的处理器子系统
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/SoC（4）：一文详解AI时代下的处理器子系统.md
domain: tech/soc-pm
created: 2026-05-09
updated: 2026-05-09
tags: [soc-pm]
---

## Summary

!\[cover\_image\](https://mmbiz.qpic.cn/mmbiz\_jpg/g68z8egLoSo5q93fDYzygvIQs4 YbgvmVJib0 MzsnEv4cve7uhcXcoK2L96MTlP0AZhqhLyVEFUZ4WE2 OcE53 OhDoIF7nRiauhyEQnpT3 RcqeU/0?wx\_fmt=jpeg) Original  alltowine  alltowine  [芯片系统成长记](javascript:void\(0\);) *2026年5月7日 12:51* * 湖北 * 在小说阅读器读本章

## Key Points

### 1. 一、处理器到底在做什么？
我们先不谈 Cortex、RISC-V、A 核、M 核、大核、小核，也不谈几纳米工艺。 回到最底层的问题：  处理器存在的目的是什么？  答案很简单：  处理器负责按照指令改变系统状态。 一条指令可能让处理器：从内存读取数据； 执行一次加法； 跳转到另一个地址；访问外设寄存器； 触发异常； 修改权限状态； 启动一次 DMA； 调度一个加速器任务。  从第一性原理看，处理器就是一个“状态机”：输入是

### 2. 二、处理器子系统不是 CPU Core，而是一套计算控制系统
一个 CPU Core 通常只负责指令执行。但一个完整的处理器子系统通常还需要很多配套模块。 !\[Image\](data:image/svg+xml,%3C%3 Fxml version='1.0' encoding='UTF-8'%3F%3E%3 Csvg width='1px' height='1px' viewBox='0 0 1 1' version='1.1' xmlns='http

### 3. 1\. CPU Core：执行指令的核心
CPU Core 内部通常包括取指、译码、执行、访存、写回等流水线阶段。对于复杂处理器，还会有分支预测、乱序执行、寄存器重命名、多发射、Load/Store Queue、异常处理等机制。它的目标是让指令尽可能快、尽可能高效地执行。

### 4. 2\. Cache：减少存储访问延迟
CPU 的速度通常远高于 DDR。如果每条指令、每个数据都去 DDR 取，CPU 会大量等待。所以处理器子系统通常会配置 L1 I-Cache、L1 D-Cache、L2 Cache，甚至共享 L3/System Cache。Cache 的价值在于利用时间局部性和空间局部性，把常用数据放到离 CPU 更近的地方。

### 5. 3\. MMU：把地址访问变成受控行为
MMU 的作用不是简单做地址转换。它还支持虚拟内存、权限管理、进程隔离、Cache 属性控制、安全属性控制。在运行 Linux、Android、Hypervisor 等复杂软件系统时，MMU 是处理器子系统不可或缺的一部分。没有 MMU，就很难支撑现代操作系统的内存隔离和虚拟地址空间。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/SoC（4）：一文详解AI时代下的处理器子系统.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/SoC（4）：一文详解AI时代下的处理器子系统.md)
