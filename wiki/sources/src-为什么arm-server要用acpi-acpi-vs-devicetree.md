---
doc_id: src-为什么arm-server要用acpi-acpi-vs-devicetree
title: 为什么ARM Server要用ACPI？ACPI vs DeviceTree
page_type: source
source_kind: raw_markdown
raw_paths:
  - raw/tech/bsp/为什么ARM Server要用ACPI？ACPI vs DeviceTree.md
domain: tech/bsp
created: 2026-05-03
updated: 2026-05-03
tags: [bsp]
---

## Summary

[收录于 · UEFI和BIOS探秘](https://www.zhihu.com/column/UEFIBlog) 216 人赞同了该文章 目录

## Key Points

### 1. 嵌入式产品 vs 服务器产品
我们分别在两者中各挑选一个典型产品，看看他们的客群和商业模式有什么区别。手机是典型的嵌入式产品，它和云服务器的客户有什么不同？ 手机的客户是终端消费者，它是一种高度定制化产品。它的硬件和软件一经出厂，则不能轻易改变。用户既不能随便更换主板上的各种硬件，也不能更换软件。不信可以试试看能不能在苹果手机刷入华为手机固件（包括操作系统），是不是就可以得到一个苹果样子的华为手机？不但不同厂商不能互刷，同一个

### 2. DeviceTree简介
早期Linux和硬件芯片与平台绑定严重，在arch/arm下有着众多名字叫march-xxxx（芯片微架构）和plat-xxx（平台）的目录，里面有着众多各个芯片和平台的代码。基本上每加入一个芯片和平台，就要加入一个目录和一组代码，可扩展性十分差。而相较而言，i386等目录就清爽了很多。这种情况不能持续，随着支持Linux开始支持越来越多的平台和芯片，矛盾爆发了（Linus发飙了）。

### 3. DeviceTree vs ACPI
ACPI和UEFI一样，由微软和Intel联合提出。血液中的微软味道，让Linux社区天然的就产生了抵触心理，在开始试图采用UEFI + DT来支持服务器，最后还是选择拥抱ACPI了。是什么原因呢？Linux社区专文做出了回答 [^4] 。简单来说包含一下几点：

### 4. 结论
以上四点，尤其是第一点，让UEFI+ACPI的模式在服务器端看起来十分必要，BIOS的商业模式还可以在ARM上继续。 DT标准还在演进，最近的标准发布于2021年，它在ARM嵌入式系统中牢牢占住脚跟。但ACPI已经占据了服务器和大部分桌面。个人觉得在嵌入式系统中uboot+DT的方式不需要改变，而服务器领域的UEFI+ACPI也将是ARM服务器的必然选择。有意思的是中间地带：由台式机和笔电代表的消

### 5. 参考
还没有人送礼物，鼓励一下作者吧 编辑于 2022-03-30 10:50[操作系统](https://www.zhihu.com/topic/19552686)[国产](https://www.zhihu.com/topic/19582468)

## Evidence

- Source: [原始文章](raw/tech/bsp/为什么ARM Server要用ACPI？ACPI vs DeviceTree.md) [[../../raw/tech/bsp/为什么ARM Server要用ACPI？ACPI vs DeviceTree.md|原始文章]]

## Open Questions

- (To be determined)

## Related Links

- [原始文章](raw/tech/bsp/为什么ARM Server要用ACPI？ACPI vs DeviceTree.md) [[../../raw/tech/bsp/为什么ARM Server要用ACPI？ACPI vs DeviceTree.md|原始文章]]
