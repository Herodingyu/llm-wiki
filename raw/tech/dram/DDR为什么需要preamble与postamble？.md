---
title: "DDR为什么需要preamble与postamble？"
source: "https://zhuanlan.zhihu.com/p/436908104"
author:
  - "[[沪上韦一笑且放白鹿青崖间，芯片验证实用技术，提升职场竞争力]]"
published:
created: 2026-05-03
description: "【The preamble portion provides a timing window for thereceiving device to enable its data capture circuitry while a known/valid level is present on the strobe signal, thus avoiding false triggers o…"
tags:
  - "clippings"
---
[收录于 · 芯片验证](https://www.zhihu.com/column/c_1446608036219895808)

没有提供感情机器 等 26 人赞同了该文章

【The [preamble](https://zhida.zhihu.com/search?content_id=185220356&content_type=Article&match_order=1&q=preamble&zhida_source=entity) portion provides a timing window for thereceiving device to enable its data capture circuitry while a known/valid level is present on the strobe signal, thus avoiding false triggers of the capture circuit.】

我理解preamble的作用是这样的： [DLL lock](https://zhida.zhihu.com/search?content_id=185220356&content_type=Article&match_order=1&q=DLL+lock&zhida_source=entity) 需要时间，需要给它预留这个时间窗口，让DLL完成 [phase alignment](https://zhida.zhihu.com/search?content_id=185220356&content_type=Article&match_order=1&q=phase+alignment&zhida_source=entity) （推90度相位），这样后面data采样的眼才最好，比如读 [dqs](https://zhida.zhihu.com/search?content_id=185220356&content_type=Article&match_order=1&q=dqs&zhida_source=entity) 对在dq的正中间。

【The [postamble](https://zhida.zhihu.com/search?content_id=185220356&content_type=Article&match_order=1&q=postamble&zhida_source=entity) is used to ensure a smooth hand-offbetween read and write transactions, that is, to allow turn-around time so thehost and DDR device don’t clash with each other in a way that generates a false edge on DQS.】

那么postamble的作用又是什么呢？

假设发生back to back操作，如下图所示：

![](https://pic3.zhimg.com/v2-120a8f923dc7c0b4395f25790c480c72_1440w.jpg)

由于ODT设定、memory device驱动设定不同，总线寄生参数等影响，会导致preamble期间，dqs的三态转换、重新assert的时间存在不确定性，如果没有postamble来“缓冲”一下，很有可能导致preamble不被采样到或者采样出错。

但是seamless 读+读 或者seamless 写+写 （无缝的连续读读/写写同一BANK或已经激活的不同BANK）又可以做到中间不用postamble和preamble，WHY？（如下图）

![](https://pic1.zhimg.com/v2-3cd63deacaa4fbbf3b51b0fd779d652a_1440w.jpg)

主要诀窍是 [tCCD](https://zhida.zhihu.com/search?content_id=185220356&content_type=Article&match_order=1&q=tCCD&zhida_source=entity) （CAS to CAS delay）= Min = [BL](https://zhida.zhihu.com/search?content_id=185220356&content_type=Article&match_order=1&q=BL&zhida_source=entity) /2，比如第一笔CAS发一个BL16，那么过tCCD 也就是 BL/2 = 8拍发第二笔的CAS，可以做到第二笔的数据和第一笔的数据直接无缝连接，中间不存在 **preamble与postamble。**

当然无缝连接的前提是，读写同一个BANK同一行（不用插入Bank active命令和precharge命令，可以连续发送CAS命令），或者读写已经激活的不同BANK（也不用插入Bank active命令和precharge新行命令，可以连续发送CAS命令）。

seamless读读、写写正是DDR协议为了解决 **preamble** 与 **postamble** 导致的效率损失而做出的增强，因为在连续读读，连续写写的过程中，dqs的三态其实是不用发生转变的，可以利用前一笔的 **dqs** ，作为后一笔的 **preamble** ，利用后一笔的 **dqs** ，作为前一笔的 **postamble** 。

另外，当CAS超过tCCD(min)的情况下，消失的 **preamble** 与 **postamble** 又会回来。如下图所示：

![](https://pic3.zhimg.com/v2-9acbdd4e9db247d513d41797f3f8b7d8_1440w.jpg)

发布于 2021-11-23 22:33[IC修真院 | 数字IC NPU 22nm流片项目](https://zhuanlan.zhihu.com/p/1895528342180048995)

[

IC修真院全流程流片项目上线推出： 《NPU芯片全流程设计与流片实战项目》数字IC NPU 22nm流片项目 流片工艺为TSMC 22nm...

](https://zhuanlan.zhihu.com/p/1895528342180048995)