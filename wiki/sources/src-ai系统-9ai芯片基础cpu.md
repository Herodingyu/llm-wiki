---
doc_id: src-ai系统-9ai芯片基础cpu
title: AI系统 9AI芯片基础CPU
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/soc-pm/AI系统/AI系统-9AI芯片基础CPU.md
domain: tech/soc-pm
created: 2026-05-03
updated: 2026-05-03
tags: [soc-pm]
---

## Summary

[收录于 · AI+芯片](https://www.zhihu.com/column/c_2019355008697660810) 2 人赞同了该文章 ![](https://pic2.zhimg.com/v2-d1eab6438e3c943e28bbb46ee0b30ff7_1440w.jpg)

## Key Points

### 1. 1.CPU介绍
![](https://pica.zhimg.com/v2-c9ef5d169ab410a79ce59f6b900f769c_1440w.jpg) 上图可知，CPU可以划分成三大部分： [算术逻辑单元](https://zhida.zhihu.com/search?content_id=272034655&content_type=Article&match_order=1&q=%E7%AE%97

### 2. 1.1 算术逻辑单元ALU
算术逻辑单元（ALU，Arithmetic Logic Unit）执行的操作是： 1. **逻辑运算** ：逻辑运算包括 NOR、NOT、AND、NAND、OR、XOR 等。 2. **移位操作** ：它负责将位的位置向右或向左位移一定数量的位置，也称为乘法运算。

### 3. 1.2 寄存器MU
存储单元（MU，Memory Unit）也可以称为寄存器，为什么会出现寄存器？因为我们知道，程序在内存中装载，由 CPU 来运行，CPU 的主要职责就是用来处理数据。那么这个过程势必涉及到从存储器中读取和写入数据，因为它涉及通过控制总线发送数据请求并进入存储器存储单元，通过同一通道获取数据，这个过程非常的繁琐并且会涉及到大量的内存占用，而且有一些常用的内存页存在，其实是没有必要的，因此出现了寄存器

### 4. 1.3 控制单元CU
如果说 CPU 是计算机的大脑，那么控制单元就是 CPU 的大脑，也是 CPU 中最重要的部分。控制单元的任务可以分为解码指令、生成控制信号，并将这些信号发送给其他组件。主要功能如下： 1. **指令解码** ：控制单元负责从存储器中读取指令，并对其进行解码。指令解码是将二进制指令转换为对计算机各个部件的控制信号的过程。通过解码，控制单元能够识别指令的类型、操作数和执行方式，并为后续的执行步骤做好

### 5. 1.4 CPU工作流
CPU 的工作流，主要分为 4 步： 1. **取指** ：从内存提取指令的阶段，是将内存中的指令读取到 CPU 中寄存器的过程，程序寄存器用于存储下一条指令所在的地址 2. **解码** ：解码指令译码阶段，在取指令完成后，立马进入指令译码阶段，在指令译码阶段，指令译码器按照预定的指令格式，对取回的指令进行拆分和解释，识别区分出不同的指令类别以及各种获取操作数的方法。

## Evidence

- Source: [原始文章](raw/tech/soc-pm/AI系统/AI系统-9AI芯片基础CPU.md) [[../../raw/tech/soc-pm/AI系统/AI系统-9AI芯片基础CPU.md|原始文章]]

## Key Quotes

> "指令提取时延（Instruction Fetch Time）"

> "指令解码时延（Instruction Decode Time）"

> "执行时延（Execution Time）"

> "存储器访问时延（Memory Access Time）"

> "写回时延（Write-back Time）"

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/soc-pm/AI系统/AI系统-9AI芯片基础CPU.md) [[../../raw/tech/soc-pm/AI系统/AI系统-9AI芯片基础CPU.md|原始文章]]
