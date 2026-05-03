---
doc_id: src-linux系统休眠-一-休眠介绍
title: linux系统休眠（一）休眠介绍
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/linux系统休眠（一）休眠介绍.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · 电源管理](https://www.zhihu.com/column/c_1531340022309036032) 17 人赞同了该文章 本文基于以下软硬件假定：

## Key Points

### 1. 1　系统休眠介绍
在日常工作中经常会有以下情形，当我们正在使用电脑编写代码时，需要临时去开个会或处理一些紧急问题，此时就需要暂停编码工作。电脑在一段时间无操作后，将会关闭大部分硬件的电源，并进入睡眠模式，以降低功耗。当我们回来以后，通过操作键盘或鼠标，则又可以唤醒电脑，并继续先前未完成的工作。

### 2. ２　休眠方式
与cpuilde类似，系统休眠也有深有浅，其中睡的越深功耗越低，相应的唤醒延迟越大，睡的越浅功耗越高，而其唤醒延迟也越小。根据睡眠状态由浅到深，Linux当前一共支持freeze、standby、mem和disk四种休眠方式，其特点如下：

### 3. ３　休眠的主要任务
休眠的本质是保存系统当前的运行状态，然后将其设置为一个低功耗模式。当休眠完成被唤醒时，则又通过先前保存的状态恢复系统执行。因此那些能独立执行特定任务的硬件都需要保存其运行状态，如cpu可执行程序代码，设备也可根据配置信息执行特定的功能。故系统休眠不仅需要考虑保存cpu相关的上下文，还需要保存设备相关的上下文。

### 4. ４　休眠唤醒总体流程
由以上介绍可知系统休眠主要包含冻结进程，挂起设备，关闭中断，挂起secondary cpu以及最终挂起primary cpu使整个系统进入休眠状态。其主要执行流程如下： ![](https://picx.zhimg.com/v2-f8990da63dd8cc1e8d12b9d56662dd3d_1440w.jpg)

## Evidence

- Source: [原始文章](raw/tech/bsp/linux系统休眠（一）休眠介绍.md) [[../../raw/tech/bsp/linux系统休眠（一）休眠介绍.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/linux系统休眠（一）休眠介绍.md) [[../../raw/tech/bsp/linux系统休眠（一）休眠介绍.md|原始文章]]
