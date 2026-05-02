---
title: "内存映射IO (MMIO) 简介"
source: "https://zhuanlan.zhihu.com/p/37715216"
author:
  - "[[Master.TJhttps://github.com/fengruotj]]"
published:
created: 2026-05-02
description: "MMIO(Memory mapping I/O)即内存映射I/O，它是PCI规范的一部分，I/O设备被放置在内存空间而不是I/O空间。从处理器的角度看，内存映射I/O后系统设备访问起来和内存一样。这样访问AGP/PCI-E显卡上的帧缓存，BIOS，PC…"
tags:
  - "clippings"
---
[收录于 · RDMA](https://www.zhihu.com/column/rdmatechnology)

72 人赞同了该文章

MMIO(Memory mapping [I/O](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/I%252FO/84718))即 [内存映射I/O](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/%25E5%2586%2585%25E5%25AD%2598%25E6%2598%25A0%25E5%25B0%2584I%252FO) ，它是 [PCI规范](https://zhida.zhihu.com/search?content_id=7277288&content_type=Article&match_order=1&q=PCI%E8%A7%84%E8%8C%83&zhida_source=entity) 的一部分， [I/O设备](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/I%252FO%25E8%25AE%25BE%25E5%25A4%2587/9688581) 被放置在内存空间而不是I/O空间。从处理器的角度看，内存映射I/O后系统设备访问起来和内存一样。这样访问AGP/ [PCI-E](https://zhida.zhihu.com/search?content_id=7277288&content_type=Article&match_order=1&q=PCI-E&zhida_source=entity) 显卡上的 [帧缓存](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/%25E5%25B8%25A7%25E7%25BC%2593%25E5%25AD%2598) ，BIOS，PCI设备就可以使用读写内存一样的 [汇编指令](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/%25E6%25B1%2587%25E7%25BC%2596%25E6%258C%2587%25E4%25BB%25A4) 完成，简化了程序设计的难度和接口的复杂性。

## 基本概念

MMIO(Memory mapping I/O)即内存映射I/O，它是PCI规范的一部分，I/O设备被放置在内存空间而不是I/O空间。从处理器的角度看，内存映射I/O后系统设备访问起来和内存一样。这样访问AGP/PCI-E显卡上的帧缓存，BIOS，PCI设备就可以使用读写内存一样的汇编指令完成，简化了程序设计的难度和接口的复杂性。I/O作为CPU和外设交流的一个渠道，主要分为两种，一种是 [Port I/O](https://zhida.zhihu.com/search?content_id=7277288&content_type=Article&match_order=1&q=Port+I%2FO&zhida_source=entity) ，一种是MMIO(Memory mapping I/O)。（来自百度百科）

简而言之，MMIO就是通过将外围设备映射到内存空间，便于CPU的访问。I/O作为CPU和外设交流的一个渠道，主要分为两种，一种是Port I/O，一种是MMIO(Memory mapping I/O)。前者就是我们常说的 [I/O端口](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/I%252FO%25E7%25AB%25AF%25E5%258F%25A3/4414518) ，它实际上的应该被称为 [I/O地址](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/I%252FO%25E5%259C%25B0%25E5%259D%2580/1189690) 空间。

小概念：

32位操作系统，32bit的处理器，拥有32bit寻址能力，即可访问2^32=4G的物理地址，那么就具有4G内存的识别能力。

物理地址：并不是指物理内存的地址，而是指处理器和系统内存之间所用到的地址，可以理解为CPU最为方便访问的地址（有别于我们之前所知道的物理地址的定义：段地址\*16+偏移地址），而这一个内存并不独属于物理内存，而被分成了很多部分，物理内存当然也能够占用其中的一部分。

## PortIO和MMIO 的主要区别

1）前者不占用CPU的物理 [地址空间](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/%25E5%259C%25B0%25E5%259D%2580%25E7%25A9%25BA%25E9%2597%25B4/1423980) ，后者占有（这是对 [x86架构](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/x86%25E6%259E%25B6%25E6%259E%2584/7470217) 说的，一些架构，如 [IA64](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/IA64/9162880) ，port [I/O](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/I%252FO/84718) 占用物理地址空间）。

2）前者是顺序访问。也就是说在一条 [I/O指令](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/I%252FO%25E6%258C%2587%25E4%25BB%25A4/9468236) 完成前，下一条指令不会执行。例如通过Port I/O对设备发起了操作，造成了设备寄存器状态变化，这个变化在下一条指令执行前生效。uncache的MMIO通过uncahce memory的特性保证顺序性。

3）使用方式不同

由于port I/O有独立的64K [I/O地址](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/I%252FO%25E5%259C%25B0%25E5%259D%2580/1189690) 空间，但CPU的 [地址线](https://link.zhihu.com/?target=https%3A//baike.baidu.com/item/%25E5%259C%25B0%25E5%259D%2580%25E7%25BA%25BF/174321) 只有一套，所以必须区分地址属于物理地址空间还是I/O地址空间。

[所属专栏 · 2020-09-04 01:57 更新](https://zhuanlan.zhihu.com/rdmatechnology)

[![](https://picx.zhimg.com/v2-dcd65c7b7fd5f46131aa8b33e091996d_720w.jpg?source=172ae18b)](https://zhuanlan.zhihu.com/rdmatechnology)

[RDMA](https://zhuanlan.zhihu.com/rdmatechnology)

[

Master.TJ

24 篇内容 · 2320 赞同

](https://zhuanlan.zhihu.com/rdmatechnology)

[

最热内容 ·

RDMA技术详解（一）：RDMA概述

](https://zhuanlan.zhihu.com/rdmatechnology)

编辑于 2020-01-05 12:58[日常家庭存储困难，有没有什么好用的个人轻NAS推荐？](https://zhuanlan.zhihu.com/p/718687369)

[

刚给家里安排上一台新NAS，买的是 绿联DXP4800，到现在用了快两个月了，一个字总结使用感就是“香”！有家庭存...

](https://zhuanlan.zhihu.com/p/718687369)