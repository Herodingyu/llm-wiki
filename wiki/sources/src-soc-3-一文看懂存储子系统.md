---
doc_id: src-soc-3-一文看懂存储子系统
title: SoC（3）一文看懂存储子系统
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/SoC（3）一文看懂存储子系统.md
domain: tech/soc-pm
created: 2026-05-09
updated: 2026-05-09
tags: [soc-pm]
---

## Summary

原创alltowinealltowine芯片系统成长记 如果说处理器子系统是 SoC 的"大脑"，互联子系统是"道路和桥梁"，外设子系统是"感官和手脚"，那么存储子系统就是 SoC 的"记忆系统"。但这个"记忆系统"并不是简单地放几块 SRAM、接一颗 DDR、挂一个 Flash 就结束了。 真正的存储子系统设计，要回答的是一个更底层的问题：

## Key Points

### 1. 一、为什么 SoC 需要存储层级？
我们先不谈 SRAM、DRAM、Flash、Cache 这些名词，而从一个最基本的问题开始： 计算为什么需要存储？ 因为处理器和加速器并不是凭空计算。它们每一步都需要： 取指令； 读取输入数据； 保存中间结果；

### 2. 三、存储层级：离计算越近，越快也越贵
可以把 SoC 的存储系统想象成一个仓储体系。 CPU 寄存器像手边的工具，最快，但数量极少。 L1/L2 Cache 像办公桌抽屉，常用资料随手可取。 片上 SRAM 像办公室资料柜，容量更大但仍然很近。

### 3. 六、SRAM：片上快速工作区
SRAM 是 SoC 中非常常见的片上存储。 它的特点是：访问快；不需要刷新；适合随机访问；可直接作为片上工作区； 但面积大，容量不宜太大。片上 SRAM 常见用途包括： Boot 阶段临时执行空间；中断向量表；关键代码段；DMA 缓冲区；多核共享小容量数据；低功耗模式下保留状态；NPU/DSP 本地数据缓存。

### 4. 七、DRAM/DDR：大容量运行内存
DRAM，特别是 DDR，是复杂 SoC 中承载大容量运行数据的核心。它适合放：操作系统； 应用程序； 图像帧缓冲； 音视频数据； AI 模型权重； NPU/GPU 中间结果； 网络包缓冲； 大块 DMA 数据。DDR 的优势是容量大、带宽高、单位容量成本较低。

### 5. 八、Flash：保存代码和长期数据
Flash 的核心价值是掉电不丢数据。它常用于保存：BootLoader； 固件镜像； 配置参数； 文件系统； 日志； 校准数据； 用户数据。Flash 又可以分为不同类型，例如 Nor Flash、Nand Flash、eMMC、UFS 等。不同类型在容量、速度、接口复杂度、可靠性和成本上各有取舍。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/SoC（3）一文看懂存储子系统.md)

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/SoC（3）一文看懂存储子系统.md)
