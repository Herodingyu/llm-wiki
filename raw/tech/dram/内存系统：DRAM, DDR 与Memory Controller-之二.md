---
title: "内存系统：DRAM, DDR 与Memory Controller-之二"
source: "https://zhuanlan.zhihu.com/p/33479194"
author:
  - "[[Sinaean Dean计算机体系结构-CPU/GPU-操作系统-渲染-AI]]"
published:
created: 2026-05-02
description: "昨天写了“之一”，评论区明白人写的评论很精彩。 其实我研究DRAM是在2012年前后，后面好一段时间都没有再碰了，所以知识有些脱节，另外一些当时不特别关注的东西也忘记了，受“之一”评论的牵引，今天再专门补充…"
tags:
  - "clippings"
---
[收录于 · 现代计算机](https://www.zhihu.com/column/modern-computing)

134 人赞同了该文章

昨天写了“之一”，评论区明白人写的评论很精彩。

其实我研究 [DRAM](https://zhida.zhihu.com/search?content_id=5581056&content_type=Article&match_order=1&q=DRAM&zhida_source=entity) 是在2012年前后，后面好一段时间都没有再碰了，所以知识有些脱节，另外一些当时不特别关注的东西也忘记了，受“之一”评论的牵引，今天再专门补充一些关于DRAM的内容，然后时DDR的时序。

更新：好累，写到12点多了才写这么一点点，后面再细化吧。下一篇跟大家一起学习一下 [DDR4](https://zhida.zhihu.com/search?content_id=5581056&content_type=Article&match_order=1&q=DDR4&zhida_source=entity) 和 [内存控制器](https://zhida.zhihu.com/search?content_id=5581056&content_type=Article&match_order=1&q=%E5%86%85%E5%AD%98%E6%8E%A7%E5%88%B6%E5%99%A8&zhida_source=entity) 的设计，后面想讨论一下nvDIMM, 以及新式存储介质。

## DRAM的组织结构

“之一”中讲的DRAM arrays实际上的名字应该叫array, 而DRAM array应该叫subarray，而且subarray之下还由MAT组成。

以上内容是“之一”评论区指出的，这个我确实不知道，今天查了一下确实如此。网上找到了篇资料，这里就不帖图了， [niladrish.org/pubs/hpca](https://link.zhihu.com/?target=http%3A//niladrish.org/pubs/hpca17.pdf) 。

## DRAM的访问延时

一条访存指令发到内存控制器，它的访存延时是存在不同的可能性的。

1. row buffer hit 就是说数据已经在row buffer中，这时延时主要来自于从row buffer到把数据放在数据总线上的时延，这个过程需要大约20ns的时间。（可能是比较旧的数据了，欢迎评论区发出挑战）
2. empty row buffer ，即row buffer是空的，访存延时除了从row buffer到数据总线时间，还包括从电容到sense amplifier再到row buffer的时序，需要的延时大约40ns。
3. row buffer conflict，即当前row buffer存有别的row的内容，此时需要回写过程，即把row buffer中的比特刷回电容。否则电容上的内容可能会与row buffer上的内容不同。再加上2的延时，总共约60ns。

## OpenPage Policy和Close Page Policy

DRAM访问有两种模式，一个Open Page 一个是Close Page。前者在完成一次访存后保留row buffer的内容，如果下一个访存命令恰好也在同一个row上，就会row buffer hit，节省访问时间，但如果后一个访问地址不在同一个row上，就可row buffer conflict，增加了访存时间。后者在完成一次访存后立即执行prechage命令，即将row buffer的内容写回cell，这种情况下下一个访存一定是empty row buffer状态。

## 地址映射策略

CPU给的一个访存指令中的地址可能是32位数，或是48位数。

现代CPU访存当然不是按字节访问的，而是按 [cache line](https://zhida.zhihu.com/search?content_id=5581056&content_type=Article&match_order=1&q=cache+line&zhida_source=entity) 访问或双cache line访问的。所以这个地址到了内存控制器之后，cache line以下的地址就没有用了，以上的那些位要做映射。

这个数怎么映射到为行地址、列地址、bank选择等信号上呢？

这就要看怎么映射访问效率高了。

比如说相临的两个Cache line映射到一个行上，那很好，row buffer hit可能就比较多，因为数据有空间局部性，两个cache line先后访问的概率较大。

比如说相临的两个Cache line映射到不同的bank上，这样也很好，同时从两个bank可以并行访问。也就是说你可以先后发两个行地址，然后再发两个列地址，以ROWA, ROWB, COLA, COLB这样的模式访问，ROWB命令就填充了ROWA到COLA之前的空闲时间，因为ROWA和COLA之前要有足够的时间间隔的。

实际计算机中怎么映射呢？实际上没有标准的，有多种方法，比如说：  
row::rank::bank::channel::column::blkoffset  
row::column::rank::bank::channel::blkoffset  
都是比较常见的用法。

## DDR接口

后面是DDR相关的内容了， DDR规范中即涉及DRAM本质，双涉及内存条的设计规范。

## DIMM内存条

上面提到的rank, channel都还没有介绍过。rank是内存条上的一个概念。

DIMM即Dual Inline Memory Moduel，即双列直插内存模块。

根据规范，内存条的数据线位宽是64或72,即它有一个时钟的一个边沿可以传输64位数据或72位数据。有效数据都是64比特，72=64+8, 多余的8比特给服务器用于做数据的正确性校验。当然，一些人也拿这8个位来做别的用处，比如引发一个中断，下发一些命令什么的。

内存条上有多个DRAM芯片，也叫内存颗粒，一般一个颗粒提供4位或8位数据，称为x4或x8内存颗粒。

以x8的颗粒而言，一个64位宽的家用内存条，至少要有8颗这样的芯片才能构成一个完整的内存条，提供8x8=64位数据。然而我们的内存条上好多时候不止8颗芯片，有可能是16颗，这样它就可以提供两组64位数据。这样的一组称为rank，好多内存条都有两个rank，在DDR总线上可以用一根地址线来区分当前要访问的是哪一组。

内存插槽上一个槽位只能插一根内存条，一个主板上可能有多个插槽，用来插多根内存。这些槽位分成两组或多组，组内共享物理信号线。这样的一组数据信号线、对应几个槽位、对应几根内存条称为一个channel，一个通道。（哈哈，这里我本来不是这样写的，结果评论区行家太多，吓得我double check一下，原来果然写错了）

![](https://pic3.zhimg.com/v2-8c4b3a04393f12c0f564d7793ba8cff6_1440w.jpg)

这样上一节的地址映射策略时提到的几个概念就全了：

row::column::rank::bank::channel::blkoffset

row:行地址

coloum:列地址

rank: rank选择

bank: bank选择，多个内存颗粒同时选相同的bank，一bank即插内存颗粒上的一个array，也指一个rank上多个颗粒的相同bank的集合。

channel:内存通道选择

blkoffset:其余的地址位

## DRAM访问时序

DRAM访问时序是由DRAM的访问特性决定的， [JEDEC](https://zhida.zhihu.com/search?content_id=5581056&content_type=Article&match_order=1&q=JEDEC&zhida_source=entity) 根据这些特性，写了一些规范来访问DRAM，比如说 [DDR3 SDRAM SPEC](https://zhida.zhihu.com/search?content_id=5581056&content_type=Article&match_order=1&q=DDR3+SDRAM+SPEC&zhida_source=entity) 。SPEC上的内容有一部份是体现DRAM访问时序的，有一部分则体现的是内存条设计方式引入的访问时序。无论如何，我们来大致先看看。

![](https://pic2.zhimg.com/v2-085d93812c3c6d600dabbfe0371734f5_1440w.jpg)

上图是DDR3 SPEC上截的状态机。

里面的ZQ Calibration, write leveling, read leveling就不说了，都是一些信号对齐之类的东西。

我们直接下面的法阵六芒星，要想读一个数据，首先发的命令叫Bank Activate，我上一节好像是写做row activite了，其实意思差不多，就是给定bank地址，row地址，把一个row的数据读到row buffer里面。然后发列地址，和读信号，即发一个READ命令，然后内存条就把数据放到数据总线上来。如果下一个访存仍然是同一个row上的读或写，可以连续发读或写命令，而无需发bank activate。最后如果这一行不用了，或是要切换另一行，要发precharge命令，把数据写到cell里去。

写是类似的。

下面详细介绍一下主要命令：

1. ACTIVATE、ACT

打开一个行，发这个命令时需同时带bank选择信号和行选择信号。对于DDR3而言，bank选择信号有3个，BA0到BA2，意味着它最多支持8个bank。行选择信号有16个，支持64K个行。

2\. PRECHARGE/PRE

关闭一个行，把当前row buffer的比特写回cell。

precharge有一个变形叫PREA。它和它的变形分别用于关闭一个行和所有行。

关闭一个行需要时间，这个时间称为tRP，发送PRE/PREA命令后tRP时间才可以发ACT命令。

3\. READ

![](https://picx.zhimg.com/v2-2904d29f6cc861da95475b2b97b22f85_1440w.jpg)

读命令需要发列地址。列地址给出后，要经过CL或RL时间才能从数据总线得到数据。

CL称为Column latency, RL称为Read latency， RL=AL+CL。这里AL=0.

我们说一次读只能读一个cache line或双cache line，其实不准确。

读支持两种模式BC4和BL8，即读命令后跟4组数据或8组数据，称为半个burst或一个burst。即Burst chop4, burst length 8。

BL8情况下读到的是64\*8位，即64个字节，通常是x86的一个cache line或ARM的两个Cache line。

读命令还有一个可选的位，置1的话，读命令就变成了read with prechage，即读完自动关闭行，也即close page。

4\. REFRESH

refresh实际上是非常重要的，以至于在大一点容量的内存条上，refresh命令要花的时间占内存条总线时间的10%以上。

因为基本每个行每64ms就要刷新一次。

行多，刷新命令发的就更频繁。

大家已经在发力优化这个刷新时间了，比如说统计一下哪些行能坚持更久一些就大一点间隔刷。

还没有人送礼物，鼓励一下作者吧

发布于 2018-02-01 00:17[中央处理器 (CPU) (计算机体系架构)](https://www.zhihu.com/topic/20025747)[IC修真院 | 数字IC NPU 22nm流片项目](https://zhuanlan.zhihu.com/p/1895528342180048995)

[

IC修真院全流程流片项目上线推出： 《NPU芯片全流程设计与流片实战项目》数字IC NPU 22nm流片项目 流片工艺为TSMC 22nm...

](https://zhuanlan.zhihu.com/p/1895528342180048995)